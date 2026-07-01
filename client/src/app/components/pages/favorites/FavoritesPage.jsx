"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/components/pages/shop/ProductListings.module.css"; // Reuse existing clean styles or decouple them
import { useLocale } from "@/context/LocaleContext";
import { useFavorites } from "@/context/FavoritesContext";
import Image from "next/image";
import { Row, Col, Spinner, Container } from "react-bootstrap";
import Link from "next/link";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { useCart } from "@/context/CartContext";

const FavoritesPage = () => {
  const { locale } = useLocale();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const currentLocale = locale.toLowerCase();

  // Dictionary for direct static text items on this standalone page
  const pageTranslations = {
    en: {
      title: "Your Favorites",
      empty: "Your favorites list is currently empty.",
      cartBtn: "add to your cart",
    },
    es: {
      title: "Mis Favoritos",
      empty: "Tu lista de favoritos está vacía.",
      cartBtn: "agregar a su carrito",
    },
    fr: {
      title: "Vos Favoris",
      empty: "Votre liste de favoris est actuellement vide.",
      cartBtn: "ajouter à votre panier",
    },
  };

  const tagTranslations = {
    en: { bestseller: "Bestseller", "new formula": "New Formula" },
    es: { bestseller: "Más Vendido", "new formula": "Nueva Fórmula" },
    fr: { bestseller: "Meilleure Vente", "new formula": "Nouvelle Formule" },
  };

  const t = pageTranslations[currentLocale] || pageTranslations.en;

  useEffect(() => {
    async function loadFavorites() {
      if (favoriteIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: favoriteIds, locale }),
        });

        if (!res.ok) throw new Error("Failed to resolve localized favorites");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error drawing collection items:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [favoriteIds, locale]);

  // add to cart function
  const handleAddToCartClick = (e, product) => {
    e.preventDefault();

    // Target the Variant ID instead of the Product ID
    const targetVariantId =
      product?.variantId || product?.variants?.nodes?.[0]?.id;

    if (!targetVariantId) {
      console.error(
        "No variant ID found for this product payload structure:",
        product,
      );
      return;
    }

    const productPayload = {
      id: product.id,
      variantId: targetVariantId, // 👈 Explicitly maintain the variant reference string
      title: product.title,
      img: product.img,
      price: `${product.price} ${product.currency || "USD"}`,
      desc: product.description || "",
    };

    addToCart(productPayload, targetVariantId);
  };

  if (loading) {
    return (
      <div
        className="text-center py-5"
        style={{ minHeight: "60vh", margin: "100px 0" }}
      >
        <Spinner animation="border" variant="dark" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div style={{ margin: "120px 0", minHeight: "70vh" }}>
      <section className={styles.productsGridWrapper}>
        <Container>
          <Row className="mb-5">
            <Col lg={12}>
              <div className={styles.gridTitleWrapper}>
                <h3>{t.title}</h3>
              </div>
            </Col>
          </Row>

          {products.length === 0 ? (
            <div className="text-center py-5">
              <p style={{ color: "#777", fontSize: "1.1rem" }}>{t.empty}</p>
            </div>
          ) : (
            <Row className="g-0 p-0">
              {products.map((product) => (
                <Col
                  lg={3}
                  xs={6}
                  key={product?.id}
                  className={styles.sliderCard}
                >
                  <div className={styles.sliderImageWrapper}>
                    {product?.img && (
                      <Image
                        src={product?.img}
                        width={300}
                        height={300}
                        alt={product?.imageAlt || "Product image"}
                        className={styles.sliderImage}
                      />
                    )}
                    <div className="position-absolute bottom-0 end-0 translate-middle">
                      <button
                        className={styles.favoriteBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(product?.id);
                        }}
                      >
                        {isFavorite(product?.id) ? (
                          <IoHeart color="#C30000" size={24} />
                        ) : (
                          <IoHeartOutline color="#333333" size={24} />
                        )}
                      </button>
                    </div>
                    <div className="position-absolute top-0 end-0 pe-2">
                      {product?.tags?.map((tag, idx) => {
                        const lowerTag = tag.toLowerCase().trim();
                        const translatedTag =
                          idx === 0 &&
                          ![
                            "shop all",
                            "cleanse",
                            "exfoliate",
                            "hydrate",
                          ].includes(lowerTag)
                            ? tagTranslations[currentLocale]?.[lowerTag] || tag
                            : "";

                        return translatedTag ? (
                          <span key={tag} className={styles.tagsText}>
                            {translatedTag}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="text-center">
                    <Link
                      href={`/shop/product/${product?.handle}`}
                      className="text-decoration-none"
                    >
                      <p className={styles.title}>{product?.title}</p>

                      {product.desc &&
                        (() => {
                          let formattedHtml = product.desc.replace(
                            /<p>/g,
                            "\n<p>",
                          );
                          const cleanText = formattedHtml.replace(
                            /<[^>]*>/g,
                            "",
                          );
                          const lines = cleanText
                            .split("\n")
                            .map((l) => l.trim())
                            .filter(Boolean);
                          const subtitle = lines[0];
                          const size = lines[1];

                          return (
                            <div className="my-2 flex flex-col gap-0.5 text-center">
                              {subtitle && (
                                <p className={styles.description}>{subtitle}</p>
                              )}
                              {size && (
                                <p className={styles.description}>{size}</p>
                              )}
                            </div>
                          );
                        })()}

                      <p className={styles.price}>{product?.price}</p>
                    </Link>

                    <div className={styles.sliderBtnWrapper}>
                      <button
                        className={styles.sliderBtn}
                        onClick={(e) => handleAddToCartClick(e, product)}
                      >
                        {t.cartBtn}
                      </button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default FavoritesPage;
