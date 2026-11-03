
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import OnlineShopping from "./pages/OnlineShopping.jsx";
import LocalSellers from "./pages/LocalSellers.jsx";
import StudentMarketplace from "./pages/StudentMarketplace.jsx";
import Auth from "./pages/Auth.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import SellStudentProduct from "./pages/SellStudentProduct.jsx";
import ManageProducts from "./pages/ManageProducts.jsx";
import ManageStudentListings from "./pages/ManageStudentListings.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import Contact from "./pages/Contact.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import Profile from "./pages/Profile.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import { CartProvider } from "./context/CartContext";

function ComingSoon({ title }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-[.16em] text-brand">
        StudyMart
      </p>
      <h1 className="mt-3 text-3xl font-extrabold">{title}</h1>
      <p className="mt-3 text-slate-600">
        This page will be built in a later step.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<OnlineShopping />} />
        <Route path="/local-sellers" element={<LocalSellers />} />
        <Route path="/student-marketplace" element={<StudentMarketplace />} />

        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<ComingSoon title="Create an account" />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />

        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/sell-student-product" element={<SellStudentProduct />} />
        <Route path="/manage-products" element={<ManageProducts />} />
        <Route path="/manage-student-listings" element={<ManageStudentListings />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/contact" element={<Contact />} />
<Route path="/privacy" element={<Privacy />} />
<Route path="/terms" element={<Terms />} />  
<Route path="/profile" element={<Profile />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}
