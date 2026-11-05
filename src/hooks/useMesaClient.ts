'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Categoria,
  ChamadoMotivo,
  Comanda,
  Mesa,
  Pedido,
  Produto,
  RestauranteConfig,
} from '@/types/database';
import { CartItem, CartItemOption } from '@/types/cart';
import {
  mockCategorias,
  mockConfig,
  mockMesas,
  mockProdutos,
} from '@/lib/mockData';
import { generateIdempotencyKey } from '@/lib/formatters';

export function useMesaClient(mesaNumero: number) {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<RestauranteConfig>(mockConfig);
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>(mockCategorias);
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [comanda, setComanda] = useState<Comanda | null>(null);

  // Inicialização lazy direta do localStorage sem useEffect com cascading renders
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`restaurante_cart_m${mesaNumero}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`restaurante_pedidos_m${mesaNumero}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [chamandoGarcom, setChamandoGarcom] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const cartStorageKey = useMemo(() => `restaurante_cart_m${mesaNumero}`, [mesaNumero]);
  const pedidosStorageKey = useMemo(() => `restaurante_pedidos_m${mesaNumero}`, [mesaNumero]);

  // Sincroniza carrinho no localStorage quando alterado
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {
      // Ignora
    }
  }, [cart, cartStorageKey]);

  // Sincroniza pedidos no localStorage quando alterados
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(pedidosStorageKey, JSON.stringify(pedidos));
    } catch {
      // Ignora
    }
  }, [pedidos, pedidosStorageKey]);

  // Busca dados iniciais
  useEffect(() => {
    let isMounted = true;

    async function carregarDados() {
      const hasSupabase = isSupabaseConfigured();

      if (!hasSupabase) {
        if (!isMounted) return;
        const mesaEncontrada = mockMesas.find((m) => m.numero === mesaNumero) || {
          id: `m_${mesaNumero}`,
          numero: mesaNumero,
          status: 'ocupada',
          session_token: `token_${mesaNumero}`,
          comanda_atual_id: `cmd_m${mesaNumero}`,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        };
        setMesa(mesaEncontrada);
        setConfig(mockConfig);
        setCategorias(mockCategorias);
        setProdutos(mockProdutos);

        const mockComanda: Comanda = {
          id: `cmd_m${mesaNumero}`,
          mesa_id: mesaEncontrada.id,
          status: 'aberta',
          total_itens: 0,
          taxa_servico: 0,
          valor_final: 0,
          aberta_em: new Date().toISOString(),
          fechada_em: null,
        };
        setComanda(mockComanda);
        setLoading(false);
        return;
      }

      try {
        // 1. Config
        const { data: configData } = await supabase
          .from('restaurante_config')
          .select('*')
          .limit(1)
          .single();
        if (isMounted && configData) setConfig(configData);

        // 2. Mesa
        let mesaAtual: Mesa | null = null;
        const { data: mesaData } = await supabase
          .from('mesas')
          .select('*')
          .eq('numero', mesaNumero)
          .maybeSingle();

        if (mesaData) {
          mesaAtual = mesaData;
          if (isMounted) setMesa(mesaData);
        } else {
          const fallbackMesa = mockMesas.find((m) => m.numero === mesaNumero) || mockMesas[0];
          mesaAtual = fallbackMesa;
          if (isMounted) setMesa(fallbackMesa);
        }

        // 3. Categorias
        const { data: catData } = await supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true });
        if (isMounted && catData && catData.length > 0) setCategorias(catData);

        // 4. Produtos
        const { data: prodData } = await supabase
          .from('produtos')
          .select(`
            *,
            grupos:grupos_opcionais(
              *,
              itens:itens_opcionais(*)
            )
          `)
          .eq('disponivel', true)
          .order('ordem', { ascending: true });
        if (isMounted && prodData && prodData.length > 0) {
          setProdutos(prodData as Produto[]);
        }

        // 5. Comanda
        if (mesaAtual) {
          const { data: cmdData } = await supabase
            .from('comandas')
            .select('*')
            .eq('mesa_id', mesaAtual.id)
            .eq('status', 'aberta')
            .maybeSingle();

          if (isMounted && cmdData) {
            setComanda(cmdData);
          } else {
            const { data: newCmd } = await supabase
              .from('comandas')
              .insert({ mesa_id: mesaAtual.id, status: 'aberta' })
              .select()
              .single();
            if (isMounted && newCmd) setComanda(newCmd);
          }

          // 6. Pedidos
          const { data: pedidosData } = await supabase
            .from('pedidos')
            .select(`
              *,
              itens:pedido_itens(
                *,
                produto:produtos(*),
                opcionais:pedido_item_opcionais(*)
              )
            `)
            .eq('mesa_id', mesaAtual.id)
            .order('criado_em', { ascending: false });

          if (isMounted && pedidosData) {
            setPedidos(pedidosData as Pedido[]);
          }
        }
      } catch (err) {
        console.warn('Supabase fallback ativo:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    carregarDados();

    return () => {
      isMounted = false;
    };
  }, [mesaNumero]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!mesa || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`realtime-mesa-${mesa.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: `mesa_id=eq.${mesa.id}`,
        },
        async () => {
          const { data } = await supabase
            .from('pedidos')
            .select(`
              *,
              itens:pedido_itens(
                *,
                produto:produtos(*),
                opcionais:pedido_item_opcionais(*)
              )
            `)
            .eq('mesa_id', mesa.id)
            .order('criado_em', { ascending: false });

          if (data) setPedidos(data as Pedido[]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mesas',
          filter: `id=eq.${mesa.id}`,
        },
        (payload) => {
          if (payload.new) setMesa(payload.new as Mesa);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mesa]);

  // Ações do Carrinho
  const addToCart = useCallback(
    (
      produto: Produto,
      quantidade: number,
      opcionais: CartItemOption[],
      notas: string
    ) => {
      const somaOpcionais = opcionais.reduce((acc, curr) => acc + curr.preco, 0);
      const precoUnitario = produto.preco + somaOpcionais;
      const precoTotal = precoUnitario * quantidade;

      const newItem: CartItem = {
        tempId: `${produto.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        produto,
        quantidade,
        opcionais,
        notas,
        precoUnitario,
        precoTotal,
      };

      setCart((prev) => [...prev, newItem]);
    },
    []
  );

  const updateCartItemQuantity = useCallback((tempId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.tempId !== tempId) return item;
          const novaQuantidade = item.quantidade + delta;
          if (novaQuantidade <= 0) return null;
          return {
            ...item,
            quantidade: novaQuantidade,
            precoTotal: item.precoUnitario * novaQuantidade,
          };
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeFromCart = useCallback((tempId: string) => {
    setCart((prev) => prev.filter((item) => item.tempId !== tempId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Envio de Pedido com Idempotência
  const submitOrder = useCallback(
    async (observacaoGeral?: string) => {
      if (cart.length === 0 || !mesa || isSubmittingOrder) {
        return { success: false, error: 'Carrinho vazio ou mesa inválida' };
      }

      setIsSubmittingOrder(true);
      const idempotencyKey = generateIdempotencyKey(mesa.numero);
      const initialStatus = config.exigir_aprovacao_garcom ? 'pendente_garcom' : 'em_preparo';

      const hasSupabase = isSupabaseConfigured();

      if (hasSupabase) {
        try {
          let comandaId = comanda?.id;
          if (!comandaId) {
            const { data: newCmd, error: cmdErr } = await supabase
              .from('comandas')
              .insert({ mesa_id: mesa.id, status: 'aberta' })
              .select()
              .single();
            if (cmdErr) throw cmdErr;
            comandaId = newCmd.id;
            setComanda(newCmd);
          }

          const { data: novoPedido, error: pedErr } = await supabase
            .from('pedidos')
            .insert({
              comanda_id: comandaId,
              mesa_id: mesa.id,
              idempotency_key: idempotencyKey,
              status: initialStatus,
              observacao: observacaoGeral || null,
            })
            .select()
            .single();

          if (pedErr) throw pedErr;

          for (const item of cart) {
            const { data: novoItem, error: itemErr } = await supabase
              .from('pedido_itens')
              .insert({
                pedido_id: novoPedido.id,
                produto_id: item.produto.id,
                quantidade: item.quantidade,
                preco_unitario: item.produto.preco,
                notas: item.notas || null,
              })
              .select()
              .single();

            if (itemErr) throw itemErr;

            if (item.opcionais.length > 0) {
              const opcionaisPayload = item.opcionais.map((opc) => ({
                pedido_item_id: novoItem.id,
                item_opcional_id: opc.id,
                nome_snapshot: opc.nome,
                preco_snapshot: opc.preco,
              }));

              await supabase.from('pedido_item_opcionais').insert(opcionaisPayload);
            }
          }

          await supabase.from('mesas').update({ status: 'ocupada' }).eq('id', mesa.id);

          const { data: pedidosAtualizados } = await supabase
            .from('pedidos')
            .select(`
              *,
              itens:pedido_itens(
                *,
                produto:produtos(*),
                opcionais:pedido_item_opcionais(*)
              )
            `)
            .eq('mesa_id', mesa.id)
            .order('criado_em', { ascending: false });

          if (pedidosAtualizados) setPedidos(pedidosAtualizados as Pedido[]);
          clearCart();
          setIsSubmittingOrder(false);
          return { success: true, pedidoId: novoPedido.id };
        } catch (err: unknown) {
          console.error('Erro ao enviar pedido para o Supabase:', err);
        }
      }

      // Fallback Local
      const mockPedidoId = `ped_${Date.now()}`;
      const mockPedido: Pedido = {
        id: mockPedidoId,
        comanda_id: comanda?.id || `cmd_${mesa.numero}`,
        mesa_id: mesa.id,
        idempotency_key: idempotencyKey,
        status: initialStatus,
        observacao: observacaoGeral || null,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
        itens: cart.map((item, index) => ({
          id: `item_${mockPedidoId}_${index}`,
          pedido_id: mockPedidoId,
          produto_id: item.produto.id,
          quantidade: item.quantidade,
          preco_unitario: item.precoUnitario,
          notas: item.notas || null,
          criado_em: new Date().toISOString(),
          produto: item.produto,
          opcionais: item.opcionais.map((opc, opcIdx) => ({
            id: `opc_${mockPedidoId}_${opcIdx}`,
            pedido_item_id: `item_${mockPedidoId}_${index}`,
            item_opcional_id: opc.id,
            nome_snapshot: opc.nome,
            preco_snapshot: opc.preco,
          })),
        })),
      };

      setPedidos((prev) => [mockPedido, ...prev]);
      clearCart();
      setIsSubmittingOrder(false);

      setTimeout(() => {
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === mockPedidoId ? { ...p, status: 'em_preparo', atualizado_em: new Date().toISOString() } : p
          )
        );
      }, 6000);

      setTimeout(() => {
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === mockPedidoId ? { ...p, status: 'pronto', atualizado_em: new Date().toISOString() } : p
          )
        );
      }, 14000);

      return { success: true, pedidoId: mockPedidoId };
    },
    [cart, mesa, isSubmittingOrder, config.exigir_aprovacao_garcom, comanda, clearCart]
  );

  const chamarGarcom = useCallback(
    async (motivo: ChamadoMotivo) => {
      if (!mesa) return { success: false, error: 'Mesa não identificada' };

      setChamandoGarcom(true);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('chamados').insert({
            mesa_id: mesa.id,
            motivo,
            status: 'pendente',
          });
          await supabase.from('mesas').update({ status: 'chamando' }).eq('id', mesa.id);
        } catch (err) {
          console.warn('Erro ao chamar garçom no Supabase:', err);
        }
      }

      setTimeout(() => {
        setChamandoGarcom(false);
      }, 3000);

      return { success: true };
    },
    [mesa]
  );

  const pedirConta = useCallback(async () => {
    if (!mesa) return { success: false };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('mesas').update({ status: 'fechando' }).eq('id', mesa.id);
        if (comanda) {
          await supabase
            .from('comandas')
            .update({ status: 'aguardando_pagamento' })
            .eq('id', comanda.id);
        }
      } catch (err) {
        console.warn('Erro ao solicitar fechamento de conta:', err);
      }
    }

    return { success: true };
  }, [mesa, comanda]);

  const salvarAvaliacao = useCallback(
    async (estrelas: number, feedbackTexto: string | null, enviadoParaGoogle: boolean) => {
      if (!mesa) return false;

      if (isSupabaseConfigured() && comanda) {
        try {
          await supabase.from('avaliacoes').insert({
            comanda_id: comanda.id,
            mesa_id: mesa.id,
            estrelas,
            feedback_texto: feedbackTexto,
            enviado_para_google: enviadoParaGoogle,
          });
          return true;
        } catch (err) {
          console.warn('Erro ao registrar avaliação:', err);
        }
      }

      return true;
    },
    [mesa, comanda]
  );

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.precoTotal, 0);
  }, [cart]);

  const cartTotalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantidade, 0);
  }, [cart]);

  return {
    loading,
    mesa,
    config,
    categorias,
    produtos,
    comanda,
    pedidos,
    cart,
    cartTotal,
    cartTotalItems,
    chamandoGarcom,
    isSubmittingOrder,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    chamarGarcom,
    pedirConta,
    salvarAvaliacao,
  };
}
