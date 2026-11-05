'use client';

import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminAuthModal } from './AdminAuthModal';
import { AdminHeader } from './AdminHeader';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminCardapioView } from './AdminCardapioView';
import { AdminPlacasView } from './AdminPlacasView';
import { AdminConfigView } from './AdminConfigView';

export function AdminView() {
  const admin = useAdmin();

  // If not unlocked with PIN, show PIN unlock modal
  if (!admin.isUnlocked) {
    return (
      <AdminAuthModal
        pinInput={admin.pinInput}
        pinError={admin.pinError}
        onDigit={admin.handlePinDigit}
        onBackspace={admin.handlePinBackspace}
        onClear={admin.handlePinClear}
        onSubmit={admin.handlePinSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      {/* Top Header */}
      <AdminHeader
        config={admin.config}
        abaAtiva={admin.abaAtiva}
        onMudarAba={admin.setAbaAtiva}
        onLock={admin.lockAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-16">
        {admin.abaAtiva === 'bi' && (
          <AdminDashboardView metricas={admin.metricas} />
        )}

        {admin.abaAtiva === 'cardapio' && (
          <AdminCardapioView
            produtos={admin.produtos}
            categorias={admin.categorias}
            onAdicionarProduto={admin.adicionarProduto}
            onEditarProduto={admin.editarProduto}
            onRemoverProduto={admin.removerProduto}
            onToggleDisponibilidade={admin.toggleDisponibilidade}
          />
        )}

        {admin.abaAtiva === 'placas' && (
          <AdminPlacasView config={admin.config} />
        )}

        {admin.abaAtiva === 'config' && (
          <AdminConfigView
            config={admin.config}
            onUpdateConfig={admin.updateConfig}
            onResetSeeds={admin.resetToSeeds}
            onChangePin={admin.changePin}
          />
        )}
      </main>
    </div>
  );
}
