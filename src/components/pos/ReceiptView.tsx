import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { Order } from "../../types";

interface Props {
  order: Order;
}

export default function ReceiptView({ order }: Props) {
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  return (
    <div className="receipt-print invisible absolute mx-auto w-[280px] font-mono text-xs text-black">
      <p className="text-center text-sm font-bold">POSPro</p>
      <p className="text-center">{new Date(order.createdAt).toLocaleString()}</p>
      <p className="mt-2">{t("checkout.orderNo", { orderNo: order.orderNo })}</p>
      <div className="my-2 border-t border-dashed border-black" />
      {order.items.map((item) => (
        <div key={item.id} className="mb-1 flex justify-between">
          <span>
            {item.productNameSnapshot} x{item.quantity}
          </span>
          <span>{formatCurrency(item.subtotalCents, currency)}</span>
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-black" />
      <div className="flex justify-between">
        <span>{t("orderDetail.subtotal")}</span>
        <span>{formatCurrency(order.subtotalCents, currency)}</span>
      </div>
      {order.discountCents > 0 && (
        <div className="flex justify-between">
          <span>{t("orderDetail.discount")}</span>
          <span>-{formatCurrency(order.discountCents, currency)}</span>
        </div>
      )}
      <div className="mt-1 flex justify-between text-sm font-bold">
        <span>{t("orderDetail.total")}</span>
        <span>{formatCurrency(order.totalCents, currency)}</span>
      </div>
      <div className="my-2 border-t border-dashed border-black" />
      {order.payments.map((p) => (
        <div key={p.id} className="flex justify-between">
          <span>{t(`payment.${p.method.toLowerCase()}`)}</span>
          <span>{formatCurrency(p.amountCents, currency)}</span>
        </div>
      ))}
    </div>
  );
}
