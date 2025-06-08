#!/usr/bin/env python3
"""
Reset Admin Credentials Script
Successfully reset admin credentials on 2025-06-08
Username: admin | Password: admin123 | Email: admin@wfm.system
"""
import os
from werkzeug.security import generate_password_hash
from app import app, db
from models import User

def reset_admin_credentials():
    """Reset admin user credentials to simple defaults"""
    with app.app_context():
        # Find the admin user
        admin = User.query.filter_by(username='admin').first()
        
        if admin:
            # Reset to simple credentials
            admin.username = 'admin'
            admin.email = 'admin@wfm.system'
            admin.password_hash = generate_password_hash('admin123')
            
            db.session.commit()
            print(f"✓ Admin credentials reset successfully")
            print(f"Username: admin")
            print(f"Password: admin123")
            print(f"Email: admin@wfm.system")
        else:
            print("No admin user found")

if __name__ == '__main__':
    reset_admin_credentials()