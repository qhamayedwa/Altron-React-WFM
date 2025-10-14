# WFM24/7 Workforce Management System
## Functional Specification Document

**Version:** 1.0  
**Date:** October 14, 2025  
**System Name:** WFM24/7  
**Platform:** Web-based Application (PWA)  

---

## 1. Executive Summary

WFM24/7 is a comprehensive workforce management platform designed for 24/7 operations with multi-tenant support. The system provides end-to-end workforce management capabilities including time tracking, employee scheduling, leave management, payroll processing, and organizational hierarchy management, all optimized for South African business standards.

### 1.1 Key Features
- GPS-enabled time tracking with clock in/out functionality
- AI-powered scheduling optimization using OpenAI GPT-4o
- Hierarchical organization structure management
- Automated leave accrual and payroll calculations
- SAGE VIP Payroll integration for bidirectional data sync
- Role-based access control with granular permissions
- Mobile-responsive PWA interface

---

## 2. System Overview

### 2.1 Purpose
WFM24/7 streamlines workforce management operations by providing a centralized platform for time tracking, scheduling, leave management, and payroll processing. The system eliminates manual processes through automation and provides AI-powered insights for decision-making.

### 2.2 Scope
The system manages the complete employee lifecycle from onboarding to payroll, including:
- Employee data management
- Time and attendance tracking
- Leave request and approval workflows
- Shift scheduling and rostering
- Payroll calculation and processing
- Organizational hierarchy management
- Real-time reporting and analytics

### 2.3 Target Users
- **System Administrators:** Multi-tenant platform management
- **Super Users:** Full organizational access
- **HR Personnel:** Employee management and compliance
- **Payroll Officers:** Payroll processing and reporting
- **Managers:** Team oversight and approvals
- **Employees:** Self-service time tracking and leave requests

---

## 3. Organizational Structure

### 3.1 Hierarchy Model
```
Company (Multi-tenant top level)
  ↓
Region (Geographic divisions)
  ↓
Site (Physical locations)
  ↓
Department (Functional units)
  ↓
User/Employee (Workforce members)
```

### 3.2 Entity Definitions

#### 3.2.1 Company
- Top-level tenant entity for multi-tenant isolation
- Contains all organizational data
- Attributes: name, code, active status

#### 3.2.2 Region
- Geographic or operational divisions within a company
- Groups multiple sites
- Attributes: name, code, company reference, active status

#### 3.2.3 Site
- Physical locations or branches
- Linked to specific regions
- Attributes: name, code, address, region reference, active status

#### 3.2.4 Department
- Functional units within sites
- Can have assigned managers
- Attributes: name, code, site reference, manager reference, active status

#### 3.2.5 User/Employee
- Individual workforce members
- Assigned to departments with specific roles
- Attributes: employee ID, name, email, contact, role, department, pay codes, active status

---

## 4. User Roles and Permissions

### 4.1 Role Hierarchy

#### 4.1.1 System Super Admin
**Access Level:** Cross-tenant system administration  
**Capabilities:**
- Manage multiple company tenants
- System-wide configuration
- Platform health monitoring
- Global user management

#### 4.1.2 Super User
**Access Level:** Full tenant access  
**Capabilities:**
- Complete organizational management
- All administrative functions
- Cross-department visibility
- System configuration within tenant
- User role assignment

#### 4.1.3 Admin
**Access Level:** Administrative functions  
**Capabilities:**
- Employee management
- Organizational structure updates
- Pay code and shift configuration
- Report generation
- System settings

#### 4.1.4 HR
**Access Level:** Human resources functions  
**Capabilities:**
- Employee onboarding/offboarding
- Leave type and accrual configuration
- Leave request oversight
- Employee profile management
- Compliance reporting

#### 4.1.5 Payroll
**Access Level:** Payroll operations  
**Capabilities:**
- Payroll calculation and processing
- Pay rule configuration
- Time entry approval and validation
- Payroll report generation
- SAGE VIP integration management

#### 4.1.6 Manager
**Access Level:** Team management  
**Capabilities:**
- View team time entries and schedules
- Approve/reject time entries
- Approve/reject leave requests
- Team performance reporting
- Schedule creation (department scope)
- Access limited to managed departments only

#### 4.1.7 Employee
**Access Level:** Self-service  
**Capabilities:**
- Clock in/out with GPS location
- View personal time entries
- Submit leave requests
- View personal schedule
- Update personal profile
- View pay stubs (if enabled)

