import os

# Precisa vir ANTES de importar `app` (Settings lê o ambiente no import).
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-test-secret-test-secret-123456")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
os.environ["DATABASE_URL"] = "sqlite://"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app import models  # noqa: F401


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )

    @event.listens_for(engine, "connect")
    def _fk(dbapi_conn, _):
        dbapi_conn.execute("PRAGMA foreign_keys=ON")

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)
    session = Session()
    yield session
    session.close()
    engine.dispose()


@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def fake_google(monkeypatch):
    """Substitui a verificação real do Google. Uso: fake_google(claims) ou fake_google(error=True)."""
    def _install(claims=None, error=False):
        def _verify(token):
            if error:
                raise ValueError("invalid token")
            return claims
        monkeypatch.setattr("app.google.verify_google_token", _verify)
    return _install
