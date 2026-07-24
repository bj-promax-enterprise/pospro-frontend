import { useState } from "react";
import { useOrders } from "../../hooks/useOrders";
import OrderDetailModal from "./OrderDetailModal";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { Order } from "../../types";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  PREPARING: "bg-blue-100 text-blue-700",
  READY: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-green-100 text-green-700",
  PARTIALLY_REFUNDED: "bg-amber-100 text-amber-700",
  REFUNDED: "bg-red-100 text-red-700",
  VOID: "bg-slate-100 text-slate-500",
};

export default function OrderHistoryPage() {
  const { data, isLoading } = useOrders({ pageSize: 100 });
  const [selected, setSelected] = useState<Order | null>(null);
  const currency = usePreferencesStore((s) => s.currency);
  const language = usePreferencesStore((s) => s.language);
  const t = useT();

  const localeForDates = language === "en" ? "en-US" : language === "ms" ? "ms-MY" : "zh-CN";

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">{t("orders.title")}</h1>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("orders.orderNo")}</th>
                <th className="px-4 py-3 font-medium">{t("orders.time")}</th>
                <th className="px-4 py-3 font-medium">{t("orders.cashier")}</th>
                <th className="px-4 py-3 font-medium">{t("orders.amount")}</th>
                <th className="px-4 py-3 font-medium">{t("orders.status")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-700">{order.orderNo}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(order.createdAt).toLocaleString(localeForDates)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {order.source === "SELF_ORDER" ? (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded-full bg-teal-100 px-2 py-1 text-xs text-teal-700">
                          {t("orders.sourceSelfOrder")}
                        </span>
                        {order.tableLabel && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                            {t("orderDetail.tableLabel", { label: order.tableLabel })}
                          </span>
                        )}
                      </div>
                    ) : (
                      order.user?.name ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {formatCurrency(order.totalCents, currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${STATUS_CLASS[order.status] ?? ""}`}
                    >
                      {t(`orders.statusLabel.${order.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t("orders.noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
