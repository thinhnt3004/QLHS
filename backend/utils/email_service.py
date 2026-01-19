"""
Email Notification Service
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

class EmailService:
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SENDER_EMAIL = "your-email@gmail.com"
    SENDER_PASSWORD = "your-app-password"
    
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str):
        """Gửi email"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = EmailService.SENDER_EMAIL
            message["To"] = to_email
            
            part = MIMEText(html_content, "html")
            message.attach(part)
            
            with smtplib.SMTP(EmailService.SMTP_SERVER, EmailService.SMTP_PORT) as server:
                server.starttls()
                server.login(EmailService.SENDER_EMAIL, EmailService.SENDER_PASSWORD)
                server.sendmail(EmailService.SENDER_EMAIL, to_email, message.as_string())
            
            return True
        except Exception as e:
            print(f"Lỗi gửi email: {e}")
            return False
    
    @staticmethod
    def send_warning_to_student(student_name: str, email: str, avg_grade: float):
        """Gửi cảnh báo cho học sinh yếu"""
        subject = f"⚠️ Cảnh báo: Điểm số {student_name}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Cảnh báo Điểm số</h2>
                <p>Xin chào <strong>{student_name}</strong>,</p>
                <p>Hệ thống phát hiện rằng điểm trung bình của bạn hiện tại là <strong>{avg_grade:.2f}/10</strong>.</p>
                <p>Chúng tôi khuyến nghị bạn nên:</p>
                <ul>
                    <li>Học tập chăm chỉ hơn</li>
                    <li>Tham gia các lớp phụ đạo</li>
                    <li>Liên hệ với giáo viên để xin hỗ trợ</li>
                </ul>
                <p>Nếu cần hỗ trợ, vui lòng liên hệ với giáo viên chủ nhiệm.</p>
                <hr>
                <p><em>Email tự động từ Hệ thống Quản lý Trường Học</em></p>
            </body>
        </html>
        """
        return EmailService.send_email(email, subject, html_content)
    
    @staticmethod
    def send_report_to_parent(student_name: str, email: str, gpa: float, classification: str):
        """Gửi báo cáo cho phụ huynh"""
        subject = f"📊 Báo cáo học tập {student_name}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Báo cáo Học tập</h2>
                <p>Kính gửi Phụ huynh,</p>
                <p>Đây là báo cáo học tập của <strong>{student_name}</strong>:</p>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr style="background-color: #f0f0f0;">
                        <td style="border: 1px solid #ddd; padding: 10px;"><strong>GPA</strong></td>
                        <td style="border: 1px solid #ddd; padding: 10px;">{gpa:.2f}/4.0</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 10px;"><strong>Xếp loại</strong></td>
                        <td style="border: 1px solid #ddd; padding: 10px;"><strong>{classification}</strong></td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">Cảm ơn sự quan tâm của quý phụ huynh.</p>
                <hr>
                <p><em>Email tự động từ Hệ thống Quản lý Trường Học</em></p>
            </body>
        </html>
        """
        return EmailService.send_email(email, subject, html_content)
