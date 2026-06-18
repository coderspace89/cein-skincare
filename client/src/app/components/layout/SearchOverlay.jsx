"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container, Row, Col, Form } from "react-bootstrap";
import {
  IoArrowForwardOutline,
  IoCloseOutline,
  IoHeartOutline,
} from "react-icons/io5";
import { useLocale } from "@/context/LocaleContext";

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // UI loading layout hook if needed
  const { locale } = useLocale();

  const SUGGESTIONS_DICTIONARY = {
    en: {
      initialQuery: "Skin",
      items: [
        "Skin Care Gift",
        "Skin Care",
        "Body & Hand Care",
        "Classic Skin Care Kit",
      ],
    },
    es: {
      initialQuery: "Piel",
      items: [
        "Regalo de cuidado de la piel",
        "Cuidado de la piel",
        "Cuidado corporal y de manos",
        "Kit clásico de cuidado de la piel",
      ],
    },
    fr: {
      initialQuery: "Peau",
      items: [
        "Cadeau soin de la peau",
        "Soin de la peau",
        "Soin du corps et des mains",
        "Kit de soin de la peau classique",
      ],
    },
  };

  // 2. Safely fall back to English string arrays if locale hasn't mounted yet
  const activeLocale = locale?.toLowerCase() || "en";
  // Get active items array from dictionary
  const currentDictionary =
    SUGGESTIONS_DICTIONARY[activeLocale] || SUGGESTIONS_DICTIONARY.en;
  const suggestions = currentDictionary.items;

  // 2. Set the localized initial query when the modal opens or language shifts
  useEffect(() => {
    if (isOpen) {
      setQuery(currentDictionary.initialQuery);
    }
  }, [isOpen, activeLocale]); // Fires safely whenever visibility state transitions to open

  useEffect(() => {
    if (query.trim().length < 2) {
      setProducts([]);
      return;
    }

    setIsSearching(true);

    // Debounce API calls by 250ms to keep your connection limits completely safe
    const delayDebounce = setTimeout(async () => {
      try {
        // Fetch directly from your local next API route proxy safely bypassing CORS!
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&locale=${activeLocale}`,
        );

        if (!res.ok) throw new Error("Failed to pull search proxy results");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(
          "Error updating predictive storefront data from proxy:",
          err,
        );
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, activeLocale]);

  if (!isOpen) return null;

  // Update your dictionary to use string keys with a space:
  const tagTranslations = {
    en: {
      bestseller: "Bestseller",
      "new formula": "New Formula", // 👈 Wrap in quotes with a space
    },
    es: {
      bestseller: "Más Vendido",
      "new formula": "Nueva Fórmula",
    },
    fr: {
      bestseller: "Meilleure Vente",
      "new formula": "Nouvelle Formule",
    },
  };

  // Helper utility function to handle the localized translation of a tag string
  const getLocalizedTag = (tag) => {
    return tagTranslations[activeLocale]?.[tag] || tag;
  };

  return (
    <div className="search-overlay-wrapper position-fixed start-0 w-100 bg-white text-dark overflow-y-auto">
      <Container fluid className="px-4 px-md-5 h-100 py-5 position-relative">
        <button
          onClick={onClose}
          className="position-absolute end-0 top-0 mb-4 mb-md-5 border-0 bg-transparent text-dark p-4"
          style={{ zIndex: 10 }}
        >
          <IoCloseOutline color="#333333" size={24} />
        </button>

        <Row className="h-100 align-items-start g-0 pt-4">
          {/* LEFT COLUMN: Search input field context */}
          <Col xs={12} md={3} className="pe-md-5 pb-5 pb-md-0">
            <div className="search-input-box position-relative border-bottom border-dark pb-2 mb-4 mt-md-4">
              <Form.Control
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="border-0 bg-transparent p-0 rounded-0 font-serif"
                style={{
                  fontSize: "28px",
                  color: "#333333",
                  boxShadow: "none",
                }}
              />
              <IoArrowForwardOutline
                className="position-absolute end-0 top-50 translate-middle-y text-muted"
                style={{ fontSize: "22px" }}
              />
            </div>

            <div className="suggestions-box text-start">
              <span
                className="text-secondary text-capitalize tracking-normal d-block mb-3"
                style={{ fontSize: "13px" }}
              >
                {activeLocale === "es"
                  ? "Querías decir?"
                  : activeLocale === "fr"
                    ? "Vouliez-vous dire?"
                    : "Did you mean?"}
              </span>
              <ul className="list-unstyled d-flex flex-column gap-3">
                {suggestions.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => setQuery(item)}
                      className="bg-transparent border-0 p-0 text-start font-sans text-secondary opacity-75 opacity-100-hover transition-all"
                      style={{ fontSize: "22px", fontWeight: "300" }}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          {/* RIGHT COLUMN: Live Shopify Product Dynamic Grid Render */}
          <Col xs={12} md={9} className="ps-md-5">
            <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 pt-md-4">
              {products.length > 0
                ? products.map((product) => (
                    <Col
                      key={product.id}
                      xs={6}
                      className="text-center d-flex flex-column align-items-center justify-content-between position-relative product-search-card"
                    >
                      {/* Route to Shopify dynamic store handle link path instead */}
                      <Link
                        href={`/shop/${product.handle}`}
                        onClick={onClose}
                        className="w-100 text-decoration-none text-dark d-flex flex-column align-items-center"
                      >
                        <div className="w-100 position-relative d-flex flex-column align-items-center mb-3">
                          <span
                            className="text-uppercase tracking-widest font-sans mb-3 text-secondary d-block"
                            style={{
                              fontSize: "10px",
                              minHeight: "15px",
                              letterSpacing: "0.15em",
                            }}
                          >
                            {product.badge || " "}
                          </span>

                          <div
                            className="position-relative w-100"
                            style={{ height: "240px" }}
                          >
                            {product.img && (
                              <Image
                                src={product.img}
                                alt={product.title}
                                fill
                                className="object-contain px-3"
                              />
                            )}
                            <div className="position-absolute top-0 end-0">
                              <div
                                className="product-tags-wrapper"
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  margin: "4px 0",
                                }}
                              >
                                {product.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={`tag-badge tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                                    style={{
                                      fontSize: "11px",
                                      color: "#333333",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {getLocalizedTag(
                                      idx === 0 && tag !== "shop all"
                                        ? tag
                                        : "",
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="position-absolute end-0 bottom-0">
                              <button
                                className="wishlist-btn bg-transparent border-0 p-1 text-secondary opacity-75 opacity-100-hover"
                                style={{ zIndex: 5 }}
                              >
                                <IoHeartOutline size={20} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="w-100 px-2 mt-2">
                          <h4
                            className="font-sans mb-1 text-dark"
                            style={{ fontSize: "13px", fontWeight: "600" }}
                          >
                            {product.title}
                          </h4>
                          {/* <div
                            className="font-sans text-secondary mb-4 font-weight-light"
                            style={{
                              fontSize: "12px",
                              minHeight: "36px",
                              whiteSpace: "pre-line",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: product.desc,
                            }}
                          /> */}
                          {product.desc &&
                            (() => {
                              // 1. Add a newline right before every opening <p> tag to guarantee string separation
                              let formattedHtml = product.desc.replace(
                                /<p>/g,
                                "\n<p>",
                              );

                              // 2. Strip out all other HTML tags safely
                              const cleanText = formattedHtml.replace(
                                /<[^>]*>/g,
                                "",
                              );

                              // 3. Break the rows apart, trim empty spaces, and drop empty lines
                              const lines = cleanText
                                .split("\n")
                                .map((line) => line.trim())
                                .filter(Boolean);

                              // Now lines[0] will be "A Vitamin C-rich layering serum" and lines[1] will be "60 ml"
                              const subtitle = lines[0];
                              const size = lines[1];

                              return (
                                <div className="my-2 flex flex-col gap-0.5 text-center">
                                  {subtitle && (
                                    <p
                                      style={{
                                        fontSize: "12px",
                                        minHeight: "36px",
                                        whiteSpace: "pre-line",
                                      }}
                                    >
                                      {subtitle}
                                    </p>
                                  )}
                                  {size && (
                                    <p
                                      style={{
                                        fontSize: "12px",
                                        minHeight: "36px",
                                        whiteSpace: "pre-line",
                                      }}
                                    >
                                      {size}
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                          <p
                            className="font-sans text-dark m-0 font-weight-medium"
                            style={{ fontSize: "13px" }}
                          >
                            {product.price}
                          </p>
                        </div>
                      </Link>
                    </Col>
                  ))
                : query.length > 1 &&
                  !isSearching && (
                    <div
                      className="w-100 text-start text-muted font-sans ps-3"
                      style={{ fontSize: "14px" }}
                    >
                      {activeLocale === "es"
                        ? `No se encontraron productos que coincidieran "${query}"`
                        : activeLocale === "fr"
                          ? `Aucun produit correspondant trouvé "${query}"`
                          : `No products found matching "${query}"`}
                    </div>
                  )}
            </Row>
          </Col>
        </Row>
      </Container>

      <style jsx global>{`
        .search-overlay-wrapper {
          top: 100px;
          height: calc(100vh - 100px);
          z-index: 1040 !important;
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown {
          from {
            transform: translateY(-15px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .opacity-100-hover:hover {
          opacity: 1 !important;
          color: #000000 !important;
        }
        @media (max-width: 768px) {
          .border-end-md {
            border-right: 1px solid #e5e5e5 !important;
          }
          .search-overlay-wrapper {
            top: 120px;
            height: calc(100vh - 120px);
          }
        }
      `}</style>
    </div>
  );
}
