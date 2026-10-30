import { useState } from 'react'
import { CheckCircle2, ChevronRight, Plus, Save, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { COLORES_TIPO, DESTINATARIOS, numeracionDe, plazoSolicitudDe, siguienteNumero, tiposDoc } from '../../data/documentacionData'
import './notificaciones.css'

/* ── NOTIFICACIONES Y NUMERACIÓN (propuesta CS · 16 oct 2026) ─────────────
   Una página de ajustes como las de siempre: bloques con título y, en cada fila, a la izquierda
   qué es —con una línea que lo explica— y a la derecha el control. Tres bloques:
   · VENCIMIENTO DE DOCUMENTOS: cuándo, a quién, por dónde y el resumen a RR.HH. (RF-37, RF-41);
   · CONTRATOS: el aviso de fin de un plazo fijo (RF-40). La papelera se fue (16 oct 2026): un
     documento ya no se borra, se anula;
   · NUMERACIÓN: una tabla con cada tipo —también los que creó la empresa—, su sigla, sus dígitos,
     si reinicia cada año y el próximo número que va a salir (RF-07, RN-15).
   UN SOLO «GUARDAR CAMBIOS», arriba a la derecha, para todo: antes eran dos botones al pie de dos
   bloques distintos, y uno se olvidaba del otro. */
const soloNumero = v => String(v).replace(/\D/g, '')
const RESUMENES = [['nunca', 'Nunca'], ['semanal', 'Semanal'], ['mensual', 'Mensual']]
const CANALES = [['correo', 'Correo'], ['app', 'Notificación en la app']]

/* «Constancia» → «Constancias», «Carta de recomendación» → «Cartas de recomendación». */
const plural = nombre => {
  const [primera, ...resto] = nombre.trim().split(/\s+/)
  if (!primera) return ''
  const p = /[aeiouáéó]$/i.test(primera) ? `${primera}s` : /z$/i.test(primera) ? `${primera.slice(0, -1)}ces` : `${primera}es`
  return [p, ...resto].join(' ')
}
const sinTildes = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
// La sigla que se propone: las iniciales si son varias palabras, las tres primeras letras si es una.
const siglaDe = nombre => {
  const palabras = sinTildes(nombre).replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).filter(p => p.length > 2)
  return (palabras.length > 1 ? palabras.map(p => p[0]).join('') : (palabras[0] || '').slice(0, 3)).slice(0, 4).toUpperCase()
}
// La clave interna de un tipo nuevo: el nombre sin tildes y un sufijo para que no choque.
const claveNueva = nombre => `t-${sinTildes(nombre).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36).slice(-3)}`