### 4.2 Access Control Rules
- **Data Isolation:** Managers only access their department data
- **Tenant Isolation:** Multi-tenant data completely separated
- **Role Verification:** Enforced via decorators on all routes
- **Session-Based:** Flask-Login manages authentication state

---

## 5. Core Functional Modules

### 5.1 Time and Attendance Management

#### 5.1.1 Clock In/Out Functionality
**Purpose:** Track employee work hours with location verification

**Features:**
- GPS location capture on clock in
- GPS location capture on clock out
- Automatic break time tracking
- Status workflow: clocked_in → clocked_out → approved
- Real-time dashboard updates
- Location validation against site coordinates

**Business Rules:**
- Employees can only clock in once per shift
- Clock out requires prior clock in
- GPS coordinates stored for audit trail
- Break times calculated automatically
- Overtime flagged when exceeding standard hours

#### 5.1.2 Time Entry Management
**Purpose:** Manage and approve employee work time

**Features:**
- Manager approval queue with filters
- Bulk approval operations
- Entry editing with audit trail
- Hours calculation (regular, overtime, double time)
- Pay code assignment per entry
- Status tracking (pending, approved, rejected)

**Workflows:**
1. **Employee:** Clock in → Work → Clock out
2. **System:** Calculate hours → Flag overtime → Assign pay code
3. **Manager:** Review entries → Approve/Reject → Add notes
4. **Payroll:** Export approved entries → Process payroll

#### 5.1.3 Dashboard and Reporting
**Purpose:** Real-time visibility of attendance data

**Features:**
- Role-filtered data display
- Today's clock-ins widget
- Pending approvals counter
- Hours summary (regular, overtime, total)
- Department-level aggregation for managers
- Export to CSV/Excel

### 5.2 Leave Management

#### 5.2.1 Leave Types and Configuration
**Purpose:** Define leave categories with accrual rules

**Features:**
- Custom leave type creation
- Accrual rate configuration (days per month)
- Maximum balance limits
- Carryover rules
- Paid/unpaid designation
- Active/inactive status

**Standard Leave Types:**
- Annual Leave (1.25 days/month, max 21 days)
- Sick Leave (1 day/month, max 30 days)
- Family Responsibility Leave (3 days/year)
- Maternity Leave (4 months paid)
- Unpaid Leave (no accrual)

#### 5.2.2 Leave Accrual System
**Purpose:** Automated monthly leave balance updates

**Features:**
- Scheduled monthly accrual job
- Automatic balance calculation
- Expiration tracking
- Prorated accrual for new employees
- Accrual history audit log

**Business Rules:**
- Accrual runs first day of each month
- Only active employees receive accrual
- Balance cannot exceed maximum limit
- Expiring leave flagged 30 days prior

#### 5.2.3 Leave Request Workflow
**Purpose:** Employee self-service leave requests with approval

**Features:**
- Leave request submission with date range
- Real-time balance checking
- Multi-level approval routing
- Email notifications at each stage
- Supporting document upload
- Request history tracking

**Workflow States:**
1. **Pending:** Awaiting manager review
2. **Approved:** Manager approved, HR notified
3. **Rejected:** Declined with reason
4. **Cancelled:** Withdrawn by employee

**Business Rules:**
- Cannot request more than available balance
- Minimum 24-hour notice (configurable)
- Blackout periods enforcement
- Overlapping requests prevented
- Manager approval required

#### 5.2.4 Leave Calendar
**Purpose:** Visual representation of team leave

**Features:**
- Calendar view (month/week/day)
- Color-coded leave types
- Team availability overview
- Conflict detection
- Export to iCal/Outlook

### 5.3 Scheduling and Rostering

#### 5.3.1 Shift Configuration
**Purpose:** Define shift patterns and types

**Features:**
- Shift type creation (Morning, Afternoon, Night, etc.)
- Start/end time definition
- Break period configuration
- Pay code mapping
- Active/inactive status

**Standard Shifts:**
- Morning: 06:00 - 14:00
- Afternoon: 14:00 - 22:00
- Night: 22:00 - 06:00
- 24-Hour: Flexible start time

#### 5.3.2 Schedule Creation
**Purpose:** Assign shifts to employees

**Features:**
- Drag-and-drop interface (planned)
- Template-based scheduling
- Copy previous week/month
- Individual or bulk assignment
- Conflict detection (leave, availability)

**Business Rules:**
- Respect rest periods between shifts
- Maximum hours per week enforcement
- Skill-based assignment
- Seniority considerations
- Employee preferences weighting

