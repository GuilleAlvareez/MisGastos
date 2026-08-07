'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { euros } from '@/lib/format';

export type BarraDia = { dia: string; total: number };

/** En qué días de la semana se gasta. El día más caro se pinta en acento. */
export default function GastoPorDiaSemana({ datos }: { datos: BarraDia[] }) {
  const maximo = Math.max(...datos.map((d) => d.total));

  if (maximo === 0) {
    return (
      <p className="flex h-[132px] items-center justify-center text-sm text-gris-400">
        Sin gastos este mes.
      </p>
    );
  }

  return (
    <div className="h-[132px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datos} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="dia"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#A1A1AA', fontSize: 11 }}
            dy={4}
          />
          <Tooltip
            formatter={(v: number) => [euros(v), 'Gasto']}
            cursor={{ fill: '#F4F4F5' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #E4E4E7',
              fontSize: 13,
              boxShadow: 'none',
            }}
            labelStyle={{ color: '#52525B' }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {datos.map((d) => (
              <Cell key={d.dia} fill={d.total === maximo ? '#1B3FCC' : '#E4E4E7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
