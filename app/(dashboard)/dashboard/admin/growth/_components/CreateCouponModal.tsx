"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Tag, Percent, Banknote, CalendarDays, Hash, Loader2 } from "lucide-react";

export function CreateCouponModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"fixed" | "percent">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!code || !value || !maxUses || !validUntil) {
      setMessage({ text: "Preencha todos os campos obrigatórios", type: "error" });
      return;
    }

    setLoading(true);

    const payload = {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      max_uses: Number(maxUses),
      valid_until: validUntil,
      status: "active",
      used_count: 0,
    };

    const { error } = await supabase.from("coupons").insert(payload);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage({ text: "Erro ao criar cupom: " + error.message, type: "error" });
    } else {
      setMessage({ text: "Cupom criado com sucesso!", type: "success" });
      setTimeout(() => {
        setMessage(null);
        onClose();
        setCode("");
        setValue("");
        setMaxUses("");
        setValidUntil("");
        setType("percent");
        router.refresh();
      }, 1500);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Cupom"
      description="Preencha as informações abaixo para gerar um novo cupom de desconto."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-kore-ink">Código do Cupom</label>
          <div className="relative">
            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: KORE20"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-kore-bg border border-kore-border text-kore-ink placeholder:text-kore-muted focus:border-kore-emerald focus:ring-1 focus:ring-kore-emerald transition uppercase"
            />
          </div>
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-kore-ink">Tipo de Desconto</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("percent")}
              className={`flex items-center justify-center gap-2 h-11 rounded-xl border font-bold text-sm transition ${
                type === "percent"
                  ? "bg-kore-emerald/10 border-kore-emerald text-kore-emerald-deep"
                  : "bg-kore-bg border-kore-border text-kore-muted hover:border-kore-emerald/50"
              }`}
            >
              <Percent size={16} /> Percentual
            </button>
            <button
              type="button"
              onClick={() => setType("fixed")}
              className={`flex items-center justify-center gap-2 h-11 rounded-xl border font-bold text-sm transition ${
                type === "fixed"
                  ? "bg-kore-emerald/10 border-kore-emerald text-kore-emerald-deep"
                  : "bg-kore-bg border-kore-border text-kore-muted hover:border-kore-emerald/50"
              }`}
            >
              <Banknote size={16} /> Valor Fixo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Valor */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-kore-ink">
              Valor {type === "percent" ? "(%)" : "(R$)"}
            </label>
            <input
              type="number"
              required
              min="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "20" : "50"}
              className="w-full h-11 px-4 rounded-xl bg-kore-bg border border-kore-border text-kore-ink placeholder:text-kore-muted focus:border-kore-emerald focus:ring-1 focus:ring-kore-emerald transition"
            />
          </div>

          {/* Uso Máximo */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-kore-ink">Uso Máximo</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
              <input
                type="number"
                required
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="100"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-kore-bg border border-kore-border text-kore-ink placeholder:text-kore-muted focus:border-kore-emerald focus:ring-1 focus:ring-kore-emerald transition"
              />
            </div>
          </div>
        </div>

        {/* Validade */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-kore-ink">Validade</label>
          <div className="relative">
            <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
            <input
              type="date"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-kore-bg border border-kore-border text-kore-ink placeholder:text-kore-muted focus:border-kore-emerald focus:ring-1 focus:ring-kore-emerald transition"
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className={`text-sm font-bold mt-2 ${message.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
            {message.text}
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-kore-border flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-kore-ink bg-kore-card border border-kore-border hover:bg-kore-border/50 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-kore-emerald hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Criar Cupom"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