#### 5.3.3 AI-Powered Schedule Optimization
**Purpose:** Intelligent schedule generation using AI

**Features:**
- Historical pattern analysis
- Workload forecasting
- Optimal shift distribution
- Coverage gap identification
- Cost optimization

**AI Capabilities:**
- OpenAI GPT-4o integration
- Statistical fallback when unavailable
- Learning from manual adjustments
- Preference pattern recognition
- Attendance trend prediction

#### 5.3.4 Employee Schedule View
**Purpose:** Self-service schedule access

**Features:**
- Personal schedule calendar
- Mobile-responsive design
- Shift swap requests
- Availability submission
- Reminder notifications

### 5.4 Payroll Processing

#### 5.4.1 Pay Code Management
**Purpose:** Define payment categories and rates

**Features:**
- Pay code creation (Basic, Overtime, Allowance, etc.)
- Rate configuration per code
- Type classification (hourly, fixed, percentage)
- Department-specific rates
- Active/inactive status

**Standard Pay Codes:**
- Basic Pay (hourly rate)
- Standard Overtime (1.5x multiplier)
- Double Overtime (2.0x multiplier)
- Night Shift Allowance (fixed amount)
- Travel Allowance (fixed amount)

#### 5.4.2 Pay Rules Engine
**Purpose:** Automated payroll calculation logic

**Features:**
- Configurable pay rules with conditions
- Priority-based execution order
- Formula builder for calculations
- Time-based triggers (weekends, holidays)
- Department/role-specific rules

**Rule Examples:**
- IF hours > 8 THEN overtime_hours = hours - 8
- IF shift_type = 'Night' THEN add night_allowance
- IF day = 'Sunday' THEN rate = basic_rate * 2.0

#### 5.4.3 Payroll Calculation
**Purpose:** Process approved time entries into payroll

**Features:**
- Batch processing of time entries
- Automatic pay code assignment
- Overtime calculation
- Deduction processing
- Tax calculation (if configured)
- Payslip generation

**Calculation Flow:**
1. Retrieve approved time entries for period
2. Apply pay rules in priority order
3. Calculate gross pay
4. Apply deductions
5. Generate payslip
6. Export to SAGE VIP

#### 5.4.4 SAGE VIP Payroll Integration
**Purpose:** Bidirectional sync with SAGE VIP Payroll

**Features:**
- Employee master data sync
- Timesheet push to SAGE VIP
- Leave balance transfer
- Payroll calculation sync
- Field mapping configuration

**Integration Endpoints:**
- Employee Sync: POST /api/sage/employees
- Timesheet Push: POST /api/sage/timesheets
- Leave Transfer: POST /api/sage/leave
- Payroll Calc: GET /api/sage/payroll/{period}

**Data Mapping:**
```
WFM Field          → SAGE VIP Field
employee_id        → EmployeeCode
first_name         → FirstName
last_name          → Surname
total_hours        → HoursWorked
overtime_hours     → OvertimeHours
pay_code           → PayrollCode
```

### 5.5 Employee Management

#### 5.5.1 Employee Profiles
**Purpose:** Centralized employee information

**Attributes:**
- Personal: First name, last name, ID number, date of birth
- Contact: Email, phone, address
- Employment: Employee ID, hire date, department, role, manager
- Payroll: Pay codes, bank details, tax number
- Status: Active/inactive, termination date

**Features:**
- Profile creation and editing
- Document attachment (ID, contracts, certificates)
- Emergency contact information
- Next of kin details
- Profile photo upload

#### 5.5.2 Employee ID Generation
**Purpose:** Unique identifier assignment

**Format:** EMP + YEAR(2-digit) + SEQUENCE(3-digit)  
**Examples:** EMP25001, EMP25002, EMP25150

**Rules:**
- Auto-generated on employee creation
- Sequential numbering per year
- Year resets sequence to 001
- Unique across entire company

#### 5.5.3 Employee Onboarding
**Purpose:** Streamlined new employee setup

**Workflow:**
1. Create employee record
2. Assign to department
3. Set role and permissions
4. Configure pay codes
5. Assign initial leave balances
6. Generate login credentials
7. Send welcome email

#### 5.5.4 Employee Offboarding
**Purpose:** Proper employee exit process

**Workflow:**
1. Set termination date
2. Process final timecard
3. Calculate final pay
4. Process leave payout
5. Deactivate system access
6. Archive employee records
7. Generate exit documents

### 5.6 Notification System

