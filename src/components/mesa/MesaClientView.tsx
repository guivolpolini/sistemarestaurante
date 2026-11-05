'use client';

import React, { useState, useMemo } from 'react';
import { Search, Utensils, Loader2 } from 'lucide-react';
import { useMesaClient } from '@/hooks/useMesaClient';
import { HeaderMesa } from '@/components/mesa/HeaderMesa';
import { CategoriasBar } from '@/components/mesa/CategoriasBar';
import { ProdutoCard } from '@/components/mesa/ProdutoCard';
import { ProdutoModal } from '@/components/mesa/ProdutoModal';
import { CarrinhoDrawer } from '@/components/mesa/CarrinhoDrawer';
import { AcompanhamentoPedidos } from '@/components/mesa/AcompanhamentoPedidos';
import { ChamarGarcomModal } from '@/components/mesa/ChamarGarcomModal';
import { PedirContaModal } from '@/components/mesa/PedirContaModal';
import { AvaliacaoModal } from '@/components/mesa/AvaliacaoModal';
import { Produto } from '@/types/database';

interface MesaClientViewProps {
  mesaNumero: number;
}

export const MesaClientView: React.FC<MesaClientViewProps> = ({ mesaNumero }) => {
  const {
    loading,
    mesa,
    config,
    categorias,
    produtos,
    pedidos,
    cart,
    cartTotal,
    cartTotalItems,
    isSubmittingOrder,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    chamarGarcom,
    pedirConta,
    salvarAvaliacao,
  } = useMesaClient(mesaNumero);

  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  // Modais
  const [modalChamadosAberto, setModalChamadosAberto] = useState(false);
  const [modalContaAberto, setModalContaAberto] = useState(false);
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);

  // Filtro de produtos
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((prod) => {
      const matchCategoria =
        categoriaAtiva === 'todos' || prod.categoria_id === categoriaAtiva;

      const matchBusca =
        !busca.trim() ||
        prod.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (prod.descricao && prod.descricao.toLowerCase().includes(busca.toLowerCase()));

      return matchCategoria && matchBusca;
    });
  }, [produtos, categoriaAtiva, busca]);

  // Produtos recomendados para UPSELL no carrinho
  const produtosUpsell = useMemo(() => {
    return produtos.filter((p) => {
      const isEntradaOuBebida =
        p.categoria_id === 'c2' || p.categoria_id === 'c3' || p.categoria_id === 'c4';
      const notInCart = !cart.some((c) => c.produto.id === p.id);
      return isEntradaOuBebida && notInCart;
    });
  }, [produtos, cart]);

  const handleQuickAdd = (produto: Produto) => {
    const hasRequired = produto.grupos?.some((g) => g.obrigatorio);
    if (!hasRequired) {
      addToCart(produto, 1, [], '');
    } else {
      setProdutoSelecionado(produto);
    }
  };

  const handleFechamentoConta = async () => {
    await pedirConta();
    setModalContaAberto(false);
    setModalAvaliacaoAberto(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 text-zinc-900 animate-spin dark:text-zinc-100 mb-3" />
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          Carregando cardápio da Mesa {mesaNumero}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
      {/* Header Fixo da Mesa */}
      <HeaderMesa
        mesa={mesa}
        config={config}
        onOpenChamados={() => setModalChamadosAberto(true)}
        onOpenConta={() => setModalContaAberto(true)}
        pedidosCount={pedidos.filter((p) => p.status !== 'cancelado' && p.status !== 'entregue').length}
      />

      {/* Barra de Categorias Horizontal */}
      <CategoriasBar
        categorias={categorias}
        categoriaAtiva={categoriaAtiva}
        onSelectCategoria={setCategoriaAtiva}
      />

      {/* Conteúdo Principal */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-5">
        {/* Campo de Busca Rápida */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no cardápio (ex: burger, batata, chopp)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-zinc-200/90 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-300"
          />
        </div>

        {/* Acompanhamento em Tempo Real dos Pedidos da Mesa */}
        <AcompanhamentoPedidos pedidos={pedidos} />

        {/* Lista de Pratos do Cardápio */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {categoriaAtiva === 'todos'
                ? 'Cardápio Completo'
                : categorias.find((c) => c.id === categoriaAtiva)?.nome || 'Pratos'}
            </h2>
            <span className="text-[11px] text-zinc-500 font-medium">
              {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {produtosFiltrados.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Utensils className="w-8 h-8 text-zinc-300 mb-2 dark:text-zinc-700" />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nenhum item encontrado
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Tente buscar com outras palavras ou selecione outra categoria.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {produtosFiltrados.map((prod) => (
                <ProdutoCard
                  key={prod.id}
                  produto={prod}
                  onSelect={(p) => setProdutoSelecionado(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhe e Customização do Produto */}
      <ProdutoModal
        produto={produtoSelecionado}
        isOpen={Boolean(produtoSelecionado)}
        onClose={() => setProdutoSelecionado(null)}
        onAddToCart={addToCart}
      />

      {/* Carrinho Flutuante e Drawer de Finalização */}
      <CarrinhoDrawer
        cart={cart}
        cartTotal={cartTotal}
        cartTotalItems={cartTotalItems}
        produtosRecomendados={produtosUpsell}
        isSubmittingOrder={isSubmittingOrder}
        onUpdateQuantity={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onQuickAddProduct={handleQuickAdd}
        onSubmitOrder={submitOrder}
      />

      {/* Modal Chamar Garçom */}
      <ChamarGarcomModal
        isOpen={modalChamadosAberto}
        mesa={mesa}
        onClose={() => setModalChamadosAberto(false)}
        onChamarGarcom={chamarGarcom}
      />

      {/* Modal Pedir a Conta */}
      <PedirContaModal
        isOpen={modalContaAberto}
        mesa={mesa}
        config={config}
        pedidos={pedidos}
        onClose={() => setModalContaAberto(false)}
        onConfirmarFechamento={handleFechamentoConta}
      />

      {/* Modal Funil QR Avalia */}
      <AvaliacaoModal
        isOpen={modalAvaliacaoAberto}
        config={config}
        onClose={() => setModalAvaliacaoAberto(false)}
        onSalvarAvaliacao={salvarAvaliacao}
      />
    </div>
  );
};
