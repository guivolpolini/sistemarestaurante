'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  UtensilsCrossed,
  QrCode,
  SlidersHorizontal,
  Lock,
  ArrowUpRight,
  Users,
  ChefHat,
  Home,
} from 'lucide-react';
import { RestauranteConfig } from '@/types/database';

interface AdminHeaderProps {
  config: RestauranteConfig;
  abaAtiva: 'bi' | 'cardapio' | 'placas' | 'config';
  onMudarAba: (aba: 'bi' | 'cardapio' | 'placas' | 'config') => void;
  onLock: () => void;
}

export function AdminHeader({
  config,
  abaAtiva,
  onMudarAba,
  onLock,
}: AdminHeaderProps) {
  const tabs = [
    { id: 'bi' as const, label: 'Métricas & BI', icon: BarChart3 },
    { id: 'cardapio' as const, label: 'Cardápio & Preços', icon: UtensilsCrossed },
    { id: 'placas' as const, label: 'Placas de Mesa (QR/NFC)', icon: QrCode },
    { id: 'config' as const, label: 'Configurações', icon: SlidersHorizontal },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-white print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top brand row */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-xs hover:opacity-90 transition-opacity"
              title="Voltar ao Início"
            >
              <UtensilsCrossed className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  {config.nome}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ADMIN / BI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Controle Gerencial, Engenharia de Cardápio & Automação
              </p>
            </div>
          </div>

          {/* Quick links & Lock button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hub</span>
            </Link>

            <Link
              href="/garcom"
              target="_blank"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Garçom</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </Link>

            <Link
              href="/kds"
              target="_blank"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            >
              <ChefHat className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">KDS</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </Link>

            <button
              type="button"
              onClick={onLock}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>

        {/* Tab navigation pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = abaAtiva === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onMudarAba(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
