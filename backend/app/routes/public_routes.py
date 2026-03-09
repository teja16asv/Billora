from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Invoice, Payment
from app.services.payment_service import PaymentService

public_bp = Blueprint('public', __name__)

@public_bp.route('/invoices/<id>', methods=['GET'])
def get_public_invoice(id):
    """
    Exposes extremely limited invoice data for a public checkout page.
    Relies on the unguessable UUID for security.
    """
    invoice = Invoice.query.filter_by(id=id).first()
    
    if not invoice:
        return jsonify({"error": "Invoice not found or invalid link"}), 404
        
    return jsonify({
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "amount": str(invoice.amount),
        "status": invoice.status,
        "due_date": str(invoice.due_date),
        "customer_name": invoice.customer.name,
        "company_name": invoice.tenant.name,
        "logo_url": invoice.tenant.logo_url,
        "brand_color": invoice.tenant.brand_color
    }), 200

    
@public_bp.route('/payments/create-order', methods=['POST'])
def create_public_payment_order():
    """
    Initializes a Razorpay order without requiring an Admin JWT.
    """
    data = request.json
    invoice_id = data.get('invoice_id')
    
    if not invoice_id:
        return jsonify({"error": "Invoice ID required"}), 400
        
    invoice = Invoice.query.filter_by(id=invoice_id).first()
    
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404
        
    if invoice.status == 'PAID':
        return jsonify({"error": "Invoice is already paid"}), 400
        
    try:
        # Create Razorpay order
        order_id = PaymentService.create_order(float(invoice.amount), receipt_id=invoice.invoice_number)
        
        # Log pending payment
        payment = Payment(
            tenant_id=invoice.tenant_id,
            invoice_id=invoice.id,
            razorpay_order_id=order_id,
            amount=invoice.amount,
            status='PENDING'
        )
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({"order_id": order_id, "amount": float(invoice.amount), "currency": "INR"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
