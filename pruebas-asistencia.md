Souly HR · Módulo de asistencia · Pruebas para QA

# Pruebas de Asistencia

- **Versión del módulo:** 1.2
- **Fecha:** 5 de noviembre de 2026
- **Documento del módulo:** modulo-asistencia.html

El plan de pruebas del módulo, para quien lo testea. Cada caso dice qué se prueba, qué requisito (RF) y qué regla de negocio (BR) prueba, los pasos y lo que tiene que pasar. Se mantiene junto con el resto del documento: cuando cambia una regla o una pantalla, cambia su prueba.

## Antes de empezar

- **Dónde:** el prototipo publicado (Vercel) o `npm run dev` en `http://localhost:5173`. Navegador de escritorio, 1440 × 900 o más; el celular se prueba en el marco de teléfono de la misma web.
- **Datos:** con la **demo cargada** (menú lateral › «Cargar la demo»). El reloj de la demo queda en un **viernes a las 16:10** y la empresa de ejemplo es **FarmaVida S.R.L.**, con 63 colaboradores. Los ejemplos de abajo usan octubre de 2026; si la demo cae en otra semana, se usan los mismos casos con otras fechas.
- **Quién:** las pantallas de Asistencia se prueban como **Juan Pérez Gómez · Administrador HR**. Lo del celular, como colaborador (menú lateral › «Ver la demo como»).
- **Volver a empezar:** «Cargar la demo» borra lo que se cambió y vuelve a sembrar todo.
- **Cómo reportar:** el ID del caso (QA‑ASI‑NN), qué se hizo, qué pasó, qué se esperaba y una captura. En la columna «Resultado» se marca **✓** (pasa), **✗** (falla) o **—** (no se pudo probar).
- **Cobertura:** cada requisito vigente (RF‑ASI) y cada regla vigente (BR‑ASI) tiene al menos un caso. Las tres reglas retiradas en la 1.1 —BR‑ASI‑013 (redondeo), 027 y 047 (cierre de mes)— no se prueban.
- **Siempre, en todas las pruebas:** toda acción que no se deshace pide confirmación en una ventana antes de aplicarse; las tablas dicen «Colaborador» y no «Persona»; los filtros de estado son listas desplegables con la flecha a la derecha; nada se ve cortado ni se sale del ancho de la pantalla.

## 1 · Hoy

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑01 | Saludo y cifras del momento | Abrir Asistencia › Hoy | Saludo con el nombre, «El N % de tu gente ya está trabajando», y las cifras No han llegado, Llegaron tarde y Ausencias justificadas | — |   |
| QA‑ASI‑02 | Estados en lista desplegable | En «Colaboradores», abrir la lista de estados | No han llegado, Llegaron tarde, Trabajando, Aún no les toca, Vacaciones y permisos y Todos, cada uno con su punto de color y su número; al elegir uno, la tabla se filtra | — |   |
| QA‑ASI‑03 | Enlaces de «Requiere tu atención» | Tocar «Revisar» en «marcaciones rechazadas hoy» | Abre el Libro en el Mes con el tema «Marcaciones rechazadas» y la vista de lista | — |   |
| QA‑ASI‑04 | El calendario sin cierre | Mirar el calendario de la columna derecha | La leyenda muestra Feriado, Vacaciones y permisos, Faltas y Horas extra; **no** aparece «Cierre» | — |   |
| QA‑ASI‑05 | Quiénes se esperan | Con alguien de vacaciones hoy y alguien con el día libre, mirar «llegaron N de M» | Ninguno de los dos cuenta entre los esperados | RF‑ASI‑001 · BR‑ASI‑018, BR‑ASI‑039 |   |
| QA‑ASI‑06 | ¿Es un día normal? | Mirar la línea debajo del saludo («Lo normal a esta hora: N») | Compara con el mismo día de las 4 semanas anteriores, a la misma hora | RF‑ASI‑002 |   |
| QA‑ASI‑07 | Requiere tu atención | Mirar la tarjeta «Requiere tu atención» | Hasta cinco cosas, de la más grave a la menos grave, cada una con su botón (Revisar, Justificar, Responder, Completar) | RF‑ASI‑003 |   |
| QA‑ASI‑08 | Lugares en riesgo y mañana | Mirar «Lugares en riesgo» y «Mañana» | Un lugar está en riesgo si llegó menos del 80 % de su gente; «Mañana» avisa qué lugar quedaría bajo su mínimo con lo ya aprobado | RF‑ASI‑004, 006 · BR‑ASI‑043 |   |
| QA‑ASI‑09 | Marcación manual | «Marcación manual» › elegir a alguien y la hora, sin motivo y con motivo | Sin motivo no se guarda; con motivo, la marca aparece en su día como «Cargada por RR.HH.» | RF‑ASI‑005 · BR‑ASI‑025 |   |

