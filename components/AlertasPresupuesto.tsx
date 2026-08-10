'use client';

import { useEffect, useMemo } from 'react';
import { useAjustes } from '@/hooks/useAjustes';
import { useCategorias } from '@/hooks/useCategorias';
import { useGastos } from '@/hooks/useGastos';
import { usePresupuestos } from '@/hooks/usePresupuestos';
import { type ConsumoCategoria, calcularAvisos, claveAviso, cuerpoAviso, tituloAviso } from '@/lib/alertas';
import { claveMes, rangoMes } from '@/lib/format';
import { notificar } from '@/lib/notificaciones';

/**
 * Vigila los presupuestos y avisa al cruzar el umbral o pasarse. No pinta nada.
 *
 * Solo monta el vigilante si las alertas están activadas, para no descargar gastos ni
 * presupuestos en cada pantalla cuando están apagadas (que es lo que viene por defecto).
 */
export default function AlertasPresupuesto() {
  const { ajustes, cargado } = useAjustes();
  if (!cargado || !ajustes.alertasActivas) return null;
  return <Vigilante umbral={ajustes.umbral} />;
}

function Vigilante({ umbral }: { umbral: number }) {
  /*
    Siempre el mes de hoy, no el mes que se esté consultando en pantalla: un aviso de
    presupuesto habla de lo que se está gastando ahora, no de lo que pasó en marzo.
  */
  const { mes, rango } = useMemo(() => {
    const hoy = new Date();
    return { mes: claveMes(hoy), rango: rangoMes(hoy) };
  }, []);

  const { categorias } = useCategorias();
  const { gastos } = useGastos(rango);
  const { presupuestos } = usePresupuestos(mes);

  const consumos = useMemo<ConsumoCategoria[]>(() => {
    const limites = new Map(presupuestos.map((p) => [p.categoria_id, p.limite] as const));
    const gastadoPorCat = new Map<string, number>();
    for (const g of gastos) {
      if (!g.categoria_id) continue;
      gastadoPorCat.set(g.categoria_id, (gastadoPorCat.get(g.categoria_id) ?? 0) + g.importe);
    }
    return categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      // Mismo criterio que el resto de la app: el límite del mes manda sobre el mensual.
      limite: limites.get(c.id) ?? c.presupuesto_mensual ?? 0,
      gastado: gastadoPorCat.get(c.id) ?? 0,
    }));
  }, [categorias, gastos, presupuestos]);

  useEffect(() => {
    for (const aviso of calcularAvisos(consumos, umbral)) {
      const clave = claveAviso(mes, aviso);
      if (window.localStorage.getItem(clave)) continue;

      /*
        Se marca antes de enviar, no después. El efecto se repite cada vez que se
        recargan los gastos, y esperar al `await` dejaría una ventana en la que el
        mismo aviso se envía dos veces. Perder un aviso porque el navegador lo
        rechace es preferible a repetirlo en bucle.
      */
      window.localStorage.setItem(clave, new Date().toISOString());
      void notificar(tituloAviso(aviso), cuerpoAviso(aviso), clave);
    }
  }, [consumos, umbral, mes]);

  return null;
}
