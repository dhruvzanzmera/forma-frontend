import { Navigate, Route, Routes } from "react-router-dom";
import { Guard } from "./ProtectedRoute";
import { StoreRoute, CartRoute } from "./StoreRoutes";
import { AuthPage, VerifyPage } from "../pages/auth/AuthPage";
import { ProfilePage } from "../pages/account/ProfilePage";
import { AddressesPage, AddressFormPage } from "../pages/account/AddressesPage";
import { CheckoutPage } from "../pages/account/CheckoutPage";
import { OrderSuccess } from "../pages/account/OrderSuccessPage";
import { OrdersPage, OrderDetails } from "../pages/account/OrdersPage";
import { AdminDashboard } from "../pages/admin/DashboardPage";
import { AdminProducts, AdminProductForm } from "../pages/admin/ProductsPage";
import { AdminCategories } from "../pages/admin/CategoriesPage";
import {
  AdminCustomers,
  AdminCustomerDetail,
} from "../pages/admin/CustomersPage";
import { AdminOrders, AdminOrderDetails } from "../pages/admin/OrdersPage";
import { StoreLayout } from "../layouts/StoreLayout";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StoreRoute />} />
      <Route path="/products" element={<StoreRoute />} />
      <Route path="/products/:idOrSlug" element={<StoreRoute />} />
      <Route path="/categories/:slug" element={<StoreRoute />} />
      <Route path="/search" element={<StoreRoute />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/admin/login" element={<AuthPage mode="login" admin />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/verify-otp" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
      <Route path="/reset-password" element={<AuthPage mode="reset" />} />
      <Route
        path="/profile"
        element={
          <Guard>
            <StoreLayout>
              <ProfilePage />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/change-password"
        element={
          <Guard>
            <StoreLayout>
              <AuthPage mode="change" />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/addresses"
        element={
          <Guard>
            <StoreLayout>
              <AddressesPage />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/addresses/new"
        element={
          <Guard>
            <StoreLayout>
              <AddressFormPage />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/addresses/:id/edit"
        element={
          <Guard>
            <StoreLayout>
              <AddressFormPage />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/cart"
        element={
          <Guard>
            <CartRoute />
          </Guard>
        }
      />
      <Route
        path="/checkout"
        element={
          <Guard>
            <StoreLayout>
              <CheckoutPage />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/order-success"
        element={
          <Guard>
            <StoreLayout>
              <OrderSuccess />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/orders"
        element={
          <Guard>
            <StoreLayout>
              <OrdersPage />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <Guard>
            <StoreLayout>
              <OrderDetails />
            </StoreLayout>
          </Guard>
        }
      />
      <Route
        path="/admin"
        element={
          <Guard admin>
            <AdminDashboard />
          </Guard>
        }
      />
      <Route
        path="/admin/products"
        element={
          <Guard admin>
            <AdminProducts />
          </Guard>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <Guard admin>
            <AdminProductForm />
          </Guard>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <Guard admin>
            <AdminProductForm />
          </Guard>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <Guard admin>
            <AdminCategories />
          </Guard>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <Guard admin>
            <AdminCustomers />
          </Guard>
        }
      />
      <Route
        path="/admin/customers/:id"
        element={
          <Guard admin>
            <AdminCustomerDetail />
          </Guard>
        }
      />
      <Route
        path="/admin/customers/:id/orders"
        element={
          <Guard admin>
            <AdminCustomerDetail ordersOnly />
          </Guard>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <Guard admin>
            <AdminOrders />
          </Guard>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <Guard admin>
            <AdminOrderDetails />
          </Guard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
