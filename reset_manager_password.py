#!/usr/bin/env python3
"""
Reset Manager Password Script
Securely updates the manager user password with proper hashing
"""

from werkzeug.security import generate_password_hash
from app import app, db
from models import User

def reset_manager_password(new_password="manager123"):
    """Reset manager password to a new secure password"""
    with app.app_context():
        try:
            # Find manager user
            manager_user = User.query.filter_by(username='manager').first()
            
            if not manager_user:
                print("❌ Manager user not found")
                return False
            
            # Generate new secure password hash
            password_hash = generate_password_hash(new_password)
            
            # Update password
            manager_user.password_hash = password_hash
            db.session.commit()
            
            print(f"✅ Manager password successfully reset")
            print(f"Username: manager")
            print(f"Password: {new_password}")
            print("You can now log in with these credentials")
            
            return True
            
        except Exception as e:
            print(f"❌ Error resetting password: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    reset_manager_password()