from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.redis_client import get_cached_url, cache_url, invalidate_cache
from app.models.link import Link
from app.schemas.link import LinkCreateRequest, LinkResponse
from app.services.base62 import encode
from app.services.link_service import check_expiry
from app.services.analytics_service import log_click_event, get_analytics

router = APIRouter(tags=["Links"])

def get_current_user_id(request: Request) -> int:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])


@router.post("/links", response_model=LinkResponse, status_code=201)
def create_link(
    request_data: LinkCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)

    if request_data.custom_code:
        existing = db.query(Link).filter(
            Link.short_code == request_data.custom_code
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Custom code already taken")
        short_code = request_data.custom_code
    else:
        short_code = None

    expires_at = request_data.expires_at
    if request_data.expire_days and request_data.expire_days > 0:
        expires_at = datetime.utcnow() + timedelta(days=request_data.expire_days)

    new_link = Link(
        user_id=user_id,
        short_code=short_code or "temp",
        original_url=str(request_data.original_url),
        max_clicks=request_data.max_clicks,
        expires_at=expires_at,
        is_one_time=request_data.is_one_time,
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    if not request_data.custom_code:
        new_link.short_code = encode(new_link.id)
        db.commit()
        db.refresh(new_link)

    cache_url(new_link.short_code, new_link.original_url)

    return LinkResponse(
        id=new_link.id,
        short_code=new_link.short_code,
        original_url=new_link.original_url,
        short_url=f"http://localhost:8000/{new_link.short_code}",
        max_clicks=new_link.max_clicks,
        click_count=new_link.click_count,
        expires_at=new_link.expires_at,
        is_one_time=new_link.is_one_time,
        is_active=new_link.is_active,
        created_at=new_link.created_at,
    )


@router.get("/links")
def get_user_links(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    links = db.query(Link).filter(
        Link.user_id == user_id
    ).order_by(Link.created_at.desc()).all()

    return [
        LinkResponse(
            id=l.id,
            short_code=l.short_code,
            original_url=l.original_url,
            short_url=f"http://localhost:8000/{l.short_code}",
            max_clicks=l.max_clicks,
            click_count=l.click_count,
            expires_at=l.expires_at,
            is_one_time=l.is_one_time,
            is_active=l.is_active,
            created_at=l.created_at,
        )
        for l in links
    ]


@router.get("/links/{link_id}/analytics")
def get_link_analytics(
    link_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    link = db.query(Link).filter(
        Link.id == link_id,
        Link.user_id == user_id
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return get_analytics(db, link_id)


@router.delete("/links/{link_id}", status_code=200)
def delete_link(
    link_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    link = db.query(Link).filter(
        Link.id == link_id,
        Link.user_id == user_id
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    invalidate_cache(link.short_code)
    db.delete(link)
    db.commit()
    return {"message": "Link deleted"}


def record_click(link_id: int, ua: str, referrer: str, ip: str, db: Session):
    link = db.query(Link).filter(Link.id == link_id).first()
    if link:
        link.click_count += 1
        db.commit()
    log_click_event(db, link_id, ua, referrer, ip)


@router.get("/{short_code}")
def redirect_link(
    short_code: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    ua = request.headers.get("user-agent", "")
    referrer = request.headers.get("referer", "")
    ip = request.client.host if request.client else ""

    cached_url = get_cached_url(short_code)

    if cached_url:
        link = db.query(Link).filter(Link.short_code == short_code).first()
        if not link or not check_expiry(link):
            invalidate_cache(short_code)
            raise HTTPException(status_code=410, detail="Link expired or inactive")
        background_tasks.add_task(record_click, link.id, ua, referrer, ip, db)
        if link.is_one_time:
            link.is_active = False
            db.commit()
            invalidate_cache(short_code)
        return RedirectResponse(url=cached_url, status_code=302)

    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    if not check_expiry(link):
        raise HTTPException(status_code=410, detail="Link expired or inactive")

    cache_url(short_code, link.original_url)
    background_tasks.add_task(record_click, link.id, ua, referrer, ip, db)

    if link.is_one_time:
        link.is_active = False
        db.commit()
        invalidate_cache(short_code)

    return RedirectResponse(url=link.original_url, status_code=302)