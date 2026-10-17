Souly HR · Módulo de documentación · Documentación de producto

# Módulo de documentación

> **Módulo de documentación — versión en Markdown.** Reúne completo el documento de producto `public/modulo-documentacion.html` (versión 1.3, 16 de octubre de 2026): glosario, contexto, integraciones, funcionalidades por rol, las reglas de negocio con sus escenarios, modelo de datos, roadmap, flujos, pantallas, historias de usuario, el anexo de decisiones y el anexo «El módulo en el prototipo, hoy». Reemplaza a la «Propuesta de estructura» v0.2 (`public/modulo-documentacion-propuesta.html`), que queda como histórico.

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

Los papeles de cada persona dejan de estar repartidos en carpetas, correos y cajones, y pasan a ser *un expediente por colaborador que dice solo qué le falta, qué vence y qué se le emitió, con rastro de todo*. Este documento define qué es el módulo, qué reglas cumple, qué tiene que hacer el producto y cómo se opera.

- **Versión:** 1.3
- **Fecha:** 16 de octubre de 2026
- **Autoría:** Paola Gema — Diseñadora UX
- **Revisa y aprueba:** Por definir
- **Estado:** Borrador

| En este documento | Cantidad |
| --- | --- |
| roles con su vista | 3 |
| estados de un documento | 7 |
| reglas de negocio | 66 |
| requisitos funcionales | 76 |
| historias de usuario | 19 |
| pantallas | 19 |
| decisiones abiertas | 8 |

> **Diagrama · El módulo, de un vistazo.** Documentación son dos espacios con un solo dato debajo. Arriba, la bitácora que registra todo y la ficha de Gestión de personas, que se lee y no se copia. En el medio, el **Repositorio** —Expedientes, Revisar documentos y Contratos: lo que hay de cada persona y su historia— y la **Emisión** —Emitir, Documentos emitidos y Solicitudes: lo que la empresa genera y hace firmar—. Una flecha va de la Emisión al Repositorio: todo lo emitido queda en el expediente, en la carpeta de su tipo dentro de «De RR.HH.», o en Contratos. Debajo, la configuración: Plantillas y tipos alimentan la Emisión, Notificaciones y tipos de documento sirve a los dos, y los documentos que se exigen en el Repositorio todavía no tienen pantalla (ABIERTA‑DOC‑02). Abajo, el colaborador en Zona HR: Por entregar y Mis carpetas salen del Repositorio; De RR.HH. y Mis solicitudes, de la Emisión. En la versión HTML está dibujado.

## 00 · Glosario

*Las palabras del módulo, con lo que significan en Souly. Se leen antes que nada porque todo lo demás las usa: un expediente no es una carpeta, un tipo no es un subtipo y un documento emitido no es un documento subido.*

### 0.1 Expediente, carpeta y documento

El **expediente** es todo lo que la empresa guarda de una persona. Hay uno por colaborador y se ordena en **carpetas**:

| Carpeta | Qué guarda | De dónde sale |
| --- | --- | --- |
| **Información personal, Perfil profesional, Recursos y activos, Documentos agregados** | Lo que la persona entrega: carnet, títulos, croquis, licencias | Son los **tipos** de documento; los mismos grupos que la sección «Archivos» de la ficha |
| **Contratos** | Sus contratos, con su estado, y las adendas que tenía de antes | Se registran desde Emitir; renovar registra uno nuevo |
| **De RR.HH.** | Lo que RR.HH. le emitió, en una carpeta por tipo: Certificados, Memorándums y una por cada tipo que creó la empresa. «Otros» aparece solo si tiene algo —un archivo propio que se le envió— | Se archiva solo al emitir, «Sin firmar» hasta que se sube el firmado —BR‑DOC‑036— |
| **Por clasificar** | Archivos que llegaron sin decir qué documento son | Aparece solo si hay alguno; desde Subir documento ya no se crea |
| **Historial** | Todo lo que pasó con el expediente, mes a mes | La bitácora de la persona |
| **Anulados** | Lo que se anuló, con quién, cuándo y por qué; no se recupera —BR‑DOC‑018— | Aparece solo si tiene algo |

Un **documento** es un papel concreto de la persona —su carnet— con todas sus **versiones**: cada vez que se reemplaza, la anterior se conserva —BR‑DOC‑012—.

### 0.2 Tipo y subtipo

El **tipo** es la carpeta (Información personal). El **subtipo** es el documento que la empresa espera (Documento de identidad) y dice cómo se comporta: si vence y cada cuánto, quién lo ve, si el colaborador lo sube, si se exige a todos y con qué plazo, qué formatos acepta y cuánto puede pesar.

### 0.3 Requisito y exoneración

Un **requisito** es un subtipo que se le exige a una persona. Sale de lo que se **exige a todos** desde la configuración del subtipo. Lo que antes se le agregaba a una sola persona desde su expediente sigue contando, pero desde la 1.2 ya no se agrega —BR‑DOC‑003—. **Exonerar** era liberar a alguien de un requisito, con motivo, para siempre; ya no se hace, y las exoneraciones que existen se ven como historial —BR‑DOC‑005—.

### 0.4 Los siete estados de un documento

| Estado | Qué quiere decir | ¿Cumple? |
| --- | --- | --- |
| **Vigente** | Está aprobado y no vence o falta para que venza | Sí |
| **Por vencer** | Vence dentro de la ventana de aviso | Sí |
| **Vencido** | Ya venció | No |
| **Faltante** | Se le exige y no lo entregó | No |
| **En revisión** | Lo subió el colaborador y RR.HH. no lo miró | No, hasta aprobarse |
| **Rechazado** | RR.HH. lo rechazó con un motivo | No |
| **Exonerado** | Se le liberó de entregarlo antes de la 1.2; queda como historial | No cuenta |

Ningún estado se guarda: se deduce de las fechas y de la revisión —BR‑DOC‑007—.

### 0.5 Plantilla, tipo de documento y emitido

Una **plantilla** es el texto con el que RR.HH. arma un documento para una persona: un certificado de trabajo, un memorándum, un contrato. Cada plantilla es de un **tipo de documento** —Certificado, Memorándum, Contrato o uno que cree la empresa, como «Carta de recomendación»— que le da su color y su **sigla** de numeración. Las **plantillas de Souly** vienen con el sistema y son un catálogo de referencia: se ven y se usan como base, pero no se emiten ni se editan —BR‑DOC‑065—. Las de la empresa son **Mis plantillas**. Un **emitido** es el documento ya hecho para una persona, con su número, sus datos congelados y su estado: **Sin firmar**, **Entregado** o **Anulado**. El **firmado** es el escaneado del emitido ya firmado a mano, que RR.HH. sube y queda pegado a él, con el mismo número —BR‑DOC‑036—.

### 0.6 Solicitud

Lo que un colaborador le pide a RR.HH. desde la app: **un certificado**, **una copia** de su contrato o **una corrección** de algo que recibió. Cada una tiene un plazo de respuesta en días hábiles que RR.HH. configura —2 por defecto—, y al pedir se le dice hasta qué día le responden.

### 0.7 Quién es quién

| Rol | Qué hace en el módulo |
| --- | --- |
| **Recursos Humanos** (administrador) | Lleva los expedientes, revisa lo que suben, registra y renueva contratos, emite documentos y sube sus firmados, atiende las solicitudes y configura plantillas, avisos y tipos de documento |
| **Líder de área** | Hoy entra al módulo con lo mismo que Recursos Humanos —ABIERTA‑DOC‑01— |
| **Colaborador** | Ve sus carpetas, sube lo que le piden, lee lo que recibe y hace sus pedidos, en la web o en el celular |

Quien administra también es colaborador: en **Zona HR** entra a **Mis documentos** con su propio expediente, como todos. Al módulo Documentación llega desde el menú lateral.

## 01 · Contexto

*Por qué existe el módulo, qué problema resuelve y cómo se sabe si funcionó.*

### 1.1 ¿Qué es la documentación en Souly?

Es el lugar donde vive el expediente de cada persona y desde donde RR.HH. emite sus documentos. Tiene dos caras sobre el mismo dato: lo que **la persona entrega** (su carnet, sus títulos) y lo que **la empresa le emite** (certificados, memorándums, contratos), que se imprime, se firma a mano y se sube firmado. Las dos terminan en el mismo expediente.

### 1.2 El problema que resuelve

- Los papeles están repartidos: una parte en la ficha, otra en un cajón, otra en el correo de alguien.
- Nadie sabe a quién le falta qué hasta que un auditor lo pide.
- Los documentos vencen sin que nadie lo note.
- Cada certificado se hace a mano, con datos que se copian y se equivocan.
- El papel firmado queda en un cajón, lejos del documento que se generó.

### 1.3 Visión del módulo

Un expediente que se cuida solo: dice qué falta, qué vence, qué espera revisión y qué falta firmar; arma los documentos con los datos de la ficha, sin tipear nada; y deja rastro de cada cosa que pasó.

### 1.4 Principios de diseño

| Principio | Qué significa |
| --- | --- |
| **Lo pendiente tiene puerta** | Lo que hay que hacer se ve primero y lleva directo a hacerlo: «Qué atender hoy», «Revisar», «Pedir renovación» |
| **Nada se tipea dos veces** | Los datos de la persona salen de su ficha; si están mal, se corrigen allá |
| **Nada se borra** | Lo reemplazado queda como versión; lo que estaba mal se anula con motivo, sea un documento del expediente o uno emitido |
| **El estado se deduce** | De las fechas y la revisión, nunca a mano |
| **Una sola forma de hacer cada cosa** | Un solo editor para todas las plantillas, una sola pantalla para emitir |
| **El colaborador ve el mismo dato** | Lo que RR.HH. aprueba, emite o pide es lo que la persona ve en su app |

### 1.5 Cómo se sabe si funcionó

| Indicador | Meta |
| --- | --- |
| Expedientes al día | Que el anillo de «Qué atender hoy» suba mes a mes |
| Tiempo de respuesta a solicitudes | Todas dentro del plazo configurado (2 días hábiles por defecto) |
| Documentos sin firmar | Que bajen a menos del 10 % de lo emitido |
| Documentos subidos por el colaborador | Que la mayoría de las renovaciones las haga la persona, no RR.HH. |

### 1.6 A quién sirve

- **Recursos Humanos**, que deja de perseguir papeles y de armar certificados a mano.
- **El colaborador**, que sabe qué le falta y recibe sus documentos firmados en el celular.
- **La empresa**, que tiene el expediente completo ante una auditoría, con el firmado de cada documento que emitió.

### 1.7 Alcance y límites

- **Entra:** expedientes, carpetas y requisitos; subir, revisar, versionar y anular; exportar los expedientes en ZIP y la lista en Excel; contratos y su renovación; emitir certificados, memorándums, contratos y archivos propios, descargarlos para imprimir y subir el firmado; solicitudes; plantillas y tipos de documento, el catálogo de plantillas de Souly y la carga de plantillas desde Word; avisos y numeración; Mis documentos del colaborador.
- **No entra en esta versión:** la firma electrónica; la aprobación de plantillas, que se quitó en la 1.3; el diseño de un Word cargado como plantilla —membrete, logo, tablas y negritas—, del que se toma solo el texto; las adendas, la exoneración, los requisitos agregados a una sola persona y la confirmación de recepción, que se quitaron en la 1.2; las boletas de pago (cuando exista Planillas); vacaciones, permisos y anticipos como solicitudes; el envío real de avisos y correos.

## 02 · Integraciones

*Con qué módulos se habla y qué toma de cada uno. Documentación no guarda copia de nada que no sea suyo.*

### 2.1 Gestión de personas

- La **ficha** es la dueña de los datos de la persona: nombre, documento, cargo, ingreso. Documentación los **lee**, no los copia.
- Desde **Colaboradores**, el menú de cada persona tiene **«Ver expediente»**, que abre su expediente en Documentación.
- Los archivos que la persona cargó en la sección «Archivos» de su ficha aparecen en su expediente como documentos **de la ficha**: aprobados y de solo lectura —BR‑DOC‑002—. Si RR.HH. sube uno nuevo desde el expediente, desde ahora vale el nuevo en el expediente y la ficha conserva el suyo.
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

Las pantallas del módulo Documentación del menú lateral: Expedientes, Solicitudes, Documentos emitidos y Configuración, que se despliega en Plantillas y Notificaciones y tipos de documento.

### 3.1 Expedientes

La primera pantalla: todos los colaboradores, qué les falta y qué hay que atender hoy.

- **Selector en la cabecera**: Activos, Desvinculados y Todos, con su número. Elige a quién se mira; los filtros trabajan dentro de eso.
- **Resumen de hoy**: un anillo con el porcentaje de expedientes al día y su desglose (vencidos o rechazados, por vencer, con faltantes, en revisión, con contrato por terminar), y **«Qué atender hoy»** con hasta tres tareas en orden de urgencia: vencidos con «Pedir renovación», documentos que esperan revisión con «Revisar», contratos por decidir con «Ver contratos», faltantes con «Ver quiénes» y por vencer con «Ver cuáles». Sin nada urgente: «Nada urgente: todos los expedientes están al día».
- **Buscador** por nombre, código, cargo o correo, y **filtros** de sucursal, unidad organizacional, cargo y **estado** en la misma fila: Todos, Al día, Requieren atención (Vencidos, Por vencer, Falta entregar, Rechazados, Contrato por vencer), cada uno con su número.
- **Tabla** de diez por página, ordenable por cualquier columna: Colaborador, Unidad organizacional, Sucursal, Expediente completo (barra con «x de y obligatorios») y **Lo más urgente**: una sola cosa, con el tiempo en color —«Venció hace 12 días», «Falta desde hace 4 meses»— y «+N más».
- Con un estado elegido aparece **«Ver por Colaborador / Documento»**: la vista por documento lista cada papel pendiente, con casillas para pedir varios a la vez y «Subir» por fila.
- **Exportar**, un menú en la cabecera con dos salidas. Las dos bajan a los que deja pasar la vista —búsqueda, filtros, estado y Activos/Desvinculados—, de todas las páginas, y quedan en la bitácora —BR‑DOC‑063—.
- **Exportar › Expedientes en ZIP**: una carpeta por persona, con su índice. Los documentos confidenciales no viajan y el índice dice cuáles quedaron fuera. Antes pide una confirmación corta: «¿Descargar 20 expedientes?», una línea con a quiénes —«Activos de Casa Matriz Equipetrol, de todas las páginas»— y **Cancelar** o **Descargar**.
- **Exportar › Lista en Excel**: un CSV con una fila por persona —código, nombre, cargo, unidad organizacional, sucursal, situación, % completo, obligatorios cumplidos, vencidos, por vencer, faltan, rechazados, en revisión, contrato por terminar y lo más urgente—. La primera línea dice los filtros.
- Todo queda en la dirección: se puede compartir o volver a la misma vista.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑001 | El porcentaje al día y las tareas de hoy se calculan de los expedientes reales | Oblig. | Aprobar el único pendiente quita la tarea «Revisar» |
| RF‑DOC‑002 | «Lo más urgente» muestra una sola cosa por persona, en orden de gravedad | Oblig. | Con un vencido y un faltante, se ve el vencido y «+1 más» |
| RF‑DOC‑003 | Los filtros y el estado van en una fila y cuentan personas | Oblig. | «Vencidos 4» filtra a esas cuatro personas |
| RF‑DOC‑004 | La tabla pagina de a diez y se ordena por columna | Import. | Ordenar por sucursal y pasar de página conserva el orden |
| RF‑DOC‑005 | Pedir renovación guarda a quién y cuándo se pidió | Oblig. | Lo pedido muestra «pedido el …» y no se vuelve a marcar |
| RF‑DOC‑006 | Los desvinculados no suman pendientes | Oblig. | Un desvinculado con un vencido no aparece en «Qué atender hoy» |
| RF‑DOC‑063 | Exportar baja los expedientes de la vista, de todas las páginas: en ZIP sin confidenciales, o la lista en Excel | Import. | Con «Activos» y una sucursal, «¿Descargar 20 expedientes?» y el ZIP trae 20 carpetas; el índice dice qué confidencial quedó fuera |

