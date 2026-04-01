import hashlib
import urllib.request
import json
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


def lookup_geo(ip: str) -> tuple:
    """Look up country and city from IP using free ip-api.com service.
    Returns (country_code, city) or (None, None) on failure.
    Skips private/local IPs gracefully."""
    if not ip or ip in ("127.0.0.1", "::1", "localhost", "0.0.0.0"):
        return None, None
    try:
        # ip-api.com free tier: 45 req/min, no key needed
        url = f"http://ip-api.com/json/{ip}?fields=status,countryCode,city"
        req = urllib.request.Request(url, headers={"User-Agent": "Pathly/1.0"})
        with urllib.request.urlopen(req, timeout=2) as resp:
            data = json.loads(resp.read().decode())
            if data.get("status") == "success":
                return data.get("countryCode"), data.get("city")
    except Exception:
        pass
    return None, None


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

    country, city = lookup_geo(ip)

    event = ClickEvent(
        link_id=link_id,
        device_type=device_type,
        browser=browser,
        referrer=referrer_parsed,
        ip_hash=ip_hash,
        country=country,
        city=city,
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

    # Geo/location analytics
    location_rows = db.query(
        ClickEvent.country,
        func.count(ClickEvent.id).label("count")
    ).filter(
        ClickEvent.link_id == link_id,
        ClickEvent.country.isnot(None)
    ).group_by(ClickEvent.country).order_by(
        func.count(ClickEvent.id).desc()
    ).limit(10).all()

    city_rows = db.query(
        ClickEvent.city,
        ClickEvent.country,
        func.count(ClickEvent.id).label("count")
    ).filter(
        ClickEvent.link_id == link_id,
        ClickEvent.city.isnot(None)
    ).group_by(ClickEvent.city, ClickEvent.country).order_by(
        func.count(ClickEvent.id).desc()
    ).limit(5).all()

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
        "locations": [
            {"country": r.country, "count": r.count}
            for r in location_rows
        ],
        "cities": [
            {"city": r.city, "country": r.country, "count": r.count}
            for r in city_rows
        ],
    }
