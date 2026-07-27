import { useEffect, useState } from "react";
import { cartSubtotalCents, useCartStore } from "../../stores/cartStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { CURRENCIES, formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import { useCreateMember, useMemberCoupons, useMembers } from "../../hooks/useMembers";
import type { Member } from "../../types";

interface Props {
  member: Member | null;
  onMemberChange: (member: Member | null) => void;
  pointsToRedeem: number;
  onPointsToRedeemChange: (points: number) => void;
  couponId: string | null;
  onCouponChange: (couponId: string | null) => void;
}

export default function CartPanel({
  member,
  onMemberChange,
  pointsToRedeem,
  onPointsToRedeemChange,
  couponId,
  onCouponChange,
}: Props) {
  const { items, discountCents, updateQty, removeItem, setDiscountCents } = useCartStore();
  const subtotalCents = cartSubtotalCents(items);
  const currency = usePreferencesStore((s) => s.currency);
  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "";
  const t = useT();

  const [phoneInput, setPhoneInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [createError, setCreateError] = useState(false);
  const { data: searchResults } = useMembers(searchTerm || undefined);
  const { data: coupons } = useMemberCoupons(member?.id, false);
  const createMemberMutation = useCreateMember();

  useEffect(() => {
    if (!searchTerm) return;
    if (searchResults && searchResults.length > 0) {
      onMemberChange(searchResults[0]);
      setSearchError(false);
    } else if (searchResults && searchResults.length === 0) {
      onMemberChange(null);
      setSearchError(true);
      setNewMemberName("");
      setCreateError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults]);

  function handleSearch() {
    if (!phoneInput.trim()) return;
    setSearchTerm(phoneInput.trim());
  }

  function handleClearMember() {
    onMemberChange(null);
    onPointsToRedeemChange(0);
    onCouponChange(null);
    setPhoneInput("");
    setSearchTerm("");
    setSearchError(false);
    setNewMemberName("");
    setCreateError(false);
  }

  async function handleCreateMember() {
    if (!newMemberName.trim()) return;
    setCreateError(false);
    try {
      const created = await createMemberMutation.mutateAsync({
        phone: phoneInput.trim(),
        name: newMemberName.trim(),
      });
      onMemberChange(created);
      setSearchError(false);
      setNewMemberName("");
    } catch {
      setCreateError(true);
    }
  }

  const maxPoints = member ? Math.min(member.pointsBalance, subtotalCents) : 0;
  const couponDiscountCents = (() => {
    const coupon = coupons?.find((c) => c.id === couponId);
    if (!coupon) return 0;
    const raw =
      coupon.discountType === "PERCENT" ? Math.round((subtotalCents * coupon.value) / 100) : coupon.value;
    return Math.min(raw, subtotalCents);
  })();
  const memberDiscountCents = pointsToRedeem + couponDiscountCents;
  const totalCents = Math.max(0, subtotalCents - discountCents - memberDiscountCents);

  return (
    <div className="flex flex-col">
      <div>
        {items.length === 0 ? (
          <p className="p-4 text-center text-slate-400">{t("cart.empty")}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.effectivePriceCents < item.priceCents ? (
                      <>
                        <span className="mr-1 text-slate-400 line-through">
                          {formatCurrency(item.priceCents, currency)}
                        </span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(item.effectivePriceCents, currency)}
                        </span>
                      </>
                    ) : (
                      formatCurrency(item.priceCents, currency)
                    )}{" "}
                    / {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="touch-target flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="touch-target ml-1 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-200 p-3">
        <p className="mb-1.5 text-xs font-semibold text-slate-500">{t("members.checkoutSectionTitle")}</p>
        {!member ? (
          <div className="mb-2 flex gap-2">
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("members.phonePlaceholder")}
              className="input flex-1 text-sm"
            />
            <button
              onClick={handleSearch}
              className="touch-target rounded-lg bg-slate-800 px-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              {t("members.search")}
            </button>
          </div>
        ) : (
          <div className="mb-2 rounded-lg bg-blue-50 p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-500">
                  {member.phone} · {t("members.pointsBalance", { points: member.pointsBalance })}
                </p>
              </div>
              <button
                onClick={handleClearMember}
                className="touch-target text-xs text-red-600 hover:underline"
              >
                {t("common.cancel")}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="text-xs text-slate-600">{t("members.usePoints")}</label>
              <input
                type="number"
                min={0}
                max={maxPoints}
                value={pointsToRedeem === 0 ? "" : pointsToRedeem}
                onChange={(e) =>
                  onPointsToRedeemChange(Math.max(0, Math.min(maxPoints, parseInt(e.target.value, 10) || 0)))
                }
                className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm"
              />
            </div>
            {coupons && coupons.length > 0 && (
              <div className="mt-2">
                <label className="mb-1 block text-xs text-slate-600">{t("members.useCoupon")}</label>
                <select
                  value={couponId ?? ""}
                  onChange={(e) => onCouponChange(e.target.value || null)}
                  className="input text-sm"
                >
                  <option value="">{t("members.noCoupon")}</option>
                  {coupons.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.discountType === "PERCENT" ? `-${c.value}%` : `-${formatCurrency(c.value, currency)}`}
                      {" "}({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        {searchError && (
          <div className="mb-2 rounded-lg bg-slate-50 p-2">
            <p className="mb-1.5 text-xs text-red-600">{t("members.notFound")}</p>
            <div className="flex gap-2">
              <input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateMember()}
                placeholder={t("members.name")}
                className="input flex-1 text-sm"
              />
              <button
                onClick={handleCreateMember}
                disabled={createMemberMutation.isPending}
                className="touch-target rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {t("members.newMember")}
              </button>
            </div>
            {createError && <p className="mt-1.5 text-xs text-red-600">{t("members.saveFailed")}</p>}
          </div>
        )}

        <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
          <span>{t("cart.subtotal")}</span>
          <span>{formatCurrency(subtotalCents, currency)}</span>
        </div>
        <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
          <span>
            {t("cart.discount")} ({currencySymbol})
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discountCents === 0 ? "" : (discountCents / 100).toString()}
            onChange={(e) => setDiscountCents(Math.round((parseFloat(e.target.value) || 0) * 100))}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-right"
          />
        </div>
        {memberDiscountCents > 0 && (
          <div className="mb-1.5 flex items-center justify-between text-sm text-blue-600">
            <span>{t("members.memberDiscount")}</span>
            <span>-{formatCurrency(memberDiscountCents, currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-lg font-bold text-slate-800">
          <span>{t("cart.total")}</span>
          <span>{formatCurrency(totalCents, currency)}</span>
        </div>
      </div>
    </div>
  );
}
