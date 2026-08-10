'use client';

import { useEffect, useState } from 'react';
import { useGuardarCategoria } from '@/hooks/useCategorias';
import { useGuardarPresupuesto } from '@/hooks/usePresupuestos';
import { PALETA, colorCategoria } from '@/lib/colores';
import { importeANumero, mesLargo, numeroAImporte, sanearImporte } from '@/lib/format';
import type { Categoria } from '@/lib/types';

type Props = {
  /** null = alta de categoría nueva. */
  categoria: Categoria | null;
  /** Índice en la lista: decide el color de paleta que se propone por defecto. */
  indice: number;
  mes: Date;
  claveMes: string;
  /** Límite del mes activo en la tabla `presupuestos`, si esa categoría tiene uno. */
  limiteDelMes?: number;
  idPresupuestoMes: string | null;
  cerrar: () => void;
};

export default function HojaCategoria({
  categoria,
  indice,
  mes,
  claveMes,
  limiteDelMes,
  idPresupuestoMes,
  cerrar,
}: Props) {
  const categorias = useGuardarCategoria();
  const presupuestos = useGuardarPresupuesto();
  const editando = categoria !== null;

  const [nombre, setNombre] = useState(categoria?.nombre ?? '');
  const [color, setColor] = useState(
    categoria ? colorCategoria(categoria, indice) : PALETA[indice % PALETA.length],
  );
  const [mensual, setMensual] = useState(
    categoria?.presupuesto_mensual != null ? numeroAImporte(categoria.presupuesto_mensual) : '',
  );
  const [delMes, setDelMes] = useState(limiteDelMes != null ? numeroAImporte(limiteDelMes) : '');
  const [error, setError] = useState<string | null>(null);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const guardando = categorias.guardando || presupuestos.guardando;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    document.addEventListener('keydown', onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previo;
    };
  }, [cerrar]);

  const valido = nombre.trim().length > 0;

  /**
   * Los colores de las categorías que ya existían pueden venir de fuera de la app y
   * no estar en la paleta, así que el que trae la categoría se añade delante: si no,
   * ninguna muestra saldría marcada y parecería que no tiene color.
   */
  const enPaleta = (c: string) => PALETA.some((p) => p.toLowerCase() === c.toLowerCase());
  const colorOriginal = categoria ? colorCategoria(categoria, indice) : null;
  const colores = colorOriginal && !enPaleta(colorOriginal) ? [colorOriginal, ...PALETA] : PALETA;

  /** '' → null; texto inválido → null. Un presupuesto de 0 no tiene sentido. */
  const aLimite = (texto: string) => {
    const n = importeANumero(texto);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
  };

  async function guardar() {
    if (!valido || guardando) return;
    setError(null);

    const datos = {
      nombre: nombre.trim(),
      color,
      presupuesto_mensual: aLimite(mensual),
    };

    const msg = categoria
      ? await categorias.actualizar(categoria.id, datos)
      : await categorias.crear(datos);
    if (msg) {
      setError(msg);
      return;
    }

    // El límite del mes solo se toca al editar: una categoría nueva todavía no
    // tiene id con el que crear su registro en `presupuestos`.
    if (categoria) {
      const limite = aLimite(delMes);
      const msgPres = limite
        ? await presupuestos.fijar(idPresupuestoMes, {
            categoria_id: categoria.id,
            mes: claveMes,
            limite,
          })
        : idPresupuestoMes
          ? await presupuestos.eliminar(idPresupuestoMes)
          : null;
      if (msgPres) {
        setError(msgPres);
        return;
      }
    }

    cerrar();
  }

  async function borrar() {
    if (!categoria || guardando) return;
    const msg = await categorias.eliminar(categoria.id);
    if (msg) setError(msg);
    else cerrar();
  }

  return (
    <div className="fixed inset-0 z-50 flex md:items-center md:justify-center md:bg-gris-900/30 md:p-6">
      <div className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-tarjeta md:shadow-hoja">
        <header
          className="flex items-center justify-between border-b border-gris-200 px-4 py-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <button type="button" onClick={cerrar} className="text-[15px] text-gris-600">
            Cancelar
          </button>
          <p className="text-[15px] font-semibold">{editando ? 'Editar categoría' : 'Nueva categoría'}</p>
          <button
            type="button"
            onClick={guardar}
            disabled={!valido || guardando}
            className="text-[15px] font-semibold text-acento disabled:text-gris-400"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6">
          <label className="block">
            <span className="etiqueta">Nombre</span>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Comidas, Transporte…"
              className="campo mt-2"
            />
          </label>

          <p className="etiqueta mt-6">Color</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {colores.map((c) => {
              const elegido = c.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  aria-pressed={elegido}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    elegido ? 'ring-2 ring-gris-900 ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              );
            })}
          </div>

          <div className="mt-7 divide-y divide-gris-200 border-y border-gris-200">
            <FilaImporte
              etiqueta="Presupuesto mensual"
              pista="Se aplica a todos los meses que no tengan límite propio"
              valor={mensual}
              alCambiar={setMensual}
            />
            {editando && (
              <FilaImporte
                etiqueta={`Límite solo para ${mesLargo(mes).toLowerCase()}`}
                pista="Manda sobre el presupuesto mensual. Vacío = usar el de arriba"
                valor={delMes}
                alCambiar={setDelMes}
              />
            )}
          </div>

          {!editando && (
            <p className="mt-3 text-[13px] leading-snug text-gris-400">
              El límite de un mes concreto se pone al editar la categoría, cuando ya existe.
            </p>
          )}

          {editando && (
            <div className="mt-6">
              {confirmandoBorrado ? (
                <div className="rounded-tarjeta border border-excedido/20 bg-excedido-bg px-4 py-3">
                  <p className="text-[13px] leading-snug text-excedido">
                    Se eliminará «{categoria.nombre}» y sus presupuestos. Los gastos ya registrados
                    no se borran: pasan a aparecer como «Sin categoría».
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={borrar}
                      disabled={guardando}
                      className="flex-1 rounded-xl bg-excedido px-3 py-2.5 text-[15px] font-semibold text-white disabled:opacity-40"
                    >
                      {guardando ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoBorrado(false)}
                      className="flex-1 rounded-xl border border-gris-200 px-3 py-2.5 text-[15px] text-gris-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoBorrado(true)}
                  className="w-full py-2 text-[15px] font-medium text-excedido"
                >
                  Eliminar categoría
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-excedido-bg px-3 py-2 text-sm text-excedido">{error}</p>
          )}
        </div>

        <div
          className="border-t border-gris-200 px-5 py-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button type="button" onClick={guardar} disabled={!valido || guardando} className="boton-primario">
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Fila de importe en línea: etiqueta y pista a la izquierda, cifra a la derecha. */
function FilaImporte({
  etiqueta,
  pista,
  valor,
  alCambiar,
}: {
  etiqueta: string;
  pista: string;
  valor: string;
  alCambiar: (v: string) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-[15px]">{etiqueta}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-gris-400">{pista}</span>
      </span>
      <span className="flex shrink-0 items-baseline gap-1">
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => alCambiar(sanearImporte(e.target.value))}
          placeholder="—"
          className="w-20 bg-transparent text-right text-[15px] tabular-nums outline-none placeholder:text-gris-400"
        />
        <span className="text-[13px] text-gris-400">€</span>
      </span>
    </label>
  );
}
