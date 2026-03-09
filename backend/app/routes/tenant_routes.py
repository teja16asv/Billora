from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models import Tenant
from app.middleware.auth import require_auth, require_role

tenant_bp = Blueprint('tenant', __name__)

@tenant_bp.route('/settings', methods=['GET'])
@require_auth
@require_role(['Admin'])
def get_tenant_settings():
    tenant = Tenant.query.get(g.tenant_id)
    if not tenant:
        return jsonify({"error": "Tenant not found"}), 404
    return jsonify({
        "name": tenant.name,
        "logo_url": tenant.logo_url,
        "brand_color": tenant.brand_color
    }), 200

@tenant_bp.route('/settings', methods=['PUT'])
@require_auth
@require_role(['Admin'])
def update_tenant_settings():
    tenant = Tenant.query.get(g.tenant_id)
    if not tenant:
        return jsonify({"error": "Tenant not found"}), 404
        
    data = request.json
    if 'name' in data and data['name'].strip():
        tenant.name = data['name'].strip()
    if 'logo_url' in data:
        tenant.logo_url = data['logo_url']
    if 'brand_color' in data:
        tenant.brand_color = data['brand_color']
        
    db.session.commit()
    return jsonify({"message": "Settings updated successfully"}), 200
