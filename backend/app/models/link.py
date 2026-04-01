from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Link(Base):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    short_code = Column(String(20), unique=True, nullable=False, index=True)
    original_url = Column(Text, nullable=False)
    max_clicks = Column(Integer, nullable=True, default=None)
    click_count = Column(Integer, default=0, nullable=False)
    expires_at = Column(DateTime, nullable=True, default=None)
    is_one_time = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())