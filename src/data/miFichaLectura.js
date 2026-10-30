import { PESTANAS, tarjetasDe } from './fichaColaborador'
import { nivelColaborador } from './configFicha'

/* CÓMO SE LEE LA FICHA DESDE EL LADO DEL COLABORADOR.
   Las secciones, los campos, las condiciones y las copias repetidas salen de `tarjetasDe`, lo
   mismo que usa RR.HH. para registrar y revisar. Aquí sólo se decide qué se enseña y cómo:

   - LAS PESTAÑAS son las de la ficha menos «Configuración de Colaborador»: su usuario y su rol
     en el sistema los decide RR.HH. y no son un dato suyo. Las que sólo existen en local
     (Perfil Profesional, Asistencia) llegan o no según `PESTANAS`, igual que para RR.HH.
   - UN CAMPO VACÍO NO SE ENSEÑA. El colaborador no llena su ficha: la mira, y veinte
     «Sin registrar» taparían lo que sí está.
   - LOS ARCHIVOS VAN A «DOCUMENTACIÓN», juntos, y no desperdigados entre los datos.
   - MI FICHA SÓLO SE LEE. Lo que la empresa le deja editar —de fábrica, su Información Personal
     y Familiar, con sus documentos, y sus preferencias— lo cambia desde Configuración › Editar
     perfil de usuario, en web y en el teléfono. Todo lo demás se corrige pidiéndoselo a RR.HH.
   - QUÉ VE Y QUÉ EDITA LO DECIDE LA EMPRESA, sección por sección, en Gestión de Personas ›
     Configuración › Ficha del colaborador. Aquí sólo se pregunta `nivelColaborador`. */

export const PESTANAS_COLABORADOR = PESTANAS.filter(p => p.key !== 'configuracion')

const PISTAS = {
  personal: 'Sus datos, contacto y familia',
  laboral: 'Puesto, contrato, pago y afiliaciones',
  perfil: 'Su formación y trayectoria',
  documentos: 'Sus documentos en un solo lugar',
  recursos: 'Lo que la empresa le entregó',
}
export const pistaDe = key => PISTAS[key] || ''

/* Secciones que no se leen aquí, decida lo que decida la empresa: los exámenes aún no guardan un
   dato legible; los archivos van a Documentación; las preferencias viven en la portada del perfil.
   Las que la empresa pone en «Oculto» —de fábrica, si es reingreso— se quitan con `seVeAqui`. */
const OCULTAS = new Set(['examenes', 'archivos', 'preferencias'])
const seVeAqui = (t, parte) => !OCULTAS.has(t.id) && nivelColaborador(t.id, parte) !== 'oculto'
/* Las preferencias, en la portada y en Editar perfil, siguen la misma regla que cualquier sección. */
export const preferenciasVisibles = () => nivelColaborador('preferencias', 'quien') !== 'oculto'
export const preferenciasEditables = () => nivelColaborador('preferencias', 'quien') === 'editar'
/* Si en una pestaña de Mi ficha hay algo que él mismo mantiene: cambia el aviso de arriba. */
export const pestanaConEditables = pestanaKey => (PESTANAS_COLABORADOR.find(p => p.key === pestanaKey)?.partes || [])
  .some(parte => tarjetasDe(parte, {}, {}).some(t => t.id !== 'preferencias' && nivelColaborador(t.id, parte) === 'editar'))
const PRIVADAS = new Set(['medica'])
const SIN_VALOR = new Set(['archivo', 'repetir', 'agregarDoc', 'mapa', 'tutela', 'aprobadores', 'apoyoFuncional', 'rotulo'])
/* Montos que se tapan hasta que la persona pide verlos: el sueldo no tiene por qué quedar a la
   vista de quien pase detrás de la pantalla. */
const RESERVADOS = new Set(['3.65', '3.69c'])
// Los que esta ficha escribe a su manera —en bolivianos o en porcentaje— y no como los deja RR.HH.
export const FORMATO_PROPIO = new Set(['3.65', '3.69c', '2.35', '2.45v'])

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
      // Para que el teléfono ponga el detalle («Descripción de la alergia») debajo de su pregunta.
      siNo: c.tipo === 'siNo', detalle: c.detalle || null,
    })
  }
  const llenos = bloques.filter(b => b.datos.length)
  return {
    id: t.id,
    titulo: t.titulo,
    bloques: llenos,
    vacia: !llenos.length,
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
      .filter(t => seVeAqui(t, parte))
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

/* ── CONFIGURACIÓN › EDITAR PERFIL DE USUARIO ─────────────────────────────
   Lo que el colaborador cambia por su cuenta son las secciones que la empresa le deja editar
   (`nivelColaborador`). De fábrica es su Información Personal entera —la suya y la de su
   familia— con los documentos que van en ella: el carnet escaneado, el certificado de nacimiento,
   el croquis, las licencias. Se guarda al momento, sin pasar por RR.HH. Lo laboral —puesto,
   contrato, pago, recursos— ni se ve ahí: tiene tope «Solo ver» y no lo puede cambiar.

   LAS SECCIONES SALEN AUNQUE ESTÉN VACÍAS y con todos sus campos: quien todavía no tiene teléfono
   fijo tiene que poder agregarlo. Se leen con `tarjetasDe` sobre lo que se está escribiendo, así
   que lo condicional aparece al contestar: «Sí» a las alergias abre su descripción.
   Las preferencias van aparte, en su pestaña. UNA PARTE SIN NADA QUE EDITAR NO SALE. */
const NO_SE_EDITAN = new Set(['preferencias'])
/* El mapa y los calculados se quedan: en la web se dibujan con la rejilla de RR.HH., y el mapa
   ancla la columna izquierda de «Datos de residencia» —sin él, el croquis cae suelto—. Los
   calculados no se escriben, se enseñan, igual que allá. El teléfono, de una columna, los salta. */
const SE_ESCRIBEN = new Set(['texto', 'lista', 'siNo', 'archivo', 'rotulo', 'repetir', 'mapa', undefined])
export function perfilEditable(form) {
  return PESTANAS_COLABORADOR.flatMap(p => p.partes).map(parte => ({
    key: parte,
    titulo: tituloDeParte(parte) || PESTANAS_COLABORADOR.find(p => p.partes.includes(parte))?.titulo,
    secciones: tarjetasDe(parte, form, {})
      .filter(t => !NO_SE_EDITAN.has(t.id) && nivelColaborador(t.id, parte) === 'editar')
      .map(t => ({
        id: t.id,
        titulo: t.titulo,
        privada: PRIVADAS.has(t.id),
        campos: t.campos.filter(c => SE_ESCRIBEN.has(c.tipo) && !c.oculto),
      }))
      .filter(s => s.campos.some(c => c.tipo !== 'rotulo' && c.tipo !== 'repetir')),
  })).filter(p => p.secciones.length)
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
