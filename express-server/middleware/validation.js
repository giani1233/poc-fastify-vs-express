const Joi = require('joi');

// Schema para validación de eventos
const eventoSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  descripcion: Joi.string().min(10).max(500).required(),
  precioEntrada: Joi.number().positive().required(),
  cantCupos: Joi.number().integer().positive().required(),
  fecha: Joi.date().iso().greater('now').required(),
  horaInicio: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  horaFin: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  edadMinima: Joi.number().integer().min(0).max(99).optional().default(0),
  categoria: Joi.number().integer().positive().required(),
  direccion: Joi.object({
    calle: Joi.string().required(),
    altura: Joi.number().integer().positive().required(),
    detalles: Joi.string().optional()
  }).required(),
  localidad: Joi.object({
    nombre: Joi.string().required(),
    codigoPostal: Joi.string().required()
  }).required()
});

const eventoUpdateSchema = eventoSchema.fork(
  ['nombre', 'descripcion', 'precioEntrada', 'cantCupos', 'fecha', 'horaInicio', 'horaFin', 'categoria', 'direccion', 'localidad'], 
  schema => schema.optional()
);

const validateEvento = (req, res, next) => {
  const { error } = eventoSchema.validate(req.body);
  
  if (error) {
    console.log(`[EXPRESS] Error de validación:`, error.details[0].message);
    return res.status(400).json({
      success: false,
      error: 'Datos de evento inválidos',
      details: error.details[0].message,
      server: 'Express'
    });
  }
  
  next();
};

const validateEventoUpdate = (req, res, next) => {
  const { error } = eventoUpdateSchema.validate(req.body);
  
  if (error) {
    console.log(`[EXPRESS] Error de validación en actualización:`, error.details[0].message);
    return res.status(400).json({
      success: false,
      error: 'Datos de evento inválidos',
      details: error.details[0].message,
      server: 'Express'
    });
  }
  
  next();
};

module.exports = {
  validateEvento,
  validateEventoUpdate
};