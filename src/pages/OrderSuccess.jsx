
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { user, loading } = useAuth();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !user) return;

    async function fetchOrder() {
      setFetching(true);
      setError("");

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        setError("Unable to find this order.");
        setFetching(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemError) {
        setError("Unable to load order items.");
      } else {
        setOrder(orderData);
        setItems(itemData || []);
      }

      setFetching(false);
    }

    fetchOrder();
  }, [orderId, user, loading]);

  if (loading || fetching) {
    return <p className="p-10 text-center">Loading order...</p>;
  }

  if (!user) {
    return <main className="p-10 text-center">Please log in to view this order.</main>;
  }

  if (error || !order) {
    return (
      <main className="p-10 text-center">
        <p className="text-red-600">{error || "Order not found."}</p>
        <Link to="/shop" className="mt-4 inline-block text-teal-700">
          Back to Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl">
          ✓
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-teal-700">
          StudyMart
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Order placed successfully!
        </h1>

        <p className="mt-3 text-slate-500">
          Thank you for shopping with us. Your order has been recorded.
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-5 text-left">
          <p className="text-xs text-slate-500">Order ID</p>
          <p className="mt-1 break-all font-semibold">{order.id}</p>

          <div className="mt-5 flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Order status</span>
            <span className="font-semibold capitalize">
              {order.order_status}
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Payment method</span>
            <span className="font-semibold">
              {order.payment_method === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Payment status</span>
            <span className="font-semibold capitalize">
              {order.payment_status}
            </span>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="font-semibold">Items ordered</p>

            {items.map((item) => (
              <div
                key={item.id}
                className="mt-3 flex justify-between gap-3 text-sm"
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span className="shrink-0">
                  ₹{Number(item.line_total).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-between border-t border-slate-200 pt-4 font-bold">
            <span>Total</span>
            <span>
              ₹{Number(order.total_amount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <Link
          to="/shop"
          className="mt-7 inline-block rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-teal-700"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