> **En la maqueta:** «Pedir renovación» guarda el pedido pero no envía ningún mensaje. El texto «en los próximos 45 días» está fijo aunque el cálculo usa el valor de Notificaciones.

### 3.2 El expediente de una persona

Todo lo de una persona, por carpetas.

- **Cabecera**: foto, nombre, cargo, unidad, sucursal y código, de la ficha; la barra de avance «x de y obligatorios exigibles»; y los botones **Subir documento**, **Descargar expediente** e **Historial**. «Enviar documento» se quitó en la 1.2: se emite desde Emitir.
- **La franja de lo pendiente**, la misma que ve el colaborador en Mis documentos: un anillo con lo cumplido («2/3») y cuánto debe —«1 documento pendiente · 1 falta»—, con **«Ver qué falta»** y, si subió algo, **«Revisar N»**. Al día dice «Está al día». Dentro de una carpeta, lo pendiente sigue en pastillas que filtran.
- **Carpetas**, como las de Mis documentos —carpetas amarillas con un punto de color en lo urgente y una línea como «2 de 3 al día · 1 faltante»— en dos grupos: **Sus carpetas** (una por tipo, Contratos y, si tiene algo, Por clasificar) y **De RR.HH.** (una por tipo de documento emitido, con cuántos tiene, y **Anulados** si hay alguno). El Historial se abre con su botón de arriba.
- **Buscar** en todas sus carpetas y filtrar por estado. «Agregar requisito» se quitó en la 1.2.
- **Dentro de una carpeta**: un selector con **Lista** primero —la vista de entrada— y **Gráfica**. La lista tiene encabezado (Documento, Estado, Vencimiento, Acciones) y pagina de a 10; la gráfica, tarjetas con miniatura de a 24 con «Mostrar más». Lo urgente va primero, con su acción según el estado —Subir, Renovar, Subir otro, Revisar, Ver— y un menú con Ver, Descargar, Dejar de exigir (solo lo que antes se le pidió a esa persona y no tiene documento) y **Anular**.
- **Anular** pide motivo y una segunda confirmación. El primer paso dice cuándo no hace falta: «¿Sólo tiene una versión más nueva? Use «Subir nueva versión»: el actual queda en el historial como versión anterior, sin anularlo.», con un enlace que lleva a reemplazar. Reemplazar es para lo que **era válido y quedó viejo**: queda como «Reemplazada». Anular es para lo que **nunca debió contar**: deja de contar al instante y pide motivo.
- El documento anulado deja de contar para sus requisitos —vuelve a quedar faltante para subir el correcto— y va a la carpeta **Anulados**, con «Anulado el … por …: motivo» y **Ver** en solo lectura. Si había reemplazado a la copia de la ficha, la de la ficha **no vuelve a verse como Vigente**: el documento queda Faltante. Al terminar, un aviso con un check verde grande, «Documento anulado con éxito» y un solo botón, **Cerrar**. No hay Recuperar —BR‑DOC‑018—.
- **Exonerar** se quitó en la 1.2. Lo exonerado antes se sigue viendo: «Exonerado por … el …: motivo».
- **Ver un documento**: la vista previa, sus fechas y todas sus versiones. Cada versión dice **quién la subió** y **quién la aprobó o rechazó**, con su nombre, su cargo y la fecha —«Aprobado por Paola Arce · Especialista RRHH · 28 jul 2026»—, porque RR.HH. pueden ser varias personas. Lo que carga RR.HH. queda aprobado por quien lo cargó, al subirlo; lo que llega por la app lo subió el propio colaborador. Si está en revisión, dice «Todavía nadie lo revisó» y ofrece Aprobar o Rechazar. Un emitido con firmado se abre en el escaneado y se puede cambiar a «El que generó el sistema». Si el documento tiene anulados, la lista del costado se llama **Historial**: debajo de las versiones del actual van los anulados de ese mismo documento, con «Anulado el …» y el número tachado; se ven y se descargan, y dicen **Anulado por** y **Motivo de la anulación**. No pasa en los documentos que admiten varios.
- **Historial**: la bitácora de la persona por mes, filtrable por Documentos, Recibidos, Contratos y Solicitudes.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑007 | Las carpetas se ven como en Mis documentos y dicen cuánto falta | Oblig. | Una carpeta con un faltante lleva el punto rojo y «· 1 faltante» |
| RF‑DOC‑008 | Retirado en la 1.2: ya no se agrega un requisito a una sola persona | — | Lo agregado antes sigue en su lista y se puede dejar de exigir |
| RF‑DOC‑009 | Retirado en la 1.2: ya no se exonera | — | Lo exonerado antes se ve con quién, cuándo y el motivo |
| RF‑DOC‑010 | Descargar el expediente baja un ZIP con índice y una carpeta por tipo, con los firmados | Import. | El ZIP trae «00 Índice.txt», las carpetas y, junto a cada emitido, su firmado |
| RF‑DOC‑011 | El historial es una línea de tiempo por mes, filtrable | Import. | Filtrar «Contratos» deja solo los eventos de contratos |
| RF‑DOC‑012 | Un expediente de un desvinculado es de solo lectura | Oblig. | No aparece Subir; Descargar sí |
| RF‑DOC‑067 | Anular pide motivo y doble confirmación, y no se deshace | Oblig. | El carnet anulado va a Anulados y el documento vuelve a quedar Faltante, aunque la ficha tenga su copia; al terminar, «Documento anulado con éxito» |
| RF‑DOC‑069 | En una carpeta, la lista es la vista de entrada y pagina de a 10 | Import. | Una carpeta con 14 documentos muestra 10 y la página 2 |
| RF‑DOC‑070 | Al ver un documento, el Historial suma sus anulados, con quién y el motivo | Import. | Un carnet anulado se ve tachado debajo del actual, con «Anulado por» y «Motivo de la anulación», y se descarga |

### 3.3 Subir documento

Subir siempre dice a qué documento va. Lo que se ve depende de dónde se está.

- **Desde la vista general**, primero **«¿En qué carpeta va el documento?»**, con las mismas carpetas amarillas: **Sus carpetas** (Información personal, Perfil profesional, Recursos y activos, Documentos agregados, con «Falta N» y punto rojo) y **De RR.HH.** (Certificados, Memorándums, los tipos creados, Otros y Contratos). Al elegir se abre el modal de esa carpeta, con **«Cambiar carpeta»** para volver. Dentro de una carpeta, abre directo esa carpeta.
- **En una carpeta de documentos**, desde la cabecera o desde la carpeta, un modal grande. A la izquierda, los documentos de esa carpeta con su estado, lo que falta primero, y un buscador. El título de la carpeta va en una franja verde, con la carpeta amarilla y «x de y»; el elegido lleva borde verde. Los que no se exigen ya no se ven apagados: dicen «Si lo trae, se guarda» y llevan la etiqueta «Opcional». A la derecha, el elegido.
- **Desde una fila** —Subir, Renovar o Subir otro—, el modal se abre **solo con ese documento**: sin la lista de la izquierda ni «Cambiar carpeta».
- **Si le falta**: la zona para arrastrar el archivo y las fechas de emisión y vencimiento, con el vencimiento propuesto por la vigencia. Desde una fila, la **vista previa grande** del archivo va a la izquierda y, a la derecha, la **«Revisión del archivo»** con tres verificaciones —**Formato aceptado**, **Tamaño dentro del límite** y **Se guardará como**, con el nombre ya normalizado— y las fechas: «Calculado: este documento vale N años».
- **Si ya tiene uno**, también desde una fila: **el actual y el nuevo lado a lado** y «¿Desea reemplazar el documento de identidad?», con **Sí, reemplazar**. El actual queda como versión anterior —BR‑DOC‑012—. Si el actual vino de la ficha, desde ahora vale el nuevo en el expediente y la ficha conserva el suyo.
- **Si el documento admite varios** —títulos, certificaciones, actas—: «Ya tiene N documentos de este tipo. ¿Qué desea hacer?», con **Agregar uno nuevo** o **Reemplazar** uno de los que tiene.
- **En una carpeta de RR.HH.**: «¿Qué va a subir?». **El firmado de uno ya emitido** —se elige cuál, cada uno con «Sin firmar» o «Firmado»— o **uno nuevo hecho fuera del sistema**, con nombre, archivo, fecha y el número que sigue en su serie.
- **En Contratos**: se elige el contrato y se **sube el firmado**, que queda como su versión firmada; o **Registrar un contrato nuevo**.
- Valida formato y tamaño antes de subir y dice el error en palabras.
- Desde aquí ya no se crea nada «Por clasificar». Lo que llega de la app sin clasificar se sigue viendo en su carpeta, donde se elige «¿Qué documento es?».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑013 | Lo que sube RR.HH. queda aprobado | Oblig. | Subir un carnet lo deja Vigente |
| RF‑DOC‑014 | Al subir se elige siempre a qué documento va | Oblig. | Sin documento elegido no se sube; «scan001.pdf» ya no queda en Por clasificar |
| RF‑DOC‑015 | Formato y tamaño se validan antes de subir | Oblig. | Un .exe se rechaza con «Este documento se recibe en PDF, JPG o PNG» |
| RF‑DOC‑016 | Las fechas se corrigen sin crear versión | Import. | Cambiar el vencimiento no suma una versión |
| RF‑DOC‑066 | Si ya tiene el documento, se pregunta antes de reemplazar, con el actual y el nuevo a la vista | Oblig. | Subir otro carnet muestra los dos y «Sí, reemplazar»; el anterior queda como versión |
| RF‑DOC‑071 | Desde una fila, el modal trae solo ese documento y revisa el archivo antes de subir | Import. | «Subir» en el carnet que falta muestra la vista previa, «Formato aceptado», «Tamaño dentro del límite» y «Se guardará como …» |

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

- **Aviso de estado**: vigente y firmado, por vencer con «Decida si lo renueva o lo deja terminar», vencido, falta el firmado, finalizado o reemplazado. Si ya encadena dos o más plazos fijos, el aviso de Legal.
- **Acciones**: sin firmado, lo principal es **Subir el firmado**, con **Descargar para imprimir** al lado —un Word con las líneas de firma de la empresa y de la persona— y **Finalizar** con motivo. Con firmado, **Reemplazar** con motivo.
- **Renovar contrato** va adelante solo cuando el plazo fijo está por vencer o vencido. Abre un modal grande: **Modalidad** (Plazo fijo o Indefinido), **Desde** (el día siguiente al fin vigente), **Hasta** (no se pide si es indefinido) y, a la derecha, la **vista previa** del contrato nuevo con su número. Renovar **registra siempre un contrato nuevo** que reemplaza al anterior; el anterior queda «reemplazado», con sus versiones. Después, el mismo modal muestra el contrato nuevo con **Descargar para imprimir** e **Ir al contrato**.
- **Datos**: inicio, fin —con «ampliado al …» si una adenda de antes lo corrió—, modalidad, plantilla, quién lo registró; sus versiones y, si las tiene, la cadena de contrato y adendas, como historial.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑020 | El estado del contrato se calcula de sus fechas | Oblig. | Un plazo fijo a 30 días del fin está Por vencer |
| RF‑DOC‑021 | Renovar registra un contrato nuevo que reemplaza al anterior | Oblig. | Renovar un plazo fijo que vence el 30 oct crea uno nuevo desde el 31 oct, y el anterior queda Reemplazado |
| RF‑DOC‑022 | Subir el firmado crea una versión | Oblig. | El sello pasa a «Firmado» |
| RF‑DOC‑023 | Encadenar plazos fijos avisa, no bloquea | Import. | Con dos plazos fijos se ve «consúltelo con Legal» |

### 3.6 Solicitudes

Lo que los colaboradores le piden a RR.HH.

- **Selector en la cabecera**: Pendientes, Atendidas y Rechazadas, con su número.
- **Filtros** de sucursal, unidad, cargo y tipo de pedido.
- **Tabla**: Colaborador, **Tipo** (Certificado, Copia o Corrección), Detalle y **Responder antes**, con el plazo en color: «Atrasada 2 días» o «Vence hoy» en rojo, «Mañana» en ámbar, «En 4 días» en gris. Lo más atrasado primero.
- Cada fila abre el pedido con «Ver detalle».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑024 | El plazo se cuenta en días hábiles | Oblig. | Un pedido del viernes vence el martes |
| RF‑DOC‑025 | Las pendientes se ordenan por plazo | Oblig. | La atrasada va primero |
| RF‑DOC‑026 | Las atendidas muestran qué se envió | Import. | «Ver el envío» abre el documento emitido |

### 3.7 Atender un pedido

Un pedido a la vez, en dos columnas: lo que va a recibir la persona y el panel para responder.

- **Certificado**: se elige la plantilla y **Generar certificado**. No se envía: queda «Sin firmar» y aparece **Descargar para imprimir**; RR.HH. lo hace firmar y se lo **entrega en persona**. El pedido queda Atendido con la nota «Se generó CERT‑… Lo recibe firmado en RR.HH.».
- **Corrección**: se elige la plantilla, se marca **«Anular N al emitir el nuevo»** y **Generar el corregido**; igual que el certificado, se descarga, se firma y se entrega en persona. Si el error está en la ficha, se corrige en Gestión de personas.
- **Copia**: se elige qué documento enviarle —sus contratos, lo que recibió, lo de su expediente— y **Enviar copia**.
- **Rechazar…** con motivos rápidos —«Se entrega en persona», «Ya se le envió», «Falta información», «No corresponde»—.
- **Arriba a la derecha**, como en el correo: **«‹ Anterior · 1 de 8 pendientes · Siguiente ›»**, siempre visible, en el orden de la tabla. Sirve también para saltar un pedido sin atenderlo. Al atender, el contador pasa a «Quedan N pendientes» y «Siguiente» se pinta de oscuro.
- Al terminar, en el panel: el resultado, **Descargar para imprimir** si se generó un documento, y **Volver a Solicitudes**.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑027 | Cada pedido se atiende con lo que pide | Oblig. | Un certificado se emite; una copia se elige |
| RF‑DOC‑028 | La corrección anula el documento anterior | Oblig. | El anterior queda Anulado con «Reemplazado por …» |
| RF‑DOC‑029 | Atender guarda qué documento lo resolvió | Oblig. | El colaborador ve «Ver el documento» en su pedido |
| RF‑DOC‑030 | Rechazar exige motivo | Oblig. | Sin motivo no se rechaza |

