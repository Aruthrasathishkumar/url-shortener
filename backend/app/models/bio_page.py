from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class BioPage(Base):
    __tablename__ = "bio_pages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    bio_title = Column(String(100), nullable=True)
    bio_description = Column(Text, nullable=True)
    theme_color = Column(String(7), default="#6366f1")
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())