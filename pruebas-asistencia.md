Souly HR · Módulo de asistencia · Pruebas para QA

# Pruebas de Asistencia

- **Versión del módulo:** 1.1
- **Fecha:** 3 de noviembre de 2026
- **Documento del módulo:** modulo-asistencia.html

El plan de pruebas del módulo, para quien lo testea. Cada caso dice qué se prueba, con qué requisito se relaciona, los pasos y lo que tiene que pasar. Se mantiene junto con el resto del documento: cuando cambia una regla o una pantalla, cambia su prueba.

## 1 · Antes de empezar

- **Dónde:** el prototipo publicado (Vercel) o `npm run dev` en `http://localhost:5173`. Navegador de escritorio, 1440 × 900 o más; el celular se prueba en el marco de teléfono de la misma web.
- **Datos:** con la **demo cargada** (menú lateral › «Cargar la demo»). El reloj de la demo queda en un **viernes a las 16:10** y la empresa de ejemplo es **FarmaVida S.R.L.**, con 63 colaboradores. Los ejemplos de abajo usan octubre de 2026; si la demo cae en otra semana, se usan los mismos casos con otras fechas.
- **Quién:** las pantallas de Asistencia se prueban como **Juan Pérez Gómez · Administrador HR**. Lo del celular, como colaborador (menú lateral › «Ver la demo como»).
- **Volver a empezar:** «Cargar la demo» borra lo que se cambió y vuelve a sembrar todo.
- **Cómo reportar:** el ID del caso (QA‑ASI‑NN), qué se hizo, qué pasó, qué se esperaba y una captura. En la columna «Resultado» se marca **✓** (pasa), **✗** (falla) o **—** (no se pudo probar).
- **Siempre, en todas las pruebas:** toda acción que no se deshace pide confirmación en una ventana antes de aplicarse; las tablas dicen «Colaborador» y no «Persona»; los filtros de estado son listas desplegables con la flecha a la derecha; nada se ve cortado ni se sale del ancho de la pantalla.

## 2 · Hoy

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑01 | Saludo y cifras del momento | Abrir Asistencia › Hoy | Saludo con el nombre, «El N % de tu gente ya está trabajando», y las cifras No han llegado, Llegaron tarde y Ausencias justificadas | — |   |
| QA‑ASI‑02 | Estados en lista desplegable | En «Colaboradores», abrir la lista de estados | No han llegado, Llegaron tarde, Trabajando, Aún no les toca, Vacaciones y permisos y Todos, cada uno con su punto de color y su número; al elegir uno, la tabla se filtra | — |   |
| QA‑ASI‑03 | Enlaces de «Requiere tu atención» | Tocar «Revisar» en «marcaciones rechazadas hoy» | Abre el Libro en el Mes con el tema «Marcaciones rechazadas» y la vista de lista | — |   |
| QA‑ASI‑04 | El calendario sin cierre | Mirar el calendario de la columna derecha | La leyenda muestra Feriado, Vacaciones y permisos, Faltas y Horas extra; **no** aparece «Cierre» | — |   |

## 3 · Libro de asistencia

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑05 | Día con estados | Libro › Día de hoy; abrir la lista de estados | Columnas Colaborador, Horario, Entrada, Salida, Su día (barra), Horas trabajadas, Estado. Quien está trabajando aparece en verde «desde HH:MM» aunque haya llegado tarde | — |   |
| QA‑ASI‑06 | Semana y Mes | Cambiar a Semana y a Mes con el segmento de la cabecera | Semana: celdas de color por día y lo acumulado; Mes: un cuadrito por día y las columnas Retrasos, Tiempo de retraso, Faltas y Horas del mes | — |   |
| QA‑ASI‑07 | Ventana «Su mes» | En el Mes, tocar el nombre de un colaborador | Abre su mes con las cifras, «Descargar PDF» y «Ver su asistencia completa» | RF‑ASI‑014 |   |
| QA‑ASI‑08 | Calendario | Tocar el ícono de calendario de la cabecera | El mes a todo el ancho; un clic en un día abre una ventana con los filtros y la tabla de ese día | — |   |
| QA‑ASI‑09 | Temas como filtro (Mes) | En el Mes, elegir «Faltas» en la lista de temas | Quedan solo quienes faltaron en el mes; los demás días se apagan; aparece «Sin justificar · Justificadas · Todas» | RF‑ASI‑081 |   |
| QA‑ASI‑10 | Lista de cada caso | Con «Retrasos y descansos» elegido, tocar el ícono de lista | Una fila por caso con Colaborador, Día, Qué pasó, Su motivo y «Ver el día» | RF‑ASI‑023 |   |
| QA‑ASI‑11 | Sin submenú | Mirar el menú lateral | «Libro de asistencia» es una sola entrada, sin Faltas, Retrasos ni Incidencias debajo | — |   |
| QA‑ASI‑12 | Direcciones viejas | Entrar a `/asistencia/registro/faltas` y a `/asistencia/incidencias` | Las dos abren el Libro en el Mes con el tema Faltas y la lista | — |   |
| QA‑ASI‑13 | Exportar del Mes | En el Mes, «Exportar CSV» | Pregunta «Las jornadas» o «Resumen para planillas»; el resumen trae una fila por colaborador, los tiempos en segundos y solo los días que ya pasaron | RF‑ASI‑040, 041 |   |
| QA‑ASI‑14 | Exportar un tema | Con un tema elegido, «Exportar CSV» | Baja la lista de ese tema, no las jornadas | — |   |

