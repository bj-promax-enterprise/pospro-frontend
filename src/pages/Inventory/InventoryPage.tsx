import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { useInventory, useInventoryLogs } from "../../hooks/useInventory";
import { useStores } from "../../hooks/useStores";
import { useAuthStore } from "../../stores/authStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import StockInModal from "./StockInModal";
import { useT } from "../../i18n/useT";
import type { InventoryItem } from "../../types";

export default function InventoryPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: stores } = useStores();
  const [storeId, setStoreId] = useState<string>(user?.storeId ?? "");
  const t = useT();
  const language = usePreferencesStore((s) => s.language);

  useEffect(() => {
    if (isAdmin && !storeId && stores && stores.length > 0) {
      setStoreId(stores[0].id);
    }
  }, [isAdmin, storeId, stores]);

  const effectiveStoreId = isAdmin ? storeId || undefined : undefined;
  const { data: inventory, isLoading } = useInventory(effectiveStoreId);
  const { data: logs } = useInventoryLogs({ storeId: effectiveStoreId });
  const [modalOpen, setModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<InventoryItem["product"] | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  function openStockIn(product: InventoryItem["product"] | null) {
    setTargetProduct(product);
    setModalOpen(true);
  }

  const localeForDates = language === "en" ? "en-US" : language === "ms" ? "ms-MY" : "zh-CN";

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-800">{t("inventory.title")}</h1>
          {isAdmin && stores && stores.length > 0 && (
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="input max-w-xs">
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowLogs((s) => !s)}>
            {showLogs ? t("inventory.viewInventory") : t("inventory.viewLogs")}
          </Button>
          <Button onClick={() => openStockIn(null)}>{t("inventory.stockInBtn")}</Button>
        </div>
      </div>

      {showLogs ? (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("inventory.time")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.product")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.type")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.quantityChange")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.note")}</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.createdAt).toLocaleString(localeForDates)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{log.product.name}</td>
                  <td className="px-4 py-3 text-slate-500">{t(`inventory.logType.${log.type}`)}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      log.quantityChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {log.quantityChange >= 0 ? "+" : ""}
                    {log.quantityChange}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{log.note ?? "-"}</td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t("inventory.noLogs")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("inventory.product")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.sku")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.quantity")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.threshold")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.status")}</th>
                <th className="px-4 py-3 font-medium">{t("inventory.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {inventory?.map((item) => (
                <tr
                  key={item.id}
                  className={`border-t border-slate-100 ${item.isLowStock ? "bg-red-50" : ""}`}
                >
                  <td className="px-4 py-3 text-slate-700">{item.product.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.product.sku}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-500">{item.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    {item.isLowStock ? (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                        {t("inventory.lowStock")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        {t("inventory.normal")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openStockIn(item.product)}
                      className="touch-target text-blue-600 hover:underline"
                    >
                      {t("inventory.stockIn")}
                    </button>
                  </td>
                </tr>
              ))}
              {inventory?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    {t("inventory.noRecords")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <StockInModal
        open={modalOpen}
        initialProduct={targetProduct}
        storeId={effectiveStoreId}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
