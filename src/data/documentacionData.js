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

import { miFichaDe } from './miFicha'

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

/* LA VISIBILIDAD: QUIÉN PUEDE CONSULTAR EL DOCUMENTO. Se llamó «sensibilidad» y se leía como un
   atributo técnico; lo que de verdad responde es quién lo ve, y por eso se dice así en pantalla.
   La clave interna (`sensibilidad`) se deja: la usan los datos guardados. */
export const SENSIBILIDAD = {
  general:      { label: 'General',      desc: 'RR.HH. y el colaborador. El jefe, si la empresa lo habilita' },
  restringido:  { label: 'Restringida',  desc: 'Solo RR.HH. y el colaborador' },
  confidencial: { label: 'Confidencial', desc: 'Solo con permiso explícito, y el colaborador sobre lo suyo. Cada acceso deja rastro (RF-90)' },
}

export const DESTINATARIOS = {
  colaborador: 'Colaborador',
  jefe: 'Jefe directo',
  rrhh: 'Responsable de RR.HH.',
}

/* ── LA TAXONOMÍA (4.1): LA DE LA FICHA DEL COLABORADOR ───────────────────
   DOCUMENTACIÓN NO INVENTA SUS PROPIAS CARPETAS. Los tipos son los grupos en que la ficha del
   colaborador (Gestión de Personas) ya ordena sus archivos —su sección «Archivos»—, con los mismos
   nombres y en el mismo orden. Tuvo seis tipos propios —educativos, Caja de Salud, vacunas,
   certificaciones, baja— que no salían de ningún módulo de la plataforma y no había cómo
   justificar: el módulo se adecua a los que ya están establecidos, no al revés.

   Lo que es de Documentación y de nadie más —los contratos, lo emitido, la papelera— no va acá:
   son carpetas que pone el expediente. Información Laboral no tiene adjuntos en la ficha; lo
   laboral del expediente son los contratos. Planillas traerá los suyos cuando exista. */
export const TIPOS_SEED = [
  { id: 't-personal', nombre: 'Información personal', activo: true, retencionAnios: 5 },
  { id: 't-perfil', nombre: 'Perfil profesional', activo: true, retencionAnios: 5 },
  { id: 't-recursos', nombre: 'Recursos y activos', activo: true, retencionAnios: 5 },
  { id: 't-agregados', nombre: 'Documentos agregados', activo: true, retencionAnios: 5 },
]

/* EL SUBTIPO ES DONDE SE CONFIGURA TODO: si admite varios, si el colaborador lo ve y lo sube, si
   vence y cuánto dura, qué formatos acepta, quién puede consultarlo y sus propios hitos de aviso.
   `persona` es el nombre en lenguaje de persona (propuesta 3): lo que ve el colaborador.

   YA NO HAY «¿NOTIFICA AL REGISTRAR?»: RR.HH. se entera siempre de lo que se carga o se cambia,
   y eso no se apaga (revisión del módulo, 2026).

   EL REQUISITO GENERAL VIVE EN EL SUBTIPO. `exigidoATodos` dice que se le pide a todo el personal,
   con `plazoDias` desde el ingreso. Lo que se le pide sólo a alguien se agrega en su expediente;
   ya no hay conjuntos por perfil que mantener aparte. */
const S = (id, tipoId, nombre, extra = {}) => ({
  id, tipoId, nombre,
  persona: extra.persona || nombre,
  codigoErp: extra.codigoErp || '',
  varios: false,
  visibleColab: true,
  editableColab: true,
  notificaVencer: !!extra.vigenciaMeses,
  vence: !!extra.vigenciaMeses,
  vigenciaMeses: null,
  formatos: ['pdf', 'jpg', 'png'],
  tamanoMaxMB: 10,
  sensibilidad: 'restringido',
  hitos: null, // null = usa los del parámetro general
  destinatarios: null,
  exigidoATodos: false,
  plazoDias: 30,
  activo: true,
  ...extra,
})

/* LOS SUBTIPOS SON LOS ARCHIVOS DE LA FICHA, uno por uno, con sus nombres. `campoFicha` dice de
   qué campo de la ficha sale cada uno —el archivo y, si los tiene, sus campos de emisión y
   vencimiento, que la ficha ya pide junto al adjunto—. Con eso el expediente LEE lo que se subió
   en la ficha y lo muestra en su carpeta: el mismo carnet no se carga dos veces.
   Las claves son las del estudio de la ficha (`camposPropuesta.js`, sección «Archivos»). */
