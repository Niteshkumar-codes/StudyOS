import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { RefreshToken } from '../models/RefreshToken';
import { Types } from 'mongoose';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'studyos-access-secret-key-321-abc';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'studyos-refresh-secret-key-987-xyz';

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, jti: crypto.randomBytes(16).toString('hex') }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, jti: crypto.randomBytes(16).toString('hex') }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY as any,
  });
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/api/auth', // Sent only on auth paths (login, refresh, logout)
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  });
};

export const saveRefreshToken = async (userId: Types.ObjectId, token: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
  });
};

export const rotateRefreshToken = async (
  oldToken: string,
  res: Response,
): Promise<{ accessToken: string; userId: Types.ObjectId; username: string; email: string }> => {
  // 1. Verify old token signature
  let decoded: any;
  try {
    decoded = jwt.verify(oldToken, REFRESH_SECRET);
  } catch (error) {
    // If expired or invalid signature, delete from DB and throw
    await RefreshToken.deleteOne({ token: oldToken });
    throw new Error('Invalid refresh token signature');
  }

  const { userId, username, email } = decoded as TokenPayload;

  // 2. Find in DB
  const storedToken = await RefreshToken.findOne({ token: oldToken });
  if (!storedToken) {
    throw new Error('Refresh token not found in database');
  }

  // 3. Reuse detection: if used or revoked, revoke all tokens for this user
  if (storedToken.isUsed || storedToken.isRevoked) {
    await RefreshToken.deleteMany({ userId: new Types.ObjectId(userId) });
    clearRefreshTokenCookie(res);
    throw new Error('Refresh token reuse detected! Revoking all sessions.');
  }

  // 4. Mark old token as used
  storedToken.isUsed = true;
  await storedToken.save();

  // 5. Generate new pair
  const payload: TokenPayload = { userId, username, email };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // 6. Save new refresh token & set cookie
  await saveRefreshToken(new Types.ObjectId(userId), newRefreshToken);
  setRefreshTokenCookie(res, newRefreshToken);

  return {
    accessToken: newAccessToken,
    userId: new Types.ObjectId(userId),
    username,
    email,
  };
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.deleteOne({ token });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};