## 4 · La asistencia de un colaborador y su PDF

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑15 | Las seis cifras | Abrir la asistencia completa de Valentina Cruz, octubre | Días trabajados «X de Y» sin contar el día en curso, Retrasos, Tiempo de retraso, Faltas, Horas del mes («completas» o «faltan») y Puntualidad | RF‑ASI‑014, 015 |   |
| QA‑ASI‑16 | Descargar PDF | «Descargar PDF» sin marcar la casilla | Baja un PDF de 2 páginas: logo de SoulyHR, empresa, período, las seis cifras y el calendario; en la segunda, cada día con su observación y las firmas de RR.HH. y del colaborador | RF‑ASI‑075, 076 |   |
| QA‑ASI‑17 | PDF con marcaciones | Marcar «Incluir las marcaciones al segundo» y descargar | Se suman hojas en horizontal con entrada, descanso, salida al segundo, tardanza y cómo marcó | RF‑ASI‑077 |   |
| QA‑ASI‑18 | Mismos números | Comparar las cifras de la pantalla, del PDF y de la ventana «Su mes» del Libro | Son iguales | RF‑ASI‑075 |   |

## 5 · El detalle de una jornada

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑19 | Dos descansos | Con un horario con dos descansos (ver QA‑ASI‑43), abrir un día de ese colaborador | «Descansos de 13:00 a 14:00 y de 16:00 a 16:15»; las horas del día descuentan los dos | RF‑ASI‑084 |   |
| QA‑ASI‑20 | Descanso sin marcar | Abrir un día con la alerta «No marcó su descanso» | Dice «se restaron N de las horas trabajadas» y queda la alerta; no habla de descuentos de sueldo | — |   |
| QA‑ASI‑21 | Dónde marcó | Un colaborador con varios lugares (ver QA‑ASI‑55) marca en el otro lugar | La marca dice «Desde la app · Sucursal El Prado» | RF‑ASI‑087 |   |
| QA‑ASI‑22 | Corregir sin borrar | En una marca, ⋯ › «Ajustar la hora» con motivo | La marca muestra la hora original, la nueva, el motivo y quién la ajustó | — |   |

## 6 · Solicitudes

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑23 | Lista y filtro de estado | Solicitudes › Vacaciones | Arranca en «Pendientes» (lista desplegable con número); columnas Colaborador, Fechas y motivo, A tener en cuenta, **Fecha de solicitud** (la fecha y debajo «hace N días»), Estado | — |   |
| QA‑ASI‑24 | «Pendiente» | Mirar el estado de una solicitud sin responder | Dice «Pendiente», no «Por responder» | — |   |
| QA‑ASI‑25 | La papeleta en Revisar | Revisar la vacación de Andrea Núñez | A la izquierda, la misma papeleta que ella vio en su app, con su número y el sello «Pendiente» | RF‑ASI‑079 |   |
| QA‑ASI‑26 | Aprobar escribiendo | «Aprobar…» › escribir «apro» y después «APROBAR» | «Sí, aprobar» se activa solo con la palabra completa (sin importar mayúsculas); al aprobar, el estado pasa a «Aprobada» | RF‑ASI‑078 |   |
| QA‑ASI‑27 | Excepción sin saldo | Revisar la vacación de Camila Herrera (sin días) › «Aprobar igual…» | El efecto aparece en rojo como excepción antes de escribir APROBAR | RF‑ASI‑029 |   |
| QA‑ASI‑28 | Sello de la respuesta | Después de aprobar, abrir «Ver» | La papeleta dice «Aprobada · Aprobó Juan Pérez Gómez · fecha» | RF‑ASI‑080 |   |
| QA‑ASI‑29 | Rechazar con motivo | «Rechazar…» con un motivo de menos de 6 letras y después uno largo | Con menos de 6, «Confirmar» no se activa; con el motivo, se rechaza y la persona lo verá en su app | RF‑ASI‑027 |   |
| QA‑ASI‑30 | Dejar pendiente | En Revisar, «Dejar pendiente» | Se cierra sin cambiar nada; sigue en Pendientes | — |   |
| QA‑ASI‑31 | Saldos | Vacaciones › «Saldos» (arriba a la derecha) | Columnas Colaborador, Fecha de ingreso, Días por año, Días usados, Días disponibles | — |   |
| QA‑ASI‑32 | Todos los tipos | Recorrer Permisos y licencias, Justificaciones, Correcciones, Trabajo remoto y Cambios de turno | Mismo filtro, misma «Fecha de solicitud» y la segunda columna con su nombre (Permiso o licencia, Qué justifica, Qué corrige…) | — |   |

