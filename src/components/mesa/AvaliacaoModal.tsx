'use client';

import React, { useState } from 'react';
import {
  Star,
  X,
  Sparkles,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Send,
  HeartHandshake,
} from 'lucide-react';
import { RestauranteConfig } from '@/types/database';

interface AvaliacaoModalProps {
  isOpen: boolean;
  config: RestauranteConfig;
  onClose: () => void;
  onSalvarAvaliacao: (
    estrelas: number,
    feedbackTexto: string | null,
    enviadoGoogle: boolean
  ) => Promise<boolean>;
}

export const AvaliacaoModal: React.FC<AvaliacaoModalProps> = ({
  isOpen,
  config,
  onClose,
  onSalvarAvaliacao,
}) => {
  const [estrelas, setEstrelas] = useState(5);
  const [hoverEstrelas, setHoverEstrelas] = useState<number | null>(null);
  const [feedbackTexto, setFeedbackTexto] = useState('');
  const [motivoProblema, setMotivoProblema] = useState<string>('');
  const [enviadoSucesso, setEnviadoSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  if (!isOpen) return null;

  const notaAtiva = hoverEstrelas || estrelas;
  const isPositivo = notaAtiva >= 4;

  const handleEnviarGoogle = async () => {
    setSalvando(true);
    await onSalvarAvaliacao(estrelas, feedbackTexto.trim() || null, true);
    setSalvando(false);
    setEnviadoSucesso(true);

    if (config.google_review_url) {
      window.open(config.google_review_url, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      onClose();
      setEnviadoSucesso(false);
    }, 2500);
  };

  const handleEnviarFeedbackInterno = async () => {
    setSalvando(true);
    const textoCompleto = motivoProblema
      ? `[${motivoProblema}] ${feedbackTexto.trim()}`
      : feedbackTexto.trim();

    await onSalvarAvaliacao(estrelas, textoCompleto || null, false);
    setSalvando(false);
    setEnviadoSucesso(true);

    setTimeout(() => {
      onClose();
      setEnviadoSucesso(false);
    }, 2500);
  };

  const handleEnviarWhatsApp = () => {
    if (!config.whatsapp_gerente) return;
    const msg = encodeURIComponent(
      `Olá, estive no restaurante e gostaria de deixar meu feedback: Nota ${estrelas}/5. ${
        motivoProblema ? `Motivo: ${motivoProblema}. ` : ''
      }${feedbackTexto}`
    );
    window.open(`https://wa.me/55${config.whatsapp_gerente}?text=${msg}`, '_blank');
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
            <HeartHandshake className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Como foi sua experiência?
            </h3>
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
        <div className="p-5 space-y-5">
          {enviadoSucesso ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2.5">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Muito Obrigado pelo seu Feedback!
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed dark:text-zinc-400">
                Sua opinião nos ajuda a evoluir e proporcionar os melhores momentos para você.
              </p>
            </div>
          ) : (
            <>
              {/* Estrelas Interativas */}
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverEstrelas(s)}
                      onMouseLeave={() => setHoverEstrelas(null)}
                      onClick={() => setEstrelas(s)}
                      className="p-1 active:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          s <= notaAtiva
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {notaAtiva === 5 && '🌟 Incrível! Superou as expectativas'}
                  {notaAtiva === 4 && '👍 Muito bom! Gostei muito'}
                  {notaAtiva === 3 && '😐 Regular, pode melhorar'}
                  {notaAtiva === 2 && '👎 Ruim, tive problemas'}
                  {notaAtiva === 1 && '⚠️ Péssimo, experiência frustrante'}
                </span>
              </div>

              {/* Fluxo Positivo: 4 ou 5 Estrelas (Google Meu Negócio) */}
              {isPositivo ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3 dark:bg-amber-950/30 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                        Que alegria! Poderia nos avaliar no Google?
                      </h4>
                      <p className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed dark:text-amber-300/80">
                        Leva menos de 30 segundos e ajuda pequenas cozinhas artesanais a continuarem
                        servindo com qualidade.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleEnviarGoogle}
                    disabled={salvando}
                    type="button"
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Avaliar com 5 Estrelas no Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Fluxo Crítico: 1 a 3 Estrelas (Feedback Direto com Gerência) */
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3 dark:bg-zinc-800/50 dark:border-zinc-700">
                  <div>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      Sentimos muito. O que deu errado?
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5 dark:text-zinc-400">
                      Seu feedback vai direto para a gerência para corrigirmos a falha agora.
                    </p>
                  </div>

                  {/* Chips de Motivo Rápido */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Demora na entrega',
                      'Comida fria',
                      'Atendimento',
                      'Pedido errado',
                      'Ambiente',
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMotivoProblema(m === motivoProblema ? '' : m)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                          motivoProblema === m
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                            : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackTexto}
                    onChange={(e) => setFeedbackTexto(e.target.value)}
                    placeholder="Conte mais detalhes para a gerência..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-300"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleEnviarFeedbackInterno}
                      disabled={salvando}
                      type="button"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-800 active:scale-95 transition-all dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar à Gerência</span>
                    </button>

                    {config.whatsapp_gerente && (
                      <button
                        onClick={handleEnviarWhatsApp}
                        type="button"
                        className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all"
                        title="Falar no WhatsApp com o gerente"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
