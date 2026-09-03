const swaggerJsdoc = require('swagger-jsdoc');

const opcoes = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HelpDesk API',
            version: '1.0.0',
            description: 'API REST para gestão de chamados de suporte técnico (clientes e técnicos).'
        },
        servers: [
            { url: process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`, description: 'Servidor atual' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(opcoes);

module.exports = swaggerSpec;