## 2 · Libro de asistencia

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑10 | Día con estados | Libro › Día de hoy; abrir la lista de estados | Columnas Colaborador, Horario, Entrada, Salida, Su día (barra), Horas trabajadas, Estado. Quien está trabajando aparece en verde «desde HH:MM» aunque haya llegado tarde | RF‑ASI‑012 |   |
| QA‑ASI‑11 | Semana y Mes | Cambiar a Semana y a Mes con el segmento de la cabecera | Semana: celdas de color por día y lo acumulado; Mes: un cuadrito por día y las columnas Retrasos, Tiempo de retraso, Faltas y Horas del mes | — |   |
| QA‑ASI‑12 | Ventana «Su mes» | En el Mes, tocar el nombre de un colaborador | Abre su mes con las cifras, «Descargar PDF» y «Ver su asistencia completa» | RF‑ASI‑014 |   |
| QA‑ASI‑13 | Calendario | Tocar el ícono de calendario de la cabecera | El mes a todo el ancho; un clic en un día abre una ventana con los filtros y la tabla de ese día | — |   |
| QA‑ASI‑14 | Temas como filtro (Mes) | En el Mes, elegir «Faltas» en la lista de temas | Quedan solo quienes faltaron en el mes; los demás días se apagan; aparece «Sin justificar · Justificadas · Todas» | RF‑ASI‑081 · BR‑ASI‑045 |   |
| QA‑ASI‑15 | Lista de cada caso | Con «Retrasos y descansos» elegido, tocar el ícono de lista | Una fila por caso con Colaborador, Día, Qué pasó, Su motivo y «Ver el día» | RF‑ASI‑023 · BR‑ASI‑028 |   |
| QA‑ASI‑16 | Sin submenú | Mirar el menú lateral | «Libro de asistencia» es una sola entrada, sin Faltas, Retrasos ni Incidencias debajo | — |   |
| QA‑ASI‑17 | Direcciones viejas | Entrar a `/asistencia/registro/faltas` y a `/asistencia/incidencias` | Las dos abren el Libro en el Mes con el tema Faltas y la lista | — |   |
| QA‑ASI‑18 | Exportar del Mes | En el Mes, «Exportar CSV» | Pregunta «Las jornadas» o «Resumen para planillas»; el resumen trae una fila por colaborador, los tiempos en segundos y solo los días que ya pasaron | RF‑ASI‑040, 041, 013 · BR‑ASI‑049 |   |
| QA‑ASI‑19 | Exportar un tema | Con un tema elegido, «Exportar CSV» | Baja la lista de ese tema, no las jornadas | — |   |
| QA‑ASI‑20 | La dirección guarda la vista | Ir a una semana pasada, copiar la dirección y abrirla en otra pestaña | Abre la misma vista y la misma fecha (?ver=…&fecha=…) | RF‑ASI‑007 |   |
| QA‑ASI‑21 | No se pasa de hoy | En el Día de hoy, tocar la flecha «siguiente» | Está apagada: no se puede ir a un día que todavía no pasó | RF‑ASI‑008 |   |
| QA‑ASI‑22 | Ordenar el Mes | En el Mes, tocar los títulos Retrasos, Tiempo de retraso, Faltas y Horas del mes | Ordena de mayor a menor; otro toque quita el orden | RF‑ASI‑009 |   |
| QA‑ASI‑23 | Lo acumulado y lo justificado | Mirar Faltas y Horas del mes de alguien con un día de permiso | El permiso no cuenta como falta: aparece como «+1 con permiso»; el día de hoy no suma hasta que marca la salida | RF‑ASI‑010, 011 · BR‑ASI‑021, BR‑ASI‑039 |   |
| QA‑ASI‑24 | Cada tema, su mes | Con «Faltas», ir al mes anterior con las flechas | Muestra las faltas de ese mes completo, no solo de los últimos días | RF‑ASI‑022 · BR‑ASI‑045 |   |
| QA‑ASI‑25 | Fuera de horario | Con el tema «Fuera de horario», buscar a alguien que se quedó 25 min y a alguien que se quedó 35 min sin autorización | Solo aparece quien se quedó 30 min o más | RF‑ASI‑024 · BR‑ASI‑034, BR‑ASI‑045 |   |
| QA‑ASI‑26 | CSV seguro | Justificar un día con el motivo «=1+1» y exportar las jornadas | En la planilla, la celda se ve como texto «=1+1», no como fórmula | RF‑ASI‑074 |   |
| QA‑ASI‑27 | Las acciones están en el día | Con el tema Faltas en la lista, «Ver el día» en una falta sin permiso; cerrar sin hacer nada | La lista no tiene botones para resolver; el detalle abre con una línea que dice qué se vino a mirar; al cerrar, el día sigue «Faltó» y sigue en el tema | RF‑ASI‑025 · BR‑ASI‑046 |   |

## 3 · La asistencia de un colaborador y su PDF

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑28 | Las seis cifras | Abrir la asistencia completa de Valentina Cruz, octubre | Días trabajados «X de Y» sin contar el día en curso, Retrasos, Tiempo de retraso, Faltas, Horas del mes («completas» o «faltan») y Puntualidad | RF‑ASI‑014, 015 |   |
| QA‑ASI‑29 | Descargar PDF | «Descargar PDF» sin marcar la casilla | Baja un PDF de 2 páginas: logo de SoulyHR, empresa, período, las seis cifras y el calendario; en la segunda, cada día con su observación y las firmas de RR.HH. y del colaborador | RF‑ASI‑075, 076 |   |
| QA‑ASI‑30 | PDF con marcaciones | Marcar «Incluir las marcaciones al segundo» y descargar | Se suman hojas en horizontal con entrada, descanso, salida al segundo, tardanza y cómo marcó | RF‑ASI‑077 |   |
| QA‑ASI‑31 | Mismos números | Comparar las cifras de la pantalla, del PDF y de la ventana «Su mes» del Libro | Son iguales | RF‑ASI‑075 · BR‑ASI‑012, BR‑ASI‑057 |   |

