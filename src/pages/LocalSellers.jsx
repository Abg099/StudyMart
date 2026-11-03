
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../createClient";

const categories = [
  "All Categories",
  "Books & Notes",
  "Electronics",
  "Stationery",
  "Accessories",
  "Other",
];

export default function LocalSellers() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");

  const [expandedProduct, setExpandedProduct] = useState(null);
  const [sellingLoading, setSellingLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch local products with shop details.
  useEffect(() => {
    async function fetchLocalProducts() {
      setDataLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          shop_id,
          name,
          description,
          price,
          category,
          image_url,
          stock,
          created_at,
          shops (
            shop_name,
            city,
            address,
            phone,
            description
          )
        `)
        .eq("is_active", true)
        .gt("stock", 0)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Local products fetch error:", error);
        setErrorMessage(
          "Unable to load local products. Please try again."
        );
        setDataLoading(false);
        return;
      }

      const validProducts = (data || []).filter(
        (product) => product.shops
      );

      setProducts(validProducts);
      setDataLoading(false);
    }

    fetchLocalProducts();
  }, []);

  // Generate city options from actual shop data.
  const cities = useMemo(() => {
    const uniqueCities = [
      ...new Set(
        products
          .map((product) => product.shops?.city)
          .filter(Boolean)
      ),
    ].sort();

    return ["All Cities", ...uniqueCities];
  }, [products]);

  // Search and filter products.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const shop = product.shops;
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        product.name?.toLowerCase().includes(searchText) ||
        product.description?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText) ||
        shop?.shop_name?.toLowerCase().includes(searchText) ||
        shop?.city?.toLowerCase().includes(searchText) ||
        shop?.address?.toLowerCase().includes(searchText);

      const matchesCity =
        selectedCity === "All Cities" ||
        shop?.city === selectedCity;

      const matchesCategory =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [products, search, selectedCity, selectedCategory]);

  // Start selling flow.
  async function handleStartSelling() {
    setMessage("");

    if (loading || sellingLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    if (role !== "local_seller") {
      setMessage(
        "Only local sellers can sell here. As a student, you can upload your products on the Student Marketplace."
      );
      return;
    }

    setSellingLoading(true);

    try {
      const { data: shop, error } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!shop) {
        navigate("/seller-dashboard");
        return;
      }

      navigate("/add-product");
    } catch (error) {
      console.error("Unable to check shop registration:", error);

      setMessage(
        "We couldn't verify your shop registration. Please try again."
      );
    } finally {
      setSellingLoading(false);
    }
  }

  // Reset all filters.
  function resetFilters() {
    setSearch("");
    setSelectedCity("All Cities");
    setSelectedCategory("All Categories");
    setExpandedProduct(null);
  }

  // Format phone number for WhatsApp.
  function getWhatsAppNumber(phone) {
    let number = String(phone || "").replace(/\D/g, "");

    if (number.length === 10) {
      number = `91${number}`;
    }

    return number;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-slate-800">

      {/* Hero */}
      <section className="bg-[#102A43] px-4 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
            STUDYMART · LOCAL MARKETPLACE
          </p>

          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Find student-friendly products near you.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Explore books, stationery, electronics and other
            essentials available at local shops in your city.
          </p>

          {/* Search */}
          <div className="mt-7 flex max-w-xl items-center gap-3 rounded-xl bg-white p-2">

            <span className="pl-2 text-xl" aria-hidden="true">
              🔎
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setExpandedProduct(null);
              }}
              placeholder="Search product, shop, city or area..."
              aria-label="Search local products"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Clear
              </button>
            )}

          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">

        {/* Heading and Start Selling */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-medium text-teal-700">
              YOUR LOCAL SHOPPING GUIDE
            </p>

            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Explore local products
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find products available in nearby shops and contact sellers directly.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartSelling}
            disabled={loading || sellingLoading}
            className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Checking account..."
              : sellingLoading
                ? "Checking shop..."
                : "🏪 Start Selling"}
          </button>

        </div>

        {/* Selling permission message */}
        {message && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <span className="text-xl">ℹ️</span>

            <div className="flex-1">
              <p>{message}</p>

              {user && role !== "local_seller" && (
                <button
                  type="button"
                  onClick={() => navigate("/student-marketplace")}
                  className="mt-3 font-semibold text-teal-800 underline underline-offset-4"
                >
                  Go to Student Marketplace
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
              className="text-lg font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-7 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Select city
            </span>

            <select
              value={selectedCity}
              onChange={(event) => {
                setSelectedCity(event.target.value);
                setExpandedProduct(null);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Product category
            </span>

            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setExpandedProduct(null);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Reset filters
          </button>

        </div>

        {/* Product count */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredProducts.length}
            </span>{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </p>

          {selectedCity !== "All Cities" && (
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              📍 {selectedCity}
            </span>
          )}
        </div>

        {/* Loading */}
        {dataLoading && (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-500">
              Loading local products...
            </p>
          </div>
        )}

        {/* Error */}
        {!dataLoading && errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>

          </div>
        )}

        {/* Compact Product Cards */}
        {!dataLoading && !errorMessage && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {filteredProducts.map((product) => {
              const shop = product.shops;
              const whatsappNumber = getWhatsAppNumber(shop?.phone);
              const isExpanded = expandedProduct === product.id;

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
                >

                  {/* Product image */}
                  <div className="h-44 w-full overflow-hidden bg-slate-100">

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        📦
                      </div>
                    )}

                  </div>

                  <div className="p-4">

                    {/* Category and city */}
                    <div className="flex items-center justify-between gap-2">

                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                        {product.category || "Other"}
                      </span>

                      <span className="text-xs text-slate-500">
                        📍 {shop?.city}
                      </span>

                    </div>

                    {/* Product details */}
                    <h3 className="mt-2 text-base font-bold text-slate-800">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500 line-clamp-2">
                      {product.description || "No description available."}
                    </p>

                    <p className="mt-2 text-lg font-bold text-teal-700">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    {/* View / Hide details */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedProduct(
                          isExpanded ? null : product.id
                        )
                      }
                      aria-expanded={isExpanded}
                      className="mt-3 text-sm font-semibold text-teal-700 hover:text-teal-900"
                    >
                      {isExpanded ? "Hide Details ↑" : "View Details ↓"}
                    </button>

                    {/* Expandable shop information */}
                    {isExpanded && (
                      <div className="mt-3 border-t border-slate-100 pt-3">

                        <p className="text-sm font-semibold text-slate-800">
                          🏪 {shop?.shop_name}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          📍 {shop?.address || shop?.city}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          City: {shop?.city}
                        </p>

                        {whatsappNumber.length >= 12 ? (
                          <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                              `Hi, I found ${product.name} at ${shop?.shop_name} on StudyMart. Is this product available?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 block rounded-xl bg-[#102A43] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-700"
                          >
                            Contact Seller ↗
                          </a>
                        ) : (
                          <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-center text-xs text-slate-500">
                            Contact number unavailable
                          </p>
                        )}

                      </div>
                    )}

                  </div>
                </article>
              );
            })}

          </div>
        )}

        {/* Empty state */}
        {!dataLoading && !errorMessage && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">

            <span className="text-4xl">🏪</span>

            <h3 className="mt-4 text-lg font-bold">
              No products found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {products.length === 0
                ? "No local products have been listed yet."
                : "Try selecting another city or category."}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Show all products
            </button>

          </div>
        )}

      </section>
    </main>
  );
}
