const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const { verificarToken, requireTecnico } = require('../middlewares/auth');

/**
 * @swagger
 */

/**
 * @swagger
 */
router.get('/', verificarToken, chamadoController.listar);

/**
 * @swagger
 */
router.post('/', verificarToken, chamadoController.criar);

/**
 * @swagger
 */
router.put('/:id', verificarToken, requireTecnico, chamadoController.atualizarStatus);

/**
 * @swagger
 */
router.delete('/:id', verificarToken, requireTecnico, chamadoController.excluir);

module.exports = router;