const F = (archivo, emite, vence, nombre) => ({ archivo, emite, vence, nombre })
export const SUBTIPOS_SEED = [
  S('s-ci', 't-personal', 'Documento de identidad', { persona: 'Su documento de identidad', codigoErp: 'IP-01', campoFicha: F('1.17', '1.15', '1.16'), vigenciaMeses: 120, hitos: [60, 30], exigidoATodos: true, plazoDias: 0 }),
  S('s-ci2', 't-personal', 'Documento de identidad secundario', { persona: 'Su documento de identidad secundario', codigoErp: 'IP-02', campoFicha: F('1.20h', '1.20e', '1.20f'), vigenciaMeses: 120 }),
  S('s-nacimiento', 't-personal', 'Certificado de nacimiento', { persona: 'Su certificado de nacimiento', codigoErp: 'IP-03', campoFicha: F('1.21b'), exigidoATodos: true, plazoDias: 15 }),
  S('s-croquis', 't-personal', 'Croquis del domicilio', { persona: 'El croquis de su domicilio', codigoErp: 'IP-04', campoFicha: F('1.53'), exigidoATodos: true, plazoDias: 30 }),
  S('s-licencia', 't-personal', 'Licencia o certificación', { persona: 'Su licencia o certificación', codigoErp: 'IP-05', campoFicha: F('1.79', '1.76', '1.77'), vigenciaMeses: 60, hitos: [60, 30, 7], destinatarios: ['colaborador', 'jefe'], varios: true }),
  S('s-garante', 't-personal', 'Documento de identidad del garante', { persona: 'El documento de su garante', codigoErp: 'IP-06', campoFicha: F('2.40e'), editableColab: false }),
  S('s-garantia', 't-personal', 'Respaldo de la garantía', { persona: 'El respaldo de su garantía', codigoErp: 'IP-07', campoFicha: F('2.46'), editableColab: false }),
  S('s-foto', 't-personal', 'Fotografía del colaborador', { persona: 'Su fotografía', codigoErp: 'IP-08', campoFicha: F('1.9'), formatos: ['jpg', 'png'], sensibilidad: 'general' }),
  S('s-titulo', 't-perfil', 'Título o diploma', { persona: 'Su título o diploma', codigoErp: 'PP-01', campoFicha: F('pf.11'), sensibilidad: 'general', varios: true }),
  S('s-certprof', 't-perfil', 'Certificación profesional', { persona: 'Su certificación profesional', codigoErp: 'PP-02', campoFicha: F('pf.27', 'pf.24', 'pf.25'), sensibilidad: 'general', vigenciaMeses: 24, varios: true }),
  S('s-acta-equipo', 't-recursos', 'Acta de entrega de equipo', { persona: 'El acta de entrega de su equipo', codigoErp: 'RA-01', campoFicha: F('ra.e12', 'ra.e8'), editableColab: false, varios: true }),
  S('s-acta-uniforme', 't-recursos', 'Acta de entrega de uniforme', { persona: 'El acta de entrega de su uniforme', codigoErp: 'RA-02', campoFicha: F('ra.u9', 'ra.u4'), editableColab: false, varios: true }),
  S('s-acta-epp', 't-recursos', 'Acta de entrega de EPP', { persona: 'El acta de entrega de su equipo de protección', codigoErp: 'RA-03', campoFicha: F('ra.p9', 'ra.p5', 'ra.p6'), editableColab: false, vigenciaMeses: 12, varios: true }),
  S('s-agregado', 't-agregados', 'Documento agregado', { persona: 'Un documento agregado por RR.HH.', codigoErp: 'DA-01', campoFicha: F('ex.4', null, null, 'ex.2'), editableColab: false, varios: true }),
]

/* ── LO QUE YA ESTÁ EN LA FICHA ───────────────────────────────────────────
   Cada archivo de la ficha que corresponde a un subtipo, como un documento más del expediente:
   aprobado —lo registró RR.HH. o el colaborador en su perfil—, con las fechas que la ficha
   guardó junto a él. Se lee y no se copia: la ficha sigue siendo la dueña del archivo, y si allá
   cambia, acá cambia. Un bloque repetido de la ficha (dos licencias, tres actas) trae sus
   copias con `#n`, y cada una es un documento. `origen: 'ficha'` es lo que el expediente mira
   para no ofrecer lo que sobre un archivo ajeno no se puede hacer, como mandarlo a la papelera. */
const extension = nombre => (String(nombre || '').split('.').pop() || '').toLowerCase()
export function documentosDeFicha(persona, subtipos) {
  const f = persona?.ficha
  if (!f) return []
  const out = []
  for (const s of subtipos) {
    const c = s.campoFicha
    if (!c?.archivo || !s.activo) continue
    for (const k of Object.keys(f)) {
      if (k.split('#')[0] !== c.archivo || !f[k]?.nombre) continue
      const copia = k.includes('#') ? `#${k.split('#')[1]}` : ''
      const a = f[k]
      const emision = (c.emite && f[c.emite + copia]) || null
      out.push({
        id: `f-${persona.id}-${k}`,
        colaboradorId: persona.id,
        subtipoId: s.id,
        origen: 'ficha',
        versiones: [{
          v: 1,
          archivo: { nombre: a.nombre, original: a.nombre, clave: a.clave || null, formato: extension(a.nombre), tipoMime: a.tipo, tamanoKB: a.peso ? Math.round(a.peso / 1024) : null },
          emision,
          vencimiento: (c.vence && f[c.vence + copia]) || null,
          subidoPor: a.origen || 'Ficha del colaborador',
          canal: 'ficha',
          fecha: emision || persona.ingreso || iso(hoy()),
          revision: 'aprobado',
          motivoRechazo: null,
          info: (c.nombre && f[c.nombre + copia]) || '',
        }],
      })
    }
  }
  return out
}

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
  plazoSolicitudDias: 2, // días hábiles para responder una solicitud; se configura (16 oct 2026)
  papeleraDias: 30, // RF-89
  numeracion: {
    certificado: { prefijo: 'CERT', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: true, digitos: 4 },
    memorandum: { prefijo: 'MEM', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: true, digitos: 4 },
    contrato: { prefijo: 'CTR', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: false, digitos: 5 },
    otro: { prefijo: 'DOC', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: true, digitos: 4 },
  },
}

/* ── LA SEDE DE UNA PERSONA ───────────────────────────────────────────────
   La sede sale del PUESTO que ocupa en el organigrama (`sedesDe`), no de un campo suyo. Pero el
   organigrama de la demo arranca vacío, y un módulo cuyo filtro principal es la sucursal sin
   una sola sucursal que filtrar no se puede mostrar. Esta tabla es el respaldo DE LA DEMO para
   quien no ocupa ningún cuadro, y se nota que lo es: el día que el organigrama esté dibujado,
   manda él y esta tabla no se lee. */
