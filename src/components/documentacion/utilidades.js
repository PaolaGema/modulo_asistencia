import { ESTADOS } from '../../data/documentacionData'

/* Las funciones que acompañan a los componentes de `comunes.jsx`. Viven aparte porque un archivo
   de componentes que además exporta funciones rompe la recarga en caliente de Vite: las pantallas
   importan los componentes de `comunes.jsx` y estas funciones de acá. */

export const FILTROS_VACIOS = { sede: '', area: '', cargo: '', tipo: '', subtipo: '', estado: '' }

export const pasaFiltros = (persona, f) =>
  (!f.sede || persona.sede === f.sede) && (!f.area || persona.depto === f.area) && (!f.cargo || persona.cargo === f.cargo)

/* Qué filtros se usaron, en palabras: lo que un reporte exportado tiene que decir (RF-83). */
export function describirFiltros(f, { sucursales = [], tipos = [], subtipos = [] } = {}) {
  const t = []
  if (f.sede) t.push(sucursales.find(s => s.id === f.sede)?.nombre)
  if (f.area) t.push(f.area)
  if (f.cargo) t.push(f.cargo)
  if (f.tipo) t.push(tipos.find(x => x.id === f.tipo)?.nombre)
  if (f.subtipo) t.push(subtipos.find(x => x.id === f.subtipo)?.nombre)
  if (f.estado) t.push(ESTADOS[f.estado]?.label)
  return t.filter(Boolean).join(' · ') || 'Sin filtros'
}

/* LOS FILTROS APLICADOS, uno por uno y en palabras: lo que la fila de etiquetas dibuja sobre una
   tabla («Unidad: Ventas ×»). Cada uno dice qué filtro es, qué valor tiene y su clave para quitarlo. */
export const NOMBRE_FILTRO = { sede: 'Sucursal', area: 'Unidad', cargo: 'Cargo', tipo: 'Carpeta', subtipo: 'Documento', estado: 'Estado' }
export function filtrosAplicados(f, mostrar, { sucursales = [], tipos = [], subtipos = [] } = {}) {
  const texto = {
    sede: v => sucursales.find(s => s.id === v)?.nombre,
    area: v => v, cargo: v => v,
    tipo: v => tipos.find(x => x.id === v)?.nombre,
    subtipo: v => subtipos.find(x => x.id === v)?.nombre,
    estado: v => ESTADOS[v]?.label,
  }
  return mostrar.filter(k => f[k]).map(k => ({ clave: k, nombre: NOMBRE_FILTRO[k], valor: texto[k](f[k]) || f[k] }))
}

/* Descarga simulada: la demo no tiene servidor de archivos, así que se baja un .txt que dice
   qué se habría bajado. Mejor eso que un botón que no hace nada. */
export function descargarTexto(nombre, contenido) {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nombre; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* PARA IMPRIMIR Y HACER FIRMAR (16 oct 2026): el texto de un documento generado como archivo de
   Word (.doc), con letra de documento, márgenes de hoja y, si se piden, las líneas de firma al pie.
   Word lo abre tal cual y se imprime desde ahí; un .txt salía sin formato y sin lugar para firmar. */
export function descargarParaImprimir(nombre, texto, { firmas = [] } = {}) {
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const parrafos = String(texto || '').split(/\n{2,}/).map((p, i) => `<p${i === 0 ? ' class="tit"' : ''}>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
  const pie = firmas.length
    ? `<table class="firmas"><tr>${firmas.map(f => `<td><div class="linea"></div>${esc(f)}</td>`).join('')}</tr></table>`
    : ''
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(nombre)}</title>
<style>@page { size: 21.59cm 27.94cm; margin: 2.5cm; } body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
p { margin: 0 0 12pt; text-align: justify; } p.tit { text-align: center; font-weight: bold; }
table.firmas { width: 100%; margin-top: 72pt; } table.firmas td { width: 50%; text-align: center; padding: 0 24pt; vertical-align: top; }
.linea { border-top: 1px solid #000; margin-bottom: 6pt; }</style></head><body>${parrafos}${pie}</body></html>`
  const blob = new Blob(['﻿', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nombre.endsWith('.doc') ? nombre : `${nombre}.doc`; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* Exportar una tabla a CSV con los filtros escritos arriba (RF-83). Excel lo abre directo. */
export function exportarCSV(nombre, encabezados, filas, filtrosTexto) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lineas = [
    esc(`Filtros: ${filtrosTexto}`),
    esc(`Generado: ${new Date().toLocaleString('es-BO')}`),
    '',
    encabezados.map(esc).join(';'),
    ...filas.map(f => f.map(esc).join(';')),
  ]
  const blob = new Blob(['﻿' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nombre; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
