#!/usr/bin/env python3
"""
Altron WFM24/7 - React + Node.js Stack Launcher
Starts both backend and frontend servers
"""
import subprocess
import os
import sys
import time

def main():
    print("=" * 60)
    print("🚀 Altron WFM24/7 - React + Node.js Stack")
    print("=" * 60)
    
    # Start backend
    print("\n📦 Starting Backend (Port 3001)...")
    backend_env = os.environ.copy()
    backend_env['PORT'] = '3001'
    
    backend = subprocess.Popen(
        ['npx', 'ts-node', 'src/server.ts'],
        cwd='backend',
        env=backend_env
    )
    
    # Wait for backend
    print("⏳ Waiting for backend...")
    time.sleep(5)
    
    # Start frontend
    print("\n🎨 Starting Frontend (Port 5000)...")
    frontend = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd='frontend'
    )
    
    print("\n✅ Servers started!")
    print("   Backend:  http://localhost:3001")
    print("   Frontend: http://localhost:5000")
    
    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        backend.terminate()
        frontend.terminate()

if __name__ == '__main__':
    main()
