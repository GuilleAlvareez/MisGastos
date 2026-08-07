'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { claveMes, primerDia, rangoMes } from '@/lib/format';

type MesCtx = {
  mes: Date; // siempre día 1
  claveMes: string; // 'YYYY-MM-01' para la tabla presupuestos
  rango: { desde: string; hasta: string };
  irA: (d: Date) => void;
  avanzar: (n: number) => void;
  esMesActual: boolean;
};

const Ctx = createContext<MesCtx | null>(null);

export function MesProvider({ children }: { children: React.ReactNode }) {
  const [mes, setMes] = useState(() => primerDia(new Date()));

  const avanzar = useCallback((n: number) => {
    setMes((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  }, []);

  const irA = useCallback((d: Date) => setMes(primerDia(d)), []);

  const valor = useMemo<MesCtx>(() => {
    const hoy = primerDia(new Date());
    return {
      mes,
      claveMes: claveMes(mes),
      rango: rangoMes(mes),
      irA,
      avanzar,
      esMesActual: mes.getTime() >= hoy.getTime(),
    };
  }, [mes, irA, avanzar]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useMes() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMes debe usarse dentro de <MesProvider>');
  return ctx;
}
