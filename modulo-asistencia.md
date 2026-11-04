Souly HR · Módulo de asistencia · Documentación de producto

# Módulo de asistencia

> **Módulo de asistencia — versión en Markdown.** Reúne completo el documento de producto `public/modulo-asistencia.html` (versión 1.0, 29 de octubre de 2026): glosario, contexto, integraciones, funcionalidades por rol, las reglas de negocio con sus escenarios, modelo de datos, roadmap, flujos, pantallas, historias de usuario, el anexo de decisiones y el anexo «El módulo en el prototipo, hoy». Se apoya en el análisis de RR.HH. (`REQUERIMIENTOS_ASISTENCIA.md`, 27 requerimientos) y en la arquitectura del backend (`ASISTENCIA_ARQUITECTURA.md`).

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

La asistencia deja de ser una planilla que se arma a fin de mes y pasa a ser *un registro que se escribe solo, al segundo, con la prueba de cada marca, y que RR.HH. y la persona leen con los mismos números*. Este documento define qué es el módulo, qué reglas cumple, qué tiene que hacer el producto y cómo se opera.

- **Versión:** 1.0
- **Fecha:** 29 de octubre de 2026
- **Autoría:** Paola Gema — Diseñadora UX
- **Revisa y aprueba:** Por definir
- **Estado:** Borrador

| En este documento | Cantidad |
| --- | --- |
| roles con su vista | 3 |
| estados de un día | 13 |
| reglas de negocio | 58 |
| requisitos funcionales | 87 |
| historias de usuario | 20 |
| pantallas | 22 |
| decisiones abiertas | 11 |

> **El módulo, de un vistazo.** Asistencia tiene tres capas sobre un solo dato, la **marcación**. Arriba, la **configuración**: horarios (cuándo), políticas (qué se exige y cómo se calcula), lugares con su geocerca (dónde, tomados de Organización) y asignaciones (a quién le toca qué). En el medio, el **cálculo del día**: de las marcas válidas salen la entrada, la salida, lo trabajado, la tardanza, las alertas del descanso, las horas extra autorizadas y el estado. Abajo, lo que se hace con eso: **Hoy** lo mira en vivo, el **Libro** lo consulta por día, semana, mes, en calendario y por tema —faltas, retrasos, salidas sin marcar—, **Solicitudes** lo corrige y el **Cierre** lo congela para planillas. El colaborador marca desde el celular y ve los mismos números en Mi asistencia.

## 00 · Glosario

*Las palabras del módulo, con lo que significan en Souly. Se leen antes que nada porque todo lo demás las usa: una tardanza no es una alerta, quedarse no es hacer horas extra y una falta justificada no es una falta.*

### 0.1 Lugar, horario, política y asignación

Cuatro piezas deciden cómo marca cada persona:

| Pieza | Qué dice | De dónde sale |
| --- | --- | --- |
| **Lugar** | Dónde marca: una sucursal o un centro de trabajo, con su **geocerca** (un punto y un radio en metros) | Organización › Estructura física. Asistencia no crea lugares: les dibuja la geocerca encima |
| **Horario** | Cuándo trabaja: **fijo** (entrada, salida, días y una franja de descanso) o **flexible** (una meta de horas al día, sin hora de entrada) | Configuración › Horarios |
| **Política de marcación** | Qué se exige al marcar (rostro, estar en el lugar) y cómo se calcula el día (tolerancias, descanso no marcado, redondeo) | Configuración › Políticas de marcación |
| **Asignación** | Qué horario, qué lugar, qué modalidad y qué política tiene una persona, desde qué fecha | Configuración › Asignaciones, o el alta en Gestión de personas |

La **modalidad** es parte de la asignación: **presencial** (marca dentro de la geocerca), **remoto** (marca desde donde esté; se controlan el rostro y el horario) o **híbrido** (los días de oficina con geocerca; los demás, en remoto).

### 0.2 Marcación y jornada

Una **marcación** es un registro de un momento: **entrada**, **inicio de pausa**, **fin de pausa** o **salida**. Guarda la hora del servidor al segundo, la ubicación, la distancia al lugar, si estaba dentro, la similitud del rostro y su **origen**: la app o el panel de RR.HH. Una marca puede quedar **rechazada** (el rostro no coincidió o estaba fuera de la geocerca), **ajustada** (cambió su hora, con la original a la vista) o **anulada** (sigue visible, en gris).

La **jornada** es el día de una persona calculado de sus marcas válidas: entrada, salida, descanso, trabajado, programado, tardanza, alertas, horas extra y estado. No se guarda: se deduce cada vez.

### 0.3 Los trece estados de un día

| Estado | Cuándo | Solo hoy |
| --- | --- | --- |
| **Aún no le toca** | Todavía no es su hora de entrada más la tolerancia | Sí |
| **No ha llegado** | Ya pasó su hora de entrada y la tolerancia, y no marcó | Sí |
| **Trabajando** | Marcó la entrada y está en su jornada | Sí |
| **En descanso** | Marcó el inicio de su descanso | Sí |
| **Terminó su jornada** | Marcó entrada y salida; hoy, aunque haya llegado tarde | Sí |
| **Terminó su jornada** (un día pasado) | Cumplió su jornada | No |
| **Llegó tarde** | Entró después de su hora de entrada más la tolerancia | No |
| **Salió antes** | Salió antes de su hora de salida, pasada la tolerancia | No |
| **Horas extra** | Trabajó horas extra autorizadas | No |
| **Salida sin marcar** | Marcó la entrada y nunca la salida | No |
| **Faltó** | Tenía jornada y no marcó | No |
| **De vacaciones · Con permiso · Con licencia** | Ausencia justificada; se muestra su motivo | No |
| **Día libre** | No tiene jornada programada ese día | No |

Cada estado tiene palabra y color; nunca solo color. En las tablas va en una píldora de color con una línea que dice qué pasa: «Trabajando · desde 08:34», «No ha llegado · debía entrar 08:30». El atraso no cambia el estado: va en ámbar junto a la hora de entrada.

### 0.4 Tardanza, tolerancia y redondeo

La **tolerancia de entrada** son los minutos de gracia de la política: con entrada 08:30 y 10 min, quien marca hasta las 08:40 llega a tiempo. La **tardanza** es lo que pasa de la entrada más la tolerancia, al segundo: quien marca 08:40:59 suma 59 s. El **redondeo** de la política puede contarla por minuto completo o en bloques de 5 min, siempre hacia abajo, a favor de la persona. Hay una sola tardanza por día y todas las pantallas leen esa.

### 0.5 Alerta y justificación

Una **alerta** es algo del día que se aparta de su horario: llegó tarde, salió antes al descanso, volvió tarde del descanso, excedió su descanso, no marcó su descanso o salió antes. La **justificación** es el motivo que la persona manda desde la app para una alerta; su jefe o RR.HH. lo acepta o no. Aceptada, la alerta deja de contar en contra en el cierre; rechazada, sigue contando como **injustificada**.

Justificar **un día entero** es otra cosa: una vacación, un permiso de día completo o una licencia aprobados vuelven el día **Justificada**, y no cuenta como falta.

### 0.6 Horas extra y fuera de horario

Una **hora extra** existe solo si se autorizó: la persona la **pide** y RR.HH. la **aprueba**, o RR.HH. la **asigna** y la persona la **acepta**. Las dos terminan en una **ventana** (fecha, desde, hasta). Solo lo trabajado dentro de esa ventana cuenta como hora extra. Lo que alguien se quede después de su horario sin autorización es **fuera de horario**: se informa, no se paga.

### 0.7 Incidencia, solicitud y cierre

Una **incidencia** es un hecho que el sistema vio y alguien tiene que mirar: una falta sin justificar, una alerta sin motivo, una jornada sin salida, una marca rechazada o un rato fuera de horario. Una **solicitud** es un pedido de la persona: vacaciones, permiso o licencia, horas extra, justificación, corrección de marcación, trabajo remoto o cambio de turno. El **cierre** congela un mes para planillas: después ya no se corrige.

### 0.8 Quién es quién

| Rol | Qué hace en el módulo |
| --- | --- |
| **Recursos Humanos** | Configura, mira el día, corrige con motivo, responde solicitudes, autoriza horas extra y cierra el mes |
| **El líder de área** | Acepta o no las justificaciones de su gente y aprueba lo de su equipo —ABIERTA‑ASI‑01— |
| **El colaborador** | Marca desde el celular, ve su día, su semana y su mes, pide horas extra y correcciones, y justifica sus alertas |

## 01 · Contexto

*Por qué existe el módulo, qué problema resuelve y cómo se sabe si funcionó.*

### 1.1 ¿Qué es la asistencia en Souly?

Es el registro de cuándo trabaja cada persona y la prueba de que fue ella. El colaborador marca desde su celular con su rostro y su ubicación; el servidor pone la hora y decide si la marca vale. De esas marcas sale el día de cada persona, que RR.HH. mira en vivo, corrige con motivo y entrega cerrado a planillas.

### 1.2 El problema que resuelve

- La asistencia se arma a mano al fin de mes, con planillas que nadie puede probar.
- Cualquiera marca por otro: un reloj biométrico en la puerta no sirve para quien trabaja en ruta o desde casa.
- Una tardanza se calcula distinto en cada reporte: «1 h 18» en uno y «1 h 8» en otro.
- Quedarse más tiempo se paga como hora extra aunque nadie lo haya pedido.
- El descanso se cuenta como minutos sueltos y no como la franja que dice el reglamento.
- Las correcciones se hacen borrando, y después nadie sabe qué se cambió.
- La persona no ve sus números y la discusión llega con el sueldo.

### 1.3 Visión del módulo

Un registro que se escribe solo, al segundo, con la evidencia de cada marca; que calcula el día con las reglas de la empresa y una sola vez; que deja corregir sin borrar; y que la persona y RR.HH. leen igual.

### 1.4 Principios de diseño

| Principio | Qué significa |
| --- | --- |
| **El dispositivo captura, el servidor decide** | El celular toma la ubicación y el rostro; la hora, la geocerca y la similitud las decide el servidor |
| **Al segundo, siempre** | Se guarda al segundo y cada pantalla trunca al mostrar: nunca dice más tiempo del que hubo |
| **Un solo cálculo** | La tardanza, el descanso y las horas extra se calculan en un solo lugar; las pantallas solo leen |
| **Corregir no borra** | Un ajuste deja la hora original tachada; anular deja la marca gris; todo pide motivo y queda quién fue |
| **Solo cuenta lo autorizado** | Una hora extra existe si alguien la autorizó; quedarse no la genera |
| **Lo justificado no es falta** | Vacaciones, permisos y licencias aprobados sacan el día de las faltas y de los «esperados» |
| **Los mismos números de los dos lados** | La persona ve en su app exactamente lo que ve RR.HH. |
| **Lo pendiente tiene puerta** | Hoy dice qué resolver y cada aviso lleva directo a resolverlo |

### 1.5 Cómo se sabe si funcionó

| Indicador | Meta |
| --- | --- |
| Marcaciones desde la app | Más del 95 % de las marcas con origen app, no cargadas por RR.HH. |
| Tiempo para cerrar el mes | Que RR.HH. cierre en el primer día hábil del mes siguiente |
| Faltas y salidas sin marcar sin revisar al cierre | Cero |
| Horas extra sin autorización pagadas | Cero |
| Discusiones por la asistencia en la liquidación | Que bajen mes a mes |

### 1.6 A quién sirve

- **Recursos Humanos**, que deja de armar la planilla a mano y tiene la prueba de cada marca.
- **El colaborador**, que marca en segundos, sabe cómo va su mes y explica sus atrasos el mismo día.
- **El líder**, que sabe quién está y responde los motivos de su gente.
- **La empresa**, que paga lo que corresponde y tiene un registro inalterable ante una inspección del trabajo.

### 1.7 Alcance y límites

