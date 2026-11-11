/* CAPTURAS DEL DOCUMENTO «CASOS DE ASISTENCIA» (casos-asistencia.md → public/casos-asistencia.html).
   Toma de la maqueta, con la demo recién cargada (reloj el viernes 30 oct 2026 a las 16:10), una captura
   por pantalla de cada caso y las deja en public/assets/casos/. Cuando cambia una pantalla, se corre de nuevo:

     npm run dev                       (o la maqueta en otro puerto: URL=http://localhost:5199)
     node herramientas/capturas-casos.cjs

   Necesita la maqueta en modo desarrollo: lee las jornadas de window.__asistencia (AsistenciaContext). */
const path = require('path')
const fs = require('fs')
const { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'))

const URL = process.env.URL || 'http://localhost:5173'
const OUT = path.join(__dirname, '..', 'public', 'assets', 'casos')
fs.mkdirSync(OUT, { recursive: true })
const solo = process.argv[2] ? process.argv[2].split(',') : null
const espera = ms => new Promise(r => setTimeout(r, ms))

/* El día de una persona, abierto desde su página (Asistencia › persona › mes › un día). */
const DIAS = [
  ['02-rechazada-lejos', 1, '2026-10-06'],
  ['03-rostro', 8, '2026-10-05'],
  ['05-tolerancia', 2, '2026-10-27'],
  ['06-tarde', 1, '2026-10-15'],
  ['07-sin-salida', 2, '2026-10-10'],
  ['08-descanso-largo', 1, '2026-10-21'],
  ['09-sin-descanso', 2, '2026-10-21'],
  ['10-fuera-horario', 1, '2026-10-22'],
  ['11-anticipada', 2, '2026-10-19'],
  ['12-falta', 3, '2026-10-09'],
  ['13-vacaciones', 5, '2026-10-28'],
  ['21-extra-ventana', 1, '2026-10-07'],
]

;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1400, height: 950 }, deviceScaleFactor: 1 })
  const errores = []
  p.on('pageerror', e => errores.push(e.message))
  const quiere = k => !solo || solo.some(s => k.startsWith(s))
  const foto = async (loc, nombre) => { await loc.screenshot({ path: path.join(OUT, nombre + '.png') }); console.log('✓', nombre) }
  const modal = () => p.locator('.pl-modal').last()
  const cerrar = async () => { await p.keyboard.press('Escape'); await espera(300) }
  const intentar = async (nombre, fn) => { if (!quiere(nombre)) return; try { await fn() } catch (e) { console.log('✗', nombre, e.message.split('\n').slice(0, 3).join(' | ')) } }

  /* La demo desde cero. */
  await p.goto(URL + '/asistencia'); await espera(1500)
  await p.evaluate(async () => { const m = await import('/src/data/asistenciaData.js'); m.cargarDemoAsistencia() })
  await p.goto(URL + '/asistencia'); await espera(3000)

  /* Los datos que hacen falta para ubicar cada solicitud. */
  const datos = await p.evaluate(() => {
    const at = window.__asistencia
    const nombre = id => at.personaPorId.get(id)?.name || at.personaPorId.get(String(id))?.name
    const pend = at.solicitudes.filter(s => s.estado === 'pendiente' && s.tipo === 'correccion' && s.demoLote)
    const falta = pend.find(s => s.cambios.some(c => !c.marcaId && !c.quitar))
    const quita = pend.find(s => s.cambios.some(c => c.quitar))
    const hora = pend.find(s => s.id === 'so-lote-1-2026-10-29')
    const just = at.solicitudes.find(s => s.id === 'so-just-18-2026-10-29')
    const carlos = at.personas.find(x => /^Carlos/.test(x.name))
    const f = s => s && ({ id: s.id, nombre: nombre(s.personaId), fecha: s.fecha, motivo: s.motivo })
    return { just: f(just), falta: f(falta), quita: f(quita), hora: f(hora), carlos: carlos && { id: carlos.id, nombre: carlos.name } }
  })
  console.log(JSON.stringify(datos))

  /* ── El día, desde la página de la persona ── */
  for (const [nombre, id, fecha] of DIAS) {
    await intentar(nombre, async () => {
      await p.goto(`${URL}/asistencia/persona/${id}?mes=${fecha.slice(0, 7)}`); await espera(1200)
      const n = String(+fecha.slice(8))
      await p.locator('button.at-pv-c').filter({ has: p.locator('b', { hasText: new RegExp(`^${n}$`) }) }).first().click(); await espera(700)
      await foto(modal(), nombre)
      await cerrar()
    })
  }

  /* ── El feriado en el calendario de Hoy ── */
  await intentar('14-feriado', async () => {
    await p.goto(URL + '/asistencia'); await espera(1500)
    await p.getByRole('button', { name: 'Mes siguiente' }).first().click(); await espera(400)
    const cal = p.locator('div.sec-card').filter({ has: p.getByRole('button', { name: 'Mes anterior' }) }).first()
    await cal.getByRole('button', { name: /^2$/ }).first().click().catch(() => {})
    await espera(400)
    await foto(cal, '14-feriado')
  })

  /* ── Marcación manual (Hoy) ── */
  await intentar('18-manual', async () => {
    await p.goto(URL + '/asistencia'); await espera(1500)
    await p.getByRole('button', { name: /Marcación manual/ }).first().click(); await espera(600)
    await foto(modal(), '18-manual')
    await cerrar()
  })

  /* ── Solicitudes: abrir una fila buscando a la persona ── */
  const abrirSolicitud = async (ver, nombrePersona, fecha, motivo) => {
    await p.goto(`${URL}/asistencia/solicitudes?ver=${ver}`); await espera(1500)
    const buscar = p.locator('input[type="search"], input[placeholder*="Buscar"]').first()
    await buscar.fill(nombrePersona); await espera(600)
    let filas = p.locator('table.at-tabla-sol tbody tr')
    if (fecha) {
      const d = +fecha.slice(8)
      const conFecha = filas.filter({ hasText: new RegExp(`${d} oct`) }).filter({ hasText: motivo || '' })
      if (await conFecha.count()) filas = conFecha
    }
    await filas.first().click(); await espera(900)
  }
  for (const [nombre, ver, cual] of [
    ['15-corregir-hora', 'correcciones', datos.hora],
    ['16-marca-faltante', 'correcciones', datos.falta],
    ['17-quitar-marca', 'correcciones', datos.quita],
  ]) {
    await intentar(nombre, async () => {
      if (!cual) throw new Error('sin ejemplo en la demo')
      await abrirSolicitud(ver, cual.nombre, cual.fecha, cual.motivo)
      await foto(modal(), nombre + '-web')
      await cerrar()
    })
  }
  await intentar('20-justificar', async () => { await abrirSolicitud('justificaciones', datos.just.nombre, null); await foto(modal(), '20-justificar') ; await cerrar() })
  await intentar('22-vacaciones', async () => { await abrirSolicitud('vacaciones', 'Camila Herrera', null); await foto(modal(), '22-vacaciones'); await cerrar() })
  await intentar('23-permiso-horas', async () => { await abrirSolicitud('permisos', 'Valentina Cruz', null); await foto(modal(), '23-permiso-horas'); await cerrar() })
  await intentar('21-horas-extra', async () => {
    await p.goto(`${URL}/asistencia/solicitudes?ver=horas-extra`); await espera(1500)
    await foto(p.locator('.content-scroll').first(), '21-horas-extra-web')
  })

  /* ── Aprobar en lote ── */
  await intentar('19-lote', async () => {
    await p.goto(`${URL}/asistencia/solicitudes?ver=correcciones&lote=1`); await espera(1800)
    await p.getByRole('button', { name: /Ver su día/ }).first().click().catch(() => {}); await espera(400)
    await p.screenshot({ path: path.join(OUT, '19-lote.png') }); console.log('✓ 19-lote')
  })

  /* ── El mes de Carlos en la web (lo que firma RR.HH.) ── */
  await intentar('24-mismos-numeros', async () => {
    await p.goto(`${URL}/asistencia/persona/${datos.carlos.id}?mes=2026-09`); await espera(1500)
    await p.screenshot({ path: path.join(OUT, '24-mismos-numeros-web.png') }); console.log('✓ 24-mismos-numeros-web')
  })

  /* ── 1.2 · Horas extra, días sueltos, lugares y horarios, en la web de RR.HH. ── */
  await intentar('25-horas-extra-revisar', async () => {
    await p.goto(`${URL}/asistencia/solicitudes?ver=horas-extra`); await espera(1500)
    await p.locator('tbody tr', { hasText: 'Ana Martínez' }).filter({ hasText: 'Para sí' }).first().getByRole('button', { name: 'Revisar' }).click(); await espera(900)
    await foto(modal(), '25-horas-extra-revisar'); await cerrar()
  })
  await intentar('26-jefe', async () => {
    await p.goto(`${URL}/asistencia/solicitudes?ver=horas-extra`); await espera(1500)
    await p.locator('tbody tr', { hasText: 'Su jefe' }).first().getByRole('button', { name: 'Revisar' }).click(); await espera(900)
    await foto(modal(), '26-jefe-web'); await cerrar()
  })
  await intentar('27-solicitante-para', async () => {
    await p.goto(`${URL}/asistencia/solicitudes?ver=horas-extra`); await espera(1500)
    await foto(p.locator('.as-table-wrap').first(), '27-solicitante-para')
  })
  await intentar('28-dias-sueltos', async () => {
    /* Diego pide el lunes 26 y el miércoles 28 de octubre (días pasados, para ver el Libro después de aprobar). */
    await p.evaluate(() => window.__asistencia.crearSolicitud({ id: 'so-caso-sueltos', tipo: 'vacaciones', personaId: 1, desde: '2026-10-26', hasta: '2026-10-28', dias: ['2026-10-26', '2026-10-28'], motivo: 'Trámite familiar', papeleta: '2026-0099' }))
    await espera(600)
    await p.goto(`${URL}/asistencia/solicitudes?ver=vacaciones`); await espera(1500)
    await p.locator('input[type="search"], input[placeholder*="Buscar"]').first().fill('Diego Morales'); await espera(500)
    await p.locator('table.at-tabla-sol tbody tr', { hasText: 'lun 26 y mié 28' }).first().click(); await espera(900)
    await foto(modal(), '28-dias-sueltos-web'); await cerrar()
    await p.evaluate(() => window.__asistencia.responderSolicitud('so-caso-sueltos', 'aprobada', ''))
    await espera(600)
    await p.goto(`${URL}/asistencia/persona/1?mes=2026-10`); await espera(1500)
    await p.screenshot({ path: path.join(OUT, '28-dias-sueltos-libro.png') }); console.log('✓ 28-dias-sueltos-libro')
  })
  await intentar('30-sin-ubicacion', async () => {
    await p.goto(`${URL}/asistencia/configuracion?ver=lugares`); await espera(1800)
    await foto(p.locator('.at-arbol-lugar').first(), '30-sin-ubicacion')
    await p.getByRole('button', { name: /Ubicar en el mapa/ }).first().click(); await espera(1500)
    await foto(modal(), '30-ubicar'); await cerrar()
  })
  await intentar('31-descanso-libre', async () => {
    await p.goto(`${URL}/asistencia/configuracion?ver=horarios`); await espera(1500)
    await p.getByRole('button', { name: 'Nuevo horario' }).click(); await espera(1000)
    await p.locator('.at-hz-pau').first().click(); await espera(600)
    const campos = p.locator('.at-tdes input')
    await campos.nth(0).fill('12:30'); await campos.nth(0).press('Tab'); await espera(200)
    await campos.nth(1).fill('14:30'); await campos.nth(1).press('Tab'); await espera(300)
    await p.locator('.at-tdes-cab b').click(); await espera(400)
    await foto(p.locator('.at-tdes'), '31-descanso-libre')
    await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await espera(300)
  })

  /* ── El celular, como Carlos ── */
  const tel = p.locator('#marco-telefono')
  const comoCarlos = async () => {
    await p.goto(URL + '/inicio'); await espera(1500)
    await p.getByRole('button', { name: /Ver la demo como/ }).click(); await espera(500)
    await p.locator('button', { hasText: 'Carlos' }).first().click(); await espera(1500)
    await p.getByRole('button', { name: 'Descartar aviso' }).click().catch(() => {})
  }
  const asistenciaCel = async () => { await comoCarlos(); await p.locator('svg.lucide-layout-grid').last().locator('..').click(); await espera(900); await tel.getByText(/Mi asistencia/).first().click(); await espera(1000) }
  const inicioCel = async () => { await p.locator('svg.lucide-house').last().locator('..').click(); await espera(900) }
  if (!solo || solo.some(s => /^(01|15|21|24)/.test(s))) {
    /* En el celular, el reloj a las 08:27: Carlos marca su entrada a tiempo. */
    await p.evaluate(() => localStorage.setItem('onb_demo_at_reloj', JSON.stringify({ fecha: '2026-10-30', hora: '08:27' })))
    await comoCarlos()
    await intentar('01-marca', async () => {
      await inicioCel()
      await tel.getByRole('button', { name: /Marcar entrada/ }).first().click(); await espera(600)
      await foto(tel, '01-confirmar-cel')
      await tel.getByRole('button', { name: /Escanear rostro|Marcar ahora|Marcar igual|Continuar/ }).last().click(); await espera(5000)
      await foto(tel, '01-listo-cel')
      await tel.getByRole('button', { name: /Volver al inicio|Listo|Cerrar/ }).first().click().catch(() => {}); await espera(600)
    })
    await intentar('15-corregir-hora', async () => {
      await asistenciaCel()
      await tel.locator('svg.lucide-plus').first().locator('..').click(); await espera(500)
      await tel.getByText('Corregir una marcación').click(); await espera(800)
      await foto(tel, '15-corregir-cel')
    })
    await intentar('21-horas-extra', async () => {
      await asistenciaCel()
      await tel.locator('svg.lucide-plus').first().locator('..').click(); await espera(500)
      await tel.getByText('Pedir horas extra').click(); await espera(800)
      await foto(tel, '21-horas-extra-cel')
    })
    await intentar('24-mismos-numeros', async () => {
      await asistenciaCel()
      await tel.getByText('Ver el mes →').click(); await espera(900)
      /* Septiembre: un mes cerrado, para que la web y el celular cuenten los mismos días. */
      await tel.locator('button:has(svg.lucide-chevron-left)').nth(1).click(); await espera(700)
      await foto(tel, '24-mismos-numeros-cel')
    })
  }
  /* La web de Carlos después de entrar como él: su historial de ejemplo (vacaciones, solicitudes) se
     siembra la primera vez que se usa la demo como Carlos, y así la web y el celular parten de lo mismo. */
  await intentar('24-mismos-numeros', async () => {
    await p.goto(URL + '/inicio'); await espera(1200)
    await p.getByRole('button', { name: /Ver la demo como/ }).click(); await espera(500)
    await p.locator('button', { hasText: 'Juan' }).first().click(); await espera(1500)
    await p.goto(`${URL}/asistencia/persona/${datos.carlos.id}?mes=2026-09`); await espera(1500)
    await p.screenshot({ path: path.join(OUT, '24-mismos-numeros-web.png') }); console.log('✓ 24-mismos-numeros-web (después del celular)')
  })
  /* ── 1.2 · En el celular: días sueltos (Carlos) y el jefe que pide para su equipo (Ana, líder) ── */
  if (!solo || solo.some(s => /^(26|28|29)/.test(s))) {
    await p.evaluate(() => localStorage.setItem('onb_demo_at_reloj', JSON.stringify({ fecha: '2026-10-30', hora: '16:10' })))
    const nuevaCel = async () => {
      await p.locator('svg.lucide-layout-grid').last().locator('..').click(); await espera(800)
      await tel.getByText('Mis solicitudes').first().click(); await espera(800)
      await tel.locator('button:has(svg.lucide-plus)').first().click(); await espera(700)
    }
    const tocarDias = async lista => { for (const d of lista) { await tel.locator(`[data-dia="${d}"]`).click(); await espera(250) } }
    await intentar('29-permiso', async () => {
      await comoCarlos(); await nuevaCel()
      await tel.getByText('Permiso o licencia', { exact: true }).click(); await espera(700)
      await tel.locator('button').filter({ hasText: /Trámite/ }).first().click(); await espera(700)
      /* El permiso abre en el mes de hoy (octubre en la demo): a noviembre. */
      if (!(await tel.locator('[data-dia="2026-11-11"]').count())) { await tel.getByRole('button', { name: 'Mes siguiente' }).click(); await espera(500) }
      await tocarDias(['2026-11-11', '2026-11-16', '2026-11-17', '2026-11-16'])
      await foto(tel, '29-permiso-cel')
    })
    await intentar('28-dias-sueltos', async () => {
      await comoCarlos(); await nuevaCel()
      await tel.getByText('Vacación', { exact: true }).first().click(); await espera(900)
      await tocarDias(['2026-11-11', '2026-11-16', '2026-11-17'])
      await foto(tel, '28-dias-sueltos-cel')
      await tel.getByRole('button', { name: 'Continuar' }).click(); await espera(800)
      await foto(tel, '28-dias-sueltos-papeleta')
    })
    await intentar('26-jefe', async () => {
      await p.goto(URL + '/inicio'); await espera(1500)
      await p.getByRole('button', { name: /Ver la demo como/ }).click(); await espera(500)
      await p.locator('button', { hasText: 'Líder de Área Mobile' }).first().click(); await espera(1800)
      await p.getByRole('button', { name: 'Descartar aviso' }).click({ timeout: 1500 }).catch(() => {})
      await p.locator('svg.lucide-layout-grid').last().locator('..').click(); await espera(900)
      await tel.getByText(/Mi asistencia/).first().click(); await espera(1000)
      await tel.getByRole('button', { name: 'Pedir algo' }).click(); await espera(500)
      await foto(tel, '26-jefe-mas')
      await tel.getByText('Pedir horas extra para mi equipo').click(); await espera(800)
      await tel.getByRole('button', { name: /Natalia/ }).click(); await tel.getByRole('button', { name: /Bruno/ }).click(); await espera(300)
      await foto(tel, '26-jefe-cel')
    })
  }
  /* ── 9 · El rostro y el horario (1.3, 11 nov 2026): a las 08:27, antes de su entrada. ── */
  if (!solo || solo.some(s => /^3[2-5]/.test(s))) {
    await p.evaluate(() => localStorage.setItem('onb_demo_at_reloj', JSON.stringify({ fecha: '2026-10-30', hora: '08:27' })))
    const asignaciones = async () => { await p.goto(URL + '/asistencia/configuracion?ver=asignaciones'); await espera(2000) }
    await intentar('35-seleccion', async () => {
      await asignaciones()
      const casillas = p.locator('tbody input[type=checkbox]')
      for (let i = 0; i < 4; i++) await casillas.nth(i).check()
      await espera(400)
      await foto(p, '35-seleccion')
    })
    await intentar('33-rostro-borrado', async () => {
      await asignaciones()
      await p.getByPlaceholder('Buscar colaborador…').fill('carlo'); await espera(600)
      await p.locator('tr', { hasText: 'Carlos Mendoza' }).locator('button').last().click(); await espera(400)
      await p.getByText('Pedir que registre su rostro de nuevo').click(); await espera(400)
      await p.locator('input').last().fill('BORRAR'); await espera(200)
      await p.getByRole('button', { name: 'Borrar su rostro' }).click(); await espera(600)
      await p.locator('tr', { hasText: 'Carlos Mendoza' }).locator('button').last().click(); await espera(400)
      await foto(p, '33-asignaciones')
      await p.keyboard.press('Escape')
      await comoCarlos(); await inicioCel()
      await foto(tel, '33-inicio-cel')
      await tel.getByText('Registre su rostro de nuevo').click(); await espera(600)
      await foto(tel, '33-ventana-cel')
    })
    await intentar('32-registro', async () => {
      /* Sigue de la ventana del caso 33: «Registrar mi rostro» abre las tres tomas (2,4 s cada una). */
      await tel.getByRole('button', { name: /Registrar mi rostro/ }).click(); await espera(900)
      await foto(tel, '32-registro-derecha')
      await espera(2400); await foto(tel, '32-registro-izquierda')
      await espera(5600); await foto(tel, '32-registrado')
    })
    await intentar('34-sin-horario', async () => {
      await comoCarlos()
      await p.evaluate(() => { const at = window.__asistencia; at.quitarAsignacion([at.yo.id]) }); await espera(600)
      await inicioCel()
      await foto(tel, '34-sin-horario-cel')
    })
  }
  console.log('errores de la página:', errores.length ? errores : 'ninguno')
  await b.close()
})()
