from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from sqlalchemy import and_, or_, func
from app import db
from models import PayRule, PayCalculation, TimeEntry, User
from auth_simple import super_user_required
from pay_rule_engine_service import PayRuleEngine, test_pay_rules, save_pay_calculation, EXAMPLE_PAY_RULES
import json

# Create pay rules blueprint
pay_rules_bp = Blueprint('pay_rules', __name__, url_prefix='/pay-rules')

@pay_rules_bp.route('/')
@super_user_required
def manage_pay_rules():
    """Manage pay rules dashboard"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    status_filter = request.args.get('status')
    
    query = PayRule.query
    
    if status_filter == 'active':
        query = query.filter_by(is_active=True)
    elif status_filter == 'inactive':
        query = query.filter_by(is_active=False)
    
    pay_rules = query.order_by(PayRule.priority.asc(), PayRule.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('pay_rules/manage_rules.html',
                         pay_rules=pay_rules,
                         status_filter=status_filter)

@pay_rules_bp.route('/create', methods=['GET', 'POST'])
@super_user_required
def create_pay_rule():
    """Create a new pay rule"""
    if request.method == 'POST':
        try:
            name = request.form.get('name')
            description = request.form.get('description', '')
            priority = int(request.form.get('priority', 100))
            
            # Parse conditions from form
            conditions = {}
            
            # Day of week conditions
            selected_days = request.form.getlist('day_of_week')
            if selected_days:
                conditions['day_of_week'] = [int(day) for day in selected_days]
            
            # Time range conditions
            start_hour = request.form.get('start_hour')
            end_hour = request.form.get('end_hour')
            if start_hour and end_hour:
                conditions['time_range'] = {
                    'start': int(start_hour),
                    'end': int(end_hour)
                }
            
            # Overtime threshold
            overtime_threshold = request.form.get('overtime_threshold')
            if overtime_threshold:
                conditions['overtime_threshold'] = float(overtime_threshold)
            
            # Employee IDs
            employee_ids = request.form.get('employee_ids')
            if employee_ids:
                conditions['employee_ids'] = [int(id.strip()) for id in employee_ids.split(',') if id.strip()]
            
            # Role conditions
            selected_roles = request.form.getlist('roles')
            if selected_roles:
                conditions['roles'] = selected_roles
            
            # Parse actions from form
            actions = {}
            
            # Pay multiplier
            pay_multiplier = request.form.get('pay_multiplier')
            if pay_multiplier:
                actions['pay_multiplier'] = float(pay_multiplier)
                actions['component_name'] = request.form.get('component_name', name.lower().replace(' ', '_'))
            
            # Flat allowance
            flat_allowance = request.form.get('flat_allowance')
            if flat_allowance:
                actions['flat_allowance'] = float(flat_allowance)
                actions['allowance_name'] = request.form.get('allowance_name', f"{name.lower().replace(' ', '_')}_allowance")
            
            # Shift differential
            shift_differential = request.form.get('shift_differential')
            if shift_differential:
                actions['shift_differential'] = float(shift_differential)
                actions['differential_name'] = request.form.get('differential_name', f"{name.lower().replace(' ', '_')}_diff")
            
            if not name:
                flash('Rule name is required.', 'danger')
                return render_template('pay_rules/create_rule.html')
            
            if not conditions:
                flash('At least one condition must be specified.', 'danger')
                return render_template('pay_rules/create_rule.html')
            
            if not actions:
                flash('At least one action must be specified.', 'danger')
                return render_template('pay_rules/create_rule.html')
            
            # Check if rule name already exists
            if PayRule.query.filter_by(name=name).first():
                flash('A pay rule with this name already exists.', 'danger')
                return render_template('pay_rules/create_rule.html')
            
            pay_rule = PayRule(
                name=name,
                description=description,
                priority=priority,
                created_by_id=current_user.id
            )
            
            pay_rule.set_conditions(conditions)
            pay_rule.set_actions(actions)
            
            db.session.add(pay_rule)
            db.session.commit()
            
            flash(f'Pay rule "{name}" created successfully!', 'success')
            return redirect(url_for('pay_rules.manage_pay_rules'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Error creating pay rule: {str(e)}', 'danger')
    
    # Get users and roles for form options
    users = User.query.filter_by(is_active=True).order_by(User.username).all()
    
    return render_template('pay_rules/create_rule.html',
                         users=users,
                         example_rules=EXAMPLE_PAY_RULES)

@pay_rules_bp.route('/<int:rule_id>')
@super_user_required
def view_pay_rule(rule_id):
    """View pay rule details"""
    pay_rule = PayRule.query.get_or_404(rule_id)
    
    # Get recent calculations using this rule (if any)
    recent_calculations = PayCalculation.query.filter(
        PayCalculation.pay_components.like(f'%{pay_rule.name}%')
    ).order_by(PayCalculation.calculated_at.desc()).limit(10).all()
    
    return render_template('pay_rules/view_rule.html',
                         pay_rule=pay_rule,
                         recent_calculations=recent_calculations)

@pay_rules_bp.route('/<int:rule_id>/edit', methods=['GET', 'POST'])
@super_user_required
def edit_pay_rule(rule_id):
    """Edit an existing pay rule"""
    pay_rule = PayRule.query.get_or_404(rule_id)
    
    if request.method == 'POST':
        try:
            pay_rule.name = request.form.get('name')
            pay_rule.description = request.form.get('description', '')
            pay_rule.priority = int(request.form.get('priority', 100))
            pay_rule.is_active = request.form.get('is_active') == 'on'
            
            # Parse conditions (same logic as create)
            conditions = {}
            
            selected_days = request.form.getlist('day_of_week')
            if selected_days:
                conditions['day_of_week'] = [int(day) for day in selected_days]
            
            start_hour = request.form.get('start_hour')
            end_hour = request.form.get('end_hour')
            if start_hour and end_hour:
                conditions['time_range'] = {
                    'start': int(start_hour),
                    'end': int(end_hour)
                }
            
            overtime_threshold = request.form.get('overtime_threshold')
            if overtime_threshold:
                conditions['overtime_threshold'] = float(overtime_threshold)
            
            employee_ids = request.form.get('employee_ids')
            if employee_ids:
                conditions['employee_ids'] = [int(id.strip()) for id in employee_ids.split(',') if id.strip()]
            
            selected_roles = request.form.getlist('roles')
            if selected_roles:
                conditions['roles'] = selected_roles
            
            # Parse actions (same logic as create)
            actions = {}
            
            pay_multiplier = request.form.get('pay_multiplier')
            if pay_multiplier:
                actions['pay_multiplier'] = float(pay_multiplier)
                actions['component_name'] = request.form.get('component_name', pay_rule.name.lower().replace(' ', '_'))
            
            flat_allowance = request.form.get('flat_allowance')
            if flat_allowance:
                actions['flat_allowance'] = float(flat_allowance)
                actions['allowance_name'] = request.form.get('allowance_name', f"{pay_rule.name.lower().replace(' ', '_')}_allowance")
            
            shift_differential = request.form.get('shift_differential')
            if shift_differential:
                actions['shift_differential'] = float(shift_differential)
                actions['differential_name'] = request.form.get('differential_name', f"{pay_rule.name.lower().replace(' ', '_')}_diff")
            
            if not conditions:
                flash('At least one condition must be specified.', 'danger')
                return render_template('pay_rules/edit_rule.html', pay_rule=pay_rule)
            
            if not actions:
                flash('At least one action must be specified.', 'danger')
                return render_template('pay_rules/edit_rule.html', pay_rule=pay_rule)
            
            pay_rule.set_conditions(conditions)
            pay_rule.set_actions(actions)
            pay_rule.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            flash(f'Pay rule "{pay_rule.name}" updated successfully!', 'success')
            return redirect(url_for('pay_rules.view_pay_rule', rule_id=rule_id))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Error updating pay rule: {str(e)}', 'danger')
    
    users = User.query.filter_by(is_active=True).order_by(User.username).all()
    
    return render_template('pay_rules/edit_rule.html',
                         pay_rule=pay_rule,
                         users=users)

@pay_rules_bp.route('/<int:rule_id>/delete', methods=['POST'])
@super_user_required
def delete_pay_rule(rule_id):
    """Delete a pay rule"""
    try:
        pay_rule = PayRule.query.get_or_404(rule_id)
        
        # Check if rule is used in any calculations
        calculations_using_rule = PayCalculation.query.filter(
            PayCalculation.pay_components.like(f'%{pay_rule.name}%')
        ).count()
        
        if calculations_using_rule > 0:
            flash(f'Cannot delete rule "{pay_rule.name}" - it has been used in {calculations_using_rule} pay calculations. Consider deactivating instead.', 'danger')
            return redirect(url_for('pay_rules.view_pay_rule', rule_id=rule_id))
        
        rule_name = pay_rule.name
        db.session.delete(pay_rule)
        db.session.commit()
        
        flash(f'Pay rule "{rule_name}" deleted successfully!', 'success')
        return redirect(url_for('pay_rules.manage_pay_rules'))
        
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting pay rule: {str(e)}', 'danger')
        return redirect(url_for('pay_rules.manage_pay_rules'))

@pay_rules_bp.route('/test', methods=['GET', 'POST'])
@super_user_required
def test_rules():
    """Test pay rules against sample time entries"""
    if request.method == 'POST':
        try:
            # Get selected rules
            selected_rule_ids = request.form.getlist('rule_ids')
            if not selected_rule_ids:
                flash('Please select at least one rule to test.', 'danger')
                return redirect(url_for('pay_rules.test_rules'))
            
            pay_rules = PayRule.query.filter(PayRule.id.in_(selected_rule_ids)).all()
            
            # Get test time entries
            start_date = datetime.strptime(request.form.get('start_date'), '%Y-%m-%d').date()
            end_date = datetime.strptime(request.form.get('end_date'), '%Y-%m-%d').date()
            
            test_entries = TimeEntry.query.filter(
                and_(
                    func.date(TimeEntry.clock_in_time) >= start_date,
                    func.date(TimeEntry.clock_in_time) <= end_date,
                    TimeEntry.status == 'Closed'
                )
            ).limit(50).all()  # Limit for testing
            
            if not test_entries:
                flash('No time entries found for the selected date range.', 'danger')
                return redirect(url_for('pay_rules.test_rules'))
            
            # Run test
            test_results = test_pay_rules(test_entries, pay_rules)
            
            return render_template('pay_rules/test_results.html',
                                 test_results=test_results,
                                 pay_rules=pay_rules,
                                 test_entries=test_entries,
                                 start_date=start_date,
                                 end_date=end_date)
            
        except Exception as e:
            flash(f'Error testing pay rules: {str(e)}', 'danger')
    
    # Get all active rules
    pay_rules = PayRule.query.filter_by(is_active=True).order_by(PayRule.priority.asc()).all()
    
    # Get date range for available time entries
    earliest_entry = TimeEntry.query.order_by(TimeEntry.clock_in_time.asc()).first()
    latest_entry = TimeEntry.query.order_by(TimeEntry.clock_in_time.desc()).first()
    
    return render_template('pay_rules/test_rules.html',
                         pay_rules=pay_rules,
                         earliest_date=earliest_entry.clock_in_time.date() if earliest_entry else None,
                         latest_date=latest_entry.clock_in_time.date() if latest_entry else None)

@pay_rules_bp.route('/calculate', methods=['GET', 'POST'])
@super_user_required
def calculate_pay():
    """Calculate pay for selected time entries"""
    if request.method == 'POST':
        try:
            # Get form data
            start_date = datetime.strptime(request.form.get('start_date'), '%Y-%m-%d').date()
            end_date = datetime.strptime(request.form.get('end_date'), '%Y-%m-%d').date()
            employee_ids = request.form.getlist('employee_ids')
            save_results = request.form.get('save_results') == 'on'
            
            # Build query
            query = TimeEntry.query.filter(
                and_(
                    func.date(TimeEntry.clock_in_time) >= start_date,
                    func.date(TimeEntry.clock_in_time) <= end_date,
                    TimeEntry.status == 'Closed'
                )
            )
            
            if employee_ids:
                query = query.filter(TimeEntry.user_id.in_(employee_ids))
            
            time_entries = query.all()
            
            if not time_entries:
                flash('No time entries found for the selected criteria.', 'danger')
                return redirect(url_for('pay_rules.calculate_pay'))
            
            # Run calculation
            engine = PayRuleEngine()
            engine.enable_debug()
            
            results = engine.calculate_pay(
                time_entries=time_entries,
                pay_period_start=start_date,
                pay_period_end=end_date
            )
            
            # Save results if requested
            saved_calculations = []
            if save_results:
                for employee_id, employee_result in results.get('employee_results', {}).items():
                    employee_entries = [e for e in time_entries if e.user_id == employee_id]
                    entry_ids = [e.id for e in employee_entries]
                    
                    calculation = save_pay_calculation(
                        employee_id=employee_id,
                        time_entry_ids=entry_ids,
                        pay_components=employee_result['pay_components'],
                        pay_period_start=start_date,
                        pay_period_end=end_date,
                        calculated_by_id=current_user.id
                    )
                    saved_calculations.append(calculation)
                
                flash(f'Pay calculations saved for {len(saved_calculations)} employees.', 'success')
            
            return render_template('pay_rules/calculation_results.html',
                                 results=results,
                                 start_date=start_date,
                                 end_date=end_date,
                                 saved_calculations=saved_calculations if save_results else None)
            
        except Exception as e:
            flash(f'Error calculating pay: {str(e)}', 'danger')
    
    # Get employees for selection
    employees = User.query.filter_by(is_active=True).order_by(User.username).all()
    
    # Get date range for available time entries
    earliest_entry = TimeEntry.query.order_by(TimeEntry.clock_in_time.asc()).first()
    latest_entry = TimeEntry.query.order_by(TimeEntry.clock_in_time.desc()).first()
    
    return render_template('pay_rules/calculate_pay.html',
                         employees=employees,
                         earliest_date=earliest_entry.clock_in_time.date() if earliest_entry else None,
                         latest_date=latest_entry.clock_in_time.date() if latest_entry else None)

@pay_rules_bp.route('/calculations')
@super_user_required
def view_calculations():
    """View saved pay calculations"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    employee_filter = request.args.get('employee_id', type=int)
    
    query = PayCalculation.query
    
    if employee_filter:
        query = query.filter_by(user_id=employee_filter)
    
    calculations = query.order_by(PayCalculation.calculated_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    employees = User.query.filter_by(is_active=True).order_by(User.username).all()
    
    return render_template('pay_rules/view_calculations.html',
                         calculations=calculations,
                         employees=employees,
                         employee_filter=employee_filter)

@pay_rules_bp.route('/calculations/<int:calculation_id>')
@super_user_required
def view_calculation_detail(calculation_id):
    """View detailed pay calculation"""
    calculation = PayCalculation.query.get_or_404(calculation_id)
    return render_template('pay_rules/calculation_detail.html',
                         calculation=calculation)

# API Endpoints

@pay_rules_bp.route('/api/rules/<int:rule_id>/toggle', methods=['POST'])
@super_user_required
def api_toggle_rule(rule_id):
    """Toggle rule active status"""
    try:
        pay_rule = PayRule.query.get_or_404(rule_id)
        pay_rule.is_active = not pay_rule.is_active
        pay_rule.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'is_active': pay_rule.is_active,
            'message': f'Rule "{pay_rule.name}" {"activated" if pay_rule.is_active else "deactivated"}'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@pay_rules_bp.route('/api/rules/reorder', methods=['POST'])
@super_user_required
def api_reorder_rules():
    """Reorder rule priorities"""
    try:
        rule_orders = request.get_json()
        
        for rule_data in rule_orders:
            rule_id = rule_data['id']
            new_priority = rule_data['priority']
            
            pay_rule = PayRule.query.get(rule_id)
            if pay_rule:
                pay_rule.priority = new_priority
                pay_rule.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Rule priorities updated'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 400

@pay_rules_bp.route('/api/rules/validate', methods=['POST'])
@super_user_required
def api_validate_rule():
    """Validate rule configuration"""
    try:
        rule_data = request.get_json()
        
        # Basic validation
        errors = []
        
        if not rule_data.get('name'):
            errors.append('Rule name is required')
        
        if not rule_data.get('conditions'):
            errors.append('At least one condition must be specified')
        
        if not rule_data.get('actions'):
            errors.append('At least one action must be specified')
        
        # Check for conflicting conditions
        conditions = rule_data.get('conditions', {})
        if 'time_range' in conditions:
            time_range = conditions['time_range']
            if time_range.get('start', 0) >= time_range.get('end', 24):
                errors.append('Time range start must be before end')
        
        return jsonify({
            'valid': len(errors) == 0,
            'errors': errors
        })
        
    except Exception as e:
        return jsonify({'valid': False, 'errors': [str(e)]})

@pay_rules_bp.route('/api/examples/<rule_type>')
@super_user_required
def api_get_example_rule(rule_type):
    """Get example rule configuration"""
    if rule_type in EXAMPLE_PAY_RULES:
        return jsonify(EXAMPLE_PAY_RULES[rule_type])
    else:
        return jsonify({'error': 'Example rule type not found'}), 404