import os
import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from groq import Groq

# Use the same Groq client configuration as extract.py
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

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
        model="llama-3.3-70b-versatile",
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
        model="llama-3.3-70b-versatile",
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
