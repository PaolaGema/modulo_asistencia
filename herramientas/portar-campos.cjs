/* Porta los 249 campos del estudio de la propuesta v1.2 al formato de descriptores que usan
   nuestras fichas (`TarjetaCampos`). Lee los archivos del prototipo tal cual y escribe
   src/data/camposPropuesta.js. No se edita el resultado a mano: se vuelve a correr. */

const fs = require('fs')
const path = require('path')

const ORIGEN = 'C:/Users/USUARIO/Downloads/prototipo-alta-replica/prototipo-alta-replica'
const DESTINO = 'C:/Users/USUARIO/Desktop/ficha_colaborador/src/data/camposPropuesta.js'

global.window = {}
require(path.join(ORIGEN, 'js/esquema.js'))
require(path.join(ORIGEN, 'js/catalogos.js'))
require(path.join(ORIGEN, 'js/mapa.js'))

const { ESQUEMA, CATALOGOS, CATALOGO_DE, CAT_ESTRUCTURA, MAPA_BLOQUES } = global.window

const porId = new Map(ESQUEMA.map(c => [c.id, c]))

/* ── Qué opciones tiene un desplegable ──────────────────────────────────────
   Tres orígenes, en este orden: el catálogo oficial por id, la lista que depende de la
   estructura de la empresa, y nada —entonces el campo baja a texto libre, porque un
   desplegable vacío es un campo que no se puede contestar—. */
/* ── CATÁLOGOS QUE EL ESTUDIO NO ENGANCHÓ ──────────────────────────────────
   Un campo declarado `select` al que no le corresponde ningún catálogo baja a texto libre
   —ver abajo—, y eso es lo correcto mientras de verdad no se sepa qué opciones lleva. Pero hay
   casos donde la lista SÍ existe en el estudio, sólo que colgada de otro campo. Acá se
   enganchan, con el nombre del catálogo que ya está escrito y revisado. */
/* ── LISTAS QUE ESCRIBIMOS NOSOTROS ───────────────────────────────────────
   Distinto de `CATALOGOS_CAMPO`, que engancha listas que el estudio ya trae: acá se reemplaza
   una. Es lo más invasivo que hace este archivo, así que se hace poco y con el motivo escrito. */
const LISTAS = {
  /* «CI» NO ES UN TIPO DE DOCUMENTO, ES CÓMO SE LE DICE ACÁ. La lista del estudio eran dos
     siglas en mayúsculas —CI y PASAPORTE— y la primera sólo la entiende quien creció con ella.
     Chile y Uruguay dicen cédula, Argentina y España dicen DNI, Perú dice DNI también, y el
     resto del mundo dice ID card. Un analista dando de alta a un brasileño mira «CI» y no sabe
     si su RG entra ahí.

     SE ABRE A LAS CUATRO QUE EL PROPIO ESTUDIO PEDÍA. La nota del campo dice, textual:
     «Catálogo reducido: CI · Pasaporte · Carnet de extranjero · Otro». Estaban escritas y no
     portadas — la lista que llegó tenía dos. Sin «Carnet de extranjero» no había forma de
     registrar a un residente extranjero, que es media razón de que este campo exista.

     «CARNET DE EXTRANJERO» VA APARTE Y NO ES UN DETALLE: lo emite Migración en Bolivia, así que
     es un documento boliviano, pero NO lo emite el SEGIP y por lo tanto no lleva extensión
     departamental. Metido dentro de «documento de identidad» arrastraría los campos de
     extensión y complemento a quien no los tiene.

     OJO CON LO QUE SE GUARDA. Estas cadenas son el valor que queda en la ficha, y el catálogo
     del estudio estaba marcado oficial —F20, campo 2—, es decir que «CI» y «PASAPORTE» son los
     códigos que espera la OVT. Lo que se declara y lo que se lee en pantalla dejan de ser la
     misma cadena: la traducción de estas cuatro a los códigos del F20 es una tabla de cuatro
     filas, y va en el exportador el día que se construya, no en el formulario. Es donde tiene
     que estar de todos modos — un formulario que guarda códigos de una entidad es un formulario
     que hay que rehacer cuando esa entidad cambia de códigos. */
  '1.10': [
    'Documento nacional de identidad',
    'Pasaporte',
    'Carnet de extranjero',
    'Otro',
  ],
}

const CATALOGOS_CAMPO = {
  /* LOS CUATRO «PAÍS» ERAN TEXTO LIBRE, y un país escrito a mano son cinco filas distintas
     para el mismo sitio: «Perú», «Peru», «PERU», «peru», «República del Perú». Después nadie
     puede contar cuántos extranjeros hay en la nómina, que es justo lo que el Ministerio
     pregunta.

     NO SE INVENTA UNA LISTA NUEVA: es la de `nacionalidad`, que el estudio ya trae revisada
     —Bolivia primero, los cinco vecinos, los destinos habituales y «Otro»—. Son la misma
     pregunta hecha de dos maneras, y dos listas de países que empiezan igual y terminan
     distinto es exactamente el problema que esto viene a resolver.

     «Otro» al final la mantiene contestable sin volverla un padrón de 195 entradas que hay que
     mantener. El día que aparezca alguien de un país que no está, se agrega al catálogo y
     aparece en los cuatro campos a la vez. */
  '1.14': 'nacionalidad',   // País emisor del documento principal
  '1.23': 'nacionalidad',   // País de nacimiento
  '1.42': 'nacionalidad',   // País de residencia
  '1.75': 'nacionalidad',   // País emisor del documento secundario
}

