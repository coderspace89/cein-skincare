"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "favoriteProductIds";

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setFavoriteIds(JSON.parse(stored));
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (productId) => {
    setFavoriteIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const isFavorite = (productId) => favoriteIds.includes(productId);

  // 💡 COMPUTE COUNT: Derive the count directly from the array length
  const favoritesCount = favoriteIds.length;

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        toggleFavorite,
        isFavorite,
        favoritesCount, // 💡 EXPOSE COUNT: Add it here so it can be consumed anywhere
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
};
