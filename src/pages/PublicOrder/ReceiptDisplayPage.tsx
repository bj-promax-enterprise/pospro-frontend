import { useParams } from "react-router-dom";
import { usePublicReceipt } from "../../hooks/usePublicOrder";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";

export default function ReceiptDisplayPage() {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const { data: receipt, isLoading, isError } = usePublicReceipt(orderId);
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (isError || !receipt) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-400">{t("customerReceipt.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-lg font-bold text-slate-800">{receipt.storeName}</p>
          <p className="mt-1 text-sm text-slate-500">{t("customerReceipt.orderNoLabel", { orderNo: receipt.orderNo })}</p>
        </div>

        <ul className="mb-4 divide-y divide-slate-100 border-y border-slate-100">
          {receipt.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">{item.productNameSnapshot}</p>
                <p className="text-slate-400">
                  {formatCurrency(item.unitPriceCents, currency)} × {item.quantity}
                </p>
              </div>
              <span className="font-medium text-slate-700">{formatCurrency(item.subtotalCents, currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
          <span>{t("cart.subtotal")}</span>
          <span>{formatCurrency(receipt.subtotalCents, currency)}</span>
        </div>
        {receipt.discountCents > 0 && (
          <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
            <span>{t("cart.discount")}</span>
            <span>-{formatCurrency(receipt.discountCents, currency)}</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-800">
          <span>{t("cart.total")}</span>
          <span>{formatCurrency(receipt.totalCents, currency)}</span>
        </div>

        {receipt.payments.length > 0 && (
          <div className="mt-4 text-center text-xs text-slate-400">
            {receipt.payments.map((p, i) => (
              <span key={i}>
                {i > 0 && " / "}
                {t(`payment.${p.method.toLowerCase()}`)} {formatCurrency(p.amountCents, currency)}
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">{t("customerReceipt.thankYou")}</p>
      </div>
    </div>
  );
}
