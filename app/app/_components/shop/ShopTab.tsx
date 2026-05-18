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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 pb-24 relative"
    >
      <header className="flex items-center justify-between">
        <button
          onClick={() => setAddressOpen(true)}
          className="text-left flex items-center gap-2 min-w-0 flex-1"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-kore-emerald flex-shrink-0">
            <MapPin size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">
              Entregar em
            </p>
            <p className="text-sm font-bold text-kore truncate flex items-center gap-1">
              {address}
              <ChevronRight size={14} className="text-muted flex-shrink-0" />
            </p>
          </div>
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {filters.map(({ key, label, Icon }) => {
          const active = shopFilter === key;
          return (
            <button
              key={key}
              onClick={() => setShopFilter(key)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold border transition ${
                active
                  ? "bg-kore-emerald text-white border-transparent shadow-sm shadow-emerald-500/30"
                  : "bg-kore-card border-kore text-kore hover:border-emerald-300"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        {filteredStores.map((store) => {
          const storeProducts = products.filter((p) => p.storeId === store.id);
          return (
            <motion.section
              key={store.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3 px-1">
                <div className="w-12 h-12 rounded-2xl bg-kore-card border border-kore flex items-center justify-center text-2xl flex-shrink-0">
                  {store.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-kore truncate">{store.name}</p>
                  <p className="text-xs text-muted flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                      <Star size={12} className="fill-amber-500" />
                      {store.rating.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span>{store.distanceKm.toFixed(1)} km</span>
                    <span>·</span>
                    <span className="text-kore-emerald font-semibold">
                      {currency(store.deliveryFee)}
                    </span>
                    <span>·</span>
                    <span>{store.etaMin} min</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                {storeProducts.map((p) => {
                  const qty = qtyOf(p.id);
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      whileHover={{ y: -2 }}
                      className="flex-shrink-0 w-[150px] rounded-2xl bg-kore-card border border-kore p-2.5 relative"
                    >
                      <div className="relative aspect-square rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-5xl">
                        {p.image}
                        {p.promo && (
                          <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold rounded-md bg-kore-emerald text-white px-1.5 py-0.5 shadow">
                            {p.promo}
                          </span>
                        )}
                        <button
                          onClick={() => addToCart(p.id)}
                          className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full bg-kore-emerald text-white flex items-center justify-center shadow-md shadow-emerald-500/40 active:scale-90 transition"
                          aria-label="Adicionar ao carrinho"
                        >
                          <Plus size={16} strokeWidth={3} />
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
                              className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow"
                            >
                              {qty}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-kore line-clamp-2 leading-snug min-h-[2.25rem]">
                        {p.name}
                      </p>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-kore tabular-nums">
                          {currency(p.price)}
                        </span>
                        {p.oldPrice && (
                          <span className="text-[11px] text-muted line-through tabular-nums">
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
            className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-30 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold flex items-center gap-2 shadow-xl shadow-emerald-500/40 active:scale-95 transition"
          >
            <ShoppingCart size={18} />
            Ver carrinho
            <span className="rounded-full bg-white/25 text-xs font-bold px-2 py-0.5 tabular-nums">
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