function opcionesDe(id) {
  if (LISTAS[id]) return LISTAS[id]
  const propio = CATALOGOS_CAMPO[id]
  if (propio && CATALOGOS[propio]) return CATALOGOS[propio].opciones
  const nombre = CATALOGO_DE[id]
  if (nombre && CATALOGOS[nombre]) return CATALOGOS[nombre].opciones
  if (CAT_ESTRUCTURA[id]) return CAT_ESTRUCTURA[id]
  return null
}

const fuenteDe = id => {
  const n = CATALOGO_DE[id]
  return n && CATALOGOS[n]?.oficial ? CATALOGOS[n].fuente : null
}

/* ── Ancho en la rejilla de doce ────────────────────────────────────────────
   Por tipo, que es lo que predice cuánto ocupa lo que se escribe: una fecha y un número son
   cortos, un sí/no necesita sus dos botones, un rótulo parte la fila. */
function anchoDe(c) {
  if (c.tipo === 'grupo' || c.tipo === 'repetible') return 'c-todo'
  if (c.tipo === 'archivo') return 'c-tercio'
  if (c.tipo === 'bool' || c.tipo === 'bool_texto') return 'c-medio'

  /* MANDA EL RÓTULO, NO EL CAMPO. Las etiquetas del estudio son frases enteras —«Fecha de
     ingreso (legal / fiscal)», «Administradora / Estado de la afiliación»— y el ancho lo decide
     la más larga de las dos cosas que hay en la celda. Midiendo solo por tipo, una fecha se
     llevaba dos columnas y su rótulo se partía en tres renglones: el campo de al lado quedaba
     dos líneas más arriba y la fila se veía torcida.

     Una fecha o un número con rótulo largo suben a un tercio y no a la mitad: lo que se escribe
     sigue siendo corto y media fila de caja vacía al lado de un calendario se ve desproporcionada. */
  const largo = (c.label || '').length
  if (c.tipo === 'fecha' || c.tipo === 'numero') return largo > 22 ? 'c-tercio' : 'c-corto'
  if (largo > 36) return 'c-medio'
  return 'c-tercio'
}

const HTML = { email: 'email', tel: 'tel', fecha: 'date' }

/* ── Un campo del esquema, traducido ────────────────────────────────────── */
/* EL EMOJI DEL ESTUDIO NO ES PARTE DEL NOMBRE DEL CAMPO. «🆕» y «✏️» delante de una etiqueta
   marcan qué agregó o retocó la v1.2, y eso ya lo dice la insignia del rótulo; repetido, queda
   un cuadro de color pegado a la palabra que se lee como un error de fuente.

   Se quitan de cualquier parte del rótulo y no solo del principio: varios los llevan al final
   —«Fecha de ingreso para vacaciones 🟢»— y ahí se leen como un adorno pegado a la palabra. En
   las NOTAS se quedan, que es donde el estudio los explica. */
const limpiar = t => (t || '').replace(/[🆕✏️⚫🟢⚠️]/gu, '').replace(/\s+/g, ' ').trim()

