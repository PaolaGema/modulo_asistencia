/* ── EL RIEL DE LA IZQUIERDA: CUÁNTAS FILAS MIDE Y DÓNDE EMPIEZA ──────────
   Dos campos de la ficha no se colocan por orden de flujo sino a mano, en la columna 1: la
   fotografía y el documento escaneado. Son la FUENTE de los campos que tienen al lado —el papel
   abierto a un costado, lo que dice al otro— y por eso anclan su bloque en lugar de caer al
   final del flujo.

   ESTO VIVE APARTE DE LA TARJETA porque no es React: es aritmética de rejilla, y aparte se puede
   ejecutar sin navegador para comprobar que una tarjeta no perdió su ancla. Dentro del componente
   sólo se podía comprobar mirándola.

   CUÁNTAS FILAS OCUPA ESE ANCLA NO ES UNA CONSTANTE. Los campos de al lado van y vienen —la
   extensión y el complemento SEGIP sólo salen con carnet boliviano, y cada nivel del estudio
   recorta otros tantos—, así que un número fijo acierta con una combinación y deja un agujero con
   la siguiente.

   LO QUE SE BUSCA ES QUE NADA QUEDE DEBAJO DEL RIEL. Antes se buscaba el reparto con menos celdas
   vacías, que es parecido pero no lo mismo, y la diferencia se veía: en «Documento de identidad»
   el reparto más apretado dejaba «Fecha de vencimiento» sola en la columna 1, pegada debajo del
   recuadro de subir archivo, como si fuera parte de él. Un hueco al final de la última fila no lo
   ve nadie; un campo que aparece bajo el recuadro se lee como desorden.

   Y SE CUENTA DOS VECES, porque a 1240 px la rejilla cambia de anchos: lo que arriba ocupa un
   tercio, abajo ocupa media fila. Cada resultado viaja en su variable CSS y la media query elige
   cuál mira. */

/* EL ALTO DE CADA UNO Y SI SE DEJA ESTIRAR. `filas` es lo que medían sus reglas fijas —la foto es
   cuadrada y pequeña, el escaneo apaisado y grande—. `elastico` dice si el recuadro se adapta al
   alto que le den: el del papel sí (suelta su proporción y llena el riel, ver `.sa-doc-caja` en la
   hoja de estilos), el de la foto no, porque su marco mide 88 px y punto. De eso depende cuánto
   puede crecer: al elástico no le cuesta nada —lo que gana de alto lo llena el papel— y al rígido
   le cuesta aire debajo del recuadro, así que tiene tope. */
export const RIELES = {
  'c-retrato': { filas: 3, elastico: false },
  'c-escaneo': { filas: 2, elastico: true },
}
const ANCHO_RIEL = 4

/* Cuánto puede crecer un riel RÍGIDO por encima de su alto: dos filas. Más arriba deja de anclar
   y pasa a ser un recuadro con un metro de nada debajo. El elástico no lleva tope porque no hay
   nada que quede vacío: lo que gana de alto lo llena el papel. */
const CRECE_HASTA = 2

/* Los anchos son los de la hoja de estilos y tienen que seguir siéndolo: si allá se cambia cuánto
   ocupa `c-tercio`, acá se cambia también o la cuenta pasa a ser una ficción bien ordenada. */
export const ANCHOS = {
  ancho: { 'c-corto': 2, 'c-med': 3, 'c-tercio': 4, 'c-medio': 6, 'c-ancho': 8, 'c-ancho-md': 8, 'c-todo': 12 },
  medio: { 'c-corto': 6, 'c-med': 6, 'c-tercio': 6, 'c-medio': 12, 'c-ancho': 8, 'c-ancho-md': 12, 'c-todo': 12 },
}

const clasesDe = campo => (campo.col || 'c-med').split(' ').filter(Boolean)
export const esRiel = campo => clasesDe(campo).some(c => RIELES[c])
const rielDe = campo => clasesDe(campo).reduce((r, c) => RIELES[c] || r, null)

const anchoDe = (campo, tabla) => {
  for (const clase of clasesDe(campo)) if (tabla[clase]) return tabla[clase]
  return tabla['c-med']
}

