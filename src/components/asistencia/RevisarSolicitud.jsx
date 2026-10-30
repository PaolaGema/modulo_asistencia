import { useState } from 'react'
import { ClipboardCheck, Check, X, Info, ArrowLeft } from 'lucide-react'
import { Modal, Etiqueta } from '../documentacion/comunes'
import { PersonaAt } from './comunes'

/* ── REVISAR UNA SOLICITUD ─────────────────────────────────────────────────
   Aprobar o rechazar no se hace desde una fila: se hace aquí, con todo a la vista.

   TRES COSAS ANTES DE DECIDIR: qué pidió (los datos, en una ficha), lo que hay que saber para
   decidir (saldo, cobertura, respaldo) y QUÉ VA A PASAR al aprobar, dicho en una frase. Quien
   aprueba no tiene que adivinar el efecto.

   RECHAZAR PIDE UN MOTIVO y se confirma en un segundo paso: la persona lo lee en su app, y un
   «rechazado» sin explicación es la forma más rápida de que vuelva a pedirlo por chat. Aprobar
   admite una nota, pero no la exige. */

export default function RevisarSolicitud({ titulo, persona, estado, datos, contexto = [], efecto, efectoRechazo, respondio, nota, onAprobar, onRechazar, onVerDia, accionAprobar = 'Aprobar', accionRechazar = 'Rechazar', onCerrar }) {
  const [paso, setPaso] = useState('revisar') // revisar | rechazar
  const [texto, setTexto] = useState('')
  const pendiente = !!onAprobar || !!onRechazar
  const motivoValido = texto.trim().length >= 6

  const pie = !pendiente ? (
    <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cerrar</button>
  ) : paso === 'revisar' ? (
    <>
      {onRechazar && <button type="button" className="at-btn-linea-peligro" onClick={() => { setPaso('rechazar'); setTexto('') }}><X size={14} aria-hidden="true" /> {accionRechazar}…</button>}
      <span style={{ flex: 1 }} />
      <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Decidir después</button>
      {onAprobar && <button type="button" className="pl-btn-save" onClick={() => { onAprobar(texto.trim()); onCerrar() }}><Check size={14} aria-hidden="true" /> {accionAprobar}</button>}
    </>
  ) : (
    <>
      <button type="button" className="pl-btn-cancel" onClick={() => setPaso('revisar')}><ArrowLeft size={14} aria-hidden="true" /> Volver</button>
      <span style={{ flex: 1 }} />
      <button type="button" className="at-btn-peligro" style={{ height: 38 }} disabled={!motivoValido} onClick={() => { onRechazar(texto.trim()); onCerrar() }}>Confirmar: {accionRechazar.toLowerCase()}</button>
    </>
  )

  return (
    <Modal titulo={titulo} Icono={ClipboardCheck} onCerrar={onCerrar} ancho={600} pie={pie}>
      <div className="at-rev">
        <div className="at-rev-cab">
          <PersonaAt persona={persona} size={44} sub={`${persona.cargo || ''}${persona.cargo ? ' · ' : ''}${persona.unidad} · ${persona.lugar?.nombre || ''}`} />
          {estado && <Etiqueta tono={estado.tono}>{estado.label}</Etiqueta>}
        </div>

        <dl className="at-rev-datos">
          {datos.filter(Boolean).map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>

        {contexto.filter(Boolean).length > 0 && (
          <div className="at-rev-contexto">
            <span className="at-rev-rotulo">Para decidir</span>
            {contexto.filter(Boolean).map((c, i) => (
              <div key={i} className={`at-rev-nota t-${c.tono || 'gris'}`}>{c.texto}</div>
            ))}
            {onVerDia && <button type="button" className="dc-btn dc-btn-sm" style={{ alignSelf: 'flex-start' }} onClick={onVerDia}>Ver su día →</button>}
          </div>
        )}

        {pendiente && paso === 'revisar' && (
          <>
            {efecto && <div className="at-rev-efecto"><Info size={16} aria-hidden="true" /><span><b>Si apruebas:</b> {efecto}</span></div>}
            {onAprobar && (
              <label className="at-campo">
                <span>Nota para la persona <em>opcional</em></span>
                <input className="pl-input" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ej.: aprobado, recuerda dejar tu turno cubierto" />
              </label>
            )}
          </>
        )}

        {pendiente && paso === 'rechazar' && (
          <div className="at-rev-rechazo">
            <b>{accionRechazar} esta solicitud</b>
            <span>{efectoRechazo || 'La persona verá el motivo en su app.'}</span>
            <label className="at-campo">
              <span>Motivo <em>obligatorio: lo leerá la persona</em></span>
              <textarea className="pl-input" rows={3} value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ej.: esa semana ya hay dos personas de vacaciones en tu sucursal. ¿Puedes moverla a la siguiente?" autoFocus />
            </label>
          </div>
        )}

        {!pendiente && (respondio || nota) && (
          <div className="at-rev-nota t-gris">{respondio ? `Respondió ${respondio}` : ''}{nota ? `${respondio ? ': ' : ''}«${nota}»` : ''}</div>
        )}
      </div>
    </Modal>
  )
}
