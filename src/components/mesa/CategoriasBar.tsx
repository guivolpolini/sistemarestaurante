'use client';

import React from 'react';
import {
  Beef,
  UtensilsCrossed,
  Beer,
  CupSoda,
  IceCream,
  Utensils,
  Flame,
} from 'lucide-react';
import { Categoria } from '@/types/database';

interface CategoriasBarProps {
  categorias: Categoria[];
  categoriaAtiva: string;
  onSelectCategoria: (id: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Beef: <Beef className="w-4 h-4" />,
  UtensilsCrossed: <UtensilsCrossed className="w-4 h-4" />,
  Beer: <Beer className="w-4 h-4" />,
  CupSoda: <CupSoda className="w-4 h-4" />,
  IceCream: <IceCream className="w-4 h-4" />,
  Utensils: <Utensils className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
};

export const CategoriasBar: React.FC<CategoriasBarProps> = ({
  categorias,
  categoriaAtiva,
  onSelectCategoria,
}) => {
  return (
    <div className="sticky top-[57px] z-20 bg-white/95 backdrop-blur border-b border-zinc-100 py-2.5 px-4 overflow-x-auto no-scrollbar dark:bg-zinc-950/95 dark:border-zinc-800">
      <div className="max-w-md mx-auto flex items-center gap-2 min-w-max">
        <button
          onClick={() => onSelectCategoria('todos')}
          type="button"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            categoriaAtiva === 'todos'
              ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-400'
          }`}
        >
          <span>Todos</span>
        </button>

        {categorias.map((cat) => {
          const isSelected = categoriaAtiva === cat.id;
          const Icon = iconMap[cat.icone] || <Utensils className="w-4 h-4" />;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategoria(cat.id)}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-400'
              }`}
            >
              <span className={isSelected ? 'text-white dark:text-zinc-900' : 'text-zinc-500'}>
                {Icon}
              </span>
              <span>{cat.nome}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
