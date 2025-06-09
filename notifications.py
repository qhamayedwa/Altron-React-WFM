"""
Notification System for WFM Platform
Handles creation, management, and delivery of notifications for various system events
"""

from datetime import datetime, timedelta
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_required, current_user
from sqlalchemy import and_, or_, desc
from app import db
from models import Notification, NotificationType, NotificationPreference, User, LeaveApplication, Schedule
from auth_simple import role_required
from dashboard_management import get_managed_departments

# Create notifications blueprint
notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

class NotificationService:
    """Service class for managing notifications"""
    
    @staticmethod
    def create_notification(user_id, type_name, title, message, 
                          action_url=None, action_text=None, priority='medium',
                          category=None, related_entity_type=None, related_entity_id=None,
                          expires_hours=None):
        """
        Create a new notification for a user
        
        Args:
            user_id: Target user ID
            type_name: Notification type name
            title: Notification title
            message: Notification message
            action_url: Optional URL for action button
            action_text: Optional text for action button
            priority: Priority level (low, medium, high, urgent)
            category: Category for grouping
            related_entity_type: Related model name
            related_entity_id: Related model ID
            expires_hours: Hours until notification expires
        """
        try:
            # Get notification type
            notification_type = NotificationType.query.filter_by(name=type_name).first()
            if not notification_type:
                # Create default type if it doesn't exist
                notification_type = NotificationType(
                    name=type_name,
                    display_name=type_name.replace('_', ' ').title(),
                    icon='bell',
                    color='primary'
                )
                db.session.add(notification_type)
                db.session.flush()
            
            # Calculate expiration if specified
            expires_at = None
            if expires_hours:
                expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
            
            # Create notification
            notification = Notification(
                user_id=user_id,
                type_id=notification_type.id,
                title=title,
                message=message,
                action_url=action_url,
                action_text=action_text,
                priority=priority,
                category=category,
                related_entity_type=related_entity_type,
                related_entity_id=related_entity_id,
                expires_at=expires_at
            )
            
            db.session.add(notification)
            db.session.commit()
            
            return notification
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating notification: {str(e)}")
            return None
    
    @staticmethod
    def create_leave_approval_notification(leave_application_id):
        """Create notification for leave approval needed"""
        try:
            leave_app = LeaveApplication.query.get(leave_application_id)
            if not leave_app:
                return None
            
            # Get the employee's manager(s)
            if leave_app.user.department_id:
                # Get managers who oversee this department
                from models import Department
                department = Department.query.get(leave_app.user.department_id)
                if department:
                    managers = []
                    if department.manager_id:
                        managers.append(department.manager_id)
                    if department.deputy_manager_id:
                        managers.append(department.deputy_manager_id)
                    
                    # Create notifications for managers
                    for manager_id in managers:
                        NotificationService.create_notification(
                            user_id=manager_id,
                            type_name='leave_approval_required',
                            title='Leave Approval Required',
                            message=f'{leave_app.user.full_name or leave_app.user.username} has requested {leave_app.total_days} days of {leave_app.leave_type.name if leave_app.leave_type else "leave"} from {leave_app.start_date.strftime("%b %d")} to {leave_app.end_date.strftime("%b %d")}',
                            action_url=url_for('leave_management.team_applications'),
                            action_text='Review Request',
                            priority='high',
                            category='leave',
                            related_entity_type='LeaveApplication',
                            related_entity_id=leave_application_id,
                            expires_hours=168  # 7 days
                        )
            
        except Exception as e:
            print(f"Error creating leave approval notification: {str(e)}")
    
    @staticmethod
    def create_leave_status_notification(leave_application_id, status):
        """Create notification for leave status change"""
        try:
            leave_app = LeaveApplication.query.get(leave_application_id)
            if not leave_app:
                return None
            
            status_messages = {
                'Approved': f'Your leave request from {leave_app.start_date.strftime("%b %d")} to {leave_app.end_date.strftime("%b %d")} has been approved.',
                'Rejected': f'Your leave request from {leave_app.start_date.strftime("%b %d")} to {leave_app.end_date.strftime("%b %d")} has been rejected.',
                'Cancelled': f'Your leave request from {leave_app.start_date.strftime("%b %d")} to {leave_app.end_date.strftime("%b %d")} has been cancelled.'
            }
            
            priority_map = {
                'Approved': 'medium',
                'Rejected': 'high',
                'Cancelled': 'low'
            }
            
            NotificationService.create_notification(
                user_id=leave_app.user_id,
                type_name='leave_status_update',
                title=f'Leave Request {status}',
                message=status_messages.get(status, f'Your leave request status has been updated to {status}.'),
                action_url=url_for('leave_management.my_applications'),
                action_text='View Details',
                priority=priority_map.get(status, 'medium'),
                category='leave',
                related_entity_type='LeaveApplication',
                related_entity_id=leave_application_id,
                expires_hours=72  # 3 days
            )
            
        except Exception as e:
            print(f"Error creating leave status notification: {str(e)}")
    
    @staticmethod
    def create_schedule_change_notification(schedule_id, change_type='updated'):
        """Create notification for schedule changes"""
        try:
            schedule = Schedule.query.get(schedule_id)
            if not schedule:
                return None
            
            change_messages = {
                'created': f'You have been scheduled to work on {schedule.date.strftime("%b %d, %Y")} from {schedule.start_time.strftime("%H:%M")} to {schedule.end_time.strftime("%H:%M")}.',
                'updated': f'Your schedule for {schedule.date.strftime("%b %d, %Y")} has been updated. New time: {schedule.start_time.strftime("%H:%M")} to {schedule.end_time.strftime("%H:%M")}.',
                'cancelled': f'Your schedule for {schedule.date.strftime("%b %d, %Y")} has been cancelled.'
            }
            
            NotificationService.create_notification(
                user_id=schedule.user_id,
                type_name='schedule_change',
                title=f'Schedule {change_type.title()}',
                message=change_messages.get(change_type, f'Your schedule has been {change_type}.'),
                action_url=url_for('scheduling.my_schedule'),
                action_text='View Schedule',
                priority='high',
                category='schedule',
                related_entity_type='Schedule',
                related_entity_id=schedule_id,
                expires_hours=24  # 1 day
            )
            
        except Exception as e:
            print(f"Error creating schedule change notification: {str(e)}")
    
    @staticmethod
    def create_timecard_reminder_notification(user_id):
        """Create notification for timecard reminders"""
        NotificationService.create_notification(
            user_id=user_id,
            type_name='timecard_reminder',
            title='Timecard Reminder',
            message='Don\'t forget to submit your timecard for this week.',
            action_url=url_for('time_attendance.my_timecard'),
            action_text='View Timecard',
            priority='medium',
            category='timecard',
            expires_hours=48  # 2 days
        )
    
    @staticmethod
    def get_user_notifications(user_id, limit=50, unread_only=False):
        """Get notifications for a user"""
        query = Notification.query.filter_by(user_id=user_id)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        # Filter out expired notifications
        query = query.filter(
            or_(
                Notification.expires_at.is_(None),
                Notification.expires_at > datetime.utcnow()
            )
        )
        
        return query.order_by(desc(Notification.created_at)).limit(limit).all()
    
    @staticmethod
    def get_unread_count(user_id):
        """Get count of unread notifications for a user"""
        return Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).filter(
            or_(
                Notification.expires_at.is_(None),
                Notification.expires_at > datetime.utcnow()
            )
        ).count()
    
    @staticmethod
    def mark_all_as_read(user_id):
        """Mark all notifications as read for a user"""
        notifications = Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).all()
        
        for notification in notifications:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
        
        db.session.commit()
        return len(notifications)
    
    @staticmethod
    def cleanup_expired_notifications():
        """Remove expired notifications"""
        expired_count = Notification.query.filter(
            Notification.expires_at < datetime.utcnow()
        ).delete()
        
        db.session.commit()
        return expired_count


