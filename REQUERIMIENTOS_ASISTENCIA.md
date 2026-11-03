# Análisis de requerimientos — Asistencia (web)

Lo envió RR.HH. el 29 oct 2026. Es lo que el módulo de Asistencia tiene que cumplir. Base: panel de
administración del prototipo al 29 oct 2026 (sin la app del colaborador).

**27 requerimientos: 9 cumple · 8 parcial · 10 no cumple.**

Sugerencia principal: antes de sumar funciones, corregir las reglas de cálculo — descanso como franja,
marcación al segundo y hora extra solo si fue aprobada.

## 1. Horarios
| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 1 | Programar horarios estándar | Cumple | Fijo/flexible, días, entrada, salida, turno nocturno, personas por horario. | — |
| 2 | Descanso en franja (13:00–14:00) | No cumple | Solo «pausa en minutos». | Inicio y fin de descanso con tolerancia propia. |
| 3 | Horarios por día o por período | Parcial | «Cambiar horario» por persona; respeta el horario anterior en días pasados. | Horas distintas por día (ej. sábado), vigencia y asignación masiva. |

## 2. Control de marcaciones
| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 4 | Llegada tarde o anticipada | Cumple | «15 min tarde», «10 min antes», tolerancia por política; GPS, rostro y teléfono por marcación. | Unificar cálculo: Andrea figura 1 h 18 min en la lista y 1 h 8 min en su detalle. |
| 5 | Salida/retorno tarde del descanso | No cumple | Registra inicio y fin de pausa, sin evaluarlos (Andrea: 63 min sin alerta). | Estados: exceso de descanso, retorno tarde, salida anticipada a descanso. |
| 6 | Descanso no tomado | Parcial | Lo descuenta automáticamente. | Señalar «sin descanso»; regla: descontar, alertar o ambas. |
| 7 | Hora de salida y salida anticipada | Parcial | Salida, trabajado vs. programado, «Sin salida». | Estado «Salida anticipada» con minutos. |

Correcciones: «Marcación manual» y «Ajustar hora o tipo» exigen motivo y dejan la hora original tachada con su autor. Cumple.

## 3. Horas extra y compensación
Hoy todo tiempo de más cuenta como extra. Ej.: Andrea, 22-oct, 08:16–17:40 → «Extra 24 min» sin que nadie lo pidiera.

| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 8 | Marcaciones y cálculos al segundo | No cumple | Todo en HH:MM: marcaciones, ajustes (campo sin segundos) y cálculos. 08:30:01 y 08:30:59 se ven iguales. | Guardar hora del servidor con segundos, mostrar HH:MM:SS en el detalle, calcular tardanza y trabajado en segundos, regla de redondeo configurable y exportar en segundos. |
| 9 | Hora extra aprobada ≠ tiempo de más | No cumple | Extra = trabajado − programado. | Separar «tiempo fuera de horario» (informativo) de «hora extra aprobada» (pagable). |
| 10 | Solicitud de horas extra con motivo | No cumple | No existe. | Pedido del jefe o colaborador: fecha, franja, proyecto, aprobador; validar al marcar. |
| 11 | Bolsa de horas y devolución | No cumple | No existe. | Al aprobar: pagar o compensar. Devolución como solicitud que mueve la entrada esperada; vencimiento y tope. |

Caso Gustavo: el jefe pide 1 h (17:45–18:45, «Proyecto X») → Gustavo marca 18:45, se valida → +1 h a su
bolsa → pide usarla → al día siguiente entra 10:00 sin tardanza, bolsa en 0 h.

