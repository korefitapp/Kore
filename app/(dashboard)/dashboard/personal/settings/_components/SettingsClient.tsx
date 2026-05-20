"use client";

import { useState, useCallback } from "react";
import {
  Bell,
  Camera,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Instagram,
  Key,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  Save,
  Shield,
  Twitter,
  User,
  Youtube,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
}

type TabKey = "perfil" | "pagamentos" | "notificacoes" | "seguranca";

interface TabDef {
  key: TabKey;
  label: string;
  Icon: typeof User;
}

const TABS: TabDef[] = [
  { key: "perfil", label: "Perfil", Icon: User },
  { key: "pagamentos", label: "Pagamentos", Icon: CreditCard },
  { key: "notificacoes", label: "Notificações", Icon: Bell },
  { key: "seguranca", label: "Segurança", Icon: Shield },
];

const SPECIALTIES = [
  "Musculação",
  "Funcional",
  "Pilates",
  "Crossfit",
  "Nutrição Esportiva",
  "Reabilitação",
  "Yoga",
  "HIIT",
  "Alongamento",
  "Lutas",
];

/* ── Component ──────────────────────────────────────────────── */
export function SettingsClient({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<TabKey>("perfil");

  return (
    <div className="min-h-screen flex bg-kore-bg text-kore-ink">
      <Sidebar />
      <MobileSidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="px-3 sm:px-6 pt-6 pb-8 max-w-[1000px] mx-auto">
            {/* ── Header ───────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-kore-emerald-soft grid place-items-center">
                <SettingsIcon />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Configurações
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  Gerencie seu perfil, pagamentos e preferências
                </p>
              </div>
            </div>

            {/* ── Tabs Navigation ──────────────────────────────── */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-kore-border">
              {TABS.map((tab) => {
                const { Icon } = tab;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition rounded-t-xl ${
                      active
                        ? "text-kore-emerald-deep bg-kore-emerald-soft"
                        : "text-kore-muted hover:text-kore-ink hover:bg-kore-bg"
                    }`}
                  >
                    {active && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-kore-emerald" />
                    )}
                    <Icon size={16} strokeWidth={2.2} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── Tab Content ──────────────────────────────────── */}
            {activeTab === "perfil" && <PerfilTab profile={profile} />}
            {activeTab === "pagamentos" && <PagamentosTab />}
            {activeTab === "notificacoes" && <NotificacoesTab />}
            {activeTab === "seguranca" && <SegurancaTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PERIL TAB
   ═══════════════════════════════════════════════════════════════ */
function PerfilTab({ profile }: { profile: ProfileData }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [cref, setCref] = useState("");
  const [specialties, setSpecialties] = useState<string[]>(["Musculação", "Funcional"]);
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSpecialty = useCallback((s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    // Simulate save
    setTimeout(() => setSaving(false), 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">Foto de Perfil</h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-kore-emerald/10 grid place-items-center overflow-hidden ring-2 ring-kore-border">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-kore-emerald-deep">
                  {getInitials(profile.full_name)}
                </span>
              )}
            </div>
            <button
              type="button"
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-kore-emerald text-white grid place-items-center shadow-kore-emerald hover:brightness-110 transition"
            >
              <Camera size={16} />
            </button>
          </div>
          <div>
            <p className="text-sm font-bold text-kore-ink">Alterar foto</p>
            <p className="text-xs text-kore-muted mt-0.5">
              JPG, PNG ou GIF. Máximo 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">Informações Básicas</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Nome Completo"
              value={fullName}
              onChange={setFullName}
              placeholder="Seu nome"
            />
            <FieldInput
              label="CREF"
              value={cref}
              onChange={setCref}
              placeholder="000000-G/SP"
            />
          </div>
          <FieldTextarea
            label="Bio"
            value={bio}
            onChange={setBio}
            placeholder="Conte um pouco sobre você, sua filosofia de treino e experiência..."
            rows={4}
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Especialidades</h3>
        <p className="text-xs text-kore-muted mb-4">Selecione suas áreas de atuação</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => {
            const active = specialties.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                  active
                    ? "bg-kore-emerald text-white border-kore-emerald shadow-kore-emerald"
                    : "bg-kore-bg text-kore-subink border-kore-border hover:border-kore-emerald/40"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Media */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">Redes Sociais</h3>
        <div className="space-y-3">
          <FieldInput
            label="Instagram"
            value={instagram}
            onChange={setInstagram}
            placeholder="@seuusuario"
            icon={<Instagram size={16} className="text-kore-muted" />}
          />
          <FieldInput
            label="YouTube"
            value={youtube}
            onChange={setYoutube}
            placeholder="https://youtube.com/@seucanal"
            icon={<Youtube size={16} className="text-kore-muted" />}
          />
          <FieldInput
            label="Twitter / X"
            value={twitter}
            onChange={setTwitter}
            placeholder="@seuusuario"
            icon={<Twitter size={16} className="text-kore-muted" />}
          />
          <FieldInput
            label="Website"
            value={website}
            onChange={setWebsite}
            placeholder="https://seusite.com.br"
            icon={<Globe size={16} className="text-kore-muted" />}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kore-emerald text-white text-sm font-bold shadow-kore-emerald hover:brightness-110 transition disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGAMENTOS TAB
   ═══════════════════════════════════════════════════════════════ */
function PagamentosTab() {
  const [stripeConnected, setStripeConnected] = useState(false);

  return (
    <div className="space-y-6">
      {/* Stripe Integration */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Integração Stripe</h3>
        <p className="text-xs text-kore-muted mb-5">
          Conecte sua conta Stripe para receber pagamentos dos alunos
        </p>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-kore-bg border border-kore-border">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 grid place-items-center flex-shrink-0">
            <StripeIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-kore-ink">Stripe</p>
            <p className="text-xs text-kore-muted mt-0.5">
              {stripeConnected
                ? "Conta conectada e verificada"
                : "Nenhuma conta conectada"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                stripeConnected
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-kore-bg border border-kore-border text-kore-muted"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  stripeConnected ? "bg-emerald-500" : "bg-kore-muted"
                }`}
              />
              {stripeConnected ? "Conectado" : "Desconectado"}
            </span>
            <button
              type="button"
              onClick={() => setStripeConnected(!stripeConnected)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                stripeConnected
                  ? "bg-kore-bg border border-kore-border text-kore-muted hover:text-rose-600 hover:border-rose-300"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {stripeConnected ? "Desconectar" : "Conectar Stripe"}
            </button>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">Status da Conta</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusCard
            label="Conta Stripe"
            value={stripeConnected ? "Verificada" : "Não conectada"}
            status={stripeConnected ? "ok" : "warning"}
          />
          <StatusCard
            label="Taxa KORE"
            value="10% por transação"
            status="ok"
          />
          <StatusCard
            label="Repasse"
            value="D+7 dias úteis"
            status="ok"
          />
        </div>
      </div>

      {/* Billing Info */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Informações de Cobrança</h3>
        <p className="text-xs text-kore-muted mb-4">
          Dados fiscais para emissão de recibos
        </p>
        <div className="space-y-3">
          <FieldInput
            label="CPF / CNPJ"
            value=""
            onChange={() => {}}
            placeholder="000.000.000-00"
          />
          <FieldInput
            label=" Razão Social / Nome"
            value=""
            onChange={() => {}}
            placeholder="Seu nome ou empresa"
          />
          <FieldInput
            label="Endereço"
            value=""
            onChange={() => {}}
            placeholder="Rua, número, cidade - UF"
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTIFICAÇÕES TAB
   ═══════════════════════════════════════════════════════════════ */
function NotificacoesTab() {
  const [toggles, setToggles] = useState({
    newMessage: true,
    workoutCompleted: true,
    studentAbsence: true,
    paymentReceived: true,
    paymentOverdue: true,
    weeklyReport: false,
    monthlyReport: true,
    marketingTips: false,
    systemUpdates: true,
    pushEnabled: true,
    emailDigest: true,
    soundEnabled: true,
  });

  const handleToggle = useCallback((key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Push & Activity */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Atividade dos Alunos</h3>
        <p className="text-xs text-kore-muted mb-4">
          Notificações sobre ações dos seus alunos
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Nova mensagem recebida"
            description="Notificar quando um aluno enviar uma mensagem"
            active={toggles.newMessage}
            onToggle={() => handleToggle("newMessage")}
            icon={<MessageSquare size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Treino concluído"
            description="Alertar quando um aluno completar um treino"
            active={toggles.workoutCompleted}
            onToggle={() => handleToggle("workoutCompleted")}
            icon={<Palette size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Falta / Ausência"
            description="Avisar quando um aluno faltar uma sessão"
            active={toggles.studentAbsence}
            onToggle={() => handleToggle("studentAbsence")}
            icon={<Bell size={16} className="text-kore-muted" />}
          />
        </div>
      </div>

      {/* Financial */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Financeiro</h3>
        <p className="text-xs text-kore-muted mb-4">
          Notificações sobre pagamentos e cobranças
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Pagamento recebido"
            description="Confirmar quando um pagamento for processado"
            active={toggles.paymentReceived}
            onToggle={() => handleToggle("paymentReceived")}
            icon={<CreditCard size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Pagamento atrasado"
            description="Alertar sobre pagamentos pendentes ou vencidos"
            active={toggles.paymentOverdue}
            onToggle={() => handleToggle("paymentOverdue")}
            icon={<CreditCard size={16} className="text-rose-400" />}
          />
        </div>
      </div>

      {/* Reports */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Relatórios</h3>
        <p className="text-xs text-kore-muted mb-4">
          Resumos periódicos sobre seu desempenho
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Relatório semanal"
            description="Resumo semanal de atividades e ganhos"
            active={toggles.weeklyReport}
            onToggle={() => handleToggle("weeklyReport")}
            icon={<Mail size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Relatório mensal"
            description="Análise mensal completa com métricas"
            active={toggles.monthlyReport}
            onToggle={() => handleToggle("monthlyReport")}
            icon={<Mail size={16} className="text-kore-muted" />}
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Preferências Gerais</h3>
        <p className="text-xs text-kore-muted mb-4">
          Configurações de entrega e sons
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Notificações push"
            description="Receber notificações no navegador"
            active={toggles.pushEnabled}
            onToggle={() => handleToggle("pushEnabled")}
            icon={<Bell size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Resumo por e-mail"
            description="Receber um digest diário por e-mail"
            active={toggles.emailDigest}
            onToggle={() => handleToggle("emailDigest")}
            icon={<Mail size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Som de notificação"
            description="Tocar som ao receber novas notificações"
            active={toggles.soundEnabled}
            onToggle={() => handleToggle("soundEnabled")}
            icon={<Bell size={16} className="text-kore-muted" />}
            last
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SEGURANÇA TAB
   ═══════════════════════════════════════════════════════════════ */
function SegurancaTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const passwordsMatch = newPassword === confirmPassword || confirmPassword === "";
  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Alterar Senha</h3>
        <p className="text-xs text-kore-muted mb-5">
          Mantenha sua conta segura com uma senha forte
        </p>
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-kore-subink mb-1.5">
              Senha Atual
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kore-muted hover:text-kore-ink transition"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-kore-subink mb-1.5">
              Nova Senha
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-kore-muted hover:text-kore-ink transition"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => {
                    const strength = getPasswordStrength(newPassword);
                    return (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition ${
                          i <= strength
                            ? strength <= 1
                              ? "bg-rose-500"
                              : strength <= 2
                                ? "bg-amber-500"
                                : strength <= 3
                                  ? "bg-emerald-500"
                                  : "bg-emerald-500"
                            : "bg-kore-border"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] font-semibold mt-1 text-kore-muted">
                  {newPassword.length < 8
                    ? "Mínimo 8 caracteres"
                    : getPasswordStrength(newPassword) <= 1
                      ? "Senha fraca"
                      : getPasswordStrength(newPassword) <= 2
                        ? "Senha razoável"
                        : getPasswordStrength(newPassword) <= 3
                          ? "Senha forte"
                          : "Senha excelente"}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-kore-subink mb-1.5">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-kore-bg border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 transition ${
                  !passwordsMatch
                    ? "border-rose-400 focus:ring-rose-400/40 focus:border-rose-400"
                    : "border-kore-border focus:ring-kore-emerald/40 focus:border-kore-emerald"
                }`}
              />
            </div>
            {!passwordsMatch && (
              <p className="text-[11px] font-semibold text-rose-500 mt-1.5">
                As senhas não coincidem
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit || saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-kore-emerald text-white text-sm font-bold shadow-kore-emerald hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lock size={16} />
            {saving ? "Salvando..." : "Alterar Senha"}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">Sessões Ativas</h3>
        <div className="space-y-3">
          <SessionRow
            device="Chrome — Windows 11"
            location="São Paulo, SP"
            lastActive="Agora"
            current
          />
          <SessionRow
            device="Safari — iPhone 15"
            location="São Paulo, SP"
            lastActive="Há 2 horas"
          />
        </div>
        <button
          type="button"
          className="mt-4 text-xs font-bold text-rose-500 hover:text-rose-600 transition"
        >
          Encerrar todas as outras sessões
        </button>
      </div>
    </div>
  );
}

/* ── Shared Components ──────────────────────────────────────── */
function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-kore-subink mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-kore-subink mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition resize-none"
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  active,
  onToggle,
  icon,
  last = false,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 py-3.5 ${
        !last ? "border-b border-kore-border/50" : ""
      }`}
    >
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-kore-bg grid place-items-center flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-kore-ink">{label}</p>
        <p className="text-[11px] text-kore-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          active ? "bg-kore-emerald" : "bg-kore-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            active ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function StatusCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "ok" | "warning" | "error";
}) {
  const colorMap = {
    ok: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    error: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-700 dark:text-rose-400",
      dot: "bg-rose-500",
    },
  };
  const c = colorMap[status];

  return (
    <div className="p-4 rounded-xl bg-kore-bg border border-kore-border">
      <p className="text-[10px] font-bold uppercase tracking-wider text-kore-muted mb-2">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-sm font-bold ${c.text}`}>{value}</span>
      </div>
    </div>
  );
}

function SessionRow({
  device,
  location,
  lastActive,
  current = false,
}: {
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-kore-bg border border-kore-border">
      <div className="w-9 h-9 rounded-xl bg-kore-card grid place-items-center flex-shrink-0">
        <Globe size={16} className="text-kore-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-kore-ink truncate">{device}</p>
          {current && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
              Atual
            </span>
          )}
        </div>
        <p className="text-[11px] text-kore-muted mt-0.5">
          {location} · {lastActive}
        </p>
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */
function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  if (parts.length === 1) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

function getPasswordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/* ── Icons ──────────────────────────────────────────────────── */
function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-kore-emerald-deep"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function StripeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.102l-.89 5.592C5.073 22.973 8.018 24 11.862 24c2.596 0 4.71-.641 6.22-1.9 1.636-1.365 2.511-3.37 2.511-5.808 0-4.128-2.524-5.849-6.617-7.142z"
        fill="#635BFF"
      />
    </svg>
  );
}