from collections import defaultdict
from statistics import mean, stdev
from datetime import datetime
from dateutil import parser as dateparser

def _parse_date(s):
    try:
        return datetime.strptime(s, "%Y-%m-%d")
    except ValueError:
        return dateparser.parse(s, dayfirst=True)


def detect_subscriptions(transactions):
    groups = defaultdict(list)
    for t in transactions:
        groups[t["merchant_normalized"]].append(t)

    subscriptions = []
    for merchant, txns in groups.items():
        valid_txns = []
        for t in txns:
            try:
                dt = _parse_date(t["date"])
                valid_txns.append((t, dt))
            except Exception:
                continue

        if not valid_txns:
            continue

        valid_txns = sorted(valid_txns, key=lambda x: x[1])
        txns = [x[0] for x in valid_txns]
        dates = [x[1] for x in valid_txns]
        amounts = [t["amount"] for t in txns]

        is_recurring = False
        cycle_days = None
        if len(dates) >= 2:
            gaps = [(dates[i + 1] - dates[i]).days for i in range(len(dates) - 1)]
            avg_gap = mean(gaps)
            gap_std = stdev(gaps) if len(gaps) > 1 else 0
            if avg_gap > 0 and (gap_std / avg_gap) < 0.25:
                is_recurring = True
                cycle_days = round(avg_gap)

        price_hike_pct = 0.0
        if len(amounts) >= 2 and amounts[0] > 0:
            price_hike_pct = round((amounts[-1] - amounts[0]) / amounts[0] * 100, 1)

        subscriptions.append(
            {
                "merchant": merchant,
                "category": txns[0].get("category", "other"),
                "transactions": txns,
                "is_recurring": is_recurring,
                "cycle_days": cycle_days,
                "first_amount": amounts[0],
                "latest_amount": amounts[-1],
                "price_hike_pct": price_hike_pct,
            }
        )
    return subscriptions