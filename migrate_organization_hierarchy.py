"""
Database Migration Script for Organizational Hierarchy
Adds Company → Regions → Sites → Departments → People structure
"""
import os
from app import app, db
from models import Company, Region, Site, Department, User

def migrate_database():
    """Create all new tables and update existing User table"""
    with app.app_context():
        try:
            print("Creating organizational hierarchy tables...")
            
            # Create all tables (will only create new ones)
            db.create_all()
            
            # Add new columns to users table if they don't exist
            from sqlalchemy import text
            
            # Check if department_id column exists
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='department_id'
            """))
            
            if not result.fetchone():
                print("Adding new columns to users table...")
                
                # Add all new columns to users table
                alterations = [
                    "ALTER TABLE users ADD COLUMN department_id INTEGER",
                    "ALTER TABLE users ADD COLUMN employment_type VARCHAR(20) DEFAULT 'full_time'",
                    "ALTER TABLE users ADD COLUMN employment_status VARCHAR(20) DEFAULT 'active'",
                    "ALTER TABLE users ADD COLUMN line_manager_id INTEGER",
                    "ALTER TABLE users ADD COLUMN phone_number VARCHAR(20)",
                    "ALTER TABLE users ADD COLUMN mobile_number VARCHAR(20)",
                    "ALTER TABLE users ADD COLUMN emergency_contact_name VARCHAR(100)",
                    "ALTER TABLE users ADD COLUMN emergency_contact_phone VARCHAR(20)",
                    "ALTER TABLE users ADD COLUMN address_line1 VARCHAR(100)",
                    "ALTER TABLE users ADD COLUMN address_line2 VARCHAR(100)",
                    "ALTER TABLE users ADD COLUMN city VARCHAR(50)",
                    "ALTER TABLE users ADD COLUMN postal_code VARCHAR(20)",
                    "ALTER TABLE users ADD COLUMN job_title VARCHAR(100)",
                    "ALTER TABLE users ADD COLUMN job_grade VARCHAR(10)",
                    "ALTER TABLE users ADD COLUMN salary FLOAT",
                    "ALTER TABLE users ADD COLUMN hourly_rate FLOAT"
                ]
                
                for alteration in alterations:
                    try:
                        db.session.execute(text(alteration))
                        print(f"✓ {alteration}")
                    except Exception as e:
                        print(f"⚠ Skipping (may already exist): {alteration} - {str(e)}")
                
                # Add foreign key constraints
                constraints = [
                    "ALTER TABLE users ADD CONSTRAINT fk_users_department_id FOREIGN KEY (department_id) REFERENCES departments(id)",
                    "ALTER TABLE users ADD CONSTRAINT fk_users_line_manager_id FOREIGN KEY (line_manager_id) REFERENCES users(id)"
                ]
                
                for constraint in constraints:
                    try:
                        db.session.execute(text(constraint))
                        print(f"✓ {constraint}")
                    except Exception as e:
                        print(f"⚠ Skipping constraint (may already exist): {str(e)}")
                
                db.session.commit()
                print("✓ Database migration completed successfully!")
            else:
                print("✓ Database already migrated")
                
            # Create sample data if no companies exist
            if Company.query.count() == 0:
                create_sample_data()
                
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {str(e)}")
            raise

def create_sample_data():
    """Create sample organizational structure"""
    print("Creating sample organizational data...")
    
    try:
        # Create sample company
        company = Company(
            name="Acme Corporation",
            code="ACME",
            legal_name="Acme Corporation (Pty) Ltd",
            registration_number="2023/123456/07",
            email="info@acme.com",
            phone="+27 11 123 4567",
            address_line1="123 Business Street",
            city="Johannesburg",
            state_province="Gauteng",
            postal_code="2000",
            country="South Africa"
        )
        db.session.add(company)
        db.session.flush()  # Get the ID
        
        # Create sample regions
        regions_data = [
            {"name": "Northern Region", "code": "NTH", "city": "Pretoria"},
            {"name": "Southern Region", "code": "STH", "city": "Cape Town"},
            {"name": "Eastern Region", "code": "EST", "city": "Durban"}
        ]
        
        regions = []
        for region_data in regions_data:
            region = Region(
                company_id=company.id,
                name=region_data["name"],
                code=region_data["code"],
                city=region_data["city"],
                manager_name="Regional Manager",
                email=f"{region_data['code'].lower()}@acme.com"
            )
            db.session.add(region)
            regions.append(region)
        
        db.session.flush()
        
        # Create sample sites
        sites_data = [
            {"name": "Head Office", "code": "HO", "type": "Office", "region_idx": 0},
            {"name": "Manufacturing Plant", "code": "MP", "type": "Factory", "region_idx": 0},
            {"name": "Cape Town Office", "code": "CT", "type": "Office", "region_idx": 1},
            {"name": "Durban Warehouse", "code": "DW", "type": "Warehouse", "region_idx": 2}
        ]
        
        sites = []
        for site_data in sites_data:
            site = Site(
                region_id=regions[site_data["region_idx"]].id,
                name=site_data["name"],
                code=site_data["code"],
                site_type=site_data["type"],
                address_line1="123 Business Street",
                city=regions[site_data["region_idx"]].city,
                latitude=-26.2041 if site_data["region_idx"] == 0 else -33.9249 if site_data["region_idx"] == 1 else -29.8587,
                longitude=28.0473 if site_data["region_idx"] == 0 else 18.4241 if site_data["region_idx"] == 1 else 31.0218
            )
            db.session.add(site)
            sites.append(site)
        
        db.session.flush()
        
        # Create sample departments
        departments_data = [
            {"name": "Human Resources", "code": "HR", "site_idx": 0},
            {"name": "Finance", "code": "FIN", "site_idx": 0},
            {"name": "Information Technology", "code": "IT", "site_idx": 0},
            {"name": "Production", "code": "PROD", "site_idx": 1},
            {"name": "Quality Control", "code": "QC", "site_idx": 1},
            {"name": "Sales", "code": "SALES", "site_idx": 2},
            {"name": "Warehouse Operations", "code": "WH", "site_idx": 3}
        ]
        
        for dept_data in departments_data:
            department = Department(
                site_id=sites[dept_data["site_idx"]].id,
                name=dept_data["name"],
                code=dept_data["code"],
                description=f"{dept_data['name']} Department",
                email=f"{dept_data['code'].lower()}@acme.com"
            )
            db.session.add(department)
        
        db.session.commit()
        print("✓ Sample organizational data created successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"✗ Failed to create sample data: {str(e)}")
        raise

if __name__ == "__main__":
    migrate_database()