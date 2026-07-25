from collections import defaultdict


def score_subscriptions(subscriptions, inactive_map=None):
    inactive_map = inactive_map or {}

    by_category = defaultdict(list)
    for s in subscriptions:
        if s["is_recurring"]:
            by_category[s["category"]].append(s["merchant"])

    for s in subscriptions:
        
        # Explainable Confidence Score Calculation
        confidence = 100
        
        # Penalty for missing core metrics
        if not s.get("first_amount"):
            confidence -= 10
        if s["category"] == "Other" or not s["category"]:
            confidence -= 10
            
        # Penalty for inferred frequency (lack of historical gap math)
        if s["is_recurring"]:
            if not s.get("cycle_days") or (s["cycle_days"] not in [30, 31, 28, 365, 366]):
                confidence -= 20
        else:
            confidence -= 45 # highly uncertain if it's truly a one-off or just missing data
            
        # Penalty if any transaction was missing a date
        has_null_dates = any(t.get("date") is None for t in s["transactions"])
        if has_null_dates:
            confidence -= 15

        s["confidence_score"] = max(0, confidence)

        # Feature flags
        is_inactive = inactive_map.get(s["merchant"], False)
        is_duplicate = len(by_category[s["category"]]) >= 2 and s["is_recurring"]
        hike_pct = s.get("price_hike_pct", 0)
        monthly_cost = s.get("monthly_equivalent_amount", 0)

        # 0-100 Score Calculation
        leak_score = 0
        if is_inactive: leak_score += 40
        if is_duplicate: leak_score += 30
        if hike_pct > 0: leak_score += min(20, int(hike_pct))
        
        # Cost penalty
        if monthly_cost > 1000: leak_score += 15
        elif monthly_cost > 500: leak_score += 10
        elif monthly_cost > 100: leak_score += 5

        leak_score = min(100, max(0, leak_score))
        s["leak_score"] = leak_score

        # Determine Recommendation & Reason deterministically
        reason = []
        rec = ""

        if s["confidence_score"] < 60:
            rec = "Needs Manual Review"
            reason = [f"Our AI lacks sufficient historical data to confidently analyze {s['merchant']}'s billing cycle."]
        elif is_inactive:
            rec = "Cancel Immediately"
            reason = [f"You marked {s['merchant']} as inactive. Canceling will immediately save you ₹{int(monthly_cost)}/mo."]
        elif is_duplicate:
            if s["category"].lower() == "streaming":
                rec = "Consolidate Streaming Services"
                reason = [f"You currently subscribe to multiple streaming services, including {s['merchant']}. These services overlap significantly. Cancelling one could reduce your recurring monthly expenses."]
            elif "storage" in s["category"].lower() or "cloud" in s["category"].lower():
                rec = "Keep only one storage provider"
                reason = [f"Multiple active cloud storage providers detected. You can usually migrate {s['merchant']} data to your primary provider to save ₹{int(monthly_cost)}/mo."]
            else:
                rec = "Downgrade / Consolidate"
                reason = [f"Redundant subscriptions detected in the {s['category']} category. Review if you strictly need {s['merchant']}."]
        elif hike_pct > 0:
            rec = "Review Price Increase"
            # Since price_hike_amount is now current - previous
            reason = [f"The subscription price for {s['merchant']} recently increased. Increase: ₹{int(s.get('price_hike_amount', 0))} ({hike_pct}%). Consider reviewing your current plan."]
        elif s["billing_frequency"] == "Monthly" and monthly_cost > 1000:
             rec = "Switch to Annual"
             savings = int(monthly_cost * 12 * 0.15)
             reason = [f"You are paying ₹{int(monthly_cost)}/month for {s['merchant']}. Based on current pricing, annual billing generally saves 15-20%. Estimated annual savings: ₹{savings}."]
        elif leak_score >= 60:
            rec = "Downgrade"
            reason = [f"High monthly cost of ₹{int(monthly_cost)} for {s['merchant']}. A cheaper tier or alternative might be available."]
        elif leak_score >= 40:
            rec = "Review"
            reason = [f"Moderate leak potential due to cost and recurring frequency for {s['merchant']}."]
        else:
            rec = "Keep"
            reason = [f"This subscription appears active, has no detected price hikes, and no duplicate services were found."]

        s["recommendation"] = rec
        s["recommendation_reason"] = " ".join(reason)
        
        # Simple unused logic: low confidence + only 1 transaction seen
        s["appears_unused"] = bool(s["confidence_score"] <= 60 and len(s["transactions"]) <= 1)

    return subscriptions