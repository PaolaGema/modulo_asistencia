import { PASOS_PROPUESTA } from './camposPropuesta'
import { provinciasDe } from './divisionPolitica'
import { nivelesDe, tieneCatalogo } from './territorios'
import { paisPorNombre } from './codigosPais'
import { seccionActiva, propiasDe, todasLasPropias, tarjetaPropia } from './configFicha'

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

/* La nacionalidad boliviana, como se guarda hoy y como se guardaba cuando la lista decía el
   país: un borrador viejo puede traer todavía «Bolivia». */
const BOLIVIANA = ['Boliviana', 'Bolivia']

/* La nacionalidad que figura como principal: «Boliviana» si contestó que sí, la elegida si no. */
const nacionalidadPrincipal = form =>
  form['1.24'] === 'si' ? 'Boliviana' : form['1.24'] === 'no' ? form['1.25'] || '' : ''

/* De qué papel habla la tarjeta de licencias, según el tipo elegido: «de la licencia», «del
   certificado», «del carnet». Sin tipo o con «Otro», ninguno. */
const papelDeLicencia = tipo =>
  !tipo || tipo === 'Otro' ? null
    : tipo.startsWith('Licencia') ? { de: 'de la licencia', num: 'de licencia' }
      : tipo.startsWith('Manipulación') ? { de: 'del carnet', num: 'de carnet' }
        : { de: 'del certificado', num: 'de certificado' }

// Los campos que eligen a una persona del directorio y la enseñan con foto, cargo y área.
// Y quien entrega un equipo, un uniforme, una herramienta, un vehículo o una licencia.
const RESPONSABLES_DE_ENTREGA = ['ra.e11', 'ra.u8', 'ra.h9', 'ra.v9', 'ra.s9']
const PERSONAS_CON_FOTO = ['3.13', '3.15', '3.16', '3.16b', '3.39', ...RESPONSABLES_DE_ENTREGA]

export const PASO_PREVIA = 'previa'

/* Los peldaños del riel y de las pestañas: lo mismo que trae el estudio, sin los campos.
   «Vista previa» no lleva número a propósito —no es un noveno formulario que llenar, es la ficha
   entera leída de corrido antes de crearla— y por eso viene sin `n` desde el conversor. */

/* ── DOS PASOS QUE SÓLO SE VEN EN LOCAL ───────────────────────────────────
   «Perfil profesional» y «Asistencia» son pasos grandes que el equipo sigue trabajando y todavía
   no se enseñan (29 sep 2026): se ven con `npm run dev` y NO en la versión publicada en Vercel.
   El código viaja en el commit igual; lo que cambia es sólo si el paso entra en la lista.

   SE RENUMERA LO QUE QUEDA, para que el riel diga 1, 2, 3… sin huecos en Vercel. Y un enlace con
   `?paso=asistencia` allá cae al primer paso, como cualquier paso que no existe.

   `?.` porque fuera de Vite —los scripts de node que leen este archivo— no hay `import.meta.env`,
   y ahí se enseña todo. */
const SOLO_EN_LOCAL = ['perfil', 'asistencia']
const EN_LOCAL = import.meta.env?.DEV ?? true
// También lo usa Mis documentos: la carpeta «Perfil profesional» sigue la misma regla que el paso.
export const seEnsena = key => EN_LOCAL || !SOLO_EN_LOCAL.includes(key)

/* ── SEIS PESTAÑAS, CADA UNA CON SUS PARTES ──────────────────────────────────
   La organización que pidió el equipo (30 sep 2026): los once pasos del estudio se agrupan en
   seis pestañas sin quitar ninguna sección ni ningún campo. Sólo cambia dónde está cada cosa.
   El riel enseña las pestañas; las partes de la pestaña abierta van arriba del contenido, como
   píldoras.

   CADA PARTE SIGUE SIENDO UN PASO DEL ESTUDIO, con su misma clave: `?paso=contrato` sigue
   abriendo el contrato, y las cuentas, los avisos y la vista previa no se enteran del cambio.

   REMUNERACIÓN Y AFILIACIONES SON UNA SOLA PARTE, «Compensación, Nómina y Afiliaciones»: el haber,
   los beneficios y el pago primero, y después la Gestora, la Caja, el Ministerio y el RC-IVA.
   `JUNTA` dice qué pasos del estudio caen en una parte, en orden. Un enlace viejo a
   `?paso=afiliaciones` abre esa parte — ver `pasoPedido`.

   LA PESTAÑA QUE SE QUEDA SIN PARTES NO SE ENSEÑA: en Vercel Perfil Profesional no tiene nada
   que mostrar, y las demás se renumeran para que el riel diga 1, 2, 3… sin huecos. */
const PESTANAS_BASE = [
  { key: 'personal', titulo: 'Información Personal', pista: 'Sus datos y los de su familia', partes: ['quien', 'entorno'] },
  { key: 'laboral', titulo: 'Información Laboral', pista: 'Su puesto, contrato, pago y afiliaciones', partes: ['puesto', 'contrato', 'remuneracion', 'asistencia'] },
  { key: 'perfil', titulo: 'Perfil Profesional', pista: 'Su formación, trayectoria y habilidades', partes: ['perfil'] },
  { key: 'documentos', titulo: 'Documentación y Expediente Digital', pista: 'Sus papeles, reunidos en un solo lugar', partes: ['expediente'] },
  { key: 'recursos', titulo: 'Recursos y Activos', pista: 'Lo que la empresa le entrega para trabajar', partes: ['recursos'] },
  { key: 'configuracion', titulo: 'Configuración de Colaborador', pista: 'Su usuario y su rol en el sistema', partes: ['sistema'] },
]
/* Los pasos del estudio que forman cada parte, cuando son más de uno. */
const JUNTA = { remuneracion: ['remuneracion', 'afiliaciones'] }
/* El nombre de cada parte dentro de su pestaña, cuando no es el del paso del estudio. */
const PARTE = {
  // Se llama como su pestaña, igual que la 2.1 «Información Laboral» (30 sep 2026).
  quien: { titulo: 'Información Personal', corto: 'Personal' },
  entorno: { titulo: 'Información Familiar', corto: 'Familia' },
  puesto: { titulo: 'Información Laboral', corto: 'Laboral' },
  contrato: { titulo: 'Relación Laboral', corto: 'Contrato' },
  remuneracion: { titulo: 'Compensación, Nómina y Afiliaciones', corto: 'Compensación', pista: 'Haber, beneficios, pago y afiliaciones' },
}
const pasoDelEstudio = key => PASOS_PROPUESTA.find(p => p.key === key)

export const PESTANAS = PESTANAS_BASE
  .map(t => ({ ...t, partes: t.partes.filter(seEnsena) }))
  .filter(t => t.partes.length)
  .map((t, i) => ({ ...t, n: i + 1 }))

/* LOS PASOS, EN EL ORDEN DE LAS PESTAÑAS, y la vista previa al final. Cada uno lleva el número y
   la clave de su pestaña: «Pestaña 2 · Relación Laboral». */
export const PASOS = [
  ...PESTANAS.flatMap(t => t.partes.map(key => {
    const { titulo, corto, pista } = pasoDelEstudio(key)
    return { key, n: t.n, pestana: t.key, titulo, corto, pista, ...PARTE[key] }
  })),
  (({ key, titulo, corto, pista }) => ({ key, n: null, titulo, corto, pista }))(pasoDelEstudio(PASO_PREVIA)),
]

/* La pestaña de un paso, y el paso que abre un enlace: uno viejo a una parte que se juntó con
   otra —`?paso=afiliaciones`— abre la parte que la contiene. */
export const pestanaDe = paso => PESTANAS.find(t => t.partes.includes(paso)) || null
export const pasoPedido = pedido => {
  if (PASOS.some(p => p.key === pedido)) return pedido
  const junto = Object.keys(JUNTA).find(k => JUNTA[k].includes(pedido))
  return junto && PASOS.some(p => p.key === junto) ? junto : PASOS[0].key
}

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

  /* LA PREGUNTA QUE DECIDE SI SE DESPLIEGA UN BLOQUE ENTERO se contesta sola por el caso de
     todos los días, nunca por el excepcional: sin arranque abriría con los dos botones apagados
     —que en esta ficha significa «todavía no contestaron», no «no»—. El documento secundario
     tuvo la suya (1.19) hasta volverse un grupo que arranca en cero, con su botón de agregar. */
  '1.78b': 'no',  // ¿Está suspendida la licencia?

  /* ── Y LA DE DISCAPACIDAD, QUE ES LA MÁS DELICADA DE LAS CUATRO ──────────
     Tiene la misma forma que las de arriba —una pregunta cerrada que decide si se despliegan
     otros campos, con un caso que es el de casi todas las fichas— así que recibe el mismo
     trato: puesta en «No», el tipo y el grado arrancan escondidos y quien sí los necesita
     contesta «Sí» y los abre.

     PERO NO ES UN INTERRUPTOR DE PANTALLA COMO LAS OTRAS TRES. «¿Tiene documento secundario?»
     no se declara ante nadie; ésta cuenta para la cuota del 2 % y es columna de la planilla
     que el Ministerio fiscaliza contra la OVT. Arrancarla en «No» significa que una ficha que
     nadie tocó afirma algo, en vez de dejar el hueco a la vista.

     SE ACEPTA IGUAL, y el precedente es 0.1 —también del mínimo, también obligatoria, también
     con su «No» puesto—: el valor está a la vista, en su propio par de botones, y cambiarlo es
     un clic. Lo que no se puede es que además quede escondido. Si algún día el tipo y el grado
     se llevan la pregunta con ellos detrás de un plegado, esta línea se va. */
  '1.60': 'no',   // ¿Tiene discapacidad?
  '2.29': 'no',   // ¿Presenta discapacidad? (el primer hijo; los demás lo traen de `arranque` en «Agregar otro hijo»)
  '3.43': 'no',   // ¿Aporta a la Gestora? (con «Sí» se abren estado, NUA/CUA, sucursal y tipo de asegurado)
  '3.48': 'no',   // ¿Está jubilado?

  /* Y la del seguro privado, que es la misma forma sin ninguna de las asperezas de la anterior:
     no se declara ante nadie, no cuenta para ninguna cuota, y el caso común es que no lo haya.
     De las cinco preguntas con respuesta de arranque, ésta es la más fácil de justificar. */
  '1.63': 'no',   // ¿Tiene seguro médico privado?

  /* El anticipo de quincena es opcional y poco usado: el caso común es que no lo haya. Arranca
     en No, y con eso el tipo y el valor no aparecen ni se piden. */
  '3.69a': 'no',  // ¿Recibe anticipo de quincena?

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
   pregunta a la vista mientras nadie escribió el vencimiento todavía.

   RECIBE UN LECTOR Y NO LA FICHA: las licencias son un bloque repetible, y cada una tiene que
   leer SU fecha —`suyo('1.77')`—, no la de la primera. */
