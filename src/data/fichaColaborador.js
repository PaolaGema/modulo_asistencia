import { PASOS_PROPUESTA } from './camposPropuesta'
import { provinciasDe } from './divisionPolitica'
import { nivelesDe, tieneCatalogo } from './territorios'

/* LA FICHA DEL COLABORADOR.
   Ocho pasos y una vista previa, con los 249 campos del estudio de la propuesta v1.2. Los campos
   NO se escriben acá: se portan de ese estudio a `camposPropuesta.js` —generado— y este archivo
   solo hace lo que el estudio no puede saber: engancharlos a los datos de esta aplicación,
   calcular los derivados y decidir qué se exige para poder crear la ficha.

   POR QUÉ ASÍ Y NO A MANO. El trabajo de averiguar qué campos hacen falta, cuáles exige la ley,
   de qué entidad sale cada lista y en qué sección va cada uno ya está hecho y revisado. Copiarlo
   a mano es garantizar que dentro de un mes las dos listas digan cosas distintas y que nadie
   sepa cuál vale. Cuando el estudio cambie, se vuelve a correr `herramientas/portar-campos.cjs`
   y esta pantalla se entera sola.

   POR QUÉ OCHO PASOS Y NO UNA PÁGINA LARGA. Son más de doscientos datos y no se llenan de un
   tirón: llegan de papeles distintos, en momentos distintos y de manos distintas —el contrato lo
   trae legal, el NUA lo da la Gestora semanas después, el haber lo pone RRHH—. En una sola
   columna nadie sabe por dónde va; en ocho pasos cada uno cabe en una pantalla, se guarda solo y
   se puede dejar a medias.

   EL NIVEL RECORTA SIN BORRAR. Mínimo legal ⊂ Operativo ⊂ Completo, que es el corte del propio
   estudio. Con «Mínimo» a la vista quedan los 34 campos sin los cuales no se puede declarar a
   nadie; el resto sigue existiendo y se llena después. */

export const PASO_PREVIA = 'previa'

/* Los peldaños del riel y de las pestañas: lo mismo que trae el estudio, sin los campos.
   «Vista previa» no lleva número a propósito —no es un noveno formulario que llenar, es la ficha
   entera leída de corrido antes de crearla— y por eso viene sin `n` desde el conversor. */
export const PASOS = PASOS_PROPUESTA.map(({ key, n, titulo, corto, pista }) => ({ key, n, titulo, corto, pista }))

/* «Paso 4 de 8». El ocho se cuenta, no se escribe: «Vista previa» viene sin número desde el
   conversor justamente para no contar como un formulario más, y si el estudio agrega un paso
   nueve esta cifra se entera sola. */
export const TOTAL_PASOS = PASOS.filter(p => p.n).length

/* ── Los tres niveles del estudio ────────────────────────────────────────── */
export const NIVELES = [
  { key: 'Mínimo', label: 'Mínimo legal', pista: 'Sin esto no se puede declarar a nadie' },
  { key: 'Operativo', label: 'Operativo', pista: 'Lo que hace falta para que la persona opere' },
  { key: 'Completo', label: 'Completo', pista: 'Los 249 campos del estudio' },
]

const ORDEN_NIVEL = { 'Mínimo': 0, 'Operativo': 1, 'Completo': 2 }

/* Mínimo ⊂ Operativo ⊂ Completo: elegir «Operativo» enseña también los mínimos, no solo los
   suyos. Son niveles de exigencia, no categorías sueltas. */
const entraEnNivel = (campo, nivel) =>
  (ORDEN_NIVEL[campo.nivel] ?? 2) <= (ORDEN_NIVEL[nivel] ?? 2)

/* Lo que arranca con algo puesto. El resto de las claves no hace falta declararlas: los campos
   leen `form[key] || ''` y una clave ausente y una vacía son lo mismo. */
export const EN_BLANCO = {
  '0.1': 'no',   // ¿Ya tiene registro en el grupo?

  /* NO HAY SEGUNDO DOCUMENTO MIENTRAS NADIE DIGA QUE SÍ. Sin arranque, la pregunta abría con los
     dos botones apagados —que en esta ficha significa «todavía no contestaron», no «no»— y el
     caso raro se cobraba el precio del caso común: todo el mundo tenía que contestar que no para
     una segunda cédula que casi nadie tiene. Puesto en «No», el bloque de ocho campos arranca
     cerrado y quien sí lo necesita lo abre de un clic, que es la dirección correcta del esfuerzo.

     Y es el mismo trato que 0.1: la pregunta que decide si se despliega un bloque entero se
     contesta sola por el caso de todos los días, nunca por el excepcional. */
  '1.19': 'no',   // ¿Tiene documento secundario?
  '2.seg': 'no',  // ¿Agregar un segundo contacto de emergencia?
  '1.78b': 'no',  // ¿Está suspendida la licencia?

  /* BOLIVIA VIENE PUESTO por ser el caso común, y se lo gana: el país emisor decide si se piden
     extensión y complemento SEGIP, así que sin un valor de arranque la tarjeta del documento
     abre incompleta para el 95 % de las altas y hay que contestar un desplegable para que
     aparezcan los campos de siempre.

     UN VALOR PUESTO ES UN VALOR QUE NADIE MIRA — de eso ya sabemos, es lo que motivó la marca de
     «por confirmar» en los reingresos—, y por eso acá se acepta: está a la vista, en su propio
     desplegable, al lado del tipo de documento que se acaba de elegir, y cambiarlo es un clic.
     No es un dato que llegó de otro lado sin avisar. */
  '1.14': 'Bolivia',   // País emisor del documento principal

  /* Y EL DEL SEGUNDO DOCUMENTO, POR LA MISMA RAZÓN Y UNA MÁS. La razón compartida es la de
     arriba: del país emisor dependen la extensión y el complemento SEGIP, y sin arranque el
     bloque abre incompleto. La propia es el sitio en que quedó el campo — al final del bloque,
     copiando el orden del principal—: sin valor puesto había que elegir el tipo, bajar hasta el
     país, y ver aparecer dos campos POR ENCIMA de donde uno estaba mirando. Un formulario no
     debe crecer hacia arriba.

     SE PROBÓ DEJARLO VACÍO con el argumento de que el segundo documento suele ser el extranjero,
     y el argumento era falso: no hay ningún orden obligado entre los dos. Quien carga la ficha
     decide cuál pone primero, y es igual de normal declarar el pasaporte como principal y el
     carnet como secundario que al revés. Los dos bloques tienen que arrancar igual porque
     ninguno de los dos sabe qué documento le va a tocar. */
  '1.20g': 'Bolivia',   // País emisor del documento secundario
}