> **En la maqueta:** enviar la copia de un documento del expediente solo queda anotado; no le llega nada a la persona.

### 3.8 Documentos emitidos

Todo lo que RR.HH. emitió. Cada documento queda en el expediente de su dueño.

- **Emitir documento** arriba a la derecha.
- **Buscador** por documento, número o persona.
- **Tabla**: Documento (con su número, o «N documentos» si fue a un grupo, y «Solicitud» si vino de un pedido), Para y **Emitido**: la fecha y, en cada uno, «Sin firmar» o «Firmado» (o «Anulado»).
- **Detalle** de un documento: la hoja tal como salió, **Descargar para imprimir** y **Subir el firmado** —o **Reemplazar el firmado**, si ya tiene uno—, Descargar y **Anular** con motivo. Dice «Está en su expediente, sin firmar» o «Firmado: lo subió … el …».
- **Detalle** de un grupo: su nombre editable, «Con el firmado subido: x de y», «Descargar todos» y la lista, con la columna Firmado.
- Ya no hay columna «Confirmación», ni «Recordar», ni el filtro de los sin confirmar: se quitó la confirmación de recepción. Lo que se confirmó antes se ve como Entregado.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑031 | Un envío a varios se ve como uno, con su avance | Oblig. | «Felicitación · Ventas» muestra «Con el firmado subido: 5 de 7» |
| RF‑DOC‑032 | Retirado en la 1.2: no hay confirmación que recordar | — | No aparece «Recordar» |
| RF‑DOC‑064 | Lo emitido se descarga para imprimir y se le sube el firmado, que queda con el mismo número | Oblig. | Subir el firmado de CERT‑0007 lo deja «Firmado» y el colaborador lo ve en Certificados |
| RF‑DOC‑033 | Anular pide motivo y el número no se reutiliza | Oblig. | El siguiente certificado no toma el número anulado |

### 3.9 Emitir

Una sola pantalla para emitir cualquier documento. Emitir genera el documento y lo guarda en el expediente **«Sin firmar»**; al colaborador no le llega nada hasta que se sube el firmado —BR‑DOC‑036—.

- **A la izquierda, el riel**: cada tipo con su puntito de color y su flechita para desplegar sus plantillas, con cuántas veces se emitió cada una. Al final, **Un archivo propio** (reglamento, política, comunicado).
- **Al centro, la hoja** tal como va a salir. Sin nadie elegido es una **hoja de ejemplo**, con los datos de la persona en celeste («Sin nombre»). Con alguien, sus datos; lo que falta en su ficha se marca en rojo y no deja emitir.
- **A la derecha, «Para quién»**: siempre la lista con casillas, un buscador y filtros de sucursal, unidad organizacional y cargo, con **«Marcar los N que se ven»**. Lo marcado queda arriba como etiquetas, con **«Quitar todos»**. Una persona marcada es un documento; varias, uno por persona. Con varias, cada una tiene «Ver» y quien tiene un dato vacío «No sale». Las pestañas «Personas / Un grupo» se quitaron en la 1.2.
- **Editar documento**: con una sola persona elegida, y si no es un contrato, arriba de la hoja dice «¿Hay que cambiar algo sólo en este documento? Quién firma, un dato que cambió…». **Editar documento** vuelve editable toda la hoja solo para esa emisión: «Editando sólo este documento. La plantilla y los datos de X no cambian», con **Volver a la plantilla** —BR‑DOC‑061—.
- **Abajo**: el número que va a salir —«Salen del CERT‑0007 al CERT‑0012»— y el botón **Emitir para Carlos** o **Emitir N documentos**.
- **Después de emitir**: «Emitido: CERT‑…», «quedó en el expediente de X, sin firmar», con **Descargar para imprimir** —un .doc de Word con formato de hoja— y **Subir el firmado**. Con varios: «Se emitieron N documentos», cada uno sin firmar, y **Ver y descargar todos**.
- **Memorándum**: un recuadro sobre la hoja para escribir el hecho, textos frecuentes y el aviso si ya recibió uno igual en el año.
- **Contrato**: una sola persona, con el buscador de a una, modalidad, fechas y qué pasa con el contrato vigente. La plantilla de adenda ya no se ofrece.
- **Un archivo propio** (reglamento, comunicado) sí se envía: le llega a cada persona por la app y queda en su expediente.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑034 | Solo se ofrecen plantillas activas | Oblig. | Una plantilla inactiva no aparece en el riel |
| RF‑DOC‑035 | La hoja se ve antes de emitir, con los datos reales | Oblig. | Al elegir a Diego, la hoja dice «Diego Morales» |
| RF‑DOC‑036 | Se emite para una o varias personas marcadas en la misma lista, con filtros | Oblig. | Filtrar la unidad Ventas y «Marcar los 7 que se ven» deja «Emitir 7 documentos» |
| RF‑DOC‑037 | Quien tiene un dato vacío no sale y se dice | Oblig. | «No sale» junto a su nombre; los demás sí salen |
| RF‑DOC‑038 | El número que saldrá se ve antes de emitir | Import. | «Sale con el número CERT‑0007/2026» |
| RF‑DOC‑039 | Un archivo propio se envía igual que una plantilla | Import. | Un PDF llega a cada persona elegida con su número |
| RF‑DOC‑065 | Con una persona, el texto se edita solo para ese documento | Import. | Cambiar quién firma no cambia la plantilla, y el emitido queda marcado como editado |

### 3.10 Plantillas

La lista de plantillas: las de la empresa y las de Souly.

- **Buscador**, filtro de **Tipo**, al lado el de **origen** —«Todas las plantillas», «Plantillas de Souly (7)», «Mis plantillas (n)»— y **Todos, Activos, Inactivos**; con Activos o Inactivos solo se ven las de la empresa. **Nuevo modelo** abre el editor directo, sin ventana previa, y **Cargar plantillas**, a su lado, trae una o varias desde Word.
- **Tabla** de diez por página: Modelo, Tipo con su color, Última edición y Estado. Las de la empresa dicen de dónde salieron y cuántas veces se emitieron: «Desde Souly · N emitidos» o «Propia · N emitidos».
- **Plantillas de Souly**: vienen con el sistema y son un **catálogo de referencia**. Cada fila lleva la etiqueta «Souly», «Lista para usar o personalizar» y «La mantiene Souly»; no tiene Activo ni Inactivo, no se emite y no se edita. Tiene dos botones: **Ver**, que abre su texto, y **Usar**, que abre el editor con esa plantilla cargada como una nueva, con el nombre «Certificado de trabajo (copia)» —o «(copia 2)»…—. Nada se crea hasta guardar —BR‑DOC‑065—.
- Las siete plantillas que se usaban hasta la 1.2 pasan a ser de la empresa, en **Mis plantillas**, con sus emitidos: Emitir, las adendas de antes y las solicitudes siguen funcionando.
- Menú por fila de las de la empresa: Editar, Duplicar (para armar una variante), Activar o Desactivar, Eliminar (solo si nunca se usó).
- **Cargar plantillas** abre un modal con la zona para soltar uno o varios Word y el recuadro **«¿Todavía no tiene la plantilla?»**, con un desplegable de tipo y **Descargar plantilla modelo**. Cada archivo da una fila: el nombre, que sale del archivo y se puede cambiar; el tipo, adivinado por el nombre y el comienzo del texto, que también se puede cambiar; el estado —«N datos reconocidos» o «N marcadores por revisar», con **Revisar**—, y quitar el archivo. Abajo, **+ Agregar más archivos**. Al pie, **Guardar como borradores**, siempre —lo pendiente queda como texto—, y **Guardar y activar**, solo sin pendientes. Al guardar, la lista se filtra en «Mis plantillas», con un aviso —BR‑DOC‑066—.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑040 | Una plantilla usada no se elimina | Oblig. | Ofrece «Desactivarlo» en su lugar |
| RF‑DOC‑041 | Duplicar crea una copia inactiva | Import. | La copia no aparece en Emitir hasta activarla |
| RF‑DOC‑072 | Las plantillas de Souly se ven y se usan como base; no se emiten ni se editan | Oblig. | Una de Souly no tiene Activo ni Inactivo y no está en Emitir; «Usar» abre el editor con «… (copia)» y nada se crea hasta guardar |
| RF‑DOC‑073 | «Cargar plantillas» trae varios Word a la vez, una plantilla por archivo | Import. | Tres Word dan tres filas con su tipo adivinado; con un marcador por revisar, solo se puede «Guardar como borradores» |

### 3.11 El editor de plantillas

Uno solo para todos los tipos, en tres columnas.

- **Ajustes**, a la izquierda: Nombre; **Tipo**, con **«+ Crear un tipo nuevo»** al final de la lista (nombre, color, y «Así se va a ver»: el riel de Emitir, el número con su sigla y la carpeta en la app); y los interruptores **El colaborador lo puede pedir** y, en una que ya existe, **Activa**. «Necesita aprobación» se quitó en la 1.3: lo emitido se genera, se imprime y se firma a mano. Debajo, el **Historial**: cuándo se creó y cada edición, con «Ver cómo era». Una hecha desde Souly lleva la etiqueta «De Souly», y **Volver al texto original** la devuelve al texto de Souly.
- **La hoja**, al centro: se escribe sobre ella. Los datos de la persona se ven como **pastillas** con su nombre de siempre —«Nombre completo», «Cargo»— y no como código. **Escribir** y **Vista previa**, que reparte el texto en páginas **Carta** u **Oficio** con los datos de quien está usando el sistema. **Descargar plantilla** baja un Word (.docx) con el texto de la hoja y cada dato de la persona escrito como **marcador** entre corchetes —el nombre del dato en mayúsculas: [NOMBRE COMPLETO], [NÚMERO DE DOCUMENTO], [CARGO], [HABER BÁSICO]…—, resaltado en amarillo. Con la hoja vacía, baja un texto de partida según el tipo: certificado, memorándum, contrato, o uno genérico para los tipos propios. Al final va la lista de marcadores, que se ignora al subir. **Subir plantilla** —antes «Subir .docx o .txt»— trae el texto de un Word y convierte cada marcador en su dato; lo que no reconoce se revisa en **«Revise estos marcadores»** —BR‑DOC‑066—.
- **Datos para insertar**, a la derecha: Colaborador, Puesto, Relación laboral, Empresa y Documento; un toque los pone donde está el cursor.
- Arriba: el estado —«Cambios sin guardar», «Guardada · activa»— y los botones. Una plantilla nueva —desde Nuevo modelo o con Usar desde Souly— tiene dos: **Guardar borrador**, que la deja inactiva, sin validar y fuera de Emitir, y **Guardar y activar**, que la valida y la pone en Emitir; no muestra el interruptor «Activa». Una que ya existe tiene **Guardar cambios**.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑042 | Los datos se insertan como pastillas en el cursor | Oblig. | Tocar «Cargo» lo pone donde se está escribiendo |
| RF‑DOC‑043 | La vista previa se pagina según el tamaño de hoja | Oblig. | Un texto largo da 5 páginas en carta y 4 en oficio |
| RF‑DOC‑044 | Crear un tipo nuevo no abre una ventana | Import. | Se crea desde la misma lista de tipos |
| RF‑DOC‑045 | Guardar una plantilla activa la valida | Oblig. | Un dato inexistente impide guardar y se dice cuál |
| RF‑DOC‑046 | El historial muestra cómo era cada versión | Import. | «Ver cómo era» abre el texto de ese día |
| RF‑DOC‑047 | Retirado en la 1.3: las de Souly ya no se editan; se usan como base —BR‑DOC‑065— | — | «Volver al texto original» sigue en las copias hechas desde Souly |
| RF‑DOC‑074 | Una plantilla nueva se guarda como borrador o se guarda y activa | Oblig. | «Guardar borrador» con un dato mal escrito la guarda inactiva; «Guardar y activar» dice qué dato falla |
| RF‑DOC‑075 | «Descargar plantilla» baja un Word con los datos como marcadores entre corchetes | Import. | Un certificado baja con [NOMBRE COMPLETO] y [CARGO] en amarillo, y la lista de marcadores al final |
| RF‑DOC‑076 | «Subir plantilla» convierte cada marcador en su dato y pregunta por los que no reconoce | Oblig. | [SUELDO] queda como Haber básico; [FECHA INI] abre «Revise estos marcadores» con «Inicio del contrato» ya elegido |

### 3.12 Notificaciones y tipos de documento

Una página de ajustes —en el menú y en el título, «Notificaciones y tipos de documento»— con un solo **Guardar cambios** en un encabezado fijo, que aparece con «N cambios sin guardar» y **Descartar**.

- **Los avisos de vencimiento**, sin título de sección: la primera fila es **«Avisar antes de que venza un documento»**, con su interruptor. Encendido: **Cuándo avisar** (hasta tres, en días antes); **A quién** (colaborador, jefe directo, responsable de RR.HH.); **Por dónde** (correo, notificación en la app); **Resumen a RR.HH.** (nunca, semanal, mensual).
- **Contratos**: solo los días de aviso antes del fin de un plazo fijo. «Días en la papelera» se quitó: un documento ya no se borra, se anula.
- **Solicitudes**: el **plazo para responder**, en días hábiles. Se le dice al colaborador al pedir y cada pedido guarda el suyo —BR‑DOC‑039—.
- **Tipos de documento**: «Cada tipo con su sigla y su numeración. Un número no se usa dos veces, ni si el documento se anula.» Una tabla con cada tipo —también los creados—, su sigla, sus dígitos, si reinicia cada año y **el próximo número**, que cambia mientras se edita.
- **+ Nuevo tipo de documento**, al final de la tabla: una fila con nombre, sigla (se propone sola), dígitos, si reinicia cada año y el próximo número en vivo. Valida que el nombre y la sigla no existan. Se crea al momento, con su carpeta en «De RR.HH.» —BR‑DOC‑044—.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑048 | Con los avisos encendidos hace falta un día y un destinatario | Oblig. | Sin destinatario, «Elija al menos a quién avisar» |
| RF‑DOC‑049 | Cada tipo necesita su sigla | Oblig. | Una sigla vacía impide guardar |
| RF‑DOC‑050 | El próximo número se ve en vivo | Import. | Cambiar CERT por CER muestra «CER‑0007/2026» |
| RF‑DOC‑068 | Un tipo nuevo se crea desde la tabla de tipos, sin repetir nombre ni sigla | Import. | «Constancia» propone CON y muestra «CON‑0001/2026»; una sigla que ya existe no deja crear |

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

