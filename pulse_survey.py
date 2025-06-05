"""
Team Communication Pulse Survey Module
Provides one-click pulse surveys for team communication assessment
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from app import db
from models import User
from sqlalchemy import and_, or_, func
import json

# Create blueprint for pulse surveys
pulse_survey_bp = Blueprint('pulse_survey', __name__)

# Survey Questions Configuration
PULSE_SURVEY_QUESTIONS = [
    {
        "id": "communication_clarity",
        "question": "How clear is communication within your team?",
        "type": "scale",
        "scale": 5,
        "labels": ["Very Unclear", "Unclear", "Neutral", "Clear", "Very Clear"]
    },
    {
        "id": "team_collaboration",
        "question": "How effectively does your team collaborate?",
        "type": "scale", 
        "scale": 5,
        "labels": ["Very Poor", "Poor", "Average", "Good", "Excellent"]
    },
    {
        "id": "information_flow",
        "question": "Do you receive the information you need to do your job effectively?",
        "type": "scale",
        "scale": 5,
        "labels": ["Never", "Rarely", "Sometimes", "Often", "Always"]
    },
    {
        "id": "feedback_frequency",
        "question": "How often do you receive helpful feedback from your manager?",
        "type": "scale",
        "scale": 5,
        "labels": ["Never", "Rarely", "Monthly", "Weekly", "Daily"]
    },
    {
        "id": "work_satisfaction",
        "question": "How satisfied are you with your current work environment?",
        "type": "scale",
        "scale": 5,
        "labels": ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
    },
    {
        "id": "improvement_suggestions",
        "question": "What would improve team communication? (Optional)",
        "type": "text",
        "optional": True
    }
]

# Database Models for Pulse Surveys
class PulseSurvey(db.Model):
    """Pulse Survey model for tracking survey instances"""
    
    __tablename__ = 'pulse_surveys'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ends_at = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_anonymous = db.Column(db.Boolean, default=True)
    target_department = db.Column(db.String(64), nullable=True)  # Optional department filter
    
    # Relationships
    created_by = db.relationship('User', foreign_keys=[created_by_id])
    responses = db.relationship('PulseSurveyResponse', backref='survey', cascade='all, delete-orphan')
    
    # Indexes for performance
    __table_args__ = (
        db.Index('idx_pulse_surveys_active', 'is_active'),
        db.Index('idx_pulse_surveys_created_at', 'created_at'),
        db.Index('idx_pulse_surveys_department', 'target_department'),
        db.Index('idx_pulse_surveys_creator_date', 'created_by_id', 'created_at'),
    )
    
    def get_response_count(self):
        """Get total number of responses"""
        return PulseSurveyResponse.query.filter_by(survey_id=self.id).count()
    
    def get_completion_rate(self):
        """Calculate completion rate based on target audience"""
        if self.target_department:
            target_users = User.query.filter_by(department=self.target_department, is_active=True).count()
        else:
            target_users = User.query.filter_by(is_active=True).count()
        
        if target_users == 0:
            return 0
        
        responses = self.get_response_count()
        return round((responses / target_users) * 100, 1)
    
    def is_expired(self):
        """Check if survey has expired"""
        return datetime.utcnow() > self.ends_at
    
    def can_user_respond(self, user):
        """Check if user can respond to this survey"""
        if not self.is_active or self.is_expired():
            return False
        
        if self.target_department and user.department != self.target_department:
            return False
        
        # Check if user already responded
        existing_response = PulseSurveyResponse.query.filter_by(
            survey_id=self.id,
            user_id=user.id
        ).first()
        
        return existing_response is None

class PulseSurveyResponse(db.Model):
    """Pulse Survey Response model for storing individual responses"""
    
    __tablename__ = 'pulse_survey_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('pulse_surveys.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    responses = db.Column(db.Text, nullable=False)  # JSON string of responses
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id])
    
    # Indexes for performance
    __table_args__ = (
        db.UniqueConstraint('survey_id', 'user_id', name='uq_survey_user_response'),
        db.Index('idx_pulse_responses_survey', 'survey_id'),
        db.Index('idx_pulse_responses_user', 'user_id'),
        db.Index('idx_pulse_responses_submitted', 'submitted_at'),
    )
    
    def get_responses_dict(self):
        """Get responses as dictionary"""
        return json.loads(self.responses)

# Routes
@pulse_survey_bp.route('/dashboard')
@login_required
def pulse_dashboard():
    """Pulse survey dashboard"""
    try:
        # Get active surveys
        active_surveys = PulseSurvey.query.filter_by(is_active=True).filter(
            PulseSurvey.ends_at > datetime.utcnow()
        ).order_by(PulseSurvey.created_at.desc()).all()
        
        # Get surveys user can respond to
        available_surveys = [s for s in active_surveys if s.can_user_respond(current_user)]
        
        # Get surveys created by current user (for managers)
        my_surveys = []
        if current_user.has_role('Manager') or current_user.has_role('Super User'):
            my_surveys = PulseSurvey.query.filter_by(created_by_id=current_user.id).order_by(
                PulseSurvey.created_at.desc()
            ).limit(10).all()
        
        # Get recent responses (for managers)
        recent_responses = []
        if current_user.has_role('Manager') or current_user.has_role('Super User'):
            recent_responses = PulseSurveyResponse.query.join(PulseSurvey).filter(
                PulseSurvey.created_by_id == current_user.id
            ).order_by(PulseSurveyResponse.submitted_at.desc()).limit(5).all()
        
        return render_template('pulse_survey/dashboard.html',
                             available_surveys=available_surveys,
                             my_surveys=my_surveys,
                             recent_responses=recent_responses)
    
    except Exception as e:
        flash(f"Error loading pulse survey dashboard: {str(e)}", "error")
        return redirect(url_for('main.index'))

@pulse_survey_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_survey():
    """Create a new pulse survey"""
    if not (current_user.has_role('Manager') or current_user.has_role('Super User')):
        flash("Only managers can create pulse surveys.", "error")
        return redirect(url_for('pulse_survey.pulse_dashboard'))
    
    if request.method == 'POST':
        try:
            title = request.form.get('title', '').strip()
            description = request.form.get('description', '').strip()
            duration_hours = int(request.form.get('duration_hours', 24))
            target_department = request.form.get('target_department', '').strip()
            is_anonymous = request.form.get('is_anonymous') == 'on'
            
            if not title:
                flash("Survey title is required.", "error")
                return render_template('pulse_survey/create.html')
            
            # Calculate end time
            ends_at = datetime.utcnow() + timedelta(hours=duration_hours)
            
            # Create survey
            survey = PulseSurvey(
                title=title,
                description=description,
                created_by_id=current_user.id,
                ends_at=ends_at,
                is_anonymous=is_anonymous,
                target_department=target_department if target_department else None
            )
            
            db.session.add(survey)
            db.session.commit()
            
            flash(f"Pulse survey '{title}' created successfully!", "success")
            return redirect(url_for('pulse_survey.view_survey', survey_id=survey.id))
            
        except Exception as e:
            db.session.rollback()
            flash(f"Error creating survey: {str(e)}", "error")
    
    # Get departments for dropdown
    departments = db.session.query(User.department).filter(
        User.department.isnot(None),
        User.is_active == True
    ).distinct().all()
    departments = [d[0] for d in departments if d[0]]
    
    return render_template('pulse_survey/create.html', 
                         questions=PULSE_SURVEY_QUESTIONS,
                         departments=departments)

@pulse_survey_bp.route('/survey/<int:survey_id>')
@login_required
def view_survey(survey_id):
    """View survey details and results"""
    survey = PulseSurvey.query.get_or_404(survey_id)
    
    # Check permissions
    if not (current_user.has_role('Manager') or current_user.has_role('Super User') or 
            survey.created_by_id == current_user.id):
        flash("You don't have permission to view this survey.", "error")
        return redirect(url_for('pulse_survey.pulse_dashboard'))
    
    # Get survey statistics
    total_responses = survey.get_response_count()
    completion_rate = survey.get_completion_rate()
    
    # Get aggregated results
    responses = PulseSurveyResponse.query.filter_by(survey_id=survey_id).all()
    
    # Process results
    results = {}
    for question in PULSE_SURVEY_QUESTIONS:
        if question['type'] == 'scale':
            results[question['id']] = {
                'question': question['question'],
                'type': 'scale',
                'labels': question['labels'],
                'scores': [0] * question['scale'],
                'average': 0,
                'total_responses': 0
            }
        elif question['type'] == 'text':
            results[question['id']] = {
                'question': question['question'],
                'type': 'text',
                'responses': []
            }
    
    # Aggregate responses
    for response in responses:
        response_data = response.get_responses_dict()
        
        for question_id, answer in response_data.items():
            if question_id in results:
                if results[question_id]['type'] == 'scale' and answer:
                    score = int(answer) - 1  # Convert to 0-based index
                    if 0 <= score < len(results[question_id]['scores']):
                        results[question_id]['scores'][score] += 1
                        results[question_id]['total_responses'] += 1
                elif results[question_id]['type'] == 'text' and answer:
                    results[question_id]['responses'].append(answer)
    
    # Calculate averages for scale questions
    for question_id, result in results.items():
        if result['type'] == 'scale' and result['total_responses'] > 0:
            total_score = sum(score * (index + 1) for index, score in enumerate(result['scores']))
            result['average'] = round(total_score / result['total_responses'], 1)
    
    return render_template('pulse_survey/view.html',
                         survey=survey,
                         results=results,
                         total_responses=total_responses,
                         completion_rate=completion_rate)

@pulse_survey_bp.route('/respond/<int:survey_id>', methods=['GET', 'POST'])
@login_required
def respond_survey(survey_id):
    """Respond to a pulse survey"""
    survey = PulseSurvey.query.get_or_404(survey_id)
    
    if not survey.can_user_respond(current_user):
        flash("You cannot respond to this survey.", "error")
        return redirect(url_for('pulse_survey.pulse_dashboard'))
    
    if request.method == 'POST':
        try:
            responses = {}
            
            # Collect responses
            for question in PULSE_SURVEY_QUESTIONS:
                question_id = question['id']
                answer = request.form.get(question_id, '').strip()
                
                if answer or question.get('optional', False):
                    responses[question_id] = answer
                elif not question.get('optional', False):
                    flash(f"Please answer: {question['question']}", "error")
                    return render_template('pulse_survey/respond.html', 
                                         survey=survey, 
                                         questions=PULSE_SURVEY_QUESTIONS)
            
            # Save response
            survey_response = PulseSurveyResponse(
                survey_id=survey_id,
                user_id=current_user.id,
                responses=json.dumps(responses)
            )
            
            db.session.add(survey_response)
            db.session.commit()
            
            flash("Thank you for your response!", "success")
            return redirect(url_for('pulse_survey.pulse_dashboard'))
            
        except Exception as e:
            db.session.rollback()
            flash(f"Error submitting response: {str(e)}", "error")
    
    return render_template('pulse_survey/respond.html', 
                         survey=survey, 
                         questions=PULSE_SURVEY_QUESTIONS)

@pulse_survey_bp.route('/one-click-survey', methods=['POST'])
@login_required  
def one_click_survey():
    """Create and launch a one-click pulse survey with predefined settings"""
    if not (current_user.has_role('Manager') or current_user.has_role('Super User')):
        return jsonify({
            'success': False,
            'message': 'Only managers can create pulse surveys.'
        }), 403
    
    try:
        # Create a quick pulse survey with default settings
        title = f"Team Communication Pulse - {datetime.now().strftime('%B %d, %Y')}"
        description = "Quick pulse check on team communication and collaboration effectiveness."
        
        survey = PulseSurvey(
            title=title,
            description=description,
            created_by_id=current_user.id,
            ends_at=datetime.utcnow() + timedelta(hours=24),  # 24-hour window
            is_anonymous=True,
            target_department=current_user.department  # Target user's department
        )
        
        db.session.add(survey)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f"Pulse survey '{title}' launched successfully!",
            'survey_id': survey.id,
            'survey_url': url_for('pulse_survey.view_survey', survey_id=survey.id)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error creating pulse survey: {str(e)}'
        }), 500

# Create database tables
def create_pulse_survey_tables():
    """Create pulse survey tables"""
    try:
        # Create tables if they don't exist
        db.create_all()
    except Exception as e:
        print(f"Error creating pulse survey tables: {e}")