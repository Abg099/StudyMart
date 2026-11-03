import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  shop_name: "",
  description: "",
  category: "Books & Stationery",
  city: "",
  address: "",
  phone: "",
};

export default function SellerDashboard() {
  const { user, role, loading } = useAuth();

  const [shop, setShop] = useState(null);
  const [checkingShop, setCheckingShop] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function fetchShop() {
      if (!user || role !== "local_seller") {
        setCheckingShop(false);
        return;
      }

      setCheckingShop(true);

      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setShop(data);
      }

      setCheckingShop(false);
    }

    fetchShop();

    return () => {
      cancelled = true;
    };
  }, [user, role, loading]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openEditForm() {
    setForm({
      shop_name: shop.shop_name || "",
      description: shop.description || "",
      category: shop.category || "Books & Stationery",
      city: shop.city || "",
      address: shop.address || "",
      phone: shop.phone || "",
    });

    setEditing(true);
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user || role !== "local_seller") return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    const shopDetails = {
      shop_name: form.shop_name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      city: form.city.trim(),
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
    };

    let result;

    if (editing && shop) {
      result = await supabase
        .from("shops")
        .update(shopDetails)
        .eq("id", shop.id)
        .eq("owner_id", user.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("shops")
        .insert({
          owner_id: user.id,
          ...shopDetails,
        })
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      setShop(result.data);
      setEditing(false);
      setSuccess(
        editing
          ? "Your shop details have been updated successfully!"
          : "Your shop has been registered successfully!"
      );
    }

    setSubmitting(false);
  }

  async function handleDeleteShop() {
    if (!shop || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your shop? All products listed under this shop will also be deleted. This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    const { error } = await supabase
      .from("shops")
      .delete()
      .eq("id", shop.id)
      .eq("owner_id", user.id);

    if (error) {
      setError(error.message);
    } else {
      setShop(null);
      setForm(initialForm);
      setEditing(false);
      setSuccess("Your shop has been deleted successfully.");
    }

    setDeleting(false);
  }

  if (loading || checkingShop) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading seller dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Please log in first</h1>
        <p className="mt-2 text-slate-600">
          Log in to access your seller dashboard.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-block rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (role !== "local_seller") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Seller access only</h1>
        <p className="mt-2 text-slate-600">
          This dashboard is available to accounts registered as local sellers.
        </p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
            StudyMart for Business
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Seller Dashboard
          </h1>

          <p className="mt-3 text-slate-600">
            Manage your shop and showcase your products to students.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {success}
          </p>
        )}

        {shop && !editing ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Shop Registered
                </span>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  {shop.shop_name}
                </h2>

                <p className="mt-2 text-slate-600">
                  {shop.city}
                  {shop.category ? ` · ${shop.category}` : ""}
                </p>

                {shop.description && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {shop.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <p>
                <strong>Contact:</strong> {shop.phone || "Not provided"}
              </p>
              <p>
                <strong>Address:</strong> {shop.address || "Not provided"}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={openEditForm}
                className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
              >
                Edit Shop Details
              </button>

              <button
                type="button"
                onClick={handleDeleteShop}
                disabled={deleting}
                className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Shop"}
              </button>

               <Link
    to="/add-product"
    className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
  >
    + Add a Product
  </Link>

  <Link
    to="/manage-products"
    className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
  >
    Manage My Products
  </Link>
            </div>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-xl font-bold text-slate-900">
              {editing ? "Edit Shop Details" : "Register Your Shop"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {editing
                ? "Update your shop information below."
                : "Enter your shop details to get started."}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Shop Name *
                </label>
                <input
                  name="shop_name"
                  value={form.shop_name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Ganesh Book Depot"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-600"
                >
                  <option>Books & Stationery</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>College Supplies</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  City *
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Nagpur"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Contact Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="Shop contact number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Shop Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  maxLength={250}
                  placeholder="Area, street or landmark"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Shop Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell students what your shop sells..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-teal-700 px-5 py-3.5 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editing
                  ? "Save Changes"
                  : "Register My Shop"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}