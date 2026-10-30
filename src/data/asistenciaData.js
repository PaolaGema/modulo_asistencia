/* ── ASISTENCIA · DATOS, SEMILLAS Y CÁLCULO ────────────────────────────────
   La maqueta del módulo descrito en ASISTENCIA_ARQUITECTURA.md, con una diferencia de fondo: allí
   la marcación se hace contra una «sede» propia del módulo, y aquí contra el LUGAR que ya existe en
   Organización —una sucursal o un centro de trabajo—. Asistencia no da de alta sitios: les pone una
   geocerca encima a los que la empresa ya definió. Y el «quién» se agrupa por la unidad
   organizacional de cada persona, la misma que dibuja el organigrama.

   EL DISPOSITIVO CAPTURA, EL SERVIDOR DECIDE. Aquí no hay servidor, pero las funciones de cálculo
   están escritas como las del backend (`recomputeJornada`): puras, sin estado, y son lo único que
   decide el estado de un día. Las pantallas sólo las leen. */

/* ── EL RELOJ ── */
export const ahora = () => new Date()
export const iso = d => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const hoyISO = () => iso(new Date())
/* 'AAAA-MM-DD' partido a mano: `new Date(cadena)` lo lee como UTC y en Bolivia da el día anterior. */
export const aFecha = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const sumarDias = (s, n) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d) }
/* Lunes = 1 … domingo = 7, como `dias_semana` en el backend (ISO). */
export const diaISO = s => { const d = aFecha(s).getDay(); return d === 0 ? 7 : d }
export const minutosAhora = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 }

export const aMin = hhmm => { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + m }
export const hhmm = min => {
  if (min == null) return '—'
  const m = Math.round(min)
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
/* «7 h 45 min», «45 min», «0 min». Con signo cuando se pide, para los saldos. */
export function duracion(min, { signo = false, corto = false } = {}) {
  if (min == null) return '—'
  const s = min < 0 ? '−' : signo && min > 0 ? '+' : ''
  const a = Math.round(Math.abs(min))
  const h = Math.floor(a / 60); const m = a % 60
  if (corto) return `${s}${h}:${String(m).padStart(2, '0')}`
  if (!h) return `${s}${m} min`
  return `${s}${h} h${m ? ` ${m} min` : ''}`
}

export const DIAS_CORTOS = ['', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
export const DIAS_LARGOS = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const fechaLarga = s => { const d = aFecha(s); const t = `${DIAS_LARGOS[diaISO(s)]} ${d.getDate()} de ${MESES[d.getMonth()]}`; return t[0].toUpperCase() + t.slice(1) }
export const fechaCorta = s => { const d = aFecha(s); return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}` }
export const mesDe = s => s.slice(0, 7)
export const nombreMes = ym => { const [y, m] = ym.split('-').map(Number); return `${MESES[m - 1]} ${y}` }
export const diasDelMes = ym => { const [y, m] = ym.split('-').map(Number); const n = new Date(y, m, 0).getDate(); return Array.from({ length: n }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`) }
export const mesVecino = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

/* ── LOS ESTADOS DE UNA JORNADA ──
   Los cinco del backend (ausente, incompleta, tarde, extra, presente) y los que sólo existen
   mirando el día de HOY o cruzando con otros módulos: quien todavía no llegó no está «ausente», está
   «por llegar»; y una ausencia con vacaciones aprobadas no es una falta. Cada uno con ícono y
   palabra, nunca sólo color. */
export const ESTADOS = {
  presente:   { label: 'Presente',          tono: 'verde',   icono: 'check',  desc: 'Cumplió su jornada.' },
  tarde:      { label: 'Llegó tarde',       tono: 'ambar',   icono: 'reloj',  desc: 'Entró después de su hora de entrada más la tolerancia.' },
  extra:      { label: 'Horas extra',       tono: 'azul',    icono: 'subir',  desc: 'Trabajó horas extra autorizadas por RR.HH.' },
  incompleta: { label: 'Sin salida',        tono: 'violeta', icono: 'medio',  desc: 'Marcó la entrada y nunca la salida.' },
  ausente:    { label: 'Ausente',           tono: 'rojo',    icono: 'cruz',   desc: 'Tenía jornada y no marcó.' },
  justificada:{ label: 'Justificada',       tono: 'gris',    icono: 'escudo', desc: 'Ausencia con permiso, licencia o vacaciones.' },
  trabajando: { label: 'Trabajando',        tono: 'verde',   icono: 'vivo',   desc: 'Marcó la entrada y está en su jornada.' },
  pausa:      { label: 'En pausa',          tono: 'azul',    icono: 'cafe',   desc: 'Marcó el inicio de su pausa.' },
  porLlegar:  { label: 'Por llegar',        tono: 'gris',    icono: 'espera', desc: 'Todavía no es su hora de entrada.' },
  sinMarcar:  { label: 'Sin marcar',        tono: 'rojo',    icono: 'alerta', desc: 'Ya pasó su hora de entrada y la tolerancia, y no marcó.' },
  termino:    { label: 'Terminó',           tono: 'verde',   icono: 'check',  desc: 'Marcó entrada y salida hoy.' },
  libre:      { label: 'Día libre',         tono: 'gris',    icono: 'luna',   desc: 'No tiene jornada programada este día.' },
}

export const TIPOS_MARCA = {
  entrada: { label: 'Entrada', corto: 'Entró' },
  pausa_inicio: { label: 'Inicio de pausa', corto: 'Pausa' },
  pausa_fin: { label: 'Fin de pausa', corto: 'Volvió' },
  salida: { label: 'Salida', corto: 'Salió' },
}

