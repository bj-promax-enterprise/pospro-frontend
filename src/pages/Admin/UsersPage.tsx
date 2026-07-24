import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useCreateUser, useUpdateUser, useUsers } from "../../hooks/useUsers";
import { useStores } from "../../hooks/useStores";
import { useAuthStore } from "../../stores/authStore";
import { useT } from "../../i18n/useT";
import type { AppUser, Role } from "../../types";

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "ADMIN";
  const { data: stores } = useStores();
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const t = useT();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("CASHIER");
  const [storeId, setStoreId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const allowedRoles: Role[] = isAdmin ? ["ADMIN", "MANAGER", "CASHIER"] : ["CASHIER"];

  useEffect(() => {
    if (!modalOpen) return;
    setUsername(editing?.username ?? "");
    setPassword("");
    setName(editing?.name ?? "");
    setRole(editing?.role ?? (isAdmin ? "CASHIER" : "CASHIER"));
    setStoreId(editing?.storeId ?? currentUser?.storeId ?? "");
    setError(null);
  }, [modalOpen, editing, isAdmin, currentUser]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(user: AppUser) {
    setEditing(user);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setError(null);
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          input: {
            name,
            role,
            storeId: role === "ADMIN" ? null : storeId || null,
            ...(password ? { password } : {}),
          },
        });
      } else {
        if (!username.trim() || password.length < 6 || !name.trim()) {
          setError(t("admin.users.requiredFields"));
          return;
        }
        await createMutation.mutateAsync({
          username,
          password,
          name,
          role,
          storeId: role === "ADMIN" ? null : storeId || null,
        });
      }
      setModalOpen(false);
    } catch {
      setError(t("admin.users.saveFailed"));
    }
  }

  async function toggleActive(user: AppUser) {
    await updateMutation.mutateAsync({ id: user.id, input: { active: !user.active } });
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("admin.users.title")}</h1>
        <Button onClick={openCreate}>{t("admin.users.newUser")}</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("admin.users.name")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.username")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.role")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.store")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.status")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.username}</td>
                  <td className="px-4 py-3 text-slate-500">{t(`role.${u.role}`)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {stores?.find((s) => s.id === u.storeId)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        u.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.active ? t("admin.users.enabled") : t("admin.users.disabled")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(u)}
                      className="touch-target mr-3 text-blue-600 hover:underline"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => toggleActive(u)}
                      className="touch-target text-red-600 hover:underline"
                    >
                      {u.active ? t("admin.users.disable") : t("admin.users.enable")}
                    </button>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    {t("admin.users.noUsers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t("admin.users.modalEditTitle") : t("admin.users.modalNewTitle")}
        onClose={() => setModalOpen(false)}
      >
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("admin.users.username")}</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!!editing}
          className="input mb-4 disabled:bg-slate-100"
        />
        <label className="mb-1 block text-sm font-medium text-slate-600">
          {editing ? t("admin.users.resetPassword") : t("admin.users.password")}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input mb-4"
        />
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("admin.users.name")}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input mb-4" />
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("admin.users.role")}</label>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input mb-4">
          {allowedRoles.map((r) => (
            <option key={r} value={r}>
              {t(`role.${r}`)}
            </option>
          ))}
        </select>
        {role !== "ADMIN" && (
          <>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t("admin.users.store")}</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              disabled={!isAdmin}
              className="input mb-4 disabled:bg-slate-100"
            >
              <option value="">{t("admin.users.selectStore")}</option>
              {stores?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </>
        )}
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
