import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Ban, CalendarClock, CircleCheck, Download, Eye, FileText, PenLine, RefreshCw, TriangleAlert, Upload } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { MODALIDADES, aFecha, datosPara, diasHasta, fechaCorta, iso, rellenar } from '../../data/documentacionData'
import { Cabecera, EstadoContratoChip, Etiqueta, Modal, PersonaCelda, Vacio } from '../../components/documentacion/comunes'
import { descargarTexto } from '../../components/documentacion/utilidades'
import SelectorFecha from '../../components/layout/SelectorFecha'
import HojaDocumento from './HojaDocumento'
import { estadoEfectivo, finEfectivo, plazosFijosDe, versionPublicada } from './emisionUtil'
import './emision.css'

/* ── LA FICHA DEL CONTRATO (pantalla 12 · RF-60 a RF-66) ──────────────────
   La historia contractual de una persona en un solo lugar: el contrato, sus versiones y sus
   adendas encadenadas. Es la familia con más consecuencias fuera del módulo —Planillas liquida
   con lo que dice acá (RF-65)—, así que la ficha dice arriba y sin rodeos en qué estado está.

   REEMPLAZAR NO BORRA (RF-63, RN-13). Cargar el firmado o reemplazar crea una versión nueva; la
   anterior sigue descargable y queda marcada, con quién la reemplazó y por qué. */

const sumarDia = (s, n = 1) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d) }

