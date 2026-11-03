import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useOnboardingData } from './OnboardingDataContext'
import { useDocumentacion } from './DocumentacionContext'
import { useUser } from './UserContext'
import {
  HORARIOS_SEED, POLITICAS_SEED, GEOCERCAS_SEED, CENTROS_RESPALDO, asignacionesSeed, biometriaSeed,
  unidadDe, marcasSembradas, recomputar, exigencias, hoyISO, sumarDias, minutosAhora, distanciaM,
  horasExtraSeed, esAutorizada, aMin, solicitudesSeed, historialDemo, TIPOS_SOLICITUD, SUBTIPOS_PERMISO,
  reglasDe, alSegundo, MOTIVOS_JUSTIFICACION, relojDemo,
} from '../data/asistenciaData'

/* ── EL ESTADO DEL MÓDULO DE ASISTENCIA ───────────────────────────────────
   Un solo lugar guarda la configuración (horarios, políticas, geocercas, asignaciones) y lo que
   RR.HH. hizo sobre los días (marcas manuales, ajustes, justificaciones, horas extra decididas).
   Las marcaciones sembradas NO se guardan: salen de una semilla por persona y día, y encima se
   aplica lo guardado. Así la demo pesa poco y recargar no cambia la historia.

   LA GENTE Y LOS LUGARES NO SON DE ESTE MÓDULO. Las personas son las del directorio (con su
   sucursal, ya resuelta por Documentación) y los lugares son las sucursales y los centros de
   trabajo de Organización. Asistencia sólo les pone encima un horario, una política y una
   geocerca. */

const Ctx = createContext(null)
const DIAS_HISTORIA = 75
/* Lo que RR.HH. todavía tiene que decidir. Más atrás, la demo lo da por resuelto: las horas extra
   de hace un mes ya las aprobó cada jefe en su momento. */
const DIAS_PENDIENTES = 10

