import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Extensión .mts a propósito: con .ts, Vite carga el archivo como CommonJS y avisa de
// que el `import` de arriba no le encaja.
export default defineConfig({
  test: {
    // Entorno de node: lo que se prueba es la lógica de `lib/`, que no toca el DOM.
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    // Mismo alias que tsconfig, para importar igual que en la app. `fileURLToPath` y no
    // `.pathname`: en Windows este último deja la ruta como "/C:/..." y no resuelve.
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
