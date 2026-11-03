/* ── EL DOCUMENTO DE UN MÓDULO, DEL MD AL HTML ──────────────────────────────
   El Markdown es la fuente: se escribe ahí y este script arma la página con la misma plantilla
   que el documento de Onboarding (sus estilos, su índice lateral, su buscador y su tema).
   Así la página y el .md dicen siempre lo mismo.

   Uso:  node herramientas/doc-modulo.cjs modulo-documentacion.md public/modulo-documentacion.html

   CONVENCIONES DEL MD (las mismas de modulo-onboarding.md):
   · línea 1: la ceja; «# Título»; un «> …» de presentación (sólo para el MD); «## Índice»
     (se ignora); un párrafo que es la bajada; la ficha («- **Versión:** …») y la tabla de cifras.
   · «## 00 · Glosario» abre una sección; la primera línea en *cursiva* es su descripción.
   · «### Para X» es el rótulo de un perfil; el párrafo que lo sigue, su descripción.
   · «### 3.1 Título» es un subtítulo numerado (id p3-1).
   · En Reglas de negocio: «### Grupo» + «*qué agrupa*» y cada regla como
     «#### 4.1 · BR-DOC-001 · Título» con sus cuatro apartados en negrita.
   · «> **En la maqueta:** …» es una nota ámbar; otro «> …», una nota azul.
   · En los anexos: «#### Título» (por qué decidimos así) y «### Título» (el prototipo). */
const fs = require('fs')
const path = require('path')

const [, , mdPath, outPath] = process.argv
const raiz = path.resolve(__dirname, '..')
const md = fs.readFileSync(path.resolve(raiz, mdPath), 'utf8').replace(/\r\n/g, '\n')
const plantilla = fs.readFileSync(path.join(raiz, 'public/onboarding.html'), 'utf8').replace(/\r\n/g, '\n')

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[«»"'¿?¡!.,:;()·/]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
const idDe = s => s.replace(/‑/g, '-')
/* Negrita, cursiva, código y enlaces. El código se protege primero. */
function inline(t) {
  const codigos = []
  let s = esc(t).replace(/`([^`]+)`/g, (_, c) => { codigos.push(c); return `\u0000${codigos.length - 1}\u0000` })
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codigos[i]}</code>`)
}
const CODIGO = /^(RF|HU|W|ABIERTA|BR)[‑-][A-Z]+[‑-][\w‑-]+$/

