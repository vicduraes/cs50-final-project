# CultureTrack — backend shortcuts (the equivalent of `npm run ...` on the frontend)
# Usage: make <command>      Command list: make help
# No need to activate the venv: every command already uses .venv/bin/python.

PY      := .venv/bin/python
PORT    ?= 8000

.DEFAULT_GOAL := help
.PHONY: help setup env dev migrate revision downgrade test db-reset

help: ## List available commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

setup: ## Create the venv (Python 3.10+), install dependencies and create the .env
	@if command -v uv >/dev/null 2>&1; then \
	    uv venv --python 3.12 .venv && uv pip install -r requirements.txt; \
	else \
	    python3 -m venv .venv && $(PY) -m pip install -r requirements.txt; \
	fi
	@$(MAKE) --no-print-directory env
	@echo "\nDone. Fill in backend/.env, then run: make migrate && make dev"

env: ## Create .env from .env.example (never overwrites an existing one)
	@test -f .env && echo ".env already exists, keeping it." || (cp .env.example .env && echo ".env created. Fill in JWT_SECRET_KEY and GOOGLE_CLIENT_ID.")

dev: ## Start the API with auto-reload at http://localhost:8000 (PORT=9000 to change)
	$(PY) -m uvicorn app.main:app --reload --port $(PORT)

migrate: ## Apply pending migrations (alembic upgrade head)
	$(PY) -m alembic upgrade head

revision: ## Generate a migration after changing models.py: make revision m="description"
	@test -n "$(m)" || (echo 'Usage: make revision m="description"' && exit 1)
	$(PY) -m alembic revision --autogenerate -m "$(m)"

downgrade: ## Revert the last migration
	$(PY) -m alembic downgrade -1

test: ## Run the test suite (pytest)
	$(PY) -m pytest -q

db-reset: ## DELETE culturetrack.db and recreate the tables (dev only!)
	@read -p "This deletes all local data. Continue? [y/N] " r && [ "$$r" = "y" ]
	rm -f culturetrack.db
	$(PY) -m alembic upgrade head