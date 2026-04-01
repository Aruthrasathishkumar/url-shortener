from sqlalchemy import Column, BigInteger, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class ClickEvent(Base):
    __tablename__ = "click_events"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    link_id = Column(Integer, ForeignKey("links.id"), nullable=False, index=True)
    clicked_at = Column(TIMESTAMP, server_default=func.now(), index=True)
    device_type = Column(String(20), nullable=True)
    browser = Column(String(50), nullable=True)
    referrer = Column(String(255), nullable=True)
    country = Column(String(2), nullable=True)
    city = Column(String(100), nullable=True)
    ip_hash = Column(String(64), nullable=True)