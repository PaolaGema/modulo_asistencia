import { PESTANAS, tarjetasDe } from './fichaColaborador'

/* CÓMO SE LEE LA FICHA DESDE EL LADO DEL COLABORADOR.
   Las secciones, los campos, las condiciones y las copias repetidas salen de `tarjetasDe`, lo
   mismo que usa RR.HH. para registrar y revisar. Aquí sólo se decide qué se enseña y cómo:

   - LAS PESTAÑAS son las de la ficha menos «Configuración de Colaborador»: su usuario y su rol
     en el sistema los decide RR.HH. y no son un dato suyo. Las que sólo existen en local
     (Perfil Profesional, Asistencia) llegan o no según `PESTANAS`, igual que para RR.HH.
   - UN CAMPO VACÍO NO SE ENSEÑA. El colaborador no llena su ficha: la mira, y veinte
     «Sin registrar» taparían lo que sí está.
   - LOS ARCHIVOS VAN A «DOCUMENTACIÓN», juntos, y no desperdigados entre los datos.
   - MI FICHA SÓLO SE LEE. Lo que sólo él sabe al día —su contacto, sus contactos de emergencia
     y sus preferencias— lo edita desde Configuración › Mis datos personales, en web y en el
     teléfono. Todo lo demás se corrige pidiéndoselo a RR.HH. */

export const PESTANAS_COLABORADOR = PESTANAS.filter(p => p.key !== 'configuracion')

const PISTAS = {
  personal: 'Sus datos, contacto y familia',
  laboral: 'Puesto, contrato, pago y afiliaciones',
  perfil: 'Su formación y trayectoria',
  documentos: 'Sus documentos en un solo lugar',
  recursos: 'Lo que la empresa le entregó',
}
export const pistaDe = key => PISTAS[key] || ''

/* Secciones que no se le enseñan: si es reingreso es un dato del trámite de RR.HH.; los
   exámenes aún no guardan un dato legible; los archivos van a Documentación; las preferencias
   viven en la portada del perfil. */
const OCULTAS = new Set(['reingreso', 'examenes', 'archivos', 'preferencias'])
export const EDITABLES = new Set(['contacto', 'emergencia'])
const PRIVADAS = new Set(['medica'])
const SIN_VALOR = new Set(['archivo', 'repetir', 'agregarDoc', 'mapa', 'tutela', 'aprobadores', 'apoyoFuncional', 'rotulo'])
/* Montos que se tapan hasta que la persona pide verlos: el sueldo no tiene por qué quedar a la
   vista de quien pase detrás de la pantalla. */
const RESERVADOS = new Set(['3.65', '3.69c'])

const base = key => key.split('#')[0]
const vacio = v => v === null || v === undefined || String(v).trim() === ''
const miles = n => Number(n).toLocaleString('es-BO')

export function formatear(campo, v, form) {
  const k = base(campo.key)
  if (campo.tipo === 'siNo') return v === 'si' ? 'Sí' : v === 'no' ? 'No' : v
  if (campo.tipo === 'filas') return String(v).split('\n').filter(Boolean).join(' · ')
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [a, m, d] = v.split('-')
    return `${d}/${m}/${a}`
  }
  if (k === '3.65' || k === '2.45v') return /^\d+$/.test(v) ? `Bs ${miles(v)}` : v
  if (k === '3.69c') return (form['3.69b'] || '').startsWith('Porcentaje') ? `${v} %` : `Bs ${miles(v)}`
  if (k === '2.35') return `${v} %`
  return String(v)
}

/* Una sección leída: sus bloques —cada rótulo abre uno, como «Contacto de emergencia 2»— con
   los datos que tienen valor. */
function leer(t, form) {
  const bloques = [{ titulo: null, datos: [] }]
  for (const c of t.campos) {
    if (c.tipo === 'rotulo') { bloques.push({ titulo: c.label, datos: [] }); continue }
    if (SIN_VALOR.has(c.tipo)) continue
    const v = c.deducido !== undefined ? c.deducido : form[c.key]
    if (vacio(v) || typeof v === 'object') continue
    bloques[bloques.length - 1].datos.push({
      key: c.key, label: c.label, valor: formatear(c, v, form), reservado: RESERVADOS.has(base(c.key)),
    })
  }
  const llenos = bloques.filter(b => b.datos.length)
  return {
    id: t.id,
    titulo: t.titulo,
    bloques: llenos,
    vacia: !llenos.length,
    editable: EDITABLES.has(t.id),
    privada: PRIVADAS.has(t.id),
    reservada: llenos.some(b => b.datos.some(d => d.reservado)),
    campos: t.campos,
  }
}

/* Las partes de una pestaña, cada una con sus secciones ya leídas. Las secciones vacías se
   quedan fuera, salvo en Recursos, donde «no tiene vehículo asignado» también es un dato. */
