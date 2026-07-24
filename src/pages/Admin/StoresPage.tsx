import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useCreateStore, useStores, useUpdateStore } from "../../hooks/useStores";
import { useT } from "../../i18n/useT";
import StoreQrModal from "./StoreQrModal";
import type { Store } from "../../types";

export default function StoresPage() {
  const { data: stores, isLoading } = useStores();
  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore();
  const t = useT();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [qrStore, setQrStore] = useState<Store | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    setName(editing?.name ?? "");
    setAddress(editing?.address ?? "");
    setError(null);
  }, [modalOpen, editing]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(store: Store) {
    setEditing(store);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError(t("admin.stores.nameRequired"));
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: { name, address } });
      } else {
        await createMutation.mutateAsync({ name, address });
      }
      setModalOpen(false);
    } catch {
      setError(t("admin.stores.saveFailed"));
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("admin.stores.title")}</h1>
        <Button onClick={openCreate}>{t("admin.stores.newStore")}</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("admin.stores.name")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.stores.address")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.stores.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {stores?.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.address ?? "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(s)}
                      className="touch-target mr-3 text-blue-600 hover:underline"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => setQrStore(s)}
                      className="touch-target text-emerald-600 hover:underline"
                    >
                      {t("admin.stores.qrButton")}
                    </button>
                  </td>
                </tr>
              ))}
              {stores?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    {t("admin.stores.noStores")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t("admin.stores.modalEditTitle") : t("admin.stores.modalNewTitle")}
        onClose={() => setModalOpen(false)}
      >
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("admin.stores.name")}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input mb-4" autoFocus />
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("admin.stores.address")}</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="input mb-4" />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("common.save")}</Button>
        </div>
      </Modal>

      <StoreQrModal store={qrStore} onClose={() => setQrStore(null)} />
    </div>
  );
}
