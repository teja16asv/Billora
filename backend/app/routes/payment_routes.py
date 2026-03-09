from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models import Invoice, Payment
from app.middleware.auth import require_auth
from app.services.payment_service import PaymentService

payment_bp = Blueprint('payments', __name__)

@payment_bp.route('/create-order', methods=['POST'])
@require_auth
def create_payment_order():
    data = request.json
    invoice_id = data.get('invoice_id')
    
    invoice = Invoice.query.filter_by(id=invoice_id, tenant_id=g.tenant_id).first_or_404()
    
    if invoice.status == 'PAID':
        return jsonify({"error": "Invoice is already paid"}), 400
        
    try:
        # Create Razorpay order
        order_id = PaymentService.create_order(float(invoice.amount), receipt_id=invoice.invoice_number)
        
        # Log pending payment
        payment = Payment(
            tenant_id=g.tenant_id,
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


@payment_bp.route('/verify', methods=['POST'])
# This is typically a public webhook, no @require_auth, but we validate X-Razorpay-Signature
def verify_payment():
    data = request.json
    
    # In a real webhook, fields are extracted from payload and headers. 
    # Here we simulate the frontend sending the verification details directly.
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_signature = data.get('razorpay_signature')
    
    is_valid = PaymentService.verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    
    if not is_valid:
        return jsonify({"error": "Invalid signature"}), 400
        
    # Update payment status
    payment = Payment.query.filter_by(razorpay_order_id=razorpay_order_id).first()
    if payment:
        payment.status = 'SUCCESS'
        payment.razorpay_payment_id = razorpay_payment_id
        
        # Update associated invoice
        invoice = Invoice.query.get(payment.invoice_id)
        if invoice:
            invoice.status = 'PAID'
            
        db.session.commit()
        return jsonify({"message": "Payment successful"}), 200
        
    return jsonify({"error": "Payment record not found"}), 404