/* CÓMO CAE EL REPARTO si el riel ocupa `filas`. Se colocan los campos como los coloca la rejilla
   —en orden, sin volver nunca a una fila anterior, saltando de fila cuando el que viene no cabe en
   lo que queda— y se devuelven las dos cosas que interesan: cuántas celdas quedaron sin llenar y
   cuántas filas hicieron falta. */
function reparto(campos, filas, tabla) {
  const libreEn = f => (f < filas ? 12 - ANCHO_RIEL : 12)
  let fila = 0
  let libre = libreEn(0)
  let vacias = 0

  for (const campo of campos) {
    const cols = anchoDe(campo, tabla)
    while (cols > libre) { vacias += libre; fila += 1; libre = libreEn(fila) }
    libre -= cols
  }
  vacias += libre

  // Filas del riel a las que no llegó ningún campo: recuadro a la izquierda y nada al lado.
  const usadas = campos.length ? fila + 1 : 0
  if (usadas < filas) vacias += (filas - usadas) * (12 - ANCHO_RIEL)
  return { vacias, usadas }
}

/* CUÁNTO MIDE UN RIEL. Primero se busca el alto que CUBRE a sus campos, que es lo que se quiere
   ver; si no lo hay dentro de lo que ese riel puede crecer, se cae al criterio viejo —el reparto
   con menos huecos— porque un riel corto con campos debajo sigue siendo mejor que uno estirado
   sobre un palmo de nada.

   `cubrir` en falso desactiva la búsqueda de cobertura y deja sólo el criterio de huecos. Se usa a
   1240 px, donde un campo de un tercio pasa a ocupar media fila y al lado del riel ya no entra más
   que uno: cubrirlos a todos allí significaría un recuadro de ocho filas, que es la tarjeta entera
   convertida en zona de subir archivos. */
export function filasDelRiel(campos, riel, tabla, { cubrir = true } = {}) {
  const otros = campos.filter(c => c !== riel)
  const { filas: natural, elastico } = rielDe(riel)

  /* CUBRIR ES COSA DEL ELÁSTICO. Estirar el papel escaneado no cuesta nada: lo que gana de alto
     lo llena él. Estirar la foto sí, porque su marco mide 88 px y lo que crece el riel es aire
     debajo del retrato, y por eso «Nombre legal y fotografía» —siete campos, impares, donde
     sobre un hueco se pruebe el alto que se pruebe— se queda con el criterio de siempre.

     EL TOPE SE MIDE CON EL RIEL PUESTO, no sin él. Calculado sobre la rejilla libre, un bloque de
     siete campos de un tercio da tres filas —tres por fila— y la búsqueda se detenía ahí; con el
     riel al lado entran dos por fila y hacen falta cuatro, que era justo la respuesta correcta y
     quedaba una más allá del tope. */
  if (cubrir && elastico) {
    const tope = Math.max(natural, reparto(otros, otros.length, tabla).usadas)
    for (let filas = natural; filas <= tope; filas += 1) {
      if (reparto(otros, filas, tabla).usadas <= filas) return filas
    }
  }

  let mejor = natural
  let menos = reparto(otros, natural, tabla).vacias
  for (let filas = natural + 1; filas <= natural + CRECE_HASTA; filas += 1) {
    const { vacias } = reparto(otros, filas, tabla)
    /* El elástico crece en cuanto mejora el encaje; el rígido sólo si con eso no queda NI UN
       hueco, porque cada fila de más es aire debajo de su recuadro. */
    const vale = elastico ? vacias < menos : vacias === 0 && menos > 0
    if (vale) { mejor = filas; menos = vacias }
    if (menos === 0) break
  }
  return mejor
}

/* ── UNA TARJETA SON VARIOS BLOQUES, Y CADA BLOQUE SU RIEL ────────────────
   Un rótulo parte la tarjeta por dentro: ocupa la fila entera y lo de abajo empieza de cero.
   «Documento de identidad» son dos bloques con la misma forma —el documento principal y el
   secundario—, cada uno con su papel escaneado, y el de abajo tiene el mismo derecho a anclar su
   mitad que el de arriba a anclar la suya. */
