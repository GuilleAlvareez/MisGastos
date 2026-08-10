// Notificaciones locales, sin servidor de push: la app no tiene backend y los avisos
// se deciden en el propio dispositivo con datos que ya tiene descargados.

export type EstadoPermiso = 'sin-soporte' | 'default' | 'granted' | 'denied';

export function estadoPermiso(): EstadoPermiso {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'sin-soporte';
  return Notification.permission;
}

/** Debe llamarse desde un gesto del usuario: los navegadores lo exigen. */
export async function pedirPermiso(): Promise<EstadoPermiso> {
  if (estadoPermiso() === 'sin-soporte') return 'sin-soporte';
  return await Notification.requestPermission();
}

/**
 * Envía el aviso por el service worker si lo hay, y solo si no, con `new Notification`.
 *
 * El orden importa: en una PWA instalada en iOS `new Notification` no funciona, hay que
 * pasar por `registration.showNotification`. En escritorio valen las dos.
 */
export async function notificar(titulo: string, cuerpo: string, etiqueta?: string) {
  if (estadoPermiso() !== 'granted') return false;

  const opciones: NotificationOptions = {
    body: cuerpo,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    // Con la misma etiqueta, un aviso repetido sustituye al anterior en vez de apilarse.
    tag: etiqueta,
  };

  try {
    const registro = await navigator.serviceWorker?.getRegistration();
    if (registro) {
      await registro.showNotification(titulo, opciones);
      return true;
    }
    new Notification(titulo, opciones);
    return true;
  } catch {
    return false;
  }
}
