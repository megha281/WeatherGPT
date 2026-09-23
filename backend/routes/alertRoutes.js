const express = require('express');
const controller = require('../controllers/alertController');

const router = express.Router();

router.get('/', controller.list);
router.get('/:location', controller.byLocation);

module.exports = router;
