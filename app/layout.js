// Lettertypes uit de app zelf in plaats van van Google: geen extra verbinding die het eerste beeld ophoudt
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import '@fontsource/barlow-condensed/latin-800-italic.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './globals.css';
import AppProvider from '@/components/AppProvider';
import Shell from '@/components/Shell';

export const metadata = {
  title: 'BenneKOM',
  description: 'De app van Hardloopclub BenneKOM: trainingen, inschrijven, carpool, 5km Challenge en tools.',
  appleWebApp: { capable: true, title: 'BenneKOM', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
};

export const viewport = {
  themeColor: '#071E3E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