#### 5.6.1 Notification Types
**Purpose:** Real-time event communication

**Categories:**
- Time Entry (approval, rejection)
- Leave Request (submission, approval, rejection)
- Schedule (shift assignment, changes)
- Payroll (payslip available, discrepancies)
- System (announcements, maintenance)

#### 5.6.2 Notification Delivery
**Purpose:** Multi-channel notification delivery

**Channels:**
- In-app notifications (real-time)
- Email notifications (configurable)
- SMS notifications (planned)
- Push notifications (PWA)

#### 5.6.3 Notification Preferences
**Purpose:** User-controlled notification settings

**Features:**
- Channel preference per type
- Frequency settings (immediate, digest)
- Quiet hours configuration
- Priority filtering
- Notification history

#### 5.6.4 Notification Actions
**Purpose:** Direct action from notifications

**Features:**
- Deep links to relevant screens
- Quick approval/rejection buttons
- Mark as read/unread
- Archive notifications
- Expiration handling

### 5.7 Reporting and Analytics

#### 5.7.1 Standard Reports
**Purpose:** Pre-built operational reports

**Available Reports:**
- Attendance Summary (daily, weekly, monthly)
- Leave Balance Report
- Overtime Report
- Payroll Summary
- Department Performance
- Employee Hours Breakdown

**Features:**
- Date range selection
- Department/employee filtering
- Export to CSV/Excel/PDF
- Scheduled email delivery
- Report templates

#### 5.7.2 AI-Powered Insights
**Purpose:** Intelligent workforce analytics

**Capabilities:**
- Attendance trend analysis
- Overtime pattern detection
- Leave utilization insights
- Schedule optimization recommendations
- Payroll anomaly detection
- Predictive analytics

**AI Features:**
- OpenAI GPT-4o integration
- Natural language queries
- Statistical fallback mode
- Visual trend charts
- Automated recommendations

#### 5.7.3 Custom Reports
**Purpose:** User-defined reporting

**Features:**
- Report builder interface
- Field selection
- Filter configuration
- Sort and group options
- Save custom reports
- Share with team

#### 5.7.4 Dashboard Widgets
**Purpose:** Real-time KPI display

**Widgets:**
- Today's Attendance
- Pending Approvals
- Leave Requests Queue
- Hours Summary (Regular/Overtime)
- Team Status
- Payroll Preview

---

## 6. Technical Architecture

### 6.1 Technology Stack

#### 6.1.1 Backend
- **Framework:** Flask (Python web framework)
- **ORM:** SQLAlchemy (database abstraction)
- **Authentication:** Flask-Login (session management)
- **Migrations:** Flask-Migrate (database versioning)
- **Forms:** Flask-WTF (form handling and CSRF)

#### 6.1.2 Frontend
- **UI Framework:** Bootstrap 5
- **Icons:** Font Awesome, Feather Icons
- **Charts:** Chart.js, D3.js
- **Template Engine:** Jinja2
- **Responsive:** Mobile-first PWA design

#### 6.1.3 Database
- **Primary:** PostgreSQL
- **Connection:** SQLAlchemy with connection pooling
- **Performance:** Comprehensive indexing strategy

#### 6.1.4 External Services
- **AI:** OpenAI GPT-4o API
- **Payroll:** SAGE VIP Payroll REST API
- **Email:** SMTP (configurable provider)

### 6.2 Database Schema

#### 6.2.1 Core Tables

**users**
- id (PK), employee_id, username, email, password_hash
- first_name, last_name, phone
- role, department_id (FK), manager_id (FK)
- is_active, hire_date, termination_date
- created_at, updated_at

**companies**
- id (PK), name, code
- is_active, created_at, updated_at

**regions**
- id (PK), name, code, company_id (FK)
- is_active, created_at, updated_at

**sites**
- id (PK), name, code, region_id (FK)
- address, latitude, longitude
- is_active, created_at, updated_at

**departments**
- id (PK), name, code, site_id (FK)
- manager_id (FK), is_active
- created_at, updated_at

**time_entries**
- id (PK), user_id (FK), department_id (FK)
- clock_in_time, clock_out_time
- clock_in_latitude, clock_in_longitude
- clock_out_latitude, clock_out_longitude
- total_hours, regular_hours, overtime_hours, double_time_hours
- status (clocked_in, clocked_out, approved, rejected)
- pay_code_id (FK), approved_by (FK), approved_at
- notes, created_at, updated_at