function traducir(c, extra = {}) {
  const d = { key: c.id, label: limpiar(ROTULOS[c.id] || extra.l || c.label) }

  if (c.tipo === 'grupo' || c.tipo === 'repetible') {
    d.tipo = 'rotulo'
    d.col = 'c-todo'
    if (c.nota) d.nota = c.nota
    return d
  }

  if (c.tipo === 'derivado' || c.derivado) {
    /* UN DERIVADO NO SE ESCRIBE. Cuál es su fórmula lo sabe la propuesta, no esta pantalla: acá
       queda declarado como calculado y la regla que lo llena se engancha aparte. */
    d.deducido = ''
    d.insignia = 'se calcula'
  } else if (c.tipo === 'bool' || c.tipo === 'bool_texto') {
    d.tipo = 'siNo'
  } else if (c.tipo === 'archivo') {
    d.tipo = 'archivo'
    d.acepta = 'application/pdf,image/*'
    /* LA PISTA SE LEE DENTRO DEL RECUADRO VACÍO, que es el único sitio de la ficha donde hay
       espacio de sobra para una frase. Por eso algunos archivos la usan para decir cómo tiene que
       venir el papel, en vez de repetir los formatos que ya se ven en el selector del sistema. */
    d.pista = PISTAS_ARCHIVO[c.id] || 'PDF o imagen · arrastrar o hacer clic'
  } else if (c.tipo === 'select' || c.tipo === 'buscador') {
    const ops = opcionesDe(c.id)
    if (ops) { d.tipo = 'lista'; d.opciones = ops }
    /* Sin catálogo se queda como texto: es honesto —todavía no sabemos qué opciones lleva— y se
       puede contestar igual. Un desplegable sin opciones no. */
  } else if (HTML[c.tipo]) {
    d.html = HTML[c.tipo]
  } else if (c.tipo === 'numero') {
    d.html = 'text'
  }

  /* La nuestra manda sobre el reparto por tipo: aquél mide el campo solo y ésta sabe con quién
     va en la fila. */
  d.col = COLUMNAS[c.id] || extra.col || anchoDe(c)

  /* LO QUE MANDA LA LEY SE MARCA. `legal` en el estudio quiere decir que alguna entidad —el
     Ministerio, la Caja, la Gestora— lo exige; no es una preferencia nuestra. */
  if (c.legal && !d.insignia) d.insignia = 'legal'
  if (c.nuevo && !d.insignia) d.insignia = 'v1.2'

  /* El nivel viaja con el campo: es el recorte del estudio —mínimo legal ⊂ operativo ⊂
     completo— y con él se puede enseñar la ficha corta sin tocar una sola definición. La
     tabla de arriba lo corrige donde el corte del estudio parte un grupo de campos que sólo
     sirve entero. */
  d.nivel = NIVELES_CAMPO[c.id] || c.nivel
  /* MIRA `d.nivel` Y NO `c.nivel`, que es el del estudio. Leyendo el original, un campo que
     `NIVELES_CAMPO` sube de Mínimo a Operativo salía del mínimo legal pero se quedaba con el
     asterisco de obligatorio — la mitad de la corrección, y la mitad que no se ve. Le pasaba a
     «Complemento SEGIP»: dejaba de contar para el mínimo y seguía pidiéndose. */
  if (d.nivel === 'Mínimo') d.requerido = true
  if (extra.req) d.requerido = true

  /* ── DOS COSAS DISTINTAS QUE VIVÍAN EN LA MISMA CADENA ───────────────────
     El «?» de cada campo mostraba la nota del estudio entera, y la nota del estudio mezcla dos
     públicos. Un analista de RR.HH. abría el signo del campo «Empresa del grupo» y leía
     «⚫ si 0.1 = Sí. Alimenta: GP.». De 246 campos con «?», 59 no decían más que eso, y 221
     arrastraban un «Alimenta: …» detrás de la frase útil.

     `Alimenta: GP, PL` significa qué sistema consume el dato —la Gestora, Planillas, el ERP—.
     Es trazabilidad, y es valiosa: es lo que permite auditar de dónde sale cada campo. Pero no
     es una respuesta a «¿para qué es esto?», que es lo único que se pregunta quien está
     llenando una ficha con la carpeta delante.

     ASÍ QUE SE PARTEN EN DOS CAMPOS. `nota` es lo que se le muestra a quien llena; `traza`
     queda en el dato para quien audite, sin dibujarse en ninguna parte todavía. No se pierde
     nada: se deja de enseñar donde no corresponde.

     Y EL «?» DESAPARECE SOLO cuando no queda nada que decir: `TarjetaCampos` ya lo dibuja con
     `campo.nota && …`, así que un campo sin frase humana se queda sin signo. Un signo que se
     abre para no decir nada es peor que no tenerlo: enseña a no tocarlo. */
  const ayuda = []
  const traza = []

  if (AYUDAS[c.id]) ayuda.push(AYUDAS[c.id])
  if (extra.ayuda) ayuda.push(extra.ayuda)

  if (c.nota) {
    /* LA CONDICIÓN CORTA EN EL PUNTO QUE TERMINA LA FRASE, no en el primero que aparece: los
       ids del estudio llevan punto —«⚫ si 0.1 = Sí»— y cortando en el primero, «⚫ si 0» se
       iba a la traza y «1 = Sí.» quedaba como ayuda al usuario. Un punto seguido de espacio o
       de fin de cadena es un final de oración; uno entre dígitos, no.

       Va a la traza y no a la ayuda porque `CONDICIONES` ya aplica la regla: el campo no
       aparece, así que explicar cuándo aparecería es explicar algo que no pasa. */
    /* O el punto que cierra la frase, O el fin de la cadena: las notas del estudio muchas veces
       no cierran con punto —«⚫ si 0.1 = Sí» a secas— y sin esa segunda salida el patrón no
       encontraba dónde terminar y dejaba la condición entera como ayuda al usuario. */
    const FIN = /⚫[\s\S]*?(?:\.(?=\s|$)|$)/gu
    const cond = c.nota.match(FIN)
    if (cond) traza.push(...cond.map(x => x.trim()))
    let humano = c.nota.replace(FIN, '')

    /* «✏️ v1.2 (obs. #3):» marca de dónde viene el retoque. Lo que sigue a los dos puntos sí
       es contenido; el prefijo es acta de reunión. */
    const marca = humano.match(/[🆕✏️]\uFE0F?\s*v1\.2[^:]*:/u)
    if (marca) { traza.push(marca[0].replace(/:$/, '').trim()); humano = humano.replace(marca[0], '') }

    humano = humano.replace(/[🆕✏️⚫🟢⚠️\uFE0F]/gu, '').replace(/\s+/g, ' ').trim()
    /* Quitado el prefijo, la frase arrancaba en minúscula: «busca por nombre o número de
       carnet». Es el principio de lo que lee el usuario, así que empieza como una frase. */
    if (humano) ayuda.push(humano[0].toUpperCase() + humano.slice(1))
  }

  /* DE DÓNDE SALEN LAS OPCIONES SÍ ES AYUDA: dice que la lista no se la inventó nadie, que es
     justo la duda de quien no encuentra su caso entre las opciones. El código de la resolución
     que la respalda, en cambio, es para el expediente. */
  const fuente = fuenteDe(c.id)
  if (fuente) {
    /* Salvo donde la lista dejó de ser la del estudio: decir que las opciones son las oficiales
       de la OVT cuando las reescribimos nosotros es mentir en el sitio donde alguien va
       justamente a preguntar si puede confiar en la lista. La traza se queda —el campo sigue
       siendo el 2 del F20— y lo que se retira es la promesa. */
    if (!LISTAS[c.id]) ayuda.push('Las opciones son la lista oficial de la OVT.')
    traza.push('Fuente · ' + fuente)
  }

  if (c.dudoso) traza.push('El estudio lo marca como a confirmar.')
  if (c.alimenta?.length) traza.push(`Alimenta: ${c.alimenta.join(', ')}.`)

  /* Las frases del estudio no siempre cierran con punto y se pegaban unas con otras —«Dispara
     la búsqueda Alimenta: GP.»—. Cada una cierra antes de que empiece la siguiente. */
  const cerrar = l => l.map(x => x.replace(/\uFE0F/g, '').trim())
    .map(x => (/[.!?:»]$/.test(x) ? x : x + '.')).join(' ')
  if (ayuda.length) d.nota = cerrar(ayuda)
  if (traza.length) d.traza = cerrar(traza)

  if (extra.ph) d.ph = extra.ph
  return d
}

