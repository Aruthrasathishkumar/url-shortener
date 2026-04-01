from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional

class LinkCreateRequest(BaseModel):
    original_url: str
    custom_code: Optional[str] = None
    max_clicks: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_one_time: bool = False

class LinkResponse(BaseModel):
    id: int
    short_code: str
    original_url: str
    short_url: str
    max_clicks: Optional[int]
    click_count: int
    expires_at: Optional[datetime]
    is_one_time: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True