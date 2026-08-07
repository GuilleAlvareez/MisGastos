'use client';

import { useMemo, useState } from 'react';
import { Cargando, ErrorAviso, Vacio } from '@/components/Estado';
import GastoCard from '@/components/GastoCard';
import Header from '@/components/layout/Header';
import { useMes } from '@/components/layout/MesContext';
import { useCategorias } from '@/hooks/useCategorias';
import { useGastos } from '@/hooks/useGastos';
import { colorCategoria } from '@/lib/colores';
import { euros } from '@/lib/format';

export default function Movimientos() {
  const { rango } = useMes();
  const { categorias, cargando: cargandoCat, error: errorCat } = useCategorias();

  // undefined = todas · null = sin categoría · string = id de categoría
  const [filtro, setFiltro] = useState<string | null | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');
  const [rangoLibre, setRangoLibre] = useState<{ desde: string; hasta: string } | null>(null);

  const rangoEfectivo = rangoLibre ?? rango;
  const { gastos, cargando, error } = useGastos({ ...rangoEfectivo, categoriaId: filtro });

  const resueltos = useMemo(() => {
    const mapa = new Map(categorias.map((c, i) => [c.id, { nombre: c.nombre, color: colorCategoria(c, i) }]));
    const q = busqueda.trim().toLowerCase();
    return gastos
      .map((g) => {
        const cat = g.categoria_id ? mapa.get(g.categoria_id) : undefined;
        return {
          ...g,
          categoriaNombre: cat?.nombre ?? 'Sin categoría',
          categoriaColor: cat?.color ?? '#A1A1AA',
        };
      })
      .filter(
        (g) =>
          !q ||
          (g.descripcion ?? '').toLowerCase().includes(q) ||
          g.categoriaNombre.toLowerCase().includes(q),
      );
  }, [gastos, categorias, busqueda]);

  const total = resueltos.reduce((s, g) => s + g.importe, 0);

  return (
    <>
      <Header
        titulo="Movimientos"
        derecha={<p className="text-[15px] font-semibold tabular-nums">{euros(total)}</p>}
      />

      <div className="relative mt-4">
        <Lupa />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por descripción"
          className="campo bg-gris-100 pl-9"
          aria-label="Buscar movimientos"
        />
      </div>

      <div className="sin-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        <button
          type="button"
          onClick={() => setFiltro(undefined)}
          className={`chip shrink-0 ${filtro === undefined ? 'chip-activo' : ''}`}
        >
          Todas
        </button>
        {categorias.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFiltro(c.id)}
            className={`chip shrink-0 ${filtro === c.id ? 'chip-activo' : ''}`}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colorCategoria(c, i) }}
            />
            {c.nombre}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFiltro(null)}
          className={`chip shrink-0 ${filtro === null ? 'chip-activo' : ''}`}
        >
          <span aria-hidden className="h-2 w-2 rounded-full bg-gris-400" />
          Sin categoría
        </button>
      </div>

      <details className="mt-3 text-[13px]">
        <summary className="cursor-pointer text-gris-600">Rango libre de fechas</summary>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={rangoEfectivo.desde}
            onChange={(e) => setRangoLibre({ ...rangoEfectivo, desde: e.target.value })}
            className="campo flex-1"
            aria-label="Desde"
          />
          <span className="text-gris-400">→</span>
          <input
            type="date"
            value={rangoEfectivo.hasta}
            onChange={(e) => setRangoLibre({ ...rangoEfectivo, hasta: e.target.value })}
            className="campo flex-1"
            aria-label="Hasta"
          />
        </div>
        {rangoLibre && (
          <button type="button" onClick={() => setRangoLibre(null)} className="mt-2 text-acento">
            Volver al mes activo
          </button>
        )}
      </details>

      {(error ?? errorCat) && <ErrorAviso mensaje={(error ?? errorCat)!} />}

      {cargando || cargandoCat ? (
        <Cargando filas={6} />
      ) : resueltos.length === 0 ? (
        <Vacio mensaje="No hay movimientos con estos filtros." />
      ) : (
        <>
          <ul className="mt-3 divide-y divide-gris-200">
            {resueltos.map((g) => (
              <GastoCard key={g.id} gasto={g} />
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-gris-200 pt-3">
            <p className="text-[13px] text-gris-400">
              {resueltos.length} {resueltos.length === 1 ? 'movimiento' : 'movimientos'}
            </p>
            <p className="text-[15px] font-semibold tabular-nums">{euros(total)}</p>
          </div>
        </>
      )}
    </>
  );
}

function Lupa() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}
