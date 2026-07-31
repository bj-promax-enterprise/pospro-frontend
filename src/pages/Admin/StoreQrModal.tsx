import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useT } from "../../i18n/useT";
import { getLanInfo } from "../../api/public.api";
import { appPath } from "../../utils/appPath";
import type { Store } from "../../types";

interface Props {
  store: Store | null;
  onClose: () => void;
}

export default function StoreQrModal({ store, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(window.location.origin);
  const t = useT();

  const url = store ? `${origin}${appPath(`/order/${store.id}`)}` : "";
  const pickupDisplayUrl = store ? `${origin}${appPath(`/pickup-display/${store.id}`)}` : "";

  useEffect(() => {
    if (!store) return;
    // Prefer the backend's LAN-reachable address: if this page was opened via
    // "localhost" (dev browser tab or the Electron window), a phone on the
    // same network can't reach that — it needs the machine's actual LAN IP.
    getLanInfo()
      .then((info) => setOrigin(info.url))
      .catch(() => setOrigin(window.location.origin));
  }, [store]);

  useEffect(() => {
    if (!store || !url) return;
    setCopied(false);
    QRCode.toDataURL(url, { width: 480, margin: 1 }).then(setDataUrl);
  }, [store, url]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  function handleDownload() {
    if (!dataUrl || !store) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `store-${store.name}-qr.png`;
    link.click();
  }

  return (
    <Modal open={!!store} title={t("admin.stores.qrTitle")} onClose={onClose}>
      {store && (
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-sm text-slate-500">{t("admin.stores.qrHint")}</p>
          {dataUrl && (
            <img src={dataUrl} alt={url} className="mb-4 w-60 rounded-lg border border-slate-200" />
          )}
          <p className="mb-4 break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{url}</p>
          <div className="mb-2 flex w-full gap-2">
            <Button variant="secondary" className="flex-1" onClick={handleDownload}>
              {t("tables.qrDownload")}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleCopy}>
              {copied ? t("admin.stores.qrCopied") : t("admin.stores.qrCopy")}
            </Button>
          </div>
          <div className="mb-4 w-full">
            <Button className="w-full" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
          <div className="w-full border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs text-slate-400">{t("admin.stores.pickupDisplayHint")}</p>
            <a
              href={pickupDisplayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex min-h-[44px] w-full items-center justify-center rounded-lg bg-slate-200 px-4 text-center text-sm font-semibold text-slate-800 transition-all duration-150 hover:bg-slate-300 active:scale-[0.97]"
            >
              {t("admin.stores.pickupDisplayButton")}
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
}
