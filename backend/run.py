from app import create_app
from app.extensions import db
from app.models import User, Tenant
from werkzeug.security import generate_password_hash
import os

app = create_app(os.getenv('FLASK_ENV', 'dev'))

with app.app_context():
    db.create_all()
    
    # Seed default Admin user if db is empty
    if not Tenant.query.first():
        tenant = Tenant(name="Acme Corp", domain="acme.com")
        db.session.add(tenant)
        db.session.flush()
        
        admin = User(
            tenant_id=tenant.id,
            email="admin@example.com",
            password_hash=generate_password_hash("password123"),
            role="Admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("Database Initialized & Default Admin Seeded: admin@example.com / password123")
    else:
        print("Database Ready.")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
