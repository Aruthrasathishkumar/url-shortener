from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from app.core.database import Base

class BioLink(Base):
    __tablename__ = "bio_links"

    id = Column(Integer, primary_key=True, autoincrement=True)
    bio_page_id = Column(Integer, ForeignKey("bio_pages.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    url = Column(Text, nullable=False)
    display_order = Column(Integer, default=0)
    icon = Column(String(50), nullable=True)
    click_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)