import { cartSubtotalCents, useCartStore } from "../../stores/cartStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { CURRENCIES, formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";

export default function CartPanel() {
  const { items, discountCents, updateQty, removeItem, setDiscountCents } = useCartStore();
  const subtotalCents = cartSubtotalCents(items);
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const currency = usePreferencesStore((s) => s.currency);
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "";
  const t = useT();

  return (
    <div className="flex flex-col">
      <div>
        {items.length === 0 ? (
          <p className="p-4 text-center text-slate-400">{t("cart.empty")}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.effectivePriceCents < item.priceCents ? (
                      <>
                        <span className="mr-1 text-slate-400 line-through">
                          {formatCurrency(item.priceCents, currency)}
                        </span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(item.effectivePriceCents, currency)}
                        </span>
                      </>
                    ) : (
                      formatCurrency(item.priceCents, currency)
                    )}{" "}
                    / {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="touch-target ml-1 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
          <span>{t("cart.subtotal")}</span>
          <span>{formatCurrency(subtotalCents, currency)}</span>
        </div>
        <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
          <span>
            {t("cart.discount")} ({currencySymbol})
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discountCents === 0 ? "" : (discountCents / 100).toString()}
            onChange={(e) => setDiscountCents(Math.round((parseFloat(e.target.value) || 0) * 100))}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-right"
          />
        </div>
        <div className="flex items-center justify-between text-lg font-bold text-slate-800">
          <span>{t("cart.total")}</span>
          <span>{formatCurrency(totalCents, currency)}</span>
        </div>
      </div>
    </div>
  );
}
