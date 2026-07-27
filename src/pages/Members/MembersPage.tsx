import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import {
  useCreateMember,
  useIssueCoupon,
  useMembers,
  useUpdateMember,
} from "../../hooks/useMembers";
import { useAuthStore } from "../../stores/authStore";
import { useT } from "../../i18n/useT";
import type { CouponDiscountType, Member } from "../../types";

export default function MembersPage() {
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === "ADMIN" || role === "MANAGER";
  const t = useT();

  const [search, setSearch] = useState("");
  const { data: members, isLoading } = useMembers(search || undefined);
  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();
  const issueCouponMutation = useIssueCoupon();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [couponMember, setCouponMember] = useState<Member | null>(null);
  const [couponType, setCouponType] = useState<CouponDiscountType>("FIXED");
  const [couponValue, setCouponValue] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    setPhone(editing?.phone ?? "");
    setName(editing?.name ?? "");
    setError(null);
  }, [modalOpen, editing]);

  useEffect(() => {
    if (!couponMember) return;
    setCouponType("FIXED");
    setCouponValue("");
    setCouponError(null);
    setCouponSuccess(null);
  }, [couponMember]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(member: Member) {
    setEditing(member);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setError(null);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: { name } });
      } else {
        if (!phone.trim() || !name.trim()) {
          setError(t("members.requiredFields"));
          return;
        }
        await createMutation.mutateAsync({ phone, name });
      }
      setModalOpen(false);
    } catch {
      setError(t("members.saveFailed"));
    }
  }

  async function toggleActive(member: Member) {
    await updateMutation.mutateAsync({ id: member.id, input: { active: !member.active } });
  }

  async function handleIssueCoupon() {
    if (!couponMember) return;
    setCouponError(null);
    setCouponSuccess(null);
    const value = couponType === "PERCENT" ? parseInt(couponValue, 10) : Math.round(parseFloat(couponValue) * 100);
    if (!value || value <= 0) {
      setCouponError(t("members.couponValueRequired"));
      return;
    }
    try {
      const coupon = await issueCouponMutation.mutateAsync({
        memberId: couponMember.id,
        input: { discountType: couponType, value },
      });
      setCouponSuccess(t("members.couponIssued", { code: coupon.code }));
      setCouponValue("");
    } catch {
      setCouponError(t("members.saveFailed"));
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{t("members.title")}</h1>
        <Button onClick={openCreate}>{t("members.newMember")}</Button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("members.searchPlaceholder")}
          className="input max-w-xs"
        />
      </div>

      {isLoading ? (
        <p className="text-slate-500">{t("common.loading")}</p>
      ) : (
        <div className="card-table">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t("members.name")}</th>
                <th className="px-4 py-3 font-medium">{t("members.phone")}</th>
                <th className="px-4 py-3 font-medium">{t("members.points")}</th>
                <th className="px-4 py-3 font-medium">{t("members.status")}</th>
                <th className="px-4 py-3 font-medium">{t("members.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {members?.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{m.name}</td>
                  <td className="px-4 py-3 text-slate-500">{m.phone}</td>
                  <td className="px-4 py-3 text-slate-700">{m.pointsBalance}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        m.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.active ? t("members.enabled") : t("members.disabled")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && (
                      <>
                        <button
                          onClick={() => openEdit(m)}
                          className="touch-target mr-3 text-blue-600 hover:underline"
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          onClick={() => setCouponMember(m)}
                          className="touch-target mr-3 text-emerald-600 hover:underline"
                        >
                          {t("members.issueCoupon")}
                        </button>
                        <button
                          onClick={() => toggleActive(m)}
                          className="touch-target text-red-600 hover:underline"
                        >
                          {m.active ? t("members.disable") : t("members.enable")}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {members?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t("members.noMembers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t("members.modalEditTitle") : t("members.modalNewTitle")}
        onClose={() => setModalOpen(false)}
      >
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("members.phone")}</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={!!editing}
          className="input mb-4 disabled:bg-slate-100"
        />
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("members.name")}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input mb-4" />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("common.save")}</Button>
        </div>
      </Modal>

      <Modal
        open={!!couponMember}
        title={couponMember ? t("members.issueCouponTitle", { name: couponMember.name }) : ""}
        onClose={() => setCouponMember(null)}
      >
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setCouponType("FIXED")}
            className={`touch-target flex-1 rounded-lg py-2 text-sm font-semibold ${
              couponType === "FIXED" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {t("members.fixedAmount")}
          </button>
          <button
            onClick={() => setCouponType("PERCENT")}
            className={`touch-target flex-1 rounded-lg py-2 text-sm font-semibold ${
              couponType === "PERCENT" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {t("members.percentOff")}
          </button>
        </div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t("members.couponValue")}</label>
        <input
          type="number"
          min={0}
          step={couponType === "PERCENT" ? 1 : 0.01}
          value={couponValue}
          onChange={(e) => setCouponValue(e.target.value)}
          className="input mb-4"
        />
        {couponError && <p className="mb-4 text-sm text-red-600">{couponError}</p>}
        {couponSuccess && <p className="mb-4 text-sm text-green-600">{couponSuccess}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCouponMember(null)}>
            {t("common.close")}
          </Button>
          <Button onClick={handleIssueCoupon} disabled={issueCouponMutation.isPending}>
            {t("members.issueCoupon")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
