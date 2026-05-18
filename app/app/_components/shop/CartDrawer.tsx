"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { selectCartTotal, useKore } from "../store";

const currency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CartDrawer() {
  const open = useKore((s) => s.cartOpen);
  const setOpen = useKore((s) => s.setCartOpen);
  const cart = useKore((s) => s.cart);
  const products = useKore((s) => s.products);
  const stores = useKore((s) => s.stores);
  const addToCart = useKore((s) => s.addToCart);
  const decFromCart = useKore((s) => s.decFromCart);
  const removeFromCart = useKore((s) => s.removeFromCart);
  const clearCart = useKore((s) => s.clearCart);
  const subtotal = useKore(selectCartTotal);

  const deliveryFees = (() => {
    const storeIds = new Set(
      cart
        .map((l) => products.find((p) => p.id === l.productId)?.storeId)
        .filter((id): id is string => Boolean(id)),
    );
    return Array.from(storeIds).reduce((acc, sid) => {
      const st = stores.find((s) => s.id === sid);
      return acc + (st?.deliveryFee ?? 0);
    }, 0);
  })();
  const total = subtotal + deliveryFees;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-kore-card border-l border-kore shadow-2xl flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-kore flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-kore-emerald flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <p className="text-xs text-muted">Carrinho</p>
                  <h2 className="font-bold text-kore">Seu pedido</h2>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-2xl bg-kore-bg border border-kore flex items-center justify-center"
                aria-label="Fechar carrinho"
              >
                <X size={16} className="text-kore" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              <AnimatePresence initial={false}>
                {cart.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="font-bold text-kore">
                      Seu carrinho está vazio
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Adicione produtos clicando no{" "}
                      <span className="font-bold text-kore-emerald">+</span> dos
                      cards.
                    </p>
                  </motion.div>
                )}

                {cart.map((line) => {
                  const product = products.find((p) => p.id === line.productId);
                  if (!product) return null;
                  const store = stores.find((s) => s.id === product.storeId);
                  return (
                    <motion.div
                      key={line.productId}
                      layout
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      className="rounded-2xl border border-kore bg-kore-bg/40 p-3 flex gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl bg-kore-card border border-kore flex items-center justify-center text-3xl flex-shrink-0">
                        {product.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold truncate">
                          {store?.name}
                        </p>
                        <p className="font-semibold text-kore text-sm leading-snug truncate">
                          {product.name}
                        </p>
                        <p className="font-extrabold text-kore tabular-nums text-sm mt-0.5">
                          {currency(product.price)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-muted hover:text-rose-500 transition"
                          aria-label="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="inline-flex items-center rounded-full border border-kore bg-kore-card">
                          <button
                            onClick={() => decFromCart(product.id)}
                            className="w-7 h-7 flex items-center justify-center text-kore"
                            aria-label="Diminuir"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center font-bold text-kore tabular-nums text-sm">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => addToCart(product.id)}
                            className="w-7 h-7 flex items-center justify-center text-kore-emerald"
                            aria-label="Aumentar"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <footer className="border-t border-kore p-4 flex-shrink-0 space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{currency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span>Taxa de entrega</span>
                  <span className="tabular-nums">
                    {currency(deliveryFees)}
                  </span>
                </div>
                <div className="flex items-center justify-between font-extrabold text-kore text-base pt-1 border-t border-kore">
                  <span>Total</span>
                  <span className="tabular-nums">{currency(total)}</span>
                </div>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  alert("Stripe Checkout simulado: total " + currency(total));
                  clearCart();
                  setOpen(false);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-md shadow-emerald-500/30"
              >
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/20 font-bold tracking-wider">
                  STRIPE
                </span>
                Finalizar com Stripe
              </button>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full text-xs font-semibold text-muted hover:text-rose-500 transition"
                >
                  Esvaziar carrinho
                </button>
              )}
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
