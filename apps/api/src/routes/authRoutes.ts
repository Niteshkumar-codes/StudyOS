import { Router } from 'express';
import { z } from 'zod';
import passport from 'passport';
import '../config/passport'; // ensure strategy is registered
import { validateBody } from '../middleware/validationMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import {
  register,
  verifyOtp,
  resendOtp,
  checkUsername,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  googleCallbackSuccess,
} from '../controllers/authController';

const router: Router = Router();

// Validation Schemas
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain alphanumeric characters and underscores',
      ),
    email: z.string().email('Please provide a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    preparationTypes: z.array(z.string()).min(1, 'Please select at least one preparation type'),
    termsAcceptance: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const loginSchema = z.object({
  loginId: z.string().min(1, 'Please enter your username or email'),
  password: z.string().min(1, 'Please enter your password'),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Routes configuration
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/verify-otp', authLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', authLimiter, validateBody(resendOtpSchema), resendOtp);
router.get('/check-username', checkUsername);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), resetPassword);

router.get('/google/status', (req, res) => {
  const isConfigured =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'dummy-client-id' &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== 'dummy-client-secret';
  res.json({ configured: !!isConfigured });
});

// Google OAuth endpoints
router.get(
  '/google',
  (req, res, next) => {
    const isConfigured =
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_ID !== 'dummy-client-id' &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CLIENT_SECRET !== 'dummy-client-secret';

    if (!isConfigured) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Sign-In Not Configured</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 40px; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { max-width: 500px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: center; }
            h1 { font-size: 22px; color: #0f172a; margin-bottom: 16px; }
            p { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
            .btn { display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 10px 20px; font-weight: bold; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚠️ Google Sign-In Not Configured</h1>
            <p>Google OAuth credentials are missing or set to dummy values in the backend environment configuration. Please set <strong>GOOGLE_CLIENT_ID</strong> and <strong>GOOGLE_CLIENT_SECRET</strong> in your environment variables to enable this feature.</p>
            <a href="http://localhost:3000/login" class="btn">Back to Login</a>
          </div>
        </body>
        </html>
      `);
    }
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account',
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login?error=GoogleOAuthFailed',
    session: false,
  }),
  googleCallbackSuccess,
);

export default router;
