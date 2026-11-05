'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Award,
  Flame,
  Wine,
  Star,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface AdminDashboardViewProps {
  metricas: {
    faturamentoBruto: number;
    taxaServicoPercent: number;
    taxaServicoTotal: number;
    totalComandas: number;
    ticketMedio: number;
    tempoMedioPreparoMinutos: number;
    garconsNoTurno: number;
    gorjetaPorGarcom: number;
    curvaABC: Array<{
      id: string;
      nome: string;
      categoria: string;
      setor: string;
      quantidade: number;
      receita: number;
      percentual: number;
    }>;
    setorBreakdown: {
      cozinha: { pedidos: number; receita: number; percent: number };
      bar: { pedidos: number; receita: number; percent: number };
    };
    vendasPorHora: Array<{ hora: string; valor: number; pedidos: number }>;
    avaliacaoMedia: number;
    totalAvaliacoes: number;
    conversaoGoogle: number;
  };
}

export function AdminDashboardView({ metricas }: AdminDashboardViewProps) {
  const maxHoraValor = Math.max(...metricas.vendasPorHora.map((v) => v.valor));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Faturamento Bruto */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(metricas.faturamentoBruto)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% vs média</span>
            </div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Médio</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(metricas.ticketMedio)}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">
              Média por mesa atendida
            </div>
          </div>
        </div>

        {/* Comandas / Giros */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Mesas / Giros</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white tracking-tight">
              {metricas.totalComandas} comandas
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">
              100% integradas com KDS
            </div>
          </div>
        </div>

        {/* Tempo Médio de Cozinha */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tempo Cozinha</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {metricas.tempoMedioPreparoMinutos} min
            </div>
            <div className="mt-1 text-[11px] text-emerald-500 font-semibold">
              Meta: &lt; 15 min (Excelente)
            </div>
          </div>
        </div>

        {/* Gorjeta 10% / Rateio Garçons */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">10% dos Garçons</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300 tracking-tight">
              {formatCurrency(metricas.taxaServicoTotal)}
            </div>
            <div className="mt-1 text-[11px] text-purple-400 font-semibold">
              {formatCurrency(metricas.gorjetaPorGarcom)} / garçom ({metricas.garconsNoTurno} ativos)
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & ABC Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curva ABC de Vendas (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Curva ABC: Pratos Mais Vendidos</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Ranking de maior impacto em faturamento e volume no turno atual
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Top 5 Itens
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {metricas.curvaABC.map((item, idx) => {
              const medalColors = [
                'bg-amber-500 text-zinc-950 font-black',
                'bg-zinc-300 text-zinc-950 font-black',
                'bg-amber-700 text-white font-black',
              ];
              const medalBadge = medalColors[idx] || 'bg-zinc-800 text-zinc-400 font-bold';

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${medalBadge}`}>
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-zinc-100 truncate">
                          {item.nome}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {item.categoria} • Setor {item.setor.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-sm text-amber-400">
                        {formatCurrency(item.receita)}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-200">{item.quantidade}</strong> pedidos ({item.percentual}%)
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.percentual * 2, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setores & Avaliações (1 col) */}
        <div className="space-y-6">
          {/* Breakdown Cozinha vs Bar */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              <span>Divisão por Setor</span>
            </h3>

            <div className="space-y-3">
              {/* Cozinha */}
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Cozinha / Chapa
                  </span>
                  <span className="font-black text-amber-400">
                    {formatCurrency(metricas.setorBreakdown.cozinha.receita)} ({metricas.setorBreakdown.cozinha.percent}%)
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {metricas.setorBreakdown.cozinha.pedidos} pratos despachados
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${metricas.setorBreakdown.cozinha.percent}%` }}
                  />
                </div>
              </div>

              {/* Bar */}
              <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-blue-400" />
                    Bar / Chopp
                  </span>
                  <span className="font-black text-blue-400">
                    {formatCurrency(metricas.setorBreakdown.bar.receita)} ({metricas.setorBreakdown.bar.percent}%)
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {metricas.setorBreakdown.bar.pedidos} bebidas servidas
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${metricas.setorBreakdown.bar.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Satisfação & Google Reviews */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Satisfação dos Clientes</span>
            </h3>

            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-white">
                {metricas.avaliacaoMedia}
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-zinc-400">
                ({metricas.totalAvaliacoes} avaliações)
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Conversão para Google Reviews</span>
              </div>
              <span className="font-black text-emerald-400 text-sm">
                {metricas.conversaoGoogle}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Sales Visualizer */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Distribuição de Vendas por Hora</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Identificação de picos de movimento para dimensionamento da brigada
            </p>
          </div>
          <span className="text-xs text-zinc-400">Turno Almoço & Jantar</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4 items-end h-44">
          {metricas.vendasPorHora.map((slot) => {
            const heightPercent = Math.round((slot.valor / maxHoraValor) * 100);
            return (
              <div key={slot.hora} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(slot.valor)}
                </div>
                <div
                  className="w-full max-w-[40px] rounded-t-xl bg-amber-500/80 group-hover:bg-amber-400 transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[11px] font-bold text-zinc-400">
                  {slot.hora}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