## 4 · El detalle de una jornada

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑32 | Dos descansos | Con un horario con dos descansos (ver QA‑ASI‑69), abrir un día de ese colaborador | «Descansos de 13:00 a 14:00 y de 16:00 a 16:15»; las horas del día descuentan los dos | RF‑ASI‑084 |   |
| QA‑ASI‑33 | Descanso sin marcar | Abrir un día con la alerta «No marcó su descanso» | Dice «se restaron N de las horas trabajadas» y queda la alerta; no habla de descuentos de sueldo | BR‑ASI‑016 |   |
| QA‑ASI‑34 | Dónde marcó | Un colaborador con varios lugares (ver QA‑ASI‑82) marca en el otro lugar | La marca dice «Desde la app · Sucursal El Prado» | RF‑ASI‑087 |   |
| QA‑ASI‑35 | Corregir sin borrar | En una marca, ⋯ › «Ajustar la hora» con motivo | La marca muestra la hora original, la nueva, el motivo y quién la ajustó | RF‑ASI‑017, 072 · BR‑ASI‑023 |   |
| QA‑ASI‑36 | Anular una marca | En una marca, ⋯ › «Anular la marcación» con un motivo de 3 letras y después uno largo; confirmar | Con menos de 4 letras no se guarda; pide confirmación; la marca queda a la vista, gris, con «Anulada» y su motivo | RF‑ASI‑018, 019 · BR‑ASI‑024 |   |
| QA‑ASI‑37 | Autorizar como horas extra | En un día con «Fuera de horario», «Autorizar como horas extra» y confirmar | Se crea una ventana aprobada y esas horas pasan a contar como horas extra | RF‑ASI‑021 · BR‑ASI‑035 |   |
| QA‑ASI‑38 | Cómo se hizo cada marca | Mirar una marca hecha desde la app | Dice desde dónde (app, lugar o remoto), el parecido del rostro y la distancia, con el radar | RF‑ASI‑064 |   |
| QA‑ASI‑39 | El estado no va solo por color | Mirar los estados del día, del Libro y de las solicitudes | Siempre llevan el texto («Faltó», «Llegó tarde», «Pendiente»), no solo el color | RF‑ASI‑073 |   |
| QA‑ASI‑40 | Justificar un día | En un día «Faltó», «Justificar» › Comisión de servicio, con un motivo; confirmar | Deja de ser falta: el día dice «Justificada», el tipo y el motivo, y sale del tema Faltas | BR‑ASI‑026 |   |

## 5 · Solicitudes

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑41 | Lista y filtro de estado | Solicitudes › Vacaciones | Arranca en «Pendientes» (lista desplegable con número); columnas Colaborador, Fechas y motivo, A tener en cuenta, **Fecha de solicitud** (la fecha y debajo «hace N días»), Estado | RF‑ASI‑026 |   |
| QA‑ASI‑42 | «Pendiente» | Mirar el estado de una solicitud sin responder | Dice «Pendiente», no «Por responder» | — |   |
| QA‑ASI‑43 | La papeleta en Revisar | Revisar la vacación de Andrea Núñez | A la izquierda, la misma papeleta que ella vio en su app, con su número y el sello «Pendiente» | RF‑ASI‑079 |   |
| QA‑ASI‑44 | Aprobar escribiendo | «Aprobar…» › escribir «apro» y después «APROBAR» | «Sí, aprobar» se activa solo con la palabra completa (sin importar mayúsculas); al aprobar, el estado pasa a «Aprobada» | RF‑ASI‑078 |   |
| QA‑ASI‑45 | Excepción sin saldo | Revisar la vacación de Camila Herrera (sin días) › «Aprobar igual…» | El efecto aparece en rojo como excepción antes de escribir APROBAR | RF‑ASI‑029 · BR‑ASI‑042 |   |
| QA‑ASI‑46 | Sello de la respuesta | Después de aprobar, abrir «Ver» | La papeleta dice «Aprobada · Aprobó Juan Pérez Gómez · fecha» | RF‑ASI‑080 |   |
| QA‑ASI‑47 | Rechazar con motivo | «Rechazar…» con un motivo de menos de 6 letras y después uno largo | Con menos de 6, «Confirmar» no se activa; con el motivo, se rechaza y la persona lo verá en su app | RF‑ASI‑027 · BR‑ASI‑037 |   |
| QA‑ASI‑48 | Dejar pendiente | En Revisar, «Dejar pendiente» | Se cierra sin cambiar nada; sigue en Pendientes | — |   |
| QA‑ASI‑49 | Saldos | Vacaciones › «Saldos» (arriba a la derecha) | Columnas Colaborador, Fecha de ingreso, Días por año, Días usados, Días disponibles | — |   |
| QA‑ASI‑50 | Todos los tipos | Recorrer Permisos y licencias, Justificaciones, Correcciones, Trabajo remoto y Cambios de turno | Mismo filtro, misma «Fecha de solicitud» y la segunda columna con su nombre (Permiso o licencia, Qué justifica, Qué corrige…) | — |   |
| QA‑ASI‑51 | Cobertura del lugar | Revisar la vacación de Camila Herrera | «Su lugar quedaría con 3 de 4» en ámbar, porque queda bajo el 80 % | RF‑ASI‑030 · BR‑ASI‑043 |   |
| QA‑ASI‑52 | El número del menú | Mirar el número junto a «Solicitudes» en el menú; aprobar una | Cuenta las pendientes de todos los tipos, horas extra incluidas, y baja en uno | RF‑ASI‑031 |   |
| QA‑ASI‑53 | Saldo y días hábiles | Ver el saldo de alguien en Saldos y pedir una vacación que pase por un feriado y un domingo | El saldo es su derecho menos lo aprobado en los últimos 12 meses; los días se cuentan en días hábiles de su horario, sin el feriado ni el domingo | RF‑ASI‑032, 033 · BR‑ASI‑019, BR‑ASI‑041 |   |
| QA‑ASI‑54 | No aceptar una justificación | Justificaciones › una pendiente › «No aceptar» con el motivo «Es la tercera vez este mes» | La tardanza sigue como injustificada y el colaborador lee el motivo en su app | BR‑ASI‑029 |   |
| QA‑ASI‑55 | Aprobar una corrección | Correcciones › aprobar la que pide cargar una salida de las 18:04 | Su día tiene la salida de las 18:04 como corrección, con el motivo y quién la aprobó | RF‑ASI‑028 · BR‑ASI‑038 |   |
| QA‑ASI‑56 | Días por año según antigüedad | En Saldos, mirar a alguien con menos de 1 año, con 3 años, con 6 años y con más de 10 | 0, 15, 20 y 30 días por año; con 6 años y 8 días usados en los últimos 12 meses, le quedan 12 | RF‑ASI‑032 · BR‑ASI‑041 |   |
| QA‑ASI‑129 | Revisar en lote | Correcciones de marcación › «Revisar en lote · N» | Abre «Revisar N correcciones» en su propia pantalla, con buscador, filtros y «Qué cambia» con su número; la dirección dice `&lote=1` y «Volver a la lista» regresa | RF‑ASI‑088 |   |
| QA‑ASI‑130 | Rutinarias y de a una | En la pantalla del lote, mirar los dos grupos | Rutinarias: mueven 15 min o menos, no quitan atraso, 1.ª o 2.ª del mes, con casilla. «Se revisan de a una»: sin casilla y con el porqué («Es su 3.ª corrección del mes», «Quita 13 min de atraso · Comprobar: …») y «Revisar» | RF‑ASI‑088 · BR‑ASI‑038 |   |
| QA‑ASI‑131 | Aprobar en lote | «Elegir las N» › escribir «apro» y después «APROBAR» › «Aprobar N» | Se activa solo con la palabra completa; aviso «Se aprobaron N correcciones y se corrigieron sus días»; cada día queda con la marca corregida, sin una marca duplicada | RF‑ASI‑088 · BR‑ASI‑023, 024 |   |
| QA‑ASI‑132 | Días sueltos en la lista | Como Carlos, pedir vacaciones el 11 y el 16; como Juan, Solicitudes › Vacaciones | La fila dice «mié 11 y lun 16 nov · 2 días hábiles»; la papeleta, «Días: mié 11 y lun 16 nov» | RF‑ASI‑092 · BR‑ASI‑060 |   |
| QA‑ASI‑133 | Aprobar días sueltos | Aprobar una vacación del lunes 26 y el miércoles 28 de un mismo colaborador; abrir su página | El 26 y el 28 quedan «De vacaciones»; el 27 sigue como día de trabajo (o falta, si no vino). El saldo baja 2 | RF‑ASI‑092 · BR‑ASI‑060 |   |

