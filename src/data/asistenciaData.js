/* ── ASISTENCIA · DATOS, SEMILLAS Y CÁLCULO ────────────────────────────────
   La maqueta del módulo descrito en ASISTENCIA_ARQUITECTURA.md, con una diferencia de fondo: allí
   la marcación se hace contra una «sede» propia del módulo, y aquí contra el LUGAR que ya existe en
   Organización —una sucursal o un centro de trabajo—. Asistencia no da de alta sitios: les pone una
   geocerca encima a los que la empresa ya definió. Y el «quién» se agrupa por la unidad
   organizacional de cada persona, la misma que dibuja el organigrama.

   EL DISPOSITIVO CAPTURA, EL SERVIDOR DECIDE. Aquí no hay servidor, pero las funciones de cálculo
   están escritas como las del backend (`recomputeJornada`): puras, sin estado, y son lo único que
   decide el estado de un día. Las pantallas sólo las leen. */

/* ── EL RELOJ ──
   EL RELOJ DE LA DEMO. «Cargar datos de ejemplo» pone a Asistencia en un viernes por la tarde: la
   semana completa a la vista, el mes casi cerrado, gente trabajando y gente que ya salió. Cada vez
   que se abre la página el reloj arranca en ese viernes a esa hora y avanza con el tiempo real
   mientras se mira. «Resetear demo» lo borra (vive con las demás claves `onb_demo_`) y vuelve el
   reloj de verdad. Se lee una vez al cargar: las dos acciones recargan la página. */
