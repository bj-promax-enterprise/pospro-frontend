import { useState } from "react";
import NumericKeypad from "../ui/NumericKeypad";
import Button from "../ui/Button";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";
import type { PaymentMethod } from "../../types";

interface Props {
  totalCents: number;
  disabled: boolean;
  submitting: boolean;
  onConfirm: (method: PaymentMethod) => void;
  tenderedCents: number;
  onTenderedChange: (cents: number) => void;
}

export default function PaymentPanel({
  totalCents,
  disabled,
  submitting,
  onConfirm,
  tenderedCents,
  onTenderedChange,
}: Props) {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [tenderedInput, setTenderedInput] = useState("");
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  const METHODS: { value: PaymentMethod; label: string }[] = [
    { value: "CASH", label: t("payment.cash") },
    { value: "CARD", label: t("payment.card") },
    { value: "QR", label: t("payment.qr") },
  ];

  function handleTenderedInput(value: string) {
    setTenderedInput(value);
    const cents = Math.round((parseFloat(value) || 0) * 100);
    onTenderedChange(cents);
  }

  const changeCents = method === "CASH" ? Math.max(0, tenderedCents - totalCents) : 0;
  const canConfirm =
    !disabled && !submitting && totalCents > 0 && (method !== "CASH" || tenderedCents >= totalCents);

  return (
    <div className="border-t border-slate-200 p-3">
      <div className="mb-2 grid grid-cols-3 gap-2">
        {METHODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMethod(m.value)}
            className={`touch-target rounded-lg py-2.5 text-sm font-semibold ${
              method === m.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {method === "CASH" && (
        <div className="mb-2">
          <div className="mb-1.5 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5">
            <span className="text-sm text-slate-500">{t("payment.tendered")}</span>
            <span className="text-lg font-semibold text-slate-800">
              {formatCurrency(Math.round((parseFloat(tenderedInput) || 0) * 100), currency)}
            </span>
          </div>
          <NumericKeypad value={tenderedInput} onChange={handleTenderedInput} />
          <div className="mt-1.5 flex items-center justify-between text-sm text-slate-600">
            <span>{t("payment.change")}</span>
            <span className="font-semibold text-green-600">{formatCurrency(changeCents, currency)}</span>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={!canConfirm}
        onClick={() => onConfirm(method)}
      >
        {submitting
          ? t("payment.processing")
          : t("payment.checkoutBtn", { amount: formatCurrency(totalCents, currency) })}
      </Button>
    </div>
  );
}
