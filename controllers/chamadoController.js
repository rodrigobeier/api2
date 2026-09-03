const Chamado = require('../models/Chamado');

const STATUS_VALIDOS = ['Aberto', 'Em Atendimento', 'Concluído'];

const chamadoController = {
    /**
     * @async
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     * @throws {Error} 
     */
    async listar(req, res) {
        try {
            const filtro = req.usuario.tipo === 'cliente' ? { clienteId: req.usuario.id } : {};
            const chamados = await Chamado.listar(filtro);
            return res.json(chamados);
        } catch (erro) {
            console.error('Erro ao listar chamados:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao listar chamados.'
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
            if (req.usuario.tipo !== 'cliente') {
                return res.status(403).json({ erro: 'Apenas clientes podem abrir chamados.' });
            }

            const titulo = String(req.body.titulo || '').trim();
            const descricao = String(req.body.descricao || '').trim();

            if (!titulo) {
                return res.status(400).json({ erro: 'O título do chamado é obrigatório.' });
            }

            const id = await Chamado.criar({ titulo, descricao, clienteId: req.usuario.id });
            const chamado = await Chamado.buscarPorId(id);

            return res.status(201).json(chamado);
        } catch (erro) {
            console.error('Erro ao criar chamado:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao criar chamado.'
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
    async atualizarStatus(req, res) {
        try {
            const id = Number(req.params.id);
            const status = String(req.body.status || '').trim();

            if (!STATUS_VALIDOS.includes(status)) {
                return res.status(400).json({ erro: `Status inválido. Use um dos: ${STATUS_VALIDOS.join(', ')}.` });
            }

            const chamadoExistente = await Chamado.buscarPorId(id);
            if (!chamadoExistente) {
                return res.status(404).json({ erro: 'Chamado não encontrado.' });
            }

            const assumirComoTecnico = req.body.assumir === true;
            await Chamado.atualizarStatus(id, {
                status,
                tecnicoId: assumirComoTecnico ? req.usuario.id : undefined
            });

            const chamadoAtualizado = await Chamado.buscarPorId(id);
            return res.json(chamadoAtualizado);
        } catch (erro) {
            console.error('Erro ao atualizar chamado:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao atualizar chamado.'
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
    async excluir(req, res) {
        try {
            const id = Number(req.params.id);
            const chamado = await Chamado.buscarPorId(id);
            if (!chamado) {
                return res.status(404).json({ erro: 'Chamado não encontrado.' });
            }

            await Chamado.excluir(id);
            return res.status(204).send();
        } catch (erro) {
            console.error('Erro ao excluir chamado:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao excluir chamado.'
                : erro.message;
            return res.status(500).json({ erro: mensagem });
        }
    }
};

module.exports = chamadoController;
