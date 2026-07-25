from collections import defaultdict


def score_subscriptions(subscriptions, inactive_map=None):
    inactive_map = inactive_map or {}

    by_category = defaultdict(list)
    for s in subscriptions:
        by_category[s["category"]].append(s["merchant"])

    for s in subscriptions:
        recurrence_score = 100 if s["is_recurring"] else 0
        price_score = min(100, max(0, s["price_hike_pct"]) * 4)
        inactive_score = 100 if inactive_map.get(s["merchant"], False) else 0
        redundancy_score = 100 if len(by_category[s["category"]]) >= 2 else 0

        leak_score = round(
            0.30 * recurrence_score
            + 0.25 * price_score
            + 0.30 * inactive_score
            + 0.15 * redundancy_score
        )
        s["leak_score"] = leak_score

        if inactive_score and leak_score > 70:
            s["recommended_action"] = "Cancel"
        elif s["price_hike_pct"] > 8:
            s["recommended_action"] = "Renegotiate"
        elif redundancy_score:
            s["recommended_action"] = "Downgrade / consolidate"
        else:
            s["recommended_action"] = "Keep"

    return subscriptions