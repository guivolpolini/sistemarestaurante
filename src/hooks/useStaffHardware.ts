'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useStaffHardware() {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Inicializa AudioContext após primeira interação do usuário (exigência dos navegadores)
  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setAudioEnabled(true);
    } catch (err) {
      console.warn('Web Audio API não suportada ou bloqueada:', err);
    }
  }, []);

  // Bipe duplo para Novo Pedido (Frequências D5 587Hz -> A5 880Hz)
  const playNovoPedidoAlert = useCallback(() => {
    try {
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') return;

      const now = ctx.currentTime;

      // Primeiro tom (587 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      // Segundo tom agudo harmônico (880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.38);
    } catch {
      // Ignora erro de áudio
    }
  }, [initAudio]);

  // Bipe de Atenção para Chamado da Mesa (Gelo, Garçom, Limpeza - 440Hz -> 659Hz)
  const playChamadoAlert = useCallback(() => {
    try {
      if (!audioCtxRef.current) initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') return;

      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignora
    }
  }, [initAudio]);

  // Disparo de Vibração no smartphone do garçom
  const triggerVibrate = useCallback((pattern: number[] = [120, 60, 120]) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignora
    }
  }, []);

  // Screen Wake Lock API: impede que a tela do celular do garçom apague no salão
  const requestWakeLock = useCallback(async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) return false;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);

      wakeLockRef.current.addEventListener('release', () => {
        setWakeLockActive(false);
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock request falhou:', err);
      setWakeLockActive(false);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  }, []);

  // Re-solicita Wake Lock automaticamente quando a aba volta ao primeiro plano
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLockActive) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLockActive, requestWakeLock]);

  // Limpeza de recursos no unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    wakeLockActive,
    audioEnabled,
    initAudio,
    playNovoPedidoAlert,
    playChamadoAlert,
    triggerVibrate,
    requestWakeLock,
    releaseWakeLock,
  };
}
