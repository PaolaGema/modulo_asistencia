import { useAsistencia } from '../../context/AsistenciaContext'
import { Sello } from '../layout/VacacionPhone'
import { MESES, aFecha, aMin, fechaLarga, duracion, solicitanteDe } from '../../data/asistenciaData'

/* LA SOLICITUD DE HORAS EXTRA, COMO DOCUMENTO (propuesta «Horas extra · A», aprobada el 5 nov 2026). La misma
   papeleta de la vacación, el permiso y la corrección: datos del trabajador, las horas extra (día, franja, cuántas
   horas, proyecto y motivo) y las firmas. Si la pidió la persona, firma ella y aprueba RR.HH.; si la asignó RR.HH.,
   firma RR.HH. y la persona acepta. RR.HH. la ve a la izquierda de «Revisar · Horas extra». */

const P = { navy: '#0C2D40', menta: '#00E091', mentaTxt: '#0A7F55', gris: '#6B7C8A', suave: '#9AABBB', borde: '#E6ECF1', linea: '#EEF2F5', fondoMenta: '#F3FBF7' }
const corta = s => `${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)} ${s.slice(0, 4)}`
/* El sello de la persona cuando RR.HH. se las asignó: todavía no responde, aceptó o dijo que no puede. */
const SELLO_PERSONA = { asignada: 'pendiente', aceptada: 'aprobada', rechazada: 'rechazada', cancelada: 'cancelada' }

