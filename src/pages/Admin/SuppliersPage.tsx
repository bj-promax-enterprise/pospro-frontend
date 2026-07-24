import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useCreateSupplier, useSuppliers, useUpdateSupplier } from "../../hooks/useSuppliers";
import { useT } from "../../i18n/useT";
import type { Supplier } from "../../types";

export default function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const t = useT();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    setName(editing?.name ?? "");
    setContact(editing?.contact ?? "");
    setPhone(editing?.phone ?? "");
    setAddress(editing?.address ?? "");
    setError(null);
  }, [modalOpen, editing]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError(t("suppliers.nameRequired"));
      return;
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: { name, contact, phone, address } });
      } else {
        await createMutation.mutateAsync({ name, contact, phone, address });
      }
      setModalOpen(false);
    } catch {
      setError(t("suppliers.saveFailed"));
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("suppliers.title")}</h1>
        <Button onClick={openCreate}>{t("suppliers.newSupplier")}</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("suppliers.name")}</th>
                <th className="px-4 py-3 font-medium">{t("suppliers.contact")}</th>
                <th className="px-4 py-3 font-medium">{t("suppliers.phone")}</th>
                <th className="px-4 py-3 font-medium">{t("suppliers.address")}</th>
                <th className="px-4 py-3 font-medium">{t("suppliers.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {suppliers?.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.contact ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.phone ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.address ?? "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(s)}
                      className="touch-target text-blue-600 hover:underline"
                    >
                      {t("common.edit")}
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t("suppliers.noSuppliers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t("suppliers.modalEditTitle") : t("suppliers.modalNewTitle")}
        onClose={() => setModalOpen(false)}
      >
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("suppliers.name")}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input mb-4" autoFocus />
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("suppliers.contact")}</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} className="input mb-4" />
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("suppliers.phone")}</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input mb-4" />
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("suppliers.address")}</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="input mb-4" />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("common.save")}</Button>
        </div>
      </Modal>
    </div>
  );
}
