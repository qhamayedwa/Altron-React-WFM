# WFM247 API Documentation

## Overview
This document outlines the REST API endpoints for the WFM247 Workforce Management System. These APIs are designed to support both web dashboard functionality and mobile applications with 24/7 operations support.

## Authentication
All API endpoints require authentication via Flask-Login session or JWT tokens (to be implemented for mobile).

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://your-domain.com/api/v1`

## Core API Endpoints

### Time & Attendance

#### Employee Time Tracking
```
POST /api/v1/time/clock-in
POST /api/v1/time/clock-out
GET /api/v1/time/current-status
GET /api/v1/time/entries
POST /api/v1/time/break-start
POST /api/v1/time/break-end
```

#### Manager Time Management
```
GET /api/v1/time/team-entries
POST /api/v1/time/approve/{entry_id}
POST /api/v1/time/reject/{entry_id}
GET /api/v1/time/pending-approvals
POST /api/v1/time/bulk-approve
```

### Scheduling

#### Employee Schedule Access
```
GET /api/v1/schedule/my-schedule
GET /api/v1/schedule/upcoming-shifts
POST /api/v1/schedule/request-change
GET /api/v1/schedule/week/{date}
```

#### Manager Schedule Management
```
GET /api/v1/schedule/team-schedules
POST /api/v1/schedule/create
PUT /api/v1/schedule/update/{schedule_id}
DELETE /api/v1/schedule/delete/{schedule_id}
POST /api/v1/schedule/bulk-create
GET /api/v1/schedule/conflicts
```

### Leave Management

#### Employee Leave Operations
```
GET /api/v1/leave/my-applications
POST /api/v1/leave/apply
GET /api/v1/leave/balances
POST /api/v1/leave/cancel/{application_id}
GET /api/v1/leave/types
```

#### Manager Leave Approval
```
GET /api/v1/leave/team-applications
POST /api/v1/leave/approve/{application_id}
POST /api/v1/leave/reject/{application_id}
GET /api/v1/leave/pending-approvals
POST /api/v1/leave/bulk-action
```

### Payroll & Reporting

#### Payroll Processing
```
GET /api/v1/payroll/process
POST /api/v1/payroll/run
GET /api/v1/payroll/summary
GET /api/v1/payroll/employee-details/{employee_id}
POST /api/v1/payroll/approve/{employee_id}
```

#### Reporting APIs
```
GET /api/v1/reports/time-summary
GET /api/v1/reports/overtime-summary
GET /api/v1/reports/leave-summary
POST /api/v1/reports/custom
GET /api/v1/reports/export/{report_type}
```

### User Management

#### User Operations
```
GET /api/v1/users/profile
PUT /api/v1/users/profile
POST /api/v1/users/change-password
GET /api/v1/users/notifications
```

#### Admin User Management
```
GET /api/v1/admin/users
POST /api/v1/admin/users
PUT /api/v1/admin/users/{user_id}
DELETE /api/v1/admin/users/{user_id}
GET /api/v1/admin/roles
```

## Request/Response Formats

### Standard Response Format
```json
{
    "success": true,
    "data": {},
    "message": "Operation completed successfully",
    "timestamp": "2025-06-05T22:30:00Z"
}
```

### Error Response Format
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": {}
    },
    "timestamp": "2025-06-05T22:30:00Z"
}
```

### Clock In/Out Example
```json
// POST /api/v1/time/clock-in
{
    "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
    },
    "notes": "Starting morning shift"
}

// Response
{
    "success": true,
    "data": {
        "entry_id": 123,
        "clock_in_time": "2025-06-05T08:00:00Z",
        "status": "clocked_in"
    }
}
```

### Schedule Request Example
```json
// GET /api/v1/schedule/my-schedule?week=2025-06-02
{
    "success": true,
    "data": {
        "week_start": "2025-06-02",
        "schedules": [
            {
                "date": "2025-06-02",
                "shift_type": "Morning",
                "start_time": "08:00",
                "end_time": "16:00",
                "location": "Main Office"
            }
        ]
    }
}
```

## Mobile-Specific Considerations

### Authentication for Mobile
- JWT token-based authentication (to be implemented)
- Refresh token mechanism
- Device registration and management

### Offline Capability
- Clock in/out data caching
- Schedule data synchronization
- Conflict resolution strategies

### Push Notifications
- Schedule changes
- Leave application status
- Approval requests
- System announcements

### Geolocation Features
- GPS-based clock in/out verification
- Location tracking for field workers
- Geofence validation

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Burst allowance: 20 requests per 10 seconds

## Data Validation
- All datetime fields in ISO 8601 format
- GPS coordinates validated within reasonable bounds
- Input sanitization and validation
- File upload size limits (10MB for documents)

## Security Considerations
- HTTPS required for all endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection for web requests

## Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Input validation failed
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `CONFLICT`: Operation conflicts with current state
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Future Mobile App Features
- Biometric authentication
- Camera integration for time tracking verification
- Voice commands for quick actions
- Smartwatch integration
- Team messaging and collaboration
- Real-time notifications and updates