- **De RR.HH.**: carpetas Certificados, Memorándums y una por cada tipo que creó la empresa, cada una con cuántos documentos tiene. «Otros» aparece solo si tiene algo. Son las mismas carpetas que ve RR.HH. en su expediente.
- Ve lo que ya está listo: lo emitido con el firmado subido, lo que resolvió una solicitud y los archivos propios que se le enviaron. Lo emitido sin firmar no le aparece; cuando RR.HH. sube el firmado, le aparece sin aviso.
- Al abrir un documento: la hoja tal como salió. Ya no hay «Confirmar que lo recibí», ni en la web ni en el celular.
- **Reportar un error** abre una corrección con ese documento elegido.
- En **Contratos**, cada contrato con su estado y **Pedir una copia**. No hay firma desde la app.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑DOC‑055 | Retirado en la 1.2: ya no se confirma la recepción | — | No aparece «Confirmar que lo recibí»; lo confirmado antes no muestra nada aparte |
| RF‑DOC‑056 | Cada tipo creado tiene su carpeta | Import. | «Constancias» aparece al recibir una constancia |
| RF‑DOC‑057 | Lo anulado no se ve | Oblig. | Un certificado anulado desaparece de Certificados |

### 3.16 Pedir y Mis solicitudes

- **Pedir**: Un certificado, Copia del contrato o Corregir algo que recibí. Desde un atajo, el tipo ya viene elegido. En una corrección hay que contar qué está mal.
- **Mis solicitudes**: En curso y Resueltas; cada pedido con un recorrido de tres pasos —Enviada, En RR.HH. («Responde hasta el …»), Atendida o Rechazada—, la nota de RR.HH. y **Ver el documento** si ya está disponible: una copia que se le envió, o un certificado cuando RR.HH. sube el firmado. Un certificado o una corrección se le entregan firmados en persona; la nota se lo dice.

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
- Los avisos dicen qué pasó y qué hacer, en una frase: «Falta el firmado», «Decida si lo renueva o lo deja terminar».

### 3.20 Fuera de alcance de esta versión

- Firma electrónica de contratos y documentos.
- Boletas de pago.
- Vacaciones, permisos y anticipos como solicitudes.
- Envío real de avisos, recordatorios y resúmenes.
- Configurar carpetas y documentos requeridos desde una pantalla —ABIERTA‑DOC‑02—.
- Aprobar una plantilla antes de usarla: lo emitido se imprime y se firma a mano.
- Conservar el diseño de un Word al cargarlo como plantilla: se toma solo el texto.

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
- **Antes:** v0.2 · Repositorio · 1.1 (cambia)
- **Estado:** Borrador

*Descripción general*

Cada colaborador tiene **un solo expediente**. Se ordena en una carpeta por **tipo** de documento (Información personal, Perfil profesional, Recursos y activos, Documentos agregados) y en carpetas fijas: **Contratos**, **Historial** y, cuando tienen algo, **Por clasificar** y **Anulados**. Lo que RR.HH. le emitió va en **De RR.HH.**, con una carpeta por tipo de documento. RR.HH. y el colaborador ven las mismas carpetas, con el mismo dibujo.

**2. Escenarios ágiles de ejecución**

*Las carpetas fijas aparecen siempre*

- **Dado que** se abre el expediente de alguien sin contratos
- **Cuando** se mira la lista de carpetas
- **Entonces** Contratos aparece igual, con su aviso de que no tiene contrato vigente

**3. Condiciones y excepciones**

- Por clasificar y Anulados solo aparecen si tienen algo. Anulados reemplaza a la Papelera desde la 1.2.
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
- **Entonces** el carnet está Vigente, con la etiqueta «de la ficha», y no ofrece Anular

**3. Condiciones y excepciones**

- Si el mismo documento está en la ficha y en Documentación, se muestra el de emisión más nueva.
- Un documento de la ficha no se versiona desde Documentación. Si RR.HH. sube uno nuevo desde el expediente, desde ahora vale el nuevo en el expediente y la ficha conserva el suyo; no se acepta una emisión anterior a la del de la ficha.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑007
- **Historia de usuario:** HU‑DOC‑01
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.3 · BR-DOC-003 · Se exige lo que pide la empresa a todos; lo pedido antes a una persona sigue valiendo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-003
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Requisito
- **Antes:** RF‑10 a RF‑13 · 1.1 (cambia)
- **Estado:** Borrador

*Descripción general*

Lo que se le exige a una persona sale de lo **exigido a todos** desde la configuración del documento, con su plazo desde el ingreso. Desde la 1.2, «Agregar requisito» ya no está en el expediente: no se le agrega un documento a una sola persona. Lo que se le agregó antes **sigue contando** y, si los dos piden lo mismo, **gana lo más exigente**: obligatorio sobre opcional, el plazo más corto.

**2. Escenarios ágiles de ejecución**

*Un requisito personal de antes sigue contando*

- **Dado que** antes de la 1.2 se le agregó a una persona la licencia de conducir como obligatoria a 15 días
- **Cuando** se abre su expediente
- **Entonces** la licencia sigue en su lista, con su plazo, y el expediente ya no ofrece «Agregar requisito»

**3. Condiciones y excepciones**

- Un requisito personal de antes se puede dejar de exigir solo si no tiene documento.
- No hay perfiles: se exige por documento.

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

*Estado: Retirada en la 1.2*

**1. Información básica**

- **Código:** BR-DOC-005
- **Grupo:** El expediente y sus carpetas
- **Qué gobierna:** Requisito
- **Antes:** RF‑15 · RN‑09
- **Estado:** Retirada en la 1.2

*Descripción general*

**Retirada en la 1.2: ya no se exonera.** «Exonerar» salió del menú de cada documento. Lo que se exoneró antes **se sigue mostrando como historial**: el documento dice «Exonerado por … el …: motivo» y sigue fuera del avance. Una exoneración no se deshace.

**2. Escenarios ágiles de ejecución**

*Una exoneración de antes se sigue viendo*

- **Dado que** a alguien se le exoneró el certificado de antecedentes antes de la 1.2
- **Cuando** RR.HH. abre su carpeta
- **Entonces** el documento dice «Exonerado» con quién, cuándo y el motivo, y ningún documento ofrece «Exonerar»

**3. Condiciones y excepciones**

- Lo exonerado sale del avance —BR‑DOC‑004—.
- La exoneración sigue en la bitácora.

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
- **Pantalla:** W‑DOC‑12 Notificaciones y tipos de documento
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
- **Antes:** RN‑13 · RN‑02 · 1.1 (cambia)
- **Estado:** Borrador

*Descripción general*

Subir un documento que ya existe **agrega una versión**; la anterior queda guardada, marcada como reemplazada. Antes de reemplazar **se pregunta**: el actual y el nuevo se ven lado a lado con «¿Desea reemplazar…?» y **Sí, reemplazar**. Si el documento admite **varios** —títulos, certificaciones, actas—, se elige **Agregar uno nuevo** o **Reemplazar** uno de los que tiene.

**2. Escenarios ágiles de ejecución**

*Renovar el carnet*

- **Dado que** alguien tiene su carnet vencido
- **Cuando** RR.HH. sube el nuevo y confirma «Sí, reemplazar»
- **Entonces** el documento tiene dos versiones y la actual es la nueva

**3. Condiciones y excepciones**

- La versión nueva queda con el motivo «Se reemplazó desde el expediente».
- Las versiones se ven al abrir el documento.
- Reemplazar es para lo que era válido y quedó viejo; lo que nunca debió contar se anula —BR‑DOC‑018—.

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

- La emisión se propone en hoy y se elige en el mismo modal, antes de subir.
- El vencimiento se propone con la vigencia del documento y se puede cambiar.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑013
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑03 Subir documento
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
- **Entonces** no se sube y dice «El archivo pesa 15,0 MB y el máximo es 10 MB.»

**3. Condiciones y excepciones**

- Vale igual para RR.HH. y para el colaborador.
- En las carpetas de RR.HH. se aceptan PDF, imágenes y Word; en Contratos, PDF e imágenes.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑015
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑03 Subir documento
- **Diseño:** Prototipado

#### 4.15 · BR-DOC-015 · Al subir se elige qué documento es; Por clasificar queda para lo que llega sin clasificar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-015
- **Grupo:** Subir y revisar
- **Qué gobierna:** Documento
- **Antes:** v0.2 · Por clasificar · 1.1 (cambia)
- **Estado:** Borrador

*Descripción general*

Desde la 1.2, **Subir documento** ya no adivina ni sube a ciegas: primero se elige la carpeta —desde la vista general, «¿En qué carpeta va el documento?»— y después, a la izquierda del modal, **el documento**. Siempre hay uno elegido: lo pedido desde una fila o lo primero que falta. Desde aquí no se crea nada en **Por clasificar**. Lo que llega de la app sin clasificar se sigue viendo ahí, donde RR.HH. elige qué es o lo descarta.

**2. Escenarios ágiles de ejecución**

*Subir desde la cabecera*

- **Dado que** RR.HH. pulsa «Subir documento» en la vista general del expediente
- **Cuando** elige la carpeta Información personal
- **Entonces** se abre el modal de esa carpeta con lo que falta primero, y «Cambiar carpeta» vuelve a la pregunta

**3. Condiciones y excepciones**

- Cada carpeta dice cuánto le falta: «Falta N», con punto rojo.
- Los archivos sin clasificar que ya existen suman al contador del menú.
- Desde una fila, el modal trae solo ese documento, sin la lista ni «Cambiar carpeta»; si le falta, con la vista previa grande y la «Revisión del archivo».
- En la lista, lo que no se exige dice «Si lo trae, se guarda» y lleva la etiqueta «Opcional».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑014 · RF‑DOC‑071
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑03 Subir documento
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

- Se corrige desde Revisar o desde el aviso «Revisar fechas» que aparece al clasificar un archivo.
- Valen las reglas de BR‑DOC‑009.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑016
- **Historia de usuario:** HU‑DOC‑04
- **Pantalla:** W‑DOC‑04 Revisar
- **Diseño:** Prototipado

#### 4.64 · BR-DOC-064 · En una carpeta de RR.HH. se sube el firmado de lo emitido o un documento hecho afuera

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-064
- **Grupo:** Subir y revisar
- **Qué gobierna:** Emitido
- **Antes:** Nueva (1.2)
- **Estado:** Borrador

*Descripción general*

Subir en Certificados, Memorándums, un tipo creado u Otros pregunta **«¿Qué va a subir?»**. **El firmado de uno ya emitido**: se elige cuál —cada uno dice «Sin firmar» o «Firmado»— y el escaneado queda pegado a ese emitido, con su número. **Uno nuevo hecho fuera del sistema**: se escribe el nombre, se elige el archivo y la fecha, y sale con **el número que sigue en su serie**. En Contratos se elige el contrato y se sube su firmado, o se registra un contrato nuevo.

**2. Escenarios ágiles de ejecución**

*El firmado va con su número*

- **Dado que** a alguien se le emitió MEM‑0003/2026 y está «Sin firmar»
- **Cuando** RR.HH. sube el escaneado firmado desde su carpeta Memorándums
- **Entonces** MEM‑0003/2026 queda «Firmado» y el colaborador lo ve en su carpeta

**3. Condiciones y excepciones**

- Si hay un emitido sin firmar, viene elegido «El firmado».
- Subir otro firmado reemplaza al anterior; la bitácora guarda los dos.
- Se aceptan PDF, imágenes y Word.
- El firmado de un contrato queda como su versión firmada —BR‑DOC‑028—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑064
- **Historia de usuario:** HU‑DOC‑08
- **Pantalla:** W‑DOC‑03 Subir documento
- **Diseño:** Prototipado

### El rastro

*Nada se borra y todo queda escrito*

#### 4.18 · BR-DOC-018 · Nada se borra: un documento se anula con motivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-018
- **Grupo:** El rastro
- **Qué gobierna:** Documento
- **Antes:** RF‑88 · RF‑89 · REP‑01 · 1.1 (cambia: antes, la papelera)
- **Estado:** Borrador

*Descripción general*

Desde la 1.2 un documento no se borra ni va a la papelera: **se anula**. Anular pide **motivo** y **una segunda confirmación**. El documento deja de contar para sus requisitos —vuelve a quedar faltante, para subir el correcto— y va a la carpeta **Anulados**, con «Anulado el … por …: motivo» y **Ver** en solo lectura. **No se deshace**: no hay Recuperar. Los documentos de la ficha no se anulan desde aquí. Si el documento anulado había reemplazado a la copia de la ficha, la de la ficha **no vuelve a verse como Vigente**: el documento queda Faltante y se pide el correcto.

**2. Escenarios ágiles de ejecución**

*Anular con doble paso*

- **Dado que** RR.HH. cargó por error el carnet de otra persona
- **Cuando** escribe el motivo y confirma «Sí, anular»
- **Entonces** el carnet aparece en Anulados con su motivo, y el documento de identidad vuelve a estar Faltante

**3. Condiciones y excepciones**

- «Días en la papelera» ya no existe en Notificaciones y tipos de documento.
- La anulación queda en la bitácora: «Anuló el documento: motivo».
- Anular no es para lo que solo quedó viejo: el primer paso lo dice y lleva a «Subir nueva versión», que lo deja como «Reemplazada» —BR‑DOC‑012—.
- Al terminar, «Documento anulado con éxito», con un solo botón: Cerrar.
- Al ver el documento, sus anulados siguen en el Historial, tachados, con quién y el motivo; no en los documentos que admiten varios.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑060 · RF‑DOC‑067 · RF‑DOC‑070
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

Subir, aprobar, rechazar, anular, emitir, descargar para imprimir, subir un firmado, entregar, registrar y renovar contratos, atender solicitudes, exportar y cambiar la configuración dejan una entrada: **quién, cuándo, qué y sobre quién**. La bitácora no se edita ni se borra.

**2. Escenarios ágiles de ejecución**

*La aprobación deja rastro*

- **Dado que** RR.HH. aprueba un carnet
- **Cuando** se abre el Historial de esa persona
- **Entonces** está la entrada con el nombre de quien aprobó y la fecha

**3. Condiciones y excepciones**

- El Historial de cada persona es su parte de la bitácora.
- Se filtra por Documentos, Recibidos, Contratos y Solicitudes.
- Lo exonerado o confirmado antes de la 1.2 sigue en la bitácora.

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

Descargar el expediente baja un **ZIP** con un **índice** y una carpeta por tipo, más los recibidos —cada emitido con **su firmado** al lado, con el mismo número— y los contratos. La descarga queda en la bitácora.

**2. Escenarios ágiles de ejecución**

*Descargar para una auditoría*

- **Dado que** un auditor pide el expediente de alguien
- **Cuando** RR.HH. pulsa «Descargar expediente»
- **Entonces** baja un ZIP con «00 Índice.txt» y sus carpetas

**3. Condiciones y excepciones**

