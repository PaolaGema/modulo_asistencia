Souly HR · Módulo de onboarding · Documentación de producto

# Módulo de onboarding

> **Módulo de onboarding — versión en Markdown.** Reúne completo el documento de producto `public/onboarding.html` (versión 1.0, 15 de octubre de 2026): glosario, contexto, integraciones, funcionalidades por rol, las 70 reglas de negocio con sus escenarios, modelo de datos, roadmap, flujos, pantallas, historias de usuario, el anexo de decisiones y el anexo «El módulo en el prototipo, hoy». Reemplaza a la «Documentación de la Maqueta — Módulo de Onboarding» (`documentacion.html`), que queda como histórico. Los diagramas se conservan dibujados en el HTML; acá quedan descritos.

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

La incorporación deja de depender de la memoria de alguien y pasa a ser *un recorrido por puesto, igual para todos los que llegan, que avisa cuando alguien se traba y deja registro de todo*. Este documento define qué es, qué reglas cumple, qué tiene que hacer el producto y cómo se opera.

- **Versión:** 1.0
- **Fecha:** 15 de octubre de 2026
- **Autoría:** Paola Gema — Diseñadora UX
- **Revisa y aprueba:** Por definir
- **Estado:** Borrador

| En este documento | Cantidad |
| --- | --- |
| roles con su vista | 5 |
| tipos de tarea | 10 |
| niveles de estado | 3 |
| reglas de negocio | 70 |
| requisitos funcionales | 50 |
| historias de usuario | 20 |
| diagramas | 3 |
| decisiones abiertas | 12 |
| pantallas | 16 |

## 00 · Glosario

*Las palabras del módulo, con lo que significan en Souly. Se leen antes que nada porque todo lo demás las usa: una ruta no es una asignación, y un estado de la ruta no es un estado del onboarding.*

### 0.1 Ruta, etapa, actividad y tarea

Una **ruta** es el recorrido que hace una persona al entrar a la empresa o a un puesto nuevo. Se arma una vez, para un puesto, y se asigna a cada persona que llega a ese puesto. Se ordena en tres niveles:

| Nivel | Qué es | Ejemplo |
| --- | --- | --- |
| **Etapa** | Un tramo del recorrido, con su duración en días | «Mi primera semana», del día 1 al 7 |
| **Actividad** | Un grupo de tareas dentro de una etapa, con nombre | «General», «Integraciones», «Cierre» |
| **Tarea** | Lo que la persona hace: ver, leer, responder, subir, recorrer | «Video de bienvenida», «Prueba de cultura» |

Ninguna tarea va suelta: vive dentro de una actividad, que vive dentro de una etapa —BR‑ONB‑016—. La etapa dice **cuándo**; la actividad, **de qué se trata**; la tarea, **qué hay que hacer**.

> **Diagrama · Cómo se arma una ruta.** Arriba, la ruta, apuntada a un puesto (sucursal, área y cargos). Debajo, sus etapas en fila: primero la de la ruta general, bloqueada; después «Mi primera semana» (días 1 a 7), «Conoce el equipo» (días 8 a 15) y «Tu primer mes» (días 16 a 30). Cada etapa se abre en actividades —por ejemplo «General»— y cada actividad en tareas: video, documento, completar perfil. En la versión HTML está dibujado.

### 0.2 La ruta general

La **ruta general** es una ruta marcada para toda la empresa: sus etapas se ponen **al principio de todas las demás rutas activas**, protegidas, para que nadie se salte lo común —la bienvenida, la cultura, las políticas—. Es lo que el diseño original llamaba **Tronco Común**. Hay una sola ruta general a la vez y se edita solo en ella; en las demás rutas sus etapas aparecen bloqueadas —BR‑ONB‑013—.

### 0.3 Onboarding y reboarding

Una ruta es de uno de dos tipos:

- **Onboarding**: la incorporación de alguien que entra a la empresa.
- **Reboarding**: la de alguien que ya está y cambia algo importante —un ascenso, un cambio de área o de sucursal, una normativa nueva, la vuelta de una licencia—.

La persona es la misma; cada proceso queda en su historial, **Mi trayectoria**, con el recorrido tal como lo hizo —BR‑ONB‑065—.

### 0.4 Ruta y asignación: la plantilla y el caso

La **ruta** es la plantilla; la **asignación** es el caso de una persona: qué ruta le tocó, desde qué fecha, cuánto lleva, en qué día va, quién es su buddy y en qué estado está. Al asignarse, la asignación se queda con una **copia congelada** de la versión de la ruta de ese día: si después la ruta cambia, a quien ya empezó no se le mueve el camino —BR‑ONB‑022—.

### 0.5 Los tres niveles de estado

Hay tres estados distintos y no se mezclan:

| Nivel | De qué | Estados |
| --- | --- | --- |
| **1** | La ruta | Activo · Inactivo · Borrador |
| **2** | El onboarding asignado | Programado · En curso · En riesgo · Atrasado · Pausado · Completado |
| **3** | Cada tarea | Bloqueada · Pendiente · En progreso · Completada · Vencida |

Además, el **directorio de Gestión de personas** muestra para cada colaborador su situación respecto del onboarding: **N/A** (entró antes del sistema), **Sin ruta**, **Sin iniciar**, **En curso**, **En riesgo** y **Graduado**. Son la misma historia vista desde la persona y no desde la asignación —5.5—.

### 0.6 Quién es quién

| Rol | Qué hace en el módulo |
| --- | --- |
| **Recursos Humanos** (administrador) | Arma las rutas, las activa, las asigna, sigue a todos y configura el módulo |
| **Líder de área** (jefe) | Sigue el onboarding de su gente y ve las rutas de su área |
| **Auxiliar** | Ayuda al líder con delegación: ve su área y edita las rutas de las que es responsable |
| **Buddy** | Acompaña a una o varias personas nuevas. Es una **relación**, no un permiso: ve el avance de quien acompaña, no sus respuestas |
| **Colaborador** | Hace su ruta: ve sus etapas, completa sus tareas y se gradúa |

## 01 · Contexto

*Qué es el onboarding en Souly, qué le faltaba a la manera en que se hacía y a quién tiene que servir.*

### 1.1 ¿Qué es el onboarding en Souly?

Es el módulo que lleva a una persona desde su primer día hasta que **se siente parte del equipo y sabe hacer su trabajo**. Recursos Humanos diseña un recorrido por puesto, se lo asigna a cada persona que llega, y la persona lo hace a su ritmo, desde la web o desde el celular, acompañada por un buddy y seguida por su líder.

### 1.2 El problema que resuelve

Hoy la incorporación depende de la memoria de alguien: un correo con adjuntos, una reunión de bienvenida, una lista en una planilla. Falla de tres maneras:

- **Cada uno recibe una cosa distinta.** Lo que se le explica a alguien depende de quién lo recibió y del día que tuvo.
- **Nadie sabe quién se trabó.** Una persona puede pasar una semana sin hacer nada de su inducción sin que nadie lo note hasta que es tarde.
- **No queda rastro.** Cuando alguien pregunta si a una persona se le explicó una política, no hay cómo saberlo.

### 1.3 Visión del módulo

**Que cada persona que llega haga el mismo buen recorrido que su puesto pide, que nadie se quede trabado sin que alguien lo note, y que todo quede registrado.** Las rutas se diseñan una vez y se reutilizan; lo común a toda la empresa se escribe una sola vez en la ruta general; y el seguimiento dice en todo momento quién va bien, quién se atrasó y quién necesita una mano.

### 1.4 Principios de diseño

1. **Una ruta por puesto.** Se diseña para un cargo en una sucursal; quien llega a ese puesto la recibe —BR‑ONB‑008—.
2. **Lo común se escribe una vez.** La ruta general se antepone a todas, protegida.
3. **Quien empezó termina lo que empezó.** Cambiar una ruta no le mueve el camino a nadie que ya esté adentro.
4. **Nada se pierde.** Una ruta usada no se borra, se pone en Inactivo; un onboarding desasignado deja su historial.
5. **Lo que pide atención se ve primero.** Las listas del líder, del buddy y de Recursos Humanos se ordenan por urgencia.
6. **El buddy acompaña, no supervisa.** Ve el avance y el recorrido; las respuestas y los datos personales son de Recursos Humanos.
7. **El celular es un ciudadano de primera.** Todo lo que hace el colaborador, el buddy y el líder se puede hacer desde el teléfono.
8. **Las palabras son las de Recursos Humanos.** «Ruta», «etapa», «graduarse», «desasignar»; no «plantilla de flujo» ni «eliminar».

### 1.5 Cómo se sabe si funcionó

| Indicador | Qué se espera |
| --- | --- |
| **Ingresos con ruta** | Ninguna persona nueva empieza sin una ruta asignada |
| **Personas en riesgo** | Quien pasa días sin actividad recibe un recordatorio antes de atrasarse |
| **Graduados a tiempo** | La mayoría termina dentro de la duración de su ruta |
| **Rutas vigentes** | Cada puesto con ingresos frecuentes tiene una ruta activa |

> **En la maqueta:** estos indicadores no se pueden medir todavía: los estados de la maqueta son datos de ejemplo y no cambian solos —ver el anexo «El módulo en el prototipo, hoy»—.

### 1.6 A quién sirve

| Quién | Para qué entra | Dónde |
| --- | --- | --- |
| **Recursos Humanos** | Diseña, asigna, sigue y configura | Módulo Onboarding: Dashboard, Seguimiento, Rutas, Recursos corporativos, Configuración avanzada |
| **Líder de área** | Ve cómo va su gente y a quién ayudar | Dashboard de su equipo, Seguimiento y Rutas de su área; en el celular, «Ver el onboarding de mi equipo» |
| **Auxiliar** | Ayuda al líder con el seguimiento y las rutas | Seguimiento y Rutas de su área |
| **Buddy** | Acompaña a quien le asignaron | Mi espacio › Mis acompañados; en el celular, «Acompañar a mi gente» |
| **Colaborador** | Hace su ruta | Mi espacio › Mi Onboarding; en el celular, la pestaña Onboarding |

### 1.7 Alcance y límites

**Entra en esta versión:** las rutas con sus etapas, actividades y diez tipos de tarea; la ruta general; los estados y el reemplazo de rutas por puesto; las versiones; la asignación manual; el seguimiento con buddy, pausa, recordatorio y desasignación; la biblioteca de Recursos corporativos; la configuración por defecto de la empresa; la vista del líder, del buddy y del colaborador en la web y en el celular.

**Especificado pero sin construir en la maqueta:** el cálculo automático de los estados, la asignación automática, las menciones en el muro, la extensión de plazo, el certificado descargable y el guardado de lo que sube o responde el colaborador. Están contados en el anexo del prototipo y en 6.7.

**No entra:** el predictor de fuga que pedía el diseño original —FUERA‑ONB‑01—.

**Prioridades.** Cada requisito lleva una: **Oblig.** sin esto no se entrega; **Import.** se entrega en la etapa que le toca; **Deseable** si hay tiempo.

## 02 · Integraciones

*De qué módulos lee el onboarding y a cuáles les deja algo. El onboarding no inventa personas ni puestos: los toma de quien es su dueño.*

### 2.1 Organización

Una ruta apunta a un **puesto**: una sucursal, un área y uno o más cargos —BR‑ONB‑001—. Esos tres datos son de Organización, que es la dueña de la estructura de la empresa. El líder de un equipo también sale de ahí: es la relación **jefe** de cada persona, no el área.

> **En la maqueta:** las áreas, cargos y sucursales del formulario de la ruta están escritos a mano y no salen de Organización; sus nombres no coinciden con las sucursales del organigrama. Hay que conectarlos.

### 2.2 Gestión de personas

- **El alta.** Una persona recién dada de alta queda **Sin ruta**: la ruta la asigna Recursos Humanos —o el sistema, con la asignación automática—.
- **El directorio.** Muestra la situación de onboarding de cada persona y deja asignar una ruta de onboarding o, a quien ya se graduó, una de **reboarding**; asignar o cambiar el buddy; y desasignar.
- **La ficha.** La tarea «Completar perfil» se da por hecha con los datos de la ficha del colaborador: no es un formulario aparte —BR‑ONB‑025—.

> **En la maqueta:** asignar una ruta desde el directorio solo cambia la situación de la persona y no crea la asignación de Seguimiento; asignar desde Seguimiento no actualiza el directorio. Son dos registros que hay que unificar.

### 2.3 Documentación

Lo que la persona sube en una tarea **Subida de archivo** va a su expediente, a una carpeta «Onboarding» con una subcarpeta por tarea —BR‑ONB‑030—.

> **En la maqueta:** la subida no guarda el archivo todavía.

### 2.4 Comunicación

- **Recordatorios**: Recursos Humanos o el líder le escriben a quien está en riesgo o atrasado, por WhatsApp o por notificación en la plataforma —BR‑ONB‑047—.
- **Menciones automáticas** en el muro: al empezar el onboarding, al completar una etapa y al graduarse —BR‑ONB‑057—.

> **En la maqueta:** el recordatorio se registra pero no se envía, y las menciones no se publican.

### 2.5 Inicio y Mi día

- El **Dashboard de Inicio** avisa de los ingresos de los últimos 30 días que no tienen onboarding y de las personas en riesgo o atrasadas.
- En el **celular**, el Inicio lleva un acceso directo distinto según quién mira: «Continuar mi Onboarding» al colaborador, «Ver el onboarding de mi equipo» al líder y «Acompañar a mi gente» al buddy.

### 2.6 Recursos corporativos

Es la biblioteca de materiales del onboarding. Las tareas de contenido —video, audio, documento— **no guardan el archivo**: lo toman de la biblioteca —BR‑ONB‑031—. Un archivo que se sube desde una tarea queda también en la biblioteca. La misma biblioteca se abre desde Archivos › Onboarding.

### 2.7 Resumen

| Módulo | El onboarding lee | El onboarding deja |
| --- | --- | --- |
| **Organización** | Sucursales, áreas, cargos y el jefe de cada persona | — |
| **Gestión de personas** | Las personas, su ficha y su ingreso | La situación de onboarding de cada uno |
| **Documentación** | — | Los archivos que sube el colaborador |
| **Comunicación** | — | Recordatorios y menciones |
| **Recursos corporativos** | Videos, audios y documentos de las tareas | Lo que se sube desde una tarea |

## 03 · Funcionalidades

*Cada pantalla, qué tiene y qué tiene que hacer. Primero las de Recursos Humanos, después las del líder y el auxiliar, las del buddy, las del colaborador y las de todo el módulo.*

### Para Recursos Humanos

Las pantallas del módulo Onboarding del menú lateral, en el orden del submenú: Dashboard, Seguimiento, Rutas, Recursos corporativos y Configuración avanzada.

### 3.1 Dashboard

La primera pantalla de Recursos Humanos: cuántos onboardings hay, cómo van y quién necesita atención.

- **Bienvenida** con el resumen: «Tienes N onboardings activos y M alertas que requieren tu atención».
- **Primeros pasos**, mientras el módulo está vacío: crear una ruta y asignarla, con el siguiente paso marcado. Desde la barra superior, un acceso «Primeros pasos» recuerda tres: subir un recurso, crear una ruta y hacer la primera asignación.
- **Indicadores**: Activos, Completados, Atrasados, En riesgo y Tiempo promedio.
- **Distribución por estado** y **Onboardings por área**.
- Tres **rankings**: rutas más usadas, colaboradores por avance y áreas con mejor completitud.
- **Onboardings en progreso** («Día X / Y» y porcentaje), **Necesitan atención**, **Próximos ingresos** y **Actividad reciente**.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑001 | Los indicadores se calculan de las asignaciones reales | Oblig. | Asignar una ruta suma uno a Activos |
| RF‑ONB‑002 | «Necesitan atención» lista a quien está en riesgo o atrasado | Oblig. | Con un atrasado, aparece con «Tiene tareas vencidas» |
| RF‑ONB‑003 | «Próximos ingresos» marca a quien entra sin ruta | Import. | Un ingreso sin ruta muestra «Sin ruta aún» |
| RF‑ONB‑004 | Los primeros pasos acompañan al módulo vacío | Import. | Sin rutas, se ve «Crear una ruta» como siguiente paso |

> **En la maqueta:** «Tiempo promedio», «Próximos ingresos», «Actividad reciente» y la tarjeta «Programar reconocimiento» son fijos; el botón «Programar reconocimiento» no hace nada.

### 3.2 Seguimiento

La lista de todos los onboardings asignados. Para Recursos Humanos se ve como tabla; para el líder y el auxiliar, como tarjetas.

- **Indicadores**: En curso, Completados, Pendientes (sin iniciar) y Atrasados (atrasados y en riesgo juntos).
- **Búsqueda** por nombre, ruta o área; filtros de **área** y **cargo**, y en la tabla, de **tipo** y **estado** desde el encabezado de su columna.
- **Columnas**: Colaborador, Ruta asignada, Tipo, Progreso, Día, Estado, Inicio, Buddy y acciones. Ocho filas por página.
- **Acciones por fila**: Ver detalles · Asignar o cambiar buddy · Desasignar buddy · Enviar recordatorio (solo en riesgo o atrasado) · Pausar o reanudar · Desasignar ruta de onboarding.
- El botón **«Asignar ruta a colaboradores»** abre la asignación —3.4—.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑010 | La lista se puede ver como tabla o como tarjetas | Import. | El líder entra en tarjetas; Recursos Humanos, en tabla |
| RF‑ONB‑011 | El estado lleva una ayuda con los seis estados | Oblig. | El ícono junto a «Estado» explica cada uno |
| RF‑ONB‑012 | Enviar recordatorio solo aparece en riesgo o atrasado | Oblig. | En «En curso» la acción no está |
| RF‑ONB‑013 | Desasignar pide escribir «desasignar» | Oblig. | Sin escribirlo, el botón no se activa |

