// Web NFC (NDEFReader) only exists on Chrome/Edge for Android — no iOS Safari,
// no desktop browser — and requires a secure context (HTTPS, or localhost).
export function isWebNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

// The UA already strips the NDEF text record's status byte + language-code
// prefix for us: a "text" record's `data` is just the payload bytes, with
// `encoding`/`lang` exposed as separate parsed fields.
export function decodeNdefTextRecord(message: NDEFMessage): string | null {
  for (const record of message.records) {
    if (record.recordType === "text" && record.data) {
      const text = new TextDecoder(record.encoding || "utf-8").decode(record.data);
      const trimmed = text.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

export function webNfcErrorCode(err: unknown): "permission-denied" | "start-failed" {
  const name = (err as { name?: string } | undefined)?.name;
  return name === "NotAllowedError" ? "permission-denied" : "start-failed";
}
