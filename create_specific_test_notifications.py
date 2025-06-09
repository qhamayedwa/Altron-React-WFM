#!/usr/bin/env python3
"""
Create specific test notifications for different user roles and scenarios
"""

from app import create_app
from notifications import NotificationService
from models import User, Department, LeaveApplication
from datetime import datetime, timedelta

def create_role_specific_notifications():
    """Create notifications specific to different user roles"""
    
    app = create_app()
    with app.app_context():
        
        # Get users by role using has_role method
        all_users = User.query.filter_by(is_active=True).all()
        managers = [user for user in all_users if user.has_role('Manager')]
        employees = [user for user in all_users if user.has_role('Employee')]
        super_users = [user for user in all_users if user.has_role('Super User')]
        
        notifications_created = 0
        
        # Manager-specific notifications
        for manager in managers[:3]:  # Limit to first 3 managers
            # Urgent leave approval needed
            NotificationService.create_notification(
                user_id=manager.id,
                type_name='leave_approval_required',
                title='URGENT: Medical Leave Approval Required',
                message=f'Sarah Mitchell has submitted an urgent medical leave request starting tomorrow. This requires immediate attention.',
                priority='urgent',
                action_url='/leave/team-applications',
                action_text='Review Immediately',
                category='urgent_approval'
            )
            notifications_created += 1
            
            # Multiple pending approvals
            NotificationService.create_notification(
                user_id=manager.id,
                type_name='leave_approval_required',
                title='3 Leave Requests Pending Review',
                message='You have 3 pending leave requests from your team members that require approval.',
                priority='high',
                action_url='/leave/team-applications',
                action_text='Review All',
                category='pending_approvals'
            )
            notifications_created += 1
            
            # Department schedule conflict
            NotificationService.create_notification(
                user_id=manager.id,
                type_name='schedule_change',
                title='Schedule Conflict Detected',
                message='Multiple employees in your department have requested the same day off. Manual review required.',
                priority='high',
                action_url='/scheduling',
                action_text='Resolve Conflict',
                category='scheduling'
            )
            notifications_created += 1
        
        # Employee-specific notifications
        for employee in employees[:10]:  # Limit to first 10 employees
            # Leave status updates
            if employee.id % 3 == 0:  # Every 3rd employee gets approved leave
                NotificationService.create_notification(
                    user_id=employee.id,
                    type_name='leave_status_update',
                    title='✅ Leave Request Approved',
                    message='Your annual leave request for December 20-22 has been approved by your manager.',
                    priority='medium',
                    action_url='/leave/my-applications',
                    action_text='View Details',
                    category='leave_approved'
                )
                notifications_created += 1
            
            elif employee.id % 3 == 1:  # Every 3rd employee gets rejected leave
                NotificationService.create_notification(
                    user_id=employee.id,
                    type_name='leave_status_update',
                    title='❌ Leave Request Declined',
                    message='Your leave request for January 15-16 has been declined due to staffing requirements. Please contact your manager.',
                    priority='high',
                    action_url='/leave/my-applications',
                    action_text='View Reason',
                    category='leave_declined'
                )
                notifications_created += 1
            
            # Timecard reminders for random employees
            if employee.id % 4 == 0:
                NotificationService.create_notification(
                    user_id=employee.id,
                    type_name='timecard_reminder',
                    title='⏰ Timecard Due Today',
                    message='Your timecard for this week is due by 5:00 PM today. Don\'t forget to submit!',
                    priority='high',
                    action_url='/time-attendance',
                    action_text='Submit Now',
                    category='timecard_due',
                    expires_hours=8  # Expires in 8 hours
                )
                notifications_created += 1
            
            # Schedule notifications
            if employee.id % 5 == 0:
                NotificationService.create_notification(
                    user_id=employee.id,
                    type_name='schedule_change',
                    title='Shift Time Changed',
                    message='Your Thursday shift has been updated: 2:00 PM - 10:00 PM (was 1:00 PM - 9:00 PM).',
                    priority='high',
                    action_url='/scheduling',
                    action_text='View Schedule',
                    category='shift_change'
                )
                notifications_created += 1
        
        # Super User notifications
        for super_user in super_users:
            # System alerts
            NotificationService.create_notification(
                user_id=super_user.id,
                type_name='system_alert',
                title='🔧 Database Backup Completed',
                message='Weekly database backup completed successfully at 2:00 AM. All data is secure.',
                priority='medium',
                action_url='/admin/system-logs',
                action_text='View Logs',
                category='system_maintenance'
            )
            notifications_created += 1
            
            # Security alert
            NotificationService.create_notification(
                user_id=super_user.id,
                type_name='system_alert',
                title='🔒 Multiple Failed Login Attempts',
                message='User account "jsmith" has had 5 failed login attempts in the last hour. Account temporarily locked.',
                priority='urgent',
                action_url='/admin/security-logs',
                action_text='Investigate',
                category='security_alert'
            )
            notifications_created += 1
            
            # Performance alert
            NotificationService.create_notification(
                user_id=super_user.id,
                type_name='system_alert',
                title='📊 High System Load Detected',
                message='Server CPU usage has exceeded 85% for the past 15 minutes. Monitor performance closely.',
                priority='high',
                action_url='/admin/performance',
                action_text='View Metrics',
                category='performance_alert',
                expires_hours=2
            )
            notifications_created += 1
        
        # Cross-role notifications (system-wide announcements)
        all_active_users = User.query.filter_by(is_active=True).all()
        for user in all_active_users[:15]:  # Limit to first 15 users
            NotificationService.create_notification(
                user_id=user.id,
                type_name='system_alert',
                title='📢 Holiday Schedule Announcement',
                message='Company will be closed December 25-26 and January 1. Regular operations resume January 2.',
                priority='medium',
                action_url='/announcements',
                action_text='View Details',
                category='company_announcement',
                expires_hours=168  # Expires in 1 week
            )
            notifications_created += 1
        
        print(f"Created {notifications_created} role-specific test notifications")
        return notifications_created

def create_time_sensitive_notifications():
    """Create time-sensitive notifications for testing urgency levels"""
    
    app = create_app()
    with app.app_context():
        
        # Get a few active users
        users = User.query.filter_by(is_active=True).limit(5).all()
        notifications_created = 0
        
        for user in users:
            # Critical system outage (expires in 2 hours)
            NotificationService.create_notification(
                user_id=user.id,
                type_name='system_alert',
                title='🚨 CRITICAL: Payment System Outage',
                message='Payment processing is currently unavailable. Estimated resolution: 2 hours. Use manual backup procedures.',
                priority='urgent',
                action_url='/admin/system-status',
                action_text='View Status',
                category='critical_outage',
                expires_hours=2
            )
            notifications_created += 1
            
            # Upcoming deadline reminder
            NotificationService.create_notification(
                user_id=user.id,
                type_name='timecard_reminder',
                title='⚠️ Final Notice: Monthly Reports Due',
                message='Monthly performance reports are due in 2 hours. This is your final reminder.',
                priority='urgent',
                action_url='/reports/monthly',
                action_text='Submit Report',
                category='deadline_final',
                expires_hours=2
            )
            notifications_created += 1
        
        print(f"Created {notifications_created} time-sensitive notifications")
        return notifications_created

if __name__ == "__main__":
    print("Creating specific test notifications...")
    role_count = create_role_specific_notifications()
    time_count = create_time_sensitive_notifications()
    total = role_count + time_count
    print(f"\nTotal notifications created: {total}")
    print("Notification testing scenarios completed!")