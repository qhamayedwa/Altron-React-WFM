import os
from dotenv import load_dotenv
from datetime import timezone, timedelta

# Load environment variables from .env file
load_dotenv()

# Define South African timezone (GMT+2)
SAST = timezone(timedelta(hours=2))

class Config:
    """Flask configuration class"""
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://localhost/flaskapp'
    
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security
    SECRET_KEY = os.environ.get('SESSION_SECRET') or 'dev-secret-key-change-in-production'
    
    # Flask configuration
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    TESTING = False
    
    # Application settings
    APP_NAME = os.environ.get('APP_NAME', 'WFM24/7')
    
    # Timezone configuration
    TIMEZONE = SAST
    
    # Payroll configuration
    PAYROLL_BASE_RATE = float(os.environ.get('PAYROLL_BASE_RATE', '150.0'))  # Base hourly rate in ZAR
    PAYROLL_OVERTIME_MULTIPLIER = float(os.environ.get('PAYROLL_OVERTIME_MULTIPLIER', '1.5'))  # 1.5x for overtime
    PAYROLL_DOUBLE_TIME_MULTIPLIER = float(os.environ.get('PAYROLL_DOUBLE_TIME_MULTIPLIER', '2.0'))  # 2.0x for double time
    PAYROLL_DEDUCTION_RATE = float(os.environ.get('PAYROLL_DEDUCTION_RATE', '0.25'))  # 25% default deductions
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True  # Log SQL queries in development

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_ECHO = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'postgresql://localhost/flaskapp_test'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
