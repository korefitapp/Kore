"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Tag, Percent, Banknote, CalendarDays, Hash, Loader2 } from "lucide-react";
import type { CouponRow } from "../page";

export function EditCouponModal({
  isOpen,
  onClose,
  coupon,
}: {
  isOpen: boolean;
  onClose: () => void;
  coupon: CouponRow;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [code, setCode] = useState(coupon.code);
  const [type, setType] = useState<"fixed" | "percent">(coupon.type);
  const [value, setValue] = useState(String(coupon.value));
  const [maxUses, setMaxUses] = useState(String(coupon.max_uses));
  const [validUntil, setValidUntil] = useState(coupon.valid_until);

  // Sync state if coupon changes
  useEffect(() => {
    setCode(coupon.code);
    setType(coupon.type);
    setValue(String(coupon.value));
    setMaxUses(String(coupon.max_uses));
    setValidUntil(coupon.valid_until);
    setMessage(null);
  }, [coupon]);

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
    };

    const { error } = await supabase
      .from("coupons")
      .update(payload)
      .eq("id", coupon.id);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage({ text: "Erro ao atualizar cupom: " + error.message, type: "error" });
    } else {
      setMessage({ text: "Cupom atualizado com sucesso!", type: "success" });
      setTimeout(() => {
        setMessage(null);
        onClose();
        router.refresh();
      }, 1500);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Cupom"
      description="Atualize as informações do cupom."
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
