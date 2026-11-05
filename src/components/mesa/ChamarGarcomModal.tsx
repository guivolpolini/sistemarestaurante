'use client';

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  HelpCircle,
  Utensils,
  GlassWater,
  Eraser,
} from 'lucide-react';
import { ChamadoMotivo, Mesa } from '@/types/database';

interface ChamarGarcomModalProps {
  isOpen: boolean;
  mesa: Mesa | null;
  onClose: () => void;
  onChamarGarcom: (motivo: ChamadoMotivo) => Promise<{ success: boolean; error?: string }>;
}

const motivosList: { id: ChamadoMotivo; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'garcom',
    label: 'Chamar Garçom',
    desc: 'Atendimento geral na mesa',
    icon: <Bell className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'gelo_limao',
    label: 'Gelo & Limão',
    desc: 'Trazer pote com gelo e fatias de limão',
    icon: <GlassWater className="w-4 h-4 text-blue-500" />,
  },
  {
    id: 'talheres',
    label: 'Talheres & Guardanapos',
    desc: 'Mais garfos, facas ou guardanapos extras',
    icon: <Utensils className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'duvida',
    label: 'Dúvida no Cardápio',
    desc: 'Perguntar sobre ingredientes ou alérgenos',
    icon: <HelpCircle className="w-4 h-4 text-purple-600" />,
  },
  {
    id: 'limpeza',
    label: 'Limpeza na Mesa',
    desc: 'Recolher louça ou secar a mesa',
    icon: <Eraser className="w-4 h-4 text-orange-500" />,
  },
];

export const ChamarGarcomModal: React.FC<ChamarGarcomModalProps> = ({
  isOpen,
  mesa,
  onClose,
  onChamarGarcom,
}) => {
  const [selectedMotivo, setSelectedMotivo] = useState<ChamadoMotivo>('garcom');
  const [loading, setLoading] = useState(false);
  const [chamadoEnviado, setChamadoEnviado] = useState(false);

  if (!isOpen) return null;

  const handleEnviar = async () => {
    setLoading(true);
    await onChamarGarcom(selectedMotivo);
    setLoading(false);
    setChamadoEnviado(true);

    setTimeout(() => {
      setChamadoEnviado(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center dark:bg-amber-950 dark:text-amber-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Chamar Garçom
              </h3>
              <p className="text-[11px] text-zinc-500">
                Mesa {mesa ? String(mesa.numero).padStart(2, '0') : '--'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 active:scale-95 transition-all dark:bg-zinc-800 dark:text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-4">
          {chamadoEnviado ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2.5">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Garçom Notificado!
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed dark:text-zinc-400">
                O salão já recebeu seu alerta sonoro e um garçom está a caminho da sua mesa.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Qual o motivo do chamado? Isso ajuda a nossa equipe a trazer exatamente o que você
                precisa de primeira.
              </p>

              <div className="space-y-2">
                {motivosList.map((m) => {
                  const isSelected = selectedMotivo === m.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMotivo(m.id)}
                      type="button"
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-50 shadow-xs dark:border-zinc-200 dark:bg-zinc-800'
                          : 'border-zinc-200/80 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 dark:bg-zinc-800">
                        {m.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {m.label}
                        </h5>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{m.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleEnviar}
                disabled={loading}
                type="button"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 active:scale-[0.99] transition-all disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? 'Avisando salão...' : 'Confirmar Chamado'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
