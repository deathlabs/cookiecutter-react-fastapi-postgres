#!/bin/sh

set -eu

export FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export BACKEND_URL="${BACKEND_URL:-http://backend:8000}"

envsubst '${FRONTEND_PORT} ${BACKEND_URL}' \
    < /etc/nginx/templates/default.conf.template \
    > /var/lib/nginx/conf.d/default.conf

exec "$@"
