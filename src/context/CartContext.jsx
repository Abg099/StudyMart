
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, loading } = useAuth();

  const [cartItems, setCartItems] = useState([]);

  const storageKey = user
    ? `studymart_cart_${user.id}`
    : null;

  useEffect(() => {
    if (loading) return;

    if (!storageKey) {
      setCartItems([]);
      return;
    }

    try {
      const savedCart = localStorage.getItem(storageKey);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } catch {
      setCartItems([]);
    }
  }, [storageKey, loading]);

  useEffect(() => {
    if (loading || !storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey, loading]);

  function addToCart(product) {
    if (!user || !product?.id || Number(product.stock) <= 0) {
      return false;
    }

    const current = cartItems;
    const existing = current.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= Number(product.stock)) {
        return false;
      }

      setCartItems(
        current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([
        ...current,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url || "",
          category: product.category || "",
          stock: Number(product.stock),
          quantity: 1,
        },
      ]);
    }

    return true;
  }

  function updateQuantity(productId, quantity) {
    setCartItems((current) =>
      current.map((item) => {
        if (item.id !== productId) return item;

        const nextQuantity = Math.max(
          1,
          Math.min(Number(quantity), item.stock)
        );

        return { ...item, quantity: nextQuantity };
      })
    );
  }

  function removeFromCart(productId) {
    setCartItems((current) =>
      current.filter((item) => item.id !== productId)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
