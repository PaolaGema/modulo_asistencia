# Asistencia y reconocimiento facial: arquitectura

Mapa del módulo de control de asistencia de COCOA: cómo marca un colaborador (con GPS y reconocimiento facial), cómo se calcula su jornada y su saldo, cómo lo administra RRHH desde el panel y cómo encaja el trabajo remoto.

> **Estado**: refleja el código al 2026-10-09. Se actualiza en el mismo archivo (es la regla del repo para docs canónicos).
>
> **Repos involucrados**
>
> - `cocoa-core-backend`: `functions/src/modules/asistencia/`
> - `cocoa_v2` (app Flutter): `lib/services`, `lib/providers` y `lib/screens/trabajo`
> - `cocoa-core-next` (panel): `src/features/asistencia/`
>
> **Specs**: `openspec/specs/asistencia-horario-flexible/` y `openspec/specs/asistencia-asignacion-lote/`.

---

## 1. Idea central

**El dispositivo captura, el servidor decide.**

| Responsabilidad                                                                                              | Dónde vive                        |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| Cámara, detección de rostro, calidad, parpadeo y embedding (FaceNet-512)                                     | App móvil, en el dispositivo      |
| GPS                                                                                                          | App móvil                         |
| Geocerca (haversine), comparación facial (coseno), detección de replay, persistencia y cálculo de la jornada | Backend (`asistencia.service.ts`) |
| Configuración (sedes, horarios, políticas, asignaciones), ajustes y nómina                                   | Panel web, que llama a la API web |

El servidor **nunca** recibe una imagen para comparar. Recibe un vector de 512 floats y una selfie reducida que se guarda solo como evidencia de auditoría. Los campos que deciden si una marcación es válida (`distancia_m`, `dentro_geocerca`, `face_score`, `face_ok`) se calculan siempre en el backend.

---

## 2. Arquitectura del backend

```
routes (web | mobile)  →  controller  →  AsistenciaService  →  AsistenciaRepository  →  Firestore
                                             │                                       →  Cloud Storage (selfies)
                                             ├─ asistencia.calc.ts      (funciones puras)
                                             ├─ asistencia.factory.ts   (builders de entidades + ids)
                                             ├─ asistencia.schemas.ts   (zod)
                                             ├─ asistencia.errors.ts    (errores con `code` estable)
                                             └─ puertos de otros módulos:
                                                  ShiftPlanUsagePort            (turnos)
                                                  ApprovedAbsenceCoveragePort   (vacaciones)
                                                  GeoCatalogPort                (solo web)
```

| Pieza                                                                | Rol                                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `web/company-asistencia.routes.ts`, `mobile/me-asistencia.routes.ts` | Cada router construye el service a mano y le inyecta los puertos. No hay contenedor de DI.                                      |
| Controllers                                                          | Capa fina: validan con zod y serializan (`sendMobileOk` en mobile, `res.json({data})` en web).                                  |
| `asistencia.service.ts`                                              | Toda la lógica de negocio: marcar, enrolar, consentimiento, recálculo, saldo, métricas y asignación por lote.                   |
| `asistencia.repository.ts`                                           | Firestore Admin SDK. Las transacciones solo cubren invariantes de asignación y de política default, y el ajuste de marcaciones. |
| `asistencia.calc.ts`                                                 | Funciones puras: haversine, similitud coseno, `recomputeJornada` y helpers de fecha de La Paz.                                  |
| `asistencia.geo-refs.ts`                                             | Valida `key_region` y `key_city` de una sede contra el catálogo global. **No** es la geocerca.                                  |
| `asistencia.google-maps.ts`                                          | Parser puro que saca lat/lng de una URL de Google Maps al crear una sede. No hace llamadas de red.                              |
| `asistencia.readiness.ts`                                            | Chequeo de configuración: `no_sede`, `no_horario`, `no_politica_marcaje` y `facial_consent_pending`.                            |

**Gates de acceso**

- **Mobile:** `requireB2bProgram()` y `requireHrModule('company.asistencia')`. El worker se toma del uid de la sesión.
- **Web:** `authorize([company.asistencia.read|write])`, `requireWorkerSegment()` y `requireHrModule`. El programa siempre sale de la sesión, nunca del payload.

