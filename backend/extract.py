import os
import json
from groq import Groq

def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY environment variable is missing. Please add it to your Vercel Project Settings.")
    return Groq(api_key=api_key)
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


def fallback_extract_transactions(raw_text: str):
    import re
    lines = raw_text.splitlines()
    transactions = []
    
    brand_categories = {
        "netflix": ("Netflix", "Streaming", "Monthly"),
        "spotify": ("Spotify", "Music", "Monthly"),
        "cult.fit": ("Cult.fit", "Utility", "Monthly"),
        "cultfit": ("Cult.fit", "Utility", "Monthly"),
        "hotstar": ("Disney+ Hotstar", "Streaming", "Monthly"),
        "disney": ("Disney+ Hotstar", "Streaming", "Monthly"),
        "amazon": ("Prime Video", "Streaming", "Monthly"),
        "prime": ("Prime Video", "Streaming", "Monthly"),
        "chatgpt": ("ChatGPT Plus", "AI", "Monthly"),
        "openai": ("ChatGPT Plus", "AI", "Monthly"),
        "adobe": ("Adobe Creative Cloud", "Design", "Monthly"),
        "github": ("GitHub Pro", "Developer Tools", "Monthly"),
        "notion": ("Notion Pro", "Productivity", "Monthly"),
        "dropbox": ("Dropbox", "Cloud Storage", "Annual"),
        "google": ("Google One", "Cloud Storage", "Annual"),
        "figma": ("Figma", "Design", "Monthly"),
        "apple": ("iCloud+", "Cloud Storage", "Monthly"),
        "youtube": ("YouTube Premium", "Streaming", "Monthly"),
        "hulu": ("Hulu", "Streaming", "Monthly"),
        "swiggy": None,
        "uber": None,
        "zomato": None
    }
    
    date_regex = re.compile(r'(\d{4}-\d{2}-\d{2}|\d{2}[-/]\d{2}[-/]\d{4})')
    amount_regex = re.compile(r'(?:INR|USD|\$|₹)?\s*(\d+(?:\.\d{1,2})?)', re.IGNORECASE)

    for line in lines:
        line_lower = line.lower().strip()
        if not line_lower:
            continue
            
        matched_brand = None
        for key, info in brand_categories.items():
            if key in line_lower:
                if info is None:
                    # Ignore blacklisted non-subscriptions
                    matched_brand = "BLACKLIST"
                    break
                matched_brand = info
                break
                
        if matched_brand and matched_brand != "BLACKLIST":
            service_name, category, freq = matched_brand
            # Extract date
            date_match = date_regex.search(line)
            date_str = "2026-06-01"
            if date_match:
                raw_date = date_match.group(1)
                if "-" in raw_date or "/" in raw_date:
                    parts = re.split(r'[-/]', raw_date)
                    if len(parts[0]) == 4:
                        date_str = f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}"
                    elif len(parts[2]) == 4:
                        date_str = f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"

            # Extract amount
            amounts = amount_regex.findall(line)
            amount_val = 199.0
            if amounts:
                # filter out date numbers
                valid_amounts = [float(a) for a in amounts if float(a) > 10 and float(a) != 2026]
                if valid_amounts:
                    amount_val = valid_amounts[-1]

            transactions.append({
                "date": date_str,
                "service_name": service_name,
                "amount": amount_val,
                "currency": "INR" if "$" not in line else "USD",
                "category": category,
                "billing_frequency": freq,
                "next_billing_date": None
            })
            
    return transactions


def extract_transactions(raw_text: str, source_type: str = "bank_statement"):
    try:
        resp = get_groq_client().chat.completions.create(
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
            results = json.loads(content)
        except json.JSONDecodeError:
            start = content.find("[")
            end = content.rfind("]") + 1
            results = json.loads(content[start:end])
            
        if not results:
            results = fallback_extract_transactions(raw_text)
        return results
    except Exception as e:
        print("Groq transaction extraction failed, using fallback parser:", str(e))
        return fallback_extract_transactions(raw_text)