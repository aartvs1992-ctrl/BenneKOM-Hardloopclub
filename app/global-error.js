'use client';
import ErrorScreen from '@/components/ErrorScreen';

// Vangt fouten in de basisopmaak zelf; heeft daarom een eigen <html> en <body>
export default function GlobalError({ error }) {
  return (
    <html lang="nl">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#F2F4F8', color: '#0B1B33' }}>
        <ErrorScreen error={error} />
      </body>
    </html>
  );
}
