#!/bin/bash
cd "$(dirname "$0")"

echo "Starting Altron WFM24/7 Frontend..."
echo "PORT: 5000"

# Start Vite dev server
npm run dev
