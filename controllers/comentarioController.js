const Chamado = require('../models/Chamado');
const Comentario = require('../models/Comentario');

/**
 * @param {Object} chamado
 * @param {{id: number, tipo: string}} usuario
 * @returns {boolean}
 */
function podeAcessarChamado(chamado, usuario) {
    if (usuario.tipo === 'tecnico') return true;
    return chamado.cliente_id === usuario.id;
}

const comentarioController = {
    /**
     * @async
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     * @throws {Error} 
     */
    async listar(req, res) {
        try {
            const chamadoId = Number(req.params.id);
            const chamado = await Chamado.buscarPorId(chamadoId);
            if (!chamado) {
                return res.status(404).json({ erro: 'Chamado não encontrado.' });
            }
            if (!podeAcessarChamado(chamado, req.usuario)) {
                return res.status(403).json({ erro: 'Você não tem acesso a este chamado.' });
            }

            const comentarios = await Comentario.listarPorChamado(chamadoId);
            return res.json(comentarios);
        } catch (erro) {
            console.error('Erro ao listar comentários:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao listar comentários.'
                : erro.message;
            return res.status(500).json({ erro: mensagem });
        }
    },

    /**
     * @async
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async criar(req, res) {
        try {
            const chamadoId = Number(req.params.id);
            const texto = String(req.body.texto || '').trim();

            if (!texto) {
                return res.status(400).json({ erro: 'O texto do comentário é obrigatório.' });
            }

            const chamado = await Chamado.buscarPorId(chamadoId);
            if (!chamado) {
                return res.status(404).json({ erro: 'Chamado não encontrado.' });
            }
            if (!podeAcessarChamado(chamado, req.usuario)) {
                return res.status(403).json({ erro: 'Você não tem acesso a este chamado.' });
            }

            const id = await Comentario.criar({ chamadoId, usuarioId: req.usuario.id, texto });
            const comentarios = await Comentario.listarPorChamado(chamadoId);
            const comentarioCriado = comentarios.find((c) => c.id === id);

            return res.status(201).json(comentarioCriado);
        } catch (erro) {
            console.error('Erro ao adicionar comentário:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao adicionar comentário.'
                : erro.message;
            return res.status(500).json({ erro: mensagem });
        }
    }
};

module.exports = comentarioController;
