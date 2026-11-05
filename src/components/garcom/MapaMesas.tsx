'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Bell,
  Receipt,
  CheckCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { Mesa, MesaStatus, Pedido } from '@/types/database';

interface MapaMesasProps {
  mesas: Mesa[];
  pedidos: Pedido[];
  onLiberarMesa: (mesaId: string) => void;
}

const statusTableCfg: Record<
  MesaStatus,
  { label: string; bg: string; border: string; text: string; badge: string }
> = {
  livre: {
    label: 'Livre',
    bg: 'bg-zinc-900',
    border: 'border-zinc-800 hover:border-zinc-700',
    text: 'text-zinc-400',
    badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  },
  ocupada: {
    label: 'Ocupada',
    bg: 'bg-blue-950/30',
    border: 'border-blue-500/40 hover:border-blue-500',
    text: 'text-blue-300',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  chamando: {
    label: 'Chamando Garçom',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/80 hover:border-amber-400 ring-2 ring-amber-500/50',
    text: 'text-amber-300',
    badge: 'bg-amber-500 text-zinc-950 font-bold',
  },
  fechando: {
    label: 'Pedindo Conta',
    bg: 'bg-red-950/40',
    border: 'border-red-500/80 hover:border-red-400 ring-2 ring-red-500/50',
    text: 'text-red-300',
    badge: 'bg-red-500 text-white font-bold',
  },
};

export const MapaMesas: React.FC<MapaMesasProps> = ({ mesas, pedidos, onLiberarMesa }) => {
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);

  const pedidosDaMesa = mesaSelecionada && pedidos
    ? pedidos.filter((p) => p && p.mesa_id === mesaSelecionada.id && p.status !== 'cancelado')
    : [];

  return (
    <div className="space-y-3">
      {/* Legenda de Status */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          <span>Livre</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Ocupada</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>Chamando</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span>Pedindo Conta</span>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {mesas.map((mesa) => {
          const cfg = statusTableCfg[mesa.status] || statusTableCfg.livre;
          const pedidosAtivos = (pedidos || []).filter(
            (p) => p && p.mesa_id === mesa.id && p.status !== 'cancelado' && p.status !== 'entregue'
          ).length;

          return (
            <button
              key={mesa.id}
              onClick={() => setMesaSelecionada(mesa)}
              type="button"
              className={`p-3 rounded-2xl border ${cfg.bg} ${cfg.border} text-left transition-all active:scale-95 flex flex-col justify-between h-24 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-base font-black text-zinc-100">
                  {String(mesa.numero).padStart(2, '0')}
                </span>

                {mesa.status === 'chamando' && (
                  <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                )}
                {mesa.status === 'fechando' && (
                  <Receipt className="w-4 h-4 text-red-400 animate-pulse" />
                )}
                {mesa.status === 'ocupada' && (
                  <Smartphone className="w-3.5 h-3.5 text-blue-400 opacity-70" />
                )}
              </div>

              <div>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider border ${cfg.badge}`}
                >
                  {cfg.label}
                </span>

                {pedidosAtivos > 0 && (
                  <span className="block text-[10px] text-zinc-400 mt-0.5 font-medium">
                    {pedidosAtivos} {pedidosAtivos === 1 ? 'ped. ativo' : 'ped. ativos'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal / Detalhe da Mesa */}
      {mesaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto text-zinc-100 shadow-2xl">
            {/* Header da Mesa */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-zinc-100">
                  Mesa {String(mesaSelecionada.numero).padStart(2, '0')}
                </h3>
                <span className="text-xs text-zinc-400">
                  Status atual: {statusTableCfg[mesaSelecionada.status]?.label}
                </span>
              </div>

              <button
                onClick={() => setMesaSelecionada(null)}
                type="button"
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pedidos Registrados na Mesa */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-400">
                Histórico de Pedidos nesta Mesa
              </h4>

              {pedidosDaMesa.length === 0 ? (
                <div className="p-3 rounded-xl bg-zinc-950/60 text-xs text-zinc-500 text-center">
                  Nenhum pedido ativo no momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {pedidosDaMesa.map((ped) => (
                    <div
                      key={ped.id}
                      className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Pedido #{ped.id.slice(-4).toUpperCase()}</span>
                        <span className="font-bold text-emerald-400 uppercase text-[10px]">
                          {ped.status}
                        </span>
                      </div>
                      {ped.itens?.map((it) => (
                        <div key={it.id} className="text-zinc-200 flex justify-between">
                          <span>
                            {it.quantidade}x {it.produto?.nome}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações da Mesa */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              {/* Liberar Mesa (fechar conta e limpar) */}
              <button
                onClick={() => {
                  onLiberarMesa(mesaSelecionada.id);
                  setMesaSelecionada(null);
                }}
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-950/60 active:scale-95 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Encerrar Comanda & Liberar Mesa</span>
              </button>

              {/* Abrir Cardápio da Mesa */}
              <Link
                href={`/mesa/${mesaSelecionada.numero}?token=${mesaSelecionada.session_token}`}
                target="_blank"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver Visão do Cliente na Mesa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
