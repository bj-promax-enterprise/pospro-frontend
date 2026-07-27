import {
  BarChart3,
  Bike,
  ClipboardList,
  Contact,
  FolderTree,
  Home,
  LayoutGrid,
  ListOrdered,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../types";

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  roles: Role[];
}

// Single source of truth for the app's feature list: the sidebar renders it
// as a nav list, the home page renders the same items as an icon grid.
export const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/checkout", labelKey: "nav.checkout", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/orders", labelKey: "nav.orders", icon: Receipt, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/orders/queue", labelKey: "nav.orderQueue", icon: ListOrdered, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/delivery", labelKey: "nav.delivery", icon: Bike, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { to: "/members", labelKey: "nav.members", icon: Contact, roles: ["ADMIN", "MANAGER"] },
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