export const MODALIDADES = {
  presencial: { label: 'Presencial', desc: 'Marca dentro de la geocerca de su lugar de trabajo.' },
  remoto: { label: 'Remoto', desc: 'Marca desde donde esté: se controla el rostro y el horario, no la ubicación.' },
  hibrido: { label: 'Híbrido', desc: 'Los días de oficina marca con geocerca; los demás, en remoto.' },
}

export const TIPOS_JUSTIFICACION = ['Permiso con goce', 'Licencia médica', 'Vacaciones', 'Comisión de servicio', 'Capacitación', 'Duelo', 'Otro']

/* ── LO QUE SE SIEMBRA ── */

export const HORARIOS_SEED = [
  { id: 'h-oficina', nombre: 'Oficina', modo: 'fijo', dias: [1, 2, 3, 4, 5], entrada: '08:30', salida: '18:00', pausa: 60, color: '#00B876' },
  { id: 'h-tienda', nombre: 'Atención al público', modo: 'fijo', dias: [1, 2, 3, 4, 5, 6], entrada: '09:00', salida: '17:00', pausa: 30, color: '#3B82F6' },
  { id: 'h-deposito', nombre: 'Depósito · turno mañana', modo: 'fijo', dias: [1, 2, 3, 4, 5, 6], entrada: '07:00', salida: '15:00', pausa: 30, color: '#F59E0B' },
  { id: 'h-flexible', nombre: 'Flexible por objetivos', modo: 'flexible', dias: [1, 2, 3, 4, 5], meta: 480, color: '#8B5CF6' },
  { id: 'h-medio', nombre: 'Medio tiempo', modo: 'fijo', dias: [1, 2, 3, 4, 5], entrada: '08:00', salida: '12:00', pausa: 0, color: '#EC4899' },
]

export const POLITICAS_SEED = [
  { id: 'p-estandar', nombre: 'Estándar', rostro: true, geocerca: true, umbral: 0.78, tolerancia: 10, radio: null, porDefecto: true,
    desc: 'Rostro y ubicación en cada marcación. La que se aplica si nadie eligió otra.' },
  { id: 'p-remoto', nombre: 'Trabajo remoto', rostro: true, geocerca: false, umbral: 0.8, tolerancia: 10, radio: null, porDefecto: false,
    desc: 'El rostro prueba quién marca y el horario cuándo. La ubicación se guarda, pero no bloquea.' },
  { id: 'p-confianza', nombre: 'Cargos de confianza', rostro: false, geocerca: true, umbral: 0.78, tolerancia: 20, radio: 300, porDefecto: false,
    desc: 'Sin rostro y con una geocerca más amplia, para quien entra y sale de reuniones todo el día.' },
]

/* La geocerca de cada lugar de Organización, por su id. Coordenadas aproximadas de cada sitio. */
export const GEOCERCAS_SEED = {
  central: { lat: -17.7650, lng: -63.1960, radio: 150 },
  mtr: { lat: -17.3390, lng: -63.2505, radio: 120 },
  lpz: { lat: -16.5115, lng: -68.1260, radio: 120 },
  cbb: { lat: -17.3850, lng: -66.1570, radio: 120 },
  sre: { lat: -19.0480, lng: -65.2550, radio: 100 },
  tja: { lat: -21.5300, lng: -64.7330, radio: 100 },
  oru: { lat: -17.9700, lng: -67.1120, radio: 100 },
  pot: { lat: -19.5880, lng: -65.7540, radio: 100 },
  eal: { lat: -16.5050, lng: -68.1630, radio: 150 },
  'dep-central': { lat: -17.7300, lng: -63.1500, radio: 250 },
  'dep-alto': { lat: -16.5200, lng: -68.1800, radio: 200 },
}

/* LOS CENTROS DE TRABAJO DE RESPALDO. Si la empresa todavía no cargó ninguno en Organización —la
   demo arranca sólo con sucursales— la maqueta usa los dos depósitos del ejemplo, para que se vea
   cómo marca alguien que trabaja en un almacén y no en una oficina. Apenas existe uno de verdad,
   mandan los de verdad. */
export const CENTROS_RESPALDO = [
  { id: 'dep-central', tipo: 'centro', nombre: 'Depósito Central', padreId: 'central', tipoCentro: 'Almacén', direccion: 'Parque Industrial, manzana 12' },
  { id: 'dep-alto', tipo: 'centro', nombre: 'Depósito El Alto', padreId: 'eal', tipoCentro: 'Almacén', direccion: 'Av. 6 de Marzo, zona Villa Bolívar' },
]

/* LA UNIDAD DE QUIEN TODAVÍA NO TIENE UNA. Treinta personas del directorio están «Sin asignar»; la
   maqueta les da una de ejemplo, igual que Documentación les da una sucursal, para que los filtros
   por unidad organizacional tengan qué mostrar. */
const UNIDADES_DEMO = ['Ventas', 'Operaciones', 'Ventas', 'Marketing', 'Finanzas', 'Tecnología', 'Ventas', 'Operaciones', 'Recursos Humanos']
export const unidadDe = p => (p.depto && p.depto !== 'Sin asignar' ? p.depto : UNIDADES_DEMO[p.id % UNIDADES_DEMO.length])

