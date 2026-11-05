'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, Delete, KeyRound } from 'lucide-react';

interface AdminAuthModalProps {
  pinInput: string;
  pinError: string | null;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: (pin?: string) => boolean;
}

export function AdminAuthModal({
  pinInput,
  pinError,
  onDigit,
  onBackspace,
  onClear,
  onSubmit,
}: AdminAuthModalProps) {
  // Listen for physical keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key >= '0' && e.key <= '9') {
        onDigit(e.key);
      } else if (e.key === 'Backspace') {
        onBackspace();
      } else if (e.key === 'Enter') {
        onSubmit();
      } else if (e.key === 'Escape') {
        onClear();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDigit, onBackspace, onClear, onSubmit]);

  // Auto-submit when 4 digits reached
  useEffect(() => {
    if (pinInput.length === 4) {
      const timer = setTimeout(() => {
        onSubmit(pinInput);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pinInput, onSubmit]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Painel do Proprietário
          </h2>
          <p className="text-xs text-zinc-400">
            Digite o PIN de 4 dígitos para acessar métricas, cardápio e configurações.
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pinInput.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-amber-500 scale-125 shadow-sm shadow-amber-500/50'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {pinError && (
          <div className="text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl py-2 px-3 animate-shake">
            {pinError}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {digits.map((item) => {
            if (item === 'C') {
              return (
                <button
                  key={item}
                  type="button"
                  onClick={onClear}
                  className="h-14 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white font-semibold text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  Limpar
                </button>
              );
            }
            if (item === '⌫') {
              return (
                <button
                  key={item}
                  type="button"
                  onClick={onBackspace}
                  className="h-14 rounded-2xl bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white font-semibold text-sm transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                >
                  <Delete className="w-5 h-5" />
                </button>
              );
            }
            return (
              <button
                key={item}
                type="button"
                onClick={() => onDigit(item)}
                className="h-14 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xl transition-all active:scale-95 flex items-center justify-center shadow-xs cursor-pointer"
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Helper Note */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>
              PIN padrão de demonstração: <strong className="text-white">1234</strong>
            </span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à Central de Início</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