/* ── Los campos de un acordeón, en el orden en que el estudio los quiere ── */
function camposDe(acc) {
  const salida = []
  const vistos = new Set()
  const sumar = (c, extra) => {
    if (!c || vistos.has(c.id)) return
    vistos.add(c.id)
    salida.push(traducir(c, extra))
  }

  for (const e of acc.exactos || []) sumar(porId.get(e.id), e)
  for (const id of acc.campos || []) sumar(porId.get(id))
  for (const sec of acc.secciones || []) {
    for (const c of ESQUEMA) if (c.seccion === sec) sumar(c)
  }
  for (const t of acc.tipos || []) {
    for (const c of ESQUEMA) if (c.tipo === t) sumar(c)
  }

  /* Y AL FINAL, NUESTRO ORDEN. Se aplica acá y no reordenando las cuatro fuentes de arriba
     porque ésas son del estudio —exactos, campos sueltos, secciones, tipos— y tocarlas sería
     discutirle al estudio qué campos van en la tarjeta, que no es lo que se está haciendo:
     los mismos campos, leídos en otro orden. */
  const orden = ORDEN[acc.id]
  if (!orden) return salida
  const adelante = orden.map(id => salida.find(c => c.key === id)).filter(Boolean)
  return [...adelante, ...salida.filter(c => !adelante.includes(c))]
}

/* ── Lo que decimos nosotros y no el estudio ──────────────────────────────
   EL ESTUDIO DECIDE QUÉ CAMPOS HAY; CÓMO SE LEEN EN PANTALLA LO DECIDIMOS ACÁ. Son dos trabajos
   distintos. Cuáles exige la ley, de qué entidad sale cada lista y en qué acordeón va cada uno
   es un hallazgo que no se discute. El rótulo que lee un analista de RR.HH. a las siete de la
   mañana es diseño de esta aplicación. `PISTAS`, acá abajo, ya funcionaba así desde el primer
   día; esto es lo mismo para los títulos de las tarjetas y para rótulos sueltos.

   POR QUÉ ACÁ Y NO EN EL PROTOTIPO. Corregir el texto en `mapa.js` lo deja fuera de este
   repositorio —sin historia, sin revisión— y lo pierde el día que llegue una v1.3 escrita por
   otra mano. Acá la corrección sobrevive a la próxima corrida: si el estudio vuelve con el
   título viejo, este archivo lo vuelve a cambiar. Cada override lleva escrito por qué existe,
   porque un cambio de copy sin motivo al lado se deshace solo en la siguiente lectura. */
