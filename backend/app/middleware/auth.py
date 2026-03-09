from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def require_auth(fn):
    """
    Decorator to verify JWT and inject `tenant_id` and `user_id` into Flask global `g`.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            g.tenant_id = claims.get('tenant_id')
            g.user_id = claims.get('sub')
            g.role = claims.get('role')
        except Exception as e:
            return jsonify({"error": "Unauthorized Access", "message": str(e)}), 401
            
        return fn(*args, **kwargs)
    return wrapper

def require_role(allowed_roles):
    """
    Decorator to enforce Role-Based Access Control (RBAC).
    Needs to be used *after* @require_auth.
    `allowed_roles` should be a list, e.g., ['Admin']
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not hasattr(g, 'role') or g.role not in allowed_roles:
                return jsonify({"error": "Forbidden", "message": f"Requires one of roles: {allowed_roles}"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
