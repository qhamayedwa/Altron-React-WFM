#!/usr/bin/env python3

from werkzeug.security import generate_password_hash
from app import create_app, db
from models import User

def fix_user_passwords():
    """Fix user passwords with proper hashing"""
    app = create_app()
    
    with app.app_context():
        # Update tcook password
        user = User.query.filter_by(username='tcook').first()
        if user:
            user.password_hash = generate_password_hash('password123')
            db.session.commit()
            print(f"Updated password for user: {user.username}")
        else:
            print("User tcook not found")

if __name__ == '__main__':
    fix_user_passwords()