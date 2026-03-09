import os
from flask import Flask
from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors, limiter
from app.scheduler import init_scheduler

def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'dev')
        
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/v1/*": {"origins": "*"}}) # Allow all local testing CORS
    limiter.init_app(app)
    
    # Initialize Background Jobs
    if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        init_scheduler(app)
    
    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.customer_routes import customer_bp
    from app.routes.invoice_routes import invoice_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.public_routes import public_bp
    from app.routes.tenant_routes import tenant_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(customer_bp, url_prefix='/api/v1')
    app.register_blueprint(invoice_bp, url_prefix='/api/v1')
    app.register_blueprint(payment_bp, url_prefix='/api/v1/payments')
    app.register_blueprint(dashboard_bp, url_prefix='/api/v1/dashboard')
    app.register_blueprint(public_bp, url_prefix='/api/v1/public')
    app.register_blueprint(tenant_bp, url_prefix='/api/v1/tenant')
    
    @app.route('/health')
    def health_check():
        return {"status": "healthy"}, 200
        
    return app
