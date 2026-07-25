import os
import json
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a financial transaction parser. Given raw unstructured text \
(bank statement lines, SMS alerts, or forwarded email text), extract every subscription transaction \
as a JSON array. 

CRITICAL: DO NOT extract one-time expenses or non-subscriptions. IGNORE Uber, Swiggy, Zomato, Restaurant, Fuel, Medical, ATM Withdrawal, Shopping, and UPI transfers.

For each transaction return:
- date (YYYY-MM-DD). Convert correctly to ISO YYYY-MM-DD. Example: 01-02-2026 -> 2026-02-01.
- service_name (clean brand name, e.g., Netflix, Prime Video, Google One)
- amount (number, no currency symbol)
- currency (ISO code, default INR)
- category (classify correctly into one of: Streaming, Music, Cloud Storage, Productivity, AI, Developer Tools, Design, Utility, Other)
- billing_frequency (look for "Monthly", "Billed Monthly", "Monthly Plan", "Renews Every Month", "Auto Renewal", "Next Billing Date" and map to "Monthly". Look for "Annual", "Yearly", "Renews Every Year", "Annual Membership" and map to "Annual". Otherwise return "Unknown")
- next_billing_date (YYYY-MM-DD if explicitly mentioned in text, else null)

DO NOT extract one-off purchases, rides, food delivery, or utility bills (e.g., Uber, Ola, Swiggy, Zomato, ATM, UPI transfers, shopping, electricity, fuel, groceries, medicine, restaurant bills). Only recurring services should survive extraction.

Return ONLY a valid JSON array. No markdown, no explanation, no preamble.
If a line isn't a subscription transaction, skip it."""


def extract_transactions(raw_text: str, source_type: str = "bank_statement"):
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"source_type: {source_type}\n\n{raw_text}"},
        ],
        temperature=0,
    )
    content = resp.choices[0].message.content.strip()
    content = content.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Fallback: pull out the JSON array if the model added stray text around it
        start = content.find("[")
        end = content.rfind("]") + 1
        return json.loads(content[start:end])