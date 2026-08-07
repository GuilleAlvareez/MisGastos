'use client';

import { diaMes, euros } from '@/lib/format';
import type { GastoResuelto } from '@/lib/types';

/** Fila de movimiento: barra de color de la categoría, descripción, categoría · fecha e importe. */
export default function GastoCard({ gasto }: { gasto: GastoResuelto }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        aria-hidden
        className="h-9 w-[3px] shrink-0 rounded-full"
        style={{ backgroundColor: gasto.categoriaColor }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium leading-tight">
          {gasto.descripcion || gasto.categoriaNombre}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-gris-400">
          {gasto.categoriaNombre} · {diaMes(gasto.fecha)}
        </p>
      </div>
      <p className="shrink-0 text-[15px] font-semibold tabular-nums">{euros(gasto.importe)}</p>
    </li>
  );
}
