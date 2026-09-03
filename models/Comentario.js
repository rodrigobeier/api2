const { pool } = require('../config/database');

const Comentario = {
    /**
     * @async
     * @param {number} chamadoId
     * @returns {Promise<Array<Object>>}
     * @throws {Error}
     */
    async listarPorChamado(chamadoId) {
        const [linhas] = await pool.execute(`
            SELECT co.id, co.texto, co.data_criacao, co.usuario_id, u.nome AS usuario_nome, u.tipo AS usuario_tipo
            FROM comentarios_chamado co
            INNER JOIN usuarios u ON u.id = co.usuario_id
            WHERE co.chamado_id = ?
            ORDER BY co.data_criacao ASC
        `, [chamadoId]);
        return linhas;
    },

    /**
     * @async
     * @param {{chamadoId: number, usuarioId: number, texto: string}} dados
     * @returns {Promise<number>} 
     * @throws {Error} 
     */
    async criar({ chamadoId, usuarioId, texto }) {
        const [resultado] = await pool.execute(
            'INSERT INTO comentarios_chamado (chamado_id, usuario_id, texto) VALUES (?, ?, ?)',
            [chamadoId, usuarioId, texto]
        );
        return resultado.insertId;
    }
};

module.exports = Comentario;