## 7 · Horas extra

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑33 | Sin cifras ni pestañas | Solicitudes › Horas extra | No hay tarjetas de cifras; «Pendientes · Programadas · Todas» en lista desplegable y «Solicitudes · Resumen del mes» arriba a la derecha | — |   |
| QA‑ASI‑34 | Aprobar una hora extra | Revisar una pendiente › Aprobar escribiendo APROBAR | Pasa a autorizada; las horas trabajadas dentro de la ventana cuentan como extra | — |   |
| QA‑ASI‑35 | Fuera de horario | Ver un día de alguien que se quedó sin autorización | Aparece como «fuera de horario», no como horas extra | — |   |

## 8 · Configuración › Horarios

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑36 | Tabla primero | Abrir Horarios | Se abre en la tabla (Horario, Entrada y salida con la tolerancia debajo, Descansos, Días, Al día, A la semana, Colaboradores); el ícono de tarjetas va segundo; «Nuevo horario» a la derecha | — |   |
| QA‑ASI‑37 | Nuevo horario por defecto | «Nuevo horario» | Ventana ancha; un renglón por día de lunes a domingo; arranca de lunes a sábado con el sábado de 08:30 a 12:30; a la derecha «Así queda su semana» | — |   |
| QA‑ASI‑38 | Domingo sí, martes no | Apagar el martes, prender el domingo de 09:00 a 14:00 y guardar | El martes se ve rayado como «Día de descanso»; la tabla marca los días correctos y suma las horas de la semana con las de cada día | RF‑ASI‑082 |   |
| QA‑ASI‑39 | Sábado corto, jornada completa | Con «Atención al público» (sábado 09:00 a 13:00), ver en el Libro un sábado de alguien que la tiene | «09:00 – 13:00 sin descanso» y «4:00 de 4:00 · Terminó su jornada» si trabajó sus 4 horas | RF‑ASI‑083 |   |
| QA‑ASI‑40 | El reloj de Souly | Tocar una hora de entrada | Se abre una tarjeta con Hora y Minutos (de 5 en 5); la elegida en navy; «Listo»; también se puede escribir «830» y queda 08:30 | — |   |
| QA‑ASI‑41 | La tarjeta del descanso | Tocar un descanso «☕ 13:00–14:00» | Tarjetita flotante con Desde → Hasta, 15 min · 30 min · 45 min · 1 h, la barra del día y «Quitar descanso»; Escape cierra solo la tarjeta | — |   |
| QA‑ASI‑42 | Descanso sin nombre | Mirar los descansos | Solo la hora («☕ 13:00–14:00»); no dice Almuerzo ni Refrigerio | — |   |
| QA‑ASI‑43 | Dos descansos | En el lunes, «+ descanso» dos veces; guardar | Máximo dos por día; la tabla muestra uno por renglón y «Al día» descuenta los dos (8 h 15 min con 08:30–18:00, 13:00–14:00 y 16:00–16:15) | RF‑ASI‑084 |   |
| QA‑ASI‑44 | Errores del día | Poner la salida antes que la entrada; poner un descanso fuera de la jornada | El renglón avisa en ámbar y «Guardar horario» no se activa | — |   |
| QA‑ASI‑45 | Tolerancias | En «Tolerancias», subir la de entrada a 15 min | Debajo dice «Atraso desde las 08:45»; quien entra 08:44 con ese horario no llega tarde | RF‑ASI‑086 |   |
| QA‑ASI‑46 | Sin opciones de planilla | Mirar la ventana del horario | No aparece «Si no marca el descanso» ni «La tardanza se cuenta» | — |   |
| QA‑ASI‑47 | Flexible | Tipo «Flexible» | Misma ventana grande; un renglón por día con la meta (− y +), «Cuándo puede marcar» y la semana en barras violeta | — |   |
| QA‑ASI‑48 | Duplicar | ⋯ › Duplicar | Pide el nombre de la copia y «Sí, duplicar»; la copia aparece con 0 colaboradores | — |   |
| QA‑ASI‑49 | Eliminar escribiendo el nombre | ⋯ › Eliminar en la copia | Ventana centrada; el botón rojo se enciende solo al escribir el nombre exacto; en un horario con colaboradores, Eliminar está apagado | — |   |