export default function Contrato() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    contratos, parametros, empresa, persona: buscarPersona, modelo: buscarModelo,
    versionarContrato, finalizarContrato, registrarContrato, registrarDescarga,
  } = useDocumentacion()
  const [modal, setModal] = useState(null) // 'version' | 'finalizar' | 'renovar' | 'ver'
  const c = contratos.find(x => x.id === id)

  if (!c) {
    return (
      <div className="content-scroll">
        <Cabecera titulo="Contrato no encontrado" />
        <div className="dc-tarjeta">
          <Vacio Icono={FileText} titulo="Este contrato no existe" texto="Puede que el enlace esté incompleto. Los contratos de cada persona están en su expediente.">
            <Link className="dc-btn" to="/documentos/expedientes">Ir a expedientes</Link>
          </Vacio>
        </div>
      </div>
    )
  }

  const persona = buscarPersona(c.colaboradorId)
  const modelo = buscarModelo(c.modeloId)
  const origen = c.origenId ? contratos.find(x => x.id === c.origenId) : null
  const raiz = origen || c
  /* LA CADENA ENTERA, EN ORDEN: el contrato y todas sus adendas, por fecha de inicio (RF-62).
     Desde cualquiera de ellas se ve lo mismo, así nadie tiene que saber en cuál entró. */
  const cadena = [raiz, ...contratos.filter(x => x.origenId === raiz.id).sort((a, b) => (a.inicio < b.inicio ? -1 : 1))]
  const estado = c.tipo === 'contrato' ? estadoEfectivo(c, contratos, parametros) : estadoEfectivo(c, [], parametros)
  const fin = c.tipo === 'contrato' ? finEfectivo(c, contratos) : c.fin
  const cerrado = !!(c.finalizado || c.reemplazado)
  const restantes = fin ? diasHasta(fin) : null
  const nPlazos = plazosFijosDe(c.colaboradorId, contratos)
  const actual = c.versiones[c.versiones.length - 1]
  const reemplazo = c.reemplazado ? contratos.find(x => x.id === c.reemplazado.por_id) : null

  const textoContrato = () => {
    const v = versionPublicada(modelo)
    return rellenar(v?.texto || '', datosPara(persona, { empresa, contrato: c, numero: c.numero }))
  }
  function descargar(v) {
    descargarTexto(`${v.archivo.replace(/\.pdf$/i, '')}_v${v.v}.txt`, `${c.numero} · versión ${v.v} (${v.tipo === 'firmado' ? 'firmado' : 'generado, sin firma'})\n${v.motivo} · ${fechaCorta(v.fecha)} · ${v.por}\n\n${textoContrato()}`)
    registrarDescarga('contrato', c.id, c.colaboradorId, `Descargó la versión ${v.v} de ${c.numero}`)
  }

  return (
    <div className="content-scroll">
      <Link to={persona ? `/documentos/expedientes/${persona.id}` : '/documentos/expedientes'} className="xc-volver">
        <ArrowLeft size={13} aria-hidden="true" /> {persona ? `Expediente de ${persona.name}` : 'Expedientes'}
      </Link>
      <Cabecera titulo={`${c.tipo === 'adenda' ? 'Adenda' : 'Contrato'} ${c.numero}`} sub={`${persona?.name || '—'} · ${MODALIDADES[c.modalidad]}`}>
        <EstadoContratoChip estado={estado} />
        {!cerrado && (
          <>
            <button type="button" className="dc-btn" onClick={() => setModal({ tipo: 'version', clase: actual?.tipo === 'firmado' ? 'reemplazar' : 'firmado' })}>
              <Upload size={13} aria-hidden="true" /> {actual?.tipo === 'firmado' ? 'Reemplazar' : 'Cargar el firmado'}
            </button>
            {c.tipo === 'contrato' && c.modalidad !== 'indefinido' && (
              <button type="button" className="dc-btn" onClick={() => setModal({ tipo: 'renovar' })}><RefreshCw size={13} aria-hidden="true" /> Renovar con adenda</button>
            )}
            <button type="button" className="dc-btn dc-btn-peligro" onClick={() => setModal({ tipo: 'finalizar' })}><Ban size={13} aria-hidden="true" /> Finalizar</button>
          </>
        )}
      </Cabecera>

      {c.finalizado && (
        <div className="xc-aviso xc-aviso-gris"><Ban size={15} aria-hidden="true" /><p><b>Finalizado</b> el {fechaCorta(c.finalizado.fecha)} por {c.finalizado.por}: {c.finalizado.motivo}. Se conserva para consulta; ya no es el contrato vigente.</p></div>
      )}
      {c.reemplazado && (
        <div className="xc-aviso xc-aviso-gris">
          <RefreshCw size={15} aria-hidden="true" />
          <p><b>Reemplazado</b> el {fechaCorta(c.reemplazado.fecha)} por {c.reemplazado.por}{reemplazo ? <> con el <Link className="xc-enlace" to={`/documentos/contratos/${reemplazo.id}`}>{reemplazo.numero}</Link></> : ''}. Se conserva con todas sus versiones.</p>
        </div>
      )}
      {!cerrado && estado === 'por_vencer' && (
        /* RF-40: EL AVISO LLEGA CON TIEMPO PARA DECIDIR, no el día del vencimiento. Y trae las dos
           salidas a mano, que es lo que hace falta hacer con él. */
        <div className="xc-aviso xc-aviso-ambar" role="status">
          <CalendarClock size={15} aria-hidden="true" />
          <div className="xc-aviso-cuerpo">
            <p><b>Vence en {restantes} {restantes === 1 ? 'día' : 'días'}</b> ({fechaCorta(fin)}). Decida si lo renueva con una adenda o lo deja terminar.</p>
            {c.tipo === 'contrato' && nPlazos >= 2 && <p>Ojo: {persona?.name} ya encadena {nPlazos} plazos fijos. Otra renovación puede convertir la relación en indefinida; consúltelo con Legal (RF-66).</p>}
          </div>
        </div>
      )}
      {!cerrado && estado === 'vencido' && (
        <div className="xc-aviso xc-aviso-rojo" role="alert"><TriangleAlert size={15} aria-hidden="true" /><p><b>Venció el {fechaCorta(fin)}.</b> Si la persona sigue trabajando, registre una adenda o un contrato nuevo; si no, finalícelo. Un colaborador activo sin contrato vigente queda marcado también en Planillas.</p></div>
      )}

      <div className="xc-ficha">
        <div className="xc-col">
          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab">
              <h2>{c.tipo === 'adenda' ? 'Datos de la adenda' : 'Datos del contrato'}</h2>
              <button type="button" className="dc-btn dc-btn-sm" onClick={() => setModal({ tipo: 'ver' })}><Eye size={12} aria-hidden="true" /> Ver el documento</button>
            </div>
            <div className="dc-tarjeta-cuerpo">
              <PersonaCelda persona={persona} size={38} onClick={persona ? () => navigate(`/documentos/expedientes/${persona.id}`) : undefined} />
              <dl className="xc-datos">
                <div><dt>Número</dt><dd>{c.numero}</dd></div>
                <div><dt>Tipo</dt><dd>{c.tipo === 'adenda' ? 'Adenda' : 'Contrato'}</dd></div>
                <div><dt>Modalidad</dt><dd>{MODALIDADES[c.modalidad]}</dd></div>
                <div><dt>Inicio</dt><dd>{fechaCorta(c.inicio)}</dd></div>
                <div><dt>Fin</dt><dd>{c.fin ? fechaCorta(c.fin) : 'Sin fecha de fin'}{fin && c.fin && fin !== c.fin ? ` · ampliado al ${fechaCorta(fin)}` : ''}</dd></div>
                <div><dt>Modelo</dt><dd>{modelo?.nombre || '—'}</dd></div>
                <div><dt>Registrado por</dt><dd>{c.versiones[0]?.por || '—'}</dd></div>
                <div><dt>Gestión</dt><dd>{c.gestion}</dd></div>
              </dl>
              {c.comentarios && <p className="xc-ayuda" style={{ marginTop: 12, fontSize: 12.5 }}><b>Comentarios:</b> {c.comentarios}</p>}
            </div>
          </section>

          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h2>Versiones</h2><span className="xc-ayuda" style={{ margin: 0 }}>Reemplazar no borra: todas siguen descargables.</span></div>
            <div className="dc-tarjeta-cuerpo">
              <ul className="xc-versiones">
                {[...c.versiones].reverse().map(v => {
                  const vigente = v.v === actual.v
                  return (
                    <li key={v.v} className={`xc-version${vigente ? '' : ' antigua'}`}>
                      <span className="xc-version-v">v{v.v}</span>
                      <span className="xc-version-txt">
                        <b>
                          {v.tipo === 'firmado' ? 'Firmado y cargado' : 'Generado, sin firma'}
                          {vigente ? <Etiqueta tono="verde">Actual</Etiqueta> : <Etiqueta tono="violeta">Reemplazada</Etiqueta>}
                        </b>
                        <small>{fechaCorta(v.fecha)} · {v.por} · {v.motivo}</small>
                        <small>{v.archivo}</small>
                      </span>
                      <button type="button" className="dc-btn dc-btn-sm" onClick={() => descargar(v)} aria-label={`Descargar la versión ${v.v}`}><Download size={12} aria-hidden="true" /> Descargar</button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </div>

        <aside className="xc-col">
          <section className="dc-tarjeta">
            <div className="dc-tarjeta-cab"><h3>{cadena.length > 1 ? 'Contrato y adendas' : 'Adendas'}</h3></div>
            <div className="dc-tarjeta-cuerpo">
              {cadena.length === 1 ? (
                <p className="xc-ayuda" style={{ margin: 0 }}>Este contrato no tiene adendas.{c.tipo === 'contrato' && c.modalidad !== 'indefinido' && !cerrado ? ' Para ampliar su plazo, use «Renovar con adenda».' : ''}</p>
              ) : (
                <ol className="xc-cadena">
                  {cadena.map(x => (
                    <li key={x.id} className={x.id === c.id ? 'actual' : ''}>
                      {x.id === c.id
                        ? <b style={{ fontSize: 13, color: 'var(--text-heading)' }}>{x.tipo === 'adenda' ? 'Adenda' : 'Contrato'} {x.numero} (esta ficha)</b>
                        : <Link to={`/documentos/contratos/${x.id}`}>{x.tipo === 'adenda' ? 'Adenda' : 'Contrato'} {x.numero}</Link>}
                      <small>{fechaCorta(x.inicio)} → {x.fin ? fechaCorta(x.fin) : 'sin fin'}</small>
                      <small><EstadoContratoChip estado={estadoEfectivo(x, x.tipo === 'contrato' ? contratos : [], parametros)} /></small>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
          {persona && (
            <section className="dc-tarjeta">
              <div className="dc-tarjeta-cab"><h3>Para Planillas</h3></div>
              <div className="dc-tarjeta-cuerpo">
                <p className="xc-ayuda" style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6 }}>
                  {cerrado || estado === 'vencido'
                    ? 'Este contrato ya no es el que Planillas usa para liquidar.'
                    : `Planillas liquida a ${persona.name} con este contrato: ${MODALIDADES[c.modalidad].toLowerCase()}, desde el ${fechaCorta(c.inicio)}${fin ? ` hasta el ${fechaCorta(fin)}` : ''} (RF-65).`}
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>

      {modal?.tipo === 'version' && (
        <ModalVersion
          clase={modal.clase}
          onCerrar={() => setModal(null)}
          onGuardar={(motivo, archivo) => { versionarContrato(c.id, { tipo: 'firmado', motivo, archivo: archivo || `${persona?.codigo}_contrato-firmado_${iso(new Date())}.pdf` }); setModal(null) }}
        />
      )}
      {modal?.tipo === 'finalizar' && (
        <ModalMotivo
          titulo={`Finalizar ${c.numero}`}
          texto="El contrato deja de ser el vigente. No se borra: queda en el expediente con su fecha de finalización y el motivo."
          boton="Finalizar contrato"
          placeholder="Término del plazo sin renovación."
          onCerrar={() => setModal(null)}
          onGuardar={motivo => { finalizarContrato(c.id, motivo); setModal(null) }}
        />
      )}
      {modal?.tipo === 'renovar' && (
        <ModalRenovar
          contrato={c}
          fin={fin}
          nPlazos={nPlazos}
          persona={persona}
          onCerrar={() => setModal(null)}
          onGuardar={({ inicio, finNuevo }) => {
            const nuevo = registrarContrato({ colaboradorId: c.colaboradorId, modalidad: c.modalidad, inicio, fin: finNuevo, modeloId: 'm-adenda', origenId: c.id, comentarios: `Renovación de ${c.numero}` })
            setModal(null)
            navigate(`/documentos/contratos/${nuevo.id}`)
          }}
        />
      )}
      {modal?.tipo === 'ver' && (
        <Modal titulo={`${c.numero} · ${modelo?.nombre || ''}`} Icono={FileText} onCerrar={() => setModal(null)} ancho={780}>
          <p className="xc-ayuda" style={{ margin: 0 }}>El texto de la plantilla con los datos del contrato. El archivo firmado, si lo hay, es la versión «Firmado y cargado».</p>
          <HojaDocumento texto={textoContrato()} compacta />
        </Modal>
      )}
    </div>
  )
}

function ModalMotivo({ titulo, texto, boton, placeholder, onCerrar, onGuardar }) {
  const [motivo, setMotivo] = useState('')
  return (
    <Modal
      titulo={titulo}
      Icono={Ban}
      onCerrar={onCerrar}
      ancho={480}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={motivo.trim().length < 5} onClick={() => onGuardar(motivo.trim())}>{boton}</button>
      </>}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-heading)' }}>{texto}</p>
      <label className="pl-label" htmlFor="xc-motivo-k">
        Motivo
        <textarea id="xc-motivo-k" className="pl-input xc-textarea" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder={placeholder} autoFocus />
        <span className="xc-ayuda">Obligatorio. Queda en la bitácora.</span>
      </label>
    </Modal>
  )
}

/* CARGAR EL FIRMADO O REEMPLAZAR: siempre una versión nueva con motivo. El motivo es lo que
   dentro de un año explica por qué hay dos archivos para el mismo contrato. */
function ModalVersion({ clase, onCerrar, onGuardar }) {
  const [motivo, setMotivo] = useState(clase === 'firmado' ? 'Se cargó el contrato firmado por las dos partes' : '')
  const [archivo, setArchivo] = useState('')
  return (
    <Modal
      titulo={clase === 'firmado' ? 'Cargar el contrato firmado' : 'Reemplazar el contrato'}
      Icono={Upload}
      onCerrar={onCerrar}
      ancho={500}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!archivo || motivo.trim().length < 5} onClick={() => onGuardar(motivo.trim(), archivo)}>Guardar versión</button>
      </>}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-heading)' }}>
        Se crea una versión nueva. La actual no se borra: queda descargable y marcada como reemplazada (RF-63).
      </p>
      <label className="dc-btn" style={{ alignSelf: 'flex-start', cursor: 'pointer' }}>
        <Upload size={13} aria-hidden="true" /> {archivo ? `Adjunto: ${archivo}` : 'Adjuntar archivo (PDF)'}
        <input type="file" accept="application/pdf,image/*" hidden onChange={e => setArchivo(e.target.files?.[0]?.name || '')} />
      </label>
      <label className="pl-label" htmlFor="xc-motivo-v">
        Motivo del cambio
        <textarea id="xc-motivo-v" className="pl-input xc-textarea" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Se corrigió la cláusula de remuneración." />
      </label>
    </Modal>
  )
}

/* RENOVAR CON ADENDA (RF-62, RF-66). La adenda queda encadenada a este contrato y empieza, por
   defecto, el día siguiente al fin vigente. Si ya van dos o más plazos fijos, avisa —con el
   número— pero deja seguir: la regla es de Legal, no del sistema. */
function ModalRenovar({ contrato, fin, nPlazos, persona, onCerrar, onGuardar }) {
  const [inicio, setInicio] = useState(fin ? sumarDia(fin) : iso(new Date()))
  const [finNuevo, setFinNuevo] = useState('')
  const errores = []
  if (inicio && inicio < contrato.inicio) errores.push('Una adenda no puede empezar antes que su contrato (RN-19).')
  if (finNuevo && inicio && finNuevo <= inicio) errores.push('El nuevo fin tiene que ser posterior al inicio.')
  const listo = inicio && finNuevo && !errores.length
  return (
    <Modal
      titulo={`Renovar ${contrato.numero} con una adenda`}
      Icono={PenLine}
      onCerrar={onCerrar}
      ancho={520}
      pie={<>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!listo} onClick={() => onGuardar({ inicio, finNuevo })}>Registrar adenda</button>
      </>}
    >
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-heading)' }}>
        Se genera una adenda de ampliación de plazo para {persona?.name}, encadenada a este contrato. Para otro tipo de adenda, emítala desde <Link className="xc-enlace" to={`/documentos/emitir?origen=${contrato.id}`}>Emitir</Link>.
      </p>
      {nPlazos >= 2 && (
        <div className="xc-aviso xc-aviso-ambar" role="alert">
          <TriangleAlert size={15} aria-hidden="true" />
          <p><b>{persona?.name} ya encadena {nPlazos} contratos a plazo fijo.</b> Según la norma laboral, otra renovación puede convertir la relación en indefinida. Consúltelo con Legal: el sistema avisa, pero la decisión es suya (RF-66).</p>
        </div>
      )}
      <div className="xc-fila">
        <div className="pl-label">
          Rige desde
          <SelectorFecha id="xc-r-inicio" valor={inicio} onCambio={setInicio} ariaLabel="Inicio de la adenda" />
        </div>
        <div className="pl-label">
          Nueva fecha de fin
          <SelectorFecha id="xc-r-fin" valor={finNuevo} onCambio={setFinNuevo} ariaLabel="Nueva fecha de fin" />
        </div>
      </div>
      {errores.map(e => <p key={e} className="xc-error">{e}</p>)}
      {listo && <p className="xc-ayuda"><CircleCheck size={11} aria-hidden="true" /> El contrato quedará vigente hasta el {fechaCorta(finNuevo)}.</p>}
    </Modal>
  )
}
