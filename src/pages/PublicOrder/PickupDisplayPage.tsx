import { useParams } from "react-router-dom";
import { usePickupBoard } from "../../hooks/usePublicOrder";
import type { PickupBoardEntry } from "../../api/public.api";
import { useT } from "../../i18n/useT";

// Matches each platform's real brand color so staff can recognize the source
// at a glance without reading the text label.
const SOURCE_BADGE: Record<string, string> = {
  SELF_ORDER: "bg-slate-600 text-slate-100",
  GRAB: "bg-[#00B14F] text-white",
  SHOPEE_FOOD: "bg-[#EE4D2D] text-white",
  FOODPANDA: "bg-[#D70F64] text-white",
  OTHER: "bg-slate-500 text-white",
};

const SOURCE_GROUPS = ["SELF_ORDER", "GRAB", "SHOPEE_FOOD", "FOODPANDA", "OTHER"] as const;
// These four always render, in this fixed order, so the layout stays stable
// as orders come and go. OTHER (delivery orders with no platform set) never
// gets its own column on the board — it's legacy/edge-case data, not a real
// channel — so it's simply left out of the pickup display entirely.
const READY_DISPLAY_GROUPS = ["SELF_ORDER", "GRAB", "SHOPEE_FOOD", "FOODPANDA"] as const;
// In-store is normally the busiest channel, so it gets more width than each
// delivery-platform column.
const GROUP_WIDTH: Record<string, string> = {
  SELF_ORDER: "flex-[2]",
  GRAB: "flex-1",
  SHOPEE_FOOD: "flex-1",
  FOODPANDA: "flex-1",
};

function sourceKey(o: PickupBoardEntry): string {
  return o.source === "DELIVERY" ? o.deliveryPlatform ?? "OTHER" : "SELF_ORDER";
}

function groupBySource(orders: PickupBoardEntry[]): Record<string, PickupBoardEntry[]> {
  const groups: Record<string, PickupBoardEntry[]> = {};
  for (const key of SOURCE_GROUPS) groups[key] = [];
  for (const o of orders) {
    const key = sourceKey(o);
    (groups[key] ??= []).push(o);
  }
  return groups;
}

export default function PickupDisplayPage() {
  const { storeId = "" } = useParams<{ storeId: string }>();
  const { data } = usePickupBoard(storeId);
  const t = useT();

  const preparing = data?.preparing ?? [];
  const ready = data?.ready ?? [];
  const readyGroups = groupBySource(ready);

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
                  <div
                    className={`mx-auto mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${SOURCE_BADGE[sourceKey(o)]}`}
                  >
                    {t(`pickupDisplay.source.${sourceKey(o)}`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-y-auto bg-red-950/30 p-6">
          <h2 className="mb-6 text-center text-xl font-semibold text-red-400">
            {t("pickupDisplay.readyColumn")}
          </h2>
          <div className="flex flex-1 items-start gap-4">
            {READY_DISPLAY_GROUPS.map((key) => (
              <div key={key} className={`flex min-w-0 flex-col items-center ${GROUP_WIDTH[key]}`}>
                <div
                  className={`mb-3 inline-block whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold ${SOURCE_BADGE[key]}`}
                >
                  {t(`pickupDisplay.source.${key}`)} ({readyGroups[key].length})
                </div>
                {readyGroups[key].length === 0 ? (
                  <p className="text-sm text-slate-600">{t("pickupDisplay.noOrders")}</p>
                ) : (
                  <div className="flex w-full flex-col gap-3">
                    {readyGroups[key].map((o) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