### Endpoints

**Mobile:** `/mobile/me/asistencia`

| Método    | Ruta                  | Uso                                                                                                  |
| --------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| GET       | `/today`              | Snapshot del día: asignación, horario, jornada, marcaciones, `modo` y flags efectivos de la política |
| POST      | `/marcar`             | Entrada, salida o pausa                                                                              |
| POST      | `/enrolar-rostro`     | Autoenrolamiento                                                                                     |
| GET, POST | `/consentimiento`     | Leer o aceptar el consentimiento biométrico                                                          |
| GET       | `/saldo-mensual?mes=` | Saldo mensual                                                                                        |
| GET       | `/jornadas/:fecha`    | Jornada de un día                                                                                    |

**Web:** `/web/company/me/asistencia`

- **CRUD:** `sedes`, `horarios`, `politicas` y `asignaciones`. `asignaciones/bulk` acepta hasta 200 workers.
- **Biometría:** `biometria` devuelve el estado de enrolamiento, sin embeddings.
- **Marcación manual:** `workers/:w/marcar` (con `origen: panel`).
- **Ajuste:** `marcaciones/:key/ajustar`.
- **Consultas:** jornadas por fecha y por worker, `metricas`, y marcaciones con selfie (URL firmada válida por 15 minutos).
- **Nómina:** `workers/:w/saldo/:periodo/calcular`.

---

## 3. Modelo de datos (Firestore)

| Colección                       | Doc id                          | Campos clave                                                                                                                                                         |
| ------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `asistencia_sede`               | `sede_<nanoid>`                 | `geo_lat`, `geo_lng`, `radio_geocerca_m` (por defecto 150), `google_maps_url`, `key_region`, `key_city`                                                              |
| `asistencia_horario`            | `horario_<nanoid>`              | `modo` (`fijo`/`flexible`), `dias_semana` (ISO), `hora_entrada`, `hora_salida`, `minutos_pausa`, `minutos_programados`, `cruza_medianoche`                           |
| `asistencia_politica_marcaje`   | `politica_<nanoid>`             | `face_required`, `geocerca_required`, `face_threshold`, `radio_geocerca_m`, `tolerancia_min` (10), `es_default`                                                      |
| `asistencia_asignacion_horario` | `asignacion_<nanoid>`           | `key_worker`, `key_horario`, `key_sede`, `key_politica`, `vigencia_desde`, `vigencia_hasta` (epoch en segundos)                                                      |
| `asistencia_empleado_biometria` | `{programa}_{worker}`           | `embedding` (512 floats), `selfie_url`, `modelo: 'arcface-512'` (ver riesgo B5)                                                                                      |
| `asistencia_consentimiento`     | `{programa}_{worker}`           | `version` (`2026-08-v1`), `accepted_at`                                                                                                                              |
| `asistencia_marcacion`          | `marcacion_<nanoid>`            | `tipo`, `marcado_at` (ms), geo, `distancia_m`, `dentro_geocerca`, `face_score`, `face_ok`, `face_embedding_hash`, `selfie_url`, `origen`, `ajustada*`, `key_jornada` |
| `asistencia_jornada`            | `{programa}_{worker}_{fecha}`   | `estado`, `minutos_*`, `entrada_at`, `salida_at`, `dim_keys`                                                                                                         |
| `asistencia_saldo`              | `{programa}_{worker}_{periodo}` | `minutos_*`, `dias_ausente`, `monto_cents`                                                                                                                           |

- La regla de **una asignación abierta por worker** y la de **una política default por programa** se garantizan con transacciones, porque Firestore no tiene claves únicas.
- Los clientes no acceden directo a Firestore (`firestore.rules` niega todo); todo pasa por la API.
- Las selfies se guardan en `gs://…/asistencia/{programa}/enrolamiento/{worker}.jpg` y en `…/marcaciones/{uuid}.jpg`.

---

## 4. Reconocimiento facial en la app (`cocoa_v2`)

### Pipeline de captura

