import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePeakHours, useReportsSummary, useRevenue, useStaffPerformance, useTopProducts } from "../../hooks/useReports";
import { useStores } from "../../hooks/useStores";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { formatCurrency } from "../../utils/currency";
import { useT } from "../../i18n/useT";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  // UTF-8 BOM so Excel on Windows renders Chinese characters correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: stores } = useStores();
  const [storeId, setStoreId] = useState<string>(user?.storeId ?? "");
  const currency = usePreferencesStore((s) => s.currency);
  const t = useT();

  useEffect(() => {
    if (isAdmin && !storeId && stores && stores.length > 0) {
      setStoreId(stores[0].id);
    }
  }, [isAdmin, storeId, stores]);

  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));

  const effectiveStoreId = isAdmin ? storeId || undefined : undefined;
  const query = { period, from, to: `${to}T23:59:59`, storeId: effectiveStoreId };

  const { data: revenue, isLoading: revenueLoading } = useRevenue(query);
  const { data: topProducts } = useTopProducts({ ...query, limit: 10 });
  const { data: summary } = useReportsSummary(query);
  const { data: peakHours, isLoading: peakHoursLoading } = usePeakHours(query);
  const { data: staffPerformance } = useStaffPerformance(query);

  function handleExport() {
    const centsToAmount = (cents: number) => (cents / 100).toFixed(2);
    const rows: (string | number)[][] = [];

    rows.push([t("reports.title"), `${from} ${t("reports.to")} ${to}`]);
    rows.push([]);
    rows.push([t("reports.revenue"), t("reports.orderCount"), t("reports.refundAmount"), t("reports.avgOrderValue")]);
    rows.push([
      centsToAmount(summary?.totalRevenueCents ?? 0),
      summary?.totalOrders ?? 0,
      centsToAmount(summary?.totalRefundsCents ?? 0),
      centsToAmount(summary?.avgOrderValueCents ?? 0),
    ]);
    rows.push([]);

    rows.push([t("reports.revenueTrend")]);
    rows.push([t("reports.date"), t("reports.revenue"), t("reports.orderCount")]);
    (revenue ?? []).forEach((r) => rows.push([r.date, centsToAmount(r.revenueCents), r.orderCount]));
    rows.push([]);

    rows.push([t("reports.topProducts")]);
    rows.push([t("reports.product"), t("reports.salesQty"), t("reports.salesAmount")]);
    (topProducts ?? []).forEach((p) => rows.push([p.name, p.quantitySold, centsToAmount(p.revenueCents)]));
    rows.push([]);

    rows.push([t("reports.staffPerformance")]);
    rows.push([t("reports.staff"), t("reports.orderCount"), t("reports.revenue"), t("reports.avgOrderValue")]);
    (staffPerformance ?? []).forEach((s) =>
      rows.push([
        s.userName ?? t("reports.selfOrder"),
        s.orderCount,
        centsToAmount(s.revenueCents),
        centsToAmount(s.avgOrderValueCents),
      ])
    );

    downloadCsv(`report_${from}_${to}.csv`, rows);
  }

  const chartData = (revenue ?? []).map((r) => ({ ...r, revenue: r.revenueCents / 100 }));
  const peakHoursData = (peakHours ?? []).map((p) => ({
    ...p,
    hourLabel: `${String(p.hour).padStart(2, "0")}:00`,
    revenue: p.revenueCents / 100,
  }));

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-800">{t("reports.title")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && stores && stores.length > 0 && (
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="input max-w-xs">
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          <span className="text-slate-400">{t("reports.to")}</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="input"
          >
            <option value="daily">{t("reports.daily")}</option>
            <option value="weekly">{t("reports.weekly")}</option>
            <option value="monthly">{t("reports.monthly")}</option>
          </select>
          <Button variant="secondary" onClick={handleExport}>
            {t("reports.exportCsv")}
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t("reports.revenue")} value={formatCurrency(summary?.totalRevenueCents ?? 0, currency)} />
        <StatCard label={t("reports.orderCount")} value={String(summary?.totalOrders ?? 0)} />
        <StatCard
          label={t("reports.refundAmount")}
          value={formatCurrency(summary?.totalRefundsCents ?? 0, currency)}
        />
        <StatCard
          label={t("reports.avgOrderValue")}
          value={formatCurrency(summary?.avgOrderValueCents ?? 0, currency)}
        />
      </div>

      <div className="mb-6 card">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">{t("reports.revenueTrend")}</h2>
        {revenueLoading ? (
          <p className="text-slate-400">{t("reports.loading")}</p>
        ) : chartData.length === 0 ? (
          <p className="text-slate-400">{t("reports.noDataInRange")}</p>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Math.round(Number(value) * 100), currency)} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mb-6 card">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">{t("reports.peakHours")}</h2>
        {peakHoursLoading ? (
          <p className="text-slate-400">{t("reports.loading")}</p>
        ) : peakHoursData.every((p) => p.orderCount === 0) ? (
          <p className="text-slate-400">{t("reports.noDataInRange")}</p>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hourLabel" tick={{ fontSize: 12 }} interval={1} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue" ? formatCurrency(Math.round(Number(value) * 100), currency) : value
                  }
                />
                <Bar dataKey="orderCount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">{t("reports.topProducts")}</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 font-medium">{t("reports.product")}</th>
                <th className="py-2 font-medium">{t("reports.salesQty")}</th>
                <th className="py-2 font-medium">{t("reports.salesAmount")}</th>
              </tr>
            </thead>
            <tbody>
              {topProducts?.map((p, idx) => (
                <tr key={p.productId} className="border-t border-slate-100">
                  <td className="py-2 text-slate-700">
                    <span className="mr-2 text-slate-400">#{idx + 1}</span>
                    {p.name}
                  </td>
                  <td className="py-2 text-slate-500">{p.quantitySold}</td>
                  <td className="py-2 text-slate-700">{formatCurrency(p.revenueCents, currency)}</td>
                </tr>
              ))}
              {topProducts?.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    {t("reports.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">{t("reports.staffPerformance")}</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 font-medium">{t("reports.staff")}</th>
                <th className="py-2 font-medium">{t("reports.orderCount")}</th>
                <th className="py-2 font-medium">{t("reports.revenue")}</th>
                <th className="py-2 font-medium">{t("reports.avgOrderValue")}</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance?.map((s) => (
                <tr key={s.userId ?? "self-order"} className="border-t border-slate-100">
                  <td className="py-2 text-slate-700">{s.userName ?? t("reports.selfOrder")}</td>
                  <td className="py-2 text-slate-500">{s.orderCount}</td>
                  <td className="py-2 text-slate-700">{formatCurrency(s.revenueCents, currency)}</td>
                  <td className="py-2 text-slate-500">{formatCurrency(s.avgOrderValueCents, currency)}</td>
                </tr>
              ))}
              {staffPerformance?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    {t("reports.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card card-hover">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