- También se descarga un expediente cerrado.
- Cada documento va con su versión actual.
- Varios expedientes a la vez se bajan desde Expedientes › Exportar —BR‑DOC‑063—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑010
- **Historia de usuario:** HU‑DOC‑05
- **Pantalla:** W‑DOC‑02 Expediente
- **Diseño:** Prototipado

#### 4.63 · BR-DOC-063 · La lista de expedientes se exporta tal como se ve, sin confidenciales en el ZIP

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-063
- **Grupo:** El rastro
- **Qué gobierna:** Expediente
- **Antes:** Nueva (1.2) · RF‑83
- **Estado:** Borrador

*Descripción general*

**Exportar** baja a las personas que deja pasar la vista —búsqueda, filtros, estado y Activos/Desvinculados—, **de todas las páginas**. **Expedientes en ZIP** arma una carpeta por persona con su índice y **deja fuera lo confidencial**: el índice dice qué quedó fuera. **Lista en Excel** arma una fila por persona con su avance y lo que tiene pendiente, y la primera línea dice los filtros. Las dos descargas quedan en la bitácora.

**2. Escenarios ágiles de ejecución**

*Descargar una sucursal*

- **Dado que** en Expedientes se eligió «Activos» y la sucursal Casa Matriz Equipetrol, y hay 20 personas en dos páginas
- **Cuando** se pulsa Exportar › Expedientes en ZIP
- **Entonces** pregunta «¿Descargar 20 expedientes?» con «Activos de Casa Matriz Equipetrol, de todas las páginas» y, al descargar, baja un ZIP con 20 carpetas

**3. Condiciones y excepciones**

- El ZIP pide una confirmación corta, con Cancelar y Descargar; la lista en Excel baja directo.
- En la lista, un desvinculado dice «Expediente cerrado» y no suma pendientes —BR‑DOC‑006—.
- Cada expediente del ZIP sigue la forma de BR‑DOC‑021.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑063
- **Historia de usuario:** HU‑DOC‑19
- **Pantalla:** W‑DOC‑01 Expedientes
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

*Uno vigente por persona; renovar es registrar uno nuevo*

#### 4.24 · BR-DOC-024 · Un contrato se registra desde Emitir y vive en el expediente

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-024
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** v0.2 · ABIERTA‑03 · 1.1 (cambia)
- **Estado:** Borrador

*Descripción general*

Los contratos se **registran desde Emitir**, para una sola persona, generados desde una plantilla o subiendo el firmado; desde la carpeta Contratos del expediente, «Registrar un contrato nuevo» abre lo mismo. Quedan en la carpeta **Contratos**, con su número. Desde la 1.2 ya no se registran adendas.

**2. Escenarios ágiles de ejecución**

*Registrar un contrato*

- **Dado que** se elige «Contrato a plazo fijo» en Emitir
- **Cuando** se elige a una persona y se ponen las fechas
- **Entonces** queda en su carpeta Contratos, «Sin firma» hasta que se suba el firmado

**3. Condiciones y excepciones**

- Un contrato es de una sola persona.
- No hay grupo en Emitir para un contrato.
- «Descargar para imprimir» baja un Word con las líneas de firma de la empresa y de la persona.

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
- Renovar desde la ficha del contrato ya decide: el nuevo reemplaza al anterior —BR‑DOC‑062—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑020
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.27 · BR-DOC-027 · Una adenda necesita su contrato y no empieza antes que él

*Estado: Retirada en la 1.2*

**1. Información básica**

- **Código:** BR-DOC-027
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** RN‑19
- **Estado:** Retirada en la 1.2

*Descripción general*

**Retirada en la 1.2: las adendas ya no se crean.** La plantilla de adenda no se ofrece en Emitir y la ficha del contrato ya no tiene «Renovar con adenda»: renovar es registrar un contrato nuevo —BR‑DOC‑062—. Las adendas que ya existen **se muestran como historial**, en la cadena de su contrato, y la que amplió el plazo sigue diciendo «ampliado al …».

**2. Escenarios ágiles de ejecución**

*Una adenda de antes se sigue viendo*

- **Dado que** un contrato se amplió con una adenda antes de la 1.2
- **Cuando** se abre su ficha
- **Entonces** el fin dice «ampliado al …» y la adenda está en «Contrato y adendas», pero no hay cómo registrar otra

**3. Condiciones y excepciones**

- El fin que vale sigue siendo el de la última adenda —BR‑DOC‑028—.
- El colaborador ve sus adendas de antes en Contratos.

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
- **Entonces** está Por vencer, dice «Decida si lo renueva o lo deja terminar» y ofrece «Renovar contrato»

**3. Condiciones y excepciones**

- Si tiene adendas de antes, el fin que vale es el de la última.
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
- El aviso aparece en Emitir, en la ficha del contrato y en «Renovar contrato» cuando se elige Plazo fijo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑023
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑05 Contrato
- **Diseño:** Prototipado

#### 4.62 · BR-DOC-062 · Renovar un contrato es registrar uno nuevo que reemplaza al anterior

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-062
- **Grupo:** Los contratos
- **Qué gobierna:** Contrato
- **Antes:** Nueva (1.2) · reemplaza a BR‑DOC‑027
- **Estado:** Borrador

*Descripción general*

**Renovar contrato** registra **siempre un contrato nuevo**, a plazo fijo o indefinido, que **reemplaza** al anterior. El anterior queda «Reemplazado», con sus versiones. El nuevo rige por defecto desde el día siguiente al fin vigente, y antes de registrarlo se ve la vista previa con su número. El botón va adelante solo cuando el contrato está por vencer o vencido.

**2. Escenarios ágiles de ejecución**

*Renovar un plazo fijo que vence*

- **Dado que** un plazo fijo termina el 30 de octubre y está Por vencer
- **Cuando** se pulsa «Renovar contrato», se elige Plazo fijo hasta el 30 de abril y se confirma
- **Entonces** se registra un contrato nuevo del 31 de octubre al 30 de abril, el anterior queda Reemplazado y el modal ofrece «Descargar para imprimir» e «Ir al contrato»

**3. Condiciones y excepciones**

- Indefinido no pide «Hasta».
- El fin tiene que ser posterior al inicio —BR‑DOC‑025—.
- Si ya encadena dos o más plazos fijos, avisa y deja seguir —BR‑DOC‑029—.
- El contrato nuevo nace sin firma: se descarga, se imprime, se hace firmar y se sube el firmado.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑021
- **Historia de usuario:** HU‑DOC‑06
- **Pantalla:** W‑DOC‑05 Contrato
- **Diseño:** Prototipado

### Emitir

*Cómo se genera un documento para una persona y cómo queda firmado*

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
- Las plantillas de Souly no aparecen en Emitir: se usan como base de una de la empresa —BR‑DOC‑065—.

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

Al emitir para varias personas, a quien le falta un dato que la plantilla usa se le marca **«No sale»** y se dice por qué; **los demás salen**. Un envío a varios queda como un solo envío con su avance: «Con el firmado subido: x de y».

**2. Escenarios ágiles de ejecución**

*Uno no frena a todos*

- **Dado que** se emite una felicitación a 7 personas y a una le falta el cargo
- **Cuando** se pulsa «Emitir 6 documentos»
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
- La sigla y los dígitos se cambian en Notificaciones y tipos de documento.

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
- Antes de emitir, a una sola persona, el texto se puede editar solo para ese documento —BR‑DOC‑061—; después de emitido, queda congelado igual.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑033
- **Historia de usuario:** HU‑DOC‑08
- **Pantalla:** W‑DOC‑08 Documentos emitidos
- **Diseño:** Prototipado

#### 4.36 · BR-DOC-036 · Emitir guarda el documento sin firmar; vale cuando se sube el firmado

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-036
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** REP‑05 · 1.1 (cambia: antes, emitir era entregar)
- **Estado:** Borrador

*Descripción general*

Desde la 1.2, **emitir no envía nada al colaborador**. El documento se genera y queda en su expediente, en la carpeta de **su tipo** dentro de **De RR.HH.** —Certificados, Memorándums, Constancias—, **«Sin firmar»**, sin que nadie lo archive. RR.HH. lo **descarga para imprimir** —un .doc de Word con formato de hoja—, lo hace firmar a mano y **sube el firmado**, que queda pegado a ese emitido, con el mismo número. Con el firmado subido, el documento queda listo y **el colaborador lo ve** en su carpeta, sin aviso.

**2. Escenarios ágiles de ejecución**

*Se emite, se firma y se sube*

- **Dado que** se emite un certificado de trabajo para Carlos
- **Cuando** RR.HH. lo descarga para imprimir, lo hace firmar y pulsa «Subir el firmado»
- **Entonces** el certificado pasa de «Sin firmar» a «Firmado» en su carpeta Certificados y Carlos lo ve en su app

**3. Condiciones y excepciones**

- Lo que nace de una **solicitud** sigue la misma regla: un certificado o una corrección se generan sin enviar y se entregan firmados en persona; sólo una **copia** de algo que ya tiene le llega por la app —BR‑DOC‑040—.
- **Un archivo propio** (reglamento, comunicado) sigue enviándose: le llega al emitirlo y va a «Otros», que aparece solo cuando tiene algo.
- Un contrato queda en Contratos, «Sin firma» hasta que se sube su firmado.
- Al abrir un emitido con firmado se ve el escaneado; «El que generó el sistema» muestra el texto original.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑064 · RF‑DOC‑039
- **Historia de usuario:** HU‑DOC‑08
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

#### 4.37 · BR-DOC-037 · Confirmar la recepción es una vez y no se deshace

*Estado: Retirada en la 1.2*

**1. Información básica**

- **Código:** BR-DOC-037
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** RF‑55
- **Estado:** Retirada en la 1.2

*Descripción general*

**Retirada en la 1.2: ya no se pide confirmar la recepción**, en todo el módulo. No hay «Pedir que confirme la recepción» al emitir, ni columna «Confirmación», ni «Recordar», ni «Sin confirmar» o «Confirmado» en Documentos emitidos, ni «Confirmar que lo recibí» del lado del colaborador, en la web o en el celular. Lo que se había confirmado antes **se ve como Entregado**. La constancia es ahora el firmado que sube RR.HH. —BR‑DOC‑036—.

**2. Escenarios ágiles de ejecución**

*Un memorándum se lee y nada más*

- **Dado que** alguien tiene un memorándum en su carpeta
- **Cuando** lo abre desde el celular
- **Entonces** ve la hoja y «Reportar un error», y no hay nada que confirmar

**3. Condiciones y excepciones**

- Lo confirmado antes queda en la bitácora.
- Las carpetas de «De RR.HH.» ya no cuentan «sin confirmar»: dicen cuántos documentos tienen.

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

#### 4.61 · BR-DOC-061 · Editar un documento antes de emitirlo cambia solo ese documento

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-061
- **Grupo:** Emitir
- **Qué gobierna:** Emitido
- **Antes:** Nueva (1.2)
- **Estado:** Borrador

*Descripción general*

Con **una sola persona** elegida, y si no es un contrato, **Editar documento** vuelve editable toda la hoja **solo para esa emisión**: quién firma, un dato que cambió. La plantilla y la ficha no cambian. Se guarda ese texto tal cual, el emitido queda marcado como **editado** y la bitácora lo dice.

**2. Escenarios ágiles de ejecución**

*Firma otra persona*

- **Dado que** el gerente que firma los certificados está de viaje
- **Cuando** RR.HH. elige a Carlos, pulsa «Editar documento», cambia el firmante y emite
- **Entonces** el certificado sale con ese texto, la plantilla queda igual y la bitácora dice «con el texto editado para este documento»

**3. Condiciones y excepciones**

- No se puede con varias personas ni en contratos.
- «Volver a la plantilla» descarta lo editado.
- Una vez emitido, el texto queda congelado como cualquier otro —BR‑DOC‑035—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑065
- **Historia de usuario:** HU‑DOC‑07
- **Pantalla:** W‑DOC‑09 Emitir
- **Diseño:** Prototipado

### Las solicitudes

*Lo que pide el colaborador y cómo se responde*

#### 4.39 · BR-DOC-039 · Una solicitud se responde dentro del plazo configurado, en días hábiles

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-039
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** v0.2 · Solicitudes · 1.1 (cambia)
- **Estado:** Borrador

*Descripción general*

Cada pedido tiene un **plazo en días hábiles** desde que se hizo, sin sábados ni domingos. El plazo lo configura RR.HH. en **Notificaciones y tipos de documento › Solicitudes** —de 1 a 30 días; 2 por defecto—. **Cada pedido guarda el plazo con que se hizo**: si RR.HH. lo cambia después, no cambia lo que ya se le prometió a quien pidió. Lo atrasado se ve primero y en rojo.

**2. Escenarios ágiles de ejecución**

*El fin de semana no cuenta*

- **Dado que** alguien pide un certificado el viernes
- **Cuando** se calcula el plazo
- **Entonces** vence el martes

**3. Condiciones y excepciones**

- Al pedir, el colaborador lee «RR.HH. le responde dentro de N días hábiles: a más tardar el …»; después, en su pedido, «Responde hasta el …».
- Los pedidos de antes de la 1.2, sin plazo guardado, usan los 2 días de siempre.
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

No hay «Aprobar»: un **certificado** se genera, una **corrección** se genera de nuevo y anula la anterior, una **copia** se elige y se envía. Desde la 1.2, un certificado o una corrección **no se envían**: quedan «Sin firmar», RR.HH. los descarga, los hace firmar y los **entrega en persona** —BR‑DOC‑036—; una copia de algo que ya tiene sí le llega por la app. Al atender, la solicitud guarda **qué documento la resolvió** y el colaborador lo abre desde su pedido.

**2. Escenarios ágiles de ejecución**

*El pedido guarda su documento*

- **Dado que** se atiende el pedido de un certificado
- **Cuando** RR.HH. pulsa «Generar certificado»
- **Entonces** el pedido queda Atendido, el certificado queda «Sin firmar» con «Descargar para imprimir», y la nota le dice al colaborador que lo recibe firmado en RR.HH.

**3. Condiciones y excepciones**

- Una copia puede ser de un contrato, de algo que recibió o de su expediente.
- Desde cualquier pedido se pasa al anterior o al siguiente pendiente con la navegación de la cabecera.

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
- **Cuando** RR.HH. corrige la ficha y pulsa «Generar el corregido»
- **Entonces** el nuevo queda «Sin firmar» para imprimir y entregar en persona, y el anterior queda Anulado

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

- Se crea desde la lista de tipos del editor, sin ventana aparte, o con «+ Nuevo tipo de documento» en la tabla de Notificaciones y tipos de documento —BR‑DOC‑052—.
- Desde el editor, su numeración empieza con 4 dígitos y reinicio anual; desde la tabla, se eligen.

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

Una plantilla **activa** aparece en Emitir; una **inactiva** no, y sirve de **borrador**: se puede guardar a medias. Una plantilla nueva se guarda de dos modos: **Guardar borrador** la deja inactiva sin validarla, y **Guardar y activar** la valida y la pone en Emitir. Solo al guardar una plantilla activa se **valida**: que no esté vacía, que cada dato exista y que la persona de prueba los tenga.

