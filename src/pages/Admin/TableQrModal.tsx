import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useT } from "../../i18n/useT";
import { getLanInfo } from "../../api/public.api";
import { appPath } from "../../utils/appPath";
import type { Table } from "../../types";

interface Props {
  table: Table | null;
  onClose: () => void;
}

export default function TableQrModal({ table, onClose }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(window.location.origin);
  const t = useT();

  const url = table
    ? `${origin}${appPath(`/order/${table.storeId}`)}?table=${encodeURIComponent(table.label)}`
    : "";

  useEffect(() => {
    if (!table) return;
    getLanInfo()
      .then((info) => setOrigin(info.url))
      .catch(() => setOrigin(window.location.origin));
  }, [table]);

  useEffect(() => {
    if (!table || !url) return;
    setCopied(false);
    // Generate at a higher resolution than the on-screen display size so the
    // downloaded/printed image stays crisp when scaled up for a physical table sign.
    QRCode.toDataURL(url, { width: 480, margin: 1 }).then(setDataUrl);
  }, [table, url]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  function handleDownload() {
    if (!dataUrl || !table) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `table-${table.label}-qr.png`;
    link.click();
  }

  return (
    <Modal open={!!table} title={table ? t("tables.qrTitle", { label: table.label }) : ""} onClose={onClose}>
      {table && (
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-sm text-slate-500">{t("tables.qrHint")}</p>
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
          <Button className="w-full" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      )}
    </Modal>
  );
}