## 6 · Horas extra

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑57 | Sin cifras ni pestañas | Solicitudes › Horas extra | No hay tarjetas de cifras; «Pendientes · Programadas · Todas» en lista desplegable y «Solicitudes · Resumen del mes» arriba a la derecha | — |   |
| QA‑ASI‑58 | Aprobar una hora extra | Revisar una pendiente › Aprobar escribiendo APROBAR | Pasa a autorizada; las horas trabajadas dentro de la ventana cuentan como extra | RF‑ASI‑035 · BR‑ASI‑032 |   |
| QA‑ASI‑59 | Fuera de horario | Ver un día de alguien que se quedó sin autorización | Aparece como «fuera de horario», no como horas extra | BR‑ASI‑034 |   |
| QA‑ASI‑60 | Asignar horas extra | «Asignar horas extra» a dos colaboradores con un proyecto o centro de costo | Se crea una por persona, «Esperando que acepte», con su proyecto | RF‑ASI‑034, 036 · BR‑ASI‑033 |   |
| QA‑ASI‑61 | Cancelar una autorizada | Abrir una autorizada › cancelarla (con confirmación) | Queda sin efecto y la persona lo ve en su app | RF‑ASI‑037 · BR‑ASI‑036 |   |
| QA‑ASI‑134 | Solicitante y Para | Solicitudes › Horas extra | Columnas Solicitante, Para, Día y horario, Motivo, Estado. La pedida por la persona dice «Para sí»; la del jefe, «Sebastián Torres · Su jefe · Coordinador Logístico» → Tomás Ibáñez; con el filtro «Todas», la asignada dice «Juan Pérez Gómez · RR.HH. · asignada». Sin columna «Quién la originó». En 1400 px entra el botón «Revisar» | RF‑ASI‑091 |   |
| QA‑ASI‑135 | Revisar con papeleta y su día | Revisar la de Ana Martínez Ruiz (mar 3 nov) | A la izquierda, la papeleta «Solicitud de horas extra» con su número y «Solicitante: Ana Martínez Ruiz · para sí»; a la derecha, la barra de su día con la franja 18:00–20:00 en violeta; «Primera vez en noviembre…» y «Empiezan justo cuando termina su horario (18:00)». Con alguien que ya tuvo en el mes: «Sería su N.ª vez en …: ya tiene X autorizadas (días)». Dice «Si aprueba» (de usted) | RF‑ASI‑089 |   |
| QA‑ASI‑136 | Horas extra en su día libre | Como Carlos (lunes a viernes), pedir horas extra para un sábado; como Juan, revisarla | Dice «El sábado no trabaja: las horas extra serían en su día libre» y la papeleta «Horario ese día: No trabaja ese día» (no «termina a las 18:00») | RF‑ASI‑089 |   |
| QA‑ASI‑137 | La que pidió el jefe | Revisar una de Sebastián Torres para Tomás Ibáñez › aprobar escribiendo APROBAR | «Lo pidió su jefe, Sebastián Torres, para 2 personas: Tomás Ibáñez y Emilio Vargas»; papeleta con tres firmas; al aprobar queda «Asignada» (por aceptar), todavía no autorizada | RF‑ASI‑090 · BR‑ASI‑059 |   |

