import { useProducts } from "../../hooks/useProducts";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { resolveImageUrl } from "../../utils/apiOrigin";
import { useT } from "../../i18n/useT";
import type { Product } from "../../types";

interface Props {
  search: string;
  onSelect: (product: Product) => void;
}

export default function ProductGrid({ search, onSelect }: Props) {
  const { data, isLoading } = useProducts({ search: search || undefined, active: true, pageSize: 60 });
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  if (isLoading) {
    return <p className="p-4 text-slate-500">{t("common.loading")}</p>;
  }

  if (!data || data.items.length === 0) {
    return <p className="p-4 text-slate-400">{t("checkout.noProductsFound")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {data.items.map((product) => {
        const imageUrl = resolveImageUrl(product.imageUrl);
        return (
          <button
            key={product.id}
            onClick={() => onSelect(product)}
            className="touch-target flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-blue-400 hover:shadow-md active:scale-[0.98]"
          >
            {imageUrl && (
              <div className="aspect-square w-full overflow-hidden bg-slate-50">
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex min-h-[96px] flex-1 flex-col items-start justify-between p-4">
              <span className="font-medium text-slate-800">{product.name}</span>
              {product.activePromotion ? (
                <span className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(product.priceCents, currency)}
                  </span>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(product.activePromotion.discountedPriceCents, currency)}
                  </span>
                </span>
              ) : (
                <span className="mt-2 text-lg font-semibold text-blue-600">
                  {formatCurrency(product.priceCents, currency)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
