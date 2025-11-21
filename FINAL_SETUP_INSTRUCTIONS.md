# ✅ Final Setup: Switch to React + Node.js Stack

## 🎯 ONE-STEP Solution

### Edit the `.replit` File

1. Click on the `.replit` file in your file tree
2. Find this section (around line 17):

```toml
[[workflows.workflow]]
name = "Start application"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"
waitForPort = 5000
```

3. **Replace `args = "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"`**

**With:** `args = "bash start-all.sh"`

So it looks like this:

```toml
[[workflows.workflow]]
name = "Start application"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "bash start-all.sh"
waitForPort = 5000
```

4. Click "Run" (or restart the workflow)

That's it! ✨

## What Happens Next

The `start-all.sh` script will:
1. Start the **backend** server on port 3001
2. Start the **frontend** server on port 5000 (replacing Flask)
3. Show color-coded logs from both servers
4. Auto-restart both if one crashes

## Verify It's Working

After the workflow starts, you should see:
- ✅ Colorful logs showing `[BACKEND]` and `[FRONTEND]`
- ✅ Backend API responding at http://localhost:3001
- ✅ New React interface on port 5000
- ✅ Altron blue login page

## Test the Login

1. Open your app (port 5000)
2. You should see the new React login page with Altron branding
3. Login with any existing user credentials
4. You'll be redirected to the new React dashboard

## Alternative: Test Without Changing .replit

If you want to test first before updating the workflow:

```bash
bash start-all.sh
```

This will run both servers manually so you can verify everything works.

## Troubleshooting

**"Port 5000 is already in use"**
- The Flask workflow is still running
- Stop the workflow first, then run the new stack

**"Cannot find module"**
- Run `npm install` in both `backend/` and `frontend/` directories

**"JWT_SECRET not set"**
- The backend/.env file should already have this set
- Verify with: `grep JWT_SECRET backend/.env`

## What's Different

| Before (Flask) | After (React + Node.js) |
|---------------|------------------------|
| Python/Flask server-rendered pages | React SPA + Node.js API |
| Session-based auth | JWT with HttpOnly cookies |
| SQLAlchemy ORM | Direct PostgreSQL queries |
| Jinja2 templates | React components |
| Single process | Two processes (backend + frontend) |

## Database

✅ **No changes needed!** 

The new stack uses the same PostgreSQL database with the same schema. All your data is preserved.

## Need to Rollback?

Just change `.replit` back to:
```toml
args = "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"
```

All your Flask code is still there, untouched.

---

**🚀 Ready to go! Just edit one line in `.replit` and click Run!**
