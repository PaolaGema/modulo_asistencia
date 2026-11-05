/* ── LOS CASOS PARA DESARROLLO, DE MARKDOWN A UNA PÁGINA ──────────────────────
   Uso: node herramientas/doc-casos.cjs casos-asistencia.md public/casos-asistencia.html

   El .md es la fuente: «## N · Grupo», y dentro una ficha por caso («### CASO-ASI-NN · Título») con
   viñetas **Reglas**, **Situación**, **Datos**, **Calcula** (en `código`, una línea por cálculo),
   **Para probarlo**, **En el código**, **Qué mirar** y las capturas (`- ![pie](public/assets/casos/x.png)`).
   Las capturas se toman con herramientas/capturas-casos.cjs. Misma familia visual que las pruebas para QA. */
const fs = require('fs')
const [, , mdPath, outPath] = process.argv
if (!mdPath || !outPath) { console.error('Uso: node herramientas/doc-casos.cjs <md> <html>'); process.exit(1) }
const md = fs.readFileSync(mdPath, 'utf8').replace(/\r\n/g, '\n')

const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const inline = t => esc(t)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>')
  .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  .replace(/(BR‑ASI‑\d+|W‑ASI‑\d+|CASO‑ASI‑\d+)/g, m => `<span class="ref">${m}</span>`)

