import { useAsistencia } from '../../context/AsistenciaContext'
import { Sello } from '../layout/VacacionPhone'
import { MESES, aFecha, aMin, hhmm, fechaLarga, mesDe, minutosAhora } from '../../data/asistenciaData'
import { ranurasDelDia, cambiosDe, efectoDeCambios, NOMBRE_MARCA } from '../../utils/correccion'

/* LA SOLICITUD DE CORRECCIÓN, COMO DOCUMENTO (propuesta «Corregir una marcación · El informe», aprobada el
   5 nov 2026). La misma papeleta de la vacación y el permiso: datos del trabajador, su día antes y después
   —las marcas que su horario espera, con cada cambio en verde—, lo que contó la persona y cómo se puede
   comprobar, el efecto que calcula el sistema y las firmas. La persona la lee antes de enviarla («Revise su
   solicitud») y RR.HH. la ve igual al revisarla. */

const P = { navy: '#0C2D40', menta: '#00E091', mentaTxt: '#0A7F55', gris: '#6B7C8A', suave: '#9AABBB', borde: '#E6ECF1', linea: '#EEF2F5', fondoMenta: '#F3FBF7', ambar: '#7A4A06', fondoAmbar: '#FFF8EA' }
const corta = s => `${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)} ${s.slice(0, 4)}`
const nombreDe = t => NOMBRE_MARCA[t] || 'Marca'
const punto = t => t.replace(/\.?\s*$/, '.')

