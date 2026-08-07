'use client';

import { CLASES_ESTADO, ETIQUETA_ESTADO, estadoPresupuesto } from '@/lib/colores';
import { euros, eurosCortos } from '@/lib/format';

type Props = {
  nombre: string;
  color: string;
  gastado: number;
  limite: number;
  /** `compacta` es la variante del dashboard: una línea, sin insignia. */
  compacta?: boolean;
};

export default function PresupuestoBar({ nombre, color, gastado, limite, compacta }: Props) {
  const estado = estadoPresupuesto(gastado, limite);
  const pct = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0;
  const excedido = estado === 'excedido';
  const diferencia = limite - gastado;

  if (compacta) {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[15px]">{nombre}</p>
          <p className="shrink-0 text-[15px] tabular-nums">
            <span className="font-semibold">{euros(gastado)}</span>
            <span className="text-gris-400"> / {eurosCortos(limite)}</span>
          </p>
        </div>
        <Barra pct={pct} color={excedido ? undefined : color} excedido={excedido} />
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-[15px] font-medium">{nombre}</p>
        <span className={`insignia ml-auto ${CLASES_ESTADO[estado]}`}>{ETIQUETA_ESTADO[estado]}</span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="text-xl font-semibold tabular-nums">
          {euros(gastado)}
          <span className="text-[15px] font-normal text-gris-400"> / {eurosCortos(limite)}</span>
        </p>
        <p className="shrink-0 text-[13px] tabular-nums text-gris-400">
          {excedido
            ? `${euros(Math.abs(diferencia))} de más`
            : `Quedan ${euros(Math.max(diferencia, 0))}`}
        </p>
      </div>

      <Barra pct={pct} color={excedido ? undefined : color} excedido={excedido} />
    </div>
  );
}

function Barra({ pct, color, excedido }: { pct: number; color?: string; excedido: boolean }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gris-200">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${Math.max(pct, 2)}%`,
          backgroundColor: excedido ? '#B91C1C' : color,
        }}
      />
    </div>
  );
}
