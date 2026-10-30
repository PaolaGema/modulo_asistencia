/* ── CUMPLEAÑOS Y EVENTOS DEL INICIO DEL TELÉFONO ──
   Una sola lista para la fila «Próximos eventos y cumpleaños» y para el calendario que abre «Ver más»:
   si vivieran en dos lugares, la fila podría anunciar un cumpleaños que el calendario no tiene.
   Las fechas son de la demo (octubre y noviembre de 2026). */

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const EVENTOS_INICIO = [
  { nombre: 'María', completo: 'María López Torres', fecha: '2026-10-29', tipo: 'Cumpleaños' },
  { nombre: 'Town Hall', completo: 'Town Hall trimestral', fecha: '2026-11-02', tipo: 'Evento', detalle: '10:00 · Auditorio y transmisión' },
  { nombre: 'Jorge', completo: 'Jorge Rivas', fecha: '2026-11-02', tipo: 'Cumpleaños' },
  { nombre: 'Ana', completo: 'Ana Martínez Ruiz', fecha: '2026-11-05', tipo: 'Cumpleaños' },
  { nombre: 'Carlos', completo: 'Carlos Quispe', fecha: '2026-11-09', tipo: 'Cumpleaños' },
  { nombre: 'ADN', completo: 'Aniversario FarmaVida', fecha: '2026-11-12', tipo: 'Evento', detalle: 'Todo el día · Todas las sucursales' },
  { nombre: 'Lucía', completo: 'Lucía Fernández', fecha: '2026-11-16', tipo: 'Cumpleaños' },
  { nombre: 'Diego', completo: 'Diego Salazar', fecha: '2026-11-20', tipo: 'Cumpleaños' },
  { nombre: 'Sofía', completo: 'Sofía Mendoza', fecha: '2026-11-27', tipo: 'Cumpleaños' },
]

export const diaCorto = iso => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MESES_CORTOS[m - 1]}` }
