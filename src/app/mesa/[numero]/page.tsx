import { Suspense, use } from 'react';
import { MesaClientView } from '@/components/mesa/MesaClientView';
import { Loader2 } from 'lucide-react';

interface MesaPageProps {
  params: Promise<{ numero: string }>;
}

export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({
    numero: String(i + 1),
  }));
}

function MesaContent({ paramsPromise }: { paramsPromise: Promise<{ numero: string }> }) {
  const { numero } = use(paramsPromise);
  return <MesaClientView mesaNumero={Number(numero) || 1} />;
}

export default function MesaPage({ params }: MesaPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 dark:bg-zinc-950">
          <Loader2 className="w-8 h-8 text-zinc-900 animate-spin dark:text-zinc-100 mb-3" />
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Carregando Mesa...
          </p>
        </div>
      }
    >
      <MesaContent paramsPromise={params} />
    </Suspense>
  );
}
