import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class CultureType(str, enum.Enum):
    teatro = "teatro"
    cinema = "cinema"
    streaming = "streaming"
    livro = "livro"
    exposicao = "exposicao"
    danca = "danca"
    outro = "outro"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(1024))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    entries: Mapped[list["CultureEntry"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )


class CultureEntry(Base):
    __tablename__ = "culture_entries"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_entry_rating_range"),
        # Acelera o calendário e os filtros do feed (sempre filtram por usuário + data)
        Index("ix_entries_user_date", "user_id", "date"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[CultureType] = mapped_column(
        Enum(
            CultureType,
            native_enum=False,
            length=20,
            values_callable=lambda e: [m.value for m in e],
        )
    )
    title: Mapped[str] = mapped_column(String(255))
    date: Mapped[date] = mapped_column(Date)
    venue: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)
    rating: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="entries")
