'use client';

import React from 'react';
import {
  Clock,
  ChefHat,
  Sparkles,
  CheckCircle,
  XCircle,
  Hourglass,
  Utensils,
} from 'lucide-react';
import { Pedido, PedidoStatus } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface AcompanhamentoPedidosProps {
  pedidos: Pedido[];
}

const statusConfig: Record<
  PedidoStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode; step: number }
> = {
  pendente_garcom: {
    label: 'Aguardando Garçom',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
    icon: <Hourglass className="w-3.5 h-3.5 text-amber-600 animate-pulse" />,
    step: 1,
  },
  em_preparo: {
    label: 'Em Preparo na Cozinha',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
    icon: <ChefHat className="w-3.5 h-3.5 text-blue-600" />,
    step: 2,
  },
  pronto: {
    label: 'Pronto! A Caminho da Mesa',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
    icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />,
    step: 3,
  },
  entregue: {
    label: 'Entregue na Mesa',
    color: 'text-zinc-600 dark:text-zinc-400',
    bg: 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800',
    icon: <CheckCircle className="w-3.5 h-3.5 text-zinc-500" />,
    step: 4,
  },
  cancelado: {
    label: 'Pedido Cancelado',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800',
    icon: <XCircle className="w-3.5 h-3.5 text-red-600" />,
    step: 0,
  },
};

export const AcompanhamentoPedidos: React.FC<AcompanhamentoPedidosProps> = ({ pedidos }) => {
  if (pedidos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Utensils className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Acompanhamento em Tempo Real
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-medium">
          {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>

      <div className="space-y-3">
        {pedidos.map((pedido) => {
          const cfg = statusConfig[pedido.status] || statusConfig.pendente_garcom;
          const horaCriado = new Date(pedido.criado_em).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={pedido.id}
              className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs dark:bg-zinc-900 dark:border-zinc-800"
            >
              {/* Header do Pedido */}
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Pedido #{pedido.id.slice(-4).toUpperCase()}
                  </span>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {horaCriado}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}
                >
                  {cfg.icon}
                  <span>{cfg.label}</span>
                </div>
              </div>

              {/* Linha de Progresso Visual (Timeline Steps) */}
              {pedido.status !== 'cancelado' && (
                <div className="my-3 px-1">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-zinc-200 dark:bg-zinc-800 z-0" />
                    <div
                      className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-500 z-0"
                      style={{
                        width: `${((cfg.step - 1) / 3) * 100}%`,
                      }}
                    />

                    {[
                      { step: 1, label: 'Enviado' },
                      { step: 2, label: 'Preparo' },
                      { step: 3, label: 'Pronto' },
                      { step: 4, label: 'Entregue' },
                    ].map((s) => {
                      const isCompleted = cfg.step >= s.step;
                      const isCurrent = cfg.step === s.step;

                      return (
                        <div key={s.step} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                            } ${isCurrent ? 'ring-3 ring-emerald-200 dark:ring-emerald-950 scale-110' : ''}`}
                          >
                            {isCompleted ? '✓' : s.step}
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500 mt-1 dark:text-zinc-400">
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Itens do Pedido */}
              <div className="mt-2.5 pt-2 border-t border-zinc-100 space-y-1 dark:border-zinc-800">
                {pedido.itens?.map((item) => (
                  <div key={item.id} className="text-xs text-zinc-700 flex items-start justify-between dark:text-zinc-300">
                    <div>
                      <span className="font-semibold text-zinc-900 mr-1.5 dark:text-zinc-100">
                        {item.quantidade}x
                      </span>
                      <span>{item.produto?.nome || 'Item do cardápio'}</span>

                      {item.opcionais && item.opcionais.length > 0 && (
                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                          {item.opcionais.map((o) => o.nome_snapshot).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-zinc-900 text-right dark:text-zinc-100">
                      {formatCurrency(Number(item.preco_unitario) * item.quantidade)}
                    </span>
                  </div>
                ))}

                {pedido.observacao && (
                  <p className="text-[11px] text-zinc-500 italic mt-1 dark:text-zinc-400">
                    Obs: {pedido.observacao}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
