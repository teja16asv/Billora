import os
from datetime import datetime
from flask import Blueprint, request, jsonify, g, send_file
from app.extensions import db
from app.models import Invoice, UsageRecord, Customer
from app.middleware.auth import require_auth, require_role
from app.services.pdf_service import PDFService
from app.services.notification_service import NotificationService

invoice_bp = Blueprint('invoices', __name__)

import pandas as pd
from werkzeug.utils import secure_filename
import io

@invoice_bp.route('/usage/upload', methods=['POST'])
@require_auth
@require_role(['Admin'])
def upload_usage():
    # Support CSV files or raw JSON
    data = []
    
    if 'file' in request.files:
        file = request.files['file']
        if file.filename.endswith('.csv'):
            try:
                stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
                df = pd.read_csv(stream)
                # Expecting headers: customer_id, metric_name, quantity, amount
                data = df.to_dict('records')
            except Exception as e:
                return jsonify({"error": f"Invalid CSV format: {str(e)}"}), 400
        else:
            return jsonify({"error": "Only standard .csv files are supported."}), 400
    elif request.json:
        data = request.json
    else:
        return jsonify({"error": "No file or json payload provided"}), 400
        
    added_records = 0
    for item in data:
        # Verify Customer belongs to this tenant
        customer = Customer.query.filter_by(id=item.get('customer_id'), tenant_id=g.tenant_id).first()
        if not customer:
            continue
            
        record = UsageRecord(
            tenant_id=g.tenant_id,
            customer_id=customer.id,
            metric_name=item.get('metric_name'),
            quantity=item.get('quantity', 0),
            amount=item.get('amount', 0.0)
        )
        db.session.add(record)
        added_records += 1
        
    db.session.commit()
    return jsonify({"message": f"Successfully loaded {added_records} usage records."}), 201

@invoice_bp.route('/invoices', methods=['POST'])
@require_auth
@require_role(['Admin'])
def generate_invoices():
    # Example approach: Generate an invoice for all unbilled usage records per customer
    unbilled_records = UsageRecord.query.filter_by(tenant_id=g.tenant_id, invoice_id=None).all()
    
    if not unbilled_records:
        return jsonify({"message": "No unbilled usage records found."}), 400
        
    # Group by customer
    grouped = {}
    for r in unbilled_records:
        grouped.setdefault(r.customer_id, []).append(r)
        
    generated = 0
    for customer_id, records in grouped.items():
        total_amount = sum(float(r.amount) for r in records)
        
        invoice = Invoice(
            tenant_id=g.tenant_id,
            customer_id=customer_id,
            invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{customer_id[:4]}",
            amount=total_amount,
            status='DRAFT',
            due_date=datetime.utcnow() # Normally +30 days
        )
        db.session.add(invoice)
        db.session.flush() # Get invoice.id
        
        # Link records to invoice
        for r in records:
            r.invoice_id = invoice.id
            
        # Generate PDF
        pdf_path = PDFService.generate_invoice_pdf(invoice)
        invoice.pdf_url = pdf_path
        
        # Dispatch email
        invoice.status = 'SENT'
        NotificationService.notify_invoice_generated(invoice)
        generated += 1
        
    db.session.commit()
    return jsonify({"message": f"Generated {generated} invoices."}), 201


@invoice_bp.route('/invoices', methods=['GET'])
@require_auth
def list_invoices():
    """Admin sees all tenant invoices, Customer sees only their own"""
    
    # Advanced: Pagination & Filtering parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status_filter = request.args.get('status')
    search_query = request.args.get('search')
    
    query = Invoice.query.filter_by(tenant_id=g.tenant_id)
    
    # Roles Isolation
    if g.role == 'Customer':
        customer = Customer.query.filter_by(user_id=g.user_id).first()
        if customer:
            query = query.filter_by(customer_id=customer.id)
        else:
            return jsonify({"data": [], "total": 0, "page": page, "pages": 0}), 200

    # Apply advanced filters
    if status_filter:
        query = query.filter_by(status=status_filter.upper())
        
    if search_query:
        # Search by invoice numeric string (simplistic implementation)
        query = query.filter(Invoice.invoice_number.ilike(f"%{search_query}%"))
        
    # Execute Pagination
    paginated = query.order_by(Invoice.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    results = [{
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "amount": str(inv.amount),
        "status": inv.status,
        "due_date": str(inv.due_date)
    } for inv in paginated.items]
    
    return jsonify({
        "data": results,
        "total": paginated.total,
        "page": paginated.page,
        "pages": paginated.pages
    }), 200

@invoice_bp.route('/invoices/<id>/download', methods=['GET'])
@require_auth
def download_invoice(id):
    invoice = Invoice.query.filter_by(id=id, tenant_id=g.tenant_id).first_or_404()
    
    # Needs RBAC logic for Customer role strictly accessing their own invoice id.
    
    if invoice.pdf_url and os.path.exists(invoice.pdf_url):
        absolute_path = os.path.abspath(invoice.pdf_url)
        return send_file(absolute_path, as_attachment=True)
    return jsonify({"error": "PDF not found"}), 404
