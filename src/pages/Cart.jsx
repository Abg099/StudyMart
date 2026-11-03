
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { user, loading } = useAuth();
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();

  if (loading) {
    return <p className="p-10 text-center">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Your Shopping Cart
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {cartCount} item(s) in your cart
        </p>

        {cartItems.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-5xl">🛒</p>
            <h2 className="mt-4 text-xl font-bold">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Browse the store and add products to your cart.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
            <section className="space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-slate-50 sm:w-28">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase text-teal-700">
                      {item.category}
                    </p>
                    <h2 className="mt-1 font-bold text-slate-800">
                      {item.name}
                    </h2>
                    <p className="mt-1 font-semibold">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1.5"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="px-3 py-1.5 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="font-bold sm:text-right">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Order Summary</h2>

              <div className="mt-5 flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500">Delivery</span>
                <span>To be confirmed</span>
              </div>

              <div className="my-5 border-t border-slate-100" />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-xl bg-[#102A43] px-5 py-3 font-semibold text-white hover:bg-teal-700"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/shop"
                className="mt-4 block text-center text-sm font-semibold text-teal-700"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
