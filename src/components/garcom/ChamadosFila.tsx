'use client';

import React from 'react';
import {
  Bell,
  GlassWater,
  Utensils,
  HelpCircle,
  Eraser,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Chamado, ChamadoMotivo } from '@/types/database';

interface ChamadosFilaProps {
  chamados: Chamado[];
  onAtender: (chamadoId: string) => void;
}

const iconMotivo: Record<ChamadoMotivo, { label: string; icon: React.ReactNode; color: string }> = {
  garcom: {
    label: 'Atendimento Geral',
    icon: <Bell className="w-4 h-4 text-amber-400" />,
    color: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  gelo_limao: {
    label: 'Gelo & Limão',
    icon: <GlassWater className="w-4 h-4 text-blue-400" />,
    color: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  talheres: {
    label: 'Talheres / Pratos',
    icon: <Utensils className="w-4 h-4 text-emerald-400" />,
    color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  duvida: {
    label: 'Dúvida no Cardápio',
    icon: <HelpCircle className="w-4 h-4 text-purple-400" />,
    color: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  limpeza: {
    label: 'Limpeza na Mesa',
    icon: <Eraser className="w-4 h-4 text-orange-400" />,
    color: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  },
};

export const ChamadosFila: React.FC<ChamadosFilaProps> = ({ chamados, onAtender }) => {
  if (chamados.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 p-6 space-y-2 bg-zinc-900/30">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="font-bold text-sm text-zinc-200">Sem Chamados Pendentes</h3>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          Nenhuma mesa do salão solicitou garçom ou itens adicionais no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-200">
            Chamados Ativos no Salão
          </h3>
        </div>
        <span className="text-xs text-zinc-400">
          {chamados.length} {chamados.length === 1 ? 'mesa chamando' : 'mesas chamando'}
        </span>
      </div>

      <div className="space-y-2.5">
        {chamados.map((ch) => {
          const cfg = iconMotivo[ch.motivo] || iconMotivo.garcom;
          const mesaNum = ch.mesa?.numero || 1;
          const hora = new Date(ch.criado_em).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={ch.id}
              className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex flex-col items-center justify-center font-black">
                  <span className="text-[10px] uppercase tracking-tighter opacity-70">Mesa</span>
                  <span className="text-sm leading-none">{String(mesaNum).padStart(2, '0')}</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-zinc-100">{cfg.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                      {ch.motivo}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Clock className="w-3 h-3" />
                    Chamou às {hora}
                  </span>
                </div>
              </div>

              {/* Botão de Atendido em 1 Toque */}
              <button
                onClick={() => onAtender(ch.id)}
                type="button"
                className="py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Atendido</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
