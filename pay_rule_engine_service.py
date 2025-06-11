"""
Pay Rule Engine Service - Core payroll calculation logic
Handles complex pay calculations based on configurable rules
"""

import json
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from models import PayRule, TimeEntry, User, PayCalculation
from app import db


class PayRuleEngine:
    """Core engine for processing pay rules and calculating payroll"""
    
    def __init__(self):
        self.debug_mode = False
        self.calculation_log = []
    
    def enable_debug(self):
        """Enable debug mode for detailed calculation logging"""
        self.debug_mode = True
        self.calculation_log = []
    
    def log_debug(self, message: str):
        """Log debug message if debug mode is enabled"""
        if self.debug_mode:
            self.calculation_log.append(f"[{datetime.now()}] {message}")
    
    def calculate_pay(self, time_entries: List[TimeEntry], pay_rules: Optional[List[PayRule]] = None, 
                     pay_period_start: Optional[date] = None, pay_period_end: Optional[date] = None) -> Dict[str, Any]:
        """
        Calculate pay for given time entries using configured pay rules
        
        Args:
            time_entries: List of TimeEntry objects to process
            pay_rules: Optional list of PayRule objects (if None, fetches active rules)
            pay_period_start: Start date of pay period
            pay_period_end: End date of pay period
            
        Returns:
            Dictionary containing pay calculation results
        """
        self.log_debug("Starting pay calculation")
        
        if not time_entries:
            return {
                'total_hours': 0.0,
                'pay_components': {},
                'summary': {'regular_hours': 0.0, 'overtime_hours': 0.0, 'total_allowances': 0.0},
                'debug_log': self.calculation_log if self.debug_mode else []
            }
        
        # Get active pay rules if not provided
        if pay_rules is None:
            pay_rules = PayRule.query.filter_by(is_active=True).order_by(PayRule.priority.asc()).all()
            self.log_debug(f"Loaded {len(pay_rules)} active pay rules")
        
        # Group time entries by employee
        entries_by_employee = {}
        for entry in time_entries:
            if entry.user_id not in entries_by_employee:
                entries_by_employee[entry.user_id] = []
            entries_by_employee[entry.user_id].append(entry)
        
        results = {}
        
        # Process each employee's time entries
        for user_id, user_entries in entries_by_employee.items():
            user = User.query.get(user_id)
            if not user:
                self.log_debug(f"User {user_id} not found, skipping")
                continue
                
            self.log_debug(f"Processing {len(user_entries)} entries for user {user.username}")
            
            employee_result = self._calculate_employee_pay(user_entries, pay_rules, user)
            results[user_id] = employee_result
        
        # Aggregate results
        total_result = self._aggregate_results(results)
        total_result['debug_log'] = self.calculation_log if self.debug_mode else []
        
        return total_result
    
    def _calculate_employee_pay(self, time_entries: List[TimeEntry], pay_rules: List[PayRule], user: User) -> Dict[str, Any]:
        """Calculate pay for a single employee"""
        self.log_debug(f"Calculating pay for employee {user.username}")
        
        pay_components = {}
        total_hours = 0.0
        
        # Create context for rule evaluation
        context = {
            'user': user,
            'user_roles': [role.name for role in user.roles] if hasattr(user, 'roles') and user.roles else [],
            'total_entries': len(time_entries)
        }
        
        # Process each time entry
        for entry in time_entries:
            # Safely get total hours, handling potential None values
            entry_hours = getattr(entry, 'total_hours', 0.0)
            if entry_hours is None:
                entry_hours = 0.0
            total_hours += entry_hours
            
            self.log_debug(f"Processing entry {entry.id}: {entry_hours} hours on {entry.work_date}")
            
            # Apply pay rules in priority order
            entry_components = self._apply_rules_to_entry(entry, pay_rules, context)
            
            # Merge components
            for component_name, component_data in entry_components.items():
                if component_name not in pay_components:
                    pay_components[component_name] = {
                        'hours': 0.0,
                        'amount': 0.0,
                        'multiplier': component_data.get('multiplier', 1.0),
                        'differential': component_data.get('differential', 0.0),
                        'type': component_data.get('type', 'hours'),
                        'rules_applied': []
                    }
                
                # Accumulate hours and amounts
                if 'hours' in component_data:
                    pay_components[component_name]['hours'] += component_data['hours']
                if 'amount' in component_data:
                    pay_components[component_name]['amount'] += component_data['amount']
                
                # Track which rules were applied
                if 'rule_name' in component_data:
                    pay_components[component_name]['rules_applied'].append(component_data['rule_name'])
        
        # Calculate default regular hours if no rules specified
        if not any(comp.get('type') == 'regular' for comp in pay_components.values()):
            regular_hours = self._calculate_regular_hours(time_entries, pay_components)
            if regular_hours > 0:
                pay_components['regular_hours'] = {
                    'hours': regular_hours,
                    'multiplier': 1.0,
                    'type': 'regular',
                    'rules_applied': ['default']
                }
        
        # Generate summary
        summary = self._generate_summary(pay_components)
        
        return {
            'user_id': user.id,
            'username': user.username,
            'total_hours': total_hours,
            'pay_components': pay_components,
            'summary': summary
        }
    
    def _apply_rules_to_entry(self, time_entry: TimeEntry, pay_rules: List[PayRule], context: Dict[str, Any]) -> Dict[str, Any]:
        """Apply pay rules to a single time entry"""
        entry_components = {}
        
        for rule in pay_rules:
            if rule.matches_conditions(time_entry, context):
                self.log_debug(f"Rule '{rule.name}' matches entry {time_entry.id}")
                
                rule_components = rule.apply_actions(time_entry, context)
                
                # Merge rule components
                for component_name, component_data in rule_components.items():
                    if component_name in entry_components:
                        # Handle conflicts - later rules override unless specified otherwise
                        self.log_debug(f"Component '{component_name}' conflict - rule '{rule.name}' overriding")
                    
                    entry_components[component_name] = component_data
            else:
                self.log_debug(f"Rule '{rule.name}' does not match entry {time_entry.id}")
        
        return entry_components
    
    def _calculate_regular_hours(self, time_entries: List[TimeEntry], pay_components: Dict[str, Any]) -> float:
        """Calculate regular hours not covered by other rules"""
        total_hours = sum(getattr(entry, 'total_hours', 0.0) or 0.0 for entry in time_entries)
        
        # Subtract hours already accounted for by other rules
        accounted_hours = 0.0
        for component_name, component_data in pay_components.items():
            if component_data.get('type') == 'hours' and 'hours' in component_data:
                accounted_hours += component_data['hours']
        
        return max(0.0, total_hours - accounted_hours)
    
    def _generate_summary(self, pay_components: Dict[str, Any]) -> Dict[str, float]:
        """Generate summary statistics from pay components"""
        summary = {
            'regular_hours': 0.0,
            'overtime_hours': 0.0,
            'double_time_hours': 0.0,
            'total_allowances': 0.0,
            'shift_differentials': 0.0
        }
        
        for component_name, component_data in pay_components.items():
            component_type = component_data.get('type', 'hours')
            multiplier = component_data.get('multiplier', 1.0)
            hours = component_data.get('hours', 0.0)
            amount = component_data.get('amount', 0.0)
            
            if component_type == 'regular' or multiplier == 1.0:
                summary['regular_hours'] += hours
            elif multiplier == 1.5:
                summary['overtime_hours'] += hours
            elif multiplier >= 2.0:
                summary['double_time_hours'] += hours
            elif component_type == 'allowance':
                summary['total_allowances'] += amount
            elif 'differential' in component_data:
                summary['shift_differentials'] += component_data['differential'] * hours
        
        return summary
    
    def _aggregate_results(self, employee_results: Dict[int, Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate results across all employees"""
        total_summary = {
            'regular_hours': 0.0,
            'overtime_hours': 0.0,
            'double_time_hours': 0.0,
            'total_allowances': 0.0,
            'shift_differentials': 0.0
        }
        
        total_hours = 0.0
        all_components = {}
        
        for user_id, result in employee_results.items():
            total_hours += result['total_hours']
            
            # Aggregate summary
            for key, value in result['summary'].items():
                if key in total_summary:
                    total_summary[key] += value
            
            # Aggregate components by type
            for component_name, component_data in result['pay_components'].items():
                if component_name not in all_components:
                    all_components[component_name] = {
                        'total_hours': 0.0,
                        'total_amount': 0.0,
                        'employee_count': 0,
                        'type': component_data.get('type', 'hours')
                    }
                
                all_components[component_name]['total_hours'] += component_data.get('hours', 0.0)
                all_components[component_name]['total_amount'] += component_data.get('amount', 0.0)
                all_components[component_name]['employee_count'] += 1
        
        return {
            'total_hours': total_hours,
            'employee_results': employee_results,
            'pay_components': all_components,
            'summary': total_summary,
            'employee_count': len(employee_results)
        }


def test_pay_rules(time_entries: List[TimeEntry], pay_rules: List[PayRule]) -> Dict[str, Any]:
    """
    Test pay rules against sample time entries for validation
    
    Args:
        time_entries: Sample time entries to test against
        pay_rules: Pay rules to validate
        
    Returns:
        Test results with validation feedback
    """
    engine = PayRuleEngine()
    engine.enable_debug()
    
    # Run calculation
    results = engine.calculate_pay(time_entries, pay_rules)
    
    # Validate results
    validation_issues = []
    
    # Check for basic issues
    if results['total_hours'] <= 0:
        validation_issues.append("No hours calculated - check rule conditions")
    
    # Check for overlapping rules
    for employee_result in results.get('employee_results', {}).values():
        components = employee_result.get('pay_components', {})
        total_component_hours = sum(comp.get('hours', 0) for comp in components.values() 
                                  if comp.get('type') == 'hours')
        
        if total_component_hours > employee_result['total_hours'] * 1.1:  # Allow 10% tolerance
            validation_issues.append(f"Possible rule overlap for {employee_result['username']} - "
                                   f"component hours ({total_component_hours}) exceed total hours")
    
    # Check for missing regular time
    if results['summary']['regular_hours'] <= 0 and results['total_hours'] > 0:
        validation_issues.append("No regular hours calculated - may need default rule")
    
    return {
        'calculation_results': results,
        'validation_issues': validation_issues,
        'debug_log': results.get('debug_log', []),
        'test_passed': len(validation_issues) == 0
    }


def save_pay_calculation(employee_id: int, time_entry_ids: List[int], pay_components: Dict[str, Any], 
                        pay_period_start: date, pay_period_end: date, calculated_by_id: int) -> PayCalculation:
    """
    Save calculated pay results to database
    
    Args:
        employee_id: ID of employee
        time_entry_ids: List of time entry IDs included in calculation
        pay_components: Calculated pay components
        pay_period_start: Start of pay period
        pay_period_end: End of pay period
        calculated_by_id: ID of user who performed calculation
        
    Returns:
        Saved PayCalculation object
    """
    # Calculate summary values
    summary = PayRuleEngine()._generate_summary({}, pay_components)
    
    calculation = PayCalculation(
        user_id=employee_id,
        time_entry_id=time_entry_ids[0] if time_entry_ids else None,  # Primary entry
        pay_period_start=pay_period_start,
        pay_period_end=pay_period_end,
        total_hours=sum(comp.get('hours', 0) for comp in pay_components.values()),
        regular_hours=summary['regular_hours'],
        overtime_hours=summary['overtime_hours'],
        double_time_hours=summary['double_time_hours'],
        total_allowances=summary['total_allowances'],
        calculated_by_id=calculated_by_id
    )
    
    calculation.set_pay_components(pay_components)
    
    db.session.add(calculation)
    db.session.commit()
    
    return calculation


# Example pay rule configurations for common scenarios
EXAMPLE_PAY_RULES = {
    'overtime_1_5': {
        'name': 'Overtime 1.5x',
        'description': 'Time and a half for hours over 8 per day',
        'conditions': {'overtime_threshold': 8.0},
        'actions': {'pay_multiplier': 1.5, 'component_name': 'overtime_1_5'},
        'priority': 10
    },
    'weekend_differential': {
        'name': 'Weekend Differential',
        'description': 'R2/hour differential for weekend work',
        'conditions': {'day_of_week': [5, 6]},  # Saturday, Sunday
        'actions': {'shift_differential': 2.0, 'differential_name': 'weekend_diff'},
        'priority': 20
    },
    'night_shift': {
        'name': 'Night Shift Premium',
        'description': '10% premium for overnight shifts',
        'conditions': {'time_range': {'start': 22, 'end': 6}},
        'actions': {'pay_multiplier': 1.1, 'component_name': 'night_shift'},
        'priority': 30
    },
    'holiday_double': {
        'name': 'Holiday Double Time',
        'description': 'Double time for holiday work',
        'conditions': {'holiday': True},  # Requires custom logic
        'actions': {'pay_multiplier': 2.0, 'component_name': 'holiday_pay'},
        'priority': 5
    }
}