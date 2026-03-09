import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.models import Invoice, Tenant
from app.extensions import db
from datetime import datetime, timedelta

# Set up simple logging for the scheduler
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_overdue_invoices(app):
    """
    Job to scan for invoices that are overdue and trigger the notification service.
    Requires passing the Flask app instance to run within the app context.
    """
    with app.app_context():
        logger.info("Running scheduled job: check_overdue_invoices")
        try:
            today = datetime.utcnow().date()
            # Find invoices that are Pending/Sent but past their due date
            overdue_invoices = Invoice.query.filter(
                Invoice.status.in_(['PENDING', 'SENT']),
                Invoice.due_date < today
            ).all()

            count = 0
            for invoice in overdue_invoices:
                invoice.status = 'OVERDUE'
                db.session.add(invoice)
                # In a real app, you would call notification_service.send_overdue_email(invoice) here
                logger.info(f"Marked Invoice {invoice.invoice_number} as OVERDUE.")
                count += 1
                
            db.session.commit()
            logger.info(f"Scheduled job complete. Marked {count} invoices as overdue.")
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error in check_overdue_invoices job: {str(e)}")


def init_scheduler(app):
    """
    Initializes and starts the background job scheduler.
    """
    scheduler = BackgroundScheduler(daemon=True)
    # Run everyday at midnight (using interval for demonstration purposes to run every 12 hours)
    scheduler.add_job(func=lambda: check_overdue_invoices(app), trigger="interval", hours=12, id='overdue_check')
    scheduler.start()
    logger.info("APScheduler started successfully.")
