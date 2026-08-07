'use client';

import { euros, porcentaje } from '@/lib/format';

export type FilaRanking = { nombre: string; color: string; total: number; movimientos: number };

/** Reparto del mes en barras horizontales, de mayor a menor, con % sobre el total. */
export default function RankingCategorias({ filas }: { filas: FilaRanking[] }) {
  const total = filas.reduce((s, f) => s + f.total, 0);
  if (total === 0) return <p className="py-6 text-center text-sm text-gris-400">Sin gastos este mes.</p>;

  const maximo = Math.max(...filas.map((f) => f.total));

  return (
    <ul className="space-y-3">
      {filas.map((f) => (
        <li key={f.nombre}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: f.color }}
              />
              <span className="truncate text-[15px]">{f.nombre}</span>
              <span className="shrink-0 text-[12px] text-gris-400">
                {f.movimientos} {f.movimientos === 1 ? 'mov.' : 'movs.'}
              </span>
            </p>
            <p className="shrink-0 text-[15px] tabular-nums">
              <span className="font-semibold">{euros(f.total)}</span>
              <span className="text-gris-400"> · {porcentaje((f.total / total) * 100)}</span>
            </p>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gris-200">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((f.total / maximo) * 100, 2)}%`, backgroundColor: f.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
