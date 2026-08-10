'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import CampoImporte from '@/components/CampoImporte';
import { useCategorias } from '@/hooks/useCategorias';
import { useGuardarGasto } from '@/hooks/useGastos';
import { colorCategoria } from '@/lib/colores';
import { aISO, importeANumero, numeroAImporte, sanearImporte } from '@/lib/format';
import type { Gasto } from '@/lib/types';

/** `abrir()` da de alta; `abrir(gasto)` edita ese gasto en la misma hoja. */
type Ctx = { abrir: (gasto?: Gasto) => void; cerrar: () => void; abierto: boolean };

const GastoCtx = createContext<Ctx | null>(null);

export function NuevoGastoProvider({ children }: { children: React.ReactNode }) {
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [abierto, setAbierto] = useState(false);

  const valor = useMemo<Ctx>(
    () => ({
      abierto,
      abrir: (gasto?: Gasto) => {
        setEditando(gasto ?? null);
        setAbierto(true);
      },
      cerrar: () => setAbierto(false),
    }),
    [abierto],
  );

  return (
    <GastoCtx.Provider value={valor}>
      {children}
      {/*
        Se desmonta al cerrar y la `key` cambia con el objetivo: así el formulario
        arranca limpio también si se pide abrir otro gasto sin cerrar antes.
      */}
      {abierto && <Hoja key={editando?.id ?? 'nuevo'} gasto={editando} cerrar={valor.cerrar} />}
    </GastoCtx.Provider>
  );
}

export function useNuevoGasto() {
  const ctx = useContext(GastoCtx);
  if (!ctx) throw new Error('useNuevoGasto debe usarse dentro de <NuevoGastoProvider>');
  return ctx;
}

function Hoja({ gasto, cerrar }: { gasto: Gasto | null; cerrar: () => void }) {
  const { categorias } = useCategorias();
  const { crear, actualizar, eliminar, guardando } = useGuardarGasto();
  const editando = gasto !== null;

  const [importe, setImporte] = useState(() => (gasto ? numeroAImporte(gasto.importe) : ''));
  const [categoriaId, setCategoriaId] = useState<string | null>(gasto?.categoria_id ?? null);
  const [descripcion, setDescripcion] = useState(gasto?.descripcion ?? '');
  const [fecha, setFecha] = useState(() => gasto?.fecha ?? aISO(new Date()));
  const [error, setError] = useState<string | null>(null);
  // El borrado es en dos toques dentro de la propia hoja, sin diálogo del sistema.
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

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

  const valor = importeANumero(importe);
  const valido = Number.isFinite(valor) && valor > 0;

  async function guardar() {
    if (!valido || guardando) return;
    const datos = {
      importe: Math.round(valor * 100) / 100,
      categoria_id: categoriaId,
      descripcion: descripcion.trim() || null,
      fecha,
    };
    const msg = gasto ? await actualizar(gasto.id, datos) : await crear(datos);
    if (msg) setError(msg);
    else cerrar();
  }

  async function borrar() {
    if (!gasto || guardando) return;
    const msg = await eliminar(gasto.id);
    if (msg) setError(msg);
    else cerrar();
  }

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
          <p className="text-[15px] font-semibold">{editando ? 'Editar gasto' : 'Nuevo gasto'}</p>
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
          <CampoImporte
            autoFocus
            valor={importe}
            alCambiar={(v) => {
              setImporte(v);
              setError(null);
            }}
          />

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

          {editando && (
            <div className="mt-6">
              {confirmandoBorrado ? (
                <div className="rounded-tarjeta border border-excedido/20 bg-excedido-bg px-4 py-3">
                  <p className="text-[13px] text-excedido">
                    Se eliminará este gasto. No se puede deshacer.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={borrar}
                      disabled={guardando}
                      className="flex-1 rounded-xl bg-excedido px-3 py-2.5 text-[15px] font-semibold text-white disabled:opacity-40"
                    >
                      {guardando ? 'Eliminando…' : 'Sí, eliminar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoBorrado(false)}
                      className="flex-1 rounded-xl border border-gris-200 px-3 py-2.5 text-[15px] text-gris-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoBorrado(true)}
                  className="w-full py-2 text-[15px] font-medium text-excedido"
                >
                  Eliminar gasto
                </button>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-excedido-bg px-3 py-2 text-sm text-excedido">{error}</p>
          )}
        </div>

        <div
          className="border-t border-gris-200 px-5 py-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button type="button" onClick={guardar} disabled={!valido || guardando} className="boton-primario">
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar gasto'}
          </button>
        </div>
      </div>
    </div>
  );
}
