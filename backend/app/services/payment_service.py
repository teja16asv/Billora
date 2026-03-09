import razorpay
from flask import current_app

def get_razorpay_client():
    key_id = current_app.config['RAZORPAY_KEY_ID']
    key_secret = current_app.config['RAZORPAY_KEY_SECRET']
    if not key_id or not key_secret:
        raise ValueError("Razorpay environment variables not set.")
    return razorpay.Client(auth=(key_id, key_secret))

class PaymentService:
    @staticmethod
    def create_order(amount_in_rupees, receipt_id):
        """
        Creates a Razorpay order. Amount must be passed in paise to Razorpay.
        """
        client = get_razorpay_client()
        amount_in_paise = int(amount_in_rupees * 100)
        
        data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": receipt_id,
            "payment_capture": "1" # Auto capture
        }
        
        order = client.order.create(data=data)
        return order['id']
        
    @staticmethod
    def verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Verifies the X-Razorpay-Signature webhook authenticity.
        """
        client = get_razorpay_client()
        params = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        try:
            client.utility.verify_payment_signature(params)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False
