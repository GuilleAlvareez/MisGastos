'use client';

import { useEffect, useState } from 'react';
import { supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Ingreso } from '@/lib/types';

/**
 * Ingresos del rango. `ingresos` no tiene categoria_id: son entradas sueltas con concepto libre.
 * Si Supabase devuelve un error de permisos, es que a esta tabla le falta la política de RLS
 * abierta que sí tienen categorias/gastos/presupuestos → se expone en `error` para avisar.
 */
export function useIngresos(desde: string, hasta: string) {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (!supabaseConfigurado) {
        setCargando(false);
        return;
      }
      setCargando(true);
      const { data, error } = await supabase
        .from('ingresos')
        .select('id, importe, concepto, fecha, creado_en')
        .gte('fecha', desde)
        .lte('fecha', hasta)
        .order('fecha', { ascending: false });

      if (!vivo) return;
      if (error) {
        setError(
          /permission|policy|row-level/i.test(error.message)
            ? 'Sin acceso a la tabla ingresos: falta la política de RLS abierta en Supabase.'
            : error.message,
        );
        setIngresos([]);
      } else {
        setError(null);
        setIngresos((data ?? []).map((i) => ({ ...i, importe: Number(i.importe) })));
      }
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [desde, hasta]);

  const total = ingresos.reduce((s, i) => s + i.importe, 0);

  return { ingresos, total, cargando, error };
}
