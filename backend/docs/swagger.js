const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'EduTrack API',
    version: '1.0.0',
    description: 'API documentation for the EduTrack platform',
  },
  servers: [
    {
      url: 'http://localhost:7071',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ['../src/functions/*.js'], // Scan all route files for annotations
};

module.exports = swaggerJSDoc(options);
