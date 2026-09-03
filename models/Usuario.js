const { pool } = require('../config/database');

const Usuario = {
    /**
     * @async
     * @param {{nome: string, email: string, senhaHash: string, tipo: 'cliente'|'tecnico'}} dados
     * @returns {Promise<number>} 
     * @throws {Error} 
     */
    async criar({ nome, email, senhaHash, tipo }) {
        const [resultado] = await pool.execute(
            'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, tipo]
        );
        return resultado.insertId;
    },

    /**
     * @async
     * @param {string} email
     * @returns {Promise<Object|null>} 
     * @throws {Error} 
     */
    async buscarPorEmail(email) {
        const [linhas] = await pool.execute(
            'SELECT id, nome, email, senha_hash, tipo FROM usuarios WHERE email = ?',
            [email]
        );
        return linhas.length > 0 ? linhas[0] : null;
    },

    /**
     * @async
     * @param {number} id
     * @returns {Promise<Object|null>} 
     * @throws {Error}
     */
    async buscarPorId(id) {
        const [linhas] = await pool.execute(
            'SELECT id, nome, email, tipo FROM usuarios WHERE id = ?',
            [id]
        );
        return linhas.length > 0 ? linhas[0] : null;
    }
};

module.exports = Usuario;