const licenciaVencida = leer => {
  const vence = leer('1.77')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vence || '')) return false
  return vence < hoyISO()
}

/* LO QUE SE SUSPENDE ES UNA LICENCIA. La de conducir la suspende Tránsito; un certificado de
   antecedentes o de No Violencia no se suspende: vence, o se saca otro. Por eso la pregunta
   «¿Está suspendida?» sólo se hace con una licencia, o con «Otro», que puede serlo. Sin tipo
   elegido tampoco: todavía no se sabe de qué papel se habla. */
const seSuspende = leer => {
  const tipo = leer('1.72')
  return !!tipo && (tipo.startsWith('Licencia') || tipo === 'Otro')
}

const DERIVADOS = {
  '1.7': form => nombreArmado(form),

  /* ── EL NIVEL DE MANDO Y EL TIPO DE CARGO SALEN DEL CARGO ELEGIDO ───────────
     Son del cargo, y el cargo ya los tiene declarados en Organización: preguntarlos otra vez acá
     sería abrir la puerta a que la ficha y el organigrama digan cosas distintas del mismo
     puesto. Se leen de la opción elegida en 3.11; sin cargo, o con un cargo que no los declaró,
     quedan en raya. */
  /* EL CARGO DEL SUPERVISOR ES EL DE LA PERSONA ELEGIDA. Se declaraba calculado y no tenía de
     dónde calcularse: salía siempre en raya. Ahora lo trae del directorio en cuanto se elige al
     supervisor inmediato (3.13). */
  '3.14': (form, suyo, ctx = {}) => {
    const cargo = ctx.datosDePersona?.[form['3.13']]?.cargo || ''
    // Un supervisor sin puesto no es supervisor: quedó elegido de antes y ya no está en la lista.
    return /^sin puesto/i.test(cargo) ? '' : cargo
  },
  '3.11n': (form, suyo, ctx = {}) => (ctx.puestos || []).find(o => o.valor === form['3.11'])?.mando || '',
  '3.11t': (form, suyo, ctx = {}) => (ctx.puestos || []).find(o => o.valor === form['3.11'])?.clase || '',

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
  '1.78': (form, suyo = k => form[k]) => {
    if (licenciaVencida(suyo)) return 'Vencida'
    if (seSuspende(suyo) && suyo('1.78b') === 'si') return 'Suspendida'
    const vence = suyo('1.77')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vence || '')) return ''
    return vence <= sumarDias(hoyISO(), 30) ? 'Por vencer' : 'Vigente'
  },
  /* ── CUÁNTO SE LLEVA REPARTIDO, QUE ERA UNA PROMESA SIN CUENTA ─────────────
     La nota de 2.35 dice «validación: la suma debe dar 100 %» desde que se portó el estudio, y
     no había ni suma ni dónde enseñarla: con un solo beneficiario la regla no tenía contra qué
     correr, y con tres habría que ir sumando de cabeza mientras se escribe.

     DICE LO QUE FALTA Y NO SÓLO SI ESTÁ MAL. «70 % · falta 30 %» es accionable; «la suma no da
     100» obliga a restar. Y cuando sobra lo dice igual, que es el error más fácil de cometer
     escribiendo 50, 50 y 50.

     NO REPARTE SOLO. Poner 33/33/34 de arranque sería exactamente lo que esta ficha evita en
     otros seis sitios: un valor puesto es un valor que nadie mira, y acá lo que nadie miraría
     es cuánto se lleva cada heredero. Se cuenta y se enseña; repartir lo hace quien firma.

     VACÍO MIENTRAS NADIE ESCRIBIÓ NADA, para no abrir la tarjeta con un «0 % · falta 100 %»
     regañando a quien todavía no llegó al campo. */
  '2.35t': form => repartoDe(form).texto,

  /* Ingreso + 89 días. El periodo de prueba es de 90 y a los 90 + 1 nacen los beneficios
     sociales, así que la alerta tiene que llegar antes. */
  '3.37': form => fechaCorta(sumarDias(form['3.25'], 89)),

  /* ── PERFIL PROFESIONAL ───────────────────────────────────────────────────
     Los dos primeros viven dentro de un bloque que se repite, así que leen con `suyo`: la
     fecha de SU experiencia y el vencimiento de SU certificación, no los de la primera. */

  /* De la fecha de ingreso a la de salida, en años y meses. Sin las dos no hay cuenta: un
     empleo anterior sin fecha de salida no es «hasta hoy», es un dato que falta. */
  'pf.17': (form, suyo) => {
    const a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(suyo('pf.15') || '')
    const b = /^(\d{4})-(\d{2})-(\d{2})$/.exec(suyo('pf.16') || '')
    if (!a || !b) return ''
    let meses = (+b[1] - +a[1]) * 12 + (+b[2] - +a[2]) - (+b[3] < +a[3] ? 1 : 0)
    if (meses < 0) return 'La salida es anterior al ingreso'
    const anios = Math.floor(meses / 12)
    meses %= 12
    const partes = [
      anios && `${anios} año${anios === 1 ? '' : 's'}`,
      meses && `${meses} mes${meses === 1 ? '' : 'es'}`,
    ].filter(Boolean)
    return partes.length ? partes.join(' y ') : 'Menos de un mes'
  },
  /* La misma lectura que el estado de una licencia (1.78), con el mismo aviso de 30 días. Una
     certificación sin vencimiento es lo normal —un título no caduca— y se dice, en vez de
     dejar la raya que parece un olvido. */
  'pf.26': (form, suyo) => {
    const vence = suyo('pf.25')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vence || '')) return suyo('pf.21') ? 'Sin vencimiento' : ''
    if (vence < hoyISO()) return 'Vencida'
    return vence <= sumarDias(hoyISO(), 30) ? 'Por vencer' : 'Vigente'
  },
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
     trae de su registro anterior —sus documentos—. Sin reingreso no hay
     registro anterior del que traer nada, así que no hay nada que preguntar. */
  '0.2': form => form['0.1'] === 'si',
  '0.3': form => form['0.1'] === 'si',
  '0.4': form => form['0.1'] === 'si',

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

     LA DEL DOCUMENTO SECUNDARIO MIRA SU PROPIA COPIA: con dos documentos secundarios, «Otro»
     en el segundo abre la caja del segundo y no la del primero. */
  '1.10b': form => form['1.10'] === 'Otro',
  '1.20i': (form, suyo) => suyo('1.20a') === 'Otro',
  /* Y la misma caja en el documento de cada persona de la familia (29 sep 2026): cónyuge, cada
     hijo, cada beneficiario y el garante. Tenían «Otro» en la lista y ningún sitio donde decir
     cuál, así que guardaban la palabra «Otro». Los repetidos miran su propia copia. */
  '2.10o': (form, suyo) => suyo('2.10') === 'Otro',
  '3.90o': form => form['3.90'] === 'Otro',
  '2.21o': (form, suyo) => suyo('2.21') === 'Otro',
  '2.33o': (form, suyo) => suyo('2.33') === 'Otro',
  '2.40o': (form, suyo) => suyo('2.40') === 'Otro',
  // La garantía que la lista no nombra, con su caja: la misma válvula que el documento.
  // El cónyuge del garante casado: la garantía es compartida.
  '2.44a': form => form['2.44'] === 'Casado(a)',
  '2.44b': form => form['2.44'] === 'Casado(a)',
  '2.45o': form => form['2.45'] === 'Otro',

  /* Y en lo que la empresa entrega (30 sep 2026): el tipo de equipo, su categoría, el uniforme,
     el EPP, el vehículo y el tipo de licencia tenían «Otro» sin sitio para decir cuál. Cada cosa
     entregada es su propia copia, así que cada caja mira la lista de su bloque. */
  'ra.e1o': (form, suyo) => suyo('ra.e1') === 'Otro',
  'ra.e2o': (form, suyo) => suyo('ra.e2') === 'Otro',
  'ra.u1o': (form, suyo) => suyo('ra.u1') === 'Otro',
  'ra.p1o': (form, suyo) => suyo('ra.p1') === 'Otro',
  'ra.v1o': (form, suyo) => suyo('ra.v1') === 'Otro',
  'ra.s2o': (form, suyo) => suyo('ra.s2') === 'Otro',

  /* LA NACIONALIDAD SOLO SE PREGUNTA A QUIEN DIJO QUE NO ES BOLIVIANA. Con «Sí» ya está
     contestada, y enseñar el campo con «Boliviana» dentro era repetir la respuesta de al lado.
     Sin contestar todavía, tampoco: no se sabe si hace falta. */
  '1.25': form => form['1.24'] === 'no',

  /* La tercera de la misma familia: el tipo de licencia dejó de ser texto libre para poder
     agrupar los avisos de vencimiento, y «Otro» es su válvula. Sin la caja, todo lo que la
     lista no nombra cae en un único montón llamado «Otro» — que para un aviso que se manda
     por tipo es peor que el texto libre que vino a reemplazar. */
  '1.72b': (form, suyo) => suyo('1.72') === 'Otro',

  /* LA CATEGORÍA ES DE LA LICENCIA DE CONDUCIR —A, B, C, P, M, T— y de nada más: un certificado de
     antecedentes o un carnet de sanidad no tienen categoría, y enseñar el campo con su chip
     LEGAL daba a entender que había que llenarlo. */
  '1.74': (form, suyo) => suyo('1.72') === 'Licencia de conducir',

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
  '1.78b': (form, suyo) => seSuspende(suyo) && !licenciaVencida(suyo),

  /* EL DOCUMENTO SECUNDARIO YA NO CUELGA DE UNA RESPUESTA: es un grupo que arranca en cero, y
     sin copias no hay bloque que esconder —ni campos que cuenten para el progreso—. Ver
     MINIMO_COPIAS. */

  /* La extensión y el complemento del segundo documento repiten la regla del primero encima de
     la suya: hace falta que haya segundo documento, Y que sea un carnet, Y que lo emita Bolivia.
     Un pasaporte argentino no lleva extensión departamental por mucho que sea el documento dos. */
  /* NO TODOS LOS PAÍSES TIENEN ESCALÓN DE EN MEDIO. Colombia va de departamento a municipio sin
     nada entre medias, y preguntarle una provincia a alguien de Medellín es pedirle un dato que
     su país no tiene. Se esconde igual que la extensión de un documento que no es boliviano. */
  '1.44': form => Boolean(nivelesDe(form['1.42']).menor),

  /* EL TIPO Y GRADO SÓLO SI HAY DISCAPACIDAD QUE DETALLAR. Sin esto la caja estaba siempre
     abierta, y en el 97 % de las fichas era un hueco que no se puede llenar sin inventar. La
     pregunta de al lado (1.60) es la del mínimo legal y sigue estando siempre. */
  '1.61': form => form['1.60'] === 'si',
  '1.61b': form => form['1.60'] === 'si',
  // Y los mismos dos para cada hijo, mirando la respuesta de SU bloque y no la del primero.
  '2.29a': (form, suyo) => suyo('2.29') === 'si',
  '2.29b': (form, suyo) => suyo('2.29') === 'si',

  /* LOS DETALLES DE LA TARJETA MÉDICA. Los rótulos decían «+ detalle» desde que se portó el
     estudio y detrás no había más que un Sí/No: la ficha preguntaba si hay algo y no dejaba
     decir qué. Van apareciendo al contestar que sí, uno por pregunta. */
  '1.56b': form => form['1.56'] === 'si',
  '1.57b': form => form['1.57'] === 'si',
  '1.58b': form => form['1.58'] === 'si',
  '1.59b': form => form['1.59'] === 'si',

  /* ── LA GESTORA, ENTERA, DETRÁS DE SU PREGUNTA ────────────────────────────────────
     Dicho que no aporta, los cuatro datos de la Gestora no tienen nada que describir:
     «Administradora / Estado de la afiliación» pierde sentido —sólo existe una administradora y
     lo que el campo dice hoy es en qué etapa va el trámite, y no hay trámite—, y el NUA/CUA, la
     sucursal y el tipo de asegurado dejan de ser exigibles.

     LO QUE PASA AGUAS ABAJO, que es por lo que esto importa más de lo que parece. Un «no» acá no
     es un hueco, es un dato que cinco sitios necesitan leer:

       · PLANILLA MENSUAL — no se calcula el 12,71 % de descuento ni el 7,21 % de costo
         patronal. La columna de aporte va en CERO, no vacía: el formato del Ministerio la exige.
       · DECLARACIÓN DEL SIP — la persona no aparece. Es una exclusión de la fila completa.
       · DECLARACIÓN DEL ANS — tampoco aparece. Y ese archivo sólo lleva a quienes superan el
         umbral: en una planilla real, de 94 personas en el SIP sólo 5 estaban en el ANS. Si no
         califica nadie, el archivo no se genera.
       · COLUMNA «¿APORTA A LA AFP?» DEL MINISTERIO — va en 0. Pero la persona SIGUE apareciendo
         en la planilla del Ministerio si su contrato la obliga a estar ahí: no aportar a
         pensiones no la saca de la declaración laboral.

     POR ESO LA PREGUNTA NO SE ESCONDE NUNCA, aunque se escondan sus cuatro campos. Un cero y un
     vacío se declaran distinto, y quien genere la planilla tiene que poder distinguir «contestó
     que no» de «nadie lo contestó». Esconder la pregunta convertiría lo primero en lo segundo.

     Y «¿ESTÁ JUBILADO?» (3.48) SE QUEDA FUERA DE LA LLAVE a propósito: es un estado de la
     persona, no un dato de su afiliación, y justamente un jubilado que sigue trabajando es de
     los que pueden contestar que no aportan. Esconderlo detrás del «sí» dejaría sin preguntar
     el caso que más lo necesita. */
  '3.44': form => form['3.43'] === 'si',
  '3.45': form => form['3.43'] === 'si',
  '3.46': form => form['3.43'] === 'si',
  '3.47': form => form['3.43'] === 'si',

  /* ── EL ANTICIPO DE QUINCENA ─────────────────────────────────────────────
     Tipo y valor solo existen si hay anticipo. Son DOS campos y no uno: el número solo tiene
     sentido leído junto a su tipo, y en una sola casilla cambiar de «porcentaje» a «monto fijo»
     sin tocar el número adelantaba Bs 50 en vez del 50 %. */
  /* ── A QUIÉN LLAMAR POR UNA REFERENCIA ───────────────────────────────────
     Solo si esa experiencia tiene una referencia disponible, y se mira la respuesta de SU copia:
     la segunda experiencia puede tener referencia aunque la primera no. */
  'pf.20a': (_, suya) => suya('pf.20') === 'si',
  'pf.20b': (_, suya) => suya('pf.20') === 'si',
  'pf.20c': (_, suya) => suya('pf.20') === 'si',

  '3.69b': form => form['3.69a'] === 'si',
  '3.69c': form => form['3.69a'] === 'si',

  /* La fecha de jubilación, sólo si hay jubilación. */
  '3.48b': form => form['3.48'] === 'si',

  /* ── LA CAJA DE SALUD, ENTERA, DETRÁS DE SU PREGUNTA ──────────────────────────────
     Los cuatro datos de la Caja —cuál, número de asegurado, sucursal y fecha de expedición—
     sólo existen si la persona se afilia. Dicho que no, eran cuatro campos a la vista que no se
     pueden llenar sin inventar, y dos de ellos desplegables que ofrecen elegir algo que no
     corresponde.

     LA PREGUNTA SE QUEDA SIEMPRE, que es la diferencia entre esconder y no preguntar: «no
     aplica» es una respuesta que la ficha necesita tener escrita —el plazo de cinco días desde
     el ingreso se fiscaliza— y no un vacío. */
  '3.50': form => form['3.49'] === 'si',
  '3.51': form => form['3.49'] === 'si',
  '3.52': form => form['3.49'] === 'si',
  '3.53': form => form['3.49'] === 'si',

  /* DE QUIÉN ES TUTOR, Y EL NOMBRE CUANDO NO ES NINGUNO DE LOS OFRECIDOS. */
  '1.62b': form => form['1.62'] === 'si',

  /* EL SEGURO PRIVADO Y SUS DOS DATOS. Sin esto, quien no tiene seguro privado —la mayoría—
     miraba dos cajas que no se pueden llenar sin inventar. */
  '1.64': form => form['1.63'] === 'si',
  '1.65': form => form['1.63'] === 'si',

  /* La caja del parentesco que la lista no contempla. Sin esto, «Otro» sería una respuesta que no
     responde nada — y es un campo del mínimo legal. */
  '2.2b': (form, suyo) => suyo('2.2') === 'Otro',
  /* Y la del heredero, que pregunta lo mismo con la misma lista. Acá «Otro» sin caja sería peor
     todavía: lo que queda sin nombre es la relación de quien cobra la indemnización.

     MIRA SU PROPIA COPIA Y NO LA PRIMERA: el bloque se repite hasta tres veces y cada
     beneficiario contesta su relación. Es la única condición de la ficha que lo necesita
     —ver `enSuCopia`— y por eso es la única con dos argumentos. */
  '2.32b': (form, suyo) => suyo('2.32') === 'Otro',

  '1.20c': (form, suyo) => suyo('1.20a') === 'Documento nacional de identidad' && suyo('1.20g') === 'Bolivia',
  '1.20d': (form, suyo) => suyo('1.20a') === 'Documento nacional de identidad' && suyo('1.20g') === 'Bolivia',

  /* SE PROBÓ CONDICIONAR «APELLIDO DE CASADA» a que el sexo fuera femenino, y se sacó a pedido:
     el campo vuelve a mostrarse siempre. Queda anotado porque el problema que lo motivó sigue
     ahí —hoy se le pide el apellido de casada a un hombre y a una soltera— y porque la regla,
     si algún día se retoma, es una línea:

         '1.6': form => form['1.27'] === 'F · Femenino',

     Y con una advertencia que costó encontrar: NO atarlo también a «Casado(a)». Una divorciada
     o una viuda puede conservarlo legalmente y su carnet lo sigue diciendo, así que esa
     condición lo escondería justo a quien lo tiene en el documento. */}