/* ── El nombre ────────────────────────────────────────────────────────────
   SE GUARDA DESCOMPUESTO PORQUE CADA ENTIDAD LO PIDE DISTINTO: la OVT en tres partes, la Gestora
   en cinco —incluye apellido de casada— y el RC-IVA en una sola. Guardar solo la cadena armada
   obliga a adivinar dónde parte, y «María del Carmen Pérez de Rojas» no se parte bien con
   ninguna regla.

   Las claves son los ids del estudio: 1.1 primer nombre … 1.6 apellido de casada. */
const PARTES_NOMBRE = ['1.1', '1.2', '1.3', '1.4', '1.5']

export const nombreArmado = form => PARTES_NOMBRE
  .map(k => (form[k] || '').trim())
  .filter(Boolean)
  .join(' ')

/* El nombre que vale en todas las demás pantallas, y sale siempre de los campos separados. Una
   sola función para que el directorio, el organigrama y la vista previa no puedan discrepar. */
export const nombreDe = form => nombreArmado(form)

/* EL DOCUMENTO, ARMADO COMO SE ESCRIBE EN UN PAPEL.
   Se llamaba «el carnet» y era el nombre equivocado: esto es un producto para varias empresas y
   varios países, y el carnet es sólo lo que trae quien se identifica con uno. Un pasaporte y una
   cédula chilena entran por el mismo campo y valen lo mismo, así que el concepto es «documento de
   identidad» y el carnet boliviano es un caso suyo, no el molde.

   El estudio lo guarda en tres campos porque las entidades lo piden partido: 1.11 el número, 1.13
   el complemento del SEGIP —esas dos letras que distinguen a dos personas con el mismo número— y
   1.12 la extensión, que es el departamento donde se emitió. Los dos últimos son bolivianos y
   vienen vacíos en cuanto el documento no lo es; el número está siempre. Nadie lo dice partido en
   voz alta: se dice «ocho cuatro cinco dos uno uno nueve, Santa Cruz».

   ARMARLO ACÁ Y NO EN CADA PANTALLA es lo mismo que ya se hace con el nombre: hay una sola
   manera de escribirlo y vive en un solo sitio, así que el directorio, una búsqueda futura y
   cualquier listado no pueden discrepar sobre si lleva guión o espacio.

   Sin número no hay documento: devuelve cadena vacía en vez de « SC» suelto, que es lo que sale
   de concatenar partes de algo que todavía no se llenó. */
export const documentoDe = form => {
  const numero = (form['1.11'] || '').trim()
  if (!numero) return ''
  const complemento = (form['1.13'] || '').trim()
  const extension = (form['1.12'] || '').trim()
  return numero + (complemento ? '-' + complemento : '') + (extension ? ' ' + extension : '')
}

export const inicialesDe = form => {
  const partes = [form['1.1'], form['1.4'] || form['1.5']]
    .map(v => (v || '').trim()).filter(Boolean)
  return partes.map(p => p[0].toUpperCase()).join('') || '—'
}

/* LA FECHA, COMO LA ESCRIBE EL DIRECTORIO. Dentro de la ficha se guarda 'AAAA-MM-DD' —ordena
   solo y es lo que comen los campos de fecha—, pero la tabla de colaboradores enseña «15 Mar
   2025» en todas sus filas desde siempre. Una persona recién creada con la fecha en crudo rompía
   esa columna a la vista. */
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const fechaCorta = iso => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  return m ? `${+m[3]} ${MESES_CORTOS[+m[2] - 1]} ${m[1]}` : (iso || '')
}

/* ── Los campos que se calculan solos ─────────────────────────────────────
   Las reglas son las del estudio, con su fórmula y su porqué. Un derivado no tiene caja donde
   escribirlo: llega calculado desde su origen y por eso no puede desactualizarse. */
const sumarDias = (iso, dias) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return ''
  const d = new Date(+m[1], +m[2] - 1, +m[3])
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* Hoy, en 'AAAA-MM-DD', que es como se guardan las fechas en la ficha. Comparadas como texto
   ordenan igual que como fechas, así que no hace falta construir dos `Date` para saber cuál
   viene antes. */
const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── «ESTA LICENCIA YA VENCIÓ», ESCRITO UNA VEZ ────────────────────────────
   Lo miran dos reglas que tienen que coincidir o la tarjeta se contradice: el estado calculado
   (1.78) y si se pregunta por la suspensión (1.78b). Separadas, una podía decir «Vencida»
   mientras la otra seguía ofreciendo suspender, que es el estado imposible.

   SIN FECHA NO ESTÁ VENCIDA, está sin saber. Devuelve falso a propósito: es lo que mantiene la
   pregunta a la vista mientras nadie escribió el vencimiento todavía. */