### 3.3 Detalle de un onboarding

Una página propia, con dirección, para cada persona: lo mismo que ella ve, más lo que necesita quien la sigue.

- **Encabezado**: nombre, estado, cargo y área, ruta. «Enviar recordatorio» si está en riesgo o atrasada.
- **Números**: Avance, Tareas («x de y»), Día («x de y», «Faltan n días») e Inicio.
- **Recorrido**: el mismo camino de nodos que ve la persona, con sus etapas, actividades y tareas completadas y pendientes, y la versión de la ruta que está haciendo. Al tocar una tarea se ve de qué se trata; en una prueba o un formulario ya completados, las respuestas.
- **Ficha** del caso —ruta, tipo, versión, área, cargo, inicio y buddy— y **Acciones**: asignar o cambiar buddy, pausar o reanudar, y desasignar, separada y en rojo porque no se deshace.
- Si la persona está en riesgo o atrasada, una alerta: «Un recordatorio o un mensaje del buddy suele destrabar el proceso».

> **En la maqueta:** qué tareas están hechas se deduce del porcentaje, en orden; las vistas de un video y las respuestas son de ejemplo, y la pantalla lo dice.

### 3.4 Asignar una ruta

Una ventana con tres columnas a la vista, no un asistente de pasos: **la ruta** (una), **las personas** (una o varias) y **la fecha de inicio**.

- Elegir la ruta filtra a las personas por su área —BR‑ONB‑034—. Hay filtros de sucursal, área, cargo y fecha de ingreso para encontrar a quién.
- La fecha de inicio no puede ser pasada: si la persona ya ingresó, se pone hoy o una fecha futura —BR‑ONB‑035—.
- El botón dice cuántos: «Asignar a N colaboradores».
- La asignación queda **Programada** hasta su fecha de inicio —BR‑ONB‑036—.

> **En la maqueta:** la lista de personas de esta ventana es fija y no sale del directorio, y el filtro de sucursal de las rutas no se aplica.

### 3.5 Rutas

La lista de rutas de la empresa.

- **Indicadores**: Activo, Inactivo, Borrador y la **Ruta general** —su nombre o «Sin definir»—.
- **Columnas**: nombre (con la marca «General» y su versión), área y cargos, tipo, etapas, colaboradores —en la ruta general, su alcance—, estado y acciones. La ruta general va primera.
- **Acciones**: Asignar ruta a colaboradores · Ver detalles · Editar · Duplicar · Historial de versiones · Establecer o quitar como ruta general · Cambiar estado · Eliminar. Solo se ofrecen las que valen para el estado de la ruta.
- **Nueva ruta**: nombre, descripción, tipo, sucursal, área y cargos. Si el puesto ya tiene una ruta vigente, lo avisa en el mismo formulario —BR‑ONB‑010—. Se crea en **Borrador** y abre el constructor.
- **Detalle de la ruta**: su recorrido, quién la está haciendo, quién tiene acceso para editarla y su información.
- **Historial de versiones**: cada versión con su fecha, autor, etapas, tareas y cuántas personas la están haciendo, y una vista para verla.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑020 | Cambiar estado ofrece solo los destinos posibles | Oblig. | Un borrador sin tareas no ofrece «Activo» y lo explica |
| RF‑ONB‑021 | Activar sobre un puesto ocupado pide confirmar el reemplazo | Oblig. | Sale «Reemplazar ruta» con lo que sale y lo que queda |
| RF‑ONB‑022 | Eliminar se apaga si la ruta ya se asignó | Oblig. | Lo dice y ofrece «Poner en Inactivo» |
| RF‑ONB‑023 | Duplicar crea una copia en borrador | Import. | «Nombre (copia)», en Borrador |

### 3.6 Constructor de rutas

Donde se arma el recorrido. Tres columnas: las **etapas** a la izquierda, el **lienzo** en el centro y los **tipos de tarea** a la derecha.

- **Etapas**: se agregan con nombre y duración en días —siete por defecto—, se reordenan arrastrando y cada una dice su tramo, «Día a – b». Las de la ruta general aparecen agrupadas y bloqueadas.
- **Lienzo**: cada etapa con sus actividades y sus tareas en zigzag, como las verá el colaborador. Las tareas se agregan arrastrando desde la paleta o con «+», y cada una se edita, duplica o elimina. Se pueden seleccionar varias para borrarlas juntas.
- **Arriba**: empezar desde una plantilla o copiar otra ruta; configurar la ruta; incluir o no la ruta general; ver como colaborador; y **Guardar ruta** —o **Guardar cambios**, si ya no es un borrador—.
- **Propiedades de la tarea**, en tres columnas: información básica (nombre, descripción, quién la realiza), contenido (según el tipo) y configuración (en qué días se hace y si lleva prueba de comprensión).
- **Configuración de la ruta**: puntos, notificaciones automáticas, plazos estrictos, asistente IA e incluir la ruta general.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑030 | Una tarea se planifica dentro de los días de su etapa | Oblig. | En una etapa del día 8 al 15 no se puede elegir el día 20 |
| RF‑ONB‑031 | Guardar una ruta con gente adentro pregunta quién recibe los cambios | Oblig. | Ofrece «Solo a los futuros» o «También a los que siguen adentro» |
| RF‑ONB‑032 | Salir con cambios sin guardar pregunta antes | Oblig. | Aparece «Cambios sin guardar» |
| RF‑ONB‑033 | «Completar perfil» se agrega una sola vez por ruta | Oblig. | La segunda vez lo explica y no la agrega |

> **En la maqueta:** de la configuración de la ruta solo funcionan los puntos e incluir la ruta general; las demás opciones se guardan sin efecto.

### 3.7 Los diez tipos de tarea

| Tipo | Qué hace la persona | Cómo se configura |
| --- | --- | --- |
| **Completar perfil** | Completa su ficha | Viene del sistema; una sola por ruta |
| **Video** | Mira un video | De Recursos corporativos, un enlace o un archivo; puede llevar prueba |
| **Audio / Podcast** | Escucha un audio | Igual que el video |
| **Documento / PDF** | Lee un documento | Igual que el video |
| **Prueba** | Responde preguntas de opción múltiple | Editor de prueba |
| **Formulario** | Responde un formulario | Texto corto, párrafo, opción múltiple, casillas y desplegable, con preguntas obligatorias |
| **Subida de archivo** | Sube los documentos que se le piden | Lista de documentos con su formato |
| **Otra tarea** | Cumple una lista de pasos | Una lista de tareas |
| **Recorrido por área** | Visita lugares de la empresa | Las paradas y, si hay, un guía |
| **Cómo se siente** | Dice cómo va, con caritas | Las preguntas del pulso, con sugeridas |

### 3.8 Recursos corporativos

La biblioteca de los materiales del onboarding, por carpetas.

- **Carpetas**, con cuántos documentos tienen, quién las creó y cuándo cambiaron. Se crean con solo un nombre.
- **Dentro de una carpeta**: subir archivos —también arrastrándolos— o agregar un enlace de video o de audio; buscar, ordenar y filtrar por tipo, estado y visibilidad.
- **Por documento**: vista previa, crear una prueba sobre su contenido, marcarlo como **recurso general** —visible para todos, más allá del onboarding— y eliminarlo.

### 3.9 Configuración avanzada

Los valores por defecto del módulo para toda la empresa, en una sola página que se guarda junta.

- **Asignación de ruta**: manual o **automática**, a una hora del día de ingreso, según el área y el cargo.
- **Gamificación (puntos)**, **Asistente IA**, **Menciones automáticas** (inicio, etapa completada, graduación), **Días «En riesgo»** (3 por defecto), **Extensión de plazo** y **Certificado de graduación** (color, logo y hasta dos firmas, con vista previa).
- Cada ruta hereda estos valores, los personaliza o los apaga; lo que se apaga aquí no lo puede usar ninguna ruta —BR‑ONB‑055—.

> **En la maqueta:** solo los puntos y el asistente IA tienen efecto; lo demás se guarda.

### Para El líder de área

Lo que ve y hace quien tiene gente a cargo. Su equipo es su gente —la relación jefe de Organización—, no toda el área —BR‑ONB‑049—.

### 3.10 Dashboard de mi equipo

La primera pantalla del líder al entrar al módulo Onboarding.

- **Saludo**: «Hola, {nombre}» y «Aquí tienes el estado del onboarding de tu equipo de {área}».
- **Indicadores**: Mi equipo, En onboarding, En riesgo («+3 días sin actividad» o «Sin alertas activas») y Graduados.
- **Mi equipo en onboarding**: quien tiene una ruta en marcha, ordenado por urgencia —en riesgo primero— y por avance; muestra hasta seis y dice cuántos quedan, con un enlace a Seguimiento.
- **Graduados de {área}**: quién ya terminó.
- **Atención requerida**: quien está en riesgo y quien **no tiene ruta**.
- **Actividad reciente** de su equipo.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑040 | El equipo se arma con las personas que dependen del líder | Oblig. | Un área con dos líderes muestra a cada uno solo su gente |
| RF‑ONB‑041 | «Atención requerida» suma a quien está en riesgo y a quien no tiene ruta | Oblig. | Un ingreso sin ruta aparece con su motivo |
| RF‑ONB‑042 | Las listas se ordenan por urgencia y muestran hasta seis | Import. | Con nueve personas, dice «Ver los 3 restantes en Seguimiento» y lleva ahí |
| RF‑ONB‑043 | Cada persona se abre en su detalle | Oblig. | Tocar un nombre abre su onboarding |

> **En la maqueta:** «Ver los restantes en Seguimiento» lleva a una dirección que no existe, y la actividad reciente es fija.

### 3.11 Seguimiento y Rutas de mi área

- **Seguimiento — {área}**: los onboardings de su área, en tarjetas. Las mismas acciones que Recursos Humanos sobre cada uno —ver detalles, asignar o cambiar el buddy, enviar recordatorio, pausar o reanudar—, sin el botón de asignar rutas —BR‑ONB‑051—.
- **Detalle de un onboarding**: el mismo de Recursos Humanos, solo para su área —BR‑ONB‑048—.
- **Rutas — {área}**: las rutas de su área, sin la ruta general. Puede editarlas, duplicarlas y cambiar su estado; no crea rutas nuevas. En cada tarjeta, las **personas con acceso**: quién más puede editar esa ruta, que el líder agrega.
- **Extender un plazo**, si la empresa lo activó —BR‑ONB‑058—.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑044 | Seguimiento y Rutas muestran solo su área | Oblig. | Ana ve solo Marketing |
| RF‑ONB‑045 | No tiene «Asignar ruta a colaboradores» ni «Nueva ruta» | Oblig. | Los botones no están, tampoco en los estados vacíos |
| RF‑ONB‑046 | Agrega personas con acceso a una ruta de su área | Import. | Agregar a Laura le permite editarla |
| RF‑ONB‑047 | Extiende un plazo cuando la empresa lo permite | Import. | Queda en el historial con quién y cuándo |

### 3.12 Mi equipo en el celular

- En **Inicio**, el acceso **«Ver el onboarding de mi equipo»** con su área. En Zona HR › Onboarding, un menú con **Mi Onboarding** y **Seguimiento**, que dice cuántos necesitan atención.
- **Seguimiento**: su gente **agrupada por motivo** —Necesitan atención, Por comenzar, En curso, Pausados y Completados—. Solo el grupo más urgente empieza abierto; cada grupo muestra cinco y ofrece ver más.
- **Detalle**: avance, día, inicio, buddy y el recorrido, en solo lectura. Al tocar una tarea se ve de qué se trata, no las respuestas.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑048 | Los grupos sin nadie no se muestran | Import. | Sin pausados, no aparece «Pausados» |
| RF‑ONB‑049 | El grupo más urgente empieza abierto | Import. | Con alguien en riesgo, «Necesitan atención» está abierto y los demás cerrados |
| RF‑ONB‑050 | El celular y la web cuentan el mismo equipo | Oblig. | Los números del líder coinciden en los dos |

> **En la maqueta:** el celular arma el equipo por área y la web por jefe, así que el mismo líder ve números distintos. En el celular no tiene acciones: solo mira.

### Para El auxiliar

Quien ayuda al líder con el onboarding de su área, con acceso delegado.

### 3.13 Acceso delegado: Seguimiento y Rutas

- **Menú**: solo **Rutas** y **Seguimiento**; no tiene el Dashboard, Recursos corporativos ni Configuración avanzada —BR‑ONB‑068—.
- **Seguimiento** de su área, con las mismas acciones que el líder.
- **Rutas** de su área: las ve todas y **edita solo aquellas en las que figura entre las personas con acceso** —BR‑ONB‑050—. Sus tarjetas dicen «Acceso delegado por {líder}».
- Todo lo que registra nace en **su sucursal**, cuando su alcance está acotado a una.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑051 | El menú del auxiliar tiene solo Rutas y Seguimiento | Oblig. | Escribir la dirección del Dashboard o de la configuración lo devuelve |
| RF‑ONB‑052 | «Editar» aparece solo en las rutas a las que tiene acceso | Oblig. | Sin acceso, la ruta se puede ver y no editar |
| RF‑ONB‑053 | Su alcance respeta su área y su sucursal | Oblig. | Laura, acotada a La Paz, ve solo los onboardings de Marketing en La Paz |
| RF‑ONB‑054 | Su tarjeta dice quién le delegó el acceso | Deseable | «Acceso delegado por Ana Martínez Ruiz» |

> **En la maqueta:** su sucursal no se aplica, la lista de personas con acceso no se guarda al recargar, y escribir la dirección del Dashboard le muestra el de Recursos Humanos.

### Para El buddy

Un colaborador que ya se graduó y acompaña a una o varias personas nuevas. Ser buddy no da permisos de administración —BR‑ONB‑044—.

### 3.14 Mis acompañados

Su única pantalla de más, en **Mi espacio › Mis acompañados**.

- **Indicadores**: Acompañados («Onboardings que estás acompañando») y En riesgo.
- **Búsqueda** por nombre o área y **filtro** por estado.
- **Tarjeta de cada uno**: nombre, cargo, área, estado y «Avance de su onboarding».
- **Detalle**: su estado y avance; si está en riesgo, «Lleva más de 3 días sin actividad. Un mensaje tuyo puede desatascar el proceso»; y **«La ruta de {nombre}»**, su recorrido, para tocar cada tarea y ver de qué se trata.
- **Lo que no ve**, y la pantalla lo dice: las respuestas, las evaluaciones y los datos personales.
- **Sin acompañados**: «Todavía no acompañas a nadie… Cuando Recursos Humanos te asigne como buddy de alguien, esa persona aparecerá aquí».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑060 | Ve solo a las personas de las que es buddy | Oblig. | Diego ve a sus cuatro acompañados y a nadie más |
| RF‑ONB‑061 | El recorrido marca qué tareas hizo su acompañado | Oblig. | Las completadas se ven completadas |
| RF‑ONB‑062 | Una tarea con respuestas dice cuántas preguntas tiene, no las respuestas | Oblig. | «3 preguntas. Las respuestas las ve solo Recursos Humanos» |
| RF‑ONB‑063 | Su nota de privacidad está en la lista y en el detalle | Import. | Se lee en las dos pantallas |

> **En la maqueta:** en la web el recorrido del acompañado no marca qué tareas hizo.

### 3.15 Acompañar desde el celular

- En **Inicio**, el acceso **«Acompañar a mi gente»**, que dice cuántas personas acompaña y cuántas están en riesgo. En Zona HR › Onboarding, primero **Mis acompañados** y después **Mi Onboarding**, su ruta ya completada.
- **Mis acompañados**: «Tu gente · por urgencia», en riesgo primero; muestra hasta seis y ofrece ver más.
- **Detalle**: su ingreso, su avance y «Su recorrido · solo lectura».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑064 | La lista se ordena por urgencia | Oblig. | Quien está en riesgo va primero |
| RF‑ONB‑065 | El acceso de Inicio dice cuántos están en riesgo | Import. | «4 personas · 1 en riesgo →» |
| RF‑ONB‑066 | El buddy no tiene pestaña Onboarding propia | Import. | Entra por Inicio o por Zona HR |

> **En la maqueta:** el buddy no tiene acciones —ni mensaje ni recordatorio—: solo mira.

### Para El colaborador

La persona que hace su ruta, desde la web o desde el celular.

### 3.16 Mi Onboarding

La pantalla de la persona nueva, en Mi espacio; en el celular, su propia pestaña **Onboarding**, que existe solo mientras tiene una incorporación en curso —BR‑ONB‑060—.

- **Bienvenida**: «¡Hola, {nombre}!», cuántas etapas, tareas y puntos tiene, y «Empezar mi onboarding». Si vuelve, «¡Bienvenido de vuelta!», un resumen con su avance y la **siguiente tarea**.
- **El recorrido**: arriba, su ruta, sus puntos, cuántas tareas lleva y el porcentaje. Cada etapa con sus días y su avance, sus actividades y sus tareas como nodos en zigzag; cada nodo dice sus puntos y si es obligatorio. Al final, «Fin del onboarding».
- **Al costado**, en la web: la lista de etapas con su avance, y una ayuda —Completada, Pendiente, Bloqueada— con el consejo «Completa las tareas obligatorias para desbloquear la siguiente etapa».
- **Accesos**: «Ver historial» y «Ver organigrama».
- **Sin ruta todavía**: «Tu ruta de onboarding aún no ha sido configurada… Pronto recibirás tu recorrido personalizado».
- **Quien no tiene incorporación** —entró antes del sistema— ve que no tiene tareas pendientes.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑070 | Ve solo su propia ruta | Oblig. | No hay forma de abrir la ruta de otra persona |
| RF‑ONB‑071 | La siguiente etapa se abre al completar las obligatorias de la anterior | Oblig. | Una tarea de la etapa 2 está bloqueada mientras falta una obligatoria de la 1 |
| RF‑ONB‑072 | El resumen de regreso lleva a la siguiente tarea | Import. | «Continuar mi onboarding» abre la tarea pendiente |
| RF‑ONB‑073 | La pestaña Onboarding del celular se va al graduarse | Import. | Graduado, entra por Zona HR |