/* Cómo trabaja cada unidad, para sembrar las asignaciones. */
function asignacionDemo(p, centros) {
  const u = unidadDe(p)
  const base = { personaId: p.id, desde: '2026-01-01', modalidad: 'presencial', politicaId: null, diasOficina: [] }
  /* Algunos sin asignar a propósito: la puesta a punto tiene que tener qué avisar. */
  if (p.id % 17 === 0) return null
  if (u === 'Operaciones') {
    const centro = centros.find(c => c.padreId === p.sede) || centros[p.id % centros.length]
    return { ...base, horarioId: 'h-deposito', lugarId: centro?.id || p.sede }
  }
  if (u === 'Ventas') return { ...base, horarioId: 'h-tienda', lugarId: p.sede }
  if (u === 'Tecnología') return { ...base, horarioId: 'h-oficina', lugarId: p.sede, modalidad: 'hibrido', diasOficina: [2, 4] }
  if (u === 'Diseño') return { ...base, horarioId: 'h-oficina', lugarId: p.sede, modalidad: 'remoto', politicaId: 'p-remoto' }
  if (u === 'Dirección General') return { ...base, horarioId: 'h-flexible', lugarId: p.sede, politicaId: 'p-confianza' }
  if (p.id % 11 === 0 && p.id < 1000) return { ...base, horarioId: 'h-medio', lugarId: p.sede }
  return { ...base, horarioId: 'h-oficina', lugarId: p.sede }
}
export const asignacionesSeed = (personas, centros) =>
  Object.fromEntries(personas.map(p => [p.id, asignacionDemo(p, centros)]).filter(([, a]) => a))

/* Enrolamiento y consentimiento: casi todos enrolados, algunos pendientes. */
export const biometriaSeed = personas => Object.fromEntries(personas.map(p => {
  const pendiente = p.id % 9 === 4
  const sinConsent = p.id % 13 === 6
  return [p.id, {
    consentimiento: sinConsent ? null : { version: '2026-08-v1', aceptado: sumarDias(hoyISO(), -60 - (p.id % 40)) },
    enrolado: !pendiente && !sinConsent ? sumarDias(hoyISO(), -58 - (p.id % 40)) : null,
    reenrolar: null,
  }]
}))

/* Vacaciones aprobadas (vienen del módulo de Vacaciones): justifican el día. */
export const vacacionesDemo = () => {
  const h = hoyISO()
  return [
    { personaId: 5, desde: sumarDias(h, -3), hasta: sumarDias(h, 4), tipo: 'Vacaciones' },
    { personaId: 12, desde: sumarDias(h, -20), hasta: sumarDias(h, -14), tipo: 'Vacaciones' },
    { personaId: 23, desde: sumarDias(h, 0), hasta: sumarDias(h, 1), tipo: 'Licencia médica' },
  ]
}

/* ── LAS SOLICITUDES ───────────────────────────────────────────────────────
   Lo que la gente le pide a RR.HH. sobre su tiempo. Cada tipo dice qué pasa al aprobarse:
   vacaciones, permisos y licencias vuelven el día «ausencia justificada» (nunca es falta); una corrección
   carga la marcación que faltaba; el trabajo remoto quita la geocerca ese día. Las horas extra tienen
   su propio registro (más abajo) porque además se asignan. */
export const TIPOS_SOLICITUD = {
  vacaciones: { label: 'Vacaciones', plural: 'Vacaciones', justifica: true, desc: 'Días de vacaciones. Se descuentan del saldo de cada persona.' },
  permiso: { label: 'Permiso', plural: 'Permisos y licencias', justifica: true, desc: 'Permisos por horas o por días, y licencias con respaldo.' },
  correccion: { label: 'Corrección de marcación', plural: 'Correcciones de marcación', desc: 'Olvidó marcar o marcó mal. Al aprobarse, se carga la marcación con su motivo.' },
  remoto: { label: 'Trabajo remoto', plural: 'Trabajo remoto', desc: 'Pide trabajar desde casa. Al aprobarse, ese día no se exige estar en la geocerca.' },
  cambio: { label: 'Cambio de turno', plural: 'Cambios de turno', desc: 'Cambia el turno de un día, a veces con un compañero.' },
}
export const SUBTIPOS_PERMISO = [
  { key: 'medico', label: 'Cita médica', licencia: false },
  { key: 'tramite', label: 'Trámite personal', licencia: false },
  { key: 'familiar', label: 'Asunto familiar', licencia: false },
  { key: 'estudio', label: 'Estudio o examen', licencia: false },
  { key: 'lic-medica', label: 'Licencia médica', licencia: true },
  { key: 'maternidad', label: 'Licencia por maternidad', licencia: true },
  { key: 'paternidad', label: 'Licencia por paternidad', licencia: true },
  { key: 'duelo', label: 'Licencia por duelo', licencia: true },
  { key: 'matrimonio', label: 'Licencia por matrimonio', licencia: true },
]
export const ESTADOS_SOLICITUD = {
  pendiente: { label: 'Por responder', tono: 'ambar' },
  aprobada: { label: 'Aprobada', tono: 'verde' },
  rechazada: { label: 'Rechazada', tono: 'gris' },
  /* La persona la retiró antes de que RR.HH. respondiera: sus días vuelven al saldo. */
  cancelada: { label: 'Cancelada', tono: 'gris' },
}

/* DÍAS DE VACACIÓN POR AÑO SEGÚN LA ANTIGÜEDAD. La escala de la legislación boliviana: 15 días hábiles
   de 1 a 5 años, 20 de 5 a 10 y 30 desde los 10. Antes del primer año no hay derecho todavía. Si la
   empresa da más, se configurará por empresa. */
export function diasVacacionPorAnio(ingresoISO, hoy = hoyISO()) {
  if (!ingresoISO) return 15
  const anios = (aFecha(hoy) - aFecha(ingresoISO)) / (365.25 * 864e5)
  return anios < 1 ? 0 : anios < 5 ? 15 : anios < 10 ? 20 : 30
}
/* LOS FERIADOS NACIONALES DE BOLIVIA. No cuentan como días de vacación: quien pide del lunes 2 al
   viernes 6 de noviembre gasta cuatro días, no cinco. Los móviles (Carnaval, Viernes Santo, Corpus)
   van con su fecha de cada año. Los departamentales se configurarán por sucursal. */