/* ── Cabecera: ceja, título, bajada, ficha y cifras ── */
const lineas = md.split('\n')
const ceja = lineas[0].trim()
const titulo = (lineas.find(l => l.startsWith('# ')) || '# Módulo').slice(2).trim()
const inicioSecciones = lineas.findIndex(l => /^## (\d\d|Cómo|Historial|Anexo)/.test(l))
const cabeza = lineas.slice(0, inicioSecciones)
let bajada = ''
const ficha = []
const cifras = []
let pasadoIndice = false
for (const l of cabeza) {
  if (l.startsWith('## Índice')) { pasadoIndice = true; continue }
  if (!pasadoIndice) continue
  const f = l.match(/^- \*\*([^*]+):\*\* (.+)$/)
  if (f) { ficha.push([f[1], f[2]]); continue }
  const c = l.match(/^\| ([^|]+) \| (\d+) \|$/)
  if (c) { cifras.push([c[2], c[1].trim()]); continue }
  if (l.trim() && !l.startsWith('- [') && !l.startsWith('|') && !bajada) bajada = l.trim()
}

/* ── Las secciones ── */
const secciones = []
let actual = null
for (const l of lineas.slice(inicioSecciones)) {
  if (l.startsWith('## ')) { actual = { titulo: l.slice(3).trim(), lineas: [] }; secciones.push(actual); continue }
  if (actual) actual.lineas.push(l)
}

function datosSeccion(t) {
  const m = t.match(/^(\d\d) · (.+)$/)
  if (m) return { id: `s${Number(m[1])}`, n: m[1], nombre: m[2], num: Number(m[1]) }
  if (t.startsWith('Anexo · Por qué')) return { id: 'ax1', n: '+', nombre: t, ax: 1 }
  if (t.startsWith('Anexo')) return { id: 'ax2', n: '+', nombre: t, ax: 2 }
  return { id: slug(t), n: '+', nombre: t }
}

function tabla(filas) {
  const celdas = filas.map(f => f.replace(/^\||\|$/g, '').split('|').map(c => c.trim()))
  const [cab, , ...cuerpo] = celdas
  const th = cab.map(c => `<th>${inline(c)}</th>`).join('')
  const tr = cuerpo.map(r => `<tr>${r.map((c, i) => (i === 0 && CODIGO.test(c) ? `<td class="id" id="${idDe(c)}">${esc(c)}</td>` : `<td>${inline(c)}</td>`)).join('')}</tr>`).join('\n')
  return `<div class="tbl"><table>\n<thead><tr>${th}</tr></thead>\n<tbody>\n${tr}\n</tbody>\n</table></div>`
}

/* Convierte bloques simples: párrafos, listas, tablas y notas. */
function bloques(ls) {
  const out = []
  let i = 0
  while (i < ls.length) {
    const l = ls[i]
    if (!l.trim()) { i++; continue }
    if (l.startsWith('|')) { const t = []; while (i < ls.length && ls[i].startsWith('|')) t.push(ls[i++]); out.push(tabla(t)); continue }
    if (l.startsWith('> ')) {
      const t = []; while (i < ls.length && ls[i].startsWith('>')) t.push(ls[i++].replace(/^>\s?/, ''))
      const txt = t.join(' ')
      out.push(`<div class="nota${/^\*\*En la maqueta/.test(txt) ? ' al' : ''}"><p>${inline(txt)}</p></div>`); continue
    }
    if (/^- /.test(l)) { const t = []; while (i < ls.length && /^- /.test(ls[i])) t.push(ls[i++].slice(2)); out.push(`<ul>\n${t.map(x => `<li>${inline(x)}</li>`).join('\n')}\n</ul>`); continue }
    if (/^\d+\. /.test(l)) { const t = []; while (i < ls.length && /^\d+\. /.test(ls[i])) t.push(ls[i++].replace(/^\d+\. /, '')); out.push(`<ol>\n${t.map(x => `<li>${inline(x)}</li>`).join('\n')}\n</ol>`); continue }
    const t = []; while (i < ls.length && ls[i].trim() && !/^(\||> |- |\d+\. |#)/.test(ls[i])) t.push(ls[i++])
    out.push(`<p>${inline(t.join(' '))}</p>`)
  }
  return out.join('\n')
}

/* Una regla de negocio en sus cuatro apartados. */
function regla(cab, ls) {
  const [, n, codigo, nombre] = cab.match(/^#### ([\d.]+) · (BR-[A-Z]+-\d+) · (.+)$/)
  let estado = 'Borrador'
  const partes = { meta: [], desc: [], esc: [], cond: [], traza: [] }
  let modo = null
  let escena = null
  for (const l of ls) {
    const e = l.match(/^\*Estado: (.+)\*$/); if (e) { estado = e[1]; continue }
    if (/^\*\*1\. /.test(l)) { modo = 'meta'; continue }
    if (/^\*Descripción general\*/.test(l)) { modo = 'desc'; continue }
    if (/^\*\*2\. /.test(l)) { modo = 'esc'; continue }
    if (/^\*\*3\. /.test(l)) { modo = 'cond'; continue }
    if (/^\*\*4\. /.test(l)) { modo = 'traza'; continue }
    if (!l.trim()) continue
    if (modo === 'meta' || modo === 'traza') { const m = l.match(/^- \*\*([^*]+):\*\* (.+)$/); if (m) partes[modo].push([m[1], m[2]]); continue }
    if (modo === 'desc') { partes.desc.push(l); continue }
    if (modo === 'esc') {
      const t = l.match(/^\*(.+)\*$/)
      if (t) { escena = { t: t[1], pasos: [] }; partes.esc.push(escena); continue }
      const p = l.match(/^- \*\*(Dado que|Cuando|Entonces|Y)\*\* (.+)$/)
      if (p && escena) escena.pasos.push([p[1], p[2]])
      continue
    }
    if (modo === 'cond') { if (l.startsWith('- ')) partes.cond.push(l.slice(2)); continue }
  }
  const dl = (cls, xs) => `<dl class="${cls}">\n${xs.map(([k, v]) => `<div><dt>${esc0(k)}</dt><dd>${inline(v)}</dd></div>`).join('\n')}\n</dl>`
  return `<li class="br">
<span class="br-n">${n}</span>
<div>
<div class="br-cab"><span class="br-id">${codigo}</span><span class="br-estado">${esc0(estado)}</span></div>
<h3 id="${codigo}">${inline(nombre)}</h3>
<h4 class="br-h"><em>1</em>Información básica</h4>
${dl('br-meta', partes.meta)}
<p class="br-dg-t">Descripción general</p>
${bloques(partes.desc)}
<h4 class="br-h"><em>2</em>Escenarios ágiles de ejecución</h4>
<div class="escenarios">
${partes.esc.map(s => `<div class="esc ok"><div class="esc-t"><i></i>${inline(s.t)}</div><ul>${s.pasos.map(([k, v]) => `<li><b>${k}</b>${inline(v)}</li>`).join('')}</ul></div>`).join('\n')}
</div>
<h4 class="br-h"><em>3</em>Condiciones y excepciones</h4>
<ul class="br-cond">
${partes.cond.map(c => `<li>${inline(c)}</li>`).join('\n')}
</ul>
<h4 class="br-h"><em>4</em>Trazabilidad</h4>
${dl('br-traza', partes.traza)}
</div>
</li>`
  function esc0(s) { return esc(s) }
}

const rail = []
const cuerpo = []
secciones.forEach((sec, k) => {
  const d = datosSeccion(sec.titulo)
  const ls = sec.lineas
  let desc = ''
  let i = 0
  while (i < ls.length && !ls[i].trim()) i++
  if (/^\*[^*].*\*$/.test(ls[i] || '')) { desc = ls[i].slice(1, -1); i++ }
  const subRail = []
  const html = []
  let buffer = []
  let enReglas = false
  const vaciar = () => { if (buffer.length) { html.push(bloques(buffer)); buffer = [] } }
  const cerrarReglas = () => { if (enReglas) { html.push('</ol>'); enReglas = false } }
  for (; i < ls.length; i++) {
    const l = ls[i]
    const rol = l.match(/^### Para (.+)$/)
    if (rol) {
      vaciar(); cerrarReglas()
      const id = `s${d.num}-rol-${slug(rol[1])}`
      html.push(`<h3 class="rol-h" id="${id}"><span class="rol-k">Para</span>${inline(rol[1])}</h3>`)
      subRail.push(`<li class="rail-g rail-rol"><a href="#${id}">Para ${esc(rol[1])}</a></li>`)
      let j = i + 1; while (j < ls.length && !ls[j].trim()) j++
      if (ls[j] && !ls[j].startsWith('#') && !ls[j].startsWith('|') && !ls[j].startsWith('-')) { html.push(`<p class="rol-d">${inline(ls[j])}</p>`); i = j }
      continue
    }
    const num = l.match(/^### (\d+)\.(\d+) (.+)$/)
    if (num) {
      vaciar(); cerrarReglas()
      const id = `p${num[1]}-${num[2]}`
      html.push(`<h3 id="${id}">${num[1]}.${num[2]} ${inline(num[3])}</h3>`)
      subRail.push(`<li><a href="#${id}">${num[1]}.${num[2]} ${esc(num[3])}</a></li>`)
      continue
    }
    if (/^#### [\d.]+ · BR-/.test(l)) {
      vaciar()
      const cab = l
      const cuerpoR = []
      while (i + 1 < ls.length && !/^#{2,4} /.test(ls[i + 1])) cuerpoR.push(ls[++i])
      html.push(regla(cab, cuerpoR))
      const [, , codigo, nombre] = cab.match(/^#### ([\d.]+) · (BR-[A-Z]+-\d+) · (.+)$/)
      const corto = nombre.length > 46 ? `${nombre.slice(0, 46)}…` : nombre
      subRail.push(`<li><a href="#${codigo}">${codigo.slice(-3)} · ${esc(corto)}</a></li>`)
      continue
    }
    const h3 = l.match(/^### (.+)$/)
    if (h3) {
      vaciar()
      if (d.num === 4) {
        cerrarReglas()
        let j = i + 1; while (j < ls.length && !ls[j].trim()) j++
        const sub = /^\*[^*].*\*$/.test(ls[j] || '') ? ls[j].slice(1, -1) : ''
        if (sub) i = j
        const id = `g-${slug(h3[1])}`
        html.push(`<h3 class="br-grupo" id="${id}">${inline(h3[1])}${sub ? `<em>${inline(sub)}</em>` : ''}</h3>\n<ol class="reglas">`)
        enReglas = true
        subRail.push(`<li class="rail-g"><a href="#${id}">${esc(h3[1])}</a></li>`)
      } else {
        const id = d.ax ? `ax${d.ax}-${slug(h3[1])}` : slug(h3[1])
        html.push(`<h3 id="${id}">${inline(h3[1])}</h3>`)
        subRail.push(`<li><a href="#${id}">${esc(h3[1])}</a></li>`)
      }
      continue
    }
    const h4 = l.match(/^#### (.+)$/)
    if (h4) {
      vaciar()
      const id = `ax${d.ax || 1}-${slug(h4[1]).slice(0, 44)}`
      html.push(`<h4 id="${id}" class="ax-h">${inline(h4[1])}</h4>`)
      subRail.push(`<li><a href="#${id}">${esc(h4[1])}</a></li>`)
      continue
    }
    buffer.push(l)
  }
  vaciar(); cerrarReglas()

  const chev = '<svg class="rail-c" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M3.5 1.5 L7 5 L3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  rail.push(`<div class="rail-s" data-sec="${d.id}">
  <a href="#${d.id}"><span>${d.n}</span>${esc(d.nombre)}</a>${subRail.length ? `
  <button type="button" class="rail-x" aria-expanded="false" aria-controls="sub-${d.id}">${chev}<span class="sr">Ver los subtítulos de ${esc(d.nombre)}</span></button>
  <ul class="rail-sub" id="sub-${d.id}" hidden>
    ${subRail.join('\n    ')}
  </ul>` : ''}
</div>`)
  cuerpo.push(`  <section id="${d.id}"${k === 0 ? ' class="first"' : ''}>
    <header class="sec-h">
      <span class="sec-n${d.n === '+' ? ' x' : ''}" aria-hidden="true">${d.n}</span>
      <h2>${esc(d.nombre)}</h2>
      ${desc ? `<p class="sec-d">${inline(desc)}</p>` : ''}
    </header>

${html.join('\n')}
  </section>
`)
})

/* La imagen de la portada: la del módulo si existe (public/assets/imagenes/via_<módulo>.png, p. ej. via_asistencia.png
   para modulo-asistencia.md); si no, los tres VIA de siempre. Una imagen vertical se muestra más angosta. */
const ALT_PORTADA = { asistencia: 'VIA abrazando un reloj despertador, con un calendario detrás' }
const modulo = path.basename(mdPath, '.md').replace(/^modulo-/, '')
const propia = path.join(raiz, 'public/assets/imagenes', `via_${modulo}.png`)
let portada = '<img src="assets/imagenes/via_rrhh_proyectos.png" width="460" height="374" alt="Tres VIA juntos: uno con planilla y traje, otro con planos y chaleco de obra, y otro con una tableta de indicadores">'
if (fs.existsSync(propia)) {
  const png = fs.readFileSync(propia)
  const an = png.readUInt32BE(16); const al = png.readUInt32BE(20)
  portada = `<img src="assets/imagenes/via_${modulo}.png" width="${an}" height="${al}" alt="${esc(ALT_PORTADA[modulo] || 'VIA, la mascota de Souly')}"${al > an ? ' style="max-width:220px"' : ''}>`
}

/* ── Se arma con la plantilla de Onboarding ── */
const head = plantilla.slice(0, plantilla.indexOf('<header class="masthead">'))
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="Documentación de producto del ${esc(titulo)} de Souly HR. Uso interno.">`)
  .replace(/<title>[^<]*<\/title>/, `<title>Documentación · ${esc(titulo)} — Souly HR</title>`)
const railIni = plantilla.indexOf('<div class="doc">')
const navIni = plantilla.indexOf('<nav id="toc">', railIni)
const antesDelToc = plantilla.slice(railIni, navIni + '<nav id="toc">'.length)
const scripts = plantilla.slice(plantilla.indexOf('<script>', plantilla.indexOf('<footer class="pie">')))
/* El diagrama de la portada (opcional): herramientas/taxo/<nombre del md>.html, entre las cifras y el índice. */
const taxoPath = path.join(raiz, 'herramientas/taxo', path.basename(mdPath).replace(/\.md$/, '.html'))
const taxo = fs.existsSync(taxoPath) ? fs.readFileSync(taxoPath, 'utf8').replace(/\r\n/g, '\n') : ''
const version = (ficha.find(([k]) => k === 'Versión') || [])[1] || ''
const fecha = (ficha.find(([k]) => k === 'Fecha') || [])[1] || ''

const salida = `${head}<header class="masthead">
  <div class="mh-in">
    <div class="mh-grid">
      <div>
        <p class="eyebrow">${esc(ceja)}</p>
        <h1 class="mh-title">${esc(titulo)}</h1>
        <p class="mh-sub">${inline(bajada)}</p>
      </div>
      <figure class="mh-fig">
        ${portada}
      </figure>
    </div>
    <dl class="ficha">
${ficha.map(([k, v]) => `      <div><dt>${esc(k)}</dt><dd>${inline(v)}</dd></div>`).join('\n')}
    </dl>
  </div>
</header>

<div class="cifras-w">
  <div class="cifras">
${cifras.map(([n, t]) => `    <div><b>${n}</b><span>${esc(t)}</span></div>`).join('\n')}
  </div>
</div>
${taxo ? `\n${taxo}` : ''}
${antesDelToc}
${rail.join('\n')}
      </nav>
    </details>
  </aside>

  <main class="cuerpo">

${cuerpo.join('\n')}
  </main>
</div>

<footer class="pie">
  <div>Documentación del ${esc(titulo.charAt(0).toLowerCase() + titulo.slice(1))} — versión ${esc(version)}, ${esc(fecha)}. Souly HR. Documenta el módulo tal como está en el prototipo, con los mismos capítulos que los documentos de <a href="reglas-de-negocio.html">Organización</a>, <a href="gestion-de-personas.html">Gestión de personas</a> y <a href="onboarding.html">Onboarding</a>. La versión en Markdown dice lo mismo.</div>
</footer>

${scripts}`
fs.writeFileSync(path.resolve(raiz, outPath), salida)
console.log(`Listo: ${outPath} · ${secciones.length} secciones · ${(md.match(/^#### [\d.]+ · BR-/gm) || []).length} reglas`)
