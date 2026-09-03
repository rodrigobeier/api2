require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const useSSL = String(process.env.DB_SSL).toLowerCase() === 'true';

/**
 * @returns {import('mysql2').SslOptions|undefined}
 */
function montarConfiguracaoSSL() {
    if (!useSSL) return undefined;

    const caPath = process.env.DB_SSL_CA_PATH;
    if (caPath) {
        const caCompleto = path.resolve(caPath);
        if (fs.existsSync(caCompleto)) {
            return { ca: fs.readFileSync(caCompleto), rejectUnauthorized: true };
        }
        console.warn(`DB_SSL_CA_PATH definido (${caPath}), mas o arquivo não foi encontrado. Validação estrita de certificado será desativada.`);
    }

    return { rejectUnauthorized: false };
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: montarConfiguracaoSSL()
});

/**
 * @async
 * @returns {Promise<void>}
 */
async function testarConexao() {
    try {
        const conexao = await pool.getConnection();
        console.log('Conexão com o banco de dados MySQL estabelecida com sucesso.');
        conexao.release();
    } catch (erro) {
        console.error('Falha ao conectar ao banco de dados:', erro.message);
    }
}

module.exports = { pool, testarConexao };
