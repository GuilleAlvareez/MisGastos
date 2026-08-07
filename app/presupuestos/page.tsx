'use client';

import { useMemo } from 'react';
import { Cargando, ErrorAviso, Vacio } from '@/components/Estado';
import Header from '@/components/layout/Header';
import { useMes } from '@/components/layout/MesContext';
import PresupuestoBar from '@/components/PresupuestoBar';
import { useCategorias } from '@/hooks/useCategorias';
import { useGastos } from '@/hooks/useGastos';
import { usePresupuestos } from '@/hooks/usePresupuestos';
import { CLASES_ESTADO, colorCategoria, estadoPresupuesto } from '@/lib/colores';
import { euros, eurosCortos, porcentaje } from '@/lib/format';

export default function Presupuestos() {
  const { rango, claveMes } = useMes();
  const { categorias, cargando: cargandoCat, error: errorCat } = useCategorias();
  const { gastos, cargando: cargandoGastos, error: errorGastos } = useGastos(rango);
  const { limitesDelMes, cargando: cargandoPres, error: errorPres } = usePresupuestos(claveMes);

  const filas = useMemo(() => {
    const gastadoPorCat = new Map<string, number>();
    for (const g of gastos) {
      if (!g.categoria_id) continue;
      gastadoPorCat.set(g.categoria_id, (gastadoPorCat.get(g.categoria_id) ?? 0) + g.importe);
    }
    return categorias
      .map((c, i) => ({
        id: c.id,
        nombre: c.nombre,
        color: colorCategoria(c, i),
        // El registro de `presupuestos` del mes manda; si no existe, fallback a presupuesto_mensual.
        limite: limitesDelMes.get(c.id) ?? c.presupuesto_mensual ?? 0,
        gastado: gastadoPorCat.get(c.id) ?? 0,
      }))
      .filter((f) => f.limite > 0)
      .sort((a, b) => b.gastado / b.limite - a.gastado / a.limite);
  }, [categorias, gastos, limitesDelMes]);

  const totalGastado = filas.reduce((s, f) => s + f.gastado, 0);
  const totalLimite = filas.reduce((s, f) => s + f.limite, 0);
  const pctGlobal = totalLimite > 0 ? (totalGastado / totalLimite) * 100 : 0;
  const estadoGlobal = estadoPresupuesto(totalGastado, totalLimite);

  const error = errorGastos ?? errorCat ?? errorPres;
  const cargando = cargandoGastos || cargandoCat || cargandoPres;

  return (
    <>
      <Header titulo="Presupuestos" />

      {error && <ErrorAviso mensaje={error} />}

      {cargando ? (
        <Cargando filas={5} />
      ) : filas.length === 0 ? (
        <Vacio mensaje="Ninguna categoría tiene presupuesto. Asígnalo desde Categorías." />
      ) : (
        <>
          <section className="tarjeta mt-5 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xl font-semibold tabular-nums">
                {euros(totalGastado)}
                <span className="text-[15px] font-normal text-gris-400"> de {eurosCortos(totalLimite)}</span>
              </p>
              <span className={`insignia ${CLASES_ESTADO[estadoGlobal]}`}>
                {porcentaje(pctGlobal)} consumido
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gris-200">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.min(Math.max(pctGlobal, 2), 100)}%`,
                  backgroundColor: estadoGlobal === 'excedido' ? '#B91C1C' : '#B9791A',
                }}
              />
            </div>
          </section>

          <section className="mt-3 divide-y divide-gris-200">
            {filas.map((f) => (
              <PresupuestoBar
                key={f.id}
                nombre={f.nombre}
                color={f.color}
                gastado={f.gastado}
                limite={f.limite}
              />
            ))}
          </section>
        </>
      )}
    </>
  );
}
