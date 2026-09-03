const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 */

/**
 * @swagger
 */
router.post('/registrar', authController.registrar);

/**
 * @swagger
 */
router.post('/login', authController.login);

module.exports = router;
