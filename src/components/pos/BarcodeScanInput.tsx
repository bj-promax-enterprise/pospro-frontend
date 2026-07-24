import { useEffect, useRef, useState } from "react";
import { useT } from "../../i18n/useT";

interface Props {
  onScan: (barcode: string) => void;
  onSearchChange: (query: string) => void;
  errorMessage?: string | null;
}

/**
 * USB/Bluetooth barcode scanners act as a keyboard wedge: they type the barcode
 * very fast then send Enter. This input doubles as a manual search box (debounced
 * onSearchChange) and a scan target (Enter triggers onScan with the current value).
 */
export default function BarcodeScanInput({ onScan, onSearchChange, errorMessage }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  useEffect(() => {
    inputRef.current?.focus();
    function refocus(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, select, textarea, button, .fixed")) return;
      inputRef.current?.focus();
    }
    window.addEventListener("click", refocus);
    return () => window.removeEventListener("click", refocus);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(value), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onScan(value.trim());
      setValue("");
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("checkout.scanPlaceholder")}
        className="input text-lg"
        autoComplete="off"
      />
      {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
