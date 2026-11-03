
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  city: "",
  pickup_location: "",
  contact_phone: "",
};

const categories = [
  "Books",
  "Notes",
  "Study Materials",
  "Electronics",
  "Stationery",
  "Other",
];

export default function ManageStudentListings() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [checking, setChecking] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [newImage, setNewImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (role && role !== "student") {
      navigate("/");
      return;
    }

    if (role === "student") {
      fetchListings();
    }
  }, [user, role, loading]);

  async function fetchListings() {
    setChecking(true);
    setError("");

    const { data, error } = await supabase
      .from("student_listings")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setListings(data || []);
    }

    setChecking(false);
  }

  function startEditing(listing) {
    setEditingId(listing.id);
    setForm({
      name: listing.name || "",
      description: listing.description || "",
      price: listing.price ?? "",
      category: listing.category || "",
      city: listing.city || "",
      pickup_location: listing.pickup_location || "",
      contact_phone: listing.contact_phone || "",
    });
    setCurrentImage(listing.image_url || "");
    setNewImage(null);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(initialForm);
    setCurrentImage("");
    setNewImage(null);
    setError("");
    setMessage("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.category || !form.city.trim()) {
      setError("Please fill in the required fields.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    if (newImage && newImage.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setSaving(true);

    let imageUrl = currentImage;
    let uploadedPath = null;

    if (newImage) {
      const extension = newImage.name.split(".").pop().toLowerCase();
      const allowed = ["jpg", "jpeg", "png", "webp"];

      if (!allowed.includes(extension)) {
        setError("Only JPG, PNG and WebP images are allowed.");
        setSaving(false);
        return;
      }

      uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedPath, newImage);

      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(uploadedPath);

      imageUrl = data.publicUrl;
    }

    const { data, error: updateError } = await supabase
      .from("student_listings")
      .update({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        city: form.city.trim(),
        pickup_location: form.pickup_location.trim(),
        contact_phone: form.contact_phone.trim(),
        image_url: imageUrl,
      })
      .eq("id", editingId)
      .eq("seller_id", user.id)
      .select()
      .single();

    if (updateError) {
      if (uploadedPath) {
        await supabase.storage.from("product-images").remove([uploadedPath]);
      }

      setError(updateError.message);
      setSaving(false);
      return;
    }

    setListings((prev) =>
      prev.map((item) => (item.id === editingId ? data : item))
    );

    setMessage("Your listing has been updated successfully.");
    cancelEditing();
    setSaving(false);
  }

  async function handleDelete(listing) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("student_listings")
      .delete()
      .eq("id", listing.id)
      .eq("seller_id", user.id);

    if (error) {
      setError(error.message);
      return;
    }

    setListings((prev) => prev.filter((item) => item.id !== listing.id));

    if (editingId === listing.id) {
      cancelEditing();
    }

    setMessage("Listing deleted successfully.");
  }

  if (loading || checking) {
    return (
      <div className="py-20 text-center text-slate-600">
        Loading your listings...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Student Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My Listings
            </h1>
            <p className="mt-2 text-slate-600">
              Manage the study materials and products you have listed.
            </p>
          </div>

          <Link
            to="/sell-student-product"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add New Listing
          </Link>
        </div>

        {message && (
          <p className="mb-5 rounded-lg bg-green-50 p-3 text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        {editingId && (
          <form
            onSubmit={handleUpdate}
            className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Edit Your Listing
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Product name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Pickup location</label>
                <input
                  name="pickup_location"
                  value={form.pickup_location}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Contact phone</label>
                <input
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Replace image (optional)
                </label>

                {currentImage && (
                  <img
                    src={currentImage}
                    alt="Current listing"
                    className="mb-3 h-28 w-28 rounded-lg object-cover"
                  />
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                  className="block w-full text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG or WebP. Maximum 5MB.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-800">
              You haven't posted any listings yet.
            </h2>
            <p className="mt-2 text-slate-600">
              Add your first used book, notes or study material.
            </p>
            <Link
              to="/sell-student-product"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              Create a Listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {listing.image_url ? (
                  <img
                    src={listing.image_url}
                    alt={listing.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-400">
                    No image
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-900">{listing.name}</h3>
                    <span className="text-sm font-bold text-blue-700">
                      ₹{Number(listing.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {listing.category} · {listing.city}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {listing.description || "No description added."}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => startEditing(listing)}
                      className="flex-1 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(listing)}
                      className="flex-1 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
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
