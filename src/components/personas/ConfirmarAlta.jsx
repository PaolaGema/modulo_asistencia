import { useEffect } from 'react'
import { Briefcase, CalendarDays, IdCard, UserPlus } from 'lucide-react'
import { useArchivoLocal } from '../../hooks/useArchivoLocal'
import { documentoDe, fechaCorta, inicialesDe, nombreDe } from '../../data/fichaColaborador'

/* ── «¿ESTÁ SEGURO DE DAR DE ALTA?» ───────────────────────────────────────
   Dar de alta es el único botón de la ficha que no se deshace con otro clic: la persona entra
   al directorio y, si eligió puesto, se sienta en él. Se pide una confirmación (29 sep 2026),
   pero no un «¿Está seguro?» a secas: el diálogo enseña A QUIÉN se da de alta —foto, nombre,
   cargo, documento y fecha de ingreso—, que es lo único que vale la pena mirar una última vez.

   SIN PALABRA QUE ESCRIBIR, a diferencia de `ConfirmarAccionModal`: aquello es para borrar, y
   esto es el final feliz de un trámite largo. Un clic basta; el diálogo sólo evita el clic
   distraído. */
export default function ConfirmarAlta({ form, puesto, onConfirmar, onCancelar }) {
  const nombre = nombreDe(form)
  const url = useArchivoLocal(form['1.9']?.clave || null)
  const cargo = puesto ? puesto.etiqueta.split(' · ')[0] : ''
  const area = puesto?.area || form['3.5'] || ''
  const ingreso = fechaCorta(form['3.25'])
  const documento = documentoDe(form)

  useEffect(() => {
    const alTeclear = e => { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCancelar])

  return (
    <div className="pl-overlay" onClick={onCancelar}>
      <div
        className="pl-modal pl-modal-sm cn-confirma"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cn-confirma-tit"
        aria-describedby="cn-confirma-desc"
        onClick={e => e.stopPropagation()}
      >
        <div className="cn-confirma-cab">
          <span className="cn-confirma-ico" aria-hidden="true"><UserPlus size={22} /></span>
          <h2 id="cn-confirma-tit">¿Está seguro de dar de alta?</h2>
          <p id="cn-confirma-desc">
            La persona pasa al directorio de colaboradores{cargo ? ' y ocupa su puesto en el organigrama' : ''}.
          </p>
        </div>

        <div className="cn-confirma-persona">
          <span className="cn-confirma-foto">
            {url
              ? <img src={url} alt="" />
              : <span aria-hidden="true">{inicialesDe(form) === '—' ? '?' : inicialesDe(form)}</span>}
          </span>
          <div className="cn-confirma-quien">
            <b>{nombre || 'Sin nombre'}</b>
            <ul>
              <li>
                <Briefcase size={13} aria-hidden="true" />
                {cargo ? <>{cargo}{area && <span> · {area}</span>}</> : <span>Sin puesto asignado todavía</span>}
              </li>
              {documento && <li><IdCard size={13} aria-hidden="true" />{documento}</li>}
              {ingreso && <li><CalendarDays size={13} aria-hidden="true" />Ingresa el {ingreso}</li>}
            </ul>
          </div>
        </div>

        <div className="pl-modal-footer">
          <button type="button" className="pl-btn-cancel" onClick={onCancelar}>
            Seguir revisando
          </button>
          <button type="button" className="pl-btn-save" autoFocus onClick={onConfirmar}>
            <UserPlus size={14} /> Sí, dar de alta
          </button>
        </div>
      </div>
    </div>
  )
}
