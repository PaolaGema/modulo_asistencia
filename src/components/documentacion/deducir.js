/* ── QUÉ DOCUMENTO ES, POR EL NOMBRE DEL ARCHIVO ──────────────────────────
   Palabras del nombre de un archivo que dicen qué documento es. Se comparan sin tildes ni
   mayúsculas, palabra por palabra: «CI_Ana.pdf» y «carnet-frente.jpg» son el documento de
   identidad; «croquis casa.pdf», el croquis. Lo usan la carga con formulario y la carga directa
   desde una carpeta, para que las dos deduzcan lo mismo. */
export const sinTildes = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const PISTAS = {
  's-ci': ['ci', 'carnet', 'cedula', 'identidad', 'dni', 'documento'],
  's-ci2': ['secundario', 'pasaporte'],
  's-nacimiento': ['nacimiento', 'partida'],
  's-croquis': ['croquis', 'domicilio', 'mapa'],
  's-licencia': ['licencia', 'brevet', 'conducir'],
  's-garante': ['garante'],
  's-garantia': ['garantia'],
  's-foto': ['foto', 'fotografia'],
  's-titulo': ['titulo', 'diploma', 'bachiller', 'licenciatura'],
  's-certprof': ['certificacion', 'curso', 'certificado'],
  's-acta-equipo': ['equipo', 'laptop', 'computadora', 'celular'],
  's-acta-uniforme': ['uniforme'],
  's-acta-epp': ['epp', 'proteccion'],
  's-agregado': ['memorandum', 'constancia', 'designacion'],
}

/* El primero de los `candidatos` (subtipos, en su orden) que el nombre nombra; '' si ninguno. */
export function deducirSubtipo(nombre, candidatos) {
  const palabras = new Set(sinTildes(String(nombre || '').replace(/\.[^.]+$/, '')).split(/[^a-z0-9]+/).filter(Boolean))
  return candidatos.find(s => (PISTAS[s.id] || []).some(k => palabras.has(k)))?.id || ''
}

export const extensionDe = nombre => {
  const e = String(nombre || '').split('.').pop().toLowerCase()
  return e === 'jpeg' ? 'jpg' : e
}
