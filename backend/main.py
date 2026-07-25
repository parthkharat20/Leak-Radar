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

    total_monthly_leak = sum(
        s["latest_amount"] for s in scored if s["leak_score"] > 50
    )

    return {
        "transactions": transactions,
        "subscriptions": scored,
        "total_monthly_leak": total_monthly_leak,
    }


@app.post("/api/rescore")
def rescore(payload: RescoreRequest):
    """Re-run scoring after the user toggles 'still using this?' in the UI."""
    inactive_map = {m: True for m in payload.inactive_merchants}
    scored = score_subscriptions(payload.subscriptions, inactive_map)
    return {"subscriptions": scored}


@app.get("/api/health")
def health():
    return {"status": "ok"}