const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica se o token JWT é válido.
 * Adiciona `req.usuario` com os dados decodificados.
 */
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"
    if (!token) {
        return res.status(401).json({ erro: 'Token malformado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // { id, nome, tipo }
        return next();
    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado' });
    }
}

/**
 * Middleware que verifica se o usuário é técnico.
 * Deve ser usado após verificarToken.
 */
function requireTecnico(req, res, next) {
    if (req.usuario.tipo !== 'tecnico') {
        return res.status(403).json({ erro: 'Apenas técnicos podem realizar esta ação' });
    }
    next();
}

module.exports = { verificarToken, requireTecnico };