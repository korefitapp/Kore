import { Activity, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-kore-bg p-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-kore-emerald/10 shadow-kore-soft">
        <WifiOff className="h-10 w-10 text-kore-emerald" />
      </div>
      
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-kore-ink">Sem Conexão</h1>
      
      <p className="mb-10 max-w-[320px] text-[15px] leading-relaxed text-kore-subink">
        Parece que você está sem internet. Verifique sua conexão para continuar acompanhando seus treinos e plano alimentar.
      </p>
      
      <Link 
        href="/" 
        className="btn-emerald w-full max-w-[280px] py-3.5 text-base"
      >
        Tentar novamente
      </Link>

      <div className="mt-12 flex items-center gap-2 text-kore-muted/50">
        <Activity className="h-5 w-5" />
        <span className="text-sm font-black tracking-widest">KORE</span>
      </div>
    </div>
  );
}

