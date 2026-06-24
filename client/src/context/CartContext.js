"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cein_cart_items";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, variantId) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.variantId === variantId,
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { ...product, variantId, quantity: 1 }];
    });
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (variantId) => {
    setCartItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => setCartItems([]);

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
