import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { usePublicOrderStatus, usePublicProducts, usePublicTables, useSubmitPublicOrder } from "../../hooks/usePublicOrder";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { resolveImageUrl } from "../../utils/apiOrigin";
import { useT } from "../../i18n/useT";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import type { PublicProduct } from "../../api/public.api";

interface CartLine {
  productId: string;
  name: string;
  unit: string;
  priceCents: number;
  effectivePriceCents: number;
  quantity: number;
}

export default function PublicOrderPage() {
  const { storeId = "" } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const urlTableLabel = searchParams.get("table") || undefined;
  const { data, isLoading, isError } = usePublicProducts(storeId);
  const submitMutation = useSubmitPublicOrder(storeId);
  const t = useT();
  const currency = usePreferencesStore((s) => s.currency);

  const [diningOption, setDiningOption] = useState<"DINE_IN" | "TAKEAWAY" | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const needsTableChoice = diningOption === "DINE_IN" && !urlTableLabel;
  const { data: tables } = usePublicTables(storeId, needsTableChoice);
  const tableLabel =
    diningOption === "DINE_IN" ? urlTableLabel ?? selectedTable ?? undefined : undefined;

  const [cart, setCart] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    let hasUncategorized = false;
    data?.items.forEach((p) => {
      if (p.category) map.set(p.category.id, p.category.name);
      else hasUncategorized = true;
    });
    const list = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    if (hasUncategorized) list.push({ id: "uncategorized", name: t("publicOrder.uncategorized") });
    return list;
  }, [data, t]);

  const visibleItems = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === "all") return data.items;
    if (selectedCategory === "uncategorized") return data.items.filter((p) => !p.category);
    return data.items.filter((p) => p.category?.id === selectedCategory);
  }, [data, selectedCategory]);
  const [submittedOrder, setSubmittedOrder] = useState<{
    id: string;
    orderNo: string;
    pickupNo: string | null;
  } | null>(null);
  const statusQuery = usePublicOrderStatus(submittedOrder?.id ?? null);
  const liveStatus = statusQuery.data?.status ?? "PENDING";

  const totalCents = cart.reduce((sum, l) => sum + l.effectivePriceCents * l.quantity, 0);

  function addToCart(product: PublicProduct) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          priceCents: product.priceCents,
          effectivePriceCents: product.activePromotion?.discountedPriceCents ?? product.priceCents,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(productId: string, qty: number) {
    setCart((prev) =>
      qty <= 0 ? prev.filter((l) => l.productId !== productId) : prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l))
    );
  }

  async function handleSubmit() {
    setError(null);
    try {
      const order = await submitMutation.mutateAsync({
        items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        tableLabel,
        payments: [],
      });
      setSubmittedOrder({
        id: order.id,
        orderNo: order.orderNo,
        pickupNo: order.pickupNo,
      });
      setCart([]);
      setCartOpen(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? t("publicOrder.submitFailed");
      setError(message);
    }
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <p className="text-slate-500">{t("publicOrder.storeNotFound")}</p>
      </div>
    );
  }

  if (diningOption === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <p className="mb-6 text-lg font-semibold text-slate-800">{t("publicOrder.diningOptionPrompt")}</p>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={() => setDiningOption("DINE_IN")}>
              {t("publicOrder.dineIn")}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={() => setDiningOption("TAKEAWAY")}
            >
              {t("publicOrder.takeaway")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (needsTableChoice && !selectedTable) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <p className="mb-4 text-lg font-semibold text-slate-800">{t("publicOrder.selectTablePrompt")}</p>
          {tables && tables.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {tables.map((tbl) => (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl.label)}
                  className="touch-target rounded-lg border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                >
                  {tbl.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">{t("publicOrder.noTables")}</p>
          )}
          <button
            onClick={() => setDiningOption(null)}
            className="touch-target mt-6 text-sm text-slate-400 hover:text-slate-600"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    );
  }

  if (submittedOrder) {
    const isReady = liveStatus === "READY";
    const isCompleted = liveStatus === "COMPLETED";
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-4 text-5xl">{isReady ? "🔔" : isCompleted ? "✅" : "🧾"}</div>
          {tableLabel ? (
            <>
              <p className="mb-1 text-sm text-slate-500">{t("publicOrder.tableLabelDisplay")}</p>
              <p className="mb-4 text-4xl font-extrabold tracking-widest text-slate-800">{tableLabel}</p>
            </>
          ) : (
            submittedOrder.pickupNo && (
              <>
                <p className="mb-1 text-sm text-slate-500">{t("publicOrder.pickupNoLabel")}</p>
                <p
                  className={`mb-4 text-6xl font-extrabold tracking-widest ${
                    isReady ? "text-red-600" : "text-slate-800"
                  }`}
                >
                  {submittedOrder.pickupNo}
                </p>
              </>
            )
          )}
          <p
            className={`mb-2 text-lg font-semibold ${isReady ? "text-red-600" : "text-slate-700"}`}
          >
            {t(`publicOrder.status${liveStatus.charAt(0)}${liveStatus.slice(1).toLowerCase()}`)}
          </p>
          <p className="mb-1 text-slate-500">{t("publicOrder.orderNoLabel", { orderNo: submittedOrder.orderNo })}</p>
          <p className="mb-6 text-sm text-slate-500">
            {tableLabel ? t("publicOrder.tableServiceNote") : t("publicOrder.thankYou")}
          </p>
          <Button className="w-full" onClick={() => setSubmittedOrder(null)}>
            {t("publicOrder.newOrder")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden bg-slate-50">
      <div className="flex-shrink-0 bg-white px-4 py-5 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">
          {isLoading ? "..." : t("publicOrder.welcome", { storeName: data?.store.name ?? "" })}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("publicOrder.subtitle")}</p>
      </div>

      {isLoading ? (
        <p className="p-6 text-center text-slate-400">{t("common.loading")}</p>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {categories.length > 0 && (
            <nav className="w-20 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`touch-target block w-full px-2 py-3 text-center text-xs font-medium ${
                  selectedCategory === "all"
                    ? "border-l-2 border-blue-600 bg-blue-50 text-blue-600"
                    : "border-l-2 border-transparent text-slate-500"
                }`}
              >
                {t("publicOrder.allCategories")}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`touch-target block w-full px-2 py-3 text-center text-xs font-medium ${
                    selectedCategory === c.id
                      ? "border-l-2 border-blue-600 bg-blue-50 text-blue-600"
                      : "border-l-2 border-transparent text-slate-500"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </nav>
          )}
          <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 p-3 pb-40">
          {visibleItems.map((product) => {
            const line = cart.find((l) => l.productId === product.id);
            const imageUrl = resolveImageUrl(product.imageUrl);
            return (
              <div
                key={product.id}
                className="card-table flex flex-col"
              >
                {imageUrl && (
                  <div className="aspect-square w-full overflow-hidden bg-slate-50">
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-medium text-slate-800">{product.name}</p>
                  {product.activePromotion ? (
                    <p className="mt-1 mb-3 flex items-baseline gap-2">
                      <span className="text-sm text-slate-400 line-through">
                        {formatCurrency(product.priceCents, currency)}
                      </span>
                      <span className="text-lg font-semibold text-red-600">
                        {formatCurrency(product.activePromotion.discountedPriceCents, currency)}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 mb-3 text-lg font-semibold text-blue-600">
                      {formatCurrency(product.priceCents, currency)}
                    </p>
                  )}
                  <div className="mt-auto">
                  {line ? (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => updateQty(product.id, line.quantity - 1)}
                        className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600"
                      >
                        −
                      </button>
                      <span className="font-medium">{line.quantity}</span>
                      <button
                        onClick={() => updateQty(product.id, line.quantity + 1)}
                        className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <Button size="md" className="w-full" onClick={() => addToCart(product)}>
                      +
                    </Button>
                  )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md p-4">
          <button
            onClick={() => setCartOpen(true)}
            className="touch-target flex w-full items-center justify-between rounded-2xl bg-blue-600 px-5 py-4 text-white shadow-lg shadow-blue-900/20"
          >
            <span className="flex items-center gap-2 font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
                {cart.reduce((sum, l) => sum + l.quantity, 0)}
              </span>
              {t("publicOrder.viewCart")}
            </span>
            <span className="font-bold">{formatCurrency(totalCents, currency)}</span>
          </button>
        </div>
      )}

      <Modal open={cartOpen} title={t("publicOrder.viewCart")} onClose={() => setCartOpen(false)}>
        <ul className="mb-3 max-h-64 divide-y divide-slate-100 overflow-y-auto">
          {cart.map((line) => (
            <li key={line.productId} className="flex items-center justify-between py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{line.name}</p>
                <p className="text-xs text-slate-500">{formatCurrency(line.effectivePriceCents, currency)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(line.productId, line.quantity - 1)}
                  className="touch-target flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-600"
                >
                  −
                </button>
                <span className="w-5 text-center font-medium">{line.quantity}</span>
                <button
                  onClick={() => updateQty(line.productId, line.quantity + 1)}
                  className="touch-target flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-600"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mb-3 flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-800">
          <span>{t("cart.total")}</span>
          <span>{formatCurrency(totalCents, currency)}</span>
        </div>
        <p className="mb-3 text-center text-xs text-slate-400">{t("publicOrder.payLaterNote")}</p>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <Button
          size="lg"
          className="w-full"
          disabled={submitMutation.isPending || cart.length === 0}
          onClick={handleSubmit}
        >
          {submitMutation.isPending ? t("publicOrder.submitting") : t("publicOrder.submit")}
        </Button>
      </Modal>
      </div>
    </div>
  );
}