## 7 · Configuración › Horarios

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑62 | Tabla primero | Abrir Horarios | Se abre en la tabla (Horario, Entrada y salida con la tolerancia debajo, Descansos, Días, Al día, A la semana, Colaboradores); el ícono de tarjetas va segundo; «Nuevo horario» a la derecha | BR‑ASI‑050 |   |
| QA‑ASI‑63 | Nuevo horario por defecto | «Nuevo horario» | Ventana ancha; un renglón por día de lunes a domingo; arranca de lunes a sábado con el sábado de 08:30 a 12:30; a la derecha «Así queda su semana» | — |   |
| QA‑ASI‑64 | Domingo sí, martes no | Apagar el martes, prender el domingo de 09:00 a 14:00 y guardar | El martes se ve rayado como «Día de descanso»; la tabla marca los días correctos y suma las horas de la semana con las de cada día | RF‑ASI‑082 |   |
| QA‑ASI‑65 | Sábado corto, jornada completa | Con «Atención al público» (sábado 09:00 a 13:00), ver en el Libro un sábado de alguien que la tiene | «09:00 – 13:00 sin descanso» y «4:00 de 4:00 · Terminó su jornada» si trabajó sus 4 horas | RF‑ASI‑083 |   |
| QA‑ASI‑66 | El reloj de Souly | Tocar una hora de entrada | Se abre una tarjeta con Hora y Minutos (de 5 en 5); la elegida en navy; «Listo»; también se puede escribir «830» y queda 08:30 | — |   |
| QA‑ASI‑67 | La tarjeta del descanso | Tocar un descanso «☕ 13:00–14:00» | Tarjetita flotante con Desde → Hasta, 15 min · 30 min · 45 min · 1 h, la barra del día y «Quitar descanso»; Escape cierra solo la tarjeta | — |   |
| QA‑ASI‑68 | Descanso sin nombre | Mirar los descansos | Solo la hora («☕ 13:00–14:00»); no dice Almuerzo ni Refrigerio | — |   |
| QA‑ASI‑69 | Dos descansos | En el lunes, «+ descanso» dos veces; guardar | Máximo dos por día; la tabla muestra uno por renglón y «Al día» descuenta los dos (8 h 15 min con 08:30–18:00, 13:00–14:00 y 16:00–16:15) | RF‑ASI‑084 · BR‑ASI‑014 |   |
| QA‑ASI‑70 | Errores del día | Poner la salida antes que la entrada; poner un descanso fuera de la jornada | El renglón avisa en ámbar y «Guardar horario» no se activa | RF‑ASI‑042, 043 · BR‑ASI‑014, BR‑ASI‑056 |   |
| QA‑ASI‑71 | Tolerancias | En «Tolerancias», subir la de entrada a 15 min | Debajo dice «Atraso desde las 08:45»; quien entra 08:44 con ese horario no llega tarde | RF‑ASI‑086, 044 · BR‑ASI‑012, BR‑ASI‑050 |   |
| QA‑ASI‑72 | Sin opciones de planilla | Mirar la ventana del horario | No aparece «Si no marca el descanso» ni «La tardanza se cuenta» | — |   |
| QA‑ASI‑73 | Flexible | Tipo «Flexible» | Misma ventana grande; un renglón por día con la meta (− y +), «Cuándo puede marcar» y la semana en barras violeta | — |   |
| QA‑ASI‑74 | Duplicar | ⋯ › Duplicar | Pide el nombre de la copia y «Sí, duplicar»; la copia aparece con 0 colaboradores | BR‑ASI‑054 |   |
| QA‑ASI‑75 | Eliminar escribiendo el nombre | ⋯ › Eliminar en la copia | Ventana centrada; el botón rojo se enciende solo al escribir el nombre exacto; en un horario con colaboradores, Eliminar está apagado | RF‑ASI‑045 · BR‑ASI‑054 |   |
| QA‑ASI‑76 | Turno de noche | «Nuevo horario» de 22:00 a 06:00 e intentar guardar | No se guarda: la salida tiene que ser después de la entrada (los turnos que cruzan la medianoche todavía no se calculan) | RF‑ASI‑043 · BR‑ASI‑056 |   |
| QA‑ASI‑138 | El descanso sin tope | «Nuevo horario» › tocar un descanso › escribir de 12:30 a 14:30; después un «hasta» antes del «desde» | No hay botones 15 · 30 · 45 min · 1 h; dice «Dura 2 h»; con el hasta antes, «El "hasta" tiene que ser después del "desde"». Sin errores en la página al abrir la rueda de la hora | RF‑ASI‑094 |   |

## 8 · Configuración › Modalidades

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑77 | Modalidades | Configuración › Modalidades | Tarjetas Presencial, Híbrido y Remoto con cuántos colaboradores y sus interruptores; el parecido mínimo del rostro (60–95 %) y la privacidad (días de las selfies) | RF‑ASI‑047, 085 |   |
| QA‑ASI‑78 | Lo que pide al marcar | Apagar «Estar en su lugar» en Presencial; marcar desde el celular fuera de la geocerca | La marca se acepta; con el interruptor prendido, se rechaza | RF‑ASI‑085 |   |
| QA‑ASI‑79 | Dirección vieja | Entrar a `?ver=politicas` y a `?ver=biometria` | Abren Modalidades y Asignaciones | — |   |

## 9 · Configuración › Asignaciones

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑80 | Una fila y el filtro | Abrir Asignaciones | Buscador, sucursal, centro, unidad y «Todos · Sin horario · Sin rostro» en una sola fila; columnas Horario, Lugar de trabajo, Modalidad, Rostro | — |   |
| QA‑ASI‑81 | Asignar a muchos | Filtrar una unidad, marcar la casilla de la cabecera › «Asignar horario y lugar» | La ventana muestra a quiénes; el horario se busca en la lista desplegable (filtros Fijos, Flexibles, Con sábado, Con domingo); «Así quedan» dice cuántos cambian, ya lo tenían o son nuevos | RF‑ASI‑053 · BR‑ASI‑052 |   |
| QA‑ASI‑82 | Varios lugares | En la ventana, «También puede marcar en» › agregar Sucursal El Prado; asignar | La tabla muestra «+1»; el colaborador puede marcar en los dos | RF‑ASI‑087 |   |
| QA‑ASI‑83 | Borrar el rostro | ⋯ › «Pedir que registre su rostro de nuevo» | Ventana centrada con su cara y el rostro tachado, los tres pasos y escribir BORRAR; el botón se enciende solo con la palabra | RF‑ASI‑058 · BR‑ASI‑055 |   |

