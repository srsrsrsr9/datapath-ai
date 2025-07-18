import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.fromEmail = process.env.SMTP_USER || 'noreply@datapath.ai';
    this.transporter = nodemailer.createTransport(config);
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<void> {
    const domains = process.env.REPLIT_DOMAINS?.split(',') || ['localhost:5000'];
    const domain = domains[0];
    const verificationUrl = `https://${domain}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: email,
      subject: 'Verify Your Email - DataPath.ai',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background-color: #2563eb; border-radius: 50%; margin-bottom: 20px;">
                <span style="color: white; font-size: 24px;">📊</span>
              </div>
              <h1 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 600;">Welcome to DataPath.ai!</h1>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                ${firstName ? `Hi ${firstName}` : 'Hello'},
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining DataPath.ai! We're excited to help you on your journey to becoming a Data Analyst.
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                To access your personalized learning roadmap, please verify your email address by clicking the button below:
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="color: #64748b; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                If you didn't create an account with DataPath.ai, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Welcome to DataPath.ai!

${firstName ? `Hi ${firstName}` : 'Hello'},

Thank you for joining DataPath.ai! We're excited to help you on your journey to becoming a Data Analyst.

To access your personalized learning roadmap, please verify your email address by visiting this link:

${verificationUrl}

If you didn't create an account with DataPath.ai, please ignore this email.

Best regards,
The DataPath.ai Team
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