> **En la maqueta:** las etapas siguientes no se bloquean: se puede abrir cualquier tarea. Y «Ver organigrama» devuelve al colaborador a la misma pantalla, porque no tiene acceso a Organización.

### 3.17 Cómo se completa cada tipo de tarea

| Tipo | Qué ve | Cómo se completa |
| --- | --- | --- |
| **Video** | El video y, si la tiene, su prueba de verificación | Solo, al terminar el video y la prueba |
| **Audio** | El reproductor | Con «Marcar como completada» |
| **Documento** | El documento, para leer y descargar, y su prueba de verificación | Con «Marcar como completada», después de la prueba |
| **Prueba** | Las preguntas, una ronda entera | Al enviar las respuestas |
| **Completar perfil** | Las secciones de su ficha | Al enviar el perfil, con todas sus secciones revisadas |
| **Formulario** | Las preguntas, con las obligatorias marcadas | Solo, al enviarlo |
| **Cómo se siente** | Cinco caritas y un comentario opcional | Solo, al enviarlo; «Tu líder podrá ver tus respuestas para acompañarte mejor» |
| **Recorrido por área** | Las paradas, cada una con su guía | Con «Marcar como completada», después de marcar todas las paradas |
| **Subida de archivo** | Un lugar para cada documento pedido, con su formato | Con «Marcar como completada», después de subir lo pedido |
| **Otra tarea** | La lista de pasos | Con «Marcar como completada» |

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑074 | Lo que se puede comprobar se completa solo | Oblig. | El formulario queda completado al enviarlo, sin otro botón |
| RF‑ONB‑075 | «Marcar como completada» se habilita cuando corresponde | Oblig. | En un recorrido, recién con todas las paradas marcadas |
| RF‑ONB‑076 | Lo que responde y sube queda guardado | Oblig. | Recursos Humanos ve sus respuestas y archivos en el detalle |

> **En la maqueta:** lo que se responde y se sube no se guarda.

### 3.18 Graduación y Mi trayectoria

- Al completar todas las tareas: confeti y «¡Felicidades, {nombre}! Has completado todas las tareas de tu ruta de onboarding». La ruta queda **en solo lectura**: se puede volver a mirar con «Ver mi ruta completada», no desmarcar.
- Con el certificado activado, recibe su **certificado de graduación** —BR‑ONB‑059—.
- **Mi trayectoria**, desde «Ver historial»: cada proceso —el onboarding y cada reboarding— con su estado (En curso, Completado o Cerrado sin completar), sus fechas, su avance y su recorrido tal como lo hizo.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑077 | Graduado, la ruta queda en solo lectura | Oblig. | No hay «Desmarcar» |
| RF‑ONB‑078 | Mi trayectoria muestra cada proceso con su recorrido congelado | Oblig. | Un reboarding de 2024 muestra las etapas que tuvo entonces |
| RF‑ONB‑079 | El certificado se descarga desde su ruta completada | Import. | Lleva su folio |

### 3.19 Asistente IA

Si la empresa lo activa, una burbuja abre el **Asistente de onboarding** —«Responde sobre tus tareas y documentos»—, con preguntas sugeridas para empezar. Responde desde los documentos de Recursos corporativos y, si no encuentra la respuesta, lo dice —BR‑ONB‑066—. En el celular ocupa toda la pantalla.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ONB‑080 | El asistente aparece solo si la empresa lo activó | Oblig. | Apagado, no hay burbuja |
| RF‑ONB‑081 | Responde desde la biblioteca y dice cuando no sabe | Oblig. | Una pregunta sin respuesta en los documentos lo dice |

> **En la maqueta:** las respuestas son fijas, de ejemplo.

### Para Todo el módulo

### 3.20 Requisitos no funcionales

| Código | Requisito |
| --- | --- |
| RNF‑ONB‑01 | Todo lo que hacen el colaborador, el buddy y el líder funciona igual en la web y en el celular |
| RNF‑ONB‑02 | Una ruta con 30 etapas y 200 tareas se edita sin demoras perceptibles |
| RNF‑ONB‑03 | Cada cambio de estado de una ruta y de un onboarding queda registrado con quién y cuándo |
| RNF‑ONB‑04 | Las respuestas del colaborador solo las ve Recursos Humanos |
| RNF‑ONB‑05 | Los estados se distinguen por texto y no solo por color |

### 3.21 Cómo se escriben los textos

- Al colaborador se le habla de **tú**, con calidez: «¡Hola, Carlos!», «Tu aventura comienza aquí».
- A Recursos Humanos, con frases de acción: «Asignar ruta a colaboradores», «Desasignar ruta de onboarding».
- «Desasignar», nunca «Eliminar», para un onboarding: no se borra nada.
- «Sucursal», no «sede».

### 3.22 Fuera de alcance de esta versión

| Código | Qué queda fuera | Por qué |
| --- | --- | --- |
| FUERA‑ONB‑01 | Predictor de fuga | Pide datos de varios módulos que todavía no existen |
| FUERA‑ONB‑02 | Otros responsables de una tarea (buddy, jefe) | Hoy toda tarea la hace el colaborador —BR‑ONB‑026— |
| FUERA‑ONB‑03 | Firma de documentos dentro de una tarea | Vive en Documentación |
| FUERA‑ONB‑04 | Validación de tareas por un supervisor | «Otra tarea» se está redefiniendo —ABIERTA‑ONB‑05— |


## 04 · Reglas de negocio

*Las condiciones que el sistema cumple siempre. Primero las de Recursos Humanos, en el orden en que vive una ruta: se define, se activa, se arma, se asigna y se sigue; después las del líder, la biblioteca, la configuración y las del colaborador. Todas se leen igual, en cuatro apartados, y cada una dice de qué regla del documento anterior viene —RN‑M—.*

### Para Recursos Humanos

Las condiciones de las pantallas de Recursos Humanos, por tema.

### La ruta y sus estados

*Qué es una ruta y por dónde pasa*

#### 4.1 · BR-ONB-001 · Una ruta se define para un puesto: sucursal, área y cargos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-001
- **Grupo:** La ruta y sus estados
- **Qué gobierna:** Ruta
- **Antes:** RN‑M10
- **Estado:** Borrador

*Descripción general*

Toda ruta, salvo la general, apunta a un **puesto**: una sucursal, un área y uno o más cargos. Con eso el sistema sabe a quién le toca: a quien llega a ese cargo en esa sucursal. El nombre, el tipo, el área y al menos un cargo son obligatorios; la sucursal puede ser «Todas las sucursales».

**2. Escenarios ágiles de ejecución**

*Una ruta sin cargo no se puede crear*

- **Dado que** se está creando una ruta del área Ventas
- **Cuando** no se elige ningún cargo
- **Entonces** «Crear y diseñar ruta» no se activa y el campo «Cargos» lo dice

**3. Condiciones y excepciones**

- La ruta general solo pide un nombre: vale para toda la empresa.
- Una ruta puede apuntar a varios cargos del mismo área.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.2 · BR-ONB-002 · Toda ruta nace en Borrador, también las copias

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-002
- **Grupo:** La ruta y sus estados
- **Qué gobierna:** Ruta
- **Antes:** RN‑M67
- **Estado:** Borrador

*Descripción general*

Una ruta nueva —creada de cero, desde una plantilla o duplicando otra— empieza en **Borrador**, sin etapas propias. Así nadie la recibe por accidente mientras se arma.

**2. Escenarios ágiles de ejecución**

*Duplicar no copia el estado*

- **Dado que** «Ventas — Ejecutivo» está Activa
- **Cuando** se elige «Duplicar»
- **Entonces** aparece «Ventas — Ejecutivo (copia)» en Borrador
- **Y** la original sigue Activa

**3. Condiciones y excepciones**

- Una ruta en Borrador no se asigna a nadie, ni a mano ni automáticamente.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑023
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.3 · BR-ONB-003 · Una ruta está Activa, Inactiva o en Borrador

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-003
- **Grupo:** La ruta y sus estados
- **Qué gobierna:** Ruta · Estado
- **Antes:** RN‑M55, RN‑M12
- **Estado:** Borrador

*Descripción general*

| Estado | Qué significa |
| --- | --- |
| **Activo** | Los ingresos nuevos de su puesto la reciben, y se puede asignar a mano |
| **Inactivo** | Deja de asignarse. Quienes ya la están haciendo la terminan igual |
| **Borrador** | En construcción. No se asigna a nadie |

«Ruta general» no es un estado: es una marca que se le pone a una ruta —BR‑ONB‑013—. El estado «Archivado» del documento anterior se unió a **Inactivo**: una ruta inactiva es el archivo del sistema.

**2. Escenarios ágiles de ejecución**

*Una ruta activa puede no tener a nadie*

- **Dado que** la ruta de «Analista de Tesorería» está Activa
- **Cuando** nadie entró a ese cargo este año
- **Entonces** sigue Activa con cero colaboradores: está lista para el próximo ingreso

**3. Condiciones y excepciones**

- Una ruta guardada con el estado viejo «Archivada» se lee como Inactiva.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.4 · BR-ONB-004 · Solo tres cambios de estado, y nunca se vuelve a Borrador

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-004
- **Grupo:** La ruta y sus estados
- **Qué gobierna:** Ruta · Estado
- **Antes:** RN‑M62
- **Estado:** Borrador

*Descripción general*

Una ruta pasa de **Borrador a Activo**, de **Activo a Inactivo** y de **Inactivo a Activo**. Nada más. Una ruta que ya se usó no vuelve a Borrador: dejaría de existir para quienes la hicieron. «Cambiar estado» ofrece solo los destinos posibles desde el estado actual.

> **Diagrama · Los estados de una ruta.** Borrador pasa a Activo (con al menos una tarea). Activo pasa a Inactivo (a mano, o al ser reemplazada por otra ruta del mismo puesto). Inactivo vuelve a Activo. Ninguna flecha vuelve a Borrador. En la versión HTML está dibujado.

**2. Escenarios ágiles de ejecución**

*Una ruta activa no se pasa a borrador*

- **Dado que** una ruta está Activa
- **Cuando** se abre «Cambiar estado»
- **Entonces** solo se ofrece «Inactivo»

**3. Condiciones y excepciones**

- Para salir de Borrador hace falta al menos una tarea —BR‑ONB‑005—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.5 · BR-ONB-005 · Para activar una ruta hace falta al menos una tarea

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-005
- **Grupo:** La ruta y sus estados
- **Qué gobierna:** Ruta · Activación
- **Antes:** RN‑M66
- **Estado:** Borrador

*Descripción general*

Una ruta sin ninguna tarea no se puede activar: no habría nada que hacer. Una tarea alcanza. Las etapas o actividades vacías no lo impiden: se avisan.

**2. Escenarios ágiles de ejecución**

*Un borrador vacío no se activa*

- **Dado que** un borrador tiene dos etapas y ninguna tarea
- **Cuando** se abre «Cambiar estado»
- **Entonces** dice que le falta al menos una tarea y ofrece «Agregar tareas»

**3. Condiciones y excepciones**

- Las tareas que vienen de la ruta general no cuentan: la ruta tiene que tener al menos una propia.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.6 · BR-ONB-006 · Una ruta que ya se asignó no se borra: se pone en Inactivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-006
- **Grupo:** La ruta y sus estados
- **Qué gobierna:** Ruta · Eliminación
- **Antes:** P‑26
- **Estado:** Borrador

*Descripción general*

Solo se elimina de verdad una ruta que **nunca se asignó a nadie**. Una que se asignó alguna vez —aunque esa persona ya haya terminado— guarda el registro de lo que alguien hizo: para sacarla de circulación se pone en **Inactivo**.

**2. Escenarios ágiles de ejecución**

*La ruta usada ofrece Inactivo en vez de borrarse*

- **Dado que** una ruta se asignó a 4 personas
- **Cuando** se elige «Eliminar»
- **Entonces** aparece «No se puede eliminar» con el motivo y el botón «Poner en Inactivo»

**3. Condiciones y excepciones**

- Una ruta Inactiva tampoco se elimina: ya es el archivo.
- Eliminar un borrador sin uso pide escribir «eliminar».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑022
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.7 · BR-ONB-007 · Una ruta es de onboarding o de reboarding

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-007
- **Grupo:** La ruta y sus estados
- **Qué gobierna:** Ruta · Tipo
- **Antes:** RN‑M11, RN‑080
- **Estado:** Borrador

*Descripción general*

El tipo dice para quién es: **onboarding**, para quien entra a la empresa; **reboarding**, para quien ya está y cambia de puesto, de área, de sucursal o vuelve de una licencia. Desde el directorio, a quien ya se graduó se le ofrece «Asignar ruta de reboarding», y la lista muestra solo rutas de ese tipo.

**2. Escenarios ágiles de ejecución**

*A un graduado se le ofrece reboarding*

- **Dado que** Nicolás se graduó de su onboarding
- **Cuando** se abre su menú en el directorio
- **Entonces** dice «Asignar ruta de reboarding» y lista solo rutas de reboarding

**3. Condiciones y excepciones**

- Si un puesto puede tener a la vez una ruta activa de onboarding y otra de reboarding está por decidir —ABIERTA‑ONB‑02—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑03
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

### Un puesto, una ruta

*Qué pasa cuando dos rutas quieren el mismo puesto*

#### 4.8 · BR-ONB-008 · Un puesto tiene una sola ruta activa

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-008
- **Grupo:** Un puesto, una ruta
- **Qué gobierna:** Ruta · Unicidad
- **Antes:** RN‑M55, RN‑M60
- **Estado:** Borrador

*Descripción general*

Por cada **cargo en cada sucursal** hay una sola ruta activa: si hubiera dos, no se sabría cuál darle a quien llega. Compartir un solo cargo ya es choque. Una ruta para «Todas las sucursales» no choca con una de una sucursal en particular: al asignar, gana la más específica.

**2. Escenarios ágiles de ejecución**

*La ruta de la sucursal gana a la general de la empresa*

- **Dado que** «Ejecutivo comercial» tiene una ruta activa para todas las sucursales y otra para La Paz
- **Cuando** entra un ejecutivo comercial en La Paz
- **Entonces** recibe la de La Paz

**3. Condiciones y excepciones**

- Una ruta sin cargos no ocupa ningún puesto.
- Solo puede haber una ruta general activa.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑021
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.9 · BR-ONB-009 · Activar sobre un puesto ocupado reemplaza la ruta anterior

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-009
- **Grupo:** Un puesto, una ruta
- **Qué gobierna:** Ruta · Activación
- **Antes:** RN‑M60
- **Estado:** Borrador

*Descripción general*

Si el puesto está libre, la ruta se activa directo. Si ya tiene una ruta vigente, se pide confirmar el **reemplazo**: la ventana dice qué ruta sale de circulación, cuál queda vigente y cuántas personas siguen con la anterior hasta terminar. La anterior pasa a **Inactivo** y queda anotado por cuál fue reemplazada y cuándo.

**2. Escenarios ágiles de ejecución**

*Reemplazar deja a cada uno con la suya*

- **Dado que** «Ventas v1» está activa para Ejecutivo comercial y 3 personas la están haciendo
- **Cuando** se activa «Ventas v2» para el mismo puesto y se confirma «Reemplazar ruta»
- **Entonces** «Ventas v1» pasa a Inactivo con «Reemplazada por Ventas v2»
- **Y** las 3 personas la terminan; los ingresos nuevos reciben «Ventas v2»

**3. Condiciones y excepciones**

- La marca «Reemplazada por…» se borra en el próximo cambio de estado manual.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑021
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.10 · BR-ONB-010 · El choque se avisa al crear la ruta, no se bloquea

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-010
- **Grupo:** Un puesto, una ruta
- **Qué gobierna:** Ruta · Creación
- **Antes:** P‑20
- **Estado:** Borrador

*Descripción general*

Si al crear una ruta el puesto ya tiene una vigente, el formulario lo dice en el momento: **ahora** se crea en Borrador y no cambia nada; **al activarla**, la otra pasará a Inactivo. Avisar antes evita la sorpresa; bloquear impediría preparar con tiempo la ruta que va a reemplazar a otra.

**2. Escenarios ágiles de ejecución**

*Se puede preparar el reemplazo*

- **Dado que** Analista de Marketing ya tiene una ruta activa
- **Cuando** se crea otra para el mismo cargo
- **Entonces** el formulario avisa del choque y la ruta se crea en Borrador

**3. Condiciones y excepciones**

- El aviso no se repite en el constructor: vuelve al activar.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑021
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.11 · BR-ONB-011 · Sacar una ruta de Activo no interrumpe a nadie

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-011
- **Grupo:** Un puesto, una ruta
- **Qué gobierna:** Ruta · Asignación
- **Antes:** RN‑M65
- **Estado:** Borrador

*Descripción general*

Cuando una ruta deja de estar activa —por reemplazo o a mano— solo dejan de recibirla los ingresos nuevos. Quien la está haciendo **la termina igual**, con la versión que empezó. Antes de confirmar, se muestra a cuántas personas les toca.