const licenciaVencida = form => {
  const vence = form['1.77']
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vence || '')) return false
  return vence < hoyISO()
}

const DERIVADOS = {
  '1.7': form => nombreArmado(form),

  /* ── EL ESTADO DE UNA LICENCIA, QUE ESTABA DECLARADO Y NO SE CALCULABA ──────
     1.78 llevaba `deducido` y la insignia «se calcula» desde que se portó el estudio, pero
     nunca tuvo regla acá. El resultado es de los que no se denuncian solos: el campo salía en
     blanco, no se podía escribir, y como los derivados no cuentan para el progreso tampoco
     aparecía entre lo que falta. Una raya en la ficha, para siempre.

     TRES ESTADOS SON LA FECHA LEÍDA CONTRA HOY y el cuarto no: «Suspendida» la decide quien
     emitió el papel y entra por 1.78b, que es una pregunta porque no hay otro sitio de donde
     sacarla. Manda sobre «Vigente» y sobre «Por vencer»: una licencia suspendida no sirve
     aunque le queden dos años.

     PERO «VENCIDA» MANDA SOBRE ELLA, y este orden no es estético. La pregunta de la suspensión
     sólo se hace mientras la licencia no venció —ver `CONDICIONES`—, así que una licencia
     vencida puede seguir cargando un «sí» viejo de cuando estaba vigente, con su pregunta ya
     fuera de pantalla. Si «Suspendida» ganara, ese sí fósil taparía para siempre el vencimiento
     real y nadie tendría dónde desmarcarlo. Leyendo la fecha primero, el dato viejo queda
     guardado —no se borra— y deja de mandar; el día que se renueve la licencia, la pregunta
     vuelve a aparecer con su respuesta intacta y quien corresponda la corrige.

     LOS 30 DÍAS DE «POR VENCER» SON EL ÚNICO NÚMERO QUE PUSIMOS NOSOTROS. La nota de 1.77 pide
     «alerta anticipada obligatoria» y no dice de cuánto. Treinta días es lo que tarda un
     trámite de renovación sin apuro, y el precedente de la casa es 3.37, que también elige un
     plazo para que el aviso llegue antes y no encima. Si la operación quiere otro, se cambia
     este número y nada más.

     SIN FECHA NO HAY ESTADO. Devuelve vacío en vez de arriesgar «Vigente» sobre un campo que
     nadie llenó todavía: decirle vigente a una licencia de la que no se sabe nada es peor que
     no decir nada, porque el aviso que esta tarjeta existe para mandar no se mandaría. */
  '1.78': form => {
    if (licenciaVencida(form)) return 'Vencida'
    if (form['1.78b'] === 'si') return 'Suspendida'
    const vence = form['1.77']
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vence || '')) return ''
    return vence <= sumarDias(hoyISO(), 30) ? 'Por vencer' : 'Vigente'
  },
  /* «Nunca pueden diferir»: la fecha de ingreso a la Caja es la de ingreso legal. */
  '3.28': form => fechaCorta(form['3.25']),
  /* Ingreso + 89 días. El periodo de prueba es de 90 y a los 90 + 1 nacen los beneficios
     sociales, así que la alerta tiene que llegar antes. */
  '3.37': form => fechaCorta(sumarDias(form['3.25'], 89)),
}

/* ── Qué campos aparecen y cuándo ─────────────────────────────────────────
   Portadas de `CONDICIONES` en el `reglas.js` del estudio, que es donde está decidido. Van a
   mano y no por el conversor porque son funciones, no datos: el conversor escribe descriptores
   de campo y una función no se serializa sin acabar en un `eval`. Es el mismo trato que reciben
   los derivados de más arriba, y por el mismo motivo.

   UN CAMPO QUE NO SE VE TAMPOCO SE CUENTA. El filtro va acá, en `tarjetasDe`, que es por donde
   pasan TODOS —el formulario, la vista previa, el progreso por paso, el mínimo legal y el
   contador de la ficha—. Puesto al dibujar, el campo se escondería y seguiría reclamándose.

   Y ESO NO ERA UN DETALLE: 0.2 a 0.6 son de nivel Mínimo y `requerido`. Contestando «No» —el
   caso normal, casi todas las altas son gente nueva— quedaban cinco campos del mínimo legal que
   nadie podía llenar nunca, contados como pendientes para siempre. La ficha decía que faltaban
   cinco datos obligatorios que no existían.

   EL VALOR ESCRITO NO SE BORRA AL ESCONDERSE. Quien contesta «Sí», elige la empresa del grupo y
   después se corrige a «No» no pierde lo que escribió si vuelve a «Sí»; y mientras esté en «No»,
   ese valor no se cuenta ni se enseña en ninguna parte. Borrarlo sería castigar un clic.

   'si' Y NO 'Sí': el estudio compara contra el texto del botón y nosotros guardamos la clave
   —'si' / 'no'—, que es lo que escribe `TarjetaCampos`. La regla es la misma; el literal, el
   nuestro. */
