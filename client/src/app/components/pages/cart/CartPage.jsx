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
  const [localizedTitles, setLocalizedTitles] = useState({}); // 💡 Localized products mapping state

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

  // 💡 FETCH FRESH TRANSLATED PRODUCT DATA FROM SHOPIFY WHEN LOCALE CHANGES
  useEffect(() => {
    const fetchLocalizedProductTitles = async () => {
      if (cartItems.length === 0) return;

      const productHandles = cartItems
        .map((item) => item.handle)
        .filter(Boolean);
      if (productHandles.length === 0) return;

      try {
        // Utilizing your handle loop endpoint to fetch fresh titles corresponding to current locale
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productHandles, locale: currentLocale }),
        });

        const freshProducts = await response.json();

        // Map variantId keys to their newly localized variants structures
        const translationMap = {};
        freshProducts.forEach((prod) => {
          if (prod.variantId) {
            translationMap[prod.variantId] = {
              title: prod.title,
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
  }, [locale, cartItems.length]);

  if (loadingLabels) {
    return <Spinner animation="border" variant="dark" />;
  }

  // Translation configuration objects
  const cartDict = {
    en: {
      title: "Cart",
      subtitle:
        "Purchase one more item of the sale products and receive free shipping! *Automatically applied on the next page",
      headerItem: "CART",
      headerPrice: "PRICE",
      headerQty: "QUANTITY",
      headerSub: "SUB-TOTAL",
      total: "Total",
      checkout: "Checkout",
      empty: "Your cart is empty",
    },
    es: {
      title: "Carrito",
      subtitle:
        "¡Compra un artículo más de los productos en oferta y recibe envío gratis! *Aplicado automáticamente en la siguiente página",
      headerItem: "PRODUCTO",
      headerPrice: "PRECIO",
      headerQty: "CANTIDAD",
      headerSub: "SUBTOTAL",
      total: "Total",
      checkout: "Proceder al Pago",
      empty: "Tu carrito está vacío",
    },
    fr: {
      title: "Panier",
      subtitle:
        "Achetez un article de plus et profitez de la livraison gratuite ! *Appliqué automatiquement à l'étape suivante",
      headerItem: "ARTICLE",
      headerPrice: "PRIX",
      headerQty: "QUANTITÉ",
      headerSub: "SOUS-TOTAL",
      total: "Total",
      checkout: "Passer la commande",
      empty: "Votre panier est vide",
    },
  };

  const t = cartDict[currentLocale] || cartDict.en;

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
        <h3>{t.title}</h3>
        <p className="text-muted mt-4">{t.empty}</p>
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

  // Determine uniform currency target from active inventory array items
  const activeCurrencyCode =
    localizedTitles[cartItems[0]?.variantId]?.currency || "USD";

  return (
    <section>
      <div style={{ marginTop: "140px", marginBottom: "80px" }}>
        <Container>
          {/* Cart Headers */}
          <div className="text-center mb-5">
            <h2 className={styles.cartMainTitle}>{t.title}</h2>
            <p className={styles.cartPromoSubtitle}>{t.subtitle}</p>
          </div>

          {/* Table Headings */}
          <Row
            className={`${styles.tableHeaderLine} d-none d-md-flex align-items-center mb-3 text-muted`}
          >
            <Col md={5}>
              <small>{t.headerItem}</small>
            </Col>
            <Col md={2} className="text-center">
              <small>{t.headerPrice}</small>
            </Col>
            <Col md={2} className="text-center">
              <small>{t.headerQty}</small>
            </Col>
            <Col md={3} className="text-end">
              <small>{t.headerSub}</small>
            </Col>
          </Row>

          {/* Item Rows */}
          {cartItems.map((item) => {
            const itemPriceNumeric =
              parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
            const targetCurrency =
              localizedTitles[item.variantId]?.currency || "USD";

            // 💡 Dynamic translation fallbacks
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
                key={item.variantId}
                className={`${styles.cartItemRow} align-items-center py-4 g-3`}
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
                    <h5 className={styles.productTitle}>{displayTitle}</h5>
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

                {/* Price Column - 💡 Dynamic Formatter */}
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

                {/* Individual Row Subtotal - 💡 Dynamic Formatter */}
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
                <h4 className={styles.totalLabel}>{t.total}</h4>
                {/* 💡 Total Block Format */}
                <h3 className={styles.totalAmount}>
                  {formatCurrency(subTotal, activeCurrencyCode)}
                </h3>
              </div>
              <p
                className={styles.shippingNotice}
                style={{ textAlign: "right", fontSize: "12px", color: "#777" }}
              >
                {currentLocale === "es"
                  ? "El costo de envío se calculará al momento de la compra"
                  : currentLocale === "fr"
                    ? "Les frais de port seront calculés lors de l'achat"
                    : "Shipping Fee will be calculated at the time of purchase"}
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
                  : t.checkout}
              </button>
            </Col>
          </Row>
        </Container>
      </div>
    </section>
  );
};

export default CartPage;
