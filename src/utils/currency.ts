import type { CurrencyCode } from "../stores/preferencesStore";

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
  intlLocale: string;
}

// Symbols are hardcoded rather than relying on Intl's currency resolution:
// small-ICU Node/browser builds can render USD and SGD with the same "$"
// glyph, which is ambiguous in a selector meant to distinguish them.
export const CURRENCIES: CurrencyOption[] = [
  { code: "MYR", label: "RM 马来西亚令吉", symbol: "RM", intlLocale: "ms-MY" },
  { code: "CNY", label: "¥ 人民币", symbol: "¥", intlLocale: "zh-CN" },
  { code: "USD", label: "$ 美元", symbol: "$", intlLocale: "en-US" },
  { code: "SGD", label: "S$ 新加坡元", symbol: "S$", intlLocale: "en-SG" },
];

export function formatCurrency(cents: number, currency: CurrencyCode): string {
  const option = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
  const amount = (cents / 100).toLocaleString(option.intlLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${option.symbol}${amount}`;
}
