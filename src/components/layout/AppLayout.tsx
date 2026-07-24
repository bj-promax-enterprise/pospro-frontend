import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  FolderTree,
  LayoutGrid,
  ListOrdered,
  LogOut,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useT } from "../../i18n/useT";
import PreferenceBar from "./PreferenceBar";
import type { Role } from "../../types";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/checkout", labelKey: "nav.checkout", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/orders", labelKey: "nav.orders", icon: Receipt, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/orders/queue", labelKey: "nav.orderQueue", icon: ListOrdered, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/products", labelKey: "nav.products", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { to: "/categories", labelKey: "nav.categories", icon: FolderTree, roles: ["ADMIN", "MANAGER"] },
  { to: "/inventory", labelKey: "nav.inventory", icon: Warehouse, roles: ["ADMIN", "MANAGER"] },
  { to: "/admin/suppliers", labelKey: "nav.suppliers", icon: Truck, roles: ["ADMIN", "MANAGER"] },
  { to: "/admin/tables", labelKey: "nav.tables", icon: LayoutGrid, roles: ["ADMIN", "MANAGER"] },
  { to: "/purchase-orders", labelKey: "nav.purchaseOrders", icon: ClipboardList, roles: ["ADMIN", "MANAGER"] },
  { to: "/reports", labelKey: "nav.reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { to: "/admin/stores", labelKey: "nav.stores", icon: Store, roles: ["ADMIN"] },
  { to: "/admin/users", labelKey: "nav.users", icon: Users, roles: ["ADMIN", "MANAGER"] },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full">
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="mb-3 text-lg font-bold tracking-tight text-slate-800">POSPro</p>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{t(`role.${user.role}`)}</p>
              {user.storeName && <p className="truncate text-xs text-slate-400">{user.storeName}</p>}
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `touch-target group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} strokeWidth={2} className="flex-shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-2">
          <button
            onClick={handleLogout}
            className="touch-target flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} strokeWidth={2} />
            {t("nav.logout")}
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <PreferenceBar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