const TARJETAS = {
  /* Era «¿Ya trabajó acá antes?». Tres problemas en cinco palabras.

     LE HABLABA DE VOS A QUIEN NO ES. Esta ficha la llena RR.HH. dando de alta a un tercero, no
     el colaborador contándose a sí mismo; una pregunta sin sujeto se lee en segunda persona y
     suena a portal de postulación. Los hermanos de esta tarjeta mantienen la tercera persona
     todo el tiempo: «Cómo se lo ubica», «A quién avisar en una emergencia».

     ERA EL ÚNICO TÍTULO CON SIGNOS DE INTERROGACIÓN. El paso entero va en frases declarativas
     —«Nombre», «Documento de identidad», «Dónde vive»— y ésta es la primera tarjeta de 254
     campos: es la que fija el tono de todo lo que sigue.

     Y PREGUNTABA DOS VECES. El campo 0.1, tres centímetros más abajo, volvía a preguntar lo
     mismo. Se contesta una sola vez, así que uno de los dos tenía que dejar de preguntar.

     «Acá», además, mentía el alcance: lo que se busca es un registro en todo el grupo —el campo
     siguiente pide cuál empresa del grupo—, no en esta empresa. El título nuevo no pregunta:
     nombra la bifurcación, que es la única decisión que se toma en esta tarjeta —recuperar el
     registro que existe o crear uno nuevo— y deja las dos salidas a la vista antes de
     contestar. */
  reingreso: { titulo: 'Reingreso o alta nueva' },

  /* Era «Nombre» a secas, y prometía un dato cuando tiene tres: las cinco partes del nombre
     legal, el nombre completo que se calcula solo, y la fotografía.

     «NOMBRE LEGAL» Y NO OTRA COSA, porque es como la propia aplicación ya lo llama: la pista del
     paso dice «Nombre legal, documento, nacimiento y contacto». Que la tarjeta y su paso usen la
     misma palabra es gratis y evita que alguien crea que son dos cosas distintas.

     Y ADEMÁS DICE POR QUÉ ESTA TARJETA EXISTE. El nombre se guarda partido en cinco porque cada
     entidad lo pide distinto —la OVT en tres partes, la Gestora en cinco, el RC-IVA en una— y eso
     sólo tiene sentido si lo que se está guardando es el nombre LEGAL y no como le dicen en la
     oficina. El adjetivo hace el trabajo que «Nombre» dejaba a la descripción.

     Se probó «Cómo se llama», para igualar la voz de «Dónde vive» y «Cómo se lo ubica». Se lee
     mejor pero suena a conversación y no a sistema, y esto es una ficha que se declara ante el
     Estado. La voz de las tarjetas queda como está: mezclada, y a revisar entera algún día. */
  nombre: { titulo: 'Nombre legal y fotografía' },
}

/* EL NOMBRE DE UN PASO EN NUEVE PÍXELES. La cinta del encabezado dibuja los ocho pasos en la
   misma fila, así que cada rótulo tiene una octava parte del ancho: «Remuneración» no entra en
   ningún tamaño de pantalla y «Acceso y documentos» tampoco. No son otros nombres, son los
   mismos dichos en una palabra, y el título entero sigue estando en el `title` de cada segmento
   y en el riel de la izquierda, que sí tiene sitio.

   «Sueldo» y no «Remuner.»: una palabra cortada se lee peor que una palabra distinta, y sueldo
   es como se lo llama en voz alta. «Afiliación» en singular porque en chico el plural solo
   agrega una letra que no cabe. */
const PASOS_CORTO = {
  quien: 'Identidad',
  entorno: 'Familia',
  puesto: 'Puesto',
  contrato: 'Contrato',
  afiliaciones: 'Afiliación',
  remuneracion: 'Sueldo',
  asistencia: 'Asistencia',
  sistema: 'Acceso',
  previa: 'Previa',
}

const PASOS_TITULO = {
  /* Era «Quién es». El mismo problema que «¿Ya trabajó acá antes?» pero un nivel más arriba y
     mucho más caro: los títulos de paso viven en el riel y en las pestañas, o sea que están en
     pantalla los ocho pasos enteros, no solo mientras se lee una tarjeta.

     ERA EL ÚNICO QUE NO ERA UN SUSTANTIVO. Sus ocho hermanos son sintagmas nominales —«Puesto»,
     «Contrato», «Afiliaciones», «Remuneración», «Asistencia», «Familia y salud», «Acceso y
     documentos», «Vista previa»— y «Quién es» era una interrogativa suelta en medio de la fila.
     En un riel los rótulos se leen de un vistazo y en paralelo: el que rompe la forma se lee
     como si nombrara otra clase de cosa.

     POR QUÉ «Y CONTACTO» Y NO «IDENTIDAD» A SECAS. El paso no termina en el carnet: incluye
     «Cómo se lo ubica» y «Dónde vive». Con el título corto, quien busca el domicilio no tiene
     razón para entrar acá. Los dos hermanos que cubren dos cosas ya usan esta forma —«Familia y
     salud», «Acceso y documentos»—, así que el ritmo no se rompe, y con 20 caracteres entra
     donde entra «Acceso y documentos».

     POR QUÉ NO «DATOS PERSONALES», QUE ERA LA OBVIA. Es exactamente como `MAPA_SISTEMA` llama a
     este bloque en el sistema que la propuesta viene a reemplazar. Reusarla hace que el paso 1
     de lo nuevo se vea idéntico a lo que ya tienen. */
  quien: 'Identidad y contacto',
}

