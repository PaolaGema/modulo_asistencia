import { useSyncExternalStore } from 'react'

/* LA FICHA, A LA MEDIDA DE CADA EMPRESA — Gestión de Personas › Configuración › Ficha del colaborador.
   Dos decisiones por sección, y nada más en esta primera fase:

   - SI LA EMPRESA LA USA. Una sección apagada no sale en «Nuevo colaborador», ni en la ficha de
     RR.HH., ni en Mi ficha, ni en Editar perfil. APAGAR NO BORRA: lo registrado se queda en la
     ficha y vuelve a verse al encenderla. Las que tienen campos que exige la ley —nivel «Mínimo»
     del estudio— no se apagan (ver `seccionesConfigurables`).
   - QUÉ PUEDE HACER EL COLABORADOR con ella: no verla, sólo verla o editarla él mismo.

   - SECCIONES PROPIAS (fase 2): las que la empresa crea, con sus campos, en cualquier parte de
     la ficha. Son las únicas que se editan y se eliminan. Ver `tarjetaPropia`.

   SE APLICA EN UN SOLO LUGAR. `tarjetasDe` pregunta `seccionActiva` y `miFichaLectura` pregunta
   `nivelColaborador`; todas las pantallas de la ficha pasan por esos dos, así que ninguna se
   entera de que existe esta configuración y ninguna puede quedarse desfasada.

   LO GUARDADO SON SÓLO LAS DIFERENCIAS con el valor de partida, que es como la ficha se
   comportaba antes de esta pantalla. Una empresa que nunca entra aquí no nota nada, y
   «Restablecer» es vaciar el objeto.

   SE LEE DEL NAVEGADOR EN CADA LLAMADA, sin pasar por React, porque `tarjetasDe` es una función
   suelta que también corre en los scripts de node —donde no hay `localStorage` y todo queda
   como de fábrica—. La lectura se cachea por el texto guardado: parsear sólo cuando cambia. */

const CLAVE = 'onb_demo_config_ficha' // con el prefijo de la demo: «Borrar datos de la demo» la limpia
const AVISO = 'config-ficha'
const VACIA = { inactivas: [], colaborador: {}, propias: [] }

let cache = { crudo: undefined, valor: VACIA }
export function configFicha() {
  let crudo = null
  try { crudo = localStorage.getItem(CLAVE) } catch { /* fuera del navegador */ }
  if (crudo !== cache.crudo) {
    let valor = VACIA
    try { valor = crudo ? { ...VACIA, ...JSON.parse(crudo) } : VACIA } catch { /* guardado roto: de fábrica */ }
    cache = { crudo, valor }
  }
  return cache.valor
}

export function guardarConfigFicha(cambio) {
  const nueva = typeof cambio === 'function' ? cambio(configFicha()) : cambio
  try { localStorage.setItem(CLAVE, JSON.stringify(nueva)) } catch { /* sin espacio: queda como estaba */ }
  window.dispatchEvent(new Event(AVISO))
}

const suscribir = fn => {
  window.addEventListener(AVISO, fn)
  window.addEventListener('storage', fn) // otra pestaña del navegador
  return () => { window.removeEventListener(AVISO, fn); window.removeEventListener('storage', fn) }
}
/* Para las pantallas que tienen que repintarse en cuanto cambia —la de configuración—. */
export const useConfigFicha = () => useSyncExternalStore(suscribir, configFicha, () => VACIA)

export const seccionActiva = id => !configFicha().inactivas.includes(id)

/* ── LAS SECCIONES PROPIAS ──────────────────────────────────────────────────
   Se guardan con lo mínimo —nombre, instrucción, la parte de la ficha donde van y sus campos— y
   `tarjetaPropia` las convierte en una tarjeta como las del estudio: `tarjetasDe` las suma al
   final de su parte y desde ahí las dibujan Nuevo colaborador, la ficha de RR.HH., Mi ficha y
   Editar perfil, con los mismos controles que cualquier otro campo.

   CADA CAMPO TIENE SU CLAVE PARA SIEMPRE: «<id de la sección>.<n>», con un contador que sólo
   sube. Borrar un campo y crear otro nunca le hereda los datos del anterior.

   LOS TIPOS SON LOS QUE YA EXISTEN EN LA FICHA, con su nombre de todos los días: el celular trae
   su código de país, la fecha su calendario, el archivo su recuadro. */
