const express = require('express');
const router = express.Router();
const database = require('../../shared/database');
const { validateEvento, validateEventoUpdate } = require('../middleware/validation');

router.get('/', (req, res) => {
  try {
    const eventos = database.getAllEventos();
    
    let eventosFiltrados = eventos;
    
    if (req.query.categoria) {
      eventosFiltrados = eventosFiltrados.filter(e => 
        e.categoria == req.query.categoria
      );
    }
    
    if (req.query.fechaDesde) {
      eventosFiltrados = eventosFiltrados.filter(e => 
        new Date(e.fecha) >= new Date(req.query.fechaDesde)
      );
    }

    console.log(`[EXPRESS] Obteniendo ${eventosFiltrados.length} eventos`);

    res.json({
      success: true,
      data: eventosFiltrados,
      total: eventosFiltrados.length,
      server: 'Express'
    });
  } catch (error) {
    console.error('[EXPRESS] Error obteniendo eventos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener eventos',
      server: 'Express' 
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const evento = database.getEventoById(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado',
        server: 'Express'
      });
    }
    
    console.log(`[EXPRESS] Obteniendo evento: ${evento.nombre}`);
    
    res.json({
      success: true,
      data: evento,
      server: 'Express'
    });
  } catch (error) {
    console.error('[EXPRESS] Error obteniendo evento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener evento',
      server: 'Express' 
    });
  }
});

router.post('/', validateEvento, (req, res) => {
  try {
    const eventoData = req.body;
    const nuevoEvento = database.createEvento(eventoData);
    
    console.log(`[EXPRESS] Evento creado: ${nuevoEvento.nombre} (ID: ${nuevoEvento.idEvento})`);
    
    res.status(201).json({
      success: true,
      data: nuevoEvento,
      message: 'Evento creado exitosamente',
      server: 'Express'
    });
  } catch (error) {
    console.error('[EXPRESS] Error creando evento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear evento',
      server: 'Express' 
    });
  }
});

router.put('/:id', validateEventoUpdate, (req, res) => {
  try {
    const { id } = req.params;
    const eventoData = req.body;
    
    const eventoActualizado = database.updateEvento(id, eventoData);
    
    if (!eventoActualizado) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado',
        server: 'Express'
      });
    }
    
    console.log(`[EXPRESS] Evento actualizado: ${eventoActualizado.nombre}`);
    
    res.json({
      success: true,
      data: eventoActualizado,
      message: 'Evento actualizado exitosamente',
      server: 'Express'
    });
  } catch (error) {
    console.error('[EXPRESS] Error actualizando evento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar evento',
      server: 'Express' 
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const eventoEliminado = database.deleteEvento(id);
    
    if (!eventoEliminado) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado',
        server: 'Express'
      });
    }
    
    console.log(`[EXPRESS] Evento eliminado: ${eventoEliminado.nombre}`);
    
    res.json({
      success: true,
      data: eventoEliminado,
      message: 'Evento eliminado exitosamente',
      server: 'Express'
    });
  } catch (error) {
    console.error('[EXPRESS] Error eliminando evento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar evento',
      server: 'Express' 
    });
  }
});

module.exports = router;