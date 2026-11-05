'use client';

import React, { useState } from 'react';
import {
  Printer,
  QrCode,
  Radio,
  UtensilsCrossed,
} from 'lucide-react';
import { RestauranteConfig, Mesa } from '@/types/database';
import { mockMesas } from '@/lib/mockData';
import { QrCodeSvg } from '@/lib/qrCode';

interface AdminPlacasViewProps {
  config: RestauranteConfig;
}

export function AdminPlacasView({ config }: AdminPlacasViewProps) {
  const [mesas] = useState<Mesa[]>(mockMesas);
  const [mesaSelecionada, setMesaSelecionada] = useState<number | 'todas'>('todas');
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  });

  const handleImprimir = () => {
    window.print();
  };

  const mesasParaExibir =
    mesaSelecionada === 'todas'
      ? mesas
      : mesas.filter((m) => m.numero === mesaSelecionada);

  return (
    <div className="space-y-6">
      {/* Control Banner (hidden on print) */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-500" />
              <span>Gerador de Placas de Mesa (QR Code + NFC)</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Exporte displays de alta resolução formatados para suportes de acrílico ou madeira no salão.
            </p>
          </div>

          <button
            type="button"
            onClick={handleImprimir}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Placas (A4)</span>
          </button>
        </div>

        {/* Filters & Base URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300">Modo de Impressão</label>
            <select
              value={mesaSelecionada}
              onChange={(e) =>
                setMesaSelecionada(e.target.value === 'todas' ? 'todas' : parseInt(e.target.value, 10))
              }
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="todas">Imprimir Todas as Mesas (1 a {mesas.length})</option>
              {mesas.map((m) => (
                <option key={m.id} value={m.numero}>
                  Apenas Mesa {String(m.numero).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-300 flex items-center justify-between">
              <span>URL Base do Sistema</span>
              <span className="text-[10px] text-zinc-500">Detectada automaticamente</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://192.168.1.100:3000"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:p-0">
        {mesasParaExibir.map((mesa) => {
          const mesaUrl = `${baseUrl}/mesa/${mesa.numero}?token=${mesa.session_token}`;
          return (
            <div
              key={mesa.id}
              className="placa-mesa-card bg-white text-zinc-950 rounded-3xl p-6 sm:p-8 border-2 border-zinc-900 shadow-xl flex flex-col justify-between items-center text-center space-y-5 print:shadow-none print:border-zinc-800 print:rounded-2xl print:page-break-inside-avoid print:m-2"
              style={{ minHeight: '440px' }}
            >
              {/* Header */}
              <div className="w-full flex items-center justify-between border-b-2 border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-black">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm tracking-tight uppercase">
                    {config.nome}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-300">
                  Autoatendimento
                </span>
              </div>

              {/* Table Headline */}
              <div className="space-y-1">
                <div className="text-[11px] font-black tracking-widest uppercase text-zinc-500">
                  Você está na
                </div>
                <div className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-950">
                  MESA {String(mesa.numero).padStart(2, '0')}
                </div>
              </div>

              {/* QR Code Canvas/SVG */}
              <div className="p-3 bg-white rounded-2xl border-2 border-zinc-950 shadow-inner inline-flex items-center justify-center">
                <QrCodeSvg value={mesaUrl} size={190} />
              </div>

              {/* NFC Sensor Area */}
              <div className="w-full py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center gap-2 text-amber-950">
                <Radio className="w-4 h-4 text-amber-700 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  Ou aproxime seu celular no sensor NFC
                </span>
              </div>

              {/* 3 Step Instructions */}
              <div className="grid grid-cols-3 gap-2 w-full pt-1 text-center text-zinc-700">
                <div className="space-y-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-zinc-950 text-white text-[11px] font-black leading-5">
                    1
                  </span>
                  <div className="text-[10px] font-bold leading-tight">
                    Aponte a câmera ou aproxime
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-zinc-950 text-white text-[11px] font-black leading-5">
                    2
                  </span>
                  <div className="text-[10px] font-bold leading-tight">
                    Escolha seus pratos e bebidas
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-zinc-950 text-white text-[11px] font-black leading-5">
                    3
                  </span>
                  <div className="text-[10px] font-bold leading-tight">
                    Chame a equipe ou pague no PIX
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="w-full pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                <span>Chave PIX: {config.chave_pix || 'No balcão'}</span>
                <span>{config.taxa_servico_padrao}% taxa de serviço inclusa</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
