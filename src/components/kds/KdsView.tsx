'use client';

import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  Loader2,
} from 'lucide-react';
import { useKds } from '@/hooks/useKds';
import { KdsHeader } from './KdsHeader';
import { KdsCard } from './KdsCard';
import { ComandaImpressao } from './ComandaImpressao';
import { Pedido } from '@/types/database';

export const KdsView: React.FC = () => {
  const {
    loading,
    pedidosAtivos,
    pedidosEmEspera,
    pedidosEmPreparo,
    pedidosProntos,
    filtroSetor,
    setFiltroSetor,
    hardware,
    atualizarStatus,
    recarregar,
  } = useKds();

  const [ticketParaImprimir, setTicketParaImprimir] = useState<Pedido | null>(null);

  const handleImprimir = (pedido: Pedido) => {
    setTicketParaImprimir(pedido);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-xs font-semibold text-zinc-400">Carregando KDS da Cozinha...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Componente Invisível que só aparece na Impressora Térmica */}
      <ComandaImpressao pedido={ticketParaImprimir} />

      {/* Header Fixo do KDS */}
      <KdsHeader
        filtroSetor={filtroSetor}
        totalAtivos={pedidosAtivos.length}
        totalEmPreparo={pedidosEmPreparo.length}
        totalProntos={pedidosProntos.length}
        audioEnabled={hardware.audioEnabled}
        onSetFiltroSetor={setFiltroSetor}
        onToggleAudio={() => {
          hardware.initAudio();
          hardware.playNovoPedidoAlert();
        }}
        onRefresh={recarregar}
      />

      {/* Grid Kanban do KDS: 3 Colunas de Produção */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start overflow-x-auto print:hidden">
        {/* Coluna 1: Novos / Aguardando Início */}
        <section className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 space-y-3 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-zinc-100">
                1. Em Espera / Novos
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pedidosEmEspera.length}
            </span>
          </div>

          {pedidosEmEspera.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-600 space-y-1">
              <UtensilsCrossed className="w-8 h-8 opacity-40 mb-1" />
              <p className="text-xs font-semibold text-zinc-400">Sem pedidos em espera</p>
              <p className="text-[11px] text-zinc-600">Novos pedidos aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosEmEspera.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  onAtualizarStatus={atualizarStatus}
                  onImprimir={handleImprimir}
                />
              ))}
            </div>
          )}
        </section>

        {/* Coluna 2: Na Chapa / Em Preparo */}
        <section className="bg-zinc-900/60 border border-blue-500/30 rounded-3xl p-4 space-y-3 flex flex-col min-h-[500px] ring-1 ring-blue-500/10">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-400" />
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-blue-300">
                2. Na Chapa / Preparo
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {pedidosEmPreparo.length}
            </span>
          </div>

          {pedidosEmPreparo.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-600 space-y-1">
              <ChefHat className="w-8 h-8 opacity-40 mb-1" />
              <p className="text-xs font-semibold text-zinc-400">Chapa Livre</p>
              <p className="text-[11px] text-zinc-600">Nenhum prato sendo preparado agora</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosEmPreparo.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  onAtualizarStatus={atualizarStatus}
                  onImprimir={handleImprimir}
                />
              ))}
            </div>
          )}
        </section>

        {/* Coluna 3: Prontos / Saindo para a Mesa */}
        <section className="bg-zinc-900/60 border border-emerald-500/30 rounded-3xl p-4 space-y-3 flex flex-col min-h-[500px] ring-1 ring-emerald-500/10">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-emerald-300">
                3. Prontos / Despachar
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {pedidosProntos.length}
            </span>
          </div>

          {pedidosProntos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-600 space-y-1">
              <Sparkles className="w-8 h-8 opacity-40 mb-1" />
              <p className="text-xs font-semibold text-zinc-400">Balcão Limpo</p>
              <p className="text-[11px] text-zinc-600">Nenhum prato aguardando o garçom</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosProntos.map((pedido) => (
                <KdsCard
                  key={pedido.id}
                  pedido={pedido}
                  onAtualizarStatus={atualizarStatus}
                  onImprimir={handleImprimir}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
