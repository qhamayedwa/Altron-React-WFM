#!/bin/bash
cd "$(dirname "$0")"

echo "Starting TimeLogic AI Backend..."
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "PORT: ${PORT:-3001}"

# Use ts-node to run TypeScript directly
npx ts-node src/server.ts
