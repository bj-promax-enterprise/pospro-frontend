import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { useCreateTable, useDeleteTable, useTables } from "../../hooks/useTables";
import { useStores } from "../../hooks/useStores";
import { useAuthStore } from "../../stores/authStore";
import { useT } from "../../i18n/useT";
import TableQrModal from "./TableQrModal";
import WriteNfcCardButton from "../../components/admin/WriteNfcCardButton";
import type { Table } from "../../types";

export default function TablesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: stores } = useStores();
  const [storeId, setStoreId] = useState<string>(user?.storeId ?? "");

  useEffect(() => {
    if (isAdmin && !storeId && stores && stores.length > 0) {
      setStoreId(stores[0].id);
    }
  }, [isAdmin, storeId, stores]);

  const { data: tables, isLoading } = useTables(storeId || undefined);
  const createMutation = useCreateTable();
  const deleteMutation = useDeleteTable();
  const t = useT();

  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [qrTable, setQrTable] = useState<Table | null>(null);

  async function handleCreate() {
    setError(null);
    if (!label.trim()) {
      setError(t("tables.labelRequired"));
      return;
    }
    try {
      await createMutation.mutateAsync({ storeId: isAdmin ? storeId || undefined : undefined, label: label.trim() });
      setLabel("");
    } catch {
      setError(t("tables.saveFailed"));
    }
  }

  async function handleDelete(table: Table) {
    if (!confirm(t("tables.confirmDelete", { label: table.label }))) return;
    await deleteMutation.mutateAsync(table.id);
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("tables.title")}</h1>
      </div>

      {isAdmin && stores && stores.length > 0 && (
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="input mb-4 max-w-xs"
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      <div className="mb-4 flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t("tables.labelPlaceholder")}
          className="input max-w-xs"
        />
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          {t("tables.newTable")}
        </Button>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("tables.label")}</th>
                <th className="px-4 py-3 font-medium">{t("tables.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tables?.map((tbl) => (
                <tr key={tbl.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{tbl.label}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setQrTable(tbl)}
                        className="touch-target text-emerald-600 hover:underline"
                      >
                        {t("tables.qrButton")}
                      </button>
                      <WriteNfcCardButton label={tbl.label} />
                      <button
                        onClick={() => handleDelete(tbl)}
                        className="touch-target text-red-600 hover:underline"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tables?.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                    {t("tables.noTables")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <TableQrModal table={qrTable} onClose={() => setQrTable(null)} />
    </div>
  );
}
