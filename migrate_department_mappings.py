#!/usr/bin/env python3
"""
Department Mapping Migration Script
Migrates users from legacy department fields to hierarchical department structure
"""

from app import app, db
from models import User, Department, Site, Region, Company
from sqlalchemy import text

def migrate_department_mappings():
    """Migrate users from legacy department fields to hierarchical structure"""
    
    with app.app_context():
        print("Starting department mapping migration...")
        
        # Get all users with legacy department fields but no hierarchical department_id
        users_to_migrate = User.query.filter(
            User.department.isnot(None),
            User.department_id.is_(None),
            User.is_active == True
        ).all()
        
        print(f"Found {len(users_to_migrate)} users to migrate")
        
        # Create department mappings
        department_mappings = {
            # Legacy department -> Hierarchical department mapping
            'IT': 'IT Support',
            'Operations': 'Production Line A',
            'Management': 'Quality Control', 
            'Pre-sales': 'Meal Assembly Line',
            'o': 'Maintenance',
            '0': 'Fresh Dairy Processing'
        }
        
        migrated_count = 0
        
        for user in users_to_migrate:
            legacy_dept = user.department
            print(f"\nProcessing user: {user.username} (legacy dept: {legacy_dept})")
            
            # Try exact match first
            dept = Department.query.filter_by(name=legacy_dept, is_active=True).first()
            
            if not dept and legacy_dept in department_mappings:
                # Try mapped department name
                mapped_name = department_mappings[legacy_dept]
                dept = Department.query.filter_by(name=mapped_name, is_active=True).first()
                print(f"  Mapped '{legacy_dept}' to '{mapped_name}'")
            
            if not dept:
                # Try partial match
                dept = Department.query.filter(
                    Department.name.ilike(f'%{legacy_dept}%'),
                    Department.is_active == True
                ).first()
                
                if dept:
                    print(f"  Partial match found: '{dept.name}'")
            
            if dept:
                user.department_id = dept.id
                print(f"  ✓ Assigned to department: {dept.name} (Site: {dept.site.name})")
                migrated_count += 1
            else:
                print(f"  ✗ No matching department found for '{legacy_dept}'")
        
        # Commit changes
        try:
            db.session.commit()
            print(f"\n✓ Migration completed successfully!")
            print(f"✓ Migrated {migrated_count} users to hierarchical departments")
            
            # Update statistics
            print("\nPost-migration statistics:")
            total_active_users = User.query.filter_by(is_active=True).count()
            users_with_hierarchical = User.query.filter(
                User.department_id.isnot(None),
                User.is_active == True
            ).count()
            users_with_legacy_only = User.query.filter(
                User.department.isnot(None),
                User.department_id.is_(None),
                User.is_active == True
            ).count()
            
            print(f"Total active users: {total_active_users}")
            print(f"Users with hierarchical departments: {users_with_hierarchical}")
            print(f"Users with legacy departments only: {users_with_legacy_only}")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {e}")
            return False
        
        return True

def verify_department_structure():
    """Verify the hierarchical department structure"""
    
    with app.app_context():
        print("\nVerifying department structure...")
        
        companies = Company.query.filter_by(is_active=True).all()
        for company in companies:
            print(f"\nCompany: {company.name}")
            
            for region in company.regions:
                if region.is_active:
                    print(f"  Region: {region.name}")
                    
                    for site in region.sites:
                        if site.is_active:
                            print(f"    Site: {site.name}")
                            
                            for dept in site.departments:
                                if dept.is_active:
                                    user_count = User.query.filter_by(
                                        department_id=dept.id,
                                        is_active=True
                                    ).count()
                                    print(f"      Department: {dept.name} ({user_count} users)")

if __name__ == "__main__":
    print("Department Mapping Migration Tool")
    print("=" * 50)
    
    # Verify current structure
    verify_department_structure()
    
    # Run migration
    success = migrate_department_mappings()
    
    if success:
        # Verify after migration
        print("\n" + "=" * 50)
        verify_department_structure()
    else:
        print("Migration failed. Please check the errors above.")