import { useMemo, useRef, useState } from 'react'
import { Download, Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, History, Wand2, Paperclip } from 'lucide-react'
import { useDocumentacion } from '../../context/DocumentacionContext'
import { Cabecera, Vacio } from '../../components/documentacion/comunes'
import { descargarTexto } from '../../components/documentacion/utilidades'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { normalizarNombre, fechaCorta, iso, versionActual } from '../../data/documentacionData'
import './expediente.css'

/* ── CARGA POR LOTE (pantalla 7 · RF-30, historia «Cargar cien documentos de una vez») ──
   Sin esto, migrar una empresa de 400 personas es inviable (2.2). El recorrido es el del PRD:
   se baja la plantilla, se llena, se sube, y ANTES de guardar nada el sistema dice fila por
   fila qué está mal. Las filas buenas se cargan aunque otras fallen; las malas quedan en el
   reporte del lote con su motivo, para corregirlas y volver a subir solo esas.

   LOS ARCHIVOS VIAJAN CON LA PLANILLA: se adjuntan los PDF o imágenes junto al CSV y cada fila se
   empareja con el suyo por el nombre de la columna «archivo». Lo adjunto se guarda de verdad y se
   ve en el expediente; una fila cuyo archivo no se adjuntó se carga igual, sólo con el nombre, y
   lo avisa —no lo bloquea—, para que una migración grande no se frene por un escaneo pendiente. */

const COLUMNAS = ['codigo_colaborador', 'subtipo', 'fecha_emision', 'fecha_vencimiento', 'archivo']

/* Acepta dd/mm/aaaa, que es como la escribe RR.HH. (RNF-22), y aaaa-mm-dd, que es como la
   exporta cualquier sistema. Una fecha que no existe —31/02— se rechaza, no se corre. */
const leerFecha = s => {
  const t = String(s || '').trim()
  if (!t) return ''
  let a, m, d
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(t)) [d, m, a] = t.split('/').map(Number)
  else if (/^\d{4}-\d{2}-\d{2}$/.test(t)) [a, m, d] = t.split('-').map(Number)
  else return null
  const f = new Date(a, m - 1, d)
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d ? iso(f) : null
}

const partirCSV = texto => {
  const lineas = String(texto || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim())
  if (!lineas.length) return []
  const sep = lineas[0].includes(';') ? ';' : ','
  const celdas = l => l.split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
  const primera = celdas(lineas[0]).map(c => c.toLowerCase())
  const conEncabezado = primera.includes('subtipo') || primera.includes('codigo_colaborador')
  return (conEncabezado ? lineas.slice(1) : lineas).map((l, i) => ({ n: i + (conEncabezado ? 2 : 1), celdas: celdas(l) }))
}

const sinTildes = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
const extension = n => { const e = String(n).split('.').pop().toLowerCase(); return e === 'jpeg' ? 'jpg' : e }

