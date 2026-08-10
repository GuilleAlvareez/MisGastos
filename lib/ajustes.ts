// Ajustes locales del dispositivo. Van en localStorage y no en Supabase a propósito:
// el permiso de notificaciones es del navegador, así que activarlas en el móvil no
// debería activarlas en el portátil.

export type Ajustes = {
  alertasActivas: boolean;
  /** Porcentaje de consumo a partir del cual avisar. */
  umbral: number;
};

export const UMBRALES = [70, 80, 90, 100] as const;

export const AJUSTES_POR_DEFECTO: Ajustes = { alertasActivas: false, umbral: 80 };

const CLAVE = 'finanzas:ajustes';

/** Devuelve los valores por defecto en el servidor y si lo guardado no sirve. */
export function leerAjustes(): Ajustes {
  if (typeof window === 'undefined') return AJUSTES_POR_DEFECTO;
  try {
    const bruto = window.localStorage.getItem(CLAVE);
    if (!bruto) return AJUSTES_POR_DEFECTO;
    const guardado = JSON.parse(bruto) as Partial<Ajustes>;
    return {
      alertasActivas: guardado.alertasActivas === true,
      // Un umbral fuera de la lista dejaría el selector en blanco.
      umbral: UMBRALES.includes(guardado.umbral as (typeof UMBRALES)[number])
        ? (guardado.umbral as number)
        : AJUSTES_POR_DEFECTO.umbral,
    };
  } catch {
    // JSON corrupto o localStorage bloqueado (modo privado): mejor los valores por defecto.
    return AJUSTES_POR_DEFECTO;
  }
}

export function guardarAjustes(ajustes: Ajustes) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(ajustes));
  } catch {
    // Sin localStorage los ajustes duran lo que la sesión. No es motivo para romper.
  }
}
