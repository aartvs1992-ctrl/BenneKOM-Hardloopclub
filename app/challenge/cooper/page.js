'use client';
// De coopertest is vervangen door de CS-test. Oude links sturen we door.
import { useEffect } from 'react';
import { Loading } from '@/components/ui';

export default function Cooper() {
  useEffect(() => { location.replace('/challenge/cs' + location.search); }, []);
  return <Loading />;
}
