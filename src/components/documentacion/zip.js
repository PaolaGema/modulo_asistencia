/* ── ZIP SIN DEPENDENCIAS ─────────────────────────────────────────────────
   Dos usos en el módulo: bajar el expediente de una o varias personas en un solo archivo, y leer
   el texto de una plantilla .docx (que es un ZIP con un XML adentro).

   SE ESCRIBE SIN COMPRIMIR («store»). Los archivos de un expediente ya vienen comprimidos —PDF,
   JPG— y comprimirlos otra vez no ahorra nada; a cambio, el ZIP sale con quince líneas y sin
   librería. Para LEER sí hace falta descomprimir: eso lo hace el navegador con
   `DecompressionStream`, que ya trae. */

const TABLA_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

const aBytes = async d => (typeof d === 'string' ? new TextEncoder().encode(d) : d instanceof Blob ? new Uint8Array(await d.arrayBuffer()) : d)

/* `entradas`: [{ nombre: 'carpeta/archivo.pdf', datos: string | Blob | Uint8Array }]. Los nombres
   van en UTF-8 (bit 11), para que «Información personal/Croquis del domicilio.pdf» se lea igual en Windows. */
export async function crearZip(entradas) {
  const partes = []
  const centrales = []
  let desplazamiento = 0
  const ahora = new Date()
  const hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1)
  const fecha = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate()

  for (const e of entradas) {
    const nombre = new TextEncoder().encode(e.nombre)
    const datos = await aBytes(e.datos)
    const crc = crc32(datos)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true)
    local.setUint16(8, 0, true)
    local.setUint16(10, hora, true)
    local.setUint16(12, fecha, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, datos.length, true)
    local.setUint32(22, datos.length, true)
    local.setUint16(26, nombre.length, true)
    local.setUint16(28, 0, true)
    partes.push(new Uint8Array(local.buffer), nombre, datos)

    const central = new DataView(new ArrayBuffer(46))
    central.setUint32(0, 0x02014b50, true)
    central.setUint16(4, 20, true)
    central.setUint16(6, 20, true)
    central.setUint16(8, 0x0800, true)
    central.setUint16(10, 0, true)
    central.setUint16(12, hora, true)
    central.setUint16(14, fecha, true)
    central.setUint32(16, crc, true)
    central.setUint32(20, datos.length, true)
    central.setUint32(24, datos.length, true)
    central.setUint16(28, nombre.length, true)
    central.setUint32(42, desplazamiento, true)
    centrales.push(new Uint8Array(central.buffer), nombre)
    desplazamiento += 30 + nombre.length + datos.length
  }

  const tamCentral = centrales.reduce((a, b) => a + b.length, 0)
  const fin = new DataView(new ArrayBuffer(22))
  fin.setUint32(0, 0x06054b50, true)
  fin.setUint16(8, entradas.length, true)
  fin.setUint16(10, entradas.length, true)
  fin.setUint32(12, tamCentral, true)
  fin.setUint32(16, desplazamiento, true)
  return new Blob([...partes, ...centrales, new Uint8Array(fin.buffer)], { type: 'application/zip' })
}

export function descargarBlob(nombre, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nombre; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

/* Lo que no puede ir en un nombre de archivo en Windows, fuera. */
export const nombreSeguro = s => String(s || '').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim()

/* ── LEER EL TEXTO DE UN .DOCX ────────────────────────────────────────────
   Se busca `word/document.xml` en el directorio central y se descomprime. Cada párrafo de Word
   es una línea; el formato se pierde, que es lo que se quiere: la plantilla del módulo es texto
   con variables, y el diseño lo pone la hoja al emitir.

   WORD PARTE LAS VARIABLES EN PEDAZOS: `{{colaborador.nombre}}` puede llegar en tres «runs» con
   etiquetas en el medio. Como acá se quitan todas las etiquetas y se une el texto, la variable
   vuelve a quedar entera. */
export async function textoDeDocx(archivo) {
  const buf = new Uint8Array(await archivo.arrayBuffer())
  const dv = new DataView(buf.buffer)
  let fin = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break }
  }
  if (fin < 0) throw new Error('El archivo no es un .docx válido.')
  const total = dv.getUint16(fin + 10, true)
  let p = dv.getUint32(fin + 16, true)
  for (let n = 0; n < total; n++) {
    const metodo = dv.getUint16(p + 10, true)
    const tamComp = dv.getUint32(p + 20, true)
    const largoNom = dv.getUint16(p + 28, true)
    const largoExtra = dv.getUint16(p + 30, true)
    const largoCom = dv.getUint16(p + 32, true)
    const local = dv.getUint32(p + 42, true)
    const nombre = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + largoNom))
    if (nombre === 'word/document.xml') {
      const inicio = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true)
      const crudo = buf.subarray(inicio, inicio + tamComp)
      let bytes = crudo
      if (metodo === 8) {
        const flujo = new Blob([crudo]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
        bytes = new Uint8Array(await new Response(flujo).arrayBuffer())
      }
      return xmlATexto(new TextDecoder().decode(bytes))
    }
    p += 46 + largoNom + largoExtra + largoCom
  }
  throw new Error('No se encontró el texto del documento dentro del .docx.')
}

function xmlATexto(xml) {
  return xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/* ── ESCRIBIR UN .DOCX (16 oct 2026) ──────────────────────────────────────
   Para «Descargar plantilla»: un Word mínimo —un párrafo por línea— que se abre y se edita como
   cualquiera. Los marcadores `[NOMBRE COMPLETO]` van resaltados en amarillo y en negrita para que
   se vean al editar. Sin comprimir, como el resto de los ZIP del módulo: Word lo abre igual. */
const xmlSeguro = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const RUN = (t, marca) => `<w:r>${marca ? '<w:rPr><w:b/><w:highlight w:val="yellow"/></w:rPr>' : ''}<w:t xml:space="preserve">${xmlSeguro(t)}</w:t></w:r>`
const parrafo = linea => `<w:p>${linea.split(/(\[[^\]\n]{2,60}\])/g).filter(Boolean).map(p => RUN(p, /^\[.*\]$/.test(p))).join('')}</w:p>`

export function crearDocx(texto) {
  const cuerpo = String(texto || '').split('\n').map(parrafo).join('')
  return crearZip([
    { nombre: '[Content_Types].xml', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
    { nombre: '_rels/.rels', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { nombre: 'word/document.xml', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${cuerpo}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>` },
  ]).then(zip => new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }))
}

/* Las variables `{{…}}` que trae un texto, sin repetir y en el orden en que aparecen. */
export const variablesDe = texto => [...new Set([...String(texto || '').matchAll(/\{\{\s*#?(?:si\s+)?([a-z0-9_.]+)\s*\}\}/gi)].map(m => m[1]))]
