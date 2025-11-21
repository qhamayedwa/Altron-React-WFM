# Altron WFM24/7 - React + Node.js Stack

## 🎉 Migration Complete!

Your Altron WFM24/7 system has been successfully migrated from Flask/Python to React/Node.js with **100% feature parity**.

## 📦 What's Included

### Backend (Node.js + Express)
- **42 API endpoints** across 10 modules
- Secure JWT authentication with HttpOnly cookies
- Role-based access control
- Direct PostgreSQL integration
- **Location:** `/backend`

### Frontend (React + Vite)
- **10 pages** with full functionality
- Altron official branding
- Responsive Bootstrap 5 design
- Real-time updates
- **Location:** `/frontend`

## 🚀 Quick Start

### All-in-One (Easiest)
```bash
bash start-new-stack.sh
```

### Manual Start
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

## 📖 Documentation

- **SWITCH_TO_NEW_STACK.md** - How to replace Flask with the new stack
- **MIGRATION_COMPLETE.md** - Full migration details
- **MIGRATION_STATUS.md** - Feature completion checklist

## 🔒 Security

- ✅ No hard-coded secrets
- ✅ HttpOnly cookies (XSS protection)
- ✅ SQL injection protection
- ✅ CORS configured
- ✅ JWT with secure secret management

## 💾 Database

- **No changes required** - Uses your existing PostgreSQL database
- All 29 tables preserved
- All data intact

## 🌟 Features

| Module | Status |
|--------|--------|
| Authentication | ✅ Complete |
| Dashboard | ✅ Complete |
| Time & Attendance | ✅ Complete |
| Leave Management | ✅ Complete |
| Scheduling | ✅ Complete |
| Payroll | ✅ Complete |
| Reports | ✅ Complete |
| User Management | ✅ Complete |
| Organization | ✅ Complete |
| Notifications | ✅ Complete |

## 📞 API Endpoints

**Base URL:** `http://localhost:3001/api`

- `/auth` - Login, logout, user info
- `/dashboard` - Statistics, activity
- `/time-attendance` - Clock in/out, entries, approvals
- `/leave` - Requests, balances, approvals
- `/scheduling` - Shifts, assignments
- `/payroll` - Calculations, payslips
- `/reports` - Time, leave, payroll reports
- `/users` - User CRUD, roles
- `/organization` - Hierarchy management
- `/notifications` - Notifications, unread count

## 🎨 Frontend Routes

- `/login` - Authentication
- `/` - Dashboard
- `/time-attendance` - Time tracking
- `/leave` - Leave management
- `/scheduling` - Schedule view
- `/payroll` - Payroll (admin/payroll only)
- `/reports` - Reports (manager+)
- `/users` - User admin (admin/HR only)
- `/organization` - Org hierarchy (admin only)
- `/profile` - User profile

## ⚙️ Environment Variables

### Backend (.env)
```env
DATABASE_URL=<your_postgres_url>
PORT=3001
NODE_ENV=development
JWT_SECRET=<your_secret_key>
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=<optional>
```

### Frontend
No configuration needed - Vite proxies API calls automatically.

## 🧪 Testing

```bash
# Backend health check
curl http://localhost:3001/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

## 📊 Tech Stack

- **Backend:** Node.js 20, Express 4, TypeScript 5
- **Frontend:** React 18, Vite 7, TypeScript 5
- **UI:** Bootstrap 5, React-Bootstrap, Lucide React
- **State:** Zustand
- **Database:** PostgreSQL (via `pg`)
- **Auth:** JWT + bcrypt

## 🔄 Next Steps

1. Read `SWITCH_TO_NEW_STACK.md` to replace Flask
2. Test all features with your data
3. Deploy to production when ready

## 💡 Tips

- Use the Replit console to view live logs
- Check browser DevTools for frontend errors
- Backend logs show all API requests
- Hot reload works for both backend and frontend

---

**Built with ❤️  by Altron Team**
