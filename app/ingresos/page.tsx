'use client';

import { Cargando, ErrorAviso, Vacio } from '@/components/Estado';
import { useHojaMovimiento } from '@/components/HojaMovimiento';
import IngresoCard from '@/components/IngresoCard';
import Header from '@/components/layout/Header';
import { useMes } from '@/components/layout/MesContext';
import { IconoMas } from '@/components/layout/nav';
import { useGastos } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';
import { euros } from '@/lib/format';

export default function Ingresos() {
  const { rango } = useMes();
  const { abrir } = useHojaMovimiento();
  const { ingresos, total, cargando, error } = useIngresos(rango.desde, rango.hasta);
  // Solo para el saldo del mes: es el mismo dato que ya muestra el Resumen.
  const { total: totalGastos } = useGastos(rango);

  const saldo = total - totalGastos;

  return (
    <>
      <Header
        titulo="Ingresos"
        derecha={<p className="text-[15px] font-semibold tabular-nums text-rango">{euros(total)}</p>}
      />

      {error && <ErrorAviso mensaje={error} />}

      <section className="tarjeta mt-5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="etiqueta">Saldo del mes</p>
            <p
              className={`mt-1 text-xl font-semibold tabular-nums ${
                saldo < 0 ? 'text-excedido' : 'text-rango'
              }`}
            >
              {saldo >= 0 ? '+' : ''}
              {euros(saldo)}
            </p>
          </div>
          <p className="text-[13px] tabular-nums text-gris-400">
            {euros(total)} − {euros(totalGastos)}
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() => abrir({ nuevo: 'ingreso' })}
        className="boton-primario mt-3 gap-2"
      >
        <IconoMas className="h-4 w-4" />
        Añadir ingreso
      </button>

      {cargando ? (
        <Cargando filas={4} />
      ) : ingresos.length === 0 ? (
        <Vacio mensaje="Sin ingresos este mes." />
      ) : (
        <>
          <ul className="mt-4 divide-y divide-gris-200">
            {ingresos.map((i) => (
              <IngresoCard key={i.id} ingreso={i} />
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-gris-200 pt-3">
            <p className="text-[13px] text-gris-400">
              {ingresos.length} {ingresos.length === 1 ? 'ingreso' : 'ingresos'}
            </p>
            <p className="text-[15px] font-semibold tabular-nums">{euros(total)}</p>
          </div>
        </>
      )}
    </>
  );
}
