'use client';

import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  Smartphone,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { mockConfig, mockMesas } from '@/lib/mockData';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between antialiased dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top Header */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Fase 2 Ativa
            </span>
          </div>
        </div>
      </header>

      {/* Hero & Seletor de Mesas */}
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulador de Autoatendimento do Cliente</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Escaneie a Placa ou Escolha uma Mesa
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Selecione uma mesa abaixo para testar o fluxo completo do cliente: cardápio interativo,
            personalização com opcionais, upsell inteligente, proteção por idempotência, pedidos em
            tempo real e funil de avaliação.
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
                    <span>{mesa.status === 'ocupada' ? 'Em uso' : 'Livre'}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recursos da Fase 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800">
            <Zap className="w-5 h-5 text-amber-500 mb-2" />
            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Zero Aplicativo</h5>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed dark:text-zinc-400">
              Acesso instantâneo via NFC ou QR Code sem necessidade de baixar app ou criar conta.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Chave Anti-Duplicidade</h5>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed dark:text-zinc-400">
              Idempotency keys no banco evitam pedidos duplicados mesmo se o Wi-Fi oscilar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800">
            <Smartphone className="w-5 h-5 text-blue-500 mb-2" />
            <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Funil QR Avalia</h5>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed dark:text-zinc-400">
              Notas 4-5 levam ao Google Meu Negócio; notas 1-3 abrem canal direto com o gerente.
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
