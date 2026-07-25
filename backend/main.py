import os
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
import pdfplumber
import pytesseract
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI(title="LeakRadar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.post("/api/analyze")
def analyze(payload: AnalyzeRequest):
    """Raw unstructured text -> scored subscriptions, end to end."""
    transactions = extract_transactions(payload.raw_text, payload.source_type)
    subscriptions = detect_subscriptions(transactions)
    scored = score_subscriptions(subscriptions)

    total_monthly_spend = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring"))
    potential_savings = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("leak_score", 0) > 40)
    recurring_count = sum(1 for s in scored if s.get("is_recurring"))
    annual_count = sum(1 for s in scored if s.get("billing_frequency") == "Annual")
    average_monthly_cost = round(total_monthly_spend / recurring_count, 2) if recurring_count > 0 else 0
    
    highest_monthly_expense = max([s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring")] or [0])
    highest_leak_score = max([s.get("leak_score", 0) for s in scored] or [0])
    overall_leak_score = int(sum(s.get("leak_score", 0) for s in scored) / len(scored)) if scored else 0

    upcoming_renewals = [s for s in scored if s.get("renewal_date")]
    upcoming_renewals = sorted(upcoming_renewals, key=lambda x: x["renewal_date"])[:3]

    return {
        "transactions": transactions,
        "subscriptions": scored,
        "stats": {
            "total_monthly_spend": round(total_monthly_spend, 2),
            "potential_savings": round(potential_savings, 2),
            "recurring_count": recurring_count,
            "annual_count": annual_count,
            "average_monthly_cost": average_monthly_cost,
            "highest_monthly_expense": highest_monthly_expense,
            "highest_leak_score": highest_leak_score,
            "overall_leak_score": overall_leak_score,
            "upcoming_renewals": upcoming_renewals,
        }
    }


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handles file uploads (PDF, Image, CSV), extracts text via OCR/parsing, and scores."""
    content = await file.read()
    raw_text = ""
    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                raw_text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())
        
        elif filename.endswith((".png", ".jpg", ".jpeg")):
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
        raise HTTPException(status_code=400, detail="Could not extract text from file. Try pasting raw text instead.")
        
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file. Try pasting raw text instead.")

    # Pass the extracted text to the existing pipeline
    try:
        transactions = extract_transactions(raw_text, "bank_statement")
        subscriptions = detect_subscriptions(transactions)
        scored = score_subscriptions(subscriptions)

        total_monthly_spend = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring"))
        potential_savings = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("leak_score", 0) > 40)
        recurring_count = sum(1 for s in scored if s.get("is_recurring"))
        annual_count = sum(1 for s in scored if s.get("billing_frequency") == "Annual")
        average_monthly_cost = round(total_monthly_spend / recurring_count, 2) if recurring_count > 0 else 0
        
        highest_monthly_expense = max([s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring")] or [0])
        highest_leak_score = max([s.get("leak_score", 0) for s in scored] or [0])
        overall_leak_score = int(sum(s.get("leak_score", 0) for s in scored) / len(scored)) if scored else 0

        upcoming_renewals = [s for s in scored if s.get("renewal_date")]
        upcoming_renewals = sorted(upcoming_renewals, key=lambda x: x["renewal_date"])[:3]

        return {
            "transactions": transactions,
            "subscriptions": scored,
            "stats": {
                "total_monthly_spend": round(total_monthly_spend, 2),
                "potential_savings": round(potential_savings, 2),
                "recurring_count": recurring_count,
                "annual_count": annual_count,
                "average_monthly_cost": average_monthly_cost,
                "highest_monthly_expense": highest_monthly_expense,
                "highest_leak_score": highest_leak_score,
                "overall_leak_score": overall_leak_score,
                "upcoming_renewals": upcoming_renewals,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rescore")
def rescore(payload: RescoreRequest):
    """Re-run scoring after the user toggles 'still using this?' in the UI."""
    inactive_map = {m: True for m in payload.inactive_merchants}
    scored = score_subscriptions(payload.subscriptions, inactive_map)

    total_monthly_spend = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring"))
    potential_savings = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("leak_score", 0) > 40)
    recurring_count = sum(1 for s in scored if s.get("is_recurring"))
    annual_count = sum(1 for s in scored if s.get("billing_frequency") == "Annual")
    average_monthly_cost = round(total_monthly_spend / recurring_count, 2) if recurring_count > 0 else 0
    highest_monthly_expense = max([s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring")] or [0])
    highest_leak_score = max([s.get("leak_score", 0) for s in scored] or [0])
    overall_leak_score = int(sum(s.get("leak_score", 0) for s in scored) / len(scored)) if scored else 0
    
    upcoming_renewals = [s for s in scored if s.get("renewal_date")]
    upcoming_renewals = sorted(upcoming_renewals, key=lambda x: x["renewal_date"])[:3]

    return {
        "subscriptions": scored,
        "stats": {
            "total_monthly_spend": round(total_monthly_spend, 2),
            "potential_savings": round(potential_savings, 2),
            "recurring_count": recurring_count,
            "annual_count": annual_count,
            "average_monthly_cost": average_monthly_cost,
            "highest_monthly_expense": highest_monthly_expense,
            "highest_leak_score": highest_leak_score,
            "overall_leak_score": overall_leak_score,
            "upcoming_renewals": upcoming_renewals,
        }
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}