/* ── DÓNDE CAE CADA CAMPO EN LA REJILLA ───────────────────────────────────
   `anchoDe` reparte por tipo y largo de rótulo, que acierta casi siempre: una fecha es corta, un
   sí/no necesita sus dos botones, un rótulo de frase entera pide media fila. Lo que no puede
   saber es qué campos son UNA PREGUNTA JUNTOS, y ahí es donde la fila se desarma.

   En la tarjeta de reingreso quedaba así: la pregunta ocupaba media fila, «Empresa del grupo»
   un tercio, y «Colaborador» —que es la otra mitad de la misma búsqueda— ya no entraba en lo
   que sobraba y se caía al renglón de abajo, a hacerle compañía a «¿Copiar documentos?», con
   el que no tiene nada que ver. Seis campos en tres filas cortadas por el ancho y no por el
   sentido.

   A TERCIOS SON DOS FILAS DE TRES, y cada una es una sola cosa:

     si es reingreso · de qué empresa · quién        ← a quién estamos trayendo
     documentos · permisos · antigüedad              ← qué se le trae

   Es lo mismo que hace el título de la tarjeta con las palabras: agrupar. Acá lo hace la
   forma, que se lee antes. */
/* ── EN QUÉ NIVEL APARECE UN CAMPO ────────────────────────────────────────
   El estudio reparte los 249 campos en tres niveles —Mínimo legal ⊂ Operativo ⊂ Completo— y
   ese corte casi siempre está bien: es el resultado de mirar qué exige cada entidad. Pero el
   estudio decide campo por campo, y hay campos que sólo tienen sentido JUNTOS.

   Acá se corrigen esos casos, con el motivo escrito. Cada entrada es una discrepancia con el
   estudio y tiene que poder defenderse sola. */
const NIVELES_CAMPO = {
  /* «Tercer nombre» estaba en Completo y sus cuatro hermanos en Mínimo. El resultado: en el
     nivel con el que la ficha abre, alguien llamado «Juan Carlos Andrés Rojas Vargas» no tenía
     dónde escribir «Andrés» — y el campo «Nombre completo», que se calcula juntando las cinco
     partes, salía con el nombre incompleto. Ese nombre viaja al directorio, al organigrama y a
     la declaración ante la OVT.

     No se sube a Mínimo sino a Operativo, que es donde ya está «Apellido de casada» —su par
     exacto: una parte del nombre legal que muchas personas no tienen—. En Mínimo pasaría a ser
     obligatorio, porque el conversor marca requerido todo lo de ese nivel, y exigir un tercer
     nombre a quien tiene dos es peor que no ofrecerlo. */
  '1.3': 'Operativo',

  /* «COMPLEMENTO SEGIP» ESTABA EN MÍNIMO, Y EL CONVERSOR MARCA OBLIGATORIO TODO LO DE MÍNIMO
     (más abajo, `if (c.nivel === 'Mínimo') d.requerido = true`). El resultado: un campo que la
     nota del propio estudio describe como «casos excepcionales de CI con numerología
     adicional» se le exigía a todo el mundo. La inmensa mayoría de los carnets no lleva
     complemento, así que el contador del mínimo legal no podía llegar a cero para nadie —y un
     contador que nunca llega a cero es un contador que se deja de mirar.

     Sube a Operativo, que es exactamente el mismo caso que «Tercer nombre» y «Apellido de
     casada»: un dato del documento legal que muchas personas simplemente no tienen. Se sigue
     ofreciendo en el nivel con el que la ficha abre; lo que deja de hacer es exigirse. */
  '1.13': 'Operativo',
}

const COLUMNAS = {
  /* `anchoDe` reparte el ancho mirando el rótulo del ESTUDIO, no el nuestro, así que estas cuatro
     fechas seguían en la columna corta que merecía «Fecha de emisión» y ahora tienen que alojar
     «Fecha de vencimiento del documento secundario». En cuatro columnas el rótulo salía en tres
     renglones sobre una caja de fecha de una sola línea. */
  '1.15': 'c-tercio',
  '1.16': 'c-tercio',
  '1.76': 'c-tercio',
  '1.77': 'c-tercio',

  /* EL CARNET ESCANEADO, A LA IZQUIERDA DE TODO LO QUE DICE.
     Iba al final, en la última fila y en una columna de tercio, como si fuera un campo más. Es al
     revés: es la FUENTE de los otros seis. El tipo, el número, la extensión, el complemento y el
     vencimiento se leen todos de ese papel —y algún día se autocompletan por OCR desde ahí—, así
     que ponerlo al final es pedir los datos primero y enseñar de dónde salen después.

     Puesto a la izquierda y ocupando dos filas, la tarjeta se lee como se trabaja: el papel abierto
     a un lado, lo que dice al otro. Es la misma disposición que la fotografía en la tarjeta del
     nombre, y por la misma razón — lo que manda en el grupo va primero y ancla la fila.

     DOS FILAS Y NO TRES, que es lo que tiene la fotografía: acá los campos de al lado son cuatro o
     seis según el documento —extensión y complemento van y vienen— y con tres filas reservadas, un
     pasaporte dejaba una fila entera vacía al costado del recuadro. */
  '1.17': 'c-tercio c-escaneo',

  '0.1': 'c-tercio',
  '0.2': 'c-tercio',
  '0.3': 'c-tercio',
  '0.4': 'c-tercio',
  '0.5': 'c-tercio',
  '0.6': 'c-tercio',
}

