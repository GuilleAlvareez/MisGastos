/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      // El manifest debe servirse sin cache agresiva para que iOS lo relea al reinstalar.
      source: '/manifest.json',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
    },
  ],
};

module.exports = nextConfig;
