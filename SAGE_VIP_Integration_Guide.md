# SAGE VIP Payroll Integration Guide

## Overview

This integration enables bidirectional data synchronization between Altron WFM and SAGE VIP Payroll system. The integration supports:

- **Employee Data Sync**: Pull employee information from SAGE VIP to WFM
- **Time Entry Push**: Send time tracking data from WFM to SAGE VIP
- **Leave Management Push**: Transfer approved leave applications to SAGE VIP
- **Payroll Data Pull**: Retrieve processed payroll information from SAGE VIP
- **Pay Codes Sync**: Synchronize pay codes and classifications

## Required Environment Variables

The following environment variables must be configured for the integration to function:

```bash
# SAGE VIP Connection Settings
SAGE_VIP_BASE_URL=https://your-sage-vip-server.com
SAGE_VIP_API_KEY=your_api_key_here
SAGE_VIP_USERNAME=your_sage_username
SAGE_VIP_PASSWORD=your_sage_password
SAGE_VIP_COMPANY_DB=your_company_database_name

# Optional Configuration
SAGE_VIP_TIMEOUT=30
SAGE_VIP_RETRY_ATTEMPTS=3
SAGE_VIP_BATCH_SIZE=100
```

## API Endpoints Required

The SAGE VIP system must expose the following REST API endpoints:

### Authentication
- `POST /api/v1/auth/login` - Authenticate and receive access token

### Employee Management
- `GET /api/v1/employees` - Retrieve all employees
- `GET /api/v1/employees/{id}` - Get specific employee
- `PUT /api/v1/employees/{id}` - Update employee information

### Time & Attendance
- `POST /api/v1/timesheet` - Submit time entries
- `GET /api/v1/timesheet` - Retrieve time entries
- `PUT /api/v1/timesheet/{id}` - Update time entry

### Leave Management
- `POST /api/v1/leave` - Submit leave applications
- `GET /api/v1/leave` - Retrieve leave data
- `PUT /api/v1/leave/{id}` - Update leave status

### Payroll
- `GET /api/v1/payroll` - Retrieve payroll data
- `GET /api/v1/pay-codes` - Get pay codes and classifications

## Data Structure Requirements

### Employee Data Format (SAGE VIP → WFM)
```json
{
  "employees": [
    {
      "employee_id": "string",
      "employee_number": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "department": "string",
      "position": "string",
      "pay_rate": 0.0,
      "currency": "ZAR",
      "active": true,
      "hire_date": "YYYY-MM-DD"
    }
  ]
}
```

### Time Entry Format (WFM → SAGE VIP)
```json
{
  "time_entries": [
    {
      "employee_id": "string",
      "date": "YYYY-MM-DD",
      "hours_worked": 8.0,
      "overtime_hours": 0.0,
      "pay_code": "REGULAR",
      "cost_center": "string",
      "notes": "string"
    }
  ]
}
```

### Leave Entry Format (WFM → SAGE VIP)
```json
{
  "leave_entries": [
    {
      "employee_id": "string",
      "leave_type": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "days_taken": 5.0,
      "approved_by": "string",
      "status": "APPROVED"
    }
  ]
}
```

## Authentication Requirements

The SAGE VIP system must support:

1. **Username/Password Authentication**: Initial login with credentials
2. **JWT Token Authentication**: Bearer token for subsequent API calls
3. **API Key Authentication**: Additional security layer via X-API-Key header
4. **Company Database Selection**: Ability to specify company database context

### Authentication Flow
1. POST credentials to `/api/v1/auth/login`
2. Receive JWT access token in response
3. Include token in Authorization header: `Bearer {token}`
4. Include API key in X-API-Key header
5. Token refresh handling for long-running operations

## Setup Instructions

### 1. Configure Environment Variables
Add the required environment variables to your system or `.env` file.

### 2. Test Connection
Use the integration dashboard to test the connection to SAGE VIP:
- Navigate to Administration → SAGE VIP Integration
- Click "Test Connection" to verify connectivity

### 3. Initial Data Sync
Perform an initial synchronization:
1. **Sync Employees**: Pull all employee data from SAGE VIP
2. **Sync Pay Codes**: Import pay classifications and codes
3. **Verify Data**: Review imported data for accuracy

### 4. Configure Scheduled Syncs
Set up automated synchronization schedules:
- **Daily**: Time entries push (end of business day)
- **Weekly**: Leave applications push
- **Monthly**: Employee data sync and payroll pull

## Data Flow Diagrams

### Employee Sync (SAGE VIP → WFM)
```
SAGE VIP → API Call → WFM Database
         ← Authentication ←
```

### Time Entry Push (WFM → SAGE VIP)
```
WFM Database → API Call → SAGE VIP
             ← Confirmation ←
```

### Payroll Pull (SAGE VIP → WFM)
```
SAGE VIP → Payroll Data → WFM Reports
         ← Request ←
```

## Error Handling

The integration includes comprehensive error handling for:

- **Connection Failures**: Automatic retry with exponential backoff
- **Authentication Errors**: Token refresh and re-authentication
- **Data Validation**: Field-level validation before transmission
- **Conflict Resolution**: Handling duplicate or conflicting data
- **Rate Limiting**: Respect SAGE VIP API rate limits

## Security Considerations

1. **Credential Management**: Store credentials securely using environment variables
2. **Data Encryption**: All API communications use HTTPS/TLS
3. **Access Control**: Role-based access to integration functions
4. **Audit Logging**: Complete audit trail of all sync operations
5. **Data Privacy**: Only sync necessary employee data fields

## Monitoring and Logging

The integration provides:

- **Real-time Status**: Current connection and sync status
- **Operation Logs**: Detailed logs of all sync operations
- **Error Alerts**: Immediate notification of sync failures
- **Performance Metrics**: Sync timing and success rates
- **Data Validation Reports**: Summary of data quality issues

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify SAGE VIP credentials
   - Check API key validity
   - Ensure company database name is correct

2. **Connection Timeouts**
   - Check network connectivity
   - Verify SAGE VIP server status
   - Adjust timeout settings if needed

3. **Data Format Errors**
   - Review SAGE VIP API documentation
   - Validate data structure compatibility
   - Check field mapping configuration

4. **Sync Failures**
   - Review integration logs
   - Check SAGE VIP system capacity
   - Verify data permissions

## Support and Maintenance

For ongoing support:

1. **System Administrators**: Configure environment variables and access
2. **Payroll Teams**: Verify data accuracy and resolve discrepancies
3. **IT Support**: Monitor system health and troubleshoot issues
4. **SAGE VIP Vendor**: Coordinate API changes and system updates

## API Response Codes

| Code | Meaning | Action Required |
|------|---------|----------------|
| 200 | Success | None |
| 401 | Unauthorized | Check credentials |
| 403 | Forbidden | Verify permissions |
| 404 | Not Found | Check endpoint URLs |
| 422 | Validation Error | Review data format |
| 429 | Rate Limited | Reduce request frequency |
| 500 | Server Error | Contact SAGE VIP support |

## Integration Testing

Before going live:

1. **Connection Test**: Verify basic connectivity
2. **Data Validation**: Test with sample employee records
3. **Sync Operations**: Perform full sync cycle
4. **Error Scenarios**: Test failure handling
5. **Performance Testing**: Validate with production data volumes

This integration ensures seamless data flow between your WFM system and SAGE VIP Payroll while maintaining data integrity and security standards.