/* EL ESTUDIO TRAE DOS CONDICIONES MÁS Y NO ESTÁN PORTADAS TODAVÍA, a propósito:

     3.36  fecha de finalización, sólo si el contrato tiene plazo (depende de 3.32)
     3.117 marcación virtual, sólo si la modalidad no es 100 % presencial (depende de 3.42b)

   Son portables tal cual y entran cuando se trabaje el paso «Relación laboral». (3.26 y 3.27, las otras
   fechas de ingreso, se retiraron el 29 sep 2026; 3.41, el motivo de retiro, también.) */

/* Qué ranura territorial es cada clave del estudio. Acá y no en el campo porque es una relación
   entre tres campos, y un campo no puede saber qué lugar ocupa en una escalera. */
const TERRITORIO = { '1.43': 'mayor', '1.44': 'menor', '1.45': 'local' }

/* ── LEER UN CAMPO DE LA MISMA COPIA ──────────────────────────────────────
   Una condición recibe la ficha entera y una clave base le devuelve SIEMPRE la primera copia:
   `form['2.32']` es la relación del beneficiario uno, esté quien esté preguntando. Mientras
   ninguna regla vivió dentro de un bloque repetido eso daba igual, y así estaba escrito acá
   arriba —«lo que todavía no se puede es condicionar un campo al valor de OTRO campo de su
   misma copia»—.

   YA HACE FALTA. «¿Qué relación?» (2.32b) aparece cuando la relación de al lado dice «Otro», y
   con tres beneficiarios la de al lado es la suya, no la del primero. Sin esto, marcar «Otro»
   en el beneficiario dos abría la caja en los tres, o en ninguno.

   ES UN SEGUNDO ARGUMENTO Y NO UN CAMBIO DE FORMA: las quince condiciones que ya existen siguen
   recibiendo la ficha en el primero y no se enteran. La que necesita su copia pide `suyo`. */
const enSuCopia = (form, instancia) => base =>
  form[!instancia || instancia === 1 ? base : base + '#' + instancia]

const seVe = (campo, form) => {
  const k = claveBase(campo.key)
  return !CONDICIONES[k] || CONDICIONES[k](form, enSuCopia(form, campo.instancia))
}

/* ── Las listas que dependen de esta empresa ──────────────────────────────
   El estudio trae catálogos de ejemplo para todo lo que sale de la estructura —sucursales,
   unidades, cargos, jefes—. Acá se reemplazan por los de verdad: los que el usuario cargó en
   Organización. Es la única parte del estudio que NO se puede portar tal cual, porque no habla
   de la ley sino de esta empresa en particular. */