**2. Escenarios ágiles de ejecución**

*Guardar a medias*

- **Dado que** una plantilla nueva tiene un dato mal escrito
- **Cuando** se pulsa «Guardar borrador»
- **Entonces** se guarda inactiva y no aparece en Emitir; con «Guardar y activar», no se guarda y se dice qué dato falla

**3. Condiciones y excepciones**

- En una nueva no aparece el interruptor «Activa»: lo decide el botón con que se guarda.
- En una que ya existe siguen «Guardar cambios» y el interruptor «Activa».
- No hay paso de aprobación: «Necesita aprobación» se quitó en la 1.3.
- Duplicar crea la copia inactiva.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑045 · RF‑DOC‑074
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

#### 4.47 · BR-DOC-047 · Las plantillas que vienen con el sistema se editan y vuelven a su texto original

*Estado: Retirada en la 1.3*

**1. Información básica**

- **Código:** BR-DOC-047
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** RF‑50 (cambia)
- **Estado:** Retirada en la 1.3

*Descripción general*

**Retirada en la 1.3: las plantillas que vienen con el sistema ya no se editan.** Ahora son las **plantillas de Souly**, un catálogo de referencia que se usa como base —BR‑DOC‑065—. «Volver al texto original» sigue en las copias hechas desde Souly y las devuelve al texto de Souly.

**2. Escenarios ágiles de ejecución**

*Lo que se usaba sigue siendo de la empresa*

- **Dado que** el «Certificado de trabajo» se editó y se emitió antes de la 1.3
- **Cuando** RR.HH. abre Plantillas
- **Entonces** está en «Mis plantillas» con sus emitidos, y el de Souly está aparte, sin cambios

**3. Condiciones y excepciones**

- Las siete plantillas que se usaban pasan a «Mis plantillas»: Emitir, las adendas de antes y las solicitudes siguen funcionando.
- Resuelve ABIERTA‑DOC‑11: queda como pedía RF‑50, sin editar las de Souly.

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

- Las de Souly no se eliminan: no son de la empresa.
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

#### 4.65 · BR-DOC-065 · Las plantillas de Souly son un catálogo: se ven y se usan como base

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-065
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** Nueva (1.3) · reemplaza a BR‑DOC‑047 · RF‑50
- **Estado:** Borrador

*Descripción general*

Las plantillas que vienen con el sistema son las **plantillas de Souly**: un **catálogo de referencia** que mantiene Souly. **No se emiten, no se editan y no tienen estado** Activo o Inactivo. Cada una tiene **Ver**, que abre su texto, y **Usar**, que abre el editor con ella cargada como **una plantilla nueva de la empresa**, con el nombre «… (copia)», para que se entienda que la de Souly no cambia. Nada se crea hasta guardar. La copia guarda de cuál salió, lleva la etiqueta «De Souly», y «Volver al texto original» la devuelve al texto de Souly.

**2. Escenarios ágiles de ejecución**

*Usar el certificado de Souly*

- **Dado que** en Plantillas de Souly está el «Certificado de trabajo»
- **Cuando** RR.HH. pulsa «Usar» y después «Guardar y activar»
- **Entonces** aparece en «Mis plantillas» como «Certificado de trabajo (copia)», con «Desde Souly», y sale en Emitir; el de Souly sigue igual

**3. Condiciones y excepciones**

- Si ya hay una «(copia)», la siguiente se llama «(copia 2)», «(copia 3)»…
- Cerrar el editor sin guardar no deja nada.
- Con «Activos» o «Inactivos» solo se ven las de la empresa.
- Las siete plantillas que se usaban hasta la 1.2 pasan a «Mis plantillas», con sus emitidos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑072
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑10 Plantillas · W‑DOC‑11 Editor
- **Diseño:** Prototipado

#### 4.66 · BR-DOC-066 · Una plantilla se trae de un Word: cada marcador entre corchetes es un dato

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-066
- **Grupo:** Las plantillas
- **Qué gobierna:** Plantilla
- **Antes:** Nueva (1.3)
- **Estado:** Borrador

*Descripción general*

**Descargar plantilla** baja un Word con el texto de la hoja y cada dato de la persona como **marcador entre corchetes**, con su nombre en mayúsculas —[NOMBRE COMPLETO], [CARGO], [HABER BÁSICO]—, resaltado en amarillo. Se completa en Word y se sube con **Subir plantilla**, o varios a la vez con **Cargar plantillas**: cada marcador se convierte en su dato. El reconocimiento es **tolerante**: no importan mayúsculas, tildes, guiones, puntos, paréntesis ni espacios de más, y entiende los sinónimos comunes. Lo que no coincide **se revisa antes de cargar**. Del Word se toma **solo el texto**.

**2. Escenarios ágiles de ejecución**

*Un marcador que no se reconoce*

- **Dado que** un Word dice [SUELDO] y [FECHA INI]
- **Cuando** se sube con «Subir plantilla»
- **Entonces** [SUELDO] queda como Haber básico y se abre «Revise estos marcadores» con [FECHA INI], un pedazo del texto donde aparece y «¿Quiso decir…? Inicio del contrato» ya elegido

**3. Condiciones y excepciones**

- Sinónimos: [SUELDO], [SALARIO] o [HABER] son Haber básico; [CI] o [CARNET], Número de documento; [FECHA DE INICIO], Inicio del contrato; también se reconocen [FECHA FIN], [EMPRESA], [CITE] y [FECHA].
- En «Revise estos marcadores» se puede elegir otro dato o «Dejarlo como texto, tal como está escrito». «Cargar la plantilla» aplica; «Cancelar» no cambia nada.
- Los `{{#si …}}` van y vuelven sin tocarse.
- La lista de marcadores del final del Word se ignora al subir.
- Con la hoja vacía, «Descargar plantilla» baja un texto de partida según el tipo.
- Membrete, logo, tablas y negritas no se conservan: el diseño lo pone la hoja al emitir.
- En «Cargar plantillas», «Guardar como borradores» guarda siempre y deja lo pendiente como texto; «Guardar y activar» solo se puede sin pendientes.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑073 · RF‑DOC‑075 · RF‑DOC‑076
- **Historia de usuario:** HU‑DOC‑10
- **Pantalla:** W‑DOC‑11 Editor · W‑DOC‑19 Cargar plantillas
- **Diseño:** Prototipado

### Notificaciones y tipos de documento

*Los valores de la empresa*

#### 4.50 · BR-DOC-050 · Los avisos de vencimiento valen para todos, salvo excepción

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-050
- **Grupo:** Notificaciones y tipos de documento
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
- **Pantalla:** W‑DOC‑12 Notificaciones y tipos de documento
- **Diseño:** Prototipado

#### 4.51 · BR-DOC-051 · El fin de un contrato se avisa con anticipación

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-051
- **Grupo:** Notificaciones y tipos de documento
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
- **Pantalla:** W‑DOC‑12 Notificaciones y tipos de documento
- **Diseño:** Prototipado

#### 4.52 · BR-DOC-052 · Cada tipo necesita su sigla, y el próximo número se ve antes de guardar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-052
- **Grupo:** Notificaciones y tipos de documento
- **Qué gobierna:** Parámetros
- **Antes:** RF‑07
- **Estado:** Borrador

*Descripción general*

En **Tipos de documento**, cada tipo tiene **sigla**, **dígitos** y si **reinicia cada año**. Sin sigla no se guarda. La tabla muestra el **próximo número** con los cambios todavía sin guardar. Al final, **+ Nuevo tipo de documento** agrega una fila con nombre, sigla —propuesta sola—, dígitos y reinicio, con el próximo número en vivo; no deja crear un nombre ni una sigla que ya existan, y el tipo se crea al momento, con su carpeta en «De RR.HH.».

**2. Escenarios ágiles de ejecución**

*Ver el próximo número*

- **Dado que** se cambia la sigla de Certificado a CER
- **Cuando** se mira la tabla
- **Entonces** el próximo número dice CER‑0007/2026

**3. Condiciones y excepciones**

- Hasta 8 dígitos.
- Todos los cambios de la página se guardan con un solo «Guardar cambios»; un tipo nuevo, en cambio, se guarda al pulsar «Crear».
- La sigla nueva necesita al menos dos letras.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑DOC‑049 · RF‑DOC‑068
- **Historia de usuario:** HU‑DOC‑11
- **Pantalla:** W‑DOC‑12 Notificaciones y tipos de documento
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

- Ve sus contratos y lo que RR.HH. le entregó.
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

*Recibidos y solicitudes*

#### 4.57 · BR-DOC-057 · Recibe lo que ya está listo; lo anulado desaparece

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-DOC-057
- **Grupo:** Lo que recibe y lo que pide
- **Qué gobierna:** Emitido
- **Antes:** REP‑05 · 1.1 (cambia)
- **Estado:** Borrador

*Descripción general*

En «De RR.HH.» la persona ve lo que se le **entregó**, en una carpeta por tipo: Certificados, Memorándums y los tipos de la empresa. Entregado es lo emitido **con el firmado subido**, las copias que pidió y los archivos propios que se le enviaron; lo **sin firmar** todavía no se ve, tampoco si lo pidió en una solicitud. «Otros» aparece solo si tiene algo. Lo **anulado** ya no se ve.

**2. Escenarios ágiles de ejecución**

*Un anulado se va*

- **Dado que** a alguien le anularon un certificado
- **Cuando** abre Certificados
- **Entonces** ese certificado no está

**3. Condiciones y excepciones**

- Cada carpeta dice cuántos documentos tiene.
- «Otros» no es un tipo creado: aparece solo con un archivo propio enviado.
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
- **Entonces** se crea una corrección con ese certificado, y RR.HH. tiene el plazo configurado para responder

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
| **Requisito personal** | Lo que RR.HH. le agregó a una persona antes de la 1.2; ya no se crean | persona, subtipo, obligatorio, plazo, por, fecha |
| **Exoneración** | La liberación de un requisito, antes de la 1.2; ya no se crean | persona, subtipo, motivo, por, fecha |
| **Documento** | Un papel de una persona | persona, subtipo, versiones, anulado (fecha, por, motivo; la clave interna sigue siendo «eliminado»), origen (ficha) |
| **Versión del documento** | Cada archivo de un documento | archivo, emisión, vencimiento, subido por, canal (web, app, ficha), revisión (pendiente, aprobado, rechazado), motivo de rechazo, motivo de cambio, revisado por |
| **Sin clasificar** | Un archivo que no se reconoció | persona, tipo, archivo, fecha, por |
| **Pedido** | Cuándo se le pidió un documento a alguien | persona y subtipo → fecha |
| **Contrato** | Un contrato; las adendas son solo las de antes de la 1.2 | persona, tipo (contrato, adenda), contrato origen, modalidad, inicio, fin, plantilla, número, gestión, versiones (generado, firmado, con su archivo), finalizado, reemplazado |
| **Plantilla** | El texto de un documento que se emite; las de Souly son el catálogo de referencia | nombre, tipo, el colaborador la puede pedir, confidencial, activa (las de Souly no tienen), de Souly (origen: si es del catálogo o de cuál salió una copia), tamaño de hoja, versiones |
| **Emitido** | Un documento hecho para una persona | plantilla o archivo propio, tipo, persona, versión de la plantilla, número, gestión, fecha, por, estado, entregas, datos y texto congelados, editado (si el texto se cambió solo para él), firmado (archivo, fecha, por), lote, anulado. La confirmación y los recordatorios de antes quedan guardados y no se usan |
| **Lote de emisión** | Un envío a varias personas | nombre, plantilla, fecha, por, emitidos |
| **Solicitud** | Un pedido del colaborador | tipo (certificado, copia, corrección), persona, fecha, asunto, detalle, estado, canal, resuelto (fecha, por, nota, documento que lo resolvió) |
| **Parámetros** | Los valores de la empresa | avisos encendidos, días de aviso, destinatarios, canales, resumen, aviso de fin de contrato, numeración por tipo, tipos propios |
| **Bitácora** | Lo que pasó | fecha, hora, usuario, acción, entidad, persona, detalle |

### 5.2 Lo que se guarda y lo que se deduce

| Dato | Cómo se obtiene |
| --- | --- |
| Estado de un documento | De la revisión, el vencimiento y la ventana de aviso —BR‑DOC‑007— |
| Lo que se le exige a alguien | Lo exigido a todos más lo personal, menos lo exonerado —BR‑DOC‑003— |
| Avance del expediente | Cumplidos sobre obligatorios exigibles —BR‑DOC‑004— |
| Estado de un contrato | De sus fechas y, si tiene adendas de antes, de la última; solo finalizado y reemplazado se guardan —BR‑DOC‑028— |
| Siguiente número | Contando los emitidos de la serie en la gestión —BR‑DOC‑033— |
| Plazo de una solicitud | Dos días hábiles desde la fecha del pedido —BR‑DOC‑039— |
| Origen de un emitido | Individual, lote o solicitud, de sus vínculos |
| Los documentos de la ficha | Se leen de la ficha cada vez; no se copian —BR‑DOC‑002— |
| Firmado o sin firmar | Si el emitido tiene su firmado subido —BR‑DOC‑036— |

### 5.3 Las variables de las plantillas

Las plantillas usan veinte datos en cinco grupos, con su origen:

| Grupo | Datos | Sale de |
| --- | --- | --- |
| **Colaborador** | Nombre completo, número de documento, código, correo corporativo | Gestión de personas |
| **Puesto** | Cargo, unidad organizacional, sucursal, ciudad de la sucursal | Organización |
| **Relación laboral** | Fecha de ingreso, antigüedad, haber básico, modalidad, inicio y fin del contrato | Gestión de personas y Planillas |
| **Empresa** | Razón social, NIT, representante legal | Organización |
| **Documento** | Número, fecha de emisión, texto que se escribe al emitir | Este módulo |

En un Word, cada dato se escribe como marcador entre corchetes con su nombre en mayúsculas —[NOMBRE COMPLETO], [CARGO]—, y se reconocen sinónimos comunes como [SUELDO] o [CI] —BR‑DOC‑066—.

### 5.4 El emitido y sus datos congelados

Al emitir se guardan **los datos y el texto ya rellenado** —o el texto editado solo para ese documento—: si mañana cambia la ficha o la plantilla, el documento dice lo mismo —BR‑DOC‑035—. Un emitido pasa por: **Sin firmar → Entregado**, cuando se sube el firmado, o **Anulado** en cualquier momento, con motivo. Lo que resuelve una solicitud y los archivos propios nacen **Entregados**. Lo que se confirmó antes de la 1.2 se ve como Entregado.

> **En la maqueta:** todo se guarda en el navegador; los archivos subidos y los firmados, en el navegador de quien los subió. El haber básico sale de una tabla de ejemplo por unidad.

## 06 · Roadmap

*Cómo se llega de la maqueta a producción, en qué orden y con qué decisiones pendientes.*