**2. Escenarios ágiles de ejecución**

*Quien estaba adentro sigue*

- **Dado que** Valentina va por el día 10 de una ruta
- **Cuando** esa ruta pasa a Inactivo
- **Entonces** Valentina sigue su recorrido sin cambios

**3. Condiciones y excepciones**

- Nadie cambia de ruta a mitad de camino.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑021
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

#### 4.12 · BR-ONB-012 · Cambiar el puesto de una ruta activa es mudarla

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-012
- **Grupo:** Un puesto, una ruta
- **Qué gobierna:** Ruta · Alcance
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

Cambiar la sucursal, el área o los cargos de una ruta **activa** la muda de puesto: deja el anterior y puede chocar con la ruta del nuevo. Por eso se confirma, y solo cuando de verdad pasa algo: si el nuevo puesto está ocupado, se ofrece mover y reemplazar; si la ruta se queda sin cargos, se avisa que sigue activa pero no le llega a nadie.

**2. Escenarios ágiles de ejecución**

*Mudar a un puesto ocupado pide reemplazar*

- **Dado que** una ruta activa de Diseño se cambia al cargo «UX Researcher», que ya tiene ruta
- **Cuando** se guarda el cambio
- **Entonces** se pide confirmar «Mover y reemplazar»

**3. Condiciones y excepciones**

- Quien la está haciendo sigue con su versión; pasa a figurar con el puesto nuevo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑021
- **Historia de usuario:** HU‑ONB‑02
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

### La ruta general

*Lo común a toda la empresa, escrito una vez*

#### 4.13 · BR-ONB-013 · Hay una sola ruta general, y sus etapas van primero y protegidas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-013
- **Grupo:** La ruta general
- **Qué gobierna:** Ruta general
- **Antes:** RN‑M13
- **Estado:** Borrador

*Descripción general*

Una ruta marcada como **general** antepone sus etapas a todas las rutas activas, sin importar cargo, área ni sucursal. En las demás rutas esas etapas aparecen **bloqueadas**: se editan solo en la ruta general. Hay una sola: para poner otra, primero se quita la marca a la actual.

**2. Escenarios ágiles de ejecución**

*Las etapas generales aparecen en cada ruta*

- **Dado que** «Inducción general» es la ruta general activa, con 1 etapa
- **Cuando** se abre la ruta de Ventas en el constructor
- **Entonces** la primera etapa es la de «Inducción general», bloqueada, agrupada como «De la ruta general»

*No hay dos rutas generales*

- **Dado que** ya hay una ruta general
- **Cuando** se marca otra como general
- **Entonces** se avisa «Ya hay una ruta general» y se indica quitarla primero

**3. Condiciones y excepciones**

- Una ruta general inactiva no se antepone a nadie.
- Su alcance es la suma de quienes hacen las rutas activas.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑04
- **Pantalla:** W‑ONB‑05 Rutas · W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.14 · BR-ONB-014 · Cada ruta puede no incluir la ruta general

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-014
- **Grupo:** La ruta general
- **Qué gobierna:** Ruta · Ruta general
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

Un reboarding o una ruta de una sola tarea no necesita volver a pasar por la inducción de la empresa. Por eso cada ruta tiene un interruptor **«Incluir la ruta general»**, encendido por defecto.

**2. Escenarios ágiles de ejecución**

*Un reboarding sin la inducción*

- **Dado que** la ruta «Ascenso a supervisor» tiene el interruptor apagado
- **Cuando** se abre en el constructor
- **Entonces** no muestra las etapas de la ruta general

**3. Condiciones y excepciones**

- El interruptor no cambia la ruta general: solo esta ruta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑04
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.15 · BR-ONB-015 · La ruta general la administra solo Recursos Humanos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-015
- **Grupo:** La ruta general
- **Qué gobierna:** Ruta general · Permisos
- **Antes:** P‑30
- **Estado:** Borrador

*Descripción general*

Poner o quitar la marca de ruta general, y crear una, es de Recursos Humanos: afecta a toda la empresa. El líder y el auxiliar no ven la ruta general en su lista de rutas.

**2. Escenarios ágiles de ejecución**

*El líder no la ve*

- **Dado que** Ana es líder de Marketing
- **Cuando** abre Rutas
- **Entonces** ve las rutas de Marketing y no la ruta general

**3. Condiciones y excepciones**

- Las etapas de la ruta general sí se ven, bloqueadas, dentro de las rutas del área.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑04
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Prototipado

### El constructor y el guardado

*Cómo se arma y cómo se guarda una ruta*

#### 4.16 · BR-ONB-016 · Etapa, actividad y tarea: ninguna tarea va suelta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-016
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Etapa · Actividad · Tarea
- **Antes:** RN‑M14
- **Estado:** Borrador

*Descripción general*

Una ruta se arma en etapas; cada etapa, en actividades; cada actividad, en tareas. Una tarea siempre va dentro de una actividad. Eliminar una actividad no borra sus tareas: pasan a la actividad vecina.

**2. Escenarios ágiles de ejecución**

*Una etapa sin actividad no recibe tareas*

- **Dado que** una etapa no tiene actividades
- **Cuando** se mira la paleta de tipos de tarea
- **Entonces** avisa que las tareas van dentro de una actividad

**3. Condiciones y excepciones**

- Las etapas se reordenan arrastrándolas; las bloqueadas de la ruta general no se mueven.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.17 · BR-ONB-017 · Cada etapa dura días, y sus tareas se planifican dentro de ellos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-017
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Etapa · Tarea · Plazos
- **Antes:** RN‑M22, RN‑M28
- **Estado:** Borrador

*Descripción general*

Una etapa tiene una **duración en días** —siete por defecto— y las etapas se suceden: la primera va del día 1 al 7, la siguiente del 8 en adelante. Cada tarea dice **en qué días se hace**, siempre dentro del tramo de su etapa. La duración de la ruta es la suma de sus etapas.

**2. Escenarios ágiles de ejecución**

*No se planifica fuera de la etapa*

- **Dado que** la etapa «Conoce el equipo» va del día 8 al 15
- **Cuando** se planifica una tarea suya
- **Entonces** solo se pueden elegir días entre el 8 y el 15

**3. Condiciones y excepciones**

- Cambiar la duración de una etapa corre los días de las siguientes.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑07 Propiedades de la tarea
- **Diseño:** Prototipado

#### 4.18 · BR-ONB-018 · La ruta se guarda a mano, y salir con cambios pregunta antes

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-018
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Constructor · Guardado
- **Antes:** RN‑M67
- **Estado:** Borrador

*Descripción general*

El constructor **no guarda solo**: una ruta a medio armar no tiene que llegarle a nadie. Hay un solo botón, **Guardar ruta** en un borrador y **Guardar cambios** en las demás, que se activa cuando hay algo que guardar. Irse con cambios pendientes pregunta antes.

**2. Escenarios ágiles de ejecución**

*Salir sin guardar avisa*

- **Dado que** se agregó una tarea y no se guardó
- **Cuando** se toca otra entrada del menú
- **Entonces** aparece «Cambios sin guardar» con guardar, salir sin guardar o seguir editando

**3. Condiciones y excepciones**

- Arriba se ve si hay cambios: «Sin guardar» o «Guardado».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑032
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.19 · BR-ONB-019 · Guardar nunca cambia el estado de la ruta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-019
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Constructor · Estado
- **Antes:** RN‑M64
- **Estado:** Borrador

*Descripción general*

El constructor arma; activar es de Rutas. Guardar un borrador no lo activa y guardar una ruta activa no la desactiva. Mezclar las dos cosas en un botón hacía que alguien activara una ruta sin querer.

**2. Escenarios ágiles de ejecución**

*Un borrador guardado sigue en borrador*

- **Dado que** se terminó de armar un borrador
- **Cuando** se pulsa «Guardar ruta»
- **Entonces** sigue en Borrador hasta activarlo desde Rutas

**3. Condiciones y excepciones**

- Guardar un borrador no crea versiones —BR‑ONB‑020—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.20 · BR-ONB-020 · Cambiar una ruta que ya se usó crea una versión nueva

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-020
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Ruta · Versiones
- **Antes:** RN‑M17, RN‑M64
- **Estado:** Borrador

*Descripción general*

Si una ruta se asignó alguna vez —aunque esa persona ya haya terminado—, guardar cambios crea la **versión siguiente**: la anterior queda intacta para quien la hizo. Si nunca se asignó, se actualiza la misma versión. El historial de versiones muestra cada una con su fecha, su autor, sus etapas y tareas, y cuántas personas la están haciendo.

**2. Escenarios ágiles de ejecución**

*La versión anterior no se pierde*

- **Dado que** la versión 2 de una ruta la hicieron 5 personas
- **Cuando** se le agrega una tarea y se guarda
- **Entonces** queda la versión 3 como actual y la 2 sigue en el historial

**3. Condiciones y excepciones**

- Un borrador nunca versiona.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑031
- **Historia de usuario:** HU‑ONB‑05
- **Pantalla:** W‑ONB‑05 Rutas · W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.21 · BR-ONB-021 · Al cambiar una ruta con gente adentro, se elige quién recibe los cambios

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-021
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Ruta · Versiones · Asignación
- **Antes:** RN‑M61, P‑21
- **Estado:** Borrador

*Descripción general*

Si la ruta está activa y hay personas que todavía no la terminaron, guardar pregunta **¿Quién recibe los cambios?**: **solo los futuros colaboradores** —lo recomendado— o **también los que siguen adentro**. Con la segunda, quienes no terminaron pasan a la versión nueva.

**2. Escenarios ágiles de ejecución**

*Por defecto, solo los nuevos*

- **Dado que** 3 personas están haciendo una ruta activa
- **Cuando** se guarda un cambio y se elige «Solo a los futuros colaboradores»
- **Entonces** las 3 siguen con su versión y los próximos reciben la nueva

**3. Condiciones y excepciones**

- La pregunta solo aparece en una ruta activa con gente sin terminar.
- Qué pasa con las tareas ya completadas al pasar a alguien de versión está por definir —ABIERTA‑ONB‑03—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑031
- **Historia de usuario:** HU‑ONB‑05
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.22 · BR-ONB-022 · Quien ya empezó conserva la versión con la que empezó

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-022
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Asignación · Versiones
- **Antes:** RN‑M65
- **Estado:** Borrador

*Descripción general*

Al asignar una ruta, la asignación se queda con la versión de ese día y una **copia congelada** de sus etapas. Editar la ruta después no le mueve el camino a nadie, salvo que se elija explícitamente pasar a los que siguen adentro —BR‑ONB‑021—.

**2. Escenarios ágiles de ejecución**

*Un cambio no aparece en un recorrido empezado*

- **Dado que** Andrea hace la versión 1 de su ruta
- **Cuando** se agrega una etapa y se guarda solo para los futuros
- **Entonces** el recorrido de Andrea no tiene la etapa nueva

**3. Condiciones y excepciones**

- El detalle de cada onboarding dice qué versión de la ruta está haciendo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑031
- **Historia de usuario:** HU‑ONB‑05
- **Pantalla:** W‑ONB‑03 Detalle
- **Diseño:** Prototipado

#### 4.23 · BR-ONB-023 · Una ruta puede empezar desde una plantilla o desde otra ruta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-023
- **Grupo:** El constructor y el guardado
- **Qué gobierna:** Constructor
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

En vez de empezar en blanco, el constructor ofrece **plantillas** —una por área y una de bienvenida general— o **copiar otra ruta** existente. Lo elegido reemplaza las etapas propias de la ruta; las de la ruta general vuelven a anteponerse.

**2. Escenarios ágiles de ejecución**

*Partir de la plantilla del área*

- **Dado que** se creó una ruta vacía de Tecnología
- **Cuando** se elige la plantilla de Tecnología
- **Entonces** la ruta queda con sus etapas, actividades y tareas, lista para ajustar

**3. Condiciones y excepciones**

- Si la ruta ya tenía etapas propias, se reemplazan.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

### Las tareas

*Qué se le puede pedir a la persona y cómo*

#### 4.24 · BR-ONB-024 · Hay diez tipos de tarea

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-024
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Tipo
- **Antes:** RN‑M15, RN‑M31
- **Estado:** Borrador

*Descripción general*

Completar perfil, Video, Audio o podcast, Documento o PDF, Prueba, Formulario, Subida de archivo, Otra tarea, Recorrido por área y Cómo se siente —3.7—. Cada uno tiene su editor y se completa a su manera —BR‑ONB‑063—.

**2. Escenarios ágiles de ejecución**

*La paleta muestra los diez*

- **Dado que** una etapa tiene una actividad
- **Cuando** se mira la paleta de tipos de tarea
- **Entonces** están los diez, para arrastrar o agregar con un clic

**3. Condiciones y excepciones**

- Las tareas viejas de tipos retirados —lectura, enlace, confirmación, formulario práctico— se siguen mostrando a quien ya las tiene.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.25 · BR-ONB-025 · «Completar perfil» va una sola vez por ruta y se cumple con la ficha

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-025
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Completar perfil
- **Antes:** RN‑M19, P‑02
- **Estado:** Borrador

*Descripción general*

«Completar perfil» no es un formulario que se arma: lo que la da por hecha son **los datos de la ficha del colaborador**. Por eso solo puede estar una vez en una ruta, contando las etapas de la ruta general; dos serían la misma tarea.

**2. Escenarios ágiles de ejecución**

*No se agrega dos veces*

- **Dado que** la ruta general ya tiene «Completar perfil»
- **Cuando** se agrega otra en la ruta de Ventas
- **Entonces** se explica que ya está y no se agrega

**3. Condiciones y excepciones**

- No se puede duplicar.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑033
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑06 Constructor
- **Diseño:** Prototipado

#### 4.26 · BR-ONB-026 · Toda tarea la hace el colaborador

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-026
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Responsable
- **Antes:** RN‑M25, P‑07
- **Estado:** Borrador

*Descripción general*

«¿Quién realiza la tarea?» está fijo en **Colaborador** en esta versión. Que una tarea la haga el buddy o el jefe queda para después —FUERA‑ONB‑02—. El guía de un recorrido acompaña, pero no hace la tarea.

**2. Escenarios ágiles de ejecución**

*El responsable no se cambia*

- **Dado que** se edita cualquier tarea
- **Cuando** se mira «¿Quién realiza la tarea?»
- **Entonces** dice «Colaborador» y no se puede cambiar

**3. Condiciones y excepciones**

- Una «Otra tarea» guarda siempre al colaborador como responsable.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑07 Propiedades de la tarea
- **Diseño:** Prototipado

#### 4.27 · BR-ONB-027 · La prueba de comprensión es una tarea propia, justo después de su contenido

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-027
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Prueba
- **Antes:** RN‑M23, RN‑M29
- **Estado:** Borrador

*Descripción general*

Un video, un audio o un documento pueden llevar una **prueba de comprensión**, que se habilita cuando ya tienen contenido. Al guardarla se vuelve su propia tarea, «Prueba — {nombre}», con su lugar en el orden y sus puntos, justo después del contenido.

**2. Escenarios ágiles de ejecución**

*La prueba aparece como nodo*

- **Dado que** el video «Bienvenida» tiene contenido
- **Cuando** se le activa la prueba y se guarda
- **Entonces** aparece la tarea «Prueba — Bienvenida» a continuación

**3. Condiciones y excepciones**

- Las preguntas son de opción múltiple, con la respuesta correcta marcada.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑01
- **Pantalla:** W‑ONB‑07 Propiedades de la tarea
- **Diseño:** Prototipado

#### 4.28 · BR-ONB-028 · Una prueba se aprueba con todo bien, y se puede intentar sin límite

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-028
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Prueba
- **Antes:** RN‑M63, RN‑M27
- **Estado:** Borrador

*Descripción general*

Una prueba se aprueba con el **100 %**. Si falla, la persona repite la ronda entera, sin límite de intentos y sin quedar «reprobada». Los puntos son fijos. Cuántos intentos hizo lo ve solo Recursos Humanos.

**2. Escenarios ágiles de ejecución**

*Reintentar no penaliza*

- **Dado que** Carlos respondió mal una de tres preguntas
- **Cuando** ve el resultado
- **Entonces** puede reintentar la prueba completa y gana los mismos puntos al aprobarla

**3. Condiciones y excepciones**

- Fallar no corre los plazos: la tarea sigue vencida si se pasó su día.

> **En la maqueta:** la prueba de verificación del video pide 70 % y la prueba suelta no tiene umbral; hay que alinearlas con esta regla —ABIERTA‑ONB‑04—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑13 Tarea
- **Diseño:** Parcial

#### 4.29 · BR-ONB-029 · Ni el formulario ni el pulso se califican

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-029
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Formulario · Cómo se siente
- **Antes:** RN‑M32, RN‑M33, RN‑M37
- **Estado:** Borrador

*Descripción general*

Un **formulario** recoge información —texto corto, párrafo, opción múltiple, casillas, desplegable— con preguntas obligatorias o no. **Cómo se siente** pregunta con cinco caritas, con preguntas sugeridas. Ninguno tiene respuestas correctas ni lleva prueba de comprensión.

**2. Escenarios ágiles de ejecución**

*El formulario se completa al enviarlo*

- **Dado que** Carlos respondió las preguntas obligatorias del formulario bancario
- **Cuando** pulsa «Enviar formulario»
- **Entonces** la tarea queda completada

**3. Condiciones y excepciones**

- Las respuestas las ve Recursos Humanos; el líder ve las del pulso.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑13 Tarea
- **Diseño:** Prototipado

#### 4.30 · BR-ONB-030 · Lo que sube el colaborador va a su expediente

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-030
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Subida de archivo
- **Antes:** RN‑M34, RN‑M52
- **Estado:** Borrador