const opcionesDeEstructura = (key, ctx, form = {}) => {
  const {
    puestos = [], unidades = [], sucursales = [], personas = [], empresa = null, grupo = [],
    negocios = [], regiones = [], centros = [],
  } = ctx

  /* ── UN SELECTOR SE ENCADENA AL DE ARRIBA ─────────────────────────────────
     Era la promesa escrita en la nota del campo que se acaba de retirar —«al elegir, solo deben
     habilitarse los cargos que le pertenecen»— y ninguna línea la cumplía: los nueve
     desplegables ofrecían el árbol entero cada uno, así que se podía elegir una unidad de La Paz
     y un centro de trabajo de Santa Cruz sin que nada chistara.

     SE FILTRA POR LA RESPUESTA MÁS ESPECÍFICA QUE YA HAYA, no por todas: quien contestó región y
     sucursal quiere los centros de esa sucursal, y la región ya no aporta nada. Las claves llegan
     de la más general a la más concreta y se toma la última contestada.

     SI NADIE CONTESTÓ ARRIBA, NO SE FILTRA. Rellenar de abajo hacia arriba es legítimo —el papel
     que se tiene delante dice el cargo y no el área— y un desplegable vacío hasta contestar otra
     cosa obliga a adivinar cuál. */
  const bajoDe = (lista, ...claves) => {
    const padre = claves.map(k => form[k]).filter(Boolean).pop()
    if (!padre) return lista
    return lista.filter(o => o.ancestros?.includes(padre))
  }

  /* ── Y LAS DOS CADENAS SE CRUZAN EN EL LUGAR ──────────────────────────────
     Región → sucursal → centro es una escalera y unidad de negocio → unidad → cargo es otra: una
     unidad no cuelga de una sucursal. Pero sus sillas sí están en alguna, así que el lugar que ya
     se contestó recorta las unidades y los cargos a los que tienen gente ahí.

     EN LOS DOS SENTIDOS. Quien eligió «Santa Cruz» quiere también las sillas de sus centros —el
     lugar elegido está en los `lugares` de la silla—; quien eligió el centro «Planta Norte» quiere
     también las sillas declaradas en su sucursal a secas —la sede de la silla está encima del
     centro elegido—. Una opción sin `lugares` vale para toda la empresa y pasa siempre. */
  const lugarElegido = () => {
    const clave = ['3.7', '3.8', '3.10'].filter(k => form[k]).pop()
    if (!clave) return null
    const fuente = { '3.7': regiones, '3.8': sucursales, '3.10': centros }[clave]
    return fuente.find(o => o.valor === form[clave]) || { valor: form[clave] }
  }
  const enLugar = lista => {
    const elegido = lugarElegido()
    if (!elegido) return lista
    const lugar = elegido.valor
    const encima = elegido.ancestros || []
    return lista.filter(o => !o.lugares || o.lugares.includes(lugar)
      || o.sedes?.some(s => encima.includes(s)))
  }

  /* ── EL NEGOCIO, SÓLO CUANDO HAY CONEXIÓN ─────────────────────────────────
     La unidad de negocio no es un peldaño de nadie: la DECLARAN los lugares y las unidades. Así
     que el lugar elegido la recorta a las que tocan ese lugar —Santa Cruz es de Farmacias—, y si
     el lugar no toca ninguna, no se recorta nada: ofrecer una lista vacía sería decir que ahí no
     cabe nadie, cuando lo que pasa es que nadie lo declaró.

     Y HACIA ABAJO, lo mismo: elegido el negocio, quedan las unidades y los cargos que le
     pertenecen —por declaración, por sus sillas o porque cuelgan de él— y los transversales, que
     no son de ninguno y por eso caben en todos. Antes se pedía colgar del negocio y nada colgaba:
     elegir «Farmacias» dejaba la lista de unidades vacía. */
  const deNegocio = lista => {
    const n = form['3.3']
    if (!n) return lista
    return lista.filter(o => !o.negocios || o.negocios.includes(n) || o.ancestros?.includes(n))
  }
  const negociosDelLugar = () => {
    const ns = lugarElegido()?.negocios
    return ns?.length ? negocios.filter(o => ns.includes(o.valor)) : negocios
  }

  switch (key) {
    /* DE QUÉ EMPRESA DEL GRUPO VIENE. Era una caja de texto libre porque el estudio no trae
       catálogo para esto —no puede: depende de cada empresa, no de la ley— y sin lista, tres
       personas escriben el mismo nombre de tres maneras y después nadie cruza nada. Sale de
       `empresasGrupo`, igual que las sucursales salen de Organización. */
    case '0.2': return grupo.length ? grupo.map(e => e.nombre) : null
    case '3.2': return empresa?.nombre ? [empresa.nombre] : null
    /* LOS OTROS PELDAÑOS DEL ÁRBOL, por la misma razón que las unidades: la unidad de
       negocio, la región y el centro de trabajo son niveles del organigrama de ESTA empresa, y
       el estudio solo puede traer ejemplos. Sin ninguno cargado se devuelve null y el campo se
       queda con el catálogo de ejemplo, que es lo que ya hacían los otros cuatro. */
    case '3.3': return negocios.length ? negociosDelLugar() : null
    case '3.5': return unidades.length ? enLugar(deNegocio(unidades)) : null
    case '3.7': return regiones.length ? regiones : null
    case '3.8': return sucursales.length ? bajoDe(sucursales, '3.7') : null
    case '3.10': return centros.length ? bajoDe(centros, '3.7', '3.8') : null
    /* Con la unidad elegida manda la unidad, que es más concreta; sin ella, el negocio. */
    case '3.11': return puestos.length
      ? enLugar(form['3.5'] ? bajoDe(puestos, '3.5') : deNegocio(puestos)) : null
    // Supervisor, aprobadores y quien autorizó la contratación salen del directorio.
    case '3.13': case '3.15': case '3.16': case '3.16b': case '3.39':
    case 'ra.e11': case 'ra.u8': case 'ra.h9': case 'ra.v9': case 'ra.s9':
      return personas.length ? personas : null
    /* EN QUÉ UNIDAD LO SUPERVISA: todas las unidades de la empresa, sin recortar por la sede ni
       el negocio de la persona. La supervisión funcional existe justamente para cruzar áreas. */
    case '3.15u': return unidades.length ? unidades : null
    default: return null
  }
}

/* ── DECIR POR QUÉ UNA LISTA VIENE CORTA ─────────────────────────────────
   El filtro encadenado tiene un costo: elegida una sucursal, la lista de centros puede quedar
   vacía —esa sucursal no tiene ninguno— y el campo se ve igual que uno roto. Quien armó la
   estructura lo entiende; quien da de alta a alguien no tiene por qué saber que la lista depende
   de lo de arriba.

   ASÍ QUE LA LISTA LO DICE, en dos sitios según el caso:
     · VACÍA: el propio campo lo dice sin abrirlo —«No hay centros de trabajo en Sucursal
       Sopocachi»— y al abrirlo, qué hacer. Si el campo es opcional, que puede quedar vacío; si es
       obligatorio, dónde se arregla, porque ahí sí está trabado.
     · RECORTADA: al abrirla, una línea arriba avisa que no es la lista entera. Es la que evita
       buscar un cargo que existe y concluir que no.

   SE COMPARA CONTRA LA LISTA SIN FILTRAR y no se deduce de qué campos están llenos: una sucursal
   elegida que no recorta nada —la Casa Matriz, que no es de ningún negocio— no tiene nada que
   explicar, y un aviso que aparece siempre se deja de leer. */
const QUE_SE_LISTA = {
  '3.3': 'unidades de negocio',
  '3.5': 'unidades organizacionales',
  '3.8': 'sucursales',
  '3.10': 'centros de trabajo',
  '3.11': 'cargos',
}
/* Qué campos de arriba pueden recortar a cada uno, separados por eje: el del lugar se lee «en» y
   el de la organización «de». De cada eje cuenta el más concreto contestado, que es el que filtró. */
const RECORTAN = {
  '3.3': { lugar: ['3.7', '3.8', '3.10'], org: [] },
  '3.5': { lugar: ['3.7', '3.8', '3.10'], org: ['3.3'] },
  '3.8': { lugar: ['3.7'], org: [] },
  '3.10': { lugar: ['3.7', '3.8'], org: [] },
  '3.11': { lugar: ['3.7', '3.8', '3.10'], org: ['3.3', '3.5'] },
}

