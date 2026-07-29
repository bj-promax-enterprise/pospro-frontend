import { useState } from "react";
import { useParams } from "react-router-dom";
import NfcCardInput from "../../components/pos/NfcCardInput";
import { usePublicTableBill } from "../../hooks/usePublicOrder";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";

export default function TabDisplayPage() {
  const { storeId = "" } = useParams<{ storeId: string }>();
  const [cardUid, setCardUid] = useState<string | null>(null);
  const { data: bill, isError } = usePublicTableBill(storeId, cardUid);
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  if (!cardUid || isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-4 text-5xl">💳</div>
          <p className="mb-4 text-lg font-semibold text-slate-800">
            {isError ? t("tabDisplay.unknownTable") : t("tabDisplay.idle")}
          </p>
          <NfcCardInput onScan={setCardUid} />
        </div>
      </div>
    );
  }

  const hasItems = bill && bill.items.length > 0;

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-sm text-slate-500">{t("tabDisplay.cardLabel", { cardUid })}</p>
        </div>

        {hasItems ? (
          <>
            <ul className="mb-4 divide-y divide-slate-100 border-y border-slate-100">
              {bill!.items.map((item, i) => (
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
            <div className="flex items-center justify-between text-lg font-bold text-slate-800">
              <span>{t("cart.total")}</span>
              <span>{formatCurrency(bill!.totalCents, currency)}</span>
            </div>
          </>
        ) : (
          <p className="py-10 text-center text-slate-400">{t("tabDisplay.settled")}</p>
        )}

        <button
          onClick={() => setCardUid(null)}
          className="touch-target mt-6 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {t("tabDisplay.switchCard")}
        </button>
      </div>
    </div>
  );
}
