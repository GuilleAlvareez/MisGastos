'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCategorias } from '@/hooks/useCategorias';
import { useCrearGasto } from '@/hooks/useGastos';
import { colorCategoria } from '@/lib/colores';
import { aISO } from '@/lib/format';

type Ctx = { abrir: () => void; cerrar: () => void; abierto: boolean };

const GastoCtx = createContext<Ctx | null>(null);

export function NuevoGastoProvider({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const valor = useMemo<Ctx>(
    () => ({ abierto, abrir: () => setAbierto(true), cerrar: () => setAbierto(false) }),
    [abierto],
  );

  return (
    <GastoCtx.Provider value={valor}>
      {children}
      {abierto && <Hoja cerrar={valor.cerrar} />}
    </GastoCtx.Provider>
  );
}

export function useNuevoGasto() {
  const ctx = useContext(GastoCtx);
  if (!ctx) throw new Error('useNuevoGasto debe usarse dentro de <NuevoGastoProvider>');
  return ctx;
}

function Hoja({ cerrar }: { cerrar: () => void }) {
  const { categorias } = useCategorias();
  const { crear, guardando } = useCrearGasto();

  const [importe, setImporte] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(() => aISO(new Date()));
  const [error, setError] = useState<string | null>(null);

  // Escape cierra, y el fondo no debe hacer scroll mientras la hoja está abierta.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    document.addEventListener('keydown', onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previo;
    };
  }, [cerrar]);

  const valor = Number(importe.replace(',', '.'));
  const valido = Number.isFinite(valor) && valor > 0;

  async function guardar() {
    if (!valido || guardando) return;
    const msg = await crear({
      importe: Math.round(valor * 100) / 100,
      categoria_id: categoriaId,
      descripcion: descripcion.trim() || null,
      fecha,
    });
    if (msg) setError(msg);
    else cerrar();
  }

  const [entera, decimal] = importe.includes(',')
    ? importe.split(',')
    : importe.includes('.')
      ? importe.split('.')
      : [importe, ''];

  return (
    <div className="fixed inset-0 z-50 flex md:items-center md:justify-center md:bg-gris-900/30 md:p-6">
      <div className="flex h-full w-full flex-col bg-white md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-tarjeta md:shadow-hoja">
        <header
          className="flex items-center justify-between border-b border-gris-200 px-4 py-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <button type="button" onClick={cerrar} className="text-[15px] text-gris-600">
            Cancelar
          </button>
          <p className="text-[15px] font-semibold">Nuevo gasto</p>
          <button
            type="button"
            onClick={guardar}
            disabled={!valido || guardando}
            className="text-[15px] font-semibold text-acento disabled:text-gris-400"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-7">
          <p className="etiqueta text-center">Importe</p>
          <label className="mt-2 flex items-baseline justify-center gap-1">
            <span className="sr-only">Importe en euros</span>
            <span className="relative">
              {/* Espejo visual del valor: separa céntimos en gris como en el diseño. */}
              <span aria-hidden className="text-[44px] font-semibold tabular-nums tracking-tight">
                {entera || '0'}
                {importe.includes(',') || importe.includes('.') ? (
                  <>
                    <span>,</span>
                    <span>{decimal}</span>
                  </>
                ) : null}
              </span>
              <input
                inputMode="decimal"
                autoFocus
                value={importe}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.,]/g, '');
                  setImporte(v);
                  setError(null);
                }}
                className="absolute inset-0 h-full w-full bg-transparent text-center text-[44px] font-semibold tabular-nums tracking-tight text-transparent caret-gris-900 outline-none"
              />
            </span>
            <span className="text-[28px] font-medium text-gris-400">€</span>
          </label>

          <p className="etiqueta mt-8">Categoría</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categorias.map((c, i) => {
              const activo = categoriaId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoriaId(activo ? null : c.id)}
                  className={`chip ${activo ? 'border-acento text-gris-900' : ''}`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorCategoria(c, i) }}
                  />
                  {c.nombre}
                </button>
              );
            })}
          </div>

          <div className="mt-8 divide-y divide-gris-200 border-y border-gris-200">
            <label className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-[15px]">Descripción</span>
              <input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Opcional"
                className="min-w-0 flex-1 bg-transparent text-right text-[15px] outline-none placeholder:text-gris-400"
              />
            </label>
            <label className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-[15px]">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="bg-transparent text-right text-[15px] outline-none"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-excedido-bg px-3 py-2 text-sm text-excedido">{error}</p>
          )}
        </div>

        <div
          className="border-t border-gris-200 px-5 py-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button type="button" onClick={guardar} disabled={!valido || guardando} className="boton-primario">
            {guardando ? 'Guardando…' : 'Guardar gasto'}
          </button>
        </div>
      </div>
    </div>
  );
}
