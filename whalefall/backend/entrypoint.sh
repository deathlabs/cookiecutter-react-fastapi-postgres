#!/usr/bin/env sh

set -e

alembic -c whalefall/alembic.ini upgrade head
exec uvicorn whalefall.main:app --host 0.0.0.0 --port 8000
