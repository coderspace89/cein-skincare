"use client";

import React, { useState, useEffect } from "react";
import styles from "./ProductListings.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Image from "next/image";
import { Row, Col, Spinner, Container } from "react-bootstrap";
import { getStrapiMedia } from "@/lib/utils";
import Link from "next/link";
import { IoHeartOutline } from "react-icons/io5";

const ProductListings = ({ slug }) => {
  const { locale } = useLocale();
  const [listingData, setListingData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 1. Memoize or safely structure the query object parameter blocks
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
        // Double check your Strapi route base path structure if hitting local vs proxy routes
        const response = await fetch(
          `/api/product-listing-pages?${queryString}`,
        );
        const data = await response.json();

        // Strapi returns an array inside a wrapper key configuration block
        const configNode = data?.data?.[0]?.attributes || data?.data?.[0];
        console.log("Strapi config node payload resolved:", configNode);
        setListingData(configNode);
      } catch (err) {
        console.error("Error pulling Strapi settings:", err);
      }
    };
    fetchListingData();
  }, [locale, queryString]);

  // FETCHING PRODUCTS DATA FROM SHOPIFY
  useEffect(() => {
    // FIX 1: Early Return Guard!
    // Do not run the fetch if listingData hasn't been returned from Strapi yet.
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
        console.log(
          "Shopify query array payload successfully fetched:",
          data?.products,
        );
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error drawing collection items:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, [listingData?.shopifyCollectionHandle, locale]); // FIX 2: Re-evaluates safely when the collection handle goes from null to active string

  // 1. Identify which filter code configuration is currently active
  // Fall back to "shop-all" if nothing has been clicked yet.
  const activeFilterKey = selectedCategory || "shop-all";

  // 2. Filter the master product array natively on the client
  const displayedProducts =
    activeFilterKey === "shop-all"
      ? products
      : products.filter((product) => {
          const productCategory = product.category?.toLowerCase() || "";
          const lowerFilter = activeFilterKey.toLowerCase();

          // Matches if the subcategory filter tag matches the Shopify category string
          const matchesCategory = productCategory.includes(lowerFilter);

          // Matches if the filter tag exists inside the product tags array coming from Shopify
          const matchesTag = product.tags?.some(
            (tag) => tag.toLowerCase().trim() === lowerFilter,
          );

          return matchesCategory || matchesTag;
        });

  // Render loading indicator if listing data or products are still resolving
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

  const currentLocale = locale.toLowerCase();

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
          // Determine if this specific item matches the currently selected filter context
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
                          height={300} // Increased height relative to width for premium crop aspect ratios
                          alt={product?.imageAlt || "Product image"}
                          className={styles.sliderImage}
                        />
                      )}
                      <div className="position-absolute bottom-0 end-0 translate-middle">
                        <span>
                          <IoHeartOutline color="#333333" size={24} />
                        </span>
                      </div>
                      <div className="position-absolute top-0 end-0 pe-2">
                        {product?.tags?.map((tag, idx) => {
                          const lowerTag = tag.toLowerCase().trim();
                          // Fall back to original tag string if a local map doesn't exist
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
                        {/* <div
                          className={styles.description}
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
                        <button className={styles.sliderBtn}>
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
