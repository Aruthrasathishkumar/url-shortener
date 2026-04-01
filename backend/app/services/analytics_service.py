import hashlib
from user_agents import parse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.click_event import ClickEvent
from app.models.link import Link

def parse_user_agent(ua_string: str):
    if not ua_string:
        return "desktop", "unknown"
    ua = parse(ua_string)
    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    else:
        device_type = "desktop"
    browser = ua.browser.family or "unknown"
    return device_type, browser

def parse_referrer(referrer: str) -> str:
    if not referrer:
        return "direct"
    referrer = referrer.lower()
    if "instagram" in referrer:
        return "instagram.com"
    if "twitter" in referrer or "t.co" in referrer:
        return "twitter.com"
    if "facebook" in referrer:
        return "facebook.com"
    if "linkedin" in referrer:
        return "linkedin.com"
    if "youtube" in referrer:
        return "youtube.com"
    if "google" in referrer:
        return "google.com"
    try:
        from urllib.parse import urlparse
        parsed = urlparse(referrer)
        return parsed.netloc or "direct"
    except:
        return "direct"

def hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()

def log_click_event(
    db: Session,
    link_id: int,
    ua_string: str,
    referrer: str,
    ip: str
):
    device_type, browser = parse_user_agent(ua_string)
    referrer_parsed = parse_referrer(referrer)
    ip_hash = hash_ip(ip) if ip else None

    event = ClickEvent(
        link_id=link_id,
        device_type=device_type,
        browser=browser,
        referrer=referrer_parsed,
        ip_hash=ip_hash,
    )
    db.add(event)
    db.commit()

def get_analytics(db: Session, link_id: int) -> dict:
    total_clicks = db.query(func.count(ClickEvent.id)).filter(
        ClickEvent.link_id == link_id
    ).scalar() or 0

    device_rows = db.query(
        ClickEvent.device_type,
        func.count(ClickEvent.id).label("count")
    ).filter(
        ClickEvent.link_id == link_id
    ).group_by(ClickEvent.device_type).all()

    browser_rows = db.query(
        ClickEvent.browser,
        func.count(ClickEvent.id).label("count")
    ).filter(
        ClickEvent.link_id == link_id
    ).group_by(ClickEvent.browser).order_by(
        func.count(ClickEvent.id).desc()
    ).limit(5).all()

    referrer_rows = db.query(
        ClickEvent.referrer,
        func.count(ClickEvent.id).label("count")
    ).filter(
        ClickEvent.link_id == link_id
    ).group_by(ClickEvent.referrer).order_by(
        func.count(ClickEvent.id).desc()
    ).limit(5).all()

    hourly_rows = db.query(
        extract('hour', ClickEvent.clicked_at).label("hour"),
        func.count(ClickEvent.id).label("count")
    ).filter(
        ClickEvent.link_id == link_id
    ).group_by("hour").order_by("hour").all()

    hourly = {int(r.hour): r.count for r in hourly_rows}
    hourly_data = [
        {"hour": h, "clicks": hourly.get(h, 0)}
        for h in range(24)
    ]

    return {
        "total_clicks": total_clicks,
        "devices": [
            {"device": r.device_type or "unknown", "count": r.count}
            for r in device_rows
        ],
        "browsers": [
            {"browser": r.browser or "unknown", "count": r.count}
            for r in browser_rows
        ],
        "referrers": [
            {"referrer": r.referrer or "direct", "count": r.count}
            for r in referrer_rows
        ],
        "hourly": hourly_data,
    }