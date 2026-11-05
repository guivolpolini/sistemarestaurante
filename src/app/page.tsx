'use client';

import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  UtensilsCrossed,
  ArrowRight,
  Zap,
  Sparkles,
  Users,
  ChefHat,
  Printer,
} from 'lucide-react';
import { mockConfig, mockMesas } from '@/lib/mockData';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between antialiased dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold dark:bg-zinc-100 dark:text-zinc-950">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight">{mockConfig.nome}</h1>
              <p className="text-[11px] text-zinc-500 font-medium">
                Autoatendimento & Gestão de Restaurantes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Link Garçom */}
            <Link
              href="/garcom"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Garçom Salão</span>
            </Link>

            {/* Link KDS Cozinha */}
            <Link
              href="/kds"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>KDS Cozinha</span>
            </Link>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Fase 4 Ativa
            </span>
          </div>
        </div>
      </header>

      {/* Hero & Seletor de Mesas */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulador de Autoatendimento & Produção</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Central de Autoatendimento e Produção
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Selecione uma mesa para fazer pedidos como cliente, use o{' '}
            <Link href="/garcom" className="font-bold underline text-amber-600 dark:text-amber-400">
              Painel do Garçom
            </Link>{' '}
            para triagem, ou abra o{' '}
            <Link href="/kds" className="font-bold underline text-blue-600 dark:text-blue-400">
              KDS da Cozinha
            </Link>{' '}
            para visão Kanban e impressão térmica de comandas.
          </p>
        </div>

        {/* Grid de Mesas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">
              Salão Principal (Mesas Cadastradas)
            </h3>
            <span className="text-xs text-zinc-400">12 mesas disponíveis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {mockMesas.map((mesa) => (
              <Link
                key={mesa.id}
                href={`/mesa/${mesa.numero}?token=${mesa.session_token}`}
                className="group p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-900 hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-400"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 font-mono font-bold text-sm group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-800 dark:text-zinc-200 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900">
                    {String(mesa.numero).padStart(2, '0')}
                  </div>
                  <QrCode className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors dark:group-hover:text-zinc-100" />
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Mesa {String(mesa.numero).padStart(2, '0')}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
                    <span>
                      {mesa.status === 'ocupada'
                        ? 'Ocupada'
                        : mesa.status === 'chamando'
                        ? 'Chamando'
                        : mesa.status === 'fechando'
                        ? 'Fechando'
                        : 'Livre'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recursos da Fase 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800">
            <ChefHat className="w-5 h-5 text-amber-500 mb-2" />
            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              KDS Kanban por Setor
            </h5>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed dark:text-zinc-400">
              Visão de alta visibilidade dividindo Chapa e Bar em colunas de Espera, Preparo e Pronto.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800">
            <Printer className="w-5 h-5 text-blue-500 mb-2" />
            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              Impressão Térmica ESC/POS
            </h5>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed dark:text-zinc-400">
              Cupom monoespaçado formatado estritamente para 80mm/58mm via Web Print API com 1 clique.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800">
            <Zap className="w-5 h-5 text-emerald-500 mb-2" />
            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
              Cronômetro de Atraso
            </h5>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed dark:text-zinc-400">
              Alertas visuais cromáticos: verde (&lt;10min), amarelo (10-20min) e vermelho pulsante (&gt;20min).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 py-4 px-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        <p>Sistema de Restaurante Artesanal • Desenvolvido em Next.js 16 & Supabase</p>
      </footer>
    </div>
  );
}
