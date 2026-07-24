import { useState } from "react";
import Button from "../../components/ui/Button";
import { usePurchaseOrders } from "../../hooks/usePurchaseOrders";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import PurchaseOrderFormModal from "./PurchaseOrderFormModal";
import PurchaseOrderDetailModal from "./PurchaseOrderDetailModal";
import type { PurchaseOrder } from "../../types";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  RECEIVED: "bg-green-100 text-green-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: purchaseOrders, isLoading } = usePurchaseOrders(statusFilter || undefined);
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);

  function orderTotal(po: PurchaseOrder) {
    return po.items.reduce((sum, i) => sum + i.unitCostCents * i.quantity, 0);
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("purchaseOrders.title")}</h1>
        <Button onClick={() => setFormOpen(true)}>{t("purchaseOrders.newPurchaseOrder")}</Button>
      </div>

      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input max-w-xs">
          <option value="">{t("purchaseOrders.status")}</option>
          <option value="PENDING">{t("purchaseOrders.statusLabel.PENDING")}</option>
          <option value="RECEIVED">{t("purchaseOrders.statusLabel.RECEIVED")}</option>
          <option value="CANCELLED">{t("purchaseOrders.statusLabel.CANCELLED")}</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("purchaseOrders.poNumber")}</th>
                <th className="px-4 py-3 font-medium">{t("purchaseOrders.supplier")}</th>
                <th className="px-4 py-3 font-medium">{t("purchaseOrders.store")}</th>
                <th className="px-4 py-3 font-medium">{t("purchaseOrders.createdAt")}</th>
                <th className="px-4 py-3 font-medium">{t("purchaseOrders.totalCost")}</th>
                <th className="px-4 py-3 font-medium">{t("purchaseOrders.status")}</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders?.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => setSelected(po)}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-700">{po.poNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{po.supplier.name}</td>
                  <td className="px-4 py-3 text-slate-500">{po.store.name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(po.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {formatCurrency(orderTotal(po), currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${STATUS_CLASS[po.status] ?? ""}`}>
                      {t(`purchaseOrders.statusLabel.${po.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {purchaseOrders?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    {t("purchaseOrders.noPurchaseOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <PurchaseOrderFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <PurchaseOrderDetailModal purchaseOrder={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
