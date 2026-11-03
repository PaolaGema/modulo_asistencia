import { useState } from 'react'
import { ClipboardCheck, Check, X, Info, ArrowLeft, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Modal, Etiqueta } from '../documentacion/comunes'
import { PersonaAt } from './comunes'

/* ── REVISAR UNA SOLICITUD ─────────────────────────────────────────────────
   Aprobar o rechazar no se hace desde una fila: se hace aquí, con todo a la vista.

   TRES COSAS ANTES DE DECIDIR: qué pidió (los datos, en una ficha), lo que hay que saber para
   decidir (saldo, cobertura, respaldo) y QUÉ VA A PASAR al aprobar, dicho en una frase. Quien
   aprueba no tiene que adivinar el efecto.

   RECHAZAR PIDE UN MOTIVO y se confirma en un segundo paso: la persona lo lee en su app, y un
   «rechazado» sin explicación es la forma más rápida de que vuelva a pedirlo por chat. Aprobar
   admite una nota, pero no la exige.

   APROBAR TAMBIÉN SE CONFIRMA, Y ESCRIBIENDO LA PALABRA: aprobar descuenta días, cambia el Libro y le
   avisa a la persona. Un segundo paso repite qué va a pasar y pide escribir «APROBAR» (o «ACEPTAR»), así
   no se aprueba de un clic sin querer. Una excepción —sin saldo— lo dice en rojo antes.

   `documento`: la papeleta que firmó la persona en su app; se ve a la izquierda, tal cual. */

const sinTildes = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase()

export default function RevisarSolicitud({ titulo, persona, estado, datos, contexto = [], efecto, efectoRechazo, respondio, nota, onAprobar, onRechazar, onVerDia, accionAprobar = 'Aprobar', accionRechazar = 'Rechazar', onCerrar, documento, que, excepcion }) {
  const [paso, setPaso] = useState('revisar') // revisar | rechazar | aprobar
  const [clave, setClave] = useState('')
  const palabra = sinTildes(accionAprobar.split(' ')[0])
  const claveOk = sinTildes(clave) === palabra
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
      {onAprobar && <button type="button" className="pl-btn-save" onClick={() => { setPaso('aprobar'); setClave('') }}><Check size={14} aria-hidden="true" /> {accionAprobar}…</button>}
    </>
  ) : paso === 'aprobar' ? (
    <>
      <button type="button" className="pl-btn-cancel" onClick={() => setPaso('revisar')}><ArrowLeft size={14} aria-hidden="true" /> Volver</button>
      <span style={{ flex: 1 }} />
      <button type="button" className="pl-btn-save" disabled={!claveOk} onClick={() => { onAprobar(texto.trim()); onCerrar() }}><Check size={14} aria-hidden="true" /> Sí, {accionAprobar.toLowerCase()}</button>
    </>
  ) : (
    <>
      <button type="button" className="pl-btn-cancel" onClick={() => setPaso('revisar')}><ArrowLeft size={14} aria-hidden="true" /> Volver</button>
      <span style={{ flex: 1 }} />
      <button type="button" className="at-btn-peligro" style={{ height: 38 }} disabled={!motivoValido} onClick={() => { onRechazar(texto.trim()); onCerrar() }}>Confirmar: {accionRechazar.toLowerCase()}</button>
    </>
  )

  return (
    <Modal titulo={titulo} Icono={ClipboardCheck} onCerrar={onCerrar} ancho={documento ? 1000 : 600} pie={pie}>
      <div className={documento ? 'at-rev-con-doc' : undefined}>
      {documento && <div className="at-rev-doc"><div className="at-rev-doc-papel">{documento}</div></div>}
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

        {pendiente && paso === 'aprobar' && (
          <div className="at-rev-confirma">
            <b><ShieldCheck size={16} aria-hidden="true" /> ¿{accionAprobar.split(' ')[0]} {que || 'esta solicitud'} de {persona.name}?</b>
            {excepcion
              ? <div className="at-rev-nota t-rojo" style={{ display: 'flex', gap: 8 }}><TriangleAlert size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} /><span>{efecto || excepcion}</span></div>
              : efecto && <span>{efecto}</span>}
            {texto.trim() && <span>Con la nota: «{texto.trim()}»</span>}
            <label className="at-campo">
              <span>Para confirmar, escribe <b className="at-rev-palabra">{palabra}</b></span>
              <input className="pl-input" value={clave} onChange={e => setClave(e.target.value)} placeholder={palabra} autoFocus autoComplete="off" spellCheck={false}
                onKeyDown={e => { if (e.key === 'Enter' && claveOk) { onAprobar(texto.trim()); onCerrar() } }} />
            </label>
          </div>
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
      </div>
    </Modal>
  )
}
