import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { Otp } from '../models/Otp';
import { sendOtpEmail, sendResetPasswordEmail } from '../services/mailService';
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../services/tokenService';

const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, preparationTypes } = req.body;

    const lowerEmail = email.toLowerCase().trim();
    const lowerUsername = username.toLowerCase().trim();

    // 1. Check if username is taken by a verified user
    const existingUsername = await User.findOne({ username: lowerUsername });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // 2. Check if email is already registered and verified
    let user = await User.findOne({ email: lowerEmail });
    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // 3. If user exists but is not verified, update details
    if (user && !user.isVerified) {
      user.name = name;
      user.username = lowerUsername;
      user.password = password; // Pre-save hook will hash it
      user.preparationTypes = preparationTypes || [];
      await user.save();
       
      console.log(`[Auth] User created (updated unverified): ${lowerEmail}`);
    } else {
      // Create new unverified user
      user = await User.create({
        name,
        username: lowerUsername,
        email: lowerEmail,
        password,
        preparationTypes: preparationTypes || [],
        isVerified: false,
      });
       
      console.log(`[Auth] User created: ${lowerEmail}`);
    }

    // 4. Generate OTP
    const code = generateOtpCode();
     
    console.log(`[Auth] OTP generated for ${lowerEmail}: ${code}`);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any old OTPs for this email
    await Otp.deleteMany({ email: lowerEmail });

    // Save new OTP
    await Otp.create({
      email: lowerEmail,
      code,
      expiresAt,
    });
     
    console.log(`[Auth] OTP saved for ${lowerEmail}`);

    // 5. Send OTP via email
    await sendOtpEmail(lowerEmail, code);

    return res.status(201).json({
      message: 'Registration initiated. OTP code sent to your email.',
      email: lowerEmail,
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    });
  } catch (error: any) {
     
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const lowerEmail = email.toLowerCase().trim();

     
    console.log(`[Auth] Verify request received for ${lowerEmail} with code: ${code}`);

    const otpDoc = await Otp.findOne({ email: lowerEmail });
    if (!otpDoc) {
       
      console.log(`[Auth] OTP expired for ${lowerEmail}`);
      return res
        .status(400)
        .json({ message: 'Verification code expired or not found. Please request a new one.' });
    }

    // Attempt rate limiting (max 3 attempts per OTP)
    if (otpDoc.attempts >= 3) {
      await Otp.deleteOne({ email: lowerEmail });
       
      console.log(`[Auth] OTP expired (too many failed attempts) for ${lowerEmail}`);
      return res
        .status(400)
        .json({ message: 'Too many invalid attempts. Please request a new verification code.' });
    }

    if (otpDoc.code !== code) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: 'Invalid verification code' });
    }

     
    console.log(`[Auth] OTP matched for ${lowerEmail}`);

    // Verified! Update user status
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    user.isVerified = true;
    await user.save();
     
    console.log(`[Auth] Account verified: ${lowerEmail}`);

    // Clean up OTP document
    await Otp.deleteOne({ email: lowerEmail });

    // Generate JWT tokens
    const payload = { userId: user.id, username: user.username, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await saveRefreshToken(user._id as any, refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: 'Account verified successfully',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        preparationTypes: user.preparationTypes,
        xp: user.xp,
        level: user.level,
        streakCount: user.streakCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
     
    console.error('OTP Verification Error:', error);
    return res.status(500).json({ message: 'OTP verification failed.' });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(404).json({ message: 'Email address not registered' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified' });
    }

    // Rate Limit Check: enforce 60 seconds delay between OTP generation requests
    const latestOtp = await Otp.findOne({ email: lowerEmail });
    if (latestOtp) {
      const diffMs = Date.now() - latestOtp.createdAt.getTime();
      if (diffMs < 60 * 1000) {
        const waitSec = Math.ceil((60 * 1000 - diffMs) / 1000);
        return res
          .status(429)
          .json({ message: `Please wait ${waitSec} seconds before requesting a new OTP.` });
      }
    }

    // Generate and save new OTP
    const code = generateOtpCode();
     
    console.log(`[Auth] OTP generated for ${lowerEmail}: ${code}`);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email: lowerEmail });
    await Otp.create({
      email: lowerEmail,
      code,
      expiresAt,
    });
     
    console.log(`[Auth] OTP saved for ${lowerEmail}`);

    await sendOtpEmail(lowerEmail, code);

    return res.status(200).json({ message: 'New verification code sent to your email.' });
  } catch (error) {
     
    console.error('Resend OTP Error:', error);
    return res.status(500).json({ message: 'Failed to resend OTP. Please try again.' });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  try {
    const username = ((req.query.username as string) || '').toLowerCase().trim();
    if (!username) {
      return res.status(400).json({ message: 'Username parameter required' });
    }

    const user = await User.findOne({ username });
    return res.status(200).json({ available: !user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to check username availability' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or username
    const cleanLoginId = loginId.toLowerCase().trim();

    // Query user and explicitly select password field
    const user = await User.findOne({
      $or: [{ email: cleanLoginId }, { username: cleanLoginId }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is verified
    if (!user.isVerified) {
      // Trigger new OTP so user can verify
      const code = generateOtpCode();
       
      console.log(`[Auth] OTP generated for ${user.email}: ${code}`);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await Otp.deleteMany({ email: user.email });
      await Otp.create({ email: user.email, code, expiresAt });
       
      console.log(`[Auth] OTP saved for ${user.email}`);
      await sendOtpEmail(user.email, code);

      return res.status(403).json({
        message: 'Account not verified. A verification code has been sent to your email.',
        verified: false,
        email: user.email,
      });
    }

    // Valid credentials, generate JWT tokens
    const payload = { userId: user.id, username: user.username, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await saveRefreshToken(user._id as any, refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        preparationTypes: user.preparationTypes,
        xp: user.xp,
        level: user.level,
        streakCount: user.streakCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
     
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    clearRefreshTokenCookie(res);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token cookie missing' });
    }

    const { accessToken, userId, username, email } = await rotateRefreshToken(refreshToken, res);

    // Fetch profile details to return with refresh
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        preparationTypes: user.preparationTypes,
        xp: user.xp,
        level: user.level,
        streakCount: user.streakCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({ message: error.message || 'Invalid refresh session' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      // Return 200 to prevent user enumeration, but log locally
      return res
        .status(200)
        .json({ message: 'If the email is registered, a password reset link has been sent.' });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    await user.save();

    // Frontend url reset link
    const clientUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}&email=${lowerEmail}`;

    await sendResetPasswordEmail(lowerEmail, resetLink);

    return res
      .status(200)
      .json({ message: 'If the email is registered, a password reset link has been sent.' });
  } catch (error) {
     
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ message: 'Failed to process forgot password request.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    const resetHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: lowerEmail,
      resetPasswordToken: resetHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    user.password = password; // Pre-save hook will hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
     
    console.error('Reset Password Error:', error);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
};

export const googleCallbackSuccess = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(
        `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=GoogleAuthFailed`,
      );
    }

    // Generate tokens
    const payload = { userId: user.id, username: user.username, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await saveRefreshToken(user._id as any, refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    // Redirect to frontend Google callback handler page with access token
    const clientUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    return res.redirect(`${clientUrl}/auth/google-callback?token=${accessToken}`);
  } catch (error) {
    return res.redirect(
      `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=GoogleRedirectFailed`,
    );
  }
};
