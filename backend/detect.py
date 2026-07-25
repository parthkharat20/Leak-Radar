from collections import defaultdict
from statistics import mean, stdev
from datetime import datetime, timedelta
from dateutil import parser as dateparser

def _parse_date(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d")
    except ValueError:
        return dateparser.parse(s, dayfirst=True)


def detect_subscriptions(transactions):
    groups = defaultdict(list)
    for t in transactions:
        merchant = t.get("service_name") or t.get("merchant_normalized") or t.get("merchant_raw")
        if merchant:
            groups[merchant].append(t)

    subscriptions = []
    for merchant, txns in groups.items():
        valid_txns = []
        for t in txns:
            dt = None
            if t.get("date"):
                try:
                    dt = _parse_date(t["date"])
                except Exception:
                    pass
            valid_txns.append((t, dt))

        if not valid_txns:
            continue

        # Sort gracefully, treating None as earliest
        valid_txns = sorted(valid_txns, key=lambda x: x[1] or datetime.min)
        txns = [x[0] for x in valid_txns]
        dates = [x[1] for x in valid_txns if x[1] is not None]
        amounts = [t["amount"] for t in txns]

        is_recurring = False
        billing_frequency = "One-Off"
        cycle_days = None
        monthly_equivalent_amount = amounts[-1]
        renewal_date = None

        # Fallback to LLM extracted info first
        extracted_freq = txns[-1].get("billing_frequency", "Unknown")
        extracted_renewal = txns[-1].get("next_billing_date")
        
        if extracted_freq == "Monthly":
            is_recurring = True
            billing_frequency = "Monthly"
            cycle_days = 30
        elif extracted_freq == "Annual":
            is_recurring = True
            billing_frequency = "Annual"
            cycle_days = 365
            monthly_equivalent_amount = round(amounts[-1] / 12, 2)
            
        if extracted_renewal:
            renewal_date = extracted_renewal

        # Historical Math (Overrides LLM if we have actual history)
        if len(dates) >= 2:
            gaps = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
            avg_gap = mean(gaps)
            gap_std = stdev(gaps) if len(gaps) > 1 else 0
            
            if avg_gap > 0 and (gap_std / avg_gap) < 0.3:
                is_recurring = True
                cycle_days = round(avg_gap)
                if not extracted_renewal:
                    renewal_date = (dates[-1] + timedelta(days=cycle_days)).strftime("%Y-%m-%d")
                
                if 340 <= cycle_days <= 380:
                    billing_frequency = "Annual"
                    monthly_equivalent_amount = round(amounts[-1] / 12, 2)
                elif 25 <= cycle_days <= 35:
                    billing_frequency = "Monthly"
                    monthly_equivalent_amount = amounts[-1]
                elif 80 <= cycle_days <= 100:
                    billing_frequency = "Quarterly"
                    monthly_equivalent_amount = round(amounts[-1] / 3, 2)
                else:
                    billing_frequency = f"Every {cycle_days} days"
                    monthly_equivalent_amount = amounts[-1]
                    
        # If we didn't have an extracted renewal date and historical math failed but we know it's monthly
        if is_recurring and not renewal_date and cycle_days and dates:
             renewal_date = (dates[-1] + timedelta(days=cycle_days)).strftime("%Y-%m-%d")
                    
        price_hike_pct = 0.0
        price_hike_amount = 0.0
        if len(amounts) >= 2 and amounts[-2] > 0:
            price_hike_amount = amounts[-1] - amounts[-2]
            price_hike_pct = round((price_hike_amount) / amounts[-2] * 100, 1)

        subscriptions.append(
            {
                "merchant": merchant,
                "category": txns[0].get("category", "Other"),
                "transactions": txns,
                "is_recurring": is_recurring,
                "billing_frequency": billing_frequency,
                "cycle_days": cycle_days,
                "first_amount": amounts[0],
                "latest_amount": amounts[-1],
                "monthly_equivalent_amount": monthly_equivalent_amount,
                "price_hike_pct": price_hike_pct,
                "price_hike_amount": price_hike_amount,
                "renewal_date": renewal_date,
            }
        )
    return subscriptions