export default function CargaLote() {
  const { personas, subtipos, tipos, documentos, lotes, registrarLote } = useDocumentacion()
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState(null) // { id, ok, errores }
  const [abierto, setAbierto] = useState(null)
  const entrada = useRef(null)
  const entradaArchivos = useRef(null)
  /* Los archivos adjuntos, por su nombre en minúsculas: así «Carnet.PDF» empareja con «carnet.pdf». */
  const [adjuntos, setAdjuntos] = useState(() => new Map())
  const [cargando, setCargando] = useState(false)
  /* La lista del navegador se copia ANTES de vaciar el campo: es «viva», y al limpiar el input
     para poder volver a elegir los mismos archivos quedaba vacía antes de leerla. */
  const adjuntar = lista => {
    const copia = [...(lista || [])]
    setAdjuntos(prev => { const m = new Map(prev); for (const f of copia) m.set(f.name.toLowerCase(), f); return m })
  }

  /* LA VALIDACIÓN PREVIA, fila por fila. Cada fila sale con su lista de problemas; una fila sin
     problemas es una fila que se puede cargar. Los avisos —«ya existe, se versiona»— no bloquean. */
  const filas = useMemo(() => {
    const vistas = new Set()
    return partirCSV(texto).map(({ n, celdas }) => {
      const [codigo, sub, emi, venc, archivo] = celdas
      const errores = []
      const avisos = []
      const persona = personas.find(p => p.codigo === String(codigo || '').trim())
      const subtipo = subtipos.find(s => s.codigoErp && sinTildes(s.codigoErp) === sinTildes(sub))
        || subtipos.find(s => sinTildes(s.nombre) === sinTildes(sub))
      const tipo = subtipo && tipos.find(t => t.id === subtipo.tipoId)
      const emision = leerFecha(emi)
      const vencimiento = leerFecha(venc)

      if (!codigo) errores.push('Falta el código de colaborador')
      else if (!persona) errores.push(`No hay ningún colaborador con código ${codigo}`)
      if (!sub) errores.push('Falta el subtipo')
      else if (!subtipo) errores.push(`«${sub}» no es un subtipo configurado`)
      else if (!subtipo.activo || !tipo?.activo) errores.push(`«${subtipo.nombre}» está desactivado`)
      if (persona?.status === 'desvinculado' && subtipo && !tipo?.deBaja) errores.push('El expediente está cerrado: solo admite documentos de baja (RN-21)')
      if (!emi) errores.push('Falta la fecha de emisión')
      else if (emision === null) errores.push(`«${emi}» no es una fecha válida (use dd/mm/aaaa)`)
      if (venc && vencimiento === null) errores.push(`«${venc}» no es una fecha válida`)
      if (subtipo?.vence && !venc) errores.push(`«${subtipo.nombre}» vence: la fecha de vencimiento es obligatoria`)
      if (emision && vencimiento && vencimiento <= emision) errores.push('El vencimiento es anterior a la emisión')
      if (!archivo) errores.push('Falta el nombre del archivo')
      else if (subtipo && !subtipo.formatos.includes(extension(archivo))) errores.push(`El archivo es .${extension(archivo)} y «${subtipo.nombre}» acepta ${subtipo.formatos.join(', ')}`)
      const file = archivo ? adjuntos.get(String(archivo).trim().toLowerCase()) : null
      if (file && subtipo && file.size / 1024 / 1024 > subtipo.tamanoMaxMB) errores.push(`El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es ${subtipo.tamanoMaxMB} MB`)
      if (archivo && !file) avisos.push('Sin el archivo adjunto: se registra sólo con el nombre')

      if (persona && subtipo) {
        const clave = `${persona.id}|${subtipo.id}`
        if (vistas.has(clave)) errores.push('Duplicado: la misma persona y el mismo subtipo ya aparecen más arriba en este lote')
        vistas.add(clave)
        const existe = documentos.find(d => d.colaboradorId === persona.id && d.subtipoId === subtipo.id && !d.eliminado)
        // El mismo archivo otra vez avisa y no bloquea, igual que al cargar uno por uno (RF-33).
        if (existe && versionActual(existe)?.archivo?.original === archivo) avisos.push('Ese mismo archivo ya está en el expediente: se cargará igual')
        else if (existe) avisos.push(`Ya tiene «${subtipo.nombre}»: se guardará como versión ${existe.versiones.length + 1}`)
      }
      return { n, celdas, persona, subtipo, emision, vencimiento, archivo, file, errores, avisos }
    })
  }, [texto, personas, subtipos, tipos, documentos, adjuntos])

  const buenas = filas.filter(f => !f.errores.length)
  const malas = filas.filter(f => f.errores.length)

  const plantilla = () => {
    const ej = personas.filter(p => p.status !== 'desvinculado').slice(0, 2)
    descargarTexto('plantilla_carga_documentos.csv', [
      COLUMNAS.join(';'),
      `${ej[0]?.codigo || '1007919'};IP-01;15/03/2022;15/03/2032;documento_identidad.pdf`,
      `${ej[1]?.codigo || '1015838'};Licencia o certificación;01/08/2026;01/08/2031;licencia.jpg`,
      '',
      '# subtipo: su código ERP (IP-01) o su nombre (Documento de identidad). Fechas en dd/mm/aaaa.',
      '# Códigos disponibles: ' + subtipos.filter(s => s.activo).map(s => `${s.codigoErp} ${s.nombre}`).join(' · '),
    ].join('\n'))
  }

  /* Un ejemplo con errores a propósito, para ver la validación sin preparar un archivo. */
  const ejemplo = () => {
    const act = personas.filter(p => p.status !== 'desvinculado')
    const [a, b, c, d] = act
    setResultado(null)
    setTexto([
      COLUMNAS.join(';'),
      `${a.codigo};PP-02;10/09/2026;10/09/2028;certificacion_${a.codigo}.pdf`,
      `${b.codigo};Licencia o certificación;01/09/2026;01/09/2031;licencia_${b.codigo}.jpg`,
      `${c.codigo};Título o diploma;20/12/2019;;titulo_${c.codigo}.pdf`,
      `9999999;IP-01;01/01/2020;01/01/2030;documento.pdf`,
      `${d.codigo};Licencia o certificación;01/09/2026;;licencia.jpg`,
      `${a.codigo};Título o diploma;31/02/2010;;diploma.docx`,
      `${b.codigo};Licencia o certificación;01/09/2026;01/09/2031;licencia_otra.jpg`,
    ].join('\n'))
  }

  const subir = f => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => { setTexto(String(r.result || '')); setResultado(null) }
    r.readAsText(f, 'utf-8')
  }

  const cargar = async () => {
    if (cargando) return
    setCargando(true)
    /* Primero se guardan los archivos adjuntos; después se registra el lote con sus claves. */
    const claves = new Map()
    for (const f of buenas) {
      if (!f.file) continue
      const clave = nuevaClaveArchivo()
      if (await guardarArchivo(clave, f.file)) claves.set(f.n, clave)
    }
    const aCargar = buenas.map(f => ({
      colaboradorId: f.persona.id,
      subtipoId: f.subtipo.id,
      motivo: f.avisos.length ? 'Carga por lote' : '',
      version: {
        archivo: {
          nombre: normalizarNombre(f.persona, f.subtipo, f.emision, extension(f.archivo)),
          original: f.archivo,
          formato: extension(f.archivo),
          tamanoKB: f.file ? Math.round(f.file.size / 1024) : 0,
          clave: claves.get(f.n) || null,
          tipoMime: f.file?.type,
        },
        emision: f.emision,
        vencimiento: f.vencimiento || null,
        info: 'Carga por lote',
      },
    }))
    const errores = malas.map(f => ({ fila: f.n, texto: f.celdas.join(' · '), motivos: f.errores }))
    const id = registrarLote(aCargar, errores)
    setResultado({ id, ok: aCargar.length, errores, conArchivo: claves.size })
    setTexto('')
    setAdjuntos(new Map())
    setCargando(false)
  }

  const reporteErrores = errs => descargarTexto('errores_del_lote.txt', errs.map(e => `Fila ${e.fila}: ${e.texto}\n  - ${e.motivos.join('\n  - ')}`).join('\n\n'))

  return (
    <div className="content-scroll">
      <Cabecera titulo="Carga por lote" sub="Cargue muchos documentos de una vez con una planilla. Se valida todo antes de guardar.">
        <button type="button" className="dc-btn" onClick={plantilla}><Download size={14} /> Descargar plantilla</button>
      </Cabecera>

      <ol className="xa-pasos">
        <li><b>1.</b> Descargue la plantilla y llénela: una fila por documento.</li>
        <li><b>2.</b> Súbala o pegue su contenido abajo, y adjunte los archivos que nombra (PDF o imagen).</li>
        <li><b>3.</b> Revise la validación y cargue las filas correctas.</li>
      </ol>

      {resultado && (
        <div className="dc-tarjeta xa-resultado" role="status">
          <CheckCircle2 size={20} aria-hidden="true" className="xa-verde" />
          <div>
            <p><b>{resultado.ok} {resultado.ok === 1 ? 'documento cargado' : 'documentos cargados'}.</b>{resultado.errores.length > 0 && ` ${resultado.errores.length} ${resultado.errores.length === 1 ? 'fila quedó' : 'filas quedaron'} sin cargar.`}</p>
            <p className="dc-muted">Ya se ven en cada expediente y cuentan para los requisitos.{resultado.conArchivo ? ` ${resultado.conArchivo} con su archivo adjunto.` : ''}</p>
          </div>
          {resultado.errores.length > 0 && <button type="button" className="dc-btn" onClick={() => reporteErrores(resultado.errores)}><Download size={14} /> Reporte de errores</button>}
        </div>
      )}

      <section className="dc-tarjeta">
        <header className="dc-tarjeta-cab">
          <h2>Contenido del lote</h2>
          <div className="xa-ficha-acc">
            <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={ejemplo}><Wand2 size={13} /> Probar con un ejemplo</button>
            <button type="button" className="dc-btn dc-btn-sm" onClick={() => entrada.current?.click()}><Upload size={13} /> Subir CSV</button>
            <input ref={entrada} type="file" accept=".csv,.txt,text/csv" hidden onChange={e => { subir(e.target.files[0]); e.target.value = '' }} />
            <button type="button" className="dc-btn dc-btn-sm" onClick={() => entradaArchivos.current?.click()}><Paperclip size={13} /> Adjuntar archivos{adjuntos.size ? ` (${adjuntos.size})` : ''}</button>
            <input ref={entradaArchivos} type="file" multiple accept="application/pdf,image/*,.doc,.docx" hidden onChange={e => { adjuntar(e.target.files); e.target.value = '' }} />
          </div>
        </header>
        <div className="dc-tarjeta-cuerpo">
          <textarea
            className="pl-input xa-csv"
            rows={7}
            value={texto}
            onChange={e => { setTexto(e.target.value); setResultado(null) }}
            placeholder={`${COLUMNAS.join(';')}\n1007919;IP-01;15/03/2022;15/03/2032;documento.pdf`}
            aria-label="Contenido del CSV"
            spellCheck={false}
          />
        </div>
      </section>

      {filas.length > 0 && (
        <section className="dc-tarjeta">
          <header className="dc-tarjeta-cab">
            <h2>Validación previa</h2>
            <div className="xa-lote-resumen">
              <span className="dc-chip dc-t-verde"><CheckCircle2 size={12} /> {buenas.length} correctas</span>
              {malas.length > 0 && <span className="dc-chip dc-t-rojo"><XCircle size={12} /> {malas.length} con errores</span>}
            </div>
          </header>
          <div className="xa-tabla-scroll">
            <table className="as-table xa-lote">
              <thead>
                <tr><th>Fila</th><th>Colaborador</th><th>Documento</th><th>Emisión</th><th>Vence</th><th>Archivo</th><th>Resultado</th></tr>
              </thead>
              <tbody>
                {filas.map(f => (
                  <tr key={f.n} className={f.errores.length ? 'xa-lote-mala' : ''}>
                    <td className="xa-mono">{f.n}</td>
                    <td>{f.persona ? f.persona.name : <span className="dc-muted">{f.celdas[0] || '—'}</span>}</td>
                    <td>{f.subtipo ? f.subtipo.nombre : <span className="dc-muted">{f.celdas[1] || '—'}</span>}</td>
                    <td className="xa-nowrap">{f.emision ? fechaCorta(f.emision) : <span className="dc-muted">{f.celdas[2] || '—'}</span>}</td>
                    <td className="xa-nowrap">{f.vencimiento ? fechaCorta(f.vencimiento) : <span className="dc-muted">{f.celdas[3] || '—'}</span>}</td>
                    <td className="xa-lote-arch">{f.archivo || '—'}{f.file && <small className="xa-lote-adj"><Paperclip size={11} aria-hidden="true" /> adjunto</small>}</td>
                    <td>
                      {f.errores.length ? (
                        <ul className="xa-lote-err">{f.errores.map(e => <li key={e}><XCircle size={12} aria-hidden="true" /> {e}</li>)}</ul>
                      ) : (
                        <span className="xa-lote-ok">
                          <CheckCircle2 size={13} aria-hidden="true" /> Lista
                          {f.avisos.map(a => <small key={a}><AlertTriangle size={11} aria-hidden="true" /> {a}</small>)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="xa-lote-pie">
            <span className="dc-muted">
              {malas.length ? `Las ${malas.length} filas con errores no se cargan; quedan en el reporte del lote.` : 'Todas las filas son correctas.'}
            </span>
            <button type="button" className="pl-btn-new" disabled={!buenas.length || cargando} onClick={cargar}>
              <Upload size={14} /> {cargando ? 'Guardando…' : `Subir ${buenas.length} ${buenas.length === 1 ? 'documento' : 'documentos'}`}
            </button>
          </div>
        </section>
      )}

      <section className="dc-tarjeta">
        <header className="dc-tarjeta-cab"><h2><History size={14} aria-hidden="true" /> Lotes anteriores</h2></header>
        {lotes.length === 0 ? (
          <Vacio Icono={FileSpreadsheet} titulo="Todavía no se cargó ningún lote" texto="Cada lote queda registrado con cuántas filas entraron y el detalle de las que no." />
        ) : (
          <ul className="xa-filas">
            {lotes.map(l => (
              <li key={l.id} className="xa-fila xa-lote-hist">
                <div className="xa-fila-doc">
                  <span className="xa-fila-nom">Lote del {fechaCorta(l.fecha)}</span>
                  <span className="xa-fila-arch">Por {l.por} · {l.ok} cargados · {l.errores.length} con errores</span>
                  {abierto === l.id && l.errores.length > 0 && (
                    <ul className="xa-lote-err xa-lote-err-hist">
                      {l.errores.map(e => <li key={e.fila}><b>Fila {e.fila}:</b> {e.motivos.join('; ')}</li>)}
                    </ul>
                  )}
                </div>
                <div className="xa-fila-acc">
                  {l.errores.length > 0 && (
                    <>
                      <button type="button" className="dc-btn dc-btn-sm dc-btn-texto" onClick={() => setAbierto(abierto === l.id ? null : l.id)} aria-expanded={abierto === l.id}>
                        {abierto === l.id ? 'Ocultar errores' : 'Ver errores'}
                      </button>
                      <button type="button" className="dc-btn dc-btn-sm" onClick={() => reporteErrores(l.errores)}><Download size={13} /> Reporte</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
