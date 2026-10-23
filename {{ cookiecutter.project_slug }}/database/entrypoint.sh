#!/usr/bin/env sh

set -e

# Initialize Postgres.
if [ ! -f "/var/lib/postgresql/data/PG_VERSION" ]; then
  # Create the prerequisite databases.
  password_file="$(mktemp /tmp/initdb-password.XXXXXX)"
  cleanup_password_file() {
    rm -f "$password_file"
  }
  trap cleanup_password_file EXIT HUP INT TERM
  chmod 600 "$password_file"
  printf '%s\n' "$PGPASSWORD" >"$password_file"

  initdb \
    -D /var/lib/postgresql/data \
    -A md5 \
    --username="$PGUSER" \
    --pwfile="$password_file"
  cleanup_password_file
  trap - EXIT HUP INT TERM

  # Start Postgres as a background process.
  postgres -D /var/lib/postgresql/data &
  POSTGRES_PID=$!

  # Wait for Postgres to start.
  until pg_isready -h 127.0.0.1 -p 5432 -U "$PGUSER"; do
    sleep 1
  done

  # Create the app's database.
  createdb -U "$PGUSER" "$PGDATABASE"

  # Stop Postgres.
  kill "$POSTGRES_PID"
  wait "$POSTGRES_PID" 2>/dev/null || true
fi

# Configure Postgres to listen on all network interfaces.
echo "listen_addresses = '*'" >>/var/lib/postgresql/data/postgresql.conf

# Configure Postgres to authenticate every user of every database from every IP address using MD5.
echo "host all all 0.0.0.0/0 md5" >>/var/lib/postgresql/data/pg_hba.conf

# Start Postgres in the foreground.
exec postgres -D /var/lib/postgresql/data
