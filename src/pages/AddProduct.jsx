
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AddProduct() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  const [shop, setShop] = useState(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Books & Notes",
    stock: "1",
  });

  useEffect(() => {
    async function checkSeller() {
      if (loading) return;

      if (!user) {
        navigate("/login");
        return;
      }

      if (role !== "local_seller") {
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("shops")
        .select("id, shop_name")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Shop check failed:", error.message);
        setErrorMessage("Unable to verify your registered shop.");
      } else if (!data) {
        navigate("/seller-dashboard");
        return;
      } else {
        setShop(data);
      }

      setChecking(false);
    }

    checkSeller();
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(image);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [image]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setErrorMessage("");
    setMessage("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Please select a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
  }

  function removeImage() {
    setImage(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!shop || role !== "local_seller") {
      setErrorMessage("You are not allowed to list products here.");
      return;
    }

    if (!image) {
      setErrorMessage("Please upload a product image.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setErrorMessage("Please enter a product name.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setErrorMessage("Enter a valid product price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setErrorMessage("Stock must be a whole number of 0 or more.");
      return;
    }

    setSaving(true);

    let uploadedImagePath = null;

    try {
      const extension = image.name.split(".").pop().toLowerCase();
      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      // Upload product image to Supabase Storage.
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, image, {
          contentType: image.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      uploadedImagePath = filePath;

      // Get publicly accessible image URL.
      const { data: imageData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      const imageUrl = imageData.publicUrl;

      // Save product and connect it to the registered shop.
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          shop_id: shop.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          price,
          category: form.category,
          image_url: imageUrl,
          stock,
          is_active: true,
        });

      if (insertError) throw insertError;

      setMessage("Product added successfully!");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "Books & Notes",
        stock: "1",
      });

      setImage(null);

    } catch (error) {
      console.error("Product upload failed:", error);

      // Remove uploaded image if saving the product failed.
      if (uploadedImagePath) {
        await supabase.storage
          .from("product-images")
          .remove([uploadedImagePath]);
      }

      setErrorMessage(
        error.message || "Unable to add product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || checking) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F8FA]">
        <p className="text-sm font-medium text-slate-600">
          Checking your seller account...
        </p>
      </main>
    );
  }

  if (!user) return null;

  if (role !== "local_seller") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F8FA] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="text-4xl">🎓</div>

          <h1 className="mt-4 text-xl font-bold text-slate-800">
            Student Marketplace
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Only registered local sellers can upload products here.
            As a student, please use the Student Marketplace.
          </p>

          <button
            type="button"
            onClick={() => navigate("/student-marketplace")}
            className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Go to Student Marketplace
          </button>
        </div>
      </main>
    );
  }

  if (errorMessage && !shop) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F8FA] px-4">
        <div className="max-w-md rounded-2xl bg-white p-7 text-center shadow-sm">
          <p className="text-sm text-red-600">{errorMessage}</p>

          <button
            type="button"
            onClick={() => navigate("/seller-dashboard")}
            className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!shop) return null;

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">

        <button
          type="button"
          onClick={() => navigate("/seller-dashboard")}
          className="mb-5 text-sm font-semibold text-teal-700 hover:underline"
        >
          ← Back to Seller Dashboard
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
            Local Seller
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            Add a Product
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Adding a product to <strong>{shop.shop_name}</strong>
          </p>

          {message && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {message}
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">

            {/* Product image */}
            <div>
              <span className="mb-2 block text-sm font-semibold">
                Product Image *
              </span>

              {preview ? (
                <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={preview}
                    alt="Product preview"
                    className="h-56 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-3 top-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 text-center transition hover:border-teal-500 hover:bg-teal-50">
                  <span className="text-4xl">📷</span>

                  <span className="mt-3 text-sm font-semibold text-slate-700">
                    Click to upload product image
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG or WebP · Maximum 5 MB
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {preview && (
                <label className="mt-3 inline-block cursor-pointer text-sm font-semibold text-teal-700 hover:underline">
                  Change image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Product name */}
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
                placeholder="e.g. Engineering Mathematics Book"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </label>

            {/* Description */}
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
                placeholder="Describe the product..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
              />
            </label>

            {/* Price and stock */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                  placeholder="e.g. 250"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Available Stock *
                </span>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </label>
            </div>

            {/* Category */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Category *
              </span>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
              >
                <option>Books & Notes</option>
                <option>Electronics</option>
                <option>Stationery</option>
                <option>Accessories</option>
                <option>Other</option>
              </select>
            </label>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Uploading Product..." : "Publish Product"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/seller-dashboard")}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