export default function Notificaciones({ titulo, sub }) {
  const { parametros, setParametros, emitidos, contratos, modelos, anotarConfig } = useDocumentacion()
  const tipos = tiposDoc(parametros)
  const inicial = () => ({
    notificarVencimiento: parametros.notificarVencimiento,
    hitos: parametros.hitos.map(String),
    destinatarios: [...parametros.destinatarios],
    canales: { ...parametros.canales },
    resumen: parametros.resumen,
    avisoContratoDias: String(parametros.avisoContratoDias),
    plazoSolicitudDias: String(plazoSolicitudDe(parametros)),
    papeleraDias: String(parametros.papeleraDias),
    numeracion: Object.fromEntries(Object.keys(tipos).map(k => [k, { ...numeracionDe(parametros, k), digitos: String(numeracionDe(parametros, k).digitos) }])),
  })
  const [p, setP] = useState(inicial)
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)
  const set = (k, v) => { setP(prev => ({ ...prev, [k]: v })); setGuardado(false); setError('') }

  /* Lo que se guardaría, ya normalizado: así «hay cambios» no salta por un 45 escrito como texto. */
  const hitos = [...new Set(p.hitos.map(Number).filter(n => n > 0))].sort((a, b) => b - a)
  const numeracion = Object.fromEntries(Object.entries(p.numeracion).map(([k, v]) => [k, { ...v, prefijo: v.prefijo.trim().toUpperCase(), digitos: Math.min(8, Math.max(1, Number(v.digitos) || 4)) }]))
  const normal = {
    notificarVencimiento: p.notificarVencimiento, hitos, destinatarios: p.destinatarios, canales: p.canales, resumen: p.resumen,
    avisoContratoDias: Number(p.avisoContratoDias) || 45, papeleraDias: Number(p.papeleraDias) || 30,
    plazoSolicitudDias: Math.min(30, Math.max(1, Number(p.plazoSolicitudDias) || 2)),
    numeracion: { ...parametros.numeracion, ...numeracion },
  }
  const actual = {
    notificarVencimiento: parametros.notificarVencimiento, hitos: parametros.hitos, destinatarios: parametros.destinatarios, canales: parametros.canales, resumen: parametros.resumen,
    avisoContratoDias: parametros.avisoContratoDias, papeleraDias: parametros.papeleraDias,
    plazoSolicitudDias: plazoSolicitudDe(parametros),
    numeracion: { ...parametros.numeracion, ...Object.fromEntries(Object.keys(tipos).map(k => [k, numeracionDe(parametros, k)])) },
  }
  /* Cuántos ajustes cambiaron, como en «Configuración avanzada» de Onboarding: cada campo cuenta
     uno y, en la numeración, cada tipo. */
  const cambios = Object.keys(normal).flatMap(k => (k === 'numeracion'
    ? Object.keys(normal.numeracion).filter(t => JSON.stringify(normal.numeracion[t]) !== JSON.stringify(actual.numeracion[t]))
    : JSON.stringify(normal[k]) !== JSON.stringify(actual[k]) ? [k] : []))
  const sucio = cambios.length > 0
  const descartar = () => { setP(inicial()); setError(''); setGuardado(false) }

  function guardar() {
    if (p.notificarVencimiento && !hitos.length) return setError('Con los avisos encendidos hace falta al menos un día de aviso.')
    if (p.notificarVencimiento && !p.destinatarios.length) return setError('Elija al menos a quién avisar.')
    if (Object.values(numeracion).some(c => !c.prefijo)) return setError('Cada tipo necesita su sigla: sin ella no hay número.')
    setParametros(prev => ({ ...prev, ...normal }))
    anotarConfig('Cambió las notificaciones y la numeración')
    setP(prev => ({ ...prev, hitos: hitos.map(String) }))
    setGuardado(true)
  }

  const alternar = (lista, v) => (lista.includes(v) ? lista.filter(x => x !== v) : [...lista, v])
  const proximo = tipo => siguienteNumero(tipo, emitidos, { ...parametros, numeracion: normal.numeracion }, contratos).texto

  /* EL PANEL DEL TIPO (23 oct 2026, propuesta D): la tabla sólo lista los tipos y su próximo
     número; al hacer clic en uno se abre al costado un panel con todo lo suyo —nombre, sigla,
     dígitos, si reinicia cada año y cuánto se usa— y ahí se cambia. «Guardar» lo guarda al momento,
     sin pasar por «Guardar cambios». El mismo panel crea un tipo nuevo.
     · Los tipos de Souly no cambian de nombre ni se eliminan; su numeración sí se ajusta.
     · Un tipo propio se elimina sólo si ninguna plantilla ni documento lo usa.
     · Los documentos guardan la clave del tipo, no su nombre: al renombrarlo, los ya emitidos y
       su carpeta en Recibidos pasan a llamarse como el tipo. */
  const propios = new Set((parametros.tiposPropios || []).map(t => t.key))
  const [panel, setPanel] = useState(null) // { key: clave, o null si es nuevo; nombre, prefijo, digitos, reinicioAnual }
  const nombreDe = k => (k === 'otro' ? 'Otros documentos' : tipos[k]?.label)
  const abrir = k => setPanel({ key: k, nombre: tipos[k].label, prefijo: p.numeracion[k].prefijo, digitos: String(p.numeracion[k].digitos), reinicioAnual: !!p.numeracion[k].reinicioAnual })
  const abrirNuevo = () => setPanel({ key: null, nombre: '', prefijo: '', digitos: '4', reinicioAnual: true })
  const esNuevo = !!panel && !panel.key
  const editaNombre = !!panel && (esNuevo || propios.has(panel.key))
  // En uno nuevo la sigla se propone sola mientras no se escriba otra.
  const siglaPanel = !panel ? '' : (panel.prefijo || (esNuevo ? siglaDe(panel.nombre) : '')).toUpperCase()
  const errorPanel = !panel ? ''
    : editaNombre && panel.nombre.trim().length < 3 ? 'Escriba el nombre del tipo.'
      : editaNombre && Object.entries(tipos).some(([k, t]) => k !== panel.key && sinTildes(t.label).toLowerCase() === sinTildes(panel.nombre.trim()).toLowerCase()) ? 'Ya existe un tipo con ese nombre.'
        : siglaPanel.length < 2 ? 'La sigla necesita al menos dos letras.'
          : Object.entries(p.numeracion).some(([k, c]) => k !== panel.key && c.prefijo.toUpperCase() === siglaPanel) ? `La sigla ${siglaPanel} ya la usa otro tipo.`
            : ''
  const cfgPanel = panel && {
    ...(panel.key ? numeracion[panel.key] : { formato: '{prefijo}-{n}/{gestion}' }),
    prefijo: siglaPanel, digitos: Math.min(8, Math.max(1, Number(panel.digitos) || 4)), reinicioAnual: panel.reinicioAnual,
  }
  const cambioPanel = !!panel && (esNuevo || panel.nombre.trim() !== tipos[panel.key].label || JSON.stringify(cfgPanel) !== JSON.stringify(numeracion[panel.key]))
  const claveProx = panel?.key || '__nuevo'
  const proximoPanel = panel ? siguienteNumero(claveProx, emitidos, { ...parametros, numeracion: { ...normal.numeracion, [claveProx]: cfgPanel } }, contratos).texto : ''
  const usoPanel = panel?.key ? { plantillas: modelos.filter(m => m.categoria === panel.key).length, documentos: emitidos.filter(e => e.categoria === panel.key).length } : null
  const setCampo = (k, v) => setPanel(prev => ({ ...prev, [k]: v }))

  function guardarPanel() {
    if (errorPanel || !cambioPanel) return
    const label = panel.nombre.trim()
    // El borrador de la tabla también lo suma, ya guardado: no queda como «cambio sin guardar».
    const alBorrador = key => setP(prev => ({ ...prev, numeracion: { ...prev.numeracion, [key]: { ...cfgPanel, digitos: String(cfgPanel.digitos) } } }))
    if (esNuevo) {
      const key = claveNueva(label)
      const usados = Object.values(tipos).map(t => t.color)
      const color = COLORES_TIPO.find(c => !usados.includes(c)) || COLORES_TIPO[0]
      setParametros(prev => ({ ...prev, tiposPropios: [...(prev.tiposPropios || []), { key, label, plural: plural(label), color }], numeracion: { ...prev.numeracion, [key]: cfgPanel } }))
      alBorrador(key)
      anotarConfig(`Creó el tipo de documento «${label}» (${siglaPanel})`)
      return setPanel(null)
    }
    const k = panel.key
    const antes = tipos[k].label
    const renombra = propios.has(k) && label !== antes
    setParametros(prev => ({
      ...prev,
      ...(renombra && { tiposPropios: (prev.tiposPropios || []).map(t => (t.key === k ? { ...t, label, plural: plural(label) } : t)) }),
      numeracion: { ...prev.numeracion, [k]: cfgPanel },
    }))
    alBorrador(k)
    anotarConfig(renombra ? `Cambió el nombre del tipo de documento «${antes}» a «${label}»` : `Cambió la numeración de «${nombreDe(k)}»`)
    setPanel(null)
  }

  const eliminable = !!usoPanel && propios.has(panel.key) && !usoPanel.plantillas && !usoPanel.documentos
  function eliminarTipo() {
    if (!eliminable) return
    const k = panel.key
    const sinTipo = num => Object.fromEntries(Object.entries(num).filter(([c]) => c !== k))
    setParametros(prev => ({ ...prev, tiposPropios: (prev.tiposPropios || []).filter(t => t.key !== k), numeracion: sinTipo(prev.numeracion || {}) }))
    setP(prev => ({ ...prev, numeracion: sinTipo(prev.numeracion) }))
    anotarConfig(`Eliminó el tipo de documento «${tipos[k].label}»`)
    setPanel(null)
  }

  return (
    <>
      {/* EL ENCABEZADO LLEVA EL GUARDADO y se queda arriba al bajar, igual que «Configuración
          avanzada» de Onboarding: los ajustes que se tocan están a mitad de página y el botón tiene
          que seguir a mano. Sin cambios no hay botones; al guardar, «Cambios guardados». */}
      <div className="pl-header nt-encabezado">
        <div style={{ minWidth: 0 }}>
          <h1 className="pl-title">{titulo}</h1>
          <p className="pl-subtitle">{sub}</p>
        </div>
        <div className="nt-acciones">
          {error && <span className="nt-estado error" role="alert">{error}</span>}
          {sucio ? (
            <>
              {!error && <span className="nt-pendiente"><span aria-hidden="true" />{cambios.length === 1 ? '1 cambio sin guardar' : `${cambios.length} cambios sin guardar`}</span>}
              <button type="button" className="pl-btn-cancel" onClick={descartar}>Descartar</button>
              <button type="button" className="pl-btn-save nt-guardar" onClick={guardar}><Save size={14} aria-hidden="true" /> Guardar cambios</button>
            </>
          ) : guardado ? (
            <span className="nt-estado ok" role="status"><CheckCircle2 size={15} aria-hidden="true" /> Cambios guardados</span>
          ) : null}
        </div>
      </div>

      <div className="nt">
        {/* ── VENCIMIENTO DE DOCUMENTOS ── */}
        <section className="nt-sec">
          <Fila titulo="Avisar antes de que venza un documento" ayuda="Carnet, licencia, certificado de antecedentes y todo lo que tiene fecha de vencimiento.">
            <Interruptor valor={p.notificarVencimiento} onCambio={v => set('notificarVencimiento', v)} etiqueta="Avisar antes de que venza un documento" />
          </Fila>
          {p.notificarVencimiento ? (
            <>
              <Fila titulo="Cuándo avisar" ayuda="Días antes de que venza. Hasta tres avisos.">
                <div className="nt-linea">
                  {p.hitos.map((h, i) => (
                    <span key={i} className="nt-hito">
                      <input className="pl-input nt-num" inputMode="numeric" aria-label={`Aviso ${i + 1}, en días`} value={h} onChange={e => set('hitos', p.hitos.map((x, j) => (j === i ? soloNumero(e.target.value) : x)))} />
                      {p.hitos.length > 1 && <button type="button" className="nt-quitar" aria-label={`Quitar el aviso de ${h || '—'} días`} onClick={() => set('hitos', p.hitos.filter((_, j) => j !== i))}><X size={12} /></button>}
                    </span>
                  ))}
                  {p.hitos.length < 3 && <button type="button" className="nt-agregar" onClick={() => set('hitos', [...p.hitos, ''])}><Plus size={13} aria-hidden="true" /> Agregar</button>}
                  <span className="nt-sufijo">días antes</span>
                </div>
              </Fila>
              <Fila titulo="A quién" ayuda="Quién recibe cada aviso.">
                <div className="nt-linea">
                  {Object.entries(DESTINATARIOS).map(([k, l]) => (
                    <Casilla key={k} valor={p.destinatarios.includes(k)} onCambio={() => set('destinatarios', alternar(p.destinatarios, k))}>{l}</Casilla>
                  ))}
                </div>
              </Fila>
              <Fila titulo="Por dónde" ayuda="El colaborador elige el suyo entre estos. Cada aviso llega una vez por canal.">
                <div className="nt-linea">
                  {CANALES.map(([k, l]) => <Casilla key={k} valor={!!p.canales[k]} onCambio={v => set('canales', { ...p.canales, [k]: v })}>{l}</Casilla>)}
                </div>
              </Fila>
            </>
          ) : (
            <p className="nt-apagado">No se avisa a nadie antes de que un documento venza. Lo vencido sigue apareciendo en Expedientes.</p>
          )}
          <Fila titulo="Resumen a RR.HH." ayuda="Un correo con lo vencido, lo que está por vencer y lo que falta.">
            <div className="nt-seg" role="radiogroup" aria-label="Resumen a RR.HH.">
              {RESUMENES.map(([k, l]) => (
                <button key={k} type="button" role="radio" aria-checked={p.resumen === k} className={p.resumen === k ? 'on' : ''} onClick={() => set('resumen', k)}>{l}</button>
              ))}
            </div>
          </Fila>
        </section>

        {/* ── CONTRATOS ── */}
        <section className="nt-sec">
          <div className="nt-cab"><h2>Contratos</h2></div>
          <Fila titulo="Fin de contrato a plazo fijo" ayuda="Aviso al responsable, con tiempo para renovar o finalizar.">
            <div className="nt-linea"><input className="pl-input nt-num" inputMode="numeric" aria-label="Días antes del fin de contrato" value={p.avisoContratoDias} onChange={e => set('avisoContratoDias', soloNumero(e.target.value))} /><span className="nt-sufijo">días antes</span></div>
          </Fila>
        </section>

        {/* ── SOLICITUDES (16 oct 2026): cuántos días hábiles tiene RR.HH. para responder un pedido. Al
            colaborador se le dice al pedir; cada pedido guarda el plazo con que se hizo. ── */}
        <section className="nt-sec">
          <div className="nt-cab"><h2>Solicitudes</h2></div>
          <Fila titulo="Plazo para responder" ayuda="Lo que el colaborador pide desde la app: un certificado, una copia, una corrección. Al pedir, se le dice hasta qué día le responden.">
            <div className="nt-linea"><input className="pl-input nt-num" inputMode="numeric" aria-label="Días hábiles para responder una solicitud" value={p.plazoSolicitudDias} onChange={e => set('plazoSolicitudDias', soloNumero(e.target.value).slice(0, 2))} /><span className="nt-sufijo">días hábiles</span></div>
          </Fila>
        </section>

        {/* ── NUMERACIÓN: la lista de tipos y, al costado, el panel del que se abrió ── */}
        <section className="nt-sec">
          <div className="nt-cab"><h2>Tipos de documento</h2><span>Cada tipo con su sigla y su numeración. Un número no se usa dos veces, ni si el documento se anula.</span></div>
          <div className={`nt-tipos${panel ? ' con-panel' : ''}`}>
            <div className="nt-tabla-wrap">
              <table className="nt-tabla">
                <thead><tr><th>Tipo</th><th>Próximo número</th><th aria-hidden="true" /></tr></thead>
                <tbody>
                  {Object.entries(tipos).map(([k, t]) => {
                    if (!p.numeracion[k]) return null
                    const abierto = panel?.key === k
                    return (
                      <tr key={k} className={`nt-tipo-fila${abierto ? ' on' : ''}`} onClick={() => abrir(k)}>
                        <td>
                          <button type="button" className="nt-tipo" aria-expanded={abierto} onClick={e => { e.stopPropagation(); abrir(k) }}>
                            <span style={{ background: t.color }} aria-hidden="true" />{nombreDe(k)}
                            {!propios.has(k) && <small className="nt-souly">Souly</small>}
                          </button>
                        </td>
                        <td><span className="nt-proximo">{proximo(k)}</span></td>
                        <td className="nt-chev"><ChevronRight size={15} aria-hidden="true" /></td>
                      </tr>
                    )
                  })}
                  <tr className="nt-tipo-agregar">
                    <td colSpan={3}><button type="button" className="nt-tipo-agregar-btn" aria-expanded={esNuevo} onClick={abrirNuevo}><Plus size={14} aria-hidden="true" /> Nuevo tipo de documento <small>Constancia, carta de recomendación…</small></button></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {panel && (
              <aside className="nt-panel" aria-label={esNuevo ? 'Nuevo tipo de documento' : `Tipo ${nombreDe(panel.key)}`} onKeyDown={e => { if (e.key === 'Escape') setPanel(null) }}>
                <div className="nt-panel-cab">
                  {!esNuevo && <span className="nt-panel-punto" style={{ background: tipos[panel.key].color }} aria-hidden="true" />}
                  <h3>{esNuevo ? 'Nuevo tipo de documento' : nombreDe(panel.key)}</h3>
                  {!esNuevo && <small className={propios.has(panel.key) ? 'nt-propio' : 'nt-souly'}>{propios.has(panel.key) ? 'Creado por la empresa' : 'De Souly'}</small>}
                  <button type="button" className="nt-nuevo-x" aria-label="Cerrar" onClick={() => setPanel(null)}><X size={15} /></button>
                </div>
                <div className="nt-panel-cuerpo">
                  <label className="nt-campo">Nombre
                    {editaNombre
                      ? <input className="pl-input" key={panel.key || 'nuevo'} autoFocus={esNuevo} placeholder="Constancia" value={panel.nombre} onChange={e => setCampo('nombre', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') guardarPanel() }} />
                      : <input className="pl-input" value={nombreDe(panel.key)} readOnly aria-describedby="nt-nombre-fijo" />}
                  </label>
                  {!editaNombre && <span id="nt-nombre-fijo" className="nt-panel-nota">Los tipos de Souly no cambian de nombre. Su numeración sí se ajusta.</span>}
                  <div className="nt-panel-dos">
                    <label className="nt-campo">Sigla
                      <input className="pl-input nt-sigla" placeholder={siglaDe(panel.nombre) || 'SIG'} value={panel.prefijo} onChange={e => setCampo('prefijo', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8))} />
                    </label>
                    <label className="nt-campo">Dígitos
                      <input className="pl-input" inputMode="numeric" value={panel.digitos} onChange={e => setCampo('digitos', soloNumero(e.target.value).slice(0, 1))} />
                    </label>
                  </div>
                  <div className="nt-panel-linea">Reinicia cada año<Interruptor valor={!!panel.reinicioAnual} onCambio={v => setCampo('reinicioAnual', v)} etiqueta="Reiniciar cada año la numeración" /></div>
                  <div className="nt-panel-linea">Próximo número<span className="nt-proximo">{proximoPanel}</span></div>
                  {errorPanel && (editaNombre ? panel.nombre.trim() : true) && <p className="nt-nuevo-error" role="alert">{errorPanel}</p>}
                  <p className="nt-panel-nota">
                    {esNuevo
                      ? <>Se crea con su carpeta «{plural(panel.nombre.trim()) || '…'}» en Recibidos. Después se le hace su plantilla en Plantillas.</>
                      : <>Lo usan {usoPanel.plantillas === 1 ? '1 plantilla' : `${usoPanel.plantillas} plantillas`} y {usoPanel.documentos === 1 ? '1 documento emitido' : `${usoPanel.documentos} documentos emitidos`}.{propios.has(panel.key) && ' Si cambia el nombre, cambia también en ellos y en su carpeta de Recibidos.'}</>}
                  </p>
                </div>
                <div className="nt-panel-pie">
                  {!esNuevo && propios.has(panel.key) && (
                    <button type="button" className="nt-eliminar" disabled={!eliminable} onClick={eliminarTipo}
                      title={eliminable ? undefined : 'Lo usan plantillas o documentos: no se puede eliminar.'}>Eliminar tipo</button>
                  )}
                  <button type="button" className="pl-btn-cancel" onClick={() => setPanel(null)}>Cancelar</button>
                  <button type="button" className="pl-btn-save" disabled={!!errorPanel || !cambioPanel} onClick={guardarPanel}>{esNuevo ? 'Crear' : 'Guardar'}</button>
                </div>
              </aside>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

function Fila({ titulo, ayuda, children }) {
  return (
    <div className="nt-fila">
      <div className="nt-et"><b>{titulo}</b>{ayuda && <span>{ayuda}</span>}</div>
      <div className="nt-ctrl">{children}</div>
    </div>
  )
}

function Casilla({ valor, onCambio, children }) {
  return (
    <label className="nt-casilla">
      <input type="checkbox" checked={valor} onChange={e => onCambio(e.target.checked)} />
      {children}
    </label>
  )
}

function Interruptor({ valor, onCambio, etiqueta }) {
  return (
    <label className="nt-sw" title={etiqueta}>
      <input type="checkbox" role="switch" checked={valor} onChange={e => onCambio(e.target.checked)} aria-label={etiqueta} />
      <span aria-hidden="true" />
    </label>
  )
}