```
camera (frontal, veryHigh)
  ├─ stream (1 frame cada 200 ms) → ML Kit `fast` → calidad + parpadeo → guía en UI / auto-disparo
  └─ takePicture() (foto final)
        → bakeOrientation → máx. 1440 px
        → ML Kit `accurate` (si falla, reintenta con `fast`)
        → recorte: caja + 30 % de margen → 160×160
        → FaceNet-512 (tflite, IsolateInterpreter), entrada (px−128)/128
        → embedding de 512 floats con normalización L2
        → selfie de auditoría de 480 px, JPEG q80
        → borrar los archivos temporales
```

### Gates de calidad (`calidad_rostro.dart`)

| Gate                                              | Enrolar (estricto) | Marcar (permisivo) |
| ------------------------------------------------- | ------------------ | ------------------ |
| Ancho del rostro / ancho de imagen                | ≥ 0.30             | ≥ 0.18             |
| Giro horizontal (yaw)                             | ≤ 12°              | ≤ 25°              |
| Inclinación lateral (roll)                        | ≤ 12°              | ≤ 25°              |
| Ojos abiertos (se rechaza si ambos quedan debajo) | 0.60               | 0.35               |
| Nitidez (varianza Laplaciana)                     | ≥ 80               | ≥ 25               |
| Frames estables antes del auto-disparo            | 10                 | 6                  |

Además, se rechaza la captura si hay 0 rostros, o si hay más de uno (cuenta como rostro cualquiera con al menos el 40 % del área del principal). No hay gate de brillo ni de inclinación vertical (pitch), y el umbral de nitidez está marcado como _provisorio_.

### Prueba de vida (`deteccion_parpadeo.dart`)

- Hay un solo desafío: **un parpadeo** (ojos abiertos > 0.7, cerrados < 0.25, abiertos otra vez), con 4 segundos por fase y solo sobre el stream.
- Si el dispositivo no reporta probabilidad de ojos durante 6 segundos, **el gate se libera**.
- No hay desafío de giro de cabeza, ni chequeo de consistencia entre frames, ni prueba de vida del lado del servidor.

### Enrolamiento

1. Consentimiento versionado (`2026-08-v1`), presentado como hoja.
2. Una sola captura en modo estricto.
3. `POST /enrolar-rostro`.
4. El backend sube la selfie a una ruta fija y hace upsert de la biometría con `merge:false`.

Volver a enrolar **reemplaza** el template anterior, sin historial. `face_id_step_screen.dart` (registro) **no** es enrolamiento facial: es `local_auth` para el login rápido.

---

## 5. Flujo de una marcación

```
App                                              Backend  (AsistenciaService.marcar)
───                                              ───────────────────────────────────
1. Bloqueo contra doble toque
2. GET /today (la política puede haber cambiado)
3. Permiso y GPS de alta precisión
4. POST /marcar {tipo, lat, lng}  ───────────►  a. Hora del servidor (mobile nunca manda la hora)
                                                b. Asignación vigente → horario
                                                c. Política: la de la asignación → la default
                                                   → si no hay, todo obligatorio (fail-closed)
                                                d. Geocerca (si corresponde, ver tabla)
                                                e. ¿Requiere rostro y no vino? → SELFIE_REQUERIDA
            ◄──────────────────── 422 SELFIE_REQUERIDA
5. Cámara (modo marcar) → embedding + selfie
6. POST /marcar {…, face_embedding, selfie_base64} ►
                                                f. ¿No hay biometría? → ROSTRO_NO_ENROLADO
                                                   (la app enrola y reintenta con la misma captura)
                                                g. SHA-256 del embedding repetido → EMBEDDING_REPLAY_DETECTED
                                                h. coseno ≥ (politica.face_threshold ?? 0.78)
                                                   → si no, ROSTRO_NO_COINCIDE
                                                i. Subir selfie a Storage
                                                j. Crear marcación (campos de confianza del servidor)
                                                k. recomputeAndPersistJornada → vincular key_jornada
            ◄──────────────────── 200 {marcación, jornada}
```

### ¿Se exige geocerca? (`service.ts:657`)

```ts
geocercaRequired = !manual && !esFlexible(horario) && (politica?.geocerca_required ?? true);
```

| Caso                                                 | Geocerca                                         | Rostro                                  |
| ---------------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| Horario fijo con política por defecto                | Sí                                               | Sí                                      |
| Horario fijo con política `geocerca_required: false` | No (el GPS queda guardado como dato informativo) | Según `face_required`                   |
| Horario **flexible**                                 | **Nunca**, sin importar la política              | Según `face_required` (por defecto, sí) |
| Marcación manual desde el panel                      | No                                               | Según la política                       |

