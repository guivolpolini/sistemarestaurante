import { Suspense } from 'react';
import { GarcomView } from '@/components/garcom/GarcomView';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Painel do Garçom | Salão Mobile Staff',
  description: 'Triagem rápida de pedidos, mapa de mesas e alertas sonoros para garçons.',
};

export default function GarcomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-xs font-semibold text-zinc-400">Carregando Painel do Garçom...</p>
        </div>
      }
    >
      <GarcomView />
    </Suspense>
  );
}
