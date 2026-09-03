const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const SALT_ROUNDS = 10;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authController = {
    /**
     * @async
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     * @throws {Error}
     */
    async registrar(req, res) {
        try {
            const nome = String(req.body.nome || '').trim();
            const email = String(req.body.email || '').trim().toLowerCase();
            const senha = String(req.body.senha || '');
            const tipo = req.body.tipo === 'tecnico' ? 'tecnico' : 'cliente';

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Preencha nome, email e senha.' });
            }
            if (!REGEX_EMAIL.test(email)) {
                return res.status(400).json({ erro: 'Informe um email válido.' });
            }
            if (senha.length < 6) {
                return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
            }

            const existente = await Usuario.buscarPorEmail(email);
            if (existente) {
                return res.status(409).json({ erro: 'Este email já está cadastrado.' });
            }

            const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
            const id = await Usuario.criar({ nome, email, senhaHash, tipo });

            return res.status(201).json({ id, nome, email, tipo });
        } catch (erro) {
            console.error('Erro ao registrar usuário:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao registrar usuário.'
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
    async login(req, res) {
        try {
            const email = String(req.body.email || '').trim().toLowerCase();
            const senha = String(req.body.senha || '');

            if (!email || !senha) {
                return res.status(400).json({ erro: 'Informe email e senha.' });
            }

            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ erro: 'Email ou senha inválidos.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Email ou senha inválidos.' });
            }

            const payload = { id: usuario.id, nome: usuario.nome, tipo: usuario.tipo };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '8h'
            });

            return res.json({
                token,
                usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
            });
        } catch (erro) {
            console.error('Erro ao efetuar login:', erro.message);
            const mensagem = process.env.NODE_ENV === 'production'
                ? 'Erro interno ao efetuar login.'
                : erro.message;
            return res.status(500).json({ erro: mensagem });
        }
    }
};

module.exports = authController;