const CLAVE_RELOJ = 'onb_demo_at_reloj'
const ARRANQUE = Date.now()
const leerReloj = () => { try { return JSON.parse(localStorage.getItem(CLAVE_RELOJ)) || null } catch { return null } }
export const relojDemo = typeof localStorage !== 'undefined' ? leerReloj() : null
const BASE_DEMO = relojDemo ? (() => {
  const [y, m, d] = relojDemo.fecha.split('-').map(Number); const [hh, mm] = relojDemo.hora.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm, 0).getTime()
})() : null
export const ahora = () => (BASE_DEMO != null ? new Date(BASE_DEMO + (Date.now() - ARRANQUE)) : new Date())
export const iso = d => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const hoyISO = () => iso(ahora())
/* 'AAAA-MM-DD' partido a mano: `new Date(cadena)` lo lee como UTC y en Bolivia da el día anterior. */
export const aFecha = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const sumarDias = (s, n) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d) }
/* Lunes = 1 … domingo = 7, como `dias_semana` en el backend (ISO). */
export const diaISO = s => { const d = aFecha(s).getDay(); return d === 0 ? 7 : d }
export const minutosAhora = () => { const d = ahora(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 }

/* AL SEGUNDO (#8). El tiempo se guarda en minutos con decimales: 08:30:01 es 510,0167 y 08:30:59 es
   510,983. Nada se redondea al guardar; cada pantalla TRUNCA al mostrar —08:30:59 se lee 08:30 en
   una lista y 08:30:59 en el detalle, nunca 08:31— y el cálculo usa los segundos de verdad. */
export const aMin = hhmm => { const [h, m, s = 0] = (hhmm || '0:0').split(':').map(Number); return h * 60 + m + s / 60 }
/* Segundos enteros, para no arrastrar los 0,99999 de la coma flotante. */
const segDe = min => Math.round(min * 60)
export const alSegundo = min => segDe(min) / 60
export const hhmm = min => {
  if (min == null) return '—'
  const m = Math.floor(segDe(min) / 60)
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
export const hhmmss = min => (min == null ? '—' : `${hhmm(min)}:${String(segDe(min) % 60).padStart(2, '0')}`)
/* «7 h 45 min», «45 min», «0 min». Con signo cuando se pide, para los saldos. `seg` agrega los
   segundos («1 h 8 min 12 s»): el detalle de un día los muestra; las sumas del mes, no. Siempre
   trunca: nunca dice más tiempo del que hubo. */
export function duracion(min, { signo = false, corto = false, seg = false } = {}) {
  if (min == null) return '—'
  const s = min < 0 ? '−' : signo && min > 0 ? '+' : ''
  const t = Math.abs(segDe(min))
  const a = Math.floor(t / 60); const ss = t % 60
  const h = Math.floor(a / 60); const m = a % 60
  if (corto) return `${s}${h}:${String(m).padStart(2, '0')}${seg ? `:${String(ss).padStart(2, '0')}` : ''}`
  if (seg) return `${s}${[h && `${h} h`, (h || m) && `${m} min`, (ss || (!h && !m)) && `${ss} s`].filter(Boolean).join(' ')}`
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
  presente:   { label: 'Terminó su jornada',          tono: 'verde',   icono: 'check',  desc: 'Cumplió su jornada.' },
  tarde:      { label: 'Llegó tarde',       tono: 'ambar',   icono: 'reloj',  desc: 'Entró después de su hora de entrada más la tolerancia.' },
  anticipada: { label: 'Salió antes', tono: 'ambar',   icono: 'reloj',  desc: 'Salió antes de su hora de salida, pasada la tolerancia.' },
  extra:      { label: 'Horas extra',       tono: 'azul',    icono: 'subir',  desc: 'Trabajó horas extra autorizadas por RR.HH.' },
  incompleta: { label: 'Salida sin marcar',        tono: 'violeta', icono: 'medio',  desc: 'Marcó la entrada y nunca la salida.' },
  ausente:    { label: 'Faltó',           tono: 'rojo',    icono: 'cruz',   desc: 'Tenía jornada y no marcó.' },
  justificada:{ label: 'Ausencia justificada',       tono: 'gris',    icono: 'escudo', desc: 'Ausencia con permiso, licencia o vacaciones.' },
  trabajando: { label: 'Trabajando',        tono: 'verde',   icono: 'vivo',   desc: 'Marcó la entrada y está en su jornada.' },
  pausa:      { label: 'En descanso',          tono: 'azul',    icono: 'cafe',   desc: 'Marcó el inicio de su descanso.' },
  porLlegar:  { label: 'Aún no le toca',        tono: 'gris',    icono: 'espera', desc: 'Todavía no es su hora de entrada.' },
  sinMarcar:  { label: 'No ha llegado',        tono: 'rojo',    icono: 'alerta', desc: 'Ya pasó su hora de entrada y la tolerancia, y no marcó.' },
  termino:    { label: 'Terminó su jornada',           tono: 'verde',   icono: 'check',  desc: 'Marcó entrada y salida hoy.' },
  libre:      { label: 'Día libre',         tono: 'gris',    icono: 'luna',   desc: 'No tiene jornada programada este día.' },
}

export const TIPOS_MARCA = {
  entrada: { label: 'Entrada', corto: 'Entró' },
  pausa_inicio: { label: 'Inicio del descanso', corto: 'Descanso' },
  pausa_fin: { label: 'Fin del descanso', corto: 'Volvió' },
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
  { id: 'h-oficina', nombre: 'Oficina', modo: 'fijo', dias: [1, 2, 3, 4, 5], entrada: '08:30', salida: '18:00', pausa: 60, pausaDesde: '13:00', pausaHasta: '14:00', color: '#00B876' },
  { id: 'h-tienda', nombre: 'Atención al público', modo: 'fijo', dias: [1, 2, 3, 4, 5, 6], entrada: '09:00', salida: '17:00', pausa: 30, pausaDesde: '13:00', pausaHasta: '13:30', color: '#3B82F6', porDia: { 6: { entrada: '09:00', salida: '13:00', conPausa: false } } },
  { id: 'h-deposito', nombre: 'Depósito · turno mañana', modo: 'fijo', dias: [1, 2, 3, 4, 5, 6], entrada: '07:00', salida: '15:00', pausa: 30, pausaDesde: '11:30', pausaHasta: '12:00', color: '#F59E0B' },
  { id: 'h-flexible', nombre: 'Flexible por objetivos', modo: 'flexible', dias: [1, 2, 3, 4, 5], meta: 480, color: '#8B5CF6' },
  { id: 'h-medio', nombre: 'Medio tiempo', modo: 'fijo', dias: [1, 2, 3, 4, 5], entrada: '08:00', salida: '12:00', pausa: 0, color: '#EC4899' },
]

export const POLITICAS_SEED = [
  { id: 'p-estandar', nombre: 'Estándar', rostro: true, geocerca: true, umbral: 0.78, tolerancia: 10, toleranciaPausa: 2, toleranciaSalida: 5, sinPausa: 'ambas', redondeo: 0, radio: null, porDefecto: true,
    desc: 'Rostro y ubicación en cada marcación. La que se aplica si nadie eligió otra.' },
  { id: 'p-remoto', nombre: 'Trabajo remoto', rostro: true, geocerca: false, umbral: 0.8, tolerancia: 10, toleranciaPausa: 2, toleranciaSalida: 5, sinPausa: 'ambas', redondeo: 0, radio: null, porDefecto: false,
    desc: 'El rostro prueba quién marca y el horario cuándo. La ubicación se guarda, pero no bloquea.' },
  { id: 'p-confianza', nombre: 'Cargos de confianza', rostro: false, geocerca: true, umbral: 0.78, tolerancia: 20, toleranciaPausa: 10, toleranciaSalida: 15, sinPausa: 'alertar', redondeo: 0, radio: 300, porDefecto: false,
    desc: 'Sin rostro y con una geocerca más amplia, para quien entra y sale de reuniones todo el día.' },
]

/* LAS REGLAS DE CÁLCULO DE UNA POLÍTICA, con sus valores por defecto (las políticas guardadas antes
   de que existieran estos campos siguen funcionando):
     · toleranciaPausa: minutos de gracia al salir al descanso o al volver de él.
     · toleranciaSalida: minutos antes de la hora de salida que todavía no son «salida anticipada».
     · sinPausa: si no marcó el descanso, 'descontar' la franja, solo 'alertar' o 'ambas' (#6).
     · redondeo: 0 = al segundo; 1 o 5 = la tardanza se cuenta por minutos completos o bloques de 5,
       hacia abajo, a favor de la persona (#8). */
export const SIN_PAUSA = {
  ambas: { label: 'Descontar y alertar', desc: 'Se resta la franja de lo trabajado y queda la alerta «sin descanso» para revisarla.' },
  descontar: { label: 'Solo descontar', desc: 'Se resta la franja de lo trabajado, sin alerta.' },
  alertar: { label: 'Solo alertar', desc: 'Se cuenta todo como trabajado y queda la alerta «sin descanso».' },
}
export const REDONDEOS = [
  { valor: 0, label: 'Al segundo', desc: 'Entrada 08:30, tolerancia 10 min: quien marca 08:40:59 suma 59 s de tardanza.' },
  { valor: 1, label: 'Por minuto completo', desc: 'Los segundos sueltos no cuentan: 3 min 59 s de tardanza son 3 min.' },
  { valor: 5, label: 'En bloques de 5 min', desc: '7 min 30 s de tardanza cuentan como 5 min.' },
]
export const reglasDe = pol => ({
  tolerancia: pol?.tolerancia ?? 10,
  toleranciaPausa: pol?.toleranciaPausa ?? 2,
  toleranciaSalida: pol?.toleranciaSalida ?? 5,
  sinPausa: 'ambas', // siempre: se resta de las horas trabajadas y queda el aviso (ya no se elige)
  redondeo: 0, // siempre al segundo (#8): ya no se elige
})
/* SIN POLÍTICAS (decisión del 3 nov 2026): las reglas de cálculo son del HORARIO —tolerancias, qué
   pasa si no marca el descanso, redondeo— y lo que se exige al marcar es de la EMPRESA —pedir el rostro
   y su parecido mínimo, en Biometría; exigir estar en el lugar, en Lugares—. El remoto ya no necesita
   una política: su modalidad no pide geocerca, y el flexible nunca la pide. Este objeto reúne las dos
   cosas con la forma que tenía una política, así el cálculo no cambia. */
/* Lo que se pide al marcar, según cómo trabaja: presencial (rostro y estar en su lugar), remoto (rostro;
   la ubicación se guarda pero no bloquea) e híbrido (estar en su lugar los días de oficina). */
export const MARCACION_EMPRESA = {
  umbral: 0.78,
  presencial: { rostro: true, lugar: true },
  remoto: { rostro: true, lugar: false },
  hibrido: { rostro: true, lugar: true },
}
export const reglasMarcacion = (horario, empresa = MARCACION_EMPRESA) => ({
  id: 'reglas', nombre: horario?.nombre || 'Reglas de la empresa', ...reglasDe(horario),
  umbral: empresa?.umbral ?? 0.78, porModalidad: { ...MARCACION_EMPRESA, ...(empresa || {}) },
  rostro: (empresa?.presencial || MARCACION_EMPRESA.presencial).rostro, geocerca: (empresa?.presencial || MARCACION_EMPRESA.presencial).lugar, radio: null,
})
const redondear = (min, bloque) => (bloque ? Math.floor(min / bloque + 1e-9) * bloque : min)

/* LA FRANJA DE DESCANSO DE UN HORARIO (#2), en minutos. Los horarios guardados con solo «pausa en
   minutos» la toman desde las 13:00, que es donde la pantalla se la dibujaba. */
/* OTRO HORARIO ALGUNOS DÍAS (pedido de RR.HH.): de lunes a viernes de 08:00 a 18:00 y el sábado de
   08:00 a 12:00. `porDia` guarda, por día de la semana (1 = lunes … 7 = domingo), su entrada, su salida y si
   tiene el mismo descanso. Ese día cuenta como jornada completa con SUS horas: quien trabaja el sábado de
   08:00 a 12:00 cumplió su día, no le «faltan» cuatro horas. */
export function horarioDeDia(h, dow) {
  /* Un flexible puede tener otra meta algún día (el viernes, 6 h): `metaPorDia`. */
  if (h?.modo === 'flexible') return h.metaPorDia?.[dow] ? { ...h, meta: h.metaPorDia[dow], delDia: dow } : h
  const o = h?.modo === 'fijo' ? h.porDia?.[dow] : null
  if (!o) return h
  /* Sus descansos: los propios (`descansos`), los del horario (`conPausa`) o ninguno. */
  const propios = Array.isArray(o.descansos) ? o.descansos : o.conPausa ? null : []
  return { ...h, entrada: o.entrada, salida: o.salida, ...(propios ? { descansos: propios, pausa: 0, pausaDesde: null, pausaHasta: null } : {}), delDia: dow }
}
export const horarioDelDia = (h, fecha) => horarioDeDia(h, diaISO(fecha))
/* EL HORARIO DE UN DÍA CON PERMISO POR HORAS (propuesta «Lo que la app ya sabe», aprobada el 5 nov 2026).
   `permisos` = [{ desde, hasta, label }] en minutos, ya aprobados. Si el permiso cubre el inicio del turno,
   su entrada de ese día es cuando termina el permiso; si cubre el final, su salida es cuando empieza. Así
   no cuenta atraso ni salida antes, y esas horas no se le deben. Un descanso que queda fuera del tramo que
   trabaja se cae. Un permiso en medio del turno no mueve la entrada ni la salida. */
export function horarioConPermisos(h, permisos = []) {
  if (!h || h.modo !== 'fijo' || !permisos.length) return h
  let e = aMin(h.entrada)
  let s = aMin(h.salida)
  const inicio = permisos.find(p => p.desde <= e && p.hasta > e)
  const fin = permisos.find(p => p.hasta >= s && p.desde < s)
  if (inicio) e = Math.min(inicio.hasta, s)
  if (fin) s = Math.max(fin.desde, e)
  if (!inicio && !fin) return { ...h, permisoHoras: { medio: permisos[0] } }
  const quedan = franjasPausa(h).filter(f => f.desde >= e && f.hasta <= s).map(f => ({ desde: hhmm(f.desde), hasta: hhmm(f.hasta) }))
  return {
    ...h, entrada: hhmm(e), salida: hhmm(s), descansos: quedan, pausa: 0, pausaDesde: null, pausaHasta: null,
    permisoHoras: { inicio: inicio || null, fin: fin || null, entradaOriginal: h.entrada, salidaOriginal: h.salida },
  }
}
/* Los días con otro horario, en palabras: «Sá 08:00 a 12:00». */
export const otrosDias = h => (h?.modo === 'fijo' ? Object.entries(h.porDia || {}).filter(([d]) => h.dias.includes(Number(d))).map(([d, o]) => `${DIAS_CORTOS[d]} ${o.entrada} a ${o.salida}`)
  : Object.entries(h?.metaPorDia || {}).filter(([d]) => h.dias.includes(Number(d))).map(([d, m]) => `${DIAS_CORTOS[d]} ${duracion(m)}`))
export const minutosSemana = h => (h?.dias || []).reduce((s, d) => s + minutosProgramados(horarioDeDia(h, d)), 0)

/* LOS DESCANSOS DE UN DÍA: hasta dos, cada uno con su franja.
   Los horarios de antes tienen uno solo (pausaDesde–pausaHasta) y se leen igual. */
export function franjasPausa(h) {
  if (!h || h.modo !== 'fijo') return []
  const lista = Array.isArray(h.descansos)
    ? h.descansos.map(d => ({ desde: aMin(d.desde), hasta: aMin(d.hasta) }))
    : h.pausa > 0 || h.pausaDesde
      ? [{ desde: aMin(h.pausaDesde || '13:00'), hasta: h.pausaHasta ? aMin(h.pausaHasta) : aMin(h.pausaDesde || '13:00') + (Number(h.pausa) || 0) }]
      : []
  return lista.filter(f => f.hasta > f.desde).map(f => ({ ...f, largo: f.hasta - f.desde })).sort((a, b) => a.desde - b.desde)
}
export function franjaPausa(h) { return franjasPausa(h)[0] || null }

/* LAS ALERTAS DE UN DÍA: lo que se le avisa a la persona y lo que puede justificar (#5, #6, #7, #15). */
export const ALERTAS = {
  tarde: { label: 'Llegó tarde', corto: 'Tarde', tono: 'ambar' },
  pausaAnticipada: { label: 'Salió antes al descanso', corto: 'Descanso antes', tono: 'ambar' },
  pausaRetorno: { label: 'Volvió tarde del descanso', corto: 'Volvió tarde', tono: 'ambar' },
  pausaExceso: { label: 'Excedió su descanso', corto: 'Descanso excedido', tono: 'rojo' },
  sinPausa: { label: 'No marcó su descanso', corto: 'Sin descanso', tono: 'violeta' },
  anticipada: { label: 'Salida anticipada', corto: 'Salió antes', tono: 'ambar' },
}
/* El motivo que la persona elige al justificar (#13): un catálogo corto y una línea propia. */
export const MOTIVOS_JUSTIFICACION = ['Transporte o tráfico', 'Bloqueo o marcha', 'Salud', 'Trámite personal', 'Asunto familiar', 'Clima', 'Pedido de mi jefe', 'Problema con la app', 'Otro']

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
  /* JUSTIFICAR UNA ALERTA (#13). La app le avisa a la persona («Hoy llegaste 45 min tarde») y ella
     agrega el motivo; su jefe o RR.HH. lo acepta o lo rechaza. Aceptado, deja de contar en contra en
     el cierre; rechazado, sigue contando. `alerta` es una clave de ALERTAS. */
  justificacion: { label: 'Justificación', plural: 'Justificaciones', desc: 'Tardanzas, descansos excedidos y salidas anticipadas que la persona explicó desde la app. Al aceptarlas, dejan de contar como injustificadas en el cierre.' },
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
  /* Un beneficio de la empresa, no de la ley: se pide desde Mis beneficios con el día ya puesto, y por
     eso no aparece en la lista de «¿Qué necesita?». RR.HH. lo ve y lo aprueba como cualquier permiso. */
  { key: 'cumpleanos', label: 'Día libre de cumpleaños', licencia: false, beneficio: true },
]
export const ESTADOS_SOLICITUD = {
  pendiente: { label: 'Pendiente', tono: 'ambar' },
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
  pendiente: { label: 'Pendiente', tono: 'ambar' },
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

/* El proyecto o centro de costo al que se cargan las horas extra (#10). */
export const PROYECTOS_DEMO = ['Inventario anual', 'Cliente Hipermaxi', 'Proyecto X', 'Cierre contable', 'Apertura El Alto']

export function horasExtraSeed(personas) {
  const h = hoyISO()
  const lista = []
  const pon = (p, fecha, desde, hasta, origen, estado, motivo) => lista.push({
    id: `hx-${p.id}-${fecha}`, personaId: p.id, fecha, desde, hasta, origen, estado, motivo,
    proyecto: PROYECTOS_DEMO[p.id % PROYECTOS_DEMO.length], aprobador: 'Juan Pérez Gómez',
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
export const minutosProgramados = h => (h.modo === 'flexible' ? h.meta || 0 : Math.max(0, aMin(h.salida) - aMin(h.entrada) - franjasPausa(h).reduce((s, f) => s + f.largo, 0)))

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
  const pausaPendiente = franjasPausa(horario).length > validas.filter(m => m.tipo === 'pausa_inicio').length
  const tocaPausa = pausaPendiente && falta > 60
  return tocaPausa
    ? { principal: 'pausa_inicio', secundaria: 'salida', temprano, falta, deshacer: null }
    : { principal: 'salida', secundaria: 'pausa_inicio', temprano, falta, deshacer: null }
}
export const ETIQUETA_MARCA = { entrada: 'Marcar entrada', pausa_inicio: 'Iniciar descanso', pausa_fin: 'Volver del descanso', salida: 'Marcar salida' }
/* Los feriados nacionales no son días laborales: nadie llega tarde ni falta en Todos Santos. */
export const esDiaLaboral = (h, fecha) => !!h && h.dias.includes(diaISO(fecha)) && !FERIADOS[fecha]

/* ¿Qué se exige el día de hoy? La regla del backend (`service.ts:657`), más la modalidad: un
   híbrido fuera de sus días de oficina marca como remoto. */
export function exigencias(asig, horario, politica, fecha) {
  const remotoHoy = asig?.modalidad === 'remoto' || (asig?.modalidad === 'hibrido' && !asig.diasOficina.includes(diaISO(fecha)))
  return {
    remotoHoy,
    geocerca: !remotoHoy && horario?.modo !== 'flexible' && (politica?.porModalidad?.[asig?.modalidad === 'hibrido' ? 'hibrido' : 'presencial']?.lugar ?? politica?.geocerca ?? true),
    rostro: politica?.porModalidad?.[remotoHoy ? 'remoto' : asig?.modalidad === 'hibrido' ? 'hibrido' : 'presencial']?.rostro ?? politica?.rostro ?? true,
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
      id: `m-${p.id}-${fecha}-${tipo}`, personaId: p.id, fecha, tipo, min: alSegundo(min),
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
    /* Y unos pocos se van antes: salida anticipada (#7). */
    salida = d2 < 0.08 ? s + entre(r, 35, 125) : d2 > 0.965 ? s - entre(r, 12, 55) : s + entre(r, -4, 14)
    if (ventana && ventana.hasta > s) salida = ventana.hasta + entre(r, -6, 9)
  }

  /* Un intento rechazado de vez en cuando, antes del bueno: la cara no coincidió o estaba lejos. */
  const intento = r()
  if (intento < 0.012 && ex.rostro) pon('entrada', entrada - 1.5, { id: `m-${p.id}-${fecha}-rech`, rechazada: 'rostro', score: +entre(r, 0.5, 0.7).toFixed(2) })
  else if (intento < 0.022 && ex.geocerca && geo) {
    const lejos = desplazar(geo, entre(r, 320, 950), entre(r, 0, 6.28))
    if (entrada - 6 <= hasta) marcas.push({ id: `m-${p.id}-${fecha}-rech`, personaId: p.id, fecha, tipo: 'entrada', min: alSegundo(entrada - 6), lat: lejos.lat, lng: lejos.lng, distancia: Math.round(distanciaM(lejos, geo)), dentro: false, score: ex.rostro ? 0.9 : null, origen: 'app', rechazada: 'geocerca' })
  }

  pon('entrada', entrada)
  /* EL DESCANSO, DENTRO DE SU FRANJA (#2). Casi todos salen a la hora y vuelven a tiempo; algunos
     salen antes, otros vuelven tarde o se exceden, y unos pocos no lo marcan (#5, #6). */
  const franjas = franjasPausa(horario)
  const franja = franjas[0] || null
  if (laboral && (franja || horario.modo === 'flexible') && salida - entrada > 300) {
    const d3 = r()
    const ini = franja ? franja.desde : 13 * 60
    const largo = franja ? franja.largo : 45
    if (!(franja && d3 < 0.025)) {
      const pi = Math.max(entrada + 120, d3 < 0.055 ? ini - entre(r, 8, 25) : ini + entre(r, -1.5, 1.8))
      const pf = d3 > 0.94 ? pi + largo + entre(r, 6, 28) : pi + largo + entre(r, -5, 1.5)
      pon('pausa_inicio', pi)
      pon('pausa_fin', pf)
    }
  }
  /* El segundo descanso (el refrigerio), si el día lo tiene y le toca. */
  if (laboral && franjas[1] && franjas[1].hasta < salida) {
    const f2 = franjas[1]
    const pi2 = f2.desde + entre(r, -1, 2)
    pon('pausa_inicio', pi2, { id: `m-${p.id}-${fecha}-pausa_inicio-2` })
    pon('pausa_fin', pi2 + f2.largo + entre(r, -2, r() > 0.92 ? 12 : 1), { id: `m-${p.id}-${fecha}-pausa_fin-2` })
  }
  /* Sin salida: sólo en días pasados (hoy, todavía puede marcarla). */
  if (r() > 0.015 || ventana) pon('salida', salida)
  return marcas
}

/* ── RECOMPUTAR LA JORNADA ──
   `recomputeJornada` del backend: entrada = la primera, salida = la última, pausas emparejadas por
   posición, tardanza contra la hora de entrada más la tolerancia. Y encima lo que sólo se sabe
   mirando HOY (si todavía puede llegar) y cruzando con ausencias aprobadas. */
/* `reglas` = reglasDe(política). `justificadas` = { tarde: {...}, pausaExceso: {...} }: las alertas
   del día que la persona justificó y su jefe aceptó (#13). */
export function recomputar({ marcas, horario, tolerancia, reglas: reglasIn, fecha, justificacion, esHoy = false, minAhora = 0, ventanas = [], justificadas = {} }) {
  const reglas = reglasIn || reglasDe({ tolerancia })
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
  let trabajado = entrada != null && fin != null ? Math.max(0, fin - entrada - pausas - (enPausa && esHoy && salida == null ? minAhora - pi[pi.length - 1].min : 0)) : 0
  const fijo = laboral && horario?.modo === 'fijo'
  const tol = reglas.tolerancia
  /* UNA SOLA TARDANZA (#4): al segundo, contra la entrada + la tolerancia, redondeada según la
     política. Todas las pantallas leen esta; ninguna la vuelve a calcular. */
  const tardanza = fijo && entrada != null ? redondear(Math.max(0, entrada - (aMin(horario.entrada) + tol)), reglas.redondeo) : 0

  /* LOS DESCANSOS EN SU FRANJA (#2, #5, #6): cada pausa contra su franja —la primera contra el
     primer descanso, la segunda contra el segundo—. Una franja sin su pausa marcada, si la jornada la
     incluye, es un descanso sin marcar. */
  const franjas = fijo ? franjasPausa(horario) : []
  const alertas = []
  const tolP = reglas.toleranciaPausa
  let descontado = 0
  franjas.forEach((franja, k) => {
    const nombre = franjas.length > 1 ? (k === 0 ? ' (primer descanso)' : ' (segundo descanso)') : ''
    if (pi[k]) {
      const ini = pi[k].min; const vuelta = pf[k]?.min
      const esta = vuelta != null ? vuelta - ini : 0
      if (vuelta != null && esta > franja.largo + tolP) alertas.push({ tipo: 'pausaExceso', min: redondear(esta - franja.largo, reglas.redondeo), detalle: `Salió a las ${hhmmss(ini)} y volvió a las ${hhmmss(vuelta)}${nombre}: tomó ${duracion(esta, { seg: true })} de descanso y le corresponden ${duracion(franja.largo)}, de ${hhmm(franja.desde)} a ${hhmm(franja.hasta)}.` })
      else {
        if (ini < franja.desde - tolP) alertas.push({ tipo: 'pausaAnticipada', min: redondear(franja.desde - ini, reglas.redondeo), detalle: `Salió a las ${hhmmss(ini)}${nombre}; su descanso empieza a las ${hhmm(franja.desde)}.` })
        if (vuelta != null && vuelta > franja.hasta + tolP) alertas.push({ tipo: 'pausaRetorno', min: redondear(vuelta - franja.hasta, reglas.redondeo), detalle: `Volvió a las ${hhmmss(vuelta)}${nombre}; su descanso termina a las ${hhmm(franja.hasta)}.` })
      }
    } else if (entrada != null && entrada < franja.desde && salida != null && salida > franja.hasta) {
      const resta = reglas.sinPausa !== 'alertar' ? franja.largo : 0
      descontado += resta
      if (reglas.sinPausa !== 'descontar') alertas.push({ tipo: 'sinPausa', min: franja.largo, detalle: `No marcó su descanso${nombre} de ${hhmm(franja.desde)} a ${hhmm(franja.hasta)}.${resta ? ` Se restaron ${duracion(resta)} de las horas trabajadas.` : ''}` })
    }
  })
  trabajado = Math.max(0, trabajado - descontado)
  /* SALIDA ANTICIPADA (#7): antes de la hora de salida menos su tolerancia. Hoy, solo si ya marcó. */
  const anticipada = fijo && salida != null ? redondear(Math.max(0, aMin(horario.salida) - reglas.toleranciaSalida - salida), reglas.redondeo) : 0
  if (anticipada > 0) alertas.unshift({ tipo: 'anticipada', min: anticipada, detalle: `Salió a las ${hhmmss(salida)}; su salida es a las ${horario.salida}.` })
  if (tardanza > 0) alertas.unshift({ tipo: 'tarde', min: tardanza, detalle: `Entró a las ${hhmmss(entrada)}; su entrada es a las ${horario.entrada}, con ${tol} min de tolerancia.` })
  /* Lo que la persona justificó y su jefe aceptó ya no cuenta en contra; lo rechazado, sí. */
  alertas.forEach(a => { if (justificadas[a.tipo]) a.justificacion = justificadas[a.tipo] })
  const injust = t => alertas.filter(a => a.tipo === t && !a.justificacion).reduce((s, a) => s + a.min, 0)
  const tardanzaInjustificada = injust('tarde')
  const anticipadaInjustificada = injust('anticipada')
  /* Lo que cuesta en tiempo es el exceso: correr el descanso sin alargarlo se alerta, pero no se descuenta. */
  const excesoPausa = alertas.filter(a => a.tipo === 'pausaExceso').reduce((s, a) => s + a.min, 0)
  const excesoPausaInjustificado = injust('pausaExceso')
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
      const limite = horario?.modo === 'fijo' ? aMin(horario.entrada) + tol : 11 * 60
      estado = minAhora < limite ? 'porLlegar' : 'sinMarcar'
    } else if (salida != null) estado = tardanza > 0 ? 'tarde' : anticipada > 0 ? 'anticipada' : extra > 0 ? 'extra' : 'termino'
    else estado = enPausa ? 'pausa' : 'trabajando'
  } else if (!laboral && entrada == null) estado = ventanas.length ? 'ausente' : 'libre'
  else if (entrada == null) estado = justificacion ? 'justificada' : 'ausente'
  else if (salida == null) estado = 'incompleta'
  else if (tardanza > 0) estado = 'tarde'
  else if (anticipada > 0) estado = 'anticipada'
  else if (extra > 0) estado = 'extra'
  else estado = 'presente'

  /* LO JUSTIFICADO NO ES HORA QUE FALTA. Un día de vacaciones, permiso o licencia no tiene horas que
     cumplir: si sumara a lo programado, a quien estuvo cuatro días de vacaciones le «faltarían» 22
     horas en el Libro, en su ficha, en su app y en el cierre. */
  return {
    entrada, salida, pausas, trabajado, programado: estado === 'justificada' ? 0 : programado, tardanza, extra, fueraDeHorario,
    tardanzaInjustificada, anticipada, anticipadaInjustificada, excesoPausa, excesoPausaInjustificado, descontado, alertas, franja: franjas[0] || null, franjas, autorizado: ventanas.reduce((t, v) => t + v.hasta - v.desde, 0), estado, enPausa, llegoTarde: tardanza > 0, laboral }
}

/* ── CARGAR LA DEMO DE ASISTENCIA ──
   Borra todo lo de Asistencia (se vuelve a sembrar al abrir, con el reloj nuevo) y deja el reloj en
   el último viernes hábil a las 16:10. Lo propio de la persona de la sesión (sus marcas de hoy) lo
   siembra el contexto, que es el que sabe quién es. */
export function cargarDemoAsistencia() {
  const borrar = []
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('onb_demo_at_')) borrar.push(k) }
  borrar.forEach(k => localStorage.removeItem(k))
  let f = iso(new Date())
  while (diaISO(f) !== 5 || FERIADOS[f]) f = sumarDias(f, -1)
  localStorage.setItem(CLAVE_RELOJ, JSON.stringify({ fecha: f, hora: '16:10' }))
  localStorage.setItem('onb_demo_at_demo_yo', 'false')
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

/* LAS SEMANAS COMPLETAS DEL MES: los días del mes vecino se ven y se pueden tocar, más claros. Así un
   pedido que cruza de un mes al otro —del 30 al 3— se elige y se ve en la misma pantalla, y el dedo
   puede arrastrar de uno a otro. Antes el mes empezaba con huecos y había que adivinar lo de al lado. */
export function semanasDe(ym) {
  const primero = `${ym}-01`
  const antes = diaISO(primero) - 1
  const total = Math.ceil((antes + diasDelMes(ym).length) / 7) * 7
  return Array.from({ length: total }, (_, i) => sumarDias(primero, i - antes))
}