export function AsistenciaProvider({ children }) {
  const { sucursales, nodos } = useOnboardingData()
  const doc = useDocumentacion()
  const { currentUser } = useUser()

  /* ── LOS LUGARES DE MARCACIÓN: sucursales y centros de trabajo de Organización ── */
  const [geocercas, setGeocercas] = useLocalStorage('at_geocercas', GEOCERCAS_SEED)
  const lugares = useMemo(() => {
    const deNodos = (nodos || []).filter(n => n.tipo === 'sucursal' || n.tipo === 'centro')
    const sucs = [
      ...sucursales.map(s => ({ id: s.id, tipo: 'sucursal', nombre: s.nombre, ciudad: s.ciudad, direccion: s.direccion, estado: s.estado || 'activa' })),
      ...deNodos.filter(n => n.tipo === 'sucursal' && !sucursales.some(s => s.id === n.id)).map(n => ({ id: n.id, tipo: 'sucursal', nombre: n.nombre, ciudad: n.ciudad, direccion: n.direccion, estado: n.estado || 'activa' })),
    ]
    const centrosNodos = deNodos.filter(n => n.tipo === 'centro')
    const centros = (centrosNodos.length ? centrosNodos : CENTROS_RESPALDO).map(n => {
      const suc = sucs.find(s => s.id === n.padreId)
      return { id: n.id, tipo: 'centro', nombre: n.nombre, sucursalId: suc?.id || null, ciudad: suc?.ciudad || n.ciudad || '', direccion: n.direccion, tipoCentro: n.tipoCentro || 'Centro de trabajo', estado: n.estado || 'activa', respaldo: !centrosNodos.length }
    })
    return [...sucs, ...centros].map(l => ({ ...l, geo: geocercas[l.id] || null }))
  }, [sucursales, nodos, geocercas])
  const lugarPorId = useMemo(() => new Map(lugares.map(l => [l.id, l])), [lugares])
  const centros = useMemo(() => lugares.filter(l => l.tipo === 'centro'), [lugares])

  /* ── LA GENTE ── */
  const personasBase = useMemo(
    () => (doc?.personas || []).filter(p => p.status !== 'desvinculado').map(p => ({ ...p, unidad: unidadDe(p) })),
    [doc?.personas],
  )

  const [horarios, setHorarios] = useLocalStorage('at_horarios', HORARIOS_SEED)
  const [politicas, setPoliticas] = useLocalStorage('at_politicas', POLITICAS_SEED)
  const [asignaciones, setAsignaciones] = useLocalStorage('at_asignaciones', null)
  const [biometria, setBiometria] = useLocalStorage('at_biometria', null)
  const [marcasExtra, setMarcasExtra] = useLocalStorage('at_marcas', [])
  const [ajustes, setAjustes] = useLocalStorage('at_ajustes', {})
  const [justificaciones, setJustificaciones] = useLocalStorage('at_justificaciones', {})
  /* Las horas extra autorizadas (o por autorizar): solicitudes y asignaciones. Ver ESTADOS_EXTRA. */
  const [horasExtra, setHorasExtra] = useLocalStorage('at_horas_extra', null)
  /* Vacaciones, permisos y licencias, correcciones de marcación, trabajo remoto y cambios de turno. */
  const [solicitudes, setSolicitudes] = useLocalStorage('at_solicitudes', null)
  const [descartadas, setDescartadas] = useLocalStorage('at_descartadas', {})
  /* A quién ya se le sembró su historial de ejemplo (ver historialDemo). */
  const [conHistorial, setConHistorial] = useLocalStorage('at_historial_demo', {})
  const [generalesGuardados, setAjustesGenerales] = useLocalStorage('at_generales', {})
  /* Los avisos al colaborador (#15) y el plazo para justificar (#14) se agregaron después: quien ya
     tenía ajustes guardados recibe estos valores por defecto. */
  const ajustesGenerales = useMemo(() => ({
    retencionSelfies: 90, plazoRespuesta: 48, exigirMotivoManual: true,
    avisar: { tarde: true, pausa: true, anticipada: true, sinPausa: false, ausente: true },
    avisarDesde: 5, plazoJustificar: 2,
    ...generalesGuardados,
  }), [generalesGuardados])
  /* Quién ya recibió sus justificaciones de ejemplo. */
  const [justSembradas, setJustSembradas] = useLocalStorage('at_just_demo', false)

  /* Las semillas se escriben la primera vez que hay gente que sembrar. */
  useEffect(() => {
    if (!personasBase.length) return
    if (!asignaciones) setAsignaciones(asignacionesSeed(personasBase, centros))
    if (!biometria) setBiometria(biometriaSeed(personasBase))
  }, [personasBase, centros, asignaciones, biometria, setAsignaciones, setBiometria])

  const horarioPorId = useMemo(() => new Map(horarios.map(h => [h.id, h])), [horarios])
  const politicaPorId = useMemo(() => new Map(politicas.map(p => [p.id, p])), [politicas])
  const politicaDefecto = politicas.find(p => p.porDefecto) || politicas[0]

  const personas = useMemo(() => personasBase.map(p => {
    const asig = asignaciones?.[p.id] || null
    const lugar = asig ? lugarPorId.get(asig.lugarId) : null
    const sucursalId = lugar?.tipo === 'centro' ? lugar.sucursalId : lugar?.id || p.sede
    return {
      ...p, asig, lugar,
      sucursalId,
      centroId: lugar?.tipo === 'centro' ? lugar.id : null,
      horario: asig ? horarioPorId.get(asig.horarioId) || null : null,
      politica: asig ? politicaPorId.get(asig.politicaId) || politicaDefecto : null,
      bio: biometria?.[p.id] || null,
    }
  }), [personasBase, asignaciones, lugarPorId, horarioPorId, politicaPorId, politicaDefecto, biometria])
  const personaPorId = useMemo(() => new Map(personas.map(p => [String(p.id), p])), [personas])
  useEffect(() => {
    if (!horasExtra && personas.some(p => p.horario)) setHorasExtra(horasExtraSeed(personas))
    if (!solicitudes && personas.some(p => p.horario)) setSolicitudes(solicitudesSeed(personas))
  }, [horasExtra, solicitudes, personas, setHorasExtra, setSolicitudes])

  /* QUIÉN SOY: la persona del directorio que coincide con la sesión. Sale antes que las marcas
     porque hoy, la persona de la sesión marca ella misma y no se le siembra nada. */
  const yoBase = useMemo(() => {
    const dos = s => (s || '').split(' ').slice(0, 2).join(' ').toLowerCase()
    return personas.find(x => x.name === currentUser.name) || personas.find(x => dos(x.name) === dos(currentUser.name)) || null
  }, [personas, currentUser.name])
  const yoId = yoBase ? String(yoBase.id) : `u${currentUser.id}`

  /* ── EL RELOJ DE LA DEMO ── cada 20 s, para que «Hoy» se mueva solo. */
  const [tic, setTic] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setTic(Date.now()), 20000); return () => clearInterval(t) }, [])
  const hoy = useMemo(() => hoyISO(), [tic]) // eslint-disable-line react-hooks/exhaustive-deps

  /* UN DÍA ESTÁ JUSTIFICADO por RR.HH. a mano, o por unas vacaciones, un permiso de día completo o una
     licencia ya aprobados. Un permiso por horas no justifica el día entero. */
  const justificacionDe = useCallback((pid, fecha) => {
    const j = justificaciones[`${pid}|${fecha}`]
    if (j) return j
    const s = (solicitudes || []).find(x => x.estado === 'aprobada' && String(x.personaId) === String(pid) && TIPOS_SOLICITUD[x.tipo]?.justifica && !x.horaDesde && fecha >= x.desde && fecha <= x.hasta)
    if (!s) return null
    const tipo = s.tipo === 'vacaciones' ? 'Vacaciones' : SUBTIPOS_PERMISO.find(t => t.key === s.subtipo)?.label || 'Permiso'
    return { tipo, motivo: s.motivo, por: s.respondio || 'RR.HH.', automatica: true, solicitudId: s.id }
  }, [justificaciones, solicitudes])
  /* Trabajo remoto aprobado para ese día: no se exige la geocerca. */
  const remotoAprobado = useCallback((pid, fecha) => (solicitudes || []).some(x => x.tipo === 'remoto' && x.estado === 'aprobada' && String(x.personaId) === String(pid) && fecha >= x.desde && fecha <= x.hasta), [solicitudes])
  const exigenciasDe = useCallback((p, fecha) => {
    const ex = exigencias(p?.asig, p?.horario, p?.politica, fecha)
    return remotoAprobado(p?.id, fecha) ? { ...ex, remotoHoy: true, geocerca: false } : ex
  }, [remotoAprobado])

  /* Las ventanas autorizadas de una persona en un día, en minutos: lo único que vuelve «extra» lo trabajado. */
  const ventanasDe = useCallback((pid, fecha) => (horasExtra || [])
    .filter(x => String(x.personaId) === String(pid) && x.fecha === fecha && esAutorizada(x))
    .map(x => ({ desde: aMin(x.desde), hasta: aMin(x.hasta) })), [horasExtra])

  /* LO QUE LA PERSONA JUSTIFICÓ Y SU JEFE ACEPTÓ, por alerta, para un día (#13). */
  const justificadasDe = useCallback((pid, fecha) => {
    const r = {}
    for (const s of solicitudes || []) {
      if (s.tipo !== 'justificacion' || s.estado !== 'aprobada' || s.fecha !== fecha || String(s.personaId) !== String(pid)) continue
      r[s.alerta] = { motivo: s.motivo, categoria: s.categoria, por: s.respondio, solicitudId: s.id }
      /* Justificar el descanso cubre las dos caras del mismo hecho: salir/volver fuera de la franja y excederse. */
      if (s.alerta === 'pausaExceso' || s.alerta === 'pausaRetorno') { r.pausaExceso = r[s.alerta]; r.pausaRetorno = r[s.alerta] }
    }
    return r
  }, [solicitudes])

  /* ── LAS MARCAS DE UN DÍA: sembradas + manuales, con los ajustes aplicados ── */
  const marcasDe = useCallback((p, fecha) => {
    if (!p) return []
    const desde = sumarDias(hoy, -DIAS_HISTORIA)
    const esHoy = fecha === hoy
    const base = fecha < desde || fecha > hoy || (p.asig && fecha < p.asig.desde)
      ? []
      : (esHoy && String(p.id) === yoId) ? []
        /* Quien tiene vacaciones, permiso o licencia ese día no marca: no se le siembra nada. */
        : justificacionDe(p.id, fecha) ? []
        : marcasSembradas(p, p.asig, p.horario, p.politica, p.lugar, fecha, esHoy ? minutosAhora() : Infinity, ventanasDe(p.id, fecha)[0] || null)
    const propias = marcasExtra.filter(m => String(m.personaId) === String(p.id) && m.fecha === fecha)
    return [...base, ...propias]
      .map(m => {
        const a = ajustes[m.id]
        return a ? { ...m, original: m.min, min: a.anulada ? m.min : a.min, anulada: !!a.anulada, ajuste: a } : m
      })
      .sort((a, b) => a.min - b.min)
  }, [hoy, marcasExtra, ajustes, yoId, justificacionDe, ventanasDe])

  const jornadaDe = useCallback((p, fecha) => {
    const marcas = marcasDe(p, fecha)
    const esHoy = fecha === hoy
    const j = recomputar({
      marcas, horario: p?.horario, reglas: reglasDe(p?.politica), fecha,
      justificacion: justificacionDe(p?.id, fecha), esHoy, minAhora: minutosAhora(), ventanas: ventanasDe(p?.id, fecha),
      justificadas: justificadasDe(p?.id, fecha),
    })
    if (!p?.asig || !p?.horario) j.estado = 'libre'
    return { ...j, marcas, fecha, persona: p, justificacion: justificacionDe(p?.id, fecha), horasExtra: (horasExtra || []).filter(x => String(x.personaId) === String(p?.id) && x.fecha === fecha), rechazadas: marcas.filter(m => m.rechazada) }
  }, [marcasDe, hoy, justificacionDe, justificadasDe, ventanasDe, horasExtra, tic]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Sin ficha en el directorio, una de paso con el horario de oficina en la casa matriz. */
  const yo = useMemo(() => {
    if (yoBase) return { ...yoBase, esYo: true }
    const lugar = lugarPorId.get('central')
    return {
      id: `u${currentUser.id}`, name: currentUser.name, initials: currentUser.initials, color: currentUser.color, cargo: currentUser.cargo,
      unidad: currentUser.area || 'Recursos Humanos', sucursalId: 'central', sedeNombre: lugar?.nombre, esYo: true,
      asig: { personaId: `u${currentUser.id}`, horarioId: 'h-oficina', lugarId: 'central', modalidad: 'presencial', politicaId: null, diasOficina: [], desde: '2026-01-01' },
      lugar, horario: horarioPorId.get('h-oficina'), politica: politicaDefecto,
      bio: biometria?.[`u${currentUser.id}`] || null,
    }
  }, [yoBase, currentUser, lugarPorId, horarioPorId, politicaDefecto, biometria])
  useEffect(() => {
    if (!solicitudes || !yo.horario || conHistorial[yo.id]) return
    setConHistorial(h => ({ ...h, [yo.id]: true }))
    setSolicitudes(prev => [...(prev || []), ...historialDemo(yo, hoy)])
  }, [solicitudes, yo, hoy, conHistorial, setConHistorial, setSolicitudes])

  /* ── ACCIONES ── */
  const nuevaId = () => `mx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

  /* Marcar desde el teléfono o la web: la hora la pone «el servidor» (el reloj de aquí), nunca el
     dispositivo. La geocerca y el rostro llegan ya evaluados por el flujo de captura. */
  const marcar = useCallback((p, tipo, { lat, lng, score } = {}) => {
    const ex = exigenciasDe(p, hoyISO())
    const geo = p.lugar?.geo
    const dist = geo && lat != null ? Math.round(distanciaM({ lat, lng }, geo)) : null
    const m = {
      id: nuevaId(), personaId: p.id, fecha: hoyISO(), tipo, min: alSegundo(minutosAhora()),
      lat: lat ?? null, lng: lng ?? null, distancia: dist,
      dentro: ex.geocerca ? dist != null && dist <= (p.politica?.radio || geo?.radio || 150) : null,
      score: ex.rostro ? score ?? null : null, origen: 'app', remoto: ex.remotoHoy, nueva: true,
    }
    setMarcasExtra(prev => [...prev, m])
    setTic(Date.now())
    return m
  }, [setMarcasExtra, exigenciasDe])

  const marcaManual = useCallback(({ personaId, fecha, tipo, min, motivo }) => {
    setMarcasExtra(prev => [...prev, {
      id: nuevaId(), personaId, fecha, tipo, min, origen: 'panel', motivo, por: currentUser.name,
      cuando: new Date().toISOString(), lat: null, lng: null, distancia: null, dentro: null, score: null,
    }])
  }, [setMarcasExtra, currentUser.name])

  const ajustar = useCallback((marcaId, min, motivo) => setAjustes(prev => ({ ...prev, [marcaId]: { min, motivo, por: currentUser.name, cuando: new Date().toISOString() } })), [setAjustes, currentUser.name])
  const anular = useCallback((marcaId, motivo) => setAjustes(prev => ({ ...prev, [marcaId]: { anulada: true, motivo, por: currentUser.name, cuando: new Date().toISOString() } })), [setAjustes, currentUser.name])
  const justificar = useCallback((pid, fecha, tipo, motivo) => setJustificaciones(prev => ({ ...prev, [`${pid}|${fecha}`]: { tipo, motivo, por: currentUser.name, cuando: new Date().toISOString() } })), [setJustificaciones, currentUser.name])
  /* ── SOLICITUDES ── la persona pide, RR.HH. responde. Aprobar aplica su efecto en el mismo paso. */
  const crearSolicitud = useCallback(datos => setSolicitudes(prev => [{ id: `so-${Date.now().toString(36)}`, estado: 'pendiente', cuando: hoyISO(), canal: 'app', ...datos }, ...(prev || [])]), [setSolicitudes])
  /* La persona retira una solicitud que todavía espera respuesta. Lo aprobado no se cancela desde aquí. */
  const cancelarSolicitud = useCallback(id => setSolicitudes(prev => (prev || []).map(x => (x.id === id && x.estado === 'pendiente' ? { ...x, estado: 'cancelada', cancelada: new Date().toISOString() } : x))), [setSolicitudes])
  const responderSolicitud = useCallback((id, estado, nota = '') => {
    const s = (solicitudes || []).find(x => x.id === id)
    if (!s) return
    if (estado === 'aprobada' && s.tipo === 'correccion') marcaManual({ personaId: s.personaId, fecha: s.fecha, tipo: s.marca, min: aMin(s.hora), motivo: `Corrección pedida por la persona: ${s.motivo}` })
    /* `respondida` dice cuándo: el inicio de la persona avisa de las respuestas nuevas, no de las de la semilla. */
    setSolicitudes(prev => (prev || []).map(x => (x.id === id ? { ...x, estado, nota, respondio: currentUser.name, respondida: new Date().toISOString() } : x)))
  }, [solicitudes, setSolicitudes, marcaManual, currentUser.name])

  /* ── HORAS EXTRA ── la persona pide, RR.HH. asigna; RR.HH. aprueba, la persona acepta. */
  const nuevaExtra = (datos, origen, estado) => ({ id: `hx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, origen, estado, cuando: hoyISO(), ...datos })
  const solicitarExtra = useCallback(datos => setHorasExtra(prev => [nuevaExtra({ ...datos, por: datos.por }, 'solicitud', 'pendiente'), ...(prev || [])]), [setHorasExtra])
  const asignarExtra = useCallback((ids, datos) => setHorasExtra(prev => [...ids.map(id => nuevaExtra({ ...datos, personaId: id, por: currentUser.name }, 'asignacion', 'asignada')), ...(prev || [])]), [setHorasExtra, currentUser.name])
  const responderExtra = useCallback((id, estado, nota = '') => setHorasExtra(prev => (prev || []).map(x => (x.id === id ? { ...x, estado, nota, respondio: currentUser.name } : x))), [setHorasExtra, currentUser.name])
  /* Autorizar después del día: para lo que no se pudo pedir a tiempo. Queda dicho que fue posterior. */
  const autorizarDespues = useCallback(({ personaId, fecha, desde, hasta, motivo }) => setHorasExtra(prev => [nuevaExtra({ personaId, fecha, desde, hasta, motivo, por: currentUser.name, respondio: currentUser.name }, 'posterior', 'aprobada'), ...(prev || [])]), [setHorasExtra, currentUser.name])
  const descartar = useCallback(id => setDescartadas(prev => ({ ...prev, [id]: true })), [setDescartadas])

  const asignar = useCallback((ids, datos) => setAsignaciones(prev => {
    const n = { ...(prev || {}) }
    ids.forEach(id => { n[id] = { ...(n[id] || { desde: hoyISO(), diasOficina: [], modalidad: 'presencial', politicaId: null }), ...datos, personaId: id } })
    return n
  }), [setAsignaciones])
  const quitarAsignacion = useCallback(ids => setAsignaciones(prev => { const n = { ...(prev || {}) }; ids.forEach(id => delete n[id]); return n }), [setAsignaciones])
  const setGeocerca = useCallback((id, geo) => setGeocercas(prev => ({ ...prev, [id]: geo })), [setGeocercas])
  const actualizarBio = useCallback((pid, datos) => setBiometria(prev => ({ ...(prev || {}), [pid]: { ...((prev || {})[pid] || {}), ...datos } })), [setBiometria])

  /* LA DEMO DEL VIERNES: la persona de la sesión ya marcó su entrada y su descanso hoy, como
     cualquiera a las 16:10. Solo con el reloj de demo y una vez (la marca la deja `cargarDemoAsistencia`). */
  const [demoYo, setDemoYo] = useLocalStorage('at_demo_yo', true)
  useEffect(() => {
    if (demoYo !== false || !relojDemo || !yo?.horario) return
    setDemoYo(true)
    const geo = yo.lugar?.geo
    const m = (tipo, hms, dist) => ({ id: `mx-demo-yo-${tipo}`, personaId: yo.id, fecha: hoy, tipo, min: aMin(hms), lat: geo?.lat ?? null, lng: geo?.lng ?? null, distancia: dist, dentro: true, score: 0.93, origen: 'app', remoto: false })
    setMarcasExtra(prev => [...prev.filter(x => !String(x.id).startsWith('mx-demo-yo-')), m('entrada', '08:27:41', 14), m('pausa_inicio', '13:01:12', 22), m('pausa_fin', '13:57:30', 9)])
  }, [demoYo, yo, hoy, setDemoYo, setMarcasExtra])

  /* JUSTIFICACIONES DE EJEMPLO: unas cuantas tardanzas y descansos excedidos de los últimos días ya
     tienen su motivo enviado desde la app, para que la bandeja tenga qué mostrar. Se siembran una vez. */
  useEffect(() => {
    if (justSembradas || !solicitudes || !personas.some(p => p.horario)) return
    const nuevas = []
    for (let i = 1; i <= 4 && nuevas.length < 9; i++) {
      const fecha = sumarDias(hoy, -i)
      for (const p of personas) {
        if (nuevas.length >= 9 || !p.asig || p.id % 3) continue
        const a = jornadaDe(p, fecha).alertas.find(x => ['tarde', 'pausaExceso', 'anticipada'].includes(x.tipo) && x.min >= 5)
        if (!a) continue
        const n = nuevas.length
        const categoria = MOTIVOS_JUSTIFICACION[(p.id + i) % 7]
        const textos = { 'Transporte o tráfico': 'El micro se quedó en el puente', 'Bloqueo o marcha': 'Había bloqueo en la avenida', Salud: 'Fui a la farmacia por un remedio', 'Trámite personal': 'Pasé por el banco', 'Asunto familiar': 'Dejé a mi hijo en el colegio', Clima: 'Llovió fuerte y no había transporte', 'Pedido de mi jefe': 'Mi jefe me pidió pasar por un cliente' }
        nuevas.push({
          id: `so-just-${p.id}-${fecha}`, tipo: 'justificacion', personaId: p.id, fecha, alerta: a.tipo, minutos: a.min,
          categoria, motivo: textos[categoria], cuando: sumarDias(fecha, 1), canal: 'app', avisada: fecha,
          estado: n < 6 ? 'pendiente' : n < 8 ? 'aprobada' : 'rechazada',
          ...(n >= 6 ? { respondio: 'Juan Pérez Gómez', respondida: sumarDias(fecha, 1), nota: n >= 8 ? 'Es la tercera vez este mes; queda como tardanza.' : '' } : {}),
        })
      }
    }
    setJustSembradas(true)
    /* En modo estricto el efecto corre dos veces antes de guardar la marca: no se repite ninguna. */
    if (nuevas.length) setSolicitudes(prev => [...nuevas.filter(x => !(prev || []).some(y => y.id === x.id)), ...(prev || [])])
  }, [justSembradas, solicitudes, personas, hoy, jornadaDe, setJustSembradas, setSolicitudes])

  /* ── LO QUE ESPERA A RR.HH. ── los últimos 10 días, sin contar hoy: lo más viejo ya lo resolvió
     cada jefe en su momento (en la demo, se da por revisado). */
  const incidencias = useMemo(() => {
    const lista = []
    for (let i = 1; i <= DIAS_PENDIENTES; i++) {
      const fecha = sumarDias(hoy, -i)
      for (const p of personas) {
        if (!p.asig) continue
        const j = jornadaDe(p, fecha)
        const k = `${p.id}|${fecha}`
        /* Se quedó sin autorización: no se paga, pero RR.HH. puede autorizarlo después si correspondía. */
        if (j.fueraDeHorario >= 30) lista.push({ id: `fuera|${k}`, tipo: 'fuera', persona: p, fecha, jornada: j })
        if (j.estado === 'incompleta') lista.push({ id: `incompleta|${k}`, tipo: 'incompleta', persona: p, fecha, jornada: j })
        if (j.estado === 'ausente') lista.push({ id: `ausente|${k}`, tipo: 'ausente', persona: p, fecha, jornada: j })
        /* TARDANZAS, DESCANSOS Y SALIDAS ANTICIPADAS SIN JUSTIFICAR (#5, #6, #7, #13). Se le avisó a la
           persona; mientras no mande su motivo o su jefe no lo acepte, cuentan como injustificadas. */
        const pendientes = j.alertas.filter(a => !a.justificacion && a.min >= (ajustesGenerales.avisarDesde || 0))
        if (pendientes.length) {
          const pedido = (solicitudes || []).find(s => s.tipo === 'justificacion' && s.fecha === fecha && String(s.personaId) === String(p.id) && s.estado !== 'cancelada')
          /* ¿Se le avisó? Depende de Configuración › Avisos: «sin descanso» viene apagado. */
          const grupo = t => (t.startsWith('pausa') ? 'pausa' : t)
          const avisada = pendientes.some(a => ajustesGenerales.avisar?.[grupo(a.tipo)] !== false)
          lista.push({ id: `alerta|${k}`, tipo: 'alerta', persona: p, fecha, jornada: j, alertas: pendientes, pedido, avisada })
        }
        for (const r of j.rechazadas) lista.push({ id: `rechazo|${r.id}`, tipo: 'rechazo', persona: p, fecha, jornada: j, marca: r })
      }
    }
    return lista.filter(x => !descartadas[x.id]).sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  }, [personas, jornadaDe, hoy, descartadas, solicitudes, ajustesGenerales.avisarDesde, ajustesGenerales.avisar])

  const value = {
    hoy, tic, lugares, lugarPorId, centros, personas, personaPorId, yo,
    horarios, setHorarios, horarioPorId, politicas, setPoliticas, politicaPorId, politicaDefecto,
    asignaciones: asignaciones || {}, asignar, quitarAsignacion, geocercas, setGeocerca,
    biometria: biometria || {}, actualizarBio, ajustesGenerales, setAjustesGenerales,
    marcasDe, jornadaDe, justificacionDe, justificadasDe, incidencias,
    marcar, marcaManual, ajustar, anular, justificar, descartar, marcasExtra,
    solicitudes: solicitudes || [], crearSolicitud, responderSolicitud, cancelarSolicitud, exigenciasDe,
    horasExtra: horasExtra || [], solicitarExtra, asignarExtra, responderExtra, autorizarDespues,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAsistencia = () => useContext(Ctx)
