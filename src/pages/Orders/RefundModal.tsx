import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useCreateRefund } from "../../hooks/useRefunds";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { Order } from "../../types";

interface Props {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function RefundModal({ open, order, onClose }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const refundMutation = useCreateRefund();
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  useEffect(() => {
    if (open) {
      setQuantities({});
      setReason("");
      setError(null);
    }
  }, [open]);

  if (!order) return null;

  const refundableItems = order.items.map((item) => ({
    ...item,
    remaining: item.quantity - item.refundedQuantity,
  }));

  function setQty(orderItemId: string, value: number, max: number) {
    const clamped = Math.max(0, Math.min(max, value));
    setQuantities((q) => ({ ...q, [orderItemId]: clamped }));
  }

  const totalRefundCents = refundableItems.reduce((sum, item) => {
    const qty = quantities[item.id] ?? 0;
    return sum + qty * item.unitPriceCents;
  }, 0);

  const hasSelection = Object.values(quantities).some((q) => q > 0);

  async function handleSubmit() {
    if (!order) return;
    setError(null);
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity }));

    if (items.length === 0) {
      setError(t("refund.selectAtLeastOne"));
      return;
    }

    try {
      await refundMutation.mutateAsync({ orderId: order.id, items, reason: reason || undefined });
      onClose();
    } catch {
      setError(t("refund.refundFailed"));
    }
  }

  return (
    <Modal
      open={open}
      title={t("refund.title", { orderNo: order.orderNo })}
      onClose={onClose}
      widthClassName="max-w-lg"
    >
      <div className="mb-4 max-h-64 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 font-medium">{t("refund.product")}</th>
              <th className="py-2 font-medium">{t("refund.refundableQty")}</th>
              <th className="py-2 font-medium">{t("refund.refundQty")}</th>
            </tr>
          </thead>
          <tbody>
            {refundableItems.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="py-2 text-slate-700">{item.productNameSnapshot}</td>
                <td className="py-2 text-slate-500">{item.remaining}</td>
                <td className="py-2">
                  <input
                    type="number"
                    min={0}
                    max={item.remaining}
                    disabled={item.remaining === 0}
                    value={quantities[item.id] ?? 0}
                    onChange={(e) => setQty(item.id, parseInt(e.target.value, 10) || 0, item.remaining)}
                    className="w-20 rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("refund.reasonOptional")}</label>
      <input value={reason} onChange={(e) => setReason(e.target.value)} className="input mb-4" />

      <div className="mb-4 flex items-center justify-between text-base font-semibold text-slate-800">
        <span>{t("refund.refundAmount")}</span>
        <span>{formatCurrency(totalRefundCents, currency)}</span>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("refund.cancel")}
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          disabled={!hasSelection || refundMutation.isPending}
        >
          {refundMutation.isPending ? t("refund.processing") : t("refund.confirmRefund")}
        </Button>
      </div>
    </Modal>
  );
}