export default function PapeletaExtra({ x, persona, empresa, numero }) {
  const at = useAsistencia()
  const h = at.horarioDe(persona, x.fecha)
  const trabaja = !!h && at.jornadaDe(persona, x.fecha).laboral
  const largo = aMin(x.hasta) - aMin(x.desde)
  const asignada = x.origen === 'asignacion'
  const delLider = x.origen === 'lider'
  const nombreEmpresa = empresa?.razonSocial || empresa?.nombre || 'FarmaVida S.A.'
  const sigla = (nombreEmpresa.split(' ')[0].match(/[A-ZÁÉÍÓÚÑ]/g) || ['S']).slice(0, 2).join('')
  const sucursal = at.lugarPorId.get(persona.sucursalId)?.nombre || persona.lugar?.nombre || persona.sedeNombre || '—'
  const pidio = x.cuando ? corta(String(x.cuando).slice(0, 10)) : ''
  const respondio = x.respondio && !['pendiente', 'asignada'].includes(x.estado)

  const celda = (k, v, { ancho, destacado, verde } = {}) => (
    <div style={{ gridColumn: ancho ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', padding: '4px 7px', borderBottom: `1px solid ${P.linea}`, background: verde ? P.fondoMenta : destacado ? '#F7FAFC' : 'transparent', minWidth: 0 }}>
      <span style={{ fontSize: 6.2, color: P.gris }}>{k}</span>
      <b style={{ fontSize: destacado || verde ? 9 : 8, fontWeight: destacado || verde ? 700 : 600, color: verde ? P.mentaTxt : undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</b>
    </div>
  )
  const seccion = (num, t) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 6.8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
      <i style={{ width: 13, height: 13, borderRadius: '50%', background: P.navy, color: '#fff', display: 'grid', placeItems: 'center', fontStyle: 'normal', fontSize: 6.8, letterSpacing: 0 }}>{num}</i>
      {t}<span style={{ flex: 1, height: 1, background: P.linea }} />
    </span>
  )
  const firma = (nombre, rol, sello) => (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
      <span style={{ alignSelf: 'stretch', height: 20, borderBottom: `1px solid ${P.navy}`, display: 'grid', placeItems: 'center' }}>{sello}</span>
      <b style={{ fontSize: 7.6, marginTop: 3 }}>{nombre}</b>
      <span style={{ fontSize: 6.2, color: P.gris }}>{rol}</span>
    </span>
  )
  const diaLargo = fechaLarga(x.fecha)

  return (
    <article className="papel-claro" style={{ background: '#fff', color: P.navy, borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 0 #E3EAF0, 0 18px 32px -24px rgba(12,45,64,.6)' }}>
      <header style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 7, alignItems: 'center', padding: '10px 11px', borderBottom: `1px solid ${P.linea}` }}>
        <span style={{ width: 25, height: 25, borderRadius: 7, background: P.navy, color: P.menta, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 8.4 }}>{sigla}</span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <b style={{ fontSize: 8.8, letterSpacing: '-.01em' }}>{nombreEmpresa}</b>
          <span style={{ fontSize: 6.2, color: P.gris }}>{empresa?.nit ? `NIT ${empresa.nit} · ` : ''}Recursos Humanos</span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 6.2, color: P.gris }}>Horas extra</span>
          <b style={{ fontSize: 8.4, color: P.mentaTxt, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>N° {numero}</b>
        </span>
      </header>
      <div style={{ padding: '10px 11px 4px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <b style={{ textAlign: 'center', fontSize: 8.4, letterSpacing: '.14em', textTransform: 'uppercase' }}>{asignada ? 'Asignación de horas extra' : 'Solicitud de horas extra'}</b>
        {seccion(1, 'Datos del trabajador')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
          {celda('Nombre completo', persona.name, { ancho: true, destacado: true })}
          {celda('Cargo', persona.cargo || '—', { ancho: true })}
          {celda('Unidad organizacional', persona.unidad || '—')}
          {celda('Sucursal', sucursal)}
          {celda('Horario ese día', !trabaja ? 'No trabaja ese día' : h.modo === 'fijo' ? `${h.entrada} a ${h.salida}` : 'Flexible', { ancho: true })}
        </div>
        {seccion(2, asignada ? 'Horas extra asignadas' : 'Horas extra solicitadas')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${P.borde}`, borderRadius: 7, overflow: 'hidden', marginTop: -3 }}>
          {celda('Día', `${diaLargo[0].toUpperCase()}${diaLargo.slice(1)}`, { ancho: true })}
          {celda('Desde – hasta', `${x.desde} a ${x.hasta}`)}
          {celda('Horas', duracion(largo), { verde: true })}
          {celda('Proyecto', x.proyecto || '—', { ancho: true })}
          {celda('Motivo', x.motivo || '—', { ancho: true })}
          {(() => { const sol = solicitanteDe(x, at.personas); return celda('Solicitante', sol.propia ? `${persona.name} · para sí` : `${sol.persona?.name || '—'} · ${sol.papel}`, { ancho: true }) })()}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: delLider ? '1fr 1fr 1fr' : '1fr 1fr', gap: 12, marginTop: 6 }}>
          {delLider ? (
            /* La pidió el jefe: firma él, aprueba RR.HH. y después acepta la persona. */
            <>
              {firma(x.lider || x.por, `Su jefe · pidió${pidio ? ` el ${pidio}` : ''}`, null)}
              {firma('Recursos Humanos', x.estado === 'rechazada' && !x.noPudo ? `Rechazó ${x.respondio || ''}` : x.respondio ? `Aprobó ${x.respondio}` : 'Aprobación', <Sello firma={{ estado: x.estado === 'pendiente' ? 'pendiente' : x.estado === 'rechazada' && !x.noPudo ? 'rechazada' : 'aprobada' }} />)}
              {firma(persona.name, x.estado === 'aceptada' ? 'Aceptó' : x.noPudo ? 'No puede' : 'Acepta', x.estado === 'pendiente' || (x.estado === 'rechazada' && !x.noPudo) ? null : <Sello firma={{ estado: SELLO_PERSONA[x.estado] || 'pendiente' }} />)}
            </>
          ) : asignada ? (
            <>
              {firma('Recursos Humanos', `Asignó ${x.por || ''}${pidio ? ` · ${pidio}` : ''}`, null)}
              {firma(persona.name, x.estado === 'asignada' ? 'Acepta' : x.estado === 'aceptada' ? 'Aceptó' : 'No puede', <Sello firma={{ estado: SELLO_PERSONA[x.estado] || 'pendiente' }} />)}
            </>
          ) : (
            <>
              {firma(persona.name, `Solicitante${pidio ? ` · ${pidio}` : ''}`, null)}
              {firma('Recursos Humanos', respondio ? `${x.estado === 'rechazada' ? 'Rechazó' : 'Aprobó'} ${x.respondio}${x.propia ? ' · sus propias horas extra' : ''}` : 'Aprobación', <Sello firma={{ estado: x.estado === 'aceptada' ? 'aprobada' : x.estado }} />)}
            </>
          )}
        </div>
      </div>
      <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 6, padding: '7px 11px 9px', marginTop: 6, borderTop: '1px solid #F0F3F6', fontSize: 5.8, color: P.suave }}>
        <span>Generado por SoulyHR con los datos del expediente</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>N° {numero}</span>
      </footer>
    </article>
  )
}
