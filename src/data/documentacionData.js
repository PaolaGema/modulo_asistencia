/* ── DOCUMENTACIÓN: LOS DATOS Y LAS REGLAS ────────────────────────────────
   Todo lo que el módulo sabe y todo lo que deduce, en un solo archivo sin React. Las pantallas
   leen de acá y el contexto (`DocumentacionContext`) guarda; ninguna pantalla calcula un estado
   por su cuenta, porque el día que dos pantallas digan cosas distintas sobre el mismo carnet el
   módulo deja de servir.

   El PRD es `PRD-DOCUMENTACION.html` (v1.0, 11 ago 2026). Los números RF-, RN- y RNF- que
   aparecen en los comentarios son los suyos y no cambian nunca: se citan para poder ir del
   código al requisito y volver.

   LA IDEA QUE SOSTIENE TODO: un REQUISITO no es un DOCUMENTO (glosario 0.2). El documento es un
   archivo que está; el requisito es una obligación que puede estar incumplida. Sin requisitos
   el sistema no sabe qué falta, y lo que falta es lo que busca una auditoría. */

/* ── HOY ─────────────────────────────────────────────────────────────────
   Las fechas de ejemplo se escriben RELATIVAS a hoy (`dias(-40)`), no fijas: una demo con
   fechas fijas envejece sola, y dentro de tres meses todo saldría vencido. Así la mezcla de
   vigentes, por vencer y vencidos es la misma el día que se muestre. */
export const hoy = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
export const iso = d => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const dias = n => { const d = hoy(); d.setDate(d.getDate() + n); return iso(d) }
export const aFecha = s => (s ? new Date(s + 'T00:00:00') : null)
export const diasHasta = s => (s ? Math.round((aFecha(s) - hoy()) / 86400000) : null)
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
/* dd/mm/aaaa es lo que pide RNF-22; en tablas se lee mejor «12 ago 2026», que no deja dudas
   sobre qué número es el día. Las dos formas salen de acá. */
export const fechaCorta = s => { const d = aFecha(s); return d ? `${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}` : '—' }
export const fechaLarga = s => { const d = aFecha(s); return d ? `${d.getDate()} de ${MESES_LARGOS[d.getMonth()]} de ${d.getFullYear()}` : '—' }
export const fechaNum = s => { const d = aFecha(s); return d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '—' }
export const sumarMeses = (s, meses) => { const d = aFecha(s); d.setMonth(d.getMonth() + meses); return iso(d) }

/* El directorio guarda el ingreso como «15 Mar 2025». Se traduce una vez, acá. */
const MES_DIR = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 }
export const ingresoISO = txt => {
  const [d, m, y] = String(txt || '').split(' ')
  const mes = MES_DIR[(m || '').toLowerCase().slice(0, 3)]
  return mes === undefined ? null : iso(new Date(Number(y), mes, Number(d)))
}
export const antiguedad = desde => {
  const a = aFecha(desde); if (!a) return '—'
  const h = hoy()
  let meses = (h.getFullYear() - a.getFullYear()) * 12 + (h.getMonth() - a.getMonth())
  if (h.getDate() < a.getDate()) meses -= 1
  if (meses < 1) return 'Menos de un mes'
  const anios = Math.floor(meses / 12), resto = meses % 12
  const t = []
  if (anios) t.push(`${anios} ${anios === 1 ? 'año' : 'años'}`)
  if (resto) t.push(`${resto} ${resto === 1 ? 'mes' : 'meses'}`)
  return t.join(' y ')
}

/* ── LOS ESTADOS DE UN DOCUMENTO DEL EXPEDIENTE (6.5) ─────────────────────
   Siete, con su etiqueta, su color y su ícono. EL ESTADO NUNCA VA SOLO POR COLOR (RF-18,
   RNF-21): la etiqueta de texto está siempre, y el ícono distingue en escala de grises.
   `cumple` es la respuesta a «¿satisface el requisito?», que es lo que cuenta el porcentaje. */
export const ESTADOS = {
  vigente:     { label: 'Vigente',     icono: 'check',   tono: 'verde',   cumple: true,  desc: 'Aprobado y sin vencer' },
  por_vencer:  { label: 'Por vencer',  icono: 'reloj',   tono: 'ambar',   cumple: true,  desc: 'Dentro de la ventana de aviso: cumple, pero hay que renovarlo' },
  vencido:     { label: 'Vencido',     icono: 'alerta',  tono: 'rojo',    cumple: false, desc: 'Pasó su fecha de vencimiento y ya no cuenta (RN-04)' },
  faltante:    { label: 'Faltante',    icono: 'vacio',   tono: 'gris',    cumple: false, desc: 'Hay requisito y no hay documento' },
  en_revision: { label: 'En revisión', icono: 'ojo',     tono: 'azul',    cumple: false, desc: 'Lo subió el colaborador y nadie lo miró todavía (RN-05)' },
  rechazado:   { label: 'Rechazado',   icono: 'cruz',    tono: 'rojo',    cumple: false, desc: 'Se revisó y no sirve; el motivo queda escrito' },
  exonerado:   { label: 'Exonerado',   icono: 'escudo',  tono: 'violeta', cumple: null,  desc: 'Alguien decidió que no aplica, con motivo (RN-09)' },
}

export const SENSIBILIDAD = {
  general:      { label: 'General',      desc: 'RR.HH. y el colaborador. El jefe, si la empresa lo habilita' },
  restringido:  { label: 'Restringido',  desc: 'RR.HH. y el colaborador' },
  confidencial: { label: 'Confidencial', desc: 'Solo con permiso explícito, y el colaborador sobre lo suyo. Cada acceso deja rastro (RF-90)' },
}

export const DESTINATARIOS = {
  colaborador: 'Colaborador',
  jefe: 'Jefe directo',
  rrhh: 'Responsable de RR.HH.',
}

/* ── LA TAXONOMÍA (4.1) ───────────────────────────────────────────────────
   Seis tipos y no los ocho del Salar: se van «Documento de prueba», que es basura de
   instalación, y «Otros», que es el cajón donde termina lo que nadie clasificó. Si una empresa
   necesita un cajón, que lo cree a sabiendas. */
