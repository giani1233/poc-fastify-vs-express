class Database {
  constructor() {
    this.eventos = [];
    this.usuarios = [];
    this.categorias = [];
    this.initData();
  }

  initData() {
    this.categorias = [
      { idCategoria: 1, nombre: 'Conciertos' },
      { idCategoria: 2, nombre: 'Deportes' },
      { idCategoria: 3, nombre: 'Teatro' }
    ];

    this.usuarios = [
      {
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@email.com',
        telefono: '123456789'
      }
    ];

    this.eventos = [
      {
        idEvento: 1,
        nombre: 'Concierto Rock Nacional',
        descripcion: 'Gran concierto de rock con bandas locales',
        precioEntrada: 2500,
        cantCupos: 500,
        fecha: '2024-09-15',
        horaInicio: '20:00',
        horaFin: '23:30',
        cuposDisponibles: 450,
        edadMinima: 16,
        categoria: 1,
        direccion: {
          calle: 'Av. Corrientes',
          altura: 1234,
          detalles: 'Teatro Gran Rex'
        },
        localidad: {
          nombre: 'CABA',
          codigoPostal: '1043'
        }
      }
    ];
  }

  getAllEventos() {
    return this.eventos;
  }

  getEventoById(id) {
    return this.eventos.find(evento => evento.idEvento === id);
  }

  createEvento(eventoData) {
    const nuevoEvento = {
      ...eventoData,
      cuposDisponibles: eventoData.cantCupos
    };
    this.eventos.push(nuevoEvento);
    return nuevoEvento;
  }

  updateEvento(id, eventoData) {
    const index = this.eventos.findIndex(evento => evento.idEvento === id);
    if (index !== -1) {
      this.eventos[index] = { ...this.eventos[index], ...eventoData };
      return this.eventos[index];
    }
    return null;
  }

  deleteEvento(id) {
    const index = this.eventos.findIndex(evento => evento.idEvento === id);
    if (index !== -1) {
      const deletedEvento = this.eventos.splice(index, 1)[0];
      return deletedEvento;
    }
    return null;
  }

  getCategorias() {
    return this.categorias;
  }
}

const database = new Database();

module.exports = database;