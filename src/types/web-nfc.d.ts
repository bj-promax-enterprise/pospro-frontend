// Web NFC (NDEFReader) is not part of TypeScript's bundled DOM lib — only
// Chrome/Edge on Android implement it (no iOS Safari, no desktop browser).
// Minimal ambient types for the subset this app uses.

interface NDEFRecord {
  readonly recordType: string;
  readonly mediaType?: string;
  readonly id?: string;
  readonly data?: DataView;
  readonly encoding?: string;
  readonly lang?: string;
}

interface NDEFMessage {
  readonly records: readonly NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  readonly serialNumber: string;
  readonly message: NDEFMessage;
}

type NDEFRecordInit = {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: BufferSource | string;
  encoding?: string;
  lang?: string;
};

type NDEFMessageInit = string | BufferSource | { records: NDEFRecordInit[] };

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

interface NDEFScanOptions {
  signal?: AbortSignal;
}

interface NDEFReaderEventMap {
  reading: NDEFReadingEvent;
  readingerror: Event;
}

declare class NDEFReader extends EventTarget {
  constructor();
  scan(options?: NDEFScanOptions): Promise<void>;
  write(message: NDEFMessageInit, options?: NDEFWriteOptions): Promise<void>;
  onreading: ((this: NDEFReader, ev: NDEFReadingEvent) => unknown) | null;
  onreadingerror: ((this: NDEFReader, ev: Event) => unknown) | null;
  addEventListener<K extends keyof NDEFReaderEventMap>(
    type: K,
    listener: (this: NDEFReader, ev: NDEFReaderEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof NDEFReaderEventMap>(
    type: K,
    listener: (this: NDEFReader, ev: NDEFReaderEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ): void;
}

interface Window {
  NDEFReader?: typeof NDEFReader;
}
