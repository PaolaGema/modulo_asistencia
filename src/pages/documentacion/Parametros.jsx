import { useState } from 'react'
import { CheckCircle2, Info } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera } from '../../components/documentacion/comunes'
import Desplegable from '../../components/layout/Desplegable'
import { CATEGORIAS, DESTINATARIOS } from '../../data/documentacionData'
import './configuracion.css'

/* ── PARÁMETROS Y AVISOS (pantalla 3) ─────────────────────────────────────
   El Salar tenía dos parámetros: si se notifica y cuántos días antes, uno solo para todo. Acá
   el general es el valor POR DEFECTO de los subtipos que no declaran los suyos (RF-06, RF-35),
   y se suman la numeración (RF-07), el aviso de fin de contrato (RF-40), el resumen al
   responsable (RF-41), la papelera (RF-89) y la retención por tipo (RF-87).

   SE EDITA UN BORRADOR Y SE GUARDA DE UNA VEZ. Cambiar la numeración a medio escribir un prefijo
   no puede dejar un CITE a medias en el próximo certificado; hasta pulsar «Guardar» nada toca lo
   que el resto del módulo lee. */

function SiNo({ valor, onCambio, label }) {
  return (
    <div className="sn-grupo" role="group" aria-label={label} style={{ alignSelf: 'flex-start' }}>
      {[{ v: true, t: 'Sí' }, { v: false, t: 'No' }].map(o => (
        <button key={o.t} type="button" className={`sn-op${valor === o.v ? ' on' : ''}`} aria-pressed={valor === o.v} onClick={() => onCambio(o.v)}>{o.t}</button>
      ))}
    </div>
  )
}

const numero = v => v.replace(/\D/g, '')

/* El número que saldría, con la misma forma que usa `siguienteNumero`. */
const ejemplo = cfg => (cfg.formato || '{prefijo}-{n}/{gestion}')
  .replace('{prefijo}', cfg.prefijo || '¿?')
  .replace('{n}', '1'.padStart(Number(cfg.digitos) || 1, '0'))
  .replace('{gestion}', new Date().getFullYear())

