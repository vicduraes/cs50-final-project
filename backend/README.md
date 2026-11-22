# CultureTrack — Backend (FastAPI)

REST API for CultureTrack: Google sign-in (exchanges a Google ID token for an API-issued JWT), a SQLite database with Alembic migrations and, in upcoming sprints, the CRUD for cultural entries.

**Stack:** Python 3.10+ · FastAPI · SQLAlchemy 2 · Alembic · SQLite · pytest

---

## Run the API locally (shortcut)

Prerequisite: **Python 3.10 or newer** (`python3 --version`). The project uses type syntax such as `list[str]` and `str | None`, which does not exist in Python 3.8/3.9.

```bash
cd backend
make setup      # creates the .venv, installs dependencies and creates the .env
# edit backend/.env (see "Environment variables" below)
make migrate    # creates culturetrack.db with the tables
make dev        # API at http://localhost:8000
```

Interactive docs (Swagger): **http://localhost:8000/docs**

You don't need to activate the virtual environment: the `make` commands already use `.venv/bin/python`.

### Available commands

| Command                         | What it does                                                                |
| ------------------------------- | --------------------------------------------------------------------------- |
| `make help`                     | Lists all commands                                                          |
| `make setup`                    | Creates the venv, installs dependencies, creates the `.env`                 |
| `make dev`                      | Starts the API with auto-reload (`PORT=9000 make dev` to change the port)   |
| `make migrate`                  | Applies pending migrations                                                  |
| `make revision m="description"` | Generates a migration after you change `app/models.py`                      |
| `make downgrade`                | Reverts the last migration                                                  |
| `make test`                     | Runs the test suite                                                         |
| `make db-reset`                 | Deletes the local database and recreates the tables (asks for confirmation) |

> `make` ships with Linux and macOS. On Windows, use WSL or the manual commands below.

### Without `make` (manual commands)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # Windows: copy .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

---

## Environment variables

The backend reads `backend/.env` (or a `.env` at the project root). The template is in `.env.example`.

| Variable             | Required | Description                                                                                                                                                                        |
| -------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`   | **yes**  | Google OAuth Client ID. It **must be identical** to the one in `frontend/.env.local`: the API checks it against the token's `aud` claim, and if they differ the login returns 401. |
| `JWT_SECRET_KEY`     | **yes**  | Secret used to sign the API's JWT. Generate one with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.                                                               |
| `DATABASE_URL`       | no       | Default: `sqlite:///./culturetrack.db`. In production, a PostgreSQL URL.                                                                                                           |
| `JWT_EXPIRE_MINUTES` | no       | JWT lifetime. Default: 10080 (7 days).                                                                                                                                             |
| `JWT_ALGORITHM`      | no       | Default: `HS256`.                                                                                                                                                                  |
| `CORS_ORIGINS`       | no       | Allowed origins, comma-separated. Default: `http://localhost:3000`.                                                                                                                |

The `.env` file contains secrets and **must never be committed** (it is already in `.gitignore`). Only `.env.example` is versioned.

The frontend variables (`NEXTAUTH_*`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL`) live in `frontend/.env.local`; the backend doesn't use any of them.

---

## Testing

```bash
make test
```

The tests use an in-memory SQLite database and mock the Google token verification, so they never touch your `culturetrack.db` and need no internet connection.

Quick manual checks, with the API running:

```bash
curl http://localhost:8000/health
# {"status":"ok"}

curl -i -X POST http://localhost:8000/auth/callback \
  -H "Content-Type: application/json" -d '{"id_token":"invalid"}'
# HTTP 401 — invalid Google token
```

The full login flow (with a real Google token) is tested through the frontend: go to `http://localhost:3000/login` and check that your user shows up in the `users` table.

---

## Routes

| Method         | Route                             | Description                                                                      | Status   |
| -------------- | --------------------------------- | -------------------------------------------------------------------------------- | -------- |
| GET            | `/health`                         | Checks that the API is up                                                        | ✅       |
| POST           | `/auth/callback`                  | Receives the Google `id_token`, creates/updates the user and returns the API JWT | ✅       |
| GET/POST       | `/entries`                        | List (filters + pagination) and create entries                                   | Sprint 2 |
| GET/PUT/DELETE | `/entries/{id}`                   | Detail, update and delete                                                        | Sprint 2 |
| GET            | `/entries/calendar?month=YYYY-MM` | Entries grouped by day                                                           | Sprint 2 |
| GET            | `/stats`                          | Totals by type, average rating and streak                                        | Sprint 2 |

Private routes use the `Authorization: Bearer <JWT>` header and the `get_current_user` dependency (`app/deps.py`).

---

## Migrations

Whenever you change `app/models.py`:

```bash
make revision m="add field X"   # generates the file in alembic/versions/
# review the generated file before applying it
make migrate
```

`env.py` uses `render_as_batch`, which is required because SQLite doesn't support every `ALTER TABLE` operation.

---

## Project structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app, CORS and router registration
│   ├── config.py        # environment variables (pydantic-settings)
│   ├── database.py      # SQLAlchemy engine, session and Base
│   ├── models.py        # tables: users, culture_entries
│   ├── schemas.py       # Pydantic request/response models
│   ├── security.py      # API JWT creation and validation
│   ├── google.py        # Google ID token verification
│   ├── deps.py          # get_current_user (route protection)
│   └── routers/auth.py  # POST /auth/callback
├── alembic/             # migrations (versions/0001_initial_schema.py)
├── tests/               # pytest
├── Makefile             # shortcuts (make dev, make test...)
├── requirements.txt
└── .env.example
```

---

## Troubleshooting

| Symptom                                                                       | Cause and fix                                                                                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TypeError: 'type' object is not subscriptable`                               | The venv was created with Python 3.8/3.9. Delete `.venv` and run `make setup` with Python 3.10+.                    |
| `ValidationError ... Field required` (`jwt_secret_key` or `google_client_id`) | The `.env` file is missing or incomplete. Run `make env` and fill it in.                                            |
| `no such table: users`                                                        | You forgot to run `make migrate`.                                                                                   |
| `ModuleNotFoundError: No module named 'app'`                                  | You're not inside the `backend/` folder.                                                                            |
| Login redirects back to `/login` with `ApiAuthFailed`                         | API is down, or `GOOGLE_CLIENT_ID` differs between frontend and backend. Check the `make dev` log.                  |
| `make: *** missing separator`                                                 | The Makefile requires a TAB (not spaces) at the start of command lines. Check that your editor didn't convert them. |