/* ── EN QUÉ ORDEN SE PREGUNTA DENTRO DE UNA TARJETA ───────────────────────
   El estudio numera los campos —1.10, 1.11, 1.12…— y ese número es su identidad, no su sitio
   en la pantalla. Casi siempre coinciden; donde no, manda el orden en que una persona tiene la
   información delante.

   Los ids listados se adelantan al principio de la tarjeta, en el orden en que estén acá; el
   resto sigue detrás como venía. */
const ORDEN = {
  /* «PAÍS EMISOR» ESTABA SEXTO, TRES CAMPOS DESPUÉS DE «EXTENSIÓN». Se lo pedía a quien ya
     había tenido que contestar una extensión departamental boliviana —LP, SC, CB…— para un
     pasaporte peruano. La traza del propio estudio dice «⚫ si tipo ≠ CI»: el país sólo importa
     cuando el documento no es el carnet de acá, y entonces importa de inmediato.

     VA SEGUNDO Y NO PRIMERO. La duda que lo motivó proponía ponerlo antes que el tipo, y el
     tipo tiene que seguir abriendo: quien llena esto tiene el documento en la mano, y lo
     primero que se lee de un documento es qué documento es. Preguntar de qué país es algo que
     todavía no se nombró es preguntar al aire. Primero qué, después de dónde.

     Y así los dos campos que definen el documento quedan juntos y arriba, antes de que empiecen
     los que dependen de ellos. */
  documento: ['1.10', '1.14'],
}


/* ── LO QUE SE LEE AL ABRIR EL «?» ────────────────────────────────────────
   La ayuda de un campo sale de la nota del estudio, limpia de trazabilidad. Donde esa nota no
   contesta la pregunta que realmente se hace quien está llenando, se escribe acá y va delante. */
const AYUDAS = {
  /* La lista abierta necesita decir de qué habla, porque «documento nacional de identidad» es
     general a propósito y lo general se entiende con ejemplos. Los cuatro países son los que de
     verdad aparecen en una nómina boliviana. */
  '1.10': 'El documento de identidad del país que lo emitió: el carnet en Bolivia, el DNI en Argentina o España, la cédula en Chile. El carnet de extranjero va aparte porque lo emite Migración y no lleva extensión.',
}

const ROTULOS = {
  /* Ahora que el título no pregunta, la pregunta es suya y no compite con nadie. Se acorta
     —«colaborador previamente registrado» es cómo se llama la fila en una base de datos, no
     cómo lo diría alguien— y dice «en el grupo», que es el alcance que la tarjeta busca de
     verdad. */
  '0.1': '¿Ya tiene registro en el grupo?',

  /* ── «FECHA DE VENCIMIENTO» ESTABA DOS VECES, PALABRA POR PALABRA ─────────
     Una es la del documento de identidad y la otra la de la licencia o certificación, y en el
     estudio las dos se llaman igual. Dentro de su tarjeta se entienden por vecindad; el problema
     es todo lo demás, que es donde un rótulo se lee solo: la vista previa los pone en la misma
     lista, y el aviso de lo que falta dice «Faltan: fecha de vencimiento» sin decir cuál.

     Y AUN SIENDO UNA SOLA SEGUIRÍA MAL. Esta ficha tiene una docena de fechas —ingreso,
     nacimiento, firma de contrato, fin de plazo, afiliación—, así que «vencimiento» a secas no
     nombra nada: nombra una categoría. El rótulo de un campo tiene que aguantar leerse fuera de
     su tarjeta, porque tarde o temprano se lee fuera de su tarjeta. */
  '1.15': 'Fecha de emisión del documento',
  '1.16': 'Fecha de vencimiento del documento',
  /* 1.72–1.79 NO SON EL DOCUMENTO SECUNDARIO, son la licencia o certificación —de conducir, de
     manipulación de alimentos—. La primera versión de estos dos rótulos decía «del documento
     secundario» por haber leído sólo el número del campo: 1.7x va después de 1.19 («¿Tiene
     documento secundario?») y la vecindad engañó. Sus hermanos lo dicen sin lugar a dudas: «Tipo
     de licencia o certificación», «Número de licencia», «Categoría». */
  '1.76': 'Fecha de emisión de la licencia',
  '1.77': 'Fecha de vencimiento de la licencia',

  /* «PRINCIPAL» LO DICE LA TARJETA, QUE SE LLAMA «DOCUMENTO DE IDENTIDAD», y no hay ningún otro
     «tipo de documento» con el que confundirlo: el de la licencia se llama «Tipo de licencia o
     certificación». Sobraba una palabra, y era justo la que hacía que el rótulo no entrara en una
     línea y arrastrara el chip LEGAL al renglón de abajo. */
  '1.10': 'Tipo de documento',

  /* «(ANVERSO + REVERSO)» ES UNA INSTRUCCIÓN, NO UN NOMBRE. Como rótulo ocupaba dos renglones
     —dentro de una tarjeta que ya se llama «Documento de identidad»— y empujaba el recuadro hacia
     abajo veinte píxeles, que en esta tarjeta se notan porque el recuadro es alto. Pasa a
     `PISTAS_ARCHIVO`, que se lee dentro del recuadro vacío y en la frase completa: ahí cabe decir
     lo que de verdad importa, que son las dos caras en UN archivo y no en dos. */
  '1.17': 'Documento escaneado',
}