**leave_types**
- id (PK), name, code, company_id (FK)
- accrual_rate, max_balance, is_paid
- is_active, created_at, updated_at

**leave_balances**
- id (PK), user_id (FK), leave_type_id (FK)
- current_balance, accrued_total, used_total
- expires_at, updated_at

**leave_requests**
- id (PK), user_id (FK), leave_type_id (FK)
- start_date, end_date, total_days
- reason, status (pending, approved, rejected, cancelled)
- approved_by (FK), approved_at, rejection_reason
- created_at, updated_at

**shifts**
- id (PK), name, shift_type, start_time, end_time
- break_duration, pay_code_id (FK)
- is_active, created_at, updated_at

**schedules**
- id (PK), user_id (FK), shift_id (FK)
- schedule_date, department_id (FK)
- notes, created_at, updated_at

**pay_codes**
- id (PK), code, name, rate_type (hourly, fixed, percentage)
- rate_amount, department_id (FK)
- is_active, created_at, updated_at

**pay_rules**
- id (PK), name, description, priority
- condition_type, condition_value
- action_type, action_value, multiplier
- is_active, created_at, updated_at

**notifications**
- id (PK), user_id (FK), notification_type
- title, message, priority (low, medium, high, urgent)
- action_url, is_read, expires_at
- created_at

#### 6.2.2 Indexing Strategy

**High-Frequency Query Indexes:**
- time_entries: (user_id, clock_in_time DESC)
- time_entries: (user_id, status)
- time_entries: (department_id, status)
- leave_requests: (user_id, status)
- leave_requests: (status, start_date)
- schedules: (user_id, schedule_date)
- notifications: (user_id, is_read, created_at DESC)

**Filter Field Indexes:**
- users: (department_id, is_active)
- users: (first_name, last_name)
- departments: (site_id, is_active)
- sites: (region_id, is_active)

### 6.3 Application Architecture

#### 6.3.1 Blueprint Structure
```
app/
├── auth/           # Authentication and user management
├── time/           # Time and attendance
├── leave/          # Leave management
├── schedule/       # Scheduling and shifts
├── payroll/        # Payroll processing
├── reports/        # Reporting and analytics
├── admin/          # Administrative functions
└── api/            # REST API endpoints
```

#### 6.3.2 Design Patterns

**Automation-First:**
- Monthly leave accrual automation
- Notification triggers on events
- Payroll batch processing
- Zero manual intervention for routine tasks

**Standardization:**
- Consistent API response format
- Unified currency formatting (R prefix for ZAR)
- Timezone handling (SAST UTC+2)
- Role-based filtering at query level

**Centralization:**
- Single source of truth for employee data
- Unified authentication across modules
- Centralized pay code management
- Dashboard aggregation from all modules

### 6.4 Security Architecture

#### 6.4.1 Authentication
- Password hashing with Werkzeug (default method)
- Session-based authentication with Flask-Login
- CSRF protection on all forms (Flask-WTF)
- Secure session cookies (HttpOnly, Secure flags)

#### 6.4.2 Authorization
- Role-based access control (RBAC)
- Decorator-enforced permissions (@role_required)
- Department-scoped data access for managers
- Tenant isolation for multi-tenant deployments

#### 6.4.3 Data Protection
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection (Jinja2 auto-escaping)
- Secrets management (environment variables)
- Audit logging for sensitive operations

### 6.5 Integration Architecture

#### 6.5.1 SAGE VIP Payroll
**Authentication:** API Key + Username/Password  
**Protocol:** REST API over HTTPS  
**Data Format:** JSON

**Configuration:**
- SAGE_VIP_BASE_URL
- SAGE_VIP_API_KEY
- SAGE_VIP_USERNAME
- SAGE_VIP_PASSWORD
- SAGE_VIP_COMPANY_DB

**Sync Frequency:**
- Employee data: Real-time on changes
- Timesheets: Daily batch (end of day)
- Leave: Real-time on approval
- Payroll calc: On-demand per period

#### 6.5.2 OpenAI GPT-4o
**Authentication:** API Key (OPENAI_API_KEY)  
**Model:** gpt-4o (latest)  
**Fallback:** Statistical analysis module

**Usage:**
- Workforce analytics queries
- Schedule optimization
- Attendance pattern analysis
- Payroll anomaly detection
- Natural language reporting

---

## 7. Business Rules and Logic

### 7.1 Time and Attendance Rules