export const TIPOS_SEED = [
  { id: 't-personales', nombre: 'Documentos personales', activo: true, retencionAnios: 5 },
  { id: 't-educativos', nombre: 'Respaldos educativos', activo: true, retencionAnios: 5 },
  { id: 't-caja', nombre: 'Requisitos Caja de Salud', activo: true, retencionAnios: 10 },
  { id: 't-vacunas', nombre: 'Vacunas', activo: true, retencionAnios: 10 },
  { id: 't-certificaciones', nombre: 'Certificaciones', activo: true, retencionAnios: 5 },
  { id: 't-baja', nombre: 'Documentos de baja', activo: true, retencionAnios: 10, deBaja: true },
]

/* EL SUBTIPO ES DONDE SE CONFIGURA TODO. Los cinco atributos del Salar —varios, visible,
   editable, notifica al registrar, notifica al vencer— más los cuatro que le faltaban: si vence
   y cuánto dura, qué formatos acepta, qué tan sensible es y sus propios hitos de aviso.
   `persona` es el nombre en lenguaje de persona (propuesta 3): lo que ve el colaborador. */
const S = (id, tipoId, nombre, extra = {}) => ({
  id, tipoId, nombre,
  persona: extra.persona || nombre,
  codigoErp: extra.codigoErp || '',
  varios: false,
  visibleColab: true,
  editableColab: true,
  notificaRegistro: false,
  notificaVencer: !!extra.vigenciaMeses,
  vence: !!extra.vigenciaMeses,
  vigenciaMeses: null,
  formatos: ['pdf', 'jpg', 'png'],
  tamanoMaxMB: 10,
  sensibilidad: 'restringido',
  hitos: null, // null = usa los del parámetro general
  destinatarios: null,
  activo: true,
  ...extra,
})

export const SUBTIPOS_SEED = [
  S('s-ci', 't-personales', 'Carnet de identidad', { persona: 'Su carnet de identidad', codigoErp: 'DP-01', vigenciaMeses: 120, hitos: [60, 30] }),
  S('s-pasaporte', 't-personales', 'Pasaporte', { persona: 'Su pasaporte', codigoErp: 'DP-02', vigenciaMeses: 120 }),
  S('s-nacimiento', 't-personales', 'Certificado de nacimiento', { persona: 'Su certificado de nacimiento', codigoErp: 'DP-03' }),
  S('s-licencia', 't-personales', 'Licencia de conducir', { persona: 'Su licencia de conducir', codigoErp: 'DP-04', vigenciaMeses: 60, hitos: [60, 30, 7], destinatarios: ['colaborador', 'jefe'] }),
  S('s-antecedentes', 't-personales', 'Certificado de antecedentes (REJAP)', { persona: 'Su certificado de antecedentes', codigoErp: 'DP-05', vigenciaMeses: 6 }),
  S('s-croquis', 't-personales', 'Croquis de domicilio', { persona: 'El croquis de su domicilio', codigoErp: 'DP-06', formatos: ['pdf', 'jpg', 'png'] }),
  S('s-titulo', 't-educativos', 'Título profesional', { persona: 'Su título profesional', codigoErp: 'RE-01', sensibilidad: 'general' }),
  S('s-provision', 't-educativos', 'Título en provisión nacional', { persona: 'Su título en provisión nacional', codigoErp: 'RE-02', sensibilidad: 'general' }),
  S('s-bachiller', 't-educativos', 'Diploma de bachiller', { persona: 'Su diploma de bachiller', codigoErp: 'RE-03', sensibilidad: 'general' }),
  S('s-avc04', 't-caja', 'Formulario AVC-04', { persona: 'Su formulario de afiliación a la Caja (AVC-04)', codigoErp: 'CS-01', editableColab: false }),
  S('s-preocupacional', 't-caja', 'Examen médico preocupacional', { persona: 'Su examen médico de ingreso', codigoErp: 'CS-02', sensibilidad: 'confidencial', editableColab: false }),
  S('s-sanidad', 't-caja', 'Carnet de sanidad', { persona: 'Su carnet de sanidad', codigoErp: 'CS-03', vigenciaMeses: 12, hitos: [60, 30, 7], destinatarios: ['colaborador', 'jefe', 'rrhh'] }),
  S('s-fiebre', 't-vacunas', 'Fiebre amarilla', { persona: 'Su vacuna contra la fiebre amarilla', codigoErp: 'VA-01', sensibilidad: 'confidencial', varios: true }),
  S('s-hepatitis', 't-vacunas', 'Hepatitis B', { persona: 'Su vacuna contra la hepatitis B', codigoErp: 'VA-02', sensibilidad: 'confidencial', varios: true }),
  S('s-covid', 't-vacunas', 'COVID-19', { persona: 'Su vacuna contra el COVID-19', codigoErp: 'VA-03', sensibilidad: 'confidencial', varios: true }),
  S('s-curso', 't-certificaciones', 'Certificado de curso', { persona: 'Un certificado de curso', codigoErp: 'CE-01', sensibilidad: 'general', varios: true }),
  S('s-bpm', 't-certificaciones', 'Buenas Prácticas de Manufactura', { persona: 'Su certificado de BPM', codigoErp: 'CE-02', sensibilidad: 'general', vigenciaMeses: 24 }),
  S('s-finiquito', 't-baja', 'Finiquito', { persona: 'Su finiquito', codigoErp: 'DB-01', editableColab: false, visibleColab: true }),
  S('s-renuncia', 't-baja', 'Carta de renuncia', { persona: 'Su carta de renuncia', codigoErp: 'DB-02', editableColab: false }),
  S('s-entrega-cargo', 't-baja', 'Acta de entrega de cargo', { persona: 'El acta de entrega de su cargo', codigoErp: 'DB-03', editableColab: false }),
]

/* ── LOS PARÁMETROS GENERALES (4.1, 4.5, 4.13) ────────────────────────────
   El Salar tenía dos: si notifica y cuántos días antes (7, para todo). Acá el general es el
   valor por defecto, y cada subtipo puede tener los suyos (RF-06, RF-35). */
