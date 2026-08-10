'use client';

import { useMemo, useState } from 'react';
import Kpi from '@/components/Kpi';
import { useCategorias } from '@/hooks/useCategorias';
import { useGastos } from '@/hooks/useGastos';
import { GRIS_SIN_CATEGORIA, SIN_CATEGORIA, colorCategoria } from '@/lib/colores';
import { diaMes, diasDelRango, euros, sumarDias } from '@/lib/format';

/**
 * Periodo libre, para lo que el selector de mes no llega: un trimestre, un viaje, el
 * año entero. En vez de pedir dos rangos, compara el que elijas con el inmediatamente
 * anterior de la misma duración, que es la comparación que casi siempre se quiere.
 */
export default function ComparadorPeriodos({ desde: inicial, hasta: finalInicial }: { desde: string; hasta: string }) {
  const [desde, setDesde] = useState(inicial);
  const [hasta, setHasta] = useState(finalInicial);

  const invertido = desde > hasta;
  const dias = invertido ? 0 : diasDelRango(desde, hasta);

  // Ventana anterior de la misma longitud, pegada al periodo elegido.
  const previo = useMemo(() => {
    const hastaPrevio = sumarDias(desde, -1);
    return { desde: sumarDias(hastaPrevio, -(dias - 1)), hasta: hastaPrevio };
  }, [desde, dias]);

  const { categorias } = useCategorias();
  const actual = useGastos({ desde, hasta });
  const anterior = useGastos(previo);

  const variacion =
    anterior.total > 0 ? Math.round(((actual.total - anterior.total) / anterior.total) * 100) : null;
  const mediaDiaria = dias > 0 ? actual.total / dias : 0;

  /** Gasto por categoría en cada ventana, ordenado por el importe del periodo actual. */
  const porCategoria = useMemo(() => {
    const nombre = new Map(categorias.map((c, i) => [c.id, { nombre: c.nombre, color: colorCategoria(c, i) }]));
    const acumula = (gastos: typeof actual.gastos) => {
      const acc = new Map<string, number>();
      for (const g of gastos) {
        const clave = g.categoria_id ?? '__sin__';
        acc.set(clave, (acc.get(clave) ?? 0) + g.importe);
      }
      return acc;
    };

    const a = acumula(actual.gastos);
    const b = acumula(anterior.gastos);

    return [...new Set([...a.keys(), ...b.keys()])]
      .map((clave) => {
        const info = clave === '__sin__' ? undefined : nombre.get(clave);
        return {
          clave,
          nombre: info?.nombre ?? SIN_CATEGORIA,
          color: info?.color ?? GRIS_SIN_CATEGORIA,
          ahora: a.get(clave) ?? 0,
          antes: b.get(clave) ?? 0,
        };
      })
      .sort((x, y) => y.ahora - x.ahora);
  }, [actual.gastos, anterior.gastos, categorias]);

  return (
    <section className="mt-7">
      <h2 className="text-[15px] font-semibold">Periodo libre</h2>
      <p className="mt-1 text-[13px] leading-snug text-gris-400">
        Se compara con los {dias > 0 ? dias : '—'} días anteriores
        {!invertido && `, del ${diaMes(previo.desde)} al ${diaMes(previo.hasta)}`}.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="campo flex-1"
          aria-label="Desde"
        />
        <span aria-hidden className="text-gris-400">
          →
        </span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="campo flex-1"
          aria-label="Hasta"
        />
      </div>

      {invertido ? (
        <p className="mt-3 rounded-xl bg-limite-bg px-3 py-2.5 text-[13px] text-limite">
          La fecha de inicio es posterior a la de fin.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Kpi
              etiqueta="Total del periodo"
              valor={euros(actual.total)}
              pista={`${actual.gastos.length} ${actual.gastos.length === 1 ? 'movimiento' : 'movimientos'}`}
            />
            <Kpi
              etiqueta="Vs periodo anterior"
              valor={variacion === null ? '—' : `${variacion > 0 ? '+' : ''}${variacion}%`}
              pista={anterior.total > 0 ? euros(anterior.total) : 'sin gasto antes'}
              tono={variacion === null ? 'neutro' : variacion > 0 ? 'mal' : 'bien'}
            />
            <Kpi etiqueta="Media diaria" valor={euros(mediaDiaria)} pista={`sobre ${dias} días`} />
            <Kpi
              etiqueta="Categoría dominante"
              valor={porCategoria[0]?.ahora ? euros(porCategoria[0].ahora) : '—'}
              pista={porCategoria[0]?.ahora ? porCategoria[0].nombre : 'sin gasto en el periodo'}
            />
          </div>

          {porCategoria.length > 0 && (
            <ul className="mt-3 divide-y divide-gris-200 border-t border-gris-200">
              {porCategoria.map((c) => {
                const delta = c.ahora - c.antes;
                return (
                  <li key={c.clave} className="flex items-center gap-3 py-2.5">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px]">{c.nombre}</span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[15px] tabular-nums">{euros(c.ahora)}</span>
                      <span
                        className={`block text-[12px] tabular-nums ${
                          delta > 0 ? 'text-excedido' : delta < 0 ? 'text-rango' : 'text-gris-400'
                        }`}
                      >
                        {delta === 0 ? 'igual' : `${delta > 0 ? '+' : '−'}${euros(Math.abs(delta))}`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
