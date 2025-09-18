import { createBrowserRouter } from "react-router-dom";
import RoleGuard from "./guards/RoleGuard";
import Dashboard from "../features/admin/Dashboard";
import StockTable from "../features/admin/StockTable";
import ProductForm from "../features/admin/ProductForm";
import UsersPage from "../features/admin/UsersTable";
// ... autres imports

export const router = createBrowserRouter([
  // ...
  {
    path: "/admin",
    element: (
      <RoleGuard action="view_admin">
        <Dashboard />
      </RoleGuard>
    ),
  },
  {
    path: "/admin/stock",
    element: (
      <RoleGuard action="view_admin">
        <StockTable />
      </RoleGuard>
    ),
  },
  {
    path: "/admin/create-product",
    element: (
      <RoleGuard action="view_admin">
        <ProductForm />
      </RoleGuard>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <RoleGuard action="view_admin">
        <UsersPage />
      </RoleGuard>
    ),
  },
  // ...
]);
