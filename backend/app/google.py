from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.config import get_settings


def verify_google_token(token: str) -> dict:
    """Valida o ID token do Google (assinatura, expiração e audience = nosso
    GOOGLE_CLIENT_ID). Devolve os claims. Levanta ValueError se inválido.
    Isolado neste módulo para ser fácil de mockar nos testes."""
    return google_id_token.verify_oauth2_token(
        token, google_requests.Request(), get_settings().google_client_id
    )
