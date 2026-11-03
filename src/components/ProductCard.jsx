
import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({
  product: suppliedProduct,
  ...props
}) {
  const product = suppliedProduct ?? props;

  const { addToCart, cartItems } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!product || !product.name) return null;

  const price = Number(product.price) || 0;
  const oldPrice = Number(
    product.original_price ?? product.oldPrice
  );

  const imageUrl = product.image_url;

  const discount =
    oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  const outOfStock = Number(product.stock) <= 0;

  const alreadyInCart = cartItems.some(
    (item) => item.id === product.id
  );

  function handleAddToCart() {
    if (!user) {
      alert("Please log in first to add products to your cart.");
      navigate("/login");
      return;
    }

    const added = addToCart(product);

    if (!added) {
      alert("You have reached the available stock limit.");
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#F0F5F6]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition duration-200 group-hover:scale-105"
          />
        ) : (
          <span className="text-7xl" aria-hidden="true">
            {product.emoji || "📦"}
          </span>
        )}

        {product.condition && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {product.condition}
          </span>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
            Out of Stock
          </span>
        )}

        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {product.category}
        </p>

        <h3 className="mt-2 min-h-12 text-base font-bold text-slate-800">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 min-h-10 text-sm text-slate-500 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {oldPrice > price && (
            <span className="text-sm text-slate-400 line-through">
              ₹{oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={outOfStock || loading}
          onClick={handleAddToCart}
          className="mt-4 w-full rounded-xl bg-[#102A43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {outOfStock
            ? "Out of Stock"
            : loading
            ? "Please wait..."
            : alreadyInCart
            ? "Add More"
            : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
