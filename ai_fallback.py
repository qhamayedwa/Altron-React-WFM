"""
AI Fallback Service for WFM System
Provides intelligent insights using statistical analysis when OpenAI is unavailable
"""

import logging
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from sqlalchemy import func, and_, or_
from app import db
from models import User, TimeEntry, Schedule, LeaveApplication, PayRule, PayCalculation


class WFMFallbackIntelligence:
    """Statistical analysis-based workforce management intelligence"""
    
    def analyze_scheduling_patterns(self, department_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Analyze scheduling patterns using statistical methods"""
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            query = Schedule.query.filter(
                func.date(Schedule.start_time) >= start_date,
                func.date(Schedule.start_time) <= end_date
            )
            
            if department_id:
                query = query.join(User).filter(User.department == str(department_id))
            
            schedules = query.all()
            
            # Statistical analysis
            total_schedules = len(schedules)
            if total_schedules == 0:
                return {
                    'success': True,
                    'suggestions': {
                        'patterns': ['No scheduling data available for analysis'],
                        'efficiency_score': 0,
                        'recommendations': ['Start creating schedules to enable pattern analysis']
                    }
                }
            
            # Calculate patterns
            weekday_distribution = {}
            hour_distribution = {}
            employee_workload = {}
            
            for schedule in schedules:
                # Weekday analysis
                weekday = schedule.start_time.strftime('%A')
                weekday_distribution[weekday] = weekday_distribution.get(weekday, 0) + 1
                
                # Hour analysis
                hour = schedule.start_time.hour
                hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
                
                # Employee workload
                emp_id = schedule.user_id
                employee_workload[emp_id] = employee_workload.get(emp_id, 0) + 1
            
            # Find patterns
            busiest_day = max(weekday_distribution, key=weekday_distribution.get) if weekday_distribution else 'N/A'
            peak_hour = max(hour_distribution, key=hour_distribution.get) if hour_distribution else 'N/A'
            
            # Calculate efficiency score based on distribution evenness
            workload_values = list(employee_workload.values())
            avg_workload = sum(workload_values) / len(workload_values) if workload_values else 0
            workload_variance = sum((x - avg_workload) ** 2 for x in workload_values) / len(workload_values) if workload_values else 0
            efficiency_score = max(0, min(100, 100 - (workload_variance * 10)))
            
            recommendations = []
            if workload_variance > 2:
                recommendations.append("Consider redistributing workload more evenly among employees")
            if len(weekday_distribution) < 5:
                recommendations.append("Consider expanding schedule coverage to more weekdays")
            if efficiency_score < 70:
                recommendations.append("Review scheduling patterns for optimization opportunities")
            
            return {
                'success': True,
                'suggestions': {
                    'patterns': [
                        f"Busiest day: {busiest_day}",
                        f"Peak scheduling hour: {peak_hour}:00",
                        f"Total schedules analyzed: {total_schedules}",
                        f"Average workload per employee: {avg_workload:.1f}"
                    ],
                    'efficiency_score': int(efficiency_score),
                    'recommendations': recommendations or ['Current scheduling appears well-balanced']
                }
            }
            
        except Exception as e:
            logging.error(f"Fallback scheduling analysis error: {e}")
            return {
                'success': False,
                'error': str(e),
                'suggestions': {
                    'patterns': ['Analysis temporarily unavailable'],
                    'efficiency_score': 0,
                    'recommendations': ['Please try again later']
                }
            }
    
    def generate_payroll_insights(self, pay_period_start: date, pay_period_end: date) -> Dict[str, Any]:
        """Generate payroll insights using statistical analysis"""
        try:
            # Get time entries for the period
            time_entries = TimeEntry.query.filter(
                func.date(TimeEntry.clock_in_time) >= pay_period_start,
                func.date(TimeEntry.clock_in_time) <= pay_period_end,
                TimeEntry.total_hours.isnot(None)
            ).all()
            
            if not time_entries:
                return {
                    'success': True,
                    'insights': {
                        'anomalies_detected': [],
                        'cost_analysis': {
                            'total_payroll_cost': 'No data available',
                            'overtime_percentage': '0%',
                            'average_hourly_rate': 'N/A'
                        },
                        'recommendations': ['No time entries found for this period'],
                        'compliance_notes': ['Ensure employees are tracking their time'],
                        'efficiency_insights': ['Time tracking adoption appears low']
                    }
                }
            
            # Statistical analysis
            total_hours = sum(float(entry.total_hours) for entry in time_entries if entry.total_hours)
            employee_hours = {}
            daily_totals = {}
            
            for entry in time_entries:
                if entry.total_hours:
                    # Employee analysis
                    emp_id = entry.user_id
                    employee_hours[emp_id] = employee_hours.get(emp_id, 0) + float(entry.total_hours)
                    
                    # Daily analysis
                    day = entry.clock_in_time.date()
                    daily_totals[day] = daily_totals.get(day, 0) + float(entry.total_hours)
            
            # Detect anomalies
            anomalies = []
            avg_daily_hours = sum(daily_totals.values()) / len(daily_totals) if daily_totals else 0
            
            for day, hours in daily_totals.items():
                if hours > avg_daily_hours * 1.5:
                    anomalies.append({
                        'type': 'high_daily_hours',
                        'date': day.isoformat(),
                        'description': f'Unusually high daily hours: {hours:.1f}',
                        'severity': 'medium'
                    })
            
            for emp_id, hours in employee_hours.items():
                if hours > 50:  # Potential overtime
                    anomalies.append({
                        'type': 'potential_overtime',
                        'employee_id': str(emp_id),
                        'description': f'Employee worked {hours:.1f} hours this period',
                        'severity': 'high' if hours > 60 else 'medium'
                    })
            
            # Calculate metrics
            overtime_hours = sum(max(0, hours - 40) for hours in employee_hours.values())
            overtime_percentage = (overtime_hours / total_hours * 100) if total_hours > 0 else 0
            
            recommendations = []
            if overtime_percentage > 10:
                recommendations.append("Consider hiring additional staff to reduce overtime")
            if len(employee_hours) < 5:
                recommendations.append("Monitor staffing levels for adequate coverage")
            if avg_daily_hours < 20:
                recommendations.append("Review daily scheduling to optimize productivity")
            
            return {
                'success': True,
                'insights': {
                    'anomalies_detected': anomalies,
                    'cost_analysis': {
                        'total_hours_worked': f"{total_hours:.1f}",
                        'overtime_percentage': f"{overtime_percentage:.1f}%",
                        'employees_tracked': str(len(employee_hours))
                    },
                    'recommendations': recommendations or ['Payroll patterns appear normal'],
                    'compliance_notes': ['Review overtime policies if applicable'],
                    'efficiency_insights': [
                        f'Average daily hours: {avg_daily_hours:.1f}',
                        f'Peak workday hours: {max(daily_totals.values()) if daily_totals else 0:.1f}'
                    ]
                }
            }
            
        except Exception as e:
            logging.error(f"Fallback payroll analysis error: {e}")
            return {
                'success': False,
                'error': str(e),
                'insights': {
                    'anomalies_detected': [],
                    'cost_analysis': {'total_payroll_cost': 'Error calculating'},
                    'recommendations': ['Please try again later']
                }
            }
    
    def analyze_attendance_patterns(self, employee_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Analyze attendance patterns using statistical methods"""
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days)
            
            query = TimeEntry.query.filter(
                func.date(TimeEntry.clock_in_time) >= start_date,
                func.date(TimeEntry.clock_in_time) <= end_date
            )
            
            if employee_id:
                query = query.filter(TimeEntry.user_id == employee_id)
            
            entries = query.all()
            
            if not entries:
                return {
                    'success': True,
                    'insights': {
                        'patterns': ['No attendance data available'],
                        'risk_factors': [],
                        'recommendations': ['Encourage employees to use time tracking']
                    }
                }
            
            # Pattern analysis
            daily_attendance = {}
            late_arrivals = 0
            early_departures = 0
            employee_attendance = {}
            
            for entry in entries:
                day = entry.clock_in_time.date()
                daily_attendance[day] = daily_attendance.get(day, 0) + 1
                
                # Employee tracking
                emp_id = entry.user_id
                employee_attendance[emp_id] = employee_attendance.get(emp_id, 0) + 1
                
                # Late arrival check (after 9 AM)
                if entry.clock_in_time.hour > 9:
                    late_arrivals += 1
                
                # Early departure check (before 5 PM if clock out exists)
                if entry.clock_out_time and entry.clock_out_time.hour < 17:
                    early_departures += 1
            
            # Calculate insights
            avg_daily_attendance = sum(daily_attendance.values()) / len(daily_attendance) if daily_attendance else 0
            total_entries = len(entries)
            late_percentage = (late_arrivals / total_entries * 100) if total_entries > 0 else 0
            
            patterns = [
                f"Total attendance entries: {total_entries}",
                f"Average daily attendance: {avg_daily_attendance:.1f}",
                f"Late arrivals: {late_percentage:.1f}%"
            ]
            
            risk_factors = []
            if late_percentage > 20:
                risk_factors.append("High rate of late arrivals detected")
            if avg_daily_attendance < 5:
                risk_factors.append("Low daily attendance rates")
            
            recommendations = []
            if late_percentage > 15:
                recommendations.append("Consider reviewing arrival time policies")
            if len(employee_attendance) < 10:
                recommendations.append("Encourage more employees to use time tracking")
            
            return {
                'success': True,
                'insights': {
                    'patterns': patterns,
                    'risk_factors': risk_factors or ['No significant risk factors detected'],
                    'recommendations': recommendations or ['Attendance patterns appear normal'],
                    'period_summary': f"Analysis of {days} days ending {end_date}"
                }
            }
            
        except Exception as e:
            logging.error(f"Fallback attendance analysis error: {e}")
            return {
                'success': False,
                'error': str(e),
                'insights': {
                    'patterns': ['Analysis temporarily unavailable'],
                    'risk_factors': [],
                    'recommendations': ['Please try again later']
                }
            }

# Global fallback service instance
fallback_service = WFMFallbackIntelligence()