export const PARAMETROS_SEED = {
  notificarVencimiento: true,
  hitos: [30, 7],
  destinatarios: ['colaborador', 'rrhh'],
  canales: { correo: true, app: true },
  resumen: 'semanal', // 'semanal' | 'mensual' | 'nunca' (RF-41)
  avisoContratoDias: 45, // RF-40
  papeleraDias: 30, // RF-89
  numeracion: {
    certificado: { prefijo: 'CERT', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: true, digitos: 4 },
    memorandum: { prefijo: 'MEM', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: true, digitos: 4 },
    contrato: { prefijo: 'CTR', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: false, digitos: 5 },
  },
}

/* ── LOS CONJUNTOS DE REQUISITOS (4.2) ────────────────────────────────────
   Lo que el Salar no tiene y lo que sostiene todo lo demás. Un conjunto dice a quién alcanza
   —áreas, cargos, sedes; vacío es «a todos»— y qué exige, con obligatoriedad, plazo desde el
   ingreso y si pide vigencia (RF-10, RF-11). */
export const CONJUNTOS_SEED = [
  {
    id: 'c-todos', nombre: 'Todo el personal', activo: true,
    desc: 'Lo mínimo que se pide a cualquier persona que entra, sin importar dónde.',
    criterio: { areas: [], cargos: [], sedes: [] },
    requisitos: [
      { subtipoId: 's-ci', obligatorio: true, plazoDias: 0, exigeVigencia: true },
      { subtipoId: 's-nacimiento', obligatorio: true, plazoDias: 15, exigeVigencia: false },
      { subtipoId: 's-antecedentes', obligatorio: true, plazoDias: 15, exigeVigencia: true },
      { subtipoId: 's-avc04', obligatorio: true, plazoDias: 10, exigeVigencia: false },
      { subtipoId: 's-preocupacional', obligatorio: true, plazoDias: 30, exigeVigencia: false },
      { subtipoId: 's-croquis', obligatorio: false, plazoDias: 30, exigeVigencia: false },
    ],
    creadoPor: 'Paola Arce', creado: dias(-300),
  },
  {
    id: 'c-operaciones', nombre: 'Operaciones y logística', activo: true,
    desc: 'Quien mueve mercadería o maneja: licencia y carnet de sanidad al día.',
    criterio: { areas: ['Operaciones'], cargos: [], sedes: [] },
    requisitos: [
      { subtipoId: 's-sanidad', obligatorio: true, plazoDias: 30, exigeVigencia: true },
      { subtipoId: 's-licencia', obligatorio: true, plazoDias: 30, exigeVigencia: true },
      { subtipoId: 's-hepatitis', obligatorio: false, plazoDias: 60, exigeVigencia: false },
    ],
    creadoPor: 'Paola Arce', creado: dias(-280),
  },
  {
    id: 'c-profesional', nombre: 'Personal profesional', activo: true,
    desc: 'Cargos que exigen título: se pide el título y su provisión nacional.',
    criterio: { areas: ['Tecnología', 'Finanzas', 'Recursos Humanos', 'Dirección General'], cargos: [], sedes: [] },
    requisitos: [
      { subtipoId: 's-titulo', obligatorio: true, plazoDias: 60, exigeVigencia: false },
      { subtipoId: 's-provision', obligatorio: true, plazoDias: 90, exigeVigencia: false },
    ],
    creadoPor: 'Juan Pérez Gómez', creado: dias(-250),
  },
  {
    id: 'c-comercial', nombre: 'Fuerza comercial', activo: true,
    desc: 'Ventas y marketing: bachiller y licencia para quien visita clientes.',
    criterio: { areas: ['Ventas', 'Marketing'], cargos: [], sedes: [] },
    requisitos: [
      { subtipoId: 's-bachiller', obligatorio: true, plazoDias: 30, exigeVigencia: false },
      { subtipoId: 's-licencia', obligatorio: false, plazoDias: 60, exigeVigencia: true },
    ],
    creadoPor: 'Juan Pérez Gómez', creado: dias(-200),
  },
]

/* ── LA SEDE DE UNA PERSONA ───────────────────────────────────────────────
   La sede sale del PUESTO que ocupa en el organigrama (`sedesDe`), no de un campo suyo. Pero el
   organigrama de la demo arranca vacío, y un módulo cuyo filtro principal es la sucursal sin
   una sola sucursal que filtrar no se puede mostrar. Esta tabla es el respaldo DE LA DEMO para
   quien no ocupa ningún cuadro, y se nota que lo es: el día que el organigrama esté dibujado,
   manda él y esta tabla no se lee. */
const SEDE_DEMO = { 1: 'central', 2: 'lpz', 3: 'central', 4: 'central', 5: 'lpz', 6: 'central', 7: 'cbb', 8: 'mtr', 9: 'central', 10: 'central', 11: 'lpz', 12: 'lpz', 13: 'cbb', 14: 'central', 15: 'central', 16: 'mtr', 17: 'central', 18: 'cbb', 19: 'lpz', 20: 'central', 21: 'cbb', 22: 'mtr', 23: 'central', 24: 'lpz', 25: 'lpz', 26: 'cbb', 27: 'lpz', 28: 'central', 29: 'central' }
/* Los que no están en la tabla —ex colaboradores, altas de la demo— se reparten por número y no
   caen todos en la casa matriz: una sede con cuarenta personas y las demás con cinco deja al
   panel sin nada que comparar. */
const REPARTO = ['central', 'lpz', 'cbb', 'mtr', 'sre', 'tja', 'oru']
export const sedeDemoDe = id => SEDE_DEMO[id] || REPARTO[id % REPARTO.length]

/* El salario lo manda Planillas (3.5); acá hay una tabla de ejemplo para que el certificado
   «con sueldo» tenga qué decir. */
const SALARIO_DEMO = { 'Dirección General': 18500, Tecnología: 9800, Finanzas: 8900, 'Recursos Humanos': 7600, Ventas: 6200, Marketing: 6800, Operaciones: 5400, Diseño: 7200 }
export const salarioDemoDe = persona => SALARIO_DEMO[persona?.depto] || 5000

