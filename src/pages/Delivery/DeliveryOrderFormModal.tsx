import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useProducts } from "../../hooks/useProducts";
import { useCheckout } from "../../hooks/useOrders";
import { useStores } from "../../hooks/useStores";
import { useAuthStore } from "../../stores/authStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { PaymentMethod } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Row {
  productId: string;
  quantity: number;
}

export default function DeliveryOrderFormModal({ open, onClose }: Props) {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: stores } = useStores();
  const { data: productsResult } = useProducts({ active: true, pageSize: 200 });
  const currency = usePreferencesStore((s) => s.currency);
  const checkoutMutation = useCheckout();

  const [storeId, setStoreId] = useState(user?.storeId ?? "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [rows, setRows] = useState<Row[]>([{ productId: "", quantity: 1 }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStoreId(user?.storeId ?? "");
      setAddress("");
      setPhone("");
      setMethod("CASH");
      setRows([{ productId: "", quantity: 1 }]);
      setError(null);
    }
  }, [open, user?.storeId]);

  useEffect(() => {
    if (isAdmin && !storeId && stores && stores.length > 0) {
      setStoreId(stores[0].id);
    }
  }, [isAdmin, storeId, stores]);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const products = productsResult?.items ?? [];
  function effectivePriceCents(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;
    return product.activePromotion?.discountedPriceCents ?? product.priceCents;
  }
  const totalCents = rows.reduce((sum, r) => sum + effectivePriceCents(r.productId) * r.quantity, 0);

  async function handleSubmit() {
    setError(null);
    if (!address.trim() || !phone.trim()) {
      setError(t("delivery.addressPhoneRequired"));
      return;
    }
    const items = rows.filter((r) => r.productId && r.quantity > 0).map((r) => ({ productId: r.productId, quantity: r.quantity }));
    if (items.length === 0) {
      setError(t("delivery.requireAtLeastOneItem"));
      return;
    }
    try {
      await checkoutMutation.mutateAsync({
        storeId: isAdmin ? storeId || undefined : undefined,
        source: "DELIVERY",
        deliveryAddress: address,
        deliveryPhone: phone,
        items,
        payments: [{ method, amountCents: totalCents }],
      });
      onClose();
    } catch {
      setError(t("delivery.createFailed"));
    }
  }

  return (
    <Modal open={open} title={t("delivery.modalTitle")} onClose={onClose} widthClassName="max-w-2xl">
      <div className="mb-4 grid grid-cols-2 gap-3">
        {isAdmin && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t("delivery.store")}</label>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="input">
              {stores?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t("delivery.phone")}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
        </div>
      </div>

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("delivery.address")}</label>
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        rows={2}
        className="input mb-4"
      />

      <div className="mb-2 max-h-64 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 font-medium">{t("delivery.product")}</th>
              <th className="py-2 font-medium">{t("delivery.quantity")}</th>
              <th className="py-2 font-medium">{t("delivery.lineTotal")}</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-100">
                <td className="py-2 pr-2">
                  <select
                    value={row.productId}
                    onChange={(e) => updateRow(index, { productId: e.target.value })}
                    className="input"
                  >
                    <option value="">{t("delivery.selectProduct")}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateRow(index, { quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-20 rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="py-2 pr-2 text-slate-600">
                  {formatCurrency(effectivePriceCents(row.productId) * row.quantity, currency)}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => removeRow(index)}
                    className="touch-target text-red-500 hover:text-red-700"
                  >
                    {t("delivery.removeItem")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow} className="touch-target mb-4 text-sm text-blue-600 hover:underline">
        {t("delivery.addItem")}
      </button>

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("delivery.paymentMethod")}</label>
      <div className="mb-4 grid grid-cols-3 gap-2">
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

      <div className="mb-4 flex items-center justify-between text-base font-semibold text-slate-800">
        <span>{t("delivery.totalCost")}</span>
        <span>{formatCurrency(totalCents, currency)}</span>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={checkoutMutation.isPending}>
          {checkoutMutation.isPending ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </Modal>
  );
}
