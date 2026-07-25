import os
import json
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a financial transaction parser. Given raw unstructured text \
(bank statement lines, SMS alerts, or forwarded email text), extract every transaction \
as a JSON array. For each transaction return:
- date (YYYY-MM-DD). Source dates may be DD-MM-YYYY (e.g. 01-02-2026 = 1 Feb 2026) or \
DD-Mon-YY (e.g. 01-Jun-26). Convert correctly to ISO YYYY-MM-DD — never just reorder \
the digits. Example: 01-02-2026 -> 2026-02-01.
- merchant_raw (exactly as it appears in the source)
- merchant_normalized (clean brand name, e.g. "NETFLIX.COM 8019273" -> "Netflix")
- amount (number, no currency symbol)
- currency (ISO code, default INR)
- category (one of: streaming, saas, fitness, insurance, utilities, food_delivery, other)
- source_type (bank_statement | sms | email)

Return ONLY a valid JSON array. No markdown, no explanation, no preamble.
If a line isn't a transaction, skip it."""


def extract_transactions(raw_text: str, source_type: str = "bank_statement"):
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
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