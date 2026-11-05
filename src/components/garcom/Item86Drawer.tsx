'use client';

import React, { useState } from 'react';
import { Search, Ban, AlertTriangle } from 'lucide-react';
import { Produto } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface Item86DrawerProps {
  produtos: Produto[];
  onToggleDisponibilidade: (produtoId: string, disponivel: boolean) => void;
}

export const Item86Drawer: React.FC<Item86DrawerProps> = ({
  produtos,
  onToggleDisponibilidade,
}) => {
  const [busca, setBusca] = useState('');

  const produtosFiltrados = (produtos || []).filter(
    (p) =>
      p &&
      (!busca.trim() ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.setor.toLowerCase().includes(busca.toLowerCase()))
  );

  const totalEsgotados = (produtos || []).filter((p) => p && !p.disponivel).length;

  return (
    <div className="space-y-3">
      {/* Header da Seção */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
            <Ban className="w-4 h-4 text-red-400" />
            <span>Esgotamento Rápido (&ldquo;Item 86&rdquo;)</span>
          </h3>
          <p className="text-[11px] text-zinc-400">
            Pausar pratos em falta impede que os clientes peçam na mesa.
          </p>
        </div>

        {totalEsgotados > 0 && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            {totalEsgotados} {totalEsgotados === 1 ? 'prato pausado' : 'pratos pausados'}
          </span>
        )}
      </div>

      {/* Busca Rápida de Pratos */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar prato para pausar ou reativar..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Lista de Pratos com Switch Instantâneo */}
      <div className="space-y-2">
        {produtosFiltrados.map((prod) => {
          const isAtivo = prod.disponivel;

          return (
            <div
              key={prod.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isAtivo
                  ? 'bg-zinc-900 border-zinc-800'
                  : 'bg-red-950/20 border-red-500/40 ring-1 ring-red-500/30'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4
                    className={`font-semibold text-xs truncate ${
                      isAtivo ? 'text-zinc-100' : 'text-red-300 line-through opacity-80'
                    }`}
                  >
                    {prod.nome}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {prod.setor}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-zinc-400">
                    {formatCurrency(prod.preco)}
                  </span>
                  {!isAtivo && (
                    <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      ESGOTADO (ITEM 86)
                    </span>
                  )}
                </div>
              </div>

              {/* Switch de Ativação / Esgotamento */}
              <button
                onClick={() => onToggleDisponibilidade(prod.id, !isAtivo)}
                type="button"
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none active:scale-95 ${
                  isAtivo ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
                title={isAtivo ? 'Clique para pausar este item' : 'Clique para reativar'}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAtivo ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
