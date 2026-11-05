'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Chamado, Mesa, Pedido, Produto, SetorPreparo } from '@/types/database';
import {
  mockChamadosIniciais,
  mockMesas,
  mockPedidosIniciais,
  mockProdutos,
} from '@/lib/mockData';
import { useStaffHardware } from './useStaffHardware';

export function useGarcomStaff() {
  const hardware = useStaffHardware();

  const [loading, setLoading] = useState(true);
  const [mesas, setMesas] = useState<Mesa[]>(mockMesas);
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidosIniciais);
  const [chamados, setChamados] = useState<Chamado[]>(mockChamadosIniciais);
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [filtroSetor, setFiltroSetor] = useState<'todos' | SetorPreparo>('todos');

  // Função utilitária para buscar do banco ou mock
  const fetchAtualizado = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data: mesasData } = await supabase
        .from('mesas')
        .select('*')
        .order('numero', { ascending: true });
      if (mesasData && mesasData.length > 0) setMesas(mesasData);

      const { data: pedidosData } = await supabase
        .from('pedidos')
        .select(`
          *,
          mesa:mesas(*),
          itens:pedido_itens(
            *,
            produto:produtos(*),
            opcionais:pedido_item_opcionais(*)
          )
        `)
        .order('criado_em', { ascending: false });
      if (pedidosData) setPedidos(pedidosData as Pedido[]);

      const { data: chamadosData } = await supabase
        .from('chamados')
        .select(`*, mesa:mesas(*)`)
        .eq('status', 'pendente')
        .order('criado_em', { ascending: false });
      if (chamadosData) setChamados(chamadosData as Chamado[]);

      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });
      if (produtosData) setProdutos(produtosData as Produto[]);
    } catch (err) {
      console.warn('Erro ao atualizar dados:', err);
    }
  }, []);

  // Carga inicial sem efeito colateral cascateado
  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!isSupabaseConfigured()) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data: mesasData } = await supabase
          .from('mesas')
          .select('*')
          .order('numero', { ascending: true });
        if (isMounted && mesasData && mesasData.length > 0) setMesas(mesasData);

        const { data: pedidosData } = await supabase
          .from('pedidos')
          .select(`
            *,
            mesa:mesas(*),
            itens:pedido_itens(
              *,
              produto:produtos(*),
              opcionais:pedido_item_opcionais(*)
            )
          `)
          .order('criado_em', { ascending: false });
        if (isMounted && pedidosData) setPedidos(pedidosData as Pedido[]);

        const { data: chamadosData } = await supabase
          .from('chamados')
          .select(`*, mesa:mesas(*)`)
          .eq('status', 'pendente')
          .order('criado_em', { ascending: false });
        if (isMounted && chamadosData) setChamados(chamadosData as Chamado[]);

        const { data: produtosData } = await supabase
          .from('produtos')
          .select('*')
          .order('nome', { ascending: true });
        if (isMounted && produtosData) setProdutos(produtosData as Produto[]);
      } catch (err) {
        console.warn('Erro inicial:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Supabase Realtime Channels
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('garcom-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            hardware.playNovoPedidoAlert();
            hardware.triggerVibrate([150, 80, 150]);
          }
          fetchAtualizado();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chamados' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            hardware.playChamadoAlert();
            hardware.triggerVibrate([200, 100, 200]);
          }
          fetchAtualizado();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mesas' },
        () => {
          fetchAtualizado();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'produtos' },
        () => {
          fetchAtualizado();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hardware, fetchAtualizado]);

  // Ações de Triagem de Pedidos em 1 Toque
  const aprovarPedido = useCallback(
    async (pedidoId: string) => {
      const pedidoAlvo = pedidos.find((p) => p.id === pedidoId);
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('pedidos').update({ status: 'em_preparo' }).eq('id', pedidoId);
          if (pedidoAlvo?.mesa_id) {
            await supabase.from('mesas').update({ status: 'ocupada' }).eq('id', pedidoAlvo.mesa_id);
          }
        } catch (err) {
          console.warn('Erro ao aprovar pedido:', err);
        }
      }

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: 'em_preparo' } : p))
      );
      if (pedidoAlvo?.mesa_id) {
        setMesas((prev) =>
          prev.map((m) => (m.id === pedidoAlvo.mesa_id ? { ...m, status: 'ocupada' } : m))
        );
      }
    },
    [pedidos]
  );

  const rejeitarPedido = useCallback(
    async (pedidoId: string) => {
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', pedidoId);
        } catch (err) {
          console.warn('Erro ao cancelar pedido:', err);
        }
      }

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: 'cancelado' } : p))
      );
    },
    []
  );

  const marcarPronto = useCallback(
    async (pedidoId: string) => {
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('pedidos').update({ status: 'pronto' }).eq('id', pedidoId);
        } catch (err) {
          console.warn('Erro ao marcar pronto:', err);
        }
      }
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: 'pronto' } : p))
      );
    },
    []
  );

  const marcarEntregue = useCallback(
    async (pedidoId: string) => {
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('pedidos').update({ status: 'entregue' }).eq('id', pedidoId);
        } catch (err) {
          console.warn('Erro ao marcar entregue:', err);
        }
      }
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: 'entregue' } : p))
      );
    },
    []
  );

  // Atender Chamado do Salão
  const atenderChamado = useCallback(
    async (chamadoId: string) => {
      const chamadoAlvo = chamados.find((c) => c.id === chamadoId);

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('chamados')
            .update({ status: 'atendido', atendido_em: new Date().toISOString() })
            .eq('id', chamadoId);

          if (chamadoAlvo?.mesa_id) {
            const outros = chamados.filter(
              (c) => c.mesa_id === chamadoAlvo.mesa_id && c.id !== chamadoId
            );
            if (outros.length === 0) {
              await supabase
                .from('mesas')
                .update({ status: 'ocupada' })
                .eq('id', chamadoAlvo.mesa_id);
            }
          }
        } catch (err) {
          console.warn('Erro ao atender chamado:', err);
        }
      }

      setChamados((prev) => prev.filter((c) => c.id !== chamadoId));
      if (chamadoAlvo?.mesa_id) {
        setMesas((prev) =>
          prev.map((m) =>
            m.id === chamadoAlvo.mesa_id && m.status === 'chamando'
              ? { ...m, status: 'ocupada' }
              : m
          )
        );
      }
    },
    [chamados]
  );

  // Liberar Mesa / Fechar Comanda
  const liberarMesa = useCallback(async (mesaId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('mesas')
          .update({ status: 'livre', comanda_atual_id: null })
          .eq('id', mesaId);

        await supabase
          .from('comandas')
          .update({ status: 'fechada', fechada_em: new Date().toISOString() })
          .eq('mesa_id', mesaId)
          .eq('status', 'aberta');
      } catch (err) {
        console.warn('Erro ao liberar mesa:', err);
      }
    }

    setMesas((prev) =>
      prev.map((m) => (m.id === mesaId ? { ...m, status: 'livre', comanda_atual_id: null } : m))
    );
  }, []);

  // Botão de Esgotamento Instantâneo ("Item 86" / Pausar Prato)
  const toggleDisponibilidadeProduto = useCallback(
    async (produtoId: string, disponivel: boolean) => {
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('produtos').update({ disponivel }).eq('id', produtoId);
        } catch (err) {
          console.warn('Erro ao alternar disponibilidade do produto:', err);
        }
      }

      setProdutos((prev) =>
        prev.map((p) => (p.id === produtoId ? { ...p, disponivel } : p))
      );
    },
    []
  );

  const pedidosPendentes = useMemo(() => {
    return (pedidos || []).filter((p) => {
      if (!p) return false;
      const isPendente = p.status === 'pendente_garcom';
      if (filtroSetor === 'todos') return isPendente;
      const temSetor = p.itens?.some((i) => i.produto?.setor === filtroSetor);
      return isPendente && temSetor;
    });
  }, [pedidos, filtroSetor]);

  const pedidosEmPreparo = useMemo(() => {
    return (pedidos || []).filter(
      (p) => p && (p.status === 'em_preparo' || p.status === 'pronto')
    );
  }, [pedidos]);

  return {
    loading,
    mesas,
    pedidos,
    pedidosPendentes,
    pedidosEmPreparo,
    chamados,
    produtos,
    filtroSetor,
    setFiltroSetor,
    hardware,
    aprovarPedido,
    rejeitarPedido,
    marcarPronto,
    marcarEntregue,
    atenderChamado,
    liberarMesa,
    toggleDisponibilidadeProduto,
    recarregar: fetchAtualizado,
  };
}
