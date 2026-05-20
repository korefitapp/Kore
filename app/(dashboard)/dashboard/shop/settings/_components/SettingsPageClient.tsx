"use client";

import { useState, useCallback } from "react";
import {
  Bell,
  Building2,
  Camera,
  CreditCard,
  Key,
  MapPin,
  Package,
  Save,
  Settings,
  Truck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { MobileSidebar, Sidebar } from "../../_components/Sidebar";
import { Topbar } from "../../_components/Topbar";

/* ── Types ──────────────────────────────────────────────────── */
type TabKey = "dados" | "frete" | "pagamentos" | "notificacoes";

interface TabDef {
  key: TabKey;
  label: string;
  Icon: typeof Building2;
}

const TABS: TabDef[] = [
  { key: "dados", label: "Dados da Loja", Icon: Building2 },
  { key: "frete", label: "Frete & Logística", Icon: Truck },
  { key: "pagamentos", label: "Pagamentos", Icon: CreditCard },
  { key: "notificacoes", label: "Notificações", Icon: Bell },
];

/* ── Component ──────────────────────────────────────────────── */
export function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("dados");

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
                <Settings size={20} className="text-kore-emerald-deep" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Configurações
                </h1>
                <p className="text-sm text-kore-muted mt-0.5">
                  Gerencie os dados da loja, frete, pagamentos e notificações
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
            {activeTab === "dados" && <DadosLojaTab />}
            {activeTab === "frete" && <FreteLogisticaTab />}
            {activeTab === "pagamentos" && <PagamentosTab />}
            {activeTab === "notificacoes" && <NotificacoesTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DADOS DA LOJA TAB
   ═══════════════════════════════════════════════════════════════ */
function DadosLojaTab() {
  const [storeName, setStoreName] = useState("Kore Fitness Store");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [cep, setCep] = useState("01310-100");
  const [street, setStreet] = useState("Av. Paulista");
  const [number, setNumber] = useState("1578");
  const [complement, setComplement] = useState("Sala 301");
  const [neighborhood, setNeighborhood] = useState("Bela Vista");
  const [city, setCity] = useState("São Paulo");
  const [state, setState] = useState("SP");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">
          Logo da Loja
        </h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-kore-emerald/10 grid place-items-center overflow-hidden ring-2 ring-kore-border">
              <ShoppingBag size={36} className="text-kore-emerald-deep" />
            </div>
            <button
              type="button"
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-kore-emerald text-white grid place-items-center shadow-kore-emerald hover:brightness-110 transition"
            >
              <Camera size={16} />
            </button>
          </div>
          <div>
            <p className="text-sm font-bold text-kore-ink">Alterar logo</p>
            <p className="text-xs text-kore-muted mt-0.5">
              JPG, PNG ou SVG. Recomendado 512×512px. Máximo 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-4">
          Informações da Loja
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput
              label="Nome da Loja"
              value={storeName}
              onChange={setStoreName}
              placeholder="Nome fantasia"
              icon={<Building2 size={16} className="text-kore-muted" />}
            />
            <FieldInput
              label="CNPJ"
              value={cnpj}
              onChange={setCnpj}
              placeholder="00.000.000/0000-00"
              icon={<Key size={16} className="text-kore-muted" />}
            />
          </div>
        </div>
      </div>

      {/* Sender Address */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Endereço de Remetente
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Endereço utilizado para emissão de etiquetas de envio
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FieldInput
              label="CEP"
              value={cep}
              onChange={setCep}
              placeholder="00000-000"
              icon={<MapPin size={16} className="text-kore-muted" />}
            />
            <div className="sm:col-span-2">
              <FieldInput
                label="Rua"
                value={street}
                onChange={setStreet}
                placeholder="Nome da rua"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FieldInput
              label="Número"
              value={number}
              onChange={setNumber}
              placeholder="Nº"
            />
            <FieldInput
              label="Complemento"
              value={complement}
              onChange={setComplement}
              placeholder="Apto, Sala..."
            />
            <FieldInput
              label="Bairro"
              value={neighborhood}
              onChange={setNeighborhood}
              placeholder="Bairro"
            />
            <div className="grid grid-cols-2 gap-4">
              <FieldInput
                label="Cidade"
                value={city}
                onChange={setCity}
                placeholder="Cidade"
              />
              <FieldInput
                label="UF"
                value={state}
                onChange={setState}
                placeholder="UF"
              />
            </div>
          </div>
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
   FRETE & LOGÍSTICA TAB
   ═══════════════════════════════════════════════════════════════ */
function FreteLogisticaTab() {
  const [originCep, setOriginCep] = useState("01310-100");
  const [correiosEnabled, setCorreiosEnabled] = useState(true);
  const [correiosKey, setCorreiosKey] = useState("");
  const [transportadoraEnabled, setTransportadoraEnabled] = useState(false);
  const [transportadoraName, setTransportadoraName] = useState("");
  const [transportadoraToken, setTransportadoraToken] = useState("");
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingMin, setFreeShippingMin] = useState("199.90");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Origin CEP */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          CEP de Origem
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          CEP de onde os pacotes serão despachados
        </p>
        <div className="max-w-xs">
          <FieldInput
            label="CEP de Origem"
            value={originCep}
            onChange={setOriginCep}
            placeholder="00000-000"
            icon={<MapPin size={16} className="text-kore-muted" />}
          />
        </div>
      </div>

      {/* Correios Integration */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Integração com Correios
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Configure a API dos Correios para cálculo automático de frete
        </p>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-kore-bg border border-kore-border mb-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 grid place-items-center flex-shrink-0">
            <Truck size={22} className="text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-kore-ink">Correios</p>
            <p className="text-xs text-kore-muted mt-0.5">
              {correiosEnabled
                ? "Integração ativa — Frete PAC e SEDEX"
                : "Integração desativada"}
            </p>
          </div>
          <ToggleSwitch
            active={correiosEnabled}
            onToggle={() => setCorreiosEnabled(!correiosEnabled)}
          />
        </div>

        {correiosEnabled && (
          <div className="space-y-3">
            <FieldInput
              label="Chave de API (Correios)"
              value={correiosKey}
              onChange={setCorreiosKey}
              placeholder="Cole sua chave de API aqui"
              icon={<Key size={16} className="text-kore-muted" />}
            />
          </div>
        )}
      </div>

      {/* Transportadora */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Transportadora Personalizada
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Integre uma transportadora parceira via API
        </p>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-kore-bg border border-kore-border mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 grid place-items-center flex-shrink-0">
            <Package size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-kore-ink">Transportadora</p>
            <p className="text-xs text-kore-muted mt-0.5">
              {transportadoraEnabled
                ? `Conectado: ${transportadoraName || "Personalizada"}`
                : "Nenhuma transportadora configurada"}
            </p>
          </div>
          <ToggleSwitch
            active={transportadoraEnabled}
            onToggle={() =>
              setTransportadoraEnabled(!transportadoraEnabled)
            }
          />
        </div>

        {transportadoraEnabled && (
          <div className="space-y-3">
            <FieldInput
              label="Nome da Transportadora"
              value={transportadoraName}
              onChange={setTransportadoraName}
              placeholder="Ex: Jadlog, Loggi..."
            />
            <FieldInput
              label="Token de API"
              value={transportadoraToken}
              onChange={setTransportadoraToken}
              placeholder="Cole o token de integração"
              icon={<Key size={16} className="text-kore-muted" />}
            />
          </div>
        )}
      </div>

      {/* Free Shipping */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Frete Grátis
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Ofereça frete grátis a partir de um valor mínimo de compra
        </p>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-kore-bg border border-kore-border mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center flex-shrink-0">
            <Truck size={22} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-kore-ink">Frete Grátis</p>
            <p className="text-xs text-kore-muted mt-0.5">
              {freeShippingEnabled
                ? `Ativo para pedidos acima de R$ ${freeShippingMin}`
                : "Desativado"}
            </p>
          </div>
          <ToggleSwitch
            active={freeShippingEnabled}
            onToggle={() => setFreeShippingEnabled(!freeShippingEnabled)}
          />
        </div>

        {freeShippingEnabled && (
          <div className="max-w-xs">
            <FieldInput
              label="Valor Mínimo (R$)"
              value={freeShippingMin}
              onChange={setFreeShippingMin}
              placeholder="199.90"
            />
          </div>
        )}
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
  const [mercadoPagoKey, setMercadoPagoKey] = useState("");
  const [mercadoPagoSecret, setMercadoPagoSecret] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
  const [pixEnabled, setPixEnabled] = useState(true);
  const [pixKey, setPixKey] = useState("");
  const [showMpSecret, setShowMpSecret] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mercado Pago */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 grid place-items-center">
            <CreditCard size={16} className="text-sky-600" />
          </div>
          <h3 className="text-sm font-extrabold text-kore-ink">
            Mercado Pago
          </h3>
        </div>
        <p className="text-xs text-kore-muted mb-4 ml-11">
          Configure suas credenciais do Mercado Pago para receber pagamentos
        </p>
        <div className="space-y-3">
          <FieldInput
            label="Public Key"
            value={mercadoPagoKey}
            onChange={setMercadoPagoKey}
            placeholder="APP_USR-xxxxxxxxxxxx"
            icon={<Key size={16} className="text-kore-muted" />}
          />
          <FieldInputSecret
            label="Access Token (Secret)"
            value={mercadoPagoSecret}
            onChange={setMercadoPagoSecret}
            placeholder="APP_USR-xxxxxxxxxxxx"
            show={showMpSecret}
            onToggleShow={() => setShowMpSecret(!showMpSecret)}
          />
        </div>
      </div>

      {/* Stripe */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 grid place-items-center">
            <StripeIcon />
          </div>
          <h3 className="text-sm font-extrabold text-kore-ink">Stripe</h3>
        </div>
        <p className="text-xs text-kore-muted mb-4 ml-11">
          Configure suas chaves de API do Stripe
        </p>
        <div className="space-y-3">
          <FieldInput
            label="Publishable Key"
            value={stripeKey}
            onChange={setStripeKey}
            placeholder="pk_live_xxxxxxxxxxxx"
            icon={<Key size={16} className="text-kore-muted" />}
          />
          <FieldInputSecret
            label="Secret Key"
            value={stripeSecret}
            onChange={setStripeSecret}
            placeholder="sk_live_xxxxxxxxxxxx"
            show={showStripeSecret}
            onToggleShow={() => setShowStripeSecret(!showStripeSecret)}
          />
        </div>
      </div>

      {/* PIX */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 grid place-items-center">
            <PixIcon />
          </div>
          <h3 className="text-sm font-extrabold text-kore-ink">
            PIX (Pagamento Direto)
          </h3>
        </div>
        <p className="text-xs text-kore-muted mb-4 ml-11">
          Configure uma chave PIX para recebimento direto
        </p>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-kore-bg border border-kore-border mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-kore-ink">Aceitar PIX</p>
            <p className="text-xs text-kore-muted mt-0.5">
              {pixEnabled
                ? "PIX habilitado como forma de pagamento"
                : "PIX desabilitado"}
            </p>
          </div>
          <ToggleSwitch
            active={pixEnabled}
            onToggle={() => setPixEnabled(!pixEnabled)}
          />
        </div>

        {pixEnabled && (
          <div className="max-w-md">
            <FieldInput
              label="Chave PIX"
              value={pixKey}
              onChange={setPixKey}
              placeholder="CPF, CNPJ, e-mail ou chave aleatória"
            />
          </div>
        )}
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
   NOTIFICAÇÕES TAB
   ═══════════════════════════════════════════════════════════════ */
function NotificacoesTab() {
  const [toggles, setToggles] = useState({
    newOrder: true,
    lowStock: true,
    orderShipped: true,
    orderDelivered: false,
    paymentReceived: true,
    paymentOverdue: true,
    newReview: true,
    weeklyReport: false,
    monthlyReport: true,
  });

  const handleToggle = useCallback((key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Pedidos */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Pedidos</h3>
        <p className="text-xs text-kore-muted mb-4">
          Notificações relacionadas a pedidos da loja
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Novo Pedido"
            description="Receber e-mail a cada novo pedido realizado"
            active={toggles.newOrder}
            onToggle={() => handleToggle("newOrder")}
            icon={<ShoppingBag size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Pedido Enviado"
            description="Confirmar quando um pedido for despachado"
            active={toggles.orderShipped}
            onToggle={() => handleToggle("orderShipped")}
            icon={<Truck size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Pedido Entregue"
            description="Alertar quando o pedido for entregue ao cliente"
            active={toggles.orderDelivered}
            onToggle={() => handleToggle("orderDelivered")}
            icon={<Package size={16} className="text-kore-muted" />}
          />
        </div>
      </div>

      {/* Estoque */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">Estoque</h3>
        <p className="text-xs text-kore-muted mb-4">
          Alertas de inventário e disponibilidade
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Estoque Baixo"
            description="Alertar quando um produto atingir o nível mínimo de estoque"
            active={toggles.lowStock}
            onToggle={() => handleToggle("lowStock")}
            icon={<AlertTriangle size={16} className="text-amber-500" />}
          />
        </div>
      </div>

      {/* Financeiro */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Financeiro
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Notificações sobre pagamentos e cobranças
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Pagamento Recebido"
            description="Confirmar quando um pagamento for processado com sucesso"
            active={toggles.paymentReceived}
            onToggle={() => handleToggle("paymentReceived")}
            icon={<CreditCard size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Pagamento Atrasado"
            description="Alertar sobre pagamentos pendentes ou vencidos"
            active={toggles.paymentOverdue}
            onToggle={() => handleToggle("paymentOverdue")}
            icon={<CreditCard size={16} className="text-rose-400" />}
          />
        </div>
      </div>

      {/* Avaliações & Relatórios */}
      <div className="rounded-2xl border border-kore-border bg-kore-card/60 backdrop-blur-sm p-5">
        <h3 className="text-sm font-extrabold text-kore-ink mb-1">
          Avaliações & Relatórios
        </h3>
        <p className="text-xs text-kore-muted mb-4">
          Feedback de clientes e resumos periódicos
        </p>
        <div className="space-y-1">
          <ToggleRow
            label="Nova Avaliação"
            description="Notificar quando um cliente deixar uma avaliação"
            active={toggles.newReview}
            onToggle={() => handleToggle("newReview")}
            icon={<Mail size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Relatório Semanal"
            description="Resumo semanal de vendas e métricas"
            active={toggles.weeklyReport}
            onToggle={() => handleToggle("weeklyReport")}
            icon={<Mail size={16} className="text-kore-muted" />}
          />
          <ToggleRow
            label="Relatório Mensal"
            description="Análise mensal completa com performance da loja"
            active={toggles.monthlyReport}
            onToggle={() => handleToggle("monthlyReport")}
            icon={<Mail size={16} className="text-kore-muted" />}
            last
          />
        </div>
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

function FieldInputSecret({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-kore-subink mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-kore-muted"
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-kore-bg border border-kore-border text-sm font-medium text-kore-ink placeholder-kore-muted focus:outline-none focus:ring-2 focus:ring-kore-emerald/40 focus:border-kore-emerald transition"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-kore-muted hover:text-kore-ink transition"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
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
      <ToggleSwitch active={active} onToggle={onToggle} />
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */
function StripeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-7.076-2.102l-.89 5.592C5.073 22.973 8.018 24 11.862 24c2.596 0 4.71-.641 6.22-1.9 1.636-1.365 2.511-3.37 2.511-5.808 0-4.128-2.524-5.849-6.617-7.142z"
        fill="#635BFF"
      />
    </svg>
  );
}

function PixIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3.5 7.5V16.5L12 22L20.5 16.5V7.5L12 2Z"
        stroke="#32BCAD"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M7.5 10.5L12 7.5L16.5 10.5"
        stroke="#32BCAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 13.5L12 16.5L16.5 13.5"
        stroke="#32BCAD"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}