import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NfcCardInput from "../../components/pos/NfcCardInput";
import WebNfcScanButton from "../../components/pos/WebNfcScanButton";
import Button from "../../components/ui/Button";
import { useGetTableBill, useSettleTable } from "../../hooks/useTables";
import { useStores } from "../../hooks/useStores";
import { useAuthStore } from "../../stores/authStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { TableBill } from "../../api/tables.api";
import type { PaymentMethod } from "../../types";

export default function TableSettlePage() {
  const t = useT();
  const currency = usePreferencesStore((s) => s.currency);

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: stores } = useStores();
  const [storeId, setStoreId] = useState<string>(user?.storeId ?? "");

  useEffect(() => {
    if (isAdmin && !storeId && stores && stores.length > 0) {
      setStoreId(stores[0].id);
    }
  }, [isAdmin, storeId, stores]);

  const effectiveStoreId = isAdmin ? storeId : user?.storeId ?? "";

  const [tableLabel, setTableLabel] = useState<string | null>(null);
  const [tableBill, setTableBill] = useState<TableBill | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>("CASH");
  const [settleSuccess, setSettleSuccess] = useState(false);
  const getBillMutation = useGetTableBill();
  const settleMutation = useSettleTable();

  function handleCardScan(scannedLabel: string) {
    setCardError(null);
    getBillMutation.mutate(
      { label: scannedLabel, storeId: effectiveStoreId || undefined },
      {
        onSuccess: (bill) => {
          if (bill.items.length === 0) {
            setCardError(t("checkout.nothingToSettle"));
            return;
          }
          setTableLabel(scannedLabel);
          setTableBill(bill);
          setSettleMethod("CASH");
          setSettleSuccess(false);
        },
        onError: () => setCardError(t("checkout.tableNotFound")),
      }
    );
  }

  function handleSettleConfirm() {
    if (!tableLabel) return;
    settleMutation.mutate(
      { label: tableLabel, method: settleMethod, storeId: effectiveStoreId || undefined },
      {
        onSuccess: () => setSettleSuccess(true),
        onError: () => setCardError(t("checkout.settleFailed")),
      }
    );
  }

  function reset() {
    setTableLabel(null);
    setTableBill(null);
    setCardError(null);
    setSettleSuccess(false);
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <Link to="/checkout" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        {t("checkout.backToCheckout")}
      </Link>
      <h1 className="mb-4 text-xl font-semibold text-slate-800">{t("checkout.tableSettleLink")}</h1>

      {isAdmin && stores && stores.length > 0 && (
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="input mb-4 max-w-xs"
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {!tableBill ? (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <NfcCardInput onScan={handleCardScan} autoFocus />
            </div>
            <div className="flex-shrink-0">
              <WebNfcScanButton onScan={handleCardScan} />
            </div>
          </div>
          {cardError && <p className="text-sm text-red-600">{cardError}</p>}
        </div>
      ) : (
        <div className="card text-sm text-slate-700">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            {t("checkout.tableBillTitle", { cardUid: tableLabel ?? "" })}
          </h2>
          {settleSuccess ? (
            <div className="py-6 text-center">
              <p className="mb-4 text-lg font-semibold text-green-600">{t("checkout.settleSuccess")}</p>
              <Button className="w-full" onClick={reset}>
                {t("common.close")}
              </Button>
            </div>
          ) : (
            <>
              <ul className="mb-3 divide-y divide-slate-100">
                {tableBill.items.map((item, i) => (
                  <li key={i} className="flex justify-between py-1">
                    <span>
                      {item.productNameSnapshot} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.subtotalCents, currency)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
                <span>{t("checkout.total")}</span>
                <span>{formatCurrency(tableBill.totalCents, currency)}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(["CASH", "CARD", "QR"] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSettleMethod(m)}
                    className={`touch-target rounded-lg py-2.5 text-sm font-semibold ${
                      settleMethod === m ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t(`payment.${m.toLowerCase()}`)}
                  </button>
                ))}
              </div>
              {cardError && <p className="mt-3 text-sm text-red-600">{cardError}</p>}
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={reset}>
                  {t("common.cancel")}
                </Button>
                <Button
                  className="flex-1"
                  disabled={settleMutation.isPending}
                  onClick={handleSettleConfirm}
                >
                  {settleMutation.isPending ? t("payment.processing") : t("checkout.settleConfirm")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
