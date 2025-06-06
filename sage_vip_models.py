"""
SAGE VIP Integration Database Models
Track integration status, sync history, and mapping data
"""

from app import db
from datetime import datetime
from sqlalchemy import Index

class SAGEVIPSyncLog(db.Model):
    """Track all SAGE VIP synchronization operations"""
    __tablename__ = 'sage_vip_sync_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    operation_type = db.Column(db.String(50), nullable=False)  # 'employee_sync', 'timesheet_push', etc.
    direction = db.Column(db.String(10), nullable=False)  # 'push' or 'pull'
    status = db.Column(db.String(20), nullable=False)  # 'success', 'failed', 'partial'
    records_processed = db.Column(db.Integer, default=0)
    records_failed = db.Column(db.Integer, default=0)
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    response_code = db.Column(db.Integer)
    initiated_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationships
    initiated_by = db.relationship('User', backref='sage_sync_operations')
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_sage_sync_operation_time', 'operation_type', 'start_time'),
        Index('idx_sage_sync_status', 'status'),
    )
    
    def duration_seconds(self):
        """Calculate operation duration in seconds"""
        if self.end_time and self.start_time:
            return (self.end_time - self.start_time).total_seconds()
        return None

class SAGEVIPEmployeeMapping(db.Model):
    """Map WFM users to SAGE VIP employee records"""
    __tablename__ = 'sage_vip_employee_mappings'
    
    id = db.Column(db.Integer, primary_key=True)
    wfm_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    sage_employee_id = db.Column(db.String(50), unique=True, nullable=False)
    sage_employee_number = db.Column(db.String(50), nullable=False)
    last_synced = db.Column(db.DateTime, default=datetime.utcnow)
    sync_status = db.Column(db.String(20), default='active')  # 'active', 'inactive', 'error'
    
    # Relationships
    wfm_user = db.relationship('User', backref='sage_mapping')
    
    # Indexes
    __table_args__ = (
        Index('idx_sage_employee_mapping', 'sage_employee_id', 'sage_employee_number'),
    )

class SAGEVIPPayCode(db.Model):
    """Store SAGE VIP pay codes and their mappings"""
    __tablename__ = 'sage_vip_pay_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    sage_code = db.Column(db.String(20), unique=True, nullable=False)
    sage_description = db.Column(db.String(255))
    wfm_pay_code_id = db.Column(db.Integer, db.ForeignKey('pay_codes.id'))
    rate_multiplier = db.Column(db.Numeric(5, 2), default=1.00)
    is_overtime = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    last_synced = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    wfm_pay_code = db.relationship('PayCode', backref='sage_mappings')

class SAGEVIPTimeEntryStatus(db.Model):
    """Track time entry synchronization status with SAGE VIP"""
    __tablename__ = 'sage_vip_time_entry_status'
    
    id = db.Column(db.Integer, primary_key=True)
    wfm_time_entry_id = db.Column(db.Integer, db.ForeignKey('time_entries.id'), unique=True, nullable=False)
    sage_timesheet_id = db.Column(db.String(50))
    push_status = db.Column(db.String(20), default='pending')  # 'pending', 'pushed', 'failed', 'rejected'
    push_date = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    sage_response_code = db.Column(db.Integer)
    retry_count = db.Column(db.Integer, default=0)
    
    # Relationships
    time_entry = db.relationship('TimeEntry', backref='sage_status')
    
    # Indexes
    __table_args__ = (
        Index('idx_sage_time_entry_status', 'push_status', 'push_date'),
    )

class SAGEVIPLeaveEntryStatus(db.Model):
    """Track leave application synchronization status with SAGE VIP"""
    __tablename__ = 'sage_vip_leave_entry_status'
    
    id = db.Column(db.Integer, primary_key=True)
    wfm_leave_application_id = db.Column(db.Integer, db.ForeignKey('leave_applications.id'), unique=True, nullable=False)
    sage_leave_id = db.Column(db.String(50))
    push_status = db.Column(db.String(20), default='pending')  # 'pending', 'pushed', 'failed', 'rejected'
    push_date = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    sage_response_code = db.Column(db.Integer)
    retry_count = db.Column(db.Integer, default=0)
    
    # Relationships
    leave_application = db.relationship('LeaveApplication', backref='sage_status')
    
    # Indexes
    __table_args__ = (
        Index('idx_sage_leave_entry_status', 'push_status', 'push_date'),
    )

