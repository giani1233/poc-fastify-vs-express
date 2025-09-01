const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const eventosRoutes = require('./routes/eventos');
const database = require('../shared/database');

const app = express();
const PORT = process.env.EXPRESS_PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`⏱️ ${req.method} ${req.originalUrl} - ${duration} ms`);
  });

  next();
});

app.use((req, res, next) => {
  console.log(`[EXPRESS] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use((err, req, res, next) => {
  console.error('Error en Express:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

app.use('/api/eventos', eventosRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    server: 'Express',
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express corriendo en puerto ${PORT}`);
  console.log(`📖 Documentación: http://localhost:${PORT}/health`);
});

module.exports = app;