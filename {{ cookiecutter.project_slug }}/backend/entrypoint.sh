#!/usr/bin/env sh

set -e

alembic -c {{ cookiecutter.project_slug }}/alembic.ini upgrade head
exec uvicorn {{ cookiecutter.project_slug }}.main:app --host 0.0.0.0 --port 8000
