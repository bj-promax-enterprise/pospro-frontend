import { useEffect, useState, type ReactNode } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useCategories } from "../../hooks/useCategories";
import { useCreateProduct, useUpdateProduct, useUploadProductImage } from "../../hooks/useProducts";
import { useT } from "../../i18n/useT";
import { resolveImageUrl } from "../../utils/apiOrigin";
import type { Product } from "../../types";

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

interface FormState {
  sku: string;
  barcode: string;
  name: string;
  unit: string;
  price: string;
  cost: string;
  categoryId: string;
  imageUrl: string | null;
}

const emptyForm: FormState = {
  sku: "",
  barcode: "",
  name: "",
  unit: "pcs",
  price: "",
  cost: "",
  categoryId: "",
  imageUrl: null,
};

export default function ProductFormModal({ open, product, onClose }: Props) {
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const uploadMutation = useUploadProductImage();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        sku: product.sku,
        barcode: product.barcode ?? "",
        name: product.name,
        unit: product.unit,
        price: (product.priceCents / 100).toString(),
        cost: (product.costCents / 100).toString(),
        categoryId: product.categoryId ?? "",
        imageUrl: product.imageUrl,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, product]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const { url } = await uploadMutation.mutateAsync(file);
      update("imageUrl", url);
    } catch {
      setError(t("products.imageUploadFailed"));
    }
  }

  async function handleSubmit() {
    setError(null);
    const priceCents = Math.round(parseFloat(form.price) * 100);
    const costCents = Math.round((parseFloat(form.cost) || 0) * 100);

    if (!form.sku.trim() || !form.name.trim() || Number.isNaN(priceCents)) {
      setError(t("products.requiredFields"));
      return;
    }

    const input = {
      sku: form.sku.trim(),
      barcode: form.barcode.trim() || null,
      name: form.name.trim(),
      unit: form.unit.trim() || "pcs",
      priceCents,
      costCents,
      categoryId: form.categoryId || null,
      imageUrl: form.imageUrl,
    };

    try {
      if (product) {
        await updateMutation.mutateAsync({ id: product.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      onClose();
    } catch {
      setError(t("products.saveFailed"));
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;
  const previewUrl = resolveImageUrl(form.imageUrl);

  return (
    <Modal open={open} title={product ? t("products.modalEditTitle") : t("products.modalNewTitle")} onClose={onClose}>
      <div className="mb-3 flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">{t("products.noImage")}</span>
          )}
        </div>
        <div>
          <label className="touch-target inline-block cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
            {uploadMutation.isPending ? t("products.uploading") : t("products.uploadImage")}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadMutation.isPending}
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t("products.fieldSku")}>
          <input
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className="input"
          />
        </Field>
        <Field label={t("products.fieldBarcode")}>
          <input
            value={form.barcode}
            onChange={(e) => update("barcode", e.target.value)}
            className="input"
          />
        </Field>
        <Field label={t("products.fieldName")} full>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="input"
          />
        </Field>
        <Field label={t("products.fieldUnit")}>
          <input value={form.unit} onChange={(e) => update("unit", e.target.value)} className="input" />
        </Field>
        <Field label={t("products.fieldCategory")}>
          <select
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="input"
          >
            <option value="">{t("common.uncategorized")}</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("products.fieldPrice")}>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="input"
          />
        </Field>
        <Field label={t("products.fieldCost")}>
          <input
            type="number"
            step="0.01"
            value={form.cost}
            onChange={(e) => update("cost", e.target.value)}
            className="input"
          />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={saving || uploadMutation.isPending}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </Modal>
  );
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
