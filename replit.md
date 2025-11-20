# WFM24/7 Workforce Management System

## Overview

WFM24/7 is a comprehensive workforce management platform built with Flask and PostgreSQL, designed for 24/7 operations with multi-tenant support. The system handles time tracking, employee scheduling, leave management, payroll processing, and organizational hierarchy management with South African business standards (ZAR currency, SAST timezone).

**Core Capabilities:**
- GPS-enabled time tracking with clock in/out functionality
- AI-powered scheduling optimization using OpenAI GPT-4o
- Hierarchical organization structure (Company → Region → Site → Department)
- Automated leave accrual and payroll calculations
- SAGE VIP Payroll integration for bidirectional data sync
- Role-based access control with granular permissions
- Mobile-responsive PWA interface

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Framework
- **Backend:** NestJS with TypeScript (migrated from Flask)
- **ORM:** Prisma (migrated from SQLAlchemy)
- **Authentication:** Passport.js with express-session (migrated from Flask-Login)
- **Frontend:** React + Vite + TypeScript with React Router v6 (migrated from Jinja2 templates)
- **UI Library:** Bootstrap 5 with responsive mobile-first design
- **State Management:** Zustand + React Query

### Data Architecture

**Organizational Hierarchy:**
```
Company (Multi-tenant top level)
  ↓
Region (Geographic divisions)
  ↓
Site (Physical locations)
  ↓
Department (Functional units with managers)
  ↓
User (Employees with roles)
```

**Role-Based Access Control:**
- `system_super_admin` - Cross-tenant system administration
- `Super User` - Full tenant access including admin functions
- `Manager` - Team management, approvals, reporting for managed departments
- `Employee` - Personal time tracking, leave requests, schedule viewing
- `Admin`, `HR`, `Payroll` - Specialized administrative roles

**Database Indexing Strategy:**
- Composite indexes on high-frequency query patterns (user_id + date, user_id + status)
- Single-column indexes on filter fields (department, is_active, status)
- Descending indexes for chronological ordering (clock_in_time DESC)
- Location-based indexes for GPS tracking queries

### Core Modules

**Time & Attendance (`routes.py`, `api.py`):**
- GPS location capture on clock in/out
- Automated break time tracking
- Status-based workflow (clocked_in → clocked_out → approved)
- Manager approval queue with bulk operations
- Real-time dashboard with role-filtered data

**AI Services (`server/src/ai/`):**
- OpenAI GPT-4o integration for workforce insights (`ai.service.ts`)
- Statistical fallback when OpenAI unavailable (`ai-fallback.service.ts`)
- Schedule optimization based on historical patterns
- Attendance trend analysis with punctuality scoring
- Payroll anomaly detection and cost analysis
- Natural language query interface
- API endpoints: `/ai/analyze-scheduling`, `/ai/generate-payroll-insights`, `/ai/analyze-attendance`, `/ai/suggest-schedule`, `/ai/natural-query`, `/ai/test-connection`

**Leave Management (`leave_management.py`):**
- Leave type configuration with accrual rules
- Automated monthly accrual engine (`automation_engine.py`)
- Multi-level approval workflows
- Leave balance tracking with expiration alerts
- Integration with time entries for paid leave

**Payroll Engine (`pay_rules.py`, `pay_rule_engine_service.py`):**
- Configurable pay rules with priority-based execution
- Overtime calculation (1.5x standard, 2.0x double time)
- Allowances, bonuses, and deductions processing
- Time entry validation and payroll calculation API
- South African Rand (ZAR) formatting throughout

**Scheduling (`ai_scheduling.py`):**
- Shift type configuration with start/end times
- Team calendar views with drag-drop (planned)
- Availability matching and conflict detection
- AI-powered schedule generation
- Mobile-optimized shift management

**Notification System (`notifications.py`):**
- Real-time notification delivery
- Priority-based categorization (low/medium/high/urgent)
- Action buttons with deep links
- Preference management per notification type
- Expiration and read status tracking

### Design Patterns

**Automation-First:**
- Monthly leave accrual runs automatically
- Notification triggers on system events
- Payroll calculations batch process time entries
- Zero manual intervention for routine tasks

**Standardization:**
- Consistent API response format across all endpoints
- Unified currency formatting (R prefix for ZAR)
- Timezone handling (SAST UTC+2)
- Role-based data filtering at query level

**Centralization:**
- Single source of truth for employee data
- Unified authentication across all modules
- Centralized pay code and department management
- Dashboard aggregation from all data sources

**Manager Efficiency:**
- Bulk approval operations for time/leave
- Team-filtered views with department scoping
- AI-generated insights for decision support
- One-click report generation

### Security & Data Isolation

**Authentication Flow:**
1. Login via username/password → Flask-Login session
2. Role verification via decorators (`@role_required`, `@super_user_required`)
3. Department-based data filtering for managers
4. Tenant isolation for multi-tenant deployments

**Data Access Rules:**
- Super Users: Full system access
- Managers: Department-scoped access via `get_managed_departments()`
- Employees: Personal data only
- API endpoints enforce same access rules as web UI

## External Dependencies

### Third-Party Services

**OpenAI API:**
- Model: `gpt-4o` (latest as of May 2024)
- Usage: Workforce analytics, schedule optimization, payroll insights
- Fallback: Statistical analysis when unavailable
- Configuration: `OPENAI_API_KEY` environment variable

**SAGE VIP Payroll Integration:**
- Connection: REST API with token authentication
- Endpoints: Employee sync, timesheet push, leave transfer, payroll calculation
- Configuration: `SAGE_VIP_BASE_URL`, `SAGE_VIP_API_KEY`, `SAGE_VIP_USERNAME`, `SAGE_VIP_PASSWORD`, `SAGE_VIP_COMPANY_DB`
- Data mapping: WFM fields → SAGE VIP fields with pay code translation

### Database

**PostgreSQL:**
- Primary datastore with SQLAlchemy ORM
- Connection pooling with pre-ping health checks
- Comprehensive indexing for scalability
- May be added during development if not present

### Python Packages

**Core Framework:**
- Flask - Web framework
- SQLAlchemy - ORM and database toolkit
- Flask-Login - User session management
- Flask-Migrate - Database migrations
- Flask-WTF - Form handling and CSRF protection

**Data Processing:**
- python-dateutil - Date/time manipulation
- Werkzeug - Password hashing and security utilities

**AI/ML:**
- openai - OpenAI API client for GPT-4o

**Deployment:**
- gunicorn - WSGI HTTP server for production
- python-dotenv - Environment variable management

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Flask session encryption key
- `OPENAI_API_KEY` - OpenAI API access (optional, fallback available)

**SAGE VIP Integration (Optional):**
- `SAGE_VIP_BASE_URL` - SAGE VIP server URL
- `SAGE_VIP_API_KEY` - API authentication key
- `SAGE_VIP_USERNAME` - SAGE VIP username
- `SAGE_VIP_PASSWORD` - SAGE VIP password
- `SAGE_VIP_COMPANY_DB` - Company database identifier

**Configuration:**
- `APP_NAME` - Application name (default: WFM24/7)
- `FLASK_DEBUG` - Debug mode toggle
- `PAYROLL_BASE_RATE` - Default hourly rate in ZAR
- `PAYROLL_OVERTIME_MULTIPLIER` - Overtime multiplier (default: 1.5)