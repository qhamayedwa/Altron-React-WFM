"""
SAGE VIP Payroll Integration Configuration
Environment variables and settings required for SAGE VIP connection
"""

import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class SAGEVIPConfig:
    """Configuration class for SAGE VIP Payroll integration"""
    
    # Connection Settings
    base_url: str
    api_key: str
    username: str
    password: str
    company_database: str
    
    # API Endpoints
    auth_endpoint: str = '/api/v1/auth/login'
    employees_endpoint: str = '/api/v1/employees'
    timesheet_endpoint: str = '/api/v1/timesheet'
    leave_endpoint: str = '/api/v1/leave'
    payroll_endpoint: str = '/api/v1/payroll'
    departments_endpoint: str = '/api/v1/departments'
    pay_codes_endpoint: str = '/api/v1/pay-codes'
    
    # Sync Settings
    timeout_seconds: int = 30
    retry_attempts: int = 3
    batch_size: int = 100
    
    # Data Mapping
    default_currency: str = 'ZAR'
    default_pay_code: str = 'REGULAR'
    default_cost_center: str = 'DEFAULT'
    
    @classmethod
    def from_environment(cls) -> 'SAGEVIPConfig':
        """Create configuration from environment variables"""
        return cls(
            base_url=os.environ.get('SAGE_VIP_BASE_URL', ''),
            api_key=os.environ.get('SAGE_VIP_API_KEY', ''),
            username=os.environ.get('SAGE_VIP_USERNAME', ''),
            password=os.environ.get('SAGE_VIP_PASSWORD', ''),
            company_database=os.environ.get('SAGE_VIP_COMPANY_DB', ''),
            timeout_seconds=int(os.environ.get('SAGE_VIP_TIMEOUT', '30')),
            retry_attempts=int(os.environ.get('SAGE_VIP_RETRY_ATTEMPTS', '3')),
            batch_size=int(os.environ.get('SAGE_VIP_BATCH_SIZE', '100'))
        )
    
    def is_configured(self) -> bool:
        """Check if all required configuration is present"""
        required_fields = [
            self.base_url,
            self.api_key,
            self.username,
            self.password,
            self.company_database
        ]
        return all(field.strip() for field in required_fields)
    
    def get_missing_config(self) -> list:
        """Get list of missing configuration items"""
        missing = []
        if not self.base_url.strip():
            missing.append('SAGE_VIP_BASE_URL')
        if not self.api_key.strip():
            missing.append('SAGE_VIP_API_KEY')
        if not self.username.strip():
            missing.append('SAGE_VIP_USERNAME')
        if not self.password.strip():
            missing.append('SAGE_VIP_PASSWORD')
        if not self.company_database.strip():
            missing.append('SAGE_VIP_COMPANY_DB')
        return missing

# Required environment variables for SAGE VIP integration
REQUIRED_SAGE_VIP_SECRETS = [
    'SAGE_VIP_BASE_URL',
    'SAGE_VIP_API_KEY', 
    'SAGE_VIP_USERNAME',
    'SAGE_VIP_PASSWORD',
    'SAGE_VIP_COMPANY_DB'
]

# Data field mappings between WFM and SAGE VIP
FIELD_MAPPINGS = {
    'employee': {
        'wfm_to_sage': {
            'employee_id': 'employee_number',
            'first_name': 'first_name',
            'last_name': 'last_name',
            'email': 'email',
            'department': 'department',
            'position': 'position',
            'is_active': 'active'
        },
        'sage_to_wfm': {
            'employee_number': 'employee_id',
            'first_name': 'first_name',
            'last_name': 'last_name',
            'email': 'email',
            'department': 'department',
            'position': 'position',
            'active': 'is_active'
        }
    },
    'timesheet': {
        'wfm_to_sage': {
            'employee_id': 'employee_id',
            'clock_in_time': 'date',
            'hours_worked': 'hours_worked',
            'overtime_hours': 'overtime_hours',
            'pay_code': 'pay_code',
            'department': 'cost_center',
            'notes': 'notes'
        }
    },
    'leave': {
        'wfm_to_sage': {
            'employee_id': 'employee_id',
            'leave_type': 'leave_type',
            'start_date': 'start_date',
            'end_date': 'end_date',
            'days_requested': 'days_taken',
            'approved_by': 'approved_by',
            'status': 'status'
        }
    }
}

# SAGE VIP API response codes and their meanings
SAGE_VIP_RESPONSE_CODES = {
    200: 'Success',
    201: 'Created',
    400: 'Bad Request - Invalid data format',
    401: 'Unauthorized - Authentication failed',
    403: 'Forbidden - Insufficient permissions',
    404: 'Not Found - Resource does not exist',
    409: 'Conflict - Data already exists',
    422: 'Unprocessable Entity - Validation errors',
    429: 'Too Many Requests - Rate limit exceeded',
    500: 'Internal Server Error - SAGE VIP system error',
    502: 'Bad Gateway - SAGE VIP service unavailable',
    503: 'Service Unavailable - SAGE VIP maintenance'
}