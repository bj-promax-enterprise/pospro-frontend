import { useEffect, useState } from "react";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useOrders";
import { useStores } from "../../hooks/useStores";
import { useAuthStore } from "../../stores/authStore";
import { useT } from "../../i18n/useT";
import { appPath } from "../../utils/appPath";
import type { Order, OrderStatus } from "../../types";

const COLUMNS: { status: OrderStatus; labelKey: string; nextStatus: OrderStatus; actionKey: string }[] = [
  { status: "PENDING", labelKey: "orderQueue.columnPending", nextStatus: "PREPARING", actionKey: "orderQueue.actionConfirm" },
  { status: "PREPARING", labelKey: "orderQueue.columnPreparing", nextStatus: "READY", actionKey: "orderQueue.actionReady" },
  { status: "READY", labelKey: "orderQueue.columnReady", nextStatus: "COMPLETED", actionKey: "orderQueue.actionComplete" },
];

function OrderCard({ order, nextStatus, actionKey }: { order: Order; nextStatus: OrderStatus; actionKey: string }) {
  const t = useT();
  const updateMutation = useUpdateOrderStatus();

  async function handleAdvance() {
    try {
      await updateMutation.mutateAsync({ id: order.id, status: nextStatus });
    } catch {
      alert(t("orderQueue.updateFailed"));
    }
  }

  return (
    <div className="card card-hover mb-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {order.pickupNo && (
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-sm font-bold text-white">
              {order.pickupNo}
            </span>
          )}
          {order.tableLabel && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {t("orderQueue.tableLabel", { label: order.tableLabel })}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {new Date(order.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <ul className="mb-3 space-y-1 text-sm text-slate-600">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>{item.productNameSnapshot}</span>
            <span>× {item.quantity}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleAdvance}
        disabled={updateMutation.isPending}
        className="touch-target w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {t(actionKey)}
      </button>
    </div>
  );
}

export default function OrderQueuePage() {
  const t = useT();
  const { data } = useOrders({ source: "SELF_ORDER", pageSize: 200 }, { refetchInterval: 5000 });

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: stores } = useStores();
  const [displayStoreId, setDisplayStoreId] = useState(user?.storeId ?? "");

  useEffect(() => {
    if (isAdmin && !displayStoreId && stores && stores.length > 0) {
      setDisplayStoreId(stores[0].id);
    }
  }, [isAdmin, displayStoreId, stores]);

  const items = data?.items ?? [];
  const hasAny = COLUMNS.some((col) => items.some((o) => o.status === col.status));

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-800">{t("orderQueue.title")}</h1>
        <div className="flex items-center gap-2">
          {isAdmin && stores && stores.length > 0 && (
            <select
              value={displayStoreId}
              onChange={(e) => setDisplayStoreId(e.target.value)}
              className="input"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <a
            href={displayStoreId ? appPath(`/pickup-display/${displayStoreId}`) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!displayStoreId}
            className={`touch-target rounded-lg bg-slate-800 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700 ${
              displayStoreId ? "" : "pointer-events-none opacity-50"
            }`}
          >
            {t("orderQueue.openPickupDisplay")}
          </a>
        </div>
      </div>

      {!hasAny ? (
        <p className="text-slate-400">{t("orderQueue.noOrders")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colOrders = items.filter((o) => o.status === col.status);
            return (
              <div key={col.status}>
                <h2 className="mb-2 text-sm font-semibold text-slate-500">
                  {t(col.labelKey)} ({colOrders.length})
                </h2>
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    nextStatus={col.nextStatus}
                    actionKey={col.actionKey}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