export const FERIADOS = {
  '2026-01-01': 'Año Nuevo', '2026-01-22': 'Día del Estado Plurinacional', '2026-02-16': 'Carnaval', '2026-02-17': 'Carnaval',
  '2026-04-03': 'Viernes Santo', '2026-05-01': 'Día del Trabajo', '2026-06-04': 'Corpus Christi', '2026-06-21': 'Año Nuevo Andino',
  '2026-08-06': 'Día de la Independencia', '2026-11-02': 'Todos Santos', '2026-12-25': 'Navidad',
  '2027-01-01': 'Año Nuevo', '2027-01-22': 'Día del Estado Plurinacional', '2027-02-08': 'Carnaval', '2027-02-09': 'Carnaval',
  '2027-03-26': 'Viernes Santo', '2027-05-01': 'Día del Trabajo', '2027-05-27': 'Corpus Christi', '2027-06-21': 'Año Nuevo Andino',
  '2027-08-06': 'Día de la Independencia', '2027-11-02': 'Todos Santos', '2027-12-25': 'Navidad',
}
/* UN DÍA HÁBIL ES UN DÍA QUE LA PERSONA TRABAJA, según su horario: quien atiende de lunes a sábado
   gasta un día de vacación al faltar el sábado; quien trabaja de lunes a viernes, no. Sin horario,
   de lunes a viernes. Los feriados nunca cuentan. */
export const esHabil = (s, horario) => (horario?.dias?.length ? horario.dias.includes(diaISO(s)) : diaISO(s) <= 5) && !FERIADOS[s]
/* Días hábiles de la persona entre dos fechas, las dos incluidas. */
export function diasHabiles(desde, hasta, horario) {
  let n = 0
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) if (esHabil(d, horario)) n++
  return n
}
/* El primer día hábil después de una fecha: el día en que se vuelve de las vacaciones. */
export function habilSiguiente(s, horario) {
  let d = sumarDias(s, 1)
  while (!esHabil(d, horario)) d = sumarDias(d, 1)
  return d
}
/* SALDO DE VACACIONES: el derecho del año según su antigüedad, menos lo aprobado en los últimos 12
   meses. `pedidos` son los días que esperan respuesta: todavía no se descuentan, pero tampoco se
   pueden volver a pedir. */
export function saldoVacaciones(p, solicitudes, hoy = hoyISO()) {
  const derecho = diasVacacionPorAnio(p?.ingreso, hoy)
  const desde = sumarDias(hoy, -365)
  const suyas = solicitudes.filter(s => s.tipo === 'vacaciones' && String(s.personaId) === String(p?.id) && s.hasta >= desde)
  const dias = estado => suyas.filter(s => s.estado === estado).reduce((t, s) => t + diasHabiles(s.desde, s.hasta, p?.horario), 0)
  const usados = dias('aprobada')
  const pedidos = dias('pendiente')
  const saldo = Math.max(0, derecho - usados)
  return { derecho, usados, pedidos, saldo, disponible: Math.max(0, saldo - pedidos) }
}

export function solicitudesSeed(personas) {
  const h = hoyISO()
  const lista = []
  let n = 0
  const pon = (p, tipo, datos, estado, hace = 3) => lista.push({
    id: `so-${tipo}-${p.id}-${n++}`, tipo, personaId: p.id, estado, cuando: sumarDias(h, -hace), canal: 'app', ...datos,
    ...(estado !== 'pendiente' ? { respondio: 'Juan Pérez Gómez' } : {}),
  })
  const por = id => personas.find(p => p.id === id)
  const algunos = (paso, desde = 0) => personas.filter(p => p.asig && p.id % paso === desde)
  /* Las vacaciones y licencias que ya estaban aprobadas en la demo. */
  if (por(5)) pon(por(5), 'vacaciones', { desde: sumarDias(h, -3), hasta: sumarDias(h, 4), motivo: 'Viaje familiar' }, 'aprobada', 20)
  if (por(12)) pon(por(12), 'vacaciones', { desde: sumarDias(h, -20), hasta: sumarDias(h, -14), motivo: 'Descanso' }, 'aprobada', 35)
  if (por(23)) pon(por(23), 'permiso', { subtipo: 'lic-medica', desde: h, hasta: sumarDias(h, 1), motivo: 'Reposo indicado por el médico', respaldo: 'certificado-medico.pdf' }, 'aprobada', 1)
  /* Lo que espera respuesta. */
  algunos(9, 2).slice(0, 4).forEach((p, i) => pon(p, 'vacaciones', { desde: sumarDias(h, 6 + i * 3), hasta: sumarDias(h, 10 + i * 3), motivo: ['Viaje', 'Matrimonio de un familiar', 'Descanso', 'Mudanza'][i] }, 'pendiente', 1 + i))
  algunos(11, 3).slice(0, 3).forEach((p, i) => pon(p, 'permiso', { subtipo: ['medico', 'tramite', 'familiar'][i], desde: sumarDias(h, 1 + i), hasta: sumarDias(h, 1 + i), horaDesde: '15:00', horaHasta: '17:00', motivo: ['Control médico', 'Renovar el carnet', 'Reunión en el colegio de mi hijo'][i] }, 'pendiente', 1))
  algunos(13, 4).slice(0, 2).forEach((p, i) => pon(p, 'correccion', { fecha: sumarDias(h, -1 - i), marca: 'salida', hora: p.horario?.salida || '18:00', motivo: ['Se me acabó la batería', 'La app no abría al salir'][i] }, 'pendiente', 1))
  algunos(7, 5).slice(0, 2).forEach((p, i) => pon(p, 'remoto', { desde: sumarDias(h, 2 + i), hasta: sumarDias(h, 2 + i), motivo: ['Espero un técnico en casa', 'Cuido a mi hijo enfermo'][i] }, 'pendiente', 1))
  algunos(17, 6).slice(0, 1).forEach(p => pon(p, 'cambio', { fecha: sumarDias(h, 4), turnoDe: p.horario?.nombre || 'Mañana', turnoA: 'Turno tarde', con: 'Un compañero de su sucursal', motivo: 'Tengo examen en la mañana' }, 'pendiente', 2))
  /* Un poco de historia ya respondida. */
  algunos(10, 1).slice(0, 3).forEach((p, i) => pon(p, 'permiso', { subtipo: 'medico', desde: sumarDias(h, -8 - i), hasta: sumarDias(h, -8 - i), horaDesde: '09:00', horaHasta: '11:00', motivo: 'Análisis de laboratorio' }, i === 2 ? 'rechazada' : 'aprobada', 12))
  return lista
}

