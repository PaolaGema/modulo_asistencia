import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowLeft, Building2, Warehouse, House, Clock, ShieldCheck, ScanFace, MapPin, Laptop, Flame, Download } from 'lucide-react'
import { useAsistencia } from '../../context/AsistenciaContext'
import { Cabecera, Vacio } from '../../components/documentacion/comunes'
import Avatar from '../../components/personas/Avatar'
import { EstadoChip, COLOR_ESTADO, Anillo } from '../../components/asistencia/comunes'
import DetalleJornada from '../../components/asistencia/DetalleJornada'
import { ESTADOS, MODALIDADES, DIAS_CORTOS, diasDelMes, diaISO, mesVecino, mesDe, nombreMes, hhmm, duracion, aFecha, descargarCSV } from '../../data/asistenciaData'

/* ── LA ASISTENCIA DE UNA PERSONA, MES A MES ──────────────────────────────
   Un calendario que se lee como un mapa de calor: verde a tiempo, ámbar tarde, azul con extra, rojo
   falta. Al lado, el saldo del mes —cuánto trabajó contra cuánto debía— que es lo que pide nómina, y
   lo que la persona ve en su propia app: los mismos números de los dos lados. */

const LEYENDA = ['presente', 'tarde', 'extra', 'incompleta', 'ausente', 'justificada']

