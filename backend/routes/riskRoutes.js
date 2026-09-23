const express = require('express');
const controller = require('../controllers/riskController');

const router = express.Router();

router.post('/analyze', controller.analyze);

module.exports = router;
