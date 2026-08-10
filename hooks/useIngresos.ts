'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEscritura } from '@/hooks/useEscritura';
import { suscribirDatos } from '@/lib/eventos';
import { ERROR_SIN_CONFIG, supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Ingreso } from '@/lib/types';

export type NuevoIngreso = {
  importe: number;
  concepto: string | null;
  fecha: string;
};

/**
 * Ingresos del rango. `ingresos` no tiene categoria_id: son entradas sueltas con
 * concepto libre. Si Supabase devuelve un error de permisos es que a esta tabla le
 * falta la política de RLS que sí tienen las demás → se traduce a un aviso claro.
 */
export function useIngresos(desde: string, hasta: string) {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
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
      .from('ingresos')
      .select('id, importe, concepto, fecha, creado_en')
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: false })
      .order('creado_en', { ascending: false });

    if (error) {
      setError(
        /permission|policy|row-level/i.test(error.message)
          ? 'Sin acceso a la tabla ingresos: falta la política de RLS. Ejecuta supabase/schema.sql en Supabase.'
          : error.message,
      );
      setIngresos([]);
    } else {
      setError(null);
      setIngresos((data ?? []).map((i) => ({ ...i, importe: Number(i.importe) })));
    }
    setCargando(false);
  }, [desde, hasta]);

  useEffect(() => {
    void recargar();
    return suscribirDatos(() => void recargar());
  }, [recargar]);

  const total = ingresos.reduce((s, i) => s + i.importe, 0);

  return { ingresos, total, cargando, error, recargar };
}

/** Alta, edición y borrado de ingresos. Devuelven el mensaje de error o `null`. */
export function useGuardarIngreso() {
  const { escribir, guardando } = useEscritura();

  const crear = useCallback(
    (i: NuevoIngreso) => escribir(() => supabase.from('ingresos').insert(i).select('id')),
    [escribir],
  );

  const actualizar = useCallback(
    (id: string, i: NuevoIngreso) =>
      escribir(() => supabase.from('ingresos').update(i).eq('id', id).select('id')),
    [escribir],
  );

  const eliminar = useCallback(
    (id: string) => escribir(() => supabase.from('ingresos').delete().eq('id', id).select('id')),
    [escribir],
  );

  return { crear, actualizar, eliminar, guardando };
}
