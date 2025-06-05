from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

# Association table for many-to-many relationship between users and roles
user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True)
)

class Role(db.Model):
    """Role model for role-based access control"""
    
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False, index=True)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Role {self.name}>'

class User(UserMixin, db.Model):
    """User model for authentication and user management"""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256))
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    roles = db.relationship('Role', secondary=user_roles, lazy='subquery',
                           backref=db.backref('users', lazy=True))
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def has_role(self, role_name):
        """Check if user has a specific role"""
        if not self.roles:
            return False
        return any(role.name == role_name for role in self.roles)
    
    def add_role(self, role):
        """Add a role to the user"""
        if not self.has_role(role.name):
            self.roles.append(role)
    
    def remove_role(self, role):
        """Remove a role from the user"""
        if self.has_role(role.name):
            self.roles.remove(role)
    
    @property
    def full_name(self):
        """Get user's full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def __repr__(self):
        return f'<User {self.username}>'

class Post(db.Model):
    """Sample Post model to demonstrate relationships"""
    
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published = db.Column(db.Boolean, default=False)
    
    # Foreign key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Indexes for better query performance
    __table_args__ = (
        db.Index('idx_posts_created_at', 'created_at'),
        db.Index('idx_posts_user_published', 'user_id', 'published'),
    )
    
    def __repr__(self):
        return f'<Post {self.title}>'

class Category(db.Model):
    """Sample Category model"""
    
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Category {self.name}>'

class TimeEntry(db.Model):
    """Time Entry model for employee time tracking"""
    
    __tablename__ = 'time_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    clock_in_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    clock_out_time = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='Open', nullable=False)  # 'Open', 'Closed', 'Exception'
    notes = db.Column(db.Text, nullable=True)
    approved_by_manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_overtime_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # GPS location data (optional for mobile tracking)
    clock_in_latitude = db.Column(db.Float, nullable=True)
    clock_in_longitude = db.Column(db.Float, nullable=True)
    clock_out_latitude = db.Column(db.Float, nullable=True)
    clock_out_longitude = db.Column(db.Float, nullable=True)
    
    # Break time tracking
    break_start_time = db.Column(db.DateTime, nullable=True)
    break_end_time = db.Column(db.DateTime, nullable=True)
    total_break_minutes = db.Column(db.Integer, default=0)
    
    # Relationships
    employee = db.relationship('User', foreign_keys=[user_id], backref='time_entries')
    approved_by = db.relationship('User', foreign_keys=[approved_by_manager_id])
    
    # Indexes for better query performance
    __table_args__ = (
        db.Index('idx_time_entries_user_date', 'user_id', 'clock_in_time'),
        db.Index('idx_time_entries_status', 'status'),
        db.Index('idx_time_entries_approval', 'approved_by_manager_id'),
    )
    
    @property
    def total_hours(self):
        """Calculate total hours worked"""
        if not self.clock_out_time:
            return 0
        
        total_time = self.clock_out_time - self.clock_in_time
        total_minutes = total_time.total_seconds() / 60
        
        # Subtract break time
        total_minutes -= self.total_break_minutes
        
        return round(total_minutes / 60, 2)
    
    @property
    def is_overtime(self):
        """Check if this entry qualifies as overtime (>8 hours)"""
        return self.total_hours > 8
    
    @property
    def overtime_hours(self):
        """Calculate overtime hours"""
        return max(0, self.total_hours - 8)
    
    @property
    def regular_hours(self):
        """Calculate regular hours (up to 8)"""
        return min(8, self.total_hours)
    
    @property
    def work_date(self):
        """Get the work date (date of clock-in)"""
        return self.clock_in_time.date()
    
    def can_be_approved_by(self, user):
        """Check if a user can approve this time entry"""
        # Super Users and Admins can approve any entry
        if user.has_role('Super User') or user.has_role('Admin'):
            return True
        
        # Managers can approve their team members' entries
        # (This would require a team/department structure - simplified for now)
        if user.has_role('Manager'):
            return True
        
        return False
    
    def __repr__(self):
        return f'<TimeEntry {self.employee.username} - {self.work_date}>'
