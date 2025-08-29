const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventosRoutes = require('./routes/eventos');

const app = express();
const PORT = process.env.EXPRESS_PORT || 3001;

// Middleware global
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de logging personalizado
app.use((req, res, next) => {
  console.log(`[EXPRESS] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error en Express:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Rutas
app.use('/api/eventos', eventosRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    server: 'Express',
    timestamp: new Date().toISOString() 
  });
});

console.time('server-start')
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
  console.log(`📖 Documentación: http://localhost:${PORT}/health`);
  console.timeEnd('server-start')
});

module.exports = app;