#### 7.1.1 Clock In/Out
- Employee can only clock in once per shift
- Clock out requires prior clock in for same day
- GPS coordinates mandatory on both clock in/out
- Maximum shift duration: 16 hours (alert trigger)
- Minimum shift duration: 1 hour (validation)

#### 7.1.2 Hours Calculation
- Regular hours: First 8 hours of shift
- Standard overtime: Hours 8.01 - 10.00 (1.5x rate)
- Double time: Hours 10.01+ (2.0x rate)
- Sunday work: All hours at 2.0x rate
- Public holidays: All hours at 2.5x rate

#### 7.1.3 Break Time
- Automatic break deduction: 30 minutes for shifts > 5 hours
- Manual break override by manager
- Paid vs unpaid break configuration
- Break time excluded from overtime calculation

### 7.2 Leave Management Rules

#### 7.2.1 Accrual Rules
- Annual leave: 1.25 days per month (15 days/year)
- Sick leave: 1.0 day per month (12 days/year)
- New employees: Prorated from hire date
- Maximum balance: Configured per leave type
- Excess accrual: Carried forward or paid out (configurable)

#### 7.2.2 Leave Request Rules
- Minimum notice: 24 hours (configurable per leave type)
- Maximum consecutive days: 21 days annual, unlimited sick
- Blackout periods: Enforced for annual leave
- Supporting documents: Required for sick leave > 2 days
- Balance check: Cannot request more than available

#### 7.2.3 Leave Approval Rules
- Manager approval: Required for all leave types
- HR override: Allowed for all requests
- Auto-approval: Configurable for certain leave types after X days
- Rejection reason: Mandatory field
- Cancellation: Allowed before start date only

### 7.3 Scheduling Rules

#### 7.3.1 Shift Assignment
- Minimum rest period: 11 hours between shifts
- Maximum hours per week: 45 regular + 10 overtime
- Skill requirement: Match employee qualifications
- Preference weighting: 30% employee preference, 70% business need

#### 7.3.2 Shift Swaps
- Both employees must consent
- Manager approval required
- Same skill level requirement
- No additional cost to company

### 7.4 Payroll Rules

#### 7.4.1 Pay Calculation
- Pay period: Bi-weekly or monthly (configurable)
- Currency: South African Rand (ZAR)
- Rounding: To 2 decimal places
- Negative pay: Not allowed (validation)

#### 7.4.2 Pay Code Priority
1. Public holiday rates
2. Sunday rates
3. Overtime rates
4. Regular rates
5. Allowances
6. Deductions

#### 7.4.3 Deductions
- Statutory: Tax, UIF, pension (% of gross)
- Voluntary: Medical aid, loans (fixed or %)
- Maximum deduction: 25% of gross pay
- Court orders: Priority over voluntary deductions

---

## 8. User Interface Specifications

### 8.1 Design Principles
- Mobile-first responsive design
- Bootstrap 5 component library
- Consistent color scheme and branding
- Accessibility compliance (WCAG 2.1 AA)
- Progressive Web App (PWA) capabilities

### 8.2 Navigation Structure

**Main Menu:**
- Dashboard (home icon)
- Time & Attendance (clock icon)
- Leave Management (calendar icon)
- Schedules (calendar-check icon)
- Payroll (dollar-sign icon)
- Reports (chart-bar icon)
- Admin (cog icon)
- Profile (user icon)

**Role-Based Menu Display:**
- Employee: Dashboard, Time, Leave, Schedule, Profile
- Manager: + Reports (team scope)
- Payroll: + Payroll module
- HR: + Admin functions
- Super User: All modules

### 8.3 Key Screens

#### 8.3.1 Dashboard
**Purpose:** Real-time operational overview

**Widgets:**
- Clock in/out button (employees)
- Pending approvals count (managers)
- Today's attendance summary
- Hours summary (regular/overtime)
- Leave balance display
- Upcoming shifts
- Recent notifications

#### 8.3.2 Time Entry Screen
**Purpose:** Clock in/out and view history

**Employee View:**
- Large clock in/out button
- Current status display
- GPS location indicator
- Today's hours summary
- Recent time entries list

**Manager View:**
- Team attendance grid
- Filter by department/employee
- Bulk approve checkbox
- Hours summary per employee
- Export button

#### 8.3.3 Leave Request Screen
**Purpose:** Submit and manage leave requests

**Request Form:**
- Leave type dropdown
- Date range picker
- Available balance display
- Reason text area
- Document upload
- Submit button

**Request List:**
- Status badges (color-coded)
- Filter by status/date
- Sort by date/type
- Manager approval actions
- Request details modal