class SAGEVIPIntegrationSettings(db.Model):
    """Store SAGE VIP integration configuration and settings"""
    __tablename__ = 'sage_vip_integration_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    setting_key = db.Column(db.String(100), unique=True, nullable=False)
    setting_value = db.Column(db.Text)
    setting_type = db.Column(db.String(20), default='string')  # 'string', 'integer', 'boolean', 'json'
    description = db.Column(db.Text)
    is_sensitive = db.Column(db.Boolean, default=False)  # For credentials and API keys
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationships
    updated_by = db.relationship('User', backref='sage_settings_updates')

class SAGEVIPDataValidationLog(db.Model):
    """Log data validation issues during synchronization"""
    __tablename__ = 'sage_vip_data_validation_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    sync_log_id = db.Column(db.Integer, db.ForeignKey('sage_vip_sync_logs.id'), nullable=False)
    validation_type = db.Column(db.String(50), nullable=False)  # 'employee', 'timesheet', 'leave'
    record_identifier = db.Column(db.String(100))  # Employee ID, time entry ID, etc.
    field_name = db.Column(db.String(100))
    validation_error = db.Column(db.Text, nullable=False)
    sage_field_value = db.Column(db.Text)
    wfm_field_value = db.Column(db.Text)
    severity = db.Column(db.String(20), default='error')  # 'warning', 'error', 'critical'
    resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sync_log = db.relationship('SAGEVIPSyncLog', backref='validation_issues')
    
    # Indexes
    __table_args__ = (
        Index('idx_sage_validation_type_severity', 'validation_type', 'severity'),
        Index('idx_sage_validation_resolved', 'resolved'),
    )

# Helper functions for SAGE VIP integration models

def get_last_successful_sync(operation_type: str) -> SAGEVIPSyncLog:
    """Get the last successful sync operation of a specific type"""
    return SAGEVIPSyncLog.query.filter_by(
        operation_type=operation_type,
        status='success'
    ).order_by(SAGEVIPSyncLog.end_time.desc()).first()

def get_pending_time_entries():
    """Get time entries that need to be pushed to SAGE VIP"""
    from models import TimeEntry
    return TimeEntry.query.outerjoin(SAGEVIPTimeEntryStatus).filter(
        db.or_(
            SAGEVIPTimeEntryStatus.push_status == 'pending',
            SAGEVIPTimeEntryStatus.push_status == 'failed',
            SAGEVIPTimeEntryStatus.id.is_(None)
        ),
        TimeEntry.status == 'completed'
    ).all()

def get_pending_leave_applications():
    """Get leave applications that need to be pushed to SAGE VIP"""
    from models import LeaveApplication
    return LeaveApplication.query.outerjoin(SAGEVIPLeaveEntryStatus).filter(
        db.or_(
            SAGEVIPLeaveEntryStatus.push_status == 'pending',
            SAGEVIPLeaveEntryStatus.push_status == 'failed',
            SAGEVIPLeaveEntryStatus.id.is_(None)
        ),
        LeaveApplication.status == 'approved'
    ).all()

def create_sync_log(operation_type: str, direction: str, user_id: int = None) -> SAGEVIPSyncLog:
    """Create a new sync log entry"""
    sync_log = SAGEVIPSyncLog(
        operation_type=operation_type,
        direction=direction,
        status='in_progress',
        initiated_by_user_id=user_id
    )
    db.session.add(sync_log)
    db.session.commit()
    return sync_log

def update_sync_log(sync_log: SAGEVIPSyncLog, status: str, records_processed: int = 0, 
                   records_failed: int = 0, error_message: str = None, response_code: int = None):
    """Update sync log with completion status"""
    sync_log.status = status
    sync_log.records_processed = records_processed
    sync_log.records_failed = records_failed
    sync_log.end_time = datetime.utcnow()
    if error_message:
        sync_log.error_message = error_message
    if response_code:
        sync_log.response_code = response_code
    db.session.commit()