"""
Enhanced AI Insights Service for WFM System
Provides real workforce analytics using actual time tracking and attendance data
"""

import logging
from datetime import date, datetime, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy import func, distinct
from models import TimeEntry, User, Schedule, LeaveApplication, db


class EnhancedWorkforceInsights:
    """Enhanced workforce analytics using actual data"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def analyze_scheduling_patterns(self, department_id: Optional[int] = None, days: int = 14) -> Dict[str, Any]:
        """Analyze workforce scheduling patterns using real time tracking data"""
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            # Query time entries as proxy for work patterns
            query = db.session.query(TimeEntry).filter(
                func.date(TimeEntry.clock_in_time) >= start_date,
                func.date(TimeEntry.clock_in_time) <= end_date,
                TimeEntry.clock_in_time.isnot(None)
            )
            
            if department_id:
                query = query.join(User).filter(User.department == str(department_id))
            
            time_entries = query.all()
            
            # Count unique employees who worked
            total_employees = len(set(entry.user_id for entry in time_entries))
            
            if not time_entries:
                return {
                    'total_employees': 0,
                    'peak_hours': [],
                    'schedule_adherence': 0,
                    'coverage_score': 0,
                    'departments_analyzed': 0,
                    'recommendations': ['Start tracking time to enable workforce analysis']
                }
            
            # Analyze peak working hours
            hour_distribution = {}
            daily_coverage = {}
            employee_hours = {}
            
            for entry in time_entries:
                if entry.clock_in_time and entry.clock_out_time:
                    # Track hourly patterns
                    work_start = entry.clock_in_time.hour
                    work_end = entry.clock_out_time.hour
                    
                    for hour in range(work_start, min(work_end + 1, 24)):
                        hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
                    
                    # Track daily coverage
                    work_date = entry.clock_in_time.date()
                    daily_coverage[work_date] = daily_coverage.get(work_date, 0) + 1
                    
                    # Track employee total hours
                    hours_worked = (entry.clock_out_time - entry.clock_in_time).total_seconds() / 3600
                    employee_hours[entry.user_id] = employee_hours.get(entry.user_id, 0) + hours_worked
            
            # Calculate peak hours (top 3 busiest hours)
            peak_hours = sorted(hour_distribution.items(), key=lambda x: x[1], reverse=True)[:3]
            peak_hours_list = [f"{hour:02d}:00" for hour, _ in peak_hours]
            
            # Calculate schedule adherence (percentage of days with coverage)
            working_days = len([d for d in daily_coverage.keys() if d.weekday() < 5])  # Weekdays only
            expected_working_days = len([d for d in 
                                       [start_date + timedelta(days=i) for i in range(days)] 
                                       if d.weekday() < 5])
            schedule_adherence = (working_days / expected_working_days) if expected_working_days > 0 else 0
            
            # Calculate coverage score based on consistent daily staffing
            avg_daily_staff = sum(daily_coverage.values()) / len(daily_coverage) if daily_coverage else 0
            coverage_score = min(1.0, avg_daily_staff / max(1, total_employees * 0.8))  # 80% expected coverage
            
            # Count departments analyzed
            departments = set()
            for entry in time_entries:
                if hasattr(entry, 'user') and entry.user and entry.user.department:
                    departments.add(entry.user.department)
            departments_analyzed = len(departments)
            
            # Generate recommendations
            recommendations = []
            if schedule_adherence < 0.8:
                recommendations.append("Improve schedule consistency - missing coverage on some days")
            if len(peak_hours_list) < 3:
                recommendations.append("Consider expanding operational hours for better coverage")
            if coverage_score < 0.7:
                recommendations.append("Increase staffing levels during peak periods")
            if not recommendations:
                recommendations.append("Workforce scheduling patterns look healthy")
            
            return {
                'total_employees': total_employees,
                'peak_hours': peak_hours_list,
                'schedule_adherence': schedule_adherence,
                'coverage_score': coverage_score,
                'departments_analyzed': departments_analyzed,
                'recommendations': recommendations
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing scheduling patterns: {e}")
            return {
                'total_employees': 0,
                'peak_hours': [],
                'schedule_adherence': 0,
                'coverage_score': 0,
                'departments_analyzed': 0,
                'recommendations': ['Error analyzing data - check system logs']
            }
    
    def analyze_attendance_patterns(self, employee_id: Optional[int] = None, days: int = 14) -> Dict[str, Any]:
        """Analyze attendance patterns using real time tracking data"""
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            # Query time entries
            query = db.session.query(TimeEntry).filter(
                func.date(TimeEntry.clock_in_time) >= start_date,
                func.date(TimeEntry.clock_in_time) <= end_date,
                TimeEntry.clock_in_time.isnot(None)
            )
            
            if employee_id:
                query = query.filter(TimeEntry.user_id == employee_id)
            
            time_entries = query.all()
            
            if not time_entries:
                return {
                    'attendance_rate': 0,
                    'avg_hours_per_day': 0,
                    'punctuality_rate': 0,
                    'employees_analyzed': 0
                }
            
            # Calculate attendance metrics
            total_work_days = 0
            total_hours = 0
            on_time_entries = 0
            employees = set()
            
            for entry in time_entries:
                if entry.clock_in_time and entry.clock_out_time:
                    total_work_days += 1
                    employees.add(entry.user_id)
                    
                    # Calculate hours worked
                    hours_worked = (entry.clock_out_time - entry.clock_in_time).total_seconds() / 3600
                    total_hours += hours_worked
                    
                    # Check punctuality (before 9:00 AM)
                    if entry.clock_in_time.hour <= 9:
                        on_time_entries += 1
            
            # Calculate rates
            expected_work_days = len([d for d in 
                                    [start_date + timedelta(days=i) for i in range(days)] 
                                    if d.weekday() < 5]) * len(employees)
            
            attendance_rate = (total_work_days / expected_work_days) if expected_work_days > 0 else 0
            avg_hours_per_day = (total_hours / total_work_days) if total_work_days > 0 else 0
            punctuality_rate = (on_time_entries / total_work_days) if total_work_days > 0 else 0
            
            return {
                'attendance_rate': attendance_rate,
                'avg_hours_per_day': avg_hours_per_day,
                'punctuality_rate': punctuality_rate,
                'employees_analyzed': len(employees)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing attendance patterns: {e}")
            return {
                'attendance_rate': 0,
                'avg_hours_per_day': 0,
                'punctuality_rate': 0,
                'employees_analyzed': 0
            }


# Initialize enhanced insights service
enhanced_insights = EnhancedWorkforceInsights()