const express = require('express');
const router = express.Router({ mergeParams: true });
const comentarioController = require('../controllers/comentarioController');
const { verificarToken } = require('../middlewares/auth');

/**
 * @swagger
 */

/**
 * @swagger
 */
router.get('/', verificarToken, comentarioController.listar);

/**
 * @swagger
 */
router.post('/', verificarToken, comentarioController.criar);

module.exports = router;
