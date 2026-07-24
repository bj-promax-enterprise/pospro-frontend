import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useCategories";
import { useT } from "../../i18n/useT";
import type { Category } from "../../types";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const t = useT();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setError(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setError(null);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, name });
      } else {
        await createMutation.mutateAsync(name);
      }
      setModalOpen(false);
    } catch {
      setError(t("categories.saveFailed"));
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(t("categories.confirmDelete", { name: category.name }))) return;
    try {
      await deleteMutation.mutateAsync(category.id);
    } catch {
      alert(t("categories.deleteFailed"));
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("categories.title")}</h1>
        <Button onClick={openCreate}>{t("categories.newCategory")}</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("categories.name")}</th>
                <th className="px-4 py-3 font-medium">{t("categories.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{c.name}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="touch-target mr-3 text-blue-600 hover:underline"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="touch-target text-red-600 hover:underline"
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {categories?.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-slate-400">
                    {t("categories.noCategories")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t("categories.modalEditTitle") : t("categories.modalNewTitle")}
        onClose={() => setModalOpen(false)}
      >
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("categories.categoryName")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
