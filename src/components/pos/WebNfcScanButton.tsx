import { useWebNfcScan, type WebNfcScanError } from "../../hooks/useWebNfcScan";
import { useT } from "../../i18n/useT";

interface Props {
  onScan: (label: string) => void;
  disabled?: boolean;
}

const ERROR_KEYS: Record<WebNfcScanError, string> = {
  "permission-denied": "nfc.webNfcPermissionDenied",
  "start-failed": "nfc.webNfcStartFailed",
  "read-error": "nfc.webNfcReadError",
  "no-text-record": "nfc.webNfcNoTextRecord",
};

export default function WebNfcScanButton({ onScan, disabled = false }: Props) {
  const t = useT();
  const { supported, scanning, error, start, stop } = useWebNfcScan(onScan);

  if (!supported) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {scanning ? (
        <>
          <span className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            {t("nfc.webNfcListening")}
          </span>
          <button onClick={stop} className="touch-target text-sm text-slate-500 hover:underline">
            {t("common.cancel")}
          </button>
        </>
      ) : (
        <button
          onClick={start}
          disabled={disabled}
          className="touch-target rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800"
        >
          {t("nfc.webNfcScanButton")}
        </button>
      )}
      {error && <span className="text-sm text-red-600">{t(ERROR_KEYS[error])}</span>}
    </div>
  );
}
