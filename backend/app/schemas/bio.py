from pydantic import BaseModel
from typing import Optional, List

class BioLinkCreate(BaseModel):
    title: str
    url: str
    icon: Optional[str] = None
    display_order: int = 0

class BioLinkResponse(BaseModel):
    id: int
    title: str
    url: str
    icon: Optional[str]
    display_order: int
    click_count: int
    is_active: bool

    class Config:
        from_attributes = True

class BioPageCreate(BaseModel):
    username: str
    bio_title: Optional[str] = None
    bio_description: Optional[str] = None
    theme_color: str = "#6366f1"
    avatar_url: Optional[str] = None

class BioPageUpdate(BaseModel):
    bio_title: Optional[str] = None
    bio_description: Optional[str] = None
    theme_color: Optional[str] = None
    avatar_url: Optional[str] = None

class BioPageResponse(BaseModel):
    id: int
    username: str
    bio_title: Optional[str]
    bio_description: Optional[str]
    theme_color: str
    avatar_url: Optional[str]
    is_active: bool
    links: List[BioLinkResponse] = []

    class Config:
        from_attributes = True