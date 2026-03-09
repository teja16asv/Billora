from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models import Tenant, Customer, User
from app.middleware.auth import require_auth, require_role

customer_bp = Blueprint('customers', __name__)

@customer_bp.route('/tenants', methods=['GET'])
@require_auth
@require_role(['Admin'])
def get_tenant_info():
    """Admin can get their tenant details."""
    tenant = Tenant.query.get(g.tenant_id)
    return jsonify({
        "id": tenant.id,
        "name": tenant.name,
        "domain": tenant.domain
    }), 200

@customer_bp.route('/customers', methods=['GET'])
@require_auth
@require_role(['Admin']) # Notice no 'Customer' role here, users can't see other customers.
def list_customers():
    # Tenant Isolation inherently applied via g.tenant_id
    customers = Customer.query.filter_by(tenant_id=g.tenant_id).all()
    results = [{"id": c.id, "name": c.name, "email": c.email} for c in customers]
    return jsonify(results), 200

@customer_bp.route('/customers', methods=['POST'])
@require_auth
@require_role(['Admin'])
def create_customer():
    data = request.json
    new_customer = Customer(
        tenant_id=g.tenant_id,
        name=data.get('name'),
        email=data.get('email'),
        address=data.get('address')
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "Customer created successfully", "customer_id": new_customer.id}), 201
