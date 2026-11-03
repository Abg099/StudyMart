import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";

const OrderHistory = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error.message);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Loading your orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          My Orders
        </h1>

        <p className="mb-8 text-gray-500">
          View and track your previous orders.
        </p>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mb-5 text-gray-500">
              Your placed orders will appear here.
            </p>

            <Link
              to="/shop"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium break-all">
                      {order.id}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Ordered on
                    </p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm text-gray-500">Total amount</p>
                    <p className="text-xl font-bold">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm capitalize text-blue-700">
                      {order.order_status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-5 border-t pt-4 text-sm">
                  <p>
                    Payment:{" "}
                    <span className="font-medium uppercase">
                      {order.payment_method}
                    </span>
                  </p>

                  <p>
                    Payment status:{" "}
                    <span className="font-medium capitalize">
                      {order.payment_status}
                    </span>
                  </p>
                </div>

                <Link
                  to={`/order-success/${order.id}`}
                  className="mt-4 inline-block font-medium text-blue-600 hover:underline"
                >
                  View order details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;