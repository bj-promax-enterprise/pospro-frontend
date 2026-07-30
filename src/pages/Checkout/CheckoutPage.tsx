import { useEffect, useState } from "react";
import BarcodeScanInput from "../../components/pos/BarcodeScanInput";
import NfcCardInput from "../../components/pos/NfcCardInput";
import ProductGrid from "../../components/pos/ProductGrid";
import CartPanel from "../../components/pos/CartPanel";
import PaymentPanel from "../../components/pos/PaymentPanel";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { cartSubtotalCents, useCartStore } from "../../stores/cartStore";
import { useProductByBarcode } from "../../hooks/useProducts";
import { useCheckout } from "../../hooks/useOrders";
import { useStores } from "../../hooks/useStores";
import { useMemberCoupons } from "../../hooks/useMembers";
import { useGetTableBill, useSettleTable } from "../../hooks/useTables";
import type { TableBill } from "../../api/tables.api";
import { useAuthStore } from "../../stores/authStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { appPath } from "../../utils/appPath";
import { useT } from "../../i18n/useT";
import ReceiptView from "../../components/pos/ReceiptView";
import type { Member, PaymentMethod } from "../../types";
import type { Order } from "../../types";

export default function CheckoutPage() {
  const [search, setSearch] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [tenderedCents, setTenderedCents] = useState(0);
  const [receipt, setReceipt] = useState<Order | null>(null);
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

  const { items, discountCents, addItem, clear } = useCartStore();
  const barcodeMutation = useProductByBarcode();
  const checkoutMutation = useCheckout();
  const effectiveStoreId = isAdmin ? storeId : user?.storeId ?? "";

  const [member, setMember] = useState<Member | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const { data: memberCoupons } = useMemberCoupons(member?.id, false);

  const [tableLabel, setTableLabel] = useState<string | null>(null);
  const [tableBill, setTableBill] = useState<TableBill | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>("CASH");
  const [settleSuccess, setSettleSuccess] = useState(false);
  const getBillMutation = useGetTableBill();
  const settleMutation = useSettleTable();

  const subtotalCents = cartSubtotalCents(items);
  const selectedCoupon = memberCoupons?.find((c) => c.id === couponId) ?? null;
  const couponDiscountCents = selectedCoupon
    ? Math.min(
        selectedCoupon.discountType === "PERCENT"
          ? Math.round((subtotalCents * selectedCoupon.value) / 100)
          : selectedCoupon.value,
        subtotalCents
      )
    : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents - pointsToRedeem - couponDiscountCents);

  function resetMemberState() {
    setMember(null);
    setPointsToRedeem(0);
    setCouponId(null);
  }

  function handleScan(barcode: string) {
    setScanError(null);
    barcodeMutation.mutate(barcode, {
      onSuccess: (product) => addItem(product),
      onError: () => setScanError(t("checkout.notFoundBarcode", { barcode })),
    });
  }

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

  function closeBillModal() {
    setTableLabel(null);
    setTableBill(null);
    setSettleSuccess(false);
  }

  async function handleConfirm(method: PaymentMethod) {
    try {
      const order = await checkoutMutation.mutateAsync({
        storeId: isAdmin ? storeId || undefined : undefined,
        memberId: member?.id,
        pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
        couponId: couponId ?? undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        discountCents,
        payments: [{ method, amountCents: totalCents }],
      });
      setReceipt(order);
      clear();
      setTenderedCents(0);
      resetMemberState();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? t("checkout.checkoutFailed");
      setScanError(message);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex w-96 flex-shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
        <CartPanel
          member={member}
          onMemberChange={setMember}
          pointsToRedeem={pointsToRedeem}
          onPointsToRedeemChange={setPointsToRedeem}
          couponId={couponId}
          onCouponChange={setCouponId}
        />
        <PaymentPanel
          totalCents={totalCents}
          disabled={items.length === 0}
          submitting={checkoutMutation.isPending}
          onConfirm={handleConfirm}
          tenderedCents={tenderedCents}
          onTenderedChange={setTenderedCents}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="border-b border-slate-200 bg-white p-4">
          {isAdmin && stores && stores.length > 0 && (
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="input mb-2 max-w-xs"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <BarcodeScanInput onScan={handleScan} onSearchChange={setSearch} errorMessage={scanError} />
          <div className="mt-2">
            <NfcCardInput onScan={handleCardScan} autoFocus={false} />
            {cardError && <p className="mt-1 text-sm text-red-600">{cardError}</p>}
          </div>
        </div>
        <ProductGrid search={search} onSelect={(product) => addItem(product)} />
      </div>

      <Modal open={!!receipt} title={t("checkout.receiptTitle")} onClose={() => setReceipt(null)}>
        {receipt && (
          <div className="text-sm text-slate-700">
            <p className="mb-2">{t("checkout.orderNo", { orderNo: receipt.orderNo })}</p>
            <ul className="mb-3 divide-y divide-slate-100">
              {receipt.items.map((item) => (
                <li key={item.id} className="flex justify-between py-1">
                  <span>
                    {item.productNameSnapshot} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.subtotalCents, currency)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold">
              <span>{t("checkout.total")}</span>
              <span>{formatCurrency(receipt.totalCents, currency)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
                {t("orderDetail.printReceipt")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.open(appPath(`/receipt/${receipt.id}`), "_blank")}
              >
                {t("checkout.customerDisplay")}
              </Button>
              <Button className="flex-1" onClick={() => setReceipt(null)}>
                {t("checkout.continueCheckout")}
              </Button>
            </div>
            <ReceiptView order={receipt} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!tableBill}
        title={tableLabel ? t("checkout.tableBillTitle", { cardUid: tableLabel }) : ""}
        onClose={closeBillModal}
      >
        {tableBill && (
          <div className="text-sm text-slate-700">
            {settleSuccess ? (
              <div className="py-6 text-center">
                <p className="mb-4 text-lg font-semibold text-green-600">{t("checkout.settleSuccess")}</p>
                <Button className="w-full" onClick={closeBillModal}>
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
                <Button
                  className="mt-4 w-full"
                  disabled={settleMutation.isPending}
                  onClick={handleSettleConfirm}
                >
                  {settleMutation.isPending ? t("payment.processing") : t("checkout.settleConfirm")}
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
