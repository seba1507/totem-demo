import './globals.css';
import type { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Tu Futuro Yo - Envejecimiento con IA',
  description: 'Descubre cómo te verás en el futuro con inteligencia artificial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">
        {/* Skip link para accesibilidad */}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        
        <ErrorBoundary>
          <div className="vertical-screen bg-[var(--background-color)]">
            <main id="main-content" role="main" className="h-full">
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}