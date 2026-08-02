import { useCallback, useEffect, useRef, useState } from "react";
import { decodeNdefTextRecord, isWebNfcSupported, webNfcErrorCode } from "../utils/webNfc";

export type WebNfcScanError =
  | "permission-denied"
  | "start-failed"
  | "read-error"
  | "no-text-record";

export function useWebNfcScan(onLabel: (label: string) => void) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<WebNfcScanError | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onLabelRef = useRef(onLabel);
  onLabelRef.current = onLabel;

  const supported = isWebNfcSupported();

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setScanning(false);
  }, []);

  const start = useCallback(async () => {
    if (!supported) {
      setError("start-failed");
      return;
    }
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reader = new NDEFReader();
      // Must run inside the click handler's call stack — Web NFC requires a
      // user gesture, and this await is the permission-prompt trigger.
      await reader.scan({ signal: controller.signal });
      setScanning(true);

      reader.onreading = (event) => {
        const label = decodeNdefTextRecord(event.message);
        if (label) {
          onLabelRef.current(label);
          stop();
        } else {
          setError("no-text-record");
        }
      };
      reader.onreadingerror = () => setError("read-error");
    } catch (err) {
      setError(webNfcErrorCode(err));
      setScanning(false);
    }
  }, [supported, stop]);

  useEffect(() => stop, [stop]);

  return { supported, scanning, error, start, stop };
}
