const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');
const eventosRoutes = require('./routes/eventos');

const PORT = process.env.FASTIFY_PORT || 3002;

fastify.register(cors);

fastify.addHook('onRequest', (req, reply, done) => {
  console.log(`[FASTIFY] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  done();
});

fastify.addHook('onRequest', (request, reply, done) => {
  request.startTime = Date.now();
  done();
});

fastify.addHook('onResponse', (request, reply, done) => {
  const duration = Date.now() - request.startTime;
  console.log(`⏱️ ${request.method} ${request.url} - ${duration} ms`);
  done();
});

fastify.setErrorHandler((error, request, reply) => {
  console.error('Error en Fastify:', error);
  reply.status(500).send({
    error: 'Error interno del servidor',
    message: error.message,
    server: 'Fastify'
  });
});

fastify.register(eventosRoutes, { prefix: '/api/eventos' });

fastify.get('/health', async () => ({
  status: 'OK',
  server: 'Fastify',
  timestamp: new Date().toISOString()
}));

fastify.listen({ port: PORT }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Servidor Fastify corriendo en ${PORT}`);
  console.log(`📖 Documentación: ${address}/health`);
});
