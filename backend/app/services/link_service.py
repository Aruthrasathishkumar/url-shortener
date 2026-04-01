from sqlalchemy.orm import Session
from datetime import datetime
from app.models.link import Link
from app.services.base62 import encode

def check_expiry(link: Link) -> bool:
    if not link.is_active:
        return False
    if link.expires_at and datetime.utcnow() > link.expires_at:
        return False
    if link.max_clicks and link.click_count >= link.max_clicks:
        return False
    if link.is_one_time and link.click_count > 0:
        return False
    return True

def generate_short_code(db: Session, link_id: int) -> str:
    code = encode(link_id)
    existing = db.query(Link).filter(Link.short_code == code).first()
    if existing:
        code = encode(link_id + 1000000)
    return code