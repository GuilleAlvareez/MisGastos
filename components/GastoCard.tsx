'use client';

import { useHojaMovimiento } from '@/components/HojaMovimiento';
import { diaMes, euros } from '@/lib/format';
import type { GastoResuelto } from '@/lib/types';

/**
 * Fila de movimiento: barra de color de la categoría, descripción, categoría · fecha e importe.
 * Al pulsarla se abre la hoja de edición, así que la fila es el punto de entrada para
 * corregir o borrar un gasto en cualquier pantalla donde aparezca.
 */
export default function GastoCard({ gasto }: { gasto: GastoResuelto }) {
  const { abrir } = useHojaMovimiento();

  return (
    <li>
      <button
        type="button"
        onClick={() => abrir({ gasto })}
        aria-label={`Editar ${gasto.descripcion || gasto.categoriaNombre}, ${euros(gasto.importe)}`}
        className="flex w-full items-center gap-3 py-3 text-left transition-colors active:bg-gris-50"
      >
        <span
          aria-hidden
          className="h-9 w-[3px] shrink-0 rounded-full"
          style={{ backgroundColor: gasto.categoriaColor }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium leading-tight">
            {gasto.descripcion || gasto.categoriaNombre}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-gris-400">
            {gasto.categoriaNombre} · {diaMes(gasto.fecha)}
          </span>
        </span>
        <span className="shrink-0 text-[15px] font-semibold tabular-nums">{euros(gasto.importe)}</span>
      </button>
    </li>
  );
}
