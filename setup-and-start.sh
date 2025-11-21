#!/bin/bash
# Altron WFM24/7 - Setup and Start Script

echo "=========================================="
echo "🚀 Altron WFM24/7 Setup & Start"
echo "=========================================="

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
  echo ""
  echo "📦 Installing backend dependencies..."
  cd backend
  npm install --legacy-peer-deps
  cd ..
  echo "✅ Backend dependencies installed"
else
  echo "✅ Backend dependencies already installed"
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
  echo ""
  echo "📦 Installing frontend dependencies..."
  cd frontend
  npm install --legacy-peer-deps
  cd ..
  echo "✅ Frontend dependencies installed"
else
  echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "=========================================="
echo "🚀 Starting servers..."
echo "=========================================="

# Start both servers using concurrently
npx concurrently --kill-others --names "BACKEND,FRONTEND" \
  -c "bgBlue.bold,bgGreen.bold" \
  "cd backend && PORT=3001 npx ts-node src/server.ts" \
  "cd frontend && npm run dev"