/* ── ¿QUÉ LE EXIGE EL SISTEMA A ESTA PERSONA? (RF-10 a RF-13) ─────────────
   Junta los conjuntos que la alcanzan y, si dos piden lo mismo, gana lo más exigente: basta que
   uno lo haga obligatorio, manda el plazo más corto y basta que uno pida vigencia. Así una
   persona en dos conjuntos no tiene el mismo carnet dos veces en su lista. */
export function alcanza(conjunto, persona) {
  if (!conjunto.activo) return false
  const { areas = [], cargos = [], sedes = [] } = conjunto.criterio || {}
  return (!areas.length || areas.includes(persona.depto))
    && (!cargos.length || cargos.includes(persona.cargo))
    && (!sedes.length || sedes.includes(persona.sede))
}

export function requisitosDe(persona, conjuntos) {
  const porSubtipo = new Map()
  for (const c of conjuntos) {
    if (!alcanza(c, persona)) continue
    for (const r of c.requisitos) {
      const ya = porSubtipo.get(r.subtipoId)
      if (!ya) { porSubtipo.set(r.subtipoId, { ...r, conjuntos: [c.nombre] }); continue }
      porSubtipo.set(r.subtipoId, {
        ...ya,
        obligatorio: ya.obligatorio || r.obligatorio,
        plazoDias: Math.min(ya.plazoDias, r.plazoDias),
        exigeVigencia: ya.exigeVigencia || r.exigeVigencia,
        conjuntos: [...ya.conjuntos, c.nombre],
      })
    }
  }
  return [...porSubtipo.values()]
}

/* ── EL ESTADO DE UN DOCUMENTO SE DEDUCE, NO SE GUARDA (6.2) ──────────────
   Sale de la revisión, del vencimiento y de la fecha de hoy. Guardarlo pediría un proceso
   nocturno que el día que falla deja al sistema mintiendo: diciendo vigente lo que venció. */
export const hitosDe = (subtipo, parametros) => (subtipo?.hitos?.length ? subtipo.hitos : parametros.hitos)
export const ventanaDe = (subtipo, parametros) => Math.max(...hitosDe(subtipo, parametros))

/* La versión que cuenta: la última que no fue reemplazada. Una rechazada sigue contando como
   «la última» —el colaborador tiene que ver que se la rechazaron— hasta que suba otra. */
export const versionActual = doc => (doc?.versiones?.length ? doc.versiones[doc.versiones.length - 1] : null)

export function estadoVersion(v, subtipo, parametros) {
  if (!v) return 'faltante'
  if (v.revision === 'pendiente') return 'en_revision'
  if (v.revision === 'rechazado') return 'rechazado'
  if (v.vencimiento) {
    const d = diasHasta(v.vencimiento)
    if (d < 0) return 'vencido'
    if (d <= ventanaDe(subtipo, parametros)) return 'por_vencer'
  }
  return 'vigente'
}

/* ── LA CHECKLIST DE UNA PERSONA ──────────────────────────────────────────
   Cada requisito con su documento y su estado. Un requisito exonerado sale como tal; uno sin
   documento, como faltante. `exigible` es si ya pasó el plazo desde el ingreso: un faltante con
   plazo corriendo no descuenta (RN-07), porque alguien que entró ayer no puede salir en rojo. */
export function checklistDe(persona, estado) {
  const { conjuntos, subtipos, documentos, exoneraciones, parametros } = estado
  const reqs = requisitosDe(persona, conjuntos)
  return reqs.map(r => {
    const subtipo = subtipos.find(s => s.id === r.subtipoId)
    const doc = documentos.find(d => d.colaboradorId === persona.id && d.subtipoId === r.subtipoId && !d.eliminado)
    const exo = exoneraciones.find(e => e.colaboradorId === persona.id && e.subtipoId === r.subtipoId)
    const limite = persona.ingreso ? iso(new Date(aFecha(persona.ingreso).getTime() + r.plazoDias * 86400000)) : null
    const exigible = !limite || diasHasta(limite) < 0
    let est = exo ? 'exonerado' : estadoVersion(versionActual(doc), subtipo, parametros)
    return { requisito: r, subtipo, documento: doc || null, exoneracion: exo || null, estado: est, limite, exigible }
  })
}

/* EL PORCENTAJE (RF-14, RN-07): cuenta sólo los obligatorios que ya son exigibles, y saca a los
   exonerados de la cuenta. Sin requisitos no hay porcentaje —`null`, no 100 %—: decir «al día»
   de alguien a quien nadie le pidió nada es la mentira que el módulo existe para evitar. */
export function completitud(checklist) {
  const cuentan = checklist.filter(i => i.requisito.obligatorio && i.estado !== 'exonerado' && (i.exigible || ESTADOS[i.estado].cumple))
  if (!cuentan.length) return { pct: null, cumplidos: 0, total: 0 }
  const cumplidos = cuentan.filter(i => ESTADOS[i.estado].cumple).length
  return { pct: Math.round((cumplidos / cuentan.length) * 100), cumplidos, total: cuentan.length }
}

/* ── LAS VARIABLES DE LAS PLANTILLAS (RF-44) ──────────────────────────────
   El catálogo lo publica el sistema y se elige de una lista: nadie escribe
   `{{colaborador.nombre2}}` de memoria. Agrupadas por origen, porque «de dónde sale este dato»
   es lo que quien arma la plantilla necesita saber para confiar en él. */
