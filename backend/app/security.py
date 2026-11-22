from datetime import datetime, timedelta, timezone

import jwt

from app.config import get_settings


def create_access_token(user_id: str) -> tuple[str, int]:
    """Gera o JWT da aplicação. Retorna (token, expires_in_segundos)."""
    s = get_settings()
    expires_in = s.jwt_expire_minutes * 60
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
    }
    return jwt.encode(payload, s.jwt_secret_key, algorithm=s.jwt_algorithm), expires_in


def decode_access_token(token: str) -> str:
    """Valida assinatura/expiração e devolve o user_id (claim `sub`).
    Levanta jwt.PyJWTError se inválido."""
    s = get_settings()
    payload = jwt.decode(
        token, s.jwt_secret_key, algorithms=[s.jwt_algorithm],
        options={"require": ["sub", "exp"]},
    )
    return payload["sub"]
