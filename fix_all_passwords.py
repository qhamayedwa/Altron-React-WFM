
#!/usr/bin/env python3
"""
Fix All User Passwords Script
Resets passwords for all users with proper hashing
"""

from werkzeug.security import generate_password_hash
from app import app, db
from models import User

def fix_all_passwords():
    """Fix all user passwords with proper hashing"""
    with app.app_context():
        try:
            # Default password mappings
            password_map = {
                'admin': 'admin123',
                'manager': 'manager123',
                'employee': 'employee123',
                'tcook': 'password123'
            }
            
            # Get all users
            users = User.query.all()
            fixed_count = 0
            
            for user in users:
                # Use mapped password or default
                new_password = password_map.get(user.username, 'password123')
                
                # Generate proper password hash
                user.password_hash = generate_password_hash(new_password)
                fixed_count += 1
                
                print(f"✅ Fixed password for user: {user.username}")
            
            # Commit all changes
            db.session.commit()
            
            print(f"\n✅ Successfully fixed {fixed_count} user passwords")
            print("\nDefault credentials:")
            print("==================")
            for username, password in password_map.items():
                print(f"Username: {username} | Password: {password}")
            print("\nAll other users: password123")
            
            return True
            
        except Exception as e:
            print(f"❌ Error fixing passwords: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    fix_all_passwords()
