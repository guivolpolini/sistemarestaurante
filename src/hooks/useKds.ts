'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Pedido, PedidoStatus, SetorPreparo } from '@/types/database';
import { mockPedidosIniciais } from '@/lib/mockData';
import { useStaffHardware } from './useStaffHardware';

export function useKds() {
  const hardware = useStaffHardware();

  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    // Adiciona mais um pedido em preparo para demonstração rica no KDS
    const extraPedido = {
      ...mockPedidosIniciais[0],
      id: 'ped_kds_demo_02',
      status: 'em_preparo' as PedidoStatus,
      criado_em: new Date(Date.now() - 1000 * 60 * 14).toISOString(), // 14 min atrás (alerta amarelo)
      mesa: {
        id: 'm2',
        numero: 2,
        status: 'ocupada' as const,
        session_token: 'token_02',
        comanda_atual_id: 'cmd_02',
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      },
    };
    return [...mockPedidosIniciais, extraPedido];
  });
  const [filtroSetor, setFiltroSetor] = useState<'todos' | SetorPreparo>('todos');

  const fetchPedidos = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data } = await supabase
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
        .order('criado_em', { ascending: true });

      if (data) setPedidos(data as Pedido[]);
    } catch (err) {
      console.warn('Erro ao atualizar KDS:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!isSupabaseConfigured()) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
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
          .order('criado_em', { ascending: true });

        if (isMounted && data) setPedidos(data as Pedido[]);
      } catch (err) {
        console.warn('Erro ao carregar pedidos KDS:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime Supabase Channel
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('kds-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            hardware.playNovoPedidoAlert();
            hardware.triggerVibrate([200, 100, 200]);
          }
          fetchPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hardware, fetchPedidos]);

  // Transição de Status
  const atualizarStatus = useCallback(
    async (pedidoId: string, novoStatus: PedidoStatus) => {
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('pedidos').update({ status: novoStatus }).eq('id', pedidoId);
        } catch (err) {
          console.warn('Erro ao atualizar status do pedido no KDS:', err);
        }
      }

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus, atualizado_em: new Date().toISOString() } : p))
      );
    },
    []
  );

  // Filtra por setor e exclui cancelados/entregues antigos
  const pedidosAtivos = useMemo(() => {
    return (pedidos || []).filter((p) => {
      if (!p || p.status === 'cancelado' || p.status === 'entregue') return false;
      if (filtroSetor === 'todos') return true;
      return p.itens?.some((i) => i.produto?.setor === filtroSetor);
    });
  }, [pedidos, filtroSetor]);

  const pedidosEmEspera = useMemo(() => {
    return pedidosAtivos.filter((p) => p.status === 'pendente_garcom');
  }, [pedidosAtivos]);

  const pedidosEmPreparo = useMemo(() => {
    return pedidosAtivos.filter((p) => p.status === 'em_preparo');
  }, [pedidosAtivos]);

  const pedidosProntos = useMemo(() => {
    return pedidosAtivos.filter((p) => p.status === 'pronto');
  }, [pedidosAtivos]);

  return {
    loading,
    pedidos,
    pedidosAtivos,
    pedidosEmEspera,
    pedidosEmPreparo,
    pedidosProntos,
    filtroSetor,
    setFiltroSetor,
    hardware,
    atualizarStatus,
    recarregar: fetchPedidos,
  };
}
