'use client';

import React from 'react';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  EyeOff,
  Bell,
  Utensils,
  RefreshCw,
} from 'lucide-react';

interface StaffHeaderProps {
  wakeLockActive: boolean;
  audioEnabled: boolean;
  pedidosPendentesCount: number;
  chamadosCount: number;
  mesasOcupadasCount: number;
  onToggleWakeLock: () => void;
  onEnableAudio: () => void;
  onRefresh: () => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
  wakeLockActive,
  audioEnabled,
  pedidosPendentesCount,
  chamadosCount,
  mesasOcupadasCount,
  onToggleWakeLock,
  onEnableAudio,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950 text-white px-4 py-3 border-b border-zinc-800 shadow-md">
      <div className="max-w-md mx-auto flex flex-col gap-2.5">
        {/* Linha Superior: Título & Status de Hardware */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              GS
            </div>
            <div>
              <h1 className="font-bold text-xs tracking-tight text-zinc-100 flex items-center gap-1.5">
                <span>Garçom Salão</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-[10px] text-zinc-400">Operação Mobile One-Hand</p>
            </div>
          </div>

          {/* Controles de Hardware: Áudio & Wake Lock */}
          <div className="flex items-center gap-1.5">
            {/* Botão Wake Lock (Tela Acesa) */}
            <button
              onClick={onToggleWakeLock}
              type="button"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                wakeLockActive
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={wakeLockActive ? 'Tela permanecerá acesa' : 'Clique para reter a tela acesa'}
            >
              {wakeLockActive ? <Eye className="w-3 h-3 text-amber-400" /> : <EyeOff className="w-3 h-3" />}
              <span>{wakeLockActive ? 'Tela ON' : 'Tela Normal'}</span>
            </button>

            {/* Botão de Áudio (Bipes Web Audio) */}
            <button
              onClick={onEnableAudio}
              type="button"
              className={`p-1.5 rounded-full border transition-all ${
                audioEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={audioEnabled ? 'Bipes sonoros ativados' : 'Toque para ativar os bipes'}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Recarregar */}
            <button
              onClick={onRefresh}
              type="button"
              className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 active:rotate-180 transition-transform"
              title="Recarregar dados"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Linha Inferior: Badges de Resumo em Tempo Real */}
        <div className="grid grid-cols-3 gap-2">
          {/* Pedidos Pendentes */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-zinc-100">
                {pedidosPendentesCount}
              </span>
              <span className="block text-[9px] text-zinc-400 truncate">
                {pedidosPendentesCount === 1 ? 'Triagem' : 'Triagens'}
              </span>
            </div>
          </div>

          {/* Chamados Pendentes */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <Bell className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-zinc-100">
                {chamadosCount}
              </span>
              <span className="block text-[9px] text-zinc-400 truncate">
                {chamadosCount === 1 ? 'Chamado' : 'Chamados'}
              </span>
            </div>
          </div>

          {/* Mesas Ocupadas */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-zinc-100">
                {mesasOcupadasCount}/12
              </span>
              <span className="block text-[9px] text-zinc-400 truncate">Ocupadas</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
