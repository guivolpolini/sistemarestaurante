'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CartItem } from '@/types/cart';
import { Produto } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface CarrinhoDrawerProps {
  cart: CartItem[];
  cartTotal: number;
  cartTotalItems: number;
  produtosRecomendados: Produto[];
  isSubmittingOrder: boolean;
  onUpdateQuantity: (tempId: string, delta: number) => void;
  onRemoveItem: (tempId: string) => void;
  onClearCart: () => void;
  onQuickAddProduct: (produto: Produto) => void;
  onSubmitOrder: (observacoes?: string) => Promise<{ success: boolean; pedidoId?: string; error?: string }>;
}

export const CarrinhoDrawer: React.FC<CarrinhoDrawerProps> = ({
  cart,
  cartTotal,
  cartTotalItems,
  produtosRecomendados,
  isSubmittingOrder,
  onUpdateQuantity,
  onRemoveItem,
  onQuickAddProduct,
  onSubmitOrder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [observacaoGeral, setObservacaoGeral] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cartTotalItems === 0 && !isOpen) {
    return null;
  }

  const handleFinalizar = async () => {
    setErrorMessage(null);
    const res = await onSubmitOrder(observacaoGeral.trim());

    if (res.success) {
      setOrderSuccess(true);
      // Dispara confetes festivos
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignora caso canvas não esteja disponível
      }

      setTimeout(() => {
        setOrderSuccess(false);
        setIsOpen(false);
        setObservacaoGeral('');
      }, 2500);
    } else {
      setErrorMessage(res.error || 'Não foi possível enviar o pedido. Tente novamente.');
    }
  };

  return (
    <>
      {/* Botão Flutuante Inferior (Bottom Bar) */}
      {!isOpen && cartTotalItems > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => setIsOpen(true)}
              type="button"
              className="w-full flex items-center justify-between p-3.5 px-5 rounded-2xl bg-zinc-900 text-white shadow-xl hover:bg-zinc-800 active:scale-[0.98] transition-all dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950">
                    {cartTotalItems}
                  </span>
                </div>
                <span className="font-semibold text-xs tracking-tight">Ver Carrinho</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{formatCurrency(cartTotal)}</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Drawer do Carrinho */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            role="dialog"
          >
            {/* Header do Carrinho */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Seu Pedido ({cartTotalItems} {cartTotalItems === 1 ? 'item' : 'itens'})
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 active:scale-95 transition-all dark:bg-zinc-800 dark:text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {orderSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Pedido Enviado com Sucesso!
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-xs leading-relaxed dark:text-zinc-400">
                    Sua solicitação já chegou na cozinha e começou a ser preparada. Você pode
                    acompanhar o status na tela da mesa.
                  </p>
                </div>
              ) : (
                <>
                  {/* Lista de Itens do Carrinho */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.tempId}
                        className="p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 flex flex-col gap-2 dark:border-zinc-800 dark:bg-zinc-900/60"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                              {item.produto.nome}
                            </h4>
                            {/* Opcionais Selecionados */}
                            {item.opcionais.length > 0 && (
                              <ul className="mt-1 space-y-0.5">
                                {item.opcionais.map((opc, idx) => (
                                  <li
                                    key={idx}
                                    className="text-[11px] text-zinc-500 flex items-center gap-1 dark:text-zinc-400"
                                  >
                                    <span className="w-1 h-1 rounded-full bg-zinc-400" />
                                    <span>{opc.nome}</span>
                                    {opc.preco > 0 && (
                                      <span className="text-zinc-700 font-medium dark:text-zinc-300">
                                        (+{formatCurrency(opc.preco)})
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {item.notas && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">
                                &ldquo;{item.notas}&rdquo;
                              </p>
                            )}
                          </div>

                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            {formatCurrency(item.precoTotal)}
                          </span>
                        </div>

                        {/* Controles de Quantidade */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                          <button
                            onClick={() => onRemoveItem(item.tempId)}
                            type="button"
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>

                          <div className="flex items-center border border-zinc-200 rounded-lg bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                            <button
                              onClick={() => onUpdateQuantity(item.tempId, -1)}
                              type="button"
                              className="w-7 h-7 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100 active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.tempId, 1)}
                              type="button"
                              className="w-7 h-7 rounded flex items-center justify-center text-zinc-600 hover:bg-zinc-100 active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seção de UPSELL Inteligente ("Acompanha bem") */}
                  {produtosRecomendados.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                          Acompanha muito bem
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                        {produtosRecomendados.map((item) => (
                          <div
                            key={item.id}
                            className="w-40 shrink-0 p-2.5 rounded-xl border border-zinc-200 bg-white shadow-2xs flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-900"
                          >
                            {item.imagem_url && (
                              <div className="relative w-full h-20 rounded-lg overflow-hidden bg-zinc-100 mb-2 dark:bg-zinc-800">
                                <Image
                                  src={item.imagem_url}
                                  alt={item.nome}
                                  fill
                                  sizes="160px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            )}
                            <div>
                              <h5 className="font-semibold text-xs text-zinc-900 line-clamp-1 dark:text-zinc-100">
                                {item.nome}
                              </h5>
                              <p className="text-[11px] font-bold text-zinc-900 mt-0.5 dark:text-zinc-100">
                                {formatCurrency(item.preco)}
                              </p>
                            </div>
                            <button
                              onClick={() => onQuickAddProduct(item)}
                              type="button"
                              className="mt-2 w-full py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-800 font-semibold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adicionar</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observação Geral do Pedido */}
                  <div className="pt-2">
                    <label
                      htmlFor="observacaoGeral"
                      className="block font-semibold text-xs uppercase tracking-wider text-zinc-900 mb-1.5 dark:text-zinc-100"
                    >
                      Observação Geral da Mesa
                    </label>
                    <input
                      id="observacaoGeral"
                      type="text"
                      value={observacaoGeral}
                      onChange={(e) => setObservacaoGeral(e.target.value)}
                      placeholder="Ex: Mesa do aniversário, trazer pratos juntos..."
                      className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-300"
                    />
                  </div>

                  {/* Alerta de Erro se houver */}
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium dark:bg-red-950/50 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Rodapé do Carrinho com Total e Ação */}
            {!orderSuccess && (
              <div className="p-4 bg-white border-t border-zinc-200/80 shrink-0 space-y-3 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">Total do Pedido:</span>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={handleFinalizar}
                  disabled={isSubmittingOrder || cart.length === 0}
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando para a Cozinha...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Pedido para a Cozinha</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
