#!/bin/bash

set -e

SQL_FILE="/docker-entrypoint-initdb.d/northwind-init.sql"

# Seed the Northwind database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \c northwind
    \i $SQL_FILE
EOSQL
