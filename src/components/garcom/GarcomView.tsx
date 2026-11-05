'use client';

import React, { useState } from 'react';
import {
  Utensils,
  Bell,
  LayoutGrid,
  Ban,
  Loader2,
} from 'lucide-react';
import { useGarcomStaff } from '@/hooks/useGarcomStaff';
import { StaffHeader } from './StaffHeader';
import { TriagemPedidos } from './TriagemPedidos';
import { ChamadosFila } from './ChamadosFila';
import { MapaMesas } from './MapaMesas';
import { Item86Drawer } from './Item86Drawer';

type GarcomTab = 'triagem' | 'chamados' | 'mesas' | 'item86';

export const GarcomView: React.FC = () => {
  const {
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
    recarregar,
  } = useGarcomStaff();

  const [abaAtiva, setAbaAtiva] = useState<GarcomTab>('triagem');

  const mesasOcupadasCount = (mesas || []).filter((m) => m && m.status !== 'livre').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <p className="text-xs font-semibold text-zinc-400">Conectando ao Salão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 text-zinc-100 antialiased flex flex-col justify-between">
      <div>
        {/* Header do Staff */}
        <StaffHeader
          wakeLockActive={hardware.wakeLockActive}
          audioEnabled={hardware.audioEnabled}
          pedidosPendentesCount={pedidosPendentes.length}
          chamadosCount={chamados.length}
          mesasOcupadasCount={mesasOcupadasCount}
          onToggleWakeLock={() => {
            if (hardware.wakeLockActive) {
              hardware.releaseWakeLock();
            } else {
              hardware.requestWakeLock();
            }
          }}
          onEnableAudio={() => {
            hardware.initAudio();
            hardware.playNovoPedidoAlert();
          }}
          onRefresh={recarregar}
        />

        {/* Conteúdo Principal de cada Aba */}
        <main className="max-w-md mx-auto px-4 py-4 space-y-4">
          {abaAtiva === 'triagem' && (
            <TriagemPedidos
              pedidosPendentes={pedidosPendentes}
              pedidosEmPreparo={pedidosEmPreparo}
              filtroSetor={filtroSetor}
              onSetFiltroSetor={setFiltroSetor}
              onAprovar={aprovarPedido}
              onRejeitar={rejeitarPedido}
              onMarcarPronto={marcarPronto}
              onMarcarEntregue={marcarEntregue}
            />
          )}

          {abaAtiva === 'chamados' && (
            <ChamadosFila chamados={chamados} onAtender={atenderChamado} />
          )}

          {abaAtiva === 'mesas' && (
            <MapaMesas mesas={mesas} pedidos={pedidos} onLiberarMesa={liberarMesa} />
          )}

          {abaAtiva === 'item86' && (
            <Item86Drawer
              produtos={produtos}
              onToggleDisponibilidade={toggleDisponibilidadeProduto}
            />
          )}
        </main>
      </div>

      {/* Barra Inferior de Navegação (Thumb Navigation para Celular) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-3 py-2">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Aba Triagem */}
          <button
            onClick={() => setAbaAtiva('triagem')}
            type="button"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              abaAtiva === 'triagem'
                ? 'bg-zinc-800 text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Utensils className="w-4 h-4" />
              {pedidosPendentes.length > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-zinc-950">
                  {pedidosPendentes.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">Triagem</span>
          </button>

          {/* Aba Chamados */}
          <button
            onClick={() => setAbaAtiva('chamados')}
            type="button"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
              abaAtiva === 'chamados'
                ? 'bg-zinc-800 text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {chamados.length > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-red-500 text-white animate-pulse">
                  {chamados.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">Chamados</span>
          </button>

          {/* Aba Mapa Mesas */}
          <button
            onClick={() => setAbaAtiva('mesas')}
            type="button"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              abaAtiva === 'mesas'
                ? 'bg-zinc-800 text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[10px] mt-1">Salão ({mesas.length})</span>
          </button>

          {/* Aba Item 86 */}
          <button
            onClick={() => setAbaAtiva('item86')}
            type="button"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              abaAtiva === 'item86'
                ? 'bg-zinc-800 text-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Ban className="w-4 h-4" />
            <span className="text-[10px] mt-1">Item 86</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
