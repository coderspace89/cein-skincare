"use client";

import React, { useState, useEffect } from "react";
import styles from "./CartPage.module.css";
import qs from "qs";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import Image from "next/image";
import Link from "next/link";

const CartPage = () => {
  const [pageData, setPageData] = useState(null);
  const [localizedTitles, setLocalizedTitles] = useState({}); // Localized products mapping state

  const { cartItems, updateQuantity, subTotal, removeFromCart } = useCart();
  const { locale } = useLocale();
  const [redirecting, setRedirecting] = useState(false);
  const [loadingLabels, setLoadingLabels] = useState(true);

  const currentLocale = locale.toLowerCase();

  // Helper utility to reliably format currency based on current locale
  const formatCurrency = (numericValue, currencyCode = "USD") => {
    const bcp47Locale =
      currentLocale === "es"
        ? "es-ES"
        : currentLocale === "fr"
          ? "fr-FR"
          : "en-US";
    return new Intl.NumberFormat(bcp47Locale, {
      style: "currency",
      currency: currencyCode,
    }).format(numericValue);
  };

  // FETCH PAGE DATA FROM STRAPI
  useEffect(() => {
    const fetchCartLabels = async () => {
      setLoadingLabels(true);
      try {
        const queryParams = { locale: locale };
        const queryString = qs.stringify(queryParams, {
          encodeValuesOnly: true,
        });

        const response = await fetch(`/api/cart-page?${queryString}`);
        const payload = await response.json();
        const dataNode = payload?.data;
        console.log(dataNode);

        if (dataNode) {
          setPageData(dataNode);
        }
      } catch (error) {
        console.error(
          "Failed to resolve localized Strapi cart layouts:",
          error,
        );
      } finally {
        setLoadingLabels(false);
      }
    };

    fetchCartLabels();
  }, [locale]);

  // FETCH FRESH TRANSLATED PRODUCT DATA FROM SHOPIFY WHEN LOCALE CHANGES
  useEffect(() => {
    console.log(
      "1. UseEffect mounted. Cart items count:",
      cartItems?.length,
      "Locale:",
      locale,
    );

    const fetchLocalizedProductTitles = async () => {
      if (!cartItems || cartItems.length === 0) return;

      // Map by variantId (or item.id) instead of handle
      const variantIds = cartItems
        .map((item) => item.variantId || item.id)
        .filter(Boolean);
      console.log("3. Extracted Variant IDs:", variantIds);

      if (variantIds.length === 0) return;

      try {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantIds, locale }),
        });

        const freshProducts = await response.json();

        const translationMap = {};
        freshProducts.forEach((prod) => {
          if (prod.variantId) {
            translationMap[prod.variantId] = {
              title: prod.title,
              description: prod.description,
              price: prod.price, // 💡 FIXED: Storing the fresh localized price from Shopify into state
              currency: prod.currency || "USD",
            };
          }
        });

        setLocalizedTitles(translationMap);
      } catch (err) {
        console.error("Failed to dynamically update localized products:", err);
      }
    };

    fetchLocalizedProductTitles();
  }, [locale, JSON.stringify(cartItems)]);

  if (loadingLabels) {
    return <Spinner animation="border" variant="dark" />;
  }

  // checkout function
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setRedirecting(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: cartItems, locale }),
      });
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error("Checkout redirection structural breakdown:", err);
    } finally {
      setRedirecting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container
        className="text-center"
        style={{ marginTop: "160px", minHeight: "50vh" }}
      >
        <h3>{pageData?.title}</h3>
        <p className="text-muted mt-4">
          {currentLocale === "es"
            ? "Tu carrito está vacío"
            : currentLocale === "fr"
              ? "Votre panier est vide"
              : "Your cart is empty"}
        </p>
        <Link
          href="/shop/shop-all"
          className="btn btn-outline-dark mt-2 text-capitalize"
          style={{ borderRadius: 0 }}
        >
          {currentLocale === "es"
            ? "Ver todo"
            : currentLocale === "fr"
              ? "Tout acheter"
              : "Shop All"}
        </Link>
      </Container>
    );
  }

  // Recalculate your cart subtotal using the live localized values
  const localizedSubTotal = cartItems.reduce((acc, item) => {
    const localizedProduct = localizedTitles[item.variantId];
    const rawPriceString =
      localizedProduct?.price !== undefined
        ? String(localizedProduct.price)
        : item.price;
    const itemPriceNumeric =
      parseFloat(rawPriceString.replace(/[^0-9.]/g, "")) || 0;
    return acc + itemPriceNumeric * item.quantity;
  }, 0);

  // Determine uniform currency target from active inventory array items
  const activeCurrencyCode =
    localizedTitles[cartItems[0]?.variantId]?.currency || "USD";

  return (
    <section className={styles.container}>
      <div>
        <Container>
          {/* Cart Headers */}
          <div className="text-center my-5">
            <h2 className={styles.cartMainTitle}>{pageData?.title}</h2>
            <p className={styles.cartDescription}>{pageData?.description}</p>
          </div>

          {/* Table Headings */}
          <Row
            className={`${styles.tableHeaderLine} d-none d-md-flex align-items-center mb-3 text-muted border-bottom border-light-subtle`}
          >
            <Col md={5}>
              <small className="text-uppercase">{pageData?.cartLabel}</small>
            </Col>
            <Col md={2} className="text-center">
              <small className="text-uppercase">{pageData?.priceLabel}</small>
            </Col>
            <Col md={2} className="text-center">
              <small className="text-uppercase">
                {pageData?.quantityLabel}
              </small>
            </Col>
            <Col md={3} className="text-end">
              <small className="text-uppercase">
                {pageData?.subtotalLabel}
              </small>
            </Col>
          </Row>

          {/* Item Rows */}
          {cartItems.map((item) => {
            const itemPriceNumeric =
              parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
            const targetCurrency =
              localizedTitles[item.variantId]?.currency || "USD";

            const displayTitle =
              localizedTitles[item.variantId]?.title || item.title;

            // Parse descriptions for size sub-labels securely
            let sizeLabel = "";
            if (item.desc) {
              const cleanLines = item.desc
                .replace(/<p>/g, "\n<p>")
                .replace(/<[^>]*>/g, "")
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
              if (cleanLines[1]) sizeLabel = cleanLines[1];
            }

            return (
              <Row
                key={item.variantId || `cart-item-${item.id}`}
                className={`${styles.cartItemRow} align-items-center py-4 g-3 border-bottom border-light-subtle`}
              >
                {/* Product Info Column */}
                <Col md={5} xs={12} className="d-flex align-items-center">
                  {item.img && (
                    <div className={styles.imgContainer}>
                      <Image
                        src={item.img}
                        alt={displayTitle}
                        width={90}
                        height={90}
                        className="object-fit-contain"
                      />
                    </div>
                  )}
                  <div className="ms-3">
                    <p className={styles.productTitle}>{displayTitle}</p>
                    {sizeLabel && (
                      <p className={styles.productSize}>{sizeLabel}</p>
                    )}
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className={styles.removeBtn}
                    >
                      <small
                        style={{
                          textDecoration: "underline",
                          color: "#888",
                          fontSize: "11px",
                        }}
                      >
                        {currentLocale === "es"
                          ? "Eliminar"
                          : currentLocale === "fr"
                            ? "Supprimer"
                            : "Remove"}
                      </small>
                    </button>
                  </div>
                </Col>

                {/* Price Column - Dynamic Formatter */}
                <Col md={2} xs={4} className="text-md-center text-start">
                  <span className={styles.itemMetrics}>
                    {formatCurrency(itemPriceNumeric, targetCurrency)}
                  </span>
                </Col>

                {/* Quantity Adjuster Column */}
                <Col
                  md={2}
                  xs={4}
                  className="d-flex justify-content-md-center justify-content-start"
                >
                  <div className={styles.quantityDropdownWrapper}>
                    <Form.Select
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          item.variantId,
                          parseInt(e.target.value, 10),
                        )
                      }
                      className={styles.quantitySelect}
                    >
                      {[...Array(10).keys()].map((val) => (
                        <option key={val + 1} value={val + 1}>
                          {val + 1}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>

                {/* Individual Row Subtotal - Dynamic Formatter */}
                <Col md={3} xs={4} className="text-end">
                  <span className={styles.itemMetrics}>
                    {formatCurrency(
                      itemPriceNumeric * item.quantity,
                      targetCurrency,
                    )}
                  </span>
                </Col>
              </Row>
            );
          })}

          {/* Bottom Total Block Row Layout */}
          <Row className="justify-content-end mt-5 pt-4">
            <Col lg={4} md={6} xs={12}>
              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <h4 className={styles.totalLabel}>{pageData?.totalLabel}</h4>
                {/* Total Block Format */}
                <h3 className={styles.totalAmount}>
                  {formatCurrency(localizedSubTotal, activeCurrencyCode)}
                </h3>
              </div>
              <p
                className={styles.shippingNotice}
                style={{ textAlign: "right", fontSize: "12px", color: "#777" }}
              >
                {pageData?.infoText}
              </p>
              <button
                onClick={handleCheckout}
                disabled={redirecting}
                className={`${styles.checkoutButton} w-100 py-3 mt-2`}
              >
                {redirecting
                  ? currentLocale === "es"
                    ? "Procesando..."
                    : currentLocale === "fr"
                      ? "Traitement..."
                      : "Processing..."
                  : pageData?.btnLabel}
              </button>
            </Col>
          </Row>
        </Container>
      </div>
    </section>
  );
};

export default CartPage;
