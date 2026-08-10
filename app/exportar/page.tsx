'use client';

import { useMemo, useState } from 'react';
import { ErrorAviso } from '@/components/Estado';
import Header from '@/components/layout/Header';
import { useMes } from '@/components/layout/MesContext';
import { useCategorias } from '@/hooks/useCategorias';
import { useGastos } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';
import { SIN_CATEGORIA, resolverGastos } from '@/lib/colores';
import { aCSV, importeCSV, nombreArchivo } from '@/lib/csv';
import { descargarTexto } from '@/lib/descargar';
import { euros } from '@/lib/format';

export default function Exportar() {
  const { rango } = useMes();
  // Arranca en el mes activo, pero aquí el rango se elige a mano: exportar suele ser
  // "todo el año" o "desde enero", no el mes que se estuviera mirando.
  const [desde, setDesde] = useState(rango.desde);
  const [hasta, setHasta] = useState(rango.hasta);

  const { categorias, error: errorCat } = useCategorias();
  const { gastos, total: totalGastos, cargando: cargandoGastos, error: errorGastos } = useGastos({
    desde,
    hasta,
  });
  const {
    ingresos,
    total: totalIngresos,
    cargando: cargandoIngresos,
    error: errorIngresos,
  } = useIngresos(desde, hasta);

  const resueltos = useMemo(() => resolverGastos(gastos, categorias), [gastos, categorias]);
  const rangoInvertido = desde > hasta;

  function descargarGastos() {
    const csv = aCSV(
      ['Fecha', 'Categoría', 'Descripción', 'Importe'],
      resueltos.map((g) => [
        g.fecha,
        g.categoriaNombre === SIN_CATEGORIA ? '' : g.categoriaNombre,
        g.descripcion ?? '',
        importeCSV(g.importe),
      ]),
    );
    descargarTexto(nombreArchivo('gastos', desde, hasta), csv);
  }

  function descargarIngresos() {
    const csv = aCSV(
      ['Fecha', 'Concepto', 'Importe'],
      ingresos.map((i) => [i.fecha, i.concepto ?? '', importeCSV(i.importe)]),
    );
    descargarTexto(nombreArchivo('ingresos', desde, hasta), csv);
  }

  const error = errorGastos ?? errorCat;

  return (
    <>
      <Header titulo="Exportar" subtitulo="Descarga tus movimientos en CSV para abrirlos en Excel." />

      {error && <ErrorAviso mensaje={error} />}

      <section className="mt-5">
        <p className="etiqueta">Periodo</p>
        <div className="mt-2 flex items-center gap-2">
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
        <button
          type="button"
          onClick={() => {
            setDesde(rango.desde);
            setHasta(rango.hasta);
          }}
          className="mt-2 text-[13px] font-medium text-acento"
        >
          Volver al mes activo
        </button>
      </section>

      {rangoInvertido ? (
        <p className="mt-5 rounded-xl bg-limite-bg px-3 py-2.5 text-[13px] text-limite">
          La fecha de inicio es posterior a la de fin.
        </p>
      ) : (
        <section className="mt-5 space-y-3">
          <Bloque
            titulo="Gastos"
            cantidad={resueltos.length}
            total={euros(totalGastos)}
            cargando={cargandoGastos}
            alDescargar={descargarGastos}
          />
          <Bloque
            titulo="Ingresos"
            cantidad={ingresos.length}
            total={euros(totalIngresos)}
            cargando={cargandoIngresos}
            aviso={errorIngresos ?? undefined}
            alDescargar={descargarIngresos}
          />
        </section>
      )}

      <p className="mt-6 text-[13px] leading-snug text-gris-400">
        El archivo usa punto y coma como separador y coma para los decimales, que es lo
        que espera Excel en español.
      </p>
    </>
  );
}

function Bloque({
  titulo,
  cantidad,
  total,
  cargando,
  aviso,
  alDescargar,
}: {
  titulo: string;
  cantidad: number;
  total: string;
  cargando: boolean;
  aviso?: string;
  alDescargar: () => void;
}) {
  return (
    <div className="tarjeta p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold">{titulo}</p>
        <p className="text-[15px] tabular-nums">{total}</p>
      </div>
      <p className="mt-0.5 text-[13px] text-gris-400">
        {cargando ? 'Contando…' : `${cantidad} ${cantidad === 1 ? 'registro' : 'registros'}`}
      </p>

      {aviso && <p className="mt-2 text-[12px] leading-snug text-excedido">{aviso}</p>}

      <button
        type="button"
        onClick={alDescargar}
        disabled={cargando || cantidad === 0}
        className="mt-3 w-full rounded-xl border border-gris-200 bg-white px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-gris-50 disabled:opacity-40"
      >
        Descargar CSV
      </button>
    </div>
  );
}
