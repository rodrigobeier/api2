/**
 * @async
 * @returns {Promise<void>}
 */

const { pool, testarConexao } = require('./database');

async function inicializarBanco() {
    try {
        await testarConexao();

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                senha_hash VARCHAR(255) NOT NULL,
                tipo ENUM('cliente', 'tecnico') NOT NULL
            ) ENGINE=InnoDB;
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS chamados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(200) NOT NULL,
                descricao TEXT,
                status ENUM('Aberto', 'Em Atendimento', 'Concluído') DEFAULT 'Aberto',
                cliente_id INT NOT NULL,
                tecnico_id INT NULL,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_chamados_cliente
                    FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_chamados_tecnico
                    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
                    ON DELETE SET NULL
            ) ENGINE=InnoDB;
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS comentarios_chamado (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chamado_id INT NOT NULL,
                usuario_id INT NOT NULL,
                texto TEXT NOT NULL,
                data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_comentarios_chamado
                    FOREIGN KEY (chamado_id) REFERENCES chamados(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_comentarios_usuario
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        console.log('Schema do banco de dados verificado/criado com sucesso.');
        process.exit(0);
    } catch (erro) {
        console.error('Erro ao inicializar o schema do banco de dados:', erro.message);
        process.exit(1);
    }
}

inicializarBanco();