/* EL HISTORIAL DE LA PERSONA DE LA SESIÓN, para que «Mis solicitudes» se vea como después de meses
   de uso: unas pocas esperando respuesta y el resto resueltas, de todos los tipos. Las vacaciones
   aprobadas suman 5 días en el último año, así el saldo sigue teniendo días para pedir. */
export function historialDemo(p, h = hoyISO()) {
  const hab = s => (esHabil(s, p.horario) ? s : habilSiguiente(s, p.horario))
  /* Desde el primer día hábil, n días hábiles. */
  const rango = (k, n) => {
    const desde = hab(sumarDias(h, k))
    let hasta = desde
    for (let i = 1; i < n; i++) hasta = habilSiguiente(hasta, p.horario)
    return { desde, hasta }
  }
  const dia = k => hab(sumarDias(h, k))
  const salida = p.horario?.salida || '18:00'
  const entrada = p.horario?.entrada || '08:30'
  const lista = []
  const pon = (tipo, datos, estado, hace, nota) => {
    const cuando = sumarDias(h, -hace)
    lista.push({
      id: `so-demo-${p.id}-${lista.length}`, tipo, personaId: p.id, estado, cuando, canal: 'app', ...datos,
      ...(estado === 'aprobada' || estado === 'rechazada' ? { respondio: 'Juan Pérez Gómez', respondida: sumarDias(cuando, 1), nota: nota || '' } : {}),
      ...(estado === 'cancelada' ? { cancelada: sumarDias(cuando, 2) } : {}),
    })
  }
  /* Esperan respuesta. */
  pon('vacaciones', { ...rango(44, 5), motivo: 'Fin de año con la familia' }, 'pendiente', 0)
  pon('permiso', { subtipo: 'medico', ...(x => ({ desde: x, hasta: x }))(dia(7)), horaDesde: '15:00', horaHasta: '17:00', motivo: 'Control con el traumatólogo' }, 'pendiente', 1)
  pon('remoto', (x => ({ desde: x, hasta: x }))(dia(5)), 'pendiente', 1)
  pon('correccion', { fecha: hab(sumarDias(h, -3)), marca: 'salida', hora: salida, motivo: 'Se me acabó la batería del celular' }, 'pendiente', 0)
  /* Ya resueltas, de la más nueva a la más vieja. */
  pon('permiso', { subtipo: 'tramite', ...(x => ({ desde: x, hasta: x }))(dia(-6)), horaDesde: '09:00', horaHasta: '11:00', motivo: 'Renovar el carnet' }, 'aprobada', 9)
  pon('correccion', { fecha: dia(-11), marca: 'entrada', hora: entrada, motivo: 'La app no abría al llegar' }, 'aprobada', 10)
  pon('remoto', (x => ({ desde: x, hasta: x, motivo: 'Espero un técnico en casa' }))(dia(-15)), 'rechazada', 17, 'Ese día hay reunión presencial del área.')
  pon('cambio', { fecha: dia(-20), turnoDe: p.horario?.nombre || 'Oficina', turnoA: 'Turno tarde', con: 'Un compañero de su área', motivo: 'Tengo examen en la mañana' }, 'aprobada', 24)
  pon('vacaciones', { ...rango(-32, 3), motivo: 'Descanso' }, 'aprobada', 46)
  pon('permiso', { subtipo: 'familiar', ...(x => ({ desde: x, hasta: x }))(dia(-38)), motivo: 'Graduación de mi hermana' }, 'aprobada', 41)
  pon('correccion', { fecha: dia(-44), marca: 'salida', hora: salida, motivo: 'Marqué y no se guardó' }, 'rechazada', 43, 'La salida ya estaba registrada a las ' + salida + '.')
  pon('remoto', (x => ({ desde: x, hasta: x, motivo: 'Cuido a mi hijo enfermo' }))(dia(-52)), 'aprobada', 55)
  pon('permiso', { subtipo: 'estudio', ...(x => ({ desde: x, hasta: x }))(dia(-63)), horaDesde: '08:00', horaHasta: '12:00', motivo: 'Examen de la maestría' }, 'aprobada', 70)
  pon('remoto', (x => ({ desde: x, hasta: x, motivo: 'Corte de calles por el desfile' }))(dia(-78)), 'cancelada', 82)
  pon('vacaciones', { ...rango(-96, 2), motivo: 'Viaje corto' }, 'aprobada', 120)
  pon('permiso', { subtipo: 'lic-medica', ...rango(-112, 2), motivo: 'Reposo por gripe', respaldo: 'certificado-medico.pdf' }, 'aprobada', 112)
  pon('vacaciones', { ...rango(-150, 3), motivo: 'Viaje' }, 'cancelada', 165)
  pon('correccion', { fecha: dia(-170), marca: 'entrada', hora: entrada, motivo: 'Olvidé marcar al llegar' }, 'aprobada', 169)
  return lista
}

