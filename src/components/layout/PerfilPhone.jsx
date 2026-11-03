import { useEffect, useRef, useState } from 'react'
import {
  Network, Settings, User, Briefcase, FileText, Monitor, ChevronRight,
  ChevronDown, Gift, Sparkles, Plus, Info, Download, AlertTriangle, Pencil, Eye, EyeOff, Check,
  GraduationCap, Image as ImageIcon, Trash2, Upload, Search, IdCard, Car, Home, Shirt, Laptop,
} from 'lucide-react'
import BarraVolver from './BarraVolver'
import FechaRueda from './FechaRueda'
import { Puente } from './MisDocumentosPhone'
import ConfiguracionPhone from './ConfiguracionPhone'
import HojaDocumento from '../personas/HojaDocumento'
import { useMiFicha } from '../../hooks/useMiFicha'
import { useEdicionPerfil } from '../../hooks/useEdicionPerfil'
import {
  pestanasCon, partesDe, documentosDe, agrupar, lineas, titularDe, resumenDe, porRenovar,
  pestanaConEditables, preferenciasVisibles, preferenciasEditables,
} from '../../data/miFichaLectura'
import { cuantosHay, tarjetasDe } from '../../data/fichaColaborador'
import { CODIGOS_PAIS, paisPorSigla, partirTelefono } from '../../data/codigosPais'
import { useFotoPerfil } from '../../hooks/useFotoPerfil'
import { guardarArchivo, nuevaClaveArchivo } from '../../utils/archivosLocales'

/* LA PESTAÑA «PERFIL» DEL TELÉFONO: el perfil de siempre —banda, foto, nombre, cargo— con
   «Mi ficha» debajo. Cada fila abre una pestaña de la ficha en pantalla propia; la barra de
   abajo sigue visible porque no se sale de «Perfil». Mi ficha sólo se lee: su Información
   Personal, con sus documentos, y sus preferencias las edita en Configuración › Editar perfil
   de usuario (`EditarPerfil`). Lo que se enseña y cómo se lee sale de `miFichaLectura`, el mismo
   módulo que usa la web. */

const ICONOS = { personal: User, laboral: Briefcase, perfil: GraduationCap, documentos: FileText, recursos: Monitor }
const BOTON = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 24, padding: '0 11px', borderRadius: 7, fontFamily: 'inherit', fontSize: 7.5, fontWeight: 600, cursor: 'pointer' }
const CAMPO = {
  width: '100%', boxSizing: 'border-box', height: 24, marginTop: 2, padding: '0 7px', borderRadius: 6,
  border: '1px solid var(--border-dark)', background: 'var(--surface-card)', fontFamily: 'inherit', fontSize: 8, color: 'var(--text-heading)', outline: 'none',
}
/* Sección de la ficha (opción P1 elegida): cerrada en plomo suave y sin sombra, como antes pero más liviana;
   abierta, tarjeta blanca con sombra y el encabezado en menta suave (`.mf-sec-cab.on`). */
const tarjeta = abierta => ({ background: abierta ? 'var(--in-carta)' : 'var(--in-plomo)', borderRadius: 14, marginTop: 7, boxShadow: abierta ? 'var(--in-sombra)' : 'none', overflow: 'hidden' })

function GuardarCancelar({ onGuardar, onCancelar, textoGuardar = 'Guardar', desactivado }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
      <button onClick={onCancelar} style={{ ...BOTON, border: '1px solid var(--border-dark)', background: 'var(--surface-card)', color: 'var(--text-heading)' }}>Cancelar</button>
      <button onClick={onGuardar} disabled={desactivado} style={{
        ...BOTON, border: 'none', background: desactivado ? 'var(--bg-secondary)' : '#00E091', color: desactivado ? 'var(--icon-muted)' : '#0C2D40',
        cursor: desactivado ? 'default' : 'pointer',
      }}>{textoGuardar}</button>
    </div>
  )
}

function Guardado() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 6.5, fontWeight: 600, color: 'var(--mf-vig-txt)' }}>
      <Check size={8} /> Cambios guardados
    </span>
  )
}

/* «Cambios guardados» se ve un par de segundos después de guardar y se va solo. */
function useAvisoGuardado() {
  const [visto, setVisto] = useState(false)
  const avisar = () => { setVisto(true); setTimeout(() => setVisto(false), 2200) }
  return [visto, avisar]
}

