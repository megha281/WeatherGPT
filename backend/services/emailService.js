const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (!env.emailConfigured) return null;
  if (transporter) return transporter;
  // eslint-disable-next-line global-require
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
  });
  return transporter;
}

function wrap(title, bodyHtml) {
  return `<div style="font-family:system-ui,Segoe UI,sans-serif;background:#0d1b26;padding:28px;color:#e7f0f6">
    <div style="max-width:520px;margin:auto;background:#122636;border-radius:16px;padding:28px">
      <p style="letter-spacing:.02em;font-size:18px;font-weight:700;margin:0 0 18px">WeatherGPT</p>
      <h1 style="font-size:20px;margin:0 0 14px;color:#fff">${title}</h1>
      ${bodyHtml}
      <p style="margin-top:26px;font-size:12px;color:#8aa5b6">
        WeatherGPT — Smart India Hackathon 2026 · SIH26068 · Team Binary Brains
      </p>
    </div></div>`;
}

const button = (url, label) =>
  `<p style="margin:22px 0"><a href="${url}" style="background:#33c4ff;color:#052030;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">${label}</a></p>
   <p style="font-size:12px;color:#8aa5b6">If the button does not work, paste this link into your browser:<br>${url}</p>`;

/**
 * Sends mail when SMTP is configured. Otherwise the link is printed in the
 * backend terminal so the flow is still fully testable in development.
 */
async function sendMail({ to, subject, html, devLabel, devUrl }) {
  const mailer = getTransporter();
  if (!mailer) {
    logger.warn('---------------------------------------------------------------');
    logger.warn(`EMAIL NOT CONFIGURED - ${devLabel} for ${to}`);
    logger.warn(devUrl);
    logger.warn('Add EMAIL_* values to backend/.env to send real email.');
    logger.warn('---------------------------------------------------------------');
    return { delivered: false, mode: 'console' };
  }
  try {
    await mailer.sendMail({ from: env.EMAIL_FROM, to, subject, html });
    return { delivered: true, mode: 'smtp' };
  } catch (err) {
    logger.error(`Sending email failed: ${err.message}`);
    logger.warn(`${devLabel}: ${devUrl}`);
    return { delivered: false, mode: 'error', error: err.message };
  }
}

async function sendPasswordResetEmail(user, token) {
  const url = `${env.FRONTEND_URL}/reset-password/${token}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your WeatherGPT password',
    html: wrap(
      'Reset your password',
      `<p style="color:#c5d8e4;line-height:1.6">Hi ${user.name}, we received a request to reset your WeatherGPT password.
       This link works once and expires in 30 minutes. If you did not ask for it, you can ignore this email.</p>
       ${button(url, 'Choose a new password')}`
    ),
    devLabel: 'PASSWORD RESET LINK',
    devUrl: url,
  });
}

async function sendVerificationEmail(user, token) {
  const url = `${env.FRONTEND_URL}/verify-email/${token}`;
  return sendMail({
    to: user.email,
    subject: 'Verify your WeatherGPT email',
    html: wrap(
      'Confirm your email address',
      `<p style="color:#c5d8e4;line-height:1.6">Hi ${user.name}, confirm this address to finish setting up your WeatherGPT account.
       The link expires in 24 hours.</p>
       ${button(url, 'Verify email')}`
    ),
    devLabel: 'EMAIL VERIFICATION LINK',
    devUrl: url,
  });
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail, sendMail };