## 9 · Configuración › Modalidades

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑50 | Modalidades | Configuración › Modalidades | Tarjetas Presencial, Híbrido y Remoto con cuántos colaboradores y sus interruptores; el parecido mínimo del rostro (60–95 %) y la privacidad (días de las selfies) | RF‑ASI‑047, 085 |   |
| QA‑ASI‑51 | Lo que pide al marcar | Apagar «Estar en su lugar» en Presencial; marcar desde el celular fuera de la geocerca | La marca se acepta; con el interruptor prendido, se rechaza | RF‑ASI‑085 |   |
| QA‑ASI‑52 | Dirección vieja | Entrar a `?ver=politicas` y a `?ver=biometria` | Abren Modalidades y Asignaciones | — |   |

## 10 · Configuración › Asignaciones

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑53 | Una fila y el filtro | Abrir Asignaciones | Buscador, sucursal, centro, unidad y «Todos · Sin horario · Sin rostro» en una sola fila; columnas Horario, Lugar de trabajo, Modalidad, Rostro | — |   |
| QA‑ASI‑54 | Asignar a muchos | Filtrar una unidad, marcar la casilla de la cabecera › «Asignar horario y lugar» | La ventana muestra a quiénes; el horario se busca en la lista desplegable (filtros Fijos, Flexibles, Con sábado, Con domingo); «Así quedan» dice cuántos cambian, ya lo tenían o son nuevos | RF‑ASI‑053 |   |
| QA‑ASI‑55 | Varios lugares | En la ventana, «También puede marcar en» › agregar Sucursal El Prado; asignar | La tabla muestra «+1»; el colaborador puede marcar en los dos | RF‑ASI‑087 |   |
| QA‑ASI‑56 | Borrar el rostro | ⋯ › «Pedir que registre su rostro de nuevo» | Ventana centrada con su cara y el rostro tachado, los tres pasos y escribir BORRAR; el botón se enciende solo con la palabra | RF‑ASI‑058 |   |

## 11 · Celular · Marcar

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑57 | Primera vez: consentimiento y rostro | Como un colaborador sin rostro registrado, Inicio › marcar la entrada | Primero «Antes de usar su rostro» con qué pasa con su cara; al aceptar, «Es la primera vez: quieto, de frente y con buena luz»; queda registrado | RF‑ASI‑056 |   |
| QA‑ASI‑58 | Marcar la entrada | Inicio › botón de entrada | Ventana «Va a marcar su entrada» con si llega a tiempo o tarde; pide rostro y ubicación según su modalidad; después dice «Entrada registrada» | — |   |
| QA‑ASI‑59 | Fuera de su lugar | Marcar lejos de la geocerca (modalidad presencial) | «Está fuera de su lugar»: la marca se rechaza y RR.HH. la ve en el Libro › Marcaciones rechazadas con la distancia | — |   |
| QA‑ASI‑60 | Varios lugares | Con «También puede marcar en» (QA‑ASI‑55), marcar en el segundo lugar | Se acepta; el día dice dónde marcó | RF‑ASI‑087 |   |
| QA‑ASI‑61 | Remoto | Un colaborador remoto (o híbrido en un día de casa) marca | «Hoy en remoto · sin verificar ubicación»; vale cualquier lugar, pide el rostro | RF‑ASI‑085 |   |
| QA‑ASI‑62 | Descanso, no pausa | Después de entrar, «Iniciar descanso» y luego «Volver del descanso» | Las ventanas dicen «Va a iniciar su descanso» y «Va a volver de su descanso»; el historial «Salió a descansar» y «Volvió del descanso»; nunca aparece «pausa» | — |   |
| QA‑ASI‑63 | Dos descansos | Con un horario de dos descansos, después de volver del primero | La app vuelve a ofrecer «Iniciar descanso» para el segundo | RF‑ASI‑084 |   |
| QA‑ASI‑64 | Salir antes | Marcar la salida con más de 30 min de jornada pendiente | Avisa «Le faltan … de jornada»; ofrece «Mejor, iniciar su descanso» si le falta el descanso, o «Sí, terminar jornada» | — |   |
| QA‑ASI‑65 | Deshacer la salida | Dentro de los 10 min después de marcar la salida, «Deshacer salida» | La salida queda anulada (no se borra) y RR.HH. ve «La persona deshizo su salida desde la app» | — |   |

