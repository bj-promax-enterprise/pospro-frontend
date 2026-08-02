import { useState } from "react";
import { useT } from "../../i18n/useT";
import { isWebNfcSupported, webNfcErrorCode } from "../../utils/webNfc";

interface Props {
  label: string;
}

type Status = "idle" | "writing" | "success" | "error";

export default function WriteNfcCardButton({ label }: Props) {
  const t = useT();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isWebNfcSupported()) return null;

  async function handleWrite() {
    setStatus("writing");
    setErrorMsg(null);
    try {
      const writer = new NDEFReader();
      // Must run inside the click handler's call stack — Web NFC write also
      // requires a user gesture to trigger the permission prompt.
      await writer.write({ records: [{ recordType: "text", data: label }] });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      const code = webNfcErrorCode(err);
      setErrorMsg(t(code === "permission-denied" ? "nfc.webNfcPermissionDenied" : "nfc.webNfcWriteFailed"));
      setStatus("error");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={handleWrite}
        disabled={status === "writing"}
        className="touch-target text-emerald-600 hover:underline disabled:opacity-50"
      >
        {status === "writing"
          ? t("nfc.webNfcWriting")
          : status === "success"
            ? t("nfc.webNfcWriteSuccess")
            : t("tables.writeCard")}
      </button>
      {errorMsg && <span className="text-xs text-red-600">{errorMsg}</span>}
    </span>
  );
}
