import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Security Setup
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-super-secret-key-multi-tenant-2026')
    
    # Database
    # Expected format: mysql+pymysql://user:password@localhost/db_name
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///dev.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Auth
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-super-secret-key-multi-tenant')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    
    # Third Party Keys
    RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', '')
    RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', '')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    
config_by_name = {
    'dev': DevelopmentConfig,
    'development': DevelopmentConfig,
    'prod': ProductionConfig,
    'production': ProductionConfig
}