export function partesDe(pestanaKey, form) {
  const pestana = PESTANAS_COLABORADOR.find(p => p.key === pestanaKey)
  if (!pestana) return []
  return pestana.partes.map(parte => ({
    key: parte,
    titulo: tituloDeParte(parte),
    secciones: tarjetasDe(parte, form, {})
      .filter(t => !OCULTAS.has(t.id))
      .map(t => leer(t, form))
      .filter(s => pestanaKey === 'recursos' || !s.vacia),
  })).filter(p => p.secciones.length)
}

const TITULOS_PARTE = {
  quien: 'Información Personal', entorno: 'Información Familiar', puesto: 'Información Laboral',
  contrato: 'Relación Laboral', remuneracion: 'Compensación, Nómina y Afiliaciones', asistencia: 'Asistencia',
}
const tituloDeParte = k => TITULOS_PARTE[k] || null

/* Las pestañas que tienen algo que enseñar. Documentación cuenta sus archivos. */
export function pestanasCon(form) {
  return PESTANAS_COLABORADOR.filter(p => (p.key === 'documentos' ? documentosDe(form).length : partesDe(p.key, form).length))
}

/* Lo que dice cada fila de «Mi ficha» debajo de su título: la pista, o la cuenta de documentos
   y de recursos asignados. */
export const porRenovar = form => documentosDe(form).filter(d => d.estado === 'por-vencer' || d.estado === 'vencido')
export function resumenDe(form, key) {
  if (key === 'documentos') {
    const n = documentosDe(form).length
    const por = porRenovar(form).length
    return `${n} documentos${por ? ` · ${por} por renovar` : ''}`
  }
  if (key === 'recursos') {
    const n = partesDe('recursos', form).flatMap(p => p.secciones).reduce((a, s) => a + s.bloques.length, 0)
    return `${n} asignados`
  }
  return pistaDe(key)
}

/* Las secciones que el colaborador edita desde Configuración › Mis datos personales, leídas
   aunque estén vacías: quien todavía no tiene teléfono fijo tiene que poder agregarlo. */
export function seccionesEditables(form) {
  return [['quien', 'contacto'], ['entorno', 'emergencia']]
    .map(([parte, id]) => tarjetasDe(parte, form, {}).find(t => t.id === id))
    .filter(Boolean)
    .map(t => leer(t, form))
}

/* ── LOS CAMPOS QUE EL COLABORADOR PUEDE ESCRIBIR ────────────────────────── */
const ESCRIBIBLES = new Set(['texto', 'lista', 'siNo', undefined])
export function camposEditables(seccion) {
  return seccion.campos.filter(c => c.tipo === 'rotulo' || (ESCRIBIBLES.has(c.tipo) && c.deducido === undefined))
}

/* ── DOCUMENTACIÓN ─────────────────────────────────────────────────────────
   Los archivos de «Archivos» —la misma sección que ve RR.HH.— con su fecha de emisión y de
   vencimiento cuando las tienen. El estado se mide contra hoy, igual que la licencia de la
   ficha: vencido, por vencer (60 días o menos) o vigente. */
const DIA = 86400000
export function documentosDe(form) {
  const archivos = tarjetasDe('expediente', form, {}).find(t => t.id === 'archivos')
  if (!archivos) return []
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return archivos.campos
    .filter(c => c.tipo === 'archivo' && form[c.key]?.nombre)
    .map(c => {
      const copia = c.key.includes('#') ? '#' + c.key.split('#')[1] : ''
      const emite = c.emite ? form[c.emite + copia] : null
      const vence = c.vence ? form[c.vence + copia] : null
      let estado = null
      if (vence) {
        const dias = (new Date(vence + 'T00:00:00') - hoy) / DIA
        estado = dias < 0 ? 'vencido' : dias <= 60 ? 'por-vencer' : 'vigente'
      }
      return {
        key: c.key,
        nombre: c.label,
        archivo: form[c.key].nombre,
        grupo: c.categoria || 'Documentos agregados',
        emite: emite ? formatear({ key: '' }, emite, form) : null,
        vence: vence ? formatear({ key: '' }, vence, form) : null,
        estado,
      }
    })
}

export const agrupar = (lista, clave) => lista.reduce((acc, x) => {
  const g = acc.find(a => a.titulo === x[clave])
  if (g) g.items.push(x); else acc.push({ titulo: x[clave], items: [x] })
  return acc
}, [])

/* Preferencias: se guardan como las tablitas de la ficha, una por línea. */
export const lineas = v => String(v || '').split('\n').map(s => s.trim()).filter(Boolean)

/* El nombre del titular, para las hojas de la vista previa. */
export const titularDe = form => ['1.1', '1.2', '1.4', '1.5'].map(k => form[k]).filter(Boolean).join(' ')
