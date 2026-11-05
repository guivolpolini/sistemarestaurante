'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { SetorPreparo } from '@/types/database';

interface KdsHeaderProps {
  filtroSetor: 'todos' | SetorPreparo;
  totalAtivos: number;
  totalEmPreparo: number;
  totalProntos: number;
  audioEnabled: boolean;
  onSetFiltroSetor: (setor: 'todos' | SetorPreparo) => void;
  onToggleAudio: () => void;
  onRefresh: () => void;
}

export const KdsHeader: React.FC<KdsHeaderProps> = ({
  filtroSetor,
  totalAtivos,
  totalEmPreparo,
  totalProntos,
  audioEnabled,
  onSetFiltroSetor,
  onToggleAudio,
  onRefresh,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [horaAtual, setHoraAtual] = useState('');

  // Relógio do turno da cozinha
  useEffect(() => {
    const updateTime = () => {
      setHoraAtual(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-4 py-3 text-zinc-100 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Lado Esquerdo: Identificação & Setor */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Voltar ao início"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight flex items-center gap-1.5">
                <span>KDS Cozinha & Bar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono">Kitchen Display System</p>
            </div>
          </div>

          {/* Filtro de Setor */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 ml-2">
            {(['todos', 'cozinha', 'bar'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onSetFiltroSetor(s)}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  filtroSetor === s
                    ? 'bg-amber-500 text-zinc-950 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s === 'todos' ? 'Todos' : s === 'cozinha' ? 'Chapa / Cozinha' : 'Bar / Bebidas'}
              </button>
            ))}
          </div>
        </div>

        {/* Lado Direito: Métricas, Relógio & Hardware */}
        <div className="flex items-center gap-3">
          {/* Métricas Rápidas */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
              <strong className="text-zinc-100 mr-1">{totalAtivos}</strong> Ativos
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono">
              <strong className="text-blue-200 mr-1">{totalEmPreparo}</strong> Na Chapa
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono">
              <strong className="text-emerald-200 mr-1">{totalProntos}</strong> Prontos
            </span>
          </div>

          {/* Relógio do Turno */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{horaAtual}</span>
          </div>

          {/* Ações: Tela Cheia & Áudio */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleAudio}
              type="button"
              className={`p-2 rounded-xl border transition-all ${
                audioEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={audioEnabled ? 'Alarme sonoro ativo' : 'Ativar alarme sonoro'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={handleToggleFullscreen}
              type="button"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all"
              title={isFullscreen ? 'Sair da tela cheia' : 'Entrar em modo tela cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onRefresh}
              type="button"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 active:rotate-180 transition-transform"
              title="Recarregar KDS"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Seletor Mobile de Setor (telas pequenas) */}
      <div className="flex sm:hidden items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mt-2.5">
        {(['todos', 'cozinha', 'bar'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onSetFiltroSetor(s)}
            type="button"
            className={`flex-1 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
              filtroSetor === s
                ? 'bg-amber-500 text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {s === 'todos' ? 'Todos' : s === 'cozinha' ? 'Chapa' : 'Bar'}
          </button>
        ))}
      </div>
    </header>
  );
};
