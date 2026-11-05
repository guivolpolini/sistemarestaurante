'use client';

import React from 'react';
import { Pedido } from '@/types/database';

interface ComandaImpressaoProps {
  pedido: Pedido | null;
}

export const ComandaImpressao: React.FC<ComandaImpressaoProps> = ({ pedido }) => {
  if (!pedido) return null;

  const dataHora = new Date(pedido.criado_em).toLocaleString('pt-BR');
  const mesaNum = pedido.mesa?.numero || 1;
  const ticketId = pedido.id.slice(-6).toUpperCase();

  return (
    <div
      id="cupom-termico-print"
      className="hidden print:block font-mono text-black text-xs leading-tight w-[80mm] max-w-[80mm] p-2 bg-white"
    >
      {/* Cabeçalho do Cupom */}
      <div className="text-center space-y-1">
        <h2 className="font-extrabold text-sm uppercase tracking-wider">
          BISTRÔ & BURGER ARTESANAL
        </h2>
        <p className="text-[10px]">COZINHA & PRODUÇÃO</p>
        <div className="border-b-2 border-dashed border-black my-1.5" />
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-sm">MESA: {String(mesaNum).padStart(2, '0')}</span>
          <span>TICKET: #{ticketId}</span>
        </div>
        <p className="text-[10px] text-left">DATA/HORA: {dataHora}</p>
        <div className="border-b-2 border-dashed border-black my-1.5" />
      </div>

      {/* Itens do Pedido */}
      <div className="space-y-2.5 my-2">
        {pedido.itens?.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex items-start justify-between font-bold text-xs">
              <span className="text-sm mr-2">{item.quantidade}x</span>
              <span className="flex-1 uppercase">{item.produto?.nome}</span>
            </div>

            {/* Opcionais */}
            {item.opcionais && item.opcionais.length > 0 && (
              <div className="pl-6 text-[11px] font-semibold">
                {item.opcionais.map((o, oIdx) => (
                  <p key={oIdx}>↳ {o.nome_snapshot.toUpperCase()}</p>
                ))}
              </div>
            )}

            {/* Observação Específica */}
            {item.notas && (
              <p className="pl-6 text-[11px] font-extrabold uppercase bg-black text-white px-1 mt-0.5 inline-block">
                OBS: {item.notas}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Observação Geral da Mesa */}
      {pedido.observacao && (
        <div className="my-2 p-1.5 border-2 border-black">
          <p className="text-[10px] font-extrabold uppercase">
            OBS GERAL: {pedido.observacao}
          </p>
        </div>
      )}

      {/* Rodapé do Cupom */}
      <div className="border-t-2 border-dashed border-black pt-1.5 text-center text-[10px]">
        <p>SISTEMA AUTOATENDIMENTO RESTAURANTE</p>
        <p>*** FIM DO TICKET DE PREPARO ***</p>
      </div>
    </div>
  );
};
