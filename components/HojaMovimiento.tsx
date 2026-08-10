'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import CampoImporte from '@/components/CampoImporte';
import { useCategorias } from '@/hooks/useCategorias';
import { useGuardarGasto } from '@/hooks/useGastos';
import { useGuardarIngreso } from '@/hooks/useIngresos';
import { colorCategoria } from '@/lib/colores';
import { aISO, importeANumero, numeroAImporte } from '@/lib/format';
import type { Gasto, Ingreso } from '@/lib/types';

/**
 * Con qué abre la hoja: editando un gasto, editando un ingreso, o dando de alta.
 * `abrir()` da de alta un gasto; `abrir({ nuevo: 'ingreso' })` arranca en ingreso.
 */
type Objetivo = { gasto: Gasto } | { ingreso: Ingreso } | { nuevo: 'gasto' | 'ingreso' };

type Ctx = { abrir: (objetivo?: Objetivo) => void; cerrar: () => void; abierto: boolean };

const HojaCtx = createContext<Ctx | null>(null);

const idObjetivo = (o: Objetivo | null) => {
  if (o === null) return 'nuevo:gasto';
  if ('gasto' in o) return `g:${o.gasto.id}`;
  if ('ingreso' in o) return `i:${o.ingreso.id}`;
  return `nuevo:${o.nuevo}`;
};

export function HojaMovimientoProvider({ children }: { children: React.ReactNode }) {
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [abierto, setAbierto] = useState(false);

  const valor = useMemo<Ctx>(
    () => ({
      abierto,
      abrir: (o?: Objetivo) => {
        setObjetivo(o ?? null);
        setAbierto(true);
      },
      cerrar: () => setAbierto(false),
    }),
    [abierto],
  );

  return (
    <HojaCtx.Provider value={valor}>
      {children}
      {/*
        Se desmonta al cerrar y la `key` cambia con el objetivo: así el formulario
        arranca limpio también si se pide abrir otro movimiento sin cerrar antes.
      */}
      {abierto && <Hoja key={idObjetivo(objetivo)} objetivo={objetivo} cerrar={valor.cerrar} />}
    </HojaCtx.Provider>
  );
}

export function useHojaMovimiento() {
  const ctx = useContext(HojaCtx);
  if (!ctx) throw new Error('useHojaMovimiento debe usarse dentro de <HojaMovimientoProvider>');
  return ctx;
}

function Hoja({ objetivo, cerrar }: { objetivo: Objetivo | null; cerrar: () => void }) {
  const { categorias } = useCategorias();
  const gastos = useGuardarGasto();
  const ingresos = useGuardarIngreso();

  const gastoEditado = objetivo && 'gasto' in objetivo ? objetivo.gasto : null;
  const ingresoEditado = objetivo && 'ingreso' in objetivo ? objetivo.ingreso : null;
  const movimiento = gastoEditado ?? ingresoEditado;
  const editando = movimiento !== null;

  // Al editar, el tipo viene dado y el selector no se muestra: un gasto no se
  // convierte en ingreso, se borra y se crea (son tablas distintas).
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>(() => {
    if (ingresoEditado) return 'ingreso';
    if (objetivo && 'nuevo' in objetivo) return objetivo.nuevo;
    return 'gasto';
  });
  const esIngreso = tipo === 'ingreso';

  const [importe, setImporte] = useState(() =>
    movimiento ? numeroAImporte(movimiento.importe) : '',
  );
  const [categoriaId, setCategoriaId] = useState<string | null>(gastoEditado?.categoria_id ?? null);
  const [texto, setTexto] = useState(
    gastoEditado?.descripcion ?? ingresoEditado?.concepto ?? '',
  );
  const [fecha, setFecha] = useState(() => movimiento?.fecha ?? aISO(new Date()));
  const [error, setError] = useState<string | null>(null);
  // El borrado es en dos toques dentro de la propia hoja, sin diálogo del sistema.
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const guardando = gastos.guardando || ingresos.guardando;

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
    const importeRedondeado = Math.round(valor * 100) / 100;
    const limpio = texto.trim() || null;

    const msg = esIngreso
      ? await (ingresoEditado
          ? ingresos.actualizar(ingresoEditado.id, { importe: importeRedondeado, concepto: limpio, fecha })
          : ingresos.crear({ importe: importeRedondeado, concepto: limpio, fecha }))
      : await (gastoEditado
          ? gastos.actualizar(gastoEditado.id, {
              importe: importeRedondeado,
              categoria_id: categoriaId,
              descripcion: limpio,
              fecha,
            })
          : gastos.crear({
              importe: importeRedondeado,
              categoria_id: categoriaId,
              descripcion: limpio,
              fecha,
            }));

    if (msg) setError(msg);
    else cerrar();
  }

  async function borrar() {
    if (guardando) return;
    const msg = ingresoEditado
      ? await ingresos.eliminar(ingresoEditado.id)
      : gastoEditado
        ? await gastos.eliminar(gastoEditado.id)
        : null;
    if (msg) setError(msg);
    else cerrar();
  }

  const nombreTipo = esIngreso ? 'ingreso' : 'gasto';

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
          <p className="text-[15px] font-semibold">
            {editando ? `Editar ${nombreTipo}` : `Nuevo ${nombreTipo}`}
          </p>
          <button
            type="button"
            onClick={guardar}
            disabled={!valido || guardando}
            className="text-[15px] font-semibold text-acento disabled:text-gris-400"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
          {!editando && (
            <div className="mx-auto mb-5 flex w-fit rounded-full bg-gris-100 p-0.5">
              {(['gasto', 'ingreso'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  aria-pressed={tipo === t}
                  className={`rounded-full px-5 py-1.5 text-[13px] capitalize transition-colors ${
                    tipo === t ? 'bg-white font-semibold text-gris-900 shadow-sm' : 'text-gris-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <CampoImporte
            autoFocus
            valor={importe}
            alCambiar={(v) => {
              setImporte(v);
              setError(null);
            }}
          />

          {!esIngreso && (
            <>
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
            </>
          )}

          <div className="mt-8 divide-y divide-gris-200 border-y border-gris-200">
            <label className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-[15px]">{esIngreso ? 'Concepto' : 'Descripción'}</span>
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
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
                    Se eliminará este {nombreTipo}. No se puede deshacer.
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
                  Eliminar {nombreTipo}
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
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : `Guardar ${nombreTipo}`}
          </button>
        </div>
      </div>
    </div>
  );
}
