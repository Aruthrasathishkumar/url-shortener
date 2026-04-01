from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.bio_page import BioPage
from app.models.bio_link import BioLink
from app.schemas.bio import (
    BioPageCreate, BioPageUpdate, BioPageResponse,
    BioLinkCreate, BioLinkResponse
)

router = APIRouter(tags=["Bio Pages"])

def get_current_user_id(request: Request) -> int:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])


@router.post("/bio", status_code=201)
def create_bio_page(
    data: BioPageCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)

    existing_user = db.query(BioPage).filter(
        BioPage.user_id == user_id
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="You already have a bio page")

    existing_username = db.query(BioPage).filter(
        BioPage.username == data.username
    ).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    bio = BioPage(
        user_id=user_id,
        username=data.username,
        bio_title=data.bio_title,
        bio_description=data.bio_description,
        theme_color=data.theme_color,
        avatar_url=data.avatar_url,
    )
    db.add(bio)
    db.commit()
    db.refresh(bio)
    return {"id": bio.id, "username": bio.username}


@router.get("/bio/me")
def get_my_bio(request: Request, db: Session = Depends(get_db)):
    user_id = get_current_user_id(request)
    bio = db.query(BioPage).filter(BioPage.user_id == user_id).first()
    if not bio:
        return None

    links = db.query(BioLink).filter(
        BioLink.bio_page_id == bio.id,
        BioLink.is_active == True
    ).order_by(BioLink.display_order).all()

    return {
        "id": bio.id,
        "username": bio.username,
        "bio_title": bio.bio_title,
        "bio_description": bio.bio_description,
        "theme_color": bio.theme_color,
        "avatar_url": bio.avatar_url,
        "is_active": bio.is_active,
        "links": [
            {
                "id": l.id,
                "title": l.title,
                "url": l.url,
                "icon": l.icon,
                "display_order": l.display_order,
                "click_count": l.click_count,
                "is_active": l.is_active,
            }
            for l in links
        ]
    }


@router.put("/bio/me")
def update_bio(
    data: BioPageUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    bio = db.query(BioPage).filter(BioPage.user_id == user_id).first()
    if not bio:
        raise HTTPException(status_code=404, detail="Bio page not found")

    if data.bio_title is not None:
        bio.bio_title = data.bio_title
    if data.bio_description is not None:
        bio.bio_description = data.bio_description
    if data.theme_color is not None:
        bio.theme_color = data.theme_color
    if data.avatar_url is not None:
        bio.avatar_url = data.avatar_url

    db.commit()
    db.refresh(bio)
    return {"message": "Bio page updated"}


@router.post("/bio/links", status_code=201)
def add_bio_link(
    data: BioLinkCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    bio = db.query(BioPage).filter(BioPage.user_id == user_id).first()
    if not bio:
        raise HTTPException(status_code=404, detail="Create a bio page first")

    link = BioLink(
        bio_page_id=bio.id,
        title=data.title,
        url=data.url,
        icon=data.icon,
        display_order=data.display_order,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return {"id": link.id, "title": link.title}


@router.delete("/bio/links/{link_id}")
def delete_bio_link(
    link_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = get_current_user_id(request)
    bio = db.query(BioPage).filter(BioPage.user_id == user_id).first()
    if not bio:
        raise HTTPException(status_code=404, detail="Bio page not found")

    link = db.query(BioLink).filter(
        BioLink.id == link_id,
        BioLink.bio_page_id == bio.id
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    db.delete(link)
    db.commit()
    return {"message": "Link deleted"}


@router.get("/@{username}", response_class=HTMLResponse)
def get_public_bio(username: str, db: Session = Depends(get_db)):
    bio = db.query(BioPage).filter(
        BioPage.username == username,
        BioPage.is_active == True
    ).first()
    if not bio:
        raise HTTPException(status_code=404, detail="Bio page not found")

    links = db.query(BioLink).filter(
        BioLink.bio_page_id == bio.id,
        BioLink.is_active == True
    ).order_by(BioLink.display_order).all()

    links_html = ""
    for l in links:
        links_html += f"""
        <a href="{l.url}" target="_blank" rel="noreferrer" class="link-btn">
            {l.title}
        </a>
        """

    initials = (bio.bio_title or username)[0].upper()

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>{bio.bio_title or username} | Pathly</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {{ margin:0; padding:0; box-sizing:border-box; }}
            body {{
                min-height: 100vh;
                background-color: #F9FAFB;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 56px 20px 40px;
                -webkit-font-smoothing: antialiased;
            }}
            .profile {{
                width: 100%;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
            }}
            .avatar {{
                width: 96px;
                height: 96px;
                border-radius: 50%;
                background: {bio.theme_color};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                font-weight: 700;
                color: white;
                margin-bottom: 16px;
                box-shadow: 0 4px 24px {bio.theme_color}33;
            }}
            .name {{
                font-size: 20px;
                font-weight: 700;
                color: #111827;
                text-align: center;
                letter-spacing: -0.02em;
            }}
            .handle {{
                font-size: 14px;
                color: #9CA3AF;
                margin-top: 4px;
            }}
            .bio-text {{
                font-size: 14px;
                color: #6B7280;
                text-align: center;
                margin-top: 12px;
                line-height: 1.6;
                max-width: 320px;
            }}
            .links {{
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-top: 32px;
            }}
            .link-btn {{
                display: block;
                width: 100%;
                padding: 14px 20px;
                background: white;
                border: 1.5px solid {bio.theme_color}30;
                border-radius: 14px;
                color: {bio.theme_color};
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                transition: all 0.2s ease;
                letter-spacing: -0.01em;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            }}
            .link-btn:hover {{
                background: {bio.theme_color}08;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            }}
            .link-btn:active {{
                transform: scale(0.98);
            }}
            .empty {{
                color: #9CA3AF;
                font-size: 14px;
                text-align: center;
                padding: 24px 0;
            }}
            .footer {{
                margin-top: 48px;
                font-size: 11px;
                color: #D1D5DB;
                letter-spacing: 0.02em;
            }}
            .footer span {{
                color: #9CA3AF;
                font-weight: 600;
            }}
        </style>
    </head>
    <body>
        <div class="profile">
            <div class="avatar">{initials}</div>
            <p class="name">{bio.bio_title or username}</p>
            <p class="handle">@{username}</p>
            {f'<p class="bio-text">{bio.bio_description}</p>' if bio.bio_description else ''}
            <div class="links">
                {links_html if links_html else '<p class="empty">No links yet</p>'}
            </div>
        </div>
        <p class="footer">Powered by <span>Pathly</span></p>
    </body>
    </html>
    """
    return HTMLResponse(content=html)