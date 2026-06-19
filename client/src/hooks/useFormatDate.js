"use client";

import { useLocale } from "@/context/LocaleContext";

export function useFormatDate() {
  const { locale } = useLocale();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toLocaleString(locale || "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return formatDate;
}
