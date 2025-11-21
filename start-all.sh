#!/bin/bash
# Altron WFM24/7 - Start Both Backend and Frontend

# Use npx concurrently to run both servers  
npx concurrently --kill-others --names "BACKEND,FRONTEND" \
  -c "bgBlue.bold,bgGreen.bold" \
  "cd backend && PORT=3001 npx ts-node src/server.ts" \
  "cd frontend && npm run dev"
