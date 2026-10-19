#!/usr/bin/env sh

set -e

exec uvicorn whalefall.main:app --host 0.0.0.0 --port 8000
