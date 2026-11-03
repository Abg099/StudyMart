
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../createClient";
import { useAuth } from "../context/AuthContext";

const categories = [
  "All Categories",
  "Books & Notes",
  "Electronics",
  "Stationery",
  "Accessories",
];

// Format phone number for WhatsApp
const getWhatsAppNumber = (phone) => {
  let number = String(phone || "").replace(/\D/g, "");

  // Add India's country code if a 10-digit number is entered
  if (number.length === 10) {
    number = `91${number}`;
  }

  return number;
};

export default function StudentMarketplace() {
  const { user, role } = useAuth();

  const [studentProducts, setStudentProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [city, setCity] = useState("All Cities");
  const [sort, setSort] = useState("featured");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track which product's details are expanded
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Fetch student listings from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("student_listings")
        .select(`
          id,
          name,
          description,
          price,
          category,
          image_url,
          city,
          pickup_location,
          contact_phone,
          created_at,
          seller_id,
          profiles (
            full_name
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching student listings:", error);
        setError(error.message);
        setStudentProducts([]);
      } else {
        setStudentProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Get cities from actual listings
  const cities = useMemo(() => {
    return [
      "All Cities",
      ...new Set(
        studentProducts
          .map((item) => item.city)
          .filter(Boolean)
      ),
    ];
  }, [studentProducts]);

  // Search and filter products
  const filteredProducts = useMemo(() => {
    let result = studentProducts.filter((item) => {
      const query = search.toLowerCase();
      const sellerName = item.profiles?.full_name || "Student";

      const matchesSearch =
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        sellerName.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Categories" ||
        item.category === category;

      const matchesCity =
        city === "All Cities" ||
        item.city === city;

      return matchesSearch && matchesCategory && matchesCity;
    });

    if (sort === "low") {
      result = [...result].sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sort === "high") {
      result = [...result].sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }

    return result;
  }, [studentProducts, search, category, city, sort]);

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-slate-800">

      {/* Hero Section */}
      <section className="bg-[#102A43] px-4 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
            STUDYMART · STUDENT MARKETPLACE
          </p>

          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Buy and sell with fellow students.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Find affordable second-hand books, notes, electronics, and
            college essentials listed by students.
          </p>

          <div className="mt-7 flex max-w-xl items-center gap-3 rounded-xl bg-white p-2">
            <span className="pl-2 text-xl" aria-hidden="true">
              🔎
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search books, notes, calculators..."
              aria-label="Search student listings"
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

      {/* Marketplace Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">
              SMARTER STUDENT SHOPPING
            </p>

            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Student listings
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Give pre-loved items a second life and save money.
            </p>
          </div>

          {/* Marketplace Actions */}
          <div className="flex flex-wrap gap-3">

            {/* My Listings - visible only to logged-in students */}
            {user && role === "student" && (
              <Link
                to="/manage-student-listings"
                className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                My Listings
              </Link>
            )}

            <Link
              to="/sell-student-product"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + Sell Product
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-7 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Category
            </span>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              City
            </span>

            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500"
            >
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Sort by price
            </span>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </label>
        </div>

        {/* Result Count */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredProducts.length}
            </span>{" "}
            {filteredProducts.length === 1 ? "item" : "items"}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All Categories");
              setCity("All Cities");
              setSort("featured");
              setExpandedProduct(null);
            }}
            className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            Reset filters
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center text-slate-500">
            Loading student listings...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
            Unable to load listings: {error}
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map((item) => {
              const sellerName =
                item.profiles?.full_name || "Student";

              const isExpanded = expandedProduct === item.id;

              const whatsappNumber = getWhatsAppNumber(
                item.contact_phone
              );

              const whatsappMessage = encodeURIComponent(
                `Hi ${sellerName}, I'm interested in your listing "${item.name}" on StudyMart. Is it still available?`
              );

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Product Image */}
                  <div className="relative h-56 bg-[#EAF3F3]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        📦
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-800 shadow-sm">
                      Student Listing
                    </span>
                  </div>

                  {/* Compact Product Information */}
                  <div className="p-4">

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-teal-700">
                        {item.category}
                      </span>

                      <span className="truncate text-xs text-slate-500">
                        📍 {item.city}
                      </span>
                    </div>

                    <h3 className="mt-2 truncate text-base font-bold text-slate-800">
                      {item.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.description || "No description provided"}
                    </p>

                    <p className="mt-3 text-xl font-bold text-slate-900">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>

                    {/* Expand Details Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedProduct(
                          isExpanded ? null : item.id
                        )
                      }
                      className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-[#102A43] transition hover:bg-slate-50"
                    >
                      {isExpanded ? "Hide Details ↑" : "View Details ↓"}
                    </button>

                    {/* Expanded Product Details */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-slate-100 pt-4">

                        <p className="text-sm font-semibold text-slate-800">
                          Product Description
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.description || "No description provided."}
                        </p>

                        <div className="mt-4 space-y-2 text-sm">
                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">
                              Listed by:
                            </span>{" "}
                            {sellerName}
                          </p>

                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">
                              City:
                            </span>{" "}
                            {item.city}
                          </p>

                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-800">
                              Pickup location:
                            </span>{" "}
                            {item.pickup_location}
                          </p>
                        </div>

                        {whatsappNumber.length >= 11 ? (
                          <a
                            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 block w-full rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            WhatsApp Student ↗
                          </a>
                        ) : (
                          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                            Seller contact number is unavailable or invalid.
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

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <span className="text-4xl" aria-hidden="true">
              🔎
            </span>

            <h3 className="mt-4 text-lg font-bold">
              No listings found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search term, city, or category.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
