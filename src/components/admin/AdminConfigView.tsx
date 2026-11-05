'use client';

import React, { useState } from 'react';
import {
  Save,
  RotateCcw,
  KeyRound,
  Building,
  DollarSign,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { RestauranteConfig } from '@/types/database';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AdminConfigViewProps {
  config: RestauranteConfig;
  onUpdateConfig: (updates: Partial<RestauranteConfig>) => Promise<void>;
  onResetSeeds: () => void;
  onChangePin: (currentPin: string, newPin: string) => { success: boolean; message: string };
}

export function AdminConfigView({
  config,
  onUpdateConfig,
  onResetSeeds,
  onChangePin,
}: AdminConfigViewProps) {
  // General info state
  const [nome, setNome] = useState(config.nome);
  const [chavePix, setChavePix] = useState(config.chave_pix || '');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(config.google_review_url || '');
  const [whatsappGerente, setWhatsappGerente] = useState(config.whatsapp_gerente || '');
  const [taxaServico, setTaxaServico] = useState(config.taxa_servico_padrao.toString());
  const [exigirAprovacao, setExigirAprovacao] = useState(config.exigir_aprovacao_garcom);

  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // PIN state
  const [pinAtual, setPinAtual] = useState('');
  const [novoPin, setNovoPin] = useState('');
  const [pinStatus, setPinStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSalvarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso(null);

    const taxaNum = parseFloat(taxaServico.replace(',', '.'));
    await onUpdateConfig({
      nome: nome.trim(),
      chave_pix: chavePix.trim() || null,
      google_review_url: googleReviewUrl.trim() || null,
      whatsapp_gerente: whatsappGerente.trim() || null,
      taxa_servico_padrao: isNaN(taxaNum) ? 10.0 : taxaNum,
      exigir_aprovacao_garcom: exigirAprovacao,
    });

    setSalvando(false);
    setMensagemSucesso('Configurações salvas e aplicadas em tempo real!');
    setTimeout(() => setMensagemSucesso(null), 3500);
  };

  const handleTrocarPin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onChangePin(pinAtual, novoPin);
    setPinStatus(res);
    if (res.success) {
      setPinAtual('');
      setNovoPin('');
    }
  };

  const hasSupabase = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {mensagemSucesso && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-500" />
              <span>Dados do Estabelecimento & Operação</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Personalize o nome da marca, canais de contato e regras do fluxo de pedidos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                hasSupabase
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              {hasSupabase ? 'Supabase Conectado' : 'Modo Local / Offline'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSalvarConfig} className="space-y-5 text-xs sm:text-sm">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300">Nome Fantasia do Restaurante</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* PIX & Taxa de Serviço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chave PIX (Para QR Code no Checkout)</span>
              </label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="pix@restaurante.com.br ou CNPJ"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-300 flex items-center gap-1.5">
                <span>Taxa de Serviço Padrão (%)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="25"
                value={taxaServico}
                onChange={(e) => setTaxaServico(e.target.value)}
                placeholder="10.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Google Reviews & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Link Google Meu Negócio (Reviews)</span>
              </label>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp de Atendimento do Gerente</span>
              </label>
              <input
                type="text"
                value={whatsappGerente}
                onChange={(e) => setWhatsappGerente(e.target.value)}
                placeholder="11999999999"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Fluxo de Operação Toggle */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Exigir Aprovação Prévia do Garçom</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Quando ativado, os pedidos feitos na mesa caem primeiro na aba de triagem do garçom antes de ir para a cozinha. Se desativado, vão diretamente para o KDS.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExigirAprovacao(!exigirAprovacao)}
                className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                  exigirAprovacao ? 'bg-amber-500' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    exigirAprovacao ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{salvando ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & PIN Settings */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="space-y-1 border-b border-zinc-800 pb-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <span>Segurança: Alterar PIN de Gestor</span>
          </h3>
          <p className="text-xs text-zinc-400">
            O PIN protege o acesso a este painel administrativo contra acessos não autorizados.
          </p>
        </div>

        {pinStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              pinStatus.success
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800'
            }`}
          >
            {pinStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{pinStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleTrocarPin} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="space-y-1">
            <label className="font-bold text-zinc-300">PIN Atual (4 dígitos)</label>
            <input
              type="password"
              maxLength={4}
              required
              value={pinAtual}
              onChange={(e) => setPinAtual(e.target.value)}
              placeholder="Ex: 1234"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white tracking-widest text-center font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Novo PIN (4 dígitos)</label>
            <input
              type="password"
              maxLength={4}
              required
              value={novoPin}
              onChange={(e) => setNovoPin(e.target.value)}
              placeholder="Ex: 5678"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white tracking-widest text-center font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Atualizar PIN
            </button>
          </div>
        </form>
      </div>

      {/* Data Maintenance / Seed Reset */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-zinc-400" />
            <span>Restaurar Dados de Demonstração (Seed)</span>
          </h4>
          <p className="text-xs text-zinc-400">
            Redefine configurações, cardápio e PIN para o estado inicial de fábrica.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Tem certeza que deseja restaurar os dados iniciais do restaurante?')) {
              onResetSeeds();
              alert('Dados restaurados com sucesso! O PIN voltou para 1234.');
            }
          }}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-800 border border-zinc-700 text-xs font-bold text-zinc-300 transition-colors shrink-0 cursor-pointer"
        >
          Restaurar Seed
        </button>
      </div>
    </div>
  );
}
