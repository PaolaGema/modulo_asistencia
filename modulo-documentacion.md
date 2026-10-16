Souly HR · Módulo de documentación · Documentación de producto

# Módulo de documentación

> **Módulo de documentación — versión en Markdown.** Reúne completo el documento de producto `public/modulo-documentacion.html` (versión 1.0, 16 de octubre de 2026): glosario, contexto, integraciones, funcionalidades por rol, las reglas de negocio con sus escenarios, modelo de datos, roadmap, flujos, pantallas, historias de usuario, el anexo de decisiones y el anexo «El módulo en el prototipo, hoy». Reemplaza a la «Propuesta de estructura» v0.2 (`public/modulo-documentacion-propuesta.html`), que queda como histórico.

## Índice

- [00 · Glosario](#00--glosario)
- [01 · Contexto](#01--contexto)
- [02 · Integraciones](#02--integraciones)
- [03 · Funcionalidades](#03--funcionalidades)
- [04 · Reglas de negocio](#04--reglas-de-negocio)
- [05 · Modelo de datos](#05--modelo-de-datos)
- [06 · Roadmap](#06--roadmap)
- [07 · Flujos de usuario](#07--flujos-de-usuario)
- [08 · Recursos visuales](#08--recursos-visuales)
- [09 · Historias de usuario](#09--historias-de-usuario)
- [Cómo se mantiene este documento](#cómo-se-mantiene-este-documento)
- [Historial de versiones](#historial-de-versiones)
- [Anexo · Por qué decidimos así](#anexo--por-qué-decidimos-así)
- [Anexo · El módulo en el prototipo, hoy](#anexo--el-módulo-en-el-prototipo-hoy)

Los papeles de cada persona dejan de estar repartidos en carpetas, correos y cajones, y pasan a ser *un expediente por colaborador que dice solo qué le falta, qué vence y qué se le envió, con rastro de todo*. Este documento define qué es el módulo, qué reglas cumple, qué tiene que hacer el producto y cómo se opera.

- **Versión:** 1.0
- **Fecha:** 16 de octubre de 2026
- **Autoría:** Paola Gema — Diseñadora UX
- **Revisa y aprueba:** Por definir
- **Estado:** Borrador

| En este documento | Cantidad |
| --- | --- |
| roles con su vista | 3 |
| estados de un documento | 7 |
| reglas de negocio | 60 |
| requisitos funcionales | 62 |
| historias de usuario | 18 |
| pantallas | 18 |
| decisiones abiertas | 12 |

> **Diagrama · El módulo, de un vistazo.** Documentación son dos espacios con un solo dato debajo. Arriba, la bitácora que registra todo y la ficha de Gestión de personas, que se lee y no se copia. En el medio, el **Repositorio** —Expedientes, Revisar documentos y Contratos: lo que hay de cada persona y su historia— y la **Emisión** —Emitir, Documentos emitidos y Solicitudes: lo que la empresa genera y entrega—. Una flecha va de la Emisión al Repositorio: todo lo emitido queda en el expediente, en Recibidos o en Contratos. Debajo, la configuración: Plantillas y tipos alimentan la Emisión, Notificaciones y numeración sirve a los dos, y los documentos que se exigen en el Repositorio todavía no tienen pantalla (ABIERTA‑DOC‑02). Abajo, el colaborador en Zona HR: Por entregar y Mis carpetas salen del Repositorio; De RR.HH. y Mis solicitudes, de la Emisión. En la versión HTML está dibujado.

## 00 · Glosario

*Las palabras del módulo, con lo que significan en Souly. Se leen antes que nada porque todo lo demás las usa: un expediente no es una carpeta, un tipo no es un subtipo y un documento emitido no es un documento subido.*

### 0.1 Expediente, carpeta y documento

El **expediente** es todo lo que la empresa guarda de una persona. Hay uno por colaborador y se ordena en **carpetas**:

| Carpeta | Qué guarda | De dónde sale |
| --- | --- | --- |
| **Información personal, Perfil profesional, Recursos y activos, Documentos agregados** | Lo que la persona entrega: carnet, títulos, croquis, licencias | Son los **tipos** de documento; los mismos grupos que la sección «Archivos» de la ficha |
| **Contratos** | Sus contratos y adendas, con su estado | Se registran desde Emitir |
| **Recibidos** | Lo que RR.HH. le envió: certificados, memorándums, comunicados | Se archiva solo al emitir —BR‑DOC‑036— |
| **Por clasificar** | Archivos subidos que el sistema no reconoció | Aparece solo si hay alguno |
| **Historial** | Todo lo que pasó con el expediente, mes a mes | La bitácora de la persona |
| **Papelera** | Lo que se quitó, recuperable | Aparece solo si tiene algo |

Un **documento** es un papel concreto de la persona —su carnet— con todas sus **versiones**: cada vez que se reemplaza, la anterior se conserva —BR‑DOC‑012—.

### 0.2 Tipo y subtipo

El **tipo** es la carpeta (Información personal). El **subtipo** es el documento que la empresa espera (Documento de identidad) y dice cómo se comporta: si vence y cada cuánto, quién lo ve, si el colaborador lo sube, si se exige a todos y con qué plazo, qué formatos acepta y cuánto puede pesar.

### 0.3 Requisito y exoneración

Un **requisito** es un subtipo que se le exige a una persona. Sale de dos lados: lo que se **exige a todos** desde la configuración del subtipo, y lo que RR.HH. **agrega a esa persona** desde su expediente. Si los dos piden lo mismo, gana lo más exigente —BR‑DOC‑003—. **Exonerar** es liberar a alguien de un requisito, con motivo, para siempre —BR‑DOC‑005—.

### 0.4 Los siete estados de un documento

| Estado | Qué quiere decir | ¿Cumple? |
| --- | --- | --- |
| **Vigente** | Está aprobado y no vence o falta para que venza | Sí |
| **Por vencer** | Vence dentro de la ventana de aviso | Sí |
| **Vencido** | Ya venció | No |
| **Faltante** | Se le exige y no lo entregó | No |
| **En revisión** | Lo subió el colaborador y RR.HH. no lo miró | No, hasta aprobarse |
| **Rechazado** | RR.HH. lo rechazó con un motivo | No |
| **Exonerado** | Se le liberó de entregarlo | No cuenta |

Ningún estado se guarda: se deduce de las fechas y de la revisión —BR‑DOC‑007—.

### 0.5 Plantilla, tipo de documento y emitido

Una **plantilla** es el texto con el que RR.HH. arma un documento para una persona: un certificado de trabajo, un memorándum, un contrato. Cada plantilla es de un **tipo de documento** —Certificado, Memorándum, Contrato o uno que cree la empresa, como «Carta de recomendación»— que le da su color y su **sigla** de numeración. Un **emitido** es el documento ya hecho para una persona, con su número, sus datos congelados y su estado de entrega.

### 0.6 Solicitud

Lo que un colaborador le pide a RR.HH. desde la app: **un certificado**, **una copia** de su contrato o **una corrección** de algo que recibió. Cada una tiene un plazo de respuesta de dos días hábiles.

### 0.7 Quién es quién

| Rol | Qué hace en el módulo |
| --- | --- |
| **Recursos Humanos** (administrador) | Lleva los expedientes, revisa lo que suben, registra contratos, emite documentos, atiende las solicitudes y configura plantillas y avisos |
| **Líder de área** | Hoy entra al módulo con lo mismo que Recursos Humanos —ABIERTA‑DOC‑01— |
| **Colaborador** | Ve sus carpetas, sube lo que le piden, confirma lo que recibe y hace sus pedidos, en la web o en el celular |

## 01 · Contexto

*Por qué existe el módulo, qué problema resuelve y cómo se sabe si funcionó.*

### 1.1 ¿Qué es la documentación en Souly?

Es el lugar donde vive el expediente de cada persona y desde donde RR.HH. le envía documentos. Tiene dos caras sobre el mismo dato: lo que **la persona entrega** (su carnet, sus títulos) y lo que **la empresa le envía** (certificados, memorándums, contratos). Las dos terminan en el mismo expediente.

### 1.2 El problema que resuelve

- Los papeles están repartidos: una parte en la ficha, otra en un cajón, otra en el correo de alguien.
- Nadie sabe a quién le falta qué hasta que un auditor lo pide.
- Los documentos vencen sin que nadie lo note.
- Cada certificado se hace a mano, con datos que se copian y se equivocan.
- No queda constancia de que la persona recibió un memorándum.

### 1.3 Visión del módulo

Un expediente que se cuida solo: dice qué falta, qué vence y qué espera revisión; arma los documentos con los datos de la ficha, sin tipear nada; y deja rastro de cada cosa que pasó.

### 1.4 Principios de diseño

| Principio | Qué significa |
| --- | --- |
| **Lo pendiente tiene puerta** | Lo que hay que hacer se ve primero y lleva directo a hacerlo: «Qué atender hoy», «Revisar», «Pedir renovación» |
| **Nada se tipea dos veces** | Los datos de la persona salen de su ficha; si están mal, se corrigen allá |
| **Nada se borra** | Lo reemplazado queda como versión; lo quitado va a la papelera; lo emitido se anula con motivo |
| **El estado se deduce** | De las fechas y la revisión, nunca a mano |
| **Una sola forma de hacer cada cosa** | Un solo editor para todas las plantillas, una sola pantalla para emitir |
| **El colaborador ve el mismo dato** | Lo que RR.HH. aprueba, emite o pide es lo que la persona ve en su app |

### 1.5 Cómo se sabe si funcionó

| Indicador | Meta |
| --- | --- |
| Expedientes al día | Que el anillo de «Qué atender hoy» suba mes a mes |
| Tiempo de respuesta a solicitudes | Todas dentro de los 2 días hábiles |
| Documentos sin confirmar | Que bajen a menos del 10 % de lo enviado |
| Documentos subidos por el colaborador | Que la mayoría de las renovaciones las haga la persona, no RR.HH. |

### 1.6 A quién sirve

- **Recursos Humanos**, que deja de perseguir papeles y de armar certificados a mano.
- **El colaborador**, que sabe qué le falta y recibe sus documentos en el celular.
- **La empresa**, que tiene el expediente completo ante una auditoría y constancia de cada entrega.

### 1.7 Alcance y límites

- **Entra:** expedientes, carpetas y requisitos; subir, revisar y versionar; contratos y adendas; emitir certificados, memorándums, contratos y archivos propios; solicitudes; plantillas y tipos; avisos y numeración; Mis documentos del colaborador.
- **No entra en esta versión:** la firma electrónica; las boletas de pago (cuando exista Planillas); vacaciones, permisos y anticipos como solicitudes; el envío real de avisos y correos.

## 02 · Integraciones

*Con qué módulos se habla y qué toma de cada uno. Documentación no guarda copia de nada que no sea suyo.*

### 2.1 Gestión de personas

- La **ficha** es la dueña de los datos de la persona: nombre, documento, cargo, ingreso. Documentación los **lee**, no los copia.
- Los archivos que la persona cargó en la sección «Archivos» de su ficha aparecen en su expediente como documentos **de la ficha**: aprobados y de solo lectura —BR‑DOC‑002—.
- La cabecera del expediente muestra los datos de la ficha y no se editan desde acá.
- Al emitir, las variables de la plantilla se rellenan con la ficha —BR‑DOC‑033—. Si un dato falta, se corrige en la ficha.

### 2.2 Organización

- Las **sucursales**, **unidades organizacionales** y **cargos** de los filtros salen de Organización.
- El cargo y la sucursal de cada persona se toman del puesto que ocupa en el organigrama.

### 2.3 Onboarding

- Hoy no hay integración: la subida de documentos de una ruta va a los recursos de Onboarding, no al expediente —ABIERTA‑DOC‑05—.

### 2.4 Planillas

- Planillas lee el **contrato vigente** de cada persona para liquidar. Por eso no puede haber dos vigentes —BR‑DOC‑026—.
- Las boletas de pago serán un recibido más cuando el módulo exista.

### 2.5 Comunicación e Inicio

- Los avisos de vencimiento, los recordatorios y el resumen a RR.HH. se configuran acá —3.12— y saldrán por Comunicación. Hoy se registran y no se envían.

### 2.6 Usuarios y roles

- El usuario que hace cada acción queda en la bitácora.
- El colaborador ve su expediente desde Zona HR › Mis documentos.

### 2.7 Resumen

| Módulo | Documentación toma | Documentación da |
| --- | --- | --- |
| Gestión de personas | Datos y archivos de la ficha | — |
| Organización | Sucursales, unidades, cargos | — |
| Planillas | — | El contrato vigente |
| Comunicación | El envío de avisos | Qué avisar, a quién y cuándo |
| Zona HR del colaborador | — | Mis documentos y Mis solicitudes |

## 03 · Funcionalidades

*Cada pantalla, qué tiene y qué tiene que hacer. Primero las de Recursos Humanos, en el orden del menú; después lo que ve el líder, las del colaborador y las de todo el módulo.*

### Para Recursos Humanos

Las pantallas del módulo Documentación del menú lateral: Expedientes, Solicitudes, Documentos emitidos y Configuración, que se despliega en Plantillas y Notificaciones y numeración.

### 3.1 Expedientes

La primera pantalla: todos los colaboradores, qué les falta y qué hay que atender hoy.

- **Selector en la cabecera**: Activos, Desvinculados y Todos, con su número. Elige a quién se mira; los filtros trabajan dentro de eso.
- **Resumen de hoy**: un anillo con el porcentaje de expedientes al día y su desglose (vencidos o rechazados, por vencer, con faltantes, en revisión, con contrato por terminar), y **«Qué atender hoy»** con hasta tres tareas en orden de urgencia: vencidos con «Pedir renovación», documentos que esperan revisión con «Revisar», contratos por decidir con «Ver contratos», faltantes con «Ver quiénes» y por vencer con «Ver cuáles». Sin nada urgente: «Nada urgente: todos los expedientes están al día».
- **Buscador** por nombre, código, cargo o correo, y **filtros** de sucursal, unidad organizacional, cargo y **estado** en la misma fila: Todos, Al día, Requieren atención (Vencidos, Por vencer, Falta entregar, Rechazados, Contrato por vencer), cada uno con su número.
- **Tabla** de diez por página, ordenable por cualquier columna: Colaborador, Unidad organizacional, Sucursal, Expediente completo (barra con «x de y obligatorios») y **Lo más urgente**: una sola cosa, con el tiempo en color —«Venció hace 12 días», «Falta desde hace 4 meses»— y «+N más».
- Con un estado elegido aparece **«Ver por Colaborador / Documento»**: la vista por documento lista cada papel pendiente, con casillas para pedir varios a la vez y «Subir» por fila.
- Todo queda en la dirección: se puede compartir o volver a la misma vista.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑001 | El porcentaje al día y las tareas de hoy se calculan de los expedientes reales | Oblig. | Aprobar el único pendiente quita la tarea «Revisar» |
| RF‑DOC‑002 | «Lo más urgente» muestra una sola cosa por persona, en orden de gravedad | Oblig. | Con un vencido y un faltante, se ve el vencido y «+1 más» |
| RF‑DOC‑003 | Los filtros y el estado van en una fila y cuentan personas | Oblig. | «Vencidos 4» filtra a esas cuatro personas |
| RF‑DOC‑004 | La tabla pagina de a diez y se ordena por columna | Import. | Ordenar por sucursal y pasar de página conserva el orden |
| RF‑DOC‑005 | Pedir renovación guarda a quién y cuándo se pidió | Oblig. | Lo pedido muestra «pedido el …» y no se vuelve a marcar |
| RF‑DOC‑006 | Los desvinculados no suman pendientes | Oblig. | Un desvinculado con un vencido no aparece en «Qué atender hoy» |

> **En la maqueta:** «Pedir renovación» guarda el pedido pero no envía ningún mensaje. El texto «en los próximos 45 días» está fijo aunque el cálculo usa el valor de Notificaciones.

### 3.2 El expediente de una persona

Todo lo de una persona, por carpetas.

- **Cabecera**: foto, nombre, cargo, unidad, sucursal y código, de la ficha; la barra de avance «x de y obligatorios exigibles»; y los botones **Subir documento**, **Enviar documento**, **Descargar expediente** e **Historial**.
- **Pendientes** en pastillas que filtran: Por revisar, Faltan, Vencidos o por vencer. Sin nada: «No tiene nada pendiente».
- **Carpetas**: una por tipo, más Contratos, Recibidos y, si tienen algo, Por clasificar y Papelera. Cada una dice cuánto le falta (número en rojo), si está al día (✓) o si no se le exige nada (—).
- **Buscar** en todas sus carpetas y filtrar por estado; **Agregar requisito** para exigirle a esa persona un documento más.
- **Dentro de una carpeta**: los documentos en tarjetas con miniatura o en lista, lo urgente primero, con su acción según el estado —Subir, Renovar, Revisar, Ver— y un menú con Ver, Descargar, Exonerar, Dejar de exigir y Enviar a la papelera.
- **Ver un documento**: la vista previa, sus fechas, quién lo subió y por dónde, y todas sus versiones. Si está en revisión, Aprobar o Rechazar.
- **Historial**: la bitácora de la persona por mes, filtrable por Documentos, Recibidos, Contratos y Solicitudes.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑007 | Las carpetas muestran cuánto falta en cada una | Oblig. | Una carpeta con un faltante muestra «1» en rojo |
| RF‑DOC‑008 | Agregar requisito pide documento, si es obligatorio y el plazo | Oblig. | Agregar «Licencia» obligatoria con 30 días la suma a sus faltantes al vencer el plazo |
| RF‑DOC‑009 | Exonerar pide motivo y queda para siempre | Oblig. | Sin motivo, el botón no se activa |
| RF‑DOC‑010 | Descargar el expediente baja un ZIP con índice y una carpeta por tipo | Import. | El ZIP trae «00 Índice.txt» y las carpetas |
| RF‑DOC‑011 | El historial es una línea de tiempo por mes, filtrable | Import. | Filtrar «Contratos» deja solo los eventos de contratos |
| RF‑DOC‑012 | Un expediente de un desvinculado es de solo lectura | Oblig. | No aparecen Subir ni Enviar; Descargar sí |

### 3.3 Subir y clasificar

- **Subir documento** adivina qué es: por la tarjeta desde la que se sube, por el nombre del archivo, por lo que falta en la carpeta. Lo que no reconoce queda en **Por clasificar**, donde se elige «¿Qué documento es?».
- La fecha de emisión se pone en hoy y el vencimiento se calcula con la vigencia del subtipo. Un aviso ofrece **«Revisar fechas»** para corregirlas.
- Valida formato y tamaño antes de subir y dice el error en palabras.
- Un archivo igual a otro ya subido avisa, sin bloquear.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑013 | Lo que sube RR.HH. queda aprobado | Oblig. | Subir un carnet lo deja Vigente |
| RF‑DOC‑014 | Lo no reconocido va a Por clasificar | Oblig. | Un archivo «scan001.pdf» aparece en Por clasificar |
| RF‑DOC‑015 | Formato y tamaño se validan antes de subir | Oblig. | Un .exe se rechaza con «Este documento se recibe en PDF, JPG o PNG» |
| RF‑DOC‑016 | Las fechas se corrigen sin crear versión | Import. | Cambiar el vencimiento no suma una versión |

### 3.4 Revisar documentos

Lo que suben los colaboradores, en una bandeja de tres columnas.

- **Cola** a la izquierda, lo más antiguo primero, con los días de espera en ámbar desde 3 y en rojo desde 7.
- **El documento** grande al centro.
- **Panel** a la derecha: por dónde se subió, formato y peso, las fechas de emisión y vencimiento para corregir, **Aprobar** y **Rechazar…** con motivos rápidos —«No se lee», «Se ve cortado», «No es este documento», «Está vencido»— que rellenan el texto.
- Atajos: A para aprobar, flechas para recorrer. Al decidir pasa solo al siguiente.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑017 | La cola ordena por antigüedad y marca la espera | Oblig. | Un documento de hace 8 días se ve en rojo y primero |
| RF‑DOC‑018 | Rechazar exige un motivo de al menos 5 letras | Oblig. | «No» no alcanza |
| RF‑DOC‑019 | Al decidir se pasa al siguiente | Import. | Aprobar abre el próximo de la cola |

### 3.5 Contrato

La ficha de un contrato: la hoja grande con su sello «Firmado» o «Sin firma» y, al costado, qué pasa con él.

- **Aviso de estado**: vigente y firmado, por vencer con «Decida si lo renueva», vencido, falta el firmado, finalizado o reemplazado.
- **Acciones**: **Renovar con adenda** (solo si no es indefinido), **Subir el firmado** o reemplazarlo con motivo, y **Finalizar** con motivo.
- **Datos**: inicio, fin —con «ampliado al …» si una adenda lo corrió—, modalidad, plantilla, quién lo registró; sus versiones y la cadena de contrato y adendas.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑020 | El estado del contrato se calcula de sus fechas | Oblig. | Un plazo fijo a 30 días del fin está Por vencer |
| RF‑DOC‑021 | Renovar crea una adenda encadenada | Oblig. | La adenda aparece en la cadena y corre el fin |
| RF‑DOC‑022 | Subir el firmado crea una versión | Oblig. | El sello pasa a «Firmado» |
| RF‑DOC‑023 | Encadenar plazos fijos avisa, no bloquea | Import. | Con dos plazos fijos se ve «consúltelo con Legal» |

### 3.6 Solicitudes

Lo que los colaboradores le piden a RR.HH.

- **Selector en la cabecera**: Pendientes, Atendidas y Rechazadas, con su número.
- **Filtros** de sucursal, unidad, cargo y tipo de pedido.
- **Tabla**: Colaborador, Pide (Certificado, Copia o Corrección), Detalle y **Responder antes**, con el plazo en color: «Atrasada 2 días» o «Vence hoy» en rojo, «Mañana» en ámbar, «En 4 días» en gris. Lo más atrasado primero.
- Cada fila abre el pedido con «Ver detalle».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑024 | El plazo se cuenta en días hábiles | Oblig. | Un pedido del viernes vence el martes |
| RF‑DOC‑025 | Las pendientes se ordenan por plazo | Oblig. | La atrasada va primero |
| RF‑DOC‑026 | Las atendidas muestran qué se envió | Import. | «Ver el envío» abre el documento emitido |

### 3.7 Atender un pedido

Un pedido a la vez, en dos columnas: lo que va a recibir la persona y el panel para responder.

- **Certificado**: se elige la plantilla y **Emitir y enviar**.
- **Corrección**: se elige la plantilla, se marca **«Anular N al emitir el nuevo»** y **Reemitir y enviar**. Si el error está en la ficha, se corrige en Gestión de personas.
- **Copia**: se elige qué documento enviarle —sus contratos, lo que recibió, lo de su expediente— y **Enviar copia**.
- **Rechazar…** con motivos rápidos —«Se entrega en persona», «Ya se le envió», «Falta información», «No corresponde»—.
- Al terminar: el resultado, **Siguiente pendiente →** y **Volver a Solicitudes**.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑027 | Cada pedido se atiende con lo que pide | Oblig. | Un certificado se emite; una copia se elige |
| RF‑DOC‑028 | La corrección anula el documento anterior | Oblig. | El anterior queda Anulado con «Reemplazado por …» |
| RF‑DOC‑029 | Atender guarda qué documento lo resolvió | Oblig. | El colaborador ve «Ver el documento» en su pedido |
| RF‑DOC‑030 | Rechazar exige motivo | Oblig. | Sin motivo no se rechaza |

> **En la maqueta:** enviar la copia de un documento del expediente solo queda anotado; no le llega nada a la persona.

### 3.8 Documentos emitidos

Todo lo que RR.HH. envió y quién confirmó que lo recibió.

- **Emitir documento** arriba a la derecha.
- **Buscador** por documento, número o persona y **«Solo los que tienen personas sin confirmar (N)»**.
- **Tabla**: Documento (con su número, o «N documentos» si fue a un grupo, y «Solicitud» si vino de un pedido), Para, Enviado y **Confirmación**: «Confirmado» con fecha, «Sin confirmar», «x de y» o «Todos confirmaron». **Recordar** a quien no confirmó.
- **Detalle** de un envío: si fue a un grupo, su nombre editable, «Confirmaron x de y», «Recordar a los N que faltan», «Descargar todos» y la lista; si fue a una persona, la hoja tal como salió, Recordar, Descargar y **Anular** con motivo.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑031 | Un envío a varios se ve como uno, con su avance | Oblig. | «Felicitación · Ventas» muestra «5 de 7» |
| RF‑DOC‑032 | Recordar anota cuándo se recordó | Import. | La fila muestra «Recordado el …» |
| RF‑DOC‑033 | Anular pide motivo y el número no se reutiliza | Oblig. | El siguiente certificado no toma el número anulado |

### 3.9 Emitir

Una sola pantalla para enviar cualquier documento.

- **A la izquierda, el riel**: cada tipo con su puntito de color y su flechita para desplegar sus plantillas, con cuántas veces se emitió cada una. Al final, **Un archivo propio** (reglamento, política, comunicado).
- **Al centro, la hoja** tal como va a salir. Sin nadie elegido es una **hoja de ejemplo**, con los datos de la persona en celeste («Sin nombre»). Con alguien, sus datos; lo que falta en su ficha se marca en rojo y no deja enviar.
- **A la derecha, «Para quién»**: **Personas** (se busca y se suma de a una) o **Un grupo** (filtros de sucursal, unidad y cargo, buscador y casillas, como armar un grupo en WhatsApp; lo marcado queda arriba como etiquetas). Con varias personas, cada una tiene «Ver» y quien tiene un dato vacío «No sale».
- **Abajo**: el número que va a salir —«Salen del CERT‑0007 al CERT‑0012»—, **Pedir que confirme la recepción** y **Emitir y enviar a N personas**.
- **Memorándum**: un recuadro sobre la hoja para escribir el hecho, textos frecuentes y el aviso si ya recibió uno igual en el año.
- **Contrato y adenda**: una sola persona, con modalidad, fechas y qué pasa con el contrato vigente.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑034 | Solo se ofrecen plantillas activas | Oblig. | Una plantilla inactiva no aparece en el riel |
| RF‑DOC‑035 | La hoja se ve antes de enviar, con los datos reales | Oblig. | Al elegir a Diego, la hoja dice «Diego Morales» |
| RF‑DOC‑036 | Se puede enviar a un grupo armado con filtros | Oblig. | Unidad Ventas marca a sus 7 personas |
| RF‑DOC‑037 | Quien tiene un dato vacío no sale y se dice | Oblig. | «No sale» junto a su nombre; los demás sí salen |
| RF‑DOC‑038 | El número que saldrá se ve antes de enviar | Import. | «Sale con el número CERT‑0007/2026» |
| RF‑DOC‑039 | Un archivo propio se envía igual que una plantilla | Import. | Un PDF llega a cada persona elegida con su número |

### 3.10 Plantillas

La lista de plantillas de la empresa.

- **Buscador**, filtro de **Tipo** y **Todos, Activos, Inactivos**. **Nuevo modelo** abre el editor directo, sin ventana previa.
- **Tabla** de diez por página: Modelo (de fábrica o propio, y cuántas veces se emitió), Tipo con su color, Última edición y Estado.
- Menú por fila: Editar, Duplicar (para armar una variante), Activar o Desactivar, Eliminar (solo si nunca se usó).

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑040 | Una plantilla usada no se elimina | Oblig. | Ofrece «Desactivarlo» en su lugar |
| RF‑DOC‑041 | Duplicar crea una copia inactiva | Import. | La copia no aparece en Emitir hasta activarla |

### 3.11 El editor de plantillas

Uno solo para todos los tipos, en tres columnas.

- **Ajustes**, a la izquierda: Nombre; **Tipo**, con **«+ Crear un tipo nuevo»** al final de la lista (nombre, color, y «Así se va a ver»: el riel de Emitir, el número con su sigla y la carpeta en la app); y los interruptores **El colaborador lo puede pedir**, **Necesita aprobación** y **Activa**. Debajo, el **Historial**: cuándo se creó y cada edición, con «Ver cómo era»; en las de fábrica, **Volver al texto original**.
- **La hoja**, al centro: se escribe sobre ella. Los datos de la persona se ven como **pastillas** con su nombre de siempre —«Nombre completo», «Cargo»— y no como código. **Escribir** y **Vista previa**, que reparte el texto en páginas **Carta** u **Oficio** con los datos de quien está usando el sistema. **Subir .docx o .txt** trae el texto de un Word.
- **Datos para insertar**, a la derecha: Colaborador, Puesto, Relación laboral, Empresa y Documento; un toque los pone donde está el cursor.
- Arriba: el estado —«Cambios sin guardar», «Guardada · activa»— y **Guardar cambios**.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑042 | Los datos se insertan como pastillas en el cursor | Oblig. | Tocar «Cargo» lo pone donde se está escribiendo |
| RF‑DOC‑043 | La vista previa se pagina según el tamaño de hoja | Oblig. | Un texto largo da 5 páginas en carta y 4 en oficio |
| RF‑DOC‑044 | Crear un tipo nuevo no abre una ventana | Import. | Se crea desde la misma lista de tipos |
| RF‑DOC‑045 | Guardar una plantilla activa la valida | Oblig. | Un dato inexistente impide guardar y se dice cuál |
| RF‑DOC‑046 | El historial muestra cómo era cada versión | Import. | «Ver cómo era» abre el texto de ese día |
| RF‑DOC‑047 | Las de fábrica se editan y se pueden volver al original | Import. | «Volver al texto original» repone el texto |

### 3.12 Notificaciones y numeración

Una página de ajustes con un solo **Guardar cambios** en un encabezado fijo, que aparece con «N cambios sin guardar» y **Descartar**.

- **Vencimiento de documentos**: encendido o apagado; **Cuándo avisar** (hasta tres, en días antes); **A quién** (colaborador, jefe directo, responsable de RR.HH.); **Por dónde** (correo, notificación en la app); **Resumen a RR.HH.** (nunca, semanal, mensual).
- **Contratos y papelera**: días de aviso antes del fin de un plazo fijo y días que lo quitado queda en la papelera.
- **Numeración**: una tabla con cada tipo —también los creados—, su sigla, sus dígitos, si reinicia cada año y **el próximo número**, que cambia mientras se edita.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑048 | Con los avisos encendidos hace falta un día y un destinatario | Oblig. | Sin destinatario, «Elija al menos a quién avisar» |
| RF‑DOC‑049 | Cada tipo necesita su sigla | Oblig. | Una sigla vacía impide guardar |
| RF‑DOC‑050 | El próximo número se ve en vivo | Import. | Cambiar CERT por CER muestra «CER‑0007/2026» |

> **En la maqueta:** ningún aviso ni resumen se envía. Los días de aviso sí cambian el cálculo de «Por vencer».

### Para El líder de área

Hoy el líder entra al módulo con las mismas pantallas que Recursos Humanos.

### 3.13 Lo que ve el líder

- Ve Expedientes, Solicitudes, Documentos emitidos y Configuración, de toda la empresa.
- Lo que debería ver —su unidad, y en lectura— está abierto —ABIERTA‑DOC‑01—.

### Para El colaborador

Mis documentos y Mis solicitudes, en Zona HR, en la web y en el celular, con las mismas decisiones.

### 3.14 Mis documentos

- **Franja de avance**: un anillo con lo cumplido y «N documentos por entregar», o «Está al día». **Resolver** lleva a **Por entregar**: lo que tiene que entregar, en orden de urgencia (rechazado, vencido, falta, por vencer), con su motivo —«RR.HH. lo rechazó: no se lee», «Venció el …»— y su botón, y lo que está en revisión.
- **Mis carpetas**: sus carpetas en mosaicos amarillos, como carpetas de Windows, con un punto de color de lo más urgente y una palabra: «2 archivos · falta 1». **Contratos** aparte.
- **Buscador** que entiende sinónimos: «carnet» o «CI» encuentran el documento de identidad.
- **Subir** desde cada carpeta: primero lo que RR.HH. le pide, con sus formatos y tamaño. Lo subido queda **en revisión**.
- **Ver un documento**: la vista previa, sus fechas, sus versiones, el motivo si se rechazó y el botón para volver a subir o renovar.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑051 | Por entregar ordena por urgencia y dice por qué | Oblig. | Un rechazado va primero con su motivo |
| RF‑DOC‑052 | Lo que sube queda en revisión | Oblig. | Dice «Enviado. Quedó en revisión hasta que RR.HH. lo apruebe» |
| RF‑DOC‑053 | Solo sube lo que la empresa le deja subir | Oblig. | Lo demás dice «Lo carga RR.HH.» |
| RF‑DOC‑054 | El buscador entiende sinónimos | Import. | «carnet» encuentra «Documento de identidad» |

### 3.15 Lo que recibe de RR.HH.

- **De RR.HH.**: carpetas Certificados, Memorándums, una por cada tipo que creó la empresa y Otros, cada una con cuántos le faltan confirmar.
- Al abrir un documento: la hoja tal como salió y **Confirmar que lo recibí**, que aclara que confirmar es haberlo recibido y leído, no estar de acuerdo.
- **Reportar un error** abre una corrección con ese documento elegido.
- En **Contratos**, cada contrato con su estado y **Pedir una copia**. No hay firma desde la app.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑055 | Confirmar es una vez y guarda fecha y dispositivo | Oblig. | Después de confirmar, el botón ya no está |
| RF‑DOC‑056 | Cada tipo creado tiene su carpeta | Import. | «Constancias» aparece al recibir una constancia |
| RF‑DOC‑057 | Lo anulado no se ve | Oblig. | Un certificado anulado desaparece de Certificados |

### 3.16 Pedir y Mis solicitudes

- **Pedir**: Un certificado, Copia del contrato o Corregir algo que recibí. Desde un atajo, el tipo ya viene elegido. En una corrección hay que contar qué está mal.
- **Mis solicitudes**: En curso y Resueltas; cada pedido con un recorrido de tres pasos —Enviada, En RR.HH. («Responde hasta el …»), Atendida o Rechazada—, la nota de RR.HH. y **Ver el documento** si se lo enviaron.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑058 | Se ve hasta cuándo tiene RR.HH. para responder | Oblig. | «Responde hasta el 19 oct» |
| RF‑DOC‑059 | Se ve el documento que resolvió el pedido | Oblig. | «Ver el documento» abre el certificado |

### 3.17 En el celular

- Lo mismo que en la web, en pantallas que se apilan con «volver»: las carpetas en grilla, la lupa para buscar, el «+» de cada carpeta para subir y la franja oscura con su anillo.
- Mis solicitudes es un mosaico de Zona HR.

### Para Todo el módulo

Lo que vale en todas las pantallas.

### 3.18 Requisitos no funcionales

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑060 | Toda acción queda en la bitácora, que solo crece | Oblig. | Aprobar, rechazar, emitir y anular dejan su entrada |
| RF‑DOC‑061 | El estado nunca va solo por color | Oblig. | Cada estado tiene palabra y color |
| RF‑DOC‑062 | Abrir un documento confidencial deja rastro | Oblig. | La bitácora dice «Lectura confidencial» |

### 3.19 Cómo se escriben los textos

- La pantalla de RR.HH. y la del colaborador hablan de **usted**.
- Se dice **sucursal** y **unidad organizacional**, nunca «sede» ni «área».
- Se dice **expediente**, no «legajo»; **tipo**, no «categoría»; **plantilla**, no «modelo», salvo en «Nuevo modelo».
- Los avisos dicen qué pasó y qué hacer, en una frase: «Falta el firmado», «Decida si lo renueva con una adenda».

### 3.20 Fuera de alcance de esta versión

- Firma electrónica de contratos y documentos.
- Boletas de pago.
- Vacaciones, permisos y anticipos como solicitudes.
- Envío real de avisos, recordatorios y resúmenes.
- Configurar carpetas y documentos requeridos desde una pantalla —ABIERTA‑DOC‑02—.

## 04 · Reglas de negocio

*Las condiciones que el sistema cumple siempre. Primero las de Recursos Humanos, en el orden en que vive un expediente: se arma, se revisa, se cuida, se completa con contratos y documentos emitidos, y se configura; después la del líder y las del colaborador. Todas se leen igual, en cuatro apartados, y cada una dice de dónde viene —la regla del análisis o de la propuesta v0.2—.*

### Para Recursos Humanos

Las condiciones de las pantallas de Recursos Humanos, por tema: el expediente, los estados, subir y revisar, el rastro, lo urgente, los contratos, emitir, las solicitudes, las plantillas y las notificaciones.

### El expediente y sus carpetas

*Qué guarda el expediente y qué se le exige a cada persona*

#### 4.1 · BR-DOC-001 · Cada persona tiene un expediente, ordenado en carpetas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-001
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Expediente
- **Antes:** v0.2 · Repositorio
- **Estado:** Borrador

*Descripción general*

Cada colaborador tiene **un solo expediente**. Se ordena en una carpeta por **tipo** de documento (Información personal, Perfil profesional, Recursos y activos, Documentos agregados) y en carpetas fijas: **Contratos**, **Recibidos**, **Historial** y, cuando tienen algo, **Por clasificar** y **Papelera**.

**2. Escenarios ágiles de ejecución**

*Las carpetas fijas aparecen siempre*

- **Dado que** se abre el expediente de alguien sin contratos
- **Cuando** se mira la lista de carpetas
- **Entonces** Contratos aparece igual, con su aviso de que no tiene contrato vigente

**3. Condiciones y excepciones**

- Por clasificar y Papelera solo aparecen si tienen algo.
- Un tipo desactivado no aparece, salvo que la persona ya tenga documentos en él.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑007
- **Historia de usuario:** HU‑DOC‑01
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.2 · BR-DOC-002 · Lo que está en la ficha se lee, no se copia

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-002
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Documento
- **Antes:** REP‑03
- **Estado:** Borrador

*Descripción general*

Los archivos que la persona cargó en la sección «Archivos» de su ficha aparecen en su expediente como documentos **de la ficha**: aprobados, con sus fechas, y de **solo lectura**. La ficha es la dueña: si se cambia allá, cambia acá.

**2. Escenarios ágiles de ejecución**

*El carnet de la ficha aparece en el expediente*

- **Dado que** la persona cargó su carnet en la ficha
- **Cuando** RR.HH. abre su carpeta Información personal
- **Entonces** el carnet está Vigente, con la etiqueta «de la ficha», y no ofrece Enviar a la papelera

**3. Condiciones y excepciones**

- Si el mismo documento está en la ficha y en Documentación, se muestra el de emisión más nueva.
- Un documento de la ficha no se versiona desde Documentación.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑007
- **Historia de usuario:** HU‑DOC‑01
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.3 · BR-DOC-003 · Se exige lo que pide la empresa a todos, más lo que se pide a esa persona

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-003
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Requisito
- **Antes:** RF‑10 a RF‑13
- **Estado:** Borrador

*Descripción general*

Lo que se le exige a una persona sale de dos lados: lo **exigido a todos** desde la configuración del documento, con su plazo desde el ingreso, y lo que RR.HH. **le agregó a ella** desde su expediente. Si los dos piden lo mismo, **gana lo más exigente**: obligatorio sobre opcional, el plazo más corto.

**2. Escenarios ágiles de ejecución**

*Un requisito personal más exigente gana*

- **Dado que** el título se pide a todos como opcional
- **Cuando** RR.HH. se lo agrega a una persona como obligatorio a 15 días
- **Entonces** para esa persona es obligatorio y vence a los 15 días

**3. Condiciones y excepciones**

- Quitar un requisito personal solo se puede si no tiene documento.
- No hay perfiles: se exige por documento o por persona.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑008
- **Historia de usuario:** HU‑DOC‑02
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.4 · BR-DOC-004 · El avance cuenta solo lo obligatorio y ya exigible

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-004
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Expediente
- **Antes:** RF‑14 · RN‑07
- **Estado:** Borrador

*Descripción general*

El porcentaje de un expediente es lo **cumplido** sobre lo **obligatorio que ya se puede exigir**. Un faltante cuyo plazo todavía corre no descuenta; lo opcional no cuenta; lo exonerado sale de la cuenta. Sin nada exigido, no hay porcentaje.

**2. Escenarios ágiles de ejecución**

*Un plazo que corre no descuenta*

- **Dado que** alguien entró hace 5 días y el croquis se exige a 30
- **Cuando** se calcula su avance
- **Entonces** el croquis no cuenta como faltante y el porcentaje no baja

**3. Condiciones y excepciones**

- Cumplen Vigente y Por vencer. En revisión no cumple hasta aprobarse.
- Sin requisitos, la barra no muestra porcentaje.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑001
- **Historia de usuario:** HU‑DOC‑01
- **Pantalla:** W‑DOC‑01 Expedientes
- **Diseño:** Prototipado

#### 4.5 · BR-DOC-005 · Exonerar pide motivo y es para siempre

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-005
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Requisito
- **Antes:** RF‑15 · RN‑09
- **Estado:** Borrador

*Descripción general*

RR.HH. puede liberar a una persona de un documento que se le exige. Lleva **motivo**, queda quién y cuándo, y **no se deshace**. El documento pasa a **Exonerado** y sale del avance.

**2. Escenarios ágiles de ejecución**

*Exonerar sin motivo no se puede*

- **Dado que** a alguien le falta el certificado de antecedentes
- **Cuando** RR.HH. elige «Exonerar» y no escribe motivo
- **Entonces** el botón no se activa

**3. Condiciones y excepciones**

- Solo se exonera lo que se exige y está faltante, vencido o rechazado.
- La exoneración queda en la bitácora.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑009
- **Historia de usuario:** HU‑DOC‑02
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.6 · BR-DOC-006 · El expediente de un desvinculado se cierra en solo lectura

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-006
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Expediente
- **Antes:** RF‑24 · RN‑21
- **Estado:** Borrador

*Descripción general*

Cuando alguien deja la empresa, su expediente queda **cerrado**: se ve y se descarga, pero no se sube, no se envía ni se edita nada. Sus pendientes **no se persiguen**: no suman a «Qué atender hoy» ni a los filtros de estado.

**2. Escenarios ágiles de ejecución**

*Un desvinculado no aparece en lo urgente*

- **Dado que** una persona desvinculada tiene un documento vencido
- **Cuando** RR.HH. mira «Qué atender hoy»
- **Entonces** esa persona no aparece

**3. Condiciones y excepciones**

- Se ve en Expedientes eligiendo «Desvinculados» o «Todos».
- Descargar el expediente sigue disponible.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑012
- **Historia de usuario:** HU‑DOC‑01
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

### El estado de un documento

*De dónde sale cada uno de los siete estados*

#### 4.7 · BR-DOC-007 · El estado de un documento se deduce, nunca se elige

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-007
- **Grupo:** El estado de un documento
- **Qué gobierna:** Documento
- **Antes:** REP‑02
- **Estado:** Borrador

*Descripción general*

El estado sale, en este orden, de: la **revisión** (pendiente → En revisión; rechazada → Rechazado), el **vencimiento** (pasado → Vencido; dentro de la ventana de aviso → Por vencer) y, si no hay nada de eso, **Vigente**. Faltante y Exonerado salen de los requisitos.

**2. Escenarios ágiles de ejecución**

*El vencimiento cambia el estado solo*

- **Dado que** un carnet vence mañana
- **Cuando** pasa la medianoche
- **Entonces** el carnet aparece Vencido sin que nadie lo toque

**3. Condiciones y excepciones**

- Nadie puede poner un estado a mano.
- El estado se recalcula cada vez que se mira.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑061
- **Historia de usuario:** HU‑DOC‑01
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.8 · BR-DOC-008 · «Por vencer» empieza con el primer aviso

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-008
- **Grupo:** El estado de un documento
- **Qué gobierna:** Documento
- **Antes:** RF‑06 · RF‑35
- **Estado:** Borrador

*Descripción general*

Un documento está **Por vencer** desde el aviso más temprano: si los avisos son a 30 y 7 días, desde 30 días antes. Cada documento puede tener sus propios avisos; si no, usa los de Notificaciones.

**2. Escenarios ágiles de ejecución**

*La ventana sigue a los avisos*

- **Dado que** los avisos son a 60 y 15 días
- **Cuando** un documento vence en 45 días
- **Entonces** está Por vencer

**3. Condiciones y excepciones**

- Hasta tres avisos por documento.
- Con los avisos apagados, la ventana sigue usando los días guardados.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑048
- **Historia de usuario:** HU‑DOC‑03
- **Pantalla:** W‑DOC‑12 Notificaciones
- **Diseño:** Prototipado

#### 4.9 · BR-DOC-009 · Si el documento vence, la fecha de vencimiento es obligatoria

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-009
- **Grupo:** El estado de un documento
- **Qué gobierna:** Documento
- **Antes:** RN‑03
- **Estado:** Borrador

*Descripción general*

Un documento cuyo subtipo vence no se guarda sin **fecha de vencimiento**, y esa fecha tiene que ser **posterior a la emisión**. Al subir se propone sola con la vigencia del documento.

**2. Escenarios ágiles de ejecución**

*Vencimiento antes de la emisión*

- **Dado que** se corrigen las fechas de un carnet
- **Cuando** el vencimiento queda antes que la emisión
- **Entonces** no se guarda y se dice por qué

**3. Condiciones y excepciones**

- La emisión es siempre obligatoria.
- Un documento que no vence no pide vencimiento.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑016
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.10 · BR-DOC-010 · Lo que sube el colaborador no cuenta hasta que RR.HH. lo aprueba

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-010
- **Grupo:** El estado de un documento
- **Qué gobierna:** Documento
- **Antes:** RF‑31 · RN‑05
- **Estado:** Borrador

*Descripción general*

Todo lo que sube el colaborador entra **En revisión** y no cumple el requisito hasta que RR.HH. lo **aprueba**. Lo que sube RR.HH. queda aprobado al subirlo.

**2. Escenarios ágiles de ejecución**

*Subir no basta*

- **Dado que** el colaborador sube su carnet renovado
- **Cuando** RR.HH. todavía no lo revisó
- **Entonces** el expediente sigue contando el carnet como vencido y el nuevo como En revisión

**3. Condiciones y excepciones**

- Al aprobar, cuenta con sus fechas.
- El colaborador ve «En revisión» en su app.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑052
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑04 Revisar
- **Diseño:** Prototipado

#### 4.11 · BR-DOC-011 · Rechazar exige un motivo, y el colaborador lo ve

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-011
- **Grupo:** El estado de un documento
- **Qué gobierna:** Documento
- **Antes:** RF‑32
- **Estado:** Borrador

*Descripción general*

Rechazar un documento pide un **motivo** de al menos cinco letras. Ese motivo es lo que el colaborador lee en su app: «RR.HH. lo rechazó: no se lee».

**2. Escenarios ágiles de ejecución**

*Rechazar con motivo rápido*

- **Dado que** RR.HH. rechaza un carnet
- **Cuando** elige «No se lee»
- **Entonces** el texto se rellena y, al confirmar, el colaborador ve ese motivo y «Volver a subir»

**3. Condiciones y excepciones**

- Los motivos rápidos son: No se lee, Se ve cortado, No es este documento, Está vencido.
- El rechazo queda en la bitácora.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑018
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑04 Revisar
- **Diseño:** Prototipado

#### 4.12 · BR-DOC-012 · Reemplazar no borra: crea una versión

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-012
- **Grupo:** El estado de un documento
- **Qué gobierna:** Documento
- **Antes:** RN‑13 · RN‑02
- **Estado:** Borrador

*Descripción general*

Subir un documento que ya existe **agrega una versión**; la anterior queda guardada, marcada como reemplazada. Si el documento admite **varios** —certificados de cursos—, en cambio, se suma uno nuevo.

**2. Escenarios ágiles de ejecución**

*Renovar el carnet*

- **Dado que** alguien tiene su carnet vencido
- **Cuando** RR.HH. sube el nuevo
- **Entonces** el documento tiene dos versiones y la actual es la nueva

**3. Condiciones y excepciones**

- Se puede escribir por qué se reemplaza.
- Las versiones se ven al abrir el documento.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑013
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

### Subir y revisar

*Cómo entra un documento y quién lo aprueba*

#### 4.13 · BR-DOC-013 · Lo que sube RR.HH. queda aprobado

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-013
- **Grupo:** Subir y revisar
- **Qué gobierna:** Documento
- **Antes:** RF‑26
- **Estado:** Borrador

*Descripción general*

Un documento que sube RR.HH. desde el expediente entra **aprobado**: no pasa por la revisión. Queda quién lo subió, cuándo y por dónde.

**2. Escenarios ágiles de ejecución**

*RR.HH. sube un título*

- **Dado que** falta el título de alguien
- **Cuando** RR.HH. lo sube desde la carpeta
- **Entonces** queda Vigente sin pasar por Revisar

**3. Condiciones y excepciones**

- La emisión se pone en hoy y se puede corregir con «Revisar fechas».
- El vencimiento se propone con la vigencia del documento.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑013
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑03 Subir
- **Diseño:** Prototipado

#### 4.14 · BR-DOC-014 · Formato y tamaño se validan antes de subir

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-014
- **Grupo:** Subir y revisar
- **Qué gobierna:** Documento
- **Antes:** RF‑04
- **Estado:** Borrador

*Descripción general*

Cada documento acepta ciertos **formatos** (por defecto PDF, JPG y PNG) y un **tamaño máximo** (por defecto 10 MB). Lo que no cumple no se sube y el aviso dice qué se acepta.

**2. Escenarios ágiles de ejecución**

*Un archivo demasiado grande*

- **Dado que** un archivo pesa 15 MB
- **Cuando** se intenta subir
- **Entonces** no se sube y dice «El archivo pesa más de 10 MB»

**3. Condiciones y excepciones**

- Vale igual para RR.HH. y para el colaborador.
- Un archivo igual a otro ya subido avisa, sin bloquear.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑015
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑03 Subir
- **Diseño:** Prototipado

#### 4.15 · BR-DOC-015 · Lo que no se reconoce va a Por clasificar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-015
- **Grupo:** Subir y revisar
- **Qué gobierna:** Documento
- **Antes:** v0.2 · Por clasificar
- **Estado:** Borrador

*Descripción general*

Al subir, el sistema adivina qué documento es: por la tarjeta desde la que se sube, por el nombre del archivo, por lo que falta en la carpeta. Si no puede, el archivo queda en **Por clasificar**, donde RR.HH. elige qué es o lo descarta.

**2. Escenarios ágiles de ejecución**

*Clasificar después*

- **Dado que** se sube «scan001.pdf» desde la cabecera
- **Cuando** el sistema no reconoce qué es
- **Entonces** queda en Por clasificar con «¿Qué documento es?», los faltantes primero

**3. Condiciones y excepciones**

- «Otro documento» permite ponerle un nombre.
- Los archivos sin clasificar suman al contador del menú.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑014
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑03 Subir
- **Diseño:** Prototipado

#### 4.16 · BR-DOC-016 · La revisión va de lo más antiguo a lo más nuevo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-016
- **Grupo:** Subir y revisar
- **Qué gobierna:** Revisión
- **Antes:** v0.2 · Por revisar
- **Estado:** Borrador

*Descripción general*

La bandeja de revisión muestra primero lo que **más espera**. Los días de espera se pintan en ámbar desde 3 y en rojo desde 7. Al aprobar o rechazar, se pasa solo al siguiente.

**2. Escenarios ágiles de ejecución**

*Lo que más espera va primero*

- **Dado que** hay un documento de hace 8 días y otro de hoy
- **Cuando** se abre Revisar
- **Entonces** el de hace 8 días está primero y en rojo

**3. Condiciones y excepciones**

- El contador del menú cuenta lo pendiente de revisión y lo sin clasificar.
- Las fechas se pueden corregir antes de aprobar.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑017
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑04 Revisar
- **Diseño:** Prototipado

#### 4.17 · BR-DOC-017 · Las fechas se corrigen sin crear una versión

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-017
- **Grupo:** Subir y revisar
- **Qué gobierna:** Documento
- **Antes:** RF‑03
- **Estado:** Borrador

*Descripción general*

Corregir la emisión o el vencimiento de un documento **no crea una versión**: es el mismo archivo con la fecha bien puesta. Queda en la bitácora.

**2. Escenarios ágiles de ejecución**

*Corregir el vencimiento*

- **Dado que** un carnet se subió con el vencimiento de hoy
- **Cuando** RR.HH. lo corrige a 2034
- **Entonces** el documento sigue con una sola versión y está Vigente

**3. Condiciones y excepciones**

- Se corrige desde el aviso «Revisar fechas» o desde Revisar.
- Valen las reglas de BR‑DOC‑009.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑016
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑04 Revisar
- **Diseño:** Prototipado

### El rastro

*Nada se borra y todo queda escrito*

#### 4.18 · BR-DOC-018 · Nada se borra: lo quitado va a la papelera

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-018
- **Grupo:** El rastro
- **Qué gobierna:** Documento
- **Antes:** RF‑88 · RF‑89 · REP‑01
- **Estado:** Borrador

*Descripción general*

Quitar un documento pide **motivo** y **una segunda confirmación**, y lo manda a la **Papelera**, de donde se recupera. Los documentos de la ficha no van a la papelera.

**2. Escenarios ágiles de ejecución**

*Quitar con doble paso*

- **Dado que** RR.HH. quiere quitar un documento cargado por error
- **Cuando** escribe el motivo y confirma «Sí, enviar a la papelera»
- **Entonces** el documento aparece en la Papelera con «Recuperar»

**3. Condiciones y excepciones**

- La papelera guarda lo quitado durante los días de Notificaciones (30 por defecto).
- Recuperar devuelve el documento a su carpeta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑060
- **Historia de usuario:** HU‑DOC‑05
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.19 · BR-DOC-019 · Toda acción queda en una bitácora que solo crece

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-019
- **Grupo:** El rastro
- **Qué gobierna:** Bitácora
- **Antes:** RF‑85 · REP‑06
- **Estado:** Borrador

*Descripción general*

Subir, aprobar, rechazar, exonerar, quitar, emitir, entregar, anular, registrar contratos, atender solicitudes y cambiar la configuración dejan una entrada: **quién, cuándo, qué y sobre quién**. La bitácora no se edita ni se borra.

**2. Escenarios ágiles de ejecución**

*La aprobación deja rastro*

- **Dado que** RR.HH. aprueba un carnet
- **Cuando** se abre el Historial de esa persona
- **Entonces** está la entrada con el nombre de quien aprobó y la fecha

**3. Condiciones y excepciones**

- El Historial de cada persona es su parte de la bitácora.
- Se filtra por Documentos, Recibidos, Contratos y Solicitudes.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑060
- **Historia de usuario:** HU‑DOC‑05
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.20 · BR-DOC-020 · Abrir un documento confidencial deja rastro

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-020
- **Grupo:** El rastro
- **Qué gobierna:** Bitácora
- **Antes:** RF‑90
- **Estado:** Borrador

*Descripción general*

Cada documento tiene una **visibilidad**: general, restringida o confidencial. Abrir o descargar uno **confidencial** anota una «Lectura confidencial» en la bitácora, con quién y cuándo.

**2. Escenarios ágiles de ejecución**

*Leer un memorándum de llamada de atención*

- **Dado que** el memorándum es confidencial
- **Cuando** RR.HH. lo descarga
- **Entonces** la bitácora anota la lectura confidencial

**3. Condiciones y excepciones**

- El jefe no ve un documento confidencial salvo permiso explícito.
- La visibilidad la define el documento o la plantilla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑062
- **Historia de usuario:** HU‑DOC‑05
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.21 · BR-DOC-021 · El expediente completo se descarga en un ZIP con índice

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-021
- **Grupo:** El rastro
- **Qué gobierna:** Expediente
- **Antes:** RF‑22
- **Estado:** Borrador

*Descripción general*

Descargar el expediente baja un **ZIP** con un **índice** y una carpeta por tipo, más los recibidos y los contratos. La descarga queda en la bitácora.

**2. Escenarios ágiles de ejecución**

*Descargar para una auditoría*

- **Dado que** un auditor pide el expediente de alguien
- **Cuando** RR.HH. pulsa «Descargar expediente»
- **Entonces** baja un ZIP con «00 Índice.txt» y sus carpetas

**3. Condiciones y excepciones**

- También se descarga un expediente cerrado.
- Cada documento va con su versión actual.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑010
- **Historia de usuario:** HU‑DOC‑05
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

### Lo urgente

*Qué se muestra primero y cómo se pide*

#### 4.22 · BR-DOC-022 · Lo más urgente se elige por gravedad

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-022
- **Grupo:** Lo urgente
- **Qué gobierna:** Expediente
- **Antes:** RF‑39
- **Estado:** Borrador

*Descripción general*

De cada persona se muestra **una sola cosa**, la más grave, en este orden: vencido, rechazado, faltante, contrato por terminar, por vencer, en revisión. El resto se resume en «+N más». Al día, se ve «—».

**2. Escenarios ágiles de ejecución**

*Se muestra lo peor*

- **Dado que** alguien tiene un faltante y un vencido
- **Cuando** se mira su fila en Expedientes
- **Entonces** «Lo más urgente» muestra el vencido y «+1 más»

**3. Condiciones y excepciones**

- El tiempo va en color: «Venció hace 12 días».
- En revisión cuenta como al día en los filtros.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑002
- **Historia de usuario:** HU‑DOC‑03
- **Pantalla:** W‑DOC‑01 Expedientes
- **Diseño:** Prototipado

#### 4.23 · BR-DOC-023 · Pedir un documento guarda cuándo se pidió

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-023
- **Grupo:** Lo urgente
- **Qué gobierna:** Pedido
- **Antes:** RF‑39
- **Estado:** Borrador

*Descripción general*

Pedir la renovación de un vencido o la entrega de un faltante guarda **a quién y cuándo** se le pidió. Lo pedido muestra «pedido el …» y no se vuelve a marcar. El colaborador ve «RR.HH. se lo pidió el …».

**2. Escenarios ágiles de ejecución**

*No pedir dos veces*

- **Dado que** ayer se le pidió la renovación del carnet a alguien
- **Cuando** se abre «Pedir renovación»
- **Entonces** esa persona aparece sin marcar, con «pedido el» y la fecha

**3. Condiciones y excepciones**

- Se puede pedir a varios de una vez.
- Pedir no envía nada por sí solo: el envío es de Comunicación.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑005
- **Historia de usuario:** HU‑DOC‑03
- **Pantalla:** W‑DOC‑01 Expedientes
- **Diseño:** Prototipado

### Los contratos

*Uno vigente por persona, y la cadena de adendas*

#### 4.24 · BR-DOC-024 · Un contrato se registra desde Emitir y vive en el expediente

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-024
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** v0.2 · ABIERTA‑03
- **Estado:** Borrador

*Descripción general*

Los contratos y las adendas se **registran desde Emitir**, para una sola persona, generados desde una plantilla o subiendo el firmado. Quedan en la carpeta **Contratos** del expediente, con su número.

**2. Escenarios ágiles de ejecución**

*Registrar un contrato*

- **Dado que** se elige «Contrato a plazo fijo» en Emitir
- **Cuando** se elige a una persona y se ponen las fechas
- **Entonces** queda en su carpeta Contratos, «Sin firma» hasta que se suba el firmado

**3. Condiciones y excepciones**

- Un contrato es de una sola persona.
- No hay grupo en Emitir para un contrato.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑020
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.25 · BR-DOC-025 · La modalidad decide las fechas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-025
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** RN‑20
- **Estado:** Borrador

*Descripción general*

Un contrato **a plazo fijo** pide **fecha de fin**; uno **indefinido** no la pide. El fin tiene que ser posterior al inicio.

**2. Escenarios ágiles de ejecución**

*Plazo fijo sin fin*

- **Dado que** se registra un contrato a plazo fijo
- **Cuando** no se pone fin
- **Entonces** no se registra y dice que falta la fecha de fin

**3. Condiciones y excepciones**

- La plantilla propone la modalidad.
- Por obra y eventual piden fin si se conoce.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑020
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.26 · BR-DOC-026 · No puede haber dos contratos vigentes

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-026
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** RN‑18 · RF‑65
- **Estado:** Borrador

*Descripción general*

Planillas liquida con **el** contrato vigente. Por eso, al registrar uno nuevo para alguien que ya tiene uno vigente, hay que **decidir** qué pasa con el anterior: **finalizarlo** o **reemplazarlo**. No se elige por omisión.

**2. Escenarios ágiles de ejecución**

*Obligar a decidir*

- **Dado que** alguien tiene un contrato vigente
- **Cuando** se registra otro
- **Entonces** aparece «Ya tiene un contrato vigente» y no se registra hasta elegir finalizar o reemplazar

**3. Condiciones y excepciones**

- Reemplazado guarda por cuál se reemplazó.
- Finalizado guarda la fecha, quién y el motivo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑020
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.27 · BR-DOC-027 · Una adenda necesita su contrato y no empieza antes que él

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-027
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** RN‑19
- **Estado:** Borrador

*Descripción general*

Una **adenda** siempre modifica un contrato: sin contrato vigente no se puede registrar, y no puede regir desde antes del inicio de su contrato. Una adenda de ampliación **corre el fin** del contrato.

**2. Escenarios ágiles de ejecución**

*Renovar con adenda*

- **Dado que** un plazo fijo termina el 30 de octubre
- **Cuando** se pulsa «Renovar con adenda» con fin al 30 de abril
- **Entonces** el contrato dice «ampliado al 30 de abril» y deja de estar Por vencer

**3. Condiciones y excepciones**

- «Renovar con adenda» propone empezar el día siguiente al fin.
- Un contrato indefinido no se renueva con adenda.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑021
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑05 Contrato
- **Diseño:** Prototipado

#### 4.28 · BR-DOC-028 · El estado de un contrato se calcula de sus fechas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-028
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** RF‑64
- **Estado:** Borrador

*Descripción general*

Un contrato está **En elaboración** (sin versiones), **Vigente**, **Por vencer** (dentro de los días de aviso de Notificaciones, 45 por defecto), **Vencido**, **Finalizado** o **Reemplazado**. Solo Finalizado y Reemplazado se guardan, porque son decisiones de una persona.

**2. Escenarios ágiles de ejecución**

*Por vencer a 45 días*

- **Dado que** un plazo fijo termina en 40 días
- **Cuando** se mira su ficha
- **Entonces** está Por vencer y dice «Decida si lo renueva con una adenda»

**3. Condiciones y excepciones**

- El fin que vale es el de la última adenda.
- Subir el firmado crea una versión; el sello pasa a «Firmado».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑020
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑05 Contrato
- **Diseño:** Prototipado

#### 4.29 · BR-DOC-029 · Encadenar plazos fijos avisa, no bloquea

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-029
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** RF‑66
- **Estado:** Borrador

*Descripción general*

Si una persona ya encadena **dos o más contratos a plazo fijo**, registrar o renovar otro muestra un aviso: encadenar más puede volver indefinida la relación; hay que consultarlo con Legal. El sistema **avisa, no bloquea**.

**2. Escenarios ágiles de ejecución**

*El tercer plazo fijo*

- **Dado que** alguien tiene dos plazos fijos seguidos
- **Cuando** se registra un tercero
- **Entonces** aparece el aviso de Legal y se puede registrar igual

**3. Condiciones y excepciones**

- Cuentan los plazos fijos no reemplazados.
- El aviso aparece en Emitir y en la ficha del contrato.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑023
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑05 Contrato
- **Diseño:** Prototipado

### Emitir

*Cómo sale un documento hacia una persona*

#### 4.30 · BR-DOC-030 · Solo se emite con una plantilla activa

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-030
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** RN‑17
- **Estado:** Borrador

*Descripción general*

En Emitir aparecen solo las plantillas **activas** con un texto guardado. Una plantilla inactiva es un borrador y no se usa.

**2. Escenarios ágiles de ejecución**

*Una plantilla inactiva no aparece*

- **Dado que** se desactiva «Memorándum de llamada de atención»
- **Cuando** se abre Emitir
- **Entonces** no está en Memorándums

**3. Condiciones y excepciones**

- Lo ya emitido con ella no cambia.
- Volver a activarla la devuelve a Emitir.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑034
- **Historia de usuario:** HU‑DOC‑07
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.31 · BR-DOC-031 · Ningún dato de la persona se tipea al emitir

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-031
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** RF‑51
- **Estado:** Borrador

*Descripción general*

Nombre, documento, cargo, unidad, sucursal, ingreso, antigüedad y haber salen de la **ficha** y de Organización. Lo que la plantilla no puede rellenar se marca en rojo en la hoja y **no deja emitir**: se corrige en la ficha.

**2. Escenarios ágiles de ejecución**

*Un dato vacío bloquea*

- **Dado que** a alguien le falta el haber básico en la ficha
- **Cuando** se le emite un certificado con sueldo
- **Entonces** el hueco se ve en rojo y el botón dice qué falta

**3. Condiciones y excepciones**

- Lo único que se escribe al emitir es el texto del recuadro de la plantilla, si lo tiene.
- Antes de elegir a alguien, la hoja muestra datos de ejemplo en celeste.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑035
- **Historia de usuario:** HU‑DOC‑07
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.32 · BR-DOC-032 · A un grupo, quien tiene un dato vacío no sale y los demás sí

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-032
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** v0.2 · Lotes
- **Estado:** Borrador

*Descripción general*

Al emitir a varias personas, a quien le falta un dato que la plantilla usa se le marca **«No sale»** y se dice por qué; **los demás salen**. Un envío a varios queda como un solo envío con su avance.

**2. Escenarios ágiles de ejecución**

*Uno no frena a todos*

- **Dado que** se emite una felicitación a 7 personas y a una le falta el cargo
- **Cuando** se pulsa «Emitir y enviar a 6 personas»
- **Entonces** salen 6 y la séptima queda dicha con su nombre

**3. Condiciones y excepciones**

- Cada persona recibe el suyo, con su número.
- Los contratos no se emiten a grupos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑037
- **Historia de usuario:** HU‑DOC‑07
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.33 · BR-DOC-033 · Cada tipo se numera solo, en su serie

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-033
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** RF‑07 · RF‑53
- **Estado:** Borrador

*Descripción general*

Cada emitido recibe el **siguiente número** de la serie de su tipo, con el formato sigla‑número/gestión —CERT‑0007/2026—. Los certificados, memorándums y tipos propios reinician cada año; los contratos, no.

**2. Escenarios ágiles de ejecución**

*El número sale solo*

- **Dado que** el último certificado es CERT‑0006/2026
- **Cuando** se emite uno nuevo
- **Entonces** sale CERT‑0007/2026

**3. Condiciones y excepciones**

- A varios, salen en serie: «del CERT‑0007 al CERT‑0012».
- La sigla y los dígitos se cambian en Notificaciones y numeración.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑038
- **Historia de usuario:** HU‑DOC‑07
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.34 · BR-DOC-034 · Un número no se vuelve a usar nunca

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-034
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** RN‑15
- **Estado:** Borrador

*Descripción general*

Un número que salió queda **quemado**, aunque el documento se anule. Así la serie no tiene huecos que alguien pueda llenar.

**2. Escenarios ágiles de ejecución**

*Anular no libera el número*

- **Dado que** se anula CERT‑0007
- **Cuando** se emite otro certificado
- **Entonces** sale CERT‑0008

**3. Condiciones y excepciones**

- Vale igual para los contratos.
- Cambiar la sigla no reinicia la cuenta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑033
- **Historia de usuario:** HU‑DOC‑08
- **Pantalla:** W‑DOC‑08 Documentos emitidos
- **Diseño:** Prototipado

#### 4.35 · BR-DOC-035 · Lo emitido no se edita: se anula con motivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-035
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** RN‑14 · RN‑16
- **Estado:** Borrador

*Descripción general*

Al emitir, los datos y el texto se **congelan**: aunque la plantilla o la ficha cambien después, el documento dice lo que decía. Si estaba mal, se **anula con motivo** y se emite otro.

**2. Escenarios ágiles de ejecución**

*El texto queda como salió*

- **Dado que** se emitió un certificado y después se cambió la plantilla
- **Cuando** se abre el certificado
- **Entonces** dice el texto de antes

**3. Condiciones y excepciones**

- Un anulado desaparece de la app del colaborador.
- La corrección de una solicitud anula y reemite en un paso.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑033
- **Historia de usuario:** HU‑DOC‑08
- **Pantalla:** W‑DOC‑08 Documentos emitidos
- **Diseño:** Prototipado

#### 4.36 · BR-DOC-036 · Emitir es entregar, y lo emitido se archiva solo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-036
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** REP‑05
- **Estado:** Borrador

*Descripción general*

Al emitir, el documento **le llega a la persona** por la app y queda en la carpeta **Recibidos** de su expediente, sin que nadie lo archive.

**2. Escenarios ágiles de ejecución**

*Llega y se archiva*

- **Dado que** se emite un certificado a alguien
- **Cuando** se abre su expediente
- **Entonces** el certificado está en Recibidos y en su app, Sin confirmar

**3. Condiciones y excepciones**

- Un contrato queda en Contratos, no en Recibidos.
- Un archivo propio también se archiva en Recibidos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑039
- **Historia de usuario:** HU‑DOC‑07
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.37 · BR-DOC-037 · Confirmar la recepción es una vez y no se deshace

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-037
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** RF‑55
- **Estado:** Borrador

*Descripción general*

Si al emitir se pidió que la persona **confirme la recepción**, ella confirma desde su app una sola vez; queda la **fecha y el dispositivo**. Confirmar es haberlo recibido y leído, no estar de acuerdo.

**2. Escenarios ágiles de ejecución**

*Confirmar desde el celular*

- **Dado que** alguien recibió un memorándum
- **Cuando** pulsa «Confirmar que lo recibí»
- **Entonces** queda Confirmado con la fecha y «Celular · app SoulyHR»

**3. Condiciones y excepciones**

- Sin pedir confirmación, el documento dice que no hace falta confirmar.
- Un anulado no se confirma.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑055
- **Historia de usuario:** HU‑DOC‑12
- **Pantalla:** W‑DOC‑15 De RR.HH.
- **Diseño:** Prototipado

#### 4.38 · BR-DOC-038 · El memorándum lleva el hecho, y avisa si ya hay uno igual

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-038
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** v0.2 · Emisión
- **Estado:** Borrador

*Descripción general*

Un memorándum exige escribir **el hecho o el motivo** en su recuadro, sin dejar nada entre corchetes. Si la persona ya recibió **uno igual en los últimos 12 meses**, se avisa antes de emitir; no se bloquea.

**2. Escenarios ágiles de ejecución**

*El antecedente avisa*

- **Dado que** alguien recibió una llamada de atención en marzo
- **Cuando** se le emite otra en octubre
- **Entonces** aparece «Ya tiene uno igual en los últimos 12 meses» y se puede emitir igual

**3. Condiciones y excepciones**

- Los textos frecuentes dejan seleccionado lo que hay que completar.
- La fecha del memorándum se puede cambiar sobre la hoja.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑035
- **Historia de usuario:** HU‑DOC‑07
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

### Las solicitudes

*Lo que pide el colaborador y cómo se responde*

#### 4.39 · BR-DOC-039 · Una solicitud se responde en dos días hábiles

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-039
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** v0.2 · Solicitudes
- **Estado:** Borrador

*Descripción general*

Cada pedido tiene un **plazo de dos días hábiles** desde que se hizo: sin sábados ni domingos. Lo atrasado se ve primero y en rojo.

**2. Escenarios ágiles de ejecución**

*El fin de semana no cuenta*

- **Dado que** alguien pide un certificado el viernes
- **Cuando** se calcula el plazo
- **Entonces** vence el martes

**3. Condiciones y excepciones**

- El colaborador ve «Responde hasta el …».
- Las atendidas y rechazadas guardan quién y cuándo respondió.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑024
- **Historia de usuario:** HU‑DOC‑09
- **Pantalla:** W‑DOC‑06 Solicitudes
- **Diseño:** Prototipado

#### 4.40 · BR-DOC-040 · Cada pedido se atiende con lo que pide

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-040
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** v0.2 · Solicitudes
- **Estado:** Borrador

*Descripción general*

No hay «Aprobar»: un **certificado** se emite, una **copia** se elige y se envía, una **corrección** se reemite. Al atender, la solicitud guarda **qué documento la resolvió** y el colaborador lo abre desde su pedido.

**2. Escenarios ágiles de ejecución**

*El pedido guarda su documento*

- **Dado que** se atiende el pedido de un certificado
- **Cuando** se emite y envía
- **Entonces** el pedido queda Atendido y el colaborador ve «Ver el documento»

**3. Condiciones y excepciones**

- Una copia puede ser de un contrato, de algo que recibió o de su expediente.
- Atender lleva al siguiente pendiente.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑027
- **Historia de usuario:** HU‑DOC‑09
- **Pantalla:** W‑DOC‑07 Atender
- **Diseño:** Prototipado

#### 4.41 · BR-DOC-041 · Una corrección anula el documento que estaba mal

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-041
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** v0.2 · Solicitudes
- **Estado:** Borrador

*Descripción general*

Atender una corrección **reemite** el documento y, si se deja marcado, **anula** el anterior con «Reemplazado por» el nuevo. Si el error está en la ficha, se corrige allá antes de reemitir.

**2. Escenarios ágiles de ejecución**

*Reemitir un certificado con un apellido mal escrito*

- **Dado que** alguien reporta un error en su certificado
- **Cuando** RR.HH. corrige la ficha y pulsa «Reemitir y enviar»
- **Entonces** el nuevo le llega y el anterior queda Anulado

**3. Condiciones y excepciones**

- La casilla de anular viene marcada.
- El nuevo toma otro número —BR‑DOC‑034—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑028
- **Historia de usuario:** HU‑DOC‑09
- **Pantalla:** W‑DOC‑07 Atender
- **Diseño:** Prototipado

#### 4.42 · BR-DOC-042 · Rechazar un pedido exige un motivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-042
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** v0.2 · Solicitudes
- **Estado:** Borrador

*Descripción general*

Un pedido se puede **rechazar** con un motivo de al menos cinco letras, que el colaborador lee en Mis solicitudes.

**2. Escenarios ágiles de ejecución**

*Rechazar con motivo rápido*

- **Dado que** alguien pide una copia que ya tiene
- **Cuando** RR.HH. elige «Ya se le envió»
- **Entonces** el pedido queda Rechazado con ese motivo

**3. Condiciones y excepciones**

- Los motivos rápidos: Se entrega en persona, Ya se le envió, Falta información, No corresponde.
- Rechazar queda en la bitácora.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑030
- **Historia de usuario:** HU‑DOC‑09
- **Pantalla:** W‑DOC‑07 Atender
- **Diseño:** Prototipado

### Las plantillas

*Un solo editor para todo lo que se emite*

#### 4.43 · BR-DOC-043 · Todas las plantillas se editan igual; el tipo es un campo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-043
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** RF‑42 · RF‑43
- **Estado:** Borrador

*Descripción general*

Certificados, memorándums, contratos y los tipos que cree la empresa usan **el mismo editor**. El **tipo** es un campo de la plantilla, que le da su color, su serie de numeración y su carpeta en la app.

**2. Escenarios ágiles de ejecución**

*Cambiar de tipo*

- **Dado que** una plantilla es de tipo Memorándum
- **Cuando** se le cambia a Constancia
- **Entonces** pasa a salir en el riel de Constancias y a numerarse con su sigla

**3. Condiciones y excepciones**

- «Otro documento» no se ofrece: se crea un tipo con su nombre.
- En pantalla se dice «tipo», no «categoría».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑042
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑11 Editor
- **Diseño:** Prototipado

#### 4.44 · BR-DOC-044 · Un tipo nuevo trae su sigla, su color y su carpeta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-044
- **Grupo:** Las plantillas
- **Qué gobierna:** Tipo
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Crear un tipo pide **nombre** y **color**; la **sigla** se arma sola y se puede cambiar. El tipo nuevo tiene su **serie de numeración**, su lugar en el riel de Emitir y **su carpeta** en la app del colaborador.

**2. Escenarios ágiles de ejecución**

*Crear «Constancia»*

- **Dado que** se elige «+ Crear un tipo nuevo» y se escribe «Constancia»
- **Cuando** se pulsa «Crear»
- **Entonces** aparece en el riel como «Constancias», se numera CON‑0001/2026 y el colaborador tiene la carpeta «Constancias»

**3. Condiciones y excepciones**

- Se crea desde la lista de tipos, sin ventana aparte.
- Su numeración empieza con 4 dígitos y reinicio anual.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑044
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑11 Editor
- **Diseño:** Prototipado

#### 4.45 · BR-DOC-045 · Activa es la que se usa; inactiva es el borrador

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-045
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** RN‑17
- **Estado:** Borrador

*Descripción general*

Una plantilla **activa** aparece en Emitir; una **inactiva** no, y sirve de **borrador**: se puede guardar a medias. Solo al guardar una plantilla activa se **valida**: que no esté vacía, que cada dato exista y que la persona de prueba los tenga.

**2. Escenarios ágiles de ejecución**

*Guardar a medias*

- **Dado que** una plantilla nueva está inactiva y con un dato mal escrito
- **Cuando** se guarda
- **Entonces** se guarda igual y no aparece en Emitir

**3. Condiciones y excepciones**

- Una plantilla nueva nace activa.
- Duplicar crea la copia inactiva.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑045
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑11 Editor
- **Diseño:** Prototipado

#### 4.46 · BR-DOC-046 · Guardar con otro texto crea una versión

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-046
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** RF‑47
- **Estado:** Borrador

*Descripción general*

Cada vez que se guarda con **otro texto** queda una versión nueva en el **historial**; la anterior se conserva. Lo emitido antes no cambia, porque salió con su texto —BR‑DOC‑035—.

**2. Escenarios ágiles de ejecución**

*El historial guarda cada edición*

- **Dado que** se edita y guarda un certificado dos veces
- **Cuando** se mira el Historial
- **Entonces** aparecen «Creada el …» y dos «Editada el …», cada una con «Ver cómo era»

**3. Condiciones y excepciones**

- Cambiar solo los ajustes no crea versión.
- La última es la que se usa al emitir.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑046
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑11 Editor
- **Diseño:** Prototipado

#### 4.47 · BR-DOC-047 · Las plantillas de fábrica se editan y vuelven a su texto original

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-047
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** RF‑50 (cambia)
- **Estado:** Borrador

*Descripción general*

Las plantillas que vienen con el sistema se **editan** como cualquier otra. Si se cambiaron, **«Volver al texto original»** repone el de fábrica; hay que guardar para dejarlo así.

**2. Escenarios ágiles de ejecución**

*Volver al original*

- **Dado que** se editó el «Certificado de trabajo»
- **Cuando** se pulsa «Volver al texto original» y se guarda
- **Entonces** el certificado vuelve al texto de fábrica, como una versión nueva

**3. Condiciones y excepciones**

- Conservan la etiqueta «De fábrica».
- Duplicar sirve para hacer una variante.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑047
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑11 Editor
- **Diseño:** Prototipado

#### 4.48 · BR-DOC-048 · Una plantilla usada no se elimina

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-048
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** RF‑08
- **Estado:** Borrador

*Descripción general*

Solo se elimina una plantilla **propia** que **nunca se usó**. Si ya se emitió algo con ella, se ofrece **desactivarla**: los documentos emitidos no quedan sin origen.

**2. Escenarios ágiles de ejecución**

*Eliminar una plantilla usada*

- **Dado que** una plantilla tiene 3 emitidos
- **Cuando** se elige «Eliminar»
- **Entonces** dice «No se puede eliminar» y ofrece «Desactivarlo»

**3. Condiciones y excepciones**

- Las de fábrica no se eliminan.
- Eliminar queda en la bitácora.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑040
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑10 Plantillas
- **Diseño:** Prototipado

#### 4.49 · BR-DOC-049 · La hoja tiene tamaño carta u oficio

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-049
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Cada plantilla define su **tamaño de hoja**: carta (21,6 × 27,9 cm) u oficio (21,6 × 33 cm). La vista previa reparte el texto en **páginas** de ese tamaño; un párrafo que no entra se parte entre palabras.

**2. Escenarios ágiles de ejecución**

*Oficio da menos páginas*

- **Dado que** un texto largo ocupa 5 páginas carta
- **Cuando** se cambia a oficio
- **Entonces** la vista previa muestra 4 páginas

**3. Condiciones y excepciones**

- La vista previa usa los datos de quien está usando el sistema.
- Por defecto, carta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑043
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑11 Editor
- **Diseño:** Prototipado

### Notificaciones y numeración

*Los valores de la empresa*

#### 4.50 · BR-DOC-050 · Los avisos de vencimiento valen para todos, salvo excepción

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-050
- **Grupo:** Notificaciones y numeración
- **Qué gobierna:** Parámetros
- **Antes:** RF‑06 · RF‑35 · RF‑37
- **Estado:** Borrador

*Descripción general*

Los avisos se definen una vez: **cuándo** (hasta tres, en días antes), **a quién** (colaborador, jefe directo, responsable de RR.HH.) y **por dónde** (correo, app). Cada documento puede tener los suyos. Un aviso llega **una vez por canal**.

**2. Escenarios ágiles de ejecución**

*Avisos encendidos sin destinatario*

- **Dado que** se encienden los avisos y se desmarcan todos los destinatarios
- **Cuando** se pulsa «Guardar cambios»
- **Entonces** no se guarda: «Elija al menos a quién avisar»

**3. Condiciones y excepciones**

- RR.HH. recibe un resumen semanal o mensual, si se elige.
- El colaborador elige su canal entre los de la empresa.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑048
- **Historia de usuario:** HU‑DOC‑11
- **Pantalla:** W‑DOC‑12 Notificaciones
- **Diseño:** Prototipado

#### 4.51 · BR-DOC-051 · El fin de un contrato se avisa con anticipación

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-051
- **Grupo:** Notificaciones y numeración
- **Qué gobierna:** Parámetros
- **Antes:** RF‑40
- **Estado:** Borrador

*Descripción general*

Un contrato a plazo fijo pasa a **Por vencer** y se avisa al responsable los días antes del fin que diga Notificaciones —45 por defecto—, con tiempo para renovar o finalizar.

**2. Escenarios ágiles de ejecución**

*Cambiar a 60 días*

- **Dado que** se cambia el aviso de fin de contrato a 60
- **Cuando** se guarda
- **Entonces** un contrato que termina en 50 días pasa a Por vencer

**3. Condiciones y excepciones**

- Vale para todos los contratos con fin.
- Los indefinidos no vencen.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑020
- **Historia de usuario:** HU‑DOC‑11
- **Pantalla:** W‑DOC‑12 Notificaciones
- **Diseño:** Prototipado

#### 4.52 · BR-DOC-052 · Cada tipo necesita su sigla, y el próximo número se ve antes de guardar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-052
- **Grupo:** Notificaciones y numeración
- **Qué gobierna:** Parámetros
- **Antes:** RF‑07
- **Estado:** Borrador

*Descripción general*

La numeración de cada tipo tiene **sigla**, **dígitos** y si **reinicia cada año**. Sin sigla no se guarda. La tabla muestra el **próximo número** con los cambios todavía sin guardar.

**2. Escenarios ágiles de ejecución**

*Ver el próximo número*

- **Dado que** se cambia la sigla de Certificado a CER
- **Cuando** se mira la tabla
- **Entonces** el próximo número dice CER‑0007/2026

**3. Condiciones y excepciones**

- Hasta 8 dígitos.
- Todos los cambios de la página se guardan con un solo «Guardar cambios».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑049
- **Historia de usuario:** HU‑DOC‑11
- **Pantalla:** W‑DOC‑12 Notificaciones
- **Diseño:** Prototipado

### Para El líder de área

Lo que el líder puede hacer en el módulo.

### El acceso del líder

*Qué ve y qué no*

#### 4.53 · BR-DOC-053 · El líder entra al módulo y hoy ve toda la empresa

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-053
- **Grupo:** El acceso del líder
- **Qué gobierna:** Acceso
- **Antes:** v0.2 · ABIERTA‑01
- **Estado:** Borrador

*Descripción general*

El líder de área tiene la entrada **Documentación** y las mismas pantallas que Recursos Humanos. Lo que debería ver —los expedientes de su unidad, en lectura, sin documentos confidenciales— es una decisión abierta —ABIERTA‑DOC‑01—.

**2. Escenarios ágiles de ejecución**

*El líder abre Expedientes*

- **Dado que** una líder de Marketing entra a Documentación
- **Cuando** abre Expedientes
- **Entonces** ve a toda la empresa

**3. Condiciones y excepciones**

- Los documentos confidenciales no los ve salvo permiso explícito —BR‑DOC‑020—.
- El auxiliar y el buddy no tienen la entrada.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑001
- **Historia de usuario:** HU‑DOC‑13
- **Pantalla:** W‑DOC‑01 Expedientes
- **Diseño:** Prototipado

### Para El colaborador

Las condiciones de Mis documentos y Mis solicitudes, en la web y en el celular.

### Mis documentos

*Lo que la persona ve y entrega*

#### 4.54 · BR-DOC-054 · El colaborador ve solo lo que la empresa le deja ver

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-054
- **Grupo:** Mis documentos
- **Qué gobierna:** Documento
- **Antes:** v0.2 · El colaborador
- **Estado:** Borrador

*Descripción general*

En Mis documentos aparecen los documentos cuyo subtipo dice que **el colaborador lo ve**. Lo restringido o confidencial que guarda RR.HH. no aparece.

**2. Escenarios ágiles de ejecución**

*Un acta no se ve*

- **Dado que** el expediente tiene un acta de entrega que el colaborador no ve
- **Cuando** la persona abre Mis documentos
- **Entonces** el acta no está

**3. Condiciones y excepciones**

- Ve sus contratos y lo que le enviaron.
- Ve el mismo estado que RR.HH.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑053
- **Historia de usuario:** HU‑DOC‑14
- **Pantalla:** W‑DOC‑13 Mis documentos
- **Diseño:** Prototipado

#### 4.55 · BR-DOC-055 · El colaborador sube solo lo que la empresa le deja subir

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-055
- **Grupo:** Mis documentos
- **Qué gobierna:** Documento
- **Antes:** RF‑31
- **Estado:** Borrador

*Descripción general*

Cada subtipo dice si **el colaborador lo sube**. Lo que no, aparece con «Lo carga RR.HH.». Lo que sube entra **En revisión** —BR‑DOC‑010—, con el nombre normalizado y la fecha de hoy.

**2. Escenarios ágiles de ejecución**

*Subir un carnet renovado*

- **Dado que** el carnet de alguien está por vencer
- **Cuando** lo sube desde Por entregar
- **Entonces** dice «Enviado. Quedó en revisión hasta que RR.HH. lo apruebe»

**3. Condiciones y excepciones**

- Primero aparece lo que RR.HH. le pide.
- Si ya lo tiene, avisa que lo nuevo lo reemplaza.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑052
- **Historia de usuario:** HU‑DOC‑14
- **Pantalla:** W‑DOC‑14 Por entregar
- **Diseño:** Prototipado

#### 4.56 · BR-DOC-056 · Por entregar va por urgencia y dice por qué

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-056
- **Grupo:** Mis documentos
- **Qué gobierna:** Documento
- **Antes:** v0.2 · Pendientes
- **Estado:** Borrador

*Descripción general*

Lo que la persona tiene que entregar se ordena: **rechazado, vencido, faltante, por vencer**. Cada uno dice su motivo —«RR.HH. lo rechazó: …», «Venció el …», «RR.HH. se lo pidió el …»— y su botón: Volver a subir, Renovar o Subir. Lo ya renovado y en revisión no se vuelve a pedir.

**2. Escenarios ágiles de ejecución**

*Lo rechazado va primero*

- **Dado que** alguien tiene un rechazado y un por vencer
- **Cuando** abre Por entregar
- **Entonces** el rechazado está primero, con el motivo

**3. Condiciones y excepciones**

- Lo opcional se marca «opcional».
- Lo en revisión va en su propio bloque.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑051
- **Historia de usuario:** HU‑DOC‑14
- **Pantalla:** W‑DOC‑14 Por entregar
- **Diseño:** Prototipado

### Lo que recibe y lo que pide

*Recibidos, confirmación y solicitudes*

#### 4.57 · BR-DOC-057 · Recibe lo entregado; lo anulado desaparece

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-057
- **Grupo:** Lo que recibe y lo que pide
- **Qué gobierna:** Emitido
- **Antes:** REP‑05
- **Estado:** Borrador

*Descripción general*

En «De RR.HH.» la persona ve lo que se le **entregó**, en una carpeta por tipo: Certificados, Memorándums, los tipos de la empresa y Otros. Lo **anulado** ya no se ve.

**2. Escenarios ágiles de ejecución**

*Un anulado se va*

- **Dado que** a alguien le anularon un certificado
- **Cuando** abre Certificados
- **Entonces** ese certificado no está

**3. Condiciones y excepciones**

- Cada carpeta cuenta cuántos le falta confirmar.
- El texto es el que salió, congelado.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑057
- **Historia de usuario:** HU‑DOC‑12
- **Pantalla:** W‑DOC‑15 De RR.HH.
- **Diseño:** Prototipado

#### 4.58 · BR-DOC-058 · Pide un certificado, una copia o una corrección

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-058
- **Grupo:** Lo que recibe y lo que pide
- **Qué gobierna:** Solicitud
- **Antes:** v0.2 · Solicitudes
- **Estado:** Borrador

*Descripción general*

Desde la app se pide **un certificado** (de las plantillas que el colaborador puede pedir), **una copia de su contrato** o **una corrección** de algo que recibió. En una corrección hay que contar qué está mal.

**2. Escenarios ágiles de ejecución**

*Reportar un error*

- **Dado que** alguien abre un certificado con su apellido mal escrito
- **Cuando** pulsa «Reportar un error» y lo cuenta
- **Entonces** se crea una corrección con ese certificado, y RR.HH. tiene 2 días hábiles

**3. Condiciones y excepciones**

- Solo se ofrecen las plantillas marcadas «El colaborador lo puede pedir».
- Memorándums no se piden: los emite la empresa.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑058
- **Historia de usuario:** HU‑DOC‑15
- **Pantalla:** W‑DOC‑16 Pedir
- **Diseño:** Prototipado

#### 4.59 · BR-DOC-059 · Ve el estado de su pedido y el documento que lo resolvió

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-059
- **Grupo:** Lo que recibe y lo que pide
- **Qué gobierna:** Solicitud
- **Antes:** v0.2 · Solicitudes
- **Estado:** Borrador

*Descripción general*

En Mis solicitudes cada pedido muestra su recorrido —Enviada, En RR.HH., Atendida o Rechazada— con fechas, la nota de RR.HH. y **«Ver el documento»** si se le envió uno.

**2. Escenarios ágiles de ejecución**

*Abrir lo que se pidió*

- **Dado que** el pedido de un certificado se atendió
- **Cuando** la persona abre Mis solicitudes › Resueltas
- **Entonces** ve «Atendida» y «Ver el documento» abre el certificado

**3. Condiciones y excepciones**

- «En curso» y «Resueltas» van separadas.
- Se ve hasta cuándo tiene RR.HH. para responder.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑059
- **Historia de usuario:** HU‑DOC‑15
- **Pantalla:** W‑DOC‑17 Mis solicitudes
- **Diseño:** Prototipado

#### 4.60 · BR-DOC-060 · Web y celular deciden lo mismo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-060
- **Grupo:** Lo que recibe y lo que pide
- **Qué gobierna:** Colaborador
- **Antes:** v0.2 · El colaborador
- **Estado:** Borrador

*Descripción general*

Mis documentos en la web y en el celular muestran **lo mismo**: las mismas carpetas, lo mismo por entregar y los mismos recibidos. Solo cambia la forma: en el celular las pantallas se apilan con «volver».

**2. Escenarios ágiles de ejecución**

*Subir en el celular se ve en la web*

- **Dado que** alguien sube su carnet desde el celular
- **Cuando** entra a la web
- **Entonces** el carnet está En revisión

**3. Condiciones y excepciones**

- El buscador entiende sinónimos en los dos.
- La foto del perfil es la misma en los dos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑054
- **Historia de usuario:** HU‑DOC‑16
- **Pantalla:** W‑DOC‑13 Mis documentos
- **Diseño:** Prototipado

## 05 · Modelo de datos

*Qué se guarda y qué se deduce. El documento guarda sus versiones; el estado se calcula; lo emitido congela sus datos.*

### 5.1 Las entidades

| Entidad | Qué es | Campos principales |
| --- | --- | --- |
| **Tipo** | Una carpeta del expediente | id, nombre, activo, años de retención |
| **Subtipo** | Un documento que la empresa espera | tipo, nombre, varios, el colaborador lo ve, el colaborador lo sube, vence, vigencia en meses, formatos, tamaño máximo, visibilidad, avisos propios, exigido a todos, plazo en días, activo, campo de la ficha con que se enlaza |
| **Requisito personal** | Lo que RR.HH. le agrega a una persona | persona, subtipo, obligatorio, plazo, por, fecha |
| **Exoneración** | La liberación de un requisito | persona, subtipo, motivo, por, fecha |
| **Documento** | Un papel de una persona | persona, subtipo, versiones, eliminado (fecha, por, motivo), origen (ficha) |
| **Versión del documento** | Cada archivo de un documento | archivo, emisión, vencimiento, subido por, canal (web, app, ficha), revisión (pendiente, aprobado, rechazado), motivo de rechazo, motivo de cambio, revisado por |
| **Sin clasificar** | Un archivo que no se reconoció | persona, tipo, archivo, fecha, por |
| **Pedido** | Cuándo se le pidió un documento a alguien | persona y subtipo → fecha |
| **Contrato** | Un contrato o una adenda | persona, tipo (contrato, adenda), contrato origen, modalidad, inicio, fin, plantilla, número, gestión, versiones (generado, firmado), finalizado, reemplazado |
| **Plantilla** | El texto de un documento que se emite | nombre, tipo, el colaborador la puede pedir, circuito de aprobación, aprobador, confidencial, activa, de fábrica, tamaño de hoja, versiones |
| **Emitido** | Un documento hecho para una persona | plantilla o archivo propio, tipo, persona, versión de la plantilla, número, gestión, fecha, por, entregas, pide confirmación, datos y texto congelados, confirmación (fecha, dispositivo), recordatorios, lote, anulado |
| **Lote de emisión** | Un envío a varias personas | nombre, plantilla, fecha, por, emitidos |
| **Solicitud** | Un pedido del colaborador | tipo (certificado, copia, corrección), persona, fecha, asunto, detalle, estado, canal, resuelto (fecha, por, nota, documento que lo resolvió) |
| **Parámetros** | Los valores de la empresa | avisos encendidos, días de aviso, destinatarios, canales, resumen, aviso de fin de contrato, días de papelera, numeración por tipo, tipos propios |
| **Bitácora** | Lo que pasó | fecha, hora, usuario, acción, entidad, persona, detalle |

### 5.2 Lo que se guarda y lo que se deduce

| Dato | Cómo se obtiene |
| --- | --- |
| Estado de un documento | De la revisión, el vencimiento y la ventana de aviso —BR‑DOC‑007— |
| Lo que se le exige a alguien | Lo exigido a todos más lo personal, menos lo exonerado —BR‑DOC‑003— |
| Avance del expediente | Cumplidos sobre obligatorios exigibles —BR‑DOC‑004— |
| Estado de un contrato | De sus fechas y de la última adenda; solo finalizado y reemplazado se guardan —BR‑DOC‑028— |
| Siguiente número | Contando los emitidos de la serie en la gestión —BR‑DOC‑033— |
| Plazo de una solicitud | Dos días hábiles desde la fecha del pedido —BR‑DOC‑039— |
| Origen de un emitido | Individual, lote o solicitud, de sus vínculos |
| Los documentos de la ficha | Se leen de la ficha cada vez; no se copian —BR‑DOC‑002— |

### 5.3 Las variables de las plantillas

Las plantillas usan veinte datos en cinco grupos, con su origen:

| Grupo | Datos | Sale de |
| --- | --- | --- |
| **Colaborador** | Nombre completo, número de documento, código, correo corporativo | Gestión de personas |
| **Puesto** | Cargo, unidad organizacional, sucursal, ciudad de la sucursal | Organización |
| **Relación laboral** | Fecha de ingreso, antigüedad, haber básico, modalidad, inicio y fin del contrato | Gestión de personas y Planillas |
| **Empresa** | Razón social, NIT, representante legal | Organización |
| **Documento** | Número, fecha de emisión, texto que se escribe al enviar | Este módulo |

### 5.4 El emitido y sus datos congelados

Al emitir se guardan **los datos y el texto ya rellenado**: si mañana cambia la ficha o la plantilla, el documento dice lo mismo —BR‑DOC‑035—. Un emitido pasa por: **Sin enviar → Entregado (sin confirmar) → Confirmado**, o **Anulado** en cualquier momento, con motivo.

> **En la maqueta:** todo se guarda en el navegador; los archivos subidos, en el navegador de quien los subió. El haber básico sale de una tabla de ejemplo por unidad.

## 06 · Roadmap

*Cómo se llega de la maqueta a producción, en qué orden y con qué decisiones pendientes.*

### 6.1 Camino a desarrollo

La maqueta es la referencia de pantallas y comportamiento; este documento, la de reglas. Lo que la maqueta todavía no hace está marcado en cada pantalla y reunido en el anexo del prototipo.

### 6.2 Cuatro entregas

| Entrega | Qué incluye |
| --- | --- |
| **1 · El expediente** | Tipos y subtipos, requisitos, estados, expediente por carpetas, subir, versiones, papelera, bitácora y la lectura de la ficha |
| **2 · Revisar y lo urgente** | Revisar documentos, Expedientes con «Qué atender hoy», pedir renovación y Mis documentos del colaborador con su subida |
| **3 · Emitir** | Plantillas y editor, tipos propios, numeración, Emitir a una persona y a grupos, Documentos emitidos, confirmación y contratos |
| **4 · Solicitudes y avisos** | Pedir y Mis solicitudes, Solicitudes y Atender, y el envío real de avisos, recordatorios y resumen por Comunicación |

### 6.3 Hitos

| Hito | Se cumple cuando |
| --- | --- |
| **Primer expediente completo** | Una persona llega al 100 % con documentos aprobados |
| **Primer documento confirmado** | Un colaborador confirma desde la app un certificado emitido |
| **Primera solicitud atendida a tiempo** | Un pedido se resuelve dentro de los 2 días hábiles |

### 6.4 Dependencias

- **Gestión de personas**: la ficha con sus archivos y sus datos.
- **Organización**: sucursales, unidades, cargos y el puesto de cada persona.
- **Comunicación**: el envío de avisos, recordatorios y resúmenes.
- **Planillas**: lee el contrato vigente; más adelante, las boletas.

### 6.5 Suposiciones

- Toda persona tiene ficha en Gestión de personas y un puesto en Organización.
- El colaborador entra a la app con su propio usuario.

### 6.6 Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Datos de la ficha vacíos que impiden emitir | La hoja marca el hueco y dice qué completar —BR‑DOC‑031— |
| Que nadie revise lo que suben los colaboradores | Contador en el menú y «Qué atender hoy» —BR‑DOC‑016— |
| Contratos vencidos sin decidir | Aviso de fin y estado Por vencer —BR‑DOC‑051— |
| Avisos que no llegan | Depende de Comunicación; hoy solo se registran |

### 6.7 Decisiones abiertas

| Código | Pregunta | Antes |
| --- | --- | --- |
| ABIERTA‑DOC‑01 | ¿El líder ve solo su unidad, y en lectura? | v0.2 · ABIERTA‑01 |
| ABIERTA‑DOC‑02 | ¿Dónde se configuran las carpetas y los documentos requeridos, ahora que salieron de Configuración? | Nueva |
| ABIERTA‑DOC‑03 | ¿El contrato es un tipo más, o se trata aparte por sus fechas y decisiones? | Nueva |
| ABIERTA‑DOC‑04 | El circuito de aprobación de una plantilla: ¿qué pasa al emitir si la pide? | v0.2 · ABIERTA‑04 |
| ABIERTA‑DOC‑05 | ¿La subida de documentos de una ruta de Onboarding va al expediente? | Nueva |
| ABIERTA‑DOC‑06 | Recordar automáticamente a quien no confirmó a los N días hábiles | v0.2 · ABIERTA‑02 |
| ABIERTA‑DOC‑07 | Dar de alta en el directorio a los colaboradores de la app de ejemplo | v0.2 · ABIERTA‑05 |
| ABIERTA‑DOC‑08 | Boletas de pago como recibido, cuando exista Planillas | v0.2 · ABIERTA‑06 |
| ABIERTA‑DOC‑09 | El tamaño carta u oficio, ¿se aplica también al descargar e imprimir lo emitido? | Nueva |
| ABIERTA‑DOC‑10 | ¿La papelera se vacía sola al cumplirse sus días? | RF‑89 |
| ABIERTA‑DOC‑11 | Las plantillas de fábrica se editan, contra RF‑50: confirmarlo con el análisis | RF‑50 |
| ABIERTA‑DOC‑12 | ¿El auxiliar del líder entra al módulo? | Nueva |

## 07 · Flujos de usuario

*Los recorridos principales, paso a paso y por perfil.*

### Para Recursos Humanos

### 7.1 Atender lo de hoy

1. En Expedientes, «Qué atender hoy» muestra hasta tres tareas.
2. «Pedir renovación» abre los vencidos, marcados; «Pedir a N personas» guarda el pedido.
3. «Revisar» lleva a la bandeja de revisión.
4. «Ver contratos» filtra los contratos por decidir.

### 7.2 Revisar lo que subieron

1. Desde el menú o desde «Qué atender hoy», Revisar documentos.
2. Se abre lo más antiguo: el documento grande y sus fechas.
3. Si hace falta, se corrigen las fechas y «Guardar fechas».
4. «Aprobar» —o A—, o «Rechazar…» con un motivo; pasa solo al siguiente.

### 7.3 Completar un expediente

1. En Expedientes se busca a la persona y se abre.
2. Las pastillas dicen qué falta; se abre la carpeta.
3. «Subir» en la tarjeta del faltante, o «Subir documento» arriba.
4. Si el archivo no se reconoce, queda en Por clasificar y se elige qué es.
5. «Revisar fechas» para corregir emisión y vencimiento.

### 7.4 Emitir un certificado a una persona

1. En Documentos emitidos, «Emitir documento».
2. En el riel, Certificados › Certificado de trabajo: la hoja de ejemplo aparece al centro.
3. En «Para quién» › Personas, se busca y se elige a la persona: la hoja se llena con sus datos.
4. «Emitir y enviar a {nombre}»: le llega por la app y queda en Recibidos.

### 7.5 Enviar un memorándum a un grupo

1. En Emitir, Memorándums › Felicitación.
2. «Para quién» › Un grupo: se filtra por unidad y se marcan todos.
3. Se escribe el motivo en el recuadro de la hoja.
4. «Emitir y enviar a N personas»: cada uno con su número; quien tiene un dato vacío no sale y se dice.

### 7.6 Renovar un contrato a plazo fijo

1. «Qué atender hoy» › «Ver contratos», o el contrato desde el expediente.
2. En la ficha del contrato, «Renovar con adenda».
3. Rige desde el día siguiente al fin; se pone el nuevo fin.
4. La adenda queda encadenada y el contrato dice «ampliado al …».

### 7.7 Atender una solicitud

1. En Solicitudes, la más atrasada está primero; «Ver detalle».
2. Certificado: se elige la plantilla y «Emitir y enviar». Copia: se elige el documento y «Enviar copia». Corrección: «Reemitir y enviar», anulando el anterior.
3. O «Rechazar…» con un motivo.
4. «Siguiente pendiente →».

### 7.8 Crear una plantilla con un tipo nuevo

1. En Configuración › Plantillas, «Nuevo modelo»: abre el editor.
2. Nombre; Tipo › «+ Crear un tipo nuevo»: nombre, color, y «Crear».
3. Se escribe sobre la hoja y se tocan los datos para insertarlos.
4. «Vista previa» para verla en páginas; «Guardar».

### 7.9 Cambiar los avisos y la numeración

1. En Configuración › Notificaciones y numeración.
2. Se cambian los días, a quién y por dónde, o la sigla de un tipo.
3. Arriba aparece «N cambios sin guardar»; «Guardar cambios» o «Descartar».

### Para El líder de área

### 7.10 Mirar los expedientes

1. Entra a Documentación desde el menú.
2. En Expedientes ve a todos —ABIERTA‑DOC‑01— y abre a una persona de su unidad.

### Para El colaborador

### 7.11 Entregar lo que falta

1. En Zona HR › Mis documentos, la franja dice «N documentos por entregar».
2. «Resolver» abre Por entregar, con lo más urgente primero y su motivo.
3. «Subir» o «Renovar»: elige el archivo.
4. Queda En revisión hasta que RR.HH. lo apruebe.

### 7.12 Confirmar un documento recibido

1. En «De RR.HH.», la carpeta muestra cuántos falta confirmar.
2. Abre el documento y lo lee.
3. «Confirmar que lo recibí»: queda la fecha y el dispositivo.

### 7.13 Pedir un certificado

1. En Mis documentos › Certificados, «Pedir un certificado», o en Mis solicitudes.
2. Elige cuál y cuenta para qué.
3. En Mis solicitudes ve «Responde hasta el …».
4. Cuando RR.HH. lo atiende, «Ver el documento».

### 7.14 Reportar un error

1. Abre un documento recibido.
2. «Reportar un error» y cuenta qué está mal.
3. RR.HH. lo corrige y le llega el nuevo; el anterior desaparece.

## 08 · Recursos visuales

*Las pantallas del módulo por perfil, con su dirección en la maqueta. Los wireframes dibujados son la maqueta misma.*

### Para Recursos Humanos

### 8.1 Pantallas de Recursos Humanos

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑DOC‑01 | Expedientes | /documentos/expedientes |
| W‑DOC‑02 | Expediente de una persona | /documentos/expedientes/:id y /:id/:carpeta |
| W‑DOC‑03 | Subir y clasificar | sobre el expediente |
| W‑DOC‑04 | Revisar documentos | /documentos/expedientes/revisar |
| W‑DOC‑05 | Contrato | /documentos/expedientes/contrato/:id |
| W‑DOC‑06 | Solicitudes | /documentos/solicitudes |
| W‑DOC‑07 | Atender un pedido | /documentos/solicitudes/:id |
| W‑DOC‑08 | Documentos emitidos y su detalle | /documentos/emitidos y /emitidos/:id |
| W‑DOC‑09 | Emitir | /documentos/emitidos/nuevo |
| W‑DOC‑10 | Plantillas | /documentos/configuracion?ver=plantillas |
| W‑DOC‑11 | Editor de plantillas | /documentos/configuracion/plantillas/:id y /nuevo |
| W‑DOC‑12 | Notificaciones y numeración | /documentos/configuracion?ver=avisos |

### Para El líder de área

### 8.2 Pantallas del líder

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑DOC‑01 | Expedientes | /documentos/expedientes (las mismas de Recursos Humanos) |

### Para El colaborador

### 8.3 Pantallas del colaborador

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑DOC‑13 | Mis documentos | /mi-espacio/zona-hr/documentos |
| W‑DOC‑14 | Por entregar | /mi-espacio/zona-hr/documentos?ver=pendientes |
| W‑DOC‑15 | De RR.HH. y un recibido | /mi-espacio/zona-hr/documentos?de=… |
| W‑DOC‑16 | Pedir | ventana sobre Mis documentos y Mis solicitudes |
| W‑DOC‑17 | Mis solicitudes | /mi-espacio/zona-hr/solicitudes |
| W‑DOC‑18 | Mis documentos en el celular | Zona HR › Mis documentos, en la app |

## 09 · Historias de usuario

*Lo que necesita cada perfil, con sus criterios de aceptación.*

### Para Recursos Humanos

### 9.1 Historias de Recursos Humanos

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑DOC‑01 | **Como** Recursos Humanos, **quiero** ver el expediente de cada persona por carpetas **para** saber qué tiene y qué le falta | Carpetas con lo que falta · Estados deducidos · La ficha se lee |
| HU‑DOC‑02 | **Como** Recursos Humanos, **quiero** exigirle un documento a una persona o liberarla de uno | Agregar requisito · Exonerar con motivo |
| HU‑DOC‑03 | **Como** Recursos Humanos, **quiero** ver primero lo urgente **para** no enterarme tarde | Qué atender hoy · Lo más urgente por persona · Pedir renovación |
| HU‑DOC‑04 | **Como** Recursos Humanos, **quiero** subir y revisar documentos rápido | Lo mío entra aprobado · Lo del colaborador en revisión · Bandeja de a uno |
| HU‑DOC‑05 | **Como** Recursos Humanos, **quiero** que nada se pierda **para** responder a una auditoría | Papelera · Bitácora · ZIP del expediente |
| HU‑DOC‑06 | **Como** Recursos Humanos, **quiero** registrar y renovar contratos sin dejar dos vigentes | Decidir el anterior · Adendas encadenadas · Aviso de fin |
| HU‑DOC‑07 | **Como** Recursos Humanos, **quiero** emitir documentos con los datos de la ficha, a una persona o a un grupo | Hoja antes de enviar · Sin tipear datos · Grupo con filtros |
| HU‑DOC‑08 | **Como** Recursos Humanos, **quiero** saber quién confirmó y anular lo que salió mal | Confirmación con fecha · Recordar · Anular con motivo |
| HU‑DOC‑09 | **Como** Recursos Humanos, **quiero** responder los pedidos a tiempo | Plazo en días hábiles · Cada pedido con lo que pide · Rechazo con motivo |
| HU‑DOC‑10 | **Como** Recursos Humanos, **quiero** armar mis plantillas y mis tipos de documento | Un solo editor · Tipos propios · Historial · Activa o inactiva |
| HU‑DOC‑11 | **Como** Recursos Humanos, **quiero** fijar una vez los avisos y la numeración | Valores de la empresa · Un solo guardar · Próximo número a la vista |
| HU‑DOC‑17 | **Como** Recursos Humanos, **quiero** enviar un reglamento a toda una unidad | Archivo propio · Un grupo · Confirmación de cada uno |

### Para El líder de área

### 9.2 Historias del líder

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑DOC‑13 | **Como** líder, **quiero** ver los expedientes de mi gente **para** saber si les falta algo | Hoy ve todo —ABIERTA‑DOC‑01— · Sin confidenciales |

### Para El colaborador

### 9.3 Historias del colaborador

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑DOC‑12 | **Como** colaborador, **quiero** recibir mis documentos en la app y confirmar que los leí | Una carpeta por tipo · Confirmar una vez · Lo anulado desaparece |
| HU‑DOC‑14 | **Como** colaborador, **quiero** saber qué me falta y entregarlo desde el celular | Por entregar por urgencia · Motivo de cada uno · Queda en revisión |
| HU‑DOC‑15 | **Como** colaborador, **quiero** pedir un certificado, una copia o una corrección | Tres tipos · Plazo a la vista · Ver el documento que me enviaron |
| HU‑DOC‑16 | **Como** colaborador, **quiero** lo mismo en la web y en el celular | Mismas carpetas · Mismo estado |
| HU‑DOC‑18 | **Como** colaborador, **quiero** encontrar un documento como yo lo llamo | «carnet» encuentra el documento de identidad |

## Cómo se mantiene este documento

- Se actualiza junto con la maqueta: un cambio de comportamiento lleva su cambio aquí, en la misma entrega.
- Los códigos no cambian nunca. Una regla que deja de valer se marca, no se renumera.
- La versión en Markdown (`modulo-documentacion.md`) es la fuente; la página (`public/modulo-documentacion.html`) se genera de ella con `node herramientas/doc-modulo.cjs modulo-documentacion.md public/modulo-documentacion.html`.
- La propuesta anterior, «Propuesta de estructura» v0.2 (`public/modulo-documentacion-propuesta.html`), queda como histórico. Cada regla dice de dónde viene.

## Historial de versiones

| Versión | Fecha | Qué cambió |
| --- | --- | --- |
| **1.0** | 16 oct 2026 | **Primera versión con el formato de los demás módulos.** Reúne lo construido en la maqueta hasta el 16 de octubre: Expedientes con «Qué atender hoy», el expediente por carpetas, Revisar documentos, contratos y adendas, Solicitudes y Atender, Documentos emitidos y Emitir con riel y grupos, el editor único de plantillas con tipos propios y vista previa en páginas, Notificaciones y numeración, y Mis documentos y Mis solicitudes del colaborador. 60 reglas BR‑DOC, 62 requisitos, 18 historias y 18 pantallas, por perfil |
| **0.2** | 14 oct 2026 | Propuesta de estructura: Repositorio y Emisión sobre un solo dato, en fases. Queda como histórico |

## Anexo · Por qué decidimos así

#### Por qué cuatro entradas en el menú y no dos espacios

La v0.2 proponía Repositorio y Emisión. En el uso, RR.HH. no piensa en espacios sino en tareas: ver a alguien, responder un pedido, ver lo que envió y configurar. Cuatro entradas, cada una con su contador cuando hay algo pendiente.

#### Por qué «expediente» y no «legajo»

Es la palabra que usa el resto del producto y la que entiende el colaborador. «Legajo» quedó solo en el nombre interno de un archivo del código.

#### Por qué «Lo más urgente» muestra una sola cosa

Una fila con cinco pastillas no se lee. Una sola cosa, la peor, con el tiempo en color, dice a quién llamar primero; el resto está a un clic.

#### Por qué Emitir es una sola pantalla y no tres pasos

Con pasos, cambiar de plantilla obligaba a volver y perder a quién se había elegido. Con el riel, la hoja y «Para quién» a la vista, se cambia cualquier cosa sin perder lo demás.

#### Por qué la hoja se ve aunque no haya nadie elegido

Para elegir bien la plantilla hay que verla. La hoja de ejemplo muestra el texto con los datos de la persona en celeste, y se llena al elegir a alguien.

#### Por qué un solo editor para todas las plantillas

Un certificado, un memorándum y un contrato son texto con datos de la persona. Tener un editor por tipo multiplicaba lo que había que aprender. El tipo pasó a ser un campo, y crear uno nuevo, una opción de la lista.

#### Por qué «Guardar» y «Activa», sin «Publicar»

«Publicar» sonaba a enviar algo afuera. Lo que importa es si la plantilla se usa o no: activa es la que se usa, inactiva es el borrador. Las versiones se guardan igual, por dentro.

#### Por qué las de fábrica se editan

Duplicarlas dejaba dos plantillas casi iguales y nadie sabía cuál usar. Con el historial, editar no pierde nada: lo emitido conserva su texto y «Volver al texto original» deshace lo propio.

#### Por qué «Otro documento» ya no se ofrece

Si la empresa puede crear sus tipos, «Otro» no dice nada. Se crea «Carta de recomendación» con su sigla y su carpeta en la app.

#### Por qué el colaborador confirma «que lo recibió» y no «que está de acuerdo»

Un memorándum de llamada de atención no se firma de conformidad. Confirmar la recepción da constancia de entrega sin pedirle a la persona que acepte lo que dice.

## Anexo · El módulo en el prototipo, hoy

*Cómo está construido el módulo de documentación en el prototipo al 16 de octubre de 2026, y en qué se aparta de este documento. Todo sale del código de `ficha_colaborador`.*

### Las pantallas y sus rutas

| Dirección | Componente | Qué hay |
| --- | --- | --- |
| `/documentos/expedientes` | `pages/documentacion/Legajos.jsx` + `PorDocumento.jsx` | Expedientes, resumen de hoy y vista por documento |
| `/documentos/expedientes/:id` | `Expediente.jsx` + `CargarDocumentoModal.jsx` | Expediente por carpetas, subir, versiones, historial |
| `/documentos/expedientes/revisar` | `Revisar.jsx` | Revisar documentos |
| `/documentos/expedientes/contrato/:id` | `Contrato.jsx` | Ficha del contrato |
| `/documentos/solicitudes` y `/:id` | `Solicitudes.jsx` → `Bandeja.jsx`, `Atender.jsx` | Solicitudes y atender |
| `/documentos/emitidos` y `/:id` | `Envios.jsx`, `Envio.jsx` | Documentos emitidos y su detalle |
| `/documentos/emitidos/nuevo` | `Emitir.jsx` + `PanelEmision.jsx` | Emitir |
| `/documentos/configuracion` | `Configuracion.jsx` → `Biblioteca.jsx`, `Notificaciones.jsx` | Plantillas y Notificaciones y numeración |
| `/documentos/configuracion/plantillas/:id` | `EditorPlantilla.jsx` | Editor de plantillas |
| `/mi-espacio/zona-hr/documentos` y `/solicitudes` | `pages/colaborador/MisDocumentos.jsx` | Mis documentos y Mis solicitudes |
| celular | `components/layout/MisDocumentosPhone.jsx` | Mis documentos y Mis solicitudes en la app |

Los datos viven en `context/DocumentacionContext.jsx` y `data/documentacionData.js`; el lado del colaborador, en `hooks/useMisDocumentos.js`. Las rutas viejas (`/legajos`, `/colaboradores`, `/envios`, `/emitir`, `/por-revisar`, `/carga-masiva`, `/reportes`) redirigen a las nuevas.

### Lo que la maqueta todavía no hace

| Tema | En la maqueta | Regla |
| --- | --- | --- |
| Avisos y recordatorios | Se registran; no se envía nada | BR‑DOC‑023, 050 |
| Copia de un documento del expediente | Se anota; no le llega a la persona | BR‑DOC‑040 |
| Circuito de aprobación de plantillas | Se guarda; al emitir no se aplica | ABIERTA‑DOC‑04 |
| Líder | Ve toda la empresa y puede editar | BR‑DOC‑053 |
| Carpetas y documentos requeridos | No hay pantalla para configurarlos; son los de ejemplo | ABIERTA‑DOC‑02 |
| Papelera | No se vacía sola | ABIERTA‑DOC‑10 |
| Tamaño carta u oficio | Solo cambia la vista previa del editor | ABIERTA‑DOC‑09 |
| Contratos | Del firmado solo se guarda el nombre del archivo; las descargas son texto | BR‑DOC‑028 |
| Archivos | Se guardan en el navegador de quien los subió; los de ejemplo bajan como .txt | 5.4 |
| Haber básico | Sale de una tabla de ejemplo por unidad | BR‑DOC‑031 |
| Carpeta Perfil profesional | Se ve en local y se oculta en Vercel | 3.14 |
| Colaboradores de ejemplo | Carlos y María no están en el directorio | ABIERTA‑DOC‑07 |
| Revisar | Abrir un confidencial ahí no deja rastro | BR‑DOC‑020 |
| Código sin uso | `CargaLote.jsx`, `Reportes.jsx`, `TiposSubtipos.jsx` y `PorRevisar.jsx` quedan sin pantalla | — |
