"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  ChevronRight,
  MapPin,
  Pill,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
  Loader2,
  Store as StoreIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { selectCartCount, useKore } from "../store";
import { AddressModal } from "./AddressModal";

const currency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const filters: {
  key: "all" | "suplementos" | "frescos" | "farmacia";
  label: string;
  Icon: typeof Sparkles;
}[] = [
  { key: "all", label: "Todos", Icon: Sparkles },
  { key: "suplementos", label: "Suplementos", Icon: Sparkles },
  { key: "frescos", label: "Frescos", Icon: Apple },
  { key: "farmacia", label: "Farmácia", Icon: Pill },
];

export function ShopTab() {
  const address = useKore((s) => s.address);
  const setAddress = useKore((s) => s.setAddress);
  const cart = useKore((s) => s.cart);
  const cartCount = useKore(selectCartCount);
  const addToCart = useKore((s) => s.addToCart);
  const setCartOpen = useKore((s) => s.setCartOpen);

  const [addressOpen, setAddressOpen] = useState(false);
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { getMarketplaceProducts } = await import("@/app/actions/shop-actions");
        const data = await getMarketplaceProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (shopFilter === "all") return true;
    return p.tag?.toLowerCase().includes(shopFilter.toLowerCase());
  });

  // Agrupar produtos por sellerId
  const storesMap = new Map<string, { id: string; name: string; products: any[] }>();
  for (const p of filteredProducts) {
    if (!storesMap.has(p.sellerId)) {
      storesMap.set(p.sellerId, {
        id: p.sellerId,
        name: p.sellerName,
        products: [],
      });
    }
    storesMap.get(p.sellerId)!.products.push(p);
  }
  const groupedStores = Array.from(storesMap.values());

  const qtyOf = (productId: string) =>
    cart.find((l) => l.productId === productId)?.qty ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-50 dark:bg-[#121212] min-h-[100dvh] text-slate-900 dark:text-kore -mx-4 -mt-4 px-5 pt-8 overflow-y-auto pb-24 space-y-6 relative"
    >
      <header className="flex items-center justify-between">
        <button
          onClick={() => setAddressOpen(true)}
          className="text-left flex items-center gap-3 min-w-0 flex-1 bg-kore-bg border border-kore p-2.5 rounded-[20px] active:bg-kore-card transition-colors"
        >
          <div className="w-10 h-10 rounded-[14px] bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-inner">
            <MapPin size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-0.5">
              Entregar em
            </p>
            <p className="text-[15px] font-bold text-kore truncate flex items-center gap-1.5">
              {address}
              <ChevronRight size={14} className="text-zinc-500 flex-shrink-0" />
            </p>
          </div>
        </button>
      </header>

      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-5 px-5">
        {filters.map(({ key, label, Icon }) => {
          const active = shopFilter === key;
          return (
            <button
              key={key}
              onClick={() => setShopFilter(key)}
              className={`flex-shrink-0 inline-flex items-center gap-2 rounded-[20px] px-4 py-2.5 text-xs font-bold transition-all ${
                active
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  : "bg-kore-bg border border-kore text-kore hover:bg-kore-card"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-kore-muted">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="text-sm font-bold">Carregando catálogo...</p>
        </div>
      ) : groupedStores.length === 0 ? (
        <div className="text-center py-12 text-kore-muted">
          <p className="text-sm font-bold">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedStores.map((store) => (
            <motion.section
              key={store.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0 shadow-inner">
                  <StoreIcon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-kore text-lg truncate">{store.name}</p>
                  <p className="text-[11px] text-muted flex items-center gap-2 flex-wrap font-medium mt-0.5">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      4.9
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span>Parceiro Kore</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
                {store.products.map((p) => {
                  const qty = qtyOf(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      whileHover={{ y: -2 }}
                      className="flex-shrink-0 w-[160px] rounded-[24px] bg-kore-bg border border-kore p-3 relative shadow-sm"
                    >
                      <div className="relative aspect-square rounded-[18px] bg-kore-card flex items-center justify-center overflow-hidden shadow-inner mb-3">
                        {p.thumb.startsWith("http") ? (
                          <img src={p.thumb} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-6xl">{p.thumb}</span>
                        )}
                        <button
                          onClick={() => addToCart(p.id)}
                          className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)] active:scale-90 transition-transform"
                          aria-label="Adicionar ao carrinho"
                        >
                          <Plus size={20} strokeWidth={3} />
                        </button>
                        <AnimatePresence>
                          {qty > 0 && (
                            <motion.span
                              key="qty"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 18,
                              }}
                              className="absolute -top-1.5 -right-1.5 min-w-[24px] h-[24px] px-1 rounded-full bg-rose-500 text-kore text-[11px] font-bold flex items-center justify-center shadow-md border-2 border-[#121212]"
                            >
                              {qty}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="text-[13px] font-bold text-kore line-clamp-2 leading-tight min-h-[2.5rem]">
                        {p.name}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-[15px] font-extrabold text-kore tabular-nums">
                          {currency(p.price)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      )}

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button
            key="fab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-30 px-6 py-4 rounded-[24px] bg-emerald-500 text-black font-extrabold flex items-center gap-3 shadow-[0_0_20px_rgba(52,211,153,0.4)] active:scale-95 transition-transform"
          >
            <ShoppingCart size={20} strokeWidth={3} />
            VER CARRINHO
            <span className="rounded-full bg-black text-emerald-400 text-xs font-black px-2.5 py-1 tabular-nums ml-1">
              {cartCount}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AddressModal
        open={addressOpen}
        current={address}
        onClose={() => setAddressOpen(false)}
        onSave={setAddress}
      />
    </motion.div>
  );
}
