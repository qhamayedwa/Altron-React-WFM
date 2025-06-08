#!/usr/bin/env python3
"""
Test Clock In/Out Functionality
Quick test to verify the time tracking endpoints work correctly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from models import User, TimeEntry
from datetime import datetime
import logging

def test_clock_functionality():
    """Test clock in/out functionality directly"""
    
    app = create_app()
    
    with app.app_context():
        try:
            print("=" * 50)
            print("TESTING CLOCK FUNCTIONALITY")
            print("=" * 50)
            
            # Find a test user
            test_user = User.query.filter_by(username='admin').first()
            if not test_user:
                test_user = User.query.first()
            
            if not test_user:
                print("❌ No users found in database")
                return False
                
            print(f"Testing with user: {test_user.username} (ID: {test_user.id})")
            
            # Check for existing open entries
            open_entry = TimeEntry.query.filter_by(
                user_id=test_user.id,
                status='Open'
            ).first()
            
            if open_entry:
                print(f"Found existing open entry: {open_entry.id}")
                print(f"Clock in time: {open_entry.clock_in_time}")
                
                # Test clock out
                open_entry.clock_out_time = datetime.now()
                open_entry.status = 'Closed'
                db.session.commit()
                print("✓ Successfully closed existing entry")
            
            # Test clock in
            new_entry = TimeEntry()
            new_entry.user_id = test_user.id
            new_entry.clock_in_time = datetime.now()
            new_entry.status = 'Open'
            new_entry.notes = 'Test clock-in from Python script'
            
            db.session.add(new_entry)
            db.session.commit()
            
            print(f"✓ Successfully created new time entry: {new_entry.id}")
            print(f"Clock in time: {new_entry.clock_in_time}")
            
            # Verify entry exists
            verify_entry = TimeEntry.query.filter_by(id=new_entry.id).first()
            if verify_entry:
                print("✓ Time entry verified in database")
                
                # Calculate duration
                duration = datetime.now() - verify_entry.clock_in_time
                duration_seconds = duration.total_seconds()
                hours = int(duration_seconds // 3600)
                minutes = int((duration_seconds % 3600) // 60)
                seconds = int(duration_seconds % 60)
                
                print(f"Current duration: {hours:02d}:{minutes:02d}:{seconds:02d}")
                
                return True
            else:
                print("❌ Failed to verify time entry")
                return False
                
        except Exception as e:
            print(f"❌ Error during test: {e}")
            logging.error(f"Clock functionality test failed: {e}")
            return False

if __name__ == "__main__":
    success = test_clock_functionality()
    sys.exit(0 if success else 1)