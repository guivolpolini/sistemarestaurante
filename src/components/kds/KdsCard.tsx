'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  Check,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { Pedido, PedidoStatus } from '@/types/database';

interface KdsCardProps {
  pedido: Pedido;
  onAtualizarStatus: (pedidoId: string, status: PedidoStatus) => void;
  onImprimir: (pedido: Pedido) => void;
}

export const KdsCard: React.FC<KdsCardProps> = ({
  pedido,
  onAtualizarStatus,
  onImprimir,
}) => {
  const [segundosDecorridos, setSegundosDecorridos] = useState(() => {
    const diff = Math.floor((Date.now() - new Date(pedido.criado_em).getTime()) / 1000);
    return Math.max(0, diff);
  });

  // Cronômetro em tempo real do ticket
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(pedido.criado_em).getTime()) / 1000);
      setSegundosDecorridos(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(interval);
  }, [pedido.criado_em]);

  const minutos = Math.floor(segundosDecorridos / 60);
  const segundos = segundosDecorridos % 60;
  const tempoFormatado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  // Nível de Urgência por Tempo
  // Verde: < 10 min | Amarelo: 10 a 20 min | Vermelho Crítico: > 20 min
  const isCritico = minutos >= 20;
  const isAtencao = minutos >= 10 && minutos < 20;

  const urgenciaBg = isCritico
    ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
    : isAtencao
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const mesaNum = pedido.mesa?.numero || 1;
  const ticketId = pedido.id.slice(-4).toUpperCase();

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border p-4 shadow-md transition-all ${
        isCritico
          ? 'bg-red-950/20 border-red-500/60 ring-2 ring-red-500/40'
          : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      {/* Topo do Ticket: Mesa & Cronômetro */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-100 font-black text-base tracking-tight font-mono">
              MESA {String(mesaNum).padStart(2, '0')}
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">#{ticketId}</span>
          </div>

          {/* Cronômetro com Alerta Visual */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black font-mono tracking-wider ${urgenciaBg}`}
            title={`Tempo decorrido: ${minutos} minutos`}
          >
            {isCritico ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            <span>{tempoFormatado}</span>
          </div>
        </div>

        {/* Lista de Itens para a Chapa/Bar */}
        <div className="py-3 space-y-3">
          {pedido.itens?.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-zinc-950 font-black text-sm">
                  {item.quantidade}x
                </span>
                <span className="font-bold text-sm text-zinc-100 leading-snug">
                  {item.produto?.nome}
                </span>
              </div>

              {/* Opcionais / Ponto da Carne */}
              {item.opcionais && item.opcionais.length > 0 && (
                <div className="pl-9 space-y-0.5">
                  {item.opcionais.map((o) => (
                    <span
                      key={o.id}
                      className="inline-block text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md mr-1"
                    >
                      • {o.nome_snapshot}
                    </span>
                  ))}
                </div>
              )}

              {/* Observação Específica do Item */}
              {item.notas && (
                <div className="pl-9 mt-1">
                  <span className="inline-block text-xs font-black text-red-200 bg-red-950/80 border border-red-500/50 px-2 py-0.5 rounded-md uppercase">
                    OBS: {item.notas}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Observação Geral da Mesa */}
          {pedido.observacao && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <span className="font-bold block text-[10px] uppercase text-amber-400">
                Observação da Mesa:
              </span>
              {pedido.observacao}
            </div>
          )}
        </div>
      </div>

      {/* Ações do Ticket: Imprimir & Avançar Status */}
      <div className="pt-3 border-t border-zinc-800 flex items-center gap-2">
        {/* Botão Impressão Térmica ESC/POS */}
        <button
          onClick={() => onImprimir(pedido)}
          type="button"
          className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
          title="Imprimir comanda térmica (80mm/58mm)"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Botão de Avanço de Status */}
        {pedido.status === 'pendente_garcom' && (
          <button
            onClick={() => onAtualizarStatus(pedido.id, 'em_preparo')}
            type="button"
            className="flex-1 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Iniciar Preparo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {pedido.status === 'em_preparo' && (
          <button
            onClick={() => onAtualizarStatus(pedido.id, 'pronto')}
            type="button"
            className="flex-1 py-3 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pronto para Entrega</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {pedido.status === 'pronto' && (
          <button
            onClick={() => onAtualizarStatus(pedido.id, 'entregue')}
            type="button"
            className="flex-1 py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Despachar / Entregue</span>
          </button>
        )}
      </div>
    </div>
  );
};