*Descripción general*

En una **Subida de archivo**, Recursos Humanos lista qué documentos pide y en qué formato, y la persona los sube. Cada archivo va a su expediente, en una carpeta **«Onboarding»** con una subcarpeta por tarea, y se puede ver y descargar desde Seguimiento. Moverlo o borrarlo es solo de Recursos Humanos.

**2. Escenarios ágiles de ejecución**

*El archivo llega al expediente*

- **Dado que** la tarea pide «Certificado de antecedentes» en PDF
- **Cuando** Carlos lo sube y completa la tarea
- **Entonces** el archivo queda en su expediente › Onboarding › {tarea}

**3. Condiciones y excepciones**

- El formato debería poder ser más de uno por documento —ABIERTA‑ONB‑06—.

> **En la maqueta:** la subida no guarda el archivo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑13 Tarea
- **Diseño:** A construir

#### 4.31 · BR-ONB-031 · Las tareas de contenido toman sus archivos de Recursos corporativos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-031
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Recursos corporativos
- **Antes:** RN‑M24, RN‑M26, RN‑M40, RN‑M53
- **Estado:** Borrador

*Descripción general*

Un video, un audio o un documento se toman de **Recursos corporativos**, de un enlace o de un archivo que se sube en el momento. Lo que se sube desde la tarea queda también en la biblioteca —si no hay carpeta, se crea «Documentos de onboarding»— y un enlace externo se puede guardar allá. La tarea apunta al material; no guarda una copia.

**2. Escenarios ágiles de ejecución**

*El material se reutiliza*

- **Dado que** «Manual de funciones» está en la carpeta Políticas
- **Cuando** se usa en dos rutas
- **Entonces** las dos apuntan al mismo documento

**3. Condiciones y excepciones**

- Cambiar el material en la biblioteca lo cambia en todas las tareas que lo usan.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑07
- **Pantalla:** W‑ONB‑07 Propiedades · W‑ONB‑08 Recursos
- **Diseño:** Prototipado

#### 4.32 · BR-ONB-032 · Cada tarea da puntos, y solo se ven con gamificación

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-032
- **Grupo:** Las tareas
- **Qué gobierna:** Tarea · Puntos
- **Antes:** RN‑M18
- **Estado:** Borrador

*Descripción general*

Cada tarea vale **puntos** —diez por defecto—. Se muestran solo si la gamificación está encendida en la empresa y en la ruta. Los puntos de la persona son la suma de sus tareas completadas.

**2. Escenarios ágiles de ejecución**

*Sin gamificación no hay puntos*

- **Dado que** la ruta tiene la gamificación apagada
- **Cuando** se mira el constructor
- **Entonces** las tareas no muestran sus puntos

**3. Condiciones y excepciones**

- Todas las tareas son obligatorias —RN‑M59—; el campo «obligatoria» que guarda cada tarea no tiene control en el editor —ABIERTA‑ONB‑07—.

> **En la maqueta:** Mi Onboarding muestra los puntos aunque la gamificación esté apagada.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑08
- **Pantalla:** W‑ONB‑06 Constructor · W‑ONB‑12 Mi Onboarding
- **Diseño:** Parcial

### Asignar

*Cómo le llega una ruta a una persona*

#### 4.33 · BR-ONB-033 · Asignar pide una ruta, una o más personas y una fecha de inicio

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-033
- **Grupo:** Asignar
- **Qué gobierna:** Asignación
- **Antes:** RN‑M05
- **Estado:** Borrador

*Descripción general*

Se asigna **una ruta activa** a **una o varias personas** desde **una fecha**. La misma ventana sirve para una persona o para un grupo. La asignación nace con la versión vigente de la ruta y su copia congelada —BR‑ONB‑022—.

**2. Escenarios ágiles de ejecución**

*Asignar a varios de una vez*

- **Dado que** entran tres ejecutivos comerciales el lunes
- **Cuando** se elige su ruta, los tres y el lunes, y se pulsa «Asignar a 3 colaboradores»
- **Entonces** aparecen los tres en Seguimiento como Programados

**3. Condiciones y excepciones**

- Solo se asignan rutas activas.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑04 Asignar
- **Diseño:** Prototipado

#### 4.34 · BR-ONB-034 · Elegir la ruta filtra a las personas por su área

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-034
- **Grupo:** Asignar
- **Qué gobierna:** Asignación
- **Antes:** RN‑M06
- **Estado:** Borrador

*Descripción general*

Al elegir la ruta, la lista de personas muestra las del área de esa ruta: es lo más probable. Se puede ampliar con los filtros de sucursal, área, cargo y fecha de ingreso.

**2. Escenarios ágiles de ejecución**

*La lista se acota sola*

- **Dado que** se elige una ruta de Marketing
- **Cuando** se mira la columna de personas
- **Entonces** aparecen las de Marketing

**3. Condiciones y excepciones**

- Una persona que ya tiene un onboarding en curso no se ofrece.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑04 Asignar
- **Diseño:** Prototipado

#### 4.35 · BR-ONB-035 · La fecha de inicio no puede ser pasada

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-035
- **Grupo:** Asignar
- **Qué gobierna:** Asignación · Fechas
- **Antes:** RN‑M07
- **Estado:** Borrador

*Descripción general*

El onboarding empieza hoy o más adelante. Si la persona ya ingresó, se le pone una fecha de hoy en adelante: empezar en el pasado la dejaría atrasada desde el primer minuto.

**2. Escenarios ágiles de ejecución**

*Un ingreso de la semana pasada empieza hoy*

- **Dado que** Camila ingresó hace 5 días
- **Cuando** se le asigna una ruta
- **Entonces** se avisa que su ingreso ya pasó y la fecha mínima es hoy

**3. Condiciones y excepciones**

- La fecha es la misma para todos los elegidos en una asignación.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑04 Asignar
- **Diseño:** Prototipado

#### 4.36 · BR-ONB-036 · Con inicio en el futuro, el onboarding queda Programado

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-036
- **Grupo:** Asignar
- **Qué gobierna:** Asignación · Estado
- **Antes:** RN‑M08
- **Estado:** Borrador

*Descripción general*

Una asignación con fecha futura queda **Programada**, en el día 0 y con 0 %, hasta que llega su fecha. Ese día pasa a **En curso**.

**2. Escenarios ágiles de ejecución**

*Programado hasta el lunes*

- **Dado que** la asignación empieza el lunes
- **Cuando** se mira Seguimiento el viernes
- **Entonces** figura «Programado», día 0 / 30

**3. Condiciones y excepciones**

- En el directorio, la persona figura «Sin iniciar» hasta que abre su primera tarea.

> **En la maqueta:** el paso a En curso no ocurre solo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑011
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑02 Seguimiento
- **Diseño:** Parcial

#### 4.37 · BR-ONB-037 · La asignación puede ser manual o automática

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-037
- **Grupo:** Asignar
- **Qué gobierna:** Asignación · Configuración
- **Antes:** RN‑M46, P‑04
- **Estado:** Borrador

*Descripción general*

La empresa elige: **manual** —Recursos Humanos asigna— o **automática** —el día de ingreso, a una hora configurable, cada persona recibe la ruta activa de su puesto—.

**2. Escenarios ágiles de ejecución**

*La ruta llega sola*

- **Dado que** la asignación es automática a las 08:00
- **Cuando** ingresa un ejecutivo comercial en La Paz
- **Entonces** a las 08:00 de ese día tiene asignada la ruta de su puesto

**3. Condiciones y excepciones**

- Qué pasa si el puesto no tiene ruta activa está por decidir —ABIERTA‑ONB‑01—.

> **En la maqueta:** la opción se guarda, pero no asigna sola.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑09 Configuración
- **Diseño:** A construir


### Los estados del onboarding

*Cómo va cada persona*

#### 4.38 · BR-ONB-038 · Un onboarding está en uno de seis estados

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-038
- **Grupo:** Los estados del onboarding
- **Qué gobierna:** Asignación · Estado
- **Antes:** RN‑M56, RN‑M09
- **Estado:** Borrador

*Descripción general*

| Estado | Cuándo |
| --- | --- |
| **Programado** | Espera su fecha de inicio |
| **En curso** | Está haciendo su ruta |
| **En riesgo** | Lleva días sin actividad —BR‑ONB‑039— |
| **Atrasado** | Tiene tareas vencidas |
| **Pausado** | Se suspendió a propósito —BR‑ONB‑045— |
| **Completado** | Terminó todas sus tareas: se graduó |

No hay «Cancelado»: eso es desasignar, y el registro queda —BR‑ONB‑046—.

> **Diagrama · Los estados de un onboarding.** Programado pasa a En curso en su fecha de inicio. Desde En curso: a En riesgo tras varios días sin actividad, a Atrasado con una tarea vencida (Atrasado gana a En riesgo), a Pausado a mano (y de vuelta al reanudar), y a Completado al terminar todas las tareas. En la versión HTML está dibujado.

**2. Escenarios ágiles de ejecución**

*La ayuda explica cada estado*

- **Dado que** Recursos Humanos está en Seguimiento
- **Cuando** pasa por el ícono junto a «Estado»
- **Entonces** ve los seis estados con lo que significa cada uno

**3. Condiciones y excepciones**

- El directorio de Gestión de personas muestra la misma historia desde la persona: Sin ruta, Sin iniciar, En curso, En riesgo, Graduado —5.5—.

> **En la maqueta:** ningún estado cambia solo; los de Seguimiento son datos de ejemplo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑011
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑02 Seguimiento
- **Diseño:** Parcial

#### 4.39 · BR-ONB-039 · «En riesgo» es pasar varios días sin actividad

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-039
- **Grupo:** Los estados del onboarding
- **Qué gobierna:** Asignación · Estado
- **Antes:** RN‑053, RN‑M49
- **Estado:** Borrador

*Descripción general*

Una persona pasa a **En riesgo** cuando lleva más de **3 días** sin completar ninguna tarea. Los días los fija la empresa en la configuración y cada ruta puede ajustarlos. Es la alerta temprana: todavía no está atrasada, pero se trabó.

**2. Escenarios ágiles de ejecución**

*Cuatro días quieta*

- **Dado que** el umbral es 3 días
- **Cuando** Valentina no completa nada en 4 días
- **Entonces** pasa a En riesgo y aparece en «Necesitan atención»

**3. Condiciones y excepciones**

- Un onboarding pausado no corre días.

> **En la maqueta:** el umbral se guarda pero no se calcula.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑002
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑02 Seguimiento · W‑ONB‑09 Configuración
- **Diseño:** A construir

#### 4.40 · BR-ONB-040 · Atrasado gana a En riesgo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-040
- **Grupo:** Los estados del onboarding
- **Qué gobierna:** Asignación · Estado
- **Antes:** RN‑M56
- **Estado:** Borrador

*Descripción general*

Si alguien tiene tareas vencidas y además lleva días sin actividad, figura **Atrasado**: es lo más grave y lo que hay que resolver primero.

**2. Escenarios ágiles de ejecución**

*Se muestra lo más grave*

- **Dado que** Bruno tiene una tarea vencida y 5 días sin actividad
- **Cuando** se mira Seguimiento
- **Entonces** figura Atrasado

**3. Condiciones y excepciones**

- Los dos cuentan juntos en el indicador «Atrasados» de Seguimiento.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑011
- **Historia de usuario:** HU‑ONB‑06
- **Pantalla:** W‑ONB‑02 Seguimiento
- **Diseño:** A construir

#### 4.41 · BR-ONB-041 · Completar todas las tareas es graduarse

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-041
- **Grupo:** Los estados del onboarding
- **Qué gobierna:** Asignación · Graduación
- **Antes:** RN‑043, RN‑M59
- **Estado:** Borrador

*Descripción general*

El onboarding se **completa** cuando la persona termina todas sus tareas; en el directorio queda **Graduado**. Desde ese momento puede ser buddy de otros —BR‑ONB‑043—.

**2. Escenarios ágiles de ejecución**

*La última tarea gradúa*

- **Dado que** a Carlos le falta una tarea
- **Cuando** la completa
- **Entonces** su onboarding queda Completado y ve la celebración

**3. Condiciones y excepciones**

- Con el certificado activado, recibe su certificado de graduación —BR‑ONB‑059—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑001
- **Historia de usuario:** HU‑ONB‑10
- **Pantalla:** W‑ONB‑12 Mi Onboarding
- **Diseño:** Parcial

#### 4.42 · BR-ONB-042 · Cada tarea tiene su propio estado

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-042
- **Grupo:** Los estados del onboarding
- **Qué gobierna:** Tarea · Estado
- **Antes:** RN‑M58
- **Estado:** Borrador

*Descripción general*

| Estado | Cuándo |
| --- | --- |
| **Bloqueada** | Su etapa todavía no se abrió |
| **Pendiente** | Se puede hacer y no se empezó |
| **En progreso** | Se empezó y no se terminó |
| **Completada** | Se hizo |
| **Vencida** | Pasó su último día sin hacerse |

No hay revisión por un tercero ni «omitida»: todas las tareas son obligatorias.

**2. Escenarios ágiles de ejecución**

*Una tarea vencida atrasa*

- **Dado que** una tarea era del día 3 al 5
- **Cuando** llega el día 6 sin hacerse
- **Entonces** queda Vencida y el onboarding pasa a Atrasado

**3. Condiciones y excepciones**

- El recorrido del colaborador muestra hoy Completada, Pendiente y Bloqueada.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑011
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑12 Mi Onboarding
- **Diseño:** Parcial

### Buddy, pausa y desasignar

*Lo que Recursos Humanos hace con un onboarding en marcha*

#### 4.43 · BR-ONB-043 · El buddy es una relación, y solo puede serlo quien ya pasó su onboarding

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-043
- **Grupo:** Buddy, pausa y desasignar
- **Qué gobierna:** Buddy
- **Antes:** RN‑M57
- **Estado:** Borrador

*Descripción general*

El buddy **no es un rol ni un permiso**: es una persona que la asignación de onboarding nombra para acompañar. Solo puede ser buddy un colaborador activo que ya se **graduó** o que entró antes del sistema —**N/A**—: nadie guía un camino que todavía está recorriendo. Una persona puede acompañar a varias.

**2. Escenarios ágiles de ejecución**

*Quien está en su onboarding no se ofrece*

- **Dado que** Gabriel está en curso
- **Cuando** se busca buddy para otra persona
- **Entonces** Gabriel no aparece en la lista

**3. Condiciones y excepciones**

- Por defecto un onboarding no tiene buddy: «Sin asignar».
- Lo asignan Recursos Humanos o el líder, desde Seguimiento, el detalle o el directorio.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑12
- **Pantalla:** W‑ONB‑02 Seguimiento · W‑ONB‑03 Detalle
- **Diseño:** Prototipado

#### 4.44 · BR-ONB-045 · Pausar congela el reloj; reanudar lo retoma

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-045
- **Grupo:** Buddy, pausa y desasignar
- **Qué gobierna:** Asignación · Pausa
- **Antes:** RN‑M57, P‑16
- **Estado:** Borrador

*Descripción general*

Un onboarding se **pausa** cuando la persona no puede seguir por un tiempo —una licencia, un viaje—: los días no corren y no pasa a En riesgo ni a Atrasado. Al **reanudarlo**, sigue donde estaba.

**2. Escenarios ágiles de ejecución**

*La pausa no atrasa*

- **Dado que** el onboarding de Natalia está pausado hace 10 días
- **Cuando** se reanuda
- **Entonces** vuelve a En curso en el mismo día de su ruta

**3. Condiciones y excepciones**

- Si la pausa pide motivo está por decidir.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑07
- **Pantalla:** W‑ONB‑02 Seguimiento · W‑ONB‑03 Detalle
- **Diseño:** Parcial

#### 4.45 · BR-ONB-046 · Desasignar no borra: queda el historial

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-046
- **Grupo:** Buddy, pausa y desasignar
- **Qué gobierna:** Asignación · Desasignar
- **Antes:** RN‑M57, P‑17
- **Estado:** Borrador

*Descripción general*

**Desasignar la ruta de onboarding** saca a la persona de la ruta, pero lo hecho queda: sus documentos y su historial siguen, y el proceso figura en su trayectoria como «Cerrado sin completar». Se dice por qué —un error, un cambio de cargo o de área, una baja, una reasignación u otro— y se confirma escribiendo «desasignar». Es la única acción del detalle que no se deshace.

**2. Escenarios ágiles de ejecución**

*Desasignar por cambio de cargo*

- **Dado que** Isabella cambió de cargo a mitad de su onboarding
- **Cuando** se desasigna con el motivo «Cambio de cargo»
- **Entonces** deja de figurar en Seguimiento y su trayectoria muestra el proceso cerrado

**3. Condiciones y excepciones**

- En el directorio vuelve a «Sin ruta».

> **En la maqueta:** la confirmación dice que «se perderá el progreso actual» y no pide motivo; hay que alinearla con esta regla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑013
- **Historia de usuario:** HU‑ONB‑07
- **Pantalla:** W‑ONB‑02 Seguimiento · W‑ONB‑03 Detalle
- **Diseño:** Parcial

#### 4.46 · BR-ONB-047 · El recordatorio es para quien está en riesgo o atrasado

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-047
- **Grupo:** Buddy, pausa y desasignar
- **Qué gobierna:** Asignación · Recordatorio
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

«Enviar recordatorio» aparece solo cuando alguien está **en riesgo o atrasado**. Se elige el canal —WhatsApp o notificación en la plataforma— y se puede editar el mensaje, que ya trae su nombre, su ruta, su estado y el día en que va.