export default function Persona() {
  const { id } = useParams()
  const at = useAsistencia()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const p = at.personaPorId.get(String(id))
  const mes = params.get('mes') || mesDe(at.hoy)
  const [detalle, setDetalle] = useState(null)

  const dias = useMemo(() => (p ? diasDelMes(mes).map(d => ({ d, j: d <= at.hoy ? at.jornadaDe(p, d) : null })) : []), [p, mes, at])  

  if (!p) {
    return (
      <div className="content-scroll">
        <Cabecera titulo="Asistencia" />
        <div className="dc-tarjeta"><Vacio Icono={Clock} titulo="No encontramos a esa persona" texto="Puede que se haya dado de baja o que el enlace esté incompleto.">
          <button type="button" className="pl-btn-new" onClick={() => navigate('/asistencia/registro')}>Ir al libro de asistencia</button>
        </Vacio></div>
      </div>
    )
  }

  const pasados = dias.filter(x => x.j && x.j.estado !== 'libre')
  const cerrados = pasados.filter(x => x.d !== at.hoy || x.j.salida != null)
  const sum = k => cerrados.reduce((s, x) => s + (x.j[k] || 0), 0)
  const trabajado = sum('trabajado'); const programado = sum('programado'); const tardanza = sum('tardanza')
  /* Horas extra = lo trabajado dentro de lo autorizado; quedarse sin autorización va aparte. */
  const extraTrabajada = sum('extra'); const extraAutorizada = sum('autorizado'); const fueraHorario = sum('fueraDeHorario')
  const cuenta = e => pasados.filter(x => x.j.estado === e).length
  const conEntrada = pasados.filter(x => x.j.entrada != null)
  const aTiempo = conEntrada.filter(x => !x.j.llegoTarde).length
  const puntualidad = conEntrada.length ? Math.round((aTiempo / conEntrada.length) * 100) : null
  const saldo = trabajado - programado
  /* La racha: días seguidos llegando a tiempo, contando hacia atrás desde el último marcado. */
  let racha = 0
  for (const x of [...conEntrada].reverse()) { if (x.j.llegoTarde) break; racha++ }

  const primero = diaISO(`${mes}-01`)
  const huecos = Array.from({ length: primero - 1 })
  const Ico = p.lugar?.tipo === 'centro' ? Warehouse : Building2
  const cerrado = !!at.cierres[mes]

  const exportar = () => descargarCSV(`asistencia_${p.name.replace(/\s+/g, '_')}_${mes}.csv`, [
    ['Fecha', 'Entrada', 'Salida', 'Trabajado (min)', 'Programado (min)', 'Tardanza (min)', 'Extra (min)', 'Estado', 'Justificación'],
    ...pasados.map(({ d, j }) => [d, hhmm(j.entrada), hhmm(j.salida), Math.round(j.trabajado), j.programado, Math.round(j.tardanza), Math.round(j.extra), ESTADOS[j.estado].label, j.justificacion ? `${j.justificacion.tipo}: ${j.justificacion.motivo}` : '']),
  ])

  return (
    <div className="content-scroll">
      <div>
        <button type="button" className="dc-btn dc-btn-sm" onClick={() => navigate(-1)}><ArrowLeft size={13} /> Volver</button>
      </div>

      <section className="at-ficha-cab">
        <Avatar persona={p} size={72} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="at-ficha-nom">{p.name}</h1>
          <div className="at-ficha-sub">{p.cargo} · {p.unidad}</div>
          <div className="at-ficha-tags">
            {p.lugar && <span className="at-tag"><Ico size={12} /> {p.lugar.nombre}{p.lugar.tipo === 'centro' ? ` · ${at.lugarPorId.get(p.lugar.sucursalId)?.nombre || ''}` : ''}</span>}
            {p.asig && <span className="at-tag">{p.asig.modalidad === 'remoto' ? <House size={12} /> : p.asig.modalidad === 'hibrido' ? <Laptop size={12} /> : <MapPin size={12} />} {MODALIDADES[p.asig.modalidad].label}{p.asig.modalidad === 'hibrido' ? ` · oficina ${p.asig.diasOficina.map(d => DIAS_CORTOS[d]).join(', ')}` : ''}</span>}
            {p.horario && <span className="at-tag"><Clock size={12} /> {p.horario.nombre} · {p.horario.modo === 'fijo' ? `${p.horario.entrada}–${p.horario.salida}` : `meta ${duracion(p.horario.meta)}`}</span>}
            {p.politica && <span className="at-tag"><ShieldCheck size={12} /> Política {p.politica.nombre}</span>}
            <span className="at-tag"><ScanFace size={12} /> {p.bio?.enrolado ? 'Rostro enrolado' : 'Rostro sin enrolar'}</span>
          </div>
        </div>
        {!p.asig && <button type="button" className="pl-btn-new" onClick={() => navigate('/asistencia/configuracion?ver=asignaciones')}>Asignar horario</button>}
      </section>

      <div className="at-ficha-grid">
        <section className="at-card">
          <div className="at-card-cab">
            <div className="at-dia-nav">
              <button type="button" aria-label="Mes anterior" onClick={() => setParams({ mes: mesVecino(mes, -1) }, { replace: true })}><ChevronLeft size={16} /></button>
              <span>{nombreMes(mes)}</span>
              <button type="button" aria-label="Mes siguiente" disabled={mes >= mesDe(at.hoy)} onClick={() => setParams({ mes: mesVecino(mes, 1) }, { replace: true })}><ChevronRight size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {cerrado && <span className="dc-chip dc-t-gris">Mes cerrado</span>}
              <button type="button" className="dc-btn dc-btn-sm" onClick={exportar}><Download size={13} /> CSV</button>
            </div>
          </div>
          <div className="at-card-cuerpo">
            <div className="at-cal">
              {[1, 2, 3, 4, 5, 6, 7].map(d => <div key={d} className="at-cal-dow">{DIAS_CORTOS[d]}</div>)}
              {huecos.map((_, i) => <div key={`h${i}`} className="at-cal-dia fuera" />)}
              {dias.map(({ d, j }) => {
                const futuro = !j
                const est = futuro ? 'libre' : j.estado
                return (
                  <button key={d} type="button" disabled={futuro} className={`at-cal-dia e-${est}${futuro ? ' futuro' : ''}${d === at.hoy ? ' hoy' : ''}${detalle === d ? ' sel' : ''}`}
                    onClick={() => setDetalle(d)} title={futuro ? '' : ESTADOS[est].label}>
                    <span className="at-cal-num">{aFecha(d).getDate()}</span>
                    {j && j.entrada != null && <span className="at-cal-h">{hhmm(j.entrada)}<br />{j.salida != null ? hhmm(j.salida) : '…'}</span>}
                    {j && j.entrada == null && est !== 'libre' && <span className="at-cal-h">{ESTADOS[est].label}</span>}
                  </button>
                )
              })}
            </div>
            <div className="at-cal-ley">
              {LEYENDA.map(e => <span key={e}><i style={{ background: COLOR_ESTADO[e] }} /> {ESTADOS[e].label}</span>)}
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="at-card">
            <div className="at-card-cab"><div><h2>Saldo del mes</h2><p>Lo trabajado contra lo programado, sin contar el día en curso.</p></div></div>
            <div className="at-card-cuerpo">
              <div className="at-saldo"><b className={saldo >= 0 ? 'pos' : 'neg'}>{duracion(saldo, { signo: true, corto: true })}</b><span className="dc-muted" style={{ fontSize: 13 }}>horas</span></div>
              <div className="at-progreso"><span style={{ width: `${programado ? Math.min(100, (trabajado / programado) * 100) : 0}%` }} /></div>
              <div className="dc-muted" style={{ fontSize: 12 }}>{duracion(trabajado)} de {duracion(programado)} programadas</div>
              <dl className="at-lista-datos">
                <dt>Días trabajados</dt><dd>{conEntrada.length}</dd>
                <dt>Ausencias</dt><dd style={{ color: cuenta('ausente') ? 'var(--dc-rojo)' : undefined }}>{cuenta('ausente')}</dd>
                <dt>Vacaciones y permisos</dt><dd>{cuenta('justificada')}</dd>
                <dt>Tardanza acumulada</dt><dd style={{ color: tardanza ? 'var(--dc-ambar)' : undefined }}>{duracion(tardanza)}</dd>
                <dt>Horas extra</dt><dd style={{ color: 'var(--dc-azul)' }}>{duracion(extraTrabajada)} <span className="dc-muted" style={{ fontWeight: 500 }}>de {duracion(extraAutorizada)} autorizadas</span></dd>
                <dt>Fuera de horario, sin autorización</dt><dd className="dc-muted">{duracion(fueraHorario)}</dd>
              </dl>
            </div>
          </section>

          <section className="at-card">
            <div className="at-card-cab"><div><h2>Puntualidad</h2><p>Días que llegó a tiempo, de los que marcó.</p></div></div>
            <div className="at-card-cuerpo" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Anillo size={120} grosor={12} total={conEntrada.length || 1} partes={[
                { key: 'a', valor: aTiempo, color: 'var(--at-verde)' },
                { key: 't', valor: conEntrada.length - aTiempo, color: 'var(--at-ambar)' },
              ]}>
                <b style={{ fontSize: 26 }}>{puntualidad == null ? '—' : `${puntualidad}%`}</b>
              </Anillo>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {racha > 1 && <span className="dc-chip dc-t-verde" style={{ alignSelf: 'flex-start' }}><Flame size={12} /> {racha} días seguidos a tiempo</span>}
                <span style={{ fontSize: 13, color: 'var(--text-heading)' }}><b>{aTiempo}</b> a tiempo · <b>{conEntrada.length - aTiempo}</b> tarde</span>
                <span className="dc-muted" style={{ fontSize: 12 }}>Tolerancia de {p.politica?.tolerancia ?? 10} min</span>
              </div>
            </div>
          </section>

          <section className="at-card">
            <div className="at-card-cab"><div><h2>Últimos días</h2></div></div>
            <ul className="at-feed" style={{ maxHeight: 260 }}>
              {[...pasados].reverse().slice(0, 6).map(({ d, j }) => (
                <li key={d} className="at-feed-item" onClick={() => setDetalle(d)} style={{ gridTemplateColumns: '1fr auto' }}>
                  <div>
                    <span className="at-feed-nom" style={{ textTransform: 'capitalize' }}>{DIAS_CORTOS[diaISO(d)]} {aFecha(d).getDate()}</span>
                    <span className="at-feed-sub">{j.entrada != null ? `${hhmm(j.entrada)} – ${hhmm(j.salida)} · ${duracion(j.trabajado)}` : j.justificacion?.tipo || 'Sin marcaciones'}</span>
                  </div>
                  <EstadoChip estado={j.estado} pequeno />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {detalle && <DetalleJornada persona={p} fecha={detalle} onCerrar={() => setDetalle(null)} />}
    </div>
  )
}
