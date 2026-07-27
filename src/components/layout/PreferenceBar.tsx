import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { usePreferencesStore, type CurrencyCode, type LanguageCode } from "../../stores/preferencesStore";
import { useAuthStore } from "../../stores/authStore";
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

function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="touch-target flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm">
          {initials}
        </div>
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{t(`role.${user.role}`)}</p>
            {user.storeName && <p className="truncate text-xs text-slate-400">{user.storeName}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="touch-target flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} strokeWidth={2} />
            {t("nav.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function PreferenceBar() {
  const { currency, language, setCurrency, setLanguage } = usePreferencesStore();
  const t = useT();
  const location = useLocation();

  const currencyOptions: { value: CurrencyCode; label: string }[] = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.symbol} ${c.code}`,
  }));

  const languageOptions: { value: LanguageCode; label: string }[] = LANGUAGES.map((l) => ({
    value: l.code,
    label: l.label,
  }));

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
      <div className="flex flex-shrink-0 items-center gap-3">
        <Link to="/" className="whitespace-nowrap text-lg font-bold tracking-tight text-slate-800">
          POSPro
        </Link>
        {location.pathname !== "/" && (
          <Link
            to="/"
            className="touch-target flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Home size={16} strokeWidth={2} />
            {t("nav.home")}
          </Link>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="hidden text-xs text-slate-400 lg:inline">{t("preferences.currency")}</span>
        <Dropdown value={currency} options={currencyOptions} onSelect={setCurrency} />
        <span className="ml-2 hidden text-xs text-slate-400 lg:inline">{t("preferences.language")}</span>
        <Dropdown value={language} options={languageOptions} onSelect={setLanguage} />
        <UserMenu />
      </div>
    </div>
  );
}