## 10 · Configuración › Avisos al colaborador y Lugares

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑84 | Encender y apagar un aviso | Avisos al colaborador › apagar «Llegó tarde»; hacer que alguien llegue tarde | No le llega el aviso de la tardanza; los demás avisos siguen | RF‑ASI‑049 · BR‑ASI‑031 |   |
| QA‑ASI‑85 | Avisar desde | Poner «Avisar desde» en 10 min; una tardanza de 6 min y otra de 12 | Solo se avisa la de 12 min; la de 6 min igual cuenta como tardanza, solo que no se avisa | RF‑ASI‑050 · BR‑ASI‑031 |   |
| QA‑ASI‑86 | La geocerca | Lugares y geocercas › un lugar › mover el punto en el mapa y cambiar el radio | Se guarda un punto y un radio; las marcas fuera de ese círculo se rechazan | RF‑ASI‑051 · BR‑ASI‑004, BR‑ASI‑051 |   |
| QA‑ASI‑87 | Los lugares vienen de Organización | Buscar en Lugares y geocercas un botón para crear un lugar | No existe: las sucursales y los centros se crean en Organización y aquí solo se les pone la geocerca; un lugar sin geocerca dice «Sin ubicación» con «Ubicar» | RF‑ASI‑052 · BR‑ASI‑051 |   |
| QA‑ASI‑139 | Lugar sin ubicación | Lugares y geocercas › Sucursal 16 de Julio › «Ubicar en el mapa» | En ámbar «Sin ubicación · Nadie puede marcar aquí todavía»; el mapa arranca en El Alto (junto al Depósito El Alto), no en todo el país; al guardar, pasa a «Radio de 150 m» | RF‑ASI‑093 |   |
| QA‑ASI‑140 | Textos de Lugares | Mirar Villa Imperial y el Depósito Central | «1 marca aquí» (no «1 marcan aquí»); el centro dice «Centro de trabajo · Almacén», no «Centro de trabajo · Centro de trabajo» | RF‑ASI‑093 |   |

## 11 · Servidor y seguridad (con desarrollo)

Estos casos no se ven solo con la pantalla: se prueban con desarrollo, mirando lo que se guarda y lo que viaja al servidor.

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑88 | La hora la pone el servidor | Cambiar la hora del teléfono y marcar | La marca se guarda con la hora del servidor, no la del teléfono | RF‑ASI‑059 · BR‑ASI‑001 |   |
| QA‑ASI‑89 | Al segundo | Mirar una marca guardada y la misma en pantalla | Se guarda con segundos; en pantalla se muestra HH:MM y los cálculos usan los segundos | RF‑ASI‑070 · BR‑ASI‑011 |   |
| QA‑ASI‑90 | El servidor no compara imágenes | Revisar lo que envía la app al marcar con rostro | Viaja un vector del rostro, no la foto, para compararlo; la distancia a la geocerca también la calcula el servidor, no el teléfono | RF‑ASI‑071 · BR‑ASI‑002 |   |
| QA‑ASI‑91 | Las selfies se borran solas | Con «Borrar las selfies después de 90 días», buscar la selfie de una marca de hace 100 días | Ya no está; la marca sigue con su hora y su resultado | RF‑ASI‑057 · BR‑ASI‑055 |   |

## 12 · El alta del colaborador

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑92 | Paso Asistencia | Personas › Nuevo colaborador › paso «Asistencia» | Dos bloques: «Asignación de asistencia» (horario con buscador y su semana, dónde marca, otros lugares, modalidad, desde) y «Vacaciones y permisos» (4 campos); ya no están Jornada laboral, Método de marcación ni Compensación de horas | — |   |
| QA‑ASI‑93 | Se asigna al dar de alta | Completar el alta con un horario y un lugar | El colaborador aparece en Asignaciones con ese horario y en Hoy desde la fecha elegida | RF‑ASI‑055 · BR‑ASI‑053 |   |
| QA‑ASI‑94 | No controla su asistencia | Dar de alta con «¿Controla su asistencia?» en No | Queda sin asignación: no marca, no aparece en Hoy ni en el Libro y no se le cuentan faltas ni atrasos | RF‑ASI‑055 · BR‑ASI‑053 |   |

