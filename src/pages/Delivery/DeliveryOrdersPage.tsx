import { useState } from "react";
import Button from "../../components/ui/Button";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useOrders";
import { useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import DeliveryOrderFormModal from "./DeliveryOrderFormModal";
import type { Order, OrderStatus } from "../../types";

const COLUMNS: { status: OrderStatus; labelKey: string; nextStatus: OrderStatus; actionKey: string }[] = [
  { status: "PENDING", labelKey: "delivery.columnPending", nextStatus: "PREPARING", actionKey: "delivery.actionStart" },
  { status: "PREPARING", labelKey: "delivery.columnPreparing", nextStatus: "READY", actionKey: "delivery.actionReady" },
  { status: "READY", labelKey: "delivery.columnReady", nextStatus: "COMPLETED", actionKey: "delivery.actionComplete" },
];

function DeliveryOrderCard({ order, nextStatus, actionKey }: { order: Order; nextStatus: OrderStatus; actionKey: string }) {
  const t = useT();
  const currency = usePreferencesStore((s) => s.currency);
  const updateMutation = useUpdateOrderStatus();

  async function handleAdvance() {
    try {
      await updateMutation.mutateAsync({ id: order.id, status: nextStatus });
    } catch {
      alert(t("delivery.updateFailed"));
    }
  }

  return (
    <div className="card card-hover mb-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-slate-800">{order.orderNo}</span>
        <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
      </div>
      <p className="mb-1 text-sm text-slate-700">{order.deliveryPhone}</p>
      <p className="mb-2 text-sm text-slate-500">{order.deliveryAddress}</p>
      <ul className="mb-2 space-y-1 text-sm text-slate-600">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>{item.productNameSnapshot}</span>
            <span>× {item.quantity}</span>
          </li>
        ))}
      </ul>
      <p className="mb-3 text-right text-sm font-semibold text-slate-800">
        {formatCurrency(order.totalCents, currency)}
      </p>
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

export default function DeliveryOrdersPage() {
  const t = useT();
  const { data } = useOrders({ source: "DELIVERY", pageSize: 200 }, { refetchInterval: 5000 });
  const [formOpen, setFormOpen] = useState(false);

  const items = data?.items ?? [];
  const hasAny = COLUMNS.some((col) => items.some((o) => o.status === col.status));

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("delivery.title")}</h1>
        <Button onClick={() => setFormOpen(true)}>{t("delivery.newOrder")}</Button>
      </div>

      {!hasAny ? (
        <p className="text-slate-400">{t("delivery.noOrders")}</p>
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
                  <DeliveryOrderCard key={order.id} order={order} nextStatus={col.nextStatus} actionKey={col.actionKey} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      <DeliveryOrderFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
