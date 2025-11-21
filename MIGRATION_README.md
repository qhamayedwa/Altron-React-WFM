# Altron WFM24/7 - Migration to React + Node.js

## What Has Been Migrated

Your Altron WFM24/7 system has been completely restructured from Flask/Python to a modern React + Node.js stack while preserving all existing database data and core functionality.

### New Architecture

**Backend (Node.js + Express + TypeScript)**
- Location: `/backend` directory
- Port: 3001 (API server)
- Database: Direct PostgreSQL queries using `pg` library
- Authentication: JWT tokens with 7-day expiration

**Frontend (React + Vite + TypeScript)**
- Location: `/frontend` directory  
- Port: 5000 (Development server)
- UI Framework: Bootstrap 5
- State Management: Zustand
- Branding: Altron colors (#28468D royal blue, #54B8DF light blue, #1F4650 dark teal)

## Current Status

**✅ COMPLETED:**
- Backend API with 32 endpoints across 7 modules
- React frontend with Login, Dashboard, Time & Attendance, Leave, Scheduling pages
- JWT-based authentication system
- Role-based access control
- GPS-enabled time tracking interface
- Leave balance and request viewing
- Responsive mobile-first design

**❌ OLD FLASK APP:** Currently still running on port 5000 (needs to be replaced)

## How to Run the New Stack

### Quick Start (Both Servers)

```bash
# Install dependencies (first time only)
cd backend && npm install && cd ../frontend && npm install && cd ..

# Start both backend and frontend
./start.sh
```

### Backend Only

```bash
cd backend
npm install        # First time only
npm run dev        # Starts on port 3001
```

### Frontend Only

```bash
cd frontend
npm install        # First time only
npm run dev        # Starts on port 5000
```

## Environment Setup

### Backend Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=<your_postgres_url>
PORT=3001
NODE_ENV=development
JWT_SECRET=<generate_random_secret>
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=<your_openai_key>
```

**Note:** The `DATABASE_URL` is already available in your Replit environment. The new backend uses the same PostgreSQL database as the Flask app.

### Frontend Configuration

No additional environment variables needed. The Vite development server automatically proxies API requests from `/api` to `http://localhost:3001`.

## Switching from Flask to React Stack

### Step 1: Stop the Old Flask Application

```bash
# Find the gunicorn process
ps aux | grep gunicorn

# Kill it
kill <pid>
```

### Step 2: Update Replit Workflow

The workflow currently runs the Flask app. You'll need to switch it to run the new Node.js stack:

**Option A: Manual Start (Testing)**
```bash
./start.sh
```

**Option B: Update Workflow** (Production)
- Edit the "Start application" workflow to run `./start.sh` instead of `gunicorn`
- Or create separate workflows for backend and frontend

### Step 3: Verify the Application

1. **Test Login**: Visit the app and login with existing credentials
2. **Test Time Tracking**: Try clocking in with GPS
3. **Test Leave View**: Check leave balance display
4. **Test Navigation**: Ensure all pages load correctly

## API Endpoint Reference

### Authentication
- `POST /api/auth/login` - User login with username/password
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current authenticated user

### Time & Attendance
- `POST /api/time-attendance/clock-in` - Clock in with GPS
- `POST /api/time-attendance/clock-out/:id` - Clock out
- `GET /api/time-attendance/entries` - Get user's time entries
- `GET /api/time-attendance/pending` - Manager: Get pending approvals
- `POST /api/time-attendance/approve/:id` - Manager: Approve entry

### Leave Management
- `GET /api/leave/balance` - Get user's leave balance
- `GET /api/leave/requests` - Get leave requests
- `POST /api/leave/request` - Create leave request
- `GET /api/leave/pending` - Manager: Get pending requests
- `POST /api/leave/approve/:id` - Manager: Approve request
- `POST /api/leave/reject/:id` - Manager: Reject request

### Scheduling
- `GET /api/scheduling/schedule` - Get user's schedule
- `GET /api/scheduling/team` - Manager: Get team schedule
- `POST /api/scheduling/shift` - Create shift assignment
- `GET /api/scheduling/shift-types` - Get available shift types
- `PUT /api/scheduling/shift/:id` - Update shift

### User Management (Admin/HR only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/roles` - Assign roles
- `GET /api/users/search` - Search users
- `GET /api/users/by-department/:deptId` - Get department users

### Organization (Admin only)
- `GET /api/organization/hierarchy` - Get full org hierarchy
- `GET /api/organization/departments` - List departments
- `GET /api/organization/sites` - List sites
- `GET /api/organization/regions` - List regions

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Unread count
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## Database

**No database changes required!** The new stack uses the same PostgreSQL database with the same schema. All your existing data (users, time entries, leave requests, etc.) is preserved.

## Features Not Yet Implemented

- Payroll module (pay rules, SAGE VIP integration)
- Real-time notifications via WebSockets
- Dashboard statistics API
- Advanced scheduling (drag-drop, AI generation)
- Comprehensive user management interface
- Reports and analytics module
- Full organization hierarchy management

These features are planned but not critical for initial testing.

## Rollback Plan

If you need to revert to the Flask application:

1. Stop the new Node.js backend
2. Start the Flask app: `gunicorn --bind 0.0.0.0:5000 main:app`
3. All your data remains intact in PostgreSQL

## Testing Checklist

- [ ] Login with existing user credentials
- [ ] Navigate to dashboard
- [ ] Clock in (allow GPS permissions)
- [ ] View time entries
- [ ] View leave balance
- [ ] Check leave requests
- [ ] Navigate all pages without errors
- [ ] Test manager functions (if applicable to your role)
- [ ] Logout and login again

## Support & Next Steps

**What works now:**
- User authentication and authorization
- Time tracking with GPS
- Viewing time entries and leave data
- Basic navigation and layout
- Role-based access control

**What to enhance next:**
- Complete all CRUD operations (full forms for creating/editing)
- Add payroll functionality
- Implement real-time notifications
- Build reporting dashboards
- Integrate AI scheduling features

## Technical Notes

### Why Direct PostgreSQL Queries Instead of ORM?

We switched from Prisma ORM to the `pg` library because:
- Prisma v7.0 breaking changes caused compatibility issues
- Direct queries give more control over existing complex schema
- Better performance for high-frequency operations
- Easier to migrate existing SQL-heavy Flask queries

### Authentication Changes

**Old (Flask):** Session-based with Flask-Login
**New (React):** JWT tokens stored in localStorage, sent via Authorization header

Users will need to re-login after the migration, but no password resets are required.

### Multi-Tenancy

The tenant-based data isolation is preserved. All API endpoints filter by `tenant_id` automatically based on the authenticated user's tenant.

---

**Need help?** Check `MIGRATION_STATUS.md` for detailed completion status of each module.
