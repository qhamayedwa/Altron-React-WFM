#!/bin/bash
# TimeLogic AI - Setup and Start Script

echo "=========================================="
echo "🚀 TimeLogic AI - React + Node.js Stack"
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
  echo "✅ Backend dependencies found"
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
  echo "✅ Frontend dependencies found"
fi

echo ""
echo "=========================================="
echo "🚀 Starting servers..."
echo "=========================================="
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5000"
echo "=========================================="
echo ""

# Start both servers using concurrently
npx concurrently --kill-others --names "BACKEND,FRONTEND" \
  -c "bgBlue.bold,bgGreen.bold" \
  "cd backend && PORT=3001 npx ts-node src/server.ts" \
  "cd frontend && npm run dev"