## 4. Solicitudes del colaborador y notificaciones
| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 12 | Permisos y vacaciones con motivo | Cumple | Tipo, fechas o franja, motivo, respaldo; lo aprobado justifica y descuenta saldo. | Sumar tipos: salida anticipada, trabajo fuera de sede, compensación. |
| 13 | Justificar una tardanza | No cumple | Sin campo ni tipo de solicitud. | Motivo (catálogo + texto) que el jefe acepta o rechaza. |
| 14 | Ausencias sin control manual | Cumple | Ausente se detecta solo; RR.HH. registra ausencias externas ya aprobadas. | Pedir motivo al colaborador al día siguiente. |
| 15 | Avisar al colaborador que llegó tarde | No cumple | La campana no abre nada. | Push: «Hoy llegaste 45 min tarde» + «Agregar motivo»; igual para descanso excedido. |
| 16 | El colaborador ve su acumulado | No cumple | Solo RR.HH. ve el mes («4 h 52 min en 6 días»). | Misma vista en la app: día, semana, mes y bolsa de horas. |

## 5. Modalidad presencial y remota
| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 17 | Políticas presencial, remoto, híbrido | Cumple | 4 políticas; el remoto sigue el mismo horario. | — |
| 18 | Marcar con rostro desde el teléfono | Cumple | Umbral ajustable, rechazo de GPS simulado, sin conexión, aviso de otro teléfono, intentos rechazados. | Revisar: Andrea marca con «iPhone 14» pero tiene registrado un Xiaomi, sin alerta. |
| 19 | Remoto marca desde su domicilio | Parcial | Guarda el GPS pero no bloquea. | Domicilios autorizados con geocerca; fuera de ellos, rechazo o revisión. |

## 6. Gestión del líder: bandeja, cobertura y vacaciones
| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 20 | Bandeja para resolver rápido | Cumple | Urgencia («Ya empezó», «Responder hoy»), contexto, alertas de GPS, rostro y sin horario. | Sumar horas extra, compensaciones y justificaciones. |
| 21 | Cobertura mínima (caso clínica) | Parcial | Avisa quién más falta y cuenta «Faltan ese día». | Regla «mínimo N de [cargo] en [sede/turno]» con alerta en tiempo real. |
| 22 | Calendario y vacaciones visibles | Parcial | Calendario por área con feriados; solo lo ve RR.HH. | Estado «De vacaciones hasta…» visible al equipo y aviso al iniciar. |

## 7. Reportes
| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 23 | Retraso por día, semana, mes | Parcial | Por persona, un día o rango; filtros por sucursal, unidad y cargo. | Totales y tendencia de empresa o área; selector semana/mes. |
| 24 | Áreas y días con más tardanza, cumplimiento, motivos | No cumple | No existe. | Ranking por área, % puntualidad, mapa por día de la semana, motivos (requiere #13). |

## 8. Configuración e integración con planillas
| # | Requerimiento | Estado | Hoy | Sugerencia |
|---|---|---|---|---|
| 25 | Registrar sedes | Cumple | 11 sedes con punto, radio y mapa; avisa las que no tienen cerco. | Completar las 2 de El Alto. |
| 26 | Políticas de marcaje configurables | Cumple | Lugar, rostro, tolerancia de entrada, GPS simulado, sin conexión. | Sumar tolerancia de descanso y salida, redondeo y regla de descanso no marcado. |
| 27 | Datos para planillas | Parcial | Botón «Exportar». | Cierre de período y formato fijo: días, tardanza injustificada, ausencias, extras aprobadas, compensaciones. |

## 9. Backlog priorizado
**Prioridad 1 — mínimo indispensable**
- Descanso en franja y sus estados (#2, #5, #6).
- Marcación y cálculo al segundo (#8).
- Hora extra solo si fue aprobada, con solicitud y motivo (#9, #10).
- Aviso de tardanza + motivo del colaborador (#13, #15).
- Exportación con cierre de período (#27).

**Prioridad 2 — control y visibilidad**
- Bolsa de horas y compensación (#11).
- Domicilio autorizado para remotos (#19).
- Acumulado en la app del colaborador (#16).
- Salida anticipada (#7).
- Reportes por área, día y motivo (#23, #24).

**Prioridad 3 — escalar**
- Cobertura mínima por cargo y sede (#21).
- Vacaciones visibles al equipo (#22).
- Horarios por día y con vigencia (#3).
- Corregir inconsistencias de tardanza y teléfono (#4, #18).
