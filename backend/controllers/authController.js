const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { signToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

const RESET_TTL_MINUTES = 30;
const VERIFY_TTL_HOURS = 24;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const newToken = () => crypto.randomBytes(32).toString('hex');

/** POST /api/auth/register */
async function register(req, res, next) {
  try {
    const { name, email, password, preferredLanguage, defaultLocation } = req.body;

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) throw ApiError.conflict('An account with this email already exists. Try signing in instead.');

    const user = new User({
      name,
      email,
      password,
      preferredLanguage: preferredLanguage || 'en',
      defaultLocation: defaultLocation || {},
    });

    const verificationToken = newToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + VERIFY_TTL_HOURS * 3600 * 1000);
    await user.save();

    const delivery = await emailService.sendVerificationEmail(user, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Account created.',
      token: signToken(user),
      user: user.toPublicJSON(),
      emailVerification: {
        sent: delivery.delivered,
        mode: delivery.mode,
        note: delivery.delivered
          ? 'Check your inbox to verify your email.'
          : 'Email is not configured, so the verification link was printed in the backend terminal.',
        ...(env.EXPOSE_DEV_TOKENS && !env.isProduction ? { devToken: verificationToken } : {}),
      },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    // Same message either way so the endpoint cannot be used to discover emails.
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Email or password is incorrect');
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, token: signToken(user), user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout */
async function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Signed out.' });
}

/** GET /api/auth/me */
async function me(req, res) {
  res.json({ success: true, user: req.user.toPublicJSON() });
}

/** POST /api/auth/forgot-password */
async function forgotPassword(req, res, next) {
  try {
    const email = String(req.body.email || '').toLowerCase();
    const user = await User.findOne({ email });

    // Always answer the same way, whether or not the account exists.
    const response = {
      success: true,
      message: 'If an account exists for that email, a reset link is on its way.',
    };

    if (!user) return res.json(response);

    await PasswordResetToken.deleteMany({ user: user._id, usedAt: null });

    const token = newToken();
    await PasswordResetToken.create({
      user: user._id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000),
    });

    const delivery = await emailService.sendPasswordResetEmail(user, token);

    if (env.EXPOSE_DEV_TOKENS && !env.isProduction) {
      response.dev = {
        note: delivery.delivered
          ? 'Email sent. This development token is also returned because EXPOSE_DEV_TOKENS=true.'
          : 'Email is not configured. Use this development token (also printed in the backend terminal).',
        token,
        resetUrl: `${env.FRONTEND_URL}/reset-password/${token}`,
        expiresInMinutes: RESET_TTL_MINUTES,
      };
    }

    return res.json(response);
  } catch (err) {
    return next(err);
  }
}

/** POST /api/auth/reset-password */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token) throw ApiError.badRequest('The reset link is missing its token');

    const record = await PasswordResetToken.findOne({ tokenHash: hashToken(token) });
    if (!record || record.usedAt) throw ApiError.badRequest('This reset link is not valid. Request a new one.');
    if (record.expiresAt < new Date()) throw ApiError.badRequest('This reset link has expired. Request a new one.');

    const user = await User.findById(record.user).select('+password');
    if (!user) throw ApiError.badRequest('This reset link is not valid. Request a new one.');

    user.password = password;
    await user.save();

    record.usedAt = new Date();
    await record.save();
    // Any other outstanding links for this user stop working too.
    await PasswordResetToken.deleteMany({ user: user._id, usedAt: null });

    res.json({ success: true, message: 'Password updated. You can sign in now.' });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/verify-email  body: { token } */
async function verifyEmail(req, res, next) {
  try {
    const token = req.body.token || req.params.token;
    if (!token) throw ApiError.badRequest('The verification link is missing its token');

    const user = await User.findOne({ emailVerificationTokenHash: hashToken(token) }).select(
      '+emailVerificationTokenHash +emailVerificationExpires'
    );
    if (!user) throw ApiError.badRequest('This verification link is not valid. Request a new one.');
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw ApiError.badRequest('This verification link has expired. Request a new one.');
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpires = null;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified.', user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/resend-verification */
async function resendVerification(req, res, next) {
  try {
    const email = String(req.body.email || req.user?.email || '').toLowerCase();
    const user = await User.findOne({ email });
    const response = { success: true, message: 'If that account needs verification, a new link is on its way.' };
    if (!user || user.isEmailVerified) return res.json(response);

    const token = newToken();
    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpires = new Date(Date.now() + VERIFY_TTL_HOURS * 3600 * 1000);
    await user.save({ validateBeforeSave: false });

    const delivery = await emailService.sendVerificationEmail(user, token);
    if (env.EXPOSE_DEV_TOKENS && !env.isProduction) {
      response.dev = { token, verifyUrl: `${env.FRONTEND_URL}/verify-email/${token}`, delivered: delivery.delivered };
    }
    return res.json(response);
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, logout, me, forgotPassword, resetPassword, verifyEmail, resendVerification };