export const VARIABLES = [
  { grupo: 'Colaborador', origen: 'Gestión de Personas', items: [
    { clave: 'colaborador.nombre', label: 'Nombre completo' },
    { clave: 'colaborador.documento', label: 'Número de documento' },
    { clave: 'colaborador.codigo', label: 'Código de colaborador' },
    { clave: 'colaborador.correo', label: 'Correo corporativo' },
  ]},
  { grupo: 'Puesto', origen: 'Organigrama', items: [
    { clave: 'cargo.nombre', label: 'Cargo' },
    { clave: 'unidad.nombre', label: 'Área o unidad' },
    { clave: 'sucursal.nombre', label: 'Sucursal' },
    { clave: 'sucursal.ciudad', label: 'Ciudad de la sucursal' },
  ]},
  { grupo: 'Relación laboral', origen: 'Gestión de Personas y Planillas', items: [
    { clave: 'ingreso.fecha', label: 'Fecha de ingreso' },
    { clave: 'antiguedad', label: 'Antigüedad' },
    { clave: 'salario.basico', label: 'Haber básico' },
    { clave: 'contrato.modalidad', label: 'Modalidad del contrato' },
    { clave: 'contrato.fecha_inicio', label: 'Inicio del contrato' },
    { clave: 'contrato.fecha_fin', label: 'Fin del contrato' },
  ]},
  { grupo: 'Empresa', origen: 'Organización', items: [
    { clave: 'empresa.nombre', label: 'Razón social' },
    { clave: 'empresa.nit', label: 'NIT' },
    { clave: 'empresa.representante', label: 'Representante legal' },
  ]},
  { grupo: 'Documento', origen: 'Este módulo', items: [
    { clave: 'documento.numero', label: 'Número (CITE)' },
    { clave: 'documento.fecha', label: 'Fecha de emisión' },
    { clave: 'memo.observaciones', label: 'Observaciones del memorándum' },
  ]},
]
export const CLAVES_VARIABLES = VARIABLES.flatMap(g => g.items.map(i => i.clave))

export const MODALIDADES = {
  indefinido: 'Indefinido',
  plazo_fijo: 'Plazo fijo',
  por_obra: 'Por obra o servicio',
  eventual: 'Eventual',
}

/* Los datos de una persona, resueltos para una plantilla. Es lo que se CONGELA al emitir: el
   certificado dice el cargo de ese día aunque mañana cambie (RN-16, 6.3). */
export function datosPara(persona, { empresa, contrato, numero, observaciones } = {}) {
  const sal = salarioDemoDe(persona)
  return {
    'colaborador.nombre': persona?.name || '',
    'colaborador.documento': persona?.documento || '',
    'colaborador.codigo': persona?.codigo || '',
    'colaborador.correo': persona?.email || '',
    'cargo.nombre': persona?.cargo || '',
    'unidad.nombre': persona?.depto || '',
    'sucursal.nombre': persona?.sedeNombre || '',
    'sucursal.ciudad': persona?.sedeCiudad || '',
    'ingreso.fecha': fechaLarga(persona?.ingreso),
    antiguedad: antiguedad(persona?.ingreso),
    'salario.basico': `Bs ${sal.toLocaleString('es-BO')}`,
    // En minúscula: va a mitad de frase —«es a plazo fijo»—, no como título.
    'contrato.modalidad': contrato ? MODALIDADES[contrato.modalidad].toLowerCase() : '',
    'contrato.fecha_inicio': contrato ? fechaLarga(contrato.inicio) : '',
    'contrato.fecha_fin': contrato?.fin ? fechaLarga(contrato.fin) : '',
    'empresa.nombre': empresa?.razonSocial || empresa?.nombre || 'FarmaVida S.A.',
    'empresa.nit': empresa?.nit || '1023456027',
    'empresa.representante': empresa?.representante || 'Ricardo Ballivián',
    'documento.numero': numero || '(se asigna al emitir)',
    'documento.fecha': fechaLarga(iso(hoy())),
    'memo.observaciones': observaciones || '',
  }
}

/* ── RELLENAR UNA PLANTILLA (RF-44, RF-46, RF-48) ─────────────────────────
   `{{clave}}` se reemplaza por su dato. `{{#si clave}} … {{/si}}` es un bloque condicional: sale
   sólo si el dato existe —la cláusula de plazo fijo no aparece en un indefinido—.
   `validarPlantilla` es lo que bloquea publicar: una variable que no está en el catálogo o un
   bloque sin cerrar se señalan con su texto. */
