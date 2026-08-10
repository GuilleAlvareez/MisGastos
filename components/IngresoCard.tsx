'use client';

import { useHojaMovimiento } from '@/components/HojaMovimiento';
import { diaMes, euros } from '@/lib/format';
import type { Ingreso } from '@/lib/types';

/**
 * Fila de ingreso, gemela de <GastoCard /> para que la lista se lea igual: pulsarla
 * abre la edición. Se distingue por el verde y el signo `+` del importe, que es el
 * mismo verde que usa el saldo positivo en el Resumen.
 */
export default function IngresoCard({ ingreso }: { ingreso: Ingreso }) {
  const { abrir } = useHojaMovimiento();

  return (
    <li>
      <button
        type="button"
        onClick={() => abrir({ ingreso })}
        aria-label={`Editar ${ingreso.concepto || 'ingreso'}, ${euros(ingreso.importe)}`}
        className="flex w-full items-center gap-3 py-3 text-left transition-colors active:bg-gris-50"
      >
        <span aria-hidden className="h-9 w-[3px] shrink-0 rounded-full bg-rango" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium leading-tight">
            {ingreso.concepto || 'Ingreso'}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-gris-400">
            {diaMes(ingreso.fecha)}
          </span>
        </span>
        <span className="shrink-0 text-[15px] font-semibold tabular-nums text-rango">
          +{euros(ingreso.importe)}
        </span>
      </button>
    </li>
  );
}
