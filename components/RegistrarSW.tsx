'use client';

import { useEffect } from 'react';

/** Registra el service worker mínimo (solo cachea iconos/manifest, nunca datos). */
export default function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sin service worker la app sigue funcionando: no hay nada que reintentar.
    });
  }, []);

  return null;
}