const CONDICIONES = {
  /* Todo lo que cuelga de un reingreso: de qué empresa del grupo viene, quién es, y qué se le
     trae de su registro anterior —documentos, permisos, antigüedad—. Sin reingreso no hay
     registro anterior del que traer nada, así que no hay nada que preguntar. */
  '0.2': form => form['0.1'] === 'si',
  '0.3': form => form['0.1'] === 'si',
  '0.4': form => form['0.1'] === 'si',
  '0.5': form => form['0.1'] === 'si',
  '0.6': form => form['0.1'] === 'si',

  /* ── LO QUE SÓLO TIENE EL CARNET BOLIVIANO ──────────────────────────────
     «EXTENSIÓN» Y «COMPLEMENTO SEGIP» NO SON DATOS DE UN DOCUMENTO: SON DATOS DE *ESTE*
     DOCUMENTO. La extensión es el departamento que emitió el carnet —LP, SC, CB, OR, PT, TJ,
     CH, BE, PD— y el complemento es la numerología que el SEGIP le agrega a algunos. Un
     pasaporte peruano no tiene ninguna de las dos cosas, y no porque falten: no existen.

     ANTES SE LAS PEDÍA IGUAL, y «Extensión» además estaba en el mínimo legal y por lo tanto
     marcada obligatoria. Para un extranjero con pasaporte eso era un campo imposible: una lista
     de nueve departamentos bolivianos donde ninguna opción es cierta, y sin la cual el contador
     del mínimo legal no bajaba nunca. Es la misma familia de errores que los otros cinco
     obligatorios que no se podían llenar.

     SE ESCONDEN Y DEJAN DE CONTAR. Un campo que `seVe` descarta sale también de
     `escribiblesUnicos`, así que el mínimo legal de un extranjero sí puede llegar a cero — que es
     como tiene que ser, porque para el Ministerio ese alta está tan completa como cualquier otra.

     HACEN FALTA LOS DOS CAMPOS, y esto cambió cuando el tipo se volvió general. Mientras la
     opción se llamaba «CI» la palabra traía dentro que era boliviano, y bastaba con mirarla.
     «Documento nacional de identidad» ya no dice de dónde: un DNI argentino y un carnet
     boliviano son los dos «documento nacional de identidad», y sólo el segundo tiene extensión.
     Así que la condición pasó a mirar también el país emisor — que es exactamente la razón por la
     que ese campo dejó de ser condicional y ahora se pregunta siempre.

     Y EL CARNET DE EXTRANJERO NO ENTRA aunque lo emita Bolivia: lo emite Migración, no el SEGIP,
     y no lleva extensión departamental. Por eso es una opción aparte y no un caso de la primera. */
  '1.12': form => form['1.10'] === 'Documento nacional de identidad' && form['1.14'] === 'Bolivia',
  '1.13': form => form['1.10'] === 'Documento nacional de identidad' && form['1.14'] === 'Bolivia',

  /* LA CAJA DEL DOCUMENTO QUE LA LISTA NO NOMBRA, hermana exacta de 2.2b. El catálogo se redujo
     a cuatro y su propia nota dice qué se retiró —«RUN», «Certificado de nacimiento»—, así que
     «Otro» no es el caso raro: es la puerta por la que entran los que se sacaron. Sin caja, el
     campo que identifica a la persona ante el Estado guardaba la palabra «Otro».

     LA DEL SEGUNDO DOCUMENTO PIDE LAS DOS COSAS, como el resto de su bloque: que haya segundo
     documento Y que su tipo sea «Otro». Con una sola condición, contestar «No» a 1.19 dejaría
     colgando una caja de un desplegable que ya no se ve. */
  '1.10b': form => form['1.10'] === 'Otro',
  '1.20i': form => form['1.19'] === 'si' && form['1.20a'] === 'Otro',

  /* La tercera de la misma familia: el tipo de licencia dejó de ser texto libre para poder
     agrupar los avisos de vencimiento, y «Otro» es su válvula. Sin la caja, todo lo que la
     lista no nombra cae en un único montón llamado «Otro» — que para un aviso que se manda
     por tipo es peor que el texto libre que vino a reemplazar. */
  '1.72b': form => form['1.72'] === 'Otro',

  /* ── NO SE PREGUNTA POR SUSPENDER LO QUE YA VENCIÓ ─────────────────────────
     Suspender es quitarle valor a un papel que lo tenía. Vencido ya no lo tiene, así que la
     respuesta no cambiaría nada: el estado dice «Vencida» conteste lo que conteste, y una
     pregunta cuya respuesta no mueve nada es ruido en una tarjeta de nueve campos.

     SE MIRA LA FECHA Y NO EL ESTADO CALCULADO, y ahí estaba la trampa. `form['1.78'] ===
     'Vigente'` parece lo natural y es un callejón: marcar «Sí» vuelve el estado «Suspendida»,
     que ya no es «Vigente», y la pregunta desaparecería con su propia respuesta puesta —sin
     manera de volver atrás—. La fecha no depende de la respuesta, así que no se muerde la cola.

     MIENTRAS NO HAYA FECHA SE PREGUNTA IGUAL: no saber cuándo vence no es lo mismo que estar
     vencida, y una suspensión que ya ocurrió hay que poder anotarla antes de tener el papel
     delante. */
  '1.78b': form => !licenciaVencida(form),

  /* EL RÓTULO DEL DOCUMENTO SECUNDARIO SOLO SE ENCIENDE SI HAY SEGUNDO DOCUMENTO. Su nota en el
     estudio ya lo decía —«se despliega solo si 1.19 = Sí»— pero la condición nunca se portó, y un
     rótulo sin condición se enseña siempre: la tarjeta cerraba con un encabezado en versalitas y
     nada debajo, justo cuando la respuesta era «No». */
  '1.20': form => form['1.19'] === 'si',

  /* Y CON EL RÓTULO, TODO SU BLOQUE. Los ocho campos del segundo documento cuelgan de la misma
     respuesta: contestar «No» no los deja vacíos, los saca de la ficha —y con ella de la cuenta
     del progreso, porque `seVe` filtra antes de contar—. Si no fuera así, decir que no hay
     segundo documento dejaría ocho campos sin llenar que nadie puede llenar nunca. */
  '1.20a': form => form['1.19'] === 'si',
  '1.20b': form => form['1.19'] === 'si',
  '1.20e': form => form['1.19'] === 'si',
  '1.20f': form => form['1.19'] === 'si',
  '1.20g': form => form['1.19'] === 'si',
  '1.20h': form => form['1.19'] === 'si',

  /* La extensión y el complemento del segundo documento repiten la regla del primero encima de
     la suya: hace falta que haya segundo documento, Y que sea un carnet, Y que lo emita Bolivia.
     Un pasaporte argentino no lleva extensión departamental por mucho que sea el documento dos. */
  /* NO TODOS LOS PAÍSES TIENEN ESCALÓN DE EN MEDIO. Colombia va de departamento a municipio sin
     nada entre medias, y preguntarle una provincia a alguien de Medellín es pedirle un dato que
     su país no tiene. Se esconde igual que la extensión de un documento que no es boliviano. */
  '1.44': form => Boolean(nivelesDe(form['1.42']).menor),

  /* La caja del parentesco que la lista no contempla. Sin esto, «Otro» sería una respuesta que no
     responde nada — y es un campo del mínimo legal. */
  '2.2b': form => form['2.2'] === 'Otro',
  /* ── EL SEGUNDO CONTACTO SE PIDE, NO SE OFRECE PUESTO ────────────────────────────────
     Estaba siempre a la vista, y eso es cinco campos vacíos que la mayoría no va a llenar
     colgando de una tarjeta que ya tiene siete. Un formulario largo no se alarga por si acaso:
     quien necesita el segundo contacto lo pide, y quien no, no lo ve.

     ARRANCA EN «NO» como la pregunta del documento secundario, y por la misma razón: acá los dos
     botones apagados significan «todavía no contestaron», así que sin valor de arranque el caso
     raro le cobra el precio al común.

     Y SU RÓTULO NO NECESITA CONDICIÓN. Cae solo, porque ya no queda ningún rótulo en la ficha que
     sobreviva a sus campos — esa regla vive en `sinRotulosHuerfanos` y vale para todos. */
  '2.1-2':  form => form['2.seg'] === 'si',
  '2.2-2':  form => form['2.seg'] === 'si',
  '2.3-2':  form => form['2.seg'] === 'si',
  '2.4-2':  form => form['2.seg'] === 'si',
  '2.5-2':  form => form['2.seg'] === 'si',
  '2.6-2':  form => form['2.seg'] === 'si',
  '2.7-2':  form => form['2.seg'] === 'si',
  '2.2b-2': form => form['2.seg'] === 'si' && form['2.2-2'] === 'Otro',

  '1.20c': form => form['1.19'] === 'si' && form['1.20a'] === 'Documento nacional de identidad' && form['1.20g'] === 'Bolivia',
  '1.20d': form => form['1.19'] === 'si' && form['1.20a'] === 'Documento nacional de identidad' && form['1.20g'] === 'Bolivia',

  /* SE PROBÓ CONDICIONAR «APELLIDO DE CASADA» a que el sexo fuera femenino, y se sacó a pedido:
     el campo vuelve a mostrarse siempre. Queda anotado porque el problema que lo motivó sigue
     ahí —hoy se le pide el apellido de casada a un hombre y a una soltera— y porque la regla,
     si algún día se retoma, es una línea:

         '1.6': form => form['1.27'] === 'F · Femenino',

     Y con una advertencia que costó encontrar: NO atarlo también a «Casado(a)». Una divorciada
     o una viuda puede conservarlo legalmente y su carnet lo sigue diciendo, así que esa
     condición lo escondería justo a quien lo tiene en el documento. */}

