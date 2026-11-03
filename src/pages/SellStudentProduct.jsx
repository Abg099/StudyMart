
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CITIES = [
  "Nagpur",
  "Bhandara",
  "Pune",
  "Mumbai",
  "Nashik",
  "Chhatrapati Sambhajinagar",
  "Amravati",
  "Wardha",
  "Akola",
  "Other",
];

export default function SellStudentProduct() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    city: "",
    pickup_location: "",
    contact_phone: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    setMessage("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage("Choose a JPG, PNG or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("Image size must be 5 MB or less.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview("");
    setMessage("");

    const input = document.getElementById("product-image");

    if (input) {
      input.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (role !== "student") {
      setMessage(
        "Only student accounts can sell products in the Student Marketplace."
      );
      return;
    }

    if (!imageFile) {
      setMessage("Please select a product image.");
      return;
    }

    if (!form.name.trim()) {
      setMessage("Please enter the product name.");
      return;
    }

    if (
      form.price.trim() === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setMessage("Please enter a valid product price.");
      return;
    }

    if (!form.category || !form.city) {
      setMessage("Please select a category and city.");
      return;
    }

    if (!form.pickup_location.trim()) {
      setMessage("Please enter a pickup location.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.contact_phone.trim())) {
      setMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSaving(true);

    let uploadedPath = null;

    try {
      const fileExtension = imageFile.name
        .split(".")
        .pop()
        .toLowerCase();

      const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(
        fileExtension
      )
        ? fileExtension
        : imageFile.type === "image/png"
          ? "png"
          : imageFile.type === "image/webp"
            ? "webp"
            : "jpg";

      const fileName = `${crypto.randomUUID()}.${safeExtension}`;

      // Each student's images are stored in their own folder.
      uploadedPath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedPath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data: imageData } = supabase.storage
        .from("product-images")
        .getPublicUrl(uploadedPath);

      const imageUrl = imageData.publicUrl;

      const { error: insertError } = await supabase
        .from("student_listings")
        .insert({
          seller_id: user.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: Number(form.price),
          category: form.category,
          city: form.city,
          pickup_location: form.pickup_location.trim(),
          contact_phone: form.contact_phone.trim(),
          image_url: imageUrl,
        });

      if (insertError) {
        // Remove the uploaded image if saving the listing fails.
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError.message);
        }

        uploadedPath = null;

        throw new Error(`Could not publish listing: ${insertError.message}`);
      }

      uploadedPath = null;

      navigate("/student-marketplace", {
        state: {
          successMessage: "Product published successfully!",
        },
      });
    } catch (error) {
      console.error("Publishing product failed:", error);

      setMessage(
        error.message || "Something went wrong. Please try again."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (role !== "student") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Student Marketplace
          </h1>

          <p className="mt-3 text-gray-600">
            This form is for student accounts. Local sellers can add products
            through their seller dashboard.
          </p>

          <Link
            to="/seller-dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Seller Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/student-marketplace"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Student Marketplace
        </Link>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Student Marketplace
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Sell Your Product
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Upload a photo and list your product for other students. No shop
              registration required.
            </p>
          </div>

          {message && (
            <div
              role="alert"
              className={`mb-6 rounded-lg border p-3 text-sm ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                Product Details
              </h2>

              <div className="mt-5">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Product Name *
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Engineering Mathematics Book"
                  maxLength={150}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Price (₹) *
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 250"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Category *
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select category</option>
                    <option value="Books">Books</option>
                    <option value="Notes">Notes</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Hostel Essentials">Hostel Essentials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the condition, edition or other useful details."
                  rows={4}
                  maxLength={2000}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </section>

            <section className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Image
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose a JPG, PNG or WebP image up to 5 MB.
              </p>

              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="mt-4 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-600 file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />

              {imagePreview && (
                <div className="mt-4 max-w-sm">
                  <img
                    src={imagePreview}
                    alt="Selected product preview"
                    className="h-56 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </section>

            <section className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Location & Contact
              </h2>

              <div className="mt-5">
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  City *
                </label>

                <select
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select your city</option>

                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  Choose the city where buyers can collect the product.
                </p>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="pickup_location"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Pickup Location / Area *
                </label>

                <input
                  id="pickup_location"
                  name="pickup_location"
                  value={form.pickup_location}
                  onChange={handleChange}
                  placeholder="e.g. Dharampeth"
                  maxLength={200}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Enter a general area or public meeting point, not your
                  private home address.
                </p>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="contact_phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Mobile Number *
                </label>

                <input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.contact_phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Only provide a number you are comfortable sharing with
                  potential buyers.
                </p>
              </div>
            </section>

            <div className="rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              Check your product details before publishing. Meet buyers at a
              safe, public location whenever possible.
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Uploading image & publishing..." : "Publish Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
