import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CircleCheck, Ban, Download, FileText, RefreshCw, TriangleAlert, Upload } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { MODALIDADES, aFecha, datosPara, diasHasta, fechaCorta, iso, rellenar, siguienteNumero } from '../../data/documentacionData'
import { Cabecera, EstadoContratoChip, Modal, Vacio } from '../../components/documentacion/comunes'
import { descargarTexto, descargarParaImprimir } from '../../components/documentacion/utilidades'
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
    contratos, emitidos, parametros, empresa, persona: buscarPersona, modelo: buscarModelo,
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
  // El texto generado como Word, con las líneas de firma, para imprimirlo y hacerlo firmar.
  function descargarParaFirmar() {
    descargarParaImprimir(`${c.numero.replace(/\//g, '-')}_${persona?.codigo || ''}_para-firmar`, textoContrato(), { firmas: [`Por ${empresa?.nombre || 'la empresa'}`, persona?.name || 'El trabajador'] })
    registrarDescarga('contrato', c.id, c.colaboradorId, `Descargó ${c.numero} para imprimir y firmar`)
  }
  function descargar(v) {
    descargarTexto(`${v.archivo.replace(/\.pdf$/i, '')}_v${v.v}.txt`, `${c.numero} · versión ${v.v} (${v.tipo === 'firmado' ? 'firmado' : 'generado, sin firma'})\n${v.motivo} · ${fechaCorta(v.fecha)} · ${v.por}\n\n${textoContrato()}`)
    registrarDescarga('contrato', c.id, c.colaboradorId, `Descargó la versión ${v.v} de ${c.numero}`)
  }

  /* EL DOCUMENTO AL CENTRO (propuesta AA, 15 oct 2026). Un contrato es un documento: se ve como
     tal, grande, con un sello que dice si está firmado. A la derecha, una columna con lo que hay que
     saber y hacer: el estado en una frase, las acciones —la principal destacada—, los datos, las
     versiones y, si las hay, las adendas. */
  const firmado = actual?.tipo === 'firmado'
  const puedeRenovar = !cerrado && c.tipo === 'contrato' && c.modalidad !== 'indefinido'
  const renovarAhora = puedeRenovar && (estado === 'vencido' || estado === 'por_vencer')
  const aviso = c.finalizado
    ? { tono: 'gris', texto: <><b>Finalizado</b> el {fechaCorta(c.finalizado.fecha)} por {c.finalizado.por}: {c.finalizado.motivo}.</> }
    : c.reemplazado
      ? { tono: 'gris', texto: <><b>Reemplazado</b> el {fechaCorta(c.reemplazado.fecha)}{reemplazo ? <> por el <Link className="xc-enlace" to={`/documentos/expedientes/contrato/${reemplazo.id}`}>{reemplazo.numero}</Link></> : ''}. Se conserva con sus versiones.</> }
      : estado === 'vencido'
        ? { tono: 'rojo', texto: <><b>Venció {restantes === 0 ? 'hoy' : `hace ${-restantes} ${restantes === -1 ? 'día' : 'días'}`}</b> ({fechaCorta(fin)}). Si la persona sigue trabajando, renuévelo; si no, finalícelo. Mientras tanto Planillas la marca sin contrato vigente.</> }
        : estado === 'por_vencer'
          ? { tono: 'ambar', texto: <><b>Vence en {restantes} {restantes === 1 ? 'día' : 'días'}</b> ({fechaCorta(fin)}). Decida si lo renueva o lo deja terminar.{c.tipo === 'contrato' && nPlazos >= 2 ? ` Ojo: ya encadena ${nPlazos} plazos fijos; consúltelo con Legal (RF-66).` : ''}</> }
          : !firmado
            ? { tono: 'ambar', texto: <><b>Falta el firmado.</b> Este es el texto generado; suba el contrato firmado por las dos partes.</> }
            : { tono: 'verde', texto: <><b>Vigente y firmado.</b> Planillas liquida a {persona?.name} con este contrato.</> }

  return (
    <div className="content-scroll">
      <Link to={persona ? `/documentos/expedientes/${persona.id}` : '/documentos/expedientes'} className="xc-volver">
        <ArrowLeft size={13} aria-hidden="true" /> {persona ? `Expediente de ${persona.name}` : 'Expedientes'}
      </Link>

      <div className="xk-ficha">
        {/* LA HOJA, GRANDE. El sello dice en una palabra si este papel vale con firma o todavía no. */}
        <div className="xk-escena">
          <button type="button" className="xk-papel" onClick={() => setModal({ tipo: 'ver' })} aria-label="Ver el documento en grande">
            <HojaDocumento texto={textoContrato()} etiqueta={`Texto de ${c.numero}`} />
            <span className={`xk-sello${firmado ? ' firmado' : ''}`} aria-hidden="true">{firmado ? 'Firmado' : 'Sin firma'}</span>
          </button>
        </div>

        <aside className="xk-lado">
          <section className="dc-tarjeta xk-tarjeta">
            <h1 className="xk-titulo">{c.tipo === 'adenda' ? 'Adenda' : MODALIDADES[c.modalidad]} · {persona?.name || '—'}</h1>
            <p className="xk-sub">{c.numero}{persona ? ` · ${persona.cargo || 'Sin cargo'} · ${persona.sedeNombre || ''}` : ''}</p>
            <div className={`xk-aviso xk-${aviso.tono}`} role={aviso.tono === 'rojo' ? 'alert' : 'status'}>{aviso.texto}</div>
            {!cerrado && (
              /* LO QUE TOCA HACER, PRIMERO (16 oct 2026). Renovar va adelante sólo cuando el contrato
                 está por vencer o venció; antes salía en cualquier plazo fijo, también en uno recién
                 creado. Sin firmado, lo de adelante es subirlo, con «Descargar para imprimir» al lado:
                 descargar, imprimir, hacer firmar y subir es el camino de todo contrato nuevo. */
              <div className="xk-acciones">
                {renovarAhora
                  ? <button type="button" className="xk-btn-principal" onClick={() => setModal({ tipo: 'renovar' })}><RefreshCw size={14} aria-hidden="true" /> Renovar contrato</button>
                  : !firmado && <button type="button" className="xk-btn-principal" onClick={() => setModal({ tipo: 'version', clase: 'firmado' })}><Upload size={14} aria-hidden="true" /> Subir el firmado</button>}
                <div className="xk-acciones-fila">
                  {!firmado && (
                    <button type="button" className="dc-btn" onClick={descargarParaFirmar}>
                      <Download size={13} aria-hidden="true" /> Descargar para imprimir
                    </button>
                  )}
                  {(renovarAhora || firmado) && (
                    <button type="button" className="dc-btn" onClick={() => setModal({ tipo: 'version', clase: firmado ? 'reemplazar' : 'firmado' })}>
                      <Upload size={13} aria-hidden="true" /> {firmado ? 'Reemplazar' : 'Subir el firmado'}
                    </button>
                  )}
                  <button type="button" className="dc-btn dc-btn-peligro" onClick={() => setModal({ tipo: 'finalizar' })}><Ban size={13} aria-hidden="true" /> Finalizar</button>
                </div>
              </div>
            )}
          </section>

          <section className="dc-tarjeta xk-tarjeta">
            <dl className="xk-datos">
              <div><dt>Inicio</dt><dd>{fechaCorta(c.inicio)}</dd></div>
              <div><dt>Fin</dt><dd>{c.fin ? fechaCorta(c.fin) : 'Sin fecha de fin'}{fin && c.fin && fin !== c.fin ? ` · ampliado al ${fechaCorta(fin)}` : ''}</dd></div>
              <div><dt>Modalidad</dt><dd>{MODALIDADES[c.modalidad]}</dd></div>
              <div><dt>Modelo</dt><dd>{modelo?.nombre || '—'}</dd></div>
              <div><dt>Registrado por</dt><dd>{c.versiones[0]?.por || '—'}</dd></div>
              <div><dt>Gestión</dt><dd>{c.gestion}</dd></div>
            </dl>
            {c.comentarios && <p className="xk-coment"><b>Comentarios:</b> {c.comentarios}</p>}
          </section>

          <section className="dc-tarjeta xk-tarjeta">
            <h2 className="xk-rot">Versiones</h2>
            <ul className="xk-versiones">
              {[...c.versiones].reverse().map(v => (
                <li key={v.v} className={v.v === actual.v ? '' : 'antigua'}>
                  <span className="xk-v">v{v.v}</span>
                  <span className="xk-v-txt">
                    <b>{v.tipo === 'firmado' ? 'Firmado' : 'Generado, sin firma'}{v.v !== actual.v && ' · reemplazada'}</b>
                    <small>{fechaCorta(v.fecha)} · {v.por}</small>
                  </span>
                  <button type="button" className="xk-link" onClick={() => descargar(v)} aria-label={`Descargar la versión ${v.v}`}><Download size={13} aria-hidden="true" /> Descargar</button>
                </li>
              ))}
            </ul>
          </section>

          {cadena.length > 1 && (
            <section className="dc-tarjeta xk-tarjeta">
              <h2 className="xk-rot">Contrato y adendas</h2>
              <ol className="xk-cadena">
                {cadena.map(x => (
                  <li key={x.id} className={x.id === c.id ? 'actual' : ''}>
                    {x.id === c.id
                      ? <b>{x.tipo === 'adenda' ? 'Adenda' : 'Contrato'} {x.numero}</b>
                      : <Link to={`/documentos/expedientes/contrato/${x.id}`}>{x.tipo === 'adenda' ? 'Adenda' : 'Contrato'} {x.numero}</Link>}
                    <small>{fechaCorta(x.inicio)} → {x.fin ? fechaCorta(x.fin) : 'sin fin'}</small>
                    <EstadoContratoChip estado={estadoEfectivo(x, x.tipo === 'contrato' ? contratos : [], parametros)} />
                  </li>
                ))}
              </ol>
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
          numeroNuevo={siguienteNumero('contrato', emitidos, parametros, contratos).texto}
          textoDe={({ modalidad, inicio, fin: hasta }) => {
            const v = versionPublicada(buscarModelo(modalidad === 'indefinido' ? 'm-contrato-indef' : 'm-contrato-plazo'))
            const numero = siguienteNumero('contrato', emitidos, parametros, contratos).texto
            return rellenar(v?.texto || '', datosPara(persona, { empresa, numero, contrato: { modalidad, inicio, fin: modalidad === 'indefinido' ? null : hasta || null } }))
          }}
          contrato={c}
          fin={fin}
          nPlazos={nPlazos}
          persona={persona}
          onCerrar={() => setModal(null)}
          onListo={id => { setModal(null); navigate(`/documentos/expedientes/contrato/${id}`) }}
          onDescargar={(nuevo, texto) => {
            descargarParaImprimir(`${nuevo.numero.replace(/\//g, '-')}_${persona?.codigo || ''}_para-firmar`, texto, { firmas: [`Por ${empresa?.nombre || 'la empresa'}`, persona?.name || 'El trabajador'] })
            registrarDescarga('contrato', nuevo.id, nuevo.colaboradorId, `Descargó ${nuevo.numero} para imprimir y firmar`)
          }}
          onGuardar={({ modalidad, inicio, finNuevo }) => {
            // El contrato nuevo reemplaza a éste, que se conserva con sus versiones.
            const nuevo = registrarContrato({ colaboradorId: c.colaboradorId, modalidad, inicio, fin: modalidad === 'indefinido' ? null : finNuevo, modeloId: modalidad === 'indefinido' ? 'm-contrato-indef' : 'm-contrato-plazo', comentarios: `Renovación de ${c.numero}`, decision: 'reemplazar', anteriorId: c.id })
            const v = versionPublicada(buscarModelo(nuevo.modeloId))
            return { nuevo, texto: rellenar(v?.texto || '', datosPara(persona, { empresa, numero: nuevo.numero, contrato: nuevo })) }
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
      titulo={clase === 'firmado' ? 'Subir el contrato firmado' : 'Reemplazar el contrato'}
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

/* RENOVAR CONTRATO (16 oct 2026). Renovar es registrar UN CONTRATO NUEVO —a plazo fijo o
   indefinido— que reemplaza a éste; éste se conserva con sus versiones. Las adendas se quitaron:
   la empresa no las usa. Rige, por defecto, desde el día siguiente al fin vigente. Si ya van dos o
   más plazos fijos, avisa —con el número— pero deja seguir: la regla es de Legal (RF-66).
   UN MODAL GRANDE CON LA VISTA PREVIA: a la izquierda los datos —las fechas arriba, donde el
   calendario tiene lugar para abrirse—; a la derecha, el contrato tal como se va a imprimir, que
   cambia al cambiar la modalidad o las fechas. */
/* DESPUÉS DE RENOVAR (16 oct 2026), el mismo modal muestra el contrato nuevo tal como quedó, con
   «Descargar para imprimir»: es lo que sigue —imprimirlo y hacerlo firmar—. Al cerrar se va a la
   ficha del contrato nuevo, que es donde después se sube el firmado. */
function ModalRenovar({ contrato, fin, nPlazos, persona, numeroNuevo, textoDe, onCerrar, onGuardar, onListo, onDescargar }) {
  const [hecho, setHecho] = useState(null) // { nuevo, texto }
  const [bajado, setBajado] = useState(false)
  const [modalidad, setModalidad] = useState(contrato.modalidad === 'indefinido' ? 'indefinido' : 'plazo_fijo')
  const [inicio, setInicio] = useState(fin ? sumarDia(fin) : iso(new Date()))
  const [finNuevo, setFinNuevo] = useState('')
  const sinFin = modalidad === 'indefinido'
  const errores = []
  if (!sinFin && finNuevo && inicio && finNuevo <= inicio) errores.push('La fecha de fin tiene que ser posterior al inicio.')
  const listo = inicio && (sinFin || finNuevo) && !errores.length

  if (hecho) {
    const { nuevo, texto } = hecho
    const descargar = () => { onDescargar(nuevo, texto); setBajado(true) }
    return (
      <Modal titulo={`Contrato ${nuevo.numero} · ${persona?.name || ''}`} Icono={CircleCheck} onCerrar={() => onListo(nuevo.id)} ancho={900}
        pie={<>
          <span className="xc-pie-nota">{bajado ? 'Descargado. Imprímalo, hágalo firmar y suba el firmado desde el contrato.' : 'Siguiente paso: descargarlo, imprimirlo y hacerlo firmar.'}</span>
          <button type="button" className="pl-btn-cancel" onClick={() => onListo(nuevo.id)}>Ir al contrato</button>
          <button type="button" className="pl-btn-save" onClick={descargar}><Download size={14} aria-hidden="true" /> {bajado ? 'Descargar de nuevo' : 'Descargar para imprimir'}</button>
        </>}>
        <div className="xc-exito">
          <div className="xc-exito-cab">
            <span className="xc-exito-ico"><CircleCheck size={22} aria-hidden="true" /></span>
            <div>
              <h2>Contrato renovado: {nuevo.numero}</h2>
              <p>{MODALIDADES[nuevo.modalidad]} desde el {fechaCorta(nuevo.inicio)}{nuevo.fin ? ` hasta el ${fechaCorta(nuevo.fin)}` : ''}. {contrato.numero} quedó como reemplazado.</p>
            </div>
          </div>
          <HojaDocumento texto={texto} etiqueta={`Contrato ${nuevo.numero}`} />
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      titulo={`Renovar contrato ${contrato.numero} · ${persona?.name || ''}`}
      Icono={RefreshCw}
      onCerrar={onCerrar}
      ancho={1040}
      pie={<>
        <span className="xc-pie-nota">{listo ? (sinFin ? `Contrato indefinido desde el ${fechaCorta(inicio)}` : `Del ${fechaCorta(inicio)} al ${fechaCorta(finNuevo)}`) : sinFin ? 'Elija desde cuándo rige.' : 'Elija hasta cuándo rige el contrato nuevo.'}</span>
        <button type="button" className="pl-btn-cancel" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="pl-btn-save" disabled={!listo} onClick={() => setHecho(onGuardar({ modalidad, inicio, finNuevo }))}>Renovar contrato</button>
      </>}
    >
      <div className="xc-renovar">
        <div className="xc-renovar-datos">
          <div className="pl-label">
            Modalidad
            <div className="xa-segmento" role="group" aria-label="Modalidad del contrato nuevo" style={{ alignSelf: 'flex-start', marginTop: 6 }}>
              {['plazo_fijo', 'indefinido'].map(m => <button key={m} type="button" className={modalidad === m ? 'on' : ''} aria-pressed={modalidad === m} onClick={() => setModalidad(m)}>{MODALIDADES[m]}</button>)}
            </div>
          </div>
          <div className="pl-label">
            Desde
            <SelectorFecha id="xc-r-inicio" valor={inicio} onCambio={setInicio} ariaLabel="Desde cuándo rige el contrato nuevo" />
          </div>
          {!sinFin && (
            <div className="pl-label">
              Hasta
              <SelectorFecha id="xc-r-fin" valor={finNuevo} onCambio={setFinNuevo} ariaLabel="Hasta cuándo rige el contrato nuevo" />
            </div>
          )}
          {errores.map(e => <p key={e} className="xc-error">{e}</p>)}
          {nPlazos >= 2 && modalidad === 'plazo_fijo' && (
            <div className="xc-aviso xc-aviso-ambar" role="alert">
              <TriangleAlert size={15} aria-hidden="true" />
              <p><b>{persona?.name} ya encadena {nPlazos} contratos a plazo fijo.</b> Otra renovación puede convertir la relación en indefinida. Consúltelo con Legal (RF-66).</p>
            </div>
          )}
          <p className="xc-ayuda">Se registra con el número <b>{numeroNuevo}</b>. {contrato.numero} queda como reemplazado y se conserva.</p>
          <p className="xc-ayuda">Después, imprímalo, hágalo firmar y suba el firmado desde la ficha del contrato.</p>
        </div>
        <div className="xc-renovar-previa">
          <span className="xc-renovar-previa-tit">Vista previa · {numeroNuevo}</span>
          <HojaDocumento texto={textoDe({ modalidad, inicio, fin: finNuevo })} compacta etiqueta={`Vista previa del contrato ${numeroNuevo}`} />
        </div>
      </div>
    </Modal>
  )
}
