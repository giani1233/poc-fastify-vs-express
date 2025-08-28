const database = require('../../shared/database');

// Schemas para Fastify
const eventoSchema = {
  type: 'object',
  required: ['nombre', 'descripcion', 'precioEntrada', 'cantCupos', 'fecha', 'horaInicio', 'horaFin', 'categoria', 'direccion', 'localidad'],
  properties: {
    nombre: { type: 'string', minLength: 3, maxLength: 100 },
    descripcion: { type: 'string', minLength: 10, maxLength: 500 },
    precioEntrada: { type: 'number', minimum: 0 },
    cantCupos: { type: 'integer', minimum: 1 },
    fecha: { type: 'string', format: 'date' },
    horaInicio: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
    horaFin: { type: 'string', pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' },
    edadMinima: { type: 'integer', minimum: 0, maximum: 99 },
    categoria: { type: 'integer', minimum: 1 },
    direccion: {
      type: 'object',
      required: ['calle', 'altura'],
      properties: {
        calle: { type: 'string' },
        altura: { type: 'integer', minimum: 1 },
        detalles: { type: 'string' }
      }
    },
    localidad: {
      type: 'object',
      required: ['nombre', 'codigoPostal'],
      properties: {
        nombre: { type: 'string' },
        codigoPostal: { type: 'string' }
      }
    }
  }
};

const eventoResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: eventoSchema,
    server: { type: 'string' }
  }
};

const eventosResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'array',
      items: eventoSchema
    },
    total: { type: 'integer' },
    server: { type: 'string' }
  }
};

async function eventosRoutes(fastify, options) {
  
  // GET /api/eventos - Obtener todos los eventos
  fastify.get('/', {
    schema: {
      description: 'Obtener todos los eventos',
      tags: ['Eventos'],
      querystring: {
        type: 'object',
        properties: {
          categoria: { type: 'integer' },
          fechaDesde: { type: 'string', format: 'date' }
        }
      },
      response: {
        200: eventosResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const eventos = database.getAllEventos();
      let eventosFiltrados = eventos;
      
      // Aplicar filtros
      if (request.query.categoria) {
        eventosFiltrados = eventosFiltrados.filter(e => 
          e.categoria == request.query.categoria
        );
      }
      
      if (request.query.fechaDesde) {
        eventosFiltrados = eventosFiltrados.filter(e => 
          new Date(e.fecha) >= new Date(request.query.fechaDesde)
        );
      }

      fastify.log.info(`[FASTIFY] Obteniendo ${eventosFiltrados.length} eventos`);
      
      return {
        success: true,
        data: eventosFiltrados,
        total: eventosFiltrados.length,
        server: 'Fastify'
      };
    } catch (error) {
      fastify.log.error('[FASTIFY] Error obteniendo eventos:', error);
      reply.status(500).send({
        success: false,
        error: 'Error al obtener eventos',
        server: 'Fastify'
      });
    }
  });

  // GET /api/eventos/:id - Obtener evento específico
  fastify.get('/:id', {
    schema: {
      description: 'Obtener evento por ID',
      tags: ['Eventos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: eventoResponseSchema,
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            server: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const evento = database.getEventoById(id);
      
      if (!evento) {
        return reply.status(404).send({
          success: false,
          error: 'Evento no encontrado',
          server: 'Fastify'
        });
      }
      
      fastify.log.info(`[FASTIFY] Obteniendo evento: ${evento.nombre}`);
      
      return {
        success: true,
        data: evento,
        server: 'Fastify'
      };
    } catch (error) {
      fastify.log.error('[FASTIFY] Error obteniendo evento:', error);
      reply.status(500).send({
        success: false,
        error: 'Error al obtener evento',
        server: 'Fastify'
      });
    }
  });

  // POST /api/eventos - Crear nuevo evento
  fastify.post('/', {
    schema: {
      description: 'Crear nuevo evento',
      tags: ['Eventos'],
      body: eventoSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: eventoSchema,
            message: { type: 'string' },
            server: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const eventoData = request.body;
      const nuevoEvento = database.createEvento(eventoData);
      
      fastify.log.info(`[FASTIFY] Evento creado: ${nuevoEvento.nombre} (ID: ${nuevoEvento.idEvento})`);
      
      reply.status(201).send({
        success: true,
        data: nuevoEvento,
        message: 'Evento creado exitosamente',
        server: 'Fastify'
      });
    } catch (error) {
      fastify.log.error('[FASTIFY] Error creando evento:', error);
      reply.status(500).send({
        success: false,
        error: 'Error al crear evento',
        server: 'Fastify'
      });
    }
  });

  // PUT /api/eventos/:id - Actualizar evento
  fastify.put('/:id', {
    schema: {
      description: 'Actualizar evento existente',
      tags: ['Eventos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: eventoSchema.properties
      },
      response: {
        200: eventoResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const eventoData = request.body;
      
      const eventoActualizado = database.updateEvento(id, eventoData);
      
      if (!eventoActualizado) {
        return reply.status(404).send({
          success: false,
          error: 'Evento no encontrado',
          server: 'Fastify'
        });
      }
      
      fastify.log.info(`[FASTIFY] Evento actualizado: ${eventoActualizado.nombre}`);
      
      return {
        success: true,
        data: eventoActualizado,
        message: 'Evento actualizado exitosamente',
        server: 'Fastify'
      };
    } catch (error) {
      fastify.log.error('[FASTIFY] Error actualizando evento:', error);
      reply.status(500).send({
        success: false,
        error: 'Error al actualizar evento',
        server: 'Fastify'
      });
    }
  });

  // DELETE /api/eventos/:id - Eliminar evento
  fastify.delete('/:id', {
    schema: {
      description: 'Eliminar evento',
      tags: ['Eventos'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: eventoResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const eventoEliminado = database.deleteEvento(id);
      
      if (!eventoEliminado) {
        return reply.status(404).send({
          success: false,
          error: 'Evento no encontrado',
          server: 'Fastify'
        });
      }
      
      fastify.log.info(`[FASTIFY] Evento eliminado: ${eventoEliminado.nombre}`);
      
      return {
        success: true,
        data: eventoEliminado,
        message: 'Evento eliminado exitosamente',
        server: 'Fastify'
      };
    } catch (error) {
      fastify.log.error('[FASTIFY] Error eliminando evento:', error);
      reply.status(500).send({
        success: false,
        error: 'Error al eliminar evento',
        server: 'Fastify'
      });
    }
  });
}

module.exports = eventosRoutes;