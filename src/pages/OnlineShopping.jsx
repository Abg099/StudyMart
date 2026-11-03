import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { supabase } from "../createClient";

const categories = ["All", "Stationery", "Electronics", "Accessories"];

export default function OnlineShopping() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(2000);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("online_products")
        .select(
          "id, name, description, price, original_price, category, image_url, stock"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error.message);
        setError("Unable to load products. Please try again.");
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Search, category and price filters
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesPrice = Number(product.price) <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sort === "low-high") {
      result = [...result].sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sort === "high-low") {
      result = [...result].sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    } else if (sort === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [products, search, category, sort, maxPrice]);

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-slate-800">
      {/* Hero */}
      <section className="bg-[#102A43] px-4 py-12 text-white sm:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
            STUDYMART · ONLINE STORE
          </p>

          <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Everything you need for your college life.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Discover affordable books, electronics, and everyday essentials
            made for students.
          </p>

          <div className="mt-7 flex max-w-xl items-center gap-3 rounded-xl bg-white p-2">
            <span className="pl-2 text-xl" aria-hidden="true">
              🔎
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category shortcuts */}
      
      {/* Products and filters */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-teal-700">
              MADE FOR STUDENTS
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Explore products
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Find useful products without stretching your budget.
            </p>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <span className="shrink-0 text-slate-500">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-teal-500 sm:w-auto"
            >
              <option value="featured">Featured</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[210px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Filters</h3>

              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setMaxPrice(2000);
                  setSearch("");
                  setSort("featured");
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                Reset
              </button>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold">Categories</h4>

              <div className="space-y-3">
                {categories.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={category === item}
                      onChange={() => setCategory(item)}
                      className="accent-teal-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="my-6 border-t border-slate-100" />

            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Maximum price</h4>
                <span className="text-sm font-bold text-teal-700">
                  ₹{maxPrice}
                </span>
              </div>

              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(Number(event.target.value))
                }
                aria-label="Maximum price"
                className="mt-4 w-full cursor-pointer accent-teal-600"
              />

              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>₹100</span>
                <span>₹2,000</span>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                <p className="font-medium text-slate-600">
                  Loading products...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-white px-5 py-16 text-center">
                <p className="font-semibold text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <span className="text-4xl" aria-hidden="true">
                  🔎
                </span>
                <h3 className="mt-4 text-lg font-bold">
                  No products found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try another search or adjust your filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setMaxPrice(2000);
                  }}
                  className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}