#### 8.3.4 Schedule View
**Purpose:** Visual shift calendar

**Calendar Display:**
- Month/week/day views
- Color-coded shift types
- Employee photo avatars
- Drag-drop assignment (manager)
- Conflict indicators
- Export to calendar

#### 8.3.5 Payroll Dashboard
**Purpose:** Payroll overview and processing

**Displays:**
- Current period summary
- Pending calculations count
- Total gross/net pay
- Department breakdown
- Process payroll button
- Export to SAGE VIP

### 8.4 Mobile Experience

**Responsive Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile-Specific Features:**
- Bottom navigation bar
- Swipe gestures
- Touch-optimized buttons (min 44px)
- GPS integration for location
- Offline mode (PWA)
- Push notifications

---

## 9. Data Standards

### 9.1 Date and Time
- **Timezone:** SAST (UTC+2)
- **Date Format:** YYYY-MM-DD (ISO 8601)
- **Time Format:** HH:MM:SS (24-hour)
- **Display Format:** DD/MM/YYYY HH:MM (user-facing)

### 9.2 Currency
- **Currency:** South African Rand (ZAR)
- **Symbol:** R
- **Format:** R 1,234.56
- **Precision:** 2 decimal places

### 9.3 Employee ID
- **Format:** EMP + YY + NNN
- **Example:** EMP25001
- **Pattern:** EMP[0-9]{5}

### 9.4 Status Values

**Time Entry Status:**
- clocked_in
- clocked_out
- approved
- rejected

**Leave Request Status:**
- pending
- approved
- rejected
- cancelled

**Employee Status:**
- active
- inactive
- terminated

### 9.5 Validation Rules

**Email:** Valid email format (RFC 5322)  
**Phone:** South African format +27 XX XXX XXXX  
**ID Number:** 13 digits (SA ID format)  
**Tax Number:** 10 digits  
**Bank Account:** 9-11 digits  

---

## 10. API Specifications

### 10.1 REST API Endpoints

#### 10.1.1 Authentication
```
POST /auth/login
POST /auth/logout
GET  /auth/profile
PUT  /auth/profile
```

#### 10.1.2 Time Entries
```
GET    /api/time/entries
POST   /api/time/clock-in
POST   /api/time/clock-out
PUT    /api/time/entries/{id}
DELETE /api/time/entries/{id}
POST   /api/time/approve-bulk
GET    /api/time/entry-details/{id}
```

#### 10.1.3 Leave Management
```
GET    /api/leave/requests
POST   /api/leave/requests
PUT    /api/leave/requests/{id}
DELETE /api/leave/requests/{id}
GET    /api/leave/balances
POST   /api/leave/approve/{id}
POST   /api/leave/reject/{id}
```

#### 10.1.4 Scheduling
```
GET    /api/schedule/shifts
POST   /api/schedule/shifts
PUT    /api/schedule/shifts/{id}
DELETE /api/schedule/shifts/{id}
GET    /api/schedule/calendar
POST   /api/schedule/assign
```

#### 10.1.5 Payroll
```
GET    /api/payroll/summary
POST   /api/payroll/calculate
GET    /api/payroll/payslip/{id}
POST   /api/payroll/sage-sync
GET    /api/payroll/pay-rules
```

### 10.2 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### 10.3 SAGE VIP Integration API

#### 10.3.1 Employee Sync
```
POST /api/sage/employees
Content-Type: application/json

{
  "employees": [
    {
      "EmployeeCode": "EMP25001",
      "FirstName": "John",
      "Surname": "Doe",
      "Department": "IT",
      "BasicPay": 25000.00
    }
  ]
}
```

#### 10.3.2 Timesheet Push
```
POST /api/sage/timesheets
Content-Type: application/json

{
  "period": "2025-10",
  "timesheets": [
    {
      "EmployeeCode": "EMP25001",
      "HoursWorked": 160.00,
      "OvertimeHours": 15.50,
      "PayrollCode": "BASIC"
    }
  ]
}
```

---

## 11. Performance Requirements

### 11.1 Response Time
- Page load: < 2 seconds
- API response: < 500ms
- Database query: < 100ms
- Report generation: < 5 seconds

### 11.2 Scalability
- Concurrent users: 1,000+
- Database records: 10M+ time entries
- API throughput: 100 req/sec
- File upload: Max 10MB

### 11.3 Availability
- Uptime: 99.5% (excluding scheduled maintenance)
- Scheduled maintenance: 2 hours/month
- Backup frequency: Daily
- Recovery time: < 4 hours

