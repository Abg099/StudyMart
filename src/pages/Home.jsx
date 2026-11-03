import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import MarketplaceCard from "../components/MarketplaceCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { supabase } from "../createClient";

const marketplaceSections = [
  {
    id: "shop",
    icon: "🛒",
    title: "Online Shopping",
    description:
      "Shop books, stationery and everyday essentials with a convenient checkout.",
    to: "/shop",
    buttonLabel: "Shop products",
    imageName: "onlineshop.png",
    theme: "sky",
  },
  {
    id: "local-sellers",
    icon: "🏪",
    title: "Local Sellers",
    description:
      "Find nearby stationery and bookshops, check availability, and arrange pickup.",
    to: "/local-sellers",
    buttonLabel: "Explore shops",
    imageName: "Localstore.png",
    theme: "amber",
  },
  {
    id: "student-marketplace",
    icon: "🎓",
    title: "Student Marketplace",
    description:
      "Buy and sell used books, class notes, calculators and other student items.",
    to: "/student-marketplace",
    buttonLabel: "Browse items",
    imageName: "Studentmarket.png",
    theme: "violet",
  },
];

const benefits = [
  {
    icon: "🛡️",
    title: "Safer shopping",
    text: "Clear product and seller details.",
  },
  {
    icon: "📍",
    title: "Local pickup",
    text: "Find products close to you.",
  },
  {
    icon: "🤝",
    title: "Community sellers",
    text: "Discover shops and student listings.",
  },
  {
    icon: "♻️",
    title: "Reuse & resell",
    text: "Give useful items a second life.",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  const navigate = useNavigate();

  // Fetch popular products from Supabase
  useEffect(() => {
    const fetchPopularProducts = async () => {
      setLoadingProducts(true);
      setProductError("");

      const { data, error } = await supabase
        .from("online_products")
        .select(
          "id, name, description, price, original_price, category, image_url, stock"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Popular products error:", error.message);
        setProductError("Unable to load products right now.");
      } else {
        setPopularProducts(data || []);
      }

      setLoadingProducts(false);
    };

    fetchPopularProducts();
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    if (query) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8 lg:pt-16">
          <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-mint via-white to-skysoft p-5 sm:p-8 md:grid-cols-2 md:p-10 lg:gap-12 lg:p-14">
            <div className="relative z-10">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5 text-xs font-extrabold tracking-[.16em] text-brand sm:text-sm">
                BUY <span>·</span> SELL <span>·</span> CONNECT
              </p>

              <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Your Student &amp; Local{" "}
                <span className="text-brand">Marketplace</span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Books, notes, stationery and more — all in one place. Shop
                online, support nearby stores, or sell what you no longer need.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-7 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:items-center sm:rounded-full sm:pl-5"
              >
                <label htmlFor="homepage-search" className="sr-only">
                  Search products or shops
                </label>

                <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
                  <span
                    aria-hidden="true"
                    className="text-xl text-slate-400"
                  >
                    ⌕
                  </span>

                  <input
                    id="homepage-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    type="search"
                    placeholder="Search books, notes, stationery, shops..."
                    className="w-full min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-brand px-6 py-3 font-bold text-white transition hover:bg-emerald-700 sm:rounded-full"
                >
                  Search
                </button>
              </form>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm">
                <span>✓ Find nearby products</span>
                <span>✓ Buy or resell</span>
                <span>✓ Support local shops</span>
              </div>
            </div>

            <img
              src="assets/studyHero.png"
              className="!min-h-[230px] bg-white/40 sm:!min-h-[320px] lg:!min-h-[390px]"
              alt="StudyMart student marketplace"
            />
          </div>
        </section>

        {/* MARKETPLACE SECTIONS */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.16em] text-brand">
                Explore StudyMart
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                What are you looking for?
              </h2>
            </div>

            <p className="max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
              Choose how you want to shop, discover local stores, or find
              pre-loved student essentials.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {marketplaceSections.map((section) => (
              <MarketplaceCard key={section.id} {...section} />
            ))}
          </div>
        </section>

        {/* BENEFITS */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-4 rounded-3xl border border-emerald-100 bg-mint/60 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4 lg:gap-0 lg:p-8">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`flex items-start gap-3 p-2 lg:px-5 ${
                  index < benefits.length - 1
                    ? "lg:border-r lg:border-emerald-200"
                    : ""
                }`}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl"
                  aria-hidden="true"
                >
                  {benefit.icon}
                </div>

                <div>
                  <h3 className="font-bold">{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {benefit.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* POPULAR PRODUCTS - LIVE SUPABASE DATA */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.16em] text-brand">
                Picked for students
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Popular products
              </h2>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                A few essentials to get you started.
              </p>
            </div>

            <Link
              to="/shop"
              className="shrink-0 text-sm font-bold text-brand hover:text-emerald-800"
            >
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center">
              <p className="text-sm font-medium text-slate-500">
                Loading popular products...
              </p>
            </div>
          ) : productError ? (
            <div className="rounded-2xl border border-red-100 bg-white py-12 text-center">
              <p className="text-sm font-medium text-red-600">
                {productError}
              </p>
            </div>
          ) : popularProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <p className="font-semibold text-slate-700">
                No products available yet.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Check back soon for new products.
              </p>
            </div>
          )}
        </section>

        {/* STUDENT SELLER CTA */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid items-center gap-6 rounded-3xl bg-ink px-6 py-8 text-white sm:px-10 sm:py-10 md:grid-cols-[1fr_auto] md:gap-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.16em] text-emerald-300">
                Have something to sell?
              </p>

              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Turn unused items into someone else's essentials.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                List your used books, class notes, stationery and other student
                essentials. Connect with fellow students and give your items a
                second life.
              </p>

              <p className="mt-4 text-sm text-slate-300">
                Own a stationery or bookshop?{" "}
                <Link to="/seller-dashboard" className="text-blue-500">
  Register as a local seller
</Link>
              </p>
            </div>

            <Link
              to="/sell-student-product"
              className="inline-flex w-fit items-center justify-center rounded-full bg-brand px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
            >
              Start selling
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}