const titulo = (md.match(/^# (.+)$/m) || [, 'Casos'])[1]
const meta = {}
for (const m of md.matchAll(/^- \*\*(.+?):\*\* (.+)$/gm)) { if (Object.keys(meta).length < 3) meta[m[1]] = m[2] }
const intro = (md.split('\n## ')[0].split('\n').filter(l => l && !l.startsWith('#') && !l.startsWith('- ') && !/^Souly HR/.test(l)))[0] || ''

/* Secciones y fichas */
const grupos = []
let g = null, caso = null, campo = null
for (const l of md.split('\n')) {
  if (l.startsWith('## ')) { g = { titulo: l.slice(3).trim(), lineas: [], casos: [] }; grupos.push(g); caso = null; continue }
  if (!g) continue
  if (l.startsWith('### ')) {
    const [, id, t] = l.slice(4).match(/^(CASO-ASI-\d+) · (.+)$/) || [, '', l.slice(4)]
    caso = { id, titulo: t, campos: {}, calc: [], imgs: [] }; g.casos.push(caso); campo = null; continue
  }
  if (!caso) { g.lineas.push(l); continue }
  const img = l.match(/^- !\[(.+?)\]\((.+?)\)/)
  if (img) { caso.imgs.push({ pie: img[1], src: img[2].replace(/^public\//, '') }); continue }
  const c = l.match(/^- \*\*(.+?):\*\* (.*)$/)
  if (c) {
    campo = c[1]
    if (campo === 'Calcula') caso.calc.push(...[...c[2].matchAll(/`(.+?)`/g)].map(x => x[1]))
    else caso.campos[campo] = c[2]
    continue
  }
  if (campo === 'Calcula' && /^\s+`/.test(l)) caso.calc.push(...[...l.matchAll(/`(.+?)`/g)].map(x => x[1]))
}
const antes = grupos.find(x => /Antes/.test(x.titulo))
const conCasos = grupos.filter(x => x.casos.length)
const total = conCasos.reduce((s, x) => s + x.casos.length, 0)
const slug = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const ficha = c => {
  const par = (k, html) => html ? `<div class="par"><span>${k}</span><div>${html}</div></div>` : ''
  const sit = (c.campos['Situación'] || '').replace(/\*\*(Dado que|Cuando|Entonces)\*\*/g, '§$1§')
  const sitHtml = inline(sit).replace(/§(Dado que|Cuando|Entonces)§/g, '<b class="g">$1</b>')
  const imgs = c.imgs.length
    ? `<div class="capturas n${Math.min(c.imgs.length, 3)}">${c.imgs.map(i => `<figure><a href="${i.src}" target="_blank" rel="noopener"><img src="${i.src}" alt="${esc(i.pie)}" loading="lazy"></a><figcaption>${esc(i.pie)}</figcaption></figure>`).join('')}</div>`
    : '<p class="sin-captura">Sin captura: lo decide el servidor.</p>'
  const texto = [c.id, c.titulo, ...Object.values(c.campos), ...c.calc].join(' ').toLowerCase()
  return `<article class="caso" id="${c.id.toLowerCase()}" data-texto="${esc(texto)}">
  <header class="ficha-cab"><span class="id">${c.id}</span><h3>${inline(c.titulo)}</h3><div class="reglas">${inline(c.campos['Reglas'] || '')}</div></header>
  <div class="ficha-cuerpo">
    <div class="datos">
      ${par('Situación', sitHtml)}
      ${par('Datos', inline(c.campos['Datos'] || ''))}
      ${c.calc.length ? par('Calcula', `<pre class="calc">${c.calc.map(esc).join('\n')}</pre>`) : ''}
      ${par('Para probarlo', inline(c.campos['Para probarlo'] || ''))}
      ${par('En el código', inline(c.campos['En el código'] || ''))}
      ${par('Qué mirar', inline(c.campos['Qué mirar'] || ''))}
    </div>
    <div class="imgs">${imgs}</div>
  </div>
</article>`
}

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)} · Souly HR</title>
<style>
:root { --marca:#0C2D40; --menta:#00E091; --verde:#0A7F55; --verde-bg:#E6F9F1; --gris:#62788A; --gris-bg:#EEF2F5; --papel:#EDF1F3; --hoja:#FFFFFF; --tinta:#0F1A20; --regla:#E4EAED; --suave:#F6F8FA;
  --display:Bahnschrift,"DIN Alternate","Avenir Next Condensed","Arial Narrow","Helvetica Neue",sans-serif; --mono:"Cascadia Mono",Consolas,ui-monospace,monospace; --texto:"Segoe UI",system-ui,-apple-system,sans-serif; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --hoja:#152530; --papel:#0E1A22; --tinta:#E6EEF2; --regla:#24343F; --suave:#1B2D38; --gris:#93A7B5; --gris-bg:#22333E; --verde-bg:#0F3A2C; --verde:#4FD39E; color-scheme: dark; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--papel); color: var(--tinta); font-family: var(--texto); font-size: 14px; line-height: 1.55; }
header.cab { background: var(--marca); color: #fff; padding: 28px max(16px, calc((100vw - 1180px) / 2)) 22px; }
.eyebrow { margin: 0; font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--menta); }
h1 { margin: 6px 0 4px; font-family: var(--display); font-size: 34px; letter-spacing: -.01em; }
.meta { display: flex; gap: 16px; flex-wrap: wrap; color: #B7CBD8; font-size: 13px; } .meta a { color: var(--menta); }
.lead { color: #DCE7EE; max-width: 80ch; margin: 10px 0 0; }
.barra-sup { position: sticky; top: 0; z-index: 5; background: var(--hoja); border-bottom: 1px solid var(--regla); padding: 10px max(16px, calc((100vw - 1180px) / 2)); display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.buscar-w { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; height: 38px; border: 1px solid var(--regla); border-radius: 10px; padding: 0 12px; background: var(--hoja); color: var(--gris); }
.buscar-w:focus-within { border-color: #00B876; box-shadow: 0 0 0 3px var(--verde-bg); }
.buscar-w input { border: none; outline: none; background: none; font: inherit; color: var(--tinta); flex: 1; min-width: 0; }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { border: 1px solid var(--regla); background: var(--hoja); color: var(--gris); border-radius: 99px; padding: 5px 12px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
.chip b { color: var(--tinta); margin-left: 4px; }
.chip:hover { border-color: var(--gris); }
main { max-width: 1180px; margin: 0 auto; padding: 18px 16px 60px; display: grid; gap: 16px; }
details.antes { background: var(--hoja); border: 1px solid var(--regla); border-radius: 14px; padding: 4px 16px; }
details.antes summary { cursor: pointer; font-weight: 700; padding: 10px 0; } details.antes ul { margin: 0 0 12px; padding-left: 20px; display: grid; gap: 6px; }
code { font-family: var(--mono); font-size: 12.5px; background: var(--gris-bg); border-radius: 5px; padding: 1px 5px; overflow-wrap: anywhere; }
.grupo-t { font-family: var(--display); font-size: 15px; letter-spacing: .1em; text-transform: uppercase; color: var(--verde); margin: 14px 0 0; padding-bottom: 6px; border-bottom: 2px solid var(--regla); scroll-margin-top: 70px; }
.caso { background: var(--hoja); border: 1px solid var(--regla); border-radius: 14px; overflow: hidden; scroll-margin-top: 70px; }
.ficha-cab { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 12px 16px; border-bottom: 1px solid var(--regla); background: var(--suave); }
.ficha-cab .id { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--gris); }
.ficha-cab h3 { margin: 0; font-size: 16px; flex: 1; min-width: 220px; }
.reglas { display: flex; gap: 4px; flex-wrap: wrap; font-size: 0; }
.ref { font-family: var(--mono); font-size: 11px; background: var(--gris-bg); color: var(--gris); border-radius: 99px; padding: 1px 8px; white-space: nowrap; }
.reglas .ref { font-size: 11px; }
.ficha-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 18px; padding: 14px 16px 16px; }
.par { display: grid; grid-template-columns: 108px minmax(0, 1fr); gap: 8px; font-size: 13.5px; padding: 7px 0; border-bottom: 1px dashed var(--regla); }
.par:last-child { border-bottom: 0; }
.par > span { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--gris); font-weight: 700; padding-top: 2px; }
.par b.g { color: var(--verde); }
pre.calc { margin: 0; font-family: var(--mono); font-size: 12.5px; background: var(--gris-bg); border-radius: 8px; padding: 8px 10px; white-space: pre-wrap; overflow-wrap: anywhere; }
.capturas { display: grid; gap: 10px; align-items: start; }
.capturas.n2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.capturas.n3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
figure { margin: 0; }
figure img { display: block; width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--regla); background: var(--suave); }
figcaption { font-size: 12px; color: var(--gris); margin-top: 5px; }
.sin-captura { margin: 0; color: var(--gris); background: var(--suave); border: 1px dashed var(--regla); border-radius: 10px; padding: 24px; text-align: center; }
.vacio { text-align: center; color: var(--gris); padding: 30px; }
@media (max-width: 900px) { .ficha-cuerpo { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .par { grid-template-columns: 1fr; gap: 2px; } h1 { font-size: 28px; } .capturas.n3 { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>
<header class="cab">
  <p class="eyebrow">Souly HR · Casos para desarrollo</p>
  <h1>${esc(titulo)}</h1>
  <div class="meta">${Object.entries(meta).map(([k, v]) => `<span>${esc(k)}: ${/\.html$/.test(v) ? `<a href="${v}">${v}</a>` : esc(v)}</span>`).join('')}<span>${total} casos</span></div>
  <p class="lead">${inline(intro)}</p>
</header>
<div class="barra-sup">
  <label class="buscar-w"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="buscar" type="search" placeholder="Buscar un caso, una regla (BR‑ASI‑012) o una persona…" aria-label="Buscar un caso"></label>
  <nav class="chips" aria-label="Grupos">${conCasos.map(x => `<a class="chip" href="#${slug(x.titulo)}">${esc(x.titulo.replace(/^\d+ · /, ''))}<b>${x.casos.length}</b></a>`).join('')}</nav>
</div>
<main>
${antes ? `<details class="antes" open><summary>Antes de empezar</summary><ul>${antes.lineas.filter(l => l.startsWith('- ')).map(l => `<li>${inline(l.slice(2))}</li>`).join('')}</ul></details>` : ''}
${conCasos.map(x => `<h2 class="grupo-t" id="${slug(x.titulo)}">${esc(x.titulo)}</h2>\n${x.casos.map(ficha).join('\n')}`).join('\n')}
<p class="vacio" id="vacio" hidden>Ningún caso coincide con la búsqueda.</p>
</main>
<script>
const q = document.getElementById('buscar')
q.addEventListener('input', () => {
  const t = q.value.trim().toLowerCase().replace(/-/g, '‑')
  let n = 0
  document.querySelectorAll('.caso').forEach(c => { const ok = !t || c.dataset.texto.replace(/-/g, '‑').includes(t); c.hidden = !ok; if (ok) n++ })
  document.querySelectorAll('.grupo-t').forEach(h => { let e = h.nextElementSibling, alguno = false; while (e && e.classList.contains('caso')) { if (!e.hidden) alguno = true; e = e.nextElementSibling } h.hidden = !alguno })
  document.getElementById('vacio').hidden = n > 0
})
</script>
</body>
</html>
`
fs.writeFileSync(outPath, html)
console.log(`${outPath}: ${total} casos en ${conCasos.length} grupos`)
