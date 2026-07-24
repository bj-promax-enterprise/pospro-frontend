import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useStockIn } from "../../hooks/useInventory";
import { useProducts } from "../../hooks/useProducts";
import { useT } from "../../i18n/useT";
import type { Product } from "../../types";

interface Props {
  open: boolean;
  initialProduct: Product | null;
  storeId?: string;
  onClose: () => void;
}

export default function StockInModal({ open, initialProduct, storeId, onClose }: Props) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data } = useProducts({ active: true, pageSize: 200 });
  const stockInMutation = useStockIn();
  const t = useT();

  useEffect(() => {
    if (!open) return;
    setProductId(initialProduct?.id ?? "");
    setQuantity("");
    setNote("");
    setError(null);
  }, [open, initialProduct]);

  async function handleSubmit() {
    setError(null);
    const qty = parseInt(quantity, 10);
    if (!productId || !qty || qty <= 0) {
      setError(t("inventory.fillCorrectQuantity"));
      return;
    }
    try {
      await stockInMutation.mutateAsync({ productId, quantity: qty, note: note || undefined, storeId });
      onClose();
    } catch {
      setError(t("inventory.stockInFailed"));
    }
  }

  return (
    <Modal open={open} title={t("inventory.modalTitle")} onClose={onClose}>
      <label className="mb-1 block text-sm font-medium text-slate-600">{t("inventory.selectProductLabel")}</label>
      <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input mb-4">
        <option value="">{t("inventory.pleaseSelectProduct")}</option>
        {data?.items.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.sku})
          </option>
        ))}
      </select>

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("inventory.stockInQuantity")}</label>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="input mb-4"
      />

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("inventory.noteOptional")}</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} className="input mb-4" />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={stockInMutation.isPending}>
          {stockInMutation.isPending ? t("common.submitting") : t("inventory.confirmStockIn")}
        </Button>
      </div>
    </Modal>
  );
}
