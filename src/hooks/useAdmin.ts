'use client';

import { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import { Categoria, Produto, RestauranteConfig } from '@/types/database';
import { mockCategorias, mockConfig, mockProdutos } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ADMIN_PIN_KEY = 'sr_admin_pin';
const ADMIN_SESSION_KEY = 'sr_admin_unlocked';
const ADMIN_CONFIG_KEY = 'sr_admin_config';
const ADMIN_PRODUTOS_KEY = 'sr_admin_produtos';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSessionSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function useAdmin() {
  // 1. PIN & Autenticação (Hydration safe via useSyncExternalStore)
  const isSessionUnlocked = useSyncExternalStore(
    subscribeStorage,
    getSessionSnapshot,
    getServerSnapshot
  );
  const [localUnlocked, setLocalUnlocked] = useState(false);
  const isUnlocked = isSessionUnlocked || localUnlocked;

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const getStoredPin = useCallback(() => {
    try {
      const pin = localStorage.getItem(ADMIN_PIN_KEY);
      return pin || '1234';
    } catch {
      return '1234';
    }
  }, []);

  const handlePinDigit = useCallback((digit: string) => {
    setPinError(null);
    setPinInput((prev) => {
      if (prev.length >= 4) return prev;
      return prev + digit;
    });
  }, []);

  const handlePinBackspace = useCallback(() => {
    setPinError(null);
    setPinInput((prev) => prev.slice(0, -1));
  }, []);

  const handlePinClear = useCallback(() => {
    setPinError(null);
    setPinInput('');
  }, []);

  const handlePinSubmit = useCallback(
    (pinToVerify?: string) => {
      const targetPin = pinToVerify ?? pinInput;
      const validPin = getStoredPin();

      if (targetPin === validPin) {
        setLocalUnlocked(true);
        setPinError(null);
        setPinInput('');
        try {
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          window.dispatchEvent(new Event('storage'));
        } catch {
          // ignore
        }
        return true;
      } else {
        setPinError('PIN incorreto. Tente novamente.');
        setPinInput('');
        return false;
      }
    },
    [pinInput, getStoredPin]
  );

  const lockAdmin = useCallback(() => {
    setLocalUnlocked(false);
    setPinInput('');
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
  }, []);

  const changePin = useCallback(
    (currentPin: string, newPin: string) => {
      const validPin = getStoredPin();
      if (currentPin !== validPin) {
        return { success: false, message: 'O PIN atual informado está incorreto.' };
      }
      if (!/^\d{4}$/.test(newPin)) {
        return { success: false, message: 'O novo PIN deve conter exatamente 4 dígitos numéricos.' };
      }
      try {
        localStorage.setItem(ADMIN_PIN_KEY, newPin);
        return { success: true, message: 'PIN de gestor atualizado com sucesso!' };
      } catch {
        return { success: false, message: 'Falha ao salvar no armazenamento local.' };
      }
    },
    [getStoredPin]
  );

  // 2. Configurações Globais
  const [config, setConfig] = useState<RestauranteConfig>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockConfig;
  });

  const updateConfig = useCallback(async (updates: Partial<RestauranteConfig>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        ...updates,
        atualizado_em: new Date().toISOString(),
      };
      try {
        localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('restaurante_config')
          .update(updates)
          .eq('id', config.id);
      } catch (err) {
        console.warn('Erro ao sincronizar config com Supabase:', err);
      }
    }
  }, [config.id]);

  // 3. Cardápio & Produtos CRUD
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_PRODUTOS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return mockProdutos;
  });

  const [categorias] = useState<Categoria[]>(mockCategorias);

  const persistProdutos = useCallback((novos: Produto[]) => {
    setProdutos(novos);
    try {
      localStorage.setItem(ADMIN_PRODUTOS_KEY, JSON.stringify(novos));
    } catch {
      // ignore
    }
  }, []);

  const adicionarProduto = useCallback(
    async (novo: Omit<Produto, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const id = `p_${Date.now()}`;
      const produtoCriado: Produto = {
        ...novo,
        id,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      };

      const novaLista = [produtoCriado, ...produtos];
      persistProdutos(novaLista);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('produtos').insert([produtoCriado]);
        } catch (err) {
          console.warn('Erro ao salvar produto no Supabase:', err);
        }
      }
    },
    [produtos, persistProdutos]
  );

  const editarProduto = useCallback(
    async (id: string, updates: Partial<Produto>) => {
      const novaLista = produtos.map((p) =>
        p.id === id
          ? { ...p, ...updates, atualizado_em: new Date().toISOString() }
          : p
      );
      persistProdutos(novaLista);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('produtos').update(updates).eq('id', id);
        } catch (err) {
          console.warn('Erro ao atualizar produto no Supabase:', err);
        }
      }
    },
    [produtos, persistProdutos]
  );

  const removerProduto = useCallback(
    async (id: string) => {
      const novaLista = produtos.filter((p) => p.id !== id);
      persistProdutos(novaLista);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('produtos').delete().eq('id', id);
        } catch (err) {
          console.warn('Erro ao deletar produto no Supabase:', err);
        }
      }
    },
    [produtos, persistProdutos]
  );

  const toggleDisponibilidade = useCallback(
    async (id: string) => {
      const target = produtos.find((p) => p.id === id);
      if (!target) return;
      const novoStatus = !target.disponivel;
      await editarProduto(id, { disponivel: novoStatus });
    },
    [produtos, editarProduto]
  );

  const resetToSeeds = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_CONFIG_KEY);
      localStorage.removeItem(ADMIN_PRODUTOS_KEY);
      localStorage.removeItem(ADMIN_PIN_KEY);
    } catch {
      // ignore
    }
    setConfig(mockConfig);
    setProdutos(mockProdutos);
  }, []);

  // 4. Métricas & BI em Tempo Real
  const metricas = useMemo(() => {
    // Simulação enriquecida com dados dos mockProdutos e histórico de vendas do turno
    const faturamentoBruto = 2845.8;
    const taxaServicoPercent = config.taxa_servico_padrao || 10.0;
    const taxaServicoTotal = (faturamentoBruto * taxaServicoPercent) / 100;
    const totalComandas = 32;
    const ticketMedio = faturamentoBruto / totalComandas;
    const tempoMedioPreparoMinutos = 13.5; // KDS performance
    const garconsNoTurno = 3;
    const gorjetaPorGarcom = taxaServicoTotal / garconsNoTurno;

    // Curva ABC de Pratos Mais Vendidos
    const curvaABC = [
      {
        id: 'p1',
        nome: 'Smash Bacon Supreme',
        categoria: 'Hambúrgueres Artesanais',
        setor: 'cozinha',
        quantidade: 34,
        receita: 34 * 38.9,
        percentual: 46.5,
      },
      {
        id: 'p6',
        nome: 'Chopp Pilsen Artesanal 500ml',
        categoria: 'Chopps & Cervejas',
        setor: 'bar',
        quantidade: 52,
        receita: 52 * 14.0,
        percentual: 25.6,
      },
      {
        id: 'p4',
        nome: 'Batata Rústica com Alecrim',
        categoria: 'Porções & Entradas',
        setor: 'cozinha',
        quantidade: 22,
        receita: 22 * 26.0,
        percentual: 20.1,
      },
      {
        id: 'p7',
        nome: 'Chopp IPA Lupulado 500ml',
        categoria: 'Chopps & Cervejas',
        setor: 'bar',
        quantidade: 16,
        receita: 16 * 18.0,
        percentual: 10.1,
      },
      {
        id: 'p8',
        nome: 'Limonada Suíça com Hortelã',
        categoria: 'Bebidas & Sucos',
        setor: 'bar',
        quantidade: 12,
        receita: 12 * 12.0,
        percentual: 5.1,
      },
    ];

    const setorBreakdown = {
      cozinha: {
        pedidos: 56,
        receita: 1894.6,
        percent: 66.5,
      },
      bar: {
        pedidos: 80,
        receita: 951.2,
        percent: 33.5,
      },
    };

    const vendasPorHora = [
      { hora: '12:00', valor: 310, pedidos: 4 },
      { hora: '13:00', valor: 580, pedidos: 7 },
      { hora: '14:00', valor: 240, pedidos: 3 },
      { hora: '18:00', valor: 190, pedidos: 2 },
      { hora: '19:00', valor: 420, pedidos: 5 },
      { hora: '20:00', valor: 650, pedidos: 8 },
      { hora: '21:00', valor: 455.8, pedidos: 6 },
    ];

    return {
      faturamentoBruto,
      taxaServicoPercent,
      taxaServicoTotal,
      totalComandas,
      ticketMedio,
      tempoMedioPreparoMinutos,
      garconsNoTurno,
      gorjetaPorGarcom,
      curvaABC,
      setorBreakdown,
      vendasPorHora,
      avaliacaoMedia: 4.9,
      totalAvaliacoes: 27,
      conversaoGoogle: 92.5,
    };
  }, [config.taxa_servico_padrao]);

  // 5. Navegação por Abas
  const [abaAtiva, setAbaAtiva] = useState<'bi' | 'cardapio' | 'placas' | 'config'>('bi');

  return {
    // Auth
    isUnlocked,
    pinInput,
    pinError,
    handlePinDigit,
    handlePinBackspace,
    handlePinClear,
    handlePinSubmit,
    lockAdmin,
    changePin,

    // Data
    config,
    updateConfig,
    resetToSeeds,
    produtos,
    categorias,
    adicionarProduto,
    editarProduto,
    removerProduto,
    toggleDisponibilidade,

    // BI
    metricas,

    // Tabs
    abaAtiva,
    setAbaAtiva,
  };
}
