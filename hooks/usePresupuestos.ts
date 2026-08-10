'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEscritura } from '@/hooks/useEscritura';
import { suscribirDatos } from '@/lib/eventos';
import { ERROR_SIN_CONFIG, supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Presupuesto } from '@/lib/types';

/**
 * Presupuestos del mes indicado ('YYYY-MM-01'). La tabla es un histórico con
 * un registro por (categoria_id, mes); si no hay registro para el mes, la página
 * hace fallback a categorias.presupuesto_mensual.
 */
export function usePresupuestos(mes: string) {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
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
      .from('presupuestos')
      .select('id, categoria_id, mes, limite, creado_en')
      .eq('mes', mes);

    if (error) setError(error.message);
    else {
      setError(null);
      setPresupuestos((data ?? []).map((p) => ({ ...p, limite: Number(p.limite) })));
    }
    setCargando(false);
  }, [mes]);

  useEffect(() => {
    void recargar();
    return suscribirDatos(() => void recargar());
  }, [recargar]);

  /** Mapa categoria_id → límite del mes. */
  const limitesDelMes = new Map(presupuestos.map((p) => [p.categoria_id, p.limite] as const));

  /** Mapa categoria_id → id del registro, para poder editarlo o borrarlo. */
  const idsDelMes = new Map(presupuestos.map((p) => [p.categoria_id, p.id] as const));

  return { presupuestos, limitesDelMes, idsDelMes, cargando, error, recargar };
}

/** Fija o quita el límite de una categoría para un mes concreto. */
export function useGuardarPresupuesto() {
  const { escribir, guardando } = useEscritura();

  /**
   * Se pasa el `id` del registro del mes si ya existía. Se resuelve como update o
   * insert en lugar de `upsert` a propósito: el upsert necesitaría que la tabla
   * tuviera declarado el unique (categoria_id, mes), y no se puede dar por hecho
   * en una base que ya venía montada.
   */
  const fijar = useCallback(
    (id: string | null, datos: { categoria_id: string; mes: string; limite: number }) =>
      escribir(() =>
        id
          ? supabase.from('presupuestos').update({ limite: datos.limite }).eq('id', id).select('id')
          : supabase.from('presupuestos').insert(datos).select('id'),
      ),
    [escribir],
  );

  const eliminar = useCallback(
    (id: string) => escribir(() => supabase.from('presupuestos').delete().eq('id', id).select('id')),
    [escribir],
  );

  return { fijar, eliminar, guardando };
}
