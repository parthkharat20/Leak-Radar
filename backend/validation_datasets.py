import json
from dotenv import load_dotenv
load_dotenv()
from extract import extract_transactions
from detect import detect_subscriptions
from score import score_subscriptions

dataset_1 = """
Subject: Your Hulu Receipt
Amount: $15.99
Billed Monthly
"""

dataset_2 = """
Subject: DropBox Payment
You paid $119.88 for Dropbox Plus.
Renews Yearly.

---
Subject: Google One
Payment of $29.99 for 2TB Storage.
Billed Annually.
"""

dataset_3_historical = """
Merchant: Figma
Amount: $15
Date: 2026-05-01

Merchant: Figma
Amount: $15
Date: 2026-06-01

Merchant: Figma
Amount: $18
Date: 2026-07-01
"""

dataset_4_filtering = """
Uber Trip to Airport
Amount: ₹850
Date: 2026-07-24

Swiggy Food Delivery
Amount: ₹350
Date: 2026-07-25

Spotify Premium
Amount: ₹299
Billed Monthly
"""

def run_test(name, text):
    print(f"\n========== RUNNING TEST: {name} ==========")
    transactions = extract_transactions(text, "email")
    print(f"Extracted {len(transactions)} transactions.")
    subscriptions = detect_subscriptions(transactions)
    scored = score_subscriptions(subscriptions)
    for s in scored:
        print(f"Merchant: {s['merchant']}")
        print(f"  Confidence: {s['confidence_score']}")
        print(f"  Leak Score: {s['leak_score']}")
        print(f"  Recommendation: {s['recommendation']}")
        print(f"  Reason: {s['recommendation_reason']}")
        print(f"  Renewal Date: {s['renewal_date']}")

run_test("Dataset 1 (Single Monthly Missing Date)", dataset_1)
run_test("Dataset 2 (Multiple Annual Storage Duplicates Missing Dates)", dataset_2)
run_test("Dataset 3 (Historical Price Hike)", dataset_3_historical)
run_test("Dataset 4 (Aggressive Filtering)", dataset_4_filtering)
