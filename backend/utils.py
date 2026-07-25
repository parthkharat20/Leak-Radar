import os
import smtplib
import json
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from groq import Groq

# Use the same Groq client configuration as extract.py
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def sanitize_pii(text: str) -> dict:
    """Sanitizes PII from text before it hits the LLM."""
    items_redacted = 0
    clean_text = text

    # PAN Cards (Indian format: 5 letters, 4 digits, 1 letter)
    pan_pattern = r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b'
    pan_matches = re.findall(pan_pattern, clean_text)
    items_redacted += len(pan_matches)
    clean_text = re.sub(pan_pattern, '[PAN-REDACTED]', clean_text)

    # Credit/Debit Cards (13-16 digits with optional spaces/dashes)
    # We use a pattern that requires at least a few groups to avoid capturing simple amounts
    card_pattern = r'\b(?:\d[ -]*?){13,16}\b'
    # To be safer against capturing large currency amounts, let's look for explicit card patterns like 4 blocks of 4
    card_pattern_safe = r'\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b'
    card_matches = re.findall(card_pattern_safe, clean_text)
    items_redacted += len(card_matches)
    clean_text = re.sub(card_pattern_safe, '[CARD-REDACTED]', clean_text)

    # Account Numbers (usually 9-18 digits, we'll prefix with 'Acct' or 'Account' to be safe)
    acct_pattern = r'\b(?:Acct|Account|A/C|A/c)[. :]*\d{9,18}\b'
    acct_matches = re.findall(acct_pattern, clean_text, re.IGNORECASE)
    items_redacted += len(acct_matches)
    clean_text = re.sub(acct_pattern, '[ACCT-REDACTED]', clean_text, flags=re.IGNORECASE)
    
    # Phone Numbers (basic international or local formats, e.g., +91-9876543210 or 9876543210)
    phone_pattern = r'\b(?:\+?91[\-\s]?)?[6789]\d{9}\b'
    phone_matches = re.findall(phone_pattern, clean_text)
    items_redacted += len(phone_matches)
    clean_text = re.sub(phone_pattern, '[PHONE-REDACTED]', clean_text)

    # Emails (exclude common merchants)
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    whitelisted_domains = ['netflix.com', 'spotify.com', 'adobe.com', 'amazon.com', 'apple.com', 'google.com', 'makemytrip.com']
    
    def email_replacer(match):
        email = match.group(0)
        domain = email.split('@')[-1].lower()
        if domain in whitelisted_domains:
            return email
        nonlocal items_redacted
        items_redacted += 1
        return '[EMAIL-REDACTED]'

    clean_text = re.sub(email_pattern, email_replacer, clean_text)

    return {
        "clean_text": clean_text,
        "items_redacted": items_redacted
    }

def draft_cancellation_email(service_name: str, amount: float, frequency: str) -> dict:
    """Uses Groq to draft a formal cancellation email returning JSON."""
    
    system_prompt = """You are an AI assistant helping a user cancel a subscription. 
Draft a highly professional and polite cancellation email to the vendor.

You must return a valid JSON object with EXACTLY these three keys:
- "vendor_email": Make your best guess for their support email (e.g. support@netflix.com, help@amazon.com, cancel@service.com).
- "subject": The subject line of the email.
- "body": The full body of the email. Leave placeholders like [My Name] or [Account Email] if necessary, but keep it ready to send.

Return ONLY the raw JSON object. Do not include markdown formatting (like ```json), no preamble, and no explanation."""
    
    user_prompt = f"Please draft a cancellation email for '{service_name}'. My current plan is {frequency} and costs {amount}."
    
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )
    
    content = resp.choices[0].message.content.strip()
    # Clean up any potential markdown formatting the LLM might still try to inject
    content = content.replace("```json", "").replace("```", "").strip()
    
    try:
        data = json.loads(content)
        return data
    except json.JSONDecodeError:
        # Fallback in case of parsing errors
        return {
            "vendor_email": f"support@{service_name.lower().replace(' ', '')}.com",
            "subject": f"Request to Cancel Subscription - {service_name}",
            "body": f"Hello {service_name} Support,\n\nI would like to cancel my {frequency} subscription which costs {amount}.\n\nPlease confirm when my account has been cancelled.\n\nThank you,\n[Your Name]"
        }

def send_cancellation_email(vendor_email: str, subject: str, body: str) -> bool:
    """Sends a real email via Gmail SMTP using credentials from environment variables."""
    sender_email = os.environ.get("SMTP_EMAIL")
    sender_password = os.environ.get("SMTP_PASSWORD")
    
    if not sender_email or not sender_password:
        raise ValueError("SMTP_EMAIL and SMTP_PASSWORD environment variables are not set.")
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = vendor_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        raise Exception(f"Failed to send email via SMTP: {str(e)}")

