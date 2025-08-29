// fastify-app/routes/eventos.js
const database = require('../../shared/database');
const { validateEvento, validateEventoUpdate } = require('../plugins/validation');

async function eventosRoutes(fastify, options) {

  fastify.get('/', async (req, reply) => {
    try {
      let eventos = database.getAllEventos();

      if (req.query.categoria) {
        eventos = eventos.filter(e => e.categoria == req.query.categoria);
      }
      if (req.query.fechaDesde) {
        eventos = eventos.filter(e => new Date(e.fecha) >= new Date(req.query.fechaDesde));
      }

      console.log(`[FASTIFY] Obteniendo ${eventos.length} eventos`);

      return { success: true, data: eventos, total: eventos.length, server: 'Fastify' };
    } catch (error) {
      console.error('[FASTIFY] Error obteniendo eventos:', error);
      reply.status(500).send({ success: false, error: 'Error al obtener eventos', server: 'Fastify' });
    }
  });

  fastify.get('/:id', async (req, reply) => {
    const evento = database.getEventoById(req.params.id);
    if (!evento) {
      return reply.status(404).send({ success: false, error: 'Evento no encontrado', server: 'Fastify' });
    }
    return { success: true, data: evento, server: 'Fastify' };
  });

  fastify.post('/', { preHandler: validateEvento }, async (req, reply) => {
    const nuevoEvento = database.createEvento(req.body);
    return reply.code(201).send({
      success: true,
      data: nuevoEvento,
      message: 'Evento creado exitosamente',
      server: 'Fastify'
    });
  });

  fastify.put('/:id', { preHandler: validateEventoUpdate }, async (req, reply) => {
    const eventoActualizado = database.updateEvento(req.params.id, req.body);
    if (!eventoActualizado) {
      return reply.status(404).send({ success: false, error: 'Evento no encontrado', server: 'Fastify' });
    }
    return { success: true, data: eventoActualizado, message: 'Evento actualizado', server: 'Fastify' };
  });

  fastify.delete('/:id', async (req, reply) => {
    const eventoEliminado = database.deleteEvento(req.params.id);
    if (!eventoEliminado) {
      return reply.status(404).send({ success: false, error: 'Evento no encontrado', server: 'Fastify' });
    }
    return { success: true, data: eventoEliminado, message: 'Evento eliminado', server: 'Fastify' };
  });

}

module.exports = eventosRoutes;