---

## 12. Compliance and Standards

### 12.1 South African Labor Law
- Basic Conditions of Employment Act (BCEA)
- 45-hour work week standard
- Overtime regulations
- Leave entitlements
- Public holiday payments

### 12.2 Data Protection
- POPIA (Protection of Personal Information Act)
- Personal data consent
- Data retention policies
- Right to access and deletion

### 12.3 Payroll Standards
- SARS (South African Revenue Service) compliance
- UIF (Unemployment Insurance Fund) calculations
- SDL (Skills Development Levy) reporting
- PAYE (Pay As You Earn) tax calculations

---

## 13. Deployment and Infrastructure

### 13.1 Hosting
- **Platform:** Replit (development/staging)
- **Production:** Cloud hosting (AWS/Azure/GCP)
- **Database:** Managed PostgreSQL
- **Web Server:** Gunicorn (WSGI)

### 13.2 Environment Configuration

**Development:**
- Debug mode enabled
- Logging: DEBUG level
- Database: Development instance

**Production:**
- Debug mode disabled
- Logging: ERROR level
- Database: Production instance with replicas
- SSL/TLS enforcement

### 13.3 Required Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=<random-secret-key>
OPENAI_API_KEY=<openai-key>
SAGE_VIP_BASE_URL=<sage-url>
SAGE_VIP_API_KEY=<sage-key>
SAGE_VIP_USERNAME=<username>
SAGE_VIP_PASSWORD=<password>
SAGE_VIP_COMPANY_DB=<company-db>
```

---

## 14. Testing Requirements

### 14.1 Unit Testing
- Model validation tests
- Business logic tests
- Utility function tests
- Coverage target: 80%

### 14.2 Integration Testing
- API endpoint tests
- Database transaction tests
- External service integration tests
- SAGE VIP sync tests

### 14.3 User Acceptance Testing
- Role-based workflow tests
- End-to-end scenarios
- Mobile responsiveness tests
- Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## 15. Documentation Requirements

### 15.1 User Documentation
- User manual per role
- Quick start guides
- Video tutorials
- FAQ section

### 15.2 Administrator Documentation
- Installation guide
- Configuration manual
- Troubleshooting guide
- Database schema documentation

### 15.3 Developer Documentation
- API reference
- Code architecture guide
- Contributing guidelines
- Deployment procedures

---

## 16. Support and Maintenance

### 16.1 Support Levels
- **Tier 1:** User support (email/chat)
- **Tier 2:** Technical support
- **Tier 3:** Development team

### 16.2 SLA (Service Level Agreement)
- Critical issues: 4-hour response
- High priority: 8-hour response
- Medium priority: 24-hour response
- Low priority: 72-hour response

### 16.3 Maintenance Schedule
- Security updates: As needed
- Feature updates: Monthly
- Database optimization: Quarterly
- Full system audit: Annually

---

## 17. Future Enhancements

### 17.1 Planned Features
- Mobile native apps (iOS/Android)
- Biometric clock in/out
- Advanced shift swap marketplace
- Predictive scheduling AI
- Real-time chat/messaging
- Employee self-service portal expansion
- Multi-currency support
- Advanced analytics dashboard

### 17.2 Integration Roadmap
- HRIS systems (SAP, Workday)
- Accounting software (Xero, QuickBooks)
- Recruitment platforms
- Learning management systems
- Benefits administration

---

## Appendix A: Glossary

**Clock In:** Recording of employee shift start time with GPS location  
**Clock Out:** Recording of employee shift end time with GPS location  
**Pay Code:** Category defining payment type and rate  
**Pay Rule:** Automated calculation logic for payroll processing  
**Shift Type:** Predefined work period with start/end times  
**Leave Accrual:** Automatic monthly addition to leave balance  
**Department Scope:** Data access limited to managed departments  
**Tenant:** Isolated company instance in multi-tenant system  
**SAST:** South African Standard Time (UTC+2)  
**ZAR:** South African Rand currency  

---

## Appendix B: System Limits

**Maximum Values:**
- Employees per company: 10,000
- Departments per site: 100
- Sites per region: 50
- Regions per company: 20
- Time entries per employee/month: 100
- Leave requests per employee/year: 50
- Shifts per schedule: 1,000
- Pay rules per company: 200

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-14 | WFM24/7 Team | Initial functional specification |

**Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| Business Analyst | | | |

---

**End of Functional Specification Document**
