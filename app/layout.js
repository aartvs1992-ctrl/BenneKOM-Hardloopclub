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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,800&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" />
      </head>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