/* EL ESTUDIO TRAE CUATRO CONDICIONES MÁS Y NO ESTÁN PORTADAS TODAVÍA, a propósito:

     3.36  fecha de finalización, sólo si el contrato tiene plazo (depende de 3.32)
     3.117 marcación virtual, sólo si la modalidad no es 100 % presencial (depende de 3.42b)

   Ésas dos son portables tal cual y entran cuando se trabaje el paso «Contrato».

     3.26 y 3.27  dependen de `__fechasDistintas`
     3.41         depende de `__modo === 'edicion'`

   Esas tres cuelgan de banderas internas del prototipo que esta aplicación no tiene. Portarlas
   sin la bandera las escondería PARA SIEMPRE, que es peor que enseñarlas de más: un campo que
   no aparece nunca no se reclama y nadie descubre que falta. Entran cuando exista de dónde
   leerlas. */

/* Qué ranura territorial es cada clave del estudio. Acá y no en el campo porque es una relación
   entre tres campos, y un campo no puede saber qué lugar ocupa en una escalera. */
const TERRITORIO = { '1.43': 'mayor', '1.44': 'menor', '1.45': 'local' }

const seVe = (campo, form) => {
  const k = claveBase(campo.key)
  return !CONDICIONES[k] || CONDICIONES[k](form)
}

/* ── Las listas que dependen de esta empresa ──────────────────────────────
   El estudio trae catálogos de ejemplo para todo lo que sale de la estructura —sucursales,
   unidades, cargos, jefes—. Acá se reemplazan por los de verdad: los que el usuario cargó en
   Organización. Es la única parte del estudio que NO se puede portar tal cual, porque no habla
   de la ley sino de esta empresa en particular. */
