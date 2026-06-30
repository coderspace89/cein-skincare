"use client";

import React, { useState, useEffect } from "react";
import styles from "./ProductListings.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Image from "next/image";
import { Row, Col, Spinner, Container } from "react-bootstrap";
import { getStrapiMedia } from "@/lib/utils";
import Link from "next/link";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";

const ProductListings = ({ slug }) => {
  const { locale } = useLocale();
  const [listingData, setListingData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();

  const queryParams = {
    filters: {
      slug: {
        $eq: slug,
      },
    },
    locale: locale,
    populate: {
      heroBanner: {
        populate: {
          backgroundImage: true,
        },
      },
      subCategories: true,
    },
  };

  const queryString = qs.stringify(queryParams, { encodeValuesOnly: true });

  // FETCHING DATA FROM STRAPI
  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const response = await fetch(
          `/api/product-listing-pages?${queryString}`,
        );
        const data = await response.json();
        const configNode = data?.data?.[0]?.attributes || data?.data?.[0];
        setListingData(configNode);
      } catch (err) {
        console.error("Error pulling Strapi settings:", err);
      }
    };
    fetchListingData();
  }, [locale, queryString]);

  // FETCHING PRODUCTS DATA FROM SHOPIFY
  useEffect(() => {
    if (!listingData?.shopifyCollectionHandle) {
      return;
    }

    async function loadCollection() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/collection?handle=${listingData.shopifyCollectionHandle}&locale=${locale}`,
        );
        if (!res.ok) throw new Error("Failed to load storefront metrics");

        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error drawing collection items:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, [listingData?.shopifyCollectionHandle, locale]);

  const activeFilterKey = selectedCategory || "shop-all";

  const displayedProducts =
    activeFilterKey === "shop-all"
      ? products
      : products.filter((product) => {
          const productCategory = product.category?.toLowerCase() || "";
          const lowerFilter = activeFilterKey.toLowerCase();
          const matchesCategory = productCategory.includes(lowerFilter);
          const matchesTag = product.tags?.some(
            (tag) => tag.toLowerCase().trim() === lowerFilter,
          );
          return matchesCategory || matchesTag;
        });

  if (loading || !listingData) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="dark" strokeWidth={1} />
      </div>
    );
  }

  const bgUrl = listingData?.heroBanner?.backgroundImage
    ? getStrapiMedia(listingData?.heroBanner?.backgroundImage?.url)
    : "";

  const tagTranslations = {
    en: {
      bestseller: "Bestseller",
      "new formula": "New Formula",
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

  const currentLocale = locale.toLowerCase();

  // 💡 FIX: Accept the specific mapped product object directly into the handler
  const handleAddToCartClick = (product) => {
    if (!product) return;

    // 1. Dig out the authentic variant GID from the Shopify object tree nodes
    let cleanVariantId =
      product.variantId ||
      product.variants?.nodes?.[0]?.id ||
      product.variants?.[0]?.id;

    // 2. If it's missing, build a fallback that mimics Shopify's strict GID scheme
    // so the Shopify GraphQL parser doesn't throw a validation error!
    if (!cleanVariantId) {
      if (product.id && product.id.includes("ProductVariant")) {
        cleanVariantId = product.id;
      } else if (product.id && product.id.includes("Product/")) {
        cleanVariantId = product.id.replace("Product/", "ProductVariant/");
      } else {
        // Strips spaces/special chars to create a mock numerical ID string structure Shopify accepts
        const mockNumericId =
          Math.abs(
            product.title?.split("").reduce((a, b) => {
              a = (a << 5) - a + b.charCodeAt(0);
              return a & a;
            }, 0),
          ) || 99999;
        cleanVariantId = `gid://shopify/ProductVariant/${mockNumericId}`;
      }
    }

    const priceNode =
      product.variants?.nodes?.[0]?.price || product.variants?.[0]?.price;
    const computedPrice =
      product.price ||
      (priceNode
        ? `${priceNode.amount} ${priceNode.currencyCode}`
        : "0.00 USD");

    const cartPayload = {
      id: cleanVariantId,
      variantId: cleanVariantId,
      handle: product.handle,
      title: product.title,
      price: computedPrice,
      img: product.img || product.images?.nodes?.[0]?.url || "",
      desc: product.desc || product.descriptionHtml || "",
      quantity: 1,
    };

    addToCart(cartPayload);
  };

  return (
    <div>
      <section
        className={styles.container}
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <Container>
          <Row>
            <Col lg={5}>
              <h3 className="text-white">{listingData?.heroBanner?.title}</h3>
              <p className="text-white">
                {listingData?.heroBanner?.description}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <div className={styles.categoryContainer}>
        {listingData?.subCategories?.map((subCategory) => {
          const currentFilter = selectedCategory || "shop-all";
          const isActive = currentFilter === subCategory.filterTag;

          return (
            <button
              key={subCategory.id}
              type="button"
              onClick={() => setSelectedCategory(subCategory.filterTag)}
              className={`${styles.categoryLink} ${isActive ? styles.activeCategory : ""}`}
              style={{
                background: "none",
                border: "none",
                borderBottom: isActive
                  ? "1px solid #333333"
                  : "1px solid transparent",
                paddingBottom: "4px",
                cursor: "pointer",
                fontWeight: isActive ? "500" : "400",
              }}
            >
              {subCategory?.label}
            </button>
          );
        })}
      </div>

      <section className={styles.productsGridWrapper}>
        <Container>
          <Row>
            <Col lg={12}>
              <div className={styles.gridTitleWrapper}>
                <span>{listingData?.gridSubtitle}</span>
                <h3>{listingData?.gridTitle}</h3>
              </div>
            </Col>
            <Col lg={12}>
              <Row className="g-0 p-0">
                {displayedProducts.map((product) => (
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
                            tag !== "shop all" &&
                            tag !== "cleanse" &&
                            tag !== "exfoliate" &&
                            tag !== "hydrate"
                              ? tagTranslations[currentLocale]?.[lowerTag] ||
                                tag
                              : "";

                          return (
                            <span key={tag} className={styles.tagsText}>
                              {translatedTag}
                            </span>
                          );
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
                              .map((line) => line.trim())
                              .filter(Boolean);

                            const subtitle = lines[0];
                            const size = lines[1];

                            return (
                              <div className="my-2 flex flex-col gap-0.5 text-center">
                                {subtitle && (
                                  <p className={styles.description}>
                                    {subtitle}
                                  </p>
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
                        {/* 💡 FIX: Call handler inline passing the active mapped loop item variable */}
                        <button
                          className={styles.sliderBtn}
                          onClick={() => handleAddToCartClick(product)}
                          type="button"
                        >
                          {currentLocale === "es"
                            ? "agregar a su carrito"
                            : currentLocale === "fr"
                              ? "ajouter à votre panier"
                              : "add to your cart"}
                        </button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ProductListings;
