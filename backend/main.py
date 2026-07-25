import os
import sys
sys.path.append(os.path.dirname(__file__))
from dotenv import load_dotenv

# Load environment variables BEFORE importing modules that use them
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from extract import extract_transactions
from detect import detect_subscriptions
from score import score_subscriptions
import io
import csv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import models
import database
from database import engine
from fastapi.responses import JSONResponse
import traceback

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print("Database creation failed on boot:", str(e))

app = FastAPI(title="LeakRadar API")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc), "traceback": traceback.format_exc()}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    try:
        # Check by id=1 so we update the existing row rather than creating a duplicate
        demo_user = db.query(models.User).filter(models.User.id == 1).first()
        if not demo_user:
            demo_user = models.User(id=1, name="Parth Kharat", email="parth.kharat@example.com")
            db.add(demo_user)
        else:
            demo_user.name = "Parth Kharat"
            demo_user.email = "parth.kharat@example.com"
        db.commit()
    finally:
        db.close()


class AnalyzeRequest(BaseModel):
    raw_text: str
    source_type: str = "bank_statement"  # bank_statement | sms | email


class RescoreRequest(BaseModel):
    subscriptions: list
    inactive_merchants: list = []  # merchants the user marked "not using" in the UI


@app.post("/api/extract")
def extract(payload: AnalyzeRequest):
    """Raw unstructured text -> list of transactions."""
    transactions = extract_transactions(payload.raw_text, payload.source_type)
    return {"transactions": transactions}

def save_subscriptions_to_db(db: Session, scored_subscriptions: list):
    """Clears existing subscriptions for demo user (ID=1) and saves new ones."""
    # Assuming user 1 is the demo user
    demo_user_id = 1
    db.query(models.Subscription).filter(models.Subscription.user_id == demo_user_id).delete()
    
    saved_subs = []
    for s in scored_subscriptions:
        sub_record = models.Subscription(
            user_id=demo_user_id,
            service_name=s.get("merchant", "Unknown"),
            amount=s.get("monthly_equivalent_amount", 0.0),
            frequency=s.get("billing_frequency", "Unknown"),
            status="Active" if not s.get("is_inactive") else "Canceled",
            action_plan="Keep",
            leak_score=s.get("leak_score", 0),
            is_price_hike=s.get("price_hike_pct", 0) > 0,
            raw_data=s
        )
        db.add(sub_record)
        saved_subs.append(sub_record)
    
    db.commit()
    
    # Return merged dicts with the new DB ID included
    return [{**record.raw_data, "id": record.id} for record in saved_subs]

def calculate_stats(scored):
    """Calculates dashboard statistics excluding resolved/inactive subscriptions."""
    # Only count active subscriptions for spend and counts
    active_recurring = [s for s in scored if s.get("is_recurring") and not s.get("is_inactive")]
    
    total_monthly_spend = sum(s.get("monthly_equivalent_amount", 0) for s in active_recurring)

    # Potential savings must reflect the actions shown to the user. A fixed leak-score
    # threshold hid legitimate opportunities such as duplicate streaming services
    # (which are intentionally scored at 35). Keep recommendations are excluded;
    # one-off/manual-review transactions do not inflate the monthly savings figure.
    non_saving_recommendations = {"keep", "resolved", ""}
    potential_savings = sum(
        s.get("monthly_equivalent_amount", 0)
        for s in active_recurring
        if (s.get("recommendation") or "").strip().lower() not in non_saving_recommendations
    )
    
    # Realized savings represent recurring spend that has actually been removed.
    realized_savings = sum(
        s.get("monthly_equivalent_amount", 0)
        for s in scored
        if s.get("is_recurring") and s.get("is_inactive")
    )
    
    recurring_count = len(active_recurring)
    annual_count = sum(1 for s in active_recurring if s.get("billing_frequency") == "Annual")
    average_monthly_cost = round(total_monthly_spend / recurring_count, 2) if recurring_count > 0 else 0
    
    highest_monthly_expense = max([s.get("monthly_equivalent_amount", 0) for s in active_recurring] or [0])
    
    # Leak score is only based on active subscriptions for the max score
    active_all = [s for s in scored if not s.get("is_inactive")]
    highest_leak_score = max([s.get("leak_score", 0) for s in active_all] or [0])
    
    # Overall leak score should be based on ALL subscriptions so that resolving/canceling (which drops leak_score to 0) decreases the average.
    overall_leak_score = int(sum(s.get("leak_score", 0) for s in scored) / len(scored)) if scored else 0
    
    upcoming_renewals = [s for s in active_all if s.get("renewal_date")]
    upcoming_renewals = sorted(upcoming_renewals, key=lambda x: x["renewal_date"])[:3]

    return {
        "total_monthly_spend": round(total_monthly_spend, 2),
        "potential_savings": round(potential_savings, 2),
        "realized_savings": round(realized_savings, 2),
        "recurring_count": recurring_count,
        "annual_count": annual_count,
        "average_monthly_cost": average_monthly_cost,
        "highest_monthly_expense": highest_monthly_expense,
        "highest_leak_score": highest_leak_score,
        "overall_leak_score": overall_leak_score,
        "upcoming_renewals": upcoming_renewals,
    }


