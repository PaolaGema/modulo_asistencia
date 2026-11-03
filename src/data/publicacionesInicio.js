/* Las publicaciones del Inicio (Noticias · Muro · Menciones). Viven aparte porque el perfil de un
   compañero también muestra las suyas. */
export const PUBLICACIONES = [
  { id: 'n1', tab: 'noticias', autor: 'Comunicación interna', cuando: 'Hoy · 9:10', titulo: 'Town Hall trimestral el lunes a las 10:00', texto: 'Revisamos los resultados del trimestre y presentamos el plan del próximo. Auditorio y transmisión para las sucursales.', likes: 12, comentarios: 2 },
  { id: 'n2', tab: 'noticias', autor: 'Ana Martínez Ruiz', cuando: 'Ayer', titulo: 'Lanzamos «Innovación Verde»', texto: 'Abrimos mesas de trabajo por área para recoger ideas. Las tres mejores tienen presupuesto propio este año.', likes: 24, comentarios: 3 },
  { id: 'm1', tab: 'muro', autor: 'Juan Pérez Gómez', cuando: 'Hace un momento', texto: '¡Hoy celebramos a Carlos Mendoza por cumplir su primer día con nosotros! Gracias por el compromiso y todo lo que aportas al equipo.', etiqueta: '#BienvenidaFarmaVida', bienvenida: true, likes: 24, comentarios: 3 },
  { id: 'm2', tab: 'muro', autor: 'Recursos Humanos', cuando: 'Hace 2 días', titulo: '¡Meta comercial del trimestre cumplida!', texto: 'Felicidades al equipo de Ventas por cerrar por encima de la meta. Gracias por estos tres meses.', likes: 41, comentarios: 8 },
  { id: 'c1', tab: 'menciones', autor: 'Nicolás Zapata', cuando: 'Hace 4 días', texto: 'Gracias @Carlos por ayudarnos con el reporte de ventas: salió en tiempo récord.', likes: 7, comentarios: 1 },
]
