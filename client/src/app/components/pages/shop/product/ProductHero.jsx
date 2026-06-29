"use client";

import React, { useState, useEffect } from "react";
import styles from "./ProductHero.module.css";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { useCart } from "@/context/CartContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { useFavorites } from "@/context/FavoritesContext";

const ProductHero = ({ slug }) => {
  const { locale } = useLocale();
  const currentLocale = locale.toLowerCase();
  const [shopifyData, setShopifyData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCart } = useCart();

  let countryCode = "us";

  if (currentLocale.includes("-")) {
    countryCode = currentLocale.split("-")[1];
  } else {
    const languageToCountryMap = {
      en: "us",
      fr: "fr",
      es: "es",
    };
    countryCode = languageToCountryMap[currentLocale] || "us";
  }

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(
        `/api/product-details?handle=${slug}&language=${currentLocale}&country=${countryCode}`,
      );
      const productData = await res.json();
      setShopifyData(productData);

      // Automatically auto-select the standard target product variant node
      if (productData?.variants?.nodes?.length > 0) {
        setSelectedVariant(productData.variants.nodes[0]);
      }
    };
    fetchProduct();
  }, [currentLocale, slug, countryCode]);

  // Click Handler for the main button
  const handleAddToCartClick = () => {
    if (!shopifyData || !selectedVariant) return;

    const cartPayload = {
      id: selectedVariant.id,
      variantId: selectedVariant.id,
      handle: slug,
      title: shopifyData.title,
      price: `${selectedVariant.price?.amount || 0} ${selectedVariant.price?.currencyCode || "USD"}`,
      img: shopifyData?.images?.nodes?.[0]?.url || "",
      desc: shopifyData?.descriptionHtml || "",
      quantity: 1,
    };

    addToCart(cartPayload);
  };

  if (!shopifyData) {
    return (
      <div className="w-100 text-center py-5 text-gray">
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

  // Safe fallback price values if the selected variant state hasn't resolved yet
  const displayPriceItem = selectedVariant || shopifyData?.variants?.nodes?.[0];

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
                        key={`hero-img-${idx}`}
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
                  let formattedHtml = shopifyData.descriptionHtml.replace(
                    /<p>/g,
                    "\n<p>",
                  );
                  const cleanText = formattedHtml.replace(/<[^>]*>/g, "");
                  const lines = cleanText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);
                  const detailedParagraphs = lines.slice(2);

                  return (
                    <div>
                      {detailedParagraphs.map((para, i) => (
                        <p
                          key={`desc-para-${i}`}
                          className={styles.description}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  );
                })()}

              {/* Display plain static price element cleanly (No map loops) */}
              {displayPriceItem && (
                <div className="font-medium mt-4">
                  <h3>
                    {Math.round(displayPriceItem.price?.amount)}{" "}
                    {displayPriceItem.price?.currencyCode}
                  </h3>
                </div>
              )}

              {/* Add to Cart button now handles the active method on click directly */}
              <div className={styles.sliderBtnWrapper}>
                <button
                  className={styles.sliderBtn}
                  onClick={handleAddToCartClick}
                  type="button"
                >
                  {currentLocale === "es"
                    ? "agregar a su carrito"
                    : currentLocale === "fr"
                      ? "ajouter à votre panier"
                      : "add to your cart"}
                </button>
              </div>

              <div className={styles.saveBtnWrapper}>
                <button
                  className={styles.saveBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(shopifyData?.id);
                  }}
                >
                  <span>
                    {isFavorite(shopifyData?.id) ? (
                      <IoHeart color="#C30000" size={24} className="me-2" />
                    ) : (
                      <IoHeartOutline
                        color="#333333"
                        size={24}
                        className="me-2"
                      />
                    )}
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
                    const getLabelsByKey = (keyName) => {
                      const metafield = shopifyData?.categoryMetafields?.find(
                        (meta) => meta?.key === keyName,
                      );
                      if (!metafield?.references?.nodes) return null;

                      return metafield.references.nodes
                        .map((node) => {
                          const localizedLabel = node?.fields?.find(
                            (f) => f?.key === "label" || f?.key === "name",
                          )?.value;
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
