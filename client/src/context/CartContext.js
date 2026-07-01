"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const CartContext = createContext(null);
const STORAGE_KEY = "cein_cart_items";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // 💡 BULLETPROOF RETURN CHECK:
  useEffect(() => {
    // 💡 FIX: Check if the parameter exists in the URL at all (even if it's empty)
    const hasCartParam = searchParams.has("cart_id");

    // Fallback double check: Did they just land from your myshopify domain?
    const cameFromShopify =
      typeof document !== "undefined" &&
      document.referrer.includes("myshopify.com");

    if (hasCartParam || cameFromShopify) {
      console.log("Checkout landing detected. Clearing headless cart state.");

      // 1. Clear state array instantly
      setCartItems([]);

      // 2. Clear local storage cache completely
      localStorage.removeItem("cein_cart_items");

      // 3. Clean up the URL parameters cleanly so the address bar looks pristine
      if (typeof window !== "undefined") {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [searchParams]);

  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      // 1. Get a reliable ID from the incoming new item
      const newItemId = newItem.id || newItem.variantId;

      // 2. Check if this product style already exists in the current cart array
      const existingItemIndex = prevItems.findIndex((item) => {
        const currentItemId = item.id || item.variantId;
        return currentItemId === newItemId;
      });

      if (existingItemIndex > -1) {
        // 3. Item exists! Increment its quantity rather than replacing the item completely
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + (newItem.quantity || 1),
        };
        return updatedItems;
      }

      // 4. Fresh Item! Safe to append cleanly alongside previous elements in state array
      return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        // 💡 FIX: Safely evaluate both id or variantId styles against the target id
        item.id === id || item.variantId === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) =>
      // 💡 FIX: Safely filter checking both key variations
      prevItems.filter((item) => item.id !== id && item.variantId !== id),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subTotal = cartItems.reduce((acc, item) => {
    // Strips out symbols and commas to calculate sums accurately
    const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
    return acc + numericPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subTotal,
        itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
};