## 13 · Cálculos

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑95 | Tardanza al segundo | Horario 08:30 con 10 min de tolerancia; marca de entrada 08:40:59 | 59 s de tardanza; a las 08:40:00 no hay tardanza | BR‑ASI‑011, BR‑ASI‑012 |   |
| QA‑ASI‑96 | Lo justificado no debe horas | Un colaborador con 4 días de vacaciones aprobadas en el mes | Esos días no suman horas programadas: «Horas del mes» no dice que faltan esas horas | BR‑ASI‑039 |   |
| QA‑ASI‑97 | Solo cuenta en contra lo injustificado | Una tardanza con justificación aceptada | En el resumen para planillas no suma a «Tardanza injustificada» | RF‑ASI‑040 · BR‑ASI‑048 |   |
| QA‑ASI‑98 | Días trabajados | Ver «Días trabajados» un día laboral antes de la salida | No cuenta el día en curso hasta que marca la salida | BR‑ASI‑021 |   |
| QA‑ASI‑99 | Salida anticipada | Salida 18:00 con 5 min de tolerancia de salida; marca la salida a las 17:40 | 15 min de salida anticipada (se cuenta desde las 17:55, al segundo); hoy cuenta recién cuando marca la salida | BR‑ASI‑017 |   |
| QA‑ASI‑100 | El estado de hoy | En Hoy, mirar a alguien cuya entrada todavía no llega, a alguien que ya pasó su entrada y tolerancia sin marcar y a alguien que ya salió | «Aún no le toca», «No ha llegado» y «Terminó su jornada» | BR‑ASI‑018 |   |
| QA‑ASI‑101 | Una falta sola | Mirar un día pasado de alguien que tenía jornada, no marcó y no tenía permiso | El día queda «Faltó» sin que nadie lo cargue | BR‑ASI‑018 |   |
| QA‑ASI‑102 | Feriado | Mirar el 2 de noviembre (Todos Santos) en el Libro y pedir una vacación que lo incluya | Nadie figura con falta ni tardanza ese día, y no se cuenta como día de vacación | RF‑ASI‑033 · BR‑ASI‑019 |   |
| QA‑ASI‑103 | Flexible sin tardanza | Alguien con horario flexible de 8 h entra 10:05 y sale 18:20 | No tiene tardanza ni salida anticipada y cumple su meta del día | BR‑ASI‑020 |   |
| QA‑ASI‑104 | Lo trabajado sin el descanso | Alguien entró 08:30 y salió al descanso a las 13:00; mirarlo a las 13:30 | Lleva 4 h 30 trabajadas, no 5 h | RF‑ASI‑014 · BR‑ASI‑022 |   |
| QA‑ASI‑105 | Una alerta por hecho del descanso | Franja 13:00–14:00 con 2 min de tolerancia: uno sale 13:20 y vuelve 14:20; otro sale 13:00 y vuelve 14:30 | El primero: «Volvió tarde del descanso · 20 min», sin descuento. El segundo: «Excedió su descanso · 30 min» | RF‑ASI‑023 · BR‑ASI‑015 |   |
| QA‑ASI‑106 | Justificar el descanso | Un día con «Excedió su descanso» y «Volvió tarde del descanso»; aceptar la justificación del exceso | Las dos alertas quedan justificadas | BR‑ASI‑030 |   |
| QA‑ASI‑107 | Horas extra y fuera de horario | Horas extra autorizadas de 18:00 a 20:00; sale a las 20:40 | 2 h de horas extra; los 40 min de más son fuera de horario | RF‑ASI‑035 · BR‑ASI‑032 |   |
| QA‑ASI‑108 | Permiso por horas | Permiso de 09:00 a 11:00; llega a las 11:05 | Marca como siempre y el día no queda «Justificada» | RF‑ASI‑028 · BR‑ASI‑040 |   |

## 14 · Celular · Marcar

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑109 | Primera vez: consentimiento y rostro | Como un colaborador sin rostro registrado, Inicio › marcar la entrada | Primero «Antes de usar su rostro» con qué pasa con su cara; al aceptar, «Es la primera vez: quieto, de frente y con buena luz»; queda registrado | RF‑ASI‑056 · BR‑ASI‑006 |   |
| QA‑ASI‑110 | Marcar la entrada | Inicio › botón de entrada | Ventana «Va a marcar su entrada» con si llega a tiempo o tarde; pide rostro y ubicación según su modalidad; después dice «Entrada registrada»; si cancela en esa ventana, no queda ninguna marca | RF‑ASI‑060 · BR‑ASI‑007 |   |
| QA‑ASI‑111 | Fuera de su lugar | Marcar lejos de la geocerca (modalidad presencial) | «Está fuera de su lugar»: la marca se rechaza y RR.HH. la ve en el Libro › Marcaciones rechazadas con la distancia | RF‑ASI‑061 · BR‑ASI‑003 |   |
| QA‑ASI‑112 | Varios lugares | Con «También puede marcar en» (QA‑ASI‑82), marcar en el segundo lugar | Se acepta; el día dice dónde marcó | RF‑ASI‑087 · BR‑ASI‑004 |   |
| QA‑ASI‑113 | Remoto | Un colaborador remoto (o híbrido en un día de casa) marca | «Hoy en remoto · sin verificar ubicación»; vale cualquier lugar, pide el rostro | RF‑ASI‑085 · BR‑ASI‑010 |   |
| QA‑ASI‑114 | Descanso, no pausa | Después de entrar, «Iniciar descanso» y luego «Volver del descanso» | Las ventanas dicen «Va a iniciar su descanso» y «Va a volver de su descanso»; el historial «Salió a descansar» y «Volvió del descanso»; nunca aparece «pausa» | BR‑ASI‑008 |   |
| QA‑ASI‑115 | Dos descansos | Con un horario de dos descansos, después de volver del primero | La app vuelve a ofrecer «Iniciar descanso» para el segundo | RF‑ASI‑084 · BR‑ASI‑008, BR‑ASI‑014 |   |
| QA‑ASI‑116 | Salir antes | Marcar la salida con más de 30 min de jornada pendiente | Avisa «Le faltan … de jornada»; ofrece «Mejor, iniciar su descanso» si le falta el descanso, o «Sí, terminar jornada» | — |   |
| QA‑ASI‑117 | Deshacer la salida | Dentro de los 10 min después de marcar la salida, «Deshacer salida» | La salida queda anulada (no se borra) y RR.HH. ve «La persona deshizo su salida desde la app» | RF‑ASI‑062 · BR‑ASI‑009 |   |
| QA‑ASI‑118 | Rostro que no coincide | Con el parecido mínimo en 78 %, marcar con un rostro que no llega (con desarrollo, si la demo no lo simula) | La marca se rechaza «por rostro» y RR.HH. la ve en Libro › Marcaciones rechazadas, con la selfie | RF‑ASI‑047 · BR‑ASI‑005 |   |

