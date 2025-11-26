#!/bin/bash
cd "$(dirname "$0")"

echo "Starting TimeLogic AI Frontend..."
echo "PORT: 5000"

# Start Vite dev server
npm run dev