### 6.1 Camino a desarrollo

La maqueta es la referencia de pantallas y comportamiento; este documento, la de reglas. Lo que la maqueta todavía no hace está marcado en cada pantalla y reunido en el anexo del prototipo.

### 6.2 Cuatro entregas

| Entrega | Qué incluye |
| --- | --- |
| **1 · El expediente** | Tipos y subtipos, requisitos, estados, expediente por carpetas, subir, versiones, anular, bitácora, exportar y la lectura de la ficha |
| **2 · Revisar y lo urgente** | Revisar documentos, Expedientes con «Qué atender hoy», pedir renovación y Mis documentos del colaborador con su subida |
| **3 · Emitir** | Plantillas y editor, tipos propios, numeración, Emitir para una o varias personas, descargar para imprimir y subir el firmado, Documentos emitidos y contratos con su renovación |
| **4 · Solicitudes y avisos** | Pedir y Mis solicitudes, Solicitudes y Atender, y el envío real de avisos, recordatorios y resumen por Comunicación |

### 6.3 Hitos

| Hito | Se cumple cuando |
| --- | --- |
| **Primer expediente completo** | Una persona llega al 100 % con documentos aprobados |
| **Primer documento firmado** | RR.HH. sube el firmado de un certificado emitido y el colaborador lo ve en su app |
| **Primera solicitud atendida a tiempo** | Un pedido se resuelve dentro del plazo configurado |

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
| ABIERTA‑DOC‑04 | **Resuelta en la 1.3:** se quitó. Las plantillas no piden aprobación: lo emitido se genera, se imprime y se firma a mano —BR‑DOC‑045— | v0.2 · ABIERTA‑04 |
| ABIERTA‑DOC‑05 | ¿La subida de documentos de una ruta de Onboarding va al expediente? | Nueva |
| ABIERTA‑DOC‑06 | **Resuelta en la 1.2:** no hay a quién recordar; ya no se pide confirmar la recepción —BR‑DOC‑037— | v0.2 · ABIERTA‑02 |
| ABIERTA‑DOC‑07 | Dar de alta en el directorio a los colaboradores de la app de ejemplo | v0.2 · ABIERTA‑05 |
| ABIERTA‑DOC‑08 | Boletas de pago como recibido, cuando exista Planillas | v0.2 · ABIERTA‑06 |
| ABIERTA‑DOC‑09 | El tamaño carta u oficio, ¿se aplica también al descargar e imprimir lo emitido? Hoy «Descargar para imprimir» baja siempre en carta | Nueva |
| ABIERTA‑DOC‑10 | **Resuelta en la 1.2:** no hay papelera; un documento se anula y queda en Anulados —BR‑DOC‑018— | RF‑89 |
| ABIERTA‑DOC‑11 | **Resuelta en la 1.3:** las de Souly no se editan, como pedía RF‑50; son un catálogo que se usa como base —BR‑DOC‑065— | RF‑50 |
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
2. «Subir documento» arriba pregunta «¿En qué carpeta va el documento?»; las carpetas con «Falta N» llevan punto rojo. O se abre la carpeta y «Subir» en la fila del faltante.
3. Desde la cabecera, a la izquierda del modal se elige el documento; desde la fila, el modal ya trae ese solo. Se arrastra el archivo, se mira la «Revisión del archivo» y se ponen la emisión y el vencimiento.
4. Si ya tenía uno, se ven el actual y el nuevo lado a lado: «Sí, reemplazar». El actual queda como versión anterior.

### 7.4 Anular un documento cargado por error

1. En la carpeta, el menú de la fila › «Anular».
2. Si solo hay una versión más nueva, «Use «Subir nueva versión»» lleva a reemplazar: el actual queda como versión anterior, sin anularlo.
3. Si de verdad estaba mal, se escribe por qué y «Sí, anular» en la segunda confirmación.
4. «Documento anulado con éxito» y «Cerrar». El documento va a Anulados con su motivo y vuelve a quedar faltante, aunque la ficha tenga su copia: se sube el correcto.

### 7.5 Emitir un certificado y subir el firmado

1. En Documentos emitidos, «Emitir documento».
2. En el riel, Certificados › Certificado de trabajo: la hoja de ejemplo aparece al centro.
3. En «Para quién» se busca a la persona y se marca: la hoja se llena con sus datos. Si hay que cambiar algo solo en este documento, «Editar documento».
4. «Emitir para {nombre}»: queda en su carpeta Certificados, dentro de «De RR.HH.», «Sin firmar».
5. «Descargar para imprimir», se imprime y se hace firmar.
6. «Subir el firmado» —ahí mismo, en el detalle del documento o desde la carpeta Certificados del expediente—: queda «Firmado» y el colaborador lo ve en su app.

### 7.6 Emitir un memorándum para varias personas

1. En Emitir, Memorándums › Felicitación.
2. En «Para quién» se filtra por unidad organizacional y «Marcar los N que se ven».
3. Se escribe el motivo en el recuadro de la hoja.
4. «Emitir N documentos»: cada uno con su número, sin firmar; quien tiene un dato vacío no sale y se dice.
5. En el detalle del envío, «Descargar todos»; cada firmado se sube desde su documento. El avance dice «Con el firmado subido: x de y».

### 7.7 Renovar un contrato a plazo fijo

1. «Qué atender hoy» › «Ver contratos», o el contrato desde el expediente.
2. En la ficha del contrato, por vencer o vencido, «Renovar contrato».
3. Se elige Plazo fijo o Indefinido; «Desde» viene en el día siguiente al fin; se pone «Hasta», si es plazo fijo. A la derecha se ve el contrato nuevo con su número.
4. «Renovar contrato»: se registra el nuevo y el anterior queda Reemplazado.
5. «Descargar para imprimir», se hace firmar e «Ir al contrato» para subir el firmado.

### 7.8 Atender una solicitud

1. En Solicitudes, la más atrasada está primero; «Ver detalle».
2. Certificado: se elige la plantilla y «Generar certificado»; se descarga para imprimir, se hace firmar y se entrega en persona. Corrección: «Generar el corregido», anulando el anterior, y lo mismo. Copia: se elige el documento y «Enviar copia».
3. O «Rechazar…» con un motivo.
4. «Siguiente ›», arriba a la derecha, lleva al próximo pendiente.

### 7.9 Crear una plantilla con un tipo nuevo

1. En Configuración › Plantillas, «Nuevo modelo»: abre el editor. O, en una de Souly, «Usar»: abre su texto como «… (copia)».
2. Nombre; Tipo › «+ Crear un tipo nuevo»: nombre, color, y «Crear».
3. Se escribe sobre la hoja y se tocan los datos para insertarlos.
4. «Vista previa» para verla en páginas; «Guardar borrador» si queda a medias, o «Guardar y activar» para que salga en Emitir.

### 7.10 Cargar plantillas desde Word

1. En el editor, «Descargar plantilla»; o en Plantillas › «Cargar plantillas», en «¿Todavía no tiene la plantilla?», se elige el tipo y «Descargar plantilla modelo».
2. Se completa en Word, con los datos como marcadores entre corchetes: [NOMBRE COMPLETO], [CARGO].
3. En «Cargar plantillas» se sueltan uno o varios Word: cada uno da una fila con su nombre, su tipo y cuántos datos se reconocieron.
4. Si dice «N marcadores por revisar», «Revisar»: se deja el dato propuesto, se elige otro o se deja como texto, y «Cargar la plantilla».
5. «Guardar y activar», o «Guardar como borradores» si algo queda pendiente. La lista se filtra en «Mis plantillas».

### 7.11 Cambiar los avisos y los tipos de documento

1. En Configuración › Notificaciones y tipos de documento.
2. Se cambian los días, a quién y por dónde, o la sigla de un tipo.
3. Arriba aparece «N cambios sin guardar»; «Guardar cambios» o «Descartar».
4. Para un tipo nuevo, «+ Nuevo tipo de documento» al final de la tabla: nombre, sigla, dígitos y «Crear».

### 7.12 Exportar los expedientes

1. En Expedientes se eligen la situación, los filtros y el estado.
2. «Exportar» › «Expedientes en ZIP»: «¿Descargar N expedientes?», con a quiénes; «Descargar».
3. O «Exportar» › «Lista en Excel»: baja la lista con el avance y los pendientes de cada uno.

### Para El líder de área

### 7.13 Mirar los expedientes

1. Entra a Documentación desde el menú.
2. En Expedientes ve a todos —ABIERTA‑DOC‑01— y abre a una persona de su unidad.

### Para El colaborador

### 7.14 Entregar lo que falta

1. En Zona HR › Mis documentos, la franja dice «N documentos por entregar».
2. «Resolver» abre Por entregar, con lo más urgente primero y su motivo.
3. «Subir» o «Renovar»: elige el archivo.
4. Queda En revisión hasta que RR.HH. lo apruebe.

### 7.15 Ver un documento recibido

1. En «De RR.HH.», abre la carpeta de su tipo: Certificados, Memorándums.
2. Abre el documento y lo lee. Ya no hay nada que confirmar.
3. Si tiene un error, «Reportar un error» —7.17—.

### 7.16 Pedir un certificado

1. En Mis documentos › Certificados, «Pedir un certificado», o en Mis solicitudes.
2. Elige cuál y cuenta para qué.
3. En Mis solicitudes ve «Responde hasta el …».
4. Cuando RR.HH. lo atiende, «Ver el documento».

### 7.17 Reportar un error

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
| W‑DOC‑03 | Subir documento | sobre el expediente (?cargar=) |
| W‑DOC‑04 | Revisar documentos | /documentos/expedientes/revisar |
| W‑DOC‑05 | Contrato y Renovar contrato | /documentos/expedientes/contrato/:id |
| W‑DOC‑06 | Solicitudes | /documentos/solicitudes |
| W‑DOC‑07 | Atender un pedido | /documentos/solicitudes/:id |
| W‑DOC‑08 | Documentos emitidos y su detalle | /documentos/emitidos y /emitidos/:id |
| W‑DOC‑09 | Emitir | /documentos/emitidos/nuevo |
| W‑DOC‑10 | Plantillas | /documentos/configuracion?ver=plantillas |
| W‑DOC‑11 | Editor de plantillas | /documentos/configuracion/plantillas/:id y /nuevo |
| W‑DOC‑12 | Notificaciones y tipos de documento | /documentos/configuracion?ver=avisos |
| W‑DOC‑19 | Cargar plantillas | ventana sobre Plantillas |

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
| HU‑DOC‑02 | **Como** Recursos Humanos, **quiero** exigirle un documento a una persona o liberarla de uno | Retirada en la 1.2 · Lo agregado y lo exonerado antes se ven como historial |
| HU‑DOC‑03 | **Como** Recursos Humanos, **quiero** ver primero lo urgente **para** no enterarme tarde | Qué atender hoy · Lo más urgente por persona · Pedir renovación |
| HU‑DOC‑04 | **Como** Recursos Humanos, **quiero** subir y revisar documentos rápido | Elegir carpeta y documento · Reemplazar con el actual a la vista · Lo mío entra aprobado · Lo del colaborador en revisión · Bandeja de a uno |
| HU‑DOC‑05 | **Como** Recursos Humanos, **quiero** que nada se pierda **para** responder a una auditoría | Anular con motivo · Bitácora · ZIP del expediente con sus firmados |
| HU‑DOC‑06 | **Como** Recursos Humanos, **quiero** registrar y renovar contratos sin dejar dos vigentes | Decidir el anterior · Renovar con un contrato nuevo · Vista previa · Aviso de fin |
| HU‑DOC‑07 | **Como** Recursos Humanos, **quiero** emitir documentos con los datos de la ficha, para una o varias personas | Hoja antes de emitir · Sin tipear datos · Una lista con filtros · Editar solo ese documento |
| HU‑DOC‑08 | **Como** Recursos Humanos, **quiero** imprimir lo emitido, guardar el firmado y anular lo que salió mal | Descargar para imprimir · Subir el firmado · Sin firmar o Firmado · Anular con motivo |
| HU‑DOC‑09 | **Como** Recursos Humanos, **quiero** responder los pedidos a tiempo | Plazo en días hábiles · Cada pedido con lo que pide · Rechazo con motivo |
| HU‑DOC‑10 | **Como** Recursos Humanos, **quiero** armar mis plantillas y mis tipos de documento | Un solo editor · Tipos propios · Historial · Borrador o activa · Partir de una de Souly · Traerla de un Word |
| HU‑DOC‑11 | **Como** Recursos Humanos, **quiero** fijar una vez los avisos y los tipos de documento | Valores de la empresa · Un solo guardar · Próximo número a la vista · Tipo nuevo desde la tabla |
| HU‑DOC‑17 | **Como** Recursos Humanos, **quiero** enviar un reglamento a toda una unidad | Archivo propio · Varias personas con filtros · Le llega a cada uno |
| HU‑DOC‑19 | **Como** Recursos Humanos, **quiero** bajar los expedientes que estoy viendo **para** una auditoría o un reporte | ZIP de todas las páginas · Sin confidenciales · Lista en Excel con los filtros |

### Para El líder de área

### 9.2 Historias del líder

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑DOC‑13 | **Como** líder, **quiero** ver los expedientes de mi gente **para** saber si les falta algo | Hoy ve todo —ABIERTA‑DOC‑01— · Sin confidenciales |

### Para El colaborador

### 9.3 Historias del colaborador

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑DOC‑12 | **Como** colaborador, **quiero** recibir mis documentos en la app | Una carpeta por tipo · Llega con el firmado subido · Lo anulado desaparece |
| HU‑DOC‑14 | **Como** colaborador, **quiero** saber qué me falta y entregarlo desde el celular | Por entregar por urgencia · Motivo de cada uno · Queda en revisión |
| HU‑DOC‑15 | **Como** colaborador, **quiero** pedir un certificado, una copia o una corrección | Tres tipos · Plazo a la vista · Ver el documento que me enviaron |
| HU‑DOC‑16 | **Como** colaborador, **quiero** lo mismo en la web y en el celular | Mismas carpetas · Mismo estado |
| HU‑DOC‑18 | **Como** colaborador, **quiero** encontrar un documento como yo lo llamo | «carnet» encuentra el documento de identidad |

## Cómo se mantiene este documento

- Se actualiza junto con la maqueta: un cambio de comportamiento lleva su cambio aquí, en la misma entrega.
- Los códigos no cambian nunca. Una regla que deja de valer se marca «Retirada» con la versión, conserva su código y dice qué la reemplaza; un requisito retirado dice «Retirado en la 1.x». No se renumera.
- La versión en Markdown (`modulo-documentacion.md`) es la fuente; la página (`public/modulo-documentacion.html`) se genera de ella con `node herramientas/doc-modulo.cjs modulo-documentacion.md public/modulo-documentacion.html`.
- La propuesta anterior, «Propuesta de estructura» v0.2 (`public/modulo-documentacion-propuesta.html`), queda como histórico. Cada regla dice de dónde viene.

