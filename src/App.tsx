import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/Login/LoginPage";
import CheckoutPage from "./pages/Checkout/CheckoutPage";
import TableSettlePage from "./pages/Checkout/TableSettlePage";
import ProductsPage from "./pages/Products/ProductsPage";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import InventoryPage from "./pages/Inventory/InventoryPage";
import OrderHistoryPage from "./pages/Orders/OrderHistoryPage";
import OrderQueuePage from "./pages/Orders/OrderQueuePage";
import SuppliersPage from "./pages/Admin/SuppliersPage";
import TablesPage from "./pages/Admin/TablesPage";
import PurchaseOrdersPage from "./pages/Inventory/PurchaseOrdersPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import StoresPage from "./pages/Admin/StoresPage";
import UsersPage from "./pages/Admin/UsersPage";
import PublicOrderPage from "./pages/PublicOrder/PublicOrderPage";
import PickupDisplayPage from "./pages/PublicOrder/PickupDisplayPage";
import ReceiptDisplayPage from "./pages/PublicOrder/ReceiptDisplayPage";
import TabDisplayPage from "./pages/PublicOrder/TabDisplayPage";
import HomePage from "./pages/Home/HomePage";
import MembersPage from "./pages/Members/MembersPage";
import DeliveryOrdersPage from "./pages/Delivery/DeliveryOrdersPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/order/:storeId" element={<PublicOrderPage />} />
          <Route path="/pickup-display/:storeId" element={<PickupDisplayPage />} />
          <Route path="/receipt/:orderId" element={<ReceiptDisplayPage />} />
          <Route path="/tab-display/:storeId" element={<TabDisplayPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/tables" element={<TableSettlePage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/orders/queue" element={<OrderQueuePage />} />
              <Route path="/delivery" element={<DeliveryOrdersPage />} />

              <Route element={<ProtectedRoute allow={["ADMIN", "MANAGER"]} />}>
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/suppliers" element={<SuppliersPage />} />
                <Route path="/admin/tables" element={<TablesPage />} />
                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="/members" element={<MembersPage />} />
              </Route>

              <Route element={<ProtectedRoute allow={["ADMIN"]} />}>
                <Route path="/admin/stores" element={<StoresPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
