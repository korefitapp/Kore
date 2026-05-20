"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Key,
  Mail,
  Percent,
  Save,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";
import type { PlatformSettings } from "../page";

/* ── Component ───────────────────────────────────────────────── */
export function SettingsClient({
  initialSettings,
}: {
  initialSettings: PlatformSettings;
}) {
  /* ── Form state ────────────────────────────────────────────── */
  const [fees, setFees] = useState(initialSettings.fees);
  const [integrations, setIntegrations] = useState(
    initialSettings.integrations,
  );
  const [supportEmail, setSupportEmail] = useState(
    initialSettings.support_email,
  );

  /* ── UI state ──────────────────────────────────────────────── */
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showSendgridKey, setShowSendgridKey] = useState(false);
  const [savingFees, setSavingFees] = useState(false);
  const [savingIntegrations, setSavingIntegrations] = useState(false);
  const [savingSupport, setSavingSupport] = useState(false);
  const [savedFees, setSavedFees] = useState(false);
  const [savedIntegrations, setSavedIntegrations] = useState(false);
  const [savedSupport, setSavedSupport] = useState(false);

  /* ── Handlers ──────────────────────────────────────────────── */
  async function handleSaveFees() {
    setSavingFees(true);
    setSavedFees(false);
    /* TODO: Salvar no Supabase
     * await supabaseAdmin.from("platform_settings").update({ fees }).eq(...)
     */
    await new Promise((r) => setTimeout(r, 800));
    setSavingFees(false);
    setSavedFees(true);
    setTimeout(() => setSavedFees(false), 2500);
  }

  async function handleSaveIntegrations() {
    setSavingIntegrations(true);
    setSavedIntegrations(false);
    /* TODO: Salvar no Supabase
     * await supabaseAdmin.from("platform_settings").update({ integrations }).eq(...)
     */
    await new Promise((r) => setTimeout(r, 800));
    setSavingIntegrations(false);
    setSavedIntegrations(true);
    setTimeout(() => setSavedIntegrations(false), 2500);
  }

  async function handleSaveSupport() {
    setSavingSupport(true);
    setSavedSupport(false);
    /* TODO: Salvar no Supabase
     * await supabaseAdmin.from("platform_settings").update({ support_email }).eq(...)
     */
    await new Promise((r) => setTimeout(r, 800));
    setSavingSupport(false);
    setSavedSupport(true);
    setTimeout(() => setSavedSupport(false), 2500);
  }

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6 max-w-4xl">
          {/* ── Header ─────────────────────────────────────────── */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Configurações Globais
            </h1>
            <p className="text-sm text-kore-muted mt-1">
              Variáveis globais do sistema, integrações e taxas da plataforma
            </p>
          </div>

          {/* ── Card: Taxas da Plataforma ─────────────────────── */}
          <section className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-kore-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                <Percent size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Taxas da Plataforma</h2>
                <p className="text-xs text-kore-muted">
                  Percentual de comissão cobrado por tipo de profissional
                </p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Nutricionista */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-kore-subink uppercase tracking-wider">
                    Nutricionistas (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={fees.nutritionist_pct}
                      onChange={(e) =>
                        setFees({
                          ...fees,
                          nutritionist_pct: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full h-10 px-3 pr-8 rounded-xl bg-kore-bg border border-kore-border text-sm font-mono font-semibold text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-kore-muted">
                      %
                    </span>
                  </div>
                </div>

                {/* Personal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-kore-subink uppercase tracking-wider">
                    Personais (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={fees.personal_pct}
                      onChange={(e) =>
                        setFees({
                          ...fees,
                          personal_pct: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full h-10 px-3 pr-8 rounded-xl bg-kore-bg border border-kore-border text-sm font-mono font-semibold text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-kore-muted">
                      %
                    </span>
                  </div>
                </div>

                {/* Lojistas */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-kore-subink uppercase tracking-wider">
                    Lojistas (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={fees.store_pct}
                      onChange={(e) =>
                        setFees({
                          ...fees,
                          store_pct: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full h-10 px-3 pr-8 rounded-xl bg-kore-bg border border-kore-border text-sm font-mono font-semibold text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-kore-muted">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-kore-border">
                <button
                  type="button"
                  onClick={handleSaveFees}
                  disabled={savingFees}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kore-emerald text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {savingFees ? "Salvando…" : "Salvar Alterações"}
                </button>
                {savedFees && (
                  <span className="text-sm font-medium text-emerald-600">
                    ✓ Salvo com sucesso
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ── Card: Integrações ─────────────────────────────── */}
          <section className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-kore-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20 grid place-items-center">
                <Key size={18} className="text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Integrações</h2>
                <p className="text-xs text-kore-muted">
                  Chaves de API do Stripe e SendGrid
                </p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-5">
              {/* Stripe Secret Key */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-kore-subink uppercase tracking-wider">
                  Stripe Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showStripeKey ? "text" : "password"}
                    value={integrations.stripe_secret_key}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        stripe_secret_key: e.target.value,
                      })
                    }
                    placeholder="sk_live_..."
                    className="w-full h-10 pl-3 pr-10 rounded-xl bg-kore-bg border border-kore-border text-sm font-mono text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStripeKey(!showStripeKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kore-muted hover:text-kore-ink transition"
                    title={showStripeKey ? "Ocultar" : "Mostrar"}
                  >
                    {showStripeKey ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Stripe Webhook Secret */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-kore-subink uppercase tracking-wider">
                  Stripe Webhook Secret
                </label>
                <div className="relative">
                  <input
                    type={showWebhookSecret ? "text" : "password"}
                    value={integrations.stripe_webhook_secret}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        stripe_webhook_secret: e.target.value,
                      })
                    }
                    placeholder="whsec_..."
                    className="w-full h-10 pl-3 pr-10 rounded-xl bg-kore-bg border border-kore-border text-sm font-mono text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kore-muted hover:text-kore-ink transition"
                    title={showWebhookSecret ? "Ocultar" : "Mostrar"}
                  >
                    {showWebhookSecret ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* SendGrid API Key */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-kore-subink uppercase tracking-wider">
                  SendGrid API Key
                </label>
                <div className="relative">
                  <input
                    type={showSendgridKey ? "text" : "password"}
                    value={integrations.sendgrid_api_key}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        sendgrid_api_key: e.target.value,
                      })
                    }
                    placeholder="SG...."
                    className="w-full h-10 pl-3 pr-10 rounded-xl bg-kore-bg border border-kore-border text-sm font-mono text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSendgridKey(!showSendgridKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-kore-muted hover:text-kore-ink transition"
                    title={showSendgridKey ? "Ocultar" : "Mostrar"}
                  >
                    {showSendgridKey ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-kore-border">
                <button
                  type="button"
                  onClick={handleSaveIntegrations}
                  disabled={savingIntegrations}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kore-emerald text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {savingIntegrations ? "Salvando…" : "Salvar Alterações"}
                </button>
                {savedIntegrations && (
                  <span className="text-sm font-medium text-emerald-600">
                    ✓ Salvo com sucesso
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ── Card: Contato de Suporte ──────────────────────── */}
          <section className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-kore-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 grid place-items-center">
                <Mail size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Contato de Suporte</h2>
                <p className="text-xs text-kore-muted">
                  E-mail oficial de suporte exibido aos usuários
                </p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-kore-subink uppercase tracking-wider">
                  E-mail de Suporte
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="suporte@kore.fit"
                  className="w-full h-10 px-3 rounded-xl bg-kore-bg border border-kore-border text-sm text-kore-ink placeholder:text-kore-muted focus:outline-none focus:border-kore-emerald/60 focus:ring-2 focus:ring-kore-emerald/15 transition"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-kore-border">
                <button
                  type="button"
                  onClick={handleSaveSupport}
                  disabled={savingSupport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kore-emerald text-white text-sm font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {savingSupport ? "Salvando…" : "Salvar Alterações"}
                </button>
                {savedSupport && (
                  <span className="text-sm font-medium text-emerald-600">
                    ✓ Salvo com sucesso
                  </span>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}