import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MesProvider } from '@/components/layout/MesContext';
import Sidebar from '@/components/layout/Sidebar';
import TabBar from '@/components/layout/TabBar';
import { NuevoGastoProvider } from '@/components/NuevoGastoSheet';
import RegistrarSW from '@/components/RegistrarSW';

export const metadata: Metadata = {
  title: 'Finanzas',
  description: 'Control de gastos personales',
  manifest: '/manifest.json',
  applicationName: 'Finanzas',
  appleWebApp: {
    capable: true, // modo standalone al añadir a pantalla de inicio en iOS
    title: 'Finanzas',
    statusBarStyle: 'default', // fondo blanco del diseño → texto oscuro de la status bar
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: { telephone: false },
  other: {
    // Next 15 solo emite `mobile-web-app-capable`; iOS antiguo sigue mirando este.
    'apple-mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // respeta notch y safe areas
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <MesProvider>
          <NuevoGastoProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="min-w-0 flex-1">
                <div className="mx-auto w-full max-w-2xl px-5 pad-seguro-arriba pad-seguro-abajo md:pb-10">
                  {children}
                </div>
              </main>
            </div>
            <TabBar />
            <RegistrarSW />
          </NuevoGastoProvider>
        </MesProvider>
      </body>
    </html>
  );
}
