"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@supabase/supabase-js";
import { Copy, CheckCircle2, Loader2, QrCode } from "lucide-react";
import { createInAppPayment } from "@/app/actions/payment-actions";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: string;
  amount: number;
  itemName: string;
}

export function CheckoutModal({
  open,
  onOpenChange,
  professionalId,
  amount,
  itemName,
}: CheckoutModalProps) {
  // Estados: "loading" | "pix" | "success"
  const [checkoutState, setCheckoutState] = useState<"loading" | "pix" | "success">("loading");
  
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [qrCodeString, setQrCodeString] = useState<string>("");
  
  const [copied, setCopied] = useState(false);

  // Initialize Payment
  useEffect(() => {
    if (open && checkoutState === "loading" && !transactionId) {
      async function initPayment() {
        try {
          const res = await createInAppPayment({
            professionalId,
            amount,
          });
          setTransactionId(res.transactionId);
          setQrCodeBase64(res.qrCodeBase64);
          setQrCodeString(res.qrCodeString);
          setCheckoutState("pix");
        } catch (error) {
          console.error("Falha ao gerar pagamento:", error);
          alert("Não foi possível gerar o pagamento no momento.");
          onOpenChange(false);
        }
      }
      initPayment();
    }
  }, [open, checkoutState, professionalId, amount, transactionId, onOpenChange]);

  // Listen to Supabase Realtime for transaction status change
  useEffect(() => {
    if (!transactionId || checkoutState === "success") return;

    // Criar cliente frontend do Supabase para escutar Realtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`public:transactions:id=eq.${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          console.log("Transação atualizada (Realtime):", payload.new);
          if (payload.new.status === "approved") {
            setCheckoutState("success");
            // Fechar modal automaticamente após sucesso
            setTimeout(() => {
              onOpenChange(false);
              // resetar estado para próxima vez
              setCheckoutState("loading");
              setTransactionId(null);
            }, 4000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, checkoutState, onOpenChange]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(qrCodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [qrCodeString]);

  // Reset local state if closed manually
  useEffect(() => {
    if (!open) {
      setCheckoutState("loading");
      setTransactionId(null);
    }
  }, [open]);

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (checkoutState !== "success") onOpenChange(false);
      }}
      title="Pagamento Seguro"
      description={`Subscrição / Pagamento de ${itemName}`}
    >
      <div className="pt-4 pb-2 px-2 flex flex-col items-center min-h-[300px] justify-center">
        
        {checkoutState === "loading" && (
          <div className="flex flex-col items-center gap-4 text-kore-muted animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="text-sm font-bold text-center">
              Gerando código PIX dinâmico...<br />
              <span className="font-medium text-xs">Por favor, aguarde alguns instantes.</span>
            </p>
          </div>
        )}

        {checkoutState === "pix" && (
          <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold mb-6 text-center w-full">
              Valor: R$ {amount.toFixed(2).replace(".", ",")}
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-sm border border-kore-border mb-6">
              {/* No lugar da base64 mock, renderiza a imagem */}
              <img 
                src={qrCodeBase64} 
                alt="QR Code PIX" 
                className="w-48 h-48 object-contain" 
              />
            </div>

            <p className="text-xs font-bold text-kore-subink mb-2">PIX Copia e Cola</p>
            <div className="w-full relative flex items-center">
              <input
                type="text"
                readOnly
                value={qrCodeString}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-kore-bg border border-kore-border text-xs font-medium text-kore-ink truncate focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-kore-card hover:bg-kore-border transition text-kore-muted hover:text-kore-ink"
                title="Copiar Código"
              >
                {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
            
            <p className="text-[11px] text-kore-muted mt-4 text-center">
              Este pagamento expira em 15 minutos.<br/>Aguardando confirmação do banco...
            </p>
          </div>
        )}

        {checkoutState === "success" && (
          <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-extrabold text-kore-ink">Pagamento Aprovado!</h3>
            <p className="text-sm font-medium text-kore-muted text-center max-w-[250px]">
              O seu pagamento foi confirmado com sucesso. Obrigado!
            </p>
          </div>
        )}

      </div>
    </Modal>
  );
}
