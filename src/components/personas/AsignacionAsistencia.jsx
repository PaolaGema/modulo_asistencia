import { useMemo } from 'react'
import { CircleCheck, CircleSlash } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import Desplegable from '../layout/Desplegable'
import { MODALIDADES, DIAS_CORTOS, hoyISO, fechaLarga } from '../../data/asistenciaData'
import '../asistencia/asistencia.css'

/* ── LA ASISTENCIA DE LA PERSONA, EN SU FICHA ──
   Lo mismo que asigna Asistencia › Configuración › Asignaciones, pero al darla de alta: su horario,
   dónde marca, si es presencial, híbrida o remota, y con qué controles marca. Los valores viajan en
   el formulario con claves `at.*` y, al confirmar el alta, `asignacionDeFicha` los convierte en la
   asignación del módulo: desde ese día aparece en Hoy, en el Libro y en su app.

   CON «NO CONTROLA» la persona no marca y no se le cuentan faltas: el personal de confianza que la
   empresa no quiere descontar. */

const rangoDias = dias => {
  if (!dias?.length) return 'Sin días'
  const s = [...dias].sort()
  const seguidos = s.every((d, i) => i === 0 || d === s[i - 1] + 1)
  return seguidos && s.length > 2 ? `${DIAS_CORTOS[s[0]]} a ${DIAS_CORTOS[s[s.length - 1]]}` : s.map(d => DIAS_CORTOS[d]).join(', ')
}
const resumenHorario = h => (h.modo === 'fijo' ? `${rangoDias(h.dias)} · ${h.entrada} a ${h.salida}` : `${rangoDias(h.dias)} · ${h.meta / 60} h al día, sin hora fija`)

/* El valor elegido, o el que corresponde si todavía no se tocó nada. */
function valores(form, at) {
  return {
    controla: form['at.controla'] || 'Sí',
    horarioId: form['at.horario'] || at.horarios[0]?.id || '',
    lugarId: form['at.lugar'] || at.lugares.find(l => l.tipo === 'sucursal')?.id || '',
    modalidad: form['at.modalidad'] || 'presencial',
    diasOficina: form['at.diasOficina'] || [2, 4],
    politicaId: form['at.politica'] || '',
    desde: form['at.desde'] || form['3.25'] || hoyISO(),
  }
}

/* Lo que se guarda en el módulo al dar de alta; null si la persona no controla asistencia. */
// eslint-disable-next-line react-refresh/only-export-components
export function asignacionDeFicha(form, at) {
  const v = valores(form, at)
  if (v.controla === 'No') return null
  return {
    horarioId: v.horarioId, lugarId: v.lugarId, modalidad: v.modalidad, desde: v.desde,
    diasOficina: v.modalidad === 'hibrido' ? v.diasOficina : [],
    politicaId: v.politicaId || null,
  }
}

export default function AsignacionAsistencia({ form, set }) {
  const at = useAsistencia()
  const v = valores(form, at)
  const lugaresOps = useMemo(() => at.lugares.filter(l => l.tipo === 'sucursal').flatMap(s => [
    { valor: s.id, etiqueta: `${s.nombre}${s.ciudad ? ` · ${s.ciudad}` : ''}` },
    ...at.lugares.filter(c => c.tipo === 'centro' && c.sucursalId === s.id).map(c => ({ valor: c.id, etiqueta: `   ↳ ${c.nombre}` })),
  ]), [at.lugares])
  const horario = at.horarioPorId.get(v.horarioId)
  const lugar = at.lugarPorId.get(v.lugarId)
  /* Lo que se le pide al marcar sale de su modalidad (Asistencia › Configuración › Modalidades). */
  const reglas = at.ajustesGenerales.marcacion?.[v.modalidad] || {}
  const controles = [reglas.rostro && 'su rostro', reglas.lugar && v.modalidad !== 'remoto' && 'su ubicación'].filter(Boolean)

  return (
    <div className="at-ficha-asig">
      <div className="at-campo"><span>¿Controla su asistencia?</span>
        <div className="at-segmento" role="radiogroup" aria-label="¿Controla su asistencia?">
          {['Sí', 'No'].map(x => <button key={x} type="button" role="radio" aria-checked={v.controla === x} className={v.controla === x ? 'on' : ''} onClick={() => set('at.controla', x)}>{x}</button>)}
        </div>
      </div>

      {v.controla === 'No' ? (
        <p className="at-ficha-resumen apagado"><CircleSlash size={16} aria-hidden="true" /> No marca entrada ni salida y no se le cuentan faltas ni atrasos. No aparece en Hoy ni en el Libro de asistencia.</p>
      ) : (
        <>
          <div className="at-campo"><span>Horario</span>
            <div className="at-ficha-horarios" role="radiogroup" aria-label="Horario">
              {at.horarios.map(h => (
                <button key={h.id} type="button" role="radio" aria-checked={v.horarioId === h.id} className={v.horarioId === h.id ? 'on' : ''} onClick={() => set('at.horario', h.id)}>
                  <i style={{ background: h.color }} />
                  <b>{h.nombre}</b>
                  <small>{resumenHorario(h)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="at-dos">
            <label className="at-campo"><span>Dónde marca</span>
              <Desplegable valor={v.lugarId} onCambio={x => set('at.lugar', x)} opciones={lugaresOps} ariaLabel="Dónde marca" conBuscador />
              <span className="at-ayuda">Su sucursal o centro de trabajo. Ahí está su geocerca.</span>
            </label>
            <label className="at-campo"><span>Desde</span>
              <input type="date" className="pl-input" value={v.desde} onChange={e => set('at.desde', e.target.value)} />
              <span className="at-ayuda">Por defecto, su fecha de ingreso.</span>
            </label>
          </div>

          <div className="at-campo"><span>Modalidad</span>
            <div className="at-segmento" role="radiogroup" aria-label="Modalidad">
              {Object.entries(MODALIDADES).map(([k, m]) => <button key={k} type="button" role="radio" aria-checked={v.modalidad === k} className={v.modalidad === k ? 'on' : ''} onClick={() => set('at.modalidad', k)}>{m.label}</button>)}
            </div>
            <span className="at-ayuda">{MODALIDADES[v.modalidad].desc}</span>
          </div>
          {v.modalidad === 'hibrido' && (
            <div className="at-campo"><span>Días de oficina</span>
              <div className="at-semana-chips">
                {[1, 2, 3, 4, 5, 6, 7].map(x => <button key={x} type="button" aria-pressed={v.diasOficina.includes(x)} className={v.diasOficina.includes(x) ? 'on' : ''} onClick={() => set('at.diasOficina', v.diasOficina.includes(x) ? v.diasOficina.filter(y => y !== x) : [...v.diasOficina, x].sort())}>{DIAS_CORTOS[x]}</button>)}
              </div>
            </div>
          )}


          {/* Lo elegido, dicho en una frase: así se revisa de un vistazo antes de dar de alta. */}
          <p className="at-ficha-resumen">
            <CircleCheck size={16} aria-hidden="true" />
            <span>
              Desde el <b>{fechaLarga(v.desde).toLowerCase()}</b> marca {v.modalidad === 'remoto' ? 'desde donde esté' : <>en <b>{lugar?.nombre || 'su lugar'}</b></>}
              {horario && <>, <b>{resumenHorario(horario)}</b></>}
              {controles.length ? <>, con {controles.join(' y ')}</> : null}.
            </span>
          </p>
        </>
      )}
    </div>
  )
}