export default function PapeletaCorreccion({ s, persona, empresa, numero, firma }) {
  const at = useAsistencia()
  const todas = ranurasDelDia(at, persona, s.fecha)
  const { extras, horario: h } = todas
  /* Pedida para hoy, las marcas cuya hora todavía no llegó no van en la papeleta: se marcan a su hora. */
  const ahoraMin = minutosAhora()
  const filas = todas.filas.filter(f => s.fecha !== at.hoy || f.marca || cambiosDe(s).some(c => c.tipo === f.tipo) || (f.sugerida ? aMin(f.sugerida) <= ahoraMin : f.tipo !== 'salida'))
  const cambios = cambiosDe(s)
  const nuevo = !!s.cambios
  const usados = new Set()
  /* Cada marca de su horario con su cambio, si lo tiene: por la marca que corrige o, si se agrega, por el tipo.
     Las solicitudes viejas (una marca y una hora) se ubican por el tipo. */
  const cambioDe = f => {
    const c = cambios.find(x => !usados.has(x) && !x.quitar && (
      (x.marcaId && f.marca?.id === x.marcaId)
      || (!x.marcaId && x.tipo === f.tipo && (!nuevo || !f.marca || f.marca.origen === 'panel'))))
    if (c) usados.add(c)
    return c
  }
  const filasPapel = filas.map(f => {
    const c = cambioDe(f)
    const hoy = f.marca ? hhmm(f.marca.min) : 'Sin marcar'
    return c ? { nombre: f.nombre, dice: c.antes || (nuevo ? 'Sin marcar' : hoy), deberia: c.hora, cambia: true } : { nombre: f.nombre, dice: hoy, deberia: hoy }
  })
  const quitadas = cambios.filter(c => c.quitar)
  extras.filter(m => !quitadas.some(c => c.marcaId === m.id)).forEach(m => filasPapel.push({ nombre: `${nombreDe(m.tipo)} de más`, dice: hhmm(m.min), deberia: hhmm(m.min) }))
  quitadas.forEach(c => filasPapel.push({ nombre: `${nombreDe(c.tipo)} de más`, dice: c.antes, deberia: 'Se quita', cambia: true }))

  /* El efecto lo calcula el sistema mientras está pendiente; ya respondida, el día cambió y queda el historial. */
  const efectos = s.estado === 'pendiente' ? efectoDeCambios(at, persona, s.fecha, cambios) : []
  const delMes = at.solicitudes.filter(x => x.tipo === 'correccion' && x.id !== s.id && String(x.personaId) === String(s.personaId) && mesDe(x.fecha) === mesDe(s.fecha) && x.estado !== 'cancelada' && x.cuando <= s.cuando)
  efectos.push(`Es su ${delMes.length + 1}.ª corrección del mes`)
  const tarde = Math.round((aFecha(String(s.cuando).slice(0, 10)) - aFecha(s.fecha)) / 864e5)
  efectos.push(tarde <= 0 ? 'Pedida el mismo día' : tarde === 1 ? 'Pedida al día siguiente' : `Pedida ${tarde} días después`)

  const detalle = cambios.map(c => (c.quitar
    ? `quitar la ${nombreDe(c.tipo).toLowerCase()} de más de las ${c.antes}`
    : `${nombreDe(c.tipo).toLowerCase()} a las ${c.hora}${c.antes ? ` (figuraba ${c.antes})` : nuevo ? ' (no figuraba)' : ''}`)).join('; ')
  const texto = `Solicito corregir mi día del ${fechaLarga(s.fecha).toLowerCase()}: ${detalle}.`
    + (s.motivo ? ` Motivo: ${punto(s.motivo)}` : '')
    + (s.respaldo ? ` Justificación: ${punto(s.respaldo)}` : '')

  const nombreEmpresa = empresa?.razonSocial || empresa?.nombre || 'FarmaVida S.A.'
  const sigla = (nombreEmpresa.split(' ')[0].match(/[A-ZÁÉÍÓÚÑ]/g) || ['S']).slice(0, 2).join('')
  const sucursal = at.lugarPorId.get(persona.sucursalId)?.nombre || persona.lugar?.nombre || persona.sedeNombre || '—'
  const celda = (k, v, ancho, destacado) => (
    <div style={{ gridColumn: ancho ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', padding: '4px 7px', borderBottom: `1px solid ${P.linea}`, background: destacado ? '#F7FAFC' : 'transparent', minWidth: 0 }}>
      <span style={{ fontSize: 6.2, color: P.gris }}>{k}</span>
      <b style={{ fontSize: destacado ? 9 : 8, fontWeight: destacado ? 700 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</b>
    </div>
  )
  const seccion = (num, t) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 6.8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
      <i style={{ width: 13, height: 13, borderRadius: '50%', background: P.navy, color: '#fff', display: 'grid', placeItems: 'center', fontStyle: 'normal', fontSize: 6.8, letterSpacing: 0 }}>{num}</i>
      {t}<span style={{ flex: 1, height: 1, background: P.linea }} />
    </span>
  )
  const fila = (cols, { cabecera, cambia } = {}) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr 1fr', gap: 6, padding: '4px 8px', borderTop: cabecera ? 'none' : `1px solid ${P.linea}`, background: cabecera ? '#F7FAFC' : cambia ? P.fondoMenta : 'transparent', fontSize: cabecera ? 6.2 : 7.8, color: cabecera ? P.gris : P.navy, fontWeight: cabecera ? 600 : 500 }}>
      {cols.map((c, i) => (
        <span key={i} style={{
          fontWeight: !cabecera && (i === 0 || (cambia && i === 2)) ? 700 : undefined, color: cambia && i === 2 ? P.mentaTxt : cambia && i === 1 ? P.suave : undefined,
          textDecoration: cambia && i === 1 && /\d/.test(c) ? 'line-through' : 'none', fontVariantNumeric: 'tabular-nums',
        }}>{c}</span>
      ))}
    </div>
  )

  return (
    <article className="papel-claro" style={{ background: '#fff', color: P.navy, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 0 #E3EAF0, 0 18px 32px -24px rgba(12,45,64,.6)' }}>
      <header style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 7, alignItems: 'center', padding: '10px 11px', borderBottom: `1px solid ${P.linea}` }}>
        <span style={{ width: 25, height: 25, borderRadius: 7, background: P.navy, color: P.menta, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 8.4 }}>{sigla}</span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <b style={{ fontSize: 8.8, letterSpacing: '-.01em' }}>{nombreEmpresa}</b>
          <span style={{ fontSize: 6.2, color: P.gris }}>{empresa?.nit ? `NIT ${empresa.nit} · ` : ''}Recursos Humanos</span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 6.2, color: P.gris }}>Corrección de marcación</span>
          <b style={{ fontSize: 8.4, color: P.mentaTxt, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>N° {numero}</b>
        </span>
      </header>
      <div style={{ padding: '10px 11px 4px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <b style={{ textAlign: 'center', fontSize: 8.4, letterSpacing: '.14em', textTransform: 'uppercase' }}>Solicitud de corrección de marcación</b>
        {seccion(1, 'Datos del trabajador')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
          {celda('Nombre completo', persona.name, true, true)}
          {celda('Cargo', persona.cargo || '—', true)}
          {celda('Unidad organizacional', persona.unidad || '—')}
          {celda('Sucursal', sucursal)}
          {celda('Horario', h?.modo === 'fijo' ? `${h.entrada} a ${h.salida}` : h ? 'Flexible' : '—', true)}
        </div>
        {seccion(2, `Su día, ${fechaLarga(s.fecha).toLowerCase()}`)}
        <div style={{ border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
          {fila(['Marca', 'Dice hoy', 'Debería decir'], { cabecera: true })}
          {filasPapel.map((r, i) => <div key={i}>{fila([r.nombre, r.dice, r.deberia], { cambia: r.cambia })}</div>)}
        </div>
        {seccion(3, 'Motivo y justificación')}
        <p style={{ margin: '-3px 0 0', background: '#F7FAFC', borderRadius: 7, padding: '7px 9px', fontSize: 7.8, lineHeight: 1.5 }}>{texto}</p>
        <p style={{ margin: 0, background: P.fondoAmbar, borderRadius: 7, padding: '6px 9px', fontSize: 7.4, lineHeight: 1.5, color: P.ambar }}>
          {s.estado === 'pendiente' ? 'Si se aprueba: ' : ''}{efectos.join(' · ')}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${P.navy}` }} />
            <b style={{ fontSize: 7.6, marginTop: 3 }}>{persona.name}</b>
            <span style={{ fontSize: 6.2, color: P.gris }}>Solicitante · {corta(String(s.cuando).slice(0, 10))}</span>
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${P.navy}`, display: 'grid', placeItems: 'center' }}><Sello firma={firma} /></span>
            <b style={{ fontSize: 7.6, marginTop: 3 }}>Recursos Humanos</b>
            <span style={{ fontSize: 6.2, color: P.gris }}>{firma?.quien && firma.estado !== 'pendiente' ? `${firma.estado === 'aprobada' ? 'Aprobó' : 'Rechazó'} ${firma.quien}${firma.cuando ? ` · ${firma.cuando}` : ''}${s.propia ? ' · su propia solicitud' : ''}` : 'Aprobación'}</span>
          </span>
        </div>
      </div>
      <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 6, padding: '7px 11px 9px', marginTop: 6, borderTop: '1px solid #F0F3F6', fontSize: 5.8, color: P.suave }}>
        <span>Generado por SoulyHR con los datos del expediente</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>N° {numero}</span>
      </footer>
    </article>
  )
}
