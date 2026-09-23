const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { requireDB } = require('../middleware/requireDB');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const strongPassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[a-z]/)
  .withMessage('Password needs a lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password needs an uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password needs a number');

router.use(requireDB);

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Enter your full name').isLength({ max: 80 }),
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    strongPassword,
    body('confirmPassword')
      .custom((value, { req }) => !value || value === req.body.password)
      .withMessage('Passwords do not match'),
    body('preferredLanguage').optional().isIn(['en', 'hi', 'kn', 'ta', 'te']).withMessage('Choose a supported language'),
  ],
  validate,
  controller.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Enter your password'),
  ],
  validate,
  controller.login
);

router.post('/logout', controller.logout);
router.get('/me', protect, controller.me);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail()],
  validate,
  controller.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('The reset link is missing its token'),
    strongPassword,
    body('confirmPassword')
      .custom((value, { req }) => !value || value === req.body.password)
      .withMessage('Passwords do not match'),
  ],
  validate,
  controller.resetPassword
);

router.post('/verify-email', controller.verifyEmail);
router.post('/verify-email/:token', controller.verifyEmail);
router.post('/resend-verification', authLimiter, controller.resendVerification);

module.exports = router;