## 12 · Celular · Mi asistencia y avisos

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑66 | Avisos del día | Dejar pasar la hora de entrada sin marcar; iniciar un descanso y esperar su fin | Bajan «Es hora de empezar su jornada», «Aún no marca su entrada», «Vuelva de su descanso» y «Ya es su hora de salida», una vez cada uno | — |   |
| QA‑ASI‑67 | Mi asistencia | Abrir Mi asistencia, la semana y el mes | Cada día con sus marcas y su estado; los números del mes son los mismos que ve RR.HH. en su página | RF‑ASI‑016 |   |
| QA‑ASI‑68 | Corregir una marcación | Mi asistencia › un día › «Corregir una marcación» | La pide con la hora y el motivo; llega a RR.HH. en Solicitudes › Correcciones como Pendiente | RF‑ASI‑028 |   |
| QA‑ASI‑69 | Justificar un retraso | Con un retraso en el día, mandar su motivo desde el aviso | Llega a Solicitudes › Justificaciones; al aceptarlo, la tardanza deja de contar en contra | RF‑ASI‑040 |   |
| QA‑ASI‑70 | Horas extra asignadas | Con horas extra asignadas por RR.HH., responder «Acepto» o «No puedo» | Con «Acepto» quedan autorizadas; con «No puedo» RR.HH. lo ve en Horas extra | — |   |

## 13 · Celular · Pedir vacaciones y permisos

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑71 | Pedir vacaciones | Inicio › pedir vacaciones › elegir fechas › revisar la papeleta › Solicitar | La papeleta trae sus datos, los días hábiles, cuándo vuelve y el saldo después; llega a RR.HH. como Pendiente con el mismo número | RF‑ASI‑079 |   |
| QA‑ASI‑72 | Pedir un permiso o licencia | Inicio › Permiso o licencia › elegir el tipo, el día o los días (o «Unas horas») | La hoja dice si es permiso o licencia y si descuenta vacaciones; en una licencia, «Puede subirlo ahora o después, hasta 5 días» para el respaldo | — |   |
| QA‑ASI‑73 | Ver la respuesta | Después de QA‑ASI‑28, Mis solicitudes › ver la papeleta | Tiene el sello «Aprobada» con quién y cuándo; si se rechazó, el motivo | RF‑ASI‑080 |   |
| QA‑ASI‑74 | Cancelar una pendiente | Mis solicitudes › una vacación pendiente › cancelarla (con confirmación) | Pasa a «Cancelada» y los días vuelven al saldo | — |   |

## 14 · El alta del colaborador

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑75 | Paso Asistencia | Personas › Nuevo colaborador › paso «Asistencia» | Dos bloques: «Asignación de asistencia» (horario con buscador y su semana, dónde marca, otros lugares, modalidad, desde) y «Vacaciones y permisos» (4 campos); ya no están Jornada laboral, Método de marcación ni Compensación de horas | — |   |
| QA‑ASI‑76 | Se asigna al dar de alta | Completar el alta con un horario y un lugar | El colaborador aparece en Asignaciones con ese horario y en Hoy desde la fecha elegida | RF‑ASI‑055 |   |

## 15 · Cálculos

| ID | Qué se prueba | Pasos | Resultado esperado | Requisito | Resultado |
| --- | --- | --- | --- | --- | --- |
| QA‑ASI‑77 | Tardanza al segundo | Horario 08:30 con 10 min de tolerancia; marca de entrada 08:40:59 | 59 s de tardanza; a las 08:40:00 no hay tardanza | — |   |
| QA‑ASI‑78 | Lo justificado no debe horas | Un colaborador con 4 días de vacaciones aprobadas en el mes | Esos días no suman horas programadas: «Horas del mes» no dice que faltan esas horas | — |   |
| QA‑ASI‑79 | Solo cuenta en contra lo injustificado | Una tardanza con justificación aceptada | En el resumen para planillas no suma a «Tardanza injustificada» | RF‑ASI‑040 |   |
| QA‑ASI‑80 | Días trabajados | Ver «Días trabajados» un día laboral antes de la salida | No cuenta el día en curso hasta que marca la salida | — |   |
