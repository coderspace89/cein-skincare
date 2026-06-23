"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LocaleContext = createContext();

export function LocaleProvider({ children }) {
  // 1. Initialize with your default fallback locale
  const [locale, setLocale] = useState("en");

  // 2. Read from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("selectedLocale");
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  // 3. Custom setter wrapper that commits changes to localStorage
  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem("selectedLocale", newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
