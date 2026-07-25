# LeakRadar backend — quickstart

## Setup
```
cd leakradar-backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then add your Groq key (console.groq.com, free)
uvicorn main:app --reload --port 8000
```

## Test the whole pipeline in one call
```
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{"raw_text": "$(cat sample_input.txt | sed 's/"/\\"/g' | tr '\n' '|' | sed 's/|/\\n/g')", "source_type": "bank_statement"}
EOF
```
If that heredoc is fiddly on your shell, easier: open `http://localhost:8000/docs` (FastAPI's auto Swagger UI), paste the contents of `sample_input.txt` into the `/api/analyze` request body there, and hit Execute.

## Endpoints
- `POST /api/extract` — raw text -> transactions only
- `POST /api/analyze` — raw text -> transactions + scored subscriptions + total monthly leak (this is the one your frontend should call)
- `POST /api/rescore` — re-score after the user toggles "still using this?" for any merchant
- `GET /api/health` — health check

## Wiring the frontend
Point axios/fetch at `POST http://localhost:8000/api/analyze` with `{ raw_text, source_type }`.
Response shape:
```json
{
  "transactions": [...],
  "subscriptions": [
    {
      "merchant": "Netflix",
      "category": "streaming",
      "is_recurring": true,
      "cycle_days": 30,
      "first_amount": 199,
      "latest_amount": 249,
      "price_hike_pct": 25.1,
      "leak_score": 68,
      "recommended_action": "Renegotiate"
    }
  ],
  "total_monthly_leak": 1796
}
```

## Before you deploy
- Deploy to Render or Railway (free tier, both deploy straight from a GitHub repo).
- CORS is wide open (`allow_origins=["*"]`) for hackathon speed — fine for a demo, not for production.
- Keep `sample_input.txt` as your safety net: if the live Groq call misbehaves on stage, you can paste this in and it will parse cleanly every time.