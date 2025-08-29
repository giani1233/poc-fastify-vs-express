// fastify-app/server.js
const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');
const eventosRoutes = require('./routes/eventos');

const PORT = process.env.FASTIFY_PORT || 3002;

// Plugins / middleware global
fastify.register(cors);

// Middleware logging
fastify.addHook('onRequest', (req, reply, done) => {
  console.log(`[FASTIFY] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  done();
});

// Manejo de errores global
fastify.setErrorHandler((error, request, reply) => {
  console.error('Error en Fastify:', error);
  reply.status(500).send({
    error: 'Error interno del servidor',
    message: error.message,
    server: 'Fastify'
  });
});

// Rutas
fastify.register(eventosRoutes, { prefix: '/api/eventos' });

// Ruta de salud
fastify.get('/health', async () => ({
  status: 'OK',
  server: 'Fastify',
  timestamp: new Date().toISOString()
}));

// Start server
console.time('server-start');
fastify.listen({ port: PORT }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Servidor Fastify corriendo en ${PORT}`);
  console.log(`📖 Documentación: ${address}/health`);
  console.timeEnd('server-start');
});