const PISTAS_ARCHIVO = {
  '1.17': 'Anverso y reverso en un solo PDF · arrastrar o hacer clic',
}

/* ── El árbol completo ──────────────────────────────────────────────────── */
const PISTAS = {
  quien: 'Nombre legal, documento, nacimiento y contacto',
  entorno: 'Quiénes dependen, a quién avisar y su salud',
  puesto: 'Dónde encaja en la estructura de la empresa',
  contrato: 'Qué firmó, por cuánto tiempo y en qué condiciones',
  afiliaciones: 'Gestora, Caja de Salud, Ministerio e impuestos',
  remuneracion: 'Cuánto gana, qué le corresponde y dónde se le deposita',
  asistencia: 'Jornada, horario, marcaje, vacaciones y permisos',
  sistema: 'Sus credenciales, su rol y sus papeles',
  previa: 'Todo junto, antes de crearlo',
}

const pasos = MAPA_BLOQUES.map((b, i) => {
  const m = /^(\d+)\s·\s(.+)$/.exec(b.n)
  return {
    key: b.id,
    n: m ? Number(m[1]) : null,
    titulo: PASOS_TITULO[b.id] || (m ? m[2] : b.n),
    corto: PASOS_CORTO[b.id] || (m ? m[2] : b.n),
    pista: PISTAS[b.id] || '',
    tarjetas: b.accs.map(acc => {
      const nuestro = TARJETAS[acc.id] || {}
      return {
        id: acc.id,
        titulo: nuestro.titulo || acc.n,
        desc: nuestro.desc || acc.des,
        propuesta: !!acc.propuesta,
        incierto: !!acc.incierto,
        campos: camposDe(acc),
      }
    }).filter(t => t.campos.length),
  }
})

/* ── Se escribe ─────────────────────────────────────────────────────────── */
const cabecera = `/* LOS CAMPOS DE LA FICHA, PORTADOS DEL ESTUDIO DE LA PROPUESTA v1.2.
   GENERADO — no editar a mano. Sale de \`herramientas/portar-campos.cjs\`, que lee los tres
   archivos del prototipo de réplica (\`esquema.js\`, \`mapa.js\`, \`catalogos.js\`) y los traduce
   al formato de descriptores que ya entiende \`TarjetaCampos\`.

   POR QUÉ PORTADO Y NO REESCRITO. El estudio de qué campos hacen falta ya está hecho: 249
   campos, cuáles exige la ley, de qué entidad viene cada lista y en qué acordeón va cada uno.
   Volver a escribirlos a mano es garantizar que en tres semanas las dos listas digan cosas
   distintas y que nadie sepa cuál vale. Si el estudio cambia, se vuelve a correr el conversor.

   LA CLAVE DE CADA CAMPO ES SU ID DEL ESTUDIO —'1.1', '3.42b'— y no un nombre inventado. Es lo
   que permite volver de esta pantalla a la fila de la propuesta que la justifica, y al revés.

   Total: ${pasos.reduce((s, p) => s + p.tarjetas.reduce((n, t) => n + t.campos.length, 0), 0)} campos en ${pasos.filter(p => p.n).length} pasos. */

export const PASOS_PROPUESTA = `

const cuerpo = JSON.stringify(pasos, null, 2)
  // Las claves simples sin comillas, para que se lea como el resto del código de la casa.
  .replace(/^(\s*)"([A-Za-z][A-Za-z0-9]*)":/gm, '$1$2:')
  .replace(/"/g, "'")
  .replace(/\\'/g, "\\'")

fs.writeFileSync(DESTINO, cabecera + cuerpo + '\n')

const total = pasos.reduce((s, p) => s + p.tarjetas.reduce((n, t) => n + t.campos.length, 0), 0)
const unicos = new Set(pasos.flatMap(p => p.tarjetas.flatMap(t => t.campos.map(c => c.key))))
console.log(`pasos: ${pasos.length}`)
console.log(`tarjetas: ${pasos.reduce((s, p) => s + p.tarjetas.length, 0)}`)
console.log(`campos dibujados: ${total} · distintos: ${unicos.size} · en el esquema: ${ESQUEMA.length}`)
const faltan = ESQUEMA.filter(c => !unicos.has(c.id))
console.log(`sin ubicar: ${faltan.length}`, faltan.slice(0, 12).map(c => `${c.id} ${c.label}`))
