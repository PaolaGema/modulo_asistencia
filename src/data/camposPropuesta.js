/* LOS CAMPOS DE LA FICHA, PORTADOS DEL ESTUDIO DE LA PROPUESTA v1.2.
   GENERADO — no editar a mano. Sale de `herramientas/portar-campos.cjs`, que lee los tres
   archivos del prototipo de réplica (`esquema.js`, `mapa.js`, `catalogos.js`) y los traduce
   al formato de descriptores que ya entiende `TarjetaCampos`.

   POR QUÉ PORTADO Y NO REESCRITO. El estudio de qué campos hacen falta ya está hecho: 249
   campos, cuáles exige la ley, de qué entidad viene cada lista y en qué acordeón va cada uno.
   Volver a escribirlos a mano es garantizar que en tres semanas las dos listas digan cosas
   distintas y que nadie sepa cuál vale. Si el estudio cambia, se vuelve a correr el conversor.

   LA CLAVE DE CADA CAMPO ES SU ID DEL ESTUDIO —'1.1', '3.42b'— y no un nombre inventado. Es lo
   que permite volver de esta pantalla a la fila de la propuesta que la justifica, y al revés.

   Total: 254 campos en 8 pasos. */

export const PASOS_PROPUESTA = [
  {
    key: 'quien',
    n: 1,
    titulo: 'Información Personal',
    corto: 'Personal',
    pista: 'Nombre legal, documento, nacimiento y contacto',
    tarjetas: [
      {
        id: 'reingreso',
        titulo: 'Reingreso o alta nueva',
        desc: 'Va primero por una razón: si la persona ya estuvo en el grupo, hay que recuperar su registro en vez de crear uno nuevo. Un duplicado se arrastra para siempre.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '0.1',
            label: '¿Ya tiene registro en el grupo?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Dispara la búsqueda.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '0.2',
            label: 'Empresa del grupo',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            traza: '⚫ si 0.1 = Sí. Alimenta: GP.'
          },
          {
            key: '0.3',
            label: 'Colaborador',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Busca por nombre o número de carnet de identidad. *\'Eliminar códigos — se sugiere nombre\'*. El código de colaborador no es un dato que RR.HH. recuerde al buscar.',
            traza: '✏ v1.2 (obs. #3). Alimenta: GP.'
          },
          {
            key: '0.4',
            label: '¿Copiar documentos digitales?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP, ON.'
          },
          {
            key: '0.5',
            label: '¿Asignar los mismos permisos anteriores?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP.'
          },
          {
            key: '0.6',
            label: '¿Conservar antigüedad anterior?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Decide si el bono de antigüedad se recalcula desde cero o continúa. en duda — *\'quizá no\'*. Ver pendiente 18.',
            traza: '✏ v1.2 (obs. #1). Alimenta: PL.'
          }
        ]
      },
      {
        id: 'nombre',
        titulo: 'Datos personales',
        desc: 'El nombre se guarda descompuesto porque cada entidad lo pide distinto: la OVT en tres partes, la Gestora en cinco y RC-IVA en una sola.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.1',
            label: 'Primer nombre',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Ingrese el primer nombre tal como figura en su documento de identidad.',
            traza: 'Alimenta: CC, ERP, GP, ON, PL.'
          },
          {
            key: '1.2',
            label: 'Segundo nombre',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Ingrese el segundo nombre tal como figura en su documento de identidad (si corresponde).',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.3',
            label: 'Tercer nombre',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Ingrese el tercer nombre tal como figura en su documento de identidad (si corresponde).',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '1.4',
            label: 'Apellido paterno',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: CC, ERP, GP, ON, PL.'
          },
          {
            key: '1.5',
            label: 'Apellido materno',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.6',
            label: 'Apellido de casada',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Apellido de casada según su documento de identidad (si aplica).',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.7',
            label: 'Nombre completo',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Se arma con los campos separados y no se escribe a mano: las planillas fiscales y el Ministerio de Trabajo los exigen individualizados, así que el separado es el dato y este es su lectura.',
            traza: '✏ v1.2 (obs. #4). Alimenta: GP.'
          },
          {
            key: '1.9',
            label: 'Fotografía del colaborador',
            tipo: 'archivo',
            /* UN PDF NO ES UNA FOTOGRAFÍA. Aceptaba `application/pdf` como los otros ocho
               archivos de la ficha, que sí son papeles escaneados; acá el recuadro dibuja la
               imagen y con un PDF adentro enseña un icono gris donde va la cara. Se cierra a
               imágenes, que es lo que el campo pide desde su rótulo.

               Y CINCO MEGAS Y NO DIEZ. El tope general está pensado para un escaneo a color;
               una fotografía de carnet no llega a uno, y lo que pasa de cinco es casi siempre
               una foto de celular sin recortar que además se va a ver en 88 px. El número está
               escrito en el recuadro y es el mismo que valida — ver `topeMB` en SubirArchivo.

               TRES TIPOS CONCRETOS Y NO `image/*`, QUE ES LO QUE PARECÍA MÁS GENEROSO. Con el
               comodín entra el HEIC del iPhone, que es el formato con el que sale de fábrica
               cualquier foto sacada con un teléfono de Apple. Se sube sin protestar, se guarda
               bien, y el navegador no sabe dibujarlo: el recuadro queda en blanco. Para un
               campo cuyo motivo de existir es MIRAR lo que se subió, eso es peor que
               rechazarlo — se descubre tarde y sin decir por qué.

               Nombrados, el selector de archivos los filtra y el HEIC sale gris con su razón a
               la vista. `.jpg` y `.jpeg` son el mismo `image/jpeg`, así que los dos entran. */
            acepta: 'image/jpeg,image/png,image/webp',
            pista: 'JPG, PNG o WEBP · máximo 5 MB',
            topeMB: 5,
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Suba una fotografía formal y reciente.',
            traza: 'Alimenta: CC, GP, ON.'
          }
        ]
      },
      {
        id: 'documento',
        titulo: 'Documento de identidad',
        desc: 'El documento con el que se la identifica ante el Estado. Es lo primero que valida cualquier declaración.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.10',
            label: 'Tipo de documento',
            tipo: 'lista',
            opciones: [
              'Documento nacional de identidad',
              'Pasaporte',
              'Carnet de extranjero',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'El documento de identidad del país que lo emitió: el carnet en Bolivia, el DNI en Argentina o España, la cédula en Chile. El carnet de extranjero va aparte porque lo emite Migración y no lleva extensión. Catálogo reducido de cuatro. El estudio lo escribió como CI y la opción dejó de llamarse así a propósito: CI trae dentro que es boliviano, y un DNI argentino es igual de nacional. El país emisor lo dice ahora, y por eso se pregunta siempre. Se retira \'RUN\' y \'Certificado de nacimiento\': las dos caen en «Otro», que abre una caja para escribir cuál.',
            traza: 'Fuente · F20 · campo 2. Alimenta: ERP, GP, PL.'
          },

          /* «OTRO» NO ERA UNA RESPUESTA, ERA DEJAR DE CONTESTAR. La lista se redujo a cuatro a
             propósito y la nota del propio campo dice qué se sacó —«RUN» y «Certificado de
             nacimiento»—, así que existen de entrada dos casos reales que hoy sólo pueden
             entrar por «Otro». Sin esta caja, la ficha guardaba la palabra «Otro» en el campo
             que identifica a la persona ante el Estado: el número está, el escaneado está, y
             de qué documento son no lo sabe nadie.

             ES EL MISMO ARREGLO QUE «¿QUÉ PARENTESCO?» (2.2b) y lleva la misma forma: clave con
             letra colgando de su padre, condición en `CONDICIONES`, y aparece sólo al elegir
             «Otro». Hereda nivel y obligatoriedad de 1.10 porque es 1.10 terminando de
             contestarse; escondido no cuenta para el progreso, que es lo que hace `seVe`.

             LO QUE VA ACÁ SIGUE SIENDO UN DOCUMENTO DE IDENTIDAD. Esta tarjeta es con qué se
             identifica a la persona ante el Estado, no qué papeles presentó: el carnet de
             sanidad o los antecedentes penales son requisitos de contratación y su sitio son
             los documentos del paso Contrato, no éste. Los ejemplos del rótulo lo dicen sin
             tener que explicarlo. */
          {
            key: '1.10b',
            label: '¿Qué documento?',
            ph: 'Certificado de nacimiento, RUN, libreta de servicio militar…',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Sólo aparece al elegir «Otro». Va el nombre con el que lo emite el país emisor, que es contra lo que después hay que poder cruzar el escaneado.',
            traza: '↳ 1.10. Alimenta: ERP, GP, PL.'
          },
          {
            key: '1.11',
            label: 'Número de documento',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Validación fuerte. Clave de identidad en todo el ecosistema.',
            traza: 'Alimenta: ERP, GP, PL.'
          },
          {
            key: '1.12',
            label: 'Extensión',
            tipo: 'lista',
            opciones: [
              'LP',
              'SC',
              'CB',
              'OR',
              'PT',
              'TJ',
              'CH',
              'BE',
              'PD'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: '*\'La extensión va enlazada a la OVT; si está mal, rebota\'* → error aquí = sanción. Las opciones son la lista oficial de la OVT.',
            traza: 'Fuente · F20 · campo 4. Alimenta: GP, PL.'
          },
          {
            key: '1.13',
            label: 'Complemento SEGIP',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Casos excepcionales de CI con numerología adicional.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.15',
            label: 'Fecha de emisión del documento',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.16',
            label: 'Fecha de vencimiento del documento',
            html: 'date',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Alerta de vencimiento. CI, pasaporte y carnet de extranjero caducan; se exige para visados de finiquito y servicios in-house.',
            traza: 'Alimenta: GP, ON.'
          },
          {
            key: '1.14',
            label: 'País emisor',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Va debajo de la extensión y el complemento aunque los dispare: viene con Bolivia puesto, casi nadie lo toca, y arriba partía en dos la pareja tipo/número.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.17',
            label: 'Documento escaneado (anverso + reverso)',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Operativo',
            nota: 'Un solo archivo PDF, no dos imágenes. Acuerdo de la sesión 1 (01:05:06): *\'al igual que en los procesos bancarios, se debe escanear el anverso y el reverso del documento en un solo archivo PDF para facilitar su carga\'*. Sigue siendo la fuente del autocompletado por OCR.',
            traza: '✏ v1.2 (obs. #5). Alimenta: GP.'
          },

          /* EL ESTADO CIVIL SE LEE DEL CARNET, ASÍ QUE VIVE CON EL CARNET. La casilla está
             impresa en el documento que se acaba de escanear tres campos más arriba: quien lo
             tiene delante lo copia sin cambiar de tarjeta ni de fuente. Por eso lleva insignia
             «legal», y por eso cierra el bloque del documento principal —en el renglón de 1.14
             y 1.17— antes de que 1.19 abra el del secundario.

             VENÍA DE LA TARJETA DEL NOMBRE, y no por capricho: ahí vive «Apellido de casada»,
             el campo que más depende de él. Esa dependencia no se muda con el campo, así que
             la advertencia que la sostenía se escribe acá, que es donde puede perderse: NO
             ATAR «APELLIDO DE CASADA» A «CASADO(A)». Una divorciada o una viuda puede
             conservarlo legalmente y su carnet lo sigue diciendo; el estudio ya probó
             condicionarlo y lo retiró. Estando los dos campos a la vista la regla se leía
             sola; en tarjetas distintas hay que dejarla escrita o se reinventa mal.

             Antes de aquello venía de «Estado civil y ocupación», una tarjeta sin criterio que
             juntaba por descarte el estado civil, la profesión, la matrícula, la vivienda y el
             vehículo. Aquélla se partió; ésta es la segunda escala del mismo campo. */
          {
            key: '1.29',
            label: 'Estado civil',
            tipo: 'lista',
            opciones: [
              'Soltero(a)',
              'Casado(a)',
              'Divorciado(a)',
              'Viudo(a)',
              'Unión libre'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Proceso interno y respaldo legal de la garantía: si el garante está casado, la garantía es compartida.',
            traza: 'Alimenta: GP, PL.'
          },

          /* ── SE AGREGA, NO SE PREGUNTA ────────────────────────────────────────────────
             Era «¿Tiene documento secundario?» con un Sí/No que abría el bloque, y era la única
             lista de la ficha que se armaba así: los hijos, los beneficiarios, la formación y los
             activos se agregan con un botón. Una pregunta que sólo sirve para enseñar campos es
             un botón disfrazado, y además tope uno: el extranjero con carnet, pasaporte y carnet
             de extranjero no entraba.

             AHORA ES UN GRUPO QUE ARRANCA EN CERO —`docsec`, ver MINIMO_COPIAS— y el botón de
             abajo agrega el primero. Las claves no cambian: el primer documento sigue en
             1.20a…1.20i y el segundo va en `1.20a#2`, así que una ficha guardada con «Sí» se lee
             entera. 1.19 ya no se pregunta; sólo se mira para contar como uno a quien lo
             contestó antes. */
          {
            key: '1.20',
            repite: 'docsec',
            singular: 'Documento secundario',
            label: 'Documento secundario',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'El estudio lo pedía enumerado —tipo, número, extensión, complemento, vencimiento, imágenes— porque todavía era una promesa. Ahora son los campos de abajo, los mismos que el documento principal: un segundo documento no se describe distinto que el primero.'
          },

          /* ── EL SEGUNDO DOCUMENTO, CAMPO POR CAMPO ────────────────────────────────────────
             Durante un tiempo esto fue un rótulo con seis palabras entre paréntesis y nada
             debajo: la ficha preguntaba si había un segundo documento y, cuando contestaban que
             sí, no ofrecía dónde escribirlo. El caso que lo motiva está en la nota de 1.19 y es
             de todos los días —un extranjero con carnet y pasaporte, los dos exigidos—, así que
             la respuesta «Sí» tenía que abrir algo.

             SON LOS MISMOS CAMPOS DEL PRINCIPAL Y EN EL MISMO ORDEN, a propósito. Quien acaba de
             llenar el documento de arriba vuelve a encontrar lo que ya llenó, en el sitio donde
             lo dejó, y no tiene que aprender un bloque nuevo a mitad de la tarjeta.

             LAS CLAVES LLEVAN LETRA —1.20a … 1.20h— y no números nuevos: el estudio numeró esto
             como un solo campo, el 1.20, y estos ocho son su desarrollo, no ocho campos que el
             estudio no conoce. El 3.16b ya usa esa forma.

             NINGUNO ES RIEL. El escaneo del principal ancla la tarjeta desde la columna 1, y
             `conRiel` desactiva el anclaje en cuanto hay dos: si este segundo escaneo pidiera
             `c-escaneo`, los dos volverían al flujo y la tarjeta entera perdería su columna. */
          {
            key: '1.20a',
            repite: 'docsec',
            label: 'Tipo de documento',
            tipo: 'lista',
            opciones: [
              'Documento nacional de identidad',
              'Pasaporte',
              'Carnet de extranjero',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            requerido: true,
            nota: 'El mismo catálogo del documento principal. Lo normal es que no coincidan: el caso que abre este bloque es justamente el de alguien que tiene dos documentos de tipos distintos.',
            traza: '↳ 1.20. Alimenta: GP.'
          },

          /* Y LA MISMA CAJA PARA EL SEGUNDO DOCUMENTO, porque es el mismo catálogo de cuatro
             con el mismo «Otro». Arreglar sólo el principal dejaba el agujero justo donde más
             se cae: el bloque que existe para el extranjero con dos documentos es el que más
             probabilidades tiene de traer uno que la lista no nombra.

             LA CLAVE ES 1.20i Y NO UNA LETRA INTERMEDIA. Las ocho de arriba —a…h— salieron en
             el orden en que se preguntan, pero la letra numera las piezas del campo 1.20, no
             su renglón. Ésta es la novena pieza y se escribe donde se pregunta. Renombrar las
             otras para que la alfabética volviera a coincidir con el orden movería claves que
             ya están guardadas en fichas, y una clave que cambia es un dato que se pierde. */
          {
            key: '1.20i',
            repite: 'docsec',
            label: '¿Qué documento?',
            ph: 'Certificado de nacimiento, RUN, libreta de servicio militar…',
            col: 'c-tercio',
            nivel: 'Operativo',
            requerido: true,
            nota: 'Sólo aparece al elegir «Otro», igual que en el documento principal.',
            traza: '↳ 1.20a. Alimenta: GP.'
          },
          {
            key: '1.20b',
            repite: 'docsec',
            label: 'Número de documento',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            requerido: true,
            nota: 'No se valida contra el número del principal: son dos documentos distintos y pueden compartir dígitos sin que eso signifique nada.',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.20c',
            repite: 'docsec',
            label: 'Extensión',
            tipo: 'lista',
            opciones: [
              'LP',
              'SC',
              'CB',
              'OR',
              'PT',
              'TJ',
              'CH',
              'BE',
              'PD'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            requerido: true,
            nota: 'Misma lista oficial de la OVT que arriba, y aparece bajo la misma condición: solo un carnet boliviano lleva extensión.',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.20d',
            repite: 'docsec',
            label: 'Complemento SEGIP',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Casos excepcionales de carnet boliviano con numerología adicional.',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.20e',
            repite: 'docsec',
            label: 'Fecha de emisión del documento',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.20f',
            repite: 'docsec',
            label: 'Fecha de vencimiento del documento',
            html: 'date',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'El segundo documento caduca igual que el primero, y la alerta de vencimiento tiene que mirarlos a los dos: de nada sirve avisar del carnet si el que venció fue el pasaporte.',
            traza: '↳ 1.20. Alimenta: GP, ON.'
          },
          {
            key: '1.20g',
            repite: 'docsec',
            label: 'País emisor',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Viene con Bolivia puesto igual que el del documento principal. De él dependen la extensión y el complemento SEGIP, que están más arriba en el bloque: sin un valor de arranque, elegir el tipo no hacía aparecer nada y los dos campos brotaban después, por encima de donde se estaba mirando.',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.20h',
            repite: 'docsec',
            label: 'Documento secundario escaneado (anverso + reverso)',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Operativo',
            nota: 'Un solo archivo PDF con las dos caras, igual que el principal. Y ancla su bloque como el de arriba ancla el suyo: el papel a la izquierda, lo que dice el papel al lado.',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          /* El país viene con Bolivia puesto, como en el primero: de él dependen la extensión y
             el complemento, y sin valor de arranque brotarían después, arriba de donde se mira. */
          {
            key: '1.masDocs',
            tipo: 'repetir',
            grupo: 'docsec',
            max: 3,
            label: 'Agregar otro documento',
            labelPrimero: 'Agregar documento secundario',
            arranque: { '1.20g': 'Bolivia' },
            col: 'c-todo',
            nivel: 'Operativo',
            nota: 'Caso real: extranjero con carnet y pasaporte, ambos requeridos. Cada documento es un bloque igual al principal.'
          }
        ]
      },
      /* Era «Información de Nacimiento y Nacionalidad», pedido así. Dos cosas de paso, las dos
         de consistencia: «Datos de…» es como se llaman sus cinco hermanas del paso —«Datos
         personales», «Datos de residencia», «Datos de contacto», «Datos profesionales», «Datos
         patrimoniales»—, y «Información de» era la única que rompía la forma. Y va en minúscula
         salvo la inicial, como todas ellas: las mayúsculas del medio venían del estudio, donde
         los títulos se escribían en capitular. */
      {
        id: 'nacimiento',
        titulo: 'Datos de nacionalidad y nacimiento',
        desc: 'Información requerida para el cumplimiento de normativas laborales, cómputo de cupos legales y contratos de trabajo.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.21',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Doble uso: declaración OVT + campañas de cumpleaños + acceso sin correo (CI + fecha nac.).',
            traza: 'Alimenta: AS, CC, GP, PL.'
          },
          {
            key: '1.27',
            label: 'Sexo',
            tipo: 'lista',
            opciones: [
              'F · Femenino',
              'M · Masculino'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Tiene efecto de cálculo: jornada de 40 h (mujer) vs. 48 h (hombre) y recargo nocturno diferenciado. Las opciones son la lista oficial de la OVT.',
            traza: 'Fuente · F20 · campo 10. Alimenta: AS, GP, PL.'
          },
          {
            key: '1.23',
            label: 'País de nacimiento',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.22',
            label: 'Lugar de nacimiento',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.24',
            label: '¿Es de nacionalidad boliviana?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Control del % de extranjeros, limitado por ley.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.25',
            label: 'Nacionalidad',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Se rellena sola si la respuesta de al lado es Sí, y entonces no se puede escribir: ya está contestada. Dicho que No, se pregunta y Bolivia deja de estar entre las opciones. El estudio lo pedía escondiendo el campo; se prefirió deducirlo para que el dato siga a la vista de quien lee la ficha. Corrige la redundancia del Salar.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.26',
            label: 'Segunda nacionalidad',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },

          /* EL PAPEL QUE PRUEBA TODO LO DE ESTA TARJETA. La fecha, el lugar y el país de
             nacimiento son lo que decide si esta persona cuenta para el límite del 15 % de
             personal extranjero, y hasta ahora los tres se escribían de memoria y sin respaldo.
             El certificado es el documento donde están los tres juntos.

             NO CONTRADICE AL CATÁLOGO DE ARRIBA. El tipo de documento retiró «Certificado de
             nacimiento» de sus opciones a propósito: no sirve para identificarse ante el Estado
             —no lleva foto ni número de identidad— y por eso no es un documento de identidad.
             Como respaldo de una fecha de nacimiento sí sirve, que es otra cosa y otro sitio.

             Y ANCLA LA TARJETA como el escaneo ancla la del documento: el papel abierto a un
             costado, lo que dice el papel al lado. */
          {
            key: '1.21b',
            label: 'Certificado de nacimiento',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Operativo',
            nota: 'Respalda la fecha, el lugar y el país de nacimiento, que son los tres datos de los que sale el cómputo del 15 % de personal extranjero.',
            traza: '↳ 1.21. Alimenta: GP, ON.'
          }
        ]
      },
      /* ── EL ORDEN DE LO QUE QUEDA DEL PASO, PEDIDO ASÍ ─────────────────────────
         Después del nacimiento van «Dónde vive», «Cómo se lo ubica», «Qué sabe hacer» y «Qué
         tiene», en ese orden. Venían al revés —lo profesional y lo patrimonial antes que el
         domicilio y el teléfono— y eso ponía primero lo que menos se llena.

         LO QUE HACE EL ORDEN NUEVO es terminar de identificar a la persona antes de empezar a
         describirla: nombre, documento, nacimiento, dónde vive y cómo se la llama son los cinco
         datos con los que se abre una ficha y los que el mínimo legal exige. La profesión y el
         patrimonio son dos tarjetas de dos campos cada una, ninguno del mínimo, y cierran.

         EL DOMICILIO ANTES QUE EL TELÉFONO porque es el que sigue al lugar de nacimiento —dos
         preguntas de dónde, seguidas— y porque es la tarjeta larga de las dos: once campos con
         mapa y croquis contra tres cajas de contacto. La corta después de la larga deja el paso
         aflojando, no apretando. */
      {
        id: 'residencia',
        titulo: 'Datos de residencia',
        desc: 'Registre la dirección exacta de su residencia habitual para fines contractuales, asignación de centro de trabajo y trámites de ley.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.42',
            label: 'País de residencia',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.43',
            label: 'Departamento',
            tipo: 'lista',
            opciones: [
              'La Paz',
              'Santa Cruz',
              'Cochabamba',
              'Oruro',
              'Potosí',
              'Tarija',
              'Chuquisaca',
              'Beni',
              'Pando'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'El rótulo y la lista cambian con el país de residencia: Departamento en Bolivia, Región en Chile, Estado en México. Sólo Bolivia trae catálogo por ahora; en el resto es texto libre, pero con el nombre correcto. De él sale la lista de provincias bolivianas.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.44',
            label: 'Provincia',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Corrige el dolor del Salar —*\'la lista no se puede filtrar por departamento\'*—: ahora sólo salen las del departamento elegido. Hacía falta porque hay nombres repetidos entre departamentos: Cercado es provincia de Cochabamba, de Oruro, de Tarija y del Beni.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.45',
            label: 'Municipio / Ciudad',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.46',
            label: 'Zona / Barrio',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.47',
            label: 'Calle / Avenida',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Dirección requerida para el contrato.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.48',
            label: 'Número de domicilio',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.49',
            label: 'Edificio / Condominio / Piso',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '1.50',
            label: 'Referencia del domicilio',
            ph: 'Frente al parque, portón verde…',
            /* AL LADO DE «EDIFICIO», A UN TERCIO. Estuvo a todo lo ancho —es una frase y no un
               dato de dos palabras— y dejaba un hueco del tamaño de un campo junto a «Edificio /
               Condominio / Piso»: la tarjeta se leía con un diente. Se pidió cerrarlo, y la caja
               de texto se desplaza al escribir, así que la frase entra igual aunque no se vea
               entera de una vez. */
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          /* DEJA DE SER DOS NÚMEROS Y PASA A SER UN ENLACE. El Salar obliga a tipear la
             latitud a mano, que es pedirle a alguien de Recursos Humanos que transcriba
             «-17.783319» sin equivocarse en un dígito — y un dígito de más o de menos son
             once kilómetros. Un enlace se copia del mapa y se pega entero, o no se pega.

             ES EL ACUERDO DE LA SESIÓN 1 (01:13:45), donde se pidió «profundizar GPS» y se
             resolvió que integrar enlaces de Google Maps rinde más que el croquis dibujado,
             sobre todo con sucursales distribuidas, porque facilita la logística y la
             asignación de personal según proximidad. El croquis de abajo quedó como respaldo
             opcional por esa misma decisión, y su nota ya lo dice.

             EL PENDIENTE 19 PEDÍA EL BUSCADOR CON MAPA DENTRO DE LA FICHA y acá está, pero
             sobre OpenStreetMap y no sobre Google: Google Maps cobra por carga y pide cuenta de
             facturación, o sea un gasto mensual recurrente decidido en nombre de quien no lo
             pidió. Lo que se guarda sigue siendo un enlace de Google Maps —el acuerdo de la
             sesión 1— aunque el mapa que lo escribe sea otro. El día que exista la clave, se
             cambia la capa de baldosas y el dato guardado no se entera. */
          {
            key: '1.51',
            label: 'Ubicación en el mapa',
            tipo: 'mapa',
            enlace: true,
            col: 'c-tercio c-mapa',
            nivel: 'Completo',
            nota: 'Busca la dirección, toca el mapa o arrastra la marca; también sirve pegar un enlace de Google Maps. Lo que se guarda es siempre un enlace, así que leyendo la ficha se abre de un clic. El mapa es OpenStreetMap, que no cobra ni pide clave: el buscador acierta algo menos que el de Google, y por eso pegar el enlace a mano sigue siendo una salida válida.',
            traza: '✏ v1.2 (obs. #12). Acuerdo sesión 1 (01:13:45). Alimenta: GP.'
          },
          {
            key: '1.53',
            label: 'Croquis',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-bajo-riel',
            nivel: 'Completo',
            nota: 'Va debajo del mapa y en su columna porque es lo mismo que él: dónde vive esta persona, en imagen. Queda como respaldo opcional —el mapa lo sustituye funcionalmente— para quien todavía lo traiga en papel.',
            traza: '✏ v1.2. El estudio lo marca como a confirmar. Alimenta: GP.'
          }
        ]
      },
      {
        id: 'contacto',
        titulo: 'Datos de contacto',
        desc: 'Contacto personal, el que no depende de la empresa.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.36',
            label: 'Celular personal',
            html: 'tel',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Canal primario. *\'Hasta el técnico va a tener WhatsApp\'*. En operaciones el correo no llega.',
            traza: 'Alimenta: CC, GP, ON.'
          },
          {
            key: '1.38',
            label: 'Teléfono fijo',
            html: 'tel',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '1.39',
            label: 'Correo personal',
            html: 'email',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'No obligatorio — gran parte del personal operativo no tiene.',
            traza: 'Alimenta: CC, GP.'
          }
        ]
      },
      /* ── LA TARJETA CAJÓN, PARTIDA EN DOS ──────────────────────────────────────
         «Estado civil y ocupación» juntaba cinco campos que no tenían nada que ver: el estado
         civil, la profesión, la matrícula, la vivienda y el vehículo. Lo único que compartían
         era no tener sitio propio — y una tarjeta cuyo título es una lista de lo que hay dentro
         no es una sección, es un cajón.

         El estado civil se fue al documento de identidad, que es de donde se lo copia. Pasó
         antes por la tarjeta del nombre —el porqué de esa escala, y la advertencia sobre
         «Apellido de casada» que la justificaba, están escritos donde vive ahora—. Lo que
         quedaba eran dos cosas distintas y acá van separadas: lo que alguien sabe hacer, y lo
         que alguien tiene. */
      {
        id: 'profesion',
        titulo: 'Datos profesionales',
        desc: 'Lo que la persona sabe hacer, y con qué papel lo acredita. No es el puesto que ocupa hoy: de acá salen el reclutamiento interno, las promociones y la sucesión.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.32',
            label: 'Profesión u ocupación',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Reclutamiento interno, promociones, sucesión.',
            traza: 'Alimenta: DE, GP.'
          },
          {
            key: '1.33',
            label: 'Matrícula profesional',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Cargos que exigen registro vigente (médicos, contadores, ingenieros, abogados).',
            traza: 'Alimenta: GP.'
          },
        ]
      },
      {
        id: 'patrimonio',
        titulo: 'Datos patrimoniales',
        desc: 'Bienes propios que la empresa necesita conocer para calcular un reembolso o una prestación, no para juzgar a nadie.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.34',
            label: '¿Vivienda propia?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Perfil socioeconómico.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '1.35',
            label: '¿Vehículo propio?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Reembolso de combustible en cargos que lo requieren.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          }
        ]
      },

      /* ── LAS LICENCIAS VUELVEN CON LO DEMÁS DE LA PERSONA ──────────────────────
         Estaba en «Acceso y documentos», entre las credenciales del sistema y el rol, y ahí
         no encajaba: ese paso es qué puede hacer alguien DENTRO de esta aplicación —usuario,
         permisos, notificaciones—, y una licencia de conducir no es eso. Es un papel de la
         persona, que vale igual sin la aplicación.

         SUS OCHO CAMPOS SON 1.72 … 1.79, y el 1 los delata: el estudio ya los había numerado
         dentro del bloque de información personal. Estaban lejos de su familia por dónde
         cayeron en el mapa de pasos, no por lo que son.

         VA AL FINAL Y NO PEGADA A «DATOS PROFESIONALES», que es su pariente cercano, porque
         las dos últimas del paso son las de relleno opcional y ésta es la tercera: ocho campos
         que la mayoría deja vacíos y que sólo importan en los puestos donde importan —quien
         conduce, quien manipula alimentos, quien opera maquinaria—.

         EL ADJUNTO 1.79 SIGUE ESPEJADO EN «ARCHIVOS» del paso 8, igual que la fotografía y el
         carnet escaneado, que también viven en el paso 1 y se vuelven a ver allá. Esa tarjeta
         reúne los adjuntos de toda la ficha y no le cambia nada que éste se mude. */
      {
        id: 'licencias',
        titulo: 'Licencias y certificaciones',
        desc: 'Las que vencen: licencia de conducir, manipulación de alimentos, certificaciones de seguridad. Necesitan alerta de vencimiento.',
        propuesta: true,
        incierto: false,
        campos: [
          /* ── ERA UNA CAJA DE TEXTO Y ESTA TARJETA EXISTE PARA AVISAR VENCIMIENTOS ──
             Ése es el argumento entero. El aviso no es por persona sino por tipo —«¿quién
             tiene la licencia de conducir vencida antes del lunes?»— y esa pregunta se hace
             agrupando por este campo. En texto libre, tres personas escriben «Licencia de
             conducir», «Lic. de conducir» y «licencia conducir», y el grupo son tres grupos
             de uno. Es el mismo razonamiento por el que 0.2 dejó de ser texto libre.

             LAS OPCIONES SON LAS QUE LA PROPIA TARJETA YA NOMBRABA, ni una más: su descripción
             dice «licencia de conducir, manipulación de alimentos, certificaciones de
             seguridad» y la nota de este campo decía «licencia de conducir, manipulación de
             alimentos, operador de maquinaria». Estaban escritas como ejemplos de lo que había
             que tipear; ahora son la lista. Inventar más sería decidir por una operación que
             no conocemos.

             «MANIPULACIÓN DE ALIMENTOS» Y «CARNET DE SANIDAD» SON EL MISMO PAPEL y por eso van
             en una sola opción que dice los dos nombres. Dejarlos como dos opciones distintas
             reintroduce, dentro de la lista, exactamente el problema que la lista viene a
             resolver: el mismo carnet contado dos veces según cómo lo llame cada quien.

             Y LLEVA «OTRO» CON SU CAJA, como el tipo de documento (1.10b) y el parentesco
             (2.2b). El universo de certificaciones es abierto y depende del rubro: una lista
             cerrada acá obliga a mentir, y un campo que obliga a mentir envenena justo el dato
             por el que se agrupa. */
          {
            key: '1.72',
            label: 'Tipo de licencia o certificación',
            tipo: 'lista',
            opciones: [
              'Licencia de conducir',
              'Manipulación de alimentos (carnet de sanidad)',
              'Operador de maquinaria',
              'Certificación de seguridad industrial',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'De acá salen los avisos de vencimiento, que se mandan por tipo y no por persona. Si ninguna opción encaja, «Otro» abre una caja para escribirlo.',
            traza: 'Alimenta: GP, ON.'
          },
          {
            key: '1.72b',
            label: '¿Qué licencia o certificación?',
            ph: 'Manejo de sustancias peligrosas, trabajo en altura…',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Sólo aparece al elegir «Otro». Escrito igual dos veces, dos personas caen en el mismo aviso de vencimiento; escrito distinto, no.',
            traza: '↳ 1.72. Alimenta: GP, ON.'
          },
          {
            key: '1.73',
            label: 'Número de licencia',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.74',
            label: 'Categoría',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            traza: '⚫ para cargos de conducción. Alimenta: GP.'
          },
          {
            key: '1.75',
            label: 'País emisor',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.76',
            label: 'Fecha de emisión de la licencia',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.77',
            label: 'Fecha de vencimiento de la licencia',
            html: 'date',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Alerta anticipada obligatoria: *\'si la policía retiene el vehículo por licencia vencida, para la operación\'*.',
            traza: 'Alimenta: GP, ON.'
          },
          /* ── TRES DE LOS CUATRO ESTADOS SALEN DE LA FECHA; EL CUARTO NO SALE DE NINGÚN LADO ──
             «Vigente», «Por vencer» y «Vencida» son la fecha de vencimiento leída contra hoy, y
             por eso 1.78 es un derivado y no un desplegable: si se pudiera elegir a mano, una
             licencia con fecha de ayer podría estar marcada «Vigente» y las dos cosas serían
             ciertas al mismo tiempo en la misma ficha. Un dato que se puede deducir y además
             escribir es un dato que tarde o temprano se contradice.

             «SUSPENDIDA» ES OTRA COSA: no es el paso del tiempo, es un acto de quien emitió el
             papel —Tránsito retiene una licencia, un organismo revoca una certificación— y la
             ficha no tiene de dónde enterarse. No hay fecha, campo ni cálculo del que pueda
             salir. Así que se pregunta, que es la única respuesta honesta a «¿de dónde sacamos
             ese dato?»: lo sabe una persona de RR.HH. y lo marca acá.

             Y MANDA SOBRE EL CÁLCULO. Una licencia suspendida con fecha de vencimiento en el
             futuro sigue sin servir, así que estando marcada el estado dice «Suspendida» y no
             «Vigente». La fecha no deja de valer —cuando se levante la suspensión, el estado
             vuelve solo al que le corresponda por el calendario—.

             ARRANCA EN «NO» como 1.19 y 2.seg: los dos botones apagados significan en esta
             ficha «todavía no contestaron», y el caso raro no le cobra el precio al común. */
          {
            key: '1.78b',
            label: '¿Está suspendida?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Lo único de esta tarjeta que no se puede deducir: una suspensión la decide quien emitió el papel y alguien tiene que enterarse y marcarla. Manda sobre la fecha.',
            traza: 'Alimenta: GP, ON.'
          },
          {
            key: '1.78',
            label: 'Estado',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Sale de la fecha de vencimiento: vigente, por vencer dentro de 30 días, o vencida. «Suspendida» viene de la pregunta de al lado y pisa a las tres.',
            traza: 'Alimenta: GP.'
          },
          /* ── EL ADJUNTO ANCLA LA COLUMNA, COMO EN LAS DEMÁS TARJETAS CON PAPEL ─────
             Caía al final del flujo, y ahí el recuadro de subir archivo se lee como un campo
             más de la última fila en vez de como lo que es. `c-escaneo` lo manda a la columna
             1 y los otros campos fluyen a su derecha, igual que el carnet escaneado en
             «Documento de identidad» y el certificado de nacimiento en la tarjeta de
             nacimiento.

             Y POR LA MISMA RAZÓN QUE AQUÉLLOS: el papel es la FUENTE de lo que se teclea al
             lado. El número, la categoría, el país y las dos fechas se leen de la licencia
             escaneada; tenerla abierta a un costado mientras se copian es el trabajo real que
             esta tarjeta ordena. Al final del flujo, el papel llega cuando ya no sirve.

             NO SE TOCA EL 1.79 DE «ARCHIVOS», que es el mismo campo espejado en el paso 8. Ahí
             el riel del bloque ya es 1.17, y `conRieles` desancla a todos los rieles que
             compartan bloque: darle columna a éste le quitaría la suya a aquél y la tarjeta
             entera perdería su esquina. Allá es un adjunto de una lista, no la fuente de nada. */
          {
            key: '1.79',
            label: 'Documento adjunto',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Operativo',
            nota: 'El documento digitalizado es obligatorio para dar la licencia por registrada (01:24:00).',
            traza: '✏ v1.2.'
          }
        ]
      }
    ]
  },
  {
    key: 'entorno',
    n: 2,
    titulo: 'Información Familiar',
    corto: 'Familia',
    pista: 'Quiénes dependen, a quién avisar y su salud',
    tarjetas: [
      {
        id: 'emergencia',
        titulo: 'Datos de contactos de emergencia',
        desc: 'Al menos un contacto es obligatorio. Es el único bloque repetible del mínimo legal.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '2.rot1',
            label: 'Primer contacto',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Obligatorio: es el mínimo legal.'
          },
          {
            key: '2.1',
            label: 'Nombre completo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP, ON.'
          },
          /* ── LISTA ABIERTA, QUE NO ES LO MISMO QUE CAJA DE TEXTO ─────────────────────
             Era texto libre, obligatorio y del mínimo legal: la combinación exacta donde se
             acumulan «mamá», «Madre», «MADRE», «mi mamá» y «x». La ficha ya conocía el problema y
             lo tenía escrito en otro campo —«sin lista, tres personas escriben el mismo nombre de
             tres maneras y después nadie cruza nada»—.

             PERO CERRARLA DEL TODO SERÍA PEOR. A quien hay que avisar en una emergencia no tiene
             por qué ser de la familia: mucha gente pone a su vecina, a un amigo o a la persona con
             la que vive sin estar casada. Una lista sin esas opciones obliga a mentir, y un dato
             falso en el campo que se usa el día del accidente es peor que uno mal escrito.

             Por eso la lista cubre los casos de todos los días y termina en «Otro», que abre una
             caja al lado. Guardar la cadena «Otro» y perder el parentesco real sería el peor de
             los tres mundos: ni comparable ni cierto. */
          {
            key: '2.2',
            label: 'Parentesco',
            tipo: 'lista',
            opciones: [
              'Madre',
              'Padre',
              'Cónyuge',
              'Conviviente',
              'Hijo(a)',
              'Hermano(a)',
              'Abuelo(a)',
              'Tío(a)',
              'Primo(a)',
              'Amigo(a)',
              'Vecino(a)',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Si ninguna opción encaja, «Otro» abre una caja para escribirlo. Quien atiende una emergencia no siempre es de la familia.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.2b',
            label: '¿Qué parentesco?',
            ph: 'Cuñada, madrastra, casera…',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Sólo aparece al elegir «Otro». Así el dato real no se pierde detrás de la palabra «Otro».',
            traza: '↳ 2.2. Alimenta: GP.'
          },
          {
            key: '2.3',
            label: 'Teléfono principal',
            html: 'tel',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.4',
            label: 'Teléfono alternativo',
            html: 'tel',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.5',
            label: 'Correo electrónico',
            html: 'email',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '2.6',
            label: 'Dirección · Ciudad · País',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.7',
            label: '¿Convive con el colaborador?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.seg',
            label: '¿Agregar un segundo contacto?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Recomendado. Si el primero no contesta —apagado, de viaje, número cambiado— esta es la única alternativa que la ficha guarda, y este bloque se usa el día en que no hay tiempo de buscar otra.',
            traza: '↳ 2.1. Alimenta: GP.'
          },

          /* ── DOS CONTACTOS, PORQUE UNO ES UN SOLO PUNTO DE FALLO ─────────────────────
             Este bloque se usa UNA vez en la vida de una ficha, y es el peor día. Un solo
             número que no contesta —apagado, cambiado, la persona de viaje— es el dato
             fallando justo en lo único para lo que existía.

             EL ESTUDIO YA LO PEDÍA y la frase estaba en la bajada de esta misma tarjeta:
             «al menos un contacto es obligatorio, es el único bloque repetible del mínimo
             legal». Repetible nunca se implementó — ni acá, ni en «Beneficios individuales»
             ni en «Medidas disciplinarias», que dicen lo mismo entre paréntesis.

             DOS BLOQUES FIJOS NO ES REPETIBLE, y no pretende serlo: es lo que cabe en un
             formulario de clave y valor como éste. El segundo va completo pero sin exigirse,
             porque obligar a quien de verdad sólo tiene a una persona produce un contacto
             inventado — y un teléfono falso el día del accidente es peor que un hueco.

             LAS CLAVES LLEVAN «-2» y no un número nuevo: la numeración 2.x es del estudio y
             está casi llena, así que inventar 2.8 chocaría con el campo que el estudio tenga
             ahí el día que se porte. Esto es la misma pregunta, hecha por segunda vez. */
          {
            key: '2.rot2',
            label: 'Segundo contacto',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Recomendado, no obligatorio. Si el primero no contesta, esta es la única alternativa que la ficha guarda.'
          },
          {
            key: '2.1-2',
            label: 'Nombre completo',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: '↳ 2.1. Alimenta: GP.'
          },
          {
            key: '2.2-2',
            label: 'Parentesco',
            tipo: 'lista',
            opciones: [
              'Madre', 'Padre', 'Cónyuge', 'Conviviente', 'Hijo(a)', 'Hermano(a)',
              'Abuelo(a)', 'Tío(a)', 'Primo(a)', 'Amigo(a)', 'Vecino(a)', 'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: '↳ 2.2. Alimenta: GP.'
          },
          {
            key: '2.2b-2',
            label: '¿Qué parentesco?',
            ph: 'Cuñada, madrastra, casera…',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: '↳ 2.2-2. Alimenta: GP.'
          },
          {
            key: '2.3-2',
            label: 'Teléfono principal',
            html: 'tel',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Es el dato que justifica todo el bloque: sin teléfono, un segundo contacto no sirve de nada.',
            traza: '↳ 2.3. Alimenta: GP.'
          },
          {
            key: '2.4-2',
            label: 'Teléfono alternativo',
            html: 'tel',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Lo tenía el primer contacto y acá se había quedado fuera. Si este bloque existe para poder alcanzar a alguien, un segundo número es exactamente lo que no sobra.',
            traza: '↳ 2.4. Alimenta: GP.'
          },
          {
            key: '2.5-2',
            label: 'Correo electrónico',
            html: 'email',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: '↳ 2.5. Alimenta: GP.'
          },
          {
            key: '2.6-2',
            label: 'Dirección · Ciudad · País',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: '↳ 2.6. Alimenta: GP.'
          },
          {
            key: '2.7-2',
            label: '¿Convive con el colaborador?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Dos contactos que viven en la misma casa se quedan sin señal a la vez. Saberlo es lo que dice si de verdad son dos vías.',
            traza: '↳ 2.7. Alimenta: GP.'
          },
        ]
      },
      /* ── UNA TARJETA POR PARIENTE, QUE ES COMO SE LLENA ──────────────────────
         «Datos familiares» eran tres cosas distintas bajo un mismo título: el cónyuge, los
         hijos y los padres del colaborador. Dentro se separaban con rótulos, que es lo que se
         hace cuando no queda más remedio; acá sí quedaba, porque el paso ya agrupa por tarjetas
         y cada uno de los tres se llena —o se saltea— por su cuenta: soltero y sin hijos deja
         dos de las tres vacías y no tiene por qué recorrerlas.

         LOS PADRES NO SON UN APÉNDICE DE LOS HIJOS, y en la tarjeta única lo parecían por venir
         justo debajo. El rótulo tenía que aclararlo con todas las letras —«del colaborador, no
         de sus hijos»—, y una aclaración así es la señal de que el corte estaba en el sitio
         equivocado. Ahora lo dice el título.

         SE VAN DOS RÓTULOS Y SE QUEDA UNO. Los de cónyuge y padres repetían el título de su
         tarjeta, así que su nota se mudó al `desc` y el rótulo sobra. El de hijos se queda
         porque no es decorativo: lleva `repite` y es lo que numera los bloques —«Hijo 1»,
         «Hijo 2»— cuando se agrega más de uno. */
      {
        id: 'conyuge',
        titulo: 'Datos del cónyuge',
        desc: 'Cónyuge o conviviente. La unión libre cuenta igual que el matrimonio para las asignaciones familiares.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '2.9',
            label: 'Nombres y apellidos (estructurado)',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Beneficios: seguros, campañas de bienestar.',
            traza: 'Alimenta: CC, GP.'
          },
          /* ── UN CAMPO NO CONTESTA DOS PREGUNTAS ──────────────────────────────────
             «Tipo y número de documento» era una sola caja de texto para dos datos que no se
             parecen en nada: uno sale de un catálogo cerrado de cuatro opciones y el otro es un
             número que hay que copiar de un papel. Juntos entraban como cada quien quisiera
             —«CI 8452119», «8452119 CI», «carnet 8452119»— y después no hay forma de buscar por
             número, de validar el formato ni de saber qué documento era.

             ES EL MISMO CORTE QUE EL DEL COLABORADOR (1.10 y 1.11), con el mismo catálogo y por
             el mismo motivo: el documento de identidad del país que lo emitió. Las siglas se
             quedaron fuera de las opciones a propósito —«CI» trae dentro que es boliviano— y
             acá no hay razón para volver a meterlas.

             SIN LA CAJA DE «¿QUÉ DOCUMENTO?» que sí tiene 1.10. A esta persona no se la declara
             ante el Ministerio con este dato; el tipo y el número alcanzan para el trámite de
             beneficios, y cuatro campos condicionales más se mantienen solos. Si «Otro» empieza
             a aparecer seguido, la caja se agrega después: el corte de acá no estorba. */
          {
            key: '2.10',
            label: 'Tipo de documento',
            tipo: 'lista',
            opciones: [
              'Documento nacional de identidad',
              'Pasaporte',
              'Carnet de extranjero',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Respalda trámites de beneficios ante la aseguradora.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.10b',
            label: 'Número de documento',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El número, tal como figura en el documento. Sin la sigla adelante: el tipo ya está al lado.',
            traza: '↳ 2.10. Alimenta: GP.'
          },
          {
            key: '2.11',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: CC, GP.'
          },
          /* ── LA NACIONALIDAD SALE DE UN CATÁLOGO, NO DE LA CABEZA DE QUIEN ESCRIBE ──
             Era una caja de texto libre, y un país escrito a mano entra de cinco maneras
             —«Bolivia», «bolivia», «Boliviana», «BOL», «Bolívia»— que son cinco valores
             distintos para el mismo dato. Contar cuántos extranjeros hay en la ficha deja de
             poder hacerse en cuanto la primera se escribe diferente.

             ES LA MISMA LISTA QUE LA DEL COLABORADOR (1.25) y que la del país emisor (1.14).
             Que las tres digan lo mismo es el punto: cruzar la nacionalidad del cónyuge con la
             del titular tiene que ser comparar dos valores, no dos redacciones.

             VAN LOS PAÍSES Y NO LOS GENTILICIOS. «Bolivia» y no «Boliviana», que es como ya lo
             resolvió 1.25: el gentilicio tiene género y obliga a elegir uno por persona, y el
             país es el mismo para todos. */
          {
            key: '2.12',
            label: 'Nacionalidad',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'La misma lista de países que usan 1.25 y 1.14, para que los tres datos se puedan cruzar.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '2.13',
            label: 'Profesión u ocupación',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.14',
            label: 'Lugar / empresa de trabajo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Previene conflicto de interés si trabaja en la misma empresa.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.15',
            label: 'Número de celular',
            html: 'tel',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Contacto alternativo del colaborador. El celular y no el fijo: es donde se contesta.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.17',
            label: '¿Es beneficiario del seguro?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Se conserva: es lo que facilita los trámites de afiliación.',
            traza: 'Alimenta: GP, PL.'
          },
        ]
      },
      {
        id: 'hijos',
        titulo: 'Datos de los hijos',
        desc: 'Alimenta asignaciones familiares y el subsidio de lactancia. El bloque se repite por cada hijo.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '2.rotHijos',
            label: 'Hijos',
            singular: 'Hijo',
            repite: 'hijos',
            tipo: 'rotulo',
            col: 'c-todo'
          },
          {
            key: '2.20',
            repite: 'hijos',
            label: 'Nombre completo',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.21',
            repite: 'hijos',
            label: 'Tipo de documento',
            tipo: 'lista',
            opciones: [
              'Documento nacional de identidad',
              'Pasaporte',
              'Carnet de extranjero',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Un menor sin carnet propio suele identificarse con el certificado de nacimiento: va por «Otro».',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.21b',
            repite: 'hijos',
            label: 'Número de documento',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'El número, tal como figura en el documento.',
            traza: '↳ 2.21. Alimenta: GP.'
          },
          {
            key: '2.22',
            repite: 'hijos',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Beneficios por rango de edad, obsequios (Día del Niño, Día de la Familia).',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.23',
            repite: 'hijos',
            label: 'Sexo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Planificación de campañas y obsequios.',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.24',
            repite: 'hijos',
            label: 'Nacionalidad',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'La misma lista de países que usan 1.25 y 1.14, para que los tres datos se puedan cruzar.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '2.25',
            repite: 'hijos',
            label: 'Institución educativa',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Programas de apoyo educativo.',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.26',
            repite: 'hijos',
            label: 'Nivel educativo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Se conserva. *\'Puede servir para campañas de beneficios corporativos\'* (01:28:41).',
            traza: '✏ v1.2. Alimenta: CC, GP.'
          },
          {
            key: '2.28',
            repite: 'hijos',
            label: '¿Es beneficiario del seguro?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '2.29',
            repite: 'hijos',
            label: '¿Presenta discapacidad?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '28:41): se exige el certificado oficial adjunto. Relevante para beneficios y para el cumplimiento del 2 % de contratación de personas con discapacidad (regla R4).',
            traza: '✏ v1.2 (01. Alimenta: GP, PL.'
          },
          {
            key: '2.masHijos',
            tipo: 'repetir',
            grupo: 'hijos',
            label: 'Agregar otro hijo',
            col: 'c-todo',
            nivel: 'Operativo',
            nota: 'Cada hijo es un bloque igual al de arriba. El estudio ya lo pedía repetible y nunca lo fue: con un solo bloque, una familia de tres hijos entraba con uno declarado y dos sin asignación familiar.'
          },
        ]
      },
      {
        id: 'padres',
        titulo: 'Datos de los padres',
        desc: 'Del colaborador, no de sus hijos. Los pide el Ministerio de Trabajo en la declaración jurada.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '2.47',
            label: 'Nombre del padre',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: '➡ Movido desde 1.30. Detecta vínculos familiares entre colaboradores.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '2.48',
            label: 'Nombre de la madre',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: '➡ Movido desde 1.31.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          }
        ]
      },
      {
        id: 'herederos',
        titulo: 'Datos de beneficiarios y herederos',
        desc: 'Es una obligación legal y hoy no tiene dónde vivir. Cuando hace falta, ya es tarde para pedirla.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '2.rotBeneficiarios',
            label: 'Beneficiarios',
            singular: 'Beneficiario',
            repite: 'herederos',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'El bloque se repite por cada beneficiario. Los porcentajes de todos tienen que sumar 100 %.'
          },
          {
            key: '2.31',
            repite: 'herederos',
            label: 'Nombre completo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Dato necesario para el contrato laboral.',
            traza: 'Alimenta: GP.'
          },
          /* ── LA MISMA LISTA QUE EL PARENTESCO DEL CONTACTO DE EMERGENCIA (2.2) ───
             Doce opciones y una salida. No es una lista nueva: es la de 2.2 sin tocar una coma,
             y eso es el argumento entero. Los dos campos preguntan lo mismo —qué es esta persona
             del colaborador— y si cada uno lleva su catálogo, en tres meses uno dice «Hijo(a)» y
             el otro «Hijo/a», y cruzar «¿el heredero es el mismo que el contacto de emergencia?»
             pasa a ser comparar dos redacciones.

             Y VA LARGA A PROPÓSITO. Un beneficiario no es necesariamente de la familia: se puede
             dejar la indemnización a quien uno quiera, y por eso entran «Amigo(a)» y «Vecino(a)»
             junto a los parientes. Una lista de cinco parentescos obligaría a que la mitad de
             los casos reales salieran por «Otro», que es la manera de tener texto libre con un
             desplegable de por medio.

             «OTRO» ABRE CAJA, como allá. Sin ella, la ficha guarda la palabra «Otro» en el campo
             que dice quién cobra la indemnización, y el día que haga falta —que es el peor día
             para averiguarlo— no lo sabe nadie. */
          {
            key: '2.32',
            repite: 'herederos',
            label: 'Parentesco / Relación',
            tipo: 'lista',
            opciones: [
              'Madre',
              'Padre',
              'Cónyuge',
              'Conviviente',
              'Hijo(a)',
              'Hermano(a)',
              'Abuelo(a)',
              'Tío(a)',
              'Primo(a)',
              'Amigo(a)',
              'Vecino(a)',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Si ninguna opción encaja, «Otro» abre una caja para escribirlo. No hace falta ser de la familia para heredar.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.32b',
            repite: 'herederos',
            label: '¿Qué relación?',
            ph: 'Cuñada, ahijado, socia…',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Sólo aparece al elegir «Otro». Así el dato real no se pierde detrás de la palabra «Otro».',
            traza: '↳ 2.32. Alimenta: GP.'
          },
          {
            key: '2.33',
            repite: 'herederos',
            label: 'Tipo de documento',
            tipo: 'lista',
            opciones: [
              'Documento nacional de identidad',
              'Pasaporte',
              'Carnet de extranjero',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Necesario para el contrato.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.33b',
            repite: 'herederos',
            label: 'Número de documento',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Necesario para el contrato. Identifica al heredero sin ambigüedad el día que haya que pagarle.',
            traza: '↳ 2.33. Alimenta: GP.'
          },
          {
            key: '2.34',
            repite: 'herederos',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Determina si el heredero es mayor de edad.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.35',
            repite: 'herederos',
            label: 'Porcentaje de participación (%)',
            html: 'text',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Validación: la suma debe dar 100 %. 00:33): define *\'cuánto de la indemnización le van a dejar a esa persona\'*.',
            traza: '✏ v1.2 (00. Alimenta: GP, PL.'
          },

          /* ── TRES, Y EL TOPE ES UN NÚMERO EN UNA LÍNEA ─────────────────────────
             La tarjeta tenía un solo juego de campos y su propia nota prometía repartir entre
             varios: con un beneficiario, «la suma debe dar 100 %» se cumple sola o no se cumple
             nunca, y no hay tercera. Es el mismo agujero que tenían los hijos —el estudio los
             pedía repetibles y nunca lo fueron— y acá lo que no entraba era a quién se le deja
             la indemnización.

             EL TOPE SALE DE `max` Y NO DEL CÓDIGO DE LA PANTALLA, para que cambiarlo sea cambiar
             este 3. No hay ley que diga tres: es la decisión de la casa, y las decisiones de la
             casa se escriben donde se ven. */
          {
            key: '2.masBeneficiarios',
            tipo: 'repetir',
            grupo: 'herederos',
            max: 3,
            label: 'Agregar otro beneficiario',
            col: 'c-todo',
            nivel: 'Operativo',
            nota: 'Hasta tres. Cada uno es un bloque igual al de arriba, con su porcentaje.'
          },

          /* FUERA DEL BLOQUE A PROPÓSITO: es la cuenta de los tres juntos, así que se dibuja una
             vez y detrás del botón. Sin `repite`, la repetición no la alcanza. */
          {
            key: '2.35t',
            label: 'Total repartido',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'La suma de los porcentajes de arriba. Tiene que dar 100 %: es lo que decide cuánto cobra cada uno.',
            traza: '↳ 2.35.'
          }
        ]
      },
      {
        id: 'garantes',
        titulo: 'Datos de garantes',
        desc: 'Se activa según el cargo: los que manejan dinero o valores.',
        propuesta: true,
        incierto: false,
        campos: [
          /* ── EL NOMBRE, PARTIDO EN DOS ──────────────────────────────────────────
             «Nombre completo» era una caja y adentro entraban dos cosas en el orden que a cada
             quien le saliera: «Juan Pérez Rojas», «Pérez Rojas, Juan», «PEREZ ROJAS JUAN». Para
             un dato que va a un contrato que después se notaria, el orden no es un detalle de
             formato: es lo que el notario lee.

             Y NO SE PARTE EN CINCO como el del colaborador —primer nombre, segundo, tercero,
             apellidos— porque a un garante no se lo declara ante el Ministerio ni ante la
             Gestora: no hay una estructura oficial con la que tenga que coincidir. Dos campos
             separan lo que hay que separar y no piden más de lo que se sabe.

             ORDEN DE LECTURA Y NO DE DOCUMENTO: primero los nombres, después los apellidos, que
             es como se presenta una persona. La otra forma —apellidos primero— es la del índice
             y la del formulario de trámite, y esta ficha no es ninguna de las dos. */
          {
            key: '2.39',
            label: 'Nombre(s)',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Alimenta el contrato de garantía que luego se notaria.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.39b',
            label: 'Apellidos',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Los dos, si los tiene, en el orden en que figuran en su documento.',
            traza: '↳ 2.39. Alimenta: GP.'
          },
          {
            key: '2.40',
            label: 'Tipo de documento',
            tipo: 'lista',
            opciones: [
              'Documento nacional de identidad',
              'Pasaporte',
              'Carnet de extranjero',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Evita registros duplicados o incorrectos.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.40b',
            label: 'Número de documento',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Evita registros duplicados o incorrectos. Va al contrato de garantía que luego se notaria.',
            traza: '↳ 2.40. Alimenta: GP.'
          },
          /* EL PLURAL PROMETÍA UNA CAJA QUE NO ERA. «Teléfono(s)» con un solo campo invita a
             escribir dos separados por una barra, y entonces ninguno de los dos sirve para
             llamar desde el sistema ni para validarse. Uno, el que se contesta.

             Y CELULAR Y NO TELÉFONO, igual que el del cónyuge (2.15): a un garante hay que poder
             ubicarlo el día que se ejecuta la garantía, y ese día un fijo de oficina no alcanza. */
          {
            key: '2.41',
            label: 'Número de celular',
            html: 'tel',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Es donde se lo ubica el día que haya que ejecutar la garantía.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.42',
            label: 'Dirección',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.43',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Validación de identidad para el contrato.',
            traza: 'Alimenta: GP.'
          },

          /* ── EL LUGAR NO TENÍA DÓNDE ESCRIBIRSE ─────────────────────────────────
             El rótulo decía «Fecha y lugar de nacimiento» y el campo era `html: 'date'`: un
             selector de calendario. El lugar se pedía y no se podía contestar — no hay forma de
             teclear «Santa Cruz» en un calendario—, así que el dato no es que entrara mal,
             es que no entraba.

             Es el mismo corte que el de 1.21 y 1.22 en el paso 1, donde la fecha y el lugar del
             colaborador viven separados desde siempre. Acá venían pegados desde el estudio, que
             los listaba en una fila de su tabla, y al portarlos esa fila se volvió un campo. */
          {
            key: '2.43b',
            label: 'Lugar de nacimiento',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Ciudad y país, como figuran en su documento.',
            traza: '↳ 2.43. Alimenta: GP.'
          },
          /* ── EL ÚNICO CAMPO DE LA FICHA CON UNA REGLA COLGANDO Y SIN CATÁLOGO ───
             Su propia nota dice qué pasa con el valor: «si está casado, la garantía es
             compartida → exige registrar cónyuge». Eso es una regla, y una regla necesita
             comparar contra algo. Con texto libre no podía dispararse nunca: «Casado»,
             «casado(a)», «CASADO» y «Casada» son cuatro valores distintos y la condición
             acierta con uno como mucho.

             MISMAS CINCO OPCIONES QUE EL DEL COLABORADOR, que ya era lista desde el estudio.
             Que las dos digan lo mismo es lo que permite escribir la regla una vez.

             LA REGLA TODAVÍA NO EXISTE: esto le pone el catálogo, no el disparo. Lo que falta es
             la condición en `CONDICIONES` que abra los campos del cónyuge del garante, y antes
             de escribirla hay que contestar una pregunta que es legal y no de diseño: si «Unión
             libre» comparte la garantía igual que «Casado(a)». La nota se deja como estaba
             —habla sólo de casado— para no inventar la respuesta. */
          {
            key: '2.44',
            label: 'Estado civil',
            tipo: 'lista',
            opciones: [
              'Soltero(a)',
              'Casado(a)',
              'Divorciado(a)',
              'Viudo(a)',
              'Unión libre'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Si está casado, la garantía es compartida → exige registrar cónyuge.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.45',
            label: 'Tipo de garantía',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'No existe hoy. Inmueble, vehículo, salario fijo, certificado, asociación. *Campo abierto, no lista cerrada*. 03:54): confirmado como texto abierto con sugerencias, y el sistema debe generar reporte de garantías presentadas: *\'te puede pasar que te digan: ¿qué garantías presentó el chofer?\'*.',
            traza: '✏ v1.2 (00. Alimenta: GP.'
          },
          /* EL PAPEL DE LA GARANTÍA ANCLA LA TARJETA, como el carnet ancla la del documento y la
             foto la del nombre. Estaba declarado como un campo más y caía al final del flujo, en
             el hueco que quedara: un recuadro de subir archivo entre «Tipo de garantía» y el
             borde, leído como el último de la lista en vez de como lo que es.

             Y ES LO QUE ES PORQUE ES LA FUENTE. Los diez campos de al lado —nombre, documento,
             estado civil, tipo de garantía— salen de ese papel: quien llena la tarjeta lo tiene
             abierto y va copiando. Anclado a la izquierda, el papel y lo que dice el papel se
             miran a la vez, que es la única forma de comprobar que coinciden.

             `c-escaneo` Y NO `c-retrato`: el recuadro del papel es elástico —suelta su proporción
             y llena el alto del riel— y la tarjeta tiene diez campos que cubrir. Con el retrato,
             que mide 88 px y no se estira, sobraría media columna de aire debajo.

             Y SÓLO ACÁ: el otro `2.46` de este archivo, el de la tarjeta «Archivos» del último
             paso, se queda sin riel a propósito. Allá es un adjunto de una lista y no la fuente
             de nada, y `conRieles` desancla a todos los rieles que compartan bloque: darle
             columna le quitaría la suya al que sí la necesita. */
          {
            key: '2.46',
            label: 'Documento de garantía',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            insignia: 'v1.2',
            nivel: 'Operativo'
          }
        ]
      },
      {
        id: 'medica',
        titulo: 'Datos médicos',
        desc: 'Lo que hace falta saber si algo pasa en el puesto de trabajo.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.54',
            label: 'Tipo de sangre',
            tipo: 'lista',
            opciones: [
              'O+',
              'O-',
              'A+',
              'A-',
              'B+',
              'B-',
              'AB+',
              'AB-'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Emergencia médica; requerido en licitaciones de empresas de servicios.',
            traza: 'Alimenta: GP.'
          },

          {
            key: '1.56',
            detalle: '1.56b',
            label: '¿Tiene alergias conocidas?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Sobre todo a medicamentos: es lo que no se le puede administrar en una urgencia. Viene del formulario actual de Trabajito.',
            traza: 'Alimenta: GP.'
          },

          /* MISMA FORMA QUE EL DETALLE DE LA MEDICACIÓN (1.58b), y a propósito: son la misma
             pregunta hecha dos veces —qué no se le puede dar a esta persona— y contestarlas de
             dos maneras distintas obligaría a aprender el formulario dos veces.

             EL EJEMPLO DEL MARCADOR EMPIEZA POR UN MEDICAMENTO. «Alergia» hace pensar primero
             en el polen, y la que importa acá es la otra: una alergia a la penicilina escrita
             en la ficha es lo que evita que se la pongan. El marcador es donde se dice eso sin
             gastar un renglón en decirlo. */
          {
            key: '1.56b',
            label: '¿Cuál o cuáles?',
            tipo: 'texto',
            col: 'c-ancho',
            nivel: 'Operativo',
            ph: 'Penicilina, mariscos, látex, picadura de abeja…',
            ayuda: 'Si tiene alergias, detalle su alergia.',
            traza: '↳ 1.56. Alimenta: GP.'
          },
          /* ── LAS TRES PRIMERAS SON LAS DE UNA URGENCIA, Y EN ESE ORDEN ───────────
             Con qué sangre se le puede transfundir, a qué es alérgico y qué está tomando ya.
             Las tres contestan la misma pregunta desde tres lados —qué se le puede y qué no se
             le puede dar— y el estudio las tenía repartidas entre otras, en el orden en que
             caían en su tabla. La condición crónica y la recomendación médica van después:
             importan para el puesto, no para el minuto siguiente.

             Y ALERGIAS ANTES QUE MEDICACIÓN porque si sólo se alcanza a leer una, pesa más.

             Y SE LE CAE EL «+ DETALLE» DEL RÓTULO, que era una promesa escrita en el nombre del
             campo y no cumplida en ninguna parte: detrás sólo había un Sí/No. Ahora el detalle
             existe, así que el rótulo no tiene que anunciarlo — lo anuncia apareciendo. */
          {
            key: '1.58',
            detalle: '1.58b',
            label: '¿Toma medicación regular?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Lo que ya toma decide qué no se le puede administrar en una urgencia.',
            traza: 'Alimenta: GP.'
          },

          /* ── EL DETALLE, Y POR QUÉ ESTRENA `ayuda` ───────────────────────────────
             La instrucción va en un renglón gris DEBAJO del campo y no escondida detrás del
             «?». Las dos formas están declaradas en `TarjetaCampos` y hasta hoy la ficha usaba
             sólo la nota, con un motivo escrito: ochenta renglones grises seguidos son una
             pared que nadie lee.

             ACÁ NO HAY OCHENTA, HAY UNO Y A VECES NINGUNO. El campo aparece sólo al contestar
             que sí, es el único de la tarjeta con ayuda, y lo que tiene que decir hay que
             leerlo ANTES de escribir, no después de preguntarse qué se esperaba. Una nota
             detrás del «?» se lee cuando ya es tarde.

             ANCHO Y DE VARIAS LÍNEAS porque la respuesta real es una lista —tres medicamentos
             con su dosis— y en una caja de un tercio de fila eso entra de costado. */
          {
            key: '1.58b',
            label: '¿Cuál o cuáles?',
            tipo: 'texto',
            col: 'c-ancho',
            nivel: 'Completo',
            ph: 'Nombre del medicamento, dosis y cada cuánto lo toma',
            ayuda: 'Si toma algún medicamento, detalle cuál/es.',
            traza: '↳ 1.58. Alimenta: GP.'
          },
          /* SE RETIRA «FACTOR RH» (1.55), QUE YA VENÍA CONTESTADO EN EL CAMPO DE ARRIBA.
             El tipo de sangre es una lista cerrada de ocho —O+, O−, A+, A−, B+, B−, AB+, AB−—
             y ese signo ES el factor RH. Quien elegía «A−» tenía debajo una caja pidiéndole el
             RH otra vez.

             Y NO ERA SÓLO REDUNDANTE, ERA CONTRADECIBLE: la caja era texto libre, así que se
             podía elegir «A−» y escribir «positivo». En un campo cuya nota dice «emergencia
             médica» eso no es un duplicado incómodo, es una ficha que puede afirmar dos cosas
             incompatibles sobre la sangre de alguien.

             El campo venía así del estudio, donde tipo y factor eran dos filas de una tabla.
             Al portarlo, el tipo se resolvió como lista combinada —que es como se escribe un
             grupo sanguíneo en cualquier carnet— y la fila del factor se quedó sin trabajo. */
          {
            key: '1.57',
            detalle: '1.57b',
            label: '¿Tiene condición crónica?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Incluye el caso \'¿Es hipertenso?\' que el Salar tenía suelto en *Curiosidades*.',
            traza: 'Alimenta: GP.'
          },

          /* EL TERCERO CON LA MISMA FORMA. La nota del campo de arriba dice que esto absorbió el
             «¿Es hipertenso?» que el Salar tenía suelto: una pregunta por enfermedad, que es la
             manera de tener un formulario que crece para siempre y aun así nunca acierta. Una
             pregunta general con su detalle abierto cubre la hipertensión, la diabetes y las
             que nadie pensó, y se escribe una vez.

             SIN EJEMPLOS EN EL MARCADOR, al revés que los otros dos. Ahí los ejemplos ayudan a
             acertar con el formato —un medicamento con su dosis, una alergia concreta—; acá una
             lista de enfermedades en gris invita a elegir de entre ellas, y lo que hace falta es
             lo que esta persona tenga. El marcador dice cómo escribirlo, no qué. */
          {
            key: '1.57b',
            label: '¿Cuál o cuáles?',
            tipo: 'texto',
            col: 'c-ancho',
            nivel: 'Operativo',
            ph: 'La condición, y desde cuándo la tiene',
            ayuda: 'Si tiene una condición crónica, detalle cuál.',
            traza: '↳ 1.57. Alimenta: GP.'
          },
          {
            key: '1.59',
            detalle: '1.59b',
            label: '¿Tiene recomendación médica?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Lo que un médico indicó sobre su trabajo: no levantar peso, no turnos de noche, pausas. No es un diagnóstico.',
            traza: 'Alimenta: GP.'
          },

          /* EL CUARTO Y ÚLTIMO «+ DETALLE» DE LA TARJETA. Con éste, los cuatro rótulos que
             prometían un detalle desde que se portó el estudio por fin lo tienen: hasta hoy la
             ficha preguntaba si hay algo y no dejaba decir qué, que es preguntar por preguntar.

             ÉSTE ES EL QUE MÁS FALTA HACÍA DE LOS CUATRO. Los otros tres describen a la
             persona; éste describe una INSTRUCCIÓN —«no levantar más de diez kilos», «sin
             turnos de noche»— y un sí a secas no sirve para nada: quien asigna el puesto
             necesita saber cuál es la restricción, no que exista una.

             Y ES DONDE TERMINAN LAS «RESTRICCIONES MÉDICAS» QUE RETIRAMOS. Aquel campo era una
             caja libre suelta al final de la tarjeta, sin pregunta que la gobernara y sin decir
             quién lo había indicado. Acá lo mismo vive colgando de su pregunta, y con el examen
             preocupacional a un acordeón de distancia como respaldo firmado. */
          {
            key: '1.59b',
            label: '¿Cuál o cuáles?',
            tipo: 'texto',
            col: 'c-ancho',
            nivel: 'Completo',
            ph: 'Qué recomendó, quién la emitió y hasta cuándo rige',
            ayuda: 'Si un médico le dio alguna recomendación o restricción, detállela.',
            traza: '↳ 1.59. Alimenta: GP.'
          },

          /* ── LA DISCAPACIDAD SE PREGUNTA CON LO DEMÁS Y SE DETALLA SI HAY ────────
             Venía en tarjeta aparte, y el argumento estaba escrito allá: no es un dato de salud
             sino legal —cuenta para la cuota del 2 % y es columna obligatoria de la planilla del
             Ministerio—. El argumento sigue siendo cierto y aun así pierde, porque quien llena
             la ficha no reparte las preguntas por a qué sistema alimentan: contesta seguido lo
             que le preguntan del cuerpo de la persona, y esto es una de esas preguntas. Que
             además tenga efectos legales lo dice su insignia, que viaja con el campo.

             Y EL DETALLE SÓLO SI LA RESPUESTA ES SÍ. «Tipo y grado» estaba siempre a la vista, y
             para el 97 % de las fichas era una caja vacía que no se puede llenar sin mentir. Es
             el mismo trato que reciben «¿Qué documento?» y «¿Qué parentesco?»: la pregunta
             general se contesta primero y la que la completa aparece cuando hace falta.

             SE QUEDA EN «OPERATIVO» Y SIN ASTERISCO, que es como estaba. La pregunta de arriba
             sí es del mínimo legal; el detalle no lo era y convertirlo en obligatorio es una
             decisión de proceso, no de maquetación. Escondido no cuenta para el progreso, que
             es lo que hace `seVe`. */
          {
            key: '1.60',
            detalle: '1.61',
            label: '¿Tiene discapacidad?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: '2 % obligatorio de la planilla; se fiscaliza contra la OVT.',
            traza: 'Alimenta: GP, PL.'
          },
          /* ── TIPO Y GRADO SON DOS PREGUNTAS Y LAS DOS TIENEN CATÁLOGO ───────────
             Era una caja de texto con dos cosas dentro, y ninguna de las dos se contesta
             libremente: la Ley 223 define en su artículo 5 los seis tipos y los cuatro grados,
             y son los que van impresos en el carnet que emite el Estado. Escritos a mano
             entraban como «física», «Motriz», «fisica-motora» o «40 % motora», y este dato se
             fiscaliza contra la OVT — no es un campo donde la redacción de cada quien dé igual.

             SEIS TIPOS, NO SIETE, Y NO HAY «SENSORIAL». Visual y auditiva son categorías
             propias en la ley; «sensorial» aparece sólo como adjetivo dentro de las
             definiciones generales, nunca como tipo catalogado. Se comprobó en el texto del
             artículo, no de memoria: una lista inventada acá sería peor que la caja de texto,
             porque parece autoridad — que es justo el argumento que este archivo ya usa para
             NO inventar catálogos de provincias fuera de Bolivia.

             Y SIN PORCENTAJE. El artículo 5 califica los grados por criterios funcionales
             —cuánta asistencia de otra persona hace falta— y no menciona ninguna cifra. Si el
             carnet de acá trae un porcentaje impreso y la planilla lo pide, va en un campo
             propio; deducirlo del grado sería inventarse la equivalencia.

             LOS LITERALES ESTÁN POR CONFIRMAR CONTRA UN CARNET, y así lo dice la nota. Se
             leyeron de un compilador privado del texto legal, no de la Gaceta Oficial, y para
             un catálogo cerrado que después hay que cruzar con un papel oficial eso no alcanza
             del todo. La estructura —seis y cuatro— sí es firme. */
          {
            key: '1.61',
            label: 'Tipo de discapacidad',
            tipo: 'lista',
            opciones: [
              'Física o motora',
              'Visual',
              'Auditiva',
              'Intelectual',
              'Mental o psíquica',
              'Múltiple'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Los seis tipos del artículo 5 de la Ley 223. Va el que figura en el carnet de discapacidad; confirmar los literales contra un carnet antes de cerrar el catálogo.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.61b',
            label: 'Grado de discapacidad',
            tipo: 'lista',
            opciones: [
              'Leve',
              'Moderada',
              'Grave',
              'Muy grave'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Los cuatro grados del artículo 5 de la Ley 223. La ley los califica por cuánta asistencia hace falta, no por porcentaje.',
            traza: '↳ 1.61. Alimenta: GP, PL.'
          },

          /* SE RETIRAN «RESTRICCIONES MÉDICAS» (1.69) Y «OBSERVACIONES MÉDICAS» (1.70).
             Eran dos cajas de texto libre al final de la tarjeta y las dos repetían lo que los
             cuatro campos de arriba ya preguntan con estructura: una alergia va en 1.56, una
             condición crónica en 1.57, una medicación en 1.58 y una recomendación del médico en
             1.59, cada una con su Sí/No y su detalle. Lo que quedaba para estas dos era todo lo
             demás, que es otra forma de decir cualquier cosa.

             Y UNA CAJA LIBRE EN LA TARJETA MÉDICA NO ES UN CAMPO CUALQUIERA: es donde termina
             escrito el diagnóstico de alguien, en una ficha que ve todo RR.HH. Los cuatro de
             arriba preguntan lo que la empresa necesita saber para un puesto de trabajo; un
             renglón abierto invita a guardar historial clínico, que no es lo mismo y no le toca
             a este sistema.

             LAS RESTRICCIONES DE VERDAD YA TIENEN SITIO, y con respaldo: el examen
             preocupacional de la tarjeta de al lado es el documento donde un médico las declara
             y las firma. Dicho ahí valen; dichas acá eran el recuerdo de alguien. */
        ]
      },
      {
        id: 'discapacidad',
        titulo: 'Tutela y protecciones',
        desc: 'Ser tutor de una persona con discapacidad da protecciones propias y cuenta dentro del 2 % legal, aunque la discapacidad no sea suya.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.62',
            label: '¿Es tutor de persona con discapacidad?',
            tipo: 'siNo',
            detalle: '1.62b',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Cuenta dentro del 2 % legal, igual que si la discapacidad fuera suya.',
            traza: 'Alimenta: GP, PL.'
          },

          /* ── DE QUIÉN, Y LA LISTA SALE DE LOS HIJOS QUE YA SE DECLARARON ────────
             Un «sí» a secas no sirve para lo que este campo existe: el 2 % se fiscaliza contra
             la OVT y lo que se presenta es el certificado de discapacidad de una persona
             concreta. Sin nombre, la ficha afirma un derecho y no dice de dónde sale.

             Y LA FICHA YA SABE A QUIÉN OFRECER: los hijos están escritos tres tarjetas más
             arriba. Volver a teclear el nombre del propio hijo, en la misma pantalla donde se
             acaba de escribir, es la clase de trabajo que un formulario tiene que ahorrar —y de
             paso evita que el nombre entre dos veces con dos grafías.

             SE OFRECEN TODOS Y NO SÓLO LOS QUE TIENEN LA DISCAPACIDAD MARCADA (2.29). Filtrar
             parecía lo riguroso y en pantalla era una lista vacía: quien no había contestado ese
             campo veía «Otra persona» sola y ninguna pista de qué le faltaba.

             PERO LA TUTELA NO ES SÓLO DE HIJOS, y por eso la lista lleva salida. Se puede ser
             tutor de un hermano, de un padre mayor o de alguien sin parentesco: cerrar la lista
             a los hijos convertiría el campo en una trampa para el caso que no encaja. «Otra
             persona» abre una caja, como «Otro» en el tipo de documento y en el parentesco.

             SIN HIJOS DECLARADOS LA LISTA NO DESAPARECE: queda con «Otra persona» sola, que
             sigue siendo una respuesta y no un desplegable vacío. Las opciones las arma
             `tarjetasDe`, que es donde hay formulario a mano. */
          {
            key: '1.62b',
            label: '¿De quién?',
            tipo: 'lista',
            opciones: ['Otra persona'],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Se ofrece toda la gente que ya está escrita en el paso: contactos de emergencia, cónyuge, hijos y padres. Si es alguien que no está —un hermano, un sobrino, alguien sin parentesco— se elige «Otra persona» y se escribe quién.',
            traza: '↳ 1.62. Alimenta: GP, PL.'
          },
          {
            key: '1.62c',
            label: '¿Quién?',
            ph: 'Nombre y parentesco',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Sólo aparece al elegir «Otra persona».',
            traza: '↳ 1.62b. Alimenta: GP, PL.'
          }
        ]
      },
      {
        id: 'segprivado',
        titulo: 'Datos de seguro médico privado',
        desc: 'Adicional al de la Caja. No reemplaza la afiliación obligatoria.',
        propuesta: false,
        incierto: false,
        campos: [
          /* UN SÍ/NO SE PREGUNTA, NO SE ENUNCIA. El rótulo era «Seguro médico privado» con dos
             botones debajo, que es un título con una respuesta colgando: hay que deducir qué
             se está contestando. Las otras nueve preguntas cerradas de la ficha llevan signos
             de interrogación y ésta se quedó fuera al portarse — en el estudio era una fila de
             una tabla, y una fila de tabla no necesita preguntar nada. */
          {
            key: '1.63',
            label: '¿Tiene seguro médico privado?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Adicional al de la Caja: no genera aporte de ley, es un beneficio. Dicho que sí, se piden el proveedor y el número.',
            traza: 'Alimenta: GP, PL.'
          },

          /* ── EL PROVEEDOR Y EL NÚMERO, SÓLO SI HAY SEGURO QUE DESCRIBIR ─────────
             Estaban siempre a la vista, y para quien no tiene seguro privado —que en esta
             empresa es la mayoría— eran dos cajas que no se pueden llenar sin inventar. Mismo
             trato que «Tipo y grado de discapacidad» y por la misma razón: la pregunta general
             se contesta primero y lo que la completa aparece cuando hace falta.

             SON DOS Y NO UNO PORQUE SE ESCONDEN JUNTOS: un proveedor sin número o un número sin
             proveedor no sirven para reclamar nada. */
          {
            key: '1.64',
            label: 'Proveedor del seguro privado',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'La aseguradora con la que está contratado.',
            traza: '↳ 1.63. Alimenta: GP, PL.'
          },
          {
            key: '1.65',
            label: 'Número de asegurado (privado)',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'El que le da la aseguradora, no el de la Caja.',
            traza: '↳ 1.63. Alimenta: GP, PL.'
          }
        ]
      },
      {
        id: 'examenes',
        titulo: 'Exámenes ocupacionales',
        desc: 'No son datos de la persona: son obligaciones de la empresa, con fecha de vencimiento. El preocupacional protege ante un reclamo por enfermedad profesional.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.66',
            label: 'Examen preocupacional — ¿cuenta? / fecha / vencimiento / adjunto',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Obligación legal para toda industria. Crítico para defenderse de demandas. Se agrupan campo + fecha, corrigiendo el desorden del Salar. ✏️ v1.2 (obs. #13): documentar el caso Farmacorp como referencia de implantación en empresa con alto volumen de personal'
          },
          {
            key: '1.67',
            label: 'Examen intraocupacional — ¿cuenta? / fecha / vencimiento / adjunto',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Anual'
          },
          {
            key: '1.68',
            label: 'Examen postocupacional — ¿cuenta? / fecha / adjunto',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Se exige en fiscalizaciones; determina el estado de salud al retiro'
          }
        ]
      }
    ]
  },
  {
    key: 'puesto',
    n: 3,
    titulo: 'Información Laboral',
    corto: 'Laboral',
    pista: 'Dónde encaja en la estructura de la empresa',
    tarjetas: [
      {
        id: 'posicion',
        titulo: 'Información organizacional',
        desc: 'De acá cuelga todo lo demás: sin estructura cargada, estos selectores vienen vacíos y el alta no se puede completar.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.1',
            label: 'Código de colaborador',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Identidad única. Sustituye a los tres códigos duplicados del Salar (colaborador / asistencia / comedor). *\'Es el mismo código. No entiendo por qué no lo han conglomerado\'*.'
          },
          {
            key: '3.2',
            label: 'Empresa',
            tipo: 'lista',
            opciones: [
              'TRABAJITO GROUP SRL'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true
          },
          {
            key: '3.7',
            label: 'Región',
            tipo: 'lista',
            opciones: [
              'Occidente',
              'Oriente'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Peldaño del eje físico del organigrama. Identifica el departamento de trabajo.',
            traza: 'Alimenta: AS, GP.'
          },
          {
            key: '3.8',
            label: 'Sucursal',
            tipo: 'lista',
            opciones: [
              'TRABAJITO BOLIVIA',
              'TRABAJITO SANTA CRUZ',
              'TRABAJITO EL ALTO'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Peldaño del eje físico del organigrama, no del organizacional. ≠ sucursal regulatoria. Ver §5.3.3.',
            traza: 'Alimenta: AS, ERP, GP.'
          },
          {
            key: '3.10',
            label: 'Centro de trabajo',
            tipo: 'lista',
            opciones: [
              'Oficina Central',
              'Planta Santa Cruz',
              'Almacén El Alto'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El sitio concreto donde se trabaja y se marca asistencia. Absorbe a «Oficina» (3.9): oficina, planta, almacén o taller son clases de centro, no un peldaño aparte.',
            traza: 'Alimenta: AS, GP.'
          },
          {
            key: '3.3',
            label: 'Unidad de negocio',
            tipo: 'lista',
            opciones: [
              'Retail',
              'Corporativo',
              'Servicios'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Renombrar y consolidar: en el Salar \'unidad de negocio\' y \'jefatura\' son lo mismo.',
            traza: 'Alimenta: ERP, GP.'
          },
          {
            key: '3.5',
            label: 'Unidad organizacional',
            tipo: 'lista',
            opciones: [
              'Operaciones',
              'Ventas',
              'RH',
              'Marketing',
              'Tecnología'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Renombrado desde *\'Área / Departamento\'*. Es el nombre del nivel en el organigrama y admite Área, Subárea, Departamento o Equipo según cómo cada empresa haya modelado su estructura.',
            traza: '✏ v1.2 (obs. #24). Alimenta: CC, DE, GP.'
          },
          {
            key: '3.11',
            label: 'Cargo',
            tipo: 'lista',
            opciones: [
              'Project Manager',
              'Líder de Atención',
              'Desarrollador',
              'Pasante de QA',
              'Ejecutivo Comercial',
              'Asistente'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true
          },
          {
            key: '3.12',
            label: 'Categoría del puesto (Obrero / Administrativo)',
            tipo: 'lista',
            opciones: [
              'Administrativo',
              'Obrero'
            ],
            col: 'c-medio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Regla legal dura. Obrero de producción: aguinaldo y prima desde el primer mes. Administrativo: 3 meses y 1 día. Es atributo del puesto, no del contrato.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.42b',
            label: 'Modalidad de trabajo',
            tipo: 'lista',
            opciones: [
              'Presencial',
              'Híbrido',
              'Remoto'
            ],
            col: 'c-medio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Traído desde Condiciones de contratación (antes 3.20). Presencial · Híbrido · Remoto. Condiciona la marcación virtual (§5.3.5.B).',
            traza: '✏ v1.2 (obs. #28). Alimenta: AS, GP.'
          }
        ]
      },
      {
        id: 'costo',
        titulo: 'Imputación contable',
        desc: 'Dónde impacta el gasto del sueldo. El centro de costo debe admitir reparto porcentual entre varios.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.17',
            label: 'Centro de costo',
            tipo: 'lista',
            opciones: [
              'CC-100 Administración',
              'CC-200 Operaciones',
              'CC-300 Comercial'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Debe soportar distribución porcentual entre varios centros (ej. 50/50). Validación: suma = 100 %.',
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.18',
            label: 'Proyecto asignado',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Si aplica.',
            traza: 'Alimenta: ERP.'
          },
          {
            key: '3.19',
            label: 'Cliente asignado',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Si aplica (servicios in-house).',
            traza: 'Alimenta: ERP.'
          }
        ]
      },
      {
        id: 'jefaturas',
        titulo: 'Jefaturas y aprobaciones',
        desc: 'Son campos distintos a propósito: quien manda no siempre es quien firma. El jefe directo de un cajero puede ser el supervisor de sucursal, y quien le aprueba las vacaciones, la gerencia de operaciones.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.13',
            label: 'Supervisor inmediato',
            tipo: 'lista',
            opciones: [
              'Emilia Pessoa Rotger',
              'Ruth Mariscal Rivero',
              'Carolina Arze López',
              'Alejandro Tapia Fernández',
              'Natalia Ziade Mareño'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: DE, GP, ON.'
          },
          {
            key: '3.14',
            label: 'Cargo del supervisor',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: DE, GP.'
          },
          {
            key: '3.15',
            label: 'Supervisor funcional',
            tipo: 'lista',
            opciones: [
              'Emilia Pessoa Rotger',
              'Natalia Ziade Mareño'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '*\'anotar más de una persona\'*. Son las personas con las que coordina en el día a día sin depender de ellas. Alimenta la evaluación de desempeño funcional — caso real: una analista contable evaluada por su jefa estructural y por las dos gestoras con las que coordina (00:42:57). Ver §4.2.',
            traza: '✏ v1.2 (obs. #26). Alimenta: DE, GP.'
          },
          {
            key: '3.16',
            label: '¿Quién aprueba sus permisos?',
            tipo: 'lista',
            opciones: [
              'Emilia Pessoa Rotger',
              'Natalia Ziade Mareño'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Renombrado. Antes *\'Aprobador suplente / delegación\'*. *\'Tenemos que tener uno que diga quién le aprueba los permisos, más no suplentes\'* (00:09:02). Por defecto se autocompleta con el supervisor inmediato (3.13), pero puede ser otra persona.',
            traza: '✏ v1.2 (obs. #27). Alimenta: AS, GP.'
          },
          {
            key: '3.16b',
            label: 'Aprobador suplente / delegación temporal',
            tipo: 'lista',
            opciones: [
              'Ruth Mariscal Rivero'
            ],
            col: 'c-medio',
            insignia: 'v1.2',
            nivel: 'Completo',
            nota: 'A EVALUAR. *\'Quizás no es tan necesario\'*. Resuelve el caso sin solución del Salar —superior fuera del sistema ⇒ nadie puede aprobar— pero puede no justificar un campo propio. Ver pendiente 20.',
            traza: '✏ v1.2 (obs. #25). El estudio lo marca como a confirmar. Alimenta: AS, GP.'
          }
        ]
      },
      {
        id: 'contactoLab',
        titulo: 'Contacto corporativo',
        desc: 'El que da la empresa, distinto del personal.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.22',
            label: 'Correo corporativo',
            html: 'email',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Único lugar donde vive. Ya no se refleja en Contacto (1.40).',
            traza: '✏ v1.2 (obs. #11). Alimenta: CC, DE, GP, ON.'
          },
          {
            key: '3.23',
            label: 'Celular corporativo',
            html: 'tel',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Único lugar donde vive. Ya no se refleja en Contacto (1.41).',
            traza: '✏ v1.2 (obs. #9). Alimenta: GP.'
          }
        ]
      }
    ]
  },
  {
    key: 'perfil',
    n: 4,
    titulo: 'Perfil profesional',
    corto: 'Perfil',
    pista: 'Su formación, su trayectoria y su desarrollo',
    tarjetas: [
      {
        id: 'perfilProfesional',
        titulo: 'Datos de perfil profesional',
        desc: 'El perfil profesional y curricular del colaborador: qué estudió, dónde trabajó, qué acredita, qué idiomas y herramientas maneja y quién da fe de ello.',
        propuesta: true,
        incierto: false,
        campos: [
          { key: 'pf.rotFormacion', label: 'Formación académica', singular: 'Formación', repite: 'formacion', tipo: 'rotulo', col: 'c-todo' },
          {
            key: 'pf.1',
            repite: 'formacion',
            label: 'Nivel académico',
            tipo: 'lista',
            opciones: ['Bachiller', 'Técnico medio', 'Técnico superior', 'Licenciatura', 'Diplomado', 'Especialidad', 'Maestría', 'Doctorado'],
            col: 'c-tercio',
            nivel: 'Operativo'
          },
          { key: 'pf.2', repite: 'formacion', label: 'Título obtenido', col: 'c-tercio', nivel: 'Operativo', ph: 'Licenciado en Contaduría Pública' },
          { key: 'pf.3', repite: 'formacion', label: 'Carrera / Especialidad', col: 'c-tercio', nivel: 'Operativo', ph: 'Contaduría Pública' },
          { key: 'pf.4', repite: 'formacion', label: 'Institución educativa', col: 'c-tercio', nivel: 'Operativo' },
          {
            key: 'pf.5',
            repite: 'formacion',
            label: 'País',
            tipo: 'lista',
            opciones: [
              'Bolivia',
              'Argentina',
              'Brasil',
              'Chile',
              'Colombia',
              'Ecuador',
              'Perú',
              'Paraguay',
              'Uruguay',
              'Venezuela',
              'España',
              'EE.UU.',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'La misma lista de países que usan 1.25 y 1.14, para poder cruzar dónde estudió con dónde nació o reside.'
          },
          { key: 'pf.6', repite: 'formacion', label: 'Ciudad', col: 'c-tercio', nivel: 'Completo' },
          {
            key: 'pf.7',
            repite: 'formacion',
            label: 'Modalidad de estudio',
            tipo: 'lista',
            opciones: ['Presencial', 'Semipresencial', 'Virtual'],
            col: 'c-tercio',
            nivel: 'Completo'
          },
          { key: 'pf.8', repite: 'formacion', label: 'Fecha de inicio', html: 'date', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.9', repite: 'formacion', label: 'Fecha de finalización', html: 'date', col: 'c-tercio', nivel: 'Completo' },
          {
            key: 'pf.10',
            repite: 'formacion',
            label: 'Estado',
            tipo: 'lista',
            opciones: ['En curso', 'Finalizado', 'Abandonado'],
            col: 'c-tercio',
            nivel: 'Operativo'
          },
          /* EL TÍTULO ANCLA SU BLOQUE, como el carnet y la licencia anclan los suyos: el nivel, el
             título, la institución y las fechas se copian del papel, y el papel va a la izquierda
             para tenerlo delante mientras se teclea. Cada formación es un bloque propio —la copia
             empieza con su rótulo—, así que cada una ancla el suyo y no se pisan. */
          {
            key: 'pf.11',
            repite: 'formacion',
            label: 'Documento de respaldo',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Completo',
            nota: 'El título, el certificado de egreso o la constancia de estudios.'
          },
          { key: 'pf.masFormacion', tipo: 'repetir', grupo: 'formacion', max: 5, label: 'Agregar otra formación', col: 'c-todo', nivel: 'Operativo' },

          { key: 'pf.rotExperiencia', label: 'Experiencia laboral', singular: 'Experiencia', repite: 'experiencia', tipo: 'rotulo', col: 'c-todo' },
          { key: 'pf.12', repite: 'experiencia', label: 'Empresa', col: 'c-tercio', nivel: 'Operativo' },
          { key: 'pf.13', repite: 'experiencia', label: 'Cargo', col: 'c-tercio', nivel: 'Operativo' },
          { key: 'pf.14', repite: 'experiencia', label: 'Área', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.15', repite: 'experiencia', label: 'Fecha de ingreso', html: 'date', col: 'c-tercio', nivel: 'Operativo' },
          { key: 'pf.16', repite: 'experiencia', label: 'Fecha de salida', html: 'date', col: 'c-tercio', nivel: 'Operativo' },
          {
            key: 'pf.17',
            repite: 'experiencia',
            label: 'Tiempo trabajado',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'De la fecha de ingreso a la de salida, en años y meses.'
          },
          { key: 'pf.18', repite: 'experiencia', label: 'Funciones desempeñadas', tipo: 'texto', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.19', repite: 'experiencia', label: 'Motivo de salida', col: 'c-tercio', nivel: 'Completo' },
          {
            key: 'pf.20',
            repite: 'experiencia',
            label: '¿Referencia laboral disponible?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Si en esa empresa hay alguien a quien se le pueda pedir referencias suyas.'
          },
          { key: 'pf.masExperiencia', tipo: 'repetir', grupo: 'experiencia', max: 5, label: 'Agregar otra experiencia', col: 'c-todo', nivel: 'Operativo' },

          { key: 'pf.rotCertificaciones', label: 'Certificaciones', singular: 'Certificación', repite: 'certificaciones', tipo: 'rotulo', col: 'c-todo', nota: 'Cursos y certificados que acreditan un conocimiento. Las licencias de la persona —conducir, manipulación de alimentos— van en «Licencias y certificaciones» del paso 1.' },
          { key: 'pf.21', repite: 'certificaciones', label: 'Nombre de la certificación', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.22', repite: 'certificaciones', label: 'Institución emisora', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.23', repite: 'certificaciones', label: 'Número de certificado', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.24', repite: 'certificaciones', label: 'Fecha de emisión', html: 'date', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.25', repite: 'certificaciones', label: 'Fecha de vencimiento', html: 'date', col: 'c-tercio', nivel: 'Completo', nota: 'Déjela vacía si la certificación no vence.' },
          {
            key: 'pf.26',
            repite: 'certificaciones',
            label: 'Estado',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Sale de la fecha de vencimiento: vigente, por vencer (30 días antes) o vencida.'
          },
          {
            key: 'pf.27',
            repite: 'certificaciones',
            label: 'Documento adjunto',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Completo'
          },
          { key: 'pf.masCertificaciones', tipo: 'repetir', grupo: 'certificaciones', max: 5, label: 'Agregar otra certificación', col: 'c-todo', nivel: 'Completo' },

          { key: 'pf.rotIdiomas', label: 'Idiomas', singular: 'Idioma', repite: 'idiomas', tipo: 'rotulo', col: 'c-todo' },
          {
            key: 'pf.28',
            repite: 'idiomas',
            label: 'Idioma',
            tipo: 'lista',
            opciones: ['Español', 'Quechua', 'Aymara', 'Guaraní', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Chino'],
            col: 'c-tercio',
            nivel: 'Completo'
          },
          {
            key: 'pf.29',
            repite: 'idiomas',
            label: 'Nivel',
            tipo: 'lista',
            opciones: ['Básico', 'Intermedio', 'Avanzado', 'Nativo'],
            col: 'c-tercio',
            nivel: 'Completo'
          },
          { key: 'pf.30', repite: 'idiomas', label: 'Certificación del idioma', col: 'c-tercio', nivel: 'Completo', ph: 'TOEFL, Cambridge B2, DELF…' },
          { key: 'pf.masIdiomas', tipo: 'repetir', grupo: 'idiomas', max: 5, label: 'Agregar otro idioma', col: 'c-todo', nivel: 'Completo' },

          { key: 'pf.rotCompetencias', label: 'Competencias', singular: 'Competencia', repite: 'competencias', tipo: 'rotulo', col: 'c-todo' },
          {
            key: 'pf.31',
            repite: 'competencias',
            label: 'Competencia',
            col: 'c-tercio',
            nivel: 'Completo',
            ph: 'Trabajo en equipo',
            nota: 'Una conducta con la que hace su trabajo: liderazgo, orientación a resultados, trabajo en equipo. Son las que después se miden en la evaluación de desempeño.'
          },
          { key: 'pf.masCompetencias', tipo: 'repetir', grupo: 'competencias', max: 10, label: 'Agregar otra competencia', col: 'c-todo', nivel: 'Completo' },

          { key: 'pf.rotHerramientas', label: 'Herramientas y software', singular: 'Herramienta', repite: 'herramientas', tipo: 'rotulo', col: 'c-todo' },
          { key: 'pf.32', repite: 'herramientas', label: 'Herramienta', col: 'c-tercio', nivel: 'Completo', ph: 'Excel, SAP, AutoCAD, montacargas…' },
          {
            key: 'pf.33',
            repite: 'herramientas',
            label: 'Nivel de dominio',
            tipo: 'lista',
            opciones: ['Básico', 'Intermedio', 'Avanzado', 'Experto'],
            col: 'c-tercio',
            nivel: 'Completo'
          },
          { key: 'pf.34', repite: 'herramientas', label: 'Certificación', col: 'c-tercio', nivel: 'Completo', ph: 'Si la tiene, cuál' },
          { key: 'pf.masHerramientas', tipo: 'repetir', grupo: 'herramientas', max: 10, label: 'Agregar otra herramienta', col: 'c-todo', nivel: 'Completo' },

          { key: 'pf.rotReferencias', label: 'Referencias', singular: 'Referencia', repite: 'referencias', tipo: 'rotulo', col: 'c-todo' },
          { key: 'pf.35', repite: 'referencias', label: 'Nombre completo', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.36', repite: 'referencias', label: 'Empresa y cargo', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.37', repite: 'referencias', label: 'Teléfono', html: 'tel', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.masReferencias', tipo: 'repetir', grupo: 'referencias', max: 3, label: 'Agregar otra referencia', col: 'c-todo', nivel: 'Completo' }
        ]
      },
      /* NO HAY TARJETA DE PERFIL DE CARGO, y la hubo. Pedía el cargo —que ya se elige en
         Información Laboral—, el manual de funciones, las sinergias y la comunicación del puesto.
         Los cuatro son del CARGO y no de la persona: son iguales para todos los que lo ocupan, y
         pedirlos en cada ficha era cargar lo mismo diez veces y dejar que las diez copias
         discrepen. Si se quieren, van en la definición del cargo, una vez. */
      {
        id: 'desarrollo',
        titulo: 'Datos de desarrollo y capacitación del talento',
        desc: 'Cómo entró, qué ha aprendido desde entonces, cómo le ha ido y hacia dónde puede crecer.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: 'pf.42',
            label: 'Ruta de onboarding',
            tipo: 'lista',
            opciones: ['Sin ruta asignada', 'Ruta general', 'Ruta de área', 'Ruta de cargo'],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'La ruta de inducción que va a seguir al entrar.'
          },
          {
            key: 'pf.43',
            label: 'Estado del onboarding',
            tipo: 'lista',
            opciones: ['No iniciado', 'En curso', 'Completado'],
            col: 'c-tercio',
            nivel: 'Completo'
          },

          { key: 'pf.rotCapacitaciones', label: 'Capacitaciones', singular: 'Capacitación', repite: 'capacitaciones', tipo: 'rotulo', col: 'c-todo' },
          { key: 'pf.44', repite: 'capacitaciones', label: 'Nombre de la capacitación', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.45', repite: 'capacitaciones', label: 'Fecha', html: 'date', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.46', repite: 'capacitaciones', label: 'Horas', col: 'c-tercio', nivel: 'Completo', ph: '16' },
          { key: 'pf.masCapacitaciones', tipo: 'repetir', grupo: 'capacitaciones', max: 10, label: 'Agregar otra capacitación', col: 'c-todo', nivel: 'Completo' },

          { key: 'pf.rotEvaluaciones', label: 'Evaluaciones', singular: 'Evaluación', repite: 'evaluaciones', tipo: 'rotulo', col: 'c-todo' },
          {
            key: 'pf.47',
            repite: 'evaluaciones',
            label: 'Tipo de evaluación',
            tipo: 'lista',
            opciones: ['Fin de periodo de prueba', 'Desempeño anual', 'Desempeño semestral', 'Evaluación 360°'],
            col: 'c-tercio',
            nivel: 'Completo'
          },
          { key: 'pf.48', repite: 'evaluaciones', label: 'Fecha', html: 'date', col: 'c-tercio', nivel: 'Completo' },
          { key: 'pf.49', repite: 'evaluaciones', label: 'Resultado', col: 'c-tercio', nivel: 'Completo', ph: 'Sobresaliente · 92 / 100' },
          { key: 'pf.masEvaluaciones', tipo: 'repetir', grupo: 'evaluaciones', max: 10, label: 'Agregar otra evaluación', col: 'c-todo', nivel: 'Completo' },

          {
            key: 'pf.50',
            label: 'Plan de carrera',
            tipo: 'texto',
            col: 'c-todo',
            nivel: 'Completo',
            ph: 'Cargo al que apunta, en qué plazo y qué le falta para llegar…',
            nota: 'Hacia dónde puede crecer dentro de la empresa y qué necesita para lograrlo.'
          }
        ]
      }
    ]
  },
  {
    key: 'contrato',
    n: 5,
    titulo: 'Contrato',
    corto: 'Contrato',
    pista: 'Qué firmó, por cuánto tiempo y en qué condiciones',
    tarjetas: [
      {
        id: 'doc',
        titulo: 'El contrato',
        desc: 'Las fechas de ingreso son tres y no una: la legal es la que ven las tres entidades y nunca puede diferir; las otras dos son internas y existen porque a veces se le reconoce antigüedad o vacaciones desde otra fecha. Después, modalidad, tipo y plazo: de la modalidad depende que se dispare la regla de los dos contratos a plazo fijo.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.25',
            label: 'Ingreso legal / fiscal',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Las tres entidades deben ver la misma fecha. Nunca puede diferir.'
          },
          {
            key: '3.26',
            label: 'Ingreso para vacaciones',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Solo interno. Caso: persona que trabaja desde 2020 pero entra a planilla fiscal en 2022.'
          },
          {
            key: '3.27',
            label: 'Ingreso para antigüedad',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Solo interno.'
          },
          {
            key: '3.28',
            label: 'Ingreso a Caja de Salud',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '*\'Nunca pueden diferir\'*. El Salar las pide por separado *\'muy amplio, para que el recurso humano se confunda\'*.'
          },
          {
            key: '3.32',
            label: 'Modalidad de contrato',
            tipo: 'lista',
            opciones: [
              '1 · Tiempo indefinido',
              '2 · A plazo fijo',
              '3 · Por temporada',
              '4 · Por realización de obra o servicio',
              '5 · Condicional o eventual'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Determina la elegibilidad de todos los beneficios (ver tabla §6.1). 14:13): el catálogo queda en Plazo fijo · Indefinido · Eventual — *\'este condicional hay que quitarlo no más\'*. Debe ser selector cerrado, no texto. Las opciones son la lista oficial de la OVT.',
            traza: '✏ v1.2 (00. Fuente · F20 · campo 24. Alimenta: GP, PL.'
          },
          {
            key: '3.33',
            label: 'Tipo de contrato',
            tipo: 'lista',
            opciones: [
              '1 · Escrito',
              '2 · Verbal'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Escrito / Verbal. Ambos válidos ante la ley; el verbal es *\'más peligroso\'*. Las opciones son la lista oficial de la OVT.',
            traza: 'Fuente · F20 · campo 25. Alimenta: GP, PL.'
          },
          {
            key: '3.34',
            label: 'Clasificación laboral',
            tipo: 'lista',
            opciones: [
              '1 · Dirección en la administración pública y empresas',
              '2 · Profesionales científicos e intelectuales',
              '3 · Técnicos y profesionales de apoyo',
              '4 · Empleados de oficina',
              '5 · Trabajadores de los servicios y vendedores del comercio',
              '6 · Agricultura, pecuaria, agropecuaria y pesca',
              '7 · Industria extractiva, construcción y manufactura',
              '8 · Operadores de instalaciones y maquinarias',
              '9 · Trabajadores no calificados',
              '10 · Fuerzas armadas'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Debería configurarse una sola vez a nivel empresa (*\'es de la empresa, del rubro\'*). Determina el recargo nocturno. Las opciones son la lista oficial de la OVT.',
            traza: 'Fuente · F20 · campo 22. Alimenta: PL.'
          },
          {
            key: '3.35',
            label: 'Número de contrato',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Debe ser el disparador de la regla de los 2 plazos fijos, no la fecha de finalización.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '3.36',
            label: 'Fecha de finalización',
            html: 'date',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Se activa solo si modalidad = plazo fijo.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '3.37',
            label: 'Fecha de ratificación',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Se calcula desde la fecha de ingreso con anticipación parametrizable. Periodo de prueba = 89 días; a los 90 + 1 nacen los beneficios sociales.',
            traza: 'Alimenta: DE, GP, ON.'
          },
          {
            key: '3.38',
            label: 'Fecha de última renovación',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Ratificación ≠ renovación. Dos conceptos, dos alertas, dos campos.',
            traza: 'Alimenta: GP.'
          }
        ]
      },
      {
        id: 'condiciones',
        titulo: 'Condiciones de contratación',
        desc: 'Quién autorizó la contratación, con qué motivo y si está sindicalizado.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.39',
            label: '¿Quién autorizó la contratación?',
            tipo: 'lista',
            opciones: [
              'Emilia Pessoa Rotger',
              'Natalia Ziade Mareño'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Trazabilidad para auditoría ISO 9001. Buscador sobre la base, no lista desplegable.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '3.40',
            label: 'Motivo de contratación',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Selector cerrado para reportes + campo abierto para lo imprevisto.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '3.42c',
            label: '¿Está sindicalizado?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Movido desde 3.21. Insumo para decisiones de reestructuración.',
            traza: '✏ v1.2 (obs. #29). Alimenta: GP.'
          }
        ]
      },
      {
        id: 'salida',
        titulo: 'Salida',
        desc: 'Solo aplica al editar, no al dar de alta. El motivo de retiro existe en el formulario de finiquito pero no está habilitado en la ficha: es un defecto a corregir, porque los motivos 4 a 9 apagan el desahucio.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '3.41',
            label: 'Motivo de retiro',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'Un solo catálogo, propagado. Hoy existe en el finiquito pero no en la ficha. 23:01): los motivos de retiro codificados del Ministerio de Trabajo ya fueron cargados por la especialista al catálogo maestro. Aparece al editar la ficha, no en el alta.',
            traza: '✏ v1.2 (01. Alimenta: DE, GP, PL.'
          }
        ]
      }
    ]
  },
  {
    key: 'afiliaciones',
    n: 6,
    titulo: 'Compensación y nómina (Afiliaciones)',
    corto: 'Nómina',
    pista: 'Gestora, Caja de Salud, Ministerio e impuestos',
    tarjetas: [
      {
        id: 'gestora',
        titulo: 'Datos de Gestora Pública',
        desc: 'El NUA/CUA llega días o semanas después del alta: el estado inicial es literalmente «En proceso». Sin NUA no se puede declarar a la Gestora, pero la persona sí puede cobrar.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.43',
            detalle: '3.44',
            label: '¿Aporta a la Gestora?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '⚙ Se deriva de la modalidad de contrato (ver §6.1). Se elimina el campo duplicado \'¿Aplica AFP?\' + \'¿Aporta a la AFP?\'.',
            traza: 'Alimenta: PL.'
          },
          /* ── MEDIA FILA PARA UN DESPLEGABLE DE DOS OPCIONES ─────────────────────
             Ocupaba `c-medio` —seis columnas de doce— mientras sus cuatro vecinos ocupaban un
             tercio, así que la fila quedaba coja y el campo parecía importar más que los demás.
             El ancho no lo pedía el control, que es un desplegable con «Gestora Pública» y «En
             proceso» dentro: lo pedía el RÓTULO, que a un tercio se partía en tres líneas.

             Y EL RÓTULO ERA LARGO POR INERCIA. «Administradora / Estado de la afiliación»
             nombra dos cosas porque el campo fue las dos: identificaba cuál AFP cuando había
             varias. Su propia nota dice que eso se acabó —«ya no identifica cuál administradora
             (sólo existe una), sino en qué etapa está la afiliación»— y aun así la primera
             mitad del rótulo seguía ahí, cobrando media fila por un dato que ya no da.

             Con el rótulo diciendo lo que el campo hace, cabe en un tercio como los demás y la
             fila vuelve a ser de tres. Cuál es la administradora no se pierde: es la única que
             existe, y está escrita en la primera opción de la lista. */
          {
            key: '3.44',
            label: 'Estado de la afiliación',
            tipo: 'lista',
            opciones: [
              'Gestora Pública',
              'En proceso'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'SE MANTIENE EL CAMPO — *\'no sacar\'*—, pero cambia su significado: ya no identifica cuál administradora (solo existe una), sino en qué etapa está la afiliación: *\'¿estás en proceso o estás prácticamente ya con el número de NUA?\'* (00:17:19). Catálogo: Gestora Pública · En proceso. *\'Previsión y Futuro ya no existen\'*.',
            traza: '✏ v1.2 (obs. #32 y #33). Alimenta: PL.'
          },
          {
            key: '3.45',
            label: 'NUA / CUA',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '\'En proceso\' = persona sin afiliación previa → alerta a RR.HH. para completarla y generar el CUA.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.46',
            label: 'Sucursal Gestora',
            tipo: 'lista',
            opciones: [
              'La Paz',
              'Santa Cruz',
              'Cochabamba'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Se alimenta de las sucursales creadas por la empresa, no se escribe.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.47',
            label: 'Tipo de asegurado',
            tipo: 'lista',
            opciones: [
              'D · Dependiente',
              'M · Minero',
              'E · Estacional',
              'CL · Consultor de línea'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Normado por ley.',
            traza: 'Alimenta: PL.'
          },
          /* ── NI ERA UNA PREGUNTA NI TENÍA DÓNDE PONER LA FECHA ──────────────────
             «¿Está jubilado? + fecha» era UNA CAJA DE TEXTO. No un Sí/No con un campo al lado:
             un renglón libre donde había que escribir las dos cosas a la vez, y donde entraban
             «sí», «Sí, 2021», «jubilado desde marzo» o «no aplica». Un dato que alimenta la
             planilla no puede depender de cómo redacte cada quien.

             LA FECHA NO ES UN TEXTO, ES UNA FECHA, y por eso va con el calendario de la casa
             como las otras veintitantas de la ficha. Escrita a mano entra en cuatro formatos y
             no se puede ordenar ni comparar con la de ingreso.

             Y SÓLO SI ESTÁ JUBILADO. Para casi todas las altas el campo sobra; preguntar la
             fecha de una jubilación que no existe es un hueco que no se puede llenar. */
          {
            key: '3.48',
            label: '¿Está jubilado?',
            tipo: 'siNo',
            detalle: '3.48b',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Un jubilado que sigue trabajando cotiza distinto: la declaración a la Gestora cambia según esto.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.48b',
            label: 'Fecha de jubilación',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'La de la resolución, no la del último día trabajado.',
            traza: '↳ 3.48. Alimenta: PL.'
          }
        ]
      },
      {
        id: 'caja',
        titulo: 'Datos de Caja de Salud',
        desc: 'Trámite aparte, y el más urgente de todos: el plazo legal es de 5 días desde el ingreso. Si se pasa, todo lo que le pase al trabajador se le puede cobrar a la empresa.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.49',
            detalle: '3.50',
            label: '¿Aplica caja de salud?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '⚙ Derivado de la modalidad.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.50',
            label: 'Caja de salud',
            tipo: 'lista',
            opciones: [
              '1 · Caja Nacional de Salud (C.N.S.)',
              '2 · Caja Petrolera de Salud (C.P.S.)',
              '3 · Caja de Salud de Caminos',
              '4 · Caja Bancaria Estatal de Salud (C.B.E.S.)',
              '5 · Caja de Salud de la Banca Privada (C.S.B.P.)',
              '6 · Caja de Salud Cordes',
              '7 · Seguro Social Universitario (S.I.S.S.U.B.)',
              '8 · Corporación del Seguro Social Militar (COOSMIL)',
              '9 · Seguro Integral de Salud (SINEC)'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Solo las públicas autorizadas por ley generan obligación. Un seguro privado es opcional y no genera aporte. Las opciones son la lista oficial de la OVT.',
            traza: 'Fuente · F20 · campo 18. Alimenta: PL.'
          },
          {
            key: '3.51',
            label: 'N° de asegurado',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Individual por colaborador; lo registra RR.HH. tras la afiliación.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.52',
            label: 'Sucursal Caja',
            tipo: 'lista',
            opciones: [
              'La Paz',
              'Santa Cruz',
              'Cochabamba'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Para declarar por sucursal de manera correcta.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.53',
            label: 'Fecha de expedición',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Reporte de cumplimiento: se debe afiliar dentro de los 5 días. 18:31): confirmado el riesgo — *\'hay una ley de seguridad que te dice que tenés la obligación como empresa de afiliarlo al trabajador dentro de los 5 días; si no lo haces, todo lo que le pasa al trabajador te lo puede cobrar\'*. La alerta se cuenta desde la fecha de ingreso.',
            traza: '✏ v1.2 (00. Alimenta: PL.'
          }
        ]
      },
      {
        id: 'ovt',
        titulo: 'Datos del Ministerio de Trabajo',
        desc: 'La sucursal OVT no se deduce: el Ministerio le asigna un código a cada empresa y hay que ir a buscarlo. Es la cuarta «sucursal» distinta que maneja el sistema.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.55',
            label: 'Sucursal OVT',
            tipo: 'lista',
            opciones: [
              '001 · La Paz',
              '002 · Santa Cruz',
              '010 · El Alto'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Cada departamento tiene su codificación OVT. El Ministerio fiscaliza: *\'no te puedes equivocar en tus declaraciones… esto es muy frágil\'*. *\'poner un selector de las sucursales creadas\'* — no es texto libre: se alimenta de la codificación de la Oficina de Trabajo (OVT) que la empresa ya registró, para que coincida exactamente con los formularios de declaración que presenta RR.HH. (00:19:59).',
            traza: '✏ v1.2 (obs. #34). Alimenta: PL.'
          }
        ]
      },
      {
        id: 'impuestos',
        titulo: 'Impuestos — RC-IVA',
        desc: 'El código dependiente lo da contabilidad. Y el saldo inicial importa: un caso real llegó con Bs 30.395 acumulados a favor.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.56',
            label: '¿Aplica planilla tributaria?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '⚙ Derivado de la modalidad. No aplica a prestación de servicios.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.57',
            label: 'Código dependiente RC-IVA',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Único y portable entre empresas. Lo proporciona contabilidad; es como el NIT del colaborador.',
            traza: 'Alimenta: ERP, PL.'
          },
          /* SE RETIRA «SALDO RC-IVA INICIAL + PERÍODO» (3.58).
             Era una caja de texto para dos datos —un importe en bolivianos y el período al que
             corresponde— y ninguno de los dos es texto: uno es dinero y el otro una fecha. Lo
             que entraba era «30.395», «Bs 30395 marzo 2024» o «30,395.00», que no se suma ni se
             compara con nada.

             Y NO ES UN DATO DE LA FICHA SINO UN MOVIMIENTO DE LA PLANILLA: un saldo acumulado
             cambia cada mes, y la ficha guarda lo que identifica a la persona, no su cuenta
             corriente. Escrito acá quedaba congelado en el día del alta y envejeciendo desde el
             primer cierre, con la agravante de que sigue pareciendo un dato vigente.

             El NIT del colaborador (3.57), que es lo que sí lo identifica y no cambia, se queda
             justo arriba. */
        ]
      }
    ]
  },
  {
    key: 'asistencia',
    n: 7,
    titulo: 'Asistencia',
    corto: 'Asistencia',
    pista: 'Jornada, horario, marcaje, vacaciones y permisos',
    tarjetas: [
      {
        id: 'jornada',
        titulo: 'Su jornada',
        desc: 'Cuatro de estos campos son del mínimo legal, y no por completitud: sin ellos la persona no entra a la corrida.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.97',
            label: '¿Controla asistencia?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '*\'Hay empresas que no quieren descontar por ser personal de confianza\'*. Es el interruptor maestro: en No, todo este bloque se colapsa.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.98',
            label: 'Días trabajados por mes',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '30 / 26 / 25. *\'Necesario por la forma en que paga cada empresa\'*. Base del proporcional haber ÷ 30 × días.',
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.99',
            label: 'Horas de trabajo por día (jornada diaria)',
            html: 'text',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Ejemplo: 8 h.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.101',
            label: 'Horas de trabajo por mes (base de cálculo)',
            html: 'text',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Ejemplo: 240. Valor por defecto de empresa con override por persona. El Salar lo pide dos veces (una para HHEE y otra para recargo nocturno): se consolida en uno.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.102',
            label: 'Jornada semanal legal',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '40 h mujer · 48 h hombre. Hoy nadie lo calcula; se digita mal.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.103',
            label: 'Grupo o turno',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'La falencia declarada del Salar. Industria y avícola trabajan por turnos, no por horario fijo.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.104',
            label: 'Patrón de rotación del turno',
            tipo: 'lista',
            opciones: [
              'Sin rotación',
              '14 × 7',
              '12 × 12',
              '7 × 7',
              'Semanal',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Completo',
            nota: 'Fijo · Rotativo semanal · Rotativo quincenal · 4×3 · 7×7. Sin esto, los turnos se vuelven a resolver a mano.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.105',
            label: 'Modalidad de trabajo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Se jala de Información organizacional (3.42b, obs. #28). Presencial / Híbrido / Remoto. Condiciona si se habilita marcación virtual (3.112–3.113).',
            traza: '✏ v1.2. Alimenta: AS.'
          },
          {
            key: '3.106',
            label: '¿Comedor habilitado?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: '*\'Opcional, depende de cada empresa; en industria es común\'*. 38:03): confirmado como opción específica según la empresa.',
            traza: '✏ v1.2 (00. El estudio lo marca como a confirmar. Alimenta: AS.'
          }
        ]
      },
      {
        id: 'horario',
        titulo: 'Horario asignado',
        desc: 'Horario × persona × vigencia. El histórico no se reescribe: es la prueba ante una inspección.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.108',
            label: 'Horario asignado',
            tipo: 'lista',
            opciones: [
              'Administrativo 8-18',
              'Operativo 7-15',
              'Turno noche 20-06',
              'Rotativo 14×7'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '39:13 · 00:45:23): CONFIRMADO. *\'La sección de horarios permitirá seleccionar horarios previamente creados en el módulo de asistencia.\'* No se define el horario aquí: se elige. 🔗 Entidad versionada: horario → persona → rango de fechas.',
            traza: '✏ v1.2 (obs. #34 · 00. Alimenta: AS, PL.'
          },
          {
            key: '3.109',
            label: 'Vigencia del horario (desde / hasta)',
            html: 'date',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Sin horario vigente que cubra el período, no se puede procesar la asistencia. Caso real: horario creado solo hasta 2023 impide correr el sueldo de julio 2026. 31:57): confirmado — la especialista demostró que es posible *\'asignar turnos específicos a distintos grupos de personas y modificar las fechas de vigencia\'*.',
            traza: '✏ v1.2 (02. Alimenta: AS, PL.'
          }
        ]
      },
      {
        id: 'marcacion',
        titulo: 'Cómo marca',
        desc: 'Biométrico, app, web o manual. La manual siempre deja rastro de quién la hizo y por qué.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.112',
            label: '¿Permitir marcaciones virtuales por app móvil?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.113',
            label: '¿Permitir marcaciones virtuales por web?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '*\'Ejemplo: personal que trabaja desde casa\'*. ⚙ Sugerido: se propone en Sí si 3.105 = Remoto/Híbrido.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.114',
            label: '¿Controlar ubicación de las marcaciones virtuales?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.115',
            label: 'Ubicación autorizada para marcar',
            tipo: 'mapa',
            radio: true,
            enlace: true,
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'Busca la dirección o toca el mapa, y ajusta los metros: el círculo es el área dentro de la cual se puede marcar asistencia. Era el mismo dolor que la ubicación del domicilio —tipear la latitud a mano— y se arregla con el mismo mapa. El radio viaja en el propio enlace, porque «ubicación autorizada» es un campo del estudio y no tres.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.116',
            label: '¿Habilitar restricción de marcación?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: '*\'Es algo interno de cómo maneja sus políticas sobre marcaciones\'*.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.117',
            label: 'Tipo de marcación virtual permitida',
            tipo: 'lista',
            opciones: [
              'No permitida',
              'App móvil',
              'Web',
              'App móvil y web'
            ],
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Entrada / Salida. Solo visible si 3.116 = Sí.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.118',
            label: 'Identificador de celular',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Asocia el usuario al ID único del móvil autorizado; desde otro dispositivo el sistema rechaza la marcación.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.119',
            label: 'Identificador biométrico / credencial',
            col: 'c-medio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'Huella, rostro o tarjeta. Hoy vive en el aparato, no en la ficha → al cambiar de biométrico se pierde.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.120',
            label: '¿Permitir marcar fuera de horario?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Caso: jornada 08:00–17:00 pero entra 06:30 por actividad operativa o se queda hasta 20:00 por cierre.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.121',
            label: '¿Notificar sobre las marcaciones de este colaborador?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Completo',
            nota: 'Notifica ingreso/salida, omisión de marcación y marcación fuera de horario al jefe inmediato.',
            traza: 'Alimenta: AS, CC.'
          }
        ]
      },
      {
        id: 'vacaciones',
        titulo: 'Vacaciones',
        desc: 'La escala es 15, 20 o 30 días hábiles según antigüedad, y son un derecho irrenunciable: pagarlas en lugar de otorgarlas está prohibido.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.124',
            label: 'Fecha de ingreso para vacaciones',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '*\'Hay empresas que deben vacaciones de gestiones pasadas. Juan ingresa 01/07/2022 pero entra a planilla fiscal el 01/07/2023\'*. No se vuelve a capturar aquí.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.125',
            label: 'Días de vacación por gestión',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Escala legal parametrizada por rango de años. Hoy se digita a mano. Escala exacta pendiente de confirmar (§11).',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.127',
            label: 'Vacaciones adicionales (días adicionales + hasta la gestión)',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: '*\'Hay empresas que les deben de gestiones pasadas y lo llevan internamente. Eso pasa con varias empresas\'*. Se integra aquí, no en subpestaña propia: *\'lo colocaría en el despliegue del punto 3.14\'*'
          },
          {
            key: '3.128',
            label: '¿Se permite solicitar vacaciones sin cumplir un año?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: '*\'En algunos casos hay empresas que dan vacaciones antes de cumplir el año\'*. Se mantiene en la ficha porque suele ser excepción individual, no política general.',
            traza: 'Alimenta: AS.'
          },
          {
            key: '3.129',
            label: '¿Incluido en la notificación global de vacaciones por comenzar?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: '*\'Para que cuando registre su vacación le llegue la notificación a su jefe inmediato\'*.',
            traza: 'Alimenta: AS, CC.'
          },
          {
            key: '3.130',
            label: 'Valor de vacación programada por día (lun–dom)',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: '*\'Es el valor que se descuenta al tomar ese día de vacación\'*. El domingo solo aplica *\'si en caso trabajara domingo\'*. ✏️ v1.2 (obs. #50 y #51): SE MANTIENE'
          },
          {
            key: '3.131',
            label: '¿Requiere aprobación de vacaciones?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'RESTITUIDO. *\'Mantener\'*. La v1.1 lo había movido a Parámetros; el recorrido con la especialista lo devuelve a la ficha, con el mismo criterio que el de permisos (3.135): la aprobación es por persona, no por empresa.',
            traza: '✏ v1.2 (obs. #49). Alimenta: AS.'
          }
        ]
      },
      {
        id: 'permisos',
        titulo: 'Permisos',
        desc: 'Sin aprobador declarado, una solicitud no tiene a quién ir. Y no se puede deducir del jefe.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.135',
            label: '¿Requiere aprobación de permisos?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '53:56): CONFIRMADO — es uno de los dos únicos campos que quedan. *\'Necesario para que cuando el colaborador registre su permiso le llegue la notificación a su jefe inmediato\'*.',
            traza: '✏ v1.2 (00. Alimenta: AS.'
          },
          {
            key: '3.136',
            label: 'Aprobador de permisos',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'CONFIRMADO — el segundo campo que queda. Se jala de *\'¿Quién aprueba sus permisos?\'* (3.16).',
            traza: '✏ v1.2. Alimenta: AS.'
          }
        ]
      },
      {
        id: 'compensaciones',
        titulo: 'Compensación de horas',
        desc: 'Es legal compensar horas extra con tiempo libre si hay acuerdo escrito. El saldo es el único registro de verdad: si se compensa y además se paga, la planilla y la asistencia dejan de cuadrar.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.141',
            label: 'Saldo de compensaciones (trabajos por compensar)',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'Horas acumuladas disponibles.',
            traza: 'Alimenta: AS, PL.'
          },
          {
            key: '3.142',
            label: '¿Utilizar saldo de compensaciones para disminuir atrasos y faltas?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'AMPLIADO. *\'Añadir una opción que diga faltas\'*. Confirmado (00:59:35): el saldo sirve para disminuir atrasos y faltas, no solo atrasos.',
            traza: '✏ v1.2 (obs. #56). Alimenta: AS, PL.'
          },
          {
            key: '3.143',
            label: '¿Utilizar saldo de compensaciones para no contar horas extras?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'Compensa con descanso en vez de pagar. 00:59 y 03:11:02): confirmado y con requisito legal — *\'es legal compensar horas extras con tiempo libre en lugar de pago, siempre que exista un acuerdo escrito\'*. El acuerdo escrito debe adjuntarse.',
            traza: '✏ v1.2 (01. Alimenta: AS, PL.'
          },
          {
            key: '3.144',
            label: '¿Generar HHEE al aprobar trabajos por compensar en domingo?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Completo',
            nota: 'Caso: trabaja 8 h un domingo; si el responsable aprueba que no habrá descanso compensatorio, se convierten en HHEE pagables. 00:59): confirmado como opción según política interna.',
            traza: '✏ v1.2 (01. Alimenta: AS, PL.'
          }
        ]
      },
      {
        id: 'reglamentos',
        titulo: 'Reglamentos entregados',
        desc: 'Con versión, fecha y acuse firmado. Sin acuse no se puede sancionar: es lo que hace exigible el reglamento.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '3.145',
            label: 'Reglamento Interno de Trabajo — versión · fecha de entrega · acuse de recibo firmado',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Es la defensa de la empresa ante un proceso. Sin acuse firmado, la sanción es impugnable. Se genera desde Documentación'
          },
          {
            key: '3.146',
            label: 'Política de asistencia y puntualidad — versión · acuse',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Tolerancias, marcación y descuentos son política comunicada, no supuesta'
          },
          {
            key: '3.147',
            label: 'Reglamento de higiene y seguridad ocupacional — acuse',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Se exige en fiscalización; complementa los exámenes ocupacionales (1.66–1.68)'
          }
        ]
      },
      {
        id: 'disciplina',
        titulo: 'Historial disciplinario',
        desc: 'Faltas acumuladas, medidas y procesos abiertos. Es información sensible: debería verla solo quien corresponda.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '3.148',
            label: 'Medidas disciplinarias (repetible)',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: 'Tipo (llamada de atención · memorándum · suspensión) · Fecha · Motivo · Días de suspensión · ¿Con descuento? · Documento · Notificado por · Acuse del colaborador. ✏️ v1.2 (03:01:52): la suspensión disciplinaria es legal; caso citado: ebriedad en el trabajo con política de tolerancia cero y prueba de alcoholemia. Artículo 68 prohíbe consumo de alcohol y drogas (03:03:11)'
          },
          {
            key: '3.149',
            label: 'Faltas acumuladas en la gestión',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Renombrado — *\'faltas acumuladas en la gestión\'*, no \'en el año\'. La gestión no siempre coincide con el año calendario.',
            traza: '✏ v1.2 (obs. #58).'
          },
          {
            key: '3.150',
            label: '¿Aplica multas por faltas acumuladas en la gestión?',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'A Asistencia. Límite legal confirmado (02:54:52): existe un tope aproximado del 20 % de descuento mensual sobre el salario; *\'cualquier multa acumulada debe ser amortizada en cuotas para evitar dejar a la persona sin remuneración\'* → regla R20.',
            traza: '✏ v1.2 (obs. #57).'
          },
          {
            key: '3.151',
            label: '¿Está en proceso disciplinario abierto?',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'Bloquea o alerta en promociones, aumentos y certificados de recomendación. Debe verse en la ficha aunque se calcule fuera.'
          },
          {
            key: '3.152',
            label: 'Observaciones de conducta',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'Con control de visibilidad (§5.8).'
          }
        ]
      }
    ]
  },
  {
    key: 'remuneracion',
    n: 8,
    titulo: 'Remuneración',
    corto: 'Sueldo',
    pista: 'Cuánto gana, qué le corresponde y dónde se le deposita',
    tarjetas: [
      {
        id: 'sueldo',
        titulo: 'Cuánto gana',
        desc: 'El haber básico no puede ser inferior al salario mínimo nacional.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.65',
            label: 'Haber básico',
            html: 'text',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Versionado con vigencia (P5).',
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.66',
            label: 'Moneda',
            tipo: 'lista',
            opciones: [
              'BOB · Boliviano',
              'USD · Dólar'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.67',
            label: 'Tipo de remuneración',
            tipo: 'lista',
            opciones: [
              'Mensual',
              'Jornal por hora',
              'Jornal por día'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Mensual · Jornal · Por hora · Comisión · Honorarios.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.68',
            label: 'Frecuencia de pago',
            tipo: 'lista',
            opciones: [
              'Mensual',
              'Quincenal'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Mensual · Quincenal · Semanal.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.69',
            label: 'Modo de quincena + valor',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Porcentaje o monto fijo.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.72',
            label: 'Escala / nivel salarial',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '29:12): CONFIRMADO y subido a Operativo. *\'Fabiola Gutiérrez confirmó que es utilizado frecuentemente para establecer los límites de negociación salarial\'* y para gestionar planes de carrera y ascensos. Pendiente: recibir el ejemplo de escala real (*\'consultar el ejemplo\'*).',
            traza: '✏ v1.2 (obs. #41 · 00. Alimenta: ERP, PL.'
          }
        ]
      },
      {
        id: 'aplica',
        titulo: 'Qué beneficios le corresponden',
        desc: 'Son interruptores, no montos: definen qué calcula la corrida para esta persona. Acá se decide si entra al bono de antigüedad, al aguinaldo, a la prima y al retroactivo.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.73',
            label: '¿Sujeto a bono de antigüedad?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'El monto no se digita: SMN × 3 × %escala(años).',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.74',
            label: '¿Aplica aguinaldo de Navidad?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '⚙ Derivable de la modalidad.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.75',
            label: '¿Aplica 2º aguinaldo?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Default = No. Depende de decreto según crecimiento del PIB. Se cambia por lote el año que se decrete.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.76',
            label: '¿Aplica prima?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Ligada a utilidades, no al tiempo trabajado.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.77',
            label: '¿Aguinaldo/prima desde el primer mes?',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'Obrero de producción: 1 mes · Administrativo: 3 meses y 1 día.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.78',
            label: '¿Aplica retroactivo? + retroactivo de antigüedad',
            tipo: 'siNo',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'El bono de antigüedad se arrastra obligatoriamente porque depende del SMN.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.80b',
            label: '¿Aplica vacaciones según el tipo de cargo?',
            col: 'c-medio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'CAMPO NUEVO. *\'Aplica vacaciones según el tipo de cargo — añadir\'*. Permite que la elegibilidad y la escala de vacaciones se deriven del tipo de cargo, no se marquen a mano. Depende de la escala legal pendiente (§11, pendiente 6a).',
            traza: '✏ v1.2 (obs. #42). Alimenta: AS, PL.'
          },
          {
            key: '3.81',
            label: '¿Aplica aportes patronales?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Moverlo al bloque de Gestora (criterio de la especialista).',
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.82',
            label: '¿Enviar boleta por correo?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Con control de momento de publicación: hoy en el Salar la boleta se dispara al aprobar, adelantándose al comunicado de RR.HH.',
            traza: 'Alimenta: CC, PL.'
          },
          {
            key: '3.83',
            label: '¿Incluir en subsidio de frontera?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Raro, pero lo pide la declaración de la OVT.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: PL.'
          }
        ]
      },
      {
        id: 'banco',
        titulo: 'Dónde se le deposita',
        desc: 'La cuenta a veces se abre después del ingreso. Sin ella no entra al archivo de dispersión, aunque la planilla sí se le calcule.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.88',
            label: 'Forma / método de pago',
            tipo: 'lista',
            opciones: [
              'Transferencia bancaria',
              'Cheque',
              'Efectivo'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Banco · Cheque · Efectivo · Giro · Billetera digital.',
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.89',
            label: 'Banco',
            tipo: 'lista',
            opciones: [
              'BISA',
              'Banco Nacional de Bolivia',
              'Banco Mercantil Santa Cruz',
              'Banco Unión',
              'Banco Ganadero',
              'Banco Económico',
              'Banco Fassil',
              'BancoSol',
              'Otro'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Alimenta el archivo de dispersión bancaria.',
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.90',
            label: 'Tipo de cuenta',
            tipo: 'lista',
            opciones: [
              'Caja de ahorro',
              'Cuenta corriente'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Caja de ahorro · Cuenta corriente.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.91',
            label: 'Número de cuenta',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            traza: 'Alimenta: ERP, PL.'
          },
          {
            key: '3.93',
            label: 'Moneda de la cuenta',
            tipo: 'lista',
            opciones: [
              'BOB · Boliviano',
              'USD · Dólar'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.94',
            label: 'Sucursal de la cuenta bancaria',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Para pagar por sucursal.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.95',
            label: '¿Es cuenta principal?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Completo',
            nota: 'Soporta más de una cuenta (pago partido).',
            traza: 'Alimenta: PL.'
          }
        ]
      },
      {
        id: 'beneficios',
        titulo: 'Beneficios adicionales',
        desc: 'Lo que da la empresa por encima de la ley: seguro privado, movilidad, alimentación.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '3.96a',
            label: 'Paquete de beneficios asignado',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: '33:37): CONFIRMADO como el campo prioritario del bloque. Catálogo por empresa. Se deriva del cargo o de la modalidad, no se marca a mano.',
            traza: '✏ v1.2 (00. Alimenta: ON, PL.'
          },
          {
            key: '3.96b',
            label: 'Beneficios individuales (repetible)',
            tipo: 'rotulo',
            col: 'c-todo',
            nota: '✏️ v1.2 (00:33:37): confirmado y reducido a tres datos — tipo de beneficio (monetario o periódico) · valor · vigencia. Se retiran periodicidad libre y documento de respaldo del alta'
          }
        ]
      }
    ]
  },
  /* ── LO QUE LA EMPRESA LE ENTREGA ─────────────────────────────────────────
     No viene del estudio: es un paso agregado a mano, como el del perfil profesional. La ficha
     sabía cuánto gana la persona y qué puede hacer en el sistema, pero no qué tiene en la mano
     de la empresa — y eso es lo primero que se pregunta el día que se va: qué tiene que devolver.

     VA ANTES DE ACCESOS Y DEL EXPEDIENTE porque el expediente cierra la ficha reuniendo los
     adjuntos, y lo que va después del resumen se lee como un olvido.

     EL CORREO Y EL CELULAR CORPORATIVOS NO ESTÁN ACÁ aunque también se los da la empresa. Ya viven
     en «Contacto corporativo» (3.22 y 3.23), y la nota de ese campo dice que es el único lugar
     donde vive: repetirlos era volver a tener dos respuestas para la misma pregunta. */
  {
    key: 'recursos',
    n: 9,
    titulo: 'Información de Recursos y Activos',
    corto: 'Activos',
    pista: 'Lo que la empresa le entrega para trabajar',
    tarjetas: [
      {
        id: 'activos',
        titulo: 'Activos entregados',
        desc: 'Lo que la empresa le presta para trabajar y que tiene que devolver al salir: equipos, vehículo, herramientas, uniforme, llaves.',
        propuesta: true,
        incierto: false,
        campos: [
          { key: 'ra.rotActivos', label: 'Activo asignado', singular: 'Activo', repite: 'activos', tipo: 'rotulo', col: 'c-todo' },
          {
            key: 'ra.1',
            repite: 'activos',
            label: 'Tipo de activo',
            tipo: 'lista',
            opciones: [
              'Computadora portátil',
              'Computadora de escritorio',
              'Monitor',
              'Celular',
              'Tablet',
              'Vehículo',
              'Herramienta o equipo',
              'Uniforme o EPP',
              'Llave o tarjeta de acceso',
              'Otro'
            ],
            col: 'c-tercio',
            nivel: 'Operativo'
          },
          { key: 'ra.2', repite: 'activos', label: 'Marca y modelo', col: 'c-tercio', nivel: 'Operativo', ph: 'Lenovo ThinkPad E14' },
          {
            key: 'ra.3',
            repite: 'activos',
            label: 'Código de inventario',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El de la etiqueta del activo, el mismo que figura en el inventario de la empresa. Es lo que permite saber quién lo tiene.'
          },
          { key: 'ra.4', repite: 'activos', label: 'Número de serie', col: 'c-tercio', nivel: 'Completo', nota: 'El del fabricante. En un vehículo, la placa.' },
          { key: 'ra.5', repite: 'activos', label: 'Fecha de entrega', html: 'date', col: 'c-tercio', nivel: 'Operativo' },
          {
            key: 'ra.6',
            repite: 'activos',
            label: 'Estado al entregarlo',
            tipo: 'lista',
            opciones: ['Nuevo', 'Bueno', 'Regular'],
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Contra esto se compara cuando lo devuelva.'
          },
          {
            key: 'ra.7',
            repite: 'activos',
            label: 'Valor referencial',
            html: 'text',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Lo que costaría reponerlo, en la moneda del haber básico.'
          },
          /* EL ACTA ANCLA SU BLOQUE, como el título en la formación: el tipo, el código, la serie
             y la fecha se copian de ella, y es además lo único que prueba qué recibió la persona y
             en qué estado. Cada activo empieza con su rótulo, así que cada uno ancla el suyo. */
          {
            key: 'ra.8',
            repite: 'activos',
            label: 'Acta de entrega',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Operativo',
            nota: 'El acta firmada por quien lo recibe. Sin ella no hay cómo reclamar el activo al salir.'
          },
          { key: 'ra.masActivos', tipo: 'repetir', grupo: 'activos', max: 15, label: 'Agregar otro activo', col: 'c-todo', nivel: 'Operativo' }
        ]
      },
      {
        id: 'recursos',
        titulo: 'Otros recursos asignados',
        desc: 'Lo que no es un objeto que se lleve, pero igual se le asigna: dónde trabaja y con qué cuenta.',
        propuesta: true,
        incierto: false,
        campos: [
          { key: 'ra.9', label: 'Puesto de trabajo', col: 'c-tercio', nivel: 'Completo', ph: 'Piso 2, escritorio 14', nota: 'Dónde se sienta: oficina, piso, escritorio.' },
          { key: 'ra.10', label: 'Estacionamiento', col: 'c-tercio', nivel: 'Completo', ph: 'Espacio 7', nota: 'Déjelo vacío si no tiene uno asignado.' },
          {
            key: 'ra.11',
            label: 'Licencias de software',
            tipo: 'texto',
            col: 'c-tercio',
            nivel: 'Completo',
            ph: 'Office 365, AutoCAD…',
            nota: 'Las licencias pagadas a su nombre. Se liberan cuando se va.'
          }
        ]
      }
    ]
  },
  {
    key: 'sistema',
    n: 10,
    titulo: 'Configuración del Colaborador',
    corto: 'Configuración',
    pista: 'Su acceso, su rol y el historial de su ficha',
    tarjetas: [
      {
        id: 'credenciales',
        titulo: 'Credenciales',
        desc: 'Cómo entra al sistema.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '7.1',
            label: 'Modo de autenticación',
            tipo: 'lista',
            opciones: [
              'Usuario y contraseña',
              'Correo corporativo',
              'SSO'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Interno · SSO (Azure) · CI + fecha de nacimiento.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '7.2',
            label: 'Nombre de usuario',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo'
          },
          {
            key: '7.3',
            label: 'Contraseña / Generar contraseña',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'La crea RR.HH. y se comparte con el colaborador.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '7.4',
            label: '¿Enviar usuario y contraseña por correo?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'Agregar opción \'enviar por WhatsApp\' — el correo no llega al personal operativo.',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '7.5',
            label: '¿Ingreso al sistema habilitado?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo'
          }
        ]
      },
      {
        id: 'rol',
        titulo: 'Rol y alcances',
        desc: 'Qué puede ver y hacer. La separación de roles —generar ≠ aprobar ≠ eliminar— es control interno, no burocracia.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '7.6',
            label: 'Rol del usuario',
            tipo: 'lista',
            opciones: [
              'Administrador general',
              'Administrador de RR.HH.',
              'Supervisor',
              'Colaborador'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo'
          },
          /* SE RETIRA 7.7, «Estado del usuario». Llevaba la insignia «se calcula» y nunca tuvo
             regla en DERIVADOS: salía siempre en blanco y no se podía escribir, una promesa sin
             nada detrás. Si el usuario puede entrar ya lo dice «¿Ingreso al sistema habilitado?». */
          {
            key: '7.8',
            label: 'Acceso a otras empresas del grupo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El colaborador puede estar en dos empresas distintas.',
            traza: 'Alimenta: GP.'
          },
          /* SE RETIRA 7.9, «Separación de roles (generar ≠ aprobar ≠ eliminar)». Era una caja de
             texto libre con una regla de control interno por rótulo —que una misma persona no
             genere, apruebe y elimine planillas, hallazgo del Salar—: nadie sabía qué escribir, y
             lo escrito no lo podía leer el sistema para impedir nada. La regla es de permisos, no
             un dato de la ficha. */
          {
            key: '7.11',
            label: 'Alcances habilitados',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Individual · Unidad organizativa · Organización.',
            traza: 'Alimenta: DE.'
          }
        ]
      },
      {
        id: 'autogestion',
        titulo: 'Autogestión y notificaciones',
        desc: 'Qué puede hacer solo desde su propio perfil y por dónde se le avisa.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '7.10',
            label: 'Autogestión — permisos',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Ver lista abajo.'
          },
          {
            key: '7.12',
            label: 'Canal de notificación preferido',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo',
            nota: 'Correo · WhatsApp · App · SMS. absorbe la función del eliminado 1.37 — el canal se define una sola vez, aquí.',
            traza: '✏ v1.2. Alimenta: CC, ON.'
          },
          {
            key: '7.13',
            label: 'Restricción de acceso a datos sensibles de salud',
            col: 'c-medio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '18:43): CAMPO NUEVO. *\'Se acordó implementar permisos restringidos para que solo personal autorizado acceda a estos datos sensibles.\'* Cubre §5.1.6 completa (tipo de sangre, alergias, condiciones crónicas, medicación, discapacidad, exámenes ocupacionales). El acceso por defecto es denegado, se concede explícitamente por rol.',
            traza: '✏ v1.2 (sesión 1, 01. Alimenta: GP.'
          }
        ]
      },
      /* ── QUIÉN TOCÓ LA FICHA ──────────────────────────────────────────────────
         No se llena: se lee. Todo lo de esta tarjeta sale de quién está usando el sistema y de
         cuándo, y un dato de auditoría que se puede escribir a mano deja de ser auditoría.

         AL CREAR SÓLO HAY UNA LÍNEA DE HISTORIA, la del alta, y es lo que se enseña. Los cambios
         posteriores —qué dato, de qué valor a cuál, quién y cuándo— se registran desde que la
         ficha existe, y no tiene sentido pintarlos vacíos en un formulario que todavía no la creó. */
      {
        id: 'auditoria',
        titulo: 'Historial y auditoría',
        desc: 'Quién registra la ficha y cuándo. Desde que se crea, cada cambio queda anotado: qué dato, quién lo cambió y cuándo.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: 'au.1',
            label: 'Registrado por',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'La persona con la sesión abierta al crear la ficha.'
          },
          {
            key: 'au.2',
            label: 'Fecha de registro',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El día en que se crea la ficha en el sistema, que no tiene por qué ser su fecha de ingreso.'
          },
          {
            key: 'au.3',
            label: 'Tipo de alta',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Sale de la primera pregunta de la ficha: si ya tenía registro en el grupo, es un reingreso.'
          }
        ]
      }
    ]
  },
  /* ── LOS PAPELES TIENEN SU PROPIO PASO ─────────────────────────────────────
     Compartían uno con las credenciales —«Acceso y documentos»— y no tienen nada que ver: lo
     primero lo configura quien administra el sistema, lo segundo es el expediente de la persona.
     Juntos, quien buscaba el carnet escaneado tenía que pasar por contraseñas y roles, y quien
     configuraba el usuario se topaba con una pila de adjuntos que no eran asunto suyo. */
  {
    key: 'expediente',
    n: 11,
    titulo: 'Documentación y Expediente Digital',
    corto: 'Expediente',
    pista: 'Sus papeles, reunidos en un solo lugar',
    tarjetas: [
      {
        id: 'archivos',
        titulo: 'Archivos',
        desc: 'Todos los adjuntos del formulario, reunidos.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.9',
            label: 'Fotografía del colaborador',
            tipo: 'archivo',
            /* UN PDF NO ES UNA FOTOGRAFÍA. Aceptaba `application/pdf` como los otros ocho
               archivos de la ficha, que sí son papeles escaneados; acá el recuadro dibuja la
               imagen y con un PDF adentro enseña un icono gris donde va la cara. Se cierra a
               imágenes, que es lo que el campo pide desde su rótulo.

               Y CINCO MEGAS Y NO DIEZ. El tope general está pensado para un escaneo a color;
               una fotografía de carnet no llega a uno, y lo que pasa de cinco es casi siempre
               una foto de celular sin recortar que además se va a ver en 88 px. El número está
               escrito en el recuadro y es el mismo que valida — ver `topeMB` en SubirArchivo.

               TRES TIPOS CONCRETOS Y NO `image/*`, QUE ES LO QUE PARECÍA MÁS GENEROSO. Con el
               comodín entra el HEIC del iPhone, que es el formato con el que sale de fábrica
               cualquier foto sacada con un teléfono de Apple. Se sube sin protestar, se guarda
               bien, y el navegador no sabe dibujarlo: el recuadro queda en blanco. Para un
               campo cuyo motivo de existir es MIRAR lo que se subió, eso es peor que
               rechazarlo — se descubre tarde y sin decir por qué.

               Nombrados, el selector de archivos los filtra y el HEIC sale gris con su razón a
               la vista. `.jpg` y `.jpeg` son el mismo `image/jpeg`, así que los dos entran. */
            acepta: 'image/jpeg,image/png,image/webp',
            pista: 'JPG, PNG o WEBP · máximo 5 MB',
            topeMB: 5,
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Suba una fotografía formal y reciente.',
            traza: 'Alimenta: CC, GP, ON.'
          },
          {
            key: '1.17',
            label: 'Documento escaneado (anverso + reverso)',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Operativo',
            nota: 'Un solo archivo PDF, no dos imágenes. Acuerdo de la sesión 1 (01:05:06): *\'al igual que en los procesos bancarios, se debe escanear el anverso y el reverso del documento en un solo archivo PDF para facilitar su carga\'*. Sigue siendo la fuente del autocompletado por OCR.',
            traza: '✏ v1.2 (obs. #5). Alimenta: GP.'
          },
          {
            key: '1.20h',
            repite: 'docsec',
            nombraCon: '1.20a',
            label: 'Documento secundario escaneado (anverso + reverso)',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Solo aparece si se declaró un segundo documento: acá no hay una lista fija de adjuntos, hay los adjuntos que esta ficha pide.',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.21b',
            label: 'Certificado de nacimiento',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Respalda la fecha, el lugar y el país de nacimiento.',
            traza: '↳ 1.21. Alimenta: GP, ON.'
          },
          {
            key: '1.53',
            label: 'Croquis',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Queda como respaldo opcional. El enlace de mapa (1.51) lo sustituye funcionalmente.',
            traza: '✏ v1.2. El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '1.79',
            label: 'Documento adjunto',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El documento digitalizado es obligatorio para dar la licencia por registrada (01:24:00).',
            traza: '✏ v1.2.'
          },
          {
            key: '2.46',
            label: 'Documento de garantía',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo'
          },
          /* EL ACTA DE CADA ACTIVO, espejada del paso 9 con su misma clave: subirla acá o allá es
             subir la misma. Va una por activo declarado, y cada una dice de cuál es. Sin
             `c-escaneo`: el riel de este bloque ya es 1.17, y dos rieles en un bloque se desanclan. */
          {
            key: 'ra.8',
            repite: 'activos',
            label: 'Acta de entrega',
            nombraCon: 'ra.1',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El acta firmada del activo entregado, la misma que se sube en Recursos y Activos.'
          }
        ]
      }
    ]
  },
  {
    key: 'previa',
    n: null,
    titulo: 'Vista previa',
    corto: 'Previa',
    pista: 'Todo junto, antes de crearlo',
    tarjetas: []
  }
]