**2. Escenarios ágiles de ejecución**

*Un mensaje con contexto*

- **Dado que** Valentina está en riesgo en el día 12 de 30
- **Cuando** se abre «Enviar recordatorio»
- **Entonces** el mensaje propuesto la nombra y dice su ruta, su estado y «día 12/30»

**3. Condiciones y excepciones**

- Queda registrado en la actividad reciente.

> **En la maqueta:** el recordatorio se registra pero no se envía.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑012
- **Historia de usuario:** HU‑ONB‑07
- **Pantalla:** W‑ONB‑02 Seguimiento · W‑ONB‑03 Detalle
- **Diseño:** Parcial

### Recursos corporativos

*La biblioteca del onboarding*

#### 4.47 · BR-ONB-052 · La biblioteca se ordena en carpetas, y las tareas la usan

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-052
- **Grupo:** Recursos corporativos
- **Qué gobierna:** Biblioteca
- **Antes:** RN‑M39, RN‑M41, RN‑M42, RN‑M44
- **Estado:** Borrador

*Descripción general*

Recursos corporativos guarda los materiales en **carpetas**, que se crean con solo un nombre y dicen cuántos documentos tienen. Dentro se sube un archivo —también arrastrándolo— o se agrega un enlace. La administra Recursos Humanos; el colaborador la usa a través de sus tareas.

**2. Escenarios ágiles de ejecución**

*Subir arrastrando*

- **Dado que** la carpeta Políticas está abierta
- **Cuando** se arrastra un PDF
- **Entonces** aparece en la lista como procesando y después procesado

**3. Condiciones y excepciones**

- Eliminar una carpeta pide confirmación.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑08
- **Pantalla:** W‑ONB‑08 Recursos corporativos
- **Diseño:** Prototipado

#### 4.48 · BR-ONB-053 · Un enlace solo puede ser de video o de audio

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-053
- **Grupo:** Recursos corporativos
- **Qué gobierna:** Biblioteca · Enlaces
- **Antes:** RN‑M43, RN‑M54
- **Estado:** Borrador

*Descripción general*

«Agregar enlace» acepta un **video** o un **audio o podcast**, con su título y su dirección. Los documentos se suben como archivo, para que se puedan previsualizar y usar en una prueba.

**2. Escenarios ágiles de ejecución**

*Un video de YouTube*

- **Dado que** se elige «Agregar enlace»
- **Cuando** se pone tipo Video, un título y la dirección
- **Entonces** queda en la carpeta y se puede usar en una tarea de video

**3. Condiciones y excepciones**

- La biblioteca acepta también videos y audios subidos como archivo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑08
- **Pantalla:** W‑ONB‑08 Recursos corporativos
- **Diseño:** Prototipado

#### 4.49 · BR-ONB-054 · Un recurso general lo ve toda la empresa

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-054
- **Grupo:** Recursos corporativos
- **Qué gobierna:** Biblioteca · Visibilidad
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

Un documento marcado como **recurso general** es visible para todos los colaboradores, más allá del onboarding —un reglamento, el código de conducta—. Sin la marca, solo llega a quien lo tiene en una tarea.

**2. Escenarios ágiles de ejecución**

*El reglamento para todos*

- **Dado que** el reglamento interno está en Políticas
- **Cuando** se marca «Recurso general»
- **Entonces** lo puede ver cualquier colaborador

**3. Condiciones y excepciones**

- La biblioteca filtra por visibilidad: todos, recursos generales o solo onboarding.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑08
- **Pantalla:** W‑ONB‑08 Recursos corporativos
- **Diseño:** Prototipado

### La configuración de la empresa

*Los valores por defecto del módulo*

#### 4.50 · BR-ONB-055 · Lo que se apaga en la empresa no lo usa ninguna ruta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-055
- **Grupo:** La configuración de la empresa
- **Qué gobierna:** Configuración
- **Antes:** RN‑M45, RN‑M38
- **Estado:** Borrador

*Descripción general*

La configuración avanzada fija los **valores por defecto** de toda la empresa. Cada ruta los **hereda**, los **personaliza** o los **apaga**; pero lo que se apaga en la empresa no lo puede usar ninguna ruta. Los cambios se guardan juntos, y apagar o encender algo pide confirmar porque afecta a toda la empresa.

**2. Escenarios ágiles de ejecución**

*Apagar los puntos para todos*

- **Dado que** se apaga la gamificación en la configuración avanzada
- **Cuando** se abre cualquier ruta
- **Entonces** ninguna muestra puntos, aunque su configuración los tenga encendidos

**3. Condiciones y excepciones**

- La página avisa cuántos cambios quedan sin guardar.

> **En la maqueta:** solo los puntos y el asistente IA tienen efecto.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑13
- **Pantalla:** W‑ONB‑09 Configuración
- **Diseño:** Parcial

#### 4.51 · BR-ONB-056 · El asistente IA necesita al menos un documento

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-056
- **Grupo:** La configuración de la empresa
- **Qué gobierna:** Asistente IA
- **Antes:** RN‑M47
- **Estado:** Borrador

*Descripción general*

El **asistente IA** responde a partir de los documentos de Recursos corporativos. Sin al menos un documento en la biblioteca no tiene de dónde responder, y la configuración lo dice.

**2. Escenarios ágiles de ejecución**

*Responde desde la biblioteca*

- **Dado que** el asistente está activo y hay documentos
- **Cuando** Carlos pregunta qué pasa si no completa una tarea a tiempo
- **Entonces** responde con lo que dicen los documentos y su ruta

**3. Condiciones y excepciones**

- Si no encuentra la respuesta, lo dice en vez de inventarla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑14
- **Pantalla:** W‑ONB‑09 Configuración · W‑ONB‑12 Mi Onboarding
- **Diseño:** Parcial

#### 4.52 · BR-ONB-057 · Las menciones automáticas celebran en el muro

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-057
- **Grupo:** La configuración de la empresa
- **Qué gobierna:** Menciones
- **Antes:** RN‑M48
- **Estado:** Borrador

*Descripción general*

Con las **menciones automáticas** activas, el muro de Comunicación publica solo cuando alguien **empieza** su onboarding y cuando **se gradúa**; también al **completar una etapa**, si se enciende. Por defecto: inicio y graduación sí, etapa no.

**2. Escenarios ágiles de ejecución**

*Bienvenida en el muro*

- **Dado que** la mención de inicio está activa
- **Cuando** Carlos empieza su onboarding
- **Entonces** el muro publica su bienvenida

**3. Condiciones y excepciones**

- Cada evento se enciende y se apaga por separado.

> **En la maqueta:** se guarda, pero no publica.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑13
- **Pantalla:** W‑ONB‑09 Configuración
- **Diseño:** A construir

#### 4.53 · BR-ONB-058 · Con la extensión de plazo, el jefe extiende sin pedir permiso

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-058
- **Grupo:** La configuración de la empresa
- **Qué gobierna:** Plazos · Líder
- **Antes:** RN‑M50
- **Estado:** Borrador

*Descripción general*

Apagada por defecto. Encendida, el **jefe** puede extender el plazo de un onboarding de su gente **directamente**, sin pedírselo a Recursos Humanos, y la extensión **queda en el historial**.

**2. Escenarios ágiles de ejecución**

*Una semana más*

- **Dado que** la extensión está activa
- **Cuando** Ana extiende 7 días el onboarding de Bruno
- **Entonces** el plazo se corre y el historial dice quién y cuándo

**3. Condiciones y excepciones**

- Si hay un máximo de días está por decidir.

> **En la maqueta:** se guarda, pero no hay dónde extender.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑11
- **Pantalla:** W‑ONB‑09 Configuración
- **Diseño:** A construir

#### 4.54 · BR-ONB-059 · El certificado de graduación lleva un folio único

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-059
- **Grupo:** La configuración de la empresa
- **Qué gobierna:** Certificado
- **Antes:** RN‑M51
- **Estado:** Borrador

*Descripción general*

Al graduarse, la persona recibe un **certificado de finalización** con su nombre, su ruta, la fecha y un **folio único** —OB‑2026‑0001—. La empresa elige el color, sube su logo y hasta dos firmas, y lo ve antes de activarlo.

**2. Escenarios ágiles de ejecución**

*Folio correlativo*

- **Dado que** el último certificado fue OB‑2026‑0041
- **Cuando** se gradúa la siguiente persona
- **Entonces** su certificado lleva OB‑2026‑0042

**3. Condiciones y excepciones**

- El certificado queda en su expediente.

> **En la maqueta:** se diseña y se previsualiza, pero no se genera ni se descarga.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑10
- **Pantalla:** W‑ONB‑09 Configuración
- **Diseño:** A construir

### Para El líder de área

Lo que ve y puede hacer quien tiene gente a cargo, en la web y en el celular.

### El equipo del líder

*Su gente, su área y lo que puede hacer con ellos*

#### 4.55 · BR-ONB-048 · El líder ve solo su área, y lo de otra área no se abre

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-048
- **Grupo:** El equipo del líder
- **Qué gobierna:** Permisos · Alcance
- **Antes:** RN‑120
- **Estado:** Borrador

*Descripción general*

Seguimiento y Rutas muestran al líder y al auxiliar solo lo de **su área**. El detalle de un onboarding de otra área no se abre aunque se escriba su dirección: dice que no se encontró o que pertenece a un área que no administra. Las métricas de toda la empresa son de Recursos Humanos.

**2. Escenarios ágiles de ejecución**

*Una dirección de otra área no se abre*

- **Dado que** Ana es líder de Marketing
- **Cuando** escribe la dirección del onboarding de alguien de Ventas
- **Entonces** ve «No encontramos esta asignación» y vuelve a Seguimiento

**3. Condiciones y excepciones**

- Cambiar el estado de una ruta del área puede afectar a otra área, porque un puesto tiene una sola ruta —BR‑ONB‑008—.

> **En la maqueta:** el alcance es solo por área; la sucursal del auxiliar no se aplica, y nada impide escribir la dirección de Recursos corporativos o de Configuración avanzada.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑11
- **Pantalla:** W‑ONB‑10 Equipo del líder
- **Diseño:** Parcial

#### 4.56 · BR-ONB-049 · El equipo del líder es su gente, no su área

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-049
- **Grupo:** El equipo del líder
- **Qué gobierna:** Líder · Equipo
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

El Dashboard del líder muestra a **las personas que dependen de él** —la relación jefe de Organización—, no a todo su área: un área puede tener varios líderes. «Atención requerida» suma a quien está en riesgo y a quien **no tiene ruta**: un ingreso sin ruta también es una alerta del jefe.

**2. Escenarios ágiles de ejecución**

*Un ingreso sin ruta alerta al jefe*

- **Dado que** Natalia depende de Ana y no tiene ruta
- **Cuando** Ana abre su Dashboard
- **Entonces** Natalia aparece en «Atención requerida»

**3. Condiciones y excepciones**

- Las listas se ordenan por urgencia y muestran hasta seis; lo que se corta se dice y lleva a Seguimiento.

> **En la maqueta:** el celular arma el equipo por área y la web por jefe, así que el mismo líder ve números distintos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑002
- **Historia de usuario:** HU‑ONB‑11
- **Pantalla:** W‑ONB‑10 Equipo del líder
- **Diseño:** Parcial

#### 4.57 · BR-ONB-051 · El líder sigue y acompaña; no asigna ni crea rutas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-051
- **Grupo:** El equipo del líder
- **Qué gobierna:** Líder · Permisos
- **Antes:** P‑30
- **Estado:** Borrador

*Descripción general*

El líder puede asignar o cambiar el buddy, pausar, reanudar, enviar recordatorios y editar las rutas de su área. **No** asigna rutas, no crea rutas nuevas ni marca la ruta general: eso es de Recursos Humanos. Con la extensión de plazo activada, puede extender plazos —BR‑ONB‑058—.

**2. Escenarios ágiles de ejecución**

*El botón de asignar no está*

- **Dado que** Ana abre Seguimiento
- **Cuando** mira la barra de herramientas
- **Entonces** no está «Asignar ruta a colaboradores»

**3. Condiciones y excepciones**

- Si el líder puede desasignar está por decidir —ABIERTA‑ONB‑08—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑010
- **Historia de usuario:** HU‑ONB‑11
- **Pantalla:** W‑ONB‑02 Seguimiento
- **Diseño:** Prototipado

#### 4.58 · BR-ONB-067 · En el celular, el líder ve a su gente agrupada por motivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-067
- **Grupo:** El equipo del líder
- **Qué gobierna:** Líder · Celular
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

En el celular no cabe una tabla: el líder ve a su gente **agrupada por lo que necesita** —Necesitan atención (atrasados y en riesgo), Por comenzar, En curso, Pausados y Completados—. Solo el grupo más urgente empieza abierto, cada grupo muestra cinco personas y ofrece ver más, y un grupo sin nadie no se muestra.

**2. Escenarios ágiles de ejecución**

*Lo urgente, abierto*

- **Dado que** Bruno está en riesgo y otras tres personas en curso
- **Cuando** Ana abre Seguimiento en el celular
- **Entonces** «Necesitan atención» está abierto con Bruno, y «En curso» cerrado con sus tres

*Más de cinco en un grupo*

- **Dado que** hay siete personas en curso
- **Cuando** se abre ese grupo
- **Entonces** muestra cinco y «Ver 2 más en “En curso”»

**3. Condiciones y excepciones**

- El detalle de cada persona es de solo lectura en el celular.
- El equipo es el mismo que en la web —BR‑ONB‑049—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑048, RF‑ONB‑049, RF‑ONB‑050
- **Historia de usuario:** HU‑ONB‑15
- **Pantalla:** W‑ONB‑10 Equipo del líder
- **Diseño:** Prototipado

### Para El auxiliar

Lo que puede ver y hacer quien ayuda al líder con acceso delegado.

### El acceso delegado

*Lo que hace quien ayuda al líder*

#### 4.59 · BR-ONB-068 · El auxiliar trabaja solo con Rutas y Seguimiento, en su área y su sucursal

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-068
- **Grupo:** El acceso delegado
- **Qué gobierna:** Auxiliar · Permisos · Alcance
- **Antes:** P‑30
- **Estado:** Borrador

*Descripción general*

El auxiliar ayuda a su líder con **acceso delegado**: su menú tiene solo **Rutas** y **Seguimiento**, y ve lo de **su área**. Si su alcance está acotado a una sucursal, ve y registra solo lo de esa sucursal. No tiene el Dashboard, Recursos corporativos ni Configuración avanzada, y escribir sus direcciones lo devuelve.

**2. Escenarios ágiles de ejecución**

*Acotada a una sucursal*

- **Dado que** Laura es auxiliar de Marketing acotada a La Paz
- **Cuando** abre Seguimiento
- **Entonces** ve solo los onboardings de Marketing en La Paz

*Sin configuración*

- **Dado que** Laura escribe la dirección de Configuración avanzada
- **Cuando** se carga la página
- **Entonces** vuelve a Rutas

**3. Condiciones y excepciones**

- En Seguimiento tiene las mismas acciones que el líder.
- Edita solo las rutas a las que tiene acceso —BR‑ONB‑050—.

> **En la maqueta:** la sucursal no se aplica y nada le impide escribir esas direcciones; el Dashboard que ve por dirección es el de Recursos Humanos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑051, RF‑ONB‑053
- **Historia de usuario:** HU‑ONB‑17
- **Pantalla:** W‑ONB‑02 Seguimiento · W‑ONB‑05 Rutas
- **Diseño:** Parcial

#### 4.60 · BR-ONB-050 · El auxiliar edita solo las rutas de las que es responsable

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-050
- **Grupo:** El acceso delegado
- **Qué gobierna:** Auxiliar · Rutas
- **Antes:** P‑30
- **Estado:** Borrador

*Descripción general*

El auxiliar trabaja con **acceso delegado** por su líder. Ve las rutas de su área y edita solo aquellas en las que figura entre las **personas con acceso**. El líder edita todas las de su área y elige quién más tiene acceso.

**2. Escenarios ágiles de ejecución**

*Sin acceso, no edita*

- **Dado que** Laura es auxiliar de Marketing y no tiene acceso a la ruta de «Community Manager»
- **Cuando** abre sus acciones
- **Entonces** no tiene «Editar»

**3. Condiciones y excepciones**

- Su tarjeta de ruta dice «Acceso delegado por {líder}».

> **En la maqueta:** la lista de personas con acceso no se guarda al recargar.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑020
- **Historia de usuario:** HU‑ONB‑11
- **Pantalla:** W‑ONB‑05 Rutas
- **Diseño:** Parcial

### Para El buddy

Lo que ve quien acompaña a una o varias personas nuevas. Acompaña, no supervisa.

### Acompañar

*Qué ve el buddy y por dónde entra*

#### 4.61 · BR-ONB-044 · El buddy ve el avance y el recorrido, no las respuestas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-044
- **Grupo:** Acompañar
- **Qué gobierna:** Buddy · Privacidad
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

El buddy acompaña, no supervisa. Ve de quién es buddy, cómo va, en qué estado está y su recorrido; **no** ve sus respuestas, sus evaluaciones ni sus datos personales, que son de Recursos Humanos. La pantalla lo dice. Ser buddy no da acceso a la administración del módulo.

**2. Escenarios ágiles de ejecución**

*Una prueba no muestra respuestas*

- **Dado que** Diego acompaña a Andrea
- **Cuando** toca una prueba en el recorrido de Andrea
- **Entonces** ve cuántas preguntas tiene y que las respuestas las ve solo Recursos Humanos

**3. Condiciones y excepciones**

