import { useEffect, useRef, useState } from "react";
import { useT } from "../../i18n/useT";

interface Props {
  onScan: (cardUid: string) => void;
  autoFocus?: boolean;
}

/**
 * Cheap USB/Bluetooth NFC readers act as a keyboard wedge, same as barcode
 * scanners (see BarcodeScanInput): tapping a card types its UID then Enter.
 * iPad Safari has no Web NFC support, so this keyboard-wedge input is the
 * only realistic way to read a card from a browser.
 */
export default function NfcCardInput({ onScan, autoFocus = true }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
    function refocus(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, select, textarea, button, .fixed")) return;
      inputRef.current?.focus();
    }
    window.addEventListener("click", refocus);
    return () => window.removeEventListener("click", refocus);
  }, [autoFocus]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onScan(value.trim());
      setValue("");
    }
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={t("nfc.placeholder")}
      className="input text-lg"
      autoComplete="off"
    />
  );
}
