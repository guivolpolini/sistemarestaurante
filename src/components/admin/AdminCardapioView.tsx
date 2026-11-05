'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  Wine,
  Image as ImageIcon,
  Check,
  X,
} from 'lucide-react';
import { Categoria, Produto, SetorPreparo } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';

interface AdminCardapioViewProps {
  produtos: Produto[];
  categorias: Categoria[];
  onAdicionarProduto: (novo: Omit<Produto, 'id' | 'criado_em' | 'atualizado_em'>) => void;
  onEditarProduto: (id: string, updates: Partial<Produto>) => void;
  onRemoverProduto: (id: string) => void;
  onToggleDisponibilidade: (id: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Smash Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Cheeseburger', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80' },
  { label: 'Batata Rústica', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80' },
  { label: 'Coxinha Costela', url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80' },
  { label: 'Chopp Artesanal', url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&auto=format&fit=crop&q=80' },
  { label: 'Limonada / Suco', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Sobremesa Brownie', url: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&auto=format&fit=crop&q=80' },
];

export function AdminCardapioView({
  produtos,
  categorias,
  onAdicionarProduto,
  onEditarProduto,
  onRemoverProduto,
  onToggleDisponibilidade,
}: AdminCardapioViewProps) {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [setorFiltro, setSetorFiltro] = useState<'todos' | SetorPreparo>('todos');

  // Modal State
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  // Form State
  const [formNome, setFormNome] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formCategoriaId, setFormCategoriaId] = useState('');
  const [formSetor, setFormSetor] = useState<SetorPreparo>('cozinha');
  const [formDescricao, setFormDescricao] = useState('');
  const [formImagemUrl, setFormImagemUrl] = useState('');

  const abrirModalCriacao = () => {
    setProdutoEditando(null);
    setFormNome('');
    setFormPreco('');
    setFormCategoriaId(categorias[0]?.id || 'c1');
    setFormSetor('cozinha');
    setFormDescricao('');
    setFormImagemUrl(PRESET_IMAGES[0].url);
    setModalAberto(true);
  };

  const abrirModalEdicao = (prod: Produto) => {
    setProdutoEditando(prod);
    setFormNome(prod.nome);
    setFormPreco(prod.preco.toString());
    setFormCategoriaId(prod.categoria_id);
    setFormSetor(prod.setor);
    setFormDescricao(prod.descricao || '');
    setFormImagemUrl(prod.imagem_url || '');
    setModalAberto(true);
  };

  const handleSalvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    const precoNum = parseFloat(formPreco.replace(',', '.'));
    if (!formNome.trim() || isNaN(precoNum) || precoNum <= 0) {
      alert('Por favor, informe um nome válido e um preço maior que zero.');
      return;
    }

    if (produtoEditando) {
      onEditarProduto(produtoEditando.id, {
        nome: formNome.trim(),
        preco: precoNum,
        categoria_id: formCategoriaId,
        setor: formSetor,
        descricao: formDescricao.trim() || null,
        imagem_url: formImagemUrl.trim() || null,
      });
    } else {
      onAdicionarProduto({
        nome: formNome.trim(),
        preco: precoNum,
        categoria_id: formCategoriaId,
        setor: formSetor,
        descricao: formDescricao.trim() || null,
        imagem_url: formImagemUrl.trim() || null,
        disponivel: true,
        ordem: produtos.length + 1,
      });
    }

    setModalAberto(false);
  };

  // Filtered list
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchBusca =
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase()));
      const matchCategoria =
        categoriaFiltro === 'todas' || p.categoria_id === categoriaFiltro;
      const matchSetor = setorFiltro === 'todos' || p.setor === setorFiltro;

      return matchBusca && matchCategoria && matchSetor;
    });
  }, [produtos, busca, categoriaFiltro, setorFiltro]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar & Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por prato ou ingrediente..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Sector filter */}
          <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSetorFiltro('todos')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                setorFiltro === 'todos' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSetorFiltro('cozinha')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                setorFiltro === 'cozinha' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Cozinha
            </button>
            <button
              type="button"
              onClick={() => setSetorFiltro('bar')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                setorFiltro === 'bar' ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              Bar
            </button>
          </div>
        </div>

        {/* Add Product Button */}
        <button
          type="button"
          onClick={abrirModalCriacao}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Prato / Bebida</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => setCategoriaFiltro('todas')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            categoriaFiltro === 'todas'
              ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-100 dark:text-zinc-950'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
          }`}
        >
          Todas as Categorias ({produtos.length})
        </button>
        {categorias.map((cat) => {
          const count = produtos.filter((p) => p.categoria_id === cat.id).length;
          const isSelected = categoriaFiltro === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-100 dark:text-zinc-950'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {cat.nome} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {produtosFiltrados.map((prod) => {
          const cat = categorias.find((c) => c.id === prod.categoria_id);
          return (
            <div
              key={prod.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                prod.disponivel
                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  : 'bg-zinc-950/80 border-rose-950/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Image */}
                <div className="relative w-18 h-18 rounded-xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60">
                  {prod.imagem_url ? (
                    <Image
                      src={prod.imagem_url}
                      alt={prod.nome}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="72px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  {!prod.disponivel && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] font-black text-rose-400 uppercase tracking-wider">
                      Esgotado
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-sm text-white leading-snug line-clamp-1">
                      {prod.nome}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prod.setor === 'cozinha'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {prod.setor === 'cozinha' ? <Flame className="w-2.5 h-2.5" /> : <Wine className="w-2.5 h-2.5" />}
                      {prod.setor.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {prod.descricao || 'Sem descrição cadastrada'}
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="font-extrabold text-base text-amber-400">
                      {formatCurrency(prod.preco)}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      {cat?.nome || 'Geral'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                {/* 86 Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleDisponibilidade(prod.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    prod.disponivel
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/40'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/40'
                  }`}
                  title={prod.disponivel ? 'Marcar como esgotado (86)' : 'Reativar no cardápio'}
                >
                  {prod.disponivel ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ativo</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Esgotado (86)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => abrirModalEdicao(prod)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Editar Produto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir "${prod.nome}"?`)) {
                        onRemoverProduto(prod.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900 text-zinc-400 hover:text-rose-200 transition-colors cursor-pointer"
                    title="Excluir Produto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {produtosFiltrados.length === 0 && (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-3xl text-zinc-500 text-sm">
          Nenhum prato encontrado para os filtros selecionados.
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-extrabold text-lg text-white">
                {produtoEditando ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className="space-y-4 text-xs sm:text-sm">
              {/* Nome */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Nome do Prato / Bebida</label>
                <input
                  type="text"
                  required
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Smash Salad Bacon Duplo"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Preço & Setor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={formPreco}
                    onChange={(e) => setFormPreco(e.target.value)}
                    placeholder="34.90"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Setor de Preparo</label>
                  <select
                    value={formSetor}
                    onChange={(e) => setFormSetor(e.target.value as SetorPreparo)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cozinha">Cozinha / Chapa</option>
                    <option value="bar">Bar / Bebidas</option>
                  </select>
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Categoria</label>
                <select
                  value={formCategoriaId}
                  onChange={(e) => setFormCategoriaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Descrição / Ingredientes</label>
                <textarea
                  rows={2}
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Blend especial, queijo artesanal, maionese defumada no pão brioche."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Foto URL e Presets */}
              <div className="space-y-2">
                <label className="font-semibold text-zinc-300 flex items-center justify-between">
                  <span>URL da Imagem</span>
                  <span className="text-[11px] text-zinc-400 font-normal">Presets rápidos abaixo</span>
                </label>
                <input
                  type="url"
                  value={formImagemUrl}
                  onChange={(e) => setFormImagemUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />

                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormImagemUrl(preset.url)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{produtoEditando ? 'Salvar Alterações' : 'Cadastrar Prato'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
