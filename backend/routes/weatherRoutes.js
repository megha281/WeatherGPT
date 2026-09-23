const express = require('express');
const controller = require('../controllers/weatherController');

const router = express.Router();

router.get('/current', controller.current);
router.get('/hourly', controller.hourly);
router.get('/daily', controller.daily);
router.get('/forecast', controller.forecast);
router.get('/models', controller.models);

module.exports = router;
