import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_email(to_email, subject, content):
        """
        Sends an email via SendGrid, falls back to print if no API key is set.
        """
        api_key = os.getenv('SENDGRID_API_KEY')
        from_email = os.getenv('SENDGRID_FROM_EMAIL', 'no-reply@yourdomain.com') # Must be verified in SendGrid
        
        if not api_key or api_key == 'SG.xxxxxx_yyyyyy':
            print("No valid SENDGRID_API_KEY found. Falling back to stdout mock.")
            print(f"\n{'='*40}", flush=True)
            print(f"MOCK EMAIL DISPATCH: To {to_email}", flush=True)
            print(f"Subject: {subject}", flush=True)
            print(f"Content: \n{content}", flush=True)
            print(f"{'='*40}\n", flush=True)
            return True
            
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            plain_text_content=content
        )
        try:
            sg = SendGridAPIClient(api_key)
            response = sg.send(message)
            print(f"✅ SendGrid Email Sent to {to_email}! Status: {response.status_code}")
            return True
        except Exception as e:
            print(f"❌ SendGrid Error: {str(e)}")
            return False

    @staticmethod
    def notify_invoice_generated(invoice):
        magic_link = f"http://localhost:5173/pay/{invoice.id}"
        subject = f"Your Invoice {invoice.invoice_number} is Ready"
        content = f"Hello {invoice.customer.name},\n\nYour invoice {invoice.invoice_number} for amount ${float(invoice.amount):.2f} is due on {invoice.due_date}.\n\nPlease click the secure link below to view and pay your invoice:\n{magic_link}"
        NotificationService.send_email(invoice.customer.email, subject, content)

    @staticmethod
    def notify_invoice_overdue(invoice):
        subject = f"URGENT: Invoice {invoice.invoice_number} is OVERDUE"
        content = f"Hello {invoice.customer.name},\n\nYour invoice {invoice.invoice_number} was due on {invoice.due_date}. Please pay immediately."
        NotificationService.send_email(invoice.customer.email, subject, content)
