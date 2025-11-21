# How to Switch to the React + Node.js Stack

## Current Situation

- ✅ New React + Node.js stack is **fully built and ready**
- ❌ Flask app is still running via the "Start application" workflow
- 🎯 Need to update the workflow to run the new stack instead

## Option 1: Update the Workflow (Recommended)

### Step 1: Stop Current Workflow
Click the "Stop" button on the "Start application" workflow in the Replit interface.

### Step 2: Update .replit File
Edit the `.replit` file and change the workflow command:

**Find this section:**
```toml
[[workflows.workflow]]
name = "Start application"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"
waitForPort = 5000
```

**Replace with:**
```toml
[[workflows.workflow]]
name = "Start application"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "bash start-new-stack.sh"
waitForPort = 5000
```

### Step 3: Restart the Workflow
Click the "Run" button to start the new React + Node.js stack.

## Option 2: Manual Start (Quick Test)

If you want to test the new stack before updating the workflow:

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Then visit your app - the React frontend will be on port 5000.

## Option 3: Use the Launcher Script

Run the all-in-one launcher:
```bash
bash start-new-stack.sh
```

This will:
1. Kill any existing processes on ports 3001 and 5000
2. Start the backend on port 3001
3. Start the frontend on port 5000
4. Show you logs from both servers

## What You'll See

Once started, you should see:
- **Backend API** running on port 3001
- **Frontend App** running on port 5000 (replacing Flask)
- New React login page with Altron branding
- Modern dashboard with statistics
- All WFM24/7 features available

## Verification Checklist

✅ Backend health check: `curl http://localhost:3001/health`  
✅ Frontend loads: Open port 5000 in browser  
✅ Login page appears with Altron branding  
✅ Can log in with existing credentials  
✅ Dashboard shows real data  

## Rollback to Flask

If you need to go back to Flask:

1. Stop the new stack (Ctrl+C or kill processes)
2. Revert the `.replit` file changes
3. Restart the workflow

All your data is safe - no database changes were made!

## Need Help?

If you encounter issues:
1. Check `/tmp/new-stack.log` for startup errors
2. Verify ports 3001 and 5000 are not in use
3. Ensure environment variables are set (especially `DATABASE_URL` and `JWT_SECRET`)
4. Check that npm dependencies are installed in both `backend/` and `frontend/`

## Summary

The new React + Node.js stack is **complete and production-ready**. You just need to update which application the workflow starts. The simplest way is to edit `.replit` and change the workflow command to run `start-new-stack.sh` instead of `gunicorn`.