- El radio efectivo es `politica.radio_geocerca_m ?? sede.radio_geocerca_m`.
- Errores posibles: `SIN_ASIGNACION`, `SEDE_NO_CONFIGURADA`, `UBICACION_REQUERIDA` y `FUERA_DE_GEOCERCA` (este último incluye la distancia y el radio).

---

## 6. Cálculo de la jornada (`asistencia.calc.ts → recomputeJornada`)

Se recalcula **solo** cuando hay una marcación o un ajuste. No hay un scheduler que genere las jornadas en estado `ausente`.

1. **Entrada:** la primera `entrada` del día local. **Salida:** la última `salida`.
2. **Pausas:** cada `pausa_inicio[i]` se empareja con `pausa_fin[i]` por posición; las que sobran se descartan.
3. **Trabajado:** salida − entrada − pausas (0 si falta alguna de las dos).
4. **Programado:** `minutos_programados`, solo si el día está en `dias_semana`. En horario flexible vale siempre 0.
5. **Tardanza:** entrada local − (`hora_entrada` + `tolerancia_min`), con mínimo 0. No se calcula en horario flexible ni en días no programados.
6. **Estado:** se aplica el primero que se cumpla.

| Condición                  | Estado       |
| -------------------------- | ------------ |
| Sin entrada                | `ausente`    |
| Sin salida                 | `incompleta` |
| Tardanza > 0               | `tarde`      |
| Trabajado > programado > 0 | `extra`      |
| Otro caso                  | `presente`   |

### Integraciones

- **Vacaciones y ausencias aprobadas:** se proyectan al leer y no escriben jornada. Justifican el día solo si la jornada está ausente o no existe.
- **Turnos:** impiden borrar un horario que esté en uso (`ShiftPlanUsagePort`).
- **Asignación por lote:** resuelve horario, sede y política una sola vez y recorre los workers **en secuencia** (hasta 200). Con `reemplazar_vigente`, cierra la asignación anterior y abre la nueva en una sola transacción.
- **Saldo de nómina** (`calcularSaldo`): agrega las jornadas del período y calcula `monto_cents`.

---

## 7. Panel web (`cocoa-core-next`)

Pestañas: **sedes · horarios · políticas · asignaciones · marcaciones** (individual, general y dashboard) **· biometría**.

| Capacidad               | Notas                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| CRUD de configuración   | `canWrite` se toma de `company.asistencia.write`                                                               |
| Asignación por lote     | Hasta 200 workers                                                                                              |
| Timeline de marcaciones | Selfie, distancia, geocerca y score facial                                                                     |
| Ajuste de marcación     | Motivo obligatorio                                                                                             |
| Marcación manual        | Pensada para una política sin geocerca ni rostro; **no pide motivo**                                           |
| Biometría               | Solo lectura: el panel no puede iniciar un enrolamiento (`enrolarRostro` del service quedó como código muerto) |
| Exportación             | CSV diario y `.xlsx` de métricas, ambos generados en el navegador                                              |

---

## 8. Tests

| Capa                 | Qué hay                                                                                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend, unitarios   | `asistencia.service.test.ts` (2333 líneas: geocerca, modo flexible, umbral facial, consentimiento, saldo, ausencias, lote), además de calc, factory, schemas, geo-refs, google-maps, repository, readiness y los tests de rutas y HR gate de web y mobile |
| Backend, integración | `asistencia.repository.integration.test.ts`: 9 tests sobre el emulador de Firestore, todos secuenciales. Corre con `npm run test:integration`, que no forma parte del `test` por defecto                                                                  |
| Mobile               | `asistencia_provider_test` (incluye el bloqueo de doble marcación), `deteccion_parpadeo_test`, modelos y algunos widget tests. Los de `asistencia_flow_guard_test` solo buscan strings en el código fuente                                                |
| Web                  | Vitest de formato, maps y errores, y un E2E de Playwright con un solo test                                                                                                                                                                                |

**Sin cobertura:**

