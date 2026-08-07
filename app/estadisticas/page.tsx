'use client';

import { useMemo } from 'react';
import EvolucionMensual, { type PuntoMes } from '@/components/charts/EvolucionMensual';
import GastoPorDiaSemana, { type BarraDia } from '@/components/charts/GastoPorDiaSemana';
import RankingCategorias, { type FilaRanking } from '@/components/charts/RankingCategorias';
import { Cargando, ErrorAviso } from '@/components/Estado';
import Kpi from '@/components/Kpi';
import Header from '@/components/layout/Header';
import { useMes } from '@/components/layout/MesContext';
import { useCategorias } from '@/hooks/useCategorias';
import { useGastos, useGastosPorMes } from '@/hooks/useGastos';
import { useIngresos } from '@/hooks/useIngresos';
import { GRIS_SIN_CATEGORIA, SIN_CATEGORIA, colorCategoria } from '@/lib/colores';
import {
  aISO,
  euros,
  mesLargo,
  mismoMes,
  porcentaje,
  primerDia,
  resumenMesCorto,
  soloMes,
  sumarMeses,
  ultimoDia,
} from '@/lib/format';

const MESES_VENTANA = 6;
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function Estadisticas() {
  const { mes, rango } = useMes();
  const { categorias, cargando: cargandoCat, error: errorCat } = useCategorias();
  const { gastos, total, cargando: cargandoGastos, error: errorGastos } = useGastos(rango);
  const { total: totalIngresos, error: errorIngresos } = useIngresos(rango.desde, rango.hasta);

  const ventana = useMemo(() => {
    const inicio = primerDia(sumarMeses(mes, -(MESES_VENTANA - 1)));
    return { desde: aISO(inicio), hasta: aISO(ultimoDia(mes)) };
  }, [mes]);
  const { porMes, error: errorEvolucion } = useGastosPorMes(ventana.desde, ventana.hasta);

  // --- ritmo del mes activo ---
  const hoy = new Date();
  const enCurso = mismoMes(mes, hoy);
  const diasDelMes = ultimoDia(mes).getDate();
  const diasContados = enCurso ? hoy.getDate() : diasDelMes;
  const mediaDiaria = diasContados > 0 ? total / diasContados : 0;
  const proyeccion = mediaDiaria * diasDelMes;
  const ticketMedio = gastos.length > 0 ? total / gastos.length : 0;
  const mayorGasto = gastos.reduce<number>((m, g) => Math.max(m, g.importe), 0);

  // --- ventana de meses ---
  const evolucion = useMemo<PuntoMes[]>(
    () =>
      Array.from({ length: MESES_VENTANA }, (_, i) => {
        const d = sumarMeses(mes, -(MESES_VENTANA - 1 - i));
        return { etiqueta: resumenMesCorto(d), total: porMes[aISO(d).slice(0, 7)] ?? 0 };
      }),
    [mes, porMes],
  );

  const mesesConGasto = evolucion.filter((p) => p.total > 0);
  const mediaMensual =
    mesesConGasto.length > 0 ? mesesConGasto.reduce((s, p) => s + p.total, 0) / mesesConGasto.length : 0;
  const masCaro = mesesConGasto.reduce<PuntoMes | null>(
    (m, p) => (m === null || p.total > m.total ? p : m),
    null,
  );
  const masBarato = mesesConGasto.reduce<PuntoMes | null>(
    (m, p) => (m === null || p.total < m.total ? p : m),
    null,
  );

  const totalAnterior = porMes[aISO(sumarMeses(mes, -1)).slice(0, 7)];
  const variacion =
    totalAnterior && totalAnterior > 0 ? Math.round(((total - totalAnterior) / totalAnterior) * 100) : null;
  const vsMedia = mediaMensual > 0 ? Math.round(((total - mediaMensual) / mediaMensual) * 100) : null;

  // --- reparto por categoría ---
  const ranking = useMemo<FilaRanking[]>(() => {
    const acc = new Map<string, FilaRanking>();
    categorias.forEach((c, i) => {
      acc.set(c.id, { nombre: c.nombre, color: colorCategoria(c, i), total: 0, movimientos: 0 });
    });
    for (const g of gastos) {
      const clave = g.categoria_id ?? '__sin__';
      const actual =
        acc.get(clave) ?? { nombre: SIN_CATEGORIA, color: GRIS_SIN_CATEGORIA, total: 0, movimientos: 0 };
      acc.set(clave, { ...actual, total: actual.total + g.importe, movimientos: actual.movimientos + 1 });
    }
    return [...acc.values()].filter((f) => f.total > 0).sort((a, b) => b.total - a.total);
  }, [gastos, categorias]);

  // --- días de la semana (lunes primero) ---
  const porDiaSemana = useMemo<BarraDia[]>(() => {
    const acc = new Array(7).fill(0);
    for (const g of gastos) {
      const js = new Date(`${g.fecha}T00:00:00`).getDay(); // 0 = domingo
      acc[(js + 6) % 7] += g.importe;
    }
    return DIAS.map((dia, i) => ({ dia, total: acc[i] }));
  }, [gastos]);

  const diaMasCaro = porDiaSemana.reduce((m, d) => (d.total > m.total ? d : m), porDiaSemana[0]);

  const tasaAhorro = totalIngresos > 0 ? ((totalIngresos - total) / totalIngresos) * 100 : null;

  const error = errorGastos ?? errorCat ?? errorEvolucion;
  const cargando = cargandoGastos || cargandoCat;

  return (
    <>
      <Header
        titulo="Estadísticas"
        derecha={<p className="text-[15px] font-semibold tabular-nums">{euros(total)}</p>}
      />

      {error && <ErrorAviso mensaje={error} />}

      {cargando ? (
        <Cargando filas={5} />
      ) : (
        <>
          <section className="mt-5">
            <h2 className="text-[15px] font-semibold">Ritmo de {soloMes(mes)}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Kpi
                etiqueta="Media diaria"
                valor={euros(mediaDiaria)}
                pista={enCurso ? `sobre ${diasContados} días transcurridos` : `sobre ${diasDelMes} días`}
              />
              {enCurso ? (
                <Kpi
                  etiqueta="Proyección de cierre"
                  valor={euros(proyeccion)}
                  pista={`si sigues a este ritmo hasta el día ${diasDelMes}`}
                  tono={vsMedia !== null && proyeccion > mediaMensual ? 'mal' : 'neutro'}
                />
              ) : (
                <Kpi etiqueta="Movimientos" valor={String(gastos.length)} pista="en el mes" />
              )}
              <Kpi
                etiqueta="Gasto medio"
                valor={euros(ticketMedio)}
                pista={`${gastos.length} ${gastos.length === 1 ? 'movimiento' : 'movimientos'}`}
              />
              <Kpi etiqueta="Gasto más alto" valor={euros(mayorGasto)} pista="del mes" />
              <Kpi
                etiqueta="Vs mes anterior"
                valor={variacion === null ? '—' : `${variacion > 0 ? '+' : ''}${variacion}%`}
                pista={
                  totalAnterior ? `${soloMes(sumarMeses(mes, -1))}: ${euros(totalAnterior)}` : 'sin dato previo'
                }
                tono={variacion === null ? 'neutro' : variacion > 0 ? 'mal' : 'bien'}
              />
              <Kpi
                etiqueta="Tasa de ahorro"
                valor={tasaAhorro === null ? '—' : porcentaje(tasaAhorro)}
                pista={
                  errorIngresos
                    ? 'sin acceso a ingresos'
                    : totalIngresos > 0
                      ? `de ${euros(totalIngresos)} ingresados`
                      : 'sin ingresos registrados'
                }
                tono={tasaAhorro === null ? 'neutro' : tasaAhorro >= 0 ? 'bien' : 'mal'}
              />
            </div>
          </section>

          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">Evolución</h2>
              <p className="text-[13px] text-gris-400">Últimos {MESES_VENTANA} meses</p>
            </div>
            <div className="mt-2">
              <EvolucionMensual datos={evolucion} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Kpi
                etiqueta="Media mensual"
                valor={euros(mediaMensual)}
                pista={
                  vsMedia === null
                    ? `${mesesConGasto.length} meses con gasto`
                    : `${mesLargo(mes)} va un ${vsMedia > 0 ? '+' : ''}${vsMedia}%`
                }
              />
              <Kpi
                etiqueta="Mes más caro"
                valor={masCaro ? euros(masCaro.total) : '—'}
                pista={masCaro ? masCaro.etiqueta : 'sin datos en la ventana'}
              />
              <Kpi
                etiqueta="Mes más barato"
                valor={masBarato ? euros(masBarato.total) : '—'}
                pista={masBarato ? masBarato.etiqueta : 'sin datos en la ventana'}
              />
              <Kpi
                etiqueta="Total de la ventana"
                valor={euros(evolucion.reduce((s, p) => s + p.total, 0))}
                pista={`${resumenMesCorto(sumarMeses(mes, -(MESES_VENTANA - 1)))} → ${resumenMesCorto(mes)}`}
              />
            </div>
          </section>

          <section className="mt-7">
            <h2 className="text-[15px] font-semibold">Reparto por categoría</h2>
            <div className="mt-3">
              <RankingCategorias filas={ranking} />
            </div>
          </section>

          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">Por día de la semana</h2>
              {diaMasCaro.total > 0 && (
                <p className="text-[13px] text-gris-400">
                  {diaMasCaro.dia} es el más caro: {euros(diaMasCaro.total)}
                </p>
              )}
            </div>
            <div className="mt-2">
              <GastoPorDiaSemana datos={porDiaSemana} />
            </div>
          </section>
        </>
      )}
    </>
  );
}
