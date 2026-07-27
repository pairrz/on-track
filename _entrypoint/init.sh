#!/bin/bash
set -e
echo "---------------------------------------------"
echo "Setting up PostgreSQL database: $POSTGRES_DB"
echo "Creating application user: $POSTGRES_APP_USER"
echo "---------------------------------------------"

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -v app_user="$POSTGRES_APP_USER" \
  -v app_password="$POSTGRES_APP_PASSWORD" \
  -v db_name="$POSTGRES_DB" <<-'EOSQL'
    REVOKE CONNECT ON DATABASE :"db_name" FROM public;
    REVOKE ALL ON SCHEMA public FROM PUBLIC;

    CREATE USER :"app_user" WITH PASSWORD :'app_password';

    CREATE SCHEMA drizzle;

    GRANT ALL ON DATABASE :"db_name" TO :"app_user";
    GRANT ALL ON SCHEMA public TO :"app_user";
    GRANT ALL ON SCHEMA drizzle TO :"app_user";
EOSQL

echo "---------------------------------------------"
echo "Database setup complete."
echo "---------------------------------------------"