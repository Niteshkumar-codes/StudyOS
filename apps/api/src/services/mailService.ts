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
 * Send an OTP verification email.
 */
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const subject = 'Verify your StudyOS Account - OTP Code';

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
        .otp-box { background-color: #f1f5f9; border-radius: 8px; font-size: 32px; font-weight: bold; text-align: center; padding: 16px; letter-spacing: 6px; color: #0f172a; border: 1px solid #e2e8f0; margin-bottom: 24px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">StudyOS</div>
        <div class="title">Verification Code</div>
        <div class="desc">Please use the verification code below to verify your email. This code is only valid for 5 minutes.</div>
        <div class="otp-box">${otp}</div>
        <div class="desc">If you did not request this code, you can safely ignore this email.</div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} StudyOS. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: email,
        subject,
        html,
      });
       
      console.log(`[SMTP] Email sent successfully to: ${email}`);
    } catch (error) {
       
      console.error(`[SMTP] Failed to send email to ${email}:`, error);
       
      console.warn('[SMTP] Console fallback used due to email sending failure.');
      logOtpToConsole(email, otp);
    }
  } else {
     
    console.warn('[SMTP] Console fallback used (SMTP not configured).');
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
