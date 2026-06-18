"use client";

import React, { useState, useEffect } from "react";
import styles from "./ProductHero.module.css";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoHeartOutline } from "react-icons/io5";

const ProductHero = ({ slug }) => {
  const { locale } = useLocale();
  const currentLocale = locale.toLowerCase();
  const [shopifyData, setShopifyData] = useState(null);

  // 1. Get the country code from your locale string if it includes a region (e.g., "en-us" -> "us")
  // 2. Fall back to a smart mapping if it's just a language code (e.g., "fr" -> "fr")
  let countryCode = "us"; // Default fallback

  if (currentLocale.includes("-")) {
    countryCode = currentLocale.split("-")[1];
  } else {
    // Map solitary language codes to their primary market country codes
    const languageToCountryMap = {
      en: "us",
      fr: "fr",
      es: "es",
      // Add other languages your storefront supports here
    };
    countryCode = languageToCountryMap[currentLocale] || "us";
  }

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(
        `/api/product-details?handle=${slug}&language=${currentLocale}&country=${countryCode}`,
      );
      const productData = await res.json();
      console.log(productData);
      setShopifyData(productData);
    };
    fetchProduct();
  }, [currentLocale]);

  if (!shopifyData) {
    return (
      <div className="w-full text-center py-20 text-gray-500">
        Loading product details...
      </div>
    );
  }

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 1,
  };

  return (
    <section className={styles.container}>
      <Container fluid className="p-0">
        <Row>
          <Col lg={8}>
            <div>
              <Slider {...settings}>
                {shopifyData?.images?.nodes?.map(
                  (img, idx) =>
                    img?.url && (
                      <Image
                        key={idx}
                        src={
                          img.url.startsWith("http")
                            ? img.url
                            : getStrapiMedia(img.url)
                        }
                        width={600}
                        height={600}
                        alt="Product Image"
                        className={styles.productImg}
                      />
                    ),
                )}
              </Slider>
            </div>
          </Col>
          <Col lg={4}>
            <div className={styles.productTextCol}>
              <div className="mb-4">
                <span style={{ fontSize: "14px" }}>
                  {shopifyData?.category?.name}
                </span>
                <span className="px-3">•</span>
                <span style={{ fontSize: "14px" }}>{shopifyData?.title}</span>
              </div>
              <div>
                <h2>{shopifyData?.title}</h2>
              </div>

              {shopifyData?.descriptionHtml &&
                (() => {
                  // 1. Add a newline right before every opening <p> tag to guarantee string separation
                  let formattedHtml = shopifyData.descriptionHtml.replace(
                    /<p>/g,
                    "\n<p>",
                  );

                  // 2. Strip out all other HTML tags safely
                  const cleanText = formattedHtml.replace(/<[^>]*>/g, "");

                  // 3. Break the rows apart, trim empty spaces, and drop empty lines
                  const lines = cleanText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);

                  // Slice array from index 2 onwards to grab the remaining long description paragraphs
                  const detailedParagraphs = lines.slice(2);

                  return (
                    <div>
                      {detailedParagraphs.map((para, i) => (
                        <p key={i} className={styles.description}>
                          {para}
                        </p>
                      ))}
                    </div>
                  );
                })()}

              <div>
                {/* Fix: changed .node to .nodes and targeted item.price.amount */}
                {shopifyData?.variants?.nodes?.map((item) => (
                  <div key={item.id} className="font-medium mt-4">
                    <h3>
                      {Math.round(item.price?.amount)}{" "}
                      {item.price?.currencyCode}
                    </h3>
                  </div>
                ))}
              </div>
              <div className={styles.sliderBtnWrapper}>
                <button className={styles.sliderBtn}>
                  {currentLocale === "es"
                    ? "agregar a su carrito"
                    : currentLocale === "fr"
                      ? "ajouter à votre panier"
                      : "add to your cart"}
                </button>
              </div>
              <div className={styles.saveBtnWrapper}>
                <button className={styles.saveBtn}>
                  <span>
                    <IoHeartOutline
                      color="#333333"
                      size={24}
                      className="me-2"
                    />
                    {currentLocale === "es"
                      ? "Guardar en el armario"
                      : currentLocale === "fr"
                        ? "Conserver dans le placard"
                        : "Save to cabinet"}
                  </span>
                </button>
              </div>
              <div>
                {shopifyData?.categoryMetafields &&
                  (() => {
                    // 1. Helper function to extract and join the labels from a specific metafield key
                    const getLabelsByKey = (keyName) => {
                      // Fix: Added optional chaining to meta?.key to handle null entries safely
                      const metafield = shopifyData?.categoryMetafields?.find(
                        (meta) => meta?.key === keyName,
                      );
                      if (!metafield?.references?.nodes) return null;

                      return metafield.references.nodes
                        .map((node) => {
                          // Safely look for the localized "label" or "name" field
                          const localizedLabel = node?.fields?.find(
                            (f) => f?.key === "label" || f?.key === "name",
                          )?.value;

                          // Fall back to the node's handle if fields are missing
                          return localizedLabel || node?.handle;
                        })
                        .filter(Boolean)
                        .join(", ");
                    };

                    const suitedTo = getLabelsByKey("suitable-for-skin-type");
                    const skinFeel = getLabelsByKey("skin-care-features");
                    const keyIngredients = getLabelsByKey("active-ingredient");

                    return (
                      <div className="mt-4 flex flex-col gap-5">
                        {/* Suited to Section */}
                        {suitedTo && (
                          <div className="flex flex-col gap-1 border-bottom border-secondary-subtle pb-2 mb-3">
                            <p className={styles.categoryMetaTitle}>
                              {currentLocale === "es"
                                ? "Adecuada para"
                                : currentLocale === "fr"
                                  ? "Adapté à"
                                  : "Suited to"}
                            </p>
                            <p className={styles.categoryMetaText}>
                              {suitedTo}
                            </p>
                          </div>
                        )}

                        {/* Skin Feel Section */}
                        {skinFeel && (
                          <div className="flex flex-col gap-1 border-bottom border-secondary-subtle pb-2 mb-3">
                            <p className={styles.categoryMetaTitle}>
                              {currentLocale === "es"
                                ? "Sensación en la piel"
                                : currentLocale === "fr"
                                  ? "Sensation sur la peau"
                                  : "Skin Feel"}
                            </p>
                            <p className={styles.categoryMetaText}>
                              {skinFeel}
                            </p>
                          </div>
                        )}

                        {/* Key Ingredients Section */}
                        {keyIngredients && (
                          <div className="flex flex-col gap-1 border-bottom border-secondary-subtle pb-2 mb-3">
                            <p className={styles.categoryMetaTitle}>
                              {currentLocale === "es"
                                ? "Ingredientes clave"
                                : currentLocale === "fr"
                                  ? "Ingrédients clés"
                                  : "Key ingredients"}
                            </p>
                            <p className={styles.categoryMetaText}>
                              {keyIngredients}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProductHero;
