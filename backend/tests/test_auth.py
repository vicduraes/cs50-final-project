import jwt
from sqlalchemy import select

from app.config import get_settings
from app.models import CultureEntry, CultureType, User
from app.security import decode_access_token

GOOGLE_CLAIMS = {
    "email": "marina@gmail.com",
    "email_verified": True,
    "name": "Marina Souza",
    "picture": "https://lh3.googleusercontent.com/a/marina",
}


def test_primeiro_login_cria_usuario_e_emite_jwt(client, db_session, fake_google):
    fake_google(GOOGLE_CLAIMS)

    r = client.post("/auth/callback", json={"id_token": "qualquer"})

    assert r.status_code == 200
    body = r.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "marina@gmail.com"
    assert body["user"]["name"] == "Marina Souza"
    user = db_session.scalar(select(User))
    assert user is not None and user.id == body["user"]["id"]
    # o JWT emitido identifica o usuário criado
    assert decode_access_token(body["access_token"]) == user.id


def test_segundo_login_reaproveita_usuario_e_atualiza_perfil(client, db_session, fake_google):
    fake_google(GOOGLE_CLAIMS)
    first = client.post("/auth/callback", json={"id_token": "x"}).json()

    fake_google({**GOOGLE_CLAIMS, "name": "Marina S. Lima"})
    second = client.post("/auth/callback", json={"id_token": "x"}).json()

    assert second["user"]["id"] == first["user"]["id"]
    assert second["user"]["name"] == "Marina S. Lima"
    assert len(db_session.scalars(select(User)).all()) == 1


def test_token_google_invalido_retorna_401(client, db_session, fake_google):
    fake_google(error=True)
    r = client.post("/auth/callback", json={"id_token": "lixo"})
    assert r.status_code == 401
    assert db_session.scalar(select(User)) is None


def test_email_nao_verificado_retorna_401(client, fake_google):
    fake_google({**GOOGLE_CLAIMS, "email_verified": False})
    assert client.post("/auth/callback", json={"id_token": "x"}).status_code == 401


def test_body_sem_id_token_retorna_422(client):
    assert client.post("/auth/callback", json={}).status_code == 422


def test_jwt_adulterado_e_rejeitado():
    forged = jwt.encode({"sub": "u1", "exp": 9999999999}, "outro-segredo-" * 4, algorithm="HS256")
    try:
        decode_access_token(forged)
        assert False, "deveria ter falhado"
    except jwt.PyJWTError:
        pass


# ── Schema ──────────────────────────────────────────────────────────
def test_rating_fora_de_1_a_5_e_rejeitado_pelo_banco(db_session):
    import datetime
    import pytest
    from sqlalchemy.exc import IntegrityError

    u = User(email="a@a.com", name="A")
    db_session.add(u)
    db_session.commit()
    db_session.add(CultureEntry(user_id=u.id, type=CultureType.livro, title="X",
                                date=datetime.date(2026, 11, 1), rating=6))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_deletar_usuario_apaga_seus_registros(db_session):
    import datetime

    u = User(email="b@b.com", name="B")
    db_session.add(u)
    db_session.commit()
    db_session.add(CultureEntry(user_id=u.id, type=CultureType.teatro, title="A Gaivota",
                                date=datetime.date(2026, 11, 1), rating=5))
    db_session.commit()

    db_session.delete(u)
    db_session.commit()

    assert db_session.scalar(select(CultureEntry)) is None
