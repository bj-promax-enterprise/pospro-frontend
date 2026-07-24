import { useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import RefundModal from "./RefundModal";
import { useAuthStore } from "../../stores/authStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import ReceiptView from "../../components/pos/ReceiptView";
import type { Order } from "../../types";

interface Props {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: Props) {
  const [refundOpen, setRefundOpen] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const canRefund = role === "ADMIN" || role === "MANAGER";
  const currency = usePreferencesStore((s) => s.currency);
  const language = usePreferencesStore((s) => s.language);
  const t = useT();

  if (!order) return null;

  const canRefundAnyItem = order.items.some((i) => i.quantity - i.refundedQuantity > 0);
  const localeForDates = language === "en" ? "en-US" : language === "ms" ? "ms-MY" : "zh-CN";

  return (
    <>
      <Modal
        open={!!order}
        title={t("orderDetail.title", { orderNo: order.orderNo })}
        onClose={onClose}
        widthClassName="max-w-lg"
      >
        <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
          <span>{new Date(order.createdAt).toLocaleString(localeForDates)}</span>
          <div className="flex items-center gap-2">
            {order.pickupNo && (
              <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs font-bold text-white">
                {order.pickupNo}
              </span>
            )}
            {order.tableLabel && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                {t("orderDetail.tableLabel", { label: order.tableLabel })}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {t(`orders.statusLabel.${order.status}`)}
            </span>
          </div>
        </div>

        <table className="mb-4 w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2 font-medium">{t("orderDetail.product")}</th>
              <th className="py-2 font-medium">{t("orderDetail.quantity")}</th>
              <th className="py-2 font-medium">{t("orderDetail.subtotal")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="py-2 text-slate-700">
                  {item.productNameSnapshot}
                  {item.refundedQuantity > 0 && (
                    <span className="ml-2 text-xs text-red-500">
                      {t("orderDetail.refundedTag", { qty: item.refundedQuantity })}
                    </span>
                  )}
                </td>
                <td className="py-2 text-slate-500">{item.quantity}</td>
                <td className="py-2 text-slate-700">{formatCurrency(item.subtotalCents, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-3 space-y-1 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>{t("orderDetail.subtotal")}</span>
            <span>{formatCurrency(order.subtotalCents, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("orderDetail.discount")}</span>
            <span>-{formatCurrency(order.discountCents, currency)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-800">
            <span>{t("orderDetail.total")}</span>
            <span>{formatCurrency(order.totalCents, currency)}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-slate-600">{t("orderDetail.paymentMethod")}</p>
          {order.payments.map((p) => (
            <div key={p.id} className="flex justify-between text-sm text-slate-600">
              <span>{t(`payment.${p.method.toLowerCase()}`)}</span>
              <span>{formatCurrency(p.amountCents, currency)}</span>
            </div>
          ))}
        </div>

        {order.refunds.length > 0 && (
          <div className="mb-4">
            <p className="mb-1 text-sm font-medium text-slate-600">{t("orderDetail.refundRecords")}</p>
            {order.refunds.map((r) => (
              <div key={r.id} className="flex justify-between text-sm text-red-600">
                <span>{new Date(r.createdAt).toLocaleString(localeForDates)}</span>
                <span>-{formatCurrency(r.totalRefundedCents, currency)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t("orderDetail.close")}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            {t("orderDetail.printReceipt")}
          </Button>
          {canRefund && canRefundAnyItem && (
            <Button variant="danger" onClick={() => setRefundOpen(true)}>
              {t("orderDetail.refund")}
            </Button>
          )}
        </div>
        <ReceiptView order={order} />
      </Modal>

      <RefundModal
        open={refundOpen}
        order={order}
        onClose={() => {
          setRefundOpen(false);
          onClose();
        }}
      />
    </>
  );
}
