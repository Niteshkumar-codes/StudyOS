import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || 'StudyOS <no-reply@studyos.com>';

// Check for required SMTP environment variables and warn if any are missing
const checkSmtpConfig = () => {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
     
    console.warn(`\n⚠️  [SMTP Warning]: Missing SMTP environment variables: ${missingVars.join(', ')}`);
     
    console.warn('⚠️  StudyOS will fall back to logging OTP codes and links to the backend terminal in DEVELOPMENT mode.\n');
  }
};

checkSmtpConfig();

// Helper to log OTP to console in the specified format
const logOtpToConsole = (email: string, otp: string) => {
   
  console.log('========================================');
   
  console.log('StudyOS Development OTP');
   
  console.log('');
   
  console.log('Email:');
   
  console.log(email);
   
  console.log('');
   
  console.log('OTP:');
   
  console.log(otp);
   
  console.log('');
   
  console.log('Expires:');
   
  console.log('5 minutes');
   
  console.log('');
   
  console.log('========================================');
};

// Create transporter if SMTP settings are available
let transporter: nodemailer.Transporter | null = null;

if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Verify the SMTP transporter.
 */
export const verifyTransporter = async (): Promise<void> => {
  if (!transporter) {
    console.error(new Error('SMTP transporter is not configured. Missing host, user, or pass.'));
    return;
  }
  try {
    await transporter.verify();
    console.log('SMTP connected successfully');
  } catch (error: any) {
    console.error(error);
  }
};

/**
 * Send an OTP verification email.
 */
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const subject = 'StudyOS - Verify Your Email';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StudyOS - Verify Your Email</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; width: 100% !important; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
        .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .logo-container { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 28px; font-weight: 800; color: #4f46e5; letter-spacing: -0.05em; display: inline-block; }
        .greeting { font-size: 16px; line-height: 24px; color: #0f172a; margin-bottom: 16px; font-weight: 600; }
        .instruction { font-size: 14px; line-height: 22px; color: #475569; margin-bottom: 24px; }
        .otp-wrapper { text-align: center; margin: 32px 0; }
        .otp-box { display: inline-block; background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; font-size: 36px; font-weight: 800; text-align: center; padding: 18px 36px; letter-spacing: 8px; color: #0f172a; }
        .expiry-notice { font-size: 13px; color: #dc2626; font-weight: 600; text-align: center; margin-top: 8px; }
        .security-notice { font-size: 12px; line-height: 18px; color: #64748b; background-color: #f8fafc; border-left: 4px solid #94a3b8; padding: 12px; margin: 24px 0; border-radius: 0 6px 6px 0; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 32px; line-height: 18px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="logo-container">
            <div class="logo">StudyOS</div>
          </div>
          <div class="greeting">Hello,</div>
          <div class="instruction">
            Thank you for registering with StudyOS. To complete your account registration and verify your email address, please use the following 6-digit One-Time Password (OTP):
          </div>
          <div class="otp-wrapper">
            <div class="otp-box">${otp}</div>
            <div class="expiry-notice">This code expires in 5 minutes.</div>
          </div>
          <div class="security-notice">
            <strong>Security Notice:</strong> Never share this verification code with anyone. StudyOS support will never ask for your OTP. If you did not request this code, you can safely ignore this email.
          </div>
          <div class="footer">
            This is an automated system email. Please do not reply directly to this message.<br>
            &copy; ${new Date().getFullYear()} StudyOS. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    console.log('Email sending started');
    try {
      await transporter.verify();
      await transporter.sendMail({
        from,
        to: email,
        subject,
        html,
      });
      console.log('Email successfully delivered');
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    // Keep console fallback only for development when SMTP is intentionally not configured.
    console.warn(`[SMTP] Console fallback execution triggered for: ${email}`);
    logOtpToConsole(email, otp);
  }
};

/**
 * Send a password reset email.
 */
export const sendResetPasswordEmail = async (email: string, resetLink: string): Promise<void> => {
  const subject = 'Reset your StudyOS Password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; text-align: center; margin-bottom: 24px; letter-spacing: -0.025em; }
        .title { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #64748b; text-align: center; line-height: 1.5; margin-bottom: 24px; }
        .btn-container { text-align: center; margin-bottom: 24px; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: bold; text-decoration: none; border-radius: 8px; padding: 12px 24px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
        .link-text { word-break: break-all; font-size: 12px; color: #94a3b8; text-align: center; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">StudyOS</div>
        <div class="title">Reset Your Password</div>
        <div class="desc">We received a request to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</div>
        <div class="btn-container">
          <a class="btn" href="${resetLink}" target="_blank">Reset Password</a>
        </div>
        <div class="desc">If you did not request this reset, you can safely ignore this email. Your password will remain unchanged.</div>
        <div class="link-text">
          If the button doesn't work, copy and paste this link in your browser:<br>
          <a href="${resetLink}" target="_blank">${resetLink}</a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} StudyOS. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    await transporter.sendMail({
      from,
      to: email,
      subject,
      html,
    });
  } else {
     
    console.warn('\n⚠️  SMTP settings not configured. Logging reset link instead:');
     
    console.log(`✉️  [Email Sent to ${email}]: Reset Link is: ${resetLink}\n`);
  }
};
