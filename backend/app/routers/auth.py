from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import google
from app.database import get_db
from app.models import User
from app.schemas import GoogleCallbackRequest, TokenResponse, UserOut
from app.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/callback", response_model=TokenResponse)
def auth_callback(body: GoogleCallbackRequest, db: Session = Depends(get_db)):
    """Troca o ID token do Google (enviado pelo NextAuth) por um JWT da API.
    Cria o usuário no primeiro login; nos seguintes, atualiza nome/foto."""
    try:
        claims = google.verify_google_token(body.id_token)
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token do Google inválido")

    email = claims.get("email")
    if not email or not claims.get("email_verified"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "E-mail Google não verificado")

    name = claims.get("name") or email.split("@")[0]
    avatar = claims.get("picture")

    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(email=email, name=name, avatar_url=avatar)
        db.add(user)
    else:
        user.name = name
        user.avatar_url = avatar
    db.commit()
    db.refresh(user)

    token, expires_in = create_access_token(user.id)
    return TokenResponse(
        access_token=token, expires_in=expires_in, user=UserOut.model_validate(user)
    )