- Escribir la dirección de una pantalla de administración lo devuelve a su espacio.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RNF‑ONB‑04
- **Historia de usuario:** HU‑ONB‑12
- **Pantalla:** W‑ONB‑11 Mis acompañados
- **Diseño:** Prototipado

#### 4.62 · BR-ONB-069 · El buddy ve primero a quien está en riesgo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-069
- **Grupo:** Acompañar
- **Qué gobierna:** Buddy · Lista
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

La lista de acompañados se ordena **por urgencia**: en riesgo, sin iniciar, en curso y graduados, y dentro de cada uno por avance. Así lo primero que ve el buddy es a quien un mensaje suyo puede destrabar. En el celular muestra hasta seis y ofrece ver más.

**2. Escenarios ágiles de ejecución**

*Valentina primero*

- **Dado que** Diego acompaña a cuatro personas y Valentina está en riesgo
- **Cuando** abre Mis acompañados
- **Entonces** Valentina es la primera, con la sugerencia de escribirle

**3. Condiciones y excepciones**

- Los indicadores dicen cuántos acompaña y cuántos están en riesgo.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑064, RF‑ONB‑065
- **Historia de usuario:** HU‑ONB‑19
- **Pantalla:** W‑ONB‑11 Mis acompañados
- **Diseño:** Prototipado

#### 4.63 · BR-ONB-070 · El buddy entra por su espacio, no tiene pestaña de onboarding

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-070
- **Grupo:** Acompañar
- **Qué gobierna:** Buddy · Acceso
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

Acompañar no es una ruta propia en curso, así que el buddy **no tiene la pestaña Onboarding** del celular. Entra por **Mi espacio › Mis acompañados** en la web y, en el celular, por **«Acompañar a mi gente»** en Inicio o por Zona HR › Onboarding, donde ve primero a sus acompañados y después su propia ruta, ya completada.

**2. Escenarios ágiles de ejecución**

*Inicio lo lleva a su gente*

- **Dado que** Diego abre la app en el celular
- **Cuando** toca «Acompañar a mi gente · 4 personas · 1 en riesgo»
- **Entonces** abre Mis acompañados

**3. Condiciones y excepciones**

- Su propia ruta la ve en solo lectura, como cualquier graduado —BR‑ONB‑064—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑066
- **Historia de usuario:** HU‑ONB‑20
- **Pantalla:** W‑ONB‑11 Mis acompañados
- **Diseño:** Prototipado

### Para El colaborador

Lo que vive la persona nueva desde su espacio, en la web y en el celular.

### Mi Onboarding

*El recorrido de la persona*

#### 4.64 · BR-ONB-060 · El onboarding propio vive en Mi espacio, y en el celular tiene su pestaña mientras dura

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-060
- **Grupo:** Mi Onboarding
- **Qué gobierna:** Colaborador · Acceso
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

Cada persona hace su ruta desde **Mi espacio › Mi Onboarding**. En el celular, la pestaña **Onboarding** existe solo **mientras tiene una incorporación en curso**: es un atajo, no un lugar. Quien ya se graduó o entró antes del sistema entra por Zona HR. El colaborador no ve el módulo de administración.

**2. Escenarios ágiles de ejecución**

*La pestaña se va al graduarse*

- **Dado que** Carlos está en su onboarding
- **Cuando** abre la app
- **Entonces** arranca en la pestaña Onboarding

**3. Condiciones y excepciones**

- El buddy y el líder tienen en el celular un acceso que junta su ruta y la de su gente.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RNF‑ONB‑01
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑12 Mi Onboarding
- **Diseño:** Prototipado

#### 4.65 · BR-ONB-061 · Sin ruta se espera; sin incorporación no hay nada que hacer

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-061
- **Grupo:** Mi Onboarding
- **Qué gobierna:** Colaborador · Estados vacíos
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

Si a la persona todavía no le asignaron ruta, Mi Onboarding le dice que la está preparando Recursos Humanos. Si entró antes del sistema —N/A—, le dice que como ya es parte del equipo no tiene tareas pendientes. Ninguna de las dos es un error.

**2. Escenarios ágiles de ejecución**

*Un colaborador antiguo*

- **Dado que** Juan figura N/A
- **Cuando** abre Mi Onboarding
- **Entonces** ve «Sin tareas pendientes»

**3. Condiciones y excepciones**

- Al recibir su ruta, ve la bienvenida.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RNF‑ONB‑01
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑12 Mi Onboarding
- **Diseño:** Prototipado

#### 4.66 · BR-ONB-062 · Una etapa se abre al completar las obligatorias de la anterior

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-062
- **Grupo:** Mi Onboarding
- **Qué gobierna:** Colaborador · Etapas
- **Antes:** RN‑M16
- **Estado:** Borrador

*Descripción general*

Las etapas se recorren en orden: la siguiente se **desbloquea** cuando se completan las tareas obligatorias de la anterior. Dentro de una etapa, las tareas pueden ir conectadas en el orden en que deben hacerse.

**2. Escenarios ágiles de ejecución**

*La segunda etapa espera*

- **Dado que** a Carlos le falta una tarea obligatoria de «Mi primera semana»
- **Cuando** toca una tarea de «Conoce el equipo»
- **Entonces** está bloqueada y le dice qué le falta

**3. Condiciones y excepciones**

- Las tareas de la etapa abierta se pueden hacer en cualquier orden, salvo que estén conectadas.

> **En la maqueta:** las etapas no se bloquean: se puede abrir cualquier tarea.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑12 Mi Onboarding
- **Diseño:** A construir

#### 4.67 · BR-ONB-063 · Cada tipo de tarea se completa a su manera

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-063
- **Grupo:** Mi Onboarding
- **Qué gobierna:** Tarea · Completar
- **Antes:** RN‑M20
- **Estado:** Borrador

*Descripción general*

Lo que se puede comprobar se completa **solo**: el video al terminar de verse —y su prueba—, el formulario y el pulso al enviarse, el perfil al enviarse con todas sus secciones. Lo demás se marca con **«Marcar como completada»**, después de lo que lo habilita: la prueba de verificación de un documento, todas las paradas de un recorrido —3.17—.

**2. Escenarios ágiles de ejecución**

*El recorrido pide todas las paradas*

- **Dado que** Carlos marcó 8 de 10 paradas
- **Cuando** pulsa «Marcar como completada»
- **Entonces** le dice que complete todas las paradas primero

**3. Condiciones y excepciones**

- Una tarea completada por error se puede desmarcar mientras el onboarding no terminó.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑09
- **Pantalla:** W‑ONB‑13 Tarea
- **Diseño:** Prototipado

#### 4.68 · BR-ONB-064 · Al graduarse se celebra, y la ruta queda para mirar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-064
- **Grupo:** Mi Onboarding
- **Qué gobierna:** Colaborador · Graduación
- **Antes:** RN‑043
- **Estado:** Borrador

*Descripción general*

Al completar la última tarea, la persona ve la **celebración** —confeti y «¡Felicidades!»—. Desde ahí su ruta queda en **solo lectura**: la puede volver a recorrer con «Ver mi ruta completada», pero no desmarcar nada.

**2. Escenarios ágiles de ejecución**

*Un graduado no desmarca*

- **Dado que** Nicolás se graduó
- **Cuando** abre una tarea de su ruta
- **Entonces** la ve completada y sin «Desmarcar»

**3. Condiciones y excepciones**

- La graduación se cuenta sobre todas las tareas de la ruta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑001
- **Historia de usuario:** HU‑ONB‑10
- **Pantalla:** W‑ONB‑12 Mi Onboarding
- **Diseño:** Prototipado

#### 4.69 · BR-ONB-065 · Mi trayectoria guarda cada proceso tal como se hizo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-065
- **Grupo:** Mi Onboarding
- **Qué gobierna:** Colaborador · Historial
- **Antes:** —
- **Estado:** Borrador

*Descripción general*

**Mi trayectoria** lista cada proceso de la persona —su onboarding y cada reboarding— con su estado (En curso, Completado o Cerrado sin completar), sus fechas y su recorrido **congelado**: lo que alguien hizo en 2021 sigue mostrando lo que efectivamente vio, aunque la ruta haya cambiado.

**2. Escenarios ágiles de ejecución**

*El historial de un buddy*

- **Dado que** Diego hizo su onboarding y cuatro reboardings
- **Cuando** abre «Ver historial»
- **Entonces** ve los cinco procesos, cada uno con su recorrido

**3. Condiciones y excepciones**

- Sin procesos, explica qué va a aparecer ahí.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑001
- **Historia de usuario:** HU‑ONB‑10
- **Pantalla:** W‑ONB‑14 Mi trayectoria
- **Diseño:** Prototipado

#### 4.70 · BR-ONB-066 · El asistente responde desde la biblioteca, y si no sabe lo dice

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ONB-066
- **Grupo:** Mi Onboarding
- **Qué gobierna:** Colaborador · Asistente IA
- **Antes:** RN‑M47
- **Estado:** Borrador

*Descripción general*

Con el asistente activo, la persona tiene un **Asistente de onboarding** que responde sobre sus tareas y los documentos de Recursos corporativos, con preguntas sugeridas para empezar. Si no encuentra la respuesta en la biblioteca, lo dice.

**2. Escenarios ágiles de ejecución**

*Una pregunta sugerida*

- **Dado que** Carlos abre el asistente
- **Cuando** toca «¿Qué pasa si no completo una tarea a tiempo?»
- **Entonces** recibe la respuesta sobre plazos y estado en riesgo

**3. Condiciones y excepciones**

- Apagado en la empresa, la burbuja no aparece.

> **En la maqueta:** las respuestas son fijas.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ONB‑030
- **Historia de usuario:** HU‑ONB‑14
- **Pantalla:** W‑ONB‑12 Mi Onboarding
- **Diseño:** Parcial

### 4.71 Quién hace qué

| Acción | Recursos Humanos | Líder | Auxiliar | Buddy | Colaborador |
| --- | --- | --- | --- | --- | --- |
| Ver el Dashboard de la empresa | Sí | — | — | — | — |
| Ver el Dashboard de su equipo | — | Sí | — | — | — |
| Seguimiento | Todos | Su área | Su área | — | — |
| Asignar una ruta | Sí | — | — | — | — |
| Asignar o cambiar buddy, pausar, recordar | Sí | Su área | Su área | — | — |
| Crear una ruta | Sí | — | — | — | — |
| Editar una ruta | Todas | Su área | Si tiene acceso | — | — |
| Activar, desactivar o reemplazar una ruta | Sí | Su área | Su área | — | — |
| Marcar la ruta general | Sí | — | — | — | — |
| Recursos corporativos y Configuración avanzada | Sí | — | — | — | — |
| Ver el avance de quien acompaña | — | — | — | Sí | — |
| Hacer su propia ruta | Si tiene | Si tiene | Si tiene | Si tiene | Sí |

## 05 · Modelo de datos

*Qué se guarda y qué se deduce. La ruta es la plantilla; la asignación, el caso de cada persona con su copia congelada.*

### 5.1 Las entidades

| Entidad | Qué es | Campos principales |
| --- | --- | --- |
| **Ruta** | El recorrido de un puesto | id, nombre, descripción, tipo, sucursal, área, cargos, estado, esGeneral, versionActual, versiones, config, desplazadaPor, creador, fechas |
| **Versión** | Una foto de la ruta guardada | v, etapas, fecha, autor |
| **Etapa** | Un tramo del recorrido | nombre, duración en días, bloqueada (si viene de la general), actividades |
| **Actividad** | Un grupo de tareas | nombre, tareas |
| **Tarea** | Lo que se hace | id, nombre, tipo, descripción, responsable, díaDesde, díaHasta, puntos, contenido según el tipo |
| **Asignación** | El caso de una persona | id, persona, área, cargo, ruta, versión, etapas (copia), día, totalDías, avance, estado, fechaInicio, buddy |
| **Recurso** | Un material de la biblioteca | carpeta, nombre, tipo, enlace o archivo, estado, visibilidad, prueba |
| **Configuración** | Los valores de la empresa | asignación, hora, gamificación, asistente, menciones, díasEnRiesgo, extensión, certificado |
| **Proceso** | Una entrada de Mi trayectoria | tipo, motivo, fechas, estado, etapas (congeladas) |

### 5.2 La ruta y sus versiones

Una ruta guarda **todas sus versiones**. Mientras es borrador se edita la misma; cuando ya se asignó, cada guardado agrega una —BR‑ONB‑020—. La **versión actual** es la que reciben las asignaciones nuevas.

### 5.3 Las tareas por tipo

Además de sus campos comunes, cada tarea guarda lo de su tipo: el material de la biblioteca o el enlace (video, audio, documento), las preguntas (prueba, formulario, pulso), la lista de pasos (otra tarea), las paradas y el guía (recorrido), los documentos pedidos (subida) y la prueba de comprensión que tiene a continuación.

### 5.4 La asignación y su copia congelada

Al asignar se guarda la **versión** y una **copia de sus etapas**. El recorrido de una persona se lee, en orden, de: la versión fijada al asignar, su copia, la ruta vigente. Así editar una ruta nunca cambia un recorrido empezado —BR‑ONB‑022—.

### 5.5 Lo que se guarda y lo que se deduce

| Dato | Cómo se obtiene |
| --- | --- |
| Duración de la ruta | Suma de las duraciones de sus etapas |
| Día en que va | Días desde la fecha de inicio, sin contar las pausas |
| Avance | Tareas completadas sobre el total |
| Estado del onboarding | De la fecha de inicio, las tareas vencidas, los días sin actividad y la pausa |
| Situación en el directorio | De la asignación: sin ruta, sin iniciar, en curso, en riesgo o graduado |
| Puntos | Suma de los puntos de las tareas completadas |

> **En la maqueta:** el avance, el día y el estado se guardan a mano en cada asignación, y la situación del directorio es otro dato aparte.

## 06 · Roadmap

*Cómo se llega de la maqueta a producción, en qué orden y con qué decisiones pendientes.*

### 6.1 Camino a desarrollo

La maqueta es la referencia de pantallas y comportamiento; este documento, la de reglas. Lo que la maqueta todavía no hace está marcado en cada regla y reunido en el anexo del prototipo.

### 6.2 Tres entregas

| Entrega | Qué incluye |
| --- | --- |
| **1 · Rutas** | Rutas, constructor, ruta general, estados, reemplazo y versiones |
| **2 · Asignar y seguir** | Asignación manual, Seguimiento, detalle, buddy, pausa, desasignar, recordatorio y los estados calculados |
| **3 · La experiencia del colaborador** | Mi Onboarding con el bloqueo de etapas, las tareas guardando lo que se responde y sube, la graduación con certificado, y la asignación automática |

### 6.3 Hitos

| Hito | Se cumple cuando |
| --- | --- |
| **Primera ruta activa** | Una ruta pasa de borrador a activa con su puesto |
| **Primer graduado** | Una persona completa una ruta asignada y queda Graduado en el directorio |
| **Seguimiento vivo** | En riesgo y Atrasado se calculan solos |

### 6.4 Dependencias

- **Organización**: sucursales, áreas, cargos y jefes reales para las rutas y el equipo del líder.
- **Gestión de personas**: un solo registro de la situación de onboarding de cada persona.
- **Documentación**: la carpeta Onboarding del expediente.
- **Comunicación**: el envío de recordatorios y las menciones.

### 6.5 Suposiciones

- Toda persona que ingresa tiene un cargo y una sucursal en Organización.
- Una persona hace un solo onboarding a la vez.

### 6.6 Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Puestos sin ruta activa | Avisar al dejar un cargo sin ruta —ABIERTA‑ONB‑09— |
| Estados que no reflejan la realidad | Calcularlos, no guardarlos —5.5— |
| Dos registros de la misma persona | Unificar la asignación y el directorio |

### 6.7 Decisiones abiertas

| Código | Pregunta | Antes |
| --- | --- | --- |
| ABIERTA‑ONB‑01 | ¿Qué pasa con la asignación automática si el puesto no tiene ruta activa o hay empate? | P‑04 |
| ABIERTA‑ONB‑02 | ¿Un puesto puede tener a la vez una ruta activa de onboarding y otra de reboarding? | P‑28 |
| ABIERTA‑ONB‑03 | Al pasar a alguien a la versión nueva, ¿qué pasa con lo que ya completó? | P‑21 |
| ABIERTA‑ONB‑04 | Unificar el umbral de las pruebas: el 100 % de la regla y el 70 % de la maqueta | RN‑M63 |
| ABIERTA‑ONB‑05 | Redefinir «Otra tarea», que hoy confunde | P‑12 |
| ABIERTA‑ONB‑06 | Que un documento pedido acepte más de un formato | P‑10 |
| ABIERTA‑ONB‑07 | Todas obligatorias o un control de «obligatoria» por tarea | RN‑M59 |
| ABIERTA‑ONB‑08 | ¿El líder puede desasignar? | P‑30 |
| ABIERTA‑ONB‑09 | Avisar cuando un cargo se queda sin ruta | P‑27 |
| ABIERTA‑ONB‑10 | Registro de quién cambia el estado de una ruta | P‑29 |
| ABIERTA‑ONB‑11 | Política de conservación de los documentos del onboarding | P‑18 |
| ABIERTA‑ONB‑12 | Operación en Bolivia: el catálogo de sucursales de las rutas | P‑03 |

## 07 · Flujos de usuario

*Los recorridos principales, paso a paso y por perfil.*

### Para Recursos Humanos

### 7.1 Crear y activar una ruta

1. En Rutas, «Nueva ruta»: nombre, tipo, sucursal, área y cargos. Si el puesto ya tiene ruta, se avisa.
2. «Crear y diseñar ruta» la crea en Borrador y abre el constructor.
3. Se agregan etapas, actividades y tareas —o se parte de una plantilla— y se guarda.
4. En Rutas, «Cambiar estado» › Activo. Si el puesto tenía otra, se confirma el reemplazo.

