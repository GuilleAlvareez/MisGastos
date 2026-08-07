'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { euros } from '@/lib/format';

export type PorcionCategoria = { nombre: string; color: string; total: number };

/** Donut de reparto por categoría + leyenda con importes (las sobrantes se agregan). */
export default function GastosPorCategoria({
  datos,
  visiblesEnLeyenda = 3,
}: {
  datos: PorcionCategoria[];
  visiblesEnLeyenda?: number;
}) {
  if (datos.length === 0) {
    return <p className="py-6 text-center text-sm text-gris-400">Sin gastos este mes.</p>;
  }

  const visibles = datos.slice(0, visiblesEnLeyenda);
  const resto = datos.slice(visiblesEnLeyenda);
  const totalResto = resto.reduce((s, d) => s + d.total, 0);

  return (
    <div className="flex items-center gap-5">
      <div className="h-[132px] w-[132px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              dataKey="total"
              nameKey="nombre"
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {datos.map((d) => (
                <Cell key={d.nombre} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {visibles.map((d) => (
          <li key={d.nombre} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm">{d.nombre}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{euros(d.total)}</span>
          </li>
        ))}
        {resto.length > 0 && (
          <li className="pt-0.5 text-[13px] text-gris-400">
            + {euros(totalResto)} en {resto.length === 1 ? 'otra categoría' : `otras ${resto.length} categorías`}
          </li>
        )}
      </ul>
    </div>
  );
}
