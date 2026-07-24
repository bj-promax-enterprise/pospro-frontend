import { useEffect, useState } from "react";
import BarcodeScanInput from "../../components/pos/BarcodeScanInput";
import ProductGrid from "../../components/pos/ProductGrid";
import CartPanel from "../../components/pos/CartPanel";
import PaymentPanel from "../../components/pos/PaymentPanel";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { cartSubtotalCents, useCartStore } from "../../stores/cartStore";
import { useProductByBarcode } from "../../hooks/useProducts";
import { useCheckout } from "../../hooks/useOrders";
import { useStores } from "../../hooks/useStores";
import { useAuthStore } from "../../stores/authStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import ReceiptView from "../../components/pos/ReceiptView";
import type { PaymentMethod } from "../../types";
import type { Order } from "../../types";

export default function CheckoutPage() {
  const [search, setSearch] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [tenderedCents, setTenderedCents] = useState(0);
  const [receipt, setReceipt] = useState<Order | null>(null);
  const t = useT();
  const currency = usePreferencesStore((s) => s.currency);

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: stores } = useStores();
  const [storeId, setStoreId] = useState<string>(user?.storeId ?? "");

  useEffect(() => {
    if (isAdmin && !storeId && stores && stores.length > 0) {
      setStoreId(stores[0].id);
    }
  }, [isAdmin, storeId, stores]);

  const { items, discountCents, addItem, clear } = useCartStore();
  const barcodeMutation = useProductByBarcode();
  const checkoutMutation = useCheckout();

  const subtotalCents = cartSubtotalCents(items);
  const totalCents = Math.max(0, subtotalCents - discountCents);

  function handleScan(barcode: string) {
    setScanError(null);
    barcodeMutation.mutate(barcode, {
      onSuccess: (product) => addItem(product),
      onError: () => setScanError(t("checkout.notFoundBarcode", { barcode })),
    });
  }

  async function handleConfirm(method: PaymentMethod) {
    try {
      const order = await checkoutMutation.mutateAsync({
        storeId: isAdmin ? storeId || undefined : undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        discountCents,
        payments: [{ method, amountCents: totalCents }],
      });
      setReceipt(order);
      clear();
      setTenderedCents(0);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? t("checkout.checkoutFailed");
      setScanError(message);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="border-b border-slate-200 bg-white p-4">
          {isAdmin && stores && stores.length > 0 && (
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="input mb-2 max-w-xs"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <BarcodeScanInput onScan={handleScan} onSearchChange={setSearch} errorMessage={scanError} />
        </div>
        <ProductGrid search={search} onSelect={(product) => addItem(product)} />
      </div>

      <div className="flex w-96 flex-shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white">
        <CartPanel />
        <PaymentPanel
          totalCents={totalCents}
          disabled={items.length === 0}
          submitting={checkoutMutation.isPending}
          onConfirm={handleConfirm}
          tenderedCents={tenderedCents}
          onTenderedChange={setTenderedCents}
        />
      </div>

      <Modal open={!!receipt} title={t("checkout.receiptTitle")} onClose={() => setReceipt(null)}>
        {receipt && (
          <div className="text-sm text-slate-700">
            <p className="mb-2">{t("checkout.orderNo", { orderNo: receipt.orderNo })}</p>
            <ul className="mb-3 divide-y divide-slate-100">
              {receipt.items.map((item) => (
                <li key={item.id} className="flex justify-between py-1">
                  <span>
                    {item.productNameSnapshot} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.subtotalCents, currency)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
              <span>{t("checkout.total")}</span>
              <span>{formatCurrency(receipt.totalCents, currency)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
                {t("orderDetail.printReceipt")}
              </Button>
              <Button className="flex-1" onClick={() => setReceipt(null)}>
                {t("checkout.continueCheckout")}
              </Button>
            </div>
            <ReceiptView order={receipt} />
          </div>
        )}
      </Modal>
    </div>
  );
}