const opcionesDeEstructura = (key, ctx) => {
  const { puestos = [], unidades = [], sucursales = [], personas = [], empresa = null, grupo = [] } = ctx
  switch (key) {
    /* DE QUÉ EMPRESA DEL GRUPO VIENE. Era una caja de texto libre porque el estudio no trae
       catálogo para esto —no puede: depende de cada empresa, no de la ley— y sin lista, tres
       personas escriben el mismo nombre de tres maneras y después nadie cruza nada. Sale de
       `empresasGrupo`, igual que las sucursales salen de Organización. */
    case '0.2': return grupo.length ? grupo.map(e => e.nombre) : null
    case '3.2': return empresa?.nombre ? [empresa.nombre] : null
    case '3.5': return unidades.length ? unidades : null
    case '3.8': return sucursales.length ? sucursales : null
    case '3.11': return puestos.length ? puestos : null
    // Supervisor, aprobadores y quien autorizó la contratación salen del directorio.
    case '3.13': case '3.15': case '3.16': case '3.16b': case '3.39':
      return personas.length ? personas : null
    default: return null
  }
}

/* ── Las tarjetas de un paso ──────────────────────────────────────────────
   Se calculan con el formulario delante porque hay campos que dependen de lo ya contestado: las
   listas salen de la estructura viva y los derivados se rellenan desde su origen. */

/* ── UN BLOQUE QUE SE REPITE TANTAS VECES COMO HAGA FALTA ─────────────────
   El estudio dice «repetible» en tres sitios —los contactos de emergencia, los beneficios
   individuales, las medidas disciplinarias— y los hijos lo son por definición. Nada de eso se
   podía repetir: cada campo era una clave y una clave guarda un valor. Una familia de tres hijos
   entraba con uno declarado y dos sin asignación familiar.

   LA CUENTA VIVE EN LA FICHA y las copias se numeran en la clave: el primer hijo usa `2.20` tal
   cual y el segundo `2.20#2`. El primero sin sufijo no es capricho — así una ficha guardada antes
   de que esto existiera sigue leyéndose entera, y el caso de un solo hijo, que es el común,
   guarda exactamente lo que guardaba antes.

   LAS CONDICIONES Y LOS DERIVADOS MIRAN LA CLAVE BASE, porque una regla escrita para `2.29` vale
   para el hijo tres igual que para el uno. Lo que todavía no se puede es condicionar un campo al
   valor de OTRO campo de su misma copia: eso pediría que la regla supiera en qué instancia está,
   y hoy ninguna lo necesita. */
const CUENTA = grupo => '__n_' + grupo
export const cuantosHay = (form, grupo) => Math.max(1, Number(form[CUENTA(grupo)]) || 1)
export const claveDeCuenta = CUENTA

/* La clave sin su número de copia: `2.20#3` es, para cualquier regla, `2.20`. */
export const claveBase = clave => String(clave).split('#')[0]

function expandirRepetibles(campos, form) {
  const fuera = []
  for (let i = 0; i < campos.length;) {
    const c = campos[i]
    if (!c.repite) { fuera.push(c); i += 1; continue }

    const grupo = c.repite
    const bloque = []
    while (i < campos.length && campos[i].repite === grupo) { bloque.push(campos[i]); i += 1 }

    const cuantos = cuantosHay(form, grupo)
    for (let n = 1; n <= cuantos; n += 1) {
      for (const campo of bloque) {
        const copia = { ...campo, grupo, instancia: n, total: cuantos }
        if (n > 1) copia.key = campo.key + '#' + n
        /* EL TÍTULO SE NUMERA SÓLO CUANDO HAY MÁS DE UNO. Con un solo hijo, «Hijo 1» pregunta por
           el segundo sin decirlo; con tres, no numerarlos los vuelve indistinguibles. */
        if (campo.tipo === 'rotulo' && cuantos > 1) copia.label = (campo.singular || campo.label) + ' ' + n
        fuera.push(copia)
      }
    }
  }
  return fuera
}

/* ── UN ENCABEZADO SIN NADA DEBAJO SE CAE CON LO QUE ENCABEZABA ───────────
   Un rótulo parte una tarjeta por dentro, y por eso se salta el corte de nivel: si se recortara
   como un campo cualquiera, un bloque entero se quedaría sin su título. El precio de esa excepción
   es que puede sobrevivir a todos sus campos — y entonces dibuja un filete y un encabezado en
   versalitas encima de la nada.

   YA PASÓ DOS VECES. La primera con «Documento secundario», que se enseñaba aunque la respuesta
   fuera «No»; se arregló condicionando ese rótulo. La segunda con «Segundo contacto», que a nivel
   Mínimo encabeza campos que ese nivel no incluye — y ahí no hay condición que valga, porque lo
   que lo vacía no es una respuesta sino el nivel.

   Así que la regla va acá, una vez, en vez de en cada rótulo: sobrevive el que tenga al menos un
   campo de verdad antes del siguiente rótulo. */
const sinRotulosHuerfanos = campos => campos.filter((c, i) => {
  if (c.tipo !== 'rotulo') return true
  for (let j = i + 1; j < campos.length; j += 1) {
    if (campos[j].tipo === 'rotulo') return false
    return true
  }
  return false
})

