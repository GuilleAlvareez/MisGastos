'use client';

import { useCallback, useEffect, useState } from 'react';
import { AJUSTES_POR_DEFECTO, type Ajustes, guardarAjustes, leerAjustes } from '@/lib/ajustes';

/**
 * Ajustes del dispositivo, sincronizados con localStorage.
 *
 * `cargado` distingue "todavía no se ha leído" de "está desactivado": localStorage no
 * existe durante el render del servidor, así que el primer render siempre usa los
 * valores por defecto y se corrige en cuanto monta. Sin esa bandera, quien mire
 * `alertasActivas` actuaría sobre un valor que aún no es el real.
 */
export function useAjustes() {
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_POR_DEFECTO);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setAjustes(leerAjustes());
    setCargado(true);
  }, []);

  const actualizar = useCallback((cambios: Partial<Ajustes>) => {
    setAjustes((previos) => {
      const nuevos = { ...previos, ...cambios };
      guardarAjustes(nuevos);
      return nuevos;
    });
  }, []);

  return { ajustes, cargado, actualizar };
}
