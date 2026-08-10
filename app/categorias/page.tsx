'use client';

import { useState } from 'react';
import { Cargando, ErrorAviso, Vacio } from '@/components/Estado';
import HojaCategoria from '@/components/HojaCategoria';
import Header from '@/components/layout/Header';
import { useMes } from '@/components/layout/MesContext';
import { IconoMas } from '@/components/layout/nav';
import { useCategorias } from '@/hooks/useCategorias';
import { usePresupuestos } from '@/hooks/usePresupuestos';
import { colorCategoria } from '@/lib/colores';
import { euros, mesLargo } from '@/lib/format';
import type { Categoria } from '@/lib/types';

/** Qué está abierto en la hoja: una categoría existente con su índice, o un alta. */
type Edicion = { categoria: Categoria | null; indice: number };

export default function Categorias() {
  const { mes, claveMes } = useMes();
  const { categorias, cargando, error } = useCategorias();
  const { limitesDelMes, idsDelMes, error: errorPres } = usePresupuestos(claveMes);
  const [edicion, setEdicion] = useState<Edicion | null>(null);

  return (
    <>
      <Header
        titulo="Categorías"
        derecha={
          <p className="text-[15px] tabular-nums text-gris-400">
            {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'}
          </p>
        }
      />

      {(error ?? errorPres) && <ErrorAviso mensaje={(error ?? errorPres)!} />}

      <p className="mt-4 text-[13px] leading-snug text-gris-600">
        El presupuesto mensual se aplica a todos los meses. Si una categoría tiene un límite propio
        para {mesLargo(mes).toLowerCase()}, manda ese.
      </p>

      <button
        type="button"
        onClick={() => setEdicion({ categoria: null, indice: categorias.length })}
        className="boton-primario mt-3 gap-2"
      >
        <IconoMas className="h-4 w-4" />
        Nueva categoría
      </button>

      {cargando ? (
        <Cargando filas={5} />
      ) : categorias.length === 0 ? (
        <Vacio mensaje="Todavía no hay categorías." />
      ) : (
        <ul className="mt-4 divide-y divide-gris-200">
          {categorias.map((c, i) => {
            const limiteMes = limitesDelMes.get(c.id);
            const efectivo = limiteMes ?? c.presupuesto_mensual;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setEdicion({ categoria: c, indice: i })}
                  aria-label={`Editar ${c.nombre}`}
                  className="flex w-full items-center gap-3 py-3.5 text-left transition-colors active:bg-gris-50"
                >
                  <span
                    aria-hidden
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colorCategoria(c, i) }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{c.nombre}</span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[15px] tabular-nums">
                      {efectivo != null ? euros(efectivo) : '—'}
                    </span>
                    {limiteMes != null && (
                      <span className="block text-[12px] text-gris-400">solo este mes</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {edicion && (
        <HojaCategoria
          key={edicion.categoria?.id ?? 'nueva'}
          categoria={edicion.categoria}
          indice={edicion.indice}
          mes={mes}
          claveMes={claveMes}
          limiteDelMes={edicion.categoria ? limitesDelMes.get(edicion.categoria.id) : undefined}
          idPresupuestoMes={edicion.categoria ? idsDelMes.get(edicion.categoria.id) ?? null : null}
          cerrar={() => setEdicion(null)}
        />
      )}
    </>
  );
}
