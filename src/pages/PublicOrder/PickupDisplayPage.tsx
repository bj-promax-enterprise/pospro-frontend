import { useParams } from "react-router-dom";
import { usePickupBoard } from "../../hooks/usePublicOrder";
import { useT } from "../../i18n/useT";

export default function PickupDisplayPage() {
  const { storeId = "" } = useParams<{ storeId: string }>();
  const { data } = usePickupBoard(storeId);
  const t = useT();

  const preparing = data?.preparing ?? [];
  const ready = data?.ready ?? [];

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <h1 className="px-8 py-6 text-center text-3xl font-bold tracking-wide">{t("pickupDisplay.title")}</h1>

      <div className="grid flex-1 grid-cols-2 divide-x divide-slate-700 overflow-hidden">
        <div className="flex flex-col overflow-y-auto p-6">
          <h2 className="mb-6 text-center text-xl font-semibold text-slate-400">
            {t("pickupDisplay.preparingColumn")}
          </h2>
          {preparing.length === 0 ? (
            <p className="text-center text-slate-600">{t("pickupDisplay.noOrders")}</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {preparing.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl bg-slate-800 py-6 text-center text-slate-300"
                >
                  <div className="text-4xl font-extrabold tracking-widest">{o.pickupNo}</div>
                  {o.tableLabel && <div className="mt-1 text-sm text-slate-400">{o.tableLabel}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-y-auto bg-red-950/30 p-6">
          <h2 className="mb-6 text-center text-xl font-semibold text-red-400">
            {t("pickupDisplay.readyColumn")}
          </h2>
          {ready.length === 0 ? (
            <p className="text-center text-slate-600">{t("pickupDisplay.noOrders")}</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {ready.map((o) => (
                <div
                  key={o.id}
                  className="animate-pulse rounded-2xl bg-red-600 py-6 text-center text-white shadow-lg shadow-red-900/50"
                >
                  <div className="text-5xl font-extrabold tracking-widest">{o.pickupNo}</div>
                  {o.tableLabel && <div className="mt-1 text-base font-semibold">{o.tableLabel}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