function avisoDeRecorte(key, ops, ctx, form) {
  const que = QUE_SE_LISTA[key]
  if (!que) return null
  const entera = opcionesDeEstructura(key, ctx, {}) || []
  if (ops.length >= entera.length) return null

  const ultimo = claves => claves.map(k => form[k]).filter(Boolean).pop()
  const lugar = ultimo(RECORTAN[key].lugar)
  const org = ultimo(RECORTAN[key].org)
  const cuales = [org && `de ${org}`, lugar && `en ${lugar}`].filter(Boolean).join(' ')

  /* UNA SUCURSAL SIN CENTROS NO ESTÁ INCOMPLETA: es lo normal. El centro es para la sucursal que
     tiene varios sitios dentro —una oficina y un almacén—; en la mayoría la sucursal misma es
     donde se trabaja. «No hay centros en Sopocachi» sonaba a que faltaba cargar algo, así que acá
     se dice lo que de verdad pasa. Sólo con la sucursal elegida: con una región a secas, «trabaja
     en la sucursal misma» no tendría sucursal a la que referirse. */
  if (!ops.length && key === '3.10' && form['3.8'] && lugar === form['3.8']) {
    return {
      ph: `${lugar} no tiene centros de trabajo`,
      notaLista: 'La persona trabaja en la sucursal misma: puede dejar este campo vacío.',
    }
  }

  if (!ops.length) {
    const campo = PASOS_PROPUESTA.flatMap(p => p.tarjetas).flatMap(t => t.campos).find(x => x.key === key)
    return {
      ph: `No hay ${que} ${cuales}`,
      notaLista: campo?.requerido
        ? `Es obligatorio: cambie lo elegido arriba, o complete la estructura en Organización › Estructura.`
        : `No hay ${que} ${cuales}. Puede dejar este campo vacío.`,
    }
  }
  return { notaLista: `Solo se muestran ${que} ${cuales}.` }
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

/* ── LOS GRUPOS QUE PUEDEN QUEDAR EN CERO ─────────────────────────────────
   Un hijo vacío en pantalla es el mínimo que invita a declarar; un documento secundario vacío
   es un bloque de ocho campos para algo que casi nadie tiene. El grupo que no figura acá arranca
   en uno, como siempre. `LEGADO` cuenta lo que se contestó antes de que el grupo existiera: el
   documento secundario se abría con «¿Tiene documento secundario?» (1.19), y quien dijo que sí
   tiene su documento en las claves del primero. También cuenta si ya hay algo escrito en ellas:
   el reingreso trae el escaneo (1.20h) sin la cuenta, y sin esto llegaría a un bloque invisible. */
/* Lo que se entrega en Recursos y activos también arranca en cero: casi nadie recibe a la vez
   un vehículo, un EPP y una licencia, y cada cosa entregada se agrega con su botón. */
const MINIMO_COPIAS = { docsec: 0, docsExtra: 0, equipos: 0, uniformes: 0, epp: 0, herrActivos: 0, vehiculos: 0, software: 0 }
const LEGADO = {
  emergencia: form => (form['2.seg'] === 'si' ? 2 : 1),
  docsec: form => (form['1.19'] === 'si' || ['1.20a', '1.20b', '1.20h'].some(k => form[k]) ? 1 : 0),
}
export const minimoDe = grupo => MINIMO_COPIAS[grupo] ?? 1
export const cuantosHay = (form, grupo) => {
  const min = minimoDe(grupo)
  const guardado = form[CUENTA(grupo)]
  if (guardado === undefined || guardado === '') return Math.max(min, LEGADO[grupo]?.(form) ?? min)
  return Math.max(min, Number(guardado) || 0)
}
export const claveDeCuenta = CUENTA

/* ── UNA FICHA GUARDADA CON LAS CLAVES DE ANTES ───────────────────────────
   El segundo contacto de emergencia vivía en claves «-2» —`2.1-2`, `2.3-2`…— detrás de la
   pregunta «¿Agregar un segundo contacto?» (`2.seg`). Hoy es la copia dos de un grupo, `2.1#2`.
   Se pasa al leer, y solo si la copia nueva no tiene nada todavía: una vez que alguien escribió
   en ella —o la quitó, que la deja en blanco y no sin clave— lo viejo ya no manda. `LEGADO`
   pone la cuenta en dos. */
const CLAVES_DEL_SEGUNDO = ['2.1', '2.2', '2.2b', '2.3', '2.4', '2.5', '2.6', '2.7']
export function alDia(form) {
  if (form['2.seg'] !== 'si') return form
  const fuera = { ...form }
  for (const k of CLAVES_DEL_SEGUNDO) {
    if (fuera[k + '#2'] === undefined && form[k + '-2'] !== undefined) fuera[k + '#2'] = form[k + '-2']
  }
  return fuera
}

/* ── TODA LA GENTE QUE LA FICHA YA CONOCE, AGRUPADA ──────────────────────
   Es la lista de «¿De quién es tutor?»: los hijos, el cónyuge y los contactos de emergencia que
   ya se escribieron en el paso, cada grupo con su título, que es de dónde sale cada persona. Se
   marca con casillas y se puede marcar a más de una: se puede ser tutor de dos hijos, o de un
   hijo y de un padre mayor.

   SE OFRECEN TODOS Y NO SÓLO LOS QUE TIENEN LA DISCAPACIDAD DECLARADA. Filtrar parecía lo
   riguroso y en pantalla era una lista vacía para quien todavía no había contestado ese campo.
   Lo que sí se hace es enseñarla: el hijo con discapacidad declarada lleva su tipo y su grado al
   lado del nombre, que es lo que ayuda a elegir.

   CON NOMBRE PUESTO Y SIN REPETIDOS: un bloque de hijo vacío no es nadie, y la misma persona
   escrita como contacto y como cónyuge sale una vez, en el primer grupo donde aparece.

   Y LA SALIDA ES «OTRA PERSONA»: se puede ser tutor de un hermano o de alguien que no está en la
   ficha, y entonces se registra ahí mismo (1.62c a 1.62f). */
export const OTRA_PERSONA = 'Otra persona'
// Los seis tipos y los cuatro grados del artículo 5 de la Ley 223, los mismos de 1.61 y 2.29a/b.
export const TIPOS_DISCAPACIDAD = ['Física o motora', 'Visual', 'Auditiva', 'Intelectual', 'Mental o psíquica', 'Múltiple']
export const GRADOS_DISCAPACIDAD = ['Leve', 'Moderada', 'Grave', 'Muy grave']
/* EL TIPO Y EL GRADO DE CADA PERSONA MARCADA A MANO se guardan en 1.62t, un mapa por nombre:
   { 'Ernesto Rojas Saucedo': { tipo: 'Visual', grado: 'Leve' } }. Los de un hijo con
   discapacidad declarada no: se leen de su bloque (2.29a y 2.29b). */
export const DISC_TUTELA = '1.62t'
/* LAS OTRAS PERSONAS —las que no están en la ficha— se escriben dentro de la lista, una fila cada
   una, y se guardan en 1.62o como una lista: [{ nombre, relacion, tipo, grado }]. Puede haber
   varias: se puede ser tutor de un hermano y de un sobrino a la vez.

   ANTES HABÍA UNA SOLA, en 1.62c a 1.62f con la marca «Otra persona» en 1.62b. Una ficha guardada
   así se sigue leyendo: `otrasDeTutela` la trae como la primera de la lista. */
export const OTRAS_TUTELA = '1.62o'
export function otrasDeTutela(form) {
  if (Array.isArray(form[OTRAS_TUTELA])) return form[OTRAS_TUTELA]
  if (!marcadosDeTutela(form['1.62b']).includes(OTRA_PERSONA)) return []
  return [{ nombre: form['1.62c'] || '', relacion: form['1.62d'] || '', tipo: form['1.62e'] || '', grado: form['1.62f'] || '' }]
}
export const RELACIONES_TUTELA = ['Madre', 'Padre', 'Cónyuge', 'Conviviente', 'Hijo(a)', 'Hermano(a)', 'Abuelo(a)']
export const SEP_TUTELA = ' · '
// Lo que se guarda en 1.62b: los nombres marcados, separados por « · ». Así se lee tal cual.
export const marcadosDeTutela = v => String(v || '').split(SEP_TUTELA).map(x => x.trim()).filter(Boolean)

/* QUIÉNES ESTÁN BAJO SU TUTELA, DE VERDAD: los hijos con discapacidad declarada —marcados solos—,
   los que se marcaron a mano y siguen en la ficha, y la otra persona si se registró. Es lo que
   se lee en la vista previa; en 1.62b se guardan sólo las marcas hechas a mano. */
export function bajoTutela(form) {
  const personas = gruposDeTutela(form).flatMap(g => g.personas)
  const marcados = marcadosDeTutela(form['1.62b'])
  const discs = form[DISC_TUTELA] || {}
  /* Cada nombre con su discapacidad entre paréntesis, si se sabe: «Ernesto Rojas (visual, leve)». */
  const conDisc = (nombre, tipo, grado) => {
    const d = [tipo, grado].filter(Boolean).join(', ').toLowerCase()
    return d ? `${nombre} (${d})` : nombre
  }
  const nombres = personas
    .filter(p => p.fija || marcados.includes(p.nombre))
    .map(p => (p.fija ? conDisc(p.nombre, p.tipo, p.grado) : conDisc(p.nombre, discs[p.nombre]?.tipo, discs[p.nombre]?.grado)))
  for (const o of otrasDeTutela(form)) {
    const nombre = String(o.nombre || '').trim()
    if (nombre || o.tipo) nombres.push(conDisc(nombre || OTRA_PERSONA, o.tipo, o.grado))
  }
  return nombres
}

export function gruposDeTutela(form) {
  const limpio = k => String(form[k] || '').trim()
  const copia = (base, n) => (n === 1 ? base : base + '#' + n)
  const vistos = new Set()
  const grupo = (titulo, personas) => ({
    titulo,
    personas: personas.filter(x => x.nombre && !vistos.has(x.nombre) && vistos.add(x.nombre)),
  })

  const hijos = []
  for (let n = 1; n <= cuantosHay(form, 'hijos'); n += 1) {
    const sexo = limpio(copia('2.23', n))
    const tipo = limpio(copia('2.29a', n))
    const grado = limpio(copia('2.29b', n)).toLowerCase()
    hijos.push({
      tipo,
      grado: limpio(copia('2.29b', n)),
      nombre: limpio(copia('2.20', n)),
      relacion: sexo.startsWith('F') ? 'Hija' : sexo.startsWith('M') ? 'Hijo' : 'Hijo(a)',
      discapacidad: form[copia('2.29', n)] === 'si' ? ([tipo, grado].filter(Boolean).join(' · ') || 'Discapacidad declarada') : '',
      /* EL HIJO CON DISCAPACIDAD DECLARADA VA MARCADO Y NO SE DESMARCA ACÁ: ya se dijo arriba, en
         su propio bloque, y dos respuestas a la misma pregunta pueden contradecirse. Si cambia,
         se cambia en «Datos de los hijos». */
      fija: form[copia('2.29', n)] === 'si',
    })
  }

  const contactos = []
  for (let n = 1; n <= cuantosHay(form, 'emergencia'); n += 1) {
    contactos.push({ nombre: limpio(copia('2.1', n)), relacion: limpio(copia('2.2', n)) })
  }

  return [
    grupo('Hijos', hijos),
    grupo('Cónyuge', [{ nombre: limpio('2.9'), relacion: '' }]),
    grupo('Contactos de emergencia', contactos),
  ].filter(g => g.personas.length)
}

/* La clave sin su número de copia: `2.20#3` es, para cualquier regla, `2.20`. */
export const claveBase = clave => String(clave).split('#')[0]

/* ── CUÁNTO SE LLEVA REPARTIDO ────────────────────────────────────────────
   La nota de 2.35 dice «validación: la suma debe dar 100 %» desde que se portó el estudio, y no
   había ni suma ni dónde enseñarla: con un solo beneficiario la regla no tenía contra qué
   correr, y con tres habría que ir sumando de cabeza mientras se escribe.

   DICE LO QUE FALTA Y NO SÓLO SI ESTÁ MAL. «70 % · falta 30 %» es accionable; «la suma no da
   100» obliga a restar. Y cuando sobra lo dice igual, que es el error más fácil de cometer
   escribiendo 50, 50 y 50.

   NO REPARTE SOLO. Poner 33/33/34 de arranque sería exactamente lo que esta ficha evita en otros
   seis sitios: un valor puesto es un valor que nadie mira, y acá lo que nadie miraría es cuánto
   se lleva cada heredero. Se cuenta y se enseña; repartir lo hace quien firma.

   DEVUELVE LAS TRES COSAS JUNTAS —qué dice, de qué color y cuánto llena la barra— porque son
   una sola lectura del mismo número y calcularlas por separado es la manera de que un día
   discrepen: la frase diciendo «repartido» y la barra a media asta.

   VACÍO MIENTRAS NADIE ESCRIBIÓ NADA, para no abrir la tarjeta con un «0 % · falta 100 %»
   regañando a quien todavía no llegó al campo. */
export function repartoDe(form) {
  const cuantos = cuantosHay(form, 'herederos')
  let suma = 0
  let escritos = 0
  for (let n = 1; n <= cuantos; n += 1) {
    const crudo = form[n === 1 ? '2.35' : '2.35#' + n]
    if (crudo === undefined || String(crudo).trim() === '') continue
    const num = Number(String(crudo).replace('%', '').replace(',', '.').trim())
    if (!Number.isFinite(num)) continue
    suma += num
    escritos += 1
  }
  if (!escritos) return { texto: '' }

  const dos = x => Math.round(x * 100) / 100
  /* CON COMA, QUE ES COMO SE ESCRIBE UN DECIMAL ACÁ. El campo acepta «33,33» —y lo entiende, ver
     el `replace` de arriba— así que devolverlo como «33.33» sería corregirle la ortografía a
     quien lo escribió bien. Los enteros salen sin coma: «100», no «100,0». */
  const cifra = x => String(dos(x)).replace('.', ',')
  const total = dos(suma)
  /* La barra se corta en 100 aunque el número se pase: una barra que rebosa su carril no dibuja
     «te sobra 20», dibuja un fallo de maquetación. El exceso lo dice la frase, que para eso
     está, y el color lo confirma. */
  const llena = Math.max(0, Math.min(100, total))

  if (total === 100) return { texto: '100 % · repartido', tono: 'ok', llena }
  return total < 100
    ? { texto: cifra(total) + ' % · falta ' + cifra(100 - total) + ' %', tono: 'falta', llena }
    : { texto: cifra(total) + ' % · sobra ' + cifra(total - 100) + ' %', tono: 'sobra', llena }
}

/* ── QUITAR UNA COPIA QUE NO ES LA ÚLTIMA ─────────────────────────────────
   Durante un tiempo sólo se podía quitar la última, y el motivo estaba escrito: las copias se
   numeran por POSICIÓN —`2.20`, `2.20#2`, `2.20#3`— así que sacar la del medio obliga a correr
   una posición todo lo que hay debajo, y un corrimiento callado sobre datos que alguien ya
   escribió es la clase de ayuda que hace perder media hora.

   LO QUE CAMBIÓ NO ES EL RIESGO SINO QUIÉN LO PIDE. Con el botón al final de la sección, quitar
   era una operación sobre «el 2.º» —un número que hay que ir a contar— y el corrimiento pasaba
   por detrás. Con la papelera en la cabecera de cada bloque, quien la pulsa está señalando ESE
   hijo, con su nombre a la vista: el corrimiento deja de ser un efecto secundario y pasa a ser
   exactamente lo que pidió, que los de abajo suban un lugar.

   DEVUELVE UN PARCHE Y NO UNA FICHA ENTERA, que es lo que lo hace seguro de aplicar: el llamador
   lo mezcla sobre el borrador guardado, y así no pisa las claves que la ficha completa tiene por
   mezcla con los valores de arranque y el borrador todavía no.

   Y LA ÚLTIMA COPIA SE VACÍA, no se borra la clave. Es lo que importa de verdad acá: si quedaran
   los valores viejos colgando de `2.20#3`, volver a pulsar «Agregar otro hijo» resucitaría al
   hijo que se acaba de quitar, con sus datos puestos.

   OJO SI ALGÚN GRUPO LLEGA A TENER UN CAMPO DE ARCHIVO: vaciar la clave deja el binario huérfano
   en IndexedDB. Hoy ninguno de los repetibles tiene uno —los nueve archivos de la ficha viven en
   campos sueltos— y el día que pase, acá va el `borrarArchivo` correspondiente. */
export function quitarCopia(form, campos, grupo, n) {
  const cuantos = cuantosHay(form, grupo)
  if (cuantos <= minimoDe(grupo) || n < 1 || n > cuantos) return {}

  /* Las claves base salen de TODAS las copias y no sólo de la primera, porque un campo
     condicional puede estar escondido justo en ésa: «¿Qué relación?» sólo se dibuja en el
     beneficiario que contestó «Otro». Mirando únicamente la copia uno, ese campo no entraba en
     la lista y su valor se quedaba sin correr, colgado de la posición vieja.

     El rótulo y el botón de agregar viajan con el grupo pero no guardan nada: no hay qué correr
     en ellos. */
  const bases = [...new Set(campos
    .filter(c => c.grupo === grupo && c.instancia && c.tipo !== 'rotulo' && c.tipo !== 'repetir')
    .map(c => claveBase(c.key)))]

  const clave = (base, i) => (i === 1 ? base : base + '#' + i)
  const parche = { [CUENTA(grupo)]: cuantos - 1 }

  for (const base of bases) {
    for (let i = n; i < cuantos; i += 1) parche[clave(base, i)] = form[clave(base, i + 1)] ?? ''
    parche[clave(base, cuantos)] = ''
  }
  return parche
}

/* ── LO QUE UN CAMPO REPETIDO CAMBIA SEGÚN SU COPIA ───────────────────────
   Rótulos y tipos que dependen de otro campo del MISMO bloque. En `tarjetasDe` sólo se conoce la
   primera copia; acá cada una lee la suya. Con dos licencias —una de conducir, un certificado de
   antecedentes— cada bloque tiene que llamarse a sí mismo por su nombre. */
const EN_SU_COPIA = {
  /* UN DOCUMENTO AGREGADO A MANO VA EN «DOCUMENTOS AGREGADOS», el tipo de lo que ningún otro campo pide, y el
     buscador lo encuentra por el nombre que le pusieron. Cada campo de su bloque —rótulo incluido—
     lleva los dos, para que el filtro lo muestre o lo esconda entero. */
  ...Object.fromEntries(['ex.2', 'ex.4'].map(k => [k, (campo, suyo) => {
    campo.categoria = 'Documentos agregados'
    campo.busca = suyo('ex.2') || 'Documento'
    /* El archivo se llama como el documento, y editando su rótulo es la caja del nombre: es lo
       único que se ve de él. `claveNombre` es la clave de ESTA copia, no la del primero. */
    if (k === 'ex.4') {
      campo.label = suyo('ex.2') || 'Documento'
      campo.quitable = true
      campo.claveNombre = campo.key.replace('ex.4', 'ex.2')
    }
  }])),
  /* LAS CATEGORÍAS DE LA LICENCIA SON LAS DE BOLIVIA. Una licencia argentina o chilena tiene
     las suyas, con otras letras, así que con otro país emisor la lista deja paso a una caja
     donde se copia la categoría como figura en la licencia. */
  '1.74': (campo, suyo) => {
    if (!suyo('1.75') || suyo('1.75') === 'Bolivia') return
    delete campo.tipo
    delete campo.opciones
    campo.ph = 'Como figura en la licencia'
  },
  /* EL NÚMERO Y LAS FECHAS DICEN DE QUÉ PAPEL SON. La tarjeta guarda licencias, certificados y
     el carnet de sanidad, y los rótulos decían «de la licencia» aunque se hubiera elegido el
     certificado de antecedentes. Siguen al tipo; sin tipo, o con «Otro», no nombran ninguno:
     «Fecha de emisión» a secas, que es verdad para todos. */
  '1.73': (campo, suyo) => { const p = papelDeLicencia(suyo('1.72')); campo.label = p ? `Número ${p.num}` : 'Número' },
  '1.76': (campo, suyo) => { const p = papelDeLicencia(suyo('1.72')); campo.label = p ? `Fecha de emisión ${p.de}` : 'Fecha de emisión' },
  '1.77': (campo, suyo) => { const p = papelDeLicencia(suyo('1.72')); campo.label = p ? `Fecha de vencimiento ${p.de}` : 'Fecha de vencimiento' },
  /* EL TÍTULO DEL BLOQUE ES EL PAPEL. Con dos o tres, «Licencia o certificación 2» obliga a
     abrirlo para saber cuál es; «Certificado de No Violencia» lo dice de lejos. */
  '1.rotLicencias': (campo, suyo) => { const t = suyo('1.72'); if (t && t !== 'Otro') campo.label = t },
}

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
        const copia = { ...campo, grupo, instancia: n, total: cuantos, minimo: minimoDe(grupo) }
        if (n > 1) copia.key = campo.key + '#' + n
        /* UN CALCULADO DENTRO DE UN BLOQUE SE CALCULA CON SU COPIA. `tarjetasDe` lo rellena antes
           de repetir, con los valores de la primera, y sin esto la experiencia dos enseñaba el
           tiempo trabajado de la uno. */
        if (DERIVADOS[campo.key]) copia.deducido = DERIVADOS[campo.key](form, enSuCopia(form, n)) || ''
        /* EL TÍTULO SE NUMERA SÓLO CUANDO HAY MÁS DE UNO. Con un solo hijo, «Hijo 1» pregunta por
           el segundo sin decirlo; con tres, no numerarlos los vuelve indistinguibles. */
        if (campo.tipo === 'rotulo' && cuantos > 1) copia.label = (campo.singular || campo.label) + ' ' + n
        /* UN CAMPO SUELTO FUERA DE SU BLOQUE SE NOMBRA SOLO. En «Archivos» el acta de cada activo
           llega sin el rótulo que la encabezaba en su paso, y tres «Acta de entrega» seguidas no
           dicen cuál es cuál. `nombraCon` es el campo de su copia que la identifica —el tipo de
           activo—; sin contestar todavía, el número. */
        if (campo.nombraCon) {
          const cual = enSuCopia(form, n)(campo.nombraCon)
          if (cual) copia.label = `${campo.label} · ${cual}`
          else if (cuantos > 1) copia.label = `${campo.label} ${n}`
        }
        // Y lo que depende de otro campo de su copia, al final: manda sobre el número del rótulo.
        if (EN_SU_COPIA[campo.key]) EN_SU_COPIA[campo.key](copia, enSuCopia(form, n))
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

/* LA SECCIÓN DE DONDE VIENE CADA ARCHIVO DE «ARCHIVOS». Ahí se repiten, con la misma clave, los
   adjuntos que se suben en su propia sección —el carnet, el croquis—; si la empresa apaga esa
   sección (`configFicha`), su archivo tampoco se ofrece en Archivos. */
/* Los archivos de las secciones propias, en «Archivos», antes de «Agregar documento». Su categoría
   es la de la pestaña donde vive su sección, la misma que usa el filtro de Documentación. */
const CATEGORIA_DE_PESTANA = { personal: 'Información Personal', laboral: 'Información Laboral', perfil: 'Perfil Profesional', recursos: 'Recursos y Activos' }
function conArchivosPropios(campos, usa) {
  const propios = todasLasPropias().filter(p => usa(p.id)).flatMap(p => tarjetaPropia(p).campos
    .filter(c => c.tipo === 'archivo')
    .map(c => ({ ...c, label: `${c.label} · ${p.titulo}`, categoria: CATEGORIA_DE_PESTANA[pestanaDe(p.parte)?.key] || 'Documentos agregados' })))
  if (!propios.length) return campos
  const i = campos.findIndex(c => c.tipo === 'agregarDoc')
  return i < 0 ? [...campos, ...propios] : [...campos.slice(0, i), ...propios, ...campos.slice(i)]
}

const SECCION_DEL_CAMPO = new Map(PASOS_PROPUESTA.flatMap(p => p.tarjetas)
  .filter(t => t.id !== 'archivos')
  .flatMap(t => t.campos.map(c => [c.key, t.id])))

/* `conInactivas`: sólo para la configuración de la ficha, que enseña también las secciones que
   la empresa apagó para poder volver a encenderlas. Todas las demás pantallas las omiten. */
export function tarjetasDe(paso, form, ctx = {}, nivel = 'Completo', { conInactivas = false } = {}) {
  // Una parte hecha de varios pasos del estudio junta sus secciones, en orden. Ver `JUNTA`.
  const fuentes = (JUNTA[paso] || [paso]).map(pasoDelEstudio).filter(Boolean)
  if (!fuentes.length) return []

  // Las secciones que la empresa no usa no existen para ninguna pantalla. Ver `configFicha`.
  const usa = id => conInactivas || seccionActiva(id)
  /* LAS PROPIAS VAN AL FINAL DE SU PARTE, y sus archivos se repiten en «Archivos», como los de
     las secciones del estudio, para que Documentación los reúna. */
  const delEstudio = fuentes.flatMap(p => p.tarjetas)
    .map(t => (t.id === 'archivos' ? { ...t, campos: conArchivosPropios(t.campos, usa) } : t))
  return [...delEstudio, ...propiasDe(paso).map(tarjetaPropia)].filter(t => usa(t.id)).map(t => ({
    ...t,
    campos: t.campos
      .filter(c => !SECCION_DEL_CAMPO.has(c.key) || t.id !== 'archivos' || usa(SECCION_DEL_CAMPO.get(c.key)))
      /* LA CONDICIÓN DE UN CAMPO REPETIBLE NO SE MIRA TODAVÍA. Acá cada descriptor es uno
         solo —las copias las hace `expandirRepetibles` al final— así que preguntarle a un campo
         del bloque si se ve sólo puede contestarse con los valores de la PRIMERA copia, y la
         respuesta valdría para las tres. Marcar «Otro» en el beneficiario dos abría la caja en
         los tres o en ninguno. Se deja pasar y se filtra abajo, ya con la copia sabida. */
      .filter(c => (c.tipo === 'rotulo' || entraEnNivel(c, nivel)) && (c.repite || seVe(c, form)))
      // Un adjunto espejado de un paso que no se enseña —en la versión publicada— tampoco sale acá.
      .filter(c => !c.dePaso || PASOS.some(p => p.key === c.dePaso))
      .map(c => {
        const campo = { ...c }

        const ops = opcionesDeEstructura(c.key, ctx, form)
        if (ops) {
          // Las opciones vienen de la empresa; el control lo decide el campo si tiene uno propio.
          if (c.tipo !== 'aprobadores') campo.tipo = 'lista'
          campo.opciones = ops
          Object.assign(campo, avisoDeRecorte(c.key, ops, ctx, form))
        }

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
          const niveles = nivelesDe(form['1.42'], form['1.43'])
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

        /* ── UNA PREGUNTA CON SU DETALLE ABIERTO EMPIEZA FILA ────────────────────────────
           La tarjeta médica son seis preguntas de un tercio y, colgando de cada una, un detalle
           que ocupa dos tercios. Cerradas, las seis caen de tres en tres y la rejilla se ve
           ordenada. Abierta una, su detalle ya no cabe en lo que queda de la fila y salta a la
           siguiente — donde a su derecha se sienta la pregunta que venga, que no tiene nada que
           ver con él. Con dos o tres abiertas, cada detalle queda al lado de la pregunta
           equivocada, y eso es lo que se ve como desorden: no el orden de los campos, sino que
           la rejilla los emparejó mal.

           ASÍ QUE LA PREGUNTA EMPUJA A LA COLUMNA 1 cuando su detalle está a la vista. Un tercio
           más dos tercios son doce: la pareja se queda con la fila entera y nadie se les sienta
           al lado. Cerrada, la pregunta no lleva la clase y vuelve a fluir de tres en tres.

           Y SE LA QUEDA ABIERTA O CERRADA, que es el segundo arreglo y el que de verdad se nota
           al usarlo. Puesta sólo con el detalle desplegado, contestar «No» se la quitaba y las
           cinco preguntas de abajo volvían a empaquetarse de tres en tres: un clic en una
           casilla y media tarjeta cambiaba de sitio. Lo que se movió no tenía nada que ver con
           lo que se acababa de contestar, y eso obliga a volver a buscar dónde estaba uno.

           CON LA FILA RESERVADA, EL DETALLE APARECE Y DESAPARECE EN EL HUECO QUE YA ESTABA a su
           derecha, y ninguna otra pregunta se entera. Se paga en alto —seis renglones en vez de
           dos con todo cerrado— y se cobra en que la tarjeta deja de bailar. En un formulario
           que se contesta de arriba abajo eso vale más que el alto, y el hueco de la derecha no
           es espacio muerto: es la columna donde van las respuestas.

           EL CAMPO `detalle` LO DICE EL DESCRIPTOR y no se adivina del nombre de la clave. Que
           «1.56b» cuelgue de «1.56» es una convención de nombres, no un dato, y una regla de
           maquetación que dependa de cómo se llamó un campo se rompe el día que alguien lo
           llame distinto. */
        /* ── EL VALOR DEL ANTICIPO TIENE UN TOPE, Y DEPENDE DEL TIPO ─────────────────────
           No tiene sentido adelantar más de lo que la persona va a cobrar ese mes, y es mejor
           taparlo en el propio campo que dejar que lo descubra la corrida. El tope cambia con el
           tipo: 100 si es un porcentaje, el haber básico si es un monto fijo. El rótulo dice la
           unidad, para que nadie lea «50» sin saber si son bolivianos o por ciento. */
        if (c.key === '3.69c') {
          campo.numero = true
          // Los centavos van después de la coma: se toma la parte entera del haber.
          const haber = Number(String(form['3.65'] || '').split(',')[0].replace(/\D/g, '')) || 0
          if (form['3.69b'] === 'Porcentaje del haber básico') {
            campo.label = 'Valor (%)'
            campo.max = 100
            campo.ph = 'De 1 a 100'
            campo.ayuda = 'Porcentaje del haber básico que se adelanta, hasta el 100 %.'
          } else if (form['3.69b'] === 'Monto fijo') {
            campo.label = 'Valor (Bs)'
            if (haber) {
              campo.max = haber
              campo.ph = `Hasta ${haber.toLocaleString('es-BO')}`
              campo.ayuda = `Monto en bolivianos, hasta el haber básico (Bs ${haber.toLocaleString('es-BO')}).`
            } else {
              campo.ayuda = 'Escriba antes el haber básico: el adelanto no puede superarlo.'
            }
          } else {
            campo.ph = 'Elija antes el tipo'
            campo.ayuda = 'Elija antes el tipo de anticipo: de él depende si el valor es un porcentaje o un monto.'
          }
          /* UN VALOR QUE YA ESTABA PUEDE QUEDAR POR ENCIMA DEL TOPE si después se cambia el tipo o
             se baja el haber. No se corrige solo —sería cambiar un dato sin que nadie lo vea—: se
             dice, en el mismo lugar donde se lo va a corregir. */
          const valor = Number(form['3.69c'])
          if (campo.max != null && valor > campo.max) {
            campo.ayuda = `Supera el tope: ${campo.label === 'Valor (%)' ? 'no puede pasar del 100 %' : `no puede pasar del haber básico (Bs ${campo.max.toLocaleString('es-BO')})`}. Corríjalo: la planilla no puede adelantar más que eso.`
            campo.excede = true
          }
        }

        /* ── UN OBRERO CON UMBRAL DE ADMINISTRATIVO SE AVISA ──────────────────────────────
           «¿Aguinaldo y prima desde el primer mes?» es, en los hechos, la marca del obrero: el
           obrero de producción cobra aguinaldo con 1 mes trabajado; el administrativo necesita 3
           meses y 1 día. Si el tipo de trabajador dice Obrero y acá se contesta No, se guardaría
           un obrero con umbral de administrativo y nadie lo notaría hasta la planilla. No se
           corrige solo —puede haber una razón—: se avisa, al lado de la respuesta. */
        if (c.key === '3.77' && form['3.77'] === 'no' && form['3.12'] === 'Obrero') {
          campo.ayuda = 'Atención: en Información laboral, el tipo de trabajador es Obrero. Un obrero de producción tiene derecho al aguinaldo desde el primer mes.'
          campo.excede = true
        }

        if (c.detalle) campo.col = (campo.col || 'c-med') + ' c-fila'

        /* ── LO QUE APARECE, SE VE APARECER ──────────────────────────────────────────────
           Un campo condicional entra y sale del formulario de golpe: donde no había nada hay
           de pronto una caja con su rótulo, y el ojo lo registra como un parpadeo —algo cambió
           y no se sabe qué—. Ciento sesenta milisegundos de entrada convierten el parpadeo en
           un gesto: se ve de dónde salió y se entiende que lo abrió la respuesta de al lado.

           VA POR CONDICIÓN Y NO POR CAMPO. Se la llevan los veintitantos que aparecen y
           desaparecen —los cuatro detalles médicos, el tipo y grado, el proveedor del seguro,
           la extensión del carnet, «¿qué documento?», «¿qué parentesco?»— porque todos tienen
           el mismo problema y merecen el mismo trato. Marcarlos uno por uno sería una lista
           que se olvida de actualizar en cuanto alguien escriba la condición veinticuatro.

           NO HAY ANIMACIÓN DE SALIDA, y no es un descuido: cuando la respuesta pasa a «No» el
           campo deja de existir en el acto y no queda nada a lo que animar. Se podría retener
           el nodo para despedirlo, y no vale la pena — irse rápido es lo correcto para algo
           que se acaba de declarar que sobra. */
        if (CONDICIONES[claveBase(c.key)]) campo.col = (campo.col || 'c-med') + ' c-aparece'

        /* «¿DE QUIÉN ES TUTOR?» SE ARMA CON LO QUE YA HAY ESCRITO EN LA FICHA: los grupos salen de
           `gruposDeTutela`, acá, que es donde hay formulario a mano. */
        /* LA DEPENDENCIA FUNCIONAL VIAJA CON SU ORGANIGRAMA: las unidades y los cargos para
           elegir, la unidad propia del cargo elegido —que no se ofrece— y, para leerla, los
           nombres. Una ficha guardada con el par de antes (unidad escrita en 3.15u) trae esas
           unidades si coinciden con alguna del organigrama. */
        if (c.key === '3.15f') {
          const org = ctx.org || { unidades: [], cargos: [] }
          campo.org = org
          const cargo = org.cargos.find(x => x.id === form['3.11'])
          campo.unidadPropia = cargo?.unidadId || null
          campo.cargoId = cargo?.id || null
          campo.apoyos = Array.isArray(form['3.15f']) ? form['3.15f']
            : [form['3.15u'], ...Array.from({ length: 4 }, (_, i) => form[`3.15u#${i + 2}`])]
              .filter(Boolean)
              .map(n => org.unidades.find(u => u.nombre === n))
              .filter(Boolean)
              .map(u => ({ unidadId: u.id, reportaA: null }))
          campo.leido = campo.apoyos.map(f => {
            const u = org.unidades.find(x => x.id === f.unidadId)?.nombre
            const j = org.cargos.find(x => x.id === f.reportaA)?.nombre
            return u ? (j ? `${u}, respondiendo a ${j}` : u) : ''
          }).filter(Boolean)
        }

        // Para leerlos en la vista previa: los aprobadores en orden y el suplente del primero.
        if (c.key === '3.16') {
          campo.cuantos = Math.max(1, Number(form.__n_aprobadores) || 1)
          campo.valores = Array.from({ length: campo.cuantos }, (_, i) => form[i === 0 ? '3.16' : `3.16#${i + 1}`] || '')
          campo.suplentes = Array.from({ length: campo.cuantos }, (_, i) => form[i === 0 ? '3.16b' : `3.16b#${i + 1}`] || '')
        }

        if (c.key === '1.62b') {
          campo.grupos = gruposDeTutela(form)
          campo.bajoTutela = bajoTutela(form)
        }

        /* ── ELEGIR A UNA PERSONA ES VERLA ─────────────────────────────────────────────
           Los campos que piden a alguien de la empresa —el supervisor, quien aprueba, quien
           autorizó— se ofrecían como una lista de nombres. Ahora cada opción lleva su foto y, debajo
           del nombre, su cargo y su área: dos «Ana» dejan de ser la misma, y se ve de un vistazo si
           el elegido tiene sentido. Lo que se guarda sigue siendo el nombre. */
        /* SÓLO QUIEN OCUPA UN CARGO. Un supervisor o un aprobador manda desde un puesto de la
           estructura: alguien «Sin puesto asignado» no puede ser jefe de nadie, y ofrecerlo sólo
           invita a elegir mal. Quedan fuera de estas listas hasta que se les asigne un cargo. */
        if (PERSONAS_CON_FOTO.includes(c.key) && ctx.datosDePersona && Array.isArray(campo.opciones)) {
          const conCargo = nombre => {
            const cargo = ctx.datosDePersona[nombre]?.cargo || ''
            return cargo && !/^sin puesto/i.test(cargo)
          }
          campo.opciones = campo.opciones.filter(o => conCargo(typeof o === 'string' ? o : o.valor)).map(o => {
            const nombre = typeof o === 'string' ? o : o.valor
            const d = ctx.datosDePersona[nombre]
            return d
              ? { valor: nombre, etiqueta: nombre, sub: [d.cargo, d.area].filter(Boolean).join(' · '), persona: { foto: d.foto, initials: d.initials, color: d.color } }
              : o
          })
        }

        if (DERIVADOS[c.key]) campo.deducido = DERIVADOS[c.key](form, k => form[k], ctx) || ''

        /* EL TOTAL REPARTIDO NO ES UN DATO CUALQUIERA: es el único calculado de la ficha que
           además dice si está BIEN. Los otros cuatro informan —la fecha de la Caja, el fin del
           periodo de prueba—; éste juzga. Por eso viaja con tono y con barra, que es lo que
           `emp-campo-fijo` sabe dibujar cuando se los dan, y sigue siendo un campo deducido
           corriente para todo lo demás. */
        if (c.key === '2.35t') {
          const r = repartoDe(form)
          if (r.tono) { campo.tono = r.tono; campo.llena = r.llena }
        }

        /* LA FOTO SE SUBE COMO UNA FOTO Y NO COMO UN ADJUNTO. Es el único de los nueve archivos
           de la ficha que hay que MIRAR para saber si está bien: los otros ocho son papeles y de
           un papel alcanza con saber que está. Se marca acá por clave y no en el estudio porque
           el estudio dice qué campo es —un archivo de imagen— y no cómo se dibuja. */
        if (c.key === '1.9') { campo.retrato = true; campo.col = 'c-tercio c-retrato' }

        /* ── LA NACIONALIDAD NO SE PREGUNTA DOS VECES ─────────────────────────────────────
           Quien contesta que sí es boliviana ya dijo cuál es su nacionalidad: el campo de al lado
           ni aparece —la condición está en CONDICIONES—. Y dicho que NO, «Boliviana» sale de la
           lista: elegirla dejaba una ficha que se desmiente a sí misma en dos campos contiguos. */
        if (c.key === '1.25' && form['1.24'] === 'no') {
          campo.opciones = (campo.opciones || []).filter(o => o !== 'Boliviana')
          /* UN BORRADOR QUE YA TRAÍA LA CONTRADICCIÓN. Contestar «No» ahora vacía la nacionalidad
             —`consecuenciasDe`—, pero una ficha guardada antes puede tener las dos cosas (y de
             cuando la lista decía el país, «Bolivia»). El desplegable conserva el valor que no
             está en la lista para no perder nada: se avisa en el campo, para que se elija la
             correcta. */
          if (BOLIVIANA.includes(form['1.25'])) {
            campo.ayuda = 'No es de nacionalidad boliviana: elija su nacionalidad.'
            campo.excede = true
          }
        }

        /* LA SEGUNDA NACIONALIDAD NO REPITE LA PRIMERA. Es el mismo catálogo, sin la que ya figura
           como nacionalidad —«Boliviana» si se contestó que sí—: ofrecerla sería ofrecer declarar
           dos veces lo mismo. */
        /* EL CÓDIGO DEL CELULAR ARRANCA EN EL PAÍS DONDE VIVE. Quien reside en Argentina casi
           seguro tiene un número argentino; que tenga que ir a buscar el +54 es trabajo que la
           ficha ya puede ahorrarle. Sin país de residencia, o con uno que no está en la lista,
           arranca en Bolivia. Elegido a mano, manda lo elegido. Vale igual para el celular de
           los contactos de emergencia, del cónyuge y del garante: casi siempre viven donde vive la
           persona. */
        if (['1.36', '2.3', '2.15', '2.41'].includes(c.key)) campo.paisPorDefecto = paisPorNombre(form['1.42'])?.sigla || 'BO'

        if (c.key === '1.26') {
          const primera = nacionalidadPrincipal(form)
          if (primera) campo.opciones = (campo.opciones || []).filter(o => o !== primera)
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
  /* Y ACÁ LA SEGUNDA PASADA, la que sí puede: después de expandir, cada copia lleva su
     `instancia` y `seVe` le pasa a la condición un lector de SU copia. Sólo se vuelve a
     preguntar por lo repetible; lo demás ya contestó arriba y no cambió. */
  })).map(t => ({ ...t, campos: sinRotulosHuerfanos(expandirRepetibles(t.campos, form).filter(c => !c.repite || seVe(c, form))).map(sinMarcas) }))
    .filter(t => t.campos.some(c => c.tipo !== 'rotulo'))
}

/* ── SIN CHIPS NI SIGNOS DE AYUDA EN PANTALLA ─────────────────────────────
   «legal», «se calcula» y «v1.2» eran marcas del estudio de la propuesta, y las notas detrás del
   signo de interrogación eran sus apuntes: por qué existe cada dato, citas de las reuniones, códigos
   de campo. Útiles para el equipo, no para quien llena la ficha. El equipo pidió quitarlos (29 sep
   2026): la descripción de cada sección ya dice qué registrar. Los apuntes siguen en el estudio
   —camposPropuesta.js— y en la documentación; lo que se quita es sólo su dibujo en la ficha. */
const sinMarcas = ({ nota, insignia, ...campo }) => (void nota, void insignia, campo)

/* ── LAS SECCIONES QUE LA EMPRESA PUEDE CONFIGURAR ──────────────────────────
   Todas las de la ficha, encendidas o no, en el orden de sus pestañas y partes — lo que lista
   Gestión de Personas › Configuración › Ficha del colaborador (`configFicha`). Se leen del estudio
   y no de `tarjetasDe`, que ya no devuelve las apagadas y cuenta los bloques repetidos según las
   copias de una ficha: aquí cada campo se cuenta una vez.

   OBLIGATORIA = no se puede apagar. Lo es la que tiene un campo de nivel «Mínimo» —sin él no se
   puede declarar a nadie— y lo son dos que sostienen a las demás: Archivos, que reúne los
   documentos, y el acceso al sistema, sin el que el colaborador no entra a ver su ficha. */
const SIEMPRE = new Set(['archivos', 'acceso'])
const NO_ES_DATO = new Set(['rotulo', 'repetir', 'agregarDoc'])
export function seccionesConfigurables() {
  return PESTANAS.flatMap(pestana => pestana.partes.flatMap(parte => {
    const titulo = PASOS.find(p => p.key === parte)?.titulo
    return (JUNTA[parte] || [parte]).map(pasoDelEstudio).filter(Boolean).flatMap(p => p.tarjetas)
      .filter(t => t.campos.some(c => c.tipo !== 'rotulo'))
      .map(t => {
        const campos = t.campos.filter(c => !NO_ES_DATO.has(c.tipo))
        return {
          id: t.id, titulo: t.titulo, desc: t.desc,
          pestana: pestana.key, parte, tituloParte: titulo,
          campos: campos.length,
          claves: campos.map(c => c.key),
          obligatoria: SIEMPRE.has(t.id) || campos.some(c => c.nivel === 'Mínimo'),
        }
      })
      // Y al final de cada parte, las que creó la empresa.
      .concat(propiasDe(parte).map(p => {
        const t = tarjetaPropia(p)
        return {
          id: t.id, titulo: t.titulo, desc: t.desc,
          pestana: pestana.key, parte, tituloParte: titulo,
          campos: t.campos.length, claves: t.campos.map(c => c.key),
          obligatoria: false, propia: true,
        }
      }))
  }))
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

/* ── LO QUE UNA RESPUESTA CORRIGE EN OTRO CAMPO ──────────────────────────
   Casi siempre un campo es independiente, y esconder uno no borra lo escrito. Esto es para las
   pocas respuestas que dejan a otro dato diciendo lo contrario, y que por eso lo corrigen en el
   mismo gesto. Devuelve lo que hay que cambiar además del campo contestado.

   «¿ES DE NACIONALIDAD BOLIVIANA?» = NO VACÍA UNA NACIONALIDAD «BOLIVIANA». Si no, el
   desplegable seguía enseñándola —conserva el valor elegido aunque ya no esté en la lista— y la
   ficha se desmentía en dos campos contiguos. Solo se vacía si decía boliviana: otra
   nacionalidad ya elegida se respeta. Y con «Sí» se vacía siempre, porque el campo se esconde
   y lo que quedara dentro contradiría la respuesta sin que nadie lo viera.

   LA SEGUNDA NACIONALIDAD SE VACÍA SI PASA A SER LA PRINCIPAL: elegida «Chilena» de segunda y
   luego «Chilena» de principal, la ficha diría la misma nacionalidad dos veces. */
export function consecuenciasDe(clave, valor, form) {
  const cambios = {}
  if (clave === '1.24' && (valor === 'si' || BOLIVIANA.includes(form['1.25']))) cambios['1.25'] = ''
  /* La categoría es solo de la licencia de conducir: con otro tipo se esconde, y no se queda
     guardada. Y la suspensión es de las licencias: con un certificado vuelve a su «no». Las dos,
     en la MISMA copia que cambió de tipo —`1.72#2` limpia `1.74#2`—. */
  if (claveBase(clave) === '1.72') {
    const de = k => k + clave.slice(4)
    if (valor !== 'Licencia de conducir' && form[de('1.74')]) cambios[de('1.74')] = ''
    if (!seSuspende(() => valor) && form[de('1.78b')] === 'si') cambios[de('1.78b')] = 'no'
  }
  if (clave === '1.24' || clave === '1.25') {
    const primera = nacionalidadPrincipal({ ...form, ...cambios, [clave]: valor })
    if (primera && form['1.26'] === primera) cambios['1.26'] = ''
  }
  return cambios
}

export function faltaParaCrear(form) {
  return BLOQUEOS.find(b => !(form[b.key] || '').trim()) || null
}

/* Todos los que faltan, no sólo el primero: el aviso de «Dar de alta» los lista juntos para que
   nadie corrija uno, vuelva a intentar y descubra el siguiente. */
export function faltasParaCrear(form) {
  return BLOQUEOS.filter(b => !(form[b.key] || '').trim())
}
