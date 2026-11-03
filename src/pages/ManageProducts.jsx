import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Books & Notes",
  stock: "1",
};

export default function ManageProducts() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [checking, setChecking] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [message, setMessage] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function loadData() {
      if (!user) {
        navigate("/login");
        return;
      }

      if (role !== "local_seller") {
        setChecking(false);
        return;
      }

      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("id, shop_name")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (shopError) {
        setFetchError(shopError.message);
        setChecking(false);
        return;
      }

      if (!shopData) {
        navigate("/seller-dashboard");
        return;
      }

      setShop(shopData);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopData.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (productError) {
        setFetchError(productError.message);
      } else {
        setProducts(productData || []);
      }

      setChecking(false);
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (!newImage) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(newImage);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [newImage]);

  function startEditing(product) {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "Books & Notes",
      stock: String(product.stock ?? 0),
    });

    setNewImage(null);
    setMessage("");
    setFetchError("");
  }

  function cancelEditing() {
    setEditingProduct(null);
    setForm(emptyForm);
    setNewImage(null);
    setMessage("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFetchError("Please select a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFetchError("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setFetchError("");
    setNewImage(file);
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!editingProduct || !shop || !user) return;

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setFetchError("Please enter a product name.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setFetchError("Enter a valid product price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFetchError("Stock must be a whole number of 0 or more.");
      return;
    }

    setSaving(true);
    setFetchError("");
    setMessage("");

    let uploadedImagePath = null;
    let updatedImageUrl = editingProduct.image_url;

    try {
      if (newImage) {
        const extension = newImage.name.split(".").pop().toLowerCase();
        uploadedImagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(uploadedImagePath, newImage, {
            contentType: newImage.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: imageData } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadedImagePath);

        updatedImageUrl = imageData.publicUrl;
      }

      const { data, error } = await supabase
        .from("products")
        .update({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price,
          category: form.category,
          stock,
          image_url: updatedImageUrl,
        })
        .eq("id", editingProduct.id)
        .eq("shop_id", shop.id)
        .select()
        .single();

      if (error) throw error;

      setProducts((previous) =>
        previous.map((product) =>
          product.id === data.id ? data : product
        )
      );

      setEditingProduct(null);
      setForm(emptyForm);
      setNewImage(null);
      setMessage("Product updated successfully!");
    } catch (error) {
      console.error("Product update failed:", error);

      if (uploadedImagePath) {
        await supabase.storage
          .from("product-images")
          .remove([uploadedImagePath]);
      }

      setFetchError(error.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`
    );

    if (!confirmed || !shop) return;

    setDeletingId(product.id);
    setFetchError("");
    setMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .eq("shop_id", shop.id);

    if (error) {
      setFetchError(error.message);
    } else {
      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );

      if (editingProduct?.id === product.id) {
        cancelEditing();
      }

      setMessage("Product deleted successfully.");
    }

    setDeletingId(null);
  }

  if (loading || checking) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading your products...</p>
      </main>
    );
  }

  if (!user) return null;

  if (role !== "local_seller") {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Seller access only</h1>
        <Link to="/" className="mt-5 inline-block text-teal-700">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/seller-dashboard"
          className="text-sm font-semibold text-teal-700 hover:underline"
        >
          ← Back to Seller Dashboard
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
              {shop?.shop_name}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My Products
            </h1>
            <p className="mt-2 text-slate-600">
              Manage the products listed under your shop.
            </p>
          </div>

          <Link
            to="/add-product"
            className="inline-flex justify-center rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800"
          >
            + Add New Product
          </Link>
        </div>

        {message && (
          <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {message}
          </p>
        )}

        {fetchError && (
          <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {fetchError}
          </p>
        )}

        {editingProduct && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Edit Product
            </h2>

            <form onSubmit={handleUpdate} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Product Image
                </label>

                <img
                  src={preview || editingProduct.image_url}
                  alt={form.name}
                  className="mb-3 h-48 w-48 rounded-xl border border-slate-200 object-cover"
                />

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Leave empty to keep the current image. Maximum 5 MB.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Product Name *
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Category *
                  </span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <option>Books & Notes</option>
                    <option>Electronics</option>
                    <option>Stationery</option>
                    <option>Accessories</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Price (₹) *
                  </span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Stock *
                  </span>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Description
                </span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <p className="text-4xl">📦</p>
            <h2 className="mt-4 text-xl font-bold text-slate-800">
              No products yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add your first product to make it visible to students.
            </p>
            <Link
              to="/add-product"
              className="mt-5 inline-block rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative bg-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center text-5xl">
                      📦
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      product.stock > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase text-teal-700">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Available stock: {product.stock}
                  </p>

                  {product.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      className="flex-1 rounded-lg bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="flex-1 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}