export function tarjetasDe(paso, form, ctx = {}, nivel = 'Completo') {
  const p = PASOS_PROPUESTA.find(x => x.key === paso)
  if (!p) return []

  return p.tarjetas.map(t => ({
    ...t,
    campos: t.campos
      .filter(c => (c.tipo === 'rotulo' || entraEnNivel(c, nivel)) && seVe(c, form))
      .map(c => {
        const campo = { ...c }

        const ops = opcionesDeEstructura(c.key, ctx)
        if (ops) { campo.tipo = 'lista'; campo.opciones = ops }

        /* ── LA PROVINCIA SE FILTRA POR SU DEPARTAMENTO ───────────────────────────────────
           Es el dolor que el estudio cita entre comillas —«la lista no se puede filtrar por
           departamento»— y la regla estaba anunciada en dos notas, la de este campo y la del
           anterior, sin que ninguna línea la cumpliera: «Provincia» era una caja de texto, así
           que no había siquiera lista que filtrar.

           SIN FILTRO NO ES QUE CUESTE ENCONTRARLA, ES QUE NO SE PUEDE. Entre las ciento doce del
           país hay nombres repetidos: «Cercado» es una provincia de Cochabamba, otra de Oruro,
           otra de Tarija y otra del Beni. Cuatro entradas idénticas en una lista sin contexto —
           elegir bien sería adivinar.

           Y MIENTRAS NO HAY DEPARTAMENTO, NO HAY DESPLEGABLE. `provinciasDe` devuelve nada y el
           campo se queda como texto libre con una pista que dice por dónde empezar: un
           desplegable que se abre vacío promete opciones que no existen todavía. */
        /* ── EL BLOQUE TERRITORIAL SE LLAMA COMO SE LLAME EN SU PAÍS ──────────────────────
           Tres ranuras fijas —mayor, menor, localidad— con el rótulo del país elegido. Las claves
           no se mueven: 1.43 es la subdivisión mayor viva donde viva la persona, así que un
           informe que cruce tres países sigue comparando lo comparable.

           Y FUERA DE BOLIVIA, TEXTO LIBRE. No por dejadez: los catálogos de estados mexicanos o
           comunas chilenas hacen falta de fuente oficial, y una lista inventada de memoria es
           peor que una caja porque parece autoridad. El rótulo ya es el correcto, que era el
           problema de verdad — a un chileno se le pedía un «departamento» boliviano. */
        if (TERRITORIO[c.key]) {
          const niveles = nivelesDe(form['1.42'])
          campo.label = niveles[TERRITORIO[c.key]]
          if (!tieneCatalogo(form['1.42'])) {
            delete campo.tipo
            delete campo.opciones
            campo.ph = `${campo.label} donde reside`
          }
        }

        /* LA PROVINCIA SE FILTRA POR SU DEPARTAMENTO, y esto es de Bolivia: es el único país con
           catálogo cargado. Mientras no hay departamento elegido no hay desplegable, porque uno
           que se abre vacío promete opciones que todavía no existen. */
        if (c.key === '1.44' && tieneCatalogo(form['1.42'])) {
          const provincias = provinciasDe(form['1.43'])
          if (provincias) { campo.tipo = 'lista'; campo.opciones = provincias }
          else campo.ph = 'Elige antes el departamento'
        }

        if (DERIVADOS[c.key]) campo.deducido = DERIVADOS[c.key](form) || ''

        /* LA FOTO SE SUBE COMO UNA FOTO Y NO COMO UN ADJUNTO. Es el único de los nueve archivos
           de la ficha que hay que MIRAR para saber si está bien: los otros ocho son papeles y de
           un papel alcanza con saber que está. Se marca acá por clave y no en el estudio porque
           el estudio dice qué campo es —un archivo de imagen— y no cómo se dibuja. */
        if (c.key === '1.9') { campo.retrato = true; campo.col = 'c-tercio c-retrato' }

        /* ── LA NACIONALIDAD NO SE PREGUNTA DOS VECES ─────────────────────────────────────
           Quien contesta que sí es boliviana ya dijo cuál es su nacionalidad. Preguntarlo otra
           vez en el desplegable de al lado es pedirle que repita lo que acaba de decir, y abre la
           puerta a que se contradiga: hoy se puede contestar «Sí» y elegir «Argentina», y la
           ficha se lo traga.

           EL ESTUDIO YA LO PEDÍA —la nota del campo dice «aparece solo si 1.24 = No»— y la regla
           nunca se portó. Se porta deduciendo y no escondiendo, que es lo que esta ficha hace con
           lo que se sabe solo: el campo se queda a la vista con «Bolivia» dentro y la insignia de
           calculado, en vez de desaparecer. Un dato que alimenta a Gestión de Personas y a
           Planillas no debe irse de la pantalla justo cuando por fin se conoce; y de paso deja de
           contar para el progreso, porque `escribiblesUnicos` salta los deducidos: no se puede exigir
           que alguien rellene lo que no tiene dónde escribir. */
        if (c.key === '1.25' && form['1.24'] === 'si') {
          campo.deducido = 'Bolivia'
          campo.insignia = 'se calcula'
        }

        /* Y POR EL OTRO LADO, LA CONTRADICCIÓN TAMPOCO SE OFRECE. Dicho que NO es boliviana,
           «Bolivia» sale de la lista: seguía ahí, primera de trece, y elegirla dejaba una ficha
           que se desmiente a sí misma en dos campos contiguos. */
        if (c.key === '1.25' && form['1.24'] === 'no') {
          campo.opciones = (campo.opciones || []).filter(o => o !== 'Bolivia')
        }

        /* EL LUGAR DE NACIMIENTO SE ESCRIBE DENTRO DE UN PAÍS. Es texto libre porque no hay
           catálogo de ciudades del mundo que se pueda portar, pero la pista sí puede saber de qué
           país se está hablando: en Bolivia se dice ciudad y departamento, fuera se dice ciudad y
           provincia o estado. Y sin país elegido, lo que corresponde no es una pista sino decir
           por dónde se empieza — que es el orden en el que ahora están puestos los dos campos. */
        if (c.key === '1.22') {
          campo.ph = !form['1.23'] ? 'Elige antes el país de nacimiento'
            : form['1.23'] === 'Bolivia' ? 'Ciudad y departamento'
            : 'Ciudad y provincia o estado'
        }

        return campo
      }),
  /* UN ROTULO SUELTO NO ES UNA SECCIÓN. Recortando por nivel puede quedar una tarjeta con solo
     los encabezados de sus bloques y ningún campo debajo: eso se ve como una pantalla rota. */
  })).map(t => ({ ...t, campos: sinRotulosHuerfanos(expandirRepetibles(t.campos, form)) }))
    .filter(t => t.campos.some(c => c.tipo !== 'rotulo'))
}

