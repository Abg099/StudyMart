
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { user, loading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    delivery_note: "",
    payment_method: "cod",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    const { data, error: orderError } = await supabase.rpc(
      "place_online_order",
      {
        p_full_name: form.full_name,
        p_phone: form.phone,
        p_address_line: form.address_line,
        p_city: form.city,
        p_state: form.state,
        p_pincode: form.pincode,
        p_delivery_note: form.delivery_note,
        p_payment_method: form.payment_method,
        p_items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }
    );

    setSubmitting(false);

    if (orderError) {
      console.error("Order placement failed:", orderError);
      setError(orderError.message || "Unable to place your order.");
      return;
    }

    clearCart();
    navigate(`/order-success/${data}`);
  }

  if (loading) {
    return <p className="p-10 text-center">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your delivery address and choose a payment method.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_350px]"
        >
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold">
              Delivery Address
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["full_name", "Full name", "text"],
                ["phone", "Phone number", "tel"],
                ["address_line", "House no. / Street / Area", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "PIN code", "text"],
              ].map(([name, label, type]) => (
                <label
                  key={name}
                  className="text-sm font-medium text-slate-700"
                >
                  {label}
                  <input
                    required
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    maxLength={name === "pincode" ? 6 : undefined}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Delivery instructions (optional)
              <textarea
                name="delivery_note"
                value={form.delivery_note}
                onChange={handleChange}
                rows="3"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                placeholder="Any directions for delivery?"
              />
            </label>

            <div className="my-7 border-t border-slate-100" />

            <h2 className="text-xl font-bold">Payment Method</h2>

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="radio"
                  name="payment_method"
                  value="online"
                  checked={form.payment_method === "online"}
                  onChange={handleChange}
                  className="mt-1 accent-teal-700"
                />
                <span>
                  <span className="block font-semibold">
                    Online Payment
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Payment gateway is not connected yet. No online
                    payment will be collected.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={form.payment_method === "cod"}
                  onChange={handleChange}
                  className="mt-1 accent-teal-700"
                />
                <span>
                  <span className="block font-semibold">
                    Cash on Delivery
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Pay when your order is delivered.
                  </span>
                </span>
              </label>
            </div>

            {error && (
              <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </section>

          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Order Summary</h2>

            <div className="mt-5 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-slate-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-[#102A43] px-5 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>

            <Link
              to="/cart"
              className="mt-4 block text-center text-sm font-semibold text-teal-700"
            >
              Back to Cart
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}
