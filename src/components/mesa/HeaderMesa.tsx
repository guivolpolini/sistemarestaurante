'use client';

import React from 'react';
import { Bell, Receipt } from 'lucide-react';
import { Mesa, RestauranteConfig } from '@/types/database';

interface HeaderMesaProps {
  mesa: Mesa | null;
  config: RestauranteConfig;
  onOpenChamados: () => void;
  onOpenConta: () => void;
  pedidosCount: number;
}

export const HeaderMesa: React.FC<HeaderMesaProps> = ({
  mesa,
  config,
  onOpenChamados,
  onOpenConta,
  pedidosCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 py-3 transition-all dark:bg-zinc-950/90 dark:border-zinc-800">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Restaurante & Mesa Tag */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-zinc-900 text-sm tracking-tight line-clamp-1 dark:text-zinc-100">
              {config.nome}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Mesa {mesa ? String(mesa.numero).padStart(2, '0') : '--'}
            </div>
            {pedidosCount > 0 && (
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {pedidosCount} {pedidosCount === 1 ? 'pedido ativo' : 'pedidos ativos'}
              </span>
            )}
          </div>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2">
          {/* Chamar Garçom */}
          <button
            onClick={onOpenChamados}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80 active:scale-95 transition-transform hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            title="Chamar garçom na mesa"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Garçom</span>
          </button>

          {/* Pedir Conta / Extrato */}
          <button
            onClick={onOpenConta}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 text-white active:scale-95 transition-transform hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            title="Ver consumo e pedir a conta"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Conta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
