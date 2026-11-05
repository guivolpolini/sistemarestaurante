'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Utensils,
  ChefHat,
  Sparkles,
  Check,
} from 'lucide-react';
import { Pedido, SetorPreparo } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface TriagemPedidosProps {
  pedidosPendentes: Pedido[];
  pedidosEmPreparo: Pedido[];
  filtroSetor: 'todos' | SetorPreparo;
  onSetFiltroSetor: (setor: 'todos' | SetorPreparo) => void;
  onAprovar: (pedidoId: string) => void;
  onRejeitar: (pedidoId: string) => void;
  onMarcarPronto: (pedidoId: string) => void;
  onMarcarEntregue: (pedidoId: string) => void;
}

export const TriagemPedidos: React.FC<TriagemPedidosProps> = ({
  pedidosPendentes,
  pedidosEmPreparo,
  filtroSetor,
  onSetFiltroSetor,
  onAprovar,
  onRejeitar,
  onMarcarPronto,
  onMarcarEntregue,
}) => {
  const [abaSecundaria, setAbaSecundaria] = React.useState<'pendentes' | 'em_andamento'>('pendentes');

  return (
    <div className="space-y-3">
      {/* Abas Superiores & Filtro de Setor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setAbaSecundaria('pendentes')}
            type="button"
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              abaSecundaria === 'pendentes'
                ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Aguardando Aprovação ({pedidosPendentes.length})
          </button>
          <button
            onClick={() => setAbaSecundaria('em_andamento')}
            type="button"
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              abaSecundaria === 'em_andamento'
                ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cozinha / Prontos ({pedidosEmPreparo.length})
          </button>
        </div>

        {/* Filtro Cozinha vs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['todos', 'cozinha', 'bar'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSetFiltroSetor(s)}
              type="button"
              className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${
                filtroSetor === s
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {s === 'todos' ? 'Todos os Setores' : s === 'cozinha' ? 'Cozinha (Chapa)' : 'Bar (Chopp/Bebidas)'}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Fila de Triagem */}
      {abaSecundaria === 'pendentes' ? (
        pedidosPendentes.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 p-6 space-y-2 bg-zinc-900/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-zinc-200">Fila Limpa!</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Nenhum pedido novo aguardando aprovação do garçom neste momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosPendentes.map((pedido) => {
              const mesaNum = pedido.mesa?.numero || 1;
              const hora = new Date(pedido.criado_em).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={pedido.id}
                  className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 shadow-sm flex flex-col justify-between space-y-3.5"
                >
                  {/* Topo do Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold text-sm">
                        Mesa {String(mesaNum).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {hora}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pendente
                    </span>
                  </div>

                  {/* Lista de Itens do Pedido */}
                  <div className="divide-y divide-zinc-800/80 border-y border-zinc-800/80 py-2 space-y-2">
                    {pedido.itens?.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-400 text-sm">
                              {item.quantidade}x
                            </span>
                            <span className="font-semibold text-zinc-100">
                              {item.produto?.nome || 'Item do cardápio'}
                            </span>
                          </div>

                          {/* Opcionais */}
                          {item.opcionais && item.opcionais.length > 0 && (
                            <p className="text-[11px] text-zinc-400 pl-5 mt-0.5">
                              ↳ {item.opcionais.map((o) => o.nome_snapshot).join(', ')}
                            </p>
                          )}

                          {/* Observação específica do item */}
                          {item.notas && (
                            <p className="text-[11px] text-amber-300 italic pl-5 mt-0.5">
                              &ldquo;{item.notas}&rdquo;
                            </p>
                          )}
                        </div>

                        <span className="text-zinc-400 font-mono text-[11px]">
                          {formatCurrency(Number(item.preco_unitario) * item.quantidade)}
                        </span>
                      </div>
                    ))}

                    {/* Observação Geral da Mesa */}
                    {pedido.observacao && (
                      <div className="pt-2 text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        <span className="font-bold">Obs Geral:</span> {pedido.observacao}
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação de 1 Toque (Ergonomia Mobile) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => onRejeitar(pedido.id)}
                      type="button"
                      className="py-3 px-3 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rejeitar</span>
                    </button>

                    <button
                      onClick={() => onAprovar(pedido.id)}
                      type="button"
                      className="py-3 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprovar (Cozinha)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Aba Pedidos em Andamento / Prontos */
        pedidosEmPreparo.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 p-6 space-y-2 bg-zinc-900/30">
            <Utensils className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="font-bold text-sm text-zinc-200">Nenhum Pedido em Produção</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Quando aprovar pedidos, eles aparecerão aqui com status de preparo e entrega.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosEmPreparo.map((pedido) => {
              const isPronto = pedido.status === 'pronto';
              const mesaNum = pedido.mesa?.numero || 1;

              return (
                <div
                  key={pedido.id}
                  className={`rounded-2xl border p-4 shadow-sm space-y-3 transition-all ${
                    isPronto
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-xs">
                        Mesa {String(mesaNum).padStart(2, '0')}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        #{pedido.id.slice(-4).toUpperCase()}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPronto
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {isPronto ? (
                        <>
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Pronto na Mesa</span>
                        </>
                      ) : (
                        <>
                          <ChefHat className="w-3 h-3 text-blue-400" />
                          <span>Em Preparo</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resumo de Itens */}
                  <div className="text-xs text-zinc-300 space-y-1">
                    {pedido.itens?.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>
                          {i.quantidade}x {i.produto?.nome}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ação rápida de avanço */}
                  <div>
                    {!isPronto ? (
                      <button
                        onClick={() => onMarcarPronto(pedido.id)}
                        type="button"
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Marcar como Pronto</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onMarcarEntregue(pedido.id)}
                        type="button"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirmar Entrega na Mesa</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
