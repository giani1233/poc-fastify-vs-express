const fastify = require('fastify')({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

const PORT = process.env.FASTIFY_PORT || 3002;

// Registro de plugins
async function build() {
  try {
    // Registrar CORS
    await fastify.register(require('@fastify/cors'), {
      origin: true
    });

    // Registrar Swagger para documentación
    await fastify.register(require('@fastify/swagger'), {
      swagger: {
        info: {
          title: 'API de Eventos - Fastify',
          description: 'API para gestión de eventos usando Fastify',
          version: '1.0.0'
        },
        host: `localhost:${PORT}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
      }
    });

    await fastify.register(require('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      }
    });

    // Registrar plugin de validación personalizado
    await fastify.register(require('./plugins/validation'));

    // Registrar rutas
    await fastify.register(require('./routes/eventos'), { prefix: '/api/eventos' });

    // Hook global para logging
    fastify.addHook('onRequest', async (request, reply) => {
      request.log.info(`[FASTIFY] ${request.method} ${request.url}`);
    });

    // Hook para manejo de errores
    fastify.addHook('onError', async (request, reply, error) => {
      request.log.error(`[FASTIFY] Error: ${error.message}`);
    });

    // Ruta de salud
    fastify.get('/health', {
      schema: {
        description: 'Health check endpoint',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              server: { type: 'string' },
              timestamp: { type: 'string' }
            }
          }
        }
      }
    }, async (request, reply) => {
      return {
        status: 'OK',
        server: 'Fastify',
        timestamp: new Date().toISOString()
      };
    });

    return fastify;
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Función para iniciar el servidor
async function start() {
  try {
    const server = await build();
    await server.listen({ port: PORT });
    console.log(`🚀 Servidor Fastify corriendo en puerto ${PORT}`);
    console.log(`📖 Documentación: http://localhost:${PORT}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Iniciar servidor
start();

module.exports = { build };