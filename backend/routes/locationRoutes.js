const express = require('express');
const controller = require('../controllers/locationController');

const router = express.Router();

router.get('/search', controller.search);
router.get('/reverse', controller.reverse);

module.exports = router;
