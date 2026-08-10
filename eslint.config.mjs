import { FlatCompat } from '@eslint/eslintrc';

/*
  El repo no tenía configuración de ESLint, así que `npm run lint` abría el asistente
  interactivo de Next y se quedaba esperando: inservible en CI.

  `eslint-config-next` sigue publicándose en el formato antiguo, de ahí FlatCompat:
  traduce ese `extends` al formato plano que usa ESLint 9.
*/
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/sw.js'] },
  ...compat.extends('next/core-web-vitals'),
];

export default config;
