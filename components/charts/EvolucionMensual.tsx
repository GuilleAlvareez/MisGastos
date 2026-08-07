'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { euros, eurosCortos } from '@/lib/format';

export type PuntoMes = { etiqueta: string; total: number };

/** Evolución del gasto en los últimos meses. Un solo trazo, en el color de acento. */
export default function EvolucionMensual({ datos }: { datos: PuntoMes[] }) {
  const hayDatos = datos.some((d) => d.total > 0);

  return (
    <div className="h-[168px] w-full">
      {hayDatos ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#E4E4E7" vertical={false} />
            <XAxis
              dataKey="etiqueta"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
              tickFormatter={(v: number) => eurosCortos(v)}
            />
            <Tooltip
              formatter={(v: number) => [euros(v), 'Gasto']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E4E4E7',
                fontSize: 13,
                boxShadow: 'none',
              }}
              labelStyle={{ color: '#52525B' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#1B3FCC"
              strokeWidth={2}
              dot={{ r: 3, fill: '#1B3FCC', strokeWidth: 0 }}
              activeDot={{ r: 4.5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="flex h-full items-center justify-center text-sm text-gris-400">
          Aún no hay gasto registrado en estos meses.
        </p>
      )}
    </div>
  );
}
