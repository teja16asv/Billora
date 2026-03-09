import uuid
from datetime import datetime
from app.extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class Tenant(db.Model):
    __tablename__ = 'tenants'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    domain = db.Column(db.String(100), unique=True, nullable=True)
    razorpay_account_id = db.Column(db.String(100), nullable=True)
    logo_url = db.Column(db.Text, nullable=True)
    brand_color = db.Column(db.String(20), nullable=True, default='#2563eb')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    users = db.relationship('User', backref='tenant', lazy=True)
    customers = db.relationship('Customer', backref='tenant', lazy=True)
    invoices = db.relationship('Invoice', backref='tenant', lazy=True)


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    tenant_id = db.Column(db.String(36), db.ForeignKey('tenants.id'), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='Customer') # Roles: Admin, Customer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('tenant_id', 'email', name='uq_user_tenant_email'),)


class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    tenant_id = db.Column(db.String(36), db.ForeignKey('tenants.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True) # Optional link to a login user
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    address = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    invoices = db.relationship('Invoice', backref='customer', lazy=True)
    usage_records = db.relationship('UsageRecord', backref='customer', lazy=True)


class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    tenant_id = db.Column(db.String(36), db.ForeignKey('tenants.id'), nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    invoice_number = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='DRAFT') # DRAFT, SENT, PAID, OVERDUE
    due_date = db.Column(db.Date, nullable=False)
    pdf_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    payments = db.relationship('Payment', backref='invoice_payment', lazy=True)
    usage_records = db.relationship('UsageRecord', backref='invoice_ref', lazy=True)


class UsageRecord(db.Model):
    __tablename__ = 'usage_records'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    tenant_id = db.Column(db.String(36), db.ForeignKey('tenants.id'), nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.id'), nullable=False)
    invoice_id = db.Column(db.String(36), db.ForeignKey('invoices.id'), nullable=True)
    metric_name = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False, default=0) # Calculated cost
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)


class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    tenant_id = db.Column(db.String(36), db.ForeignKey('tenants.id'), nullable=False)
    invoice_id = db.Column(db.String(36), db.ForeignKey('invoices.id'), nullable=False)
    razorpay_payment_id = db.Column(db.String(100), nullable=True)
    razorpay_order_id = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='INR')
    status = db.Column(db.String(20), default='PENDING') # SUCCESS, FAILED, PENDING
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    tenant_id = db.Column(db.String(36), db.ForeignKey('tenants.id'), nullable=False)
    recipient_email = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(20), default='EMAIL')
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='PENDING') # SENT, FAILED, PENDING
    sent_at = db.Column(db.DateTime, nullable=True)
