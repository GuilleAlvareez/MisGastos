'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import GastosPorCategoria, { type PorcionCategoria } from '@/components/charts/GastosPorCategoria';
import { Cargando, ErrorAviso, Vacio } from '@/components/Estado';
import GastoCard from '@/components/GastoCard';
import Header from '@/components/layout/Header';
import { useMes } from '@/components/layout/MesContext';
import PresupuestoBar from '@/components/PresupuestoBar';
import { useCategorias } from '@/hooks/useCategorias';
import { useGastos, useGastosPorMes } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';
import { usePresupuestos } from '@/hooks/usePresupuestos';
import { GRIS_SIN_CATEGORIA, SIN_CATEGORIA, colorCategoria, resolverGastos } from '@/lib/colores';
import { aISO, euros, primerDia, soloMes, sumarMeses, ultimoDia } from '@/lib/format';

export default function Dashboard() {
  const { mes, rango, claveMes } = useMes();
  const { categorias, cargando: cargandoCat, error: errorCat } = useCategorias();
  const { gastos, total, cargando: cargandoGastos, error: errorGastos } = useGastos(rango);
  const { total: totalIngresos, error: errorIngresos } = useIngresos(rango.desde, rango.hasta);
  const { limitesDelMes } = usePresupuestos(claveMes);

  // Solo hacen falta dos meses: el activo y el anterior, para la comparativa del encabezado.
  const ventana = useMemo(
    () => ({ desde: aISO(primerDia(sumarMeses(mes, -1))), hasta: aISO(ultimoDia(mes)) }),
    [mes],
  );
  const { porMes, error: errorComparativa } = useGastosPorMes(ventana.desde, ventana.hasta);

  const resueltos = useMemo(() => resolverGastos(gastos, categorias), [gastos, categorias]);

  // Reparto por categoría, de mayor a menor.
  const porCategoria = useMemo<PorcionCategoria[]>(() => {
    const acc = new Map<string, PorcionCategoria>();
    categorias.forEach((c, i) => {
      acc.set(c.id, { nombre: c.nombre, color: colorCategoria(c, i), total: 0 });
    });
    for (const g of gastos) {
      const clave = g.categoria_id ?? '__sin__';
      const actual =
        acc.get(clave) ?? { nombre: SIN_CATEGORIA, color: GRIS_SIN_CATEGORIA, total: 0 };
      acc.set(clave, { ...actual, total: actual.total + g.importe });
    }
    return [...acc.values()].filter((p) => p.total > 0).sort((a, b) => b.total - a.total);
  }, [gastos, categorias]);

  // Comparativa con el mes anterior, si hay dato.
  const claveAnterior = aISO(sumarMeses(mes, -1)).slice(0, 7);
  const totalAnterior = porMes[claveAnterior];
  const variacion =
    totalAnterior && totalAnterior > 0 ? Math.round(((total - totalAnterior) / totalAnterior) * 100) : null;

  // Presupuestos del mes: límite de la tabla presupuestos y, si no hay, presupuesto_mensual.
  const presupuestos = useMemo(() => {
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
        limite: limitesDelMes.get(c.id) ?? c.presupuesto_mensual ?? 0,
        gastado: gastadoPorCat.get(c.id) ?? 0,
      }))
      .filter((p) => p.limite > 0)
      .sort((a, b) => b.gastado / b.limite - a.gastado / a.limite);
  }, [categorias, gastos, limitesDelMes]);

  const error = errorGastos ?? errorCat ?? errorComparativa;
  const cargando = cargandoGastos || cargandoCat;
  const saldo = totalIngresos - total;

  return (
    <>
      <Header titulo="Resumen" />

      {error && <ErrorAviso mensaje={error} />}

      <section className="mt-5">
        <p className="etiqueta">Gasto total</p>
        <div className="mt-1 flex items-center gap-3">
          <p className="cifra">{euros(total)}</p>
          {variacion !== null && (
            <span
              className={`insignia ${
                variacion > 0 ? 'bg-excedido-bg text-excedido' : 'bg-rango-bg text-rango'
              }`}
            >
              {variacion > 0 ? '+' : ''}
              {variacion}% vs {soloMes(sumarMeses(mes, -1))}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-8">
          <div>
            <p className="etiqueta">Ingresos</p>
            <p className="mt-0.5 text-[15px] font-medium tabular-nums">
              {errorIngresos ? '—' : euros(totalIngresos)}
            </p>
          </div>
          <div>
            <p className="etiqueta">Saldo</p>
            <p
              className={`mt-0.5 text-[15px] font-semibold tabular-nums ${
                saldo < 0 ? 'text-excedido' : 'text-rango'
              }`}
            >
              {errorIngresos ? '—' : `${saldo >= 0 ? '+' : ''}${euros(saldo)}`}
            </p>
          </div>
        </div>
        {errorIngresos && <p className="mt-2 text-[12px] text-gris-400">{errorIngresos}</p>}
      </section>

      {cargando ? (
        <Cargando filas={4} />
      ) : (
        <>
          <section className="tarjeta mt-5 p-4">
            <GastosPorCategoria datos={porCategoria} />
          </section>

          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">Presupuestos</h2>
              <Link href="/presupuestos" className="text-[13px] font-medium text-acento">
                Ver todos
              </Link>
            </div>
            {presupuestos.length === 0 ? (
              <Vacio mensaje="Ninguna categoría tiene presupuesto asignado." />
            ) : (
              <div className="mt-3 space-y-3.5">
                {presupuestos.slice(0, 4).map((p) => (
                  <PresupuestoBar
                    key={p.id}
                    compacta
                    nombre={p.nombre}
                    color={p.color}
                    gastado={p.gastado}
                    limite={p.limite}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">Últimos movimientos</h2>
              <Link href="/movimientos" className="text-[13px] font-medium text-acento">
                Ver todos
              </Link>
            </div>
            {resueltos.length === 0 ? (
              <Vacio mensaje="Sin movimientos este mes." />
            ) : (
              <ul className="mt-1 divide-y divide-gris-200">
                {resueltos.slice(0, 5).map((g) => (
                  <GastoCard key={g.id} gasto={g} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
