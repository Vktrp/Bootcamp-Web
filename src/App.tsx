import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleGuard from '@/app/guards/RoleGuard';
import ProductListPage from '@/features/catalog/ProductListPage';
import ProductPage from '@/features/catalog/ProductPage';
import CartPage from '@/features/cart/CartPage';
import CheckoutPage from '@/features/checkout/CheckoutPage';
import AdminDashboard from '@/features/admin/Dashboard';
import SellerDashboard from '@/features/seller/SellerDashboard';
import PrivacyPage from '@/features/rgpd/PrivacyPage';
import CookieBanner from '@/features/rgpd/CookieBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function App() {
return (
<BrowserRouter>
<div className="min-h-screen flex flex-col">
<Header />
<main className="flex-1 container mx-auto px-4 py-6">
<Routes>
<Route path="/" element={<Navigate to="/products" replace />} />
<Route path="/products" element={<ProductListPage />} />
<Route path="/product/:slug" element={<ProductPage />} />
<Route path="/cart" element={<CartPage />} />
<Route path="/checkout" element={<CheckoutPage />} />
<Route path="/admin" element={<RoleGuard action="manageUsers"><AdminDashboard /></RoleGuard>} />
<Route path="/seller" element={<RoleGuard action="manageStock"><SellerDashboard /></RoleGuard>} />
<Route path="/rgpd/privacy" element={<PrivacyPage />} />
</Routes>
</main>
<Footer />
<CookieBanner />
<Toaster richColors position="top-center" />
</div>
</BrowserRouter>
);
}