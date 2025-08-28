const fp = require('fastify-plugin');

async function validationPlugin(fastify, options) {
  // Plugin personalizado para validaciones adicionales
  
  fastify.addHook('preValidation', async (request, reply) => {
    if (request.method === 'POST' && request.url.includes('/eventos')) {
      // Validaciones adicionales para creación de eventos
      if (request.body) {
        const { fecha, horaInicio, horaFin } = request.body;
        
        // Validar que la fecha no sea en el pasado
        if (fecha && new Date(fecha) <= new Date()) {
          return reply.status(400).send({
            success: false,
            error: 'La fecha del evento debe ser futura',
            server: 'Fastify'
          });
        }
        
        // Validar que horaFin sea posterior a horaInicio
        if (horaInicio && horaFin && horaInicio >= horaFin) {
          return reply.status(400).send({
            success: false,
            error: 'La hora de fin debe ser posterior a la hora de inicio',
            server: 'Fastify'
          });
        }
      }
    }
  });
  
  // Función helper para validaciones personalizadas
  fastify.decorate('validateBusinessRules', function(eventoData) {
    const errors = [];
    
    if (eventoData.precioEntrada < 0) {
      errors.push('El precio de entrada no puede ser negativo');
    }
    
    if (eventoData.cantCupos <= 0) {
      errors.push('La cantidad de cupos debe ser mayor a cero');
    }
    
    if (eventoData.edadMinima && (eventoData.edadMinima < 0 || eventoData.edadMinima > 99)) {
      errors.push('La edad mínima debe estar entre 0 y 99 años');
    }
    
    return errors;
  });
}

module.exports = fp(validationPlugin);