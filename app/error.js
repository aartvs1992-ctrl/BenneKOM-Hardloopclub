'use client';
import ErrorScreen from '@/components/ErrorScreen';

export default function Error({ error }) {
  return <ErrorScreen error={error} />;
}