/* Los gustos en píldoras blancas con sombra y el título como rótulo de sección del Inicio. */
function Chips({ lista }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
      {lista.map(x => (
        <span key={x} style={{ fontSize: 7.6, padding: '5px 9px', borderRadius: 99, background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', color: 'var(--in-texto)' }}>{x}</span>
      ))}
    </div>
  )
}

const tituloPref = (I, t, arriba) => (
  <div style={{ fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', marginTop: arriba ? 13 : 0 }}>
    {t}
  </div>
)
const vacioPref = t => <div style={{ fontSize: 7.4, color: 'var(--in-mute)', marginTop: 5 }}>{t}</div>

/* Regalos y experiencias en la portada: para mirar. Se cambian en Configuración. */
function PreferenciasPhone({ form }) {
  const regalos = lineas(form['ra.f1'])
  const experiencias = lineas(form['ra.f4'])
  return (
    <div style={{ marginTop: 14 }}>
      {tituloPref(Gift, 'Regalos que le gustaría recibir')}
      {regalos.length ? <Chips lista={regalos} /> : vacioPref('Sin regalos agregados')}
      {tituloPref(Sparkles, 'Experiencias que le gustaría vivir', true)}
      {experiencias.length ? <Chips lista={experiencias} /> : vacioPref('Sin experiencias agregadas')}
    </div>
  )
}

/* ── LA PORTADA (auditoría heurística, opción B2 «la tarjeta de identidad»): sin franja de color —esa
   es solo del Inicio—, la persona en una tarjeta blanca destacada con los dos círculos menta de la franja
   «hoy» del Inicio como adorno, la foto con aro menta y sombra, y dos píldoras que funcionan. «Ayuda» y
   «Cerrar sesión» eran cuadrados que no hacían nada: «Ayuda» se quitó y «Cerrar sesión» vive en
   Configuración. La ficha usa las filas de Zona HR (círculo con aro menta, sombra) y «1 por renovar» es
   la etiqueta ámbar de siempre. ── */
const ROTULO = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)' }
const ROTULO_LADO = { fontSize: 7.4, fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: 'var(--in-mute)', whiteSpace: 'nowrap' }
const PILDORA = { height: 26, borderRadius: 99, border: 'none', fontSize: 8.2, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }
/* «Información Personal» → «Información personal»: en la app los títulos van en minúscula después de la primera. */
const frase = t => t ? t.charAt(0) + t.slice(1).toLowerCase() : t

function Portada({ currentUser, ficha, onAbrir, onConfiguracion, onOrganigrama }) {
  const form = ficha?.form
  const [sinFoto, setSinFoto] = useState(false)
  const foto = useFotoPerfil(currentUser.name, form?.['1.9'], 120)
  return (
    <div style={{ padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <div style={{
        position: 'relative', overflow: 'hidden', background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)',
        padding: '16px 12px 12px', textAlign: 'center', display: 'grid', justifyItems: 'center', gap: 3, marginBottom: 14,
      }}>
        {/* Los dos círculos de la franja «hoy» del Inicio, en menta translúcido. */}
        <span aria-hidden="true" style={{ position: 'absolute', width: 150, height: 150, top: -70, right: -50, borderRadius: '50%', background: 'rgba(0,224,145,.10)' }} />
        <span aria-hidden="true" style={{ position: 'absolute', width: 80, height: 80, top: 30, right: -40, borderRadius: '50%', background: 'rgba(0,224,145,.07)' }} />
        <span style={{
          position: 'relative', width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', marginBottom: 4,
          boxShadow: '0 0 0 3px var(--in-carta), 0 0 0 4.5px #00E091, 0 8px 18px -8px rgba(12,45,64,.35)',
        }}>
          {sinFoto ? (
            <span style={{ width: '100%', height: '100%', background: currentUser.color, color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentUser.initials}
            </span>
          ) : (
            <img src={foto} alt={currentUser.name} onError={() => setSinFoto(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </span>
        <b style={{ position: 'relative', fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>{currentUser.name}</b>
        <small style={{ position: 'relative', fontSize: 8, color: 'var(--in-mute)' }}>
          {[currentUser.cargo, currentUser.area || ficha?.area].filter(Boolean).join(' · ')}
        </small>
        <small style={{ position: 'relative', fontSize: 8, color: 'var(--in-mute)' }}>
          {[ficha?.sucursal, ficha?.antiguedad].filter(Boolean).join(' · ')}
        </small>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, width: '100%', marginTop: 9 }}>
          <button type="button" onClick={onOrganigrama} style={{ ...PILDORA, background: 'var(--in-carta)', color: 'var(--in-texto)', boxShadow: 'var(--in-sombra)' }}>
            <Network size={10} /> Organigrama
          </button>
          <button type="button" onClick={onConfiguracion} style={{ ...PILDORA, background: '#00E091', color: '#0C2D40' }}>
            <Settings size={10} /> Configuración
          </button>
        </div>
      </div>

      {ficha ? (
        <>
          <div style={{ ...ROTULO, marginBottom: 7 }}>
            Mi ficha
            <span style={ROTULO_LADO}>Actualizada {ficha.actualizada}</span>
          </div>
          <div style={{ display: 'grid', gap: 7 }}>
            {pestanasCon(form).map(p => {
              const I = ICONOS[p.key] || FileText
              const renovar = p.key === 'documentos' ? porRenovar(form).length : 0
              return (
                <button key={p.key} type="button" onClick={() => onAbrir(p.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 9px',
                  border: 'none', borderRadius: 14, background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)',
                  fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--in-texto)',
                }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <I size={12} strokeWidth={1.8} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 9, fontWeight: 500 }}>{frase(p.titulo)}</span>
                    <span style={{ display: 'block', fontSize: 7.2, color: 'var(--in-mute)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {renovar ? resumenDe(form, p.key).split(' · ')[0] : resumenDe(form, p.key)}
                    </span>
                  </span>
                  {renovar > 0 && (
                    <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', whiteSpace: 'nowrap', color: 'var(--tx-ambar)', background: 'var(--tn-ambar)' }}>
                      {renovar} por renovar
                    </em>
                  )}
                  <ChevronRight size={11} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />
                </button>
              )
            })}
          </div>

          {preferenciasVisibles() && <PreferenciasPhone form={form} />}
        </>
      ) : (
        <div style={{ padding: 12, borderRadius: 14, background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)', fontSize: 7.8, color: 'var(--in-mute)', textAlign: 'center' }}>
          RR.HH. todavía no registró su ficha.
        </div>
      )}

      <div style={{ ...ROTULO, alignItems: 'center', margin: '14px 0 4px' }}>
        Mis publicaciones
        <span aria-label="Nueva publicación" style={{ width: 22, height: 22, borderRadius: '50%', background: '#00E091', color: '#0C2D40', display: 'grid', placeItems: 'center' }}>
          <Plus size={11} strokeWidth={2.6} />
        </span>
      </div>
    </div>
  )
}

/* ── LOS DATOS DE UNA SECCIÓN ABIERTA (opciones E1 y F3 elegidas, en plomo) ──
   En su orden de siempre y en **dos columnas fijas**: la etiqueta siempre a la izquierda (42 %) y el valor
   siempre empieza en la misma línea vertical; si es largo (un correo, una dirección), baja de renglón
   dentro de su columna. Antes lo corto iba a la derecha y lo largo apilado, y en una misma tarjeta se
   mezclaban las dos formas. Las preguntas de sí/no llevan su respuesta en una pildorita: «Sí» en navy
   sobre plomo, «No» en gris apagado. El detalle de una pregunta («Descripción de la alergia») es una fila
   más, con su título, pegada a su pregunta: sin línea entre las dos, para que se lean como una sola
   respuesta. Antes iba en una cajita plomo a lo ancho y sin título. Se pidió sin amarillo. */
const VALOR = { fontSize: 8.4, fontWeight: 500, color: 'var(--in-texto)', lineHeight: 1.35, overflowWrap: 'anywhere' }
function DatosPhone({ datos, ver, sinLineaArriba }) {
  const detalles = new Set(datos.map(d => d.detalle).filter(Boolean))
  const valor = d => (d.reservado && !ver ? '••••••' : d.valor)
  return datos.map((d, i) => {
    const esDetalle = detalles.has(d.key)
    return (
      <div key={d.key} style={{
        display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, alignItems: 'baseline',
        padding: esDetalle ? '0 10px 6px' : '6px 10px',
        borderTop: esDetalle || (i === 0 && sinLineaArriba) ? 'none' : '1px solid var(--in-linea)',
      }}>
        <span style={{ fontSize: 7.2, color: 'var(--in-mute)', lineHeight: 1.3 }}>{d.label}</span>
        {d.siNo ? (
          <em style={{
            justifySelf: 'start', fontStyle: 'normal', fontSize: 6.6, fontWeight: 700, borderRadius: 99, padding: '2px 9px',
            color: d.valor === 'Sí' ? 'var(--in-texto)' : 'var(--in-mute)', background: d.valor === 'Sí' ? 'var(--in-plomo)' : 'transparent',
            boxShadow: d.valor === 'Sí' ? 'none' : 'inset 0 0 0 1px var(--in-linea)',
          }}>{d.valor}</em>
        ) : (
          <span style={VALOR}>{valor(d)}</span>
        )}
      </div>
    )
  })
}

/* Una sección de la ficha, para leer. Acordeón con cabecera verde abierta / gris plegada,
   igual que el de la ficha de RR.HH. Los montos reservados se destapan a pedido. */
function Seccion({ s, abierta, onAlternar }) {
  const [ver, setVer] = useState(false)
  return (
    <div style={tarjeta(abierta && !s.vacia)}>
      <button onClick={onAlternar} aria-expanded={abierta} className={`mf-sec-cab${abierta && !s.vacia ? ' on' : ''}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 9px', border: 'none',
        fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
        borderRadius: abierta && !s.vacia ? '14px 14px 0 0' : 14,
      }}>
        <span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.titulo}</span>
        {s.vacia && <span style={{ fontSize: 7, color: 'var(--in-mute)' }}>Sin asignaciones</span>}
        <ChevronDown size={11} style={{ flexShrink: 0, color: 'var(--in-mute)', transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {abierta && !s.vacia && (
        <div>
          {s.reservada && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '5px 9px', borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setVer(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 99, border: 'none', background: 'var(--surface-card)', color: 'var(--text-heading)', fontSize: 6, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                {ver ? <EyeOff size={7} /> : <Eye size={7} />} {ver ? 'Ocultar montos' : 'Mostrar montos'}
              </button>
            </div>
          )}
          {s.bloques.map((b, bi) => (
            <div key={bi}>
              {b.titulo && (
                <div style={{ padding: '8px 10px 2px', borderTop: '1px solid var(--in-linea)', fontSize: 6.8, fontWeight: 700, color: 'var(--in-acento-txt)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{b.titulo}</div>
              )}
              <DatosPhone datos={b.datos} ver={ver} sinLineaArriba={!!b.titulo} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Datos({ pestana, form }) {
  // Lo que la empresa le deja editar (`configFicha`): el aviso le dice dónde cambiarlo.
  const suya = pestanaConEditables(pestana)
  const partes = partesDe(pestana, form)
  const recursos = pestana === 'recursos'
  const [abiertas, setAbiertas] = useState(() => new Set([0]))
  let idx = 0
  const alternar = i => setAbiertas(a => { const n = new Set(a); n.has(i) ? n.delete(i) : n.add(i); return n })
  return (
    <>
      <div style={{ display: 'flex', gap: 5, color: 'var(--in-mute)', fontSize: 7.4, lineHeight: 1.45 }}>
        <Info size={10} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{suya
          ? 'Estos datos los mantiene usted al día. Para cambiarlos, entre a Configuración › Editar perfil de usuario.'
          : recursos
            ? 'Lo que la empresa le entregó para trabajar.'
            : 'Estos datos los registró RR.HH.'}</span>
      </div>
      {partes.map(parte => (
        <div key={parte.key}>
          {/* Con una sola parte, su rótulo repetía el título de la pantalla. */}
          {parte.titulo && partes.length > 1 && <div style={{ margin: '12px 0 0', fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)' }}>{parte.titulo}</div>}
          {parte.secciones.map(s => {
            const i = idx++
            return <Seccion key={s.id} s={s} abierta={abiertas.has(i)} onAlternar={() => alternar(i)} />
          })}
        </div>
      ))}
    </>
  )
}

const ESTADO = {
  vigente: { t: 'Vigente', bg: 'var(--tn-verde)', c: 'var(--tx-verde)' },
  'por-vencer': { t: 'Por vencer', bg: 'var(--tn-ambar)', c: 'var(--tx-ambar)' },
  vencido: { t: 'Vencido', bg: 'var(--in-rojo-bg)', c: 'var(--in-rojo)' },
}

const esImagen = d => /\.(jpe?g|png|webp)$/i.test(d.archivo)

/* ── VER UN DOCUMENTO ──────────────────────────────────────────────────────
   Bottom sheet dentro del teléfono: fondo oscuro arriba, tarjeta blanca con la vista previa,
   los datos del documento y la descarga. */
/* ── VER UN DOCUMENTO (opción W2 elegida, «lo que importa arriba») ──
   Pantalla propia con «‹ Documentación» para volver: antes era una hoja que subía encima de la lista,
   con la lista asomando detrás, el nombre largo y «Descargar» escondido al fondo. Arriba, la tarjeta
   destacada (con los círculos de Perfil) dice lo que se viene a averiguar: si está al día y cuánto falta
   para que venza, con «Descargar» y, si vence y es de su Información Personal, «Subir la nueva». Debajo
   la hoja (tocarla la muestra entera) y los datos en las dos columnas de la ficha. */
const diasPara = fecha => {
  const [d, m, a] = String(fecha).split('/').map(Number)
  if (!a) return null
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  return Math.round((new Date(a, m - 1, d) - hoy) / 86400000)
}
const PILDORA_DOC = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, height: 28, borderRadius: 99, border: 'none', fontFamily: 'inherit', fontSize: 8.4, fontWeight: 600, cursor: 'pointer' }

function VisorPhone({ doc, titular, onVolver, onSubir }) {
  const [entera, setEntera] = useState(false)
  const e = ESTADO[doc.estado]
  const [titulo, tipo] = nombreCorto(doc)
  const dias = doc.vence ? diasPara(doc.vence) : null
  const renovar = (doc.estado === 'por-vencer' || doc.estado === 'vencido') && /personal/i.test(doc.grupo || '') && onSubir
  const fila = (t, v) => v && (
    <div style={{ display: 'grid', gridTemplateColumns: '42% 1fr', gap: 8, alignItems: 'baseline', padding: '6px 10px', borderTop: '1px solid var(--in-linea)' }}>
      <span style={{ fontSize: 7.2, color: 'var(--in-mute)' }}>{t}</span>
      <span style={{ fontSize: 8.4, fontWeight: 500, overflowWrap: 'anywhere' }}>{v}</span>
    </div>
  )
  return (
    <div style={{ padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <BarraVolver conTema texto="Documentación" onVolver={onVolver} />

      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', padding: '13px 13px 12px', marginBottom: 10 }}>
        <span aria-hidden="true" style={{ position: 'absolute', width: 150, height: 150, top: -70, right: -50, borderRadius: '50%', background: 'rgba(0,224,145,.10)' }} />
        <span aria-hidden="true" style={{ position: 'absolute', width: 80, height: 80, top: 30, right: -40, borderRadius: '50%', background: 'rgba(0,224,145,.07)' }} />
        <div style={{ position: 'relative', display: 'grid', gap: 2 }}>
          <span style={{ fontSize: 7.2, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--in-acento-txt)' }}>{tipo || doc.grupo}</span>
          <b style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-.01em' }}>{titulo}</b>
          {dias !== null && (
            <div style={{ display: 'grid', justifyItems: 'start', gap: 2, marginTop: 6 }}>
              {e && <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', background: e.bg, color: e.c }}>{e.t}</em>}
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.1 }}>{Math.abs(dias)} {Math.abs(dias) === 1 ? 'día' : 'días'}</span>
              <small style={{ fontSize: 7.6, color: 'var(--in-mute)' }}>{dias < 0 ? 'desde que venció' : 'para que venza'} · {doc.vence}</small>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: renovar ? '1fr 1fr' : '1fr', gap: 7, marginTop: 10 }}>
            <button type="button" style={{ ...PILDORA_DOC, background: renovar ? 'var(--in-carta)' : '#00E091', color: renovar ? 'var(--in-texto)' : '#0C2D40', boxShadow: renovar ? 'var(--in-sombra)' : 'none' }}>
              <Download size={10} /> Descargar
            </button>
            {renovar && (
              <button type="button" onClick={onSubir} style={{ ...PILDORA_DOC, background: '#00E091', color: '#0C2D40' }}>
                <Upload size={10} /> Subir la nueva
              </button>
            )}
          </div>
        </div>
      </div>

      {/* La hoja: recortada para que se vea qué es; tocarla la muestra entera. */}
      <button type="button" onClick={() => setEntera(v => !v)} aria-label={entera ? 'Achicar el documento' : 'Ver el documento entero'} style={{
        display: 'block', width: '100%', padding: 0, border: 'none', cursor: 'pointer', borderRadius: 14, overflow: 'hidden',
        background: 'var(--bg-secondary)', boxShadow: 'var(--in-sombra)', maxHeight: entera ? 'none' : 170, position: 'relative', marginBottom: 10,
      }}>
        <HojaDocumento doc={doc} titular={titular} chico />
        {!entera && <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 34, background: 'linear-gradient(transparent, var(--in-carta))', display: 'grid', placeItems: 'end center', paddingBottom: 5, fontSize: 7, fontWeight: 600, color: 'var(--in-acento-txt)' }}>Ver entero</span>}
      </button>

      <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', overflow: 'hidden' }}>
        <div style={{ marginTop: -1 }}>
          {fila('Archivo', doc.archivo)}
          {fila(doc.vence ? 'Emitida' : 'Emitido', doc.emite)}
          {fila('Vence', doc.vence)}
          {dias === null && e && fila('Estado', e.t)}
        </div>
      </div>
    </div>
  )
}

/* ── DOCUMENTACIÓN Y EXPEDIENTE (opción G2 elegida, «lo que hay que hacer, primero») ──
   Lo único que la persona tiene que hacer aquí es renovar lo que vence; lo demás es para consultar. Por
   eso lo que vence va arriba en una sola tarjeta destacada (con los círculos de Perfil): con un documento
   dice cuál y cuándo; con dos o más, «N documentos por renovar» y una línea por cada uno. Si alguno es de
   su Información Personal, «Subir la nueva» lleva a Editar perfil de usuario. Debajo, la lista con las
   piezas del Perfil: el nombre corto primero («Pasaporte», no «Documento de identidad secundario…
   · Pasaporte»), su círculo con aro menta e ícono, la etiqueta de estado a la derecha y una sola «›».
   Antes cada fila tenía un ojo (repetía tocar la fila) y una descarga que no era botón: descargar vive
   en la vista previa. */
const nombreCorto = d => {
  const partes = d.nombre.split(' · ')
  return partes.length > 1 ? [partes.pop(), partes.join(' · ').replace(/ \(anverso y reverso\)/, '')] : [d.nombre, null]
}
const iconoDoc = d => {
  const n = d.nombre.toLowerCase()
  if (esImagen(d)) return ImageIcon
  if (n.includes('licencia')) return Car
  if (n.includes('identidad') || n.includes('pasaporte')) return IdCard
  if (n.includes('domicilio')) return Home
  if (n.includes('uniforme')) return Shirt
  if (n.includes('equipo')) return n.includes('monitor') ? Monitor : Laptop
  return FileText
}
const ROTULO_DOC = { fontSize: 8.3, fontWeight: 600, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--in-texto)', margin: '14px 0 7px' }
const cuando = d => `${d.estado === 'vencido' ? 'Venció' : 'Vence'} el ${d.vence}`

function PorRenovar({ docs, onSubir }) {
  const uno = docs.length === 1
  const vencido = docs.some(d => d.estado === 'vencido')
  const suyos = docs.some(d => /personal/i.test(d.grupo || ''))
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--in-carta)', borderRadius: 18, boxShadow: 'var(--in-sombra)', padding: '11px 12px' }}>
        <span aria-hidden="true" style={{ position: 'absolute', width: 90, height: 90, top: -45, right: -30, borderRadius: '50%', background: 'rgba(0,224,145,.10)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: vencido ? 'var(--in-rojo-bg)' : 'var(--tn-ambar)', color: vencido ? 'var(--in-rojo)' : 'var(--tx-ambar)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <AlertTriangle size={14} />
          </span>
          <span style={{ flex: 1, minWidth: 0, display: 'grid', gap: 1 }}>
            <b style={{ fontSize: 9.6, fontWeight: 600 }}>{uno ? nombreCorto(docs[0])[0] : `${docs.length} documentos por renovar`}</b>
            <small style={{ fontSize: 7.4, color: 'var(--in-mute)', lineHeight: 1.4 }}>
              {uno ? `${cuando(docs[0])}. ` : ''}{suyos ? 'Suba la copia renovada para RR.HH.' : 'Renuévelos y envíe la copia a RR.HH.'}
            </small>
          </span>
        </div>
        {!uno && (
          <div style={{ position: 'relative', marginTop: 8, display: 'grid' }}>
            {docs.map(d => (
              <div key={d.key} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0', borderTop: '1px solid var(--in-linea)' }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 8.4, fontWeight: 500 }}>{nombreCorto(d)[0]}</span>
                <span style={{ fontSize: 7.2, color: d.estado === 'vencido' ? 'var(--in-rojo)' : 'var(--in-mute)', whiteSpace: 'nowrap' }}>{cuando(d).toLowerCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {suyos && onSubir && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 7 }}>
          <button type="button" onClick={onSubir} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 26, padding: '0 14px', borderRadius: 99, border: 'none', background: '#00E091', color: '#0C2D40', fontFamily: 'inherit', fontSize: 8.2, fontWeight: 600, cursor: 'pointer' }}>
            <Upload size={10} /> {uno ? 'Subir la nueva' : 'Subir las nuevas'}
          </button>
        </div>
      )}
    </div>
  )
}

function Documentos({ form, onSubir, onVer, onMisDocumentos }) {
  const [filtro, setFiltro] = useState('todos')
  const docs = documentosDe(form)
  const renovar = docs.filter(d => d.estado === 'por-vencer' || d.estado === 'vencido')
  const lista = filtro === 'todos' ? docs : renovar
  return (
    <>
      {renovar.length > 0 && <PorRenovar docs={renovar} onSubir={onSubir} />}

      <div style={{ display: 'flex', gap: 6 }}>
        {[['todos', `Todos · ${docs.length}`], ['renovar', `Por renovar · ${renovar.length}`]].map(([k, t]) => (
          <button key={k} type="button" onClick={() => setFiltro(k)} style={{
            padding: '5px 11px', borderRadius: 99, fontFamily: 'inherit', fontSize: 7.8, fontWeight: 600, cursor: 'pointer', border: 'none',
            boxShadow: 'var(--in-sombra)', background: filtro === k ? 'var(--in-pill)' : 'var(--in-carta)', color: filtro === k ? 'var(--in-pill-txt)' : 'var(--in-texto)',
          }}>{t}</button>
        ))}
      </div>

      {agrupar(lista, 'grupo').map(g => (
        <div key={g.titulo}>
          <div style={ROTULO_DOC}>{g.titulo}</div>
          <div style={{ background: 'var(--in-carta)', borderRadius: 15, boxShadow: 'var(--in-sombra)', overflow: 'hidden' }}>
            {g.items.map((d, i) => {
              const e = ESTADO[d.estado]
              const [titulo, tipo] = nombreCorto(d)
              const I = iconoDoc(d)
              const meta = d.vence ? `vence ${d.vence}` : d.emite ? `emitido ${d.emite}` : d.archivo
              return (
                <button key={d.key} type="button" onClick={() => onVer(d)} aria-label={`Ver ${d.nombre}`} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: 'none', borderTop: i ? '1px solid var(--in-linea)' : 'none',
                  background: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--in-texto)',
                }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <I size={12} strokeWidth={1.8} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 8.8, fontWeight: 500, lineHeight: 1.3 }}>{titulo}</span>
                    <span style={{ display: 'block', fontSize: 7, color: 'var(--in-mute)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tipo ? `${tipo} · ${meta}` : meta.charAt(0).toUpperCase() + meta.slice(1)}
                    </span>
                  </span>
                  {e && <em style={{ fontStyle: 'normal', fontSize: 6, fontWeight: 700, borderRadius: 99, padding: '2px 7px', whiteSpace: 'nowrap', background: e.bg, color: e.c }}>{e.t}</em>}
                  <ChevronRight size={11} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p style={{ margin: '12px 2px 0', fontSize: 7.2, color: 'var(--in-mute)', lineHeight: 1.5 }}>
        Los documentos de su Información Personal puede cambiarlos en Configuración › Editar perfil de usuario. Los demás los sube RR.HH.
      </p>
      {onMisDocumentos && <Puente titulo="Lo que RR.HH. le entrega" sub="Papeletas, certificados y contratos: en Zona HR › Mis documentos" onClick={onMisDocumentos} />}
    </>
  )
}

/* ── CONFIGURACIÓN › EDITAR PERFIL DE USUARIO ──────────────────────────────
   Su Información Personal —la suya y la de su familia— con los documentos que van en ella, y sus
   preferencias. Los campos están abiertos desde que se entra; los cambios se juntan y se guardan
   todos con «Guardar cambios», que aparece abajo apenas hay uno. Lo que vive en `useEdicionPerfil`
   es lo mismo que usa la web. */
const ROTULO_CAMPO = { display: 'block', fontSize: 6.5, color: 'var(--text-muted)', marginTop: 6 }

/* ── LAS LISTAS DEL TELÉFONO ─────────────────────────────────────────────────
   El desplegable de «Nuevo colaborador» (`Desplegable`) a la escala del teléfono: la lista se abre
   pegada debajo de su caja —o encima, si abajo no cabe—, con la elegida resaltada y su ✓, y un
   buscador arriba cuando las opciones ya no caben de un vistazo —el mismo umbral, ocho—. Se cierra
   eligiendo, tocando fuera o con Escape. Un `<select>` nativo aquí abría la lista de Windows,
   enorme y fuera del teléfono. */
const CON_BUSCADOR = 8
const ALTO_MENU = 150
const sinTildes = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* Abierto, cerrado y hacia dónde: abajo si cabe antes de lo que tapa el fondo del teléfono —la
   barra de «Guardar cambios» cuando está, si no la de pestañas—; si no cabe, arriba. */
function useMenuPhone(caja) {
  const [abierto, setAbierto] = useState(false)
  const [arriba, setArriba] = useState(false)
  useEffect(() => {
    if (!abierto) return
    const fuera = e => { if (!caja.current?.contains(e.target)) setAbierto(false) }
    const tecla = e => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', tecla) }
  }, [abierto, caja])
  const alternar = () => {
    if (!abierto) {
      const r = caja.current?.getBoundingClientRect()
      const marco = document.getElementById('marco-telefono')
      const m = marco?.getBoundingClientRect()
      // 70: la barra de pestañas de abajo, que tapa lo que cae detrás.
      const suelo = marco?.querySelector('[data-barra-guardar]')?.getBoundingClientRect().top ?? (m && m.bottom - 70)
      setArriba(!!(r && m && suelo - r.bottom < ALTO_MENU && r.top - m.top > ALTO_MENU))
    }
    setAbierto(a => !a)
  }
  return { abierto, arriba, alternar, cerrar: () => setAbierto(false) }
}

function MenuPhone({ opciones, valor, onElegir, arriba, quitable, buscaPh = 'Buscar…' }) {
  const [busca, setBusca] = useState('')
  const lista = useRef(null)
  // La elegida a la vista al abrir: entre doscientos países, Bolivia no está arriba.
  useEffect(() => {
    const l = lista.current, o = l?.querySelector('[aria-selected="true"]')
    if (o) l.scrollTop = o.offsetTop - l.clientHeight / 2 + o.offsetHeight / 2
  }, [])
  const q = sinTildes(busca.trim())
  const vistas = q ? opciones.filter(o => sinTildes(`${o.t} ${o.lateral || ''}`).includes(q)) : opciones
  return (
    <div className={`mf-dd-menu${arriba ? ' arriba' : ''}`}>
      {opciones.length > CON_BUSCADOR && (
        <label className="mf-dd-busca">
          <Search size={8} />
          <input autoFocus value={busca} onChange={e => setBusca(e.target.value)} placeholder={buscaPh} />
        </label>
      )}
      <div ref={lista} role="listbox" className="mf-dd-lista">
        {quitable && valor && !q && (
          <button type="button" className="mf-dd-op vacia" onClick={() => onElegir('')}>Sin elegir</button>
        )}
        {vistas.map(o => {
          const on = o.v === valor
          return (
            <button key={o.v} type="button" role="option" aria-selected={on} className={`mf-dd-op${on ? ' on' : ''}`} onClick={() => onElegir(o.v)}>
              {o.sigla && <span className="mf-dd-sigla">{o.sigla}</span>}
              <span className="mf-dd-txt">{o.t}</span>
              {o.lateral && <span className="mf-dd-lateral">{o.lateral}</span>}
              {on && <Check size={9} className="mf-dd-check" />}
            </button>
          )
        })}
        {!vistas.length && <p className="mf-dd-nada">Sin resultados para «{busca.trim()}».</p>}
      </div>
    </div>
  )
}

/* El disparador de una lista: se ve como las demás cajas, con lo elegido o «Elegir…» en gris. */
function ListaPhone({ campo, valor, onCambiar }) {
  const caja = useRef(null)
  const m = useMenuPhone(caja)
  const ops = (campo.opciones || []).map(o => (typeof o === 'string' ? { v: o, t: o } : { v: o.valor, t: o.etiqueta ?? o.valor }))
  const elegida = ops.find(o => o.v === valor)
  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <button type="button" onClick={m.alternar} aria-haspopup="listbox" aria-expanded={m.abierto} aria-label={`${campo.label}: ${elegida ? elegida.t : 'sin elegir'}`}
        className={`mf-dd-caja${m.abierto ? ' abierta' : ''}`} style={{
          ...CAMPO, display: 'flex', alignItems: 'center', gap: 4, textAlign: 'left', cursor: 'pointer',
          color: elegida || valor ? 'var(--text-heading)' : 'var(--icon-muted)',
        }}>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{elegida ? elegida.t : (valor || 'Elegir…')}</span>
        <ChevronDown size={9} style={{ flexShrink: 0, opacity: .6, transform: m.abierto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {m.abierto && <MenuPhone opciones={ops} valor={valor} arriba={m.arriba} quitable={!campo.requerido} onElegir={v => { onCambiar(v); m.cerrar() }} />}
    </div>
  )
}

/* Sí / No en dos botones, como en la ficha de RR.HH.: ninguno marcado es «todavía no contestó». */
function SiNoPhone({ campo, valor, onCambiar }) {
  return (
    <div role="group" aria-label={campo.label} style={{ display: 'flex', gap: 4, marginTop: 2 }}>
      {[{ v: 'si', t: 'Sí' }, { v: 'no', t: 'No' }].map(o => {
        const on = valor === o.v
        return (
          <button key={o.v} type="button" aria-pressed={on} onClick={() => onCambiar(o.v)} style={{
            flex: 1, height: 24, borderRadius: 6, fontFamily: 'inherit', fontSize: 8, fontWeight: on ? 600 : 500, cursor: 'pointer',
            border: `1px solid ${on ? 'var(--mf-verde-txt)' : 'var(--border-dark)'}`,
            background: on ? 'var(--green-bg)' : 'var(--surface-card)', color: on ? 'var(--mf-verde-txt)' : 'var(--text-heading)',
          }}>{o.t}</button>
        )
      })}
    </div>
  )
}

/* EL CELULAR, COMO EN LA FICHA DE RR.HH.: el código de país a la izquierda —«BO +591 ▾»— y el
   número a la derecha, en la misma caja. Se guarda igual que allá —«+591 71244890» y el país en
   `<clave>pais`— con las mismas funciones (`partirTelefono`), así que lo que se escribe aquí se lee
   bien en la web y en RR.HH. Ver `CampoTelefono`. El código abre la lista de países debajo. */
const PAISES = CODIGOS_PAIS.map(p => ({ v: p.sigla, t: p.pais, sigla: p.sigla, lateral: p.codigo }))
function TelefonoPhone({ campo, form, set }) {
  const caja = useRef(null)
  const m = useMenuPhone(caja)
  const porDefecto = paisPorSigla(campo.paisPorDefecto) || paisPorSigla('BO')
  const { pais, numero } = partirTelefono(form[campo.key], form[`${campo.key}pais`], porDefecto)
  const guardar = (p, n) => set(campo.key, n ? `${p.codigo} ${n}` : '')
  return (
    <div ref={caja} style={{ position: 'relative' }}>
      <span className={`mf-dd-caja${m.abierto ? ' abierta' : ''}`} style={{ ...CAMPO, display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
        <button type="button" onClick={m.alternar} aria-haspopup="listbox" aria-expanded={m.abierto} aria-label={`Código de país: ${pais.pais}, ${pais.codigo}`} style={{
          display: 'flex', alignItems: 'center', gap: 3, height: '100%', padding: '0 5px 0 6px', flexShrink: 0,
          border: 'none', borderRight: '1px solid var(--border-dark)', background: 'none', fontFamily: 'inherit', fontSize: 8, color: 'var(--text-heading)', cursor: 'pointer',
        }}>
          <span className="mf-dd-sigla">{pais.sigla}</span>
          <span>{pais.codigo}</span>
          <ChevronDown size={8} style={{ opacity: .6, transform: m.abierto ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
        </button>
        <input
          type="tel"
          inputMode="tel"
          aria-label={campo.label}
          value={numero}
          placeholder={campo.ph || 'Número'}
          onChange={e => {
            let v = e.target.value
            if (v.trim().startsWith(pais.codigo)) v = v.trim().slice(pais.codigo.length)
            guardar(pais, v.replace(/[^\d ]/g, '').replace(/^ +/, '').slice(0, 20))
          }}
          style={{ flex: 1, minWidth: 0, height: '100%', padding: '0 7px', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 8, color: 'var(--text-heading)', outline: 'none' }}
        />
      </span>
      {m.abierto && (
        <MenuPhone opciones={PAISES} valor={pais.sigla} arriba={m.arriba} buscaPh="Buscar país o código…" onElegir={sigla => {
          const nuevo = paisPorSigla(sigla)
          set(`${campo.key}pais`, nuevo.sigla)
          guardar(nuevo, numero)
          m.cerrar()
        }} />
      )}
    </div>
  )
}

/* Un campo abierto, con las reglas de la ficha de RR.HH. (`CampoFicha`): lista desplegable, sí/no
   en dos botones, fecha con su calendario, el celular con su código de país, descripción en
   varias líneas, cifras solas donde el campo es un número, y el resto a texto libre. */
function Entrada({ campo, valor, onCambiar, form, set }) {
  if (campo.telefono) return <TelefonoPhone campo={campo} form={form} set={set} />
  if (campo.tipo === 'siNo') return <SiNoPhone campo={campo} valor={valor} onCambiar={onCambiar} />
  if (campo.tipo === 'lista') return <ListaPhone campo={campo} valor={valor} onCambiar={onCambiar} />
  if (campo.tipo === 'texto') {
    return <textarea value={valor} rows={2} onChange={e => onCambiar(e.target.value)} placeholder={campo.ph} style={{ ...CAMPO, height: 'auto', padding: '5px 7px', resize: 'none' }} />
  }
  if (campo.html === 'date') return <FechaRueda valor={valor} onCambio={onCambiar} estilo={CAMPO} titulo={campo.label} />
  const cifras = campo.max != null || campo.numero
  return (
    <input
      type={campo.html === 'email' || campo.html === 'tel' ? campo.html : 'text'}
      inputMode={cifras ? 'numeric' : campo.html === 'tel' ? 'tel' : undefined}
      value={valor}
      onChange={e => onCambiar(cifras
        ? (v => (v === '' || campo.max == null ? v : String(Math.min(Number(v), campo.max))))(e.target.value.replace(/\D/g, '').replace(/^0+/, ''))
        : e.target.value)}
      placeholder={campo.ph}
      style={CAMPO}
    />
  )
}

/* Un documento de la sección: el archivo que hay, o que falta, y el botón para subir otro. En la
   demo se guarda su nombre, que es lo que la vista previa necesita. */
function EntradaArchivo({ campo, valor, onCambiar, onVer }) {
  const nombre = valor?.nombre
  const esImg = nombre && /\.(jpe?g|png|webp)$/i.test(nombre)
  const esPdf = nombre && /\.pdf$/i.test(nombre)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '6px 7px', borderRadius: 8, border: '1px dashed var(--border-dark)' }}>
      {nombre ? (
        <button onClick={() => onVer({ nombre: campo.label, archivo: nombre, grupo: 'Documentos personales' })} style={{
          flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6,
          padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: esImg ? 'var(--green-bg)' : esPdf ? '#fef2f2' : 'var(--bg-secondary)',
            color: esImg ? 'var(--mf-verde-txt)' : esPdf ? '#dc2626' : 'var(--text-muted)',
          }}>
            {esImg ? <ImageIcon size={12} /> : esPdf ? <span style={{ fontSize: 6, fontWeight: 800 }}>PDF</span> : <FileText size={11} />}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 7, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.3 }}>{campo.label}</span>
            <span style={{ display: 'block', fontSize: 6.5, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</span>
          </span>
        </button>
      ) : (
        <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={11} />
          </span>
          <span>
            <span style={{ display: 'block', fontSize: 7, fontWeight: 600, color: 'var(--text-heading)', lineHeight: 1.3 }}>{campo.label}</span>
            <span style={{ display: 'block', fontSize: 6.5, color: 'var(--icon-muted)', fontStyle: 'italic', marginTop: 1 }}>Sin archivo</span>
          </span>
        </span>
      )}
      <label style={{ ...BOTON, height: 20, padding: '0 8px', gap: 3, border: '1px solid var(--mf-verde-txt)', color: 'var(--mf-verde-txt)', background: 'var(--surface-card)', flexShrink: 0 }}>
        <Upload size={8} /> {nombre ? 'Cambiar' : 'Subir'}
        <input type="file" accept=".pdf,image/*" hidden onChange={e => { const a = e.target.files?.[0]; if (a) onCambiar({ nombre: a.name }); e.target.value = '' }} />
      </label>
    </div>
  )
}

function SeccionEditable({ s, ed, abierta, onAlternar, onVerDoc }) {
  return (
    <div style={{ ...tarjeta(abierta), overflow: 'visible' }}>
      <button onClick={onAlternar} aria-expanded={abierta} className={`mf-sec-cab${abierta ? ' on' : ''}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 9px', border: 'none',
        fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
        borderRadius: abierta ? '14px 14px 0 0' : 14,
      }}>
        <ChevronDown size={10} style={{ flexShrink: 0, opacity: .7, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        <span style={{ flex: 1, fontSize: 8, fontWeight: 600 }}>{s.titulo}</span>
      </button>
      {abierta && (
        <div style={{ padding: '8px 9px 10px' }}>
          {s.campos.map(c => {
            if (c.tipo === 'rotulo') {
              return (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 11, paddingTop: 7, borderTop: '1px solid var(--border)' }}>
                  <span style={{ flex: 1, fontSize: 6.5, fontWeight: 700, color: 'var(--mf-verde-txt)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{c.label}</span>
                  {c.instancia && c.total > c.minimo && (
                    <button onClick={() => ed.quitar(s, c)} aria-label={`Quitar ${c.label}`} style={{ width: 18, height: 18, borderRadius: 5, border: 'none', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>
                      <Trash2 size={9} />
                    </button>
                  )}
                </div>
              )
            }
            if (c.tipo === 'repetir') {
              const cuantos = cuantosHay(ed.vivo, c.grupo)
              if (cuantos >= (c.max || Infinity)) return null
              return (
                <button key={c.key} onClick={() => ed.agregar(c)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', marginTop: 9, height: 22, borderRadius: 7, border: '1px dashed var(--mf-verde-txt)', background: 'none', color: 'var(--mf-verde-txt)', fontSize: 7, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <Plus size={8} /> {cuantos === 0 && c.labelPrimero ? c.labelPrimero : c.label}
                </button>
              )
            }
            if (c.tipo === 'archivo') return <EntradaArchivo key={c.key} campo={c} valor={ed.vivo[c.key]} onCambiar={v => ed.set(c.key, v)} onVer={onVerDoc} />
            const falta = ed.faltan.some(x => x.key === c.key)
            /* Con botones dentro —lista, sí/no, celular— el rótulo no puede ser `<label>`: tocar
               su texto pulsaría el primer botón, y «¿Tiene alergias?» quedaría en «Sí». */
            const Rotulo = c.tipo === 'siNo' || c.tipo === 'lista' || c.telefono ? 'div' : 'label'
            return (
              <Rotulo key={c.key} style={ROTULO_CAMPO}>
                {c.label}{c.requerido && <span style={{ color: 'var(--mf-ven-txt)' }}> *</span>}
                <Entrada campo={c} valor={ed.vivo[c.key] ?? ''} onCambiar={v => ed.set(c.key, v)} form={ed.vivo} set={ed.set} />
                {falta && <span style={{ display: 'block', fontSize: 6, color: 'var(--mf-ven-txt)', marginTop: 2 }}>Este dato es obligatorio.</span>}
              </Rotulo>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* Una tablita de la ficha de RR.HH. (tipo `filas`) a la escala del teléfono: una fila numerada
   por elemento, se guarda como en la web, un renglón por fila. */
function TablaPhone({ campo, valor, onCambiar }) {
  const texto = String(valor || '')
  const filas = texto ? texto.split('\n') : ['']
  const guardar = nuevas => onCambiar(nuevas.join('\n'))
  return (
    <div style={{ marginTop: 9 }}>
      <div style={{ fontSize: 7, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>{campo.label}</div>
      <div style={{ border: '1px solid var(--border-soft)', borderRadius: 7, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 6, padding: '4px 7px', background: 'var(--bg-secondary)', fontSize: 6, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          <span style={{ width: 9 }}>#</span><span>{campo.columna}</span>
        </div>
        {filas.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 5px 3px 7px', borderTop: '1px solid var(--border-soft)' }}>
            <span style={{ width: 9, fontSize: 7, color: 'var(--text-muted)' }}>{i + 1}</span>
            <input value={f} placeholder={campo.ph} aria-label={`${campo.columna} ${i + 1}`}
              onChange={e => guardar(filas.map((x, j) => (j === i ? e.target.value : x)))}
              style={{ ...CAMPO, marginTop: 0, height: 20, flex: 1, border: 'none', padding: '0 2px', background: 'transparent' }} />
            {filas.length > 1 && (
              <button onClick={() => guardar(filas.filter((_, j) => j !== i))} aria-label={`Quitar ${campo.columna.toLowerCase()} ${i + 1}`}
                style={{ width: 16, height: 16, border: 'none', background: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>
                <Trash2 size={8} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => guardar([...filas, ''])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, width: '100%', marginTop: 5, height: 22, borderRadius: 7, border: '1px dashed var(--mf-verde-txt)', background: 'none', color: 'var(--mf-verde-txt)', fontSize: 7, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
        <Plus size={8} /> {campo.agregar}
      </button>
    </div>
  )
}

// La misma sección «Preferencias» que llena RR.HH., con su cuenta como en la web.
function PreferenciasEditables({ ed }) {
  const [abierta, setAbierta] = useState(true)
  const t = tarjetasDe('quien', ed.vivo, {}).find(x => x.id === 'preferencias')
  if (!t) return null
  const llenos = t.campos.filter(c => lineas(ed.vivo[c.key]).length).length
  return (
    <div style={{ ...tarjeta(abierta), overflow: 'visible' }}>
      <button onClick={() => setAbierta(a => !a)} aria-expanded={abierta} className={`mf-sec-cab${abierta ? ' on' : ''}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, width: '100%', padding: '8px 9px', border: 'none',
        fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', borderRadius: abierta ? '14px 14px 0 0' : 14,
      }}>
        <ChevronDown size={10} style={{ flexShrink: 0, opacity: .7, transform: abierta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        <span style={{ flex: 1, fontSize: 8, fontWeight: 600 }}>{t.titulo}</span>
        <span style={{ fontSize: 6.5, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: llenos === t.campos.length ? 'var(--green)' : 'var(--bg-secondary)', color: llenos === t.campos.length ? '#0C2D40' : 'var(--text-muted)' }}>
          {llenos} de {t.campos.length}
        </span>
      </button>
      {abierta && (
        <div style={{ padding: '8px 9px 10px' }}>
          <div style={{ fontSize: 6.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>{t.desc}</div>
          {t.campos.map(c => <TablaPhone key={c.key} campo={c} valor={ed.vivo[c.key]} onCambiar={v => ed.set(c.key, v)} />)}
        </div>
      )}
    </div>
  )
}

const ICONOS_ED = { quien: User, entorno: User, perfil: GraduationCap }
const PISTAS_ED = {
  quien: 'Nombre, CI, contacto, residencia, salud',
  entorno: 'Hijos y contactos de emergencia',
  perfil: 'Su formación y trayectoria',
}

function EditarPerfil({ form, onGuardar, onVolver, currentUser }) {
  const ed = useEdicionPerfil(form, onGuardar)
  const [parte, setParte] = useState(null)
  const [guardado, avisar] = useAvisoGuardado()
  const [abiertas, setAbiertas] = useState(() => new Set([0]))
  const [sinFoto, setSinFoto] = useState(false)
  const foto = useFotoPerfil(currentUser?.name, ed.vivo['1.9'], 80)
  const [docViendo, setDocViendo] = useState(null)
  const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)
  const entrar = i => { setParte(i); setAbiertas(new Set([0])); arriba() }
  const alternar = i => setAbiertas(a => { const n = new Set(a); n.has(i) ? n.delete(i) : n.add(i); return n })

  // Las partes que la empresa le deja editar (`configFicha`), y las preferencias si también.
  const categorias = [...ed.partes.map((p, i) => ({ titulo: p.titulo, pista: PISTAS_ED[p.key], I: ICONOS_ED[p.key] || User, idx: i })),
    ...(preferenciasEditables() ? [{ titulo: 'Preferencias', pista: 'Regalos y experiencias que le gustaría', I: Gift, idx: ed.partes.length }] : [])]

  const barraGuardar = (ed.hayCambios || guardado) && (
    <div data-barra-guardar style={{ position: 'sticky', bottom: 0, margin: '10px -2px 0', padding: '7px 8px', borderRadius: 10, background: 'var(--surface-card)', border: '1px solid var(--border-soft)', boxShadow: '0 -2px 10px rgba(12,45,64,.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
      {ed.hayCambios ? (
        <>
          <span style={{ flex: 1, fontSize: 6.5, color: ed.faltan.length ? 'var(--mf-ven-txt)' : 'var(--text-muted)', lineHeight: 1.35 }}>
            {ed.faltan.length
              ? `Complete ${ed.faltan.length === 1 ? 'el dato obligatorio' : `los ${ed.faltan.length} datos obligatorios`}`
              : ed.cuantos === 1 ? '1 cambio sin guardar' : ed.cuantos ? `${ed.cuantos} cambios sin guardar` : 'Cambios sin guardar'}
          </span>
          <GuardarCancelar textoGuardar="Guardar cambios" desactivado={ed.faltan.length > 0}
            onCancelar={ed.descartar} onGuardar={() => { if (ed.guardar()) avisar() }} />
        </>
      ) : <Guardado />}
    </div>
  )

  if (docViendo) {
    const doc = docViendo
    return (
      <VisorPhone doc={doc} titular={currentUser?.name} onVolver={() => setDocViendo(null)} />
    )
  }

  if (parte !== null) {
    const actual = ed.partes[parte]
    const cat = categorias.find(c => c.idx === parte)
    const verDoc = d => { setDocViendo(d); arriba() }
    return (
      <div style={{ padding: '2px 2px' }}>
        <BarraVolver conTema texto="Editar perfil" onVolver={() => { setParte(null); arriba() }} />
        <div style={{ fontSize: 6.5, color: 'var(--text-muted)' }}>Editar perfil de usuario</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 8 }}>{cat?.titulo}</div>

        {actual?.secciones.some(s => s.id === 'nombre') && currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 9px', background: 'var(--surface-card)', borderRadius: 11, border: '1px solid var(--border-soft)' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', border: '2px solid #19D992', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sinFoto ? (
                  <span style={{ width: '100%', height: '100%', background: currentUser.color, color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentUser.initials}
                  </span>
                ) : (
                  <img src={foto} alt={currentUser.name} onError={() => setSinFoto(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
              </div>
              <label style={{
                position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: '50%',
                background: 'var(--phone-green, #00E091)', border: '1.5px solid var(--surface-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Pencil size={7} style={{ color: '#0C2D40' }} />
                <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={e => {
                  const a = e.target.files?.[0]; e.target.value = ''
                  if (!a) return
                  // Se guarda el archivo de verdad, para que la foto nueva se vea aquí y en Mis documentos.
                  const clave = nuevaClaveArchivo()
                  guardarArchivo(clave, a).then(ok => { ed.set('1.9', { nombre: a.name, tipo: a.type, peso: a.size, clave: ok ? clave : null }); setSinFoto(false) })
                }} />
              </label>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--text-heading)' }}>{currentUser.name}</div>
              <div style={{ fontSize: 6.5, color: 'var(--text-muted)', marginTop: 1 }}>{currentUser.cargo}</div>
            </div>
          </div>
        )}

        {actual
          ? actual.secciones.map((s, i) => {
              // En una columna no hay mapa ni calculados que enseñar: se escribe lo que se puede escribir.
              const sec = { ...s, campos: s.campos.filter(c => c.key !== '1.9' && c.tipo !== 'mapa' && c.deducido === undefined) }
              return <SeccionEditable key={s.id} s={sec} ed={ed} abierta={abiertas.has(i)} onAlternar={() => alternar(i)} onVerDoc={verDoc} />
            })
          : <PreferenciasEditables ed={ed} />}
        {barraGuardar}
      </div>
    )
  }

  return (
    <div style={{ padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <BarraVolver conTema texto="Configuración" onVolver={() => ed.salir(onVolver)} />
      <div style={{ display: 'grid', marginBottom: 8 }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>Editar perfil de usuario</b>
        <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>Lo que usted mantiene al día</small>
      </div>

      <div style={{ display: 'flex', gap: 5, color: 'var(--in-mute)', fontSize: 7.4, lineHeight: 1.45 }}>
        <Info size={10} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Mantenga al día su información personal y sus documentos. Lo laboral lo registra RR.HH.</span>
      </div>

      {/* Las filas de Mi ficha: círculo con aro menta, sombra y títulos en minúscula. */}
      <div style={{ marginTop: 9, display: 'grid', gap: 7 }}>
        {categorias.map(cat => (
          <button key={cat.idx} onClick={() => entrar(cat.idx)} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 9px',
            border: 'none', borderRadius: 14, background: 'var(--in-carta)', boxShadow: 'var(--in-sombra)',
            fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--in-texto)',
          }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.4px #00E091', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <cat.I size={12} strokeWidth={1.8} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 9, fontWeight: 500 }}>{frase(cat.titulo)}</span>
              <span style={{ display: 'block', fontSize: 7.2, color: 'var(--in-mute)', marginTop: 1 }}>{cat.pista}</span>
            </span>
            <ChevronRight size={11} style={{ color: 'var(--in-suave)', flexShrink: 0 }} />
          </button>
        ))}
      </div>
      {barraGuardar}
    </div>
  )
}

export default function PerfilPhone({ currentUser, onOrganigrama, onMisDocumentos, vistaInicial }) {
  const { ficha, guardar } = useMiFicha(currentUser.name)
  // Desde Mis documentos se llega directo a Documentación.
  const [vista, setVista] = useState(vistaInicial || 'portada')
  /* El documento abierto es una pantalla propia: reemplaza a Documentación entera, con su «‹ Documentación». */
  const [doc, setDoc] = useState(null)
  const arriba = () => document.querySelector('.phone-scroll')?.scrollTo(0, 0)
  const abrir = v => { setVista(v); setDoc(null); arriba() }

  if (vista === 'config') {
    return <ConfiguracionPhone onVolver={() => abrir('portada')} onPerfilUsuario={ficha ? () => abrir('misdatos') : undefined} currentUser={currentUser} form={ficha?.form} />
  }
  if (vista === 'misdatos' && ficha) {
    return <EditarPerfil form={ficha.form} onGuardar={guardar} onVolver={() => abrir('config')} currentUser={currentUser} />
  }
  if (doc && ficha && vista === 'documentos') {
    return <VisorPhone doc={doc} titular={titularDe(ficha.form)} onVolver={() => { setDoc(null); arriba() }} onSubir={() => { setDoc(null); abrir('misdatos') }} />
  }
  if (vista === 'portada' || !ficha) {
    return <Portada currentUser={currentUser} ficha={ficha} onAbrir={abrir} onConfiguracion={() => abrir('config')} onOrganigrama={onOrganigrama} />
  }

  const p = pestanasCon(ficha.form).find(x => x.key === vista)
  return (
    <div style={{ padding: '2px 2px', fontFamily: 'Poppins, sans-serif', color: 'var(--in-texto)' }}>
      <BarraVolver conTema texto="Mi perfil" onVolver={() => abrir('portada')} />
      <div style={{ display: 'grid', marginBottom: 8 }}>
        <b style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-.01em' }}>{frase(p?.titulo)}</b>
        <small style={{ fontSize: 8.2, color: 'var(--in-mute)' }}>Mi ficha</small>
      </div>
      {vista === 'documentos'
        ? <Documentos form={ficha.form} onSubir={() => abrir('misdatos')} onVer={d => { setDoc(d); arriba() }} onMisDocumentos={onMisDocumentos} />
        : <Datos key={vista} pestana={vista} form={ficha.form} />}
    </div>
  )
}
