'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { Produto, ItemOpcional } from '@/types/database';
import { CartItemOption } from '@/types/cart';
import { formatCurrency } from '@/lib/formatters';

interface ProdutoModalProps {
  produto: Produto | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    produto: Produto,
    quantidade: number,
    opcionais: CartItemOption[],
    notas: string
  ) => void;
}

export const ProdutoModal: React.FC<ProdutoModalProps> = ({
  produto,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantidade, setQuantidade] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ItemOpcional[]>>({});
  const [notas, setNotas] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calcula grupos do produto
  const grupos = useMemo(() => produto?.grupos || [], [produto]);

  // Inicializa opções padrão quando produto muda
  useEffect(() => {
    if (!produto || !isOpen) return;

    const initial: Record<string, ItemOpcional[]> = {};
    produto.grupos?.forEach((grupo) => {
      if (grupo.obrigatorio && grupo.itens && grupo.itens.length > 0) {
        initial[grupo.id] = [grupo.itens[0]];
      } else {
        initial[grupo.id] = [];
      }
    });

    const resetTimer = setTimeout(() => {
      setQuantidade(1);
      setNotas('');
      setValidationError(null);
      setSelectedOptions(initial);
    }, 0);

    return () => clearTimeout(resetTimer);
  }, [produto, isOpen]);

  // Cálculo de Preço sempre executado sem early return
  const totalOpcionais = useMemo(() => {
    return Object.values(selectedOptions)
      .flat()
      .reduce((acc, curr) => acc + Number(curr.preco_adicional), 0);
  }, [selectedOptions]);

  const precoUnitarioFinal = (produto?.preco || 0) + totalOpcionais;
  const precoTotalCalculado = precoUnitarioFinal * quantidade;

  const handleToggleOption = (
    grupoId: string,
    item: ItemOpcional,
    maxOpcoes: number,
    isSingleChoice: boolean
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[grupoId] || [];

      if (isSingleChoice) {
        return { ...prev, [grupoId]: [item] };
      }

      const exists = current.some((opc) => opc.id === item.id);
      if (exists) {
        return { ...prev, [grupoId]: current.filter((opc) => opc.id !== item.id) };
      }

      if (current.length >= maxOpcoes) {
        return prev;
      }

      return { ...prev, [grupoId]: [...current, item] };
    });
  };

  const handleConfirm = () => {
    if (!produto) return;

    for (const grupo of grupos) {
      const count = (selectedOptions[grupo.id] || []).length;
      if (grupo.obrigatorio && count < grupo.min_opcoes) {
        setValidationError(`Por favor, selecione ao menos ${grupo.min_opcoes} opção em "${grupo.nome}".`);
        return;
      }
    }

    const flatOptions: CartItemOption[] = [];
    grupos.forEach((grupo) => {
      const chosen = selectedOptions[grupo.id] || [];
      chosen.forEach((c) => {
        flatOptions.push({
          id: c.id,
          grupoId: grupo.id,
          grupoNome: grupo.nome,
          nome: c.nome,
          preco: Number(c.preco_adicional),
        });
      });
    });

    onAddToCart(produto, quantidade, flatOptions, notas.trim());
    onClose();
  };

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        role="dialog"
      >
        {/* Imagem de Capa e Botão Fechar */}
        <div className="relative w-full h-48 sm:h-56 bg-zinc-100 shrink-0 dark:bg-zinc-800">
          {produto.imagem_url ? (
            <Image
              src={produto.imagem_url}
              alt={produto.nome}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              Sem foto
            </div>
          )}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur hover:bg-black/70 active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Título e Descrição */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900 leading-tight dark:text-zinc-100">
              {produto.nome}
            </h2>
            {produto.descricao && (
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed dark:text-zinc-400">
                {produto.descricao}
              </p>
            )}
            <div className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(produto.preco)}
            </div>
          </div>

          {/* Grupos de Opcionais */}
          {grupos.map((grupo) => {
            const isSingleChoice = grupo.max_opcoes === 1;
            const chosen = selectedOptions[grupo.id] || [];

            return (
              <div key={grupo.id} className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      {grupo.nome}
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      {isSingleChoice
                        ? 'Escolha 1 opção'
                        : `Escolha até ${grupo.max_opcoes} ${grupo.max_opcoes === 1 ? 'opção' : 'opções'}`}
                    </span>
                  </div>
                  {grupo.obrigatorio ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Obrigatório
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Opcional
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {grupo.itens?.map((item) => {
                    const isSelected = chosen.some((c) => c.id === item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          handleToggleOption(
                            grupo.id,
                            item,
                            grupo.max_opcoes,
                            isSingleChoice
                          )
                        }
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-50/80 font-medium dark:border-zinc-300 dark:bg-zinc-800/80'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                                : 'border-zinc-300 dark:border-zinc-600'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="text-zinc-900 dark:text-zinc-100">{item.nome}</span>
                        </div>

                        {Number(item.preco_adicional) > 0 && (
                          <span className="text-zinc-600 font-semibold dark:text-zinc-400">
                            + {formatCurrency(Number(item.preco_adicional))}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Campo de Observações */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <label
              htmlFor="notas"
              className="block font-semibold text-xs uppercase tracking-wider text-zinc-900 mb-2 dark:text-zinc-100"
            >
              Observações do Prato
            </label>
            <textarea
              id="notas"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ex: sem cebola, maionese à parte, carne bem tostada..."
              className="w-full p-3 rounded-xl border border-zinc-200 text-xs bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-zinc-300"
            />
          </div>

          {/* Alerta de Validação se houver */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium dark:bg-red-950/50 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Rodapé Fixo: Quantidade e Botão Adicionar */}
        <div className="p-4 bg-white border-t border-zinc-200/80 flex items-center gap-3 shrink-0 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
            <button
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-white active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {quantidade}
            </span>
            <button
              onClick={() => setQuantidade((q) => q + 1)}
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-white active:scale-95 transition-all dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            type="button"
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-between hover:bg-zinc-800 active:scale-[0.99] transition-all dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span>Adicionar ao Pedido</span>
            <span>{formatCurrency(precoTotalCalculado)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
