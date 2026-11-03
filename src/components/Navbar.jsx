
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navLinks = [
  { label: "Online Shopping", to: "/shop" },
  { label: "Local Sellers", to: "/local-sellers" },
  { label: "Student Marketplace", to: "/student-marketplace" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, signOut, loading, role } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      setUserMenuOpen(false);
      setMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Unable to log out. Please try again.");
    }
  }

  function handleSearch(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") || "").trim();

    if (query) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setMenuOpen(false);
    }
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" aria-label="StudyMart home">
          <img
            src="public/assets/studylogo.png"
            alt="StudyMart logo"
            className="h-14 w-auto"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              className="transition hover:text-brand"
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!loading &&
            (user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-label="User account menu"
                  aria-expanded={userMenuOpen}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-xl transition hover:bg-teal-100"
                >
                  👤
                </button>

                {/* Desktop account dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {displayName}
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-2 block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      ✏️ Edit Profile
                    </Link>

                    {/* My Orders */}
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      📦 My Orders
                    </Link>

                    {/* Seller Dashboard */}
                    {role === "local_seller" && (
                      <Link
                        to="/seller-dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        🏪 Seller Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      ↪ Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-teal-700 px-4 py-2 text-white transition hover:bg-teal-800"
              >
                Login / Sign Up
              </Link>
            ))}

          {/* Cart */}
          <Link
            to="/cart"
            aria-label={`Shopping cart with ${cartCount} items`}
            className="relative flex h-10 items-center justify-center rounded-full border border-slate-200 px-3 text-xs font-bold hover:bg-slate-50"
          >
            Cart

            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] text-white">
              {cartCount}
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl lg:hidden"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 text-sm font-semibold text-slate-700">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 hover:bg-slate-50"
                to={item.to}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="mt-2 border-t border-slate-100 px-3 py-3">
                  <p className="font-semibold">{displayName}</p>

                  <p className="mt-1 break-all text-xs font-normal text-slate-500">
                    {user.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 hover:bg-slate-50"
                >
                  ✏️ Edit Profile
                </Link>

                {/* My Orders */}
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 hover:bg-slate-50"
                >
                  📦 My Orders
                </Link>

                {/* Seller Dashboard */}
                {role === "local_seller" && (
                  <Link
                    to="/seller-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-3 hover:bg-slate-50"
                  >
                    🏪 Seller Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-3 text-left text-red-600 hover:bg-red-50"
                >
                  ↪ Log Out
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/login"
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-center"
                >
                  Log in / Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Search bar on tablet and smaller screens */}
      <div className="hidden border-t border-slate-100 px-4 py-3 sm:block lg:hidden">
        <form onSubmit={handleSearch} className="mx-auto flex max-w-7xl gap-2">
          <input
            name="q"
            type="search"
            placeholder="Search books, products or shops..."
            className="min-w-0 flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand"
          />

          <button
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white"
            type="submit"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
