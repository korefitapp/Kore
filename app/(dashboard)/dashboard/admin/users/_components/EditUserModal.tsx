"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import type { UserRow } from "../page";
import { updateAdminUser } from "@/app/actions/admin-actions";

interface EditUserModalProps {
  user: UserRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
      setError("");
    }
  }, [user, isOpen]);

  // Se não estiver aberto, não renderiza o wrapper
  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    const res = await updateAdminUser(user.id, formData);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message || "Erro desconhecido");
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-kore-ink/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-kore-bg rounded-2xl shadow-xl overflow-hidden border border-kore-border"
        >
          <div className="flex items-center justify-between p-5 border-b border-kore-border/50 bg-kore-card">
            <h2 className="text-lg font-bold text-kore-ink">Editar Usuário</h2>
            <button
              onClick={onClose}
              className="p-1 text-kore-muted hover:text-kore-ink hover:bg-kore-border/50 rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-500/10 rounded-xl font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kore-muted uppercase tracking-wider">
                Nome
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full h-11 px-3 bg-kore-card border border-kore-border rounded-xl text-sm focus:outline-none focus:border-kore-emerald/50 focus:ring-2 focus:ring-kore-emerald/20 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-kore-muted uppercase tracking-wider">
                E-mail
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3 bg-kore-card border border-kore-border rounded-xl text-sm focus:outline-none focus:border-kore-emerald/50 focus:ring-2 focus:ring-kore-emerald/20 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kore-muted uppercase tracking-wider">
                  Tipo
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-11 px-3 bg-kore-card border border-kore-border rounded-xl text-sm focus:outline-none focus:border-kore-emerald/50 focus:ring-2 focus:ring-kore-emerald/20 transition"
                >
                  <option value="client">Cliente</option>
                  <option value="trainer">Personal</option>
                  <option value="nutritionist">Nutricionista</option>
                  <option value="merchant">Lojista</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-kore-muted uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-11 px-3 bg-kore-card border border-kore-border rounded-xl text-sm focus:outline-none focus:border-kore-emerald/50 focus:ring-2 focus:ring-kore-emerald/20 transition"
                >
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="pending">Pendente</option>
                  <option value="churned">Inativo (Excluído)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-bold text-kore-subink hover:text-kore-ink hover:bg-kore-border/40 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-kore-emerald hover:bg-kore-emerald-deep rounded-xl transition shadow-lg shadow-kore-emerald/20 disabled:opacity-70"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar Alterações
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
