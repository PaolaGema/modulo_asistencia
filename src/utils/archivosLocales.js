/* Guarda de verdad los archivos que sube la persona, dentro del navegador.

   Por qué IndexedDB y no localStorage: localStorage solo admite texto y tiene unos pocos MB,
   así que ahí caben los datos del recurso (nombre, peso, tipo) pero nunca el archivo. IndexedDB
   sí guarda el binario tal cual, y sobrevive al refresh — que es la diferencia entre una demo
   que se puede mostrar y una que se rompe cuando alguien recarga la página.

   Esto NO reemplaza al backend: es el prototipo sosteniendo su propia promesa hasta que exista
   el almacenamiento real. Cuando el archivo viva en un servidor, el recurso va a traer su URL y
   estas funciones dejan de usarse. */

const DB = 'souly_archivos'
const STORE = 'archivos'

function abrir() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/* La clave se genera al subir y viaja con el recurso, en vez de reusar el id del documento:
   esos contadores viven en memoria y se reinician al recargar, así que dos archivos distintos
   pueden terminar con el mismo id y uno taparía al otro. */
export function nuevaClaveArchivo() {
  return `a_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function guardarArchivo(clave, file) {
  try {
    const db = await abrir()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(file, clave)
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    return true
  } catch {
    // Sin cuota o sin IndexedDB, el recurso igual queda listado: se pierde la reproducción,
    // no la subida.
    return false
  }
}

export async function leerArchivo(clave) {
  try {
    const db = await abrir()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(clave)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function borrarArchivo(clave) {
  try {
    const db = await abrir()
    await new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(clave)
      tx.oncomplete = resolve
      tx.onerror = resolve
    })
  } catch { /* nada que borrar */ }
}

/* ── COPIAR UN ARCHIVO A UNA CLAVE NUEVA ──────────────────────────────────
   Un reingreso trae los documentos digitales de la ficha anterior, y traerlos NO puede ser
   copiar la referencia: dos fichas apuntando al mismo archivo comparten destino, y reemplazar la
   foto en la nueva borraría la de la vieja —`SubirArchivo` borra el anterior al reemplazar, que
   es lo correcto cuando el archivo es tuyo y una bomba cuando es de dos—.

   Así que se duplica el contenido bajo una clave propia. Cuesta el doble de espacio y compra que
   cada ficha sea dueña de lo suyo, que es lo que hace que borrar sea una operación segura.

   Si el original ya no está —lo borró alguien, o nunca llegó a IndexedDB porque no había cuota—
   devuelve nada y quien llama decide: acá, no traer ese archivo y dejar el campo vacío, que es
   honesto. Peor sería dejar una referencia que apunta a un hueco. */
export async function copiarArchivo(claveOrigen) {
  const file = await leerArchivo(claveOrigen)
  if (!file) return null
  const clave = nuevaClaveArchivo()
  const ok = await guardarArchivo(clave, file)
  return ok ? clave : null
}
