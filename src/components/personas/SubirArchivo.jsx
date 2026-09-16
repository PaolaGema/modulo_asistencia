import { useRef, useState } from 'react'
import { FileText, Paperclip, Trash2, UploadCloud } from 'lucide-react'
import { borrarArchivo, guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'

/* UN ARCHIVO DENTRO DE UN FORMULARIO.
   La ficha de un colaborador pide nueve archivos —la foto y ocho papeles— y hasta ahora el
   único sitio que subía algo era el logo de la empresa, con su propio marcado metido en la
   pantalla. Nueve copias de eso son nueve sitios donde arreglar la misma cosa.

   EL BINARIO NO VA EN EL FORMULARIO. En la ficha queda la referencia —clave, nombre, peso,
   tipo— y el archivo entero se guarda en IndexedDB, que es donde ya viven los recursos que sube
   la gente. La ficha se serializa a `localStorage` con todo lo demás, y ahí un PDF en base64 se
   come la cuota de golpe: con cinco megas de tope, dos certificados escaneados dejan sin poder
   guardar el resto de los datos y la escritura falla EN SILENCIO.

   REEMPLAZAR BORRA EL ANTERIOR. Sin eso, cambiar tres veces el certificado médico deja dos
   archivos huérfanos en el navegador que ya nadie sabe nombrar. */

const pesoLegible = bytes => {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* Diez megas: un escaneo de carnet a color ronda el mega y una hoja de vida con fotos, tres. Lo
   que pase de ahí es casi siempre un PDF sin comprimir, y conviene que lo arreglen antes de
   subirlo y no que el navegador se atragante después. */
const TOPE = 10 * 1024 * 1024

export default function SubirArchivo({
  id,
  valor,
  onCambio,
  acepta = 'application/pdf,image/*',
  pista = 'PDF o imagen · arrastrar o hacer clic',
  vistaPrevia = false,
  /* UNA FOTO DE PERSONA NO ES UN ADJUNTO. Con la caja de adjunto, subir la foto de alguien
     devolvía «foto.jpg · 248 KB», que no dice si salió movida, si es la persona correcta ni si
     está derecha. Este modo dibuja un recuadro cuadrado con la imagen dentro, que es la misma
     forma que ya usa el logo en Datos de la empresa — y por el mismo motivo: lo que se sube es
     algo que hay que MIRAR para saber si está bien.

     TIENE DIBUJO PROPIO Y NO EL DEL PAPEL ESCANEADO, y eso se probó al revés. Llevar la foto al
     recuadro grande del documento —172 px de alto, con su pie de acciones— la hacía más
     aparatosa sin decir nada más: una cara se reconoce en 88 px, un carnet escaneado no. Acá lo
     compacto es la virtud; allá lo es el tamaño. Que dos cosas se suban igual no quiere decir
     que se vean igual.

     Es un modo y no un componente aparte porque todo lo de abajo —el tope de diez megas, el
     guardado en IndexedDB, el borrado del anterior al reemplazar— es idéntico. Lo único que
     cambia es el dibujo. */
  retrato = false,
  /* UN PAPEL SE MIRA IGUAL QUE UNA CARA, aunque por otro motivo. Los ocho archivos que no son la
     foto son escaneos —el carnet, el contrato, el certificado médico, la libreta militar— y la
     caja de adjunto los reducía a «documento.pdf · 1.2 MB». Eso dice que hay un archivo; no dice
     si escanearon el reverso, si salió torcido, si es el papel que se pedía o si subieron por
     error el de otra persona. Y todo eso se descubre después, cuando el papel ya viajó al
     Ministerio.

     ASÍ QUE TAMBIÉN VA EN UN RECUADRO, apaisado, grande y con el documento dentro. Es el modo
     por defecto de los ocho papeles; la foto tiene el suyo, más chico, porque una cara se
     reconoce en 88 px y un carnet escaneado no.

     Y EL PDF SE PREVISUALIZA DE VERDAD, no con un icono: los navegadores traen lector propio, así
     que un `<object>` apuntando a la copia local enseña la primera página sin cargar una librería
     de dos megas. Donde no lo traiga, cae al icono con el nombre, que es lo que había antes. */
  documento = false,
  ariaLabel,
}) {
  const entrada = useRef(null)
  const [encima, setEncima] = useState(false)
  const [error, setError] = useState(null)
  const url = useArchivoLocal(valor?.clave)

  async function recibir(file) {
    if (!file) return
    if (file.size > TOPE) { setError('El archivo pesa más de 10 MB.'); return }
    setError(null)
    const clave = nuevaClaveArchivo()
    const guardado = await guardarArchivo(clave, file)
    if (valor?.clave) borrarArchivo(valor.clave)
    /* Sin IndexedDB el archivo no se puede reproducir, pero la ficha igual registra que existe:
       se pierde la vista previa, no el dato de que la persona entregó el papel. */
    onCambio({ clave: guardado ? clave : null, nombre: file.name, peso: file.size, tipo: file.type })
  }

  function quitar() {
    if (valor?.clave) borrarArchivo(valor.clave)
    setError(null)
    onCambio('')
  }

  const esImagen = (valor?.tipo || '').startsWith('image/')
  const esPdf = (valor?.tipo || '') === 'application/pdf'
  const abrir = () => entrada.current?.click()

  /* El <input> es el mismo para los dos modos y por eso se arma una sola vez: son diez líneas
     que no tienen nada que ver con cómo se ve la caja. */
  const campoOculto = (
    <input
      ref={entrada}
      type="file"
      accept={acepta}
      hidden
      onChange={e => { recibir(e.target.files?.[0]); e.target.value = '' }}
    />
  )

  if (retrato) {
    return (
      <div>
        <div
          onDragOver={e => { e.preventDefault(); setEncima(true) }}
          onDragLeave={() => setEncima(false)}
          onDrop={e => { e.preventDefault(); setEncima(false); recibir(e.dataTransfer.files?.[0]) }}
          className={`sa-retrato${encima ? ' encima' : ''}`}
        >
          {/* EL RECUADRO ES CUADRADO AUNQUE LA FOTO NO LO SEA, para que la fila no cambie de
              alto según lo que suban. Y va con `cover` y no `contain`: de un retrato lo que
              interesa es la cara, y recortar los bordes de una foto vertical es lo que hace
              cualquier carnet. Con el logo es al revés y por eso allá es `contain`. */}
          <div className={`sa-marco${valor?.nombre ? ' con-foto' : ''}`}>
            {url && esImagen
              ? <img src={url} alt="" />
              : (
                <button type="button" id={id} onClick={abrir} aria-label={ariaLabel}>
                  <UploadCloud size={19} />
                </button>
              )}
          </div>

          <div className="sa-retrato-txt">
            <span className="sa-retrato-nom">
              {valor?.nombre || 'Sin fotografía'}
            </span>
            <span className="sa-retrato-pis">
              {valor?.nombre
                ? pesoLegible(valor.peso) + (valor.clave ? '' : ' · no se pudo guardar la copia local')
                : 'Se ve en el directorio'}
            </span>
          </div>

          <div className="sa-retrato-acc">
            <button type="button" className="sa-accion" onClick={abrir}>
              {valor?.nombre ? 'Cambiar' : 'Subir foto'}
            </button>
            {valor?.nombre && (
              <button
                type="button"
                className="sa-quitar"
                onClick={quitar}
                aria-label={`Quitar ${valor.nombre}`}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {campoOculto}
        {error && <p className="sa-error">{error}</p>}
      </div>
    )
  }

  if (documento) {
    return (
      /* La caja tiene nombre porque el riel la estira: puesto en columna, el recuadro del papel
         se reparte el alto que le deja la fila en vez de imponerlo. Ver `.sa-doc-caja`. */
      <div className="sa-doc-caja">
        <div
          onDragOver={e => { e.preventDefault(); setEncima(true) }}
          onDragLeave={() => setEncima(false)}
          onDrop={e => { e.preventDefault(); setEncima(false); recibir(e.dataTransfer.files?.[0]) }}
          className={`sa-doc${encima ? ' encima' : ''}`}
        >
          <div className={`sa-hoja${valor?.nombre ? ' con-archivo' : ''}`}>
            {valor?.nombre && url ? (
              esImagen ? (
                <img src={url} alt={`Vista previa de ${valor.nombre}`} />
              ) : esPdf ? (
                /* `#toolbar=0&navpanes=0` le pide al lector del navegador que se calle: acá esto
                   es una miniatura, no un visor. Y va sin eventos de puntero para que arrastrar
                   otro archivo encima siga cayendo en la zona de arrastre y no dentro del PDF,
                   que se lo quedaba.

                   Lo de adentro es el respaldo: se dibuja sólo si el navegador no sabe abrir el
                   PDF, que es como funciona `<object>` desde siempre. */
                <object
                  data={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  type="application/pdf"
                  aria-label={`Vista previa de ${valor.nombre}`}
                >
                  <span className="sa-hoja-sin"><FileText size={22} />{valor.nombre}</span>
                </object>
              ) : (
                <span className="sa-hoja-sin"><FileText size={22} />{valor.nombre}</span>
              )
            ) : (
              /* EL RECUADRO ENTERO ES EL BOTÓN mientras está vacío, igual que en la caja
                 angosta: es el gesto que se repite ocho veces en esta ficha. */
              <button
                type="button"
                id={id}
                className="sa-hoja-vacia"
                onClick={abrir}
                aria-label={ariaLabel}
              >
                <UploadCloud size={22} />
                <span className="sa-hoja-tit">
                  {valor?.nombre ? valor.nombre : 'Subir archivo'}
                </span>
                <span className="sa-hoja-pis">
                  {valor?.nombre ? 'No se pudo abrir la copia local' : pista}
                </span>
              </button>
            )}
          </div>

          {/* EL PIE SÓLO CON ARCHIVO. Vacío, el recuadro ya dice qué hacer y con letras grandes;
              repetirlo debajo en un botón chico es ofrecer dos veces lo mismo. */}
          {valor?.nombre && (
            <div className="sa-doc-pie">
              <div className="sa-datos">
                <span className="sa-nombre" title={valor.nombre}>{valor.nombre}</span>
                <span className="sa-peso">
                  {pesoLegible(valor.peso)}
                  {!valor.clave && ' · no se pudo guardar la copia local'}
                </span>
              </div>
              {/* A ESTE TAMAÑO NO SE LEE UN CARNET, y tampoco hace falta: la miniatura contesta
                  «¿es el papel correcto y está derecho?» y «Ver» contesta el resto. Abre la copia
                  local en otra pestaña, así que sólo aparece si esa copia existe. */}
              {/* A ESTE TAMAÑO NO SE LEE UN CARNET, y tampoco hace falta: la miniatura contesta
                  «¿es el papel correcto y está derecho?» y «Ver» contesta el resto. Abre la copia
                  local en otra pestaña, así que sólo aparece si esa copia existe. */}
              {url && (
                <a className="sa-accion" href={url} target="_blank" rel="noreferrer">Ver</a>
              )}
              <button type="button" className="sa-accion" onClick={abrir}>Cambiar</button>
              <button
                type="button"
                className="sa-quitar"
                onClick={quitar}
                aria-label={`Quitar ${valor.nombre}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {campoOculto}
        {error && <p className="sa-error">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setEncima(true) }}
        onDragLeave={() => setEncima(false)}
        onDrop={e => { e.preventDefault(); setEncima(false); recibir(e.dataTransfer.files?.[0]) }}
        className={`sa-caja${encima ? ' encima' : ''}${valor?.nombre ? ' con-archivo' : ''}`}
      >
        {valor?.nombre ? (
          <>
            {/* LA MINIATURA SOLO CUANDO ES UNA FOTO Y SE PIDIÓ VERLA. Para un PDF no hay nada
                que enseñar, y un rectángulo gris con un icono dentro ocupa el mismo sitio que el
                nombre del archivo sin decir ni la mitad. */}
            {vistaPrevia && esImagen && url ? (
              <img src={url} alt="" className="sa-miniatura" />
            ) : (
              <span className="sa-icono"><FileText size={16} /></span>
            )}
            <div className="sa-datos">
              <span className="sa-nombre" title={valor.nombre}>{valor.nombre}</span>
              <span className="sa-peso">
                {pesoLegible(valor.peso)}
                {!valor.clave && ' · no se pudo guardar la copia local'}
              </span>
            </div>
            <button type="button" className="sa-accion" onClick={abrir}>Cambiar</button>
            <button
              type="button"
              className="sa-quitar"
              onClick={quitar}
              aria-label={`Quitar ${valor.nombre}`}
            >
              <Trash2 size={13} />
            </button>
          </>
        ) : (
          /* LA CAJA ENTERA ES EL BOTÓN, no un enlace escondido en una esquina: es el gesto que
             se hace nueve veces en esta ficha y apuntar nueve veces a un blanco chico cansa. */
          <button type="button" id={id} className="sa-vacia" onClick={abrir} aria-label={ariaLabel}>
            <span className="sa-icono"><UploadCloud size={16} /></span>
            <span className="sa-datos">
              <span className="sa-nombre">Subir archivo</span>
              <span className="sa-peso">{pista}</span>
            </span>
            <Paperclip size={13} className="sa-clip" />
          </button>
        )}
      </div>

      {campoOculto}

      {error && <p className="sa-error">{error}</p>}
    </div>
  )
}

/* EL MISMO ARCHIVO, LEYENDO LA FICHA. Sin zona de arrastre ni botones: acá el archivo no se
   cambia, se mira —y si es una imagen, se mira de verdad—. */
export function ArchivoLeido({ valor, vistaPrevia = false }) {
  const url = useArchivoLocal(valor?.clave)
  if (!valor?.nombre) return null
  const esImagen = (valor.tipo || '').startsWith('image/')

  return (
    <div className="sa-leido">
      {vistaPrevia && esImagen && url
        ? <img src={url} alt="" className="sa-miniatura" />
        : <span className="sa-icono"><FileText size={15} /></span>}
      <div className="sa-datos">
        {/* Con copia local el nombre es un enlace que abre el archivo; sin ella es texto, porque
            un enlace que no lleva a ninguna parte se prueba una vez y no se vuelve a creer. */}
        {url
          ? <a className="sa-nombre sa-enlace" href={url} target="_blank" rel="noreferrer">{valor.nombre}</a>
          : <span className="sa-nombre">{valor.nombre}</span>}
        <span className="sa-peso">{pesoLegible(valor.peso)}</span>
      </div>
    </div>
  )
}