## 15 · Celular · Mi asistencia y avisos

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑119 | Avisos del día | Dejar pasar la hora de entrada sin marcar; iniciar un descanso y esperar su fin | Bajan «Es hora de empezar su jornada», «Aún no marca su entrada», «Vuelva de su descanso» y «Ya es su hora de salida», una vez cada uno | RF‑ASI‑068 · BR‑ASI‑058 |   |
| QA‑ASI‑120 | Mi asistencia | Abrir Mi asistencia, la semana y el mes | Cada día con sus marcas y su estado; los números del mes son los mismos que ve RR.HH. en su página | RF‑ASI‑016, 063, 069 · BR‑ASI‑057 |   |
| QA‑ASI‑121 | Corregir una marcación | Mi asistencia › un día › «Corregir una marcación» | La pide con la hora y el motivo; llega a RR.HH. en Solicitudes › Correcciones como Pendiente | RF‑ASI‑028, 067 · BR‑ASI‑038 |   |
| QA‑ASI‑122 | Justificar un retraso | Con un retraso en el día, mandar su motivo desde el aviso | Llega a Solicitudes › Justificaciones; al aceptarlo, la tardanza deja de contar en contra | RF‑ASI‑040 · BR‑ASI‑028, BR‑ASI‑029 |   |
| QA‑ASI‑123 | Horas extra asignadas | Con horas extra asignadas por RR.HH., responder «Acepto» o «No puedo» | Con «Acepto» quedan autorizadas; con «No puedo» RR.HH. lo ve en Horas extra | RF‑ASI‑066 · BR‑ASI‑033 |   |
| QA‑ASI‑124 | Pedir horas extra | Mi asistencia › pedir horas extra para ayer, para hoy y para un día futuro | Solo deja hoy o un día futuro; llega a RR.HH. como Pendiente | RF‑ASI‑065 · BR‑ASI‑033 |   |
| QA‑ASI‑141 | Días a tiempo igual al PDF | Como Carlos, Mi asistencia › «Ver el mes» › septiembre; como Juan, la página de Carlos › septiembre | Los dos dicen 137 h 41 min, 13 de 17 días a tiempo (76 %) y 4 llegadas tarde; las vacaciones no cuentan como «a tiempo» | RF‑ASI‑063, 069 · BR‑ASI‑057 |   |
| QA‑ASI‑142 | Mi asistencia en la web | Como Juan, Mi espacio › Zona HR › Mi asistencia (o /mi-espacio/mi-asistencia) | Se ve la pantalla del celular agrandada, igual que Zona HR, con «Ver el mes» y el «+»; no la página vieja con «Sus días anteriores» | RF‑ASI‑095 |   |
| QA‑ASI‑143 | Aceptar lo que pidió el jefe | Después de QA‑ASI‑137, como la persona, abrir Mi asistencia | Tarjeta violeta «Sebastián Torres, su jefe, pidió horas extra para usted… RR.HH. ya las aprobó» con «No puedo» y «Acepto»; con «Acepto» quedan autorizadas | RF‑ASI‑066, 090 · BR‑ASI‑059 |   |

## 16 · Celular · Pedir vacaciones y permisos

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito y regla | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑125 | Pedir vacaciones | Inicio › pedir vacaciones › elegir fechas › revisar la papeleta › Solicitar | La papeleta trae sus datos, los días hábiles, cuándo vuelve y el saldo después; llega a RR.HH. como Pendiente con el mismo número | RF‑ASI‑079 |   |
| QA‑ASI‑126 | Pedir un permiso o licencia | Inicio › Permiso o licencia › elegir el tipo, el día o los días (o «Unas horas») | La hoja dice si es permiso o licencia (ya no aparece «Es un permiso · No descuenta vacaciones» al pie del calendario); en una licencia, «Puede subirlo ahora o después, hasta 5 días» para el respaldo | — |   |
| QA‑ASI‑127 | Ver la respuesta | Después de QA‑ASI‑46, Mis solicitudes › ver la papeleta | Tiene el sello «Aprobada» con quién y cuándo; si se rechazó, el motivo | RF‑ASI‑080 |   |
| QA‑ASI‑128 | Cancelar una pendiente | Mis solicitudes › una vacación pendiente › cancelarla (con confirmación) | Pasa a «Cancelada» y los días vuelven al saldo | BR‑ASI‑044 |   |
| QA‑ASI‑144 | Marcar y desmarcar días | Pedir vacaciones › tocar el 11, el 16 y el 17 › tocar otra vez el 16 | Quedan el 11 y el 17; la cabecera dice «mié 11 y mar 17 nov · 2 días hábiles»; los días pedidos (ámbar o verde) no se pueden tocar; al llegar al saldo: «Ya eligió sus N días disponibles» | RF‑ASI‑092 · BR‑ASI‑060 |   |
| QA‑ASI‑145 | Días sueltos en permiso y remoto | Permiso › Trámite personal: marcar el 11 y el 17; Trabajo remoto: el 16 y el 18; también arrastrar sobre varios | Cada uno sale como una sola solicitud con esos días; arrastrar marca un tramo saltando lo que no se puede; una licencia de ley (paternidad) se completa sola desde el primer día | RF‑ASI‑092 · BR‑ASI‑060 |   |
| QA‑ASI‑146 | Pedir horas extra para mi equipo | Ver la demo como «Líder de Área Mobile — Marketing» › Mi asistencia › «+» › «Pedir horas extra para mi equipo» (o Mis solicitudes › ¿Qué necesita?); elegir dos personas | Sale una solicitud por persona; abajo «Lo que pidió para su equipo» con Espera RR.HH.; un colaborador sin equipo no ve la opción | RF‑ASI‑090 · BR‑ASI‑059 |   |