### 7.2 Asignar una ruta

1. En Seguimiento, «Asignar ruta a colaboradores».
2. Se elige la ruta; la lista muestra a las personas de su área.
3. Se eligen una o varias y la fecha de inicio.
4. «Asignar a N colaboradores»: quedan Programados.

### 7.3 Destrabar a alguien en riesgo

1. El Dashboard lo muestra en «Necesitan atención».
2. En su detalle se ve en qué va y qué le falta.
3. «Enviar recordatorio» por WhatsApp o en la plataforma, o se le asigna un buddy.

### 7.4 Cambiar una ruta que ya se usa

1. Se abre en el constructor, se cambia y se pulsa «Guardar cambios».
2. Si hay gente adentro, se elige quién recibe los cambios: solo los futuros o también los que siguen.
3. Queda una versión nueva; el historial guarda la anterior.

### Para El líder de área

### 7.5 Ver cómo va mi equipo, en la web

1. Entra al módulo Onboarding: abre el Dashboard de su equipo.
2. Mira «Atención requerida»: quién está en riesgo y quién no tiene ruta.
3. Abre a una persona y, desde su detalle, le envía un recordatorio o le cambia el buddy.

### 7.6 Ver cómo va mi equipo, en el celular

1. En Inicio, toca «Ver el onboarding de mi equipo».
2. Ve a su gente agrupada por motivo, con «Necesitan atención» abierto.
3. Toca a una persona para ver su avance y su recorrido.

### 7.7 Preparar la ruta de un cargo de mi área

1. En Rutas, abre una ruta de su área y la edita en el constructor.
2. Agrega a su auxiliar entre las personas con acceso, para que pueda seguir editándola.
3. Cuando está lista, la activa desde «Cambiar estado».

### Para El auxiliar

### 7.8 Seguir el área de mi líder

1. Entra al módulo: ve Rutas y Seguimiento de su área —y de su sucursal, si está acotado—.
2. En Seguimiento, envía un recordatorio a quien está en riesgo o pausa a quien está de licencia.
3. En Rutas, edita las rutas a las que tiene acceso; las demás solo las ve.

### Para El buddy

### 7.9 Acompañar a quien me asignaron

1. En el celular, toca «Acompañar a mi gente» en Inicio; en la web, abre Mis acompañados.
2. Quien está en riesgo va primero, con la sugerencia de escribirle.
3. Abre su recorrido, en solo lectura, para saber en qué va antes de hablarle.

### Para El colaborador

### 7.10 Hacer mi onboarding

1. Abre Mi Onboarding —en el celular, la pestaña Onboarding— y ve la bienvenida.
2. «Empezar mi onboarding» muestra su recorrido.
3. Toca una tarea, la hace, y se completa sola o la marca.
4. Al terminar las obligatorias de una etapa, se abre la siguiente.
5. Al terminar la última, se gradúa y ve la celebración.

### 7.11 Volver a mirar lo que hice

1. Desde Mi Onboarding, «Ver historial».
2. Ve cada proceso —su onboarding y sus reboardings— con su estado.
3. Abre uno para ver su recorrido tal como lo hizo.

## 08 · Recursos visuales

*Las pantallas del módulo por perfil, con su dirección en la maqueta. Los wireframes dibujados son la maqueta misma.*

### Para Recursos Humanos

### 8.1 Pantallas de Recursos Humanos

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑ONB‑01 | Dashboard | /onboarding |
| W‑ONB‑02 | Seguimiento | /onboarding/asignaciones |
| W‑ONB‑03 | Detalle de un onboarding | /onboarding/asignaciones/:id |
| W‑ONB‑04 | Asignar ruta | ventana sobre Seguimiento |
| W‑ONB‑05 | Rutas | /onboarding/plantillas |
| W‑ONB‑06 | Constructor de rutas | sobre Rutas |
| W‑ONB‑07 | Propiedades de la tarea | ventana del constructor |
| W‑ONB‑08 | Recursos corporativos | /onboarding/conocimiento |
| W‑ONB‑09 | Configuración avanzada | /onboarding/configuracion |

### Para El líder de área

### 8.2 Pantallas del líder

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑ONB‑10 | Dashboard de mi equipo | /onboarding (como líder) |
| W‑ONB‑02 | Seguimiento — {área} | /onboarding/asignaciones |
| W‑ONB‑03 | Detalle de un onboarding de su área | /onboarding/asignaciones/:id |
| W‑ONB‑05 | Rutas — {área} | /onboarding/plantillas |
| W‑ONB‑15 | Mi equipo en el celular | Inicio › «Ver el onboarding de mi equipo» |

### Para El auxiliar

### 8.3 Pantallas del auxiliar

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑ONB‑05 | Rutas — {área}, con acceso delegado | /onboarding/plantillas |
| W‑ONB‑02 | Seguimiento — {área} | /onboarding/asignaciones |
| W‑ONB‑03 | Detalle de un onboarding de su área | /onboarding/asignaciones/:id |

### Para El buddy

### 8.4 Pantallas del buddy

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑ONB‑11 | Mis acompañados | /mi-espacio/acompanados |
| W‑ONB‑16 | Acompañar desde el celular | Inicio › «Acompañar a mi gente» |
| W‑ONB‑12 | Mi Onboarding, ya completado | /mi-espacio/mi-onboarding |

### Para El colaborador

### 8.5 Pantallas del colaborador

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑ONB‑12 | Mi Onboarding | /mi-espacio/mi-onboarding · pestaña Onboarding del celular |
| W‑ONB‑13 | Tarea | dentro de Mi Onboarding |
| W‑ONB‑14 | Mi trayectoria | «Ver historial», desde Mi Onboarding |

### Para Todo el módulo

### 8.6 Personas de la demo

| Persona | Perfil | Muestra |
| --- | --- | --- |
| **Juan Pérez** | Recursos Humanos | Todo el módulo de administración |
| **Ana Martínez** | Líder de Marketing, web y celular | Su equipo, Seguimiento y Rutas de su área |
| **Laura Díaz** | Auxiliar de Marketing, acotada a La Paz | El acceso delegado |
| **Diego Morales** | Buddy, web y celular | Mis acompañados y su trayectoria con cinco procesos |
| **Carlos Mendoza** | Colaborador en el celular | La pestaña Onboarding y su ruta |
| **María López** | Colaboradora web | Su ruta en la web |
| **Nicolás Zapata** | Colaborador graduado | La ruta completada en solo lectura |

## 09 · Historias de usuario

*Lo que necesita cada perfil, con sus criterios de aceptación.*

### Para Recursos Humanos

### 9.1 Historias de Recursos Humanos

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ONB‑01 | **Como** Recursos Humanos, **quiero** armar una ruta por puesto **para** que todos los que llegan reciban lo mismo | Se crea en borrador · Se arma por etapas, actividades y tareas · Se guarda a mano |
| HU‑ONB‑02 | **Como** Recursos Humanos, **quiero** activar y reemplazar rutas **para** que cada puesto tenga una vigente | Un puesto, una ruta activa · El reemplazo no interrumpe a nadie |
| HU‑ONB‑03 | **Como** Recursos Humanos, **quiero** rutas de reboarding **para** acompañar los cambios de puesto | Se ofrecen a quien ya se graduó |
| HU‑ONB‑04 | **Como** Recursos Humanos, **quiero** una ruta general **para** escribir una vez lo común | Se antepone, bloqueada · Una sola |
| HU‑ONB‑05 | **Como** Recursos Humanos, **quiero** cambiar una ruta sin mover a quien ya empezó | Versiones · Elegir quién recibe los cambios |
| HU‑ONB‑06 | **Como** Recursos Humanos, **quiero** asignar rutas y ver cómo va cada uno | Asignar a varios · Seis estados |
| HU‑ONB‑07 | **Como** Recursos Humanos, **quiero** destrabar, pausar o desasignar **para** manejar cada caso | Recordatorio solo en alerta · Desasignar no borra |
| HU‑ONB‑08 | **Como** Recursos Humanos, **quiero** una biblioteca de materiales **para** reutilizarlos en las rutas | Carpetas · Las tareas la usan |
| HU‑ONB‑13 | **Como** Recursos Humanos, **quiero** fijar los valores de la empresa una vez | Cada ruta los hereda · Lo apagado no se usa |

### Para El líder de área

### 9.2 Historias del líder

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ONB‑11 | **Como** líder, **quiero** ver el onboarding de mi gente **para** ayudar a quien se trabó | Solo mi equipo · Por urgencia · Un ingreso sin ruta es una alerta |
| HU‑ONB‑15 | **Como** líder, **quiero** ver a mi equipo desde el celular **para** saber entre reunión y reunión quién necesita algo | Agrupado por motivo · Lo urgente abierto · Los mismos números que en la web |
| HU‑ONB‑16 | **Como** líder, **quiero** preparar las rutas de mi área y darle acceso a mi auxiliar **para** no depender de Recursos Humanos en cada cambio | Edito las rutas de mi área · Agrego personas con acceso · No creo rutas nuevas |

### Para El auxiliar

### 9.3 Historias del auxiliar

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ONB‑17 | **Como** auxiliar, **quiero** seguir el onboarding del área de mi líder **para** ayudarlo con los recordatorios y las pausas | Solo Rutas y Seguimiento · Solo mi área y mi sucursal |
| HU‑ONB‑18 | **Como** auxiliar, **quiero** editar las rutas que mi líder me delegó | Edito solo las rutas con acceso · Las demás las veo |

### Para El buddy

### 9.4 Historias del buddy

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ONB‑12 | **Como** buddy, **quiero** ver cómo va quien acompaño **para** escribirle a tiempo | Avance y recorrido · Sin respuestas ni datos personales |
| HU‑ONB‑19 | **Como** buddy, **quiero** ver primero a quien está en riesgo **para** no dejar a nadie trabado | En riesgo primero · Cuántos están en riesgo |
| HU‑ONB‑20 | **Como** buddy, **quiero** entrar rápido desde el celular **para** acompañar entre una cosa y otra | «Acompañar a mi gente» en Inicio · Mi ruta ya completada aparte |

### Para El colaborador

### 9.5 Historias del colaborador

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ONB‑09 | **Como** colaborador, **quiero** ver mi recorrido y hacer mis tareas, en la web o en el celular | Cada tipo se completa a su manera · Etapas en orden |
| HU‑ONB‑10 | **Como** colaborador, **quiero** graduarme y conservar mi trayectoria | Celebración · Ruta en solo lectura · Historial congelado |
| HU‑ONB‑14 | **Como** colaborador, **quiero** preguntarle a un asistente **para** no depender de que alguien me conteste | Responde desde la biblioteca · Dice si no sabe |

## Cómo se mantiene este documento

- Se actualiza junto con la maqueta: un cambio de comportamiento lleva su cambio aquí, en la misma entrega.
- Los códigos no cambian nunca. Una regla que deja de valer se marca, no se renumera.
- La versión en Markdown (`modulo-onboarding.md`) y la página (`public/onboarding.html`) dicen lo mismo: se generan juntas.
- El documento anterior, «Documentación de la Maqueta — Módulo de Onboarding» (`documentacion.html`), queda como histórico. Cada regla de este documento dice de qué regla RN‑M viene.

## Historial de versiones

| Versión | Fecha | Qué cambió |
| --- | --- | --- |
| **1.0** | 15 oct 2026 | **Primera versión con el formato de los demás módulos.** Reúne lo construido en la maqueta hasta el 15 de octubre —la vista de Recursos Humanos, del líder, del auxiliar, del buddy y del colaborador, en la web y en el celular— y las reglas del documento anterior, revisadas: 70 reglas BR‑ONB, cada una con su origen RN‑M, más las que solo estaban en el código, como el reemplazo de rutas, la elección de quién recibe los cambios y el «Completar perfil» único por ruta. Las pendientes P‑01 a P‑30 pasan a decisiones abiertas cuando siguen abiertas. Suma el anexo «El módulo en el prototipo, hoy». **Todo se ordena por perfil** —Recursos Humanos, líder de área, auxiliar, buddy y colaborador—: funcionalidades con sus propios requisitos, reglas de negocio, flujos, pantallas e historias de usuario, para que cada perfil se pueda construir y probar por separado |

## Anexo · Por qué decidimos así

#### Por qué una ruta se ata a un puesto y no a un área

Un área tiene cargos muy distintos: lo que necesita saber un analista no es lo que necesita un jefe. Atar la ruta al cargo en su sucursal permite que la asignación automática sepa qué dar, sin preguntar.

#### Por qué «Archivado» se unió a «Inactivo»

Las dos significaban «ya no se asigna». Tener dos estados para lo mismo obligaba a explicar la diferencia en cada pantalla. Inactivo es el archivo del sistema.

#### Por qué una ruta nunca vuelve a borrador

Un borrador no existe para nadie. Si una ruta ya usada pudiera volver, desaparecería para quienes la hicieron.

#### Por qué guardar no activa

Cuando el constructor tenía «Guardar y activar», se activaban rutas a medio armar. Activar quedó en Rutas, donde se ve el puesto y el choque.

#### Por qué la pregunta de quién recibe los cambios tiene dos opciones

Hubo una tercera —aplicar a todos, también a los que ya terminaron— que no tiene sentido: a quien terminó no le cambia nada. Quedaron las dos que deciden algo.

#### Por qué el buddy no ve las respuestas

Acompañar no es evaluar. Si el buddy viera las respuestas de una prueba, la persona nueva respondería para su compañero y no para aprender.

#### Por qué la pestaña Onboarding del celular desaparece

Es un atajo para quien está en su incorporación. Para un graduado sería una pestaña vacía ocupando la barra; entra por Zona HR.

#### Por qué el líder ve a su gente y no su área

Un área puede tener varios líderes. Mostrarle a cada uno todo el área lo haría seguir a personas que no dependen de él.

## Anexo · El módulo en el prototipo, hoy

*Cómo está construido el módulo de onboarding en el prototipo al 15 de octubre de 2026, y en qué se aparta de este documento. Todo sale del código de `ficha_colaborador`.*

### Las pantallas y sus rutas

| Dirección | Componente | Qué hay |
| --- | --- | --- |
| `/onboarding` | `pages/onboarding/Dashboard.jsx` | Dashboard de Recursos Humanos; para el líder, el de su equipo |
| `/onboarding/asignaciones` | `Asignaciones.jsx` | Seguimiento, tabla o tarjetas, con asignar, buddy, pausar, recordar y desasignar |
| `/onboarding/asignaciones/:id` | `DetalleAsignacion.jsx` | Detalle de un onboarding |
| `/onboarding/plantillas` | `Plantillas.jsx` + `JourneyBuilder.jsx` | Rutas y constructor |
| `/onboarding/conocimiento` | `Conocimiento.jsx` | Recursos corporativos (también en `/archivos/onboarding`) |
| `/onboarding/configuracion` | `Configuracion.jsx` | Configuración avanzada |
| `/mi-espacio/mi-onboarding` | `pages/colaborador/MiOnboarding.jsx` | Mi Onboarding |
| `/mi-espacio/acompanados` | `pages/onboarding/MisAcompanados.jsx` | Mis acompañados |
| celular | `Layout.jsx`, `OnboardingHubPhone`, `SeguimientoPhone`, `AcompanadosPhone`, `RecorridoPhone` | Pestaña Onboarding, hub del líder y del buddy |

### Lo que la maqueta todavía no hace

| Tema | En la maqueta | Regla |
| --- | --- | --- |
| Estados | No cambian solos: En riesgo, Atrasado, el paso a En curso y la graduación son datos de ejemplo | BR‑ONB‑036, 038 a 040 |
| Avance | Qué tareas están hechas se deduce del porcentaje, en orden | 5.5 |
| Dos registros | Asignar desde Gestión de personas no crea la asignación de Seguimiento, y al revés | 2.2 |
| Organización | Áreas, cargos y sucursales de las rutas escritos a mano; la lista de personas para asignar es fija | 2.1 |
| Configuración | Solo funcionan los puntos y el asistente IA; la asignación automática, el umbral de riesgo, las menciones, la extensión y el certificado se guardan sin efecto | BR‑ONB‑037, 055 a 059 |
| Configuración de la ruta | Solo funcionan los puntos e incluir la ruta general | 3.6 |
| Dashboard | Tiempo promedio, Próximos ingresos, Actividad reciente y Programar reconocimiento son fijos | 3.1 |
| Etapas | No se bloquean | BR‑ONB‑062 |
| Pruebas | El video pide 70 %; la prueba suelta no tiene umbral | BR‑ONB‑028 |
| Subidas y respuestas | No se guardan | BR‑ONB‑030 |
| Recordatorio | Se registra, no se envía | BR‑ONB‑047 |
| Desasignar | Dice que se pierde el progreso y no pide motivo | BR‑ONB‑046 |
| Puntos | Mi Onboarding los muestra aunque la gamificación esté apagada | BR‑ONB‑032 |
| Líder | Web y celular arman el equipo distinto; «Ver los restantes en Seguimiento» lleva a una dirección que no existe | BR‑ONB‑049 |
| Auxiliar | Las personas con acceso no se guardan; su sucursal no se aplica | BR‑ONB‑048, 050 |
| Permisos | Nada impide al líder o al auxiliar escribir la dirección de Recursos corporativos o Configuración avanzada | BR‑ONB‑048 |
| Buddy | En la web, el recorrido del acompañado no marca qué hizo | 3.14 |
| Colaborador | «Ver organigrama» lo devuelve a la misma pantalla | 3.16 |
