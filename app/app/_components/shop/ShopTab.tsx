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
} from "lucide-react";
import { useState } from "react";
import { selectCartCount, useKore } from "../store";
import { AddressModal } from "./AddressModal";

const currency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const filters: {
  key: "all" | "supplements" | "fresh" | "pharmacy";
  label: string;
  Icon: typeof Sparkles;
}[] = [
  { key: "all", label: "Todos", Icon: Sparkles },
  { key: "supplements", label: "Suplementos", Icon: Sparkles },
  { key: "fresh", label: "Frescos", Icon: Apple },
  { key: "pharmacy", label: "Farmácia", Icon: Pill },
];

export function ShopTab() {
  const address = useKore((s) => s.address);
  const setAddress = useKore((s) => s.setAddress);
  const stores = useKore((s) => s.stores);
  const products = useKore((s) => s.products);
  const cart = useKore((s) => s.cart);
  const cartCount = useKore(selectCartCount);
  const addToCart = useKore((s) => s.addToCart);
  const setCartOpen = useKore((s) => s.setCartOpen);
  const shopFilter = useKore((s) => s.shopFilter);
  const setShopFilter = useKore((s) => s.setShopFilter);

  const [addressOpen, setAddressOpen] = useState(false);
  const filteredStores =
    shopFilter === "all"
      ? stores
      : stores.filter((s) => s.category === shopFilter);

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

      <div className="space-y-8">
        {filteredStores.map((store) => {
          const storeProducts = products.filter((p) => p.storeId === store.id);
          return (
            <motion.section
              key={store.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-[20px] bg-kore-bg border border-kore flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                  {store.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-kore text-lg truncate">{store.name}</p>
                  <p className="text-[11px] text-muted flex items-center gap-2 flex-wrap font-medium mt-0.5">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded-md">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {store.rating.toFixed(1)}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span>{store.distanceKm.toFixed(1)} km</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-emerald-400 font-bold">
                      {currency(store.deliveryFee)}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span>{store.etaMin} min</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
                {storeProducts.map((p) => {
                  const qty = qtyOf(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      whileHover={{ y: -2 }}
                      className="flex-shrink-0 w-[160px] rounded-[24px] bg-kore-bg border border-kore p-3 relative shadow-sm"
                    >
                      <div className="relative aspect-square rounded-[18px] bg-kore-card flex items-center justify-center text-6xl shadow-inner mb-3">
                        {p.image}
                        {p.promo && (
                          <span className="absolute top-2 left-2 text-[10px] font-extrabold rounded-lg bg-emerald-500 text-black px-2 py-1 shadow-md">
                            {p.promo}
                          </span>
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
                        {p.oldPrice && (
                          <span className="text-[11px] font-bold text-zinc-500 line-through tabular-nums">
                            {currency(p.oldPrice)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

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
