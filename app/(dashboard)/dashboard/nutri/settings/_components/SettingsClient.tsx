"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Bell,
  Camera,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  Globe,
  Instagram,
  Key,
  Lock,
  Mail,
  MessageSquare,
  Save,
  Shield,
  Stethoscope,
  Twitter,
  User,
  Youtube,
  Wallet,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { 
  createStripeConnectLink,
} from "@/app/actions/payment-actions";

// Mock missing actions
const getWalletBalance = async () => ({
  available_balance: 0,
  pending_balance: 0,
  stripe_account_id: null,
  mp_access_token: null
});
const requestPixWithdrawal = async (amount: number, key: string) => { await new Promise(r => setTimeout(r, 1000)); };
const disconnectStripe = async () => {};
const getMercadoPagoAuthUrl = async () => "/";
const disconnectMercadoPago = async () => {};
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
  { key: "perfil", label: "Perfil Profissional", Icon: User },
  { key: "pagamentos", label: "Pagamentos", Icon: CreditCard },
  { key: "notificacoes", label: "Notificações", Icon: Bell },
  { key: "seguranca", label: "Segurança", Icon: Shield },
];

const NUTRI_SPECIALTIES = [
  "Nutrição Esportiva",
  "Nutrição Clínica",
  "Emagrecimento",
  "Ganho de Massa Muscular",
  "Nutrição Materno-Infantil",
  "Nutrição Geriátrica",
  "Transtornos Alimentares",
  "Alergias e Intolerâncias",
  "Nutrição Vegana/Vegetariana",
  "Reeducação Alimentar",
  "Nutrição Funcional",
  "Nutrição Oncológica",
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
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
                <SettingsIcon />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Configurações da Conta
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  Gerencie seu perfil profissional, pagamentos e preferências
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
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                        : "text-kore-muted hover:text-kore-ink hover:bg-kore-bg"
                    }`}
                  >
                    {active && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-emerald-500" />
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
   PERFIL PROFISSIONAL TAB
   ═══════════════════════════════════════════════════════════════ */
function PerfilTab({ profile }: { profile: ProfileData }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [crn, setCrn] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([
    "Nutrição Clínica",
    "Emagrecimento",
  ]);
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSpecialty = useCallback((s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }, []);

  const handleSave = useCallback(() => {
    setSaving(true);
    setSaved(false);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">
          Foto de Perfil
        </h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center overflow-hidden ring-2 ring-kore-border">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-emerald-600">
                  {getInitials(profile.full_name)}
                </span>
              )}
            </div>
            <button
              type="button"
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition"
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
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">
          Informações Profissionais
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Nome Completo"
              value={fullName}
              onChange={setFullName}
              placeholder="Seu nome completo"
            />
            <FieldInput
              label="CRN (Conselho Regional de Nutricionistas)"
              value={crn}
              onChange={setCrn}
              placeholder="CRN-XX 12345"
              icon={<Stethoscope size={16} className="text-kore-muted" />}
            />
          </div>
          <FieldTextarea
            label="Bio / Especialidades"
            value={bio}
            onChange={setBio}
            placeholder="Conte um pouco sobre sua abordagem nutricional, áreas de atuação e experiência profissional..."
            rows={4}
          />
        </div>
      </div>

      {/* Specialties */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Áreas de Atuação
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Selecione suas especialidades nutricionais
        </p>
        <div className="flex flex-wrap gap-2">
          {NUTRI_SPECIALTIES.map((s) => {
            const active = specialties.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20"
                    : "bg-kore-bg text-kore-subink border-kore-border hover:border-emerald-400/40"
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
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">
          Redes Sociais
        </h3>
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
      <div className="flex items-center justify-between">
        {saved && (
          <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Alterações salvas com sucesso!
          </span>
        )}
        {!saved && <span />}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGAMENTOS & RECEBIMENTOS TAB
   ═══════════════════════════════════════════════════════════════ */
function MercadoPagoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 9H17V15H14.5V9ZM9.5 9H12V15H9.5V9ZM4.5 9H7V15H4.5V9Z" fill="#00B1EA"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4.5 17C3.67 17 3 16.33 3 15.5V8.5C3 7.67 3.67 7 4.5 7H19.5C20.33 7 21 7.67 21 8.5V15.5C21 16.33 20.33 17 19.5 17H4.5Z" fill="#00B1EA"/>
    </svg>
  );
}

function PagamentosTab() {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [mpConnected, setMpConnected] = useState(false);
  
  // Wallet
  const [pendingBalance, setPendingBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  
  // Withdrawal
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPixKey, setWithdrawPixKey] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Error Toast State
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  };

  // Fetch Wallet Data
  useEffect(() => {
    async function loadWallet() {
      try {
        const wallet = await getWalletBalance();
        setAvailableBalance(wallet.available_balance);
        setPendingBalance(wallet.pending_balance);
        
        // Setup Gateways state
        if (wallet.stripe_account_id) setStripeConnected(true);
        if (wallet.mp_access_token) setMpConnected(true);
      } catch (err) {
        console.error("Erro ao carregar carteira:", err);
      } finally {
        setIsLoadingWallet(false);
      }
    }
    loadWallet();
  }, []);

  const handleStripeAction = async () => {
    try {
      if (stripeConnected) {
        if(confirm("Tem a certeza que deseja desconectar a sua conta Stripe?")) {
          await disconnectStripe();
          setStripeConnected(false);
        }
      } else {
        const url = await createStripeConnectLink();
        window.location.href = url;
      }
    } catch (err: any) {
      showError(err.message || "Ocorreu um erro ao conectar com Stripe.");
    }
  };

  const handleMpAction = async () => {
    try {
      if (mpConnected) {
        if(confirm("Tem a certeza que deseja desconectar a sua conta Mercado Pago?")) {
          await disconnectMercadoPago();
          setMpConnected(false);
        }
      } else {
        const url = await getMercadoPagoAuthUrl();
        window.location.href = url;
      }
    } catch (err: any) {
      showError(err.message || "Ocorreu um erro ao conectar com Mercado Pago.");
    }
  };

  // Default PIX Config
  const [pixType, setPixType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    try {
      const amount = parseFloat(withdrawAmount.replace(",", "."));
      if (isNaN(amount) || amount <= 0) {
        alert("Valor inválido");
        return;
      }
      if (amount > availableBalance) {
        alert("Saldo insuficiente");
        return;
      }
      if (!withdrawPixKey.trim()) {
        alert("Informe a chave PIX");
        return;
      }
      
      await requestPixWithdrawal(amount, withdrawPixKey);
      alert("Saque solicitado com sucesso! Você receberá o valor em breve.");
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
    } catch (err: any) {
      alert("Erro ao solicitar saque: " + err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Wallet Section */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-kore-ink mb-1">
              Sua Carteira KORE
            </h3>
            <p className="text-xs text-kore-muted">
              Acompanhe seus ganhos e solicite repasses
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center text-emerald-600">
            <Wallet size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex gap-4">
            <div className="bg-kore-bg border border-kore-border rounded-xl p-4 flex-1">
              <p className="text-xs font-bold text-kore-muted mb-1">Saldo Pendente</p>
              {isLoadingWallet ? (
                <Loader2 size={24} className="animate-spin text-kore-muted" />
              ) : (
                <p className="text-xl font-extrabold text-kore-ink">R$ {pendingBalance.toFixed(2).replace(".", ",")}</p>
              )}
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 flex-1">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Saldo Disponível</p>
              {isLoadingWallet ? (
                <Loader2 size={24} className="animate-spin text-emerald-600" />
              ) : (
                <p className="text-xl font-extrabold text-emerald-600">R$ {availableBalance.toFixed(2).replace(".", ",")}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (availableBalance <= 0) {
                  alert("Saldo insuficiente para efetuar o saque.");
                  return;
                }
                setWithdrawPixKey(pixKey);
                setWithdrawModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition active:scale-95 w-full md:w-auto justify-center"
            >
              Solicitar Saque (PIX)
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Solicitar Saque"
        description="O repasse via PIX será efetuado em até 1 dia útil."
      >
        <form onSubmit={handleWithdraw} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-kore-subink mb-1.5">
              Valor do Saque (R$)
            </label>
            <input
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Ex: 500,00"
              className="w-full px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              required
            />
            <p className="text-xs text-kore-muted mt-1.5">
              Disponível: R$ {availableBalance.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-kore-subink mb-1.5">
              Chave PIX de Destino
            </label>
            <input
              type="text"
              value={withdrawPixKey}
              onChange={(e) => setWithdrawPixKey(e.target.value)}
              placeholder="CPF, Email, Celular ou Aleatória"
              className="w-full px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-kore-muted hover:text-kore-ink transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isWithdrawing}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition active:scale-95 disabled:opacity-50"
            >
              {isWithdrawing ? "Processando..." : "Confirmar Saque"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Gateways */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Gateways de Pagamento
        </h3>
        <p className="text-xs text-kore-muted mb-5">
          Conecte suas contas para receber pagamentos de consultas por cartão ou boleto
        </p>

        <div className="space-y-3">
          {/* Stripe */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-kore-bg border border-kore-border">
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
                    : "bg-kore-card border border-kore-border text-kore-muted"
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
                onClick={handleStripeAction}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  stripeConnected
                    ? "bg-kore-card border border-kore-border text-kore-muted hover:text-rose-600 hover:border-rose-300"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {stripeConnected ? "Desconectar" : "Conectar com Stripe"}
              </button>
            </div>
          </div>

          {/* Mercado Pago */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-kore-bg border border-kore-border">
            <div className="w-12 h-12 rounded-xl bg-[#00B1EA]/10 grid place-items-center flex-shrink-0">
              <MercadoPagoIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-kore-ink">Mercado Pago</p>
              <p className="text-xs text-kore-muted mt-0.5">
                {mpConnected
                  ? "Conta conectada e ativa"
                  : "Nenhuma conta conectada"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                  mpConnected
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                    : "bg-kore-card border border-kore-border text-kore-muted"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    mpConnected ? "bg-emerald-500" : "bg-kore-muted"
                  }`}
                />
                {mpConnected ? "Conectado" : "Desconectado"}
              </span>
              <button
                type="button"
                onClick={handleMpAction}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  mpConnected
                    ? "bg-kore-card border border-kore-border text-kore-muted hover:text-rose-600 hover:border-rose-300"
                    : "bg-[#00B1EA] text-white hover:bg-[#0099CA]"
                }`}
              >
                {mpConnected ? "Desconectar" : "Conectar Mercado Pago"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PIX Settings */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Dados para Repasse (PIX)
        </h3>
        <p className="text-xs text-kore-muted mb-5">
          Defina sua chave PIX padrão para agilizar as solicitações de saque da sua carteira.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-kore-subink mb-1.5">
              Tipo de Chave
            </label>
            <select
              value={pixType}
              onChange={(e) => setPixType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            >
              <option value="cpf">CPF / CNPJ</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave Aleatória</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-kore-subink mb-1.5">
              Chave PIX
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Digite sua chave PIX"
              className="w-full px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">
          Status e Condições
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusCard
            label="Taxa KORE"
            value="10% por transação"
            status="ok"
          />
          <StatusCard
            label="Liberação de Saldo"
            value="D+7 dias úteis"
            status="ok"
          />
          <StatusCard
            label="Repasse PIX"
            value="D+1 dia útil"
            status="ok"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Configurações salvas!
          </span>
        )}
        {!saved && <span />}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>

      {/* Custom Destructive Toast */}
      {errorToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-200" />
            <div>
              <p className="text-sm font-bold">Erro de Conexão</p>
              <p className="text-xs text-red-100">{errorToast}</p>
            </div>
            <button 
              onClick={() => setErrorToast(null)}
              className="ml-4 text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NOTIFICAÇÕES TAB
   ═══════════════════════════════════════════════════════════════ */
function NotificacoesTab() {
  const [toggles, setToggles] = useState({
    newAppointment: true,
    patientMessages: true,
    dailyReminders: true,
    cancelledAppointment: true,
    paymentReceived: true,
    paymentOverdue: true,
    weeklyReport: false,
    monthlyReport: true,
    pushEnabled: true,
    emailDigest: true,
    soundEnabled: true,
  });

  const handleToggle = useCallback((key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Agendamentos */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Agendamentos
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Notificações sobre consultas e agendamentos
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Novos agendamentos"
            description="Notificar quando um paciente agendar uma consulta"
            active={toggles.newAppointment}
            onToggle={() => handleToggle("newAppointment")}
            icon={<Calendar size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Cancelamentos"
            description="Alertar quando um paciente cancelar uma consulta"
            active={toggles.cancelledAppointment}
            onToggle={() => handleToggle("cancelledAppointment")}
            icon={<Bell size={16} className="text-rose-400" />}
          />
          <ToggleRow
            label="Lembretes de consultas do dia"
            description="Receber lembretes das consultas agendadas para hoje"
            active={toggles.dailyReminders}
            onToggle={() => handleToggle("dailyReminders")}
            icon={<Bell size={16} className="text-emerald-500" />}
          />
        </div>
      </div>

      {/* Comunicação */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Comunicação</h3>
        <p className="text-xs text-kore-muted mb-4">
          Notificações sobre mensagens dos pacientes
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Mensagens de pacientes"
            description="Notificar quando um paciente enviar uma mensagem"
            active={toggles.patientMessages}
            onToggle={() => handleToggle("patientMessages")}
            icon={<MessageSquare size={16} className="text-kore-muted" />}
          />
        </div>
      </div>

      {/* Financeiro */}
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

      {/* Relatórios */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Relatórios</h3>
        <p className="text-xs text-kore-muted mb-4">
          Resumos periódicos sobre seu desempenho
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Relatório semanal"
            description="Resumo semanal de consultas e ganhos"
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

      {/* Preferências Gerais */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Preferências Gerais
        </h3>
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
  const [saved, setSaved] = useState(false);

  const passwordsMatch =
    newPassword === confirmPassword || confirmPassword === "";
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleSave = useCallback(() => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Alterar Senha
        </h3>
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
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
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
              <Key
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
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
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-kore-bg border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 transition ${
                  !passwordsMatch
                    ? "border-rose-400 focus:ring-rose-400/40 focus:border-rose-400"
                    : "border-kore-border focus:ring-emerald-500/40 focus:border-emerald-500"
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

        <div className="flex items-center justify-between mt-6">
          {saved && (
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Senha alterada com sucesso!
            </span>
          )}
          {!saved && <span />}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit || saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lock size={16} />
            {saving ? "Salvando..." : "Alterar Senha"}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">
          Sessões Ativas
        </h3>
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
          className={`w-full py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition ${
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
        className="w-full px-4 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition resize-none"
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
          active ? "bg-emerald-500" : "bg-kore-border"
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
      className="text-emerald-600"
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

function Calendar({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}