const SEDE_DEMO = { 1002: 'central', 1004: 'lpz', 1: 'central', 2: 'lpz', 3: 'central', 4: 'central', 5: 'lpz', 6: 'central', 7: 'cbb', 8: 'mtr', 9: 'central', 10: 'central', 11: 'lpz', 12: 'lpz', 13: 'cbb', 14: 'central', 15: 'central', 16: 'mtr', 17: 'central', 18: 'cbb', 19: 'lpz', 20: 'central', 21: 'cbb', 22: 'mtr', 23: 'central', 24: 'lpz', 25: 'lpz', 26: 'cbb', 27: 'lpz', 28: 'central', 29: 'central' }
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
   Dos fuentes y nada más: lo que el subtipo exige a todo el personal y lo que RR.HH. le agregó a
   esta persona en su expediente. Ya no hay conjuntos por perfil: eran una segunda configuración
   que había que mantener aparte para decir lo que el expediente ya puede decir solo.
   Si las dos fuentes piden lo mismo, gana lo más exigente, y la persona no tiene el mismo carnet
   dos veces en su lista. `origen` dice de dónde salió: el general no se quita desde un expediente
   (se exonera); el personal, sí. */
export function requisitosDe(persona, { subtipos = [], requisitos = [] } = {}) {
  const porSubtipo = new Map()
  for (const s of subtipos) {
    if (!s.activo || !s.exigidoATodos) continue
    porSubtipo.set(s.id, { subtipoId: s.id, obligatorio: true, plazoDias: Number(s.plazoDias) || 0, exigeVigencia: !!s.vence, origen: 'general' })
  }
  for (const r of requisitos) {
    if (r.colaboradorId !== persona.id) continue
    const ya = porSubtipo.get(r.subtipoId)
    porSubtipo.set(r.subtipoId, ya
      ? { ...ya, obligatorio: ya.obligatorio || r.obligatorio, plazoDias: Math.min(ya.plazoDias, Number(r.plazoDias) || 0) }
      : { subtipoId: r.subtipoId, obligatorio: r.obligatorio, plazoDias: Number(r.plazoDias) || 0, exigeVigencia: !!r.exigeVigencia, origen: 'personal', por: r.por, fecha: r.fecha })
  }
  return [...porSubtipo.values()]
}

/* LOS REQUISITOS PERSONALES DE LA DEMO. Antes salían de perfiles —operaciones pide licencia, los
   profesionales su título—; ahora se escriben persona por persona, que es como se ven en el
   expediente. Se siembran una vez desde esos mismos criterios para que la demo arranque con la
   misma mezcla que tenía. */