/* ── LAS HORAS EXTRA AUTORIZADAS ──
   Una hora extra existe solo si alguien la autorizó ANTES (o RR.HH. la autoriza después, a mano).
   Hay dos caminos y los dos terminan en una ventana —fecha, desde, hasta— que es lo único que se
   cruza con las marcaciones:
     · SOLICITUD: la persona la pide desde la app → RR.HH. la aprueba o la rechaza.
     · ASIGNACIÓN: RR.HH. la asigna (lo conversó antes con la persona) → la persona la acepta.
   Si se pagan o se compensan con tiempo libre lo decide cada empresa: el módulo solo dice cuántas
   se autorizaron y cuántas se trabajaron. */
export const ESTADOS_EXTRA = {
  pendiente: { label: 'Por responder', tono: 'ambar' },
  asignada: { label: 'Esperando que acepte', tono: 'azul' },
  aprobada: { label: 'Aprobada', tono: 'verde' },
  aceptada: { label: 'Aceptada', tono: 'verde' },
  rechazada: { label: 'Rechazada', tono: 'gris' },
}
export const ORIGENES_EXTRA = {
  solicitud: 'La pidió desde la app',
  asignacion: 'Asignada por RR.HH.',
  posterior: 'Autorizada después del día',
}
export const esAutorizada = x => x.estado === 'aprobada' || x.estado === 'aceptada'

export function horasExtraSeed(personas) {
  const h = hoyISO()
  const lista = []
  const pon = (p, fecha, desde, hasta, origen, estado, motivo) => lista.push({
    id: `hx-${p.id}-${fecha}`, personaId: p.id, fecha, desde, hasta, origen, estado, motivo,
    por: origen === 'asignacion' ? 'Juan Pérez Gómez' : p.name, cuando: sumarDias(fecha, -2),
  })
  const motivos = ['Cierre de inventario', 'Pedido grande de un cliente', 'Cobertura por vacaciones', 'Entrega del mes', 'Apoyo en la apertura']
  personas.filter(p => p.horario?.modo === 'fijo' && p.id % 6 === 1).forEach((p, n) => {
    const sal = p.horario.salida
    const fin = hhmm(aMin(sal) + (p.id % 2 ? 120 : 60))
    ;[2, 6, 11, 17, 23].forEach((k, i) => {
      const fecha = sumarDias(h, -k)
      if (!esDiaLaboral(p.horario, fecha)) return
      pon(p, fecha, sal, fin, i % 2 ? 'solicitud' : 'asignacion', i % 2 ? 'aprobada' : 'aceptada', motivos[(n + i) % motivos.length])
    })
    if (n % 3 === 0 && esDiaLaboral(p.horario, h)) pon(p, h, sal, fin, 'asignacion', 'aceptada', motivos[n % motivos.length])
    if (n % 2 === 0) pon(p, sumarDias(h, 1), sal, fin, 'solicitud', 'pendiente', motivos[(n + 2) % motivos.length])
    if (n % 2 === 1) pon(p, sumarDias(h, 2), sal, fin, 'asignacion', 'asignada', motivos[(n + 3) % motivos.length])
  })
  return lista
}

