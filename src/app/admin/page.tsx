import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminView } from '@/components/admin/AdminView';

export const metadata: Metadata = {
  title: 'Painel do Proprietário & BI | Bistrô & Burger Artesanal',
  description: 'Controle gerencial em tempo real, curva ABC, engenharia de cardápio e gerador de placas QR/NFC.',
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
          Carregando Painel Administrativo...
        </div>
      }
    >
      <AdminView />
    </Suspense>
  );
}
