import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useSuppliers } from "../../hooks/useSuppliers";
import { useStores } from "../../hooks/useStores";
import { useProducts } from "../../hooks/useProducts";
import { useCreatePurchaseOrder } from "../../hooks/usePurchaseOrders";
import { useAuthStore } from "../../stores/authStore";
import { useT } from "../../i18n/useT";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Row {
  productId: string;
  quantity: number;
  unitCost: string;
}

export default function PurchaseOrderFormModal({ open, onClose }: Props) {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: suppliers } = useSuppliers();
  const { data: stores } = useStores();
  const { data: productsResult } = useProducts({ active: true, pageSize: 200 });
  const createMutation = useCreatePurchaseOrder();

  const [supplierId, setSupplierId] = useState("");
  const [storeId, setStoreId] = useState(user?.storeId ?? "");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Row[]>([{ productId: "", quantity: 1, unitCost: "" }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSupplierId("");
      setStoreId(user?.storeId ?? "");
      setNote("");
      setRows([{ productId: "", quantity: 1, unitCost: "" }]);
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
    setRows((prev) => [...prev, { productId: "", quantity: 1, unitCost: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const products = productsResult?.items ?? [];
  const totalCents = rows.reduce((sum, r) => {
    const cost = Math.round((parseFloat(r.unitCost) || 0) * 100);
    return sum + cost * (r.quantity || 0);
  }, 0);

  async function handleSubmit() {
    setError(null);
    if (!supplierId) {
      setError(t("purchaseOrders.selectSupplier"));
      return;
    }
    const items = rows
      .filter((r) => r.productId && r.quantity > 0)
      .map((r) => ({
        productId: r.productId,
        quantity: r.quantity,
        unitCostCents: Math.round((parseFloat(r.unitCost) || 0) * 100),
      }));
    if (items.length === 0) {
      setError(t("purchaseOrders.requireAtLeastOneItem"));
      return;
    }
    try {
      await createMutation.mutateAsync({
        supplierId,
        storeId: isAdmin ? storeId || undefined : undefined,
        note: note || undefined,
        items,
      });
      onClose();
    } catch {
      setError(t("purchaseOrders.createFailed"));
    }
  }

  return (
    <Modal open={open} title={t("purchaseOrders.modalTitle")} onClose={onClose} widthClassName="max-w-2xl">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t("purchaseOrders.supplier")}</label>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input">
            <option value="">{t("purchaseOrders.selectSupplier")}</option>
            {suppliers?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t("purchaseOrders.store")}</label>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="input">
              {stores?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("purchaseOrders.noteOptional")}</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} className="input mb-4" />

      <div className="mb-2 max-h-64 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 font-medium">{t("purchaseOrders.product")}</th>
              <th className="py-2 font-medium">{t("purchaseOrders.quantity")}</th>
              <th className="py-2 font-medium">{t("purchaseOrders.unitCost")}</th>
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
                    <option value="">{t("purchaseOrders.selectProduct")}</option>
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
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.unitCost}
                    onChange={(e) => updateRow(index, { unitCost: e.target.value })}
                    className="w-24 rounded border border-slate-300 px-2 py-1"
                  />
                </td>
                <td className="py-2">
                  <button
                    onClick={() => removeRow(index)}
                    className="touch-target text-red-500 hover:text-red-700"
                  >
                    {t("purchaseOrders.removeItem")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow} className="touch-target mb-4 text-sm text-blue-600 hover:underline">
        {t("purchaseOrders.addItem")}
      </button>

      <div className="mb-4 flex items-center justify-between text-base font-semibold text-slate-800">
        <span>{t("purchaseOrders.totalCost")}</span>
        <span>{(totalCents / 100).toFixed(2)}</span>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </Modal>
  );
}