export const TIPOS_CAMPO = [
  { valor: 'texto', etiqueta: 'Texto corto' },
  { valor: 'textoLargo', etiqueta: 'Texto largo' },
  { valor: 'numero', etiqueta: 'Número' },
  { valor: 'fecha', etiqueta: 'Fecha' },
  { valor: 'lista', etiqueta: 'Lista de opciones' },
  { valor: 'siNo', etiqueta: 'Sí / No' },
  { valor: 'celular', etiqueta: 'Celular' },
  { valor: 'correo', etiqueta: 'Correo electrónico' },
  { valor: 'archivo', etiqueta: 'Archivo' },
]
export const opcionesDe = texto => String(texto || '').split('\n').map(s => s.trim()).filter(Boolean)

/* «Operativo» y no «Mínimo»: el mínimo es el legal, y una sección propia no lo es. */
export function descriptorDe(c) {
  const base = { key: c.key, label: c.label || 'Campo sin nombre', col: 'c-tercio', nivel: 'Operativo', requerido: !!c.requerido }
  switch (c.tipo) {
    case 'textoLargo': return { ...base, tipo: 'texto', col: 'c-todo' }
    case 'numero': return { ...base, numero: true }
    case 'fecha': return { ...base, html: 'date' }
    case 'lista': return { ...base, tipo: 'lista', opciones: opcionesDe(c.opciones) }
    case 'siNo': return { ...base, tipo: 'siNo' }
    case 'celular': return { ...base, html: 'tel', telefono: true, paisPorDefecto: 'BO' }
    case 'correo': return { ...base, html: 'email' }
    case 'archivo': return { ...base, tipo: 'archivo', acepta: 'application/pdf,image/*', pista: 'PDF o imagen · arrastrar o hacer clic' }
    default: return base
  }
}

export const tarjetaPropia = p => ({
  id: p.id, titulo: p.titulo, desc: p.desc || '', propia: true, campos: (p.campos || []).map(descriptorDe),
})
export const propiasDe = parte => configFicha().propias.filter(p => p.parte === parte)
export const todasLasPropias = () => configFicha().propias

/* ── LO QUE PUEDE HACER EL COLABORADOR ────────────────────────────────────
   SE LEEN CON SU TÍTULO DE COLUMNA: «Para el colaborador: Editable · Solo lectura · Oculta».
   Describen la SECCIÓN y no una acción, con los términos de siempre en los sistemas de RR.HH.
   Hubo dos versiones antes: «Oculto · Solo ver · Puede editar», que se leía como permisos de
   RR.HH. —quien mira la pantalla—, y «El colaborador puede: … No ver», donde «puede no ver»
   decía «quizás no la vea». Van de más a menos acceso (6 oct 2026). La pantalla les pone un
   ícono a cada uno: lápiz, ojo, ojo tachado. */
export const NIVELES_COLABORADOR = [
  { key: 'editar', label: 'Editable', pista: 'El colaborador la cambia él mismo desde Editar perfil' },
  { key: 'ver', label: 'Solo lectura', pista: 'El colaborador la ve en Mi ficha y pide a RR.HH. las correcciones' },
  { key: 'oculto', label: 'Oculta', pista: 'El colaborador no ve esta sección en Mi ficha' },
]

/* TOPE «SOLO VER»: lo laboral, lo que la empresa le entrega y el expediente. Son datos que la
   empresa registra y de los que dependen la planilla y las declaraciones: un colaborador no se
   cambia el haber, la fecha de su contrato ni el equipo que firmó. */
const TOPE_VER = new Set(['puesto', 'contrato', 'remuneracion', 'asistencia', 'recursos', 'expediente'])
export const puedeEditarse = parte => !TOPE_VER.has(parte)

/* EL VALOR DE PARTIDA es lo que la ficha hacía antes: su Información Personal y Familiar la edita
   él, lo demás lo ve. Si es un reingreso es un dato del trámite de RR.HH. y no se le enseña. */
const OCULTAS_DE_FABRICA = new Set(['reingreso'])
export function nivelDeFabrica(id, parte) {
  if (OCULTAS_DE_FABRICA.has(id)) return 'oculto'
  return parte === 'quien' || parte === 'entorno' ? 'editar' : 'ver'
}

export function nivelColaborador(id, parte) {
  if (!seccionActiva(id)) return 'oculto'
  const elegido = configFicha().colaborador[id] || nivelDeFabrica(id, parte)
  return elegido === 'editar' && !puedeEditarse(parte) ? 'ver' : elegido
}
