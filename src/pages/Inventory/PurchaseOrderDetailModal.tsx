import { useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useCancelPurchaseOrder, useReceivePurchaseOrder } from "../../hooks/usePurchaseOrders";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { PurchaseOrder } from "../../types";

interface Props {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
}

export default function PurchaseOrderDetailModal({ purchaseOrder, onClose }: Props) {
  const t = useT();
  const currency = usePreferencesStore((s) => s.currency);
  const receiveMutation = useReceivePurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const [error, setError] = useState<string | null>(null);

  if (!purchaseOrder) return null;

  const totalCents = purchaseOrder.items.reduce((sum, i) => sum + i.unitCostCents * i.quantity, 0);

  async function handleReceive() {
    if (!purchaseOrder) return;
    if (!confirm(t("purchaseOrders.confirmReceive"))) return;
    setError(null);
    try {
      await receiveMutation.mutateAsync(purchaseOrder.id);
      onClose();
    } catch {
      setError(t("purchaseOrders.receiveFailed"));
    }
  }

  async function handleCancel() {
    if (!purchaseOrder) return;
    if (!confirm(t("purchaseOrders.confirmCancel"))) return;
    setError(null);
    try {
      await cancelMutation.mutateAsync(purchaseOrder.id);
      onClose();
    } catch {
      setError(t("purchaseOrders.cancelFailed"));
    }
  }

  return (
    <Modal
      open={!!purchaseOrder}
      title={t("purchaseOrders.detailTitle", { poNumber: purchaseOrder.poNumber })}
      onClose={onClose}
      widthClassName="max-w-lg"
    >
      <div className="mb-3 text-sm text-slate-600">
        <p>
          {t("purchaseOrders.supplier")}: {purchaseOrder.supplier.name}
        </p>
        <p>
          {t("purchaseOrders.store")}: {purchaseOrder.store.name}
        </p>
      </div>

      <div className="mb-4 max-h-64 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 font-medium">{t("purchaseOrders.product")}</th>
              <th className="py-2 font-medium">{t("purchaseOrders.quantity")}</th>
              <th className="py-2 font-medium">{t("purchaseOrders.unitCost")}</th>
              <th className="py-2 font-medium">{t("purchaseOrders.lineTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrder.items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="py-2 text-slate-700">{item.product.name}</td>
                <td className="py-2 text-slate-500">{item.quantity}</td>
                <td className="py-2 text-slate-500">{formatCurrency(item.unitCostCents, currency)}</td>
                <td className="py-2 text-slate-700">
                  {formatCurrency(item.unitCostCents * item.quantity, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4 flex items-center justify-between text-base font-semibold text-slate-800">
        <span>{t("purchaseOrders.totalCost")}</span>
        <span>{formatCurrency(totalCents, currency)}</span>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("purchaseOrders.close")}
        </Button>
        {purchaseOrder.status === "PENDING" && (
          <>
            <Button variant="danger" onClick={handleCancel} disabled={cancelMutation.isPending}>
              {t("purchaseOrders.cancel")}
            </Button>
            <Button onClick={handleReceive} disabled={receiveMutation.isPending}>
              {t("purchaseOrders.receive")}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
