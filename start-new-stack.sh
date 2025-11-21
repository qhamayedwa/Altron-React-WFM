#!/bin/bash

echo "🚀 Starting Altron WFM24/7 - React + Node.js Stack"
echo "=================================================="

# Kill any existing processes on ports 3001 and 5000
echo "Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Start backend on port 3001
echo ""
echo "📦 Starting Backend (Port 3001)..."
cd backend
export PORT=3001
export NODE_ENV=development
npx ts-node src/server.ts &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    break
  fi
  sleep 1
done

# Start frontend on port 5000
echo ""
echo "🎨 Starting Frontend (Port 5000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers started successfully!"
echo "   - Backend API: http://localhost:3001"
echo "   - Frontend App: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