## Historial de versiones

| Versión | Fecha | Qué cambió |
| --- | --- | --- |
| **1.3** | 16 oct 2026 | **Plantillas de Souly:** las que vienen con el sistema —antes «de fábrica»— pasan a ser un catálogo de referencia, sin Activo ni Inactivo, que no se emite ni se edita. Cada una tiene **Ver** y **Usar**, que abre el editor con una «(copia)» que se crea recién al guardar y lleva «De Souly». Filtro nuevo «Todas las plantillas / Plantillas de Souly / Mis plantillas»; las siete que se usaban pasan a «Mis plantillas» con sus emitidos. **Plantillas desde Word:** «Descargar plantilla» baja un Word con cada dato como marcador entre corchetes, y «Subir plantilla» —antes «Subir .docx o .txt»— los convierte, con reconocimiento tolerante, sinónimos y el modal «Revise estos marcadores» para lo que no coincide; **Cargar plantillas** sube varios Word a la vez. **Sin aprobación en plantillas:** se quitó «Necesita aprobación»; lo emitido se imprime y se firma a mano. Una plantilla nueva se guarda con **Guardar borrador** o **Guardar y activar**. Expediente: **anular** ya no devuelve a Vigente la copia de la ficha —el documento queda Faltante—, el primer paso ofrece «Subir nueva versión» para lo que solo quedó viejo, y al terminar dice «Documento anulado con éxito»; al ver un documento, su **Historial** suma los anulados, con quién y el motivo. **Subir** desde una fila trae solo ese documento, con la vista previa grande y la «Revisión del archivo»; desde la cabecera, la lista con la franja verde de la carpeta y lo no exigido como «Opcional». **Reglas:** retirada BR‑DOC‑047 (las de fábrica se editan), que reemplaza la nueva BR‑DOC‑065 (catálogo de Souly); nueva BR‑DOC‑066 (plantillas desde Word); cambian 012, 015, 018, 030, 045 y 048. Requisito retirado RF‑DOC‑047; nuevos RF‑DOC‑070 a 076. Pantalla nueva W‑DOC‑19 Cargar plantillas. Resueltas ABIERTA‑DOC‑04 (se quitó la aprobación) y 11. Flujo nuevo 7.10 «Cargar plantillas desde Word»; los siguientes se renumeran |
| **1.2** | 16 oct 2026 | **Emitir ya no envía:** el documento queda en el expediente «Sin firmar»; RR.HH. lo descarga para imprimir (Word), lo hace firmar y sube el firmado, que queda con el mismo número y recién ahí lo ve el colaborador. Las solicitudes de certificado o corrección también: se generan, se firman y se entregan en persona; sólo las copias y los archivos propios se siguen enviando. **Se quitó la confirmación de recepción** en todo el módulo, web y celular; lo confirmado antes se ve como Entregado. Emitir: sin pestañas «Personas / Un grupo», siempre la lista con filtros, y «Editar documento» solo para esa emisión. **Las adendas ya no se crean:** «Renovar contrato» registra un contrato nuevo que reemplaza al anterior, con vista previa. Expedientes suma **Exportar** (ZIP de expedientes sin confidenciales y lista en Excel). En el expediente se quitaron Enviar documento, Agregar requisito y Exonerar; **no se borra, se anula**, y la Papelera pasa a Anulados; Subir documento pregunta la carpeta y el documento, y muestra el actual y el nuevo antes de reemplazar; en las carpetas, Lista primero con paginación de 10. Configuración: «Notificaciones y tipos de documento», con «+ Nuevo tipo de documento»; sin «Días en la papelera». Solicitudes: la columna «Pide» pasa a «Tipo»; el **plazo para responder** se configura y el colaborador lo ve al pedir (cambia BR‑DOC‑039); un certificado o una corrección pedidos se generan sin enviar y se entregan firmados en persona. Estado «Sin enviar» pasa a «Sin firmar». **Reglas:** retiradas BR‑DOC‑005 (exonerar), 027 (adendas) y 037 (confirmar la recepción); cambian 001, 002, 003, 012, 013, 014, 015, 018, 019, 021, 024, 026, 028, 029, 032, 033, 035, 036, 040, 044, 052 y 057; nuevas BR‑DOC‑061 a 064. Requisitos retirados RF‑DOC‑008, 009, 032 y 055; nuevos RF‑DOC‑063 a 069. Nueva HU‑DOC‑19. Resueltas ABIERTA‑DOC‑06 y 10. Los flujos se renumeran: suman Anular, Subir el firmado y Exportar, y «Confirmar un documento recibido» pasa a «Ver un documento recibido» |
| **1.1** | 16 oct 2026 | El expediente de RR.HH. se ve como Mis documentos: la franja de lo pendiente con su anillo y las carpetas amarillas en «Sus carpetas» y «De RR.HH.». «Recibidos» se divide en una carpeta por tipo —Certificados, Memorándums y los creados—, también para el colaborador en la web y en el celular; «Otros» solo aparece si tiene algo. Colaboradores, en Gestión de personas, suma «Ver expediente». En Zona HR de la web, el administrador también ve «Mis documentos» con su propio expediente, como en el celular |
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

«Publicar» sonaba a enviar algo afuera. Lo que importa es si la plantilla se usa o no: activa es la que se usa, inactiva es el borrador. Por eso una nueva se guarda con «Guardar borrador» o «Guardar y activar». Las versiones se guardan igual, por dentro.

#### Por qué las de Souly no se editan

Hasta la 1.2 las que venían con el sistema se editaban, y no se distinguía lo que mantiene Souly de lo que era de la empresa. Ahora son un catálogo: se miran y se usan como base con «Usar». La copia es de la empresa, que la edita, la activa y la emite; el nombre «(copia)» dice que la de Souly sigue igual, y «Volver al texto original» deshace lo propio.

#### Por qué las plantillas no piden aprobación

Lo emitido se genera, se imprime y se firma a mano: la firma es la aprobación. Un paso de aprobación en el sistema, sin firma digital, pedía una segunda constancia de lo mismo, así que se quitó.

#### Por qué una plantilla se trae de Word con marcadores

RR.HH. ya tiene sus modelos en Word. Escribir cada dato entre corchetes, con su nombre, se entiende sin aprender nada; si un marcador no coincide, se pregunta en vez de adivinar. Del Word se toma el texto: el diseño lo pone la hoja al emitir.

#### Por qué el expediente de RR.HH. se ve como Mis documentos

Es el mismo expediente visto desde dos lados. Si RR.HH. y la persona ven las mismas carpetas, con el mismo dibujo y los mismos nombres, pueden hablar de él sin traducir: «está en Certificados» quiere decir lo mismo para los dos.

#### Por qué lo recibido va en una carpeta por tipo

Una sola carpeta «Recibidos» mezclaba certificados, memorándums y comunicados. Por tipo, cada uno se encuentra donde se lo busca, y un tipo nuevo —«Constancias»— trae su carpeta.

#### Por qué «Otro documento» ya no se ofrece

Si la empresa puede crear sus tipos, «Otro» no dice nada. Se crea «Carta de recomendación» con su sigla y su carpeta en la app.

#### Por qué ya no se confirma la recepción

Hasta la 1.1, el colaborador confirmaba «que lo recibió», no «que está de acuerdo»: un memorándum de llamada de atención no se firma de conformidad. Desde la 1.2 lo emitido se imprime y se firma a mano, y el firmado que sube RR.HH. es el que vale. Confirmar en la app pedía una segunda constancia de lo mismo, así que se quitó.

#### Por qué emitir no envía

El documento que vale es el firmado en papel. Si emitir lo mandaba en el acto, el colaborador recibía una versión sin firma. Ahora emitir lo deja en el expediente «Sin firmar», con lo que sigue a mano —Descargar para imprimir y Subir el firmado—, y la persona lo ve cuando ya está firmado.

#### Por qué Emitir no pregunta «una persona o un grupo»

No hace falta decirlo antes: se marca a una y es para una; se marcan varias y a cada una le sale el suyo. Las pestañas obligaban a elegir un camino antes de saber a quién.

#### Por qué renovar es un contrato nuevo y no una adenda

La empresa no usa adendas. Renovar registra un contrato nuevo que reemplaza al anterior, que se conserva con sus versiones, y así siempre hay un solo contrato vigente que Planillas lee.

#### Por qué se anula y no se borra

Un documento cargado por error es parte de la historia del expediente. La papelera lo escondía y lo dejaba recuperar; anular lo deja a la vista en Anulados, con quién, cuándo y por qué, y libera el lugar para subir el correcto. Por eso el primer paso ofrece «Subir nueva versión»: reemplazar es para lo que era válido y quedó viejo; anular, para lo que nunca debió contar.

#### Por qué Subir pregunta primero la carpeta y el documento

Antes, «Subir documento» abría el explorador y subía en el acto: lo que no se reconocía quedaba «por clasificar» y lo que ya existía se reemplazaba sin preguntar. Ahora siempre hay un documento elegido, y si ya existe, se ve el actual al lado del nuevo antes de reemplazarlo. Desde la vista general, la lista de todo junto era larga: por eso se pregunta antes la carpeta.

## Anexo · El módulo en el prototipo, hoy

*Cómo está construido el módulo de documentación en el prototipo al 16 de octubre de 2026 (versión 1.3), y en qué se aparta de este documento. Todo sale del código de `ficha_colaborador`.*

### Las pantallas y sus rutas

| Dirección | Componente | Qué hay |
| --- | --- | --- |
| `/documentos/expedientes` | `pages/documentacion/Legajos.jsx` + `PorDocumento.jsx` | Expedientes, resumen de hoy, vista por documento y el menú Exportar (`components/documentacion/expedienteZip.js`, `utilidades.js`) |
| `/documentos/expedientes/:id` | `Expediente.jsx` | Expediente por carpetas, Subir documento (`ElegirCarpeta`, `ModalSubir`, `ModalSubirRecibido`, `ModalSubirContrato`), anular, versiones, historial |
| `/documentos/expedientes/revisar` | `Revisar.jsx` | Revisar documentos |
| `/documentos/expedientes/contrato/:id` | `Contrato.jsx` | Ficha del contrato y Renovar contrato (`ModalRenovar`) |
| `/documentos/solicitudes` y `/:id` | `Solicitudes.jsx` → `Bandeja.jsx`, `Atender.jsx` | Solicitudes y atender |
| `/documentos/emitidos` y `/:id` | `Envios.jsx`, `Envio.jsx` | Documentos emitidos y su detalle |
| `/documentos/emitidos/nuevo` | `Emitir.jsx` + `PanelEmision.jsx` | Emitir |
| `/documentos/configuracion` | `Configuracion.jsx` → `Biblioteca.jsx`, `Notificaciones.jsx` | Plantillas, con las de Souly y Cargar plantillas (`ModalCargarPlantillas`), y Notificaciones y tipos de documento |
| `/documentos/configuracion/plantillas/:id` | `EditorPlantilla.jsx` | Editor de plantillas, con «Revise estos marcadores» (`ModalMarcadores`) |
| `/mi-espacio/zona-hr/documentos` y `/solicitudes` | `pages/colaborador/MisDocumentos.jsx` | Mis documentos y Mis solicitudes |
| celular | `components/layout/MisDocumentosPhone.jsx` | Mis documentos y Mis solicitudes en la app |

Los datos viven en `context/DocumentacionContext.jsx` y `data/documentacionData.js`; el lado del colaborador, en `hooks/useMisDocumentos.js`. Las rutas viejas (`/legajos`, `/colaboradores`, `/envios`, `/emitir`, `/por-revisar`, `/carga-masiva`, `/reportes`) redirigen a las nuevas.

«Descargar para imprimir» arma un .doc de Word con `descargarParaImprimir` (`components/documentacion/utilidades.js`); en los contratos, con las líneas de firma de la empresa y de la persona. El firmado de un emitido se guarda con `adjuntarFirmado` en `DocumentacionContext.jsx`. Las plantillas de Souly están en `PLANTILLAS_SOULY` (`data/documentacionData.js`), con `souly-` delante de su id; los marcadores se arman y se leen con `aMarcadores`, `deMarcadores` y `aplicarMarcadores`, en el mismo archivo, y el Word con `crearDocx` y `textoDeDocx` (`components/documentacion/zip.js`). Las claves internas siguen con sus nombres de antes: un documento anulado guarda `eliminado`, la carpeta Anulados es `papelera`, el estado «Sin firmar» es `generado` y lo confirmado antes es `acusado`, que ahora se ve «Entregado».

### El historial de ejemplo

Para que el Historial de cada expediente no salga vacío, la demo siembra una vez una historia por persona activa (`historialSeed` en `data/documentacionData.js`), armada con sus propios datos: lo que se le exigió, cada archivo que se cargó y por dónde, las aprobaciones y los rechazos con su recordatorio, sus contratos generados y firmados, lo que se le envió, lo que pidió y cómo se respondió y, a algunos, la descarga de su expediente completo. No inventa nada que el expediente no muestre y no repite lo que ya estaba anotado.

### Lo que la maqueta todavía no hace

| Tema | En la maqueta | Regla |
| --- | --- | --- |
| Avisos y recordatorios | Se registran; no se envía nada | BR‑DOC‑023, 050 |
| Copia de un documento del expediente | Se anota; no le llega a la persona | BR‑DOC‑040 |
| Líder | Ve toda la empresa y puede editar | BR‑DOC‑053 |
| Carpetas y documentos requeridos | No hay pantalla para configurarlos; son los de ejemplo | ABIERTA‑DOC‑02 |
| Tamaño carta u oficio | Solo cambia la vista previa del editor; «Descargar para imprimir» baja siempre en carta | ABIERTA‑DOC‑09 |
| Contratos | El firmado que se sube desde el expediente se guarda en el navegador; el que se sube desde la ficha del contrato guarda solo el nombre. «Descargar» de una versión baja texto; «Descargar para imprimir», un Word | BR‑DOC‑028 |
| Firmados de lo emitido | Se guardan en el navegador de quien los subió; en el ZIP, si no está, va una nota en su lugar | BR‑DOC‑036 |
| Archivos | Se guardan en el navegador de quien los subió; los de ejemplo bajan como .txt | 5.4 |
| Haber básico | Sale de una tabla de ejemplo por unidad | BR‑DOC‑031 |
| Carpeta Perfil profesional | Se ve en local y se oculta en Vercel | 3.14 |
| Colaboradores de ejemplo | Carlos y María no están en el directorio | ABIERTA‑DOC‑07 |
| Revisar | Abrir un confidencial ahí no deja rastro | BR‑DOC‑020 |
| Código sin uso | `CargaLote.jsx`, `Reportes.jsx`, `TiposSubtipos.jsx`, `PorRevisar.jsx` y `CargarDocumentoModal.jsx` quedan sin pantalla; en el contexto quedan sin uso desde las pantallas `exonerar`, `agregarRequisito`, `recuperarDocumento`, `subirSinClasificar`, `acusarRecibo` y `recordarAcuse` | — |
