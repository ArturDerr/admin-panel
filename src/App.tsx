import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import CouponsPage from "./pages/CouponsPage";
import ChatsPage from "./pages/ChatsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import BansPage from "./pages/BansPage";
import ProductModerationPage from "./pages/ProductModerationPage";

import { isAuthenticated } from "./api/auth";

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  return isAuthenticated() ? (
    <Navigate to="/dashboard/products" replace />
  ) : (
    <Outlet />
  );
}

function App() {
  return (
    <Routes>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="bans" element={<BansPage />} />
          <Route
            path="product-moderation"
            element={<ProductModerationPage />}
          />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard/products" replace />} />
      <Route path="*" element={<Navigate to="/dashboard/products" replace />} />
    </Routes>
  );
}

export default App;