function tramosDe(campos) {
  const tramos = []
  let bloque = []
  for (const campo of campos) {
    if (campo.tipo === 'rotulo') {
      if (bloque.length) tramos.push(bloque)
      tramos.push(campo)
      bloque = []
    } else bloque.push(campo)
  }
  if (bloque.length) tramos.push(bloque)
  return tramos
}

const rielesDe = tramo => tramo.filter(esRiel)

/* UN ANCLA ANCLA CUANDO ESTÁ SOLA EN SU BLOQUE. La tarjeta «Archivos» del último paso junta los
   adjuntos de la ficha, y ahí la foto y el escaneo son dos de la lista y no la fuente de nada: las
   dos reglas los mandaban a la MISMA esquina y se dibujaban uno encima del otro. Con dos o más en
   el mismo bloque, ninguno es riel: vuelven al flujo como un campo cualquiera.

   LO QUE CAMBIÓ es que antes se contaban los rieles de la TARJETA y ahora los del BLOQUE. Con el
   documento secundario, «Documento de identidad» pasó a tener dos escaneos y la regla vieja los
   desanclaba a los dos: la tarjeta entera perdía su columna izquierda por haber ganado un bloque.
   Separados por un rótulo no se pisan, que era todo lo que la regla protegía. */
export function conRieles(campos) {
  const sueltos = new Set()
  for (const tramo of tramosDe(campos)) {
    if (!Array.isArray(tramo)) continue
    const rieles = rielesDe(tramo)
    if (rieles.length > 1) for (const riel of rieles) sueltos.add(riel)
  }
  if (!sueltos.size) return campos
  return campos.map(c => (sueltos.has(c)
    ? { ...c, col: clasesDe(c).filter(x => !RIELES[x]).join(' ') || 'c-med' }
    : c))
}

/* DÓNDE EMPIEZA CADA RIEL Y CUÁNTO MIDE. Devuelve un mapa campo → { inicio, filas } en líneas de
   rejilla, que es lo que espera `grid-row`. Se cuenta bloque a bloque llevando la fila corriente:
   un rótulo gasta una, y un bloque gasta lo que ocupen sus campos —o lo que mida su riel, si el
   riel es más alto que ellos—.

   LA CUENTA TIENE QUE COINCIDIR CON LA DEL NAVEGADOR o el riel aterriza en la fila equivocada y se
   dibuja encima de otra cosa. Coincide porque se reparte igual que la rejilla: en orden y sin
   volver atrás. Y cuando el riel cubre su bloque —el caso normal— la cuenta ni siquiera depende
   del reparto: el bloque mide exactamente lo que mide su riel. */
export function anclajes(campos, tabla, opciones) {
  const mapa = new Map()
  let fila = 1

  for (const tramo of tramosDe(campos)) {
    if (!Array.isArray(tramo)) { fila += 1; continue }

    const rieles = rielesDe(tramo)
    if (rieles.length !== 1) { fila += reparto(tramo, 0, tabla).usadas; continue }

    const riel = rieles[0]
    const filas = filasDelRiel(tramo, riel, tabla, opciones)
    mapa.set(riel, { inicio: fila, filas })
    fila += Math.max(filas, reparto(tramo.filter(c => c !== riel), filas, tabla).usadas)
  }
  return mapa
}

/* LAS DOS CUENTAS, LISTAS PARA PONER EN EL ELEMENTO. Viajan como variables CSS y no como un
   `grid-row` en línea: en pantallas angostas el riel deja de ser riel y se pone a lo ancho, y un
   estilo en línea le ganaría a esa regla. */
export function estilosDeRiel(campos) {
  const anchos = anclajes(campos, ANCHOS.ancho)
  const medios = anclajes(campos, ANCHOS.medio, { cubrir: false })
  return campo => {
    const a = anchos.get(campo)
    const m = medios.get(campo)
    if (!a && !m) return undefined
    return {
      ...(a && { '--riel-inicio': a.inicio, '--riel-filas': a.filas }),
      ...(m && { '--riel-inicio-md': m.inicio, '--riel-filas-md': m.filas }),
    }
  }
}
