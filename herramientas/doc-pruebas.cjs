/* ── LAS PRUEBAS DE QA, DE MARKDOWN A UNA PÁGINA PARA IR MARCANDO ──────────
   Uso: node herramientas/doc-pruebas.cjs pruebas-asistencia.md public/pruebas-asistencia.html

   El .md es la fuente: ahí se mantienen los casos (una tabla por grupo, «## N · Título»). Esta página
   es la herramienta de quien prueba: cada caso con ✓ Pasa / ✗ Falla / — No se pudo y una nota, el
   avance arriba, filtros, y «Exportar resultados» en CSV. Lo marcado se guarda en el navegador de quien
   prueba (localStorage), así puede cerrar y seguir otro día; para compartirlo, exporta el CSV. */
const fs = require('fs')
const [, , mdPath, outPath] = process.argv
if (!mdPath || !outPath) { console.error('Uso: node herramientas/doc-pruebas.cjs <md> <html>'); process.exit(1) }
const md = fs.readFileSync(mdPath, 'utf8').replace(/\r\n/g, '\n')

const titulo = (md.match(/^# (.+)$/m) || [, 'Pruebas'])[1]
const meta = {}
for (const m of md.matchAll(/^- \*\*(.+?):\*\* (.+)$/gm)) { if (Object.keys(meta).length < 3) meta[m[1]] = m[2] }

const secciones = []
let actual = null
for (const l of md.split('\n')) {
  if (l.startsWith('## ')) { actual = { titulo: l.slice(3).trim(), lineas: [] }; secciones.push(actual); continue }
  if (actual) actual.lineas.push(l)
}
const inline = t => t
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>')
const antes = secciones.find(s => /Antes de empezar/i.test(s.titulo))
const grupos = secciones.filter(s => s !== antes).map(s => ({
  parte: /^\d+ · Celular/.test(s.titulo) ? 'celular' : 'rrhh',
  titulo: s.titulo.replace(/^\d+ · /, '').replace(/^Celular · /, ''),
  casos: s.lineas.filter(l => l.startsWith('| QA')).map(l => {
    const c = l.split('|').slice(1, -1).map(x => x.trim())
    return { id: c[0], que: c[1], pasos: c[2], esperado: c[3], req: c[4] && c[4] !== '—' ? c[4] : '' }
  }),
})).filter(g => g.casos.length)
const total = grupos.reduce((n, g) => n + g.casos.length, 0)
const antesHtml = antes ? antes.lineas.filter(l => l.startsWith('- ')).map(l => `<li>${inline(l.slice(2))}</li>`).join('') : ''
const datos = JSON.stringify(grupos.map(g => ({ ...g, casos: g.casos.map(c => ({ ...c, que: inline(c.que), pasos: inline(c.pasos), esperado: inline(c.esperado) })) })))
const version = meta['Versión del módulo'] || '1'

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${inline(titulo)} · Souly HR</title>
<style>
:root { --marca:#0C2D40; --menta:#00E091; --verde:#0A7F55; --verde-bg:#E6F9F1; --rojo:#B42318; --rojo-bg:#FDECEA; --gris:#62788A; --gris-bg:#EEF2F5; --papel:#EDF1F3; --hoja:#FFFFFF; --tinta:#0F1A20; --regla:#E4EAED; --suave:#F6F8FA;
  --display:Bahnschrift,"DIN Alternate","Avenir Next Condensed","Arial Narrow","Helvetica Neue",sans-serif; --mono:"Cascadia Mono",Consolas,ui-monospace,monospace; --texto:"Segoe UI",system-ui,-apple-system,sans-serif; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --hoja:#152530; --papel:#0E1A22; --tinta:#E6EEF2; --regla:#24343F; --suave:#1B2D38; --gris:#93A7B5; --gris-bg:#22333E; --verde-bg:#0F3A2C; --rojo-bg:#3A1A18; color-scheme: dark; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--papel); color: var(--tinta); font-family: var(--texto); font-size: 14px; line-height: 1.5; }
header.cab { background: var(--marca); color: #fff; padding: 28px max(16px, calc((100vw - 1100px) / 2)) 22px; }
.eyebrow { margin: 0; font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--menta); }
h1 { margin: 6px 0 4px; font-family: var(--display); font-size: 34px; letter-spacing: -.01em; }
.meta { display: flex; gap: 16px; flex-wrap: wrap; color: #B7CBD8; font-size: 13px; } .meta a { color: var(--menta); }
.quien { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
.quien label { display: grid; gap: 3px; font-size: 11px; color: #B7CBD8; text-transform: uppercase; letter-spacing: .08em; font-family: var(--mono); }
.quien input { height: 36px; border-radius: 9px; border: 1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.08); color: #fff; padding: 0 10px; font: inherit; font-family: var(--texto); letter-spacing: 0; text-transform: none; font-size: 14px; min-width: 220px; }
.barra-sup { position: sticky; top: 0; z-index: 5; background: var(--hoja); border-bottom: 1px solid var(--regla); padding: 12px max(16px, calc((100vw - 1100px) / 2)); display: grid; gap: 10px; }
.avance { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.avance .num { font-family: var(--display); font-size: 22px; } .avance .num small { font-size: 13px; color: var(--gris); font-family: var(--texto); }
.prog { flex: 1; min-width: 200px; height: 12px; border-radius: 99px; background: var(--gris-bg); display: flex; overflow: hidden; }
.prog i { display: block; height: 100%; } .prog .p { background: #00B876; } .prog .f { background: #E5484D; } .prog .n { background: #94A3B8; }
.cuentas { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { border: 1px solid var(--regla); background: var(--hoja); color: var(--gris); border-radius: 99px; padding: 5px 12px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; }
.chip b { color: var(--tinta); } .chip.on { background: var(--marca); color: #fff; border-color: var(--marca); } .chip.on b { color: var(--menta); }
.herr { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.buscar { flex: 1; min-width: 200px; height: 36px; border: 1px solid var(--regla); border-radius: 10px; padding: 0 12px; font: inherit; background: var(--hoja); color: var(--tinta); }
.btn { height: 36px; border-radius: 10px; border: 1px solid var(--regla); background: var(--hoja); color: var(--tinta); font: inherit; font-weight: 600; padding: 0 14px; cursor: pointer; }
.btn.prim { background: var(--marca); color: #fff; border-color: var(--marca); } .btn.peligro { color: var(--rojo); }
main { max-width: 1100px; margin: 0 auto; padding: 18px 16px 60px; display: grid; gap: 18px; }
details.antes { background: var(--hoja); border: 1px solid var(--regla); border-radius: 14px; padding: 4px 16px; }
details.antes summary { cursor: pointer; font-weight: 700; padding: 10px 0; } details.antes ul { margin: 0 0 12px; padding-left: 20px; display: grid; gap: 6px; }
code { font-family: var(--mono); font-size: 12.5px; background: var(--gris-bg); border-radius: 5px; padding: 1px 5px; }
.parte-t { font-family: var(--display); font-size: 15px; letter-spacing: .1em; text-transform: uppercase; color: var(--verde); margin: 18px 0 0; padding-bottom: 6px; border-bottom: 2px solid var(--regla); }
.chip.parte.on { background: #00B876; border-color: #00B876; } .chip.parte.on b { color: #fff; }
.tablero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: center; }
.avance { display: grid; gap: 8px; }
.num { display: flex; align-items: baseline; gap: 8px; } .num b { font-family: var(--display); font-size: 30px; line-height: 1; } .num span { color: var(--gris); font-size: 14px; } .num em { margin-left: auto; font-style: normal; font-weight: 700; color: var(--verde); font-size: 14px; }
.prog { height: 10px; min-width: 0; }
.cifras { display: grid; grid-template-columns: repeat(4, 116px); gap: 8px; }
.cifra { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 8px; align-items: center; text-align: left; border: 1.5px solid var(--regla); background: var(--hoja); border-radius: 12px; padding: 8px 10px; cursor: pointer; font: inherit; color: var(--tinta); }
.cifra .ic { grid-row: 1 / 3; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 13px; background: var(--gris-bg); color: var(--gris); }
.cifra b { font-family: var(--display); font-size: 20px; line-height: 1.1; } .cifra small { font-size: 11.5px; color: var(--gris); white-space: nowrap; }
.cifra.pasa .ic { background: var(--verde-bg); color: var(--verde); } .cifra.falla .ic { background: var(--rojo-bg); color: var(--rojo); }
.cifra:hover { border-color: var(--gris); } .cifra.on { border-color: var(--marca); box-shadow: 0 0 0 3px rgba(12,45,64,.12); }
.cifra.pasa.on { border-color: #00B876; box-shadow: 0 0 0 3px var(--verde-bg); } .cifra.falla.on { border-color: #E5484D; box-shadow: 0 0 0 3px var(--rojo-bg); }
.herr { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.seg { display: inline-flex; background: var(--gris-bg); border-radius: 11px; padding: 3px; gap: 2px; }
.seg button { border: none; background: none; border-radius: 9px; padding: 7px 14px; font: inherit; font-size: 13px; font-weight: 600; color: var(--gris); cursor: pointer; white-space: nowrap; }
.seg button small { font-size: 11.5px; font-weight: 600; opacity: .8; margin-left: 4px; }
.seg button.on { background: var(--hoja); color: var(--tinta); box-shadow: 0 1px 3px rgba(12,45,64,.15); }
.buscar-w { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; height: 38px; border: 1px solid var(--regla); border-radius: 10px; padding: 0 12px; background: var(--hoja); color: var(--gris); }
.buscar-w:focus-within { border-color: #00B876; box-shadow: 0 0 0 3px var(--verde-bg); }
.buscar-w .buscar { border: none; height: 100%; padding: 0; min-width: 0; outline: none; background: none; }
.btn.prim { display: inline-flex; gap: 7px; align-items: center; height: 38px; }
.link-peligro { border: none; background: none; color: var(--gris); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; padding: 4px; } .link-peligro:hover { color: var(--rojo); }
@media (max-width: 900px) { .tablero { grid-template-columns: 1fr; } .cifras { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.grupo h2 { font-family: var(--display); font-size: 22px; margin: 8px 0 10px; display: flex; align-items: baseline; gap: 10px; } .grupo h2 small { font-family: var(--texto); font-size: 13px; color: var(--gris); font-weight: 500; }
.caso { background: var(--hoja); border: 1px solid var(--regla); border-left: 4px solid var(--regla); border-radius: 12px; padding: 14px 16px; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 14px; margin-bottom: 10px; }
.caso.pasa { border-left-color: #00B876; } .caso.falla { border-left-color: #E5484D; } .caso.nopudo { border-left-color: #94A3B8; }
.caso .cab2 { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; } .caso .id { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--gris); } .caso h3 { margin: 0; font-size: 15px; }
.req { font-family: var(--mono); font-size: 11px; background: var(--gris-bg); color: var(--gris); border-radius: 99px; padding: 1px 8px; }
.par { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; margin-top: 8px; font-size: 13.5px; } .par > span { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--gris); font-weight: 700; padding-top: 2px; }
.esperado { background: var(--suave); border-radius: 8px; padding: 6px 9px; }
.lado { display: grid; gap: 8px; align-content: start; }
.marcar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.marcar button { white-space: nowrap; padding: 0 4px; height: 38px; border-radius: 10px; border: 1.5px solid var(--regla); background: var(--hoja); color: var(--gris); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.marcar button.p.on { background: var(--verde-bg); color: var(--verde); border-color: #00B876; } .marcar button.f.on { background: var(--rojo-bg); color: var(--rojo); border-color: #E5484D; } .marcar button.n.on { background: var(--gris-bg); color: var(--tinta); border-color: #94A3B8; }
.lado textarea { min-height: 60px; resize: vertical; border: 1px solid var(--regla); border-radius: 10px; padding: 8px 10px; font: inherit; font-size: 13px; background: var(--hoja); color: var(--tinta); }
.caso.falla textarea { border-color: #E5484D; }
.cuando { font-size: 11.5px; color: var(--gris); }
.vacio { text-align: center; color: var(--gris); padding: 30px; }
.velo { position: fixed; inset: 0; background: rgba(12,45,64,.45); display: grid; place-items: center; z-index: 20; padding: 16px; }
.vent { background: var(--hoja); border-radius: 18px; padding: 22px; width: 420px; max-width: 100%; display: grid; gap: 10px; text-align: center; }
.vent h3 { margin: 0; font-size: 17px; } .vent p { margin: 0; color: var(--gris); }
.vent input { height: 40px; border: 1.5px solid var(--regla); border-radius: 10px; padding: 0 12px; font: inherit; font-weight: 700; letter-spacing: .06em; background: var(--hoja); color: var(--tinta); }
.vent .si { height: 40px; border: none; border-radius: 10px; background: #E5484D; color: #fff; font: inherit; font-weight: 700; cursor: pointer; } .vent .si:disabled { background: var(--gris-bg); color: var(--gris); cursor: default; }
.vent .no { border: none; background: none; color: var(--gris); font: inherit; font-weight: 600; cursor: pointer; padding: 6px; }
@media (max-width: 760px) { .caso { grid-template-columns: 1fr; } .par { grid-template-columns: 1fr; gap: 2px; } h1 { font-size: 28px; } }
</style>
</head>
<body>
<header class="cab">
  <p class="eyebrow">Souly HR · Pruebas para QA</p>
  <h1>${inline(titulo)}</h1>
  <div class="meta">${Object.entries(meta).map(([k, v]) => `<span>${inline(k)}: ${/\.html$/.test(v) ? `<a href="${v}">${v}</a>` : inline(v)}</span>`).join('')}<span>${total} casos</span></div>
  <div class="quien">
    <label>Quién prueba<input id="quien" placeholder="Su nombre"></label>
    <label>Dónde<input id="donde" placeholder="Vercel o local · navegador"></label>
  </div>
</header>
<div class="barra-sup">
  <div class="tablero">
    <div class="avance">
      <div class="num" id="num"></div>
      <div class="prog" aria-hidden="true"><i class="p" id="pp"></i><i class="f" id="pf"></i><i class="n" id="pn"></i></div>
    </div>
    <div class="cifras" id="filtros"></div>
  </div>
  <div class="herr">
    <div class="seg" id="partes" role="tablist" aria-label="Qué parte"></div>
    <div class="buscar-w"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="buscar" id="buscar" type="search" placeholder="Buscar un caso, una pantalla o un requisito…"></div>
    <button class="btn prim" id="exportar"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>Exportar CSV</button>
    <button class="link-peligro" id="limpiar">Empezar de nuevo</button>
  </div>
</div>
<main>
  ${antesHtml ? `<details class="antes" open><summary>Antes de empezar</summary><ul>${antesHtml}</ul></details>` : ''}
  <div id="lista"></div>
</main>
<script>
const GRUPOS = ${datos}
const CLAVE = 'souly-qa-asistencia-${version}'
const ETIQ = { pasa: 'Pasa', falla: 'Falla', nopudo: 'No se pudo' }
let estado = {}
try { estado = JSON.parse(localStorage.getItem(CLAVE) || '{}') } catch (e) { estado = {} }
const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(estado)) } catch (e) {} }
const casos = GRUPOS.flatMap(g => g.casos.map(c => ({ ...c, grupo: g.titulo, parte: g.parte })))
let filtro = '', texto = '', parte = ''
const PARTES = [['', 'Todo'], ['rrhh', 'RR.HH. (web)'], ['celular', 'Colaborador (celular)']]
const q = id => document.getElementById(id)
;['quien', 'donde'].forEach(k => { q(k).value = estado['_' + k] || ''; q(k).addEventListener('input', e => { estado['_' + k] = e.target.value; guardar() }) })
const resultado = id => estado[id]?.r || ''
function pintarArriba() {
  const n = { pasa: 0, falla: 0, nopudo: 0 }
  casos.forEach(c => { const r = resultado(c.id); if (r) n[r]++ })
  const hechos = n.pasa + n.falla + n.nopudo, t = casos.length
  q('num').innerHTML = '<b>' + hechos + '</b><span>de ' + t + ' probados</span><em>' + Math.round(hechos / t * 100) + ' %</em>'
  q('pp').style.width = (n.pasa / t * 100) + '%'; q('pf').style.width = (n.falla / t * 100) + '%'; q('pn').style.width = (n.nopudo / t * 100) + '%'
  /* Las cifras son a la vez el filtro: tocar «Fallan» muestra solo las que fallan; otra vez, todas. */
  const ops = [['pasa', 'Pasan', n.pasa, '✓'], ['falla', 'Fallan', n.falla, '✗'], ['nopudo', 'No se pudo', n.nopudo, '—'], ['sin', 'Sin probar', t - hechos, '○']]
  q('filtros').innerHTML = ops.map(([k, l, c, i]) => '<button class="cifra ' + k + (filtro === k ? ' on' : '') + '" data-f="' + k + '" aria-pressed="' + (filtro === k) + '"><span class="ic">' + i + '</span><b>' + c + '</b><small>' + l + '</small></button>').join('')
  q('filtros').querySelectorAll('button').forEach(b => b.onclick = () => { filtro = filtro === b.dataset.f ? '' : b.dataset.f; pintar() })
  q('partes').innerHTML = PARTES.map(([k, l]) => { const cs = casos.filter(c => !k || c.parte === k); const h = cs.filter(c => resultado(c.id)).length; return '<button role="tab" aria-selected="' + (parte === k) + '" class="' + (parte === k ? 'on' : '') + '" data-p="' + k + '">' + l + ' <small>' + h + '/' + cs.length + '</small></button>' }).join('')
  q('partes').querySelectorAll('button').forEach(b => b.onclick = () => { parte = b.dataset.p; pintar() })
}
function pintar() {
  pintarArriba()
  const t = texto.trim().toLowerCase()
  let parteAnt = null
  const html = GRUPOS.map(g => {
    if (parte && g.parte !== parte) return ''
    const vis = g.casos.filter(c => {
      const r = resultado(c.id)
      if (filtro === 'sin' && r) return false
      if (filtro && filtro !== 'sin' && r !== filtro) return false
      if (t && !(c.id + ' ' + c.que + ' ' + c.pasos + ' ' + c.esperado + ' ' + c.req + ' ' + g.titulo).toLowerCase().replace(/<[^>]+>/g, '').includes(t)) return false
      return true
    })
    if (!vis.length) return ''
    const hechos = g.casos.filter(c => resultado(c.id)).length
    const tituloParte = g.parte !== parteAnt ? '<h2 class="parte-t">' + (g.parte === 'celular' ? 'Colaborador · en el celular' : 'RR.HH. · en la web') + '</h2>' : ''
    parteAnt = g.parte
    return tituloParte + '<section class="grupo"><h2>' + g.titulo + ' <small>' + hechos + ' de ' + g.casos.length + '</small></h2>' + vis.map(c => {
      const e = estado[c.id] || {}
      return '<article class="caso ' + (e.r || '') + '" data-id="' + c.id + '">' +
        '<div><div class="cab2"><span class="id">' + c.id + '</span><h3>' + c.que + '</h3>' + (c.req ? '<span class="req">' + c.req + '</span>' : '') + '</div>' +
        '<div class="par"><span>Pasos</span><div>' + c.pasos + '</div></div>' +
        '<div class="par"><span>Esperado</span><div class="esperado">' + c.esperado + '</div></div></div>' +
        '<div class="lado"><div class="marcar">' +
        ['pasa', 'falla', 'nopudo'].map(r => '<button class="' + r[0] + (e.r === r ? ' on' : '') + '" data-r="' + r + '" aria-pressed="' + (e.r === r) + '">' + (r === 'pasa' ? '✓ Pasa' : r === 'falla' ? '✗ Falla' : '— No se pudo') + '</button>').join('') +
        '</div><textarea placeholder="' + (e.r === 'falla' ? 'Qué pasó (obligatorio si falla)' : 'Nota (opcional)') + '">' + (e.nota || '').replace(/</g, '&lt;') + '</textarea>' +
        (e.cuando ? '<span class="cuando">Marcado el ' + e.cuando + '</span>' : '') + '</div></article>'
    }).join('') + '</section>'
  }).join('')
  q('lista').innerHTML = html || '<p class="vacio">Ningún caso coincide.</p>'
  q('lista').querySelectorAll('.caso').forEach(art => {
    const id = art.dataset.id
    art.querySelectorAll('.marcar button').forEach(b => b.onclick = () => {
      const e = estado[id] || {}
      e.r = e.r === b.dataset.r ? '' : b.dataset.r
      e.cuando = e.r ? new Date().toLocaleString('es') : ''
      estado[id] = e; guardar(); pintar()
      if (e.r === 'falla') setTimeout(() => document.querySelector('.caso[data-id="' + id + '"] textarea')?.focus(), 0)
    })
    art.querySelector('textarea').oninput = ev => { estado[id] = { ...(estado[id] || {}), nota: ev.target.value }; guardar() }
  })
}
q('buscar').oninput = e => { texto = e.target.value; pintar() }
q('exportar').onclick = () => {
  const esc = v => '"' + String(v || '').replace(/<[^>]+>/g, '').replace(/"/g, '""') + '"'
  const filas = [['ID', 'Parte', 'Grupo', 'Qué se prueba', 'Requisito', 'Resultado', 'Nota', 'Marcado el', 'Quién prueba', 'Dónde']]
  casos.forEach(c => { const e = estado[c.id] || {}; filas.push([c.id, c.parte === 'celular' ? 'Colaborador (celular)' : 'RR.HH. (web)', c.grupo, c.que, c.req, ETIQ[e.r] || 'Sin probar', e.nota, e.cuando, estado._quien, estado._donde]) })
  const blob = new Blob(['\\ufeff' + filas.map(f => f.map(esc).join(',')).join('\\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pruebas-asistencia-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click()
}
/* Empezar de nuevo borra lo marcado: se confirma escribiendo, como en el producto. */
q('limpiar').onclick = () => {
  const v = document.createElement('div'); v.className = 'velo'
  v.innerHTML = '<div class="vent" role="alertdialog" aria-label="Empezar de nuevo"><h3>¿Borrar todo lo marcado?</h3><p>Se pierden los resultados y las notas de los ' + casos.length + ' casos en este navegador. Exporte antes si los necesita.</p><input placeholder="BORRAR" aria-label="Escriba BORRAR"><button class="si" disabled>Borrar y empezar de nuevo</button><button class="no">Cancelar</button></div>'
  document.body.appendChild(v)
  const inp = v.querySelector('input'), si = v.querySelector('.si')
  inp.focus(); inp.oninput = () => { si.disabled = inp.value.trim().toUpperCase() !== 'BORRAR' }
  si.onclick = () => { const k = { _quien: estado._quien, _donde: estado._donde }; estado = k; guardar(); v.remove(); pintar() }
  v.querySelector('.no').onclick = () => v.remove(); v.onclick = e => { if (e.target === v) v.remove() }
}
pintar()
</script>
</body>
</html>
`
fs.writeFileSync(outPath, html)
console.log(`Listo: ${outPath} · ${grupos.length} grupos · ${total} casos`)
