import { useAsistencia } from '../context/AsistenciaContext'
import { useMisDocumentos } from './useMisDocumentos'
import { useLocalStorage } from './useLocalStorage'
import { TIPOS_SOLICITUD as TIPOS_DOC } from '../data/documentacionData'
import { TIPOS_SOLICITUD, SUBTIPOS_PERMISO, TIPOS_MARCA, habilesDeSolicitud, textoDias, fechaCorta, aFecha, sumarDias, hoyISO } from '../data/asistenciaData'

/* ── TODO LO QUE LA PERSONA LE PIDIÓ A RR.HH., DE CUALQUIER MÓDULO ──
   Documentación (certificados, copias, correcciones) y Asistencia (vacaciones, permisos…) guardan sus
   solicitudes cada una a su manera; aquí se leen como una sola lista, con el mismo vocabulario:
   `pendiente`, `ok` (atendida o aprobada) o `no` (rechazada). La usan el inicio, para su línea de
   estado, y Mis solicitudes. Una respuesta es «nueva» si llegó en la última semana y la persona
   todavía no la vio. */

const rango = (desde, hasta) => {
  if (!hasta || desde === hasta) return fechaCorta(desde)
  return aFecha(desde).getMonth() === aFecha(hasta).getMonth() ? `${aFecha(desde).getDate()} – ${fechaCorta(hasta)}` : `${fechaCorta(desde)} – ${fechaCorta(hasta)}`
}

export function useMisPedidos(nombre) {
  const at = useAsistencia()
  const md = useMisDocumentos(nombre, 'app')
  const [vistas, setVistas] = useLocalStorage('inicio_respuestas_vistas', {})
  const hoy = hoyISO()
  const semana = sumarDias(hoy, -7)

  const deTiempo = at.solicitudes
    .filter(s => String(s.personaId) === String(at.yo.id))
    .map(s => {
      const permiso = SUBTIPOS_PERMISO.find(t => t.key === s.subtipo)
      const corto = s.tipo === 'vacaciones' ? 'vacación' : s.tipo === 'permiso' ? (permiso?.label || 'permiso').toLowerCase() : TIPOS_SOLICITUD[s.tipo]?.label.toLowerCase()
      const fechas = s.dias?.length ? textoDias(s.dias, at.yo.horario) : s.desde ? rango(s.desde, s.hasta) : s.fecha ? fechaCorta(s.fecha) : ''
      const n = s.desde && !s.horaDesde ? habilesDeSolicitud(s, at.yo.horario) : 0
      return {
        id: s.id, origen: 'asistencia', tipo: s.tipo, fecha: s.cuando, corto, dias: n, fechas,
        titulo: `${corto[0].toUpperCase()}${corto.slice(1)} ${fechas}`.trim(),
        detalle: n ? `${n} ${n === 1 ? 'día' : 'días'}` : s.horaDesde ? `${s.horaDesde} – ${s.horaHasta}` : s.tipo === 'correccion' && s.hora ? `${TIPOS_MARCA[s.marca]?.label || 'Marca'} a las ${s.hora}` : '',
        estado: s.estado === 'pendiente' ? 'pendiente' : s.estado === 'aprobada' ? 'ok' : s.estado === 'cancelada' ? 'cancelada' : 'no',
        nota: s.nota, respondida: s.respondida ? s.respondida.slice(0, 10) : null, motivo: s.motivo, original: s,
      }
    })
  /* Las horas extra que la persona pidió (las que RR.HH. le asigna no son pedidos suyos). */
  const deExtra = (at.horasExtra || [])
    .filter(x => String(x.personaId) === String(at.yo.id) && x.origen === 'solicitud')
    .map(x => ({
      id: x.id, origen: 'asistencia', tipo: 'extra', fecha: x.cuando || x.fecha, corto: 'horas extra', dias: 0, fechas: fechaCorta(x.fecha),
      titulo: `Horas extra ${fechaCorta(x.fecha)}`, detalle: `${x.desde} – ${x.hasta}`,
      estado: x.estado === 'pendiente' ? 'pendiente' : x.estado === 'rechazada' ? 'no' : 'ok',
      nota: x.nota, respondida: null, motivo: x.motivo, original: x,
    }))
  const deDocumentos = (md.misSolicitudes || []).map(q => ({
    id: q.id, origen: 'documentos', tipo: q.tipo, fecha: q.fecha, corto: (TIPOS_DOC[q.tipo]?.singular || 'solicitud').toLowerCase(),
    titulo: q.asunto, detalle: TIPOS_DOC[q.tipo]?.singular,
    estado: q.estado === 'pendiente' ? 'pendiente' : q.estado === 'rechazada' ? 'no' : 'ok',
    nota: q.resuelto?.nota, respondida: q.resuelto?.fecha || null, original: q,
  }))

  const todos = [...deTiempo, ...deExtra, ...deDocumentos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  const pendientes = todos.filter(p => p.estado === 'pendiente')
  const nuevas = todos
    .filter(p => p.estado !== 'pendiente' && p.respondida && p.respondida >= semana && !vistas[p.id])
    .sort((a, b) => (a.respondida < b.respondida ? 1 : -1))
  const marcarVista = id => setVistas(v => ({ ...v, [id]: true }))

  return { todos, pendientes, nuevas, marcarVista, md }
}
