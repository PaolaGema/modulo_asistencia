import { aMin, hhmm, duracion, franjasPausa, horarioDelDia } from '../data/asistenciaData'

/* ── CORREGIR SU DÍA (propuesta «Corregir una marcación», rondas 4 y 5, aplicada el 5 nov 2026) ──
   La persona no elige un «tipo de error»: ve su día —las marcas que su horario espera ese día, más las que
   hizo de más— y lo corrige. Una solicitud de corrección guarda una lista de `cambios`:
     { tipo, hora, antes, marcaId }   cambiar la hora de una marca que existe (marcaId) o agregar la que falta
     { tipo, antes, marcaId, quitar } quitar una marca de más
   Al aprobarse, cada cambio se aplica sobre la marca existente (no se agrega otra encima). */

export const NOMBRE_MARCA = { entrada: 'Entrada', pausa_inicio: 'Salida a descansar', pausa_fin: 'Vuelta del descanso', salida: 'Salida' }
const PREGUNTA = { entrada: '¿A qué hora entró?', pausa_inicio: '¿A qué hora salió a descansar?', pausa_fin: '¿A qué hora volvió?', salida: '¿A qué hora salió?' }
export const preguntaDe = t => PREGUNTA[t] || 'Hora'

/* Las solicitudes viejas guardaban una sola marca (`marca`, `hora`): se leen como un cambio. */
export const cambiosDe = s => s.cambios?.length ? s.cambios : s.marca ? [{ tipo: s.marca, hora: s.hora, antes: null, marcaId: null }] : []

/* Las marcas que su horario espera ese día, en orden, cada una con la marca que la cumple (o ninguna), y
   aparte las que sobran. Turno con descanso: entrada, salida a descansar, vuelta y salida (una pareja por
   cada descanso). Sin descanso marcado: entrada y salida. */
export function ranurasDelDia(at, p, fecha) {
  const h = horarioDelDia(p?.horarioBase || p?.horario, fecha)
  const validas = (at.jornadaDe(p, fecha).marcas || []).filter(m => !m.rechazada && !m.anulada)
  const franjas = franjasPausa(h)
  const tienePausa = franjas.length > 0 || validas.some(m => m.tipo === 'pausa_inicio' || m.tipo === 'pausa_fin')
  const esperadas = [{ tipo: 'entrada', sugerida: h?.modo === 'fijo' ? h.entrada : null }]
  const pares = Math.max(franjas.length, tienePausa ? 1 : 0)
  for (let i = 0; i < pares; i++) {
    const f = franjas[i]
    const ord = pares > 1 ? ` ${i + 1}` : ''
    esperadas.push({ tipo: 'pausa_inicio', sufijo: ord, sugerida: f ? hhmm(f.desde) : null })
    esperadas.push({ tipo: 'pausa_fin', sufijo: ord, sugerida: f ? hhmm(f.hasta) : null })
  }
  esperadas.push({ tipo: 'salida', sugerida: h?.modo === 'fijo' ? h.salida : null })
  const usadas = new Set()
  const filas = esperadas.map((e, i) => {
    const m = validas.find(x => x.tipo === e.tipo && !usadas.has(x.id))
    if (m) usadas.add(m.id)
    return { key: `${e.tipo}-${i}`, tipo: e.tipo, nombre: `${NOMBRE_MARCA[e.tipo]}${e.sufijo || ''}`, marca: m || null, sugerida: e.sugerida }
  })
  const extras = validas.filter(m => !usadas.has(m.id))
  return { filas, extras, horario: h }
}

/* El día después de los cambios: las marcas de hoy con las horas nuevas, sin las quitadas y con las agregadas. */
export function aplicarCambios(marcas, cambios) {
  const porId = new Map(cambios.filter(c => c.marcaId).map(c => [c.marcaId, c]))
  const quedan = (marcas || []).filter(m => !m.rechazada && !m.anulada && !porId.get(m.id)?.quitar)
    .map(m => (porId.has(m.id) ? { ...m, min: aMin(porId.get(m.id).hora) } : m))
  const nuevas = cambios.filter(c => !c.marcaId && !c.quitar).map((c, i) => ({ id: `sim-${i}`, tipo: c.tipo, min: aMin(c.hora), origen: 'panel' }))
  return [...quedan, ...nuevas].sort((a, b) => a.min - b.min)
}

/* Lo que cambia si se aprueba, dicho en palabras: atraso, salida antes, pausa y horas trabajadas. */
export function efectoDeCambios(at, p, fecha, cambios) {
  if (!cambios.length) return []
  const antes = at.jornadaDe(p, fecha)
  const despues = at.simularDia(p, fecha, aplicarCambios(antes.marcas, cambios))
  const t = []
  const dif = (a, b, menos, mas) => { if (a > b) t.push(`${menos} ${duracion(a - b)}`); else if (b > a) t.push(`${mas} ${duracion(b - a)}`) }
  dif(antes.tardanza || 0, despues.tardanza || 0, 'Quita', 'Suma')
  if (t.length) t[t.length - 1] += ' de atraso'
  const n = t.length
  dif(antes.anticipada || 0, despues.anticipada || 0, 'Quita', 'Suma')
  if (t.length > n) t[t.length - 1] += ' de salida antes de hora'
  const n2 = t.length
  dif(antes.excesoPausa || 0, despues.excesoPausa || 0, 'Quita', 'Suma')
  if (t.length > n2) t[t.length - 1] += ' de descanso excedido'
  if (antes.salida == null && despues.salida != null) t.push('Completa su día')
  if (Math.abs((despues.trabajado || 0) - (antes.trabajado || 0)) >= 1 && antes.salida != null) {
    const d = (despues.trabajado || 0) - (antes.trabajado || 0)
    t.push(`${d > 0 ? 'Suma' : 'Resta'} ${duracion(Math.abs(d))} trabajadas`)
  }
  return t.length ? t : ['No cambia sus horas: solo deja el registro correcto']
}

/* Cuánto mueve el cambio más grande, en minutos: desde 15 se pide cómo comprobarlo. */
export const mayorCambio = cambios => Math.max(0, ...cambios.filter(c => !c.quitar && c.antes).map(c => Math.abs(aMin(c.hora) - aMin(c.antes))))

/* Se pide cómo comprobarlo cuando el cambio pesa: mueve una marca más de 15 min o quita más de 15 min de
   atraso, de salida antes de hora o de descanso excedido. */
export function pideRespaldo(at, p, fecha, cambios) {
  if (!cambios.length) return false
  if (mayorCambio(cambios) > 15) return true
  const antes = at.jornadaDe(p, fecha)
  const despues = at.simularDia(p, fecha, aplicarCambios(antes.marcas, cambios))
  return ['tardanza', 'anticipada', 'excesoPausa'].some(k => (antes[k] || 0) - (despues[k] || 0) > 15)
}
