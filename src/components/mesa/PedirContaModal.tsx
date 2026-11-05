'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  X,
  Users,
  Copy,
  Check,
  QrCode,
  Percent,
} from 'lucide-react';
import { Mesa, Pedido, RestauranteConfig } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface PedirContaModalProps {
  isOpen: boolean;
  mesa: Mesa | null;
  config: RestauranteConfig;
  pedidos: Pedido[];
  onClose: () => void;
  onConfirmarFechamento: () => Promise<void>;
}

export const PedirContaModal: React.FC<PedirContaModalProps> = ({
  isOpen,
  mesa,
  config,
  pedidos,
  onClose,
  onConfirmarFechamento,
}) => {
  const [numPessoas, setNumPessoas] = useState(1);
  const [incluirTaxaServico, setIncluirTaxaServico] = useState(true);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [solicitando, setSolicitando] = useState(false);

  // Calcula subtotal a partir de todos os pedidos não cancelados
  const itensConsumidos = useMemo(() => {
    const list: {
      id: string;
      nome: string;
      quantidade: number;
      precoTotal: number;
      opcionais?: string;
    }[] = [];

    pedidos
      .filter((p) => p.status !== 'cancelado')
      .forEach((pedido) => {
        pedido.itens?.forEach((item) => {
          const somaOpc =
            item.opcionais?.reduce((acc, o) => acc + Number(o.preco_snapshot), 0) || 0;
          const precoItemTotal = (Number(item.preco_unitario) + somaOpc) * item.quantidade;
          const opcText = item.opcionais?.map((o) => o.nome_snapshot).join(', ');

          list.push({
            id: item.id,
            nome: item.produto?.nome || 'Item do cardápio',
            quantidade: item.quantidade,
            precoTotal: precoItemTotal,
            opcionais: opcText,
          });
        });
      });

    return list;
  }, [pedidos]);

  const subtotal = useMemo(() => {
    return itensConsumidos.reduce((acc, i) => acc + i.precoTotal, 0);
  }, [itensConsumidos]);

  const taxaPercentual = config.taxa_servico_padrao || 10;
  const valorTaxa = incluirTaxaServico ? (subtotal * taxaPercentual) / 100 : 0;
  const valorTotalFinal = subtotal + valorTaxa;
  const valorPorPessoa = valorTotalFinal / numPessoas;

  if (!isOpen) return null;

  const handleCopiarPix = () => {
    if (config.chave_pix) {
      navigator.clipboard.writeText(config.chave_pix);
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2000);
    }
  };

  const handlePedirEncerramento = async () => {
    setSolicitando(true);
    await onConfirmarFechamento();
    setSolicitando(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center dark:bg-zinc-800 dark:text-zinc-100">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Extrato da Conta</h3>
              <p className="text-[11px] text-zinc-500">
                Mesa {mesa ? String(mesa.numero).padStart(2, '0') : '--'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 active:scale-95 transition-all dark:bg-zinc-800 dark:text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Lista de Itens Consumidos */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-500 mb-2.5">
              Itens Pedidos nesta Comanda
            </h4>

            {itensConsumidos.length === 0 ? (
              <div className="p-4 rounded-2xl bg-zinc-50 text-center text-xs text-zinc-500 dark:bg-zinc-800/50">
                Nenhum pedido registrado nesta mesa ainda.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl p-3 bg-zinc-50/50 space-y-2 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
                {itensConsumidos.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-bold text-zinc-900 mr-1.5 dark:text-zinc-100">
                        {item.quantidade}x
                      </span>
                      <span className="text-zinc-800 font-medium dark:text-zinc-200">{item.nome}</span>
                      {item.opcionais && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.opcionais}</p>
                      )}
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.precoTotal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divisão da Conta Interativa */}
          <div className="p-3.5 rounded-2xl border border-zinc-200 bg-white space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Dividir a conta?
                </span>
              </div>

              {/* Seletor de Pessoas */}
              <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  onClick={() => setNumPessoas((p) => Math.max(1, p - 1))}
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-white active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {numPessoas} {numPessoas === 1 ? 'pes.' : 'pes.'}
                </span>
                <button
                  onClick={() => setNumPessoas((p) => Math.min(20, p + 1))}
                  type="button"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-white active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  +
                </button>
              </div>
            </div>

            {numPessoas > 1 && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-center justify-between text-xs dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300">
                <span>Valor por pessoa ({numPessoas}x):</span>
                <span className="font-bold text-sm">{formatCurrency(valorPorPessoa)}</span>
              </div>
            )}
          </div>

          {/* Toggle de Taxa de Serviço Opcional */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Taxa de Serviço ({taxaPercentual}%)
                </span>
                <span className="block text-[11px] text-zinc-500">Opcional para a equipe</span>
              </div>
            </div>

            <button
              onClick={() => setIncluirTaxaServico(!incluirTaxaServico)}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                incluirTaxaServico
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {incluirTaxaServico ? 'Incluída' : 'Remover'}
            </button>
          </div>

          {/* Chave PIX Rápida */}
          {config.chave_pix && (
            <div className="p-3.5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 space-y-2 dark:border-emerald-800 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Pague via PIX na Mesa
                  </span>
                </div>
                <button
                  onClick={handleCopiarPix}
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  {pixCopiado ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar Chave</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs text-emerald-800 bg-white/70 p-2 rounded-lg truncate border border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-200">
                {config.chave_pix}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé com Resumo e Confirmação */}
        <div className="p-4 bg-white border-t border-zinc-200/80 shrink-0 space-y-3 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-zinc-500">
              <span>Subtotal dos Itens:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {incluirTaxaServico && (
              <div className="flex items-center justify-between text-zinc-500">
                <span>Serviço ({taxaPercentual}%):</span>
                <span>{formatCurrency(valorTaxa)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base font-bold text-zinc-900 pt-1 border-t border-zinc-100 dark:text-zinc-100 dark:border-zinc-800">
              <span>Total da Conta:</span>
              <span>{formatCurrency(valorTotalFinal)}</span>
            </div>
          </div>

          <button
            onClick={handlePedirEncerramento}
            disabled={solicitando || subtotal === 0}
            type="button"
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.99] transition-all disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {solicitando ? (
              <span>Avisando fechamento...</span>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Pedir a Conta & Avaliar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
