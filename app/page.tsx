'use client';

import React from 'react';
import CardGame from '@/components/CardGame';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 transition-colors duration-500">
      <CardGame />
    </main>
  );
}
