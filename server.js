/**
 * Ponto de entrada da HelpDesk API (Aplicação 2 - REST desacoplada).
 * Responsável por: CORS restrito ao front-end, parsing JSON, montagem
 * das rotas, Swagger UI e tratamento global de exceções.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./swagger'); 
const authRoutes = require('./routes/authRoutes');
const chamadoRoutes = require('./routes/chamadoRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');

const app = express();

// CORS - aceita requisições unicamente da URL configurada do front-end
const frontendUrl = process.env.FRONTEND_URL;
app.use(cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Documentação interativa (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/auth', authRoutes);
app.use('/chamados', chamadoRoutes);
app.use('/chamados/:id/comentarios', comentarioRoutes);

app.get('/', (req, res) => {
    res.json({ nome: 'HelpDesk API', documentacao: '/api-docs' });
});

// 404 - rota não encontrada
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

/**
 * Middleware global de tratamento de exceções.
 * Impede o vazamento de stack traces em produção.
 *
 * @param {Error} erro
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
app.use((erro, req, res, next) => {
    console.error('Erro não tratado:', erro.stack || erro.message);
    const mensagem = process.env.NODE_ENV === 'production'
        ? 'Ocorreu um erro interno. Tente novamente mais tarde.'
        : erro.message;
    res.status(500).json({ erro: mensagem });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`HelpDesk API rodando em http://localhost:${PORT}`);
    console.log(`Documentação Swagger em http://localhost:${PORT}/api-docs`);
});

module.exports = app;
