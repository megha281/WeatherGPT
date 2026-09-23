const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireDB } = require('../middleware/requireDB');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect, requireDB);

router.get('/profile', controller.getProfile);
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('preferredLanguage').optional().isIn(['en', 'hi', 'kn', 'ta', 'te']),
  ],
  validate,
  controller.updateProfile
);
router.put('/preferences', controller.updatePreferences);

router.get('/locations', controller.listLocations);
router.post(
  '/locations',
  [
    body('name').trim().notEmpty().withMessage('Give this location a name'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude is not valid'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude is not valid'),
  ],
  validate,
  controller.addLocation
);
router.delete('/locations/:id', controller.deleteLocation);

module.exports = router;
