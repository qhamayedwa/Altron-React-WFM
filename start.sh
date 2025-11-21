#!/bin/bash

# Start the backend server
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 3

# Start the frontend server
cd ../frontend  
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