const RX_VAR = /\{\{\s*([a-z0-9_.]+)\s*\}\}/g
const RX_SI = /\{\{#si\s+([a-z0-9_.]+)\s*\}\}([\s\S]*?)\{\{\/si\}\}/g

export function rellenar(texto, datos) {
  return String(texto || '')
    .replace(RX_SI, (_, clave, cuerpo) => (datos[clave] ? cuerpo : ''))
    .replace(RX_VAR, (_, clave) => (datos[clave] !== undefined ? datos[clave] : `{{${clave}}}`))
}

export function validarPlantilla(texto, datos) {
  const errores = []
  const t = String(texto || '')
  const abiertos = (t.match(/\{\{#si/g) || []).length
  const cerrados = (t.match(/\{\{\/si\}\}/g) || []).length
  if (abiertos !== cerrados) errores.push({ tipo: 'bloque', texto: 'Hay un bloque {{#si …}} sin su {{/si}}' })
  for (const m of t.matchAll(/\{\{\s*#?si\s+([a-z0-9_.]+)|\{\{\s*([a-z0-9_.]+)\s*\}\}/g)) {
    const clave = m[1] || m[2]
    if (!CLAVES_VARIABLES.includes(clave)) errores.push({ tipo: 'inexistente', clave, texto: `La variable {{${clave}}} no existe en el catálogo` })
    else if (datos && !m[1] && !String(datos[clave] ?? '').trim() && !['memo.observaciones', 'contrato.fecha_fin'].includes(clave)) {
      errores.push({ tipo: 'vacia', clave, texto: `{{${clave}}} queda vacía con los datos de esta persona` })
    }
  }
  return errores
}

/* ── LA BIBLIOTECA DE MODELOS (4.6) ───────────────────────────────────────
   Una sola, con tres categorías, en vez de las tres pantallas casi iguales del Salar. Los
   modelos `base` son de fábrica: se clonan para adaptarlos y el original no se toca (RF-50). */
export const CATEGORIAS = {
  certificado: { label: 'Certificado', plural: 'Certificados' },
  memorandum: { label: 'Memorándum', plural: 'Memorándums' },
  contrato: { label: 'Contrato', plural: 'Contratos' },
}

const CERT_TRABAJO = `CERTIFICADO DE TRABAJO

{{documento.numero}}

La empresa {{empresa.nombre}}, con NIT {{empresa.nit}}, certifica que {{colaborador.nombre}}, con documento de identidad {{colaborador.documento}}, trabaja en esta empresa desde el {{ingreso.fecha}}, desempeñando el cargo de {{cargo.nombre}} en el área de {{unidad.nombre}}, en {{sucursal.nombre}}.

Se extiende el presente certificado a solicitud del interesado para los fines que viera conveniente.

{{sucursal.ciudad}}, {{documento.fecha}}

{{empresa.representante}}
Representante legal`

const CERT_SUELDO = `CERTIFICADO DE TRABAJO Y SALARIO

{{documento.numero}}

La empresa {{empresa.nombre}}, con NIT {{empresa.nit}}, certifica que {{colaborador.nombre}}, con documento de identidad {{colaborador.documento}}, presta servicios en esta empresa desde el {{ingreso.fecha}} —una antigüedad de {{antiguedad}}—, en el cargo de {{cargo.nombre}}, con un haber básico mensual de {{salario.basico}}.

{{#si contrato.fecha_fin}}Su contrato actual es a {{contrato.modalidad}} y vence el {{contrato.fecha_fin}}.
{{/si}}
Se extiende el presente a solicitud del interesado.

{{sucursal.ciudad}}, {{documento.fecha}}

{{empresa.representante}}
Representante legal`

const MEMO_FELICITACION = `MEMORÁNDUM {{documento.numero}}

A: {{colaborador.nombre}} — {{cargo.nombre}}
DE: Gerencia de Recursos Humanos
FECHA: {{documento.fecha}}
REF.: Felicitación

Por medio del presente, la empresa {{empresa.nombre}} desea expresarle su reconocimiento por el compromiso demostrado en el área de {{unidad.nombre}}.

{{memo.observaciones}}

Atentamente,
{{empresa.representante}}`

const MEMO_LLAMADA = `MEMORÁNDUM {{documento.numero}}

A: {{colaborador.nombre}} — {{cargo.nombre}}
DE: Gerencia de Recursos Humanos
FECHA: {{documento.fecha}}
REF.: Llamada de atención

Por medio del presente se le hace notar lo siguiente:

{{memo.observaciones}}

Se le recuerda que el Reglamento Interno de Trabajo es de cumplimiento obligatorio. El presente se archiva en su expediente.

{{empresa.representante}}`

const CONTRATO_BASE = `CONTRATO INDIVIDUAL DE TRABAJO

{{documento.numero}}

Conste por el presente documento el contrato de trabajo que celebran, de una parte, {{empresa.nombre}}, con NIT {{empresa.nit}}, representada por {{empresa.representante}}, y de la otra {{colaborador.nombre}}, con documento de identidad {{colaborador.documento}}.

PRIMERA (Objeto). El trabajador prestará servicios en el cargo de {{cargo.nombre}}, en el área de {{unidad.nombre}}, en {{sucursal.nombre}}.

SEGUNDA (Modalidad y plazo). El presente contrato es de modalidad {{contrato.modalidad}} y rige desde el {{contrato.fecha_inicio}}.
{{#si contrato.fecha_fin}}Concluirá el {{contrato.fecha_fin}}, sin necesidad de aviso previo.
{{/si}}
TERCERA (Remuneración). El trabajador percibirá un haber básico mensual de {{salario.basico}}.

En señal de conformidad firman las partes en {{sucursal.ciudad}}, {{documento.fecha}}.`

const ADENDA_BASE = `ADENDA AL CONTRATO DE TRABAJO

{{documento.numero}}

Entre {{empresa.nombre}} y {{colaborador.nombre}} se acuerda modificar el contrato de trabajo vigente en lo siguiente:

ÚNICA. Se amplía el plazo del contrato, que regirá desde el {{contrato.fecha_inicio}}{{#si contrato.fecha_fin}} hasta el {{contrato.fecha_fin}}{{/si}}.

Las demás cláusulas se mantienen sin modificación.

{{sucursal.ciudad}}, {{documento.fecha}}`

const M = (id, nombre, categoria, texto, extra = {}) => ({
  id, nombre, categoria,
  disponibleSolicitud: false,
  circuito: 'sin_aprobacion', // 'sin_aprobacion' | 'una' | 'dos'
  aprobador: 'Responsable de RR.HH.',
  sensible: false,
  estado: 'activo',
  base: true,
  versiones: [{ v: 1, texto, estado: 'publicada', publicadaPor: 'Sistema', fecha: dias(-400) }],
  ...extra,
})

export const MODELOS_SEED = [
  M('m-cert-trabajo', 'Certificado de trabajo', 'certificado', CERT_TRABAJO, { disponibleSolicitud: true }),
  M('m-cert-sueldo', 'Certificado de trabajo con sueldo', 'certificado', CERT_SUELDO, { disponibleSolicitud: true, circuito: 'una' }),
  M('m-memo-felicitacion', 'Memorándum de felicitación', 'memorandum', MEMO_FELICITACION),
  M('m-memo-llamada', 'Memorándum de llamada de atención', 'memorandum', MEMO_LLAMADA, { sensible: true }),
  M('m-contrato-indef', 'Contrato indefinido', 'contrato', CONTRATO_BASE),
  M('m-contrato-plazo', 'Contrato a plazo fijo', 'contrato', CONTRATO_BASE),
  M('m-adenda', 'Adenda de ampliación de plazo', 'contrato', ADENDA_BASE),
]

/* El número correlativo (RF-07, RF-53, RN-15): por categoría y gestión, y nunca se reutiliza,
   ni siquiera si el documento se anula. Se calcula contando los ya emitidos de esa serie. */
export function siguienteNumero(categoria, emitidos, parametros, contratos = []) {
  const cfg = parametros.numeracion[categoria]
  const gestion = hoy().getFullYear()
  const deSerie = categoria === 'contrato'
    ? contratos.filter(c => c.numero)
    : emitidos.filter(e => e.categoria === categoria)
  const mismos = cfg.reinicioAnual ? deSerie.filter(e => e.gestion === gestion) : deSerie
  const n = mismos.length + 1
  return {
    n, gestion,
    texto: cfg.formato.replace('{prefijo}', cfg.prefijo).replace('{n}', String(n).padStart(cfg.digitos, '0')).replace('{gestion}', gestion),
  }
}

/* ── EL ESTADO DE UN CONTRATO (RF-64) ─────────────────────────────────────
   Se calcula de las fechas; sólo «finalizado» y «reemplazado» se guardan, porque son decisiones
   de una persona y no consecuencias del calendario. */
export const ESTADOS_CONTRATO = {
  en_elaboracion: { label: 'En elaboración', tono: 'gris' },
  vigente: { label: 'Vigente', tono: 'verde' },
  por_vencer: { label: 'Por vencer', tono: 'ambar' },
  vencido: { label: 'Vencido', tono: 'rojo' },
  finalizado: { label: 'Finalizado', tono: 'gris' },
  reemplazado: { label: 'Reemplazado', tono: 'violeta' },
}
/* EL FIN QUE DE VERDAD RIGE. Una adenda de ampliación corre la fecha de fin del contrato que
   modifica; el contrato conserva la suya escrita —es lo que se firmó— pero vale la de la última
   adenda. Sin esto, un contrato renovado salía «vencido» el día de su fin original en la bandeja
   y en el expediente. Por eso `estadoContrato` recibe la lista: sin ella no ve las adendas. */
export function finEfectivo(contrato, contratos = []) {
  const adendas = contratos.filter(a => a.origenId === contrato.id && !a.finalizado && !a.reemplazado)
  if (!adendas.length) return contrato.fin
  if (adendas.some(a => !a.fin)) return null
  return adendas.reduce((max, a) => (a.fin > max ? a.fin : max), contrato.fin || '')
}

export function estadoContrato(c, parametros, contratos = []) {
  if (c.finalizado) return 'finalizado'
  if (c.reemplazado) return 'reemplazado'
  if (!c.versiones?.length) return 'en_elaboracion'
  const fin = finEfectivo(c, contratos)
  if (fin) {
    const d = diasHasta(fin)
    if (d < 0) return 'vencido'
    if (d <= parametros.avisoContratoDias) return 'por_vencer'
  }
  return 'vigente'
}

export const ESTADOS_EMITIDO = {
  pendiente: { label: 'Pendiente de aprobación', tono: 'ambar' },
  generado: { label: 'Generado', tono: 'azul' },
  entregado: { label: 'Entregado', tono: 'verde' },
  acusado: { label: 'Acusado', tono: 'verde' },
  anulado: { label: 'Anulado', tono: 'gris' },
}

/* ── LOS DATOS DE EJEMPLO ─────────────────────────────────────────────────
   Se reparten con una semilla fija por persona y subtipo —no con `Math.random`— para que la
   demo diga lo mismo cada vez que se recarga: si Sofía tiene el carnet vencido en la reunión
   del martes, lo tiene el miércoles. La mezcla apunta a lo que se ve en una empresa real a
   medio ordenar: dos tercios al día y el resto repartido entre lo que el módulo tiene que
   saber señalar. */
const semilla = (a, b) => {
  let h = 2166136261
  for (const ch of `${a}|${b}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) }
  return ((h >>> 0) % 1000) / 1000
}

const NOMBRES_RAROS = ['IMG_20240312_101522.jpg', 'escaneo.pdf', 'doc (3).pdf', '7af3f8e1-d176-4fbd.jpg', 'WhatsApp Image 2025-02-11.jpeg']

export function normalizarNombre(persona, subtipo, fecha, formato) {
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${persona.codigo}_${slug(subtipo.nombre)}_${fecha}.${formato}`
}

export function documentosSeed(personas, conjuntos, subtipos) {
  const docs = []
  let id = 1
  for (const p of personas) {
    if (p.status === 'desvinculado') continue
    const reqs = requisitosDe(p, conjuntos)
    const extras = semilla(p.id, 'curso') > 0.55 ? [{ subtipoId: 's-curso' }] : []
    for (const r of [...reqs, ...extras]) {
      const sub = subtipos.find(s => s.id === r.subtipoId)
      const x = semilla(p.id, r.subtipoId)
      // 12 % faltante: no se crea documento.
      if (x < 0.12) continue
      /* La edad del documento no pasa del 70 % de su vigencia: un certificado de antecedentes dura
         seis meses, y sembrado con año y medio de antigüedad salía vencido casi siempre. Los
         vencidos y por vencer se ponen a propósito, abajo, en la proporción que se quiere ver. */
      const tope = sub.vence ? sub.vigenciaMeses * 30 * 0.7 : 560
      let revision = 'aprobado', vencimiento = null, emision = dias(-Math.round(Math.min(60 + x * 500, tope))), motivo = null, canal = 'web'
      if (sub.vence) vencimiento = sumarMeses(emision, sub.vigenciaMeses)
      if (x < 0.18) { revision = 'pendiente'; canal = 'app'; emision = dias(-Math.round(3 + x * 20)); if (sub.vence) vencimiento = sumarMeses(emision, sub.vigenciaMeses) }
      else if (x < 0.21) { revision = 'rechazado'; canal = 'app'; motivo = 'La foto está cortada: no se lee el número de documento.' }
      else if (sub.vence && x < 0.27) vencimiento = dias(-Math.round(5 + x * 60)) // vencido
      else if (sub.vence && x < 0.4) vencimiento = dias(Math.round(4 + (x - 0.27) * 400)) // por vencer
      const formato = x > 0.5 ? 'pdf' : 'jpg'
      const subido = revision === 'pendiente' ? p.name : (x > 0.6 ? 'Paola Arce' : 'Daniela Flores')
      docs.push({
        id: `d-${id++}`,
        colaboradorId: p.id,
        subtipoId: r.subtipoId,
        versiones: [{
          v: 1,
          archivo: {
            nombre: normalizarNombre(p, sub, emision, formato),
            original: NOMBRES_RAROS[Math.floor(x * NOMBRES_RAROS.length)],
            formato,
            tamanoKB: Math.round(180 + x * 2400),
            huella: Math.floor(x * 1e12).toString(16).padStart(10, '0'),
          },
          emision,
          vencimiento,
          subidoPor: subido,
          canal,
          fecha: revision === 'pendiente' ? emision : dias(-Math.round(20 + x * 300)),
          revision,
          motivoRechazo: motivo,
          info: '',
        }],
      })
    }
  }
  return docs
}

/* Contratos: indefinido para quien lleva más de un año, plazo fijo para los recientes. Algunos
   plazos fijos terminan dentro de los 45 días de aviso, para que la alerta de fin de contrato
   (RF-40) tenga qué mostrar. Dos tienen adenda encadenada (RF-62). */
export function contratosSeed(personas) {
  const cs = []
  let id = 1, n = 1
  for (const p of personas) {
    if (p.status === 'desvinculado' || !p.ingreso) continue
    const x = semilla(p.id, 'contrato')
    const reciente = diasHasta(p.ingreso) > -400
    const modalidad = reciente ? 'plazo_fijo' : 'indefinido'
    const fin = modalidad === 'plazo_fijo' ? (x < 0.14 ? dias(Math.round(8 + x * 250)) : sumarMeses(p.ingreso, 12)) : null
    const base = {
      id: `k-${id++}`, colaboradorId: p.id, tipo: 'contrato', origenId: null,
      modalidad, inicio: p.ingreso, fin,
      modeloId: modalidad === 'indefinido' ? 'm-contrato-indef' : 'm-contrato-plazo',
      numero: `CTR-${String(n++).padStart(5, '0')}/${aFecha(p.ingreso).getFullYear()}`,
      gestion: aFecha(p.ingreso).getFullYear(),
      comentarios: '',
      versiones: [
        { v: 1, tipo: 'generado', fecha: p.ingreso, por: 'Paola Arce', motivo: 'Generado desde plantilla', archivo: `${p.codigo}_contrato_${p.ingreso}.pdf` },
        ...(x > 0.3 ? [{ v: 2, tipo: 'firmado', fecha: dias(Math.min(-1, diasHasta(p.ingreso) + 3)), por: 'Paola Arce', motivo: 'Se cargó el firmado', archivo: `${p.codigo}_contrato-firmado_${p.ingreso}.pdf` }] : []),
      ],
    }
    cs.push(base)
    if (modalidad === 'plazo_fijo' && x > 0.8) {
      cs.push({
        ...base, id: `k-${id++}`, tipo: 'adenda', origenId: base.id,
        inicio: fin ? sumarMeses(fin, -3) : dias(-30), fin,
        modeloId: 'm-adenda', numero: `CTR-${String(n++).padStart(5, '0')}/${hoy().getFullYear()}`, gestion: hoy().getFullYear(),
        versiones: [{ v: 1, tipo: 'generado', fecha: dias(-30), por: 'Paola Arce', motivo: 'Adenda de ampliación', archivo: `${p.codigo}_adenda_${dias(-30)}.pdf` }],
      })
    }
  }
  return cs
}

export function emitidosSeed(personas) {
  const g = hoy().getFullYear()
  const P = id => personas.find(p => p.id === id)
  const e = (id, modeloId, categoria, pid, n, dia, estado, extra = {}) => {
    const p = P(pid); if (!p) return null
    return {
      id, modeloId, categoria, colaboradorId: pid, versionPlantilla: 1,
      numero: `${categoria === 'certificado' ? 'CERT' : 'MEM'}-${String(n).padStart(4, '0')}/${g}`, n, gestion: g,
      fecha: dias(dia), emitidoPor: 'Paola Arce', estado,
      datos: datosPara(p), observaciones: extra.observaciones || '',
      entregas: estado === 'generado' ? [] : [{ canal: 'app', fecha: dias(dia), por: 'Paola Arce' }],
      acuse: estado === 'acusado' ? { fecha: dias(dia + 1), dispositivo: 'Android · app Trabajito' } : null,
      ...extra,
    }
  }
  return [
    e('e-1', 'm-cert-trabajo', 'certificado', 1, 1, -80, 'entregado'),
    e('e-2', 'm-cert-sueldo', 'certificado', 10, 2, -41, 'entregado'),
    e('e-3', 'm-cert-trabajo', 'certificado', 13, 3, -12, 'generado'),
    e('e-4', 'm-memo-felicitacion', 'memorandum', 20, 1, -60, 'acusado', { observaciones: 'Por el tablero de indicadores de ventas entregado antes de plazo.' }),
    e('e-5', 'm-memo-llamada', 'memorandum', 4, 2, -18, 'entregado', { observaciones: 'Tres atrasos injustificados en el mes de agosto.' }),
    e('e-6', 'm-memo-felicitacion', 'memorandum', 11, 3, -5, 'acusado', { observaciones: 'Por la campaña de aniversario.' }),
  ].filter(Boolean)
}

/* La bitácora de ejemplo arranca con lo que ya pasó en los documentos sembrados, para que la
   auditoría no esté vacía el primer día. */
export function bitacoraSeed(documentos, emitidos) {
  const ev = []
  let id = 1
  for (const d of documentos.slice(0, 60)) {
    const v = d.versiones[0]
    ev.push({ id: `b-${id++}`, fecha: v.fecha, usuario: v.subidoPor, accion: 'alta', entidad: 'documento', entidadId: d.id, colaboradorId: d.colaboradorId, detalle: `Cargó ${v.archivo.nombre} (${v.canal})` })
    if (v.revision === 'rechazado') ev.push({ id: `b-${id++}`, fecha: v.fecha, usuario: 'Paola Arce', accion: 'rechazo', entidad: 'documento', entidadId: d.id, colaboradorId: d.colaboradorId, detalle: v.motivoRechazo })
  }
  for (const e of emitidos) ev.push({ id: `b-${id++}`, fecha: e.fecha, usuario: e.emitidoPor, accion: 'emision', entidad: 'emitido', entidadId: e.id, colaboradorId: e.colaboradorId, detalle: `Emitió ${e.numero}` })
  return ev.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

export const ACCIONES_BITACORA = {
  alta: 'Carga', edicion: 'Edición', aprobacion: 'Aprobación', rechazo: 'Rechazo', emision: 'Emisión',
  entrega: 'Entrega', acuse: 'Acuse', descarga: 'Descarga', reemplazo: 'Reemplazo', baja: 'Baja',
  exoneracion: 'Exoneración', pedido: 'Pedido', anulacion: 'Anulación', configuracion: 'Configuración', lectura: 'Lectura confidencial',
}
