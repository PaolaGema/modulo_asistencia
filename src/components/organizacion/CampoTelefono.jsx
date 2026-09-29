import Desplegable from '../layout/Desplegable'
import { CODIGOS_PAIS, paisPorSigla, partirTelefono } from '../../data/codigosPais'

/* ── EL CELULAR, CON SU CÓDIGO DE PAÍS EN LA MISMA CAJA ───────────────────
   Una sola caja con dos partes: a la izquierda el código —«BO +591 ▾»—, que abre la lista de
   países, y a la derecha el número. Es la forma que ya conoce cualquiera que haya dado su número
   en WhatsApp o en una tienda en línea, y deja el campo del mismo ancho que los de al lado.

   SE GUARDA ENTERO: «+591 71244890». Es lo que sirve para llamar o escribir sin armar nada, y un
   número guardado antes de que hubiera selector se sigue leyendo —`partirTelefono` le pone el
   código que corresponda—.

   EL PAÍS VA APARTE, en `<clave>pais`, porque varios comparten código: sin él, un «+1» no dice si
   es de Estados Unidos o de Canadá. Guardarlo también permite elegir el código antes de escribir
   el número sin que el campo cuente como lleno.

   EL CÓDIGO DE PARTIDA es el del país de residencia —`paisPorDefecto`, que pone la ficha—, y si
   no hay, el de Bolivia: es el que casi siempre toca, y el que la persona no tendrá que tocar. */
const OPCIONES = CODIGOS_PAIS.map(p => ({ valor: p.sigla, etiqueta: p.pais, sigla: p.sigla, lateral: p.codigo }))

export default function CampoTelefono({ id, campo, form, set, falta }) {
  const claveDelPais = `${campo.key}pais`
  const porDefecto = paisPorSigla(campo.paisPorDefecto) || paisPorSigla('BO')
  const { pais, numero } = partirTelefono(form[campo.key], form[claveDelPais], porDefecto)

  const guardar = (p, n) => set(campo.key, n ? `${p.codigo} ${n}` : '')

  return (
    <div className={`pl-tel${numero ? '' : ' vacio'}${falta || campo.excede ? ' falta' : ''}`}>
      <Desplegable
        valor={pais.sigla}
        opciones={OPCIONES}
        ariaLabel={`Código de país: ${pais.pais}, ${pais.codigo}`}
        claseBoton="pl-tel-codigo"
        anchoMenu={300}
        buscaPh="Buscar país o código…"
        contenido={() => (
          <>
            <span className="pl-dd-sigla">{pais.sigla}</span>
            <span>{pais.codigo}</span>
          </>
        )}
        onCambio={sigla => {
          const nuevo = paisPorSigla(sigla)
          set(claveDelPais, sigla)
          guardar(nuevo, numero)
        }}
      />
      <input
        id={id}
        className="pl-tel-numero"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={!!campo.requerido}
        value={numero}
        placeholder={campo.ph || 'Número'}
        /* Cifras y espacios, nada más: el «+» y el código ya los pone la caja de al lado, y quien
           pega «+591 712…» entero se queda con el número —el código pegado no se duplica—. */
        onChange={e => {
          let v = e.target.value
          if (v.trim().startsWith(pais.codigo)) v = v.trim().slice(pais.codigo.length)
          guardar(pais, v.replace(/[^\d ]/g, '').replace(/^ +/, '').slice(0, 20))
        }}
      />
    </div>
  )
}
