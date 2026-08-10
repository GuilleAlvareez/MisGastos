/**
 * Descarga de texto como archivo, desde el navegador y sin servidor: la app no tiene
 * backend, así que el CSV se construye en el cliente y se entrega con un Blob.
 */

/**
 * BOM de UTF-8. Se construye por código de carácter y no se pega literal a propósito:
 * literal es invisible en el editor y cualquiera lo borraría sin darse cuenta al
 * tocar la línea.
 */
const BOM = String.fromCharCode(0xfeff);

export function descargarTexto(nombre: string, contenido: string, tipo = 'text/csv') {
  /*
    El BOM no es decorativo: sin él, Excel en Windows abre el CSV con la codificación
    del sistema y las tildes y la ñ salen como "MÃ³vil". Los demás programas lo
    ignoran, así que sale gratis.
  */
  const blob = new Blob([BOM, contenido], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();

  // Sin revocar, el Blob se queda en memoria hasta que se recargue la página.
  URL.revokeObjectURL(url);
}
