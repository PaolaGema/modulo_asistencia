/* LO QUE UN COMPAÑERO MUESTRA DE SÍ en su perfil público del teléfono: los regalos que le gustaría
   recibir, las experiencias que le gustaría vivir y lo que publicó. Es lo mismo que cada uno carga en
   su ficha (Preferencias, campos 'ra.f1' y 'ra.f4'); estos son los de ejemplo para la gente de la demo
   que no tiene ficha propia. Si la persona tiene ficha, manda la ficha. */
export const COLEGAS = {
  'Martín Solano': {
    regalos: ['Teclado mecánico', 'Taza de café grande', 'Plantas para el escritorio'],
    experiencias: ['Concierto en vivo', 'Clase de cocina italiana'],
    publicaciones: [
      { cuando: 'Hace 3 días', titulo: 'Nueva guía de componentes', texto: 'Dejamos en la carpeta del equipo la guía de botones y formularios. Cualquier duda, me escriben.', likes: 18, comentarios: 4 },
      { cuando: 'Hace 2 semanas', texto: '¡Gracias a todos por la despedida de Andrés! Fue un gusto trabajar con él.', likes: 32, comentarios: 6 },
    ],
  },
  'Diego Morales': {
    regalos: ['Libros de ciencia ficción', 'Mochila para laptop'],
    experiencias: ['Trekking en el Huayna Potosí'],
    publicaciones: [{ cuando: 'Hace 1 semana', texto: 'Si alguien quiere sumarse al fulbito de los jueves, todavía hay cupo. 7 p. m. en la cancha de siempre.', likes: 21, comentarios: 9 }],
  },
  'Facundo Medina': { regalos: ['Juegos de mesa', 'Auriculares'], experiencias: ['Viaje a Samaipata'], publicaciones: [] },
  'Alejandro Ríos': { regalos: ['Vino tinto', 'Herramientas de carpintería'], experiencias: ['Curso de fotografía'], publicaciones: [] },
  'Gabriel Pacheco': {
    regalos: ['Cuaderno de tapa dura', 'Café de especialidad'],
    experiencias: ['Taller de cerámica'],
    publicaciones: [{ cuando: 'Hace 5 días', titulo: 'Tablero de ventas actualizado', texto: 'Ya están los datos de octubre en el tablero. Ahora se puede filtrar por sucursal.', likes: 14, comentarios: 2 }],
  },
  'Ana Martínez Ruiz': { regalos: ['Libros de liderazgo', 'Flores', 'Chocolate amargo'], experiencias: ['Clase de yoga', 'Fin de semana en Coroico'], publicaciones: [] },
  'Andrea Núñez': { regalos: ['Ring light', 'Agenda 2027'], experiencias: ['Festival de música'], publicaciones: [] },
  'Bruno Salazar': { regalos: ['Polera de fútbol', 'Parlante bluetooth'], experiencias: ['Partido de la selección'], publicaciones: [] },
  'Carolina Vega': { regalos: ['Novelas', 'Té de hierbas'], experiencias: ['Viaje al Salar de Uyuni'], publicaciones: [] },
  'Valeria Rojas': { regalos: ['Pinceles y acuarelas', 'Velas aromáticas'], experiencias: ['Taller de ilustración'], publicaciones: [] },
  'Natalia Ferrer': { regalos: ['Perfume', 'Bolso'], experiencias: ['Spa de un día'], publicaciones: [] },
  'Paola Arce': { regalos: ['Plantas suculentas', 'Libros de cocina'], experiencias: ['Clase de baile'], publicaciones: [] },
  'Nicolás Zapata': { regalos: ['Billetera de cuero', 'Gorra'], experiencias: ['Pesca en el lago Titicaca'], publicaciones: [] },
  'Camilo Espinoza': { regalos: ['Ajedrez de madera'], experiencias: ['Cata de vinos en Tarija'], publicaciones: [] },
  'Valentina Cruz': { regalos: ['Libretas de bocetos', 'Plantas'], experiencias: ['Viaje a Rurrenabaque'], publicaciones: [] },
  'Ricardo Ballivián': { regalos: ['Libros de historia'], experiencias: ['Golf con el equipo'], publicaciones: [] },
  'Lorena Aguirre': { regalos: ['Organizador de escritorio', 'Flores'], experiencias: ['Clase de pintura'], publicaciones: [] },
}
