"""
Employee Import Module for WFM System
Handles CSV import of employee data with validation and organizational assignment
"""

import csv
import io
from datetime import datetime
from flask import Blueprint, request, render_template, redirect, url_for, flash, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash
from sqlalchemy import or_

from app import db
from models import User, Company, Region, Site, Department, Role
from auth import role_required

# Create blueprint
import_bp = Blueprint('employee_import', __name__, url_prefix='/employee-import')

class EmployeeImportValidator:
    """Validates employee data for import"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.valid_rows = []
        self.total_rows = 0
        
    def validate_csv_file(self, file_content):
        """Validate CSV file format and content"""
        try:
            # Parse CSV
            csv_reader = csv.DictReader(io.StringIO(file_content))
            
            # Check required headers
            required_headers = ['employee_id', 'first_name', 'last_name', 'email', 'department_code']
            optional_headers = ['username', 'phone_number', 'position', 'hire_date', 'employment_type', 'salary', 'hourly_rate']
            
            # Validate headers
            if not csv_reader.fieldnames:
                self.errors.append("CSV file appears to be empty or invalid")
                return False
                
            missing_headers = [h for h in required_headers if h not in csv_reader.fieldnames]
            if missing_headers:
                self.errors.append(f"Missing required columns: {', '.join(missing_headers)}")
                return False
            
            # Validate each row
            row_number = 1
            employee_ids = set()
            emails = set()
            
            for row in csv_reader:
                row_number += 1
                self.total_rows += 1
                row_errors = []
                
                # Validate required fields
                employee_id = row.get('employee_id', '').strip()
                if not employee_id:
                    row_errors.append("Employee ID is required")
                elif employee_id in employee_ids:
                    row_errors.append(f"Duplicate Employee ID: {employee_id}")
                else:
                    employee_ids.add(employee_id)
                    
                # Check if employee_id already exists in database
                existing_user = User.query.filter_by(employee_id=employee_id).first()
                if existing_user:
                    row_errors.append(f"Employee ID {employee_id} already exists in database")
                
                first_name = row.get('first_name', '').strip()
                if not first_name:
                    row_errors.append("First name is required")
                    
                last_name = row.get('last_name', '').strip()
                if not last_name:
                    row_errors.append("Last name is required")
                    
                email = row.get('email', '').strip().lower()
                if not email:
                    row_errors.append("Email is required")
                elif '@' not in email or '.' not in email:
                    row_errors.append("Invalid email format")
                elif email in emails:
                    row_errors.append(f"Duplicate email: {email}")
                else:
                    emails.add(email)
                    
                # Check if email already exists in database
                existing_email = User.query.filter_by(email=email).first()
                if existing_email:
                    row_errors.append(f"Email {email} already exists in database")
                
                department_code = row.get('department_code', '').strip()
                if not department_code:
                    row_errors.append("Department code is required")
                else:
                    # Validate department exists
                    department = Department.query.filter_by(code=department_code, is_active=True).first()
                    if not department:
                        row_errors.append(f"Department with code '{department_code}' not found")
                
                # Validate optional fields
                username = row.get('username', '').strip()
                if not username:
                    # Generate username from email if not provided
                    username = email.split('@')[0] if email else f"user{employee_id}"
                
                # Validate hire_date if provided
                hire_date = row.get('hire_date', '').strip()
                if hire_date:
                    try:
                        datetime.strptime(hire_date, '%Y-%m-%d')
                    except ValueError:
                        try:
                            datetime.strptime(hire_date, '%m/%d/%Y')
                        except ValueError:
                            row_errors.append("Invalid hire date format. Use YYYY-MM-DD or MM/DD/YYYY")
                
                # Validate employment_type if provided
                employment_type = row.get('employment_type', '').strip().lower()
                if employment_type and employment_type not in ['full_time', 'part_time', 'contract', 'temporary']:
                    row_errors.append("Employment type must be: full_time, part_time, contract, or temporary")
                
                # Validate numeric fields
                salary = row.get('salary', '').strip()
                if salary:
                    try:
                        float(salary)
                    except ValueError:
                        row_errors.append("Salary must be a valid number")
                        
                hourly_rate = row.get('hourly_rate', '').strip()
                if hourly_rate:
                    try:
                        float(hourly_rate)
                    except ValueError:
                        row_errors.append("Hourly rate must be a valid number")
                
                if row_errors:
                    self.errors.append(f"Row {row_number}: {'; '.join(row_errors)}")
                else:
                    # Add valid row for processing
                    processed_row = {
                        'employee_id': employee_id,
                        'username': username,
                        'first_name': first_name,
                        'last_name': last_name,
                        'email': email,
                        'department_code': department_code,
                        'phone_number': row.get('phone_number', '').strip(),
                        'position': row.get('position', '').strip(),
                        'hire_date': hire_date,
                        'employment_type': employment_type or 'full_time',
                        'salary': float(salary) if salary else None,
                        'hourly_rate': float(hourly_rate) if hourly_rate else None
                    }
                    self.valid_rows.append(processed_row)
            
            return len(self.errors) == 0
            
        except Exception as e:
            self.errors.append(f"Error processing CSV file: {str(e)}")
            return False
    
    def import_employees(self):
        """Import validated employee data to database"""
        imported_count = 0
        
        try:
            # Get default employee role
            employee_role = Role.query.filter_by(name='Employee').first()
            if not employee_role:
                # Create Employee role if it doesn't exist
                employee_role = Role(name='Employee', description='Standard employee role')
                db.session.add(employee_role)
                db.session.flush()
            
            for row_data in self.valid_rows:
                try:
                    # Find department
                    department = Department.query.filter_by(
                        code=row_data['department_code'], 
                        is_active=True
                    ).first()
                    
                    if not department:
                        self.errors.append(f"Department {row_data['department_code']} not found for employee {row_data['employee_id']}")
                        continue
                    
                    # Parse hire date
                    hire_date = None
                    if row_data['hire_date']:
                        try:
                            hire_date = datetime.strptime(row_data['hire_date'], '%Y-%m-%d').date()
                        except ValueError:
                            hire_date = datetime.strptime(row_data['hire_date'], '%m/%d/%Y').date()
                    
                    # Create user
                    user = User(
                        employee_id=row_data['employee_id'],
                        username=row_data['username'],
                        first_name=row_data['first_name'],
                        last_name=row_data['last_name'],
                        email=row_data['email'],
                        department_id=department.id,
                        department=department.name,  # Legacy field
                        phone_number=row_data['phone_number'],
                        position=row_data['position'],
                        hire_date=hire_date,
                        employment_type=row_data['employment_type'],
                        salary=row_data['salary'],
                        hourly_rate=row_data['hourly_rate'],
                        is_active=True,
                        created_at=datetime.utcnow()
                    )
                    
                    # Set default password (employee can change later)
                    default_password = f"{row_data['first_name'].lower()}{row_data['employee_id']}"
                    user.set_password(default_password)
                    
                    # Add employee role
                    user.roles.append(employee_role)
                    
                    db.session.add(user)
                    imported_count += 1
                    
                except Exception as e:
                    self.errors.append(f"Error importing employee {row_data['employee_id']}: {str(e)}")
                    continue
            
            if imported_count > 0:
                db.session.commit()
                current_app.logger.info(f"Successfully imported {imported_count} employees")
            
            return imported_count
            
        except Exception as e:
            db.session.rollback()
            self.errors.append(f"Database error during import: {str(e)}")
            return 0

@import_bp.route('/')
@login_required
@role_required('Super User', 'Admin', 'HR Manager')
def import_dashboard():
    """Employee import dashboard"""
    return render_template('employee_import/dashboard.html')

@import_bp.route('/upload', methods=['GET', 'POST'])
@login_required
@role_required('Super User', 'Admin', 'HR Manager')
def upload_csv():
    """Handle CSV file upload and validation"""
    if request.method == 'POST':
        # Check if file was uploaded
        if 'csv_file' not in request.files:
            flash('No file selected', 'error')
            return redirect(request.url)
        
        file = request.files['csv_file']
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(request.url)
        
        if not file.filename.lower().endswith('.csv'):
            flash('Please upload a CSV file', 'error')
            return redirect(request.url)
        
        try:
            # Read file content
            file_content = file.read().decode('utf-8')
            
            # Validate CSV
            validator = EmployeeImportValidator()
            is_valid = validator.validate_csv_file(file_content)
            
            if is_valid:
                # Store validation results in session for confirmation
                import json
                from flask import session
                
                session['import_data'] = {
                    'valid_rows': validator.valid_rows,
                    'total_rows': validator.total_rows,
                    'filename': file.filename
                }
                
                flash(f'CSV validation successful! {len(validator.valid_rows)} employees ready for import.', 'success')
                return redirect(url_for('employee_import.confirm_import'))
            else:
                # Show validation errors
                return render_template('employee_import/upload.html', 
                                     errors=validator.errors,
                                     warnings=validator.warnings)
        
        except Exception as e:
            flash(f'Error processing file: {str(e)}', 'error')
            return redirect(request.url)
    
    return render_template('employee_import/upload.html')

@import_bp.route('/confirm', methods=['GET', 'POST'])
@login_required
@role_required('Super User', 'Admin', 'HR Manager')
def confirm_import():
    """Confirm and execute employee import"""
    from flask import session
    
    if 'import_data' not in session:
        flash('No import data found. Please upload a CSV file first.', 'error')
        return redirect(url_for('employee_import.upload_csv'))
    
    import_data = session['import_data']
    
    if request.method == 'POST':
        try:
            # Execute import
            validator = EmployeeImportValidator()
            validator.valid_rows = import_data['valid_rows']
            
            imported_count = validator.import_employees()
            
            if imported_count > 0:
                flash(f'Successfully imported {imported_count} employees!', 'success')
                # Clear session data
                session.pop('import_data', None)
                return redirect(url_for('employee_import.import_dashboard'))
            else:
                return render_template('employee_import/confirm.html',
                                     import_data=import_data,
                                     errors=validator.errors)
        
        except Exception as e:
            flash(f'Import failed: {str(e)}', 'error')
            return render_template('employee_import/confirm.html',
                                 import_data=import_data,
                                 errors=[str(e)])
    
    return render_template('employee_import/confirm.html', import_data=import_data)

@import_bp.route('/template')
@login_required
@role_required('Super User', 'Admin', 'HR Manager')
def download_template():
    """Download CSV template for employee import"""
    from flask import Response
    
    # Create CSV template
    template_content = """employee_id,username,first_name,last_name,email,department_code,phone_number,position,hire_date,employment_type,salary,hourly_rate
EMP001,jdoe,John,Doe,john.doe@company.com,HR,+27123456789,HR Manager,2024-01-15,full_time,75000,
EMP002,jsmith,Jane,Smith,jane.smith@company.com,IT,+27123456790,Software Developer,2024-02-01,full_time,,450.00
EMP003,bwilson,Bob,Wilson,bob.wilson@company.com,SALES,+27123456791,Sales Representative,2024-03-01,part_time,45000,"""

    # Create response
    response = Response(
        template_content,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=employee_import_template.csv'}
    )
    
    return response

@import_bp.route('/api/departments')
@login_required
@role_required('Super User', 'Admin', 'HR Manager')
def api_departments():
    """API endpoint to get available departments for import"""
    try:
        departments = Department.query.filter_by(is_active=True).all()
        
        dept_data = []
        for dept in departments:
            dept_data.append({
                'code': dept.code,
                'name': dept.name,
                'site': dept.site.name,
                'region': dept.site.region.name,
                'company': dept.site.region.company.name
            })
        
        return jsonify({
            'success': True,
            'departments': dept_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500