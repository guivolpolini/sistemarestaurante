import { Suspense } from 'react';
import { KdsView } from '@/components/kds/KdsView';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'KDS Cozinha & Bar | Kitchen Display System',
  description: 'Controle de comandas, produção e impressão térmica para restaurantes.',
};

export default function KdsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-xs font-semibold text-zinc-400">Carregando KDS...</p>
        </div>
      }
    >
      <KdsView />
    </Suspense>
  );
}
