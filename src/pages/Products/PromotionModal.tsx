import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { usePromotions, useCreatePromotion, useUpdatePromotion } from "../../hooks/usePromotions";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { Product, PromotionDiscountType } from "../../types";

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

export default function PromotionModal({ open, product, onClose }: Props) {
  const { data: promotions } = usePromotions(product?.id);
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  const [discountType, setDiscountType] = useState<PromotionDiscountType>("PERCENT");
  const [value, setValue] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDiscountType("PERCENT");
      setValue("");
      setStartAt("");
      setEndAt("");
      setError(null);
    }
  }, [open, product?.id]);

  if (!product) return null;

  const activePromotion = promotions?.find((p) => p.active) ?? null;
  const history = promotions?.filter((p) => !p.active) ?? [];

  async function handleCreate() {
    if (!product) return;
    setError(null);
    const numericValue = discountType === "PERCENT" ? parseInt(value, 10) : Math.round(parseFloat(value) * 100);
    if (!numericValue || numericValue <= 0) {
      setError(t("promotions.saveFailed"));
      return;
    }
    try {
      await createMutation.mutateAsync({
        productId: product.id,
        discountType,
        value: numericValue,
        startAt: startAt || null,
        endAt: endAt || null,
      });
      setValue("");
      setStartAt("");
      setEndAt("");
    } catch {
      setError(t("promotions.saveFailed"));
    }
  }

  async function handleDeactivate(id: string) {
    setError(null);
    try {
      await updateMutation.mutateAsync({ id, input: { active: false } });
    } catch {
      setError(t("promotions.saveFailed"));
    }
  }

  return (
    <Modal open={open} title={t("promotions.modalTitle", { name: product.name })} onClose={onClose} widthClassName="max-w-lg">
      <div className="mb-4 rounded-lg border border-slate-200 p-3">
        <p className="mb-2 text-sm font-medium text-slate-600">{t("promotions.currentPromotion")}</p>
        {activePromotion ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              {activePromotion.discountType === "PERCENT"
                ? `-${activePromotion.value}%`
                : `-${formatCurrency(activePromotion.value, currency)}`}
            </span>
            <button
              onClick={() => handleDeactivate(activePromotion.id)}
              className="touch-target text-red-600 hover:underline"
            >
              {t("promotions.deactivate")}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">{t("promotions.noActivePromotion")}</p>
        )}
      </div>

      <p className="mb-2 text-sm font-medium text-slate-600">{t("promotions.createNew")}</p>
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setDiscountType("PERCENT")}
          className={`touch-target flex-1 rounded-lg py-2 text-sm font-semibold ${
            discountType === "PERCENT" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {t("promotions.percent")}
        </button>
        <button
          onClick={() => setDiscountType("FIXED")}
          className={`touch-target flex-1 rounded-lg py-2 text-sm font-semibold ${
            discountType === "FIXED" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          {t("promotions.fixed")}
        </button>
      </div>

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("promotions.value")}</label>
      <input
        type="number"
        min={0}
        step={discountType === "PERCENT" ? 1 : 0.01}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input mb-1"
      />
      <p className="mb-3 text-xs text-slate-400">
        {discountType === "PERCENT" ? t("promotions.percentHint") : t("promotions.fixedHint")}
      </p>

      <label className="mb-1 block text-sm font-medium text-slate-600">{t("promotions.startAtOptional")}</label>
      <input
        type="datetime-local"
        value={startAt}
        onChange={(e) => setStartAt(e.target.value)}
        className="input mb-3"
      />
      <label className="mb-1 block text-sm font-medium text-slate-600">{t("promotions.endAtOptional")}</label>
      <input
        type="datetime-local"
        value={endAt}
        onChange={(e) => setEndAt(e.target.value)}
        className="input mb-4"
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          {createMutation.isPending ? t("common.saving") : t("promotions.createNew")}
        </Button>
      </div>

      {history.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <p className="mb-2 text-sm font-medium text-slate-500">{t("promotions.history")}</p>
          <ul className="space-y-1">
            {history.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {p.discountType === "PERCENT" ? `-${p.value}%` : `-${formatCurrency(p.value, currency)}`}
                </span>
                <span>{t("promotions.inactive")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