const PERFILES_DEMO = [
  { areas: ['Operaciones'], requisitos: [['s-licencia', true, 30], ['s-acta-epp', true, 15]] },
  { areas: ['Tecnología', 'Finanzas', 'Recursos Humanos', 'Dirección General'], requisitos: [['s-titulo', true, 60], ['s-certprof', false, 90], ['s-acta-equipo', true, 15]] },
  { areas: ['Ventas', 'Marketing'], requisitos: [['s-titulo', true, 60], ['s-licencia', false, 60]] },
]
export function requisitosSeed(personas) {
  const out = []
  for (const p of personas) {
    for (const perfil of PERFILES_DEMO) {
      if (!perfil.areas.includes(p.depto)) continue
      for (const [subtipoId, obligatorio, plazoDias] of perfil.requisitos) {
        if (out.some(r => r.colaboradorId === p.id && r.subtipoId === subtipoId)) continue
        out.push({ colaboradorId: p.id, subtipoId, obligatorio, plazoDias, exigeVigencia: false, por: 'Paola Arce', fecha: dias(-280) })
      }
    }
  }
  return out
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
  const { subtipos, documentos, exoneraciones, parametros } = estado
  const reqs = requisitosDe(persona, estado)
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
    { clave: 'unidad.nombre', label: 'Unidad organizacional' },
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
    { clave: 'memo.observaciones', label: 'Texto que se escribe al enviar' },
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
   Una sola, en vez de las tres pantallas casi iguales del Salar. Los modelos `base` son de
   fábrica: se clonan para adaptarlos y el original no se toca (RF-50).
   «OTRO DOCUMENTO» es la puerta para lo que no es certificado, memorándum ni contrato —una carta
   de recomendación, una constancia de vacaciones—: se emite igual que un certificado, con su
   propia numeración. */
export const CATEGORIAS = {
  certificado: { label: 'Certificado', plural: 'Certificados', color: '#00B876' },
  memorandum: { label: 'Memorándum', plural: 'Memorándums', color: '#F59E0B' },
  contrato: { label: 'Contrato', plural: 'Contratos', color: '#3B82F6' },
  otro: { label: 'Otro documento', plural: 'Otros documentos', color: '#64748B' },
}

/* LOS TIPOS PROPIOS (15 oct 2026). En pantalla «Tipo», no «Categoría». Además de los cuatro de
   fábrica, RR.HH. crea los suyos —«Carta de recomendación»— desde el editor de plantillas: se
   guardan en `parametros.tiposPropios`, con su sigla en `parametros.numeracion`, y se emiten como
   «otro documento» pero con su propia serie. Todo lo que lista tipos los lee de acá. */
export const COLORES_TIPO = ['#EC4899', '#8B5CF6', '#14B8A6', '#EF4444', '#0EA5E9', '#A16207']
/* Las carpetas «De RR.HH.» de la app del colaborador: una por tipo, sin contratos (tienen la suya). */
export const carpetasRecibidas = parametros => [
  ['certificado', 'Certificados'], ['memorandum', 'Memorándums'],
  ...(parametros?.tiposPropios || []).map(t => [t.key, t.plural || t.label]),
  ['otro', 'Otros'],
]
export const carpetaRecibida = (e, parametros) => (['certificado', 'memorandum'].includes(e.categoria) || (parametros?.tiposPropios || []).some(t => t.key === e.categoria) ? e.categoria : 'otro')
export const tiposDoc = parametros => ({
  ...CATEGORIAS,
  ...Object.fromEntries((parametros?.tiposPropios || []).map(t => [t.key, t])),
})

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

/* TEXTOS FRECUENTES de cada memorándum: un clic los pone en la hoja y se completa lo que está entre
   corchetes. Ahorran tiempo y hacen que dos personas de RR.HH. escriban lo mismo del mismo modo. */
export const FRASES_DEFECTO = {
  'm-memo-llamada': [
    { titulo: 'Atrasos reiterados', texto: 'Registró [cantidad] atrasos injustificados los días [fechas], sin aviso previo a su jefe inmediato.' },
    { titulo: 'Inasistencia sin justificar', texto: 'No se presentó a trabajar el día [fecha], sin aviso ni justificación posterior.' },
    { titulo: 'Incumplimiento de funciones', texto: 'No cumplió con [tarea o función] asignada para el [fecha], lo que afectó [consecuencia].' },
  ],
  'm-memo-felicitacion': [
    { titulo: 'Meta cumplida', texto: 'Por haber cumplido la meta de [meta] en [período], con un resultado de [resultado].' },
    { titulo: 'Proyecto destacado', texto: 'Por su participación destacada en [proyecto], entregado el [fecha].' },
    { titulo: 'Años de servicio', texto: 'Por sus [cantidad] años de servicio comprometido con la empresa.' },
  ],
}

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
const NUMERACION_DEFECTO = { prefijo: 'DOC', formato: '{prefijo}-{n}/{gestion}', reinicioAnual: true, digitos: 4 }
/* Una categoría sin numeración guardada —«otro», en una demo que ya tenía sus parámetros— usa la
   de fábrica en vez de romper la emisión. */
export const numeracionDe = (parametros, categoria) => parametros.numeracion?.[categoria] || PARAMETROS_SEED.numeracion[categoria] || NUMERACION_DEFECTO

export function siguienteNumero(categoria, emitidos, parametros, contratos = []) {
  const cfg = numeracionDe(parametros, categoria)
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
  generado: { label: 'Sin firmar', tono: 'ambar' }, // emitido y guardado; falta subir el firmado (16 oct 2026)
  entregado: { label: 'Entregado', tono: 'verde' },
  // Ya no se pide confirmar la recepción (16 oct 2026): lo que se confirmó antes se ve como entregado.
  acusado: { label: 'Entregado', tono: 'verde' },
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

export function documentosSeed(personas, subtipos, requisitos) {
  const docs = []
  let id = 1
  for (const p of personas) {
    if (p.status === 'desvinculado') continue
    const reqs = requisitosDe(p, { subtipos, requisitos })
    const extras = semilla(p.id, 'curso') > 0.55 ? [{ subtipoId: 's-certprof' }] : []
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

/* ── EL HISTORIAL DE EJEMPLO DE CADA PERSONA (16 oct 2026) ─────────────────
   La bitácora de arriba sólo cubre los primeros documentos, y el Historial de casi todos los
   expedientes salía vacío: no se entendía para qué sirve. Esto le arma a cada uno su historia con
   lo que ya tiene —qué se le exigió, qué subió y cómo se revisó, su contrato, lo que recibió de la
   empresa y lo que pidió—, en las fechas de cada cosa y a una hora creíble. Todo sale de los datos
   de la demo: no se inventa nada que el expediente no muestre. */
export function historialSeed({ personas, documentos, emitidos, contratos, solicitudes, requisitos, subtipos }) {
  const ev = []
  const hoyIso = iso(hoy())
  const mas = (f, n) => { const d = aFecha(f); d.setDate(d.getDate() + n); const r = iso(d); return r > hoyIso ? hoyIso : r }
  const hora = (...k) => { const x = semilla(k[0], k.slice(1).join('|')); return `${String(8 + Math.floor(x * 10)).padStart(2, '0')}:${String(Math.floor((x * 997) % 60)).padStart(2, '0')}` }
  const nombre = id => subtipos.find(s => s.id === id)?.nombre || 'un documento'
  const sumar = (colaboradorId, fecha, usuario, accion, entidad, entidadId, detalle) => {
    ev.push({ id: `h-${colaboradorId}-${ev.length + 1}`, fecha, hora: hora(colaboradorId, accion, entidadId, detalle), usuario, accion, entidad, entidadId, colaboradorId, detalle })
  }
  const vivos = personas.filter(p => p.status !== 'desvinculado')
  for (const p of vivos) {
    for (const r of requisitos.filter(x => x.colaboradorId === p.id)) {
      sumar(p.id, r.fecha, r.por, 'requisito', 'requisito', r.subtipoId, `Le exigió ${nombre(r.subtipoId)}${r.obligatorio ? '' : ' (opcional)'}, con ${r.plazoDias} días de plazo`)
    }
    for (const d of documentos.filter(x => x.colaboradorId === p.id && !x.eliminado)) {
      for (const v of d.versiones) {
        if (!v.archivo?.nombre || !v.fecha) continue
        // Lo que llegó por la app lo subió la persona, aunque la semilla diga otra cosa.
        sumar(p.id, v.fecha, v.canal === 'app' ? p.name : v.subidoPor, v.v > 1 ? 'reemplazo' : 'alta', 'documento', d.id, `Cargó ${v.archivo.nombre} (${v.canal})`)
        if (v.revision === 'aprobado' && v.canal === 'app') sumar(p.id, mas(v.fecha, 1), 'Paola Arce', 'aprobacion', 'documento', d.id, `Aprobó ${nombre(d.subtipoId)}`)
        if (v.revision === 'rechazado') {
          sumar(p.id, mas(v.fecha, 1), 'Paola Arce', 'rechazo', 'documento', d.id, `Rechazó ${nombre(d.subtipoId)}: ${v.motivoRechazo || 'no se lee bien'}`)
          sumar(p.id, mas(v.fecha, 4), 'Sistema', 'recordatorio', 'documento', d.id, `Le recordó volver a subir ${nombre(d.subtipoId)}`)
        }
      }
    }
    for (const c of contratos.filter(x => x.colaboradorId === p.id)) {
      for (const v of c.versiones) {
        if (v.tipo === 'firmado') sumar(p.id, v.fecha, v.por, 'alta', 'contrato', c.id, `Cargó ${c.tipo === 'adenda' ? 'la adenda firmada' : 'el contrato firmado'} ${c.numero}`)
        else sumar(p.id, v.fecha, v.por, 'emision', 'contrato', c.id, `Generó ${c.tipo === 'adenda' ? 'la adenda' : 'el contrato'} ${c.numero}${v.motivo && c.tipo === 'adenda' ? ` (${v.motivo.toLowerCase()})` : ''}`)
      }
    }
    for (const e of emitidos.filter(x => x.colaboradorId === p.id)) {
      for (const en of e.entregas || []) sumar(p.id, en.fecha, en.por, 'entrega', 'emitido', e.id, `Le envió ${e.numero} por la ${en.canal === 'app' ? 'app' : en.canal}`)
    }
    for (const q of solicitudes.filter(x => x.colaboradorId === p.id)) {
      sumar(p.id, q.fecha, p.name, 'solicitud', 'solicitud', q.id, `Pidió «${q.asunto}» desde la app`)
      if (q.resuelto) sumar(p.id, q.resuelto.fecha, q.resuelto.por, 'solicitud', 'solicitud', q.id, `${q.estado === 'rechazada' ? 'Rechazó' : 'Atendió'} «${q.asunto}»: ${q.resuelto.nota}`)
    }
    // A algunos ya les bajaron el expediente completo, para que se vea que una descarga también queda.
    if (semilla(p.id, 'descarga') > 0.6) sumar(p.id, dias(-Math.round(5 + semilla(p.id, 'dd') * 90)), 'Paola Arce', 'descarga', 'expediente', p.id, 'Descargó el expediente completo (ZIP)')
  }
  return ev
}

/* ── LAS SOLICITUDES DE LOS COLABORADORES ─────────────────────────────────
   Lo que una persona pide desde la app y que termina en un documento en sus manos. Son tres, y cada
   una se atiende con su propia acción, no con un «aprobar» que no entrega nada:
   · un CERTIFICADO, que se emite desde su modelo;
   · una COPIA de un documento de su expediente, que se elige y se le envía;
   · la CORRECCIÓN de un documento que recibió con un error, que se vuelve a emitir.
   Lo que el sistema detecta solo —revisar, faltantes, vencidos— no es una solicitud: va en
   Seguimiento. Los permisos tampoco: no producen documento y son de asistencia. */
export const TIPOS_SOLICITUD = {
  certificacion: { label: 'Certificados', singular: 'Certificado', tono: 'azul', accion: 'Emitir' },
  copia: { label: 'Copias', singular: 'Copia', tono: 'violeta', accion: 'Enviar copia' },
  correccion: { label: 'Correcciones', singular: 'Corrección', tono: 'ambar', accion: 'Corregir y reemitir' },
}
export const ESTADOS_SOLICITUD = {
  pendiente: { label: 'Pendiente', tono: 'ambar' },
  atendida: { label: 'Atendida', tono: 'verde' },
  rechazada: { label: 'Rechazada', tono: 'rojo' },
}
/* EL PLAZO PARA RESPONDER, en días hábiles desde que llegó el pedido. */
export const PLAZO_SOLICITUD_DIAS = 2
/* EL PLAZO SE CONFIGURA (16 oct 2026) en Notificaciones y tipos de documento, y CADA PEDIDO GUARDA
   EL SUYO al hacerse (`plazoDias`): si después RR.HH. cambia el plazo, no cambia lo que ya se le
   prometió a quien pidió. Los pedidos viejos, sin plazo guardado, usan los 2 de siempre. */
export const plazoSolicitudDe = parametros => Number(parametros?.plazoSolicitudDias) || PLAZO_SOLICITUD_DIAS
export const limiteSolicitud = q => responderAntes(q.fecha, q.plazoDias || PLAZO_SOLICITUD_DIAS)
export function responderAntes(fecha, habiles = PLAZO_SOLICITUD_DIAS) {
  const d = aFecha(fecha)
  let n = habiles
  while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n -= 1 }
  return iso(d)
}

export function solicitudesSeed(personas) {
  const vivos = new Set(personas.filter(p => p.status !== 'desvinculado').map(p => p.id))
  const Q = (id, tipo, colaboradorId, dia, asunto, detalle, extra = {}) => ({ id, tipo, colaboradorId, fecha: dias(dia), asunto, detalle, estado: 'pendiente', canal: 'app', ...extra })
  return [
    /* Pendientes: de cada tipo, una atrasada, una que vence hoy y otras con margen. */
    Q('q-1', 'certificacion', 3, -1, 'Certificado de trabajo', 'Para la apertura de una cuenta en el banco.', { modeloId: 'm-cert-trabajo' }),
    Q('q-2', 'certificacion', 9, 0, 'Certificado de trabajo con sueldo', 'Lo pide el consulado para el trámite de visa.', { modeloId: 'm-cert-sueldo' }),
    Q('q-4', 'certificacion', 16, -5, 'Certificado de trabajo', 'Para alquilar un departamento: lo pide el propietario.', { modeloId: 'm-cert-trabajo' }),
    Q('q-7', 'copia', 5, -3, 'Copia de su contrato firmado', 'Necesita una copia para un crédito de vivienda.', { carpeta: 'contratos' }),
    Q('q-10', 'copia', 7, -1, 'Copia de su título registrado', 'Para postular a una maestría.', { carpeta: 't-perfil' }),
    Q('q-8', 'correccion', 13, -2, 'Certificado de trabajo con un error', 'Su segundo apellido figura mal escrito.', { modeloId: 'm-cert-trabajo' }),
    Q('q-11', 'correccion', 4, 0, 'Memorándum con la fecha equivocada', 'Dice 4 de agosto y el atraso fue el 11 de agosto.', { modeloId: 'm-memo-llamada' }),
    /* Atendidas: una de cada tipo, con lo que se hizo. */
    Q('q-3', 'certificacion', 14, -6, 'Certificado de trabajo', 'Para inscribir a su hijo en el colegio.', { modeloId: 'm-cert-trabajo', estado: 'atendida', resuelto: { fecha: dias(-5), por: 'Paola Arce', nota: 'Se emitió el certificado y se envió por la app' } }),
    Q('q-9', 'copia', 11, -8, 'Copia de su memorándum de felicitación', 'Lo quiere guardar en su carpeta personal.', { carpeta: 'emitidos', estado: 'atendida', resuelto: { fecha: dias(-7), por: 'Paola Arce', nota: 'Se envió MEM-0003/2026 por la app' } }),
    Q('q-12', 'correccion', 10, -15, 'Certificado con sueldo desactualizado', 'Figura el sueldo anterior al aumento de septiembre.', { modeloId: 'm-cert-sueldo', estado: 'atendida', resuelto: { fecha: dias(-14), por: 'Daniela Flores', nota: 'Se reemitió con el sueldo vigente y se anuló el anterior' } }),
    /* Rechazadas: con el motivo que leyó el colaborador. */
    Q('q-13', 'certificacion', 18, -10, 'Certificado de trabajo con sueldo', 'Para un préstamo en el banco.', { modeloId: 'm-cert-sueldo', estado: 'rechazada', resuelto: { fecha: dias(-9), por: 'Paola Arce', nota: 'Ya se le emitió uno la semana pasada y sigue vigente: puede descargarlo desde la app.' } }),
    Q('q-14', 'copia', 2, -9, 'Copia de sus boletas de pago', 'Las de los últimos tres meses.', { estado: 'rechazada', resuelto: { fecha: dias(-8), por: 'Daniela Flores', nota: 'Las boletas de pago todavía no están en Documentación: pídalas a Contabilidad.' } }),
    Q('q-15', 'correccion', 6, -12, 'Certificado con el cargo anterior', 'Dice Asistente y ahora es Analista.', { modeloId: 'm-cert-trabajo', estado: 'rechazada', resuelto: { fecha: dias(-11), por: 'Paola Arce', nota: 'Su cambio de cargo rige desde el 1 de noviembre; hasta entonces el certificado es correcto.' } }),
  ].filter(q => vivos.has(q.colaboradorId))
}

export const ACCIONES_BITACORA = {
  alta: 'Carga', edicion: 'Edición', aprobacion: 'Aprobación', rechazo: 'Rechazo', emision: 'Emisión',
  entrega: 'Entrega', acuse: 'Acuse', descarga: 'Descarga', reemplazo: 'Reemplazo', baja: 'Baja',
  exoneracion: 'Exoneración', pedido: 'Pedido', anulacion: 'Anulación', configuracion: 'Configuración', lectura: 'Lectura confidencial',
  requisito: 'Requisito', solicitud: 'Solicitud', recordatorio: 'Recordatorio',
}

/* ── DE DÓNDE SALIÓ UN EMITIDO (Documentación v2) ─────────────────────────
   Tres puertas, un solo camino: a una persona, a un grupo —que deja un lote— o porque alguien lo
   pidió. No se guarda en el emitido: se deduce del lote al que pertenece y de la solicitud que lo
   tiene como respuesta, para que no haya dos lugares que puedan contradecirse. */
export const ORIGENES_EMITIDO = {
  individual: { label: 'Individual', tono: 'gris' },
  lote: { label: 'Lote', tono: 'azul' },
  solicitud: { label: 'Solicitud', tono: 'violeta' },
}
export function origenDe(e, solicitudes = []) {
  if (e.loteId) return 'lote'
  if (solicitudes.some(q => q.resuelto?.emitidoId === e.id)) return 'solicitud'
  return 'individual'
}

/* EL AVANCE DE UN LOTE: cuántos se entregaron y cuántos confirmaron, sobre los que siguen en pie
   (un anulado sale de la cuenta). Lo usan la lista de lotes y la ficha de cada uno. */
/* ¿Espera que el colaborador confirme? Ya nunca (16 oct 2026): se quitó la confirmación de
   recepción. Se deja la función para que lo que la usa no muestre «sin confirmar» en ningún lado. */
export const esperaAcuse = () => false

/* El nombre de un emitido: el del archivo propio que se envió, o el de su modelo. */
export const nombreEmitido = (e, modelos = []) => e.nombre || modelos.find(m => m.id === e.modeloId)?.nombre || CATEGORIAS[e.categoria]?.label || 'Documento'

export function avanceLote(lote, emitidos) {
  const suyos = emitidos.filter(e => e.loteId === lote.id && e.estado !== 'anulado')
  const entregados = suyos.filter(e => ['entregado', 'acusado'].includes(e.estado)).length
  const confirmados = suyos.filter(e => e.estado === 'acusado').length
  return { total: suyos.length, entregados, confirmados, sinConfirmar: suyos.filter(esperaAcuse).length, pideAcuse: suyos.some(e => e.pideAcuse !== false), emitidos: suyos }
}

/* UN LOTE DE EJEMPLO, para que la vista por lote no arranque vacía: el memorándum de felicitación
   a la unidad de Ventas por la meta del trimestre, entregado por la app hace ocho días y
   confirmado por la mayoría. Se numera después de lo que la demo ya tenga (RN-15). */
export function semillaLoteDemo(personas, { emitidos = [], parametros = PARAMETROS_SEED, modelos = MODELOS_SEED } = {}) {
  const gente = personas.filter(p => p.depto === 'Ventas' && p.status !== 'desvinculado').slice(0, 8)
  const m = modelos.find(x => x.id === 'm-memo-felicitacion')
  if (gente.length < 3 || !m) return null
  const version = [...m.versiones].reverse().find(v => v.estado === 'publicada')
  const loteId = 'le-demo-ventas-q3'
  const fecha = dias(-8)
  const obs = 'Por superar la meta de ventas del tercer trimestre como equipo.'
  const acumulado = [...emitidos]
  const nuevos = gente.map((p, i) => {
    const num = siguienteNumero('memorandum', acumulado, parametros)
    const datos = { ...datosPara(p, { numero: num.texto, observaciones: obs }), 'documento.fecha': fechaLarga(fecha) }
    const acusado = i % 4 !== 1
    const e = {
      id: `e-lote-${p.id}`, modeloId: m.id, categoria: 'memorandum', colaboradorId: p.id, versionPlantilla: version.v,
      numero: num.texto, n: num.n, gestion: num.gestion, fecha, emitidoPor: 'Paola Arce', estado: acusado ? 'acusado' : 'entregado',
      datos, texto: rellenar(version.texto, datos), observaciones: obs, loteId,
      entregas: [{ canal: 'app', fecha, por: 'Paola Arce' }],
      acuse: acusado ? { fecha: dias(-8 + 1 + (i % 3)), dispositivo: i % 2 ? 'Celular · app SoulyHR' : 'Navegador · SoulyHR web' } : null,
    }
    acumulado.unshift(e)
    return e
  })
  const lote = { id: loteId, nombre: 'Felicitación por la meta del tercer trimestre · Ventas', modeloId: m.id, fecha, por: 'Paola Arce', ids: nuevos.map(e => e.id) }
  return { lote, emitidos: nuevos }
}

/* ── LOS COLABORADORES QUE SE DEMUESTRAN DESDE SU LADO ────────────────────
   Carlos (en el celular) y María (en la web) son los perfiles con que la demo muestra «Mis
   documentos», pero no están en el directorio: entraron a la demo por el selector de usuario, con
   su ficha de ejemplo (`miFicha.js`), y nunca se los dio de alta. Sin expediente no tendrían nada
   que ver. Se suman a las personas del módulo —y sólo a las del módulo—, con un id fuera del
   rango del directorio para no pisar a nadie, y con su ficha, que es de donde salen casi todos sus
   documentos. Así RR.HH. también los ve en Colaboradores y revisa lo que suben. */
export const COLABORADORES_APP = [
  /* Quien administra también es colaborador (16 oct 2026): Juan, el usuario de RR.HH. de la demo,
     tiene su expediente y lo ve en Zona HR › Mis documentos, como todos. */
  { id: 1001, name: 'Juan Pérez Gómez', email: 'juan.perez@farmavida.com.bo', depto: 'Recursos Humanos', cargo: 'Gerente de Recursos Humanos', rol: 'Administrador', ingreso: '10 Ene 2022', status: 'activo', registro: 100, onb: 'na', initials: 'JP', color: '#0C2D40' },
  { id: 1004, name: 'Carlos Mendoza Ríos', email: 'carlos.mendoza@farmavida.com.bo', depto: 'Tecnología', cargo: 'Desarrollador Frontend', rol: 'Colaborador', ingreso: '02 Feb 2025', status: 'activo', registro: 100, onb: 'graduado', initials: 'CM', color: '#f59e0b' },
  { id: 1002, name: 'María López Torres', email: 'maria.lopez@farmavida.com.bo', depto: 'Ventas', cargo: 'Ejecutiva Comercial', rol: 'Colaborador', ingreso: '15 Mar 2024', status: 'activo', registro: 100, onb: 'graduado', initials: 'ML', color: '#7c3aed' },
].map(c => {
  const f = miFichaDe(c.name)?.form || null
  return { ...c, ficha: f, documento: f ? `${f['1.11']} ${f['1.12']}` : undefined }
})

/* LO QUE YA LES PASÓ, elegido a mano y no por semilla: cada uno tiene que llegar a «Mis documentos»
   con algo de cada cosa —algo que subir, algo rechazado o en revisión, algo recibido sin confirmar
   y una solicitud—, que es lo que la demo existe para enseñar.
   Los números de lo emitido y de los contratos se toman DESPUÉS de los que ya hay (RN-15): esto se
   agrega a una demo que puede llevar semanas abierta y con sus propias emisiones. */
export function semillaColaboradoresApp(personas, { emitidos = [], contratos = [], parametros = PARAMETROS_SEED, modelos = MODELOS_SEED } = {}) {
  const P = id => personas.find(p => p.id === id)
  const carlos = P(1004), maria = P(1002), juan = P(1001)
  const out = { documentos: [], emitidos: [], contratos: [], solicitudes: [], requisitos: [], pedidos: {}, bitacora: [] }
  const sub = id => SUBTIPOS_SEED.find(s => s.id === id)
  const doc = (p, subtipoId, { dia, revision, canal, original, motivo = null }) => {
    const s = sub(subtipoId)
    const emision = dias(dia)
    const formato = extension(original)
    out.documentos.push({
      id: `d-app-${p.id}-${subtipoId}`, colaboradorId: p.id, subtipoId,
      versiones: [{
        v: 1, archivo: { nombre: normalizarNombre(p, s, emision, formato), original, formato, tamanoKB: 640 },
        emision, vencimiento: s.vence ? sumarMeses(emision, s.vigenciaMeses) : null,
        subidoPor: p.name, canal, fecha: emision, revision, motivoRechazo: motivo, info: '',
        ...(revision === 'rechazado' ? { revisadoPor: 'Paola Arce', revisado: dias(dia + 1) } : {}),
      }],
    })
    out.bitacora.push({ id: `b-app-${p.id}-${subtipoId}`, fecha: emision, hora: '09:40', usuario: p.name, accion: 'alta', entidad: 'documento', entidadId: `d-app-${p.id}-${subtipoId}`, colaboradorId: p.id, detalle: `Cargó ${original} (${canal})` })
  }
  const acumulado = [...emitidos]
  const emitido = (p, clave, modeloId, dia, estado, observaciones = '') => {
    const m = modelos.find(x => x.id === modeloId)
    const num = siguienteNumero(m.categoria, acumulado, parametros)
    const datos = { ...datosPara(p, { numero: num.texto, observaciones }), 'documento.fecha': fechaLarga(dias(dia)) }
    const version = [...m.versiones].reverse().find(v => v.estado === 'publicada')
    const e = {
      id: `e-app-${p.id}-${clave}`, modeloId, categoria: m.categoria, colaboradorId: p.id, versionPlantilla: version.v,
      numero: num.texto, n: num.n, gestion: num.gestion, fecha: dias(dia), emitidoPor: 'Paola Arce', estado,
      datos, texto: rellenar(version.texto, datos), observaciones,
      entregas: [{ canal: 'app', fecha: dias(dia), por: 'Paola Arce' }],
      acuse: estado === 'acusado' ? { fecha: dias(dia + 1), dispositivo: 'Navegador · SoulyHR web' } : null,
    }
    acumulado.unshift(e)
    out.emitidos.push(e)
    out.bitacora.push({ id: `b-app-${e.id}`, fecha: e.fecha, hora: '11:15', usuario: 'Paola Arce', accion: 'emision', entidad: 'emitido', entidadId: e.id, colaboradorId: p.id, detalle: `Emitió ${e.numero} · ${m.nombre}` })
  }

  if (carlos) {
    // Su certificación la mandó desde el celular y se la rechazaron; su título se lo pidieron hace días.
    doc(carlos, 's-certprof', { dia: -6, revision: 'rechazado', canal: 'app', original: 'IMG_20261008_183015.jpg', motivo: 'La foto está cortada: no se lee la fecha de emisión.' })
    out.pedidos[`${carlos.id}|s-titulo`] = dias(-3)
    out.bitacora.push({ id: `b-app-${carlos.id}-pedido`, fecha: dias(-3), hora: '10:05', usuario: 'Paola Arce', accion: 'pedido', entidad: 'requisito', entidadId: 's-titulo', colaboradorId: carlos.id, detalle: 'Pidió Título o diploma' })
    emitido(carlos, 'cert', 'm-cert-trabajo', -4, 'entregado')
    out.solicitudes.push({ id: `q-app-${carlos.id}-1`, tipo: 'certificacion', colaboradorId: carlos.id, fecha: dias(-1), asunto: 'Certificado de trabajo con sueldo', detalle: 'Para tramitar un crédito de vivienda en el banco.', estado: 'pendiente', canal: 'app', modeloId: 'm-cert-sueldo' })
  }
  if (maria) {
    // Su título lo subió desde la web y todavía nadie lo miró.
    doc(maria, 's-titulo', { dia: -2, revision: 'pendiente', canal: 'web', original: 'Titulo_Licenciatura_Maria.pdf' })
    emitido(maria, 'cert', 'm-cert-sueldo', -40, 'acusado')
    emitido(maria, 'memo', 'm-memo-felicitacion', -9, 'entregado', 'Por superar la meta de ventas del tercer trimestre.')
    out.solicitudes.push({ id: `q-app-${maria.id}-1`, tipo: 'copia', colaboradorId: maria.id, fecha: dias(-20), asunto: 'Copia de su contrato firmado', detalle: 'La pide el propietario del departamento que va a alquilar.', estado: 'atendida', canal: 'web', carpeta: 'contratos', resuelto: { fecha: dias(-19), por: 'Paola Arce', nota: 'Se le envió la copia de su contrato por la app' } })
  }

  if (juan) {
    // El que administra: su certificado de trabajo, recibido y confirmado hace dos meses.
    emitido(juan, 'cert', 'm-cert-trabajo', -60, 'acusado')
  }

  const gente = [carlos, maria, juan].filter(Boolean)
  out.requisitos = requisitosSeed(gente)
  /* Los contratos salen de la misma regla que los de todos; sólo se les da id y número propios para
     no chocar con los sembrados, que empiezan los dos en 1. */
  const sueltos = contratosSeed(gente)
  const ids = new Map(sueltos.map(c => [c.id, `k-app-${c.colaboradorId}-${c.id}`]))
  const conNumero = [...contratos]
  for (const c of sueltos) {
    // La gestión es la del contrato, como en los sembrados: uno firmado en 2024 no se numera en 2026.
    const num = siguienteNumero('contrato', [], parametros, conNumero)
    const gestion = c.gestion || num.gestion
    const nuevo = { ...c, id: ids.get(c.id), origenId: c.origenId ? ids.get(c.origenId) : null, numero: num.texto.replace(`/${num.gestion}`, `/${gestion}`), gestion }
    conNumero.push(nuevo)
    out.contratos.push(nuevo)
  }
  return out
}
