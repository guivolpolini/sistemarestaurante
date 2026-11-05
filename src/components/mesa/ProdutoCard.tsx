'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { Produto } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface ProdutoCardProps {
  produto: Produto;
  onSelect: (produto: Produto) => void;
}

export const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onSelect }) => {
  const hasOptions = produto.grupos && produto.grupos.length > 0;

  return (
    <div
      onClick={() => onSelect(produto)}
      className="group flex items-stretch gap-3.5 p-3.5 rounded-2xl bg-white border border-zinc-200/70 hover:border-zinc-300 shadow-xs hover:shadow-sm cursor-pointer transition-all active:scale-[0.99] dark:bg-zinc-900/60 dark:border-zinc-800 dark:hover:border-zinc-700"
    >
      {/* Informações de Texto */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors dark:text-zinc-100">
              {produto.nome}
            </h3>
          </div>
          {produto.descricao && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed dark:text-zinc-400">
              {produto.descricao}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-1">
          <div>
            <span className="text-xs text-zinc-400 font-medium mr-1">
              {hasOptions ? 'a partir de' : ''}
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(produto.preco)}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-zinc-100 text-zinc-800 group-hover:bg-zinc-900 group-hover:text-white transition-all dark:bg-zinc-800 dark:text-zinc-200 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900"
          >
            {hasOptions ? (
              <>
                <SlidersHorizontal className="w-3 h-3" />
                <span>Montar</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Imagem do Produto */}
      {produto.imagem_url && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            sizes="96px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>
      )}
    </div>
  );
};
