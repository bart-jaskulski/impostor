#!/bin/sh
# Abort on any error
set -e

echo "Running database migrations..."
node dist/migrate.js

echo "Starting the server..."
# Execute the command passed to the entrypoint (the Dockerfile's CMD)
exec "$@"