- **Entra:** horarios fijos y flexibles con franja de descanso; políticas de marcación con tolerancias y redondeo; geocercas sobre los lugares de Organización; asignaciones individuales y masivas; marcar con rostro y ubicación desde el celular; el cálculo del día al segundo; Hoy, Libro de asistencia por día, semana y mes; la asistencia de una persona; Incidencias; Solicitudes de vacaciones, permisos y licencias, horas extra, justificaciones, correcciones, trabajo remoto y cambios de turno; saldos de vacaciones; corregir, anular y marcar a mano con motivo; el cierre del mes y la exportación para planillas; biometría con consentimiento y retención de selfies; Mi asistencia del colaborador.
- **No entra en esta versión:** la bolsa de horas y su compensación (#11); horarios distintos por día o con vigencia (#3); turnos que cruzan la medianoche; marcar sin conexión; el domicilio autorizado para remotos (#19); vincular el celular a la persona; la cobertura mínima configurable por cargo (#21); reportes por área, día de la semana y motivo (#24); el envío real de avisos.

## 02 · Integraciones

*Con qué módulos se habla y qué toma de cada uno. Asistencia no guarda copia de nada que no sea suyo.*

### 2.1 Organización

- Los **lugares** de marcación son las sucursales y los centros de trabajo de Estructura física. Asistencia no los crea: les dibuja la geocerca. «Ir a Organización» lleva a crearlos.
- La **unidad organizacional**, la sucursal y el centro de cada persona son los filtros de todas las pantallas.

### 2.2 Gestión de personas

- La **ficha** es la dueña de los datos de la persona: nombre, cargo, unidad, fecha de ingreso. Asistencia los lee.
- El **alta** de un colaborador tiene el paso «Asignación de asistencia»: horario, lugar, modalidad y política desde su fecha de ingreso. Con «No controla» la persona no marca y no se le cuentan faltas.
- Un desvinculado sale de todas las listas.
- La **fecha de ingreso** da los días de vacaciones por año.

### 2.3 Mi espacio y la app del colaborador

- **Inicio** del celular muestra el día con el botón de la próxima marca.
- **Zona HR › Mi asistencia** muestra su semana, su mes y sus días; **Mis solicitudes** le deja pedir horas extra y corregir una marcación.
- **Mis documentos** guarda las papeletas de las vacaciones y los permisos aprobados.
- **Mis beneficios** pide el día libre de cumpleaños, que RR.HH. ve como un permiso más.

### 2.4 Comunicación

- Los **avisos** al colaborador —la marca que falta, la alerta con «Agregar motivo»— salen por las notificaciones de la app. Hoy solo se configuran y se simulan —ABIERTA‑ASI‑06—.

### 2.5 Planillas

- Planillas toma el **cierre** del mes en un formato fijo, en segundos: días, ausencias, tardanza y descanso injustificados, salidas anticipadas, horas extra aprobadas trabajadas y fuera de horario.

### 2.6 Resumen

| Módulo | Qué toma Asistencia | Qué le da |
| --- | --- | --- |
| Organización | Sucursales, centros de trabajo y unidades | La geocerca de cada lugar |
| Gestión de personas | La ficha, el alta y la fecha de ingreso | La asignación desde el alta |
| Mi espacio | — | Mi asistencia, las solicitudes y las papeletas |
| Comunicación | El canal de avisos | Los avisos de marca y de alertas |
| Planillas | — | El cierre del mes en formato fijo |

## 03 · Funcionalidades

*Cada pantalla, qué tiene y qué tiene que hacer. Primero las de Recursos Humanos, en el orden del menú; después lo que ve el líder, las del colaborador y las de todo el módulo.*

### Para Recursos Humanos

Las pantallas del módulo Asistencia del menú lateral: Hoy, Libro de asistencia —que se despliega en Todas las jornadas y sus temas: Faltas, Retrasos y descansos, Salidas sin marcar, Marcaciones rechazadas y Fuera de horario—, Solicitudes —que se despliega en sus siete tipos— y Configuración —que se despliega en sus seis partes—.

### 3.1 Hoy

La pantalla con la que RR.HH. empieza la mañana. Contesta, en orden: ¿cómo vamos?, ¿es un día normal?, ¿qué tengo que resolver?, ¿dónde?, ¿quién falta justificado?, ¿qué viene mañana? y ¿quiénes son?

- **Saludo** con el nombre y una línea: «El **N %** de tu gente ya está trabajando: llegaron X de Y», cuántos todavía no marcan y si eso es normal para ese día a esa hora —el promedio de las cuatro semanas anteriores—. Botones **«Ver a los N que faltan»** y **«Marcación manual»**.
- **Tres cifras** que filtran la lista: **Sin marcar** («Lo normal a esta hora: N»), **Llegaron tarde** (puntualidad del día contra la de hace una semana) y **Ausencias justificadas** (por motivo).
- **«Requiere tu atención»**, hasta cinco cosas en orden de gravedad: lugares que no abrieron, lugares bajo su mínimo, marcaciones rechazadas hoy, faltas sin justificar de los últimos 10 días, solicitudes de horas extra, gente fuera de horario y jornadas sin salida. Cada una con su botón: «Ver quiénes», «Revisar», «Justificar», «Responder», «Completar».
- **Colaboradores**: el estado en una lista desplegable junto al buscador, con su punto de color y su número —No han llegado, Llegaron tarde, Trabajando, Aún no les toca, Vacaciones y permisos y Todos—; la barra del día de cada uno. Un clic abre el detalle de la jornada.
- **Al costado**: el reloj y cuánto va de la jornada; la curva de presencia; el calendario del módulo; **Lugares en riesgo** con su medidor contra el mínimo; **Justificadas hoy** por motivo y quién vuelve mañana; y **Mañana**, con lo ya aprobado y el lugar que quedaría bajo su mínimo.
- **Marcación manual**: se elige a la persona y se abre su día para «Agregar marcación», con motivo obligatorio.
- Filtros de sucursal, centro de trabajo y unidad en la cabecera.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑001 | Los esperados excluyen a quien tiene el día libre o justificado | Oblig. | Con 3 de vacaciones, «Sin marcar» no los cuenta |
| RF‑ASI‑002 | «¿Es un día normal?» compara con el mismo día de las 4 semanas anteriores a la misma hora | Import. | Un lunes a las 9:00 se compara con los cuatro lunes anteriores a las 9:00 |
| RF‑ASI‑003 | «Requiere tu atención» muestra hasta cinco cosas en orden de gravedad, cada una con su acción | Oblig. | Un lugar sin abrir aparece antes que una jornada sin salida |
| RF‑ASI‑004 | Un lugar está bajo su mínimo si llegó menos del 80 % de su gente esperada | Oblig. | De 10 esperados llegan 7 y nadie más por llegar: «bajo su mínimo» |
| RF‑ASI‑005 | La marcación manual lleva al día de la persona y pide motivo | Oblig. | Sin motivo no se guarda |
| RF‑ASI‑006 | «Mañana» avisa qué lugar quedaría bajo su mínimo con lo ya aprobado | Import. | Con dos vacaciones aprobadas en una sucursal chica, aparece el aviso |

> **En la maqueta:** el mínimo para operar es el 80 % fijo para todos los lugares; todavía no se configura por lugar ni por cargo (#21).

### 3.2 Libro de asistencia

Todas las jornadas, un día, una semana o un mes a la vez. La fecha viaja en la dirección: se enlaza y la flecha de atrás vuelve.

- **Cabecera**: flechas para el día, la semana o el mes anterior y siguiente —nunca pasan de hoy—, «Ir a hoy» o «Ir a este mes», el selector **Día · Semana · Mes · Calendario** y el chip «Mes cerrado» si corresponde. **Exportar CSV** a la derecha.
- **Buscador** por nombre o cargo y filtros de sucursal, centro de trabajo y unidad en la misma fila.
- **Día**: una franja de conteos que filtra —Todos, Llegaron tarde, Sin marcar o Faltaron, Trabajando, Por llegar, Terminaron, Sin salida, Con permiso— y una tabla limpia, como el timesheet de BambooHR: el colaborador con su unidad y su lugar; su **horario** con el descanso, para comparar con la entrada sin pensar; la **entrada** con el atraso en naranja («+12 min tarde»); la **salida** con su nota («en turno», «40 min antes», «Descanso antes · 16 min»); **«Su día»**, una barrita de 06:00 a 22:00 —el riel es su horario, el verde lo que trabajó, el naranja el atraso o la salida antes, el rayado rojo la falta, el gris el permiso, el violeta sin salida y una rayita marca «ahora»—; las **horas trabajadas** de las programadas; y el **estado** en una píldora de color con una línea que dice qué pasa: «Trabajando · llegó 26 min tarde», «En descanso · vuelve 14:00», «No ha llegado · debía entrar 08:30», «Terminó su jornada · salió 15:04», «Salida sin marcar», «Aún no le toca · entra a las 09:00», y lo justificado con su motivo: «De vacaciones», «Con permiso» o «Con licencia».
- **Semana**: con el lenguaje del Mes. Cada día en el color lleno de su estado, con la hora de entrada y de salida; el fin de semana, apagado. A la derecha, las mismas columnas que el Mes —Retrasos, Tiempo de retraso, Faltas y **Horas de la semana**—. El día en curso no suma hasta que termina.
- **Mes**: la planilla clásica. Una fila por colaborador, un cuadrito por día con el color de su estado y, a la derecha, lo acumulado: **Retrasos** y **Tiempo de retraso** (las veces que llegó tarde y el tiempo acumulado, cada uno en su columna, con lo justificado debajo del tiempo), **Faltas** (las ausentes; las con permiso aparte, «+ 1 con permiso») y **Horas del mes** (las trabajadas de las programadas, y debajo «completas» o «faltan 4:00»). Las tres columnas se ordenan de mayor a menor.
- **Calendario**: la vista gráfica del mes, a toda la pantalla. Arriba a la derecha, dos íconos eligen la forma de ver: **tabla** (Día · Semana · Mes) o **calendario**. Cada día muestra las caras de quienes hay que mirar —aro rojo si faltó, ámbar si llegó tarde—, hasta cinco y «+N», y debajo cuántos; los días sin jornada se apagan. Al tocar un día se abre una ventana con todo ese día: seis cifras que también filtran (con jornada, faltaron, llegaron tarde, de vacaciones o con permiso, salida sin marcar y a tiempo), un buscador y la tabla del Día de esa fecha. Cada persona abre su jornada y «Abrir este día en el Libro» lleva a la vista Día.
- Un clic en un día abre el detalle de la jornada; en el nombre, la asistencia de esa persona.
- **Exportar CSV** baja el día, la semana o el mes hasta hoy, una fila por persona y día, con las horas al segundo y las duraciones en segundos.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑007 | El Libro tiene tres vistas, Día, Semana y Mes, y la fecha y la vista quedan en la dirección | Oblig. | Copiar el enlace de una semana abre esa semana |
| RF‑ASI‑008 | La navegación no pasa de hoy | Oblig. | En el mes en curso, «Mes siguiente» está desactivado |
| RF‑ASI‑009 | El Mes muestra por persona las tardanzas, las faltas y el saldo, ordenables | Oblig. | Ordenar por tardanzas pone primero a quien suma más minutos |
| RF‑ASI‑010 | Lo acumulado cuenta solo días cerrados | Oblig. | A media mañana, el saldo no cuenta el día de hoy |
| RF‑ASI‑011 | Las faltas con vacación, permiso o licencia van aparte | Oblig. | Una persona con una falta y un permiso muestra «1» y «+ 1 con permiso» |
| RF‑ASI‑012 | El Día filtra por estado con una franja de conteos | Import. | «6 Llegaron tarde» deja solo a esas seis |
| RF‑ASI‑013 | El CSV trae una fila por persona y día, con las duraciones en segundos | Oblig. | La tardanza de 59 s figura como 59 |

> **En la maqueta:** la vista Día es la opción E1 de la ronda 4 de propuestas —tabla limpia— con la barrita del día como columna; reemplaza a la de medias horas —ABIERTA‑ASI‑11, resuelta—.

### 3.3 La asistencia de una persona

Su mes con el mismo lenguaje del Libro: seis cifras arriba y el calendario grande abajo.

- **Cabecera**: nombre, cargo y unidad; su lugar, modalidad, horario, política y si tiene el rostro registrado. Sin asignación, «Asignar horario». A la derecha, las flechas de mes, **CSV** y **PDF**.
- **Seis cifras**: días trabajados (de los que tenía jornada, sin contar el día en curso), retrasos, tiempo de retraso, faltas, horas del mes (lo trabajado de lo programado, «completas» o «faltan») y puntualidad, con la racha de días seguidos a tiempo.
- **Calendario** del mes a todo el ancho, con la entrada y la salida de cada día en el color de su estado; un clic abre la jornada.
- Debajo, las horas extra trabajadas de las autorizadas y lo que quedó fuera de horario.

**El reporte en PDF.** **PDF** abre una ventana y baja un archivo A4 con el logo de SoulyHR, la empresa, el período, los datos de la persona, la fecha en que se generó y el número de página:

- **Página 1**: las seis cifras y el calendario en colores, igual que la pantalla.
- **Página 2**: cada día con su entrada, salida, horas, estado y la observación en palabras («Llegó 26 min tarde», «Salió 23 min antes», «Fuera de horario 17 min»), y las líneas para la firma de RR.HH. y de la persona.
- Con **«Incluir las marcaciones al segundo»**, se suman hojas en horizontal con la entrada, el descanso y la salida al segundo, la tardanza y cómo marcó; es el documento para una auditoría o una inspección del trabajo.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑014 | El saldo del mes es lo trabajado menos lo programado de los días cerrados | Oblig. | Un día de 7 h 30 con 8 h programadas resta 30 min |
| RF‑ASI‑015 | La puntualidad se calcula sobre los días que marcó | Import. | 18 a tiempo de 20 marcados: 90 % |
| RF‑ASI‑016 | La persona ve en su app el mismo saldo y la misma puntualidad | Oblig. | Los números de Mi asistencia coinciden con esta pantalla |
| RF‑ASI‑075 | El reporte en PDF trae las mismas cifras y el mismo calendario que la pantalla | Oblig. | «20 de 21» en pantalla es «20 de 21» en el papel |
| RF‑ASI‑076 | El PDF lleva el detalle de cada día y lugar para dos firmas | Import. | Un mes de 22 días hábiles trae 22 filas y las firmas de RR.HH. y de la persona |
| RF‑ASI‑077 | Las marcaciones al segundo van en el PDF solo si se piden | Opc. | Sin la casilla, el archivo tiene dos páginas |

### 3.4 El detalle de una jornada

Todo lo de un día de una persona, y el único lugar donde se corrige.

- **Cifras**: entrada y salida al segundo, trabajado, programado y tardanza o extra aprobada.
- **La barra del día** con sus marcas, el horario y la franja de descanso; la línea del descanso («tomó X · se descontaron X por no marcarlo»).
- **Alertas** del día con su detalle y en qué está su justificación: aceptada, por revisar, no aceptada o avisada sin motivo.
- **Horas extra** del día: su ventana, su estado y cuánto trabajó dentro; «Aprobar» o «Rechazar» si están por responder. Si se quedó sin autorización, **«Autorizar como horas extra»**.
- **Las marcas**, en orden: la hora, la original tachada si se ajustó, su tipo, cómo se hizo (rostro y distancia, remoto o cargada por RR.HH.), su motivo y quién, y el radar de la distancia. Cada una con **«Ajustar la hora»** y **«Anular la marcación»**.
- **Pie**: «Ver su mes», **«Justificar»** (solo para un día ausente, sin marcar, sin salida o tarde) y **«Agregar marcación»**.
- Cada corrección pide **«¿Por qué?»**, obligatorio, y queda con el nombre de quien la hizo.
- Con el mes cerrado: «El mes está cerrado para nómina: se puede mirar, pero no corregir».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑017 | Ajustar una hora guarda la original y la muestra tachada | Oblig. | Una entrada de 08:52 ajustada a 08:30 muestra las dos |
| RF‑ASI‑018 | Anular deja la marca a la vista, gris, con su motivo | Oblig. | La marca anulada no cuenta pero se ve |
| RF‑ASI‑019 | Toda corrección pide un motivo de al menos 4 caracteres | Oblig. | Sin motivo, «Guardar» no hace nada |
| RF‑ASI‑020 | Con el mes cerrado no hay ninguna acción de corrección | Oblig. | No aparecen Ajustar, Anular, Justificar ni Agregar marcación |
| RF‑ASI‑021 | «Autorizar como horas extra» convierte lo trabajado fuera de horario en una ventana aprobada | Import. | Se quedó 1 h 10 sin autorización: al autorizar, cuenta como 1 h 10 de extra |

### 3.5 Los temas del Libro

Lo que antes era Incidencias, dentro del Libro de asistencia, **como un filtro** y no como páginas aparte. El módulo es solo de asistencia —no paga sueldos ni arma planillas—, así que no es una bandeja de pendientes: es el registro visto por tema, para consultar, filtrar y exportar.

- **Sin submenú**: el Libro es una sola entrada del menú. En la **Semana** y el **Mes**, una lista desplegable junto a los filtros elige el tema: Todas las jornadas, **Faltas**, **Retrasos y descansos**, **Salidas sin marcar**, **Marcaciones rechazadas** o **Fuera de horario**, cada uno con su punto de color y cuántos casos hay en el período.
- **Con un tema elegido**, la grilla deja solo a quienes tuvieron eso en el período y apaga los demás días. En Faltas y en Retrasos aparece además «Sin justificar», «Justificadas» o «Todas».
- **Cuadritos o lista**: dos íconos cambian la grilla por **la lista de cada caso**. Exportar CSV baja la lista del tema.
- Las direcciones viejas (/asistencia/registro/faltas, Incidencias) y los enlaces de Hoy abren el Mes con el tema elegido y la lista.
- **Las columnas de cada tema**: en Faltas, su horario, su lugar y la situación («Sin justificar», «Vacaciones»); en Retrasos y descansos, qué pasó y su motivo («Avisada · sin motivo», «Justificado · Transporte»); en Salidas sin marcar, a qué hora entró y debía salir; en Marcaciones rechazadas, por qué —rostro o distancia— y si después marcó bien; en Fuera de horario, a qué hora debía salir, salió y cuánto se quedó.
- **«Ver el día»** abre el detalle, con una línea que dice qué se vino a mirar; ahí se justifica, se completa la salida o se autoriza como extra.
- Hoy entra solo en lo que ya se sabe —un retraso, una marca rechazada—: una falta o una salida sin marcar recién se sabe al día siguiente.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑022 | Cada tema muestra el mes elegido, no los últimos 10 días | Oblig. | Una falta de hace 12 días aparece en su mes |
| RF‑ASI‑081 | Elegir un tema en el Mes deja solo a quienes lo tuvieron y apaga los demás días | Oblig. | Con «Faltas», quien no faltó en el mes no aparece |
| RF‑ASI‑023 | Retrasos y descansos muestra las alertas del mes y separa lo justificado | Oblig. | Con «Sin justificar», una tardanza justificada no aparece |
| RF‑ASI‑024 | Quedarse 30 min o más sin autorización aparece en Fuera de horario | Oblig. | 25 min no aparece; 35, sí |
| RF‑ASI‑025 | **Retirado:** ya no hay contador ni «pendientes»; las acciones están en el detalle del día | — | — |

### 3.6 Solicitudes

Todo lo que la gente le pide a RR.HH. sobre su tiempo, en un solo lugar, con una vista por tipo: **Vacaciones**, **Permisos y licencias**, **Horas extra**, **Justificaciones**, **Correcciones de marcación**, **Trabajo remoto** y **Cambios de turno**.

- **Estado** en una lista desplegable junto al buscador, con un punto de color y el número de cada uno: Pendientes (la que se abre por defecto), Aprobadas, Rechazadas, Canceladas y Todos los estados. Una solicitud sin respuesta dice **Pendiente**. En Vacaciones, arriba a la derecha, **Solicitudes · Saldos** cambia de vista.
- **Tabla**: Colaborador, qué pide (Fechas y motivo, Permiso o licencia, Qué justifica…), **A tener en cuenta** —hasta dos datos que hacen falta para responder—, **Fecha de solicitud** (la fecha y debajo «hace 2 días») y su estado. «Revisar» o «Ver».
- **«Para decidir»** según el tipo: el saldo de vacaciones que le queda («Pide 5 y le quedan 3»); si su lugar sigue cubierto esos días («Su lugar quedaría con 6 de 9»); si la licencia trae respaldo; cuántas justificaciones lleva en el mes.
- **Revisar** abre la solicitud con sus datos, lo que hace falta para decidir, «Ver su día» cuando es una corrección o una justificación, y **«Si apruebas:»** con lo que va a pasar. «Dejar pendiente» cierra sin responder y la solicitud sigue pendiente.
- **La papeleta a la vista**: en vacaciones y en permisos y licencias, a la izquierda de «Revisar» está la misma papeleta que la persona vio y solicitó desde su app, con su número. El recuadro de RR.HH. dice «Pendiente» y, al responder, «Aprobada» o «Rechazada» con quién y cuándo; la persona ve ese mismo sello en su papeleta, en Mis solicitudes.
- **Aprobar se confirma escribiendo la palabra**: un segundo paso repite qué va a pasar —en rojo si es una excepción sin saldo— y pide escribir **APROBAR** (o **ACEPTAR** en una justificación) para activar «Sí, aprobar». Aprobar admite una nota; **rechazar pide un motivo** y también se confirma en un segundo paso.
- **Aprobar aplica el efecto**: el día de vacaciones o de licencia deja de ser falta, la corrección carga la marcación, el trabajo remoto quita la geocerca esos días, la justificación deja de contar la alerta en contra.
- Buscador y filtros de lugar y unidad; 10 por página.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑026 | Cada solicitud muestra lo que hace falta para decidir | Oblig. | Una vacación dice cuántos días le quedan |
| RF‑ASI‑027 | Rechazar pide un motivo de al menos 6 caracteres, que la persona lee | Oblig. | Sin motivo, «Confirmar» no se activa |
| RF‑ASI‑028 | Aprobar aplica el efecto en el día | Oblig. | Una corrección aprobada aparece como marca cargada por RR.HH. |
| RF‑ASI‑029 | Aprobar sin saldo pide «Aprobar igual» y queda como excepción | Import. | Pide 5 y tiene 3: el botón dice «Aprobar igual» |
| RF‑ASI‑078 | Aprobar pide escribir «APROBAR» en un segundo paso | Oblig. | Hasta escribir la palabra, «Sí, aprobar» no se activa |
| RF‑ASI‑079 | Vacaciones y permisos muestran la papeleta que solicitó la persona | Oblig. | El número de la papeleta en «Revisar» es el mismo que ve la persona en su app |
| RF‑ASI‑080 | La papeleta lleva el sello de la respuesta de RR.HH. | Import. | Aprobada, dice «Aprobó Juan Pérez Gómez · 3 nov» en los dos lados |
| RF‑ASI‑030 | La cobertura avisa si el lugar quedaría bajo el 80 % | Import. | «Su lugar quedaría con 6 de 9» en ámbar |
| RF‑ASI‑031 | El menú cuenta las solicitudes por responder, con las de horas extra | Oblig. | Una nueva desde la app suma uno |

### 3.7 Saldos de vacaciones

- Una fila por persona: su ingreso, su derecho del año, lo usado en los últimos 12 meses, su saldo y una barra.
- El derecho sigue la escala de la ley: sin días antes del primer año, 15 de 1 a 5 años, 20 de 5 a 10 y 30 desde los 10.
- Más de 20 días acumulados: «Mucho acumulado: conviene programarlas».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑032 | El saldo es el derecho menos lo aprobado en los últimos 12 meses | Oblig. | 15 de derecho y 4 aprobados: saldo 11 |
| RF‑ASI‑033 | Los días se cuentan en días hábiles de su horario, sin feriados | Oblig. | Una semana con un feriado cuenta 4 días |

### 3.8 Horas extra

Solo cuentan las autorizadas; quedarse más tiempo no las genera.

- **Qué listar** en una lista desplegable junto al buscador: Pendientes (por defecto), Programadas y Todas, con su número. Arriba a la derecha, **Solicitudes · Resumen del mes** cambia de vista.
- **Asignar horas extra**: fecha, desde, hasta, motivo que la persona verá, proyecto o centro de costo opcional y a quién, con buscador. «Conversa antes con cada persona»: la verá en su app y tendrá que aceptarla.
- **Revisar**: el día y la franja, el motivo, el proyecto, cuántas lleva autorizadas en el mes y a qué hora termina su horario. Se puede cancelar una autorizada de hoy en adelante.
- **Resumen del mes**: por persona, los días, las horas autorizadas, las trabajadas dentro y el uso; CSV con los totales en horas.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑034 | Asignar crea una hora extra por persona que espera su aceptación | Oblig. | Asignar a 3 deja 3 «Esperando que acepte» |
| RF‑ASI‑035 | Solo cuenta como extra lo trabajado dentro de la ventana autorizada | Oblig. | Ventana 18:00–20:00, salió 20:40: cuentan 2 h |
| RF‑ASI‑036 | La hora extra guarda el proyecto o centro de costo | Import. | El resumen y el detalle lo muestran |
| RF‑ASI‑037 | Cancelar una autorizada la deja sin efecto y la persona lo ve | Import. | Cancelada, lo que trabaje ese día no cuenta como extra |

### 3.9 Exportar para planillas

El módulo es solo de asistencia: no paga sueldos ni cierra meses. Lo que pidió RR.HH. en el #27 —datos listos para planillas— se cumple con un archivo de formato fijo que la empresa lleva a su sistema de sueldos.

- En el Libro, en el **Mes** o el **Calendario**, **Exportar CSV** pregunta qué bajar: **Las jornadas** (una fila por persona y día, al segundo) o el **Resumen para planillas** (una fila por persona con el mes).
- El resumen trae: período, código, colaborador, unidad, sucursal y centro; días programados y trabajados; faltas injustificadas y ausencias justificadas; trabajado y programado; retrasos y tardanza total e injustificada; descanso excedido y salida anticipada injustificados; días sin marcar descanso; horas extra autorizadas y trabajadas dentro de lo autorizado; y fuera de horario. Los tiempos van **en segundos**.
- Bajan las personas que dejan pasar los filtros, y solo los días que ya pasaron.
- **Ya no hay cierre de mes**: ningún mes se bloquea y siempre se puede corregir, con su motivo y su rastro.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑038 | **Retirado:** ya no se cierra el mes; las correcciones quedan siempre con su motivo y su autor | — | — |
| RF‑ASI‑039 | **Retirado:** sin cierre no hay aviso de pendientes al cerrar | — | — |
| RF‑ASI‑040 | En el resumen para planillas solo cuenta en contra lo injustificado | Oblig. | Una tardanza justificada no suma a «Tardanza injustificada» |
| RF‑ASI‑041 | El resumen para planillas tiene un formato fijo, en segundos | Oblig. | Las columnas son siempre las mismas y en el mismo orden |

### 3.10 Configuración › Horarios

Cuándo trabaja cada quien.

- **Tabla o tarjetas**: dos íconos junto a «Nuevo horario»; se abre en la tabla y las tarjetas, la forma gráfica, van después. La **tarjeta** muestra su color y nombre, «08:30 a 18:00 · descanso de 13:00 a 14:00», los días, una barra de 24 h con la franja, las horas programadas al día y cuántos colaboradores lo tienen. La **tabla** pone los horarios lado a lado: Horario, Entrada y salida, Descanso, Días, Al día, A la semana y Colaboradores.
- Menú: Editar, Duplicar, Eliminar (no si está asignado). **Duplicar y Eliminar piden confirmación**: Duplicar pide el nombre de la copia («Sí, duplicar»). **Eliminar** abre una ventana centrada, como «Eliminar mi cuenta» del celular (Ronda 22 · K2): un ícono grande, «¿Eliminar «Oficina (copia)»?», qué pasa, y **hay que escribir el nombre del horario** para que se encienda el botón rojo. La misma ventana sirve para eliminar una política; «Usar por defecto» también se confirma.
- **Las horas se eligen con el reloj de Souly**: un campo que se puede escribir (08:30) y que abre una tarjeta con dos columnas —horas y minutos de 5 en 5— y la elegida en navy; en vez del reloj gris del navegador.
- **Nuevo horario** (Ronda 19 · X1): una ventana ancha. Arriba, nombre, tipo (**Fijo** o **Flexible**) y color. A la izquierda, **un renglón por día, de lunes a domingo**: un interruptor para si trabaja ese día, su entrada y su salida, **sus descansos** —hasta dos, solo con su hora («☕ 13:00–14:00»)— como etiquetas; al tocar una se abre **una tarjetita flotante** (Ronda 20 · E2) con desde → hasta en grande, duraciones rápidas (15 min, 30 min, 45 min, 1 h) que calculan el «hasta», la barra del día con dónde cae y «Quitar descanso», sus horas y un menú ⋯ para copiar ese día a todos, de lunes a viernes o a un día libre. A la derecha, **«Así queda su semana»**: un calendario de lunes a domingo con un bloque por día en el color del horario y los descansos rayados. Abajo, la tolerancia de la política y las horas por grupo de días y de la semana. **Un horario nuevo arranca de lunes a sábado** (sábado de 08:30 a 12:30, sin descanso); cada empresa lo cambia. Cada día avisa si la salida es antes que la entrada o si un descanso cae fuera de la jornada o se pisa con el otro.
- **Cada descanso se mide por separado**: la primera pausa que marca contra el primer descanso, la segunda contra el segundo; si se excede en el primero, el exceso aparece en el primero. Si no marca uno que su jornada incluye, cuenta como descanso sin marcar. Las horas del día descuentan los dos.
- **Un día distinto cuenta como jornada completa con sus propias horas**: quien trabaja el sábado de 08:00 a 12:00 cumplió su día y no queda debiendo; la tardanza y la salida anticipada se miden contra el horario de ese día. Por dentro se guarda el horario más repetido como base y los demás días como excepciones. La tabla y la tarjeta muestran los días distintos debajo («Sá 09:00 a 13:00»).
- **Tolerancias** (lo que antes era la política): de entrada, del descanso y de salida, con − y +, cada una con su efecto («Atraso desde las 08:40», «Salida anticipada antes de las 17:55»). La tabla muestra la tolerancia debajo de la entrada y salida. **Ya no se elige** qué pasa si no marca el descanso ni el redondeo: si no lo marca, siempre se resta de las horas trabajadas y queda el aviso «No marcó su descanso»; la tardanza siempre se cuenta al segundo (#8).
- Abajo: las horas programadas al día y a la semana.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑042 | El descanso de un horario fijo es una franja dentro de la jornada | Oblig. | Un descanso de 12:00 a 12:00 no se guarda |
| RF‑ASI‑043 | Un horario no cruza la medianoche | Oblig. | Entrada 22:00 y salida 06:00 avisan y no se guardan |
| RF‑ASI‑044 | El formulario muestra la tolerancia de la política y desde qué hora es atraso | Import. | Entrada 08:30 con 10 min: «cuenta como atraso después de las 08:40» |
| RF‑ASI‑045 | Un horario asignado no se elimina | Oblig. | «Está asignado a personas: reasígnelas primero» |
| RF‑ASI‑082 | Un horario puede tener otro horario algunos días | Oblig. | Lunes a viernes 08:00–18:00 y sábado 08:00–12:00: el sábado se programan 4 h |
| RF‑ASI‑083 | El día con otro horario cuenta como jornada completa con sus horas | Oblig. | Trabajar el sábado de 08:00 a 12:00 da «4:00 de 4:00» y «Terminó su jornada» |
| RF‑ASI‑084 | Cada día del horario puede tener hasta dos descansos, cada uno medido por separado | Oblig. | Con descansos de 13:00 a 14:00 y de 16:00 a 16:15, el lunes de 08:30 a 18:00 programa 8:15 |

### 3.11 Configuración › Modalidades

**Antes era «Políticas de marcación»** (una lista de políticas para asignar a cada persona). Desde el 3 de noviembre es una sola página, más sencilla: **qué se le pide al colaborador al marcar, según cómo trabaja**. Las tolerancias pasaron a **cada horario**. El descanso sin marcar siempre se resta de las horas trabajadas, con aviso, y la tardanza se cuenta al segundo: ya no son opciones.

- **Una tarjeta por modalidad**, con cuántos colaboradores la tienen:
  - **Presencial**: «Pedir el rostro» y «Estar en su lugar» (dentro de la geocerca; si no, la marcación se rechaza).
  - **Híbrido**: «Pedir el rostro» y «Estar en su lugar los días de oficina»; los otros días marca desde donde esté.
  - **Remoto**: «Pedir el rostro»; marca desde donde esté, la ubicación se guarda pero no bloquea.
- **Parecido mínimo del rostro**, para todos los que marcan con rostro: de 60 % a 95 % (78 % por defecto).
- El horario flexible nunca pide estar en el lugar.
- Las direcciones viejas (`?ver=politicas`) abren Modalidades. En Asignaciones y en la ficha del colaborador ya no se elige una política.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑046 | **Retirado:** ya no hay políticas ni una «por defecto» | — | — |
| RF‑ASI‑047 | El parecido del rostro nunca baja del 60 % | Oblig. | El deslizador no permite menos |
| RF‑ASI‑048 | **Retirado:** ya no hay políticas que eliminar | — | — |
| RF‑ASI‑085 | Lo que se pide al marcar depende de la modalidad del colaborador | Oblig. | Con «Estar en su lugar» apagado para Presencial, una marca fuera de la geocerca no se rechaza |
| RF‑ASI‑086 | Cada horario tiene sus tolerancias de entrada, descanso y salida | Oblig. | Con 15 min en el horario Tienda, quien entra 08:44 a un horario de 08:30 no llega tarde |
| RF‑ASI‑087 | Un colaborador puede marcar en varios lugares | Import. | Con Sopocachi y El Prado, una marca dentro de la geocerca de El Prado se acepta y el día dice «Sucursal El Prado» |

### 3.12 Configuración › Avisos al colaborador

Qué le avisa la app a cada persona cuando su día sale con una alerta, y cuánto tiempo tiene para mandar su motivo.

- **Qué se le avisa**, con un ejemplo de cada uno: llegó tarde («Hoy llegaste 45 min tarde. ¿Quieres contarnos qué pasó?»), descanso excedido o fuera de su franja, salida anticipada, no marcó su descanso (apagado por defecto) y faltó sin aviso.
- **Desde cuánto se avisa**: «Avisar desde N min», de 0 a 30; por defecto 5. Lo que queda debajo igual se calcula.
- **Plazo para justificar**: de 1 a 10 días hábiles; por defecto 2.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑049 | Cada aviso se enciende o se apaga | Oblig. | Con «No marcó su descanso» apagado, la incidencia dice «Sin aviso a la persona» |
| RF‑ASI‑050 | «Avisar desde» filtra lo que se le avisa a la persona | Oblig. | Con 5 min, una tardanza de 4 min no se avisa |

> **En la maqueta:** el aviso con «Agregar motivo» se configura pero todavía no aparece en el celular, y el plazo para justificar no vence solo —ABIERTA‑ASI‑06—.

### 3.13 Configuración › Lugares y geocercas

- Las sucursales y sus centros de trabajo de Organización, en árbol, cada uno con su radio o «Sin ubicación» y cuántos marcan ahí. «Geocerca» o «Ubicar».
- **Geocerca**: un mapa donde se toca o se arrastra el punto y el **radio permitido** de 30 a 1000 m (150 por defecto). «Entre 100 y 200 m suele andar bien en ciudad».
- «Los lugares salen de Organización › Estructura física»; «Ir a Organización» para crear uno.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑051 | La geocerca es un punto y un radio sobre un lugar de Organización | Oblig. | Guardar la geocerca de una sucursal la deja «Radio de 150 m» |
| RF‑ASI‑052 | Asistencia no crea lugares | Oblig. | No hay botón para crear una sucursal aquí |

### 3.14 Configuración › Asignaciones

- Una fila por colaborador con su horario, lugar, modalidad y **su rostro** (Registrado · Sin registrar · Sin consentimiento · Pidió registrarlo otra vez); una lista desplegable **Todos · Sin horario · Sin rostro**, con su número.
- Menú ⋯ de cada fila: «Asignar horario y lugar», «Pedir que registre su rostro de nuevo» o «Aprobar el nuevo registro», que borran el rostro guardado y **piden confirmación** (Ronda 24 · B1): la misma ventana centrada que eliminar, con su cara y su rostro tachado, qué pasa en tres pasos —se borra, le llega un aviso, lo registra al marcar— y escribir **BORRAR**.
- Buscador, filtros de lugar y unidad y «Todos · Sin horario · Sin rostro» en una sola fila. Para asignar una unidad o una sucursal entera de una vez, se filtra y se marca la casilla de la cabecera de la tabla.
- **Asignar horario y lugar** (Ronda 25 bis, pensado para 50 horarios, 30 lugares y muchos colaboradores a la vez): arriba, a quiénes (sus caras y cuántos). **1 · Horario** en una lista desplegable con buscador y filtros (Fijos, Flexibles, Con sábado, Con domingo), los más usados primero, cada uno con su color, sus horas, su semana en barritas y cuántos lo tienen; debajo, la semana del elegido en grande con su descanso, horas a la semana y tolerancia. **2 · Dónde marca y cómo**: el lugar con buscador, **«También puede marcar en»** para quien rota entre sucursales (supervisores, técnicos, reemplazos: puede marcar en cualquiera y cuenta el más cercano; el detalle del día dice en cuál marcó y la tabla muestra «+1»), y la modalidad en tres tarjetas (y los días de oficina si es híbrido). **3 · Desde**: hoy, el lunes u otra fecha. A la derecha, **«Así quedan»**: cuántos cambian, cuántos ya lo tenían y cuántos son nuevos, agrupado por el horario de antes, «Ver los N, uno por uno» y una frase con lo que queda; a los que cambian se les cierra su asignación y se abre esta, en un solo paso.
- La misma asignación se hace en el **alta** del colaborador (paso «Asistencia»), con «¿Controla su asistencia?», la misma lista de horarios con buscador y su semana, «También puede marcar en» y la modalidad en tarjetas. Ese paso quedó con dos bloques: **Asignación de asistencia** y **Vacaciones y permisos** (si puede pedir vacaciones antes del año, si requieren aprobación y quién aprueba los permisos). Se retiraron Jornada laboral, Horario asignado, Método de marcación, Compensación de horas e Historial disciplinario: repetían la asignación o eran de planillas.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑053 | Se asigna a muchas personas a la vez con los filtros | Oblig. | Filtrar Ventas y marcar la casilla de la cabecera selecciona a los 12 |
| RF‑ASI‑054 | **Retirado:** ya no hay políticas | — | — |
| RF‑ASI‑055 | El alta asigna desde la fecha de ingreso | Import. | Ingresa el 10: aparece en Hoy desde el 10 |

### 3.15 Configuración › Biometría y privacidad (unida a Asignaciones y Modalidades)

**Ya no es una sección aparte** (3 nov 2026): la tabla de quién aceptó el consentimiento y registró su rostro es la columna **«Rostro»** de Asignaciones, y la privacidad está en **Modalidades**.

- **Registrar el rostro** es hacerlo una vez desde la app, después de aceptar el consentimiento; al marcar, la app compara la selfie con ese rostro.
- En Modalidades: cuántos registraron su rostro y cuántos no aceptaron el consentimiento, con «Ver en Asignaciones»; y **Privacidad del rostro**: el sistema no guarda la foto sino una huella en números, la selfie de cada marca es solo evidencia y **se borra a los N días** (30 a 365; 90 por defecto). Consentimiento vigente: versión 2026‑08‑v1.
- La dirección vieja (`?ver=biometria`) abre Asignaciones.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑056 | Nadie marca con rostro sin aceptar el consentimiento | Oblig. | La primera vez la app muestra «Antes de usar su rostro» |
| RF‑ASI‑057 | Las selfies se borran solas a los días configurados | Oblig. | Con 90 días, una selfie de hace 100 ya no está |
| RF‑ASI‑058 | Pedir que registre su rostro de nuevo borra el rostro guardado, después de confirmar | Import. | La próxima marca vuelve a pedir el registro |

### Para El líder de área

Lo que el líder necesita de la asistencia de su gente.

### 3.16 Lo que ve el líder

- Hoy, el líder entra con la vista de RR.HH. filtrada por su unidad.
- Las justificaciones las acepta «su jefe o RR.HH.»; quién exactamente, y si el líder ve solo a su unidad, está por decidir —ABIERTA‑ASI‑01—.

### Para El colaborador

Lo que la persona hace y ve desde su celular y desde Mi espacio en la web.

### 3.17 Marcar desde el celular

- **Inicio** muestra la franja del día: su turno, cómo va («Entraste 08:27 · 3 h 10») y el botón menta con la **próxima marca**: Marcar entrada, Iniciar pausa, Volver de la pausa o Marcar salida. Al terminar, «Listo por hoy».
- Un toque **no marca**: abre una ventana que dice qué va a marcar y a qué hora, y cómo le queda («Llega 12 min tarde», «Le faltan 2 h de jornada»). Recién **«Escanear rostro»** empieza.
- **Ubicación**: busca dónde está y dice «Está en su lugar · a 24 m»; fuera de la geocerca, «Está fuera de su lugar», con «Volver a intentar». En remoto: «Hoy es día remoto: vale cualquier lugar».
- **Rostro**: «Mire la cámara»; la primera vez, «Registrando su rostro». Antes de la primera vez, el **consentimiento**.
- **Listo**: «Entrada registrada» con la hora y cómo llegó; una despedida distinta en cada marca.
- **Deshacer la salida** durante 10 minutos: la marca se anula y queda a la vista de RR.HH.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑059 | La hora de la marca la pone el servidor | Oblig. | Cambiar la hora del celular no cambia la marca |
| RF‑ASI‑060 | Marcar pide confirmar antes de escanear | Oblig. | Un roce en el bolsillo solo abre la ventana |
| RF‑ASI‑061 | Fuera de la geocerca no se marca | Oblig. | A 640 m con un radio de 150 m: «Está fuera de su lugar» |
| RF‑ASI‑062 | La salida se puede deshacer 10 minutos | Import. | A los 11 minutos ya no aparece «Deshacer» |

> **En la maqueta:** la ubicación y el rostro se simulan; el rostro siempre coincide en el celular. Marcar sin conexión todavía no existe —ABIERTA‑ASI‑08—.

### 3.18 Su día, su semana y su mes

- **Esta semana**: siete días con un punto de color, el de hoy en navy; un toque muestra a qué hora marcó cada cosa, cómo la marcó y cuánto trabajó. Resumen: trabajadas, días a tiempo y horas extra.
- **Mi mes**: el calendario con el color de cada día y el resumen: trabajadas, días a tiempo y llegadas tarde.
- **El día elegido**: las marcas con su diferencia («a la hora», «12 min tarde», «fuera de horario»), la pausa y cuánto se pasó, y «¿Algo está mal? Corregir una marca».

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑063 | La persona ve su semana y su mes con el mismo estado que RR.HH. | Oblig. | Un día «Llegó tarde» en el Libro es ámbar en su app |
| RF‑ASI‑064 | Cada día muestra cómo se hizo cada marca | Import. | «Rostro ✓ · a 14 m» o «cargada por RR.HH.» |

### 3.19 Pedir horas extra y corregir una marca

- **Pedir horas extra**: se piden antes del día; día, desde (su salida), hasta (1 h o 2 h), razón. «Serían 2 h de horas extra». Debajo, sus horas extra con su estado.
- **Horas extra asignadas**: «RR.HH. le asignó horas extra» con «No puedo» o «Acepto».
- **Corregir una marcación**: día, qué marca, a qué hora figura hoy, la hora correcta y la razón. RR.HH. la revisa y, si la aprueba, se corrige sola.
- Las dos se piden desde Mis solicitudes › «¿Qué necesita?» o desde el «+» de Mi asistencia.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑065 | Las horas extra se piden para hoy o un día futuro | Oblig. | No se puede elegir ayer |
| RF‑ASI‑066 | Aceptar una asignación la vuelve autorizada | Oblig. | «Acepto» la deja «Aceptada» y cuenta desde ahí |
| RF‑ASI‑067 | Una corrección se pide con hora y razón, y llega a RR.HH. | Oblig. | Aparece en Solicitudes › Correcciones de marcación |

### 3.20 Los avisos de marcación

- Bajan desde arriba del teléfono, una vez por día cada uno: 10 min antes de la entrada si no marcó, pasada la tolerancia si sigue sin marcar («Aún no marca su entrada»), 5 min antes de que termine la pausa y si ya se pasó, y a la hora de salida si sigue sin marcarla.
- Un toque lleva a Inicio.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑068 | Cada aviso de marcación sale una sola vez por día | Import. | «Aún no marca su entrada» no se repite ese día |

### 3.21 Mi asistencia en la web

- Lo mismo que en el celular en una página: el marcador, tres cifras —trabajado en el mes, puntualidad y racha—, el calendario del mes y el detalle del día.
- Un día sin salida o ausente dice: «¿Falta algo? Escríbele a RR.HH. desde Mis solicitudes».
- Quien no es de RR.HH. y entra a Asistencia vuelve a Mi asistencia: la asistencia de todos es de RR.HH.

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑069 | La persona ve exactamente los números de RR.HH., no una versión aparte | Oblig. | Su trabajado del mes coincide con la asistencia de la persona |

### Para Todo el módulo

Lo que vale en todas las pantallas.

### 3.22 Requisitos no funcionales

| Código | Requisito | Prioridad | Criterio |
| --- | --- | --- | --- |
| RF‑ASI‑070 | Las marcas se guardan al segundo con la hora del servidor y se truncan al mostrar | Oblig. | 08:30:59 se ve 08:30 en una lista y 08:30:59 en el detalle, nunca 08:31 |
| RF‑ASI‑071 | El servidor nunca compara imágenes: recibe un vector del rostro | Oblig. | Lo que viaja para comparar es un vector de 512 números |
| RF‑ASI‑072 | Toda corrección queda con su motivo, quién y cuándo | Oblig. | Un ajuste muestra «— Paola Arce» y su motivo |
| RF‑ASI‑073 | El estado nunca va solo por color | Oblig. | Cada estado tiene palabra y color |
| RF‑ASI‑074 | Los CSV protegen las celdas que empiezan con «=», «+», «-» o «@» | Oblig. | Un motivo «=SUMA()» llega como texto |

### 3.23 Cómo se escriben los textos

- La pantalla de RR.HH. y la del colaborador hablan de **usted**; los avisos al colaborador, de **tú**, como un mensaje: «Hoy llegaste 45 min tarde».
- Se dice **sucursal**, **centro de trabajo** y **unidad organizacional**, nunca «sede» ni «área».
- Se dice **colaborador** en las tablas, **marcación** y no «fichada», **descanso** para la franja y **pausa** para lo que se marca.
- Las horas como «08:30», las duraciones como «1 h 8 min»; los saldos con signo, «−30 min».

### 3.24 Fuera de alcance de esta versión

- Bolsa de horas y compensación con tiempo libre (#11).
- Horarios distintos por día de la semana o con fecha de vigencia (#3).
- Turnos que cruzan la medianoche (riesgo K1).
- Marcar sin conexión y vincular el celular a la persona.
- Domicilio autorizado para quien trabaja en remoto (#19).
- Cobertura mínima por cargo y lugar (#21) y vacaciones visibles al equipo (#22).
- Reportes por área, por día de la semana y por motivo (#24).
- El envío real de avisos y notificaciones.

## 04 · Reglas de negocio

*Las condiciones que el sistema cumple siempre. Primero las de Recursos Humanos, en el orden en que vive un día: se marca, se calcula, se corrige, se justifica, se autoriza, se pide, se revisa y se cierra, y antes de todo se configura; después las del colaborador. Todas se leen igual, en cuatro apartados, y cada una dice de dónde viene: el requerimiento de RR.HH. (#), la arquitectura del backend o nueva.*

### Para Recursos Humanos

Las condiciones del módulo por tema: la marcación, el cálculo del día, corregir sin borrar, las justificaciones, las horas extra, las solicitudes, las incidencias y el cierre, y la configuración.

### La marcación

*Cómo se registra un momento y qué hace que valga*

#### 4.1 · BR-ASI-001 · La hora de la marca la pone el servidor

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-001
- **Grupo:** La marcación
- **Qué gobierna:** Marcación
- **Antes:** Arquitectura · §1
- **Estado:** Borrador

*Descripción general*

La app manda el tipo de marca, la ubicación y el rostro; **la hora la pone el servidor**, al segundo. El reloj del celular no cuenta. Así nadie adelanta ni atrasa una marca cambiando la hora del teléfono.

**2. Escenarios ágiles de ejecución**

*El celular tiene otra hora*

- **Dado que** el celular de alguien está 20 minutos atrasado
- **Cuando** marca su entrada a las 08:41 reales
- **Entonces** la marca queda a las 08:41, la hora del servidor

**3. Condiciones y excepciones**

- La marcación manual de RR.HH. también usa la hora que se escribe, con motivo —BR‑ASI‑025—.
- La zona horaria es la de Bolivia (UTC−4) para todas las empresas —ABIERTA‑ASI‑09—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑059, RF‑ASI‑070
- **Historia de usuario:** HU‑ASI‑18
- **Pantalla:** W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

#### 4.2 · BR-ASI-002 · El dispositivo captura, el servidor decide

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-002
- **Grupo:** La marcación
- **Qué gobierna:** Marcación
- **Antes:** Arquitectura · §1
- **Estado:** Borrador

*Descripción general*

El celular toma la ubicación y convierte el rostro en un **vector de 512 números**; el servidor calcula la distancia a la geocerca y la **similitud** del rostro, y decide si la marca vale. El servidor **nunca compara imágenes**: la selfie reducida viaja solo como evidencia.

**2. Escenarios ágiles de ejecución**

*La distancia se calcula en el servidor*

- **Dado que** alguien manda una ubicación
- **Cuando** el servidor la recibe
- **Entonces** la distancia y si está dentro las calcula el servidor contra el radio de su lugar

**3. Condiciones y excepciones**

- Los campos que deciden —distancia, dentro, similitud— no se aceptan desde el celular.
- Un mismo vector repetido se rechaza como reutilizado (riesgo B2 de la arquitectura).

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑071
- **Historia de usuario:** HU‑ASI‑18, HU‑ASI‑16
- **Pantalla:** W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

#### 4.3 · BR-ASI-003 · Fuera de su lugar no se marca

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-003
- **Grupo:** La marcación
- **Qué gobierna:** Marcación
- **Antes:** Arquitectura · §6
- **Estado:** Borrador

*Descripción general*

Con una política que exige estar en el lugar, una marca a más distancia que el **radio** se rechaza: «Está fuera de su lugar», con «Volver a intentar». La geocerca se exige solo si la persona es presencial ese día, su horario es fijo y su política la pide.

**2. Escenarios ágiles de ejecución**

*A 640 m de la sucursal*

- **Dado que** el radio de su sucursal es 150 m
- **Cuando** marca a 640 m
- **Entonces** la app dice «Está fuera de su lugar · A 640 m de Casa Matriz · se puede hasta 150 m» y no deja ninguna marca

**3. Condiciones y excepciones**

- Con la geocerca apagada en la política, la ubicación se guarda pero no bloquea.
- Un horario flexible nunca pide geocerca.
- Una marca rechazada queda registrada y aparece en Libro › Marcaciones rechazadas.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑061
- **Historia de usuario:** HU‑ASI‑18
- **Pantalla:** W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

#### 4.4 · BR-ASI-004 · El radio es el de la política, si no el del lugar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-004
- **Grupo:** La marcación
- **Qué gobierna:** Lugar
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

El radio permitido es el **radio propio de la política**, si tiene; si no, el de la **geocerca del lugar**; si el lugar no tiene, **150 m**.

**2. Escenarios ágiles de ejecución**

*Cargos de confianza*

- **Dado que** la política «Cargos de confianza» tiene radio 300 m y la sucursal 150 m
- **Cuando** una gerente marca a 220 m
- **Entonces** la marca vale

**3. Condiciones y excepciones**

- El radio del lugar va de 30 a 1000 m; el de la política, de 30 a 2000 m.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑051
- **Historia de usuario:** HU‑ASI‑14
- **Pantalla:** W‑ASI‑16 Políticas de marcación
- **Diseño:** Prototipado

#### 4.5 · BR-ASI-005 · El rostro se compara con un mínimo de la política

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-005
- **Grupo:** La marcación
- **Qué gobierna:** Marcación
- **Antes:** Arquitectura · §6 · riesgo B4
- **Estado:** Borrador

*Descripción general*

Con «Pedir el rostro», la marca vale si la **similitud** llega a la mínima de su política: 78 % en la Estándar. El mínimo **nunca baja del 60 %**: con 0 el rostro dejaría de comprobarse.

**2. Escenarios ágiles de ejecución**

*El rostro no coincide*

- **Dado que** la política pide 78 %
- **Cuando** el rostro coincide 64 %
- **Entonces** la marca se rechaza «por rostro» y aparece en Libro › Marcaciones rechazadas con la selfie

**3. Condiciones y excepciones**

- Más alto es más seguro y con más rechazos.
- Sin rostro en la política, se marca solo con la ubicación.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑047
- **Historia de usuario:** HU‑ASI‑13
- **Pantalla:** W‑ASI‑16 Políticas de marcación
- **Diseño:** Prototipado

#### 4.6 · BR-ASI-006 · Sin consentimiento no se usa el rostro

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-006
- **Grupo:** La marcación
- **Qué gobierna:** Biometría
- **Antes:** Arquitectura · §7 · riesgo P1
- **Estado:** Borrador

*Descripción general*

Antes de la primera marca con rostro, la persona lee **«Antes de usar su rostro»**: su teléfono convierte su cara en un código, se envía una selfie reducida que se borra a los N días, se guarda dónde marcó y puede pedir que se borre su rostro. «Acepto y continúo» guarda la versión del consentimiento.

**2. Escenarios ágiles de ejecución**

*La primera marca*

- **Dado que** alguien no aceptó el consentimiento
- **Cuando** toca «Escanear rostro»
- **Entonces** ve el consentimiento y, si acepta, registra su rostro por primera vez

**3. Condiciones y excepciones**

- «Ahora no» cierra sin marcar.
- Un cambio del texto del consentimiento cambia su versión y se vuelve a pedir.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑056
- **Historia de usuario:** HU‑ASI‑16, HU‑ASI‑18
- **Pantalla:** W‑ASI‑21 Marcar desde el celular; W‑ASI‑20 Biometría y privacidad
- **Diseño:** Prototipado

#### 4.7 · BR-ASI-007 · Marcar pide confirmar antes de escanear

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-007
- **Grupo:** La marcación
- **Qué gobierna:** Marcación
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Un toque en el botón de marcar **no marca**: abre una ventana que dice qué va a marcar, a qué hora y cómo le queda —«Llega 12 min tarde», «Le faltan 2 h de jornada»—. El escaneo empieza recién con **«Escanear rostro»**. Encontrada la ubicación, tampoco avanza solo.

**2. Escenarios ágiles de ejecución**

*Un roce en el bolsillo*

- **Dado que** el celular está desbloqueado en el bolsillo
- **Cuando** se toca el botón sin querer
- **Entonces** solo se abre la ventana; cancelar no deja ninguna marca

**3. Condiciones y excepciones**

- Una salida temprana ofrece «Mejor, iniciar pausa» si el descanso está pendiente.
- Una entrada después de su salida dice «Fuera de su horario» y pide «Marcar igual».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑060
- **Historia de usuario:** HU‑ASI‑18
- **Pantalla:** W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

#### 4.8 · BR-ASI-008 · Las marcas siguen su orden

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-008
- **Grupo:** La marcación
- **Qué gobierna:** Marcación
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

La próxima marca es siempre la que sigue: **entrada**, **inicio de pausa**, **fin de pausa**, **salida**. Con descanso pendiente y más de una hora por delante, el botón principal es «Iniciar pausa» y la salida queda como segunda opción.

**2. Escenarios ágiles de ejecución**

*Después del almuerzo*

- **Dado que** alguien marcó su entrada y su pausa
- **Cuando** abre la app
- **Entonces** el botón dice «Volver de la pausa»

**3. Condiciones y excepciones**

- Marcada la salida, el día se cierra: «Listo por hoy».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑060
- **Historia de usuario:** HU‑ASI‑18
- **Pantalla:** W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

#### 4.9 · BR-ASI-009 · La salida se puede deshacer diez minutos

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-009
- **Grupo:** La marcación
- **Qué gobierna:** Marcación
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Quien marcó la salida por error tiene **10 minutos** para «Deshacer la salida». La marca **no se borra**: se anula con el motivo «La persona deshizo su salida desde la app» y RR.HH. la ve.

**2. Escenarios ágiles de ejecución**

*Salida por error*

- **Dado que** alguien marcó la salida a las 16:02
- **Cuando** toca «Deshacer» a las 16:08
- **Entonces** la salida queda anulada y vuelve a estar en turno

**3. Condiciones y excepciones**

- Pasados los 10 minutos, se pide una corrección a RR.HH.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑062
- **Historia de usuario:** HU‑ASI‑18
- **Pantalla:** W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

#### 4.10 · BR-ASI-010 · En remoto se controla el rostro y el horario

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-010
- **Grupo:** La marcación
- **Qué gobierna:** Asignación
- **Antes:** Arquitectura · §9
- **Estado:** Borrador

*Descripción general*

Una persona **remota**, o **híbrida** en un día que no es de oficina, marca desde donde esté: se exige el rostro y su horario, no la geocerca. Su ubicación queda como registro. Un trabajo remoto aprobado hace lo mismo esos días.

**2. Escenarios ágiles de ejecución**

*Día de casa de un híbrido*

- **Dado que** alguien es híbrido con oficina martes y jueves
- **Cuando** marca un lunes desde su casa
- **Entonces** la app dice «Hoy es día remoto: vale cualquier lugar» y la marca vale

**3. Condiciones y excepciones**

- El domicilio autorizado para remotos no está en esta versión (#19).

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑053
- **Historia de usuario:** HU‑ASI‑15
- **Pantalla:** W‑ASI‑19 Asignaciones; W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

### El cálculo del día

*Cómo se deduce el día de sus marcas*

#### 4.11 · BR-ASI-011 · Todo al segundo; se trunca al mostrar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-011
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** REQ #8
- **Estado:** Borrador

*Descripción general*

Las marcas y los cálculos se guardan **al segundo**: 08:30:01 y 08:30:59 son distintos. Nada se redondea al guardar. Cada pantalla **trunca** al mostrar —08:30:59 se lee 08:30 en una lista y 08:30:59 en el detalle, nunca 08:31— y una duración nunca dice más tiempo del que hubo.

**2. Escenarios ágiles de ejecución**

*El minuto 59*

- **Dado que** alguien marca a las 08:40:59 con entrada 08:30 y 10 min de tolerancia
- **Cuando** se calcula su tardanza
- **Entonces** suma 59 s, y el detalle muestra la entrada 08:40:59

**3. Condiciones y excepciones**

- Los archivos exportados llevan las duraciones en segundos.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑070, RF‑ASI‑013
- **Historia de usuario:** HU‑ASI‑04, HU‑ASI‑11
- **Pantalla:** W‑ASI‑07 Detalle de la jornada; W‑ASI‑03 Libro · Día
- **Diseño:** Prototipado

#### 4.12 · BR-ASI-012 · Una sola tardanza, contra la entrada más la tolerancia

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-012
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** REQ #4
- **Estado:** Borrador

*Descripción general*

La tardanza es lo que pasa de la **hora de entrada más la tolerancia** de su política, al segundo y redondeada según la política. Se calcula **una sola vez**; todas las pantallas —Hoy, el Libro, la persona, el cierre, su app— leen esa.

**2. Escenarios ágiles de ejecución**

*Tolerancia de 10 minutos*

- **Dado que** la entrada es 08:30 y la tolerancia 10 min
- **Cuando** alguien marca 08:52
- **Entonces** su tardanza es 12 min en todas las pantallas

**3. Condiciones y excepciones**

- Con horario flexible no hay tardanza.
- La primera entrada del día es la que cuenta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑009, RF‑ASI‑044
- **Historia de usuario:** HU‑ASI‑04
- **Pantalla:** W‑ASI‑07 Detalle de la jornada; W‑ASI‑05 Libro · Mes
- **Diseño:** Prototipado

#### 4.13 · BR-ASI-013 · El redondeo es hacia abajo, a favor de la persona

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-013
- **Grupo:** El cálculo del día
- **Qué gobierna:** Política
- **Antes:** REQ #8
- **Estado:** Borrador

*Descripción general*

La política elige cómo se cuenta la tardanza y la salida anticipada: **al segundo**, **por minuto completo** o **en bloques de 5 min**, siempre **hacia abajo**. Las marcas se guardan igual al segundo.

**2. Escenarios ágiles de ejecución**

*Bloques de cinco*

- **Dado que** la política redondea en bloques de 5 min
- **Cuando** alguien llega 7 min 30 s tarde
- **Entonces** cuentan 5 min

**3. Condiciones y excepciones**

- El redondeo no cambia la hora de la marca, solo lo que se cuenta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑046
- **Historia de usuario:** HU‑ASI‑13
- **Pantalla:** W‑ASI‑16 Políticas de marcación
- **Diseño:** Prototipado

#### 4.14 · BR-ASI-014 · El descanso es una franja

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-014
- **Grupo:** El cálculo del día
- **Qué gobierna:** Horario
- **Antes:** REQ #2
- **Estado:** Borrador

*Descripción general*

El descanso de un horario fijo es una **franja** —de 13:00 a 14:00—, no una cantidad de minutos. Se marca al salir y al volver, no cuenta como trabajado y tiene que caer dentro de la jornada.

**2. Escenarios ágiles de ejecución**

*Una franja fuera de la jornada*

- **Dado que** un horario de 08:30 a 18:00
- **Cuando** se pone el descanso de 18:30 a 19:00
- **Entonces** no se guarda: «El descanso tiene que empezar después de la entrada, terminar antes de la salida y durar algo»

**3. Condiciones y excepciones**

- Un horario guardado solo con minutos toma la franja desde las 13:00.
- Un horario flexible no tiene franja.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑042
- **Historia de usuario:** HU‑ASI‑12
- **Pantalla:** W‑ASI‑15 Horarios
- **Diseño:** Prototipado

#### 4.15 · BR-ASI-015 · Una alerta por hecho del descanso

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-015
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** REQ #5
- **Estado:** Borrador

*Descripción general*

El descanso se compara con su franja y con la **tolerancia de descanso**. Si duró más que la franja, es **«Excedió su descanso»** por el exceso. Si duró lo justo pero corrido, es **«Salió antes al descanso»** o **«Volvió tarde del descanso»**. Solo el exceso cuesta tiempo.

**2. Escenarios ágiles de ejecución**

*Volvió tarde, sin pasarse*

- **Dado que** su franja es de 13:00 a 14:00 con 2 min de tolerancia
- **Cuando** sale 13:20 y vuelve 14:20
- **Entonces** queda la alerta «Volvió tarde del descanso · 20 min», sin descuento

**3. Condiciones y excepciones**

- Se mira el primer descanso del día.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑023
- **Historia de usuario:** HU‑ASI‑04, HU‑ASI‑07
- **Pantalla:** W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.16 · BR-ASI-016 · Si no marca el descanso, decide la política

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-016
- **Grupo:** El cálculo del día
- **Qué gobierna:** Política
- **Antes:** REQ #6
- **Estado:** Borrador

*Descripción general*

Si alguien trabajó de corrido por encima de su franja sin marcar el descanso, la política dice qué pasa: **Descontar y alertar**, **Solo descontar** o **Solo alertar**.

**2. Escenarios ágiles de ejecución**

*Descontar y alertar*

- **Dado que** la política descuenta y alerta, y la franja es de 1 h
- **Cuando** alguien entra 08:30 y sale 18:00 sin marcar el descanso
- **Entonces** se descuenta 1 h de lo trabajado y queda «No marcó su descanso»

**3. Condiciones y excepciones**

- Si la jornada no cubre la franja, no aplica.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑046
- **Historia de usuario:** HU‑ASI‑13
- **Pantalla:** W‑ASI‑16 Políticas de marcación; W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.17 · BR-ASI-017 · Salida anticipada, pasada su tolerancia

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-017
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** REQ #7
- **Estado:** Borrador

*Descripción general*

Salir antes de la **hora de salida menos la tolerancia de salida** es **salida anticipada**, por la diferencia. Hoy cuenta recién cuando marcó la salida.

**2. Escenarios ágiles de ejecución**

*Cinco minutos de gracia*

- **Dado que** la salida es 18:00 con 5 min de tolerancia
- **Cuando** alguien sale 17:40
- **Entonces** es salida anticipada de 15 min

**3. Condiciones y excepciones**

- Con horario flexible no hay salida anticipada.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑040
- **Historia de usuario:** HU‑ASI‑04
- **Pantalla:** W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.18 · BR-ASI-018 · El estado de hoy y el de un día pasado

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-018
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** REQ #14
- **Estado:** Borrador

*Descripción general*

Hoy el estado sigue al momento: **Por llegar** hasta la entrada más la tolerancia, después **Sin marcar**; **Trabajando**, **En pausa** o **Terminó**. Un día pasado queda en **Ausente**, **Justificada**, **Sin salida**, **Llegó tarde**, **Salida anticipada**, **Horas extra** o **Presente**, en ese orden. Las faltas no se cargan a mano.

**2. Escenarios ágiles de ejecución**

*Una falta sola*

- **Dado que** alguien tenía jornada ayer
- **Cuando** no marcó en todo el día y no tenía permiso
- **Entonces** el día queda «Ausente» sin que nadie lo cargue

**3. Condiciones y excepciones**

- Con un horario flexible, «Sin marcar» empieza a las 11:00.
- Sin asignación el día es «Día libre».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑001
- **Historia de usuario:** HU‑ASI‑01, HU‑ASI‑03
- **Pantalla:** W‑ASI‑01 Hoy; W‑ASI‑03 Libro · Día
- **Diseño:** Prototipado

#### 4.19 · BR-ASI-019 · Los feriados nacionales no son laborales

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-019
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Un feriado nacional no es día laboral: nadie llega tarde ni falta en Todos Santos. Tampoco cuenta como día de vacaciones.

**2. Escenarios ágiles de ejecución**

*Todos Santos*

- **Dado que** el 2 de noviembre es feriado
- **Cuando** nadie marca
- **Entonces** nadie figura como ausente

**3. Condiciones y excepciones**

- Los feriados móviles —Carnaval, Viernes Santo, Corpus Christi— los carga cada empresa —ABIERTA‑ASI‑10—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑033
- **Historia de usuario:** HU‑ASI‑09
- **Pantalla:** W‑ASI‑03 Libro · Día; W‑ASI‑11 Saldos de vacaciones
- **Diseño:** Prototipado

#### 4.20 · BR-ASI-020 · Un horario flexible pide la meta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-020
- **Grupo:** El cálculo del día
- **Qué gobierna:** Horario
- **Antes:** Arquitectura · §8
- **Estado:** Borrador

*Descripción general*

Con un horario **flexible** no hay hora de entrada: no hay tardanza, salida anticipada ni geocerca. Solo cuenta que cumpla su **meta** de horas del día.

**2. Escenarios ágiles de ejecución**

*Llega a las 10*

- **Dado que** alguien tiene un horario flexible de 8 h
- **Cuando** entra 10:05 y sale 18:20
- **Entonces** no tiene tardanza y cumple su meta

**3. Condiciones y excepciones**

- El saldo compara lo trabajado con la meta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑042
- **Historia de usuario:** HU‑ASI‑12
- **Pantalla:** W‑ASI‑15 Horarios
- **Diseño:** Prototipado

#### 4.21 · BR-ASI-021 · El día en curso no suma hasta que termina

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-021
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Lo acumulado —el saldo, las tardanzas y las faltas del Libro, la persona y su app— cuenta solo **días cerrados**: el de hoy suma cuando la persona marca la salida. A media mañana todos «deberían» horas.

**2. Escenarios ágiles de ejecución**

*A media mañana*

- **Dado que** son las 10:00 y alguien entró 08:30
- **Cuando** se mira su saldo del mes
- **Entonces** el día de hoy no resta

**3. Condiciones y excepciones**

- El cierre nunca cuenta el día de hoy.
- Las incidencias tampoco incluyen hoy.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑010, RF‑ASI‑014
- **Historia de usuario:** HU‑ASI‑04
- **Pantalla:** W‑ASI‑05 Libro · Mes; W‑ASI‑06 Asistencia de una persona
- **Diseño:** Prototipado

#### 4.22 · BR-ASI-022 · Lo trabajado descuenta el descanso

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-022
- **Grupo:** El cálculo del día
- **Qué gobierna:** Jornada
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Lo trabajado es de la entrada a la salida menos los descansos marcados —y el que está en curso, hoy—, menos lo descontado por no marcar el descanso.

**2. Escenarios ágiles de ejecución**

*En pausa*

- **Dado que** alguien entró 08:30 y salió al descanso 13:00
- **Cuando** son las 13:30
- **Entonces** lleva 4 h 30 trabajadas, no 5 h

**3. Condiciones y excepciones**

- Sin salida en un día pasado, lo trabajado queda en 0 y el día «Sin salida».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑014
- **Historia de usuario:** HU‑ASI‑19
- **Pantalla:** W‑ASI‑07 Detalle de la jornada; W‑ASI‑22 Mi asistencia
- **Diseño:** Prototipado

### Corregir sin borrar

*Cómo se arregla lo que quedó mal y qué rastro deja*

#### 4.23 · BR-ASI-023 · Ajustar guarda la hora original

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-023
- **Grupo:** Corregir sin borrar
- **Qué gobierna:** Marcación
- **Antes:** Arquitectura · §5
- **Estado:** Borrador

*Descripción general*

Ajustar una marca guarda la **hora nueva** y deja la **original tachada** al lado, con el motivo, quién y cuándo. Es el registro inalterable que pide una inspección del trabajo.

**2. Escenarios ágiles de ejecución**

*Una entrada mal tomada*

- **Dado que** alguien marcó 08:52 porque el lector falló
- **Cuando** RR.HH. la ajusta a 08:30 con motivo
- **Entonces** el día muestra 08:30 y 08:52 tachada, con el motivo y el nombre

**3. Condiciones y excepciones**

- El ajuste recalcula el día.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑017, RF‑ASI‑072
- **Historia de usuario:** HU‑ASI‑05
- **Pantalla:** W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.24 · BR-ASI-024 · Anular deja la marca a la vista

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-024
- **Grupo:** Corregir sin borrar
- **Qué gobierna:** Marcación
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Una marca que no debía estar se **anula**: deja de contar pero sigue a la vista, gris, con su motivo. No hay borrar.

**2. Escenarios ágiles de ejecución**

*Una marca duplicada*

- **Dado que** alguien marcó dos entradas
- **Cuando** RR.HH. anula la segunda
- **Entonces** la segunda queda gris y la primera es la entrada

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑018
- **Historia de usuario:** HU‑ASI‑05
- **Pantalla:** W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.25 · BR-ASI-025 · La marcación manual pide motivo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-025
- **Grupo:** Corregir sin borrar
- **Qué gobierna:** Marcación
- **Antes:** Arquitectura · riesgo R7
- **Estado:** Borrador

*Descripción general*

RR.HH. carga una marca a mano para quien no pudo marcar —se olvidó el teléfono, no tenía señal, el rostro no lo reconoció—. La marca queda como **cargada por RR.HH.**, sin rostro ni ubicación, con su **motivo obligatorio** y su autor.

**2. Escenarios ágiles de ejecución**

*Sin batería*

- **Dado que** alguien llegó sin batería
- **Cuando** RR.HH. agrega su entrada con «el teléfono se quedó sin batería»
- **Entonces** la marca dice «Cargada por» y el motivo

**3. Condiciones y excepciones**

- El motivo tiene al menos 4 caracteres.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑005, RF‑ASI‑019
- **Historia de usuario:** HU‑ASI‑06
- **Pantalla:** W‑ASI‑02 Marcación manual; W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.26 · BR-ASI-026 · Justificar un día lo saca de las faltas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-026
- **Grupo:** Corregir sin borrar
- **Qué gobierna:** Jornada
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

RR.HH. justifica un día **ausente, sin marcar, sin salida o tarde** con un tipo —permiso con goce, licencia médica, vacaciones, comisión de servicio, capacitación, duelo u otro— y un motivo. El día queda **Justificada** si no tenía entrada.

**2. Escenarios ágiles de ejecución**

*Una comisión*

- **Dado que** alguien estuvo en una comisión de servicio y no marcó
- **Cuando** RR.HH. justifica el día
- **Entonces** deja de ser falta y dice el tipo y el motivo

**3. Condiciones y excepciones**

- Una alerta de un día con entrada la justifica la persona, no RR.HH. —BR‑ASI‑028—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑019
- **Historia de usuario:** HU‑ASI‑05
- **Pantalla:** W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.27 · BR-ASI-027 · Con el mes cerrado no se corrige

*Estado: Retirada · ya no hay cierre de mes: el módulo es solo de asistencia*

**1. Información básica**

- **Código:** BR-ASI-027
- **Grupo:** Corregir sin borrar
- **Qué gobierna:** Cierre
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

En un mes **cerrado** nadie ajusta, anula, marca a mano, justifica ni autoriza horas extra. Se puede mirar todo.

**2. Escenarios ágiles de ejecución**

*Octubre cerrado*

- **Dado que** octubre está cerrado
- **Cuando** se abre un día de octubre
- **Entonces** dice «El mes está cerrado para nómina: se puede mirar, pero no corregir» y no ofrece acciones

**3. Condiciones y excepciones**

- Para corregir, se reabre el mes —BR‑ASI‑047—.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑020, RF‑ASI‑038
- **Historia de usuario:** HU‑ASI‑11
- **Pantalla:** W‑ASI‑07 Detalle de la jornada; W‑ASI‑14 Cierre del mes
- **Diseño:** Prototipado

### Las justificaciones

*Cómo una alerta deja de contar en contra*

#### 4.28 · BR-ASI-028 · La persona justifica; su jefe o RR.HH. acepta

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-028
- **Grupo:** Las justificaciones
- **Qué gobierna:** Alerta
- **Antes:** REQ #13
- **Estado:** Borrador

*Descripción general*

La app le avisa a la persona su alerta —«Hoy llegaste 45 min tarde»— con «Agregar motivo». Ella elige una categoría —transporte, bloqueo o marcha, salud, trámite, familia, clima, pedido de su jefe, problema con la app u otro— y lo cuenta en sus palabras. Llega a **Solicitudes › Justificaciones**. RR.HH. no justifica por ella.

**2. Escenarios ágiles de ejecución**

*Un bloqueo*

- **Dado que** alguien llegó 45 min tarde por un bloqueo
- **Cuando** manda «Bloqueo o marcha» y su texto
- **Entonces** aparece en Justificaciones con el historial del mes

**3. Condiciones y excepciones**

- El historial del mes avisa si es la primera o si ya van varias.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑026
- **Historia de usuario:** HU‑ASI‑17, HU‑ASI‑20
- **Pantalla:** W‑ASI‑09 Solicitudes; W‑ASI‑10 Revisar una solicitud
- **Diseño:** Prototipado

#### 4.29 · BR-ASI-029 · Aceptada deja de contar en contra

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-029
- **Grupo:** Las justificaciones
- **Qué gobierna:** Alerta
- **Antes:** REQ #13
- **Estado:** Borrador

*Descripción general*

Aceptada, la alerta queda **justificada**: no cuenta como injustificada en el cierre ni en los reportes de puntualidad. **No aceptada**, sigue contando y la persona ve el motivo en su app.

**2. Escenarios ágiles de ejecución**

*Tercera del mes*

- **Dado que** alguien ya tiene dos justificaciones aceptadas este mes
- **Cuando** RR.HH. no acepta la tercera, «Es la tercera vez este mes»
- **Entonces** la tardanza sigue como injustificada y la persona lee el motivo

**3. Condiciones y excepciones**

- Se puede aceptar después mientras el mes no esté cerrado.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑040
- **Historia de usuario:** HU‑ASI‑17
- **Pantalla:** W‑ASI‑10 Revisar una solicitud
- **Diseño:** Prototipado

#### 4.30 · BR-ASI-030 · Justificar el descanso cubre sus dos caras

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-030
- **Grupo:** Las justificaciones
- **Qué gobierna:** Alerta
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Excederse del descanso y volver tarde son el mismo hecho: justificar uno cubre el otro.

**2. Escenarios ágiles de ejecución**

*Volvió tarde*

- **Dado que** un día tiene «Excedió su descanso» y «Volvió tarde del descanso»
- **Cuando** se acepta la justificación del exceso
- **Entonces** las dos quedan justificadas

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑040
- **Historia de usuario:** HU‑ASI‑17
- **Pantalla:** W‑ASI‑10 Revisar una solicitud
- **Diseño:** Prototipado

#### 4.31 · BR-ASI-031 · Se avisa desde un mínimo y se justifica en un plazo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-031
- **Grupo:** Las justificaciones
- **Qué gobierna:** Alerta
- **Antes:** REQ #15
- **Estado:** Borrador

*Descripción general*

Se avisa solo lo que pasa del **«Avisar desde»** —5 min por defecto— para no avisar por un minuto suelto; lo de abajo igual se calcula. Cada aviso se enciende o se apaga. La persona tiene un **plazo** —2 días hábiles por defecto— para mandar su motivo; si no, se le recuerda una vez y queda injustificado.

**2. Escenarios ágiles de ejecución**

*Cuatro minutos*

- **Dado que** «Avisar desde» es 5 min
- **Cuando** alguien llega 4 min tarde
- **Entonces** no recibe aviso, su tardanza de 4 min igual cuenta

**3. Condiciones y excepciones**

- «No marcó su descanso» viene apagado.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑049, RF‑ASI‑050, RF‑ASI‑023
- **Historia de usuario:** HU‑ASI‑17
- **Pantalla:** W‑ASI‑17 Avisos al colaborador
- **Diseño:** Prototipado

### Las horas extra

*Cuándo quedarse cuenta y cuándo no*

#### 4.32 · BR-ASI-032 · Una hora extra existe solo si se autorizó

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-032
- **Grupo:** Las horas extra
- **Qué gobierna:** Hora extra
- **Antes:** REQ #9
- **Estado:** Borrador

*Descripción general*

Quedarse no es trabajar horas extra. Solo cuenta como **hora extra** lo trabajado **dentro de una ventana autorizada**: aprobada por RR.HH. o asignada y aceptada. Si se pagan o se compensan con tiempo lo decide cada empresa.

**2. Escenarios ágiles de ejecución**

*Más de lo autorizado*

- **Dado que** tiene horas extra de 18:00 a 20:00
- **Cuando** sale 20:40
- **Entonces** cuentan 2 h de extra; los 40 min de más son fuera de horario

**3. Condiciones y excepciones**

- Una ventana por responder o asignada sin aceptar no cuenta.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑035
- **Historia de usuario:** HU‑ASI‑10
- **Pantalla:** W‑ASI‑12 Horas extra; W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.33 · BR-ASI-033 · Dos caminos que terminan en una ventana

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-033
- **Grupo:** Las horas extra
- **Qué gobierna:** Hora extra
- **Antes:** REQ #10
- **Estado:** Borrador

*Descripción general*

La persona **pide** horas extra desde la app —día, desde, hasta y razón— y RR.HH. las **aprueba**; o RR.HH. las **asigna** —después de conversarlo— con motivo y proyecto, y la persona las **acepta**. Las dos guardan fecha, franja, motivo, proyecto o centro de costo y quién aprobó.

**2. Escenarios ágiles de ejecución**

*Asignar a tres*

- **Dado que** hay cierre de inventario
- **Cuando** RR.HH. asigna de 18:00 a 20:00 a tres personas
- **Entonces** cada una la ve en su app con «No puedo» o «Acepto»

**3. Condiciones y excepciones**

- Se piden antes del día; no se pide para ayer.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑034, RF‑ASI‑036, RF‑ASI‑065, RF‑ASI‑066
- **Historia de usuario:** HU‑ASI‑10, HU‑ASI‑20
- **Pantalla:** W‑ASI‑13 Asignar horas extra; W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado

#### 4.34 · BR-ASI-034 · Fuera de horario se informa, no se paga

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-034
- **Grupo:** Las horas extra
- **Qué gobierna:** Hora extra
- **Antes:** REQ #9
- **Estado:** Borrador

*Descripción general*

Lo que alguien trabaja de más **sin autorización** es **fuera de horario**: se informa desde 15 min y aparece en Libro › Fuera de horario desde **30 min**. No es hora extra.

**2. Escenarios ágiles de ejecución**

*Se quedó una hora*

- **Dado que** alguien sale a las 19:05 con salida 18:00 y sin horas extra
- **Cuando** termina el día
- **Entonces** figura 1 h 5 fuera de horario y aparece en Libro › Fuera de horario

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑024
- **Historia de usuario:** HU‑ASI‑07
- **Pantalla:** W‑ASI‑08 Temas del Libro; W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.35 · BR-ASI-035 · Se puede autorizar después del día

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-035
- **Grupo:** Las horas extra
- **Qué gobierna:** Hora extra
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Si correspondía, RR.HH. autoriza lo que alguien se quedó con **«Autorizar como horas extra»**: crea una ventana aprobada de su salida programada a la real, «Autorizada después del día».

**2. Escenarios ágiles de ejecución**

*Una urgencia*

- **Dado que** alguien se quedó 1 h 10 por una urgencia
- **Cuando** RR.HH. lo autoriza desde su día
- **Entonces** cuenta como 1 h 10 de horas extra

**3. Condiciones y excepciones**

- Solo con horario fijo, con salida y el mes abierto.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑021
- **Historia de usuario:** HU‑ASI‑10
- **Pantalla:** W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.36 · BR-ASI-036 · Una autorizada de hoy en adelante se puede cancelar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-036
- **Grupo:** Las horas extra
- **Qué gobierna:** Hora extra
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

RR.HH. cancela unas horas extra autorizadas o asignadas de hoy en adelante. Dejan de estar autorizadas y la persona lo ve en su app.

**2. Escenarios ágiles de ejecución**

*Se suspende el inventario*

- **Dado que** había horas extra para mañana
- **Cuando** RR.HH. las cancela
- **Entonces** lo que trabaje mañana después de su horario no cuenta como extra

**3. Condiciones y excepciones**

- Una del pasado no se cancela.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑037
- **Historia de usuario:** HU‑ASI‑10
- **Pantalla:** W‑ASI‑12 Horas extra
- **Diseño:** Prototipado

### Las solicitudes

*Cómo se responde lo que pide la gente y qué cambia al aprobar*

#### 4.37 · BR-ASI-037 · Rechazar pide un motivo; aprobar admite una nota

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-037
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Aprobar o rechazar no se hace desde la fila: se abre la solicitud. **Rechazar pide un motivo** —al menos 6 caracteres, que la persona lee— y se confirma en un segundo paso. Aprobar admite una nota, sin exigirla. Una respondida no se vuelve a responder.

**2. Escenarios ágiles de ejecución**

*Un rechazo con motivo*

- **Dado que** una vacación pendiente
- **Cuando** RR.HH. toca «Rechazar…»
- **Entonces** pide el motivo y «Confirmar: rechazar»; la persona lo lee en su app

**3. Condiciones y excepciones**

- «Dejar pendiente» cierra sin responder: la solicitud sigue pendiente.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑027
- **Historia de usuario:** HU‑ASI‑08
- **Pantalla:** W‑ASI‑10 Revisar una solicitud
- **Diseño:** Prototipado

#### 4.38 · BR-ASI-038 · Aprobar aplica el efecto

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-038
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Aprobar ya aplica lo pedido: la vacación o la licencia saca esos días de las faltas; la corrección **carga la marca** con su motivo y el nombre de quien aprobó; el trabajo remoto quita la geocerca esos días; la justificación saca la alerta del cierre; el cambio de turno queda registrado. Antes de aprobar, «Si apruebas:» dice qué va a pasar.

**2. Escenarios ágiles de ejecución**

*Una corrección*

- **Dado que** alguien pidió cargar su salida de las 18:04
- **Cuando** RR.HH. la aprueba
- **Entonces** su día tiene la salida de las 18:04 como corrección

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑028
- **Historia de usuario:** HU‑ASI‑08
- **Pantalla:** W‑ASI‑10 Revisar una solicitud
- **Diseño:** Prototipado

#### 4.39 · BR-ASI-039 · Lo justificado no es falta ni se espera

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-039
- **Grupo:** Las solicitudes
- **Qué gobierna:** Jornada
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Una **vacación**, un **permiso de día completo** o una **licencia** aprobados vuelven el día **Justificada**: no cuenta como falta, la persona no marca, sale de los **esperados** de Hoy y **no suma horas programadas**: a quien estuvo de vacaciones no le «faltan» horas en el Libro, en su ficha, en su app ni en el cierre. Así «Sin marcar» son solo las faltas de verdad.

**2. Escenarios ágiles de ejecución**

*De vacaciones*

- **Dado que** alguien está de vacaciones aprobadas
- **Cuando** se abre Hoy
- **Entonces** no está en «Sin marcar» y figura en «Justificadas hoy»

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑001, RF‑ASI‑011
- **Historia de usuario:** HU‑ASI‑01, HU‑ASI‑09
- **Pantalla:** W‑ASI‑01 Hoy; W‑ASI‑05 Libro · Mes
- **Diseño:** Prototipado

#### 4.40 · BR-ASI-040 · Un permiso por horas no justifica el día

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-040
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Un permiso por horas deja ausentarse esas horas, pero no vuelve el día justificado: el resto del día se marca como siempre.

**2. Escenarios ágiles de ejecución**

*Una cita médica*

- **Dado que** alguien tiene permiso de 09:00 a 11:00
- **Cuando** llega a las 11:05
- **Entonces** marca normalmente y el día no queda «Justificada»

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑028
- **Historia de usuario:** HU‑ASI‑08
- **Pantalla:** W‑ASI‑10 Revisar una solicitud
- **Diseño:** Prototipado

#### 4.41 · BR-ASI-041 · Las vacaciones se ganan por antigüedad y se cuentan en días hábiles

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-041
- **Grupo:** Las solicitudes
- **Qué gobierna:** Vacaciones
- **Antes:** Ley General del Trabajo
- **Estado:** Borrador

*Descripción general*

El derecho por año sigue la escala boliviana: **0 días** antes del primer año, **15** de 1 a 5 años, **20** de 5 a 10 y **30** desde los 10. Se cuentan los **días hábiles** de su horario, sin feriados. El saldo es el derecho menos lo aprobado en los últimos 12 meses; lo pendiente se resta aparte.

**2. Escenarios ágiles de ejecución**

*Seis años*

- **Dado que** alguien ingresó hace 6 años y usó 8 días
- **Cuando** se mira su saldo
- **Entonces** tiene 20 de derecho y 12 de saldo

**3. Condiciones y excepciones**

- Sin fecha de ingreso se toman 15 días.
- Más de 20 acumulados: «conviene programarlas».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑032, RF‑ASI‑033
- **Historia de usuario:** HU‑ASI‑09
- **Pantalla:** W‑ASI‑11 Saldos de vacaciones
- **Diseño:** Prototipado

#### 4.42 · BR-ASI-042 · Aprobar sin saldo es una excepción

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-042
- **Grupo:** Las solicitudes
- **Qué gobierna:** Vacaciones
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Si los días pedidos superan el saldo, el botón dice **«Aprobar igual»** y la aprobación queda registrada como excepción.

**2. Escenarios ágiles de ejecución**

*Pide más de lo que tiene*

- **Dado que** alguien pide 5 días y le quedan 3
- **Cuando** RR.HH. revisa
- **Entonces** ve «Pide 5 y le quedan 3» y «Aprobar igual»

**3. Condiciones y excepciones**

- Quien no cumplió un año ve «Aún no cumple un año: sin días de vacación».

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑029
- **Historia de usuario:** HU‑ASI‑09
- **Pantalla:** W‑ASI‑10 Revisar una solicitud
- **Diseño:** Prototipado

#### 4.43 · BR-ASI-043 · La cobertura del lugar se mira al aprobar

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-043
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** REQ #21
- **Estado:** Borrador

*Descripción general*

Al revisar una vacación o un permiso de día completo, se cuenta cuánta gente de su lugar ya estaría fuera esos días. Si quedaría **por debajo del 80 %**, avisa: «Su lugar quedaría con 6 de 9».

**2. Escenarios ágiles de ejecución**

*Una sucursal chica*

- **Dado que** en una sucursal de 9 ya hay dos de vacaciones esa semana
- **Cuando** otra persona pide la misma semana
- **Entonces** el aviso dice «Su lugar quedaría con 6 de 9»

**3. Condiciones y excepciones**

- El mínimo por cargo y lugar no está en esta versión (#21).

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑030, RF‑ASI‑004
- **Historia de usuario:** HU‑ASI‑09
- **Pantalla:** W‑ASI‑10 Revisar una solicitud; W‑ASI‑01 Hoy
- **Diseño:** Prototipado

#### 4.44 · BR-ASI-044 · La persona cancela solo lo pendiente

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-044
- **Grupo:** Las solicitudes
- **Qué gobierna:** Solicitud
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

La persona retira una solicitud mientras está **por responder**; sus días vuelven al saldo. Lo aprobado no se cancela desde la app.

**2. Escenarios ágiles de ejecución**

*Cambio de planes*

- **Dado que** alguien pidió una vacación
- **Cuando** la cancela antes de que RR.HH. responda
- **Entonces** queda «Cancelada» y los días vuelven a su saldo

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑031
- **Historia de usuario:** HU‑ASI‑20
- **Pantalla:** W‑ASI‑22 Mi asistencia
- **Diseño:** Prototipado

### Las incidencias y el cierre

*Qué se revisa antes de cerrar y qué congela el cierre*

#### 4.45 · BR-ASI-045 · Cada tema del Libro muestra un mes

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-045
- **Grupo:** Las incidencias y el cierre
- **Qué gobierna:** Incidencia
- **Antes:** REQ #20
- **Estado:** Borrador

*Descripción general*

Los temas del Libro —faltas, retrasos y descansos, salidas sin marcar, marcaciones rechazadas y fuera de horario— muestran **el mes elegido**, como el resto del Libro. Antes, como Incidencias, mostraban los 10 días anteriores a hoy (cambia en la 1.1).

**2. Escenarios ágiles de ejecución**

*Una falta vieja*

- **Dado que** una falta fue hace 12 días
- **Cuando** se abre Libro › Faltas en ese mes
- **Entonces** ya no aparece; sigue en el Libro y en el cierre

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑022, RF‑ASI‑023, RF‑ASI‑024
- **Historia de usuario:** HU‑ASI‑07
- **Pantalla:** W‑ASI‑08 Temas del Libro
- **Diseño:** Prototipado

#### 4.46 · BR-ASI-046 · Las acciones están en el día, no en la lista

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-046
- **Grupo:** Las incidencias y el cierre
- **Qué gobierna:** Incidencia
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

En la fila no se resuelve nada: «Revisar» abre el día. Lo que corrige el día se hace ahí —agregar la salida, justificar, autorizar—. «Dejar como falta», «Ya la revisé», «No es extra» o «Dejar como injustificada» solo la sacan de la lista.

**2. Escenarios ágiles de ejecución**

*Dejar como falta*

- **Dado que** una falta sin permiso
- **Cuando** RR.HH. toca «Dejar como falta»
- **Entonces** el día sigue «Ausente» y la falta sigue en la lista: no hay que «vaciarla»

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑025
- **Historia de usuario:** HU‑ASI‑07
- **Pantalla:** W‑ASI‑08 Temas del Libro; W‑ASI‑07 Detalle de la jornada
- **Diseño:** Prototipado

#### 4.47 · BR-ASI-047 · Cerrar congela el mes; reabrir queda registrado

*Estado: Retirada · ya no hay cierre de mes; lo que pedía el #27 lo cumple el resumen para planillas —BR‑ASI‑049—*

**1. Información básica**

- **Código:** BR-ASI-047
- **Grupo:** Las incidencias y el cierre
- **Qué gobierna:** Cierre
- **Antes:** REQ #27
- **Estado:** Borrador

*Descripción general*

Cerrar un mes guarda quién y cuándo, y desde ahí no se corrige nada de ese mes —BR‑ASI‑027—. Antes de cerrar se avisa cuántas incidencias quedan. Se puede **reabrir** si hace falta, y queda registrado.

**2. Escenarios ágiles de ejecución**

*Cerrar con pendientes*

- **Dado que** quedan 4 incidencias de octubre
- **Cuando** RR.HH. toca «Cerrar octubre»
- **Entonces** el aviso dice «Quedan 4 incidencias sin resolver en este mes» antes de confirmar

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑038, RF‑ASI‑039
- **Historia de usuario:** HU‑ASI‑11
- **Pantalla:** W‑ASI‑14 Cierre del mes
- **Diseño:** Prototipado

#### 4.48 · BR-ASI-048 · En el cierre solo cuenta en contra lo injustificado

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-048
- **Grupo:** Las incidencias y el cierre
- **Qué gobierna:** Cierre
- **Antes:** REQ #27
- **Estado:** Borrador

*Descripción general*

Para planillas cuenta en contra solo lo **injustificado**: tardanza, descanso excedido, salida anticipada y ausencias. Solo se pagan las horas extra **aprobadas y trabajadas**. Las ausencias justificadas van aparte.

**2. Escenarios ágiles de ejecución**

*Una tardanza aceptada*

- **Dado que** alguien tiene 40 min de tardanza y 25 justificados
- **Cuando** se cierra el mes
- **Entonces** el cierre lleva 15 min de tardanza injustificada

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑040
- **Historia de usuario:** HU‑ASI‑11
- **Pantalla:** W‑ASI‑14 Cierre del mes
- **Diseño:** Prototipado

#### 4.49 · BR-ASI-049 · El resumen para planillas tiene un formato fijo

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-049
- **Grupo:** Las incidencias y el cierre
- **Qué gobierna:** Cierre
- **Antes:** REQ #27 · #8
- **Estado:** Borrador

*Descripción general*

Planillas recibe siempre las mismas columnas, una fila por persona, con los tiempos **en segundos**: período y su estado, días programados y trabajados, ausencias, trabajado, programado, tardanza total e injustificada, descanso excedido, salida anticipada, días sin descanso, horas extra autorizadas y trabajadas, fuera de horario y compensación. Se baja desde el Libro, en el Mes o el Calendario.

**2. Escenarios ágiles de ejecución**

*Un borrador*

- **Dado que** noviembre no está cerrado
- **Cuando** se exporta
- **Entonces** el archivo se llama «planilla_asistencia_2026-11_BORRADOR.csv» y el período dice «Borrador»

**3. Condiciones y excepciones**

- La compensación en tiempo va siempre en 0 hasta que exista la bolsa de horas (#11).

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑041
- **Historia de usuario:** HU‑ASI‑11
- **Pantalla:** W‑ASI‑14 Cierre del mes
- **Diseño:** Prototipado

### La configuración

*Qué se arma antes de que alguien marque*

#### 4.50 · BR-ASI-050 · La tolerancia es de la política, no del horario

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-050
- **Grupo:** La configuración
- **Qué gobierna:** Política
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

La tolerancia de entrada, de descanso y de salida es de la **política**: un mismo horario de 08:30 puede tener 10 min para unos y 20 para otros. Para no perderla, el formulario del horario dice cuánto es y desde qué hora cuenta como atraso, con «Cambiar en Políticas».

**2. Escenarios ágiles de ejecución**

*Al crear un horario*

- **Dado que** la política por defecto tiene 10 min
- **Cuando** se pone la entrada 08:30
- **Entonces** el formulario dice «cuenta como atraso después de las 08:40»

**3. Condiciones y excepciones**

- Si otras políticas tienen otra tolerancia, se listan.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑044
- **Historia de usuario:** HU‑ASI‑12, HU‑ASI‑13
- **Pantalla:** W‑ASI‑15 Horarios; W‑ASI‑16 Políticas de marcación
- **Diseño:** Prototipado

#### 4.51 · BR-ASI-051 · Los lugares son los de Organización

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-051
- **Grupo:** La configuración
- **Qué gobierna:** Lugar
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Asistencia no da de alta sitios: toma las **sucursales** y los **centros de trabajo** de Organización y les pone una **geocerca** encima. Un lugar sin geocerca dice «Sin ubicación».

**2. Escenarios ágiles de ejecución**

*Una sucursal nueva*

- **Dado que** Organización crea una sucursal
- **Cuando** se abre Lugares y geocercas
- **Entonces** aparece «Sin ubicación» con «Ubicar»

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑051, RF‑ASI‑052
- **Historia de usuario:** HU‑ASI‑14
- **Pantalla:** W‑ASI‑18 Lugares y geocercas
- **Diseño:** Prototipado

#### 4.52 · BR-ASI-052 · Una asignación por persona; la nueva reemplaza

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-052
- **Grupo:** La configuración
- **Qué gobierna:** Asignación
- **Antes:** Arquitectura · §4
- **Estado:** Borrador

*Descripción general*

Cada persona tiene una **asignación vigente**: horario, lugar, modalidad, política y desde. Asignar de nuevo cierra la anterior y abre esta en un solo paso. Sin política propia vale la **de por defecto**.

**2. Escenarios ágiles de ejecución**

*Cambio de turno fijo*

- **Dado que** alguien tenía «Oficina»
- **Cuando** se le asigna «Atención al público» desde el lunes
- **Entonces** desde el lunes se calcula con el horario nuevo

**3. Condiciones y excepciones**

- Se asigna a muchas a la vez: se filtra y se marca la casilla de la cabecera de la tabla.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑053, RF‑ASI‑054
- **Historia de usuario:** HU‑ASI‑15
- **Pantalla:** W‑ASI‑19 Asignaciones
- **Diseño:** Prototipado

#### 4.53 · BR-ASI-053 · Quien no controla asistencia no marca ni suma faltas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-053
- **Grupo:** La configuración
- **Qué gobierna:** Asignación
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

En el alta, «¿Controla su asistencia?» en **No** deja a la persona sin asignación: no marca, no se le cuentan faltas ni atrasos y no aparece en Hoy ni en el Libro. Es para el personal de confianza que la empresa no descuenta.

**2. Escenarios ágiles de ejecución**

*Un gerente*

- **Dado que** se da de alta a un gerente
- **Cuando** se elige «No controla»
- **Entonces** no aparece en Hoy ni en el Libro

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑055
- **Historia de usuario:** HU‑ASI‑15
- **Pantalla:** W‑ASI‑19 Asignaciones
- **Diseño:** Prototipado

#### 4.54 · BR-ASI-054 · Una sola política por defecto; lo que está en uso no se borra

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-054
- **Grupo:** La configuración
- **Qué gobierna:** Política
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

Hay **una sola** política por defecto. Ni la de por defecto ni una en uso se eliminan; un horario asignado tampoco.

**2. Escenarios ágiles de ejecución**

*Eliminar en uso*

- **Dado que** 12 personas tienen «Trabajo remoto»
- **Cuando** se quiere eliminar
- **Entonces** Eliminar está desactivado: «Está en uso»

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑045, RF‑ASI‑046, RF‑ASI‑048
- **Historia de usuario:** HU‑ASI‑13
- **Pantalla:** W‑ASI‑16 Políticas de marcación; W‑ASI‑15 Horarios
- **Diseño:** Prototipado

#### 4.55 · BR-ASI-055 · Las selfies se borran solas

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-055
- **Grupo:** La configuración
- **Qué gobierna:** Biometría
- **Antes:** Arquitectura · riesgo P2
- **Estado:** Borrador

*Descripción general*

La selfie de cada marca es solo evidencia y **se borra a los N días** —90 por defecto, de 30 a 365—. El rostro de la persona se borra si RR.HH. le pide registrarlo de nuevo.

**2. Escenarios ágiles de ejecución**

*Pasados los 90 días*

- **Dado que** la retención es de 90 días
- **Cuando** pasa una selfie de hace 100 días
- **Entonces** ya no está; la marca sigue

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑057, RF‑ASI‑058
- **Historia de usuario:** HU‑ASI‑16
- **Pantalla:** W‑ASI‑20 Biometría y privacidad
- **Diseño:** Prototipado

#### 4.56 · BR-ASI-056 · Un horario no cruza la medianoche

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-056
- **Grupo:** La configuración
- **Qué gobierna:** Horario
- **Antes:** Arquitectura · riesgo K1
- **Estado:** Borrador

*Descripción general*

La salida de un horario es después de su entrada. Los turnos de noche todavía no se calculan bien: se dividen en dos días.

**2. Escenarios ágiles de ejecución**

*Turno de noche*

- **Dado que** se crea un horario de 22:00 a 06:00
- **Cuando** se guarda
- **Entonces** no se guarda: «Los turnos que cruzan la medianoche todavía no se calculan bien»

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑043
- **Historia de usuario:** HU‑ASI‑12
- **Pantalla:** W‑ASI‑15 Horarios
- **Diseño:** Prototipado

### Para El colaborador

Las condiciones de lo que la persona ve y hace en su app.

### Lo que ve la persona

*Sus números y sus avisos*

#### 4.57 · BR-ASI-057 · Los mismos números de los dos lados

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-057
- **Grupo:** Lo que ve la persona
- **Qué gobierna:** Jornada
- **Antes:** REQ #16
- **Estado:** Borrador

*Descripción general*

La persona ve en su app y en Mi asistencia **exactamente** lo que ve RR.HH.: el estado de cada día, lo trabajado, el saldo del mes, la puntualidad y las horas extra. No hay una versión «para el empleado». Es lo que evita la discusión de fin de mes.

**2. Escenarios ágiles de ejecución**

*Un día tarde*

- **Dado que** el Libro dice que el martes llegó 12 min tarde
- **Cuando** la persona abre su semana
- **Entonces** ve el martes en ámbar con «12 min tarde»

**3. Condiciones y excepciones**

- La bolsa de horas no está en esta versión (#11).

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑016, RF‑ASI‑063, RF‑ASI‑069
- **Historia de usuario:** HU‑ASI‑19
- **Pantalla:** W‑ASI‑22 Mi asistencia
- **Diseño:** Prototipado

#### 4.58 · BR-ASI-058 · Cada aviso de marcación sale una vez por día

*Estado: Borrador*

**1. Información básica**

- **Código:** BR-ASI-058
- **Grupo:** Lo que ve la persona
- **Qué gobierna:** Aviso
- **Antes:** Nueva
- **Estado:** Borrador

*Descripción general*

La app recuerda marcar: 10 min antes de la entrada, pasada la tolerancia si sigue sin marcar, 5 min antes de terminar la pausa y si ya se pasó, y a la hora de salida si sigue sin marcarla. Cada aviso sale **una sola vez** por día.

**2. Escenarios ágiles de ejecución**

*Sin entrada*

- **Dado que** alguien no marcó y pasó su tolerancia
- **Cuando** llega el aviso «Aún no marca su entrada»
- **Entonces** no se repite ese día

**3. Condiciones y excepciones**

- Sin excepciones.

**4. Trazabilidad**

- **Ticket:** Pendiente
- **Requisitos:** RF‑ASI‑068
- **Historia de usuario:** HU‑ASI‑18
- **Pantalla:** W‑ASI‑21 Marcar desde el celular
- **Diseño:** Prototipado


## 05 · Modelo de datos

*Qué se guarda y qué se deduce. Se guardan las marcas, la configuración y las decisiones; el día de cada persona se calcula siempre de nuevo.*

### 5.1 Las entidades

| Entidad | Qué es | Campos principales |
| --- | --- | --- |
| **Geocerca** | El punto y el radio de un lugar de Organización | lugar, latitud, longitud, radio en metros |
| **Horario** | Cuándo trabaja alguien | nombre, modo (fijo o flexible), días de la semana, entrada, salida, descanso desde y hasta, meta en minutos (flexible), color |
| **Política de marcación** | Qué se exige y cómo se calcula | nombre, para qué sirve, rostro, similitud mínima, geocerca, radio propio, tolerancia de entrada, de descanso y de salida, si no marca el descanso (descontar, alertar o ambas), redondeo (0, 1 o 5), por defecto |
| **Asignación** | Lo que le toca a una persona | persona, horario, lugar, modalidad (presencial, remoto, híbrido), días de oficina, política (o la de por defecto), desde |
| **Biometría** | El rostro de una persona | consentimiento (versión, fecha), rostro registrado (fecha), pidió registrarlo de nuevo |
| **Marcación** | Un momento registrado | persona, fecha, tipo (entrada, inicio de pausa, fin de pausa, salida), minuto al segundo, latitud, longitud, distancia, dentro, similitud, origen (app o panel), remoto, rechazada (rostro o geocerca), motivo, por, cuándo |
| **Ajuste** | El cambio de una marca | marca, minuto nuevo o anulada, motivo, por, cuándo. La hora original queda en la marca |
| **Justificación de un día** | Lo que RR.HH. justificó de un día | persona, fecha, tipo, motivo, por, cuándo |
| **Solicitud** | Un pedido de la persona | tipo (vacaciones, permiso, corrección, remoto, cambio, justificación), persona, estado (por responder, aprobada, rechazada, cancelada), cuándo, canal, motivo, respondió, respondida, nota; y lo propio de cada tipo: desde y hasta, subtipo y horas, respaldo, marca y hora, turno de y a, alerta, minutos y categoría |
| **Horas extra** | Una ventana de horas extra | persona, fecha, desde, hasta, origen (pedida, asignada, autorizada después), estado (por responder, esperando que acepte, aprobada, aceptada, rechazada), motivo, proyecto o centro de costo, aprobador, por, cuándo, respondió, nota |
| **Incidencia descartada** | **Ya no se usa:** era lo que se sacaba de la bandeja de Incidencias | id |
| **Cierre** | Un mes congelado | mes, por, cuándo |
| **Ajustes generales** | Los valores de la empresa | días de retención de selfies, avisos encendidos por tipo, avisar desde (min), plazo para justificar (días hábiles), plazo para responder (h), motivo obligatorio en la marca manual |

### 5.2 Lo que se guarda y lo que se deduce

- **Se guardan** las marcas al segundo, sus ajustes, la configuración, las solicitudes y las horas extra con sus respuestas, las justificaciones de un día y los cierres.
- **Se deduce** la jornada de cada persona y día —entrada, salida, descanso, trabajado, programado, tardanza y su parte injustificada, alertas, salida anticipada, descanso excedido, lo descontado, horas extra, fuera de horario y estado—, las incidencias, los saldos de vacaciones, la puntualidad y todo lo acumulado.
- **Nada se borra**: un ajuste guarda la hora original, una marca anulada queda, una solicitud cancelada o rechazada queda con su estado.

### 5.3 Cómo se calcula un día

1. Se toman las marcas válidas —ni rechazadas ni anuladas— en orden.
2. La entrada es la primera entrada; la salida, la última salida. Los descansos se emparejan por orden.
3. Si el día es laboral —su horario lo incluye y no es feriado—, lo programado es la jornada menos la franja de descanso, o la meta si es flexible.
4. Lo trabajado es de la entrada a la salida —o hasta ahora, hoy— menos los descansos.
5. Con horario fijo: la tardanza contra la entrada más la tolerancia, redondeada; las alertas del descanso contra su franja; el descanso no marcado según la política; la salida anticipada contra la salida menos su tolerancia.
6. Las alertas justificadas y aceptadas dejan de sumar a lo injustificado.
7. Las horas extra son lo trabajado dentro de las ventanas autorizadas; lo demás que pasa de la jornada, desde 15 min, es fuera de horario.
8. El estado sale del momento —hoy— o del resultado —un día pasado—.

## 06 · Roadmap

*Cómo se llega de la maqueta a producción, en qué orden y con qué decisiones pendientes.*

### 6.1 Camino a desarrollo

La maqueta es la referencia de pantallas y comportamiento; este documento, la de reglas; `ASISTENCIA_ARQUITECTURA.md`, la del backend que ya existe. Las diferencias entre el backend y estas reglas —el descanso como franja, el cálculo al segundo, las horas extra por ventana— son lo primero que hay que llevar al servidor. Lo que la maqueta todavía no hace está marcado en cada pantalla y reunido en el anexo del prototipo.

### 6.2 Cuatro entregas

| Entrega | Qué incluye |
| --- | --- |
| **1 · Marcar y calcular** | Lugares y geocercas, horarios con franja, políticas con tolerancias y redondeo, asignaciones, biometría y consentimiento, marcar desde el celular, el cálculo del día al segundo, Hoy y el Libro |
| **2 · Corregir y justificar** | El detalle de la jornada con ajustar, anular y marcar a mano; los temas del Libro (faltas, retrasos, salidas sin marcar, rechazadas, fuera de horario); los avisos al colaborador con «Agregar motivo»; Justificaciones y Correcciones |
| **3 · Pedir y autorizar** | Vacaciones con saldos y cobertura, permisos y licencias, trabajo remoto, cambios de turno, horas extra pedidas, asignadas y autorizadas después, y Mi asistencia completa |
| **4 · Cerrar** | El cierre del mes, el archivo fijo para planillas y los reportes de tardanza por persona, semana y mes |

### 6.3 Hitos

| Hito | Se cumple cuando |
| --- | --- |
| **Primera marca con rostro** | Alguien marca su entrada desde el celular, dentro de su geocerca, y RR.HH. la ve en Hoy |
| **Primera justificación aceptada** | Una tardanza avisada recibe su motivo y deja de contar en el cierre |
| **Primer mes cerrado** | RR.HH. cierra un mes sin incidencias y Planillas lo toma en el formato fijo |

### 6.4 Dependencias

- **Organización**: las sucursales, los centros de trabajo y las unidades.
- **Gestión de personas**: la ficha, el alta y la fecha de ingreso.
- **Comunicación**: el envío de los avisos a la app.
- **Planillas**: toma el cierre.

### 6.5 Suposiciones

- Toda persona que marca tiene ficha, un lugar en Organización y el celular con la app.
- La empresa trabaja en la zona horaria de Bolivia.

### 6.6 Riesgos

| Riesgo | Mitigación |
| --- | --- |
| GPS falso o impreciso | El rostro prueba quién; el radio se ajusta por lugar; las marcas rechazadas llegan a Incidencias con su distancia |
| Similitud del rostro mal calibrada | Mínimo del 60 %, umbral por política y la selfie como evidencia |
| Turnos que cruzan la medianoche | No se permiten hasta resolverlo (riesgo K1) |
| Marcar sin señal | Hoy, la marcación manual con motivo; marcar sin conexión es una entrega futura |
| Que nadie revise lo raro | Los temas del Libro a un clic desde Hoy, y el aviso al cerrar |

### 6.7 Decisiones abiertas

| Código | Pregunta | Antes |
| --- | --- | --- |
| ABIERTA‑ASI‑01 | ¿Quién acepta una justificación: el líder de la persona, RR.HH. o los dos? ¿El líder ve solo a su unidad? | REQ #13 |
| ABIERTA‑ASI‑02 | ¿Las horas extra se pagan o se compensan con tiempo? ¿Cómo funciona la bolsa de horas? | REQ #11 |
| ABIERTA‑ASI‑03 | ¿El mínimo para operar se configura por lugar y por cargo, en lugar del 80 % para todos? | REQ #21 |
| ABIERTA‑ASI‑04 | ¿Dónde entra el Cierre del mes en el menú? Hoy la pantalla existe pero no tiene ruta | Nueva |
| ABIERTA‑ASI‑05 | ¿El candado del mes cerrado se valida también en el servidor? Hoy lo aplican las pantallas | Nueva |
| ABIERTA‑ASI‑06 | El aviso con «Agregar motivo» y el vencimiento del plazo para justificar: hoy se configuran pero no llegan al celular | REQ #15 |
| ABIERTA‑ASI‑07 | ¿Horarios distintos por día de la semana y con fecha de vigencia? | REQ #3 |
| ABIERTA‑ASI‑08 | ¿Marcar sin conexión y vincular el celular a la persona? | Arquitectura · R5, R6 |
| ABIERTA‑ASI‑09 | La zona horaria fija en UTC−4, ¿se configura por empresa? | Arquitectura · R1 |
| ABIERTA‑ASI‑10 | Los feriados móviles y los de cada departamento, ¿quién los carga? | Nueva |
| ABIERTA‑ASI‑11 | **Resuelta:** la vista Día es una tabla limpia con el horario al lado y una barrita del día en una columna (opción E1) | Nueva |
| ABIERTA‑ASI‑12 | ¿Reportes por área, día de la semana y motivo de tardanza? | REQ #24 |

## 07 · Flujos de usuario

*Los recorridos principales, paso a paso y por perfil.*

### Para Recursos Humanos

### 7.1 Empezar la mañana

1. Se abre Asistencia: Hoy dice qué porcentaje de la gente ya trabaja y si es un día normal.
2. «Requiere tu atención» muestra lo más grave: un lugar que no abrió, «Ver quiénes».
3. Se llama a quien falta; si no pudo marcar, «Marcación manual».
4. Al costado, «Mañana» avisa si un lugar quedaría bajo su mínimo.

### 7.2 Cargar una marca para quien no pudo

1. En Hoy, «Marcación manual», y se elige a la persona.
2. Se abre su día: «Agregar marcación», tipo y hora.
3. Se escribe por qué —«el teléfono se quedó sin batería»— y «Guardar».
4. La marca queda «Cargada por» con el motivo y el día se recalcula.

### 7.3 Ver los atrasos y las faltas del mes

1. En el Libro de asistencia, «Mes».
2. Cada colaborador tiene su mes en cuadritos de color y, a la derecha, sus retrasos, faltas y horas del mes.
3. «Retrasos ↓» ordena de quien más tiempo suma a quien menos.
4. Un clic en un día abre esa jornada; en el nombre, todo su mes.

### 7.4 Revisar las faltas del mes

1. En el menú, Libro de asistencia › Faltas. Muestra el mes, «Sin justificar».
2. Se filtra por sucursal o unidad, o se busca a alguien.
3. «Ver el día» abre su jornada: si tenía permiso, «Justificar».
4. «Exportar CSV» baja la lista del mes.

### 7.5 Responder una vacación

1. En Solicitudes › Vacaciones, «Pendientes».
2. La fila dice cuántos días le quedan y si su lugar sigue cubierto.
3. «Revisar»: «Si apruebas: … le quedarán N».
4. «Aprobar», con una nota opcional; o «Rechazar…» con el motivo y la confirmación.

### 7.6 Asignar horas extra

1. En Solicitudes › Horas extra, «Asignar horas extra».
2. Fecha, desde, hasta, motivo y proyecto; se marcan las personas.
3. «Asignar a N»: cada una la ve en su app y la acepta.
4. Al marcar la salida, solo cuenta lo trabajado dentro de la franja.

### 7.7 Cerrar el mes

1. En Cierre del mes, se revisan las cifras y la tabla por persona.
2. Si hay incidencias sin resolver, se resuelven antes.
3. «Cerrar el mes» y la confirmación.
4. «Exportar para planillas» baja el archivo fijo, ya sin «borrador».

### 7.8 Configurar el módulo por primera vez

1. Cada sección de Configuración muestra lo que le falta (lugares «Sin ubicación», colaboradores sin horario, rostros sin registrar).
2. Lugares y geocercas: se ubica cada sucursal y centro en el mapa con su radio.
3. Horarios: se crean con su franja de descanso.
4. Políticas: se revisa la Estándar y sus tolerancias.
5. Asignaciones: se filtra una unidad, se marca la casilla de la cabecera y «Asignar horario y lugar».

### Para El colaborador

### 7.9 Marcar la entrada

1. En Inicio, «Marcar entrada».
2. La ventana dice «Va a marcar su entrada · 08:27» y «Llega a tiempo»; «Escanear rostro».
3. «Está en su lugar · a 24 m»; «Escanear rostro» de nuevo, y «Mire la cámara».
4. «Entrada registrada» con la hora; «Listo».

### 7.10 Justificar un atraso

1. La app avisa: «Hoy llegaste 45 min tarde. ¿Quieres contarnos qué pasó?».
2. «Agregar motivo»: elige «Bloqueo o marcha» y lo cuenta.
3. Llega a Solicitudes › Justificaciones; su jefe o RR.HH. lo acepta.
4. Aceptado, ya no cuenta en contra; si no, ve el motivo en su app.

### 7.11 Corregir una marca

1. En Mi asistencia, el día que está mal: «¿Algo está mal? Corregir una marca».
2. Elige qué marca, ve a qué hora figura y pone la hora correcta y la razón.
3. «Enviar a RR.HH.».
4. Aprobada, la marca se carga sola con su motivo.

### 7.12 Pedir horas extra

1. En el «+» de Mi asistencia, «Pedir horas extra».
2. Día, desde su salida, hasta «2 h» y la razón: «Serían 2 h de horas extra».
3. «Enviar a RR.HH.»; queda «Por aprobar».
4. Aprobadas, lo que trabaje dentro cuenta como extra.

## 08 · Recursos visuales

*Las pantallas del módulo por perfil, con su dirección en la maqueta. Los wireframes dibujados son la maqueta misma.*

### Para Recursos Humanos

### 8.1 Pantallas de Recursos Humanos

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑ASI‑01 | Hoy | /asistencia |
| W‑ASI‑02 | Marcación manual | sobre Hoy |
| W‑ASI‑03 | Libro de asistencia · Día | /asistencia/registro?fecha= |
| W‑ASI‑04 | Libro de asistencia · Semana | /asistencia/registro?ver=semana |
| W‑ASI‑05 | Libro de asistencia · Mes | /asistencia/registro?ver=mes |
| W‑ASI‑06 | Asistencia de una persona | /asistencia/persona/:id?mes= |
| W‑ASI‑07 | Detalle de la jornada | sobre Hoy, el Libro, sus temas y la persona |
| W‑ASI‑08 | Temas del Libro: Faltas, Retrasos y descansos, Salidas sin marcar, Marcaciones rechazadas, Fuera de horario | /asistencia/registro/:tema?mes= |
| W‑ASI‑09 | Solicitudes, por tipo | /asistencia/solicitudes?ver= |
| W‑ASI‑10 | Revisar una solicitud | sobre Solicitudes |
| W‑ASI‑11 | Saldos de vacaciones | /asistencia/solicitudes?ver=vacaciones, pestaña Saldos |
| W‑ASI‑12 | Horas extra | /asistencia/solicitudes?ver=horas-extra&vista= |
| W‑ASI‑13 | Asignar horas extra | sobre Horas extra |
| W‑ASI‑14 | Cierre del mes | sin ruta en la maqueta —ABIERTA‑ASI‑04— |
| W‑ASI‑15 | Configuración › Horarios | /asistencia/configuracion?ver=horarios |
| W‑ASI‑16 | Configuración › Políticas de marcación | /asistencia/configuracion?ver=politicas |
| W‑ASI‑17 | Configuración › Avisos al colaborador | /asistencia/configuracion?ver=avisos |
| W‑ASI‑18 | Configuración › Lugares y geocercas | /asistencia/configuracion?ver=lugares |
| W‑ASI‑19 | Configuración › Asignaciones | /asistencia/configuracion?ver=asignaciones |
| W‑ASI‑20 | Configuración › Asignaciones (columna Rostro) y Modalidades (privacidad) | /asistencia/configuracion?ver=asignaciones |

### Para El colaborador

### 8.2 Pantallas del colaborador

| Código | Pantalla | Dirección |
| --- | --- | --- |
| W‑ASI‑21 | Marcar desde el celular: Inicio, confirmar, ubicación, rostro y listo | celular, Inicio |
| W‑ASI‑22 | Mi asistencia: su semana, su mes, su día, pedir horas extra y corregir una marca | /mi-espacio/mi-asistencia y celular, Zona HR |

## 09 · Historias de usuario

*Lo que necesita cada perfil, con sus criterios de aceptación.*

### Para Recursos Humanos

### 9.1 Historias de Recursos Humanos

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ASI‑01 | **Como** Recursos Humanos, **quiero** ver en vivo quién llegó y quién falta **para** reaccionar a tiempo | Esperados sin justificados · Comparación con un día normal · Lugares en riesgo |
| HU‑ASI‑02 | **Como** Recursos Humanos, **quiero** que el sistema me diga qué resolver hoy **para** no buscarlo | Hasta cinco cosas en orden de gravedad · Cada una con su acción |
| HU‑ASI‑03 | **Como** Recursos Humanos, **quiero** consultar las jornadas por día, semana o mes **para** encontrar patrones | Tres vistas · La fecha en la dirección · Exportar |
| HU‑ASI‑04 | **Como** Recursos Humanos, **quiero** ver las tardanzas, faltas y saldo acumulados de cada persona **para** actuar antes del cierre | Mes con acumulado · Ordenable · Lo justificado aparte |
| HU‑ASI‑05 | **Como** Recursos Humanos, **quiero** corregir una marca sin borrarla **para** que quede el rastro | Original tachada · Anular a la vista · Motivo y autor |
| HU‑ASI‑06 | **Como** Recursos Humanos, **quiero** cargar una marca a quien no pudo marcar **para** que su día sea correcto | Motivo obligatorio · «Cargada por» |
| HU‑ASI‑07 | **Como** Recursos Humanos, **quiero** revisar lo raro de los últimos días **para** cerrar sin sorpresas | Cinco tipos · Revisar abre el día · Contador en el menú |
| HU‑ASI‑08 | **Como** Recursos Humanos, **quiero** responder las solicitudes con lo que necesito para decidir **para** no buscar en otro lado | «Para decidir» · Rechazar con motivo · Aprobar aplica el efecto |
| HU‑ASI‑09 | **Como** Recursos Humanos, **quiero** aprobar vacaciones viendo el saldo y la cobertura **para** no dejar un lugar sin gente | Saldo por antigüedad · Días hábiles · Aviso de cobertura |
| HU‑ASI‑10 | **Como** Recursos Humanos, **quiero** autorizar horas extra antes o después **para** pagar solo lo que corresponde | Pedidas, asignadas y autorizadas después · Solo cuenta lo de la ventana |
| HU‑ASI‑11 | **Como** Recursos Humanos, **quiero** cerrar el mes y exportarlo para planillas **para** que no cambie después | Cerrar congela · Formato fijo en segundos · Borrador antes de cerrar |
| HU‑ASI‑12 | **Como** Recursos Humanos, **quiero** crear horarios con su franja de descanso **para** calcular bien el día | Fijo o flexible · Franja dentro de la jornada · La tolerancia a la vista |
| HU‑ASI‑13 | **Como** Recursos Humanos, **quiero** definir qué se exige al marcar y cómo se calcula **para** cada tipo de puesto | Rostro, geocerca, tolerancias, descanso y redondeo · Una por defecto |
| HU‑ASI‑14 | **Como** Recursos Humanos, **quiero** dibujar la geocerca de cada lugar **para** que se marque desde ahí | Lugares de Organización · Punto y radio en el mapa |
| HU‑ASI‑15 | **Como** Recursos Humanos, **quiero** asignar horario, lugar y modalidad a muchas personas a la vez | Filtrar y marcar todos · La nueva reemplaza · También en el alta |
| HU‑ASI‑16 | **Como** Recursos Humanos, **quiero** cuidar los datos biométricos **para** cumplir con la privacidad | Consentimiento · Selfies que se borran · Registrar el rostro de nuevo |

### Para El líder de área

### 9.2 Historias del líder

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ASI‑17 | **Como** líder, **quiero** responder los motivos de los atrasos de mi gente **para** que lo justificado no cuente en contra | Historial del mes · Aceptar o no aceptar con motivo |

### Para El colaborador

### 9.3 Historias del colaborador

| Código | Historia | Criterios de aceptación |
| --- | --- | --- |
| HU‑ASI‑18 | **Como** colaborador, **quiero** marcar en segundos con mi rostro y mi ubicación **para** no hacer fila en un reloj | Confirmar antes · Ubicación y rostro · Deshacer la salida |
| HU‑ASI‑19 | **Como** colaborador, **quiero** ver mi día, mi semana y mi mes **para** saber cómo voy | Los mismos números que RR.HH. · Cómo se hizo cada marca |
| HU‑ASI‑20 | **Como** colaborador, **quiero** pedir horas extra, corregir una marca y explicar un atraso **para** que mi registro sea justo | Pedir antes del día · Corrección con hora y razón · Motivo desde el aviso |

## Cómo se mantiene este documento

- Se actualiza junto con la maqueta: un cambio de comportamiento lleva su cambio aquí, en la misma entrega.
- Los códigos no cambian nunca. Una regla que deja de valer se marca «Retirada» con la versión, conserva su código y dice qué la reemplaza. No se renumera.
- La versión en Markdown (`modulo-asistencia.md`) es la fuente; la página (`public/modulo-asistencia.html`) se genera de ella con `node herramientas/doc-modulo.cjs modulo-asistencia.md public/modulo-asistencia.html`.
- Cada regla dice de dónde viene: el número del requerimiento de RR.HH. (`REQUERIMIENTOS_ASISTENCIA.md`), la sección de la arquitectura (`ASISTENCIA_ARQUITECTURA.md`) o «Nueva».

## Historial de versiones

| Versión | Fecha | Qué cambió |
| --- | --- | --- |
| **1.0** | 29 oct 2026 | **Primera versión con el formato de los demás módulos.** Reúne lo construido en la maqueta hasta el 29 de octubre: Hoy; el Libro de asistencia por día, semana y mes, con las tardanzas, faltas y saldo acumulados por persona; la asistencia de una persona; el detalle de la jornada con ajustar, anular, marcar a mano y justificar; Incidencias; Solicitudes en siete tipos con saldos de vacaciones y cobertura; Horas extra pedidas, asignadas y autorizadas después; el Cierre del mes con el archivo fijo para planillas; la Configuración en seis partes, con la tolerancia a la vista al crear un horario; y lo del colaborador: marcar con confirmación, rostro y ubicación, sus avisos y Mi asistencia. Las reglas de cálculo siguen la prioridad 1 de RR.HH.: descanso como franja (#2, #5, #6), al segundo (#8), horas extra solo autorizadas (#9, #10), justificaciones (#13, #15) y el cierre para planillas (#27). 58 reglas BR‑ASI, 74 requisitos, 20 historias y 22 pantallas |

## Anexo · Por qué decidimos así

#### Por qué la hora la pone el servidor y no el celular

Un celular se adelanta o se atrasa con dos toques. Si la hora viniera del teléfono, la marca no probaría nada. El servidor pone la hora y decide si la marca vale; el celular solo captura.

#### Por qué al segundo

RR.HH. mostró dos reportes con la misma tardanza, «1 h 18» y «1 h 8», y marcas de 08:30:01 y 08:30:59 que se veían iguales. Al segundo, con una sola tardanza calculada en un solo lugar, todas las pantallas dicen lo mismo. Truncar al mostrar asegura que nunca se diga más tiempo del que hubo.

#### Por qué el descanso es una franja y no minutos

Con «60 minutos de pausa» no se sabe si alguien salió antes, volvió tarde o se excedió. Con la franja de 13:00 a 14:00 cada cosa tiene su alerta, y solo el exceso cuesta tiempo.

#### Por qué quedarse no es hacer horas extra

Si cualquier rato de más se pagara, el que se queda conversando cobra lo mismo que el que se quedó por un inventario. Una hora extra se pide o se asigna antes; lo demás se informa como fuera de horario y, si correspondía, se autoriza después.

#### Por qué la tolerancia es de la política

Un mismo horario de 08:30 sirve para el personal general con 10 minutos y para cargos de confianza con 20. Si la tolerancia fuera del horario, habría que duplicar horarios. Para que no se pierda, el formulario del horario la muestra.

#### Por qué la persona justifica y no RR.HH.

Quien sabe por qué llegó tarde es la persona, y el mismo día. RR.HH. o su jefe deciden si lo aceptan. Así el motivo es de primera mano y queda el historial de cuántas veces pasó.

#### Por qué la persona ve los mismos números

Una versión «para el empleado» abre la discusión de fin de mes: «a mí me salía otra cosa». Con los mismos números de los dos lados, la discusión se da el día que pasó, cuando todavía se puede corregir.

#### Por qué el Mes del Libro es una planilla

Es la forma que RR.HH. ya conoce de Excel: una fila por persona, un cuadrito por día y lo acumulado a la derecha. Se elige en la ronda 2 de propuestas del Libro (L2), frente a una vista de resumen y un panel lateral.

## Anexo · El módulo en el prototipo, hoy

*Cómo está construido el módulo de asistencia en el prototipo al 29 de octubre de 2026 (versión 1.0), y en qué se aparta de este documento. Todo sale del código de este repositorio.*

### Las pantallas y sus rutas

| Dirección | Componente | Qué hay |
| --- | --- | --- |
| `/asistencia` | `pages/asistencia/Hoy.jsx`, `components/asistencia/HoyPulso.jsx` | Hoy, con la marcación manual |
| `/asistencia/registro` | `Registro.jsx` (`LibroDia`, `LibroMes`) | Libro de asistencia por día, semana y mes |
| `/asistencia/persona/:id` | `Persona.jsx` | La asistencia de una persona |
| sobre las anteriores | `components/asistencia/DetalleJornada.jsx` | El detalle de la jornada y sus correcciones |
| `/asistencia/registro/:tema` | `LibroTema.jsx` | Los temas del Libro (lo que era Incidencias); `/asistencia/incidencias` lleva a Faltas |
| `/asistencia/solicitudes` | `Solicitudes.jsx`, `components/asistencia/RevisarSolicitud.jsx` | Solicitudes por tipo, revisar y saldos |
| `/asistencia/solicitudes?ver=horas-extra` | `HorasExtra.jsx` | Horas extra (la vieja `/asistencia/horas-extra` redirige aquí) |
| sin ruta | `Cierre.jsx` | Cierre del mes; `/asistencia/cierre` vuelve a Hoy |
| `/asistencia/configuracion` | `Configuracion.jsx`, `MapaGeocerca.jsx` | Las seis partes de la configuración |
| alta de un colaborador | `components/personas/AsignacionAsistencia.jsx` | La asignación desde el alta |
| `/mi-espacio/mi-asistencia` | `pages/colaborador/MiAsistencia.jsx`, `components/asistencia/Marcador.jsx` | Mi asistencia en la web |
| celular | `Marcador.jsx`, `ConfirmarMarca.jsx`, `layout/InicioPhone.jsx`, `layout/AvisoPhone.jsx` | Marcar, su semana, su mes, pedir horas extra, corregir y los avisos |

### Los datos

- Todo vive en el navegador (`localStorage`, claves `onb_demo_at_*`). El cálculo está en `data/asistenciaData.js` (`recomputar`) y el estado en `context/AsistenciaContext.jsx`.
- Las marcas de ejemplo no se guardan: salen de una semilla por persona y día, siempre iguales, y encima se aplica lo guardado. Hay 75 días de historia.
- «Cargar datos de ejemplo» deja el reloj en el último viernes hábil a las 16:10 y siembra las marcas de la persona de la sesión.
- Los lugares salen de Organización; si no hay centros de trabajo, se usan «Depósito Central» y «Depósito El Alto» de ejemplo.

### En qué se aparta de este documento

- **El cierre no tiene ruta** ni entrada en el menú, aunque el candado de los meses cerrados funciona en el Libro, la persona y el detalle —ABIERTA‑ASI‑04—.
- **El candado del mes** lo aplican las pantallas; las funciones de fondo no lo revisan —ABIERTA‑ASI‑05—.
- **No hay roles**: ninguna pantalla mira el rol; el nombre del usuario se guarda como autor de cada corrección. Quien no es administrador va a Mi asistencia.
- **La ubicación y el rostro se simulan** en el celular; el rostro siempre coincide. No se guarda la selfie.
- **El aviso con «Agregar motivo»** solo se configura; en el celular no hay todavía cómo mandar una justificación, y el plazo no vence —ABIERTA‑ASI‑06—. Las justificaciones de ejemplo vienen sembradas.
- **«Trabajo remoto»** aparece en «¿Qué necesita?» como «Pronto».
- **Pedir horas extra** desde el celular no pide el proyecto.
- **El «plazo para responder»** de RR.HH. se guarda pero no se muestra en ninguna pantalla.
- **El calendario** de Hoy usa la fecha real y no la del reloj de la demo, y su leyenda tiene «Cierre» sin eventos.
- **No existen**: la bolsa de horas, marcar sin conexión, el domicilio autorizado, horarios por día o con vigencia, ni turnos de noche.
