'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEscritura } from '@/hooks/useEscritura';
import { suscribirDatos } from '@/lib/eventos';
import { ERROR_SIN_CONFIG, supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Gasto } from '@/lib/types';

export type FiltroGastos = {
  desde: string;
  hasta: string;
  /** null = sin categoría, undefined = todas */
  categoriaId?: string | null;
};

export type NuevoGasto = {
  importe: number;
  categoria_id: string | null;
  descripcion: string | null;
  fecha: string;
};

export function useGastos({ desde, hasta, categoriaId }: FiltroGastos) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!supabaseConfigurado) {
      setError(ERROR_SIN_CONFIG);
      setCargando(false);
      return;
    }
    setCargando(true);
    let q = supabase
      .from('gastos')
      .select('id, importe, categoria_id, descripcion, fecha, creado_en')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: false })
      .order('creado_en', { ascending: false });

    if (categoriaId === null) q = q.is('categoria_id', null);
    else if (categoriaId) q = q.eq('categoria_id', categoriaId);

    const { data, error } = await q;
    if (error) setError(error.message);
    else {
      setError(null);
      setGastos((data ?? []).map((g) => ({ ...g, importe: Number(g.importe) })));
    }
    setCargando(false);
  }, [desde, hasta, categoriaId]);

  useEffect(() => {
    void recargar();
    return suscribirDatos(() => void recargar());
  }, [recargar]);

  const total = gastos.reduce((s, g) => s + g.importe, 0);

  return { gastos, total, cargando, error, recargar };
}

/**
 * Escrituras sueltas, sin depender de un rango concreto (las usa la hoja del FAB).
 * Cada función devuelve el mensaje de error o `null` si ha ido bien.
 */
export function useGuardarGasto() {
  const { escribir, guardando } = useEscritura();

  const crear = useCallback(
    (g: NuevoGasto) => escribir(() => supabase.from('gastos').insert(g).select('id')),
    [escribir],
  );

  const actualizar = useCallback(
    (id: string, g: NuevoGasto) =>
      escribir(() => supabase.from('gastos').update(g).eq('id', id).select('id')),
    [escribir],
  );

  const eliminar = useCallback(
    (id: string) => escribir(() => supabase.from('gastos').delete().eq('id', id).select('id')),
    [escribir],
  );

  return { crear, actualizar, eliminar, guardando };
}

/** Total gastado por mes ('YYYY-MM') en un rango; para el gráfico de evolución. */
export function useGastosPorMes(desde: string, hasta: string) {
  const [porMes, setPorMes] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!supabaseConfigurado) {
      setError(ERROR_SIN_CONFIG);
      setCargando(false);
      return;
    }
    setCargando(true);
    const { data, error } = await supabase
      .from('gastos')
      .select('importe, fecha')
      .gte('fecha', desde)
      .lte('fecha', hasta);

    if (error) setError(error.message);
    else {
      setError(null);
      const acc: Record<string, number> = {};
      for (const g of data ?? []) {
        const clave = String(g.fecha).slice(0, 7);
        acc[clave] = (acc[clave] ?? 0) + Number(g.importe);
      }
      setPorMes(acc);
    }
    setCargando(false);
  }, [desde, hasta]);

  useEffect(() => {
    void recargar();
    return suscribirDatos(() => void recargar());
  }, [recargar]);

  return { porMes, cargando, error };
}
