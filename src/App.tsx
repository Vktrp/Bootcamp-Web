import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductListPage from "./features/catalog/ProductListPage";
import ProductPage from "./features/catalog/ProductPage";
import CartPage from "./features/cart/CartPage";
import CheckoutPage from "./features/checkout/CheckoutPage";
import OrderConfirmation from "./features/checkout/OrderConfirmation";
import ConsentBanner from "./features/rgpd/ConsentBanner";
import SellerDashboard from "./features/seller/SellerDashboard";
import AdminDashboard from "./features/admin/Dashboard";
import StockTable from "./features/admin/StockTable";
import ProductForm from "./features/admin/ProductForm";
import RoleGuard from "./app/guards/RoleGuard";
import LoginPage from "./features/auth/LoginPage";
import AccountPage from "./features/Account/AccountPage";
import OrderListPage from "./features/orders/OrderListPage";
import OrderDetailPage from "./features/orders/OrderDetailPage";
import PrivacyPage from "./features/rgpd/PrivacyPage";
import FavoritesPage from "./features/favorites/FavoritesPage";

export default function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/success/:orderId"
            element={<OrderConfirmation />}
          />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/seller"
            element={
              <RoleGuard action="manageStock">
                <SellerDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleGuard action="manageUsers">
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/stock"
            element={
              <RoleGuard action="manageStock">
                <StockTable />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <RoleGuard action="manageUsers">
                <ProductForm />
              </RoleGuard>
            }
          />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/rgpd/privacy" element={<PrivacyPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </main>
      <Footer />
      <ConsentBanner />
    </div>
  );
}
