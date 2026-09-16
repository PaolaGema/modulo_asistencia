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
    titulo: 'Identidad y contacto',
    corto: 'Identidad',
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
        titulo: 'Nombre legal y fotografía',
        desc: 'Se guarda descompuesto porque cada entidad lo pide distinto: la OVT en tres partes, la Gestora en cinco y RC-IVA en una sola.',
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
            nota: 'Estructura separada obligatoria para declaraciones a Ministerio, Caja y Gestora.',
            traza: 'Alimenta: CC, ERP, GP, ON, PL.'
          },
          {
            key: '1.2',
            label: 'Segundo nombre',
            col: 'c-tercio',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.3',
            label: 'Tercer nombre',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Poco frecuente; mantener opcional.',
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
            nota: 'Necesario para coincidencia con documentos legales.',
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
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Ficha tipo hoja de vida + comunicados de cumpleaños.',
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
            nota: 'El documento de identidad del país que lo emitió: el carnet en Bolivia, el DNI en Argentina o España, la cédula en Chile. El carnet de extranjero va aparte porque lo emite Migración y no lleva extensión. Catálogo reducido de cuatro. El estudio lo escribió como CI y la opción dejó de llamarse así a propósito: CI trae dentro que es boliviano, y un DNI argentino es igual de nacional. El país emisor lo dice ahora, y por eso se pregunta siempre. Se retira \'RUN\' y \'Certificado de nacimiento\'.',
            traza: 'Fuente · F20 · campo 2. Alimenta: ERP, GP, PL.'
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
          {
            key: '1.19',
            label: '¿Tiene documento secundario?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Caso real: extranjero con carnet y pasaporte, ambos requeridos.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.20',
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
          {
            key: '1.20b',
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
            label: 'Complemento SEGIP',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Casos excepcionales de carnet boliviano con numerología adicional.',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.20e',
            label: 'Fecha de emisión del documento',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: '↳ 1.20. Alimenta: GP.'
          },
          {
            key: '1.20f',
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
            label: 'Documento secundario escaneado (anverso + reverso)',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio c-escaneo',
            nivel: 'Operativo',
            nota: 'Un solo archivo PDF con las dos caras, igual que el principal. Y ancla su bloque como el de arriba ancla el suyo: el papel a la izquierda, lo que dice el papel al lado.',
            traza: '↳ 1.20. Alimenta: GP.'
          }
        ]
      },
      {
        id: 'nacimiento',
        titulo: 'Información de Nacimiento y Nacionalidad',
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
      {
        id: 'civil',
        titulo: 'Estado civil y ocupación',
        desc: 'Datos personales que no dependen del vínculo laboral, y que a diferencia de los del nacimiento sí cambian a lo largo de él.',
        propuesta: false,
        incierto: false,
        campos: [
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
      {
        id: 'residencia',
        titulo: 'Datos de residencia',
        desc: 'Dirección completa. En algunos rubros define a qué sucursal se lo asigna.',
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
            nota: 'Encadenado: filtra provincia y municipio.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.44',
            label: 'Provincia',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Corrige el dolor del Salar: *\'la lista no se puede filtrar por departamento\'*.',
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
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.51',
            label: 'Ubicación GPS',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Rediseñar: hoy el Salar obliga a tipear la latitud a mano. Debe tener buscador de dirección con mapa (como la propia OVT). *\'profundizar GPS\'* — acuerdo de la sesión 1 (01:13:45): integrar enlaces de Google Maps es más eficiente que el croquis dibujado, sobre todo en empresas con sucursales distribuidas, porque *\'facilita la logística y la asignación estratégica de personal según su proximidad geográfica\'*. Ver pendiente 19.',
            traza: '✏ v1.2 (obs. #12). Alimenta: GP.'
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
          }
        ]
      }
    ]
  },
  {
    key: 'entorno',
    n: 2,
    titulo: 'Familia y salud',
    corto: 'Familia',
    pista: 'Quiénes dependen, a quién avisar y su salud',
    tarjetas: [
      {
        id: 'emergencia',
        titulo: 'A quién avisar en una emergencia',
        desc: 'Al menos un contacto es obligatorio. Es el único bloque repetible del mínimo legal.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '2.1',
            label: 'Nombre completo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP, ON.'
          },
          {
            key: '2.2',
            label: 'Parentesco',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            traza: 'Alimenta: GP.'
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
          }
        ]
      },
      {
        id: 'familia',
        titulo: 'Familia',
        desc: 'Cónyuge e hijos. Alimenta asignaciones familiares y el subsidio de lactancia.',
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
          {
            key: '2.10',
            label: 'Tipo y número de documento',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Respalda trámites de beneficios ante la aseguradora.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.11',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-corto',
            nivel: 'Completo',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.12',
            label: 'Nacionalidad',
            col: 'c-tercio',
            nivel: 'Completo',
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
            label: 'Teléfono',
            html: 'tel',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Contacto alternativo.',
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
          {
            key: '2.20',
            label: 'Nombre completo',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.21',
            label: 'Tipo y número de documento',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.22',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-corto',
            nivel: 'Operativo',
            nota: 'Beneficios por rango de edad, obsequios (Día del Niño, Día de la Familia).',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.23',
            label: 'Sexo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Planificación de campañas y obsequios.',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.24',
            label: 'Nacionalidad',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '2.25',
            label: 'Institución educativa',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Programas de apoyo educativo.',
            traza: 'Alimenta: CC, GP.'
          },
          {
            key: '2.26',
            label: 'Nivel educativo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'Se conserva. *\'Puede servir para campañas de beneficios corporativos\'* (01:28:41).',
            traza: '✏ v1.2. Alimenta: CC, GP.'
          },
          {
            key: '2.28',
            label: '¿Es beneficiario del seguro?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '2.29',
            label: '¿Presenta discapacidad?',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '28:41): se exige el certificado oficial adjunto. Relevante para beneficios y para el cumplimiento del 2 % de contratación de personas con discapacidad (regla R4).',
            traza: '✏ v1.2 (01. Alimenta: GP, PL.'
          },
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
        titulo: 'Beneficiarios y declaración de herederos',
        desc: 'Es una obligación legal y hoy no tiene dónde vivir. Cuando hace falta, ya es tarde para pedirla.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '2.31',
            label: 'Nombre completo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Dato necesario para el contrato laboral.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.32',
            label: 'Parentesco / Relación',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.33',
            label: 'Tipo y número de documento',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Necesario para el contrato.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.34',
            label: 'Fecha de nacimiento',
            html: 'date',
            col: 'c-corto',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Determina si el heredero es mayor de edad.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.35',
            label: 'Porcentaje de participación (%)',
            html: 'text',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Validación: la suma debe dar 100 %. 00:33): define *\'cuánto de la indemnización le van a dejar a esa persona\'*.',
            traza: '✏ v1.2 (00. Alimenta: GP, PL.'
          }
        ]
      },
      {
        id: 'garantes',
        titulo: 'Garantes',
        desc: 'Se activa según el cargo: los que manejan dinero o valores.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '2.39',
            label: 'Nombre completo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Alimenta el contrato de garantía que luego se notaria.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.40',
            label: 'Tipo y número de documento',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Evita registros duplicados o incorrectos.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.41',
            label: 'Teléfono(s)',
            html: 'tel',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
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
            label: 'Fecha y lugar de nacimiento',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Validación de identidad para el contrato.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '2.44',
            label: 'Estado civil',
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
          {
            key: '2.46',
            label: 'Documento de garantía',
            tipo: 'archivo',
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            insignia: 'v1.2',
            nivel: 'Operativo'
          }
        ]
      },
      {
        id: 'medica',
        titulo: 'Información médica',
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
            key: '1.55',
            label: 'Factor RH',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.56',
            label: '¿Tiene alergias conocidas? + detalle',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Viene del formulario actual de Trabajito.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.57',
            label: '¿Tiene condición crónica? + detalle',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Incluye el caso \'¿Es hipertenso?\' que el Salar tenía suelto en *Curiosidades*.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.58',
            label: '¿Toma medicación regular? + detalle',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.59',
            label: '¿Tiene recomendación médica? + detalle',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.69',
            label: 'Restricciones médicas',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          },
          {
            key: '1.70',
            label: 'Observaciones médicas',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP.'
          }
        ]
      },
      {
        id: 'discapacidad',
        titulo: 'Discapacidad y protecciones',
        desc: 'Va aparte de la información médica porque no es un dato de salud: tiene efectos legales. Cuenta para la cuota del 2 %, es columna obligatoria de la planilla del Ministerio, y el tutor de una persona con discapacidad tiene protecciones propias.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.60',
            label: '¿Tiene discapacidad?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: '2 % obligatorio de la planilla; se fiscaliza contra la OVT.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.61',
            label: 'Tipo y grado de discapacidad',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.62',
            label: '¿Es tutor de persona con discapacidad?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Cuenta dentro del 2 % legal.',
            traza: 'Alimenta: GP, PL.'
          }
        ]
      },
      {
        id: 'segprivado',
        titulo: 'Seguro médico privado',
        desc: 'Adicional al de la Caja. No reemplaza la afiliación obligatoria.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '1.63',
            label: 'Seguro médico privado',
            tipo: 'siNo',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: 'No genera aporte de ley; es beneficio.',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.64',
            label: 'Proveedor del seguro privado',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP, PL.'
          },
          {
            key: '1.65',
            label: 'Número de asegurado (privado)',
            col: 'c-tercio',
            nivel: 'Completo',
            traza: 'Alimenta: GP, PL.'
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
    titulo: 'Puesto',
    corto: 'Puesto',
    pista: 'Dónde encaja en la estructura de la empresa',
    tarjetas: [
      {
        id: 'posicion',
        titulo: 'Dónde encaja en la estructura',
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
            key: '3.3',
            label: 'Unidad de negocio',
            tipo: 'lista',
            opciones: [
              'Trabajito Bolivia',
              'Trabajito Perú'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Mínimo',
            requerido: true,
            nota: 'Renombrar y consolidar: en el Salar \'unidad de negocio\' y \'jefatura\' son lo mismo.',
            traza: 'Alimenta: ERP, GP.'
          },
          {
            key: '3.4',
            label: 'Gerencia',
            tipo: 'lista',
            opciones: [
              'Gerencia General',
              'Gerencia de Operaciones',
              'Gerencia Comercial'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Selectores encadenados — al elegir gerencia solo deben habilitarse los cargos que le pertenecen.',
            traza: 'Alimenta: DE, GP.'
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
            key: '3.6',
            label: 'División',
            col: 'c-tercio',
            nivel: 'Completo',
            nota: '*\'No lo veo necesario\'* — mantener opcional o retirar por empresa.',
            traza: 'El estudio lo marca como a confirmar. Alimenta: GP.'
          },
          {
            key: '3.7',
            label: 'Regional',
            tipo: 'lista',
            opciones: [
              'Occidente',
              'Oriente'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Identifica el departamento de trabajo.',
            traza: 'Alimenta: AS, GP.'
          },
          {
            key: '3.8',
            label: 'Sucursal (organizacional)',
            tipo: 'lista',
            opciones: [
              'TRABAJITO BOLIVIA',
              'TRABAJITO SANTA CRUZ',
              'TRABAJITO EL ALTO'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '≠ sucursal regulatoria. Ver §5.3.3.',
            traza: 'Alimenta: AS, ERP, GP.'
          },
          {
            key: '3.9',
            label: 'Oficina',
            tipo: 'lista',
            opciones: [
              'Oficina central',
              'Sucursal norte'
            ],
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Detalle del centro de trabajo.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '3.10',
            label: 'Ubicación física / Centro de trabajo',
            col: 'c-tercio',
            nivel: 'Operativo',
            traza: 'Alimenta: AS, GP.'
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
          },
          {
            key: '3.24',
            label: 'Estado del colaborador',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Activo / Inactivo / En periodo de prueba / Retirado. Automático, no capturado. 59:29): el paso activo ↔ retirado es automático y conserva el histórico, lo que habilita el reingreso sin duplicar la persona.',
            traza: '✏ v1.2 (00.'
          }
        ]
      }
    ]
  },
  {
    key: 'contrato',
    n: 4,
    titulo: 'Contrato',
    corto: 'Contrato',
    pista: 'Qué firmó, por cuánto tiempo y en qué condiciones',
    tarjetas: [
      {
        id: 'fechas',
        titulo: 'Las fechas del vínculo',
        desc: 'Son tres y no una. La legal es la que ven las tres entidades y nunca puede diferir; las otras dos son internas y existen porque a veces se le reconoce antigüedad o vacaciones desde otra fecha.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.25',
            label: 'Fecha de ingreso (legal / fiscal)',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Las tres entidades deben ver la misma fecha. Nunca puede diferir.'
          },
          {
            key: '3.26',
            label: 'Fecha de ingreso para vacaciones',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Solo interno. Caso: persona que trabaja desde 2020 pero entra a planilla fiscal en 2022.'
          },
          {
            key: '3.27',
            label: 'Fecha de ingreso para bono de antigüedad',
            html: 'date',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Solo interno.'
          },
          {
            key: '3.28',
            label: 'Fecha de ingreso a Caja de Salud',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: '*\'Nunca pueden diferir\'*. El Salar las pide por separado *\'muy amplio, para que el recurso humano se confunda\'*.'
          }
        ]
      },
      {
        id: 'doc',
        titulo: 'El contrato',
        desc: 'Modalidad, tipo y plazo. De la modalidad depende que se dispare la regla de los dos contratos a plazo fijo.',
        propuesta: false,
        incierto: false,
        campos: [
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
            col: 'c-corto',
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
        titulo: 'Condiciones del vínculo',
        desc: 'Quién autorizó la contratación, con qué motivo y bajo qué modalidad de trabajo.',
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
            key: '3.42b',
            label: 'Modalidad de trabajo',
            tipo: 'lista',
            opciones: [
              'Presencial',
              'Híbrido',
              'Remoto'
            ],
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Movido desde 3.20. Presencial · Híbrido · Remoto. Condiciona la marcación virtual (§5.3.5.B).',
            traza: '✏ v1.2 (obs. #28). Alimenta: AS, GP.'
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
    n: 5,
    titulo: 'Afiliaciones',
    corto: 'Afiliación',
    pista: 'Gestora, Caja de Salud, Ministerio e impuestos',
    tarjetas: [
      {
        id: 'gestora',
        titulo: 'Gestora Pública — antes AFP',
        desc: 'El NUA/CUA llega días o semanas después del alta: el estado inicial es literalmente «En proceso». Sin NUA no se puede declarar a la Gestora, pero la persona sí puede cobrar.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.43',
            label: '¿Aporta a la Gestora?',
            tipo: 'siNo',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: '⚙ Se deriva de la modalidad de contrato (ver §6.1). Se elimina el campo duplicado \'¿Aplica AFP?\' + \'¿Aporta a la AFP?\'.',
            traza: 'Alimenta: PL.'
          },
          {
            key: '3.44',
            label: 'Administradora / Estado de la afiliación',
            tipo: 'lista',
            opciones: [
              'Gestora Pública',
              'En proceso'
            ],
            col: 'c-medio',
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
          {
            key: '3.48',
            label: '¿Está jubilado? + fecha',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Necesario para la declaración correcta.',
            traza: 'Alimenta: PL.'
          }
        ]
      },
      {
        id: 'caja',
        titulo: 'Caja de Salud',
        desc: 'Trámite aparte, y el más urgente de todos: el plazo legal es de 5 días desde el ingreso. Si se pasa, todo lo que le pase al trabajador se le puede cobrar a la empresa.',
        propuesta: false,
        incierto: false,
        campos: [
          {
            key: '3.49',
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
            col: 'c-corto',
            nivel: 'Operativo',
            nota: 'Reporte de cumplimiento: se debe afiliar dentro de los 5 días. 18:31): confirmado el riesgo — *\'hay una ley de seguridad que te dice que tenés la obligación como empresa de afiliarlo al trabajador dentro de los 5 días; si no lo haces, todo lo que le pasa al trabajador te lo puede cobrar\'*. La alerta se cuenta desde la fecha de ingreso.',
            traza: '✏ v1.2 (00. Alimenta: PL.'
          }
        ]
      },
      {
        id: 'ovt',
        titulo: 'Ministerio de Trabajo — OVT',
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
          {
            key: '3.58',
            label: 'Saldo RC-IVA inicial + período',
            html: 'text',
            col: 'c-tercio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Caso real: colaborador que llegó con Bs 30.395 de saldo acumulado.',
            traza: 'Alimenta: PL.'
          }
        ]
      }
    ]
  },
  {
    key: 'remuneracion',
    n: 6,
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
            col: 'c-corto',
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
            nota: 'Ahora se jala de Relación Laboral (obs. #28). Presencial / Híbrido / Remoto. Condiciona si se habilita marcación virtual (3.112–3.113).',
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
            label: 'Ubicación autorizada (lat / long / radio)',
            col: 'c-medio',
            nivel: 'Operativo',
            nota: 'Rediseñar: hoy el Salar obliga a tipear latitud y longitud a mano. Mismo dolor que 1.51. Debe ser buscador + mapa + radio en metros.',
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
    key: 'sistema',
    n: 8,
    titulo: 'Acceso y documentos',
    corto: 'Acceso',
    pista: 'Sus credenciales, su rol y sus papeles',
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
          {
            key: '7.7',
            label: 'Estado del usuario',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo'
          },
          {
            key: '7.8',
            label: 'Acceso a otras empresas del grupo',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'El colaborador puede estar en dos empresas distintas.',
            traza: 'Alimenta: GP.'
          },
          {
            key: '7.9',
            label: 'Separación de roles (generar ≠ aprobar ≠ eliminar)',
            col: 'c-medio',
            insignia: 'legal',
            nivel: 'Operativo',
            nota: 'Hallazgo de control interno: en el Salar *\'la misma persona genera, aprueba y elimina planillas\'*.',
            traza: 'Alimenta: PL.'
          },
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
      {
        id: 'licencias',
        titulo: 'Licencias y certificaciones',
        desc: 'Las que vencen: licencia de conducir, manipulación de alimentos, certificaciones de seguridad. Necesitan alerta de vencimiento.',
        propuesta: true,
        incierto: false,
        campos: [
          {
            key: '1.72',
            label: 'Tipo de licencia o certificación',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Licencia de conducir, manipulación de alimentos, operador de maquinaria, etc.',
            traza: 'Alimenta: GP, ON.'
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
          {
            key: '1.78',
            label: 'Estado',
            deducido: '',
            insignia: 'se calcula',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Vigente / Por vencer / Vencida / Suspendida.',
            traza: 'Alimenta: GP.'
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
          }
        ]
      },
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
            acepta: 'application/pdf,image/*',
            pista: 'PDF o imagen · arrastrar o hacer clic',
            col: 'c-tercio',
            nivel: 'Operativo',
            nota: 'Ficha tipo hoja de vida + comunicados de cumpleaños.',
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