@app.post("/api/analyze")
def analyze(payload: AnalyzeRequest, db: Session = Depends(database.get_db)):
    """Raw unstructured text -> scored subscriptions, saved to DB."""
    from utils import sanitize_pii
    sanitized_data = sanitize_pii(payload.raw_text)
    clean_text = sanitized_data["clean_text"]
    items_redacted = sanitized_data["items_redacted"]

    transactions = extract_transactions(clean_text, payload.source_type)
    subscriptions = detect_subscriptions(transactions)
    scored = score_subscriptions(subscriptions)
    
    saved_scored = save_subscriptions_to_db(db, scored)

    return {
        "transactions": transactions,
        "subscriptions": saved_scored,
        "stats": calculate_stats(saved_scored),
        "items_redacted": items_redacted
    }


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    """Handles file uploads (PDF, Image, CSV), extracts text via OCR/parsing, and scores."""
    content = await file.read()
    raw_text = ""
    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                raw_text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
        
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            import pytesseract
            from PIL import Image
            try:
                img = Image.open(io.BytesIO(content))
                raw_text = pytesseract.image_to_string(img)
            except Exception as e:
                raise HTTPException(status_code=400, detail="Could not extract text from file. Try pasting raw text instead.")
        
        elif filename.endswith(".csv"):
            decoded_content = content.decode('utf-8').splitlines()
            reader = csv.reader(decoded_content)
            raw_text = "\n".join([",".join(row) for row in reader])
            
        else:
            # Fallback for text files
            raw_text = content.decode('utf-8')
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Extraction failed: {str(e)}")
        
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file. Try pasting raw text instead.")

    # Pass the extracted text to the existing pipeline
    try:
        from utils import sanitize_pii
        sanitized_data = sanitize_pii(raw_text)
        clean_text = sanitized_data["clean_text"]
        items_redacted = sanitized_data["items_redacted"]

        transactions = extract_transactions(clean_text, "bank_statement")
        subscriptions = detect_subscriptions(transactions)
        scored = score_subscriptions(subscriptions)
        
        saved_scored = save_subscriptions_to_db(db, scored)

        return {
            "transactions": transactions,
            "subscriptions": saved_scored,
            "stats": calculate_stats(saved_scored),
            "items_redacted": items_redacted
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.get("/api/subscriptions")
def get_subscriptions(db: Session = Depends(database.get_db)):
    """Fetch persistent state for demo user."""
    demo_user_id = 1
    db_subs = db.query(models.Subscription).filter(models.Subscription.user_id == demo_user_id).all()
    
    scored = [{**record.raw_data, "id": record.id, "is_inactive": record.status in ["Canceled", "Cancellation Sent"]} for record in db_subs]
    
    return {
        "subscriptions": scored,
        "stats": calculate_stats(scored),
        "items_redacted": 4  # Mock default for demo presentation
    }


class SubscriptionUpdate(BaseModel):
    action: str  # "Cancel", "Downgrade", "Keep"

@app.patch("/api/subscriptions/{sub_id}")
def update_subscription(sub_id: int, payload: SubscriptionUpdate, db: Session = Depends(database.get_db)):
    """Updates action plan & status, re-scores, returns updated stats."""
    sub_record = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub_record:
        raise HTTPException(status_code=404, detail="Subscription not found")

    is_inactive = (payload.action == "Cancel")
    
    # Update relational columns
    sub_record.action_plan = payload.action
    sub_record.status = "Canceled" if is_inactive else "Active"
    
    # Update JSON payload to reflect the toggle so frontend stays consistent
    raw_data = dict(sub_record.raw_data)
    
    # Run the scoring again just for this sub, passing the inactive status manually
    # Or just adjust the properties manually to save full rescore logic complexity
    if is_inactive:
        raw_data["is_inactive"] = True
        raw_data["leak_score"] = 0
        raw_data["recommendation"] = "Resolved"
        raw_data["recommendation_reason"] = f"You marked {sub_record.service_name} as resolved/cancelled. This leak is sealed!"
    else:
        raw_data["is_inactive"] = False
        # To get the real score back, we could either re-run score_subscriptions on [raw_data] with inactive_map={} 
        # but let's just let score_subscriptions do it correctly:
        rescored_list = score_subscriptions([raw_data], inactive_map={sub_record.service_name: False})
        raw_data = rescored_list[0]
        
    sub_record.raw_data = raw_data
    sub_record.leak_score = raw_data.get("leak_score", 0)
    db.commit()

    # Recalculate global stats for return
    demo_user_id = 1
    db_subs = db.query(models.Subscription).filter(models.Subscription.user_id == demo_user_id).all()
    all_scored = [{**r.raw_data, "id": r.id, "is_inactive": r.status in ["Canceled", "Cancellation Sent"]} for r in db_subs]

    return {
        "subscriptions": all_scored,
        "stats": calculate_stats(all_scored)
    }


@app.get("/api/subscriptions/{sub_id}/draft-cancellation")
def get_draft_cancellation(sub_id: int, db: Session = Depends(database.get_db)):
    """Drafts a cancellation email for a given subscription via Groq."""
    sub_record = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub_record:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    from utils import draft_cancellation_email
    try:
        draft = draft_cancellation_email(
            service_name=sub_record.service_name,
            amount=sub_record.amount,
            frequency=sub_record.frequency
        )
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to draft email: {str(e)}")


class SendCancellationRequest(BaseModel):
    vendor_email: str
    subject: str
    body: str

@app.post("/api/subscriptions/{sub_id}/send-cancellation")
def send_cancellation(sub_id: int, payload: SendCancellationRequest, db: Session = Depends(database.get_db)):
    """Sends the finalized cancellation email via SMTP and updates subscription status."""
    sub_record = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub_record:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    from utils import send_cancellation_email
    try:
        # Send the email
        send_cancellation_email(payload.vendor_email, payload.subject, payload.body)
        
        # Update the database to reflect it was sent/canceled
        sub_record.action_plan = "Cancel"
        sub_record.status = "Cancellation Sent"
        
        raw_data = dict(sub_record.raw_data)
        raw_data["is_inactive"] = True
        raw_data["leak_score"] = 0
        raw_data["recommendation"] = "Resolved"
        raw_data["recommendation_reason"] = f"Cancellation email successfully sent to {payload.vendor_email}."
        
        sub_record.raw_data = raw_data
        sub_record.leak_score = 0
        db.commit()
        
        # Return updated stats and subs to UI
        demo_user_id = 1
        db_subs = db.query(models.Subscription).filter(models.Subscription.user_id == demo_user_id).all()
        # Note: We now check status in ["Canceled", "Cancellation Sent"] for inactive flag
        all_scored = [{**r.raw_data, "id": r.id, "is_inactive": r.status in ["Canceled", "Cancellation Sent"]} for r in db_subs]

        return {
            "subscriptions": all_scored,
            "stats": calculate_stats(all_scored)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


@app.get("/api/subscriptions/{sub_id}/downgrade-options")
def downgrade_options(sub_id: int, db: Session = Depends(database.get_db)):
    """Fetches AI suggested downgrade options."""
    sub_record = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub_record:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    from utils import get_downgrade_options
    try:
        options = get_downgrade_options(sub_record.service_name, sub_record.amount)
        return options
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch downgrade options: {str(e)}")


class ApplyDowngradeRequest(BaseModel):
    plan_name: str
    new_price: float

@app.patch("/api/subscriptions/{sub_id}/apply-downgrade")
def apply_downgrade(sub_id: int, payload: ApplyDowngradeRequest, db: Session = Depends(database.get_db)):
    """Applies a downgrade to a subscription."""
    sub_record = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub_record:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    try:
        old_price = sub_record.amount
        sub_record.amount = payload.new_price
        sub_record.service_name = f"{sub_record.service_name} ({payload.plan_name})"
        sub_record.action_plan = "Downgrade"
        sub_record.status = "Downgraded"
        
        raw_data = dict(sub_record.raw_data)
        raw_data["latest_amount"] = payload.new_price
        raw_data["monthly_equivalent_amount"] = payload.new_price if sub_record.frequency == "Monthly" else round(payload.new_price / 12, 2)
        raw_data["leak_score"] = max(0, raw_data.get("leak_score", 0) - 30)
        raw_data["recommendation"] = "Optimized"
        raw_data["recommendation_reason"] = f"Successfully downgraded to {payload.plan_name} plan, saving you money."
        
        sub_record.raw_data = raw_data
        sub_record.leak_score = raw_data["leak_score"]
        db.commit()
        
        demo_user_id = 1
        db_subs = db.query(models.Subscription).filter(models.Subscription.user_id == demo_user_id).all()
        all_scored = [{**r.raw_data, "id": r.id, "is_inactive": r.status in ["Canceled", "Cancellation Sent"]} for r in db_subs]

        return {
            "subscriptions": all_scored,
            "stats": calculate_stats(all_scored)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply downgrade: {str(e)}")


@app.get("/api/cashflow-forecast")
def cashflow_forecast(db: Session = Depends(database.get_db)):
    """Predictive analytics endpoint that builds a 30-day cashflow timeline and uses Groq to detect shock clusters."""
    demo_user_id = 1
    db_subs = db.query(models.Subscription).filter(
        models.Subscription.user_id == demo_user_id,
        models.Subscription.status == "Active"
    ).all()
    
    from datetime import datetime, timedelta
    import random
    from collections import defaultdict
    from utils import analyze_cashflow_shock
    
    today = datetime.now()
    timeline_dict = defaultdict(lambda: {"amount": 0, "services": []})
    
    for sub in db_subs:
        raw = sub.raw_data or {}
        renewal = raw.get("renewal_date")
        amount = raw.get("latest_amount", sub.amount)
        service = sub.service_name
        
        # Safe Date Math Fallback: If no date, pick a random day in the next 30 days for demo purposes
        if not renewal:
            random_days = random.randint(1, 30)
            renewal_date = today + timedelta(days=random_days)
        else:
            try:
                # Assuming format is YYYY-MM-DD
                parsed_date = datetime.strptime(renewal, "%Y-%m-%d")
                # If the renewal date is in the past or far future, shift it into the next 30 days for the demo
                if parsed_date < today or parsed_date > today + timedelta(days=30):
                    random_days = random.randint(1, 30)
                    renewal_date = today + timedelta(days=random_days)
                else:
                    renewal_date = parsed_date
            except ValueError:
                random_days = random.randint(1, 30)
                renewal_date = today + timedelta(days=random_days)
                
        date_str = renewal_date.strftime("%Y-%m-%d")
        timeline_dict[date_str]["amount"] += amount
        timeline_dict[date_str]["services"].append(service)
        
    # Generate continuous 30 day timeline, even for empty days, so the chart looks nice
    timeline_array = []
    for i in range(30):
        current_date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
        if current_date in timeline_dict:
            timeline_array.append({
                "date": current_date,
                "amount": timeline_dict[current_date]["amount"],
                "services": timeline_dict[current_date]["services"]
            })
        else:
            timeline_array.append({
                "date": current_date,
                "amount": 0,
                "services": []
            })
            
    try:
        enriched_data = analyze_cashflow_shock(timeline_array)
        return enriched_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze cashflow: {str(e)}")


@app.post("/api/subscriptions/{sub_id}/negotiate")
def negotiate_subscription(sub_id: int, db: Session = Depends(database.get_db)):
    """Fetches AI generated negotiation playbook."""
    sub_record = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub_record:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    from utils import generate_negotiation_playbook
    try:
        playbook = generate_negotiation_playbook(sub_record.service_name, sub_record.amount, sub_record.frequency)
        return playbook
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate playbook: {str(e)}")


class ChatHistoryRequest(BaseModel):
    chat_history: list

@app.post("/api/subscriptions/{sub_id}/negotiate-chat")
def simulate_negotiation(sub_id: int, payload: ChatHistoryRequest, db: Session = Depends(database.get_db)):
    """Simulates a negotiation chat response using AI."""
    sub_record = db.query(models.Subscription).filter(models.Subscription.id == sub_id).first()
    if not sub_record:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    from utils import simulate_negotiation_chat
    try:
        response = simulate_negotiation_chat(sub_record.service_name, sub_record.amount, payload.chat_history)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to simulate chat: {str(e)}")


@app.get("/api/health")
def health():
    return {"status": "ok"}
