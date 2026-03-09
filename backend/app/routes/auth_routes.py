from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.extensions import db, limiter
from app.models import Tenant, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per hour")
def register():
    data = request.json
    tenant_name = data.get('tenant_name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([tenant_name, email, password]):
        return jsonify({"error": "Missing data"}), 400
        
    # Create the isolated tenant
    tenant = Tenant(name=tenant_name)
    db.session.add(tenant)
    db.session.flush() # Get tenant.id
    
    if User.query.filter_by(email=email).first():
        db.session.rollback()
        return jsonify({"error": "User email already exists"}), 409
        
    # Admin User
    hashed_password = generate_password_hash(password)
    user = User(tenant_id=tenant.id, email=email, password_hash=hashed_password, role='Admin')
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "Registration successful", "tenant_id": tenant.id}), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Inject tenant_id and role into the JWT payload
    additional_claims = {
        "tenant_id": user.tenant_id,
        "role": user.role
    }
    access_token = create_access_token(identity=user.id, additional_claims=additional_claims)
    
    return jsonify({"access_token": access_token, "role": user.role}), 200
