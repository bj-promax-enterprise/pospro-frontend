import { useState } from "react";
import Button from "../../components/ui/Button";
import { useCategories } from "../../hooks/useCategories";
import { useDeactivateProduct, useProducts } from "../../hooks/useProducts";
import ProductFormModal from "./ProductFormModal";
import PromotionModal from "./PromotionModal";
import { useT } from "../../i18n/useT";
import { formatCurrency } from "../../utils/currency";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { resolveImageUrl } from "../../utils/apiOrigin";
import type { Product } from "../../types";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const { data: categories } = useCategories();
  const { data, isLoading } = useProducts({ search: search || undefined, categoryId: categoryId || undefined });
  const deactivateMutation = useDeactivateProduct();
  const t = useT();
  const currency = usePreferencesStore((s) => s.currency);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [promotionProduct, setPromotionProduct] = useState<Product | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setModalOpen(true);
  }

  async function handleDeactivate(product: Product) {
    if (!confirm(t("products.confirmDeactivate", { name: product.name }))) return;
    await deactivateMutation.mutateAsync(product.id);
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("products.title")}</h1>
        <Button onClick={openCreate}>{t("products.newProduct")}</Button>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("products.searchPlaceholder")}
          className="input max-w-xs"
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input max-w-xs">
          <option value="">{t("products.allCategories")}</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("products.name")}</th>
                <th className="px-4 py-3 font-medium">{t("products.sku")}</th>
                <th className="px-4 py-3 font-medium">{t("products.barcode")}</th>
                <th className="px-4 py-3 font-medium">{t("products.category")}</th>
                <th className="px-4 py-3 font-medium">{t("products.price")}</th>
                <th className="px-4 py-3 font-medium">{t("products.status")}</th>
                <th className="px-4 py-3 font-medium">{t("products.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                        {p.imageUrl ? (
                          <img src={resolveImageUrl(p.imageUrl) ?? undefined} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-300">-</span>
                        )}
                      </div>
                      {p.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-500">{p.barcode ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category?.name ?? t("common.uncategorized")}</td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(p.priceCents, currency)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        p.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.active ? t("products.active") : t("products.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="touch-target mr-3 text-blue-600 hover:underline"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => setPromotionProduct(p)}
                      className="touch-target mr-3 text-emerald-600 hover:underline"
                    >
                      {t("products.promotionBtn")}
                    </button>
                    {p.active && (
                      <button
                        onClick={() => handleDeactivate(p)}
                        className="touch-target text-red-600 hover:underline"
                      >
                        {t("products.deactivate")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    {t("products.noProducts")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal open={modalOpen} product={editing} onClose={() => setModalOpen(false)} />
      <PromotionModal
        open={!!promotionProduct}
        product={promotionProduct}
        onClose={() => setPromotionProduct(null)}
      />
    </div>
  );
}