/* ── GEOMETRÍA ── */
export function distanciaM(a, b) {
  const R = 6371000; const r = x => (x * Math.PI) / 180
  const dLat = r(b.lat - a.lat); const dLng = r(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
const desplazar = (p, metros, angulo) => ({
  lat: p.lat + (metros * Math.cos(angulo)) / 111320,
  lng: p.lng + (metros * Math.sin(angulo)) / (111320 * Math.cos((p.lat * Math.PI) / 180)),
})

/* ── EL AZAR CON MEMORIA ──
   Cada día de cada persona sale de una semilla propia: recargar la página no cambia quién llegó
   tarde el martes. */
function rng(semilla) {
  let h = 1779033703 ^ semilla.length
  for (let i = 0; i < semilla.length; i++) { h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) }
  let a = h >>> 0
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const entre = (r, a, b) => a + r() * (b - a)

/* ── HORARIOS ── */
export const minutosProgramados = h => (h.modo === 'flexible' ? h.meta || 0 : Math.max(0, aMin(h.salida) - aMin(h.entrada) - (h.pausa || 0)))

/* ── QUÉ TOCA MARCAR AHORA ──
   El orden del día es entrada → pausa → vuelta de la pausa → salida. Después de entrar, el botón
   grande no puede ser siempre «Marcar salida»: quien quería ir a almorzar lo toca y se le cierra el
   día. Si el horario tiene pausa y todavía no la tomó, lo principal es «Iniciar pausa» mientras le
   quede más de una hora de jornada; la salida queda a mano, como segunda opción.

   CUÁNTO FALTA SE MIDE POR LO TRABAJADO, no solo por el reloj: quien entró tarde no termina a la hora
   de salida del horario. `falta` es lo que le queda para completar la jornada (o para su hora de
   salida, lo que sea mayor) y `temprano` avisa que marcar salida ahora dejaría más de 30 min sin
   cumplir: el marcador lo pregunta antes de cerrar el día. `deshacer` es la salida recién marcada desde la app (10 min
   para arrepentirse; la marca no se borra, se anula y queda a la vista de RR.HH.). */
export function accionDelMomento(j, horario, minAhora) {
  if (!horario) return { principal: null, secundaria: null, temprano: false, falta: 0, deshacer: null }
  const validas = (j.marcas || []).filter(m => !m.rechazada && !m.anulada)
  const salidaHora = horario.modo === 'fijo' ? aMin(horario.salida) : null
  const faltaJornada = Math.max(0, (j.programado || minutosProgramados(horario)) - (j.trabajado || 0))
  const falta = j.entrada != null ? Math.max(faltaJornada, salidaHora != null ? salidaHora - minAhora : 0) : 0
  const temprano = falta > 30
  const ultimaSalida = j.salida != null ? [...validas].reverse().find(m => m.tipo === 'salida') : null
  const deshacer = ultimaSalida && ultimaSalida.origen === 'app' && minAhora - ultimaSalida.min <= 10 ? ultimaSalida : null
  if (j.salida != null) return { principal: null, secundaria: null, temprano: false, falta: 0, deshacer }
  if (j.entrada == null) return { principal: 'entrada', secundaria: null, temprano: false, falta: 0, deshacer: null }
  if (j.enPausa) return { principal: 'pausa_fin', secundaria: null, temprano, falta, deshacer: null }
  const pausaPendiente = (horario.pausa || 0) > 0 && !validas.some(m => m.tipo === 'pausa_inicio')
  const tocaPausa = pausaPendiente && falta > 60
  return tocaPausa
    ? { principal: 'pausa_inicio', secundaria: 'salida', temprano, falta, deshacer: null }
    : { principal: 'salida', secundaria: 'pausa_inicio', temprano, falta, deshacer: null }
}
export const ETIQUETA_MARCA = { entrada: 'Marcar entrada', pausa_inicio: 'Iniciar pausa', pausa_fin: 'Volver de la pausa', salida: 'Marcar salida' }
export const esDiaLaboral = (h, fecha) => !!h && h.dias.includes(diaISO(fecha))

/* ¿Qué se exige el día de hoy? La regla del backend (`service.ts:657`), más la modalidad: un
   híbrido fuera de sus días de oficina marca como remoto. */
export function exigencias(asig, horario, politica, fecha) {
  const remotoHoy = asig?.modalidad === 'remoto' || (asig?.modalidad === 'hibrido' && !asig.diasOficina.includes(diaISO(fecha)))
  return {
    remotoHoy,
    geocerca: !remotoHoy && horario?.modo !== 'flexible' && (politica?.geocerca ?? true),
    rostro: politica?.rostro ?? true,
    umbral: politica?.umbral ?? 0.78,
    tolerancia: politica?.tolerancia ?? 10,
  }
}

/* ── LAS MARCACIONES DE UN DÍA, SEMBRADAS ── */
/* `ventana` = las horas extra autorizadas de ese día ({ desde, hasta } en minutos): quien las tiene se
   queda hasta el final de la ventana, y si el día no es laboral, viene solo a esas horas. */
export function marcasSembradas(p, asig, horario, politica, lugar, fecha, hasta = Infinity, ventana = null) {
  if (!asig || !horario) return []
  const laboral = esDiaLaboral(horario, fecha)
  if (!laboral && !ventana) return []
  const r = rng(`${p.id}|${fecha}`)
  const ex = exigencias(asig, horario, politica, fecha)
  const geo = lugar?.geo
  const casa = geo ? desplazar(geo, 2500 + (p.id % 7) * 600, p.id) : null
  const sitio = ex.remotoHoy ? casa : geo
  const marcas = []
  const pon = (tipo, min, extra = {}) => {
    if (min > hasta) return
    const punto = sitio ? desplazar(sitio, ex.remotoHoy ? entre(r, 0, 25) : entre(r, 4, (lugar.geo.radio || 150) * 0.6), entre(r, 0, 6.28)) : null
    const dist = geo && punto ? distanciaM(punto, geo) : null
    marcas.push({
      id: `m-${p.id}-${fecha}-${tipo}`, personaId: p.id, fecha, tipo, min: Math.round(min),
      lat: punto?.lat ?? null, lng: punto?.lng ?? null,
      distancia: dist != null ? Math.round(dist) : null,
      dentro: ex.geocerca ? dist != null && dist <= (politica?.radio || geo?.radio || 150) : null,
      score: ex.rostro ? +entre(r, 0.82, 0.97).toFixed(2) : null,
      origen: 'app', remoto: ex.remotoHoy, ...extra,
    })
  }

  const dado = r()
  if (dado < 0.02 && !ventana) return [] // falta
  let entrada; let salida
  if (!laboral) {
    entrada = ventana.desde - entre(r, 0, 8)
    salida = ventana.hasta + entre(r, -4, 10)
  } else if (horario.modo === 'flexible') {
    entrada = entre(r, 7.5 * 60, 10.5 * 60)
    salida = entrada + entre(r, 7 * 60, 9.5 * 60)
  } else {
    const e = aMin(horario.entrada); const s = aMin(horario.salida)
    entrada = dado < 0.11 ? e + ex.tolerancia + entre(r, 2, 42) : e - entre(r, 0, 18) + entre(r, 0, 7)
    const d2 = r()
    /* Algunos se quedan sin autorización: eso es «fuera de horario», no horas extra. */
    salida = d2 < 0.08 ? s + entre(r, 35, 125) : s + entre(r, -4, 14)
    if (ventana && ventana.hasta > s) salida = ventana.hasta + entre(r, -6, 9)
  }

  /* Un intento rechazado de vez en cuando, antes del bueno: la cara no coincidió o estaba lejos. */
  const intento = r()
  if (intento < 0.012 && ex.rostro) pon('entrada', entrada - 1.5, { id: `m-${p.id}-${fecha}-rech`, rechazada: 'rostro', score: +entre(r, 0.5, 0.7).toFixed(2) })
  else if (intento < 0.022 && ex.geocerca && geo) {
    const lejos = desplazar(geo, entre(r, 320, 950), entre(r, 0, 6.28))
    if (entrada - 6 <= hasta) marcas.push({ id: `m-${p.id}-${fecha}-rech`, personaId: p.id, fecha, tipo: 'entrada', min: Math.round(entrada - 6), lat: lejos.lat, lng: lejos.lng, distancia: Math.round(distanciaM(lejos, geo)), dentro: false, score: ex.rostro ? 0.9 : null, origen: 'app', rechazada: 'geocerca' })
  }

  pon('entrada', entrada)
  if (laboral && (horario.pausa || horario.modo === 'flexible') && salida - entrada > 300) {
    const pi = Math.max(entrada + 180, entre(r, 12.6 * 60, 13.4 * 60))
    pon('pausa_inicio', pi)
    pon('pausa_fin', pi + (horario.pausa || 45) + entre(r, -6, 12))
  }
  /* Sin salida: sólo en días pasados (hoy, todavía puede marcarla). */
  if (r() > 0.015 || ventana) pon('salida', salida)
  return marcas
}

/* ── RECOMPUTAR LA JORNADA ──
   `recomputeJornada` del backend: entrada = la primera, salida = la última, pausas emparejadas por
   posición, tardanza contra la hora de entrada más la tolerancia. Y encima lo que sólo se sabe
   mirando HOY (si todavía puede llegar) y cruzando con ausencias aprobadas. */
export function recomputar({ marcas, horario, tolerancia = 10, fecha, justificacion, esHoy = false, minAhora = 0, ventanas = [] }) {
  const validas = marcas.filter(m => !m.rechazada && !m.anulada).sort((a, b) => a.min - b.min)
  const entradas = validas.filter(m => m.tipo === 'entrada')
  const salidas = validas.filter(m => m.tipo === 'salida')
  const pi = validas.filter(m => m.tipo === 'pausa_inicio')
  const pf = validas.filter(m => m.tipo === 'pausa_fin')
  const entrada = entradas[0]?.min ?? null
  const salida = salidas.length ? salidas[salidas.length - 1].min : null
  let pausas = 0
  pi.forEach((p, i) => { if (pf[i]) pausas += Math.max(0, pf[i].min - p.min) })
  const enPausa = pi.length > pf.length
  const laboral = esDiaLaboral(horario, fecha)
  const programado = laboral ? minutosProgramados(horario) : 0
  const fin = salida ?? (esHoy && entrada != null ? minAhora : null)
  const trabajado = entrada != null && fin != null ? Math.max(0, fin - entrada - pausas - (enPausa && esHoy && salida == null ? minAhora - pi[pi.length - 1].min : 0)) : 0
  const tardanza = laboral && horario?.modo === 'fijo' && entrada != null ? Math.max(0, entrada - (aMin(horario.entrada) + tolerancia)) : 0
  /* LAS HORAS EXTRA SE AUTORIZAN, NO SE DEDUCEN. Quedarse no es trabajar horas extra: solo cuenta
     lo trabajado DENTRO de una ventana que RR.HH. aprobó (a pedido de la persona) o asignó (y la
     persona aceptó). Lo demás que pase de la jornada es «fuera de horario»: se informa, no se paga. */
  const tramos = []
  let abierto = null
  for (const m of validas) {
    if (m.tipo === 'entrada' || m.tipo === 'pausa_fin') { if (abierto == null) abierto = m.min }
    else if (abierto != null) { tramos.push([abierto, m.min]); abierto = null }
  }
  if (abierto != null && esHoy) tramos.push([abierto, minAhora])
  const extra = ventanas.reduce((t, v) => t + tramos.reduce((u, [a, b]) => u + Math.max(0, Math.min(b, v.hasta) - Math.max(a, v.desde)), 0), 0)
  const sobra = programado > 0 || extra > 0 ? Math.max(0, trabajado - programado - extra) : 0
  const fueraDeHorario = (salida != null || esHoy) && sobra >= 15 ? sobra : 0

  let estado
  if (esHoy) {
    if (justificacion && entrada == null) estado = 'justificada'
    else if (!laboral && entrada == null) estado = 'libre'
    else if (entrada == null) {
      const limite = horario?.modo === 'fijo' ? aMin(horario.entrada) + tolerancia : 11 * 60
      estado = minAhora < limite ? 'porLlegar' : 'sinMarcar'
    } else if (salida != null) estado = tardanza > 0 ? 'tarde' : extra > 0 ? 'extra' : 'termino'
    else estado = enPausa ? 'pausa' : 'trabajando'
  } else if (!laboral && entrada == null) estado = ventanas.length ? 'ausente' : 'libre'
  else if (entrada == null) estado = justificacion ? 'justificada' : 'ausente'
  else if (salida == null) estado = 'incompleta'
  else if (tardanza > 0) estado = 'tarde'
  else if (extra > 0) estado = 'extra'
  else estado = 'presente'

  return { entrada, salida, pausas, trabajado, programado, tardanza, extra, fueraDeHorario, autorizado: ventanas.reduce((t, v) => t + v.hasta - v.desde, 0), estado, enPausa, llegoTarde: tardanza > 0, laboral }
}

/* ── CSV QUE NO SE PUEDE ENVENENAR ──
   Riesgo P3 de la arquitectura: una celda que empieza con = + - @ se ejecuta como fórmula al abrir
   la planilla. Se le antepone un apóstrofo, que es lo que Excel y Sheets entienden como «texto». */
export function descargarCSV(nombre, filas) {
  const celda = v => {
    let s = String(v ?? '')
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const texto = '﻿' + filas.map(f => f.map(celda).join(';')).join('\n')
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
