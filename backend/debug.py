import json
import sys
from dotenv import load_dotenv
load_dotenv()
from extract import extract_transactions
from detect import detect_subscriptions
from score import score_subscriptions

raw_text = """
Subject: Netflix Payment Successful

Hi Parth,

Your payment for Netflix Premium has been received.

Amount Paid: ₹649
Billing Date: 24 July 2026
Next Billing: 24 August 2026

----------------------------------------------------

Subject: Spotify Premium Receipt

Thanks for subscribing!

Plan: Premium Individual
Amount: ₹299
Renews every month.

----------------------------------------------------

Subject: Google One Storage

Payment Successful

Google One 200GB

Amount Charged: ₹130

Renewal Date: 30 July 2026

----------------------------------------------------

Subject: Adobe Creative Cloud

Invoice

Creative Cloud All Apps

₹1,596

Billed Monthly

----------------------------------------------------

Subject: Amazon Prime

Membership renewed successfully.

Amount Paid ₹1499

Renews yearly.
"""

print("==================================================")
print("STEP 1 & 2: Verify Groq Extraction")
print("==================================================")
transactions = extract_transactions(raw_text, "email")
print(json.dumps(transactions, indent=2))

print("\n==================================================")
print("STEP 3: Verify detect.py")
print("==================================================")
subscriptions = detect_subscriptions(transactions)
print(json.dumps(subscriptions, indent=2))

print("\n==================================================")
print("STEP 4: Verify score.py")
print("==================================================")
scored = score_subscriptions(subscriptions)
print(json.dumps(scored, indent=2))

print("\n==================================================")
print("STEP 5 & 6: Verify Dashboard Calculations & API Response")
print("==================================================")
total_monthly_spend = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring"))
potential_savings = sum(s.get("monthly_equivalent_amount", 0) for s in scored if s.get("leak_score", 0) > 40)
recurring_count = sum(1 for s in scored if s.get("is_recurring"))
annual_count = sum(1 for s in scored if s.get("billing_frequency") == "Annual")
average_monthly_cost = round(total_monthly_spend / recurring_count, 2) if recurring_count > 0 else 0
highest_monthly_expense = max([s.get("monthly_equivalent_amount", 0) for s in scored if s.get("is_recurring")] or [0])
highest_leak_score = max([s.get("leak_score", 0) for s in scored] or [0])

stats = {
    "total_monthly_spend": round(total_monthly_spend, 2),
    "potential_savings": round(potential_savings, 2),
    "recurring_count": recurring_count,
    "annual_count": annual_count,
    "average_monthly_cost": average_monthly_cost,
    "highest_monthly_expense": highest_monthly_expense,
    "highest_leak_score": highest_leak_score,
}
print(json.dumps({"subscriptions": scored, "stats": stats}, indent=2))
