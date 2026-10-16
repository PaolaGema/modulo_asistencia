import { useState } from 'react'
import { CheckCircle2, Plus, Save, X } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { COLORES_TIPO, DESTINATARIOS, numeracionDe, siguienteNumero, tiposDoc } from '../../data/documentacionData'
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

export default function Notificaciones({ titulo, sub }) {
  const { parametros, setParametros, emitidos, contratos, anotarConfig } = useDocumentacion()
  const tipos = tiposDoc(parametros)
  /* UN TIPO NUEVO DESDE LA NUMERACIÓN (16 oct 2026): la tabla ya muestra todos los tipos, y aquí
     también se crean, sin tener que abrir una plantilla. Se guarda al momento, como en el editor:
     queda su carpeta en Recibidos, su serie de números y la opción al hacer una plantilla. */
  const [nuevo, setNuevo] = useState(null) // { nombre, sigla, digitos, reinicio }
  const inicial = () => ({
    notificarVencimiento: parametros.notificarVencimiento,
    hitos: parametros.hitos.map(String),
    destinatarios: [...parametros.destinatarios],
    canales: { ...parametros.canales },
    resumen: parametros.resumen,
    avisoContratoDias: String(parametros.avisoContratoDias),
    papeleraDias: String(parametros.papeleraDias),
    numeracion: Object.fromEntries(Object.keys(tipos).map(k => [k, { ...numeracionDe(parametros, k), digitos: String(numeracionDe(parametros, k).digitos) }])),
  })
  const [p, setP] = useState(inicial)
  const [error, setError] = useState('')
  const [guardado, setGuardado] = useState(false)
  const set = (k, v) => { setP(prev => ({ ...prev, [k]: v })); setGuardado(false); setError('') }
  const setNum = (tipo, k, v) => set('numeracion', { ...p.numeracion, [tipo]: { ...p.numeracion[tipo], [k]: v } })

  /* Lo que se guardaría, ya normalizado: así «hay cambios» no salta por un 45 escrito como texto. */
  const hitos = [...new Set(p.hitos.map(Number).filter(n => n > 0))].sort((a, b) => b - a)
  const numeracion = Object.fromEntries(Object.entries(p.numeracion).map(([k, v]) => [k, { ...v, prefijo: v.prefijo.trim().toUpperCase(), digitos: Math.min(8, Math.max(1, Number(v.digitos) || 4)) }]))
  const normal = {
    notificarVencimiento: p.notificarVencimiento, hitos, destinatarios: p.destinatarios, canales: p.canales, resumen: p.resumen,
    avisoContratoDias: Number(p.avisoContratoDias) || 45, papeleraDias: Number(p.papeleraDias) || 30,
    numeracion: { ...parametros.numeracion, ...numeracion },
  }
  const actual = {
    notificarVencimiento: parametros.notificarVencimiento, hitos: parametros.hitos, destinatarios: parametros.destinatarios, canales: parametros.canales, resumen: parametros.resumen,
    avisoContratoDias: parametros.avisoContratoDias, papeleraDias: parametros.papeleraDias,
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

  const siglaNueva = nuevo ? (nuevo.sigla || siglaDe(nuevo.nombre)).toUpperCase().replace(/[^A-Z0-9]/g, '') : ''
  const errorNuevo = !nuevo ? ''
    : nuevo.nombre.trim().length < 3 ? 'Escriba el nombre del tipo.'
      : Object.values(tipos).some(t => sinTildes(t.label).toLowerCase() === sinTildes(nuevo.nombre.trim()).toLowerCase()) ? 'Ya existe un tipo con ese nombre.'
        : siglaNueva.length < 2 ? 'La sigla necesita al menos dos letras.'
          : Object.values(p.numeracion).some(c => c.prefijo.toUpperCase() === siglaNueva) ? `La sigla ${siglaNueva} ya la usa otro tipo.`
            : ''
  function crearTipo() {
    if (errorNuevo) return
    const label = nuevo.nombre.trim()
    const base = sinTildes(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const key = `t-${base}-${Date.now().toString(36).slice(-3)}`
    const usados = Object.values(tipos).map(t => t.color)
    const color = COLORES_TIPO.find(c => !usados.includes(c)) || COLORES_TIPO[0]
    const cfg = { prefijo: siglaNueva, formato: '{prefijo}-{n}/{gestion}', reinicioAnual: nuevo.reinicio, digitos: Math.min(8, Math.max(1, Number(nuevo.digitos) || 4)) }
    setParametros(prev => ({ ...prev, tiposPropios: [...(prev.tiposPropios || []), { key, label, plural: plural(label), color }], numeracion: { ...prev.numeracion, [key]: cfg } }))
    // El borrador de la tabla también lo suma, ya guardado: no queda como «cambio sin guardar».
    setP(prev => ({ ...prev, numeracion: { ...prev.numeracion, [key]: { ...cfg, digitos: String(cfg.digitos) } } }))
    anotarConfig(`Creó el tipo de documento «${label}» (${siglaNueva})`)
    setNuevo(null)
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

        {/* ── NUMERACIÓN ── */}
        <section className="nt-sec">
          <div className="nt-cab"><h2>Tipos de documento</h2><span>Cada tipo con su sigla y su numeración. Un número no se usa dos veces, ni si el documento se anula.</span></div>
          <div className="nt-tabla-wrap">
            <table className="nt-tabla">
              <thead><tr><th>Tipo</th><th>Sigla</th><th>Dígitos</th><th>Reinicia cada año</th><th>Próximo número</th></tr></thead>
              <tbody>
                {Object.entries(tipos).map(([k, t]) => {
                  const cfg = p.numeracion[k]
                  if (!cfg) return null
                  return (
                    <tr key={k}>
                      <td><span className="nt-tipo"><span style={{ background: t.color }} aria-hidden="true" />{k === 'otro' ? 'Otros documentos' : t.label}</span></td>
                      <td><input className="pl-input nt-sigla" aria-label={`Sigla de ${t.label}`} value={cfg.prefijo} onChange={e => setNum(k, 'prefijo', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8))} /></td>
                      <td><input className="pl-input nt-num nt-chico" inputMode="numeric" aria-label={`Dígitos de ${t.label}`} value={cfg.digitos} onChange={e => setNum(k, 'digitos', soloNumero(e.target.value).slice(0, 1))} /></td>
                      <td><Interruptor valor={!!cfg.reinicioAnual} onCambio={v => setNum(k, 'reinicioAnual', v)} etiqueta={`Reiniciar cada año la numeración de ${t.label}`} /></td>
                      <td><span className="nt-proximo">{proximo(k)}</span></td>
                    </tr>
                  )
                })}
                {nuevo ? (
                  <tr className="nt-nuevo">
                    <td><input className="pl-input" aria-label="Nombre del tipo nuevo" placeholder="Constancia" value={nuevo.nombre} autoFocus onChange={e => setNuevo(n => ({ ...n, nombre: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') crearTipo(); if (e.key === 'Escape') setNuevo(null) }} /></td>
                    <td><input className="pl-input nt-sigla" aria-label="Sigla del tipo nuevo" placeholder={siglaDe(nuevo.nombre) || 'SIG'} value={nuevo.sigla} onChange={e => setNuevo(n => ({ ...n, sigla: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) }))} /></td>
                    <td><input className="pl-input nt-num nt-chico" inputMode="numeric" aria-label="Dígitos del tipo nuevo" value={nuevo.digitos} onChange={e => setNuevo(n => ({ ...n, digitos: soloNumero(e.target.value).slice(0, 1) }))} /></td>
                    <td><Interruptor valor={nuevo.reinicio} onCambio={v => setNuevo(n => ({ ...n, reinicio: v }))} etiqueta="Reiniciar cada año la numeración del tipo nuevo" /></td>
                    <td>
                      <div className="nt-nuevo-acc">
                        <span className="nt-proximo">{siglaNueva || 'SIG'}-{'1'.padStart(Math.min(8, Math.max(1, Number(nuevo.digitos) || 4)), '0')}/{new Date().getFullYear()}</span>
                        <button type="button" className="pl-btn-save nt-nuevo-crear" disabled={!!errorNuevo} onClick={crearTipo}>Crear</button>
                        <button type="button" className="nt-nuevo-x" aria-label="Cancelar el tipo nuevo" onClick={() => setNuevo(null)}><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr className="nt-tipo-agregar">
                    <td colSpan={5}><button type="button" className="nt-tipo-agregar-btn" onClick={() => setNuevo({ nombre: '', sigla: '', digitos: '4', reinicio: true })}><Plus size={14} aria-hidden="true" /> Nuevo tipo de documento <small>Constancia, carta de recomendación…</small></button></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {nuevo && nuevo.nombre.trim().length > 0 && errorNuevo && <p className="nt-nuevo-error" role="alert">{errorNuevo}</p>}
          {nuevo && !errorNuevo && <p className="nt-nuevo-ayuda">Se crea al momento, con su carpeta «{plural(nuevo.nombre.trim())}» en Recibidos. Después se le hace su plantilla en Plantillas.</p>}
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
