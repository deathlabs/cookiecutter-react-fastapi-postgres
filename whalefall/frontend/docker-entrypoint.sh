#!/bin/sh

set -eu

export FRONTEND_PORT="${FRONTEND_PORT:-5173}"

case "$FRONTEND_PORT" in
    *[!0-9]* | "")
        echo "FRONTEND_PORT must be an integer from 1024 through 65535." >&2
        exit 1
        ;;
esac

if [ "$FRONTEND_PORT" -lt 1024 ] || [ "$FRONTEND_PORT" -gt 65535 ]; then
    echo "FRONTEND_PORT must be an integer from 1024 through 65535." >&2
    exit 1
fi

envsubst '${FRONTEND_PORT}' \
    < /etc/nginx/templates/default.conf.template \
    > /var/lib/nginx/conf.d/default.conf

exec "$@"
