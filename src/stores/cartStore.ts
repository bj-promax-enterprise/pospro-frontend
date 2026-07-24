import { create } from "zustand";
import type { Product } from "../types";

export interface CartItem {
  productId: string;
  name: string;
  unit: string;
  priceCents: number;
  effectivePriceCents: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  discountCents: number;
  addItem: (product: Product, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  setDiscountCents: (cents: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  discountCents: 0,
  addItem: (product, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            unit: product.unit,
            priceCents: product.priceCents,
            effectivePriceCents: product.activePromotion?.discountedPriceCents ?? product.priceCents,
            quantity: qty,
          },
        ],
      };
    }),
  updateQty: (productId, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.productId !== productId)
          : state.items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
    })),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  setDiscountCents: (cents) => set({ discountCents: Math.max(0, cents) }),
  clear: () => set({ items: [], discountCents: 0 }),
}));

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.effectivePriceCents * i.quantity, 0);
}
