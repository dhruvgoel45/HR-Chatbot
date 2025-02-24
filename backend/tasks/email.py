# email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from utilities.config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD

def send_email(to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email failed to send: {str(e)}")
        return False