- **Pruebas de carga, estrés o concurrencia:** no hay ninguna en los tres repos. Se buscaron k6, artillery, locust, autocannon, vegeta, gatling, benchmark y tests de carrera.
- **Pipeline facial:** no se testean `calidad_rostro`, `recorte_rostro` ni `face_recognition_service`.
- **Calibración del umbral:** no hay mediciones de FAR/FRR que respalden el 0.78.

---

## 9. Trabajo remoto

### Lo que ya funciona hoy

| Perfil remoto                                                     | Configuración                                                                    | Qué se controla                           | Qué se pierde                                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| **Remoto con horario fijo** (por ejemplo, de 9 a 18 desde casa)   | Horario `fijo` + política con `geocerca_required: false` y `face_required: true` | Rostro, tardanza, horas extra y ausencia  | Ubicación (el GPS se guarda pero no bloquea)                                    |
| **Remoto sin horario** (comercial, chofer, freelance interno)     | Horario `flexible` con `dias_semana` = días esperados                            | Rostro y ausencia en los días esperados   | Tardanza, horas extra y ubicación                                               |
| **Remoto desde un lugar fijo declarado** (home office registrado) | Una sede por domicilio con su radio, asignada al worker                          | Rostro, ubicación, tardanza y horas extra | Hay que dar de alta una sede por persona y la dirección queda guardada como PII |
| **Híbrido**                                                       | Hoy no es posible: hay una sola asignación activa por worker                     | —                                         | Ver propuesta R3                                                                |

> Recomendación por defecto: **remoto con horario fijo**. Mantiene el rostro como prueba de "quién" y el horario como prueba de "cuándo", sin pedirle a la empresa que registre domicilios.

### Brechas para operar remoto a escala (propuestas, no implementadas)

| #   | Brecha                                                                 | Por qué afecta más en remoto                                                                                                      | Propuesta                                                                                                                               |
| --- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Zona horaria fija UTC−4** (`calc.ts:6`, `shared/time/la-paz.ts`)     | Un remoto en otro país registra mal la fecha, la tardanza y las horas extra                                                       | Agregar `timezone` (IANA) en el programa o en la asignación y usarlo en `recomputeJornada` y en los rangos por día                      |
| R2  | **Prueba de vida débil** (un parpadeo, que además se libera a los 6 s) | Sin supervisión física, la cara es el único control y es fácil de engañar con un video o con otra persona sosteniendo el teléfono | Desafío aleatorio (giro de cabeza o parpadeo doble), atar la prueba de vida a la foto final y evaluar un SDK de PAD (iBeta nivel 1 o 2) |
| R3  | **No hay modo híbrido**                                                | Hay días en oficina (con geocerca) y días en casa (sin geocerca)                                                                  | Una política por día de la semana, o permitir varias sedes por asignación, incluida una "remota"                                        |
| R4  | **GPS falsificable** (no se usa `isMocked` ni atestación)              | Si la geocerca de home office importa, es trivial mentirla                                                                        | Rechazar o marcar las posiciones mock y sumar Play Integrity / App Attest                                                               |
| R5  | **Sin vínculo con el dispositivo**                                     | Un compañero puede marcar desde otro teléfono con la sesión del worker                                                            | Registrar `device_id` en el enrolamiento y alertar cuando cambia                                                                        |
| R6  | **Sin modo offline**                                                   | La conexión desde casa o en ruta es inestable y se pierde la marcación                                                            | Cola local firmada con la hora del dispositivo y un margen de tolerancia que valide el servidor                                         |
| R7  | **Las marcaciones manuales no piden motivo**                           | En remoto se corrige más a mano                                                                                                   | Exigir motivo, igual que en los ajustes                                                                                                 |

---

## 10. Riesgos verificados

### Integridad y concurrencia

| #   | Riesgo                                                                                                                                                                                            | Evidencia                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| C1  | **Sin idempotencia.** No hay `idempotency_key` ni validación de secuencia (se acepta una entrada doble o una salida sin entrada). Un reintento después de un timeout de 30 s duplica la marcación | `service.ts:747-764`     |
| C2  | **Recálculo sin transacción.** Dos marcaciones simultáneas pueden dejar la jornada desactualizada                                                                                                 | `service.ts:1244-1292`   |
| C3  | **Tres escrituras no atómicas** (marcación, jornada, vínculo). Un fallo a mitad de camino deja `key_jornada: null`                                                                                | `service.ts:764-771`     |
| C4  | Si algo falla después de subir la selfie, el archivo queda huérfano                                                                                                                               | `service.ts:743` y `764` |
| C5  | `ajustarMarcacion` no valida el rango de fechas ni recalcula el día original cuando cambia la fecha                                                                                               | `service.ts:793-796`     |