export default function Parametros() {
  const { parametros, setParametros, tipos, setTipos, anotarConfig } = useDocumentacion()
  const [p, setP] = useState(() => ({ ...parametros, hitos: [...parametros.hitos, '', '', ''].slice(0, 3).map(String) }))
  const [ret, setRet] = useState(() => Object.fromEntries(tipos.map(t => [t.id, String(t.retencionAnios ?? '')])))
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => { setP(prev => ({ ...prev, [k]: v })); setGuardado(false) }
  const setNum = (cat, k, v) => { setP(prev => ({ ...prev, numeracion: { ...prev.numeracion, [cat]: { ...prev.numeracion[cat], [k]: v } } })); setGuardado(false) }
  const alternarDest = d => set('destinatarios', p.destinatarios.includes(d) ? p.destinatarios.filter(x => x !== d) : [...p.destinatarios, d])

  const hitosLimpios = [...new Set(p.hitos.map(Number).filter(n => n > 0))].sort((a, b) => b - a)
  /* Lo que se guardaría, ya normalizado: comparar el borrador crudo contra lo guardado daría
     «cambios sin guardar» por un 45 escrito como texto. */
  const normal = {
    ...p,
    hitos: hitosLimpios,
    avisoContratoDias: Number(p.avisoContratoDias) || 45,
    papeleraDias: Number(p.papeleraDias) || 30,
    numeracion: Object.fromEntries(Object.entries(p.numeracion).map(([k, v]) => [k, { ...v, prefijo: v.prefijo.trim().toUpperCase(), digitos: Math.min(8, Math.max(1, Number(v.digitos) || 4)) }])),
  }
  const sucio = JSON.stringify(normal) !== JSON.stringify(parametros)
    || tipos.some(t => String(t.retencionAnios ?? '') !== ret[t.id])

  const guardar = () => {
    if (p.notificarVencimiento && !hitosLimpios.length) return setError('Con los avisos encendidos hace falta al menos un hito.')
    if (p.notificarVencimiento && !p.destinatarios.length) return setError('Elija al menos a quién avisar.')
    if (Object.keys(CATEGORIAS).some(c => !p.numeracion[c].prefijo.trim())) return setError('Cada categoría necesita su prefijo: sin él no hay CITE.')
    setError('')
    setParametros(normal)
    setTipos(prev => prev.map(t => ({ ...t, retencionAnios: Number(ret[t.id]) || 0 })))
    anotarConfig('Cambió los parámetros generales, la numeración o la retención')
    setP({ ...normal, hitos: [...hitosLimpios, '', '', ''].slice(0, 3).map(String) })
    setGuardado(true)
  }

  return (
    <div className="content-scroll">
      <Cabecera titulo="Parámetros y avisos" sub="Los valores generales del módulo. Cada subtipo puede tener sus propios avisos; estos son los de por defecto." />

      <div className="xd-params">
        <section className="dc-tarjeta">
          <div className="dc-tarjeta-cab"><h2>Avisos de vencimiento</h2></div>
          <div className="dc-tarjeta-cuerpo">
            <div className="xd-campo">¿Avisar antes de que un documento venza?
              <SiNo label="Avisar antes de que venza" valor={p.notificarVencimiento} onCambio={v => set('notificarVencimiento', v)} />
            </div>
            {p.notificarVencimiento && <>
              <div className="xd-campo">Hitos por defecto
                <div className="xd-hitos">
                  {[0, 1, 2].map(i => (
                    <input key={i} className="pl-input xd-num" style={{ width: 78 }} inputMode="numeric" aria-label={`Hito ${i + 1} en días`} placeholder="días" value={p.hitos[i]} onChange={e => set('hitos', p.hitos.map((h, j) => (j === i ? numero(e.target.value) : h)))} />
                  ))}
                </div>
                <span className="xd-ayuda">Días antes del vencimiento. Hasta tres: una alerta que llega el mismo día llegó tarde.</span>
              </div>
              <div className="xd-campo">A quién avisar por defecto
                <div className="xd-casillas">
                  {Object.entries(DESTINATARIOS).map(([k, l]) => (
                    <label key={k} className={`xd-casilla${p.destinatarios.includes(k) ? ' on' : ''}`}><input type="checkbox" checked={p.destinatarios.includes(k)} onChange={() => alternarDest(k)} /> {l}</label>
                  ))}
                </div>
              </div>
              <div className="xd-campo">Canales
                <div className="xd-casillas">
                  {[['correo', 'Correo'], ['app', 'Notificación en la app']].map(([k, l]) => (
                    <label key={k} className={`xd-casilla${p.canales[k] ? ' on' : ''}`}><input type="checkbox" checked={!!p.canales[k]} onChange={e => set('canales', { ...p.canales, [k]: e.target.checked })} /> {l}</label>
                  ))}
                </div>
                <span className="xd-ayuda">El colaborador elige el suyo dentro de estos. Un aviso llega una vez por canal (RF-37).</span>
              </div>
            </>}
            <div className="xd-campo">Resumen al responsable
              <div style={{ maxWidth: 240 }}>
                <Desplegable valor={p.resumen} onCambio={v => set('resumen', v)} ariaLabel="Resumen periódico" opciones={[{ valor: 'semanal', etiqueta: 'Semanal' }, { valor: 'mensual', etiqueta: 'Mensual' }, { valor: 'nunca', etiqueta: 'No enviar' }]} />
              </div>
              <span className="xd-ayuda">Un solo correo con lo vencido, lo que está por vencer y lo que falta, con enlace a cada pila (RF-41).</span>
            </div>
          </div>
        </section>

        <section className="dc-tarjeta">
          <div className="dc-tarjeta-cab"><h2>Contratos y papelera</h2></div>
          <div className="dc-tarjeta-cuerpo">
            <label className="xd-campo">Aviso de fin de contrato
              <span className="xd-fila"><input className="pl-input xd-num" inputMode="numeric" value={p.avisoContratoDias} onChange={e => set('avisoContratoDias', numero(e.target.value))} /> días antes</span>
              <span className="xd-ayuda">Un plazo fijo avisa al responsable con esta anticipación, con tiempo para renovar o finalizar (RF-40).</span>
            </label>
            <label className="xd-campo">Días en la papelera
              <span className="xd-fila"><input className="pl-input xd-num" inputMode="numeric" value={p.papeleraDias} onChange={e => set('papeleraDias', numero(e.target.value))} /> días</span>
              <span className="xd-ayuda">Un documento eliminado se puede recuperar durante este plazo sin ayuda técnica (RF-89).</span>
            </label>
          </div>

          <div className="dc-tarjeta-cab" style={{ borderTop: '1px solid var(--border-soft)' }}><h2>Numeración correlativa</h2></div>
          <div className="dc-tarjeta-cuerpo" style={{ gap: 0 }}>
            {Object.entries(CATEGORIAS).map(([cat, c]) => {
              const cfg = p.numeracion[cat]
              return (
                <div key={cat} className="xd-numeracion">
                  <b style={{ fontSize: 12.5, color: 'var(--text-heading)' }}>{c.plural}</b>
                  <span className="xd-fila" style={{ gap: 6, flexWrap: 'nowrap' }}>
                    <span className="xd-ayuda">Prefijo</span>
                    <input className="pl-input" style={{ width: 90 }} aria-label={`Prefijo de ${c.plural}`} value={cfg.prefijo} onChange={e => setNum(cat, 'prefijo', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} />
                    <span className="xd-ayuda">Dígitos</span>
                    <input className="pl-input" style={{ width: 52 }} inputMode="numeric" aria-label={`Dígitos de ${c.plural}`} value={cfg.digitos} onChange={e => setNum(cat, 'digitos', numero(e.target.value).slice(0, 1))} />
                  </span>
                  <label className="xd-mini" title="Empieza en 1 cada gestión"><input type="checkbox" checked={cfg.reinicioAnual} onChange={e => setNum(cat, 'reinicioAnual', e.target.checked)} /> Reinicia cada año</label>
                  <span className="xd-ejemplo" aria-label={`El próximo ${c.label.toLowerCase()} de una gestión nueva saldría con`}>{ejemplo(cfg)}</span>
                </div>
              )
            })}
            <p className="xd-nota" style={{ marginTop: 10 }}>Un número no se reutiliza nunca, ni siquiera si el documento se anula (RN-15).</p>
          </div>
        </section>

        <section className="dc-tarjeta" style={{ gridColumn: '1 / -1' }}>
          <div className="dc-tarjeta-cab"><h2>Retención por tipo</h2><span className="xd-nota">Años que se conserva después de la desvinculación</span></div>
          <div className="dc-tarjeta-cuerpo">
            <div className="xd-aviso info"><Info size={15} /><span>Al cumplirse el plazo el sistema <b>avisa y no borra</b>: la eliminación la decide una persona, con motivo (RN-22, RF-87).</span></div>
            <div>
              {tipos.map(t => (
                <label key={t.id} className="xd-ret">
                  <span>{t.nombre}{t.activo ? '' : ' (inactivo)'}</span>
                  <span className="xd-fila" style={{ gap: 6, flexWrap: 'nowrap' }}>
                    <input className="pl-input xd-num" style={{ width: 60 }} inputMode="numeric" aria-label={`Años de retención de ${t.nombre}`} value={ret[t.id] ?? ''} onChange={e => { setRet(prev => ({ ...prev, [t.id]: numero(e.target.value) })); setGuardado(false) }} /> años
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="xd-guardar">
        {error ? <span className="xd-sucio" role="alert">{error}</span>
          : guardado && !sucio ? <span className="xd-guardado" role="status"><CheckCircle2 size={15} /> Cambios guardados</span>
          : sucio ? <span className="xd-sucio">Hay cambios sin guardar</span> : <span style={{ marginRight: 'auto' }} />}
        <button type="button" className="pl-btn-save" disabled={!sucio} onClick={guardar}>Guardar parámetros</button>
      </div>
    </div>
  )
}