def get_downgrade_options(service_name: str, current_price: float) -> list:
    """Uses Groq to suggest 2 realistic cheaper plans for a subscription."""
    
    system_prompt = """You are a financial savings AI. Your job is to suggest realistic, cheaper tier options for a given subscription service.
    
You must return ONLY a strict JSON array of exactly 2 cheaper plan options. Do not include markdown formatting like ```json, no preamble, and no explanation.

Example output format:
[
  {"plan_name": "Basic Tier", "new_price": 199, "savings": 450, "features": "720p, 1 screen, ad-supported"},
  {"plan_name": "Standard Tier", "new_price": 499, "savings": 150, "features": "1080p, 2 screens"}
]
"""
    
    user_prompt = f"Suggest 2 cheaper alternative plans for {service_name} which currently costs {current_price}."
    
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )
    
    content = resp.choices[0].message.content.strip()
    content = content.replace("```json", "").replace("```", "").strip()
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return [
            {"plan_name": "Basic / Ad-supported", "new_price": round(current_price * 0.4, 2), "savings": round(current_price * 0.6, 2), "features": "Limited features"},
            {"plan_name": "Standard", "new_price": round(current_price * 0.7, 2), "savings": round(current_price * 0.3, 2), "features": "Standard features"}
        ]

def analyze_cashflow_shock(timeline_data: list) -> dict:
    """Uses Groq to analyze a 30-day timeline for clustering shocks."""
    
    system_prompt = """You are a financial cashflow AI. Analyze the upcoming 30-day subscription renewals.
Identify "Shock Clusters" (multiple heavy charges hitting within 24-48 hours of each other that could cause an overdraft).

You must return ONLY a strict JSON object. Do not include markdown formatting like ```json, no preamble, and no explanation.

Example output format:
{
  "timeline": [
    {"date": "2026-07-26", "amount": 649, "services": ["Netflix"]}
  ],
  "shock_alert": {
    "has_risk": true,
    "message": "High risk: ₹2,100 in renewals hitting between July 28-30."
  }
}
"""
    
    user_prompt = f"Analyze this timeline and return the enriched JSON with a shock_alert:\n{json.dumps(timeline_data)}"
    
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
        response_format={"type": "json_object"} # Groq JSON mode
    )
    
    content = resp.choices[0].message.content.strip()
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "timeline": timeline_data,
            "shock_alert": {
                "has_risk": False,
                "message": "Failed to analyze cashflow risk."
            }
        }

def generate_negotiation_playbook(service_name: str, amount: float, frequency: str) -> dict:
    """Uses Groq to generate a 3-bullet negotiation cheatsheet and an initial bot greeting."""
    system_prompt = f"""You are an AI negotiation coach.
The user wants to negotiate their {service_name} subscription which costs {amount} ({frequency}).

Generate a JSON object with:
1. `script`: An array of exactly 3 concise, highly effective bullet points for negotiating a lower rate or fee waiver.
2. `initial_bot_message`: A realistic opening message acting as a customer support rep for {service_name}.

You must return ONLY a strict JSON object. No preamble, no markdown formatting.
Example format:
{{
  "script": ["Mention competitor X offers a cheaper plan.", "Ask for the customer retention department.", "Request a one-time courtesy fee waiver."],
  "initial_bot_message": "Hello from {service_name} Support! I see you are inquiring about your billing. How can I assist you today?"
}}
"""
    try:
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        return json.loads(resp.choices[0].message.content.strip())
    except Exception as e:
        return {
            "script": ["Highlight your loyalty.", "Ask for current promotions.", "Threaten to cancel if they can't help."],
            "initial_bot_message": f"Welcome to {service_name} support. How can I help you today?"
        }

def simulate_negotiation_chat(service_name: str, amount: float, chat_history: list) -> dict:
    """Uses Groq to simulate the vendor's retention rep based on chat history."""
    
    system_prompt = f"""You are a tough but realistic customer retention representative for {service_name}. 
The user is paying {amount} and wants a discount. 

Your goals:
1. Push back at first (e.g., "I'm sorry, that's our standard rate").
2. If the user mentions cancelling, a competitor, or presses hard, offer a 30-50% discount.
3. Stay strictly in character. Do not break the fourth wall.

You must return ONLY a strict JSON object. No preamble, no markdown formatting.
Example format:
{{
  "reply": "I understand the price is a concern. As a loyal customer, I can offer you a 30% discount for the next 6 months. Does that work?",
  "discount_offered": true
}}
"""
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in chat_history:
        # Chat history from frontend is usually { sender: 'user' | 'bot', text: '...' }
        role = "user" if msg.get("sender") == "user" else "assistant"
        messages.append({"role": role, "content": msg.get("text", "")})
        
    try:
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        return json.loads(resp.choices[0].message.content.strip())
    except Exception as e:
        return {
            "reply": "I'm having trouble connecting to our billing system right now.",
            "discount_offered": False
        }