/* TODAS LAS TARJETAS DE LA FICHA, en orden. Es lo que lee la vista previa —que no es un paso más
   sino los ocho leídos de corrido— y de donde salen las cuentas. */
export const tarjetasTodas = (form, ctx, nivel = 'Completo') => PASOS
  .filter(p => p.key !== PASO_PREVIA)
  .map(p => ({ paso: p, tarjetas: tarjetasDe(p.key, form, ctx, nivel) }))

const lleno = v => !(v === null || v === undefined || String(v).trim() === '')

/* CADA CAMPO CUENTA UNA VEZ. Los campos de archivo salen dos veces a propósito —en su sección
   natural y reunidos en «Archivos»— y son el mismo dato: contarlos dos veces inventaría campos
   que no existen y bajaría un porcentaje que nadie puede subir. Sin número acá: el escaneo del
   segundo documento ya hizo que fueran seis en vez de cinco, y un comentario que cuenta se
   equivoca en la siguiente ficha. */
const escribiblesUnicos = (form, ctx, nivel) => {
  const vistos = new Map()
  for (const { tarjetas } of tarjetasTodas(form, ctx, nivel)) {
    for (const t of tarjetas) {
      for (const c of t.campos) {
        if (c.tipo === 'rotulo' || c.deducido !== undefined) continue
        if (!vistos.has(c.key)) vistos.set(c.key, c)
      }
    }
  }
  return [...vistos.values()]
}

/* EL MISMO PROGRESO, PARTIDO POR PASO.
   `progresoDe` contesta «cuánto de la ficha»; esto contesta «cuánto de cada parte», que es otra
   pregunta y hasta ahora no se podía hacer. Con una ficha a medias —los papeles llegan de manos
   distintas y en semanas distintas— saber que vas por el 34% no sirve de nada; saber que
   Afiliaciones está en cero sí, porque dice a quién hay que ir a pedirle algo.

   CADA CAMPO CUENTA EN UN SOLO PASO, el primero donde aparece. Los cinco archivos salen dos veces
   a propósito —en su sección natural y reunidos en «Archivos»— y son el mismo dato: contados en
   los dos pasos, llenar uno movería dos segmentos y la suma de la cinta no daría nunca la ficha.
   Por eso `vistos` vive FUERA del map y no se reinicia en cada paso. */
export function progresoPorPaso(form, ctx, nivel = 'Completo') {
  const vistos = new Set()

  return tarjetasTodas(form, ctx, nivel).map(({ paso, tarjetas }) => {
    const campos = []
    for (const t of tarjetas) {
      for (const c of t.campos) {
        if (c.tipo === 'rotulo' || c.deducido !== undefined) continue
        if (vistos.has(c.key)) continue
        vistos.add(c.key)
        campos.push(c)
      }
    }
    const puestos = campos.filter(c => lleno(form[c.key])).length

    return {
      key: paso.key,
      n: paso.n,
      titulo: paso.titulo,
      corto: paso.corto || paso.titulo,
      total: campos.length,
      puestos,
      pct: campos.length ? Math.round((puestos / campos.length) * 100) : 0,
    }
  })
}

export function progresoDe(form, ctx, nivel = 'Completo') {
  const campos = escribiblesUnicos(form, ctx, nivel)
  const puestos = campos.filter(c => lleno(form[c.key])).length
  return { total: campos.length, puestos, pct: campos.length ? Math.round((puestos / campos.length) * 100) : 0 }
}

/* CUÁNTO DEL MÍNIMO LEGAL FALTA. Son los campos que alguna entidad exige para poder declarar a
   la persona: sin ellos el alta existe en el sistema y no existe para el Ministerio. Se cuenta
   siempre sobre el mínimo, mire uno el nivel que mire. */
export function faltaLegal(form, ctx) {
  const campos = escribiblesUnicos(form, ctx, 'Mínimo')
  return campos.filter(c => !lleno(form[c.key]))
}

/* QUÉ IMPIDE CREARLO. Tres cosas y ninguna más: sin nombre no hay a quién dar de alta y sin
   fecha de ingreso no hay nada que calcular —antigüedad, vacaciones, bono y finiquito cuelgan de
   ella—. Los otros 31 campos del mínimo legal se avisan y no se bloquean, porque muchos llegan
   después del alta: el NUA lo da la Gestora semanas más tarde y la persona igual tiene que poder
   cobrar. Bloquear ahí sería impedir el alta por un papel que todavía no existe.

   Devuelve el paso donde está el problema además de la frase, para poder llevar hasta él: un
   aviso que dice «falta el apellido» mientras se mira el paso 6 obliga a buscarlo a mano. */
/* LOS TRES, EN UNA SOLA LISTA y no desgranados dentro de tres `if`, que es como estaban: así
   se puede preguntar por todos o por el primero sin escribirlos dos veces, y en un mes las dos
   respuestas siguen diciendo lo mismo.

   `nombre` es cómo se lo llama en una frase corta —«apellido paterno», en minúscula— y `que` es
   la frase suelta del aviso. */
const BLOQUEOS = [
  { key: '1.1',  paso: 'quien',    nombre: 'primer nombre',    que: 'Falta el primer nombre' },
  { key: '1.4',  paso: 'quien',    nombre: 'apellido paterno', que: 'Falta el apellido paterno' },
  { key: '3.25', paso: 'contrato', nombre: 'fecha de ingreso', que: 'Falta la fecha de ingreso' },
]

export function faltaParaCrear(form) {
  return BLOQUEOS.find(b => !(form[b.key] || '').trim()) || null
}
