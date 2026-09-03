const { pool } = require('../config/database');

const Chamado = {
    /**
     * @async
     * @param {{clienteId?: number}} filtro
     * @returns {Promise<Array<Object>>} Lista de chamados
     * @throws {Error} Se ocorrer erro de banco
     */
    async listar({ clienteId } = {}) {
        if (clienteId) {
            const [linhas] = await pool.execute(`
                SELECT c.id, c.titulo, c.descricao, c.status, c.cliente_id, c.tecnico_id, c.data_criacao,
                       uc.nome AS cliente_nome, ut.nome AS tecnico_nome
                FROM chamados c
                INNER JOIN usuarios uc ON uc.id = c.cliente_id
                LEFT JOIN usuarios ut ON ut.id = c.tecnico_id
                WHERE c.cliente_id = ?
                ORDER BY c.data_criacao DESC
            `, [clienteId]);
            return linhas;
        }

        const [linhas] = await pool.execute(`
            SELECT c.id, c.titulo, c.descricao, c.status, c.cliente_id, c.tecnico_id, c.data_criacao,
                   uc.nome AS cliente_nome, ut.nome AS tecnico_nome
            FROM chamados c
            INNER JOIN usuarios uc ON uc.id = c.cliente_id
            LEFT JOIN usuarios ut ON ut.id = c.tecnico_id
            ORDER BY c.data_criacao DESC
        `);
        return linhas;
    },

    /**
     * Busca um chamado pelo ID.
     *
     * @async
     * @param {number} id
     * @returns {Promise<Object|null>} Chamado encontrado ou null
     * @throws {Error} Se ocorrer erro de banco
     */
    async buscarPorId(id) {
        const [linhas] = await pool.execute(`
            SELECT c.id, c.titulo, c.descricao, c.status, c.cliente_id, c.tecnico_id, c.data_criacao,
                   uc.nome AS cliente_nome, ut.nome AS tecnico_nome
            FROM chamados c
            INNER JOIN usuarios uc ON uc.id = c.cliente_id
            LEFT JOIN usuarios ut ON ut.id = c.tecnico_id
            WHERE c.id = ?
        `, [id]);
        return linhas.length > 0 ? linhas[0] : null;
    },

    /**
     * Cria um novo chamado, sempre com status inicial "Aberto".
     *
     * @async
     * @param {{titulo: string, descricao: string, clienteId: number}} dados
     * @returns {Promise<number>} ID do chamado criado
     * @throws {Error} Se ocorrer erro de banco
     */
    async criar({ titulo, descricao, clienteId }) {
        const [resultado] = await pool.execute(
            "INSERT INTO chamados (titulo, descricao, status, cliente_id) VALUES (?, ?, 'Aberto', ?)",
            [titulo, descricao, clienteId]
        );
        return resultado.insertId;
    },

    /**
     * Atualiza o status de um chamado e, opcionalmente, associa um técnico.
     *
     * @async
     * @param {number} id
     * @param {{status: string, tecnicoId?: number|null}} dados
     * @returns {Promise<boolean>} true se alguma linha foi afetada
     * @throws {Error} Se ocorrer erro de banco
     */
    async atualizarStatus(id, { status, tecnicoId }) {
        const [resultado] = await pool.execute(
            'UPDATE chamados SET status = ?, tecnico_id = COALESCE(?, tecnico_id) WHERE id = ?',
            [status, tecnicoId ?? null, id]
        );
        return resultado.affectedRows > 0;
    },

    /**
     * Exclui (encerra) um chamado pelo ID.
     *
     * @async
     * @param {number} id
     * @returns {Promise<boolean>} true se alguma linha foi afetada
     * @throws {Error} Se ocorrer erro de banco
     */
    async excluir(id) {
        const [resultado] = await pool.execute('DELETE FROM chamados WHERE id = ?', [id]);
        return resultado.affectedRows > 0;
    }
};

module.exports = Chamado;