### Biometría

| #   | Riesgo                                                                                                                                                                    | Evidencia                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| B1  | El embedding se calcula en el cliente y el servidor no verifica que la selfie corresponda al vector. Un cliente modificado puede mandar cualquier vector                  | `calc.ts:34-39`                                       |
| B2  | El check de replay solo compara el hash exacto; cualquier mínima alteración del vector lo esquiva. Además es check-then-act, así que no protege contra requests paralelos | `service.ts:719-727`                                  |
| B3  | No hay rate limit ni bloqueo por intentos fallidos. El error `ROSTRO_NO_COINCIDE` expone el score, lo que sirve de oráculo para un atacante                               | `errors.ts:106-110`                                   |
| B4  | `face_threshold: 0` se acepta (el schema permite 0 a 1) y apaga el match en la práctica                                                                                   | `schemas.ts:78`                                       |
| B5  | Se guarda `modelo: 'arcface-512'`, pero la app usa **FaceNet-512**. El umbral de 0.78 no está calibrado                                                                   | `factory.ts:205-222`, `face_recognition_service.dart` |
| B6  | Volver a enrolarse desde mobile reemplaza la biometría sin aprobación de un admin ni historial                                                                            | `me-asistencia.routes.ts:107-117`                     |
| B7  | El enrolamiento usa un solo frame, sin promediar. Una mala referencia empeora todos los match posteriores                                                                 | `calidad_rostro.dart:30-33`                           |

### Cálculo

| #   | Riesgo                                                                                                                                           | Evidencia                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| K1  | `cruza_medianoche` se guarda pero **se ignora**: un turno nocturno termina en dos jornadas, `incompleta` y `ausente`                             | `calc.ts:120-197`                  |
| K2  | No hay un job que genere las jornadas `ausente`: el saldo cuenta solo las que existen, mientras que las métricas reconstruyen los días faltantes | `service.ts:1211-1217` y `853-871` |

### Privacidad y operación

| #   | Riesgo                                                                                                                                                                                                                                | Evidencia                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| P1  | En la pantalla de enrolamiento, el título dice "La original queda en tu teléfono", pero en realidad la original se borra y se envía una selfie reducida. El consentimiento no menciona que **cada marcación** también sube una selfie | `enrolar_rostro_screen.dart:147-149`, `consentimiento_sheet.dart` |
| P2  | No hay retención ni expiración de selfies (el propio código lo marca como pendiente)                                                                                                                                                  | `service.ts:99-105`                                               |
| P3  | El CSV exportado no neutraliza `= + - @`, así que se puede inyectar una fórmula en la planilla                                                                                                                                        | `cocoa-core-next: lib/asistencia-export.ts:9-16`                  |
| P4  | El body JSON acepta hasta 10 MB y `selfie_base64` no tiene un tope propio                                                                                                                                                             | `index.ts:95`                                                     |
| P5  | Cada marcación hace varias lecturas secuenciales, y `findVigentAsignacion` trae todas las asignaciones del worker para filtrarlas en memoria. Nunca se midió con carga                                                                | `repository.ts:329-343`                                           |

---

## 11. Próximos pasos sugeridos

1. **Prueba de carga** (k6 contra el emulador o staging): 500 marcaciones en 5 minutos sobre el mismo programa, más ráfagas de dos marcaciones del mismo worker. Así se miden C1, C2 y P5.
2. **Idempotencia:** `idempotency_key` generada por el cliente y recálculo dentro de una transacción.
3. **Calibrar el umbral facial** con un dataset interno (FAR/FRR) y corregir el campo `modelo`.
4. **Zona horaria por programa** (R1). Es el bloqueante para tener remotos fuera de Bolivia.
5. **Fortalecer la prueba de vida** (R2) antes de escalar el trabajo remoto.
