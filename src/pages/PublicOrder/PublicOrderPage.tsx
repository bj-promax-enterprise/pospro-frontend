import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { usePublicOrderStatus, usePublicProducts, useSubmitPublicOrder } from "../../hooks/usePublicOrder";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency, CURRENCIES } from "../../utils/currency";
import { resolveImageUrl } from "../../utils/apiOrigin";
import { useT } from "../../i18n/useT";
import Button from "../../components/ui/Button";
import type { PublicProduct } from "../../api/public.api";
import type { PaymentMethod } from "../../types";

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
  const tableLabel = searchParams.get("table") || undefined;
  const { data, isLoading, isError } = usePublicProducts(storeId);
  const submitMutation = useSubmitPublicOrder(storeId);
  const t = useT();
  const currency = usePreferencesStore((s) => s.currency);
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "";

  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("QR");
  const [error, setError] = useState<string | null>(null);
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
        payments: [{ method, amountCents: totalCents }],
      });
      setSubmittedOrder({
        id: order.id,
        orderNo: order.orderNo,
        pickupNo: order.pickupNo,
      });
      setCart([]);
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

  if (submittedOrder) {
    const isReady = liveStatus === "READY";
    const isCompleted = liveStatus === "COMPLETED";
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-4 text-5xl">{isReady ? "🔔" : isCompleted ? "✅" : "🧾"}</div>
          {submittedOrder.pickupNo && (
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
          )}
          <p
            className={`mb-2 text-lg font-semibold ${isReady ? "text-red-600" : "text-slate-700"}`}
          >
            {t(`publicOrder.status${liveStatus.charAt(0)}${liveStatus.slice(1).toLowerCase()}`)}
          </p>
          <p className="mb-1 text-slate-500">{t("publicOrder.orderNoLabel", { orderNo: submittedOrder.orderNo })}</p>
          <p className="mb-6 text-sm text-slate-500">{t("publicOrder.thankYou")}</p>
          <Button className="w-full" onClick={() => setSubmittedOrder(null)}>
            {t("publicOrder.newOrder")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-40">
      <div className="mx-auto max-w-md bg-slate-50 min-h-screen">
      <div className="bg-white px-4 py-5 shadow-sm">
        <h1 className="text-lg font-bold text-slate-800">
          {isLoading ? "..." : t("publicOrder.welcome", { storeName: data?.store.name ?? "" })}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("publicOrder.subtitle")}</p>
      </div>

      {isLoading ? (
        <p className="p-6 text-center text-slate-400">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {data?.items.map((product) => {
            const line = cart.find((l) => l.productId === product.id);
            const imageUrl = resolveImageUrl(product.imageUrl);
            return (
              <div
                key={product.id}
                className="card-table flex h-full flex-col"
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
      )}

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between text-lg font-bold text-slate-800">
            <span>{t("cart.total")}</span>
            <span>{formatCurrency(totalCents, currency)}</span>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {(["CASH", "CARD", "QR"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`touch-target rounded-lg py-2.5 text-sm font-semibold ${
                  method === m ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {t(`payment.${m.toLowerCase()}`)}
              </button>
            ))}
          </div>
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          <Button size="lg" className="w-full" disabled={submitMutation.isPending} onClick={handleSubmit}>
            {submitMutation.isPending
              ? t("publicOrder.submitting")
              : `${t("publicOrder.submit")} ${currencySymbol}${(totalCents / 100).toFixed(2)}`}
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
