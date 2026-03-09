from flask import request, Blueprint, jsonify, g
from sqlalchemy import func
from app.extensions import db
from app.models import Customer, Invoice, UsageRecord
from app.middleware.auth import require_auth, require_role

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@require_auth
@require_role(['Admin'])
def get_dashboard_stats():
    """
    Returns aggregated metrics for the Tenant Admin Dashboard.
    """
    tenant_id = g.tenant_id
    
    total_customers = Customer.query.filter_by(tenant_id=tenant_id).count()
    
    # Invoices Stats
    total_invoices = Invoice.query.filter_by(tenant_id=tenant_id).count()
    paid_invoices = Invoice.query.filter_by(tenant_id=tenant_id, status='PAID').count()
    overdue_invoices = Invoice.query.filter_by(tenant_id=tenant_id, status='OVERDUE').count()
    
    # Revenue Stats
    total_revenue_query = db.session.query(func.sum(Invoice.amount)).filter_by(tenant_id=tenant_id, status='PAID').scalar()
    total_revenue = float(total_revenue_query) if total_revenue_query else 0.0
    
    outstanding_revenue_query = db.session.query(func.sum(Invoice.amount)).filter_by(tenant_id=tenant_id).filter(Invoice.status.in_(['DRAFT', 'SENT', 'OVERDUE'])).scalar()
    outstanding_revenue = float(outstanding_revenue_query) if outstanding_revenue_query else 0.0
    
    # Generate mock 7-day timeseries data for the Chart
    import random
    from datetime import timedelta
    today = datetime.utcnow().date()
    chart_data = []
    current_revenue = total_revenue
    
    for i in range(7):
        day = today - timedelta(days=6-i)
        chart_data.append({
            "name": day.strftime("%b %d"),
            "revenue": max(0, current_revenue - random.randint(100, 1000) * (6-i)),
            "invoices": random.randint(1, 15)
        })
    
    return jsonify({
        "customers": total_customers,
        "invoices": {
            "total": total_invoices,
            "paid": paid_invoices,
            "overdue": overdue_invoices
        },
        "revenue": {
            "total_collected": total_revenue,
            "outstanding": outstanding_revenue
        },
        "chart_data": chart_data
    }), 200