# Routes

@notifications_bp.route('/')
@login_required
def notifications_page():
    """Main notifications page"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    filter_type = request.args.get('filter', 'all')  # all, unread, by_category
    category = request.args.get('category')
    
    # Base query
    query = Notification.query.filter_by(user_id=current_user.id)
    
    # Apply filters
    if filter_type == 'unread':
        query = query.filter_by(is_read=False)
    elif category:
        query = query.filter_by(category=category)
    
    # Filter out expired notifications
    query = query.filter(
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.utcnow()
        )
    )
    
    # Paginate
    notifications = query.order_by(desc(Notification.created_at)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Get notification categories for filter
    categories = db.session.query(Notification.category).filter_by(
        user_id=current_user.id
    ).distinct().all()
    categories = [cat[0] for cat in categories if cat[0]]
    
    return render_template('notifications/index.html',
                         notifications=notifications,
                         filter_type=filter_type,
                         category=category,
                         categories=categories)


@notifications_bp.route('/api/unread-count')
@login_required
def api_unread_count():
    """API endpoint to get unread notification count"""
    count = NotificationService.get_unread_count(current_user.id)
    return jsonify({'success': True, 'count': count})


@notifications_bp.route('/api/recent')
@login_required
def api_recent_notifications():
    """API endpoint to get recent notifications"""
    limit = request.args.get('limit', 5, type=int)
    notifications = NotificationService.get_user_notifications(current_user.id, limit=limit)
    
    return jsonify({
        'success': True,
        'notifications': [notification.to_dict() for notification in notifications]
    })


@notifications_bp.route('/api/mark-read/<int:notification_id>', methods=['POST'])
@login_required
def api_mark_read(notification_id):
    """Mark a specific notification as read"""
    notification = Notification.query.filter_by(
        id=notification_id,
        user_id=current_user.id
    ).first()
    
    if not notification:
        return jsonify({'success': False, 'message': 'Notification not found'})
    
    notification.mark_as_read()
    return jsonify({'success': True, 'message': 'Notification marked as read'})


@notifications_bp.route('/api/mark-all-read', methods=['POST'])
@login_required
def api_mark_all_read():
    """Mark all notifications as read"""
    count = NotificationService.mark_all_as_read(current_user.id)
    return jsonify({'success': True, 'message': f'{count} notifications marked as read'})


@notifications_bp.route('/preferences')
@login_required
def notification_preferences():
    """Notification preferences page"""
    # Get all notification types
    notification_types = NotificationType.query.filter_by(is_active=True).all()
    
    # Get user's current preferences
    user_preferences = {}
    for pref in current_user.notification_preferences:
        user_preferences[pref.type_id] = pref
    
    return render_template('notifications/preferences.html',
                         notification_types=notification_types,
                         user_preferences=user_preferences)


@notifications_bp.route('/preferences/save', methods=['POST'])
@login_required
def save_notification_preferences():
    """Save notification preferences"""
    try:
        notification_types = NotificationType.query.filter_by(is_active=True).all()
        
        for notification_type in notification_types:
            # Get or create preference
            preference = NotificationPreference.query.filter_by(
                user_id=current_user.id,
                type_id=notification_type.id
            ).first()
            
            if not preference:
                preference = NotificationPreference(
                    user_id=current_user.id,
                    type_id=notification_type.id
                )
                db.session.add(preference)
            
            # Update settings
            preference.web_enabled = request.form.get(f'web_{notification_type.id}') == 'on'
            preference.email_enabled = request.form.get(f'email_{notification_type.id}') == 'on'
            preference.immediate = request.form.get(f'immediate_{notification_type.id}') == 'on'
            preference.daily_digest = request.form.get(f'daily_{notification_type.id}') == 'on'
        
        db.session.commit()
        flash('Notification preferences saved successfully!', 'success')
        
    except Exception as e:
        db.session.rollback()
        flash(f'Error saving preferences: {str(e)}', 'danger')
    
    return redirect(url_for('notifications.notification_preferences'))


# Admin routes for managing notification types
@notifications_bp.route('/admin/types')
@role_required('Admin', 'Super User')
def manage_notification_types():
    """Manage notification types (Admin only)"""
    notification_types = NotificationType.query.order_by(NotificationType.name).all()
    return render_template('notifications/admin_types.html',
                         notification_types=notification_types)


def initialize_default_notification_types():
    """Initialize default notification types"""
    default_types = [
        {
            'name': 'leave_approval_required',
            'display_name': 'Leave Approval Required',
            'description': 'Notifications for managers when leave requests need approval',
            'icon': 'calendar-check',
            'color': 'warning',
            'priority': 'high'
        },
        {
            'name': 'leave_status_update',
            'display_name': 'Leave Status Update',
            'description': 'Notifications when leave request status changes',
            'icon': 'calendar',
            'color': 'info',
            'priority': 'medium'
        },
        {
            'name': 'schedule_change',
            'display_name': 'Schedule Change',
            'description': 'Notifications for schedule updates',
            'icon': 'clock',
            'color': 'primary',
            'priority': 'high'
        },
        {
            'name': 'timecard_reminder',
            'display_name': 'Timecard Reminder',
            'description': 'Reminders to submit timecards',
            'icon': 'clipboard',
            'color': 'secondary',
            'priority': 'medium'
        },
        {
            'name': 'system_alert',
            'display_name': 'System Alert',
            'description': 'System maintenance and alerts',
            'icon': 'alert-triangle',
            'color': 'danger',
            'priority': 'urgent'
        }
    ]
    
    for type_data in default_types:
        existing = NotificationType.query.filter_by(name=type_data['name']).first()
        if not existing:
            notification_type = NotificationType(**type_data)
            db.session.add(notification_type)
    
    db.session.commit()