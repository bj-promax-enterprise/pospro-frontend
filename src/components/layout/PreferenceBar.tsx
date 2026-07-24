import { useEffect, useRef, useState } from "react";
import { usePreferencesStore, type CurrencyCode, type LanguageCode } from "../../stores/preferencesStore";
import { CURRENCIES } from "../../utils/currency";
import { useT } from "../../i18n/useT";

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "ms", label: "Bahasa Malaysia" },
];

interface DropdownProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onSelect: (value: T) => void;
}

function Dropdown<T extends string>({ value, options, onSelect }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="touch-target flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        {current.label}
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onSelect(o.value);
                setOpen(false);
              }}
              className={`touch-target block w-full px-4 py-2 text-left text-sm ${
                o.value === value ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PreferenceBar() {
  const { currency, language, setCurrency, setLanguage } = usePreferencesStore();
  const t = useT();

  const currencyOptions: { value: CurrencyCode; label: string }[] = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.symbol} ${c.code}`,
  }));

  const languageOptions: { value: LanguageCode; label: string }[] = LANGUAGES.map((l) => ({
    value: l.code,
    label: l.label,
  }));

  return (
    <div className="flex items-center justify-end gap-2 border-b border-slate-200 bg-white px-4 py-2">
      <span className="text-xs text-slate-400">{t("preferences.currency")}</span>
      <Dropdown value={currency} options={currencyOptions} onSelect={setCurrency} />
      <span className="ml-2 text-xs text-slate-400">{t("preferences.language")}</span>
      <Dropdown value={language} options={languageOptions} onSelect={setLanguage} />
    </div>
  );
}
