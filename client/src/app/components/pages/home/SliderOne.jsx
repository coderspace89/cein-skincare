"use client";

import React, { useState, useEffect } from "react";
import styles from "./SliderOne.module.css";
import qs from "qs";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LiaArrowRightSolid } from "react-icons/lia";
import { useLocale } from "@/context/LocaleContext";
import { IoHeartOutline } from "react-icons/io5";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";
import Link from "next/link";

const SliderOne = () => {
  const { locale } = useLocale();
  const [sliderData, setSliderData] = useState(null);
  const [shopifyProducts, setShopifyProducts] = useState([]);

  // Memoize query string so it doesn't calculate on random component re-renders
  const query = React.useMemo(() => {
    return qs.stringify(
      {
        locale: locale,
        populate: {
          pageBlocks: {
            on: {
              "blocks.product-carousel": {
                populate: {
                  productHandles: true,
                },
              },
            },
          },
        },
      },
      { encodeValuesOnly: true },
    );
  }, [locale]);

  // FETCH STRAPI DATA
  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const response = await fetch(`/api/home-page?${query}`);
        const data = await response.json();

        // Find the specific block explicitly instead of hardcoding index [0]
        // to prevent bugs if block arrays shift positions
        const carouselBlock =
          data?.data?.pageBlocks?.find(
            (block) => block.__component === "blocks.product-carousel",
          ) || data?.data?.pageBlocks?.[0];

        setSliderData(carouselBlock);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };

    // 👈 CRITICAL FIX: Wipe out old states when query changes
    // This stops the background processing race condition instantly
    setSliderData(null);
    setShopifyProducts([]);

    fetchBlockData();
  }, [query]);

  // FETCH PRODUCTS DATA VIA LOCAL NEXT.JS SERVER PROXY
  useEffect(() => {
    if (!sliderData?.productHandles || sliderData.productHandles.length === 0)
      return;

    let isMounted = true;

    // 1. CRITICAL FIX: Extract the raw handle strings out of the nested Strapi array structure
    const flatHandlesArray = sliderData.productHandles
      .map((item) => (typeof item === "string" ? item : item?.handle))
      .filter(Boolean); // Cleans out any empty rows

    // 2. Fetch from your own internal Next.js server route
    fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productHandles: flatHandlesArray, // 👈 Pass the clean string array: ["pure-micellar-cleansing-water", ...]
        locale: locale,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network proxy response failed");
        return res.json();
      })
      .then((products) => {
        if (isMounted) {
          // 👈 Slice the array to save ONLY the first 5 items
          const firstFiveProducts = products.slice(0, 5);
          setShopifyProducts(firstFiveProducts);
        }
      })
      .catch((err) => {
        console.error("Client side fetch failed:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [sliderData, locale]);

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

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className={styles.container}>
      <Container>
        <Row>
          <Col lg={12}>
            <div>
              <p className={styles.sectionSubtitle}>{sliderData?.subtitle}</p>
              <h2 className={styles.sectionTitle}>{sliderData?.title}</h2>
              <p className={styles.sectionDescription}>
                {sliderData?.description}
              </p>
            </div>
          </Col>
          <Col lg={12}>
            <div className="slider-container">
              {/* Only mount slick slider if products are ready to avoid structural layout breaking */}
              {shopifyProducts.length > 0 ? (
                <Slider {...settings}>
                  {shopifyProducts.map((product) => (
                    <div key={product?.id} className={styles.sliderCard}>
                      <div className={styles.sliderImageWrapper}>
                        {product?.imageUrl && (
                          <Image
                            src={product?.imageUrl}
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
                              tag !== "cleanse"
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
                          href={`/shop/${product?.handle}`}
                          className="text-decoration-none"
                        >
                          <p className={styles.title}>{product?.title}</p>
                          <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{
                              __html: product.description,
                            }}
                          />
                          <p className={styles.price}>
                            {Math.round(product?.price)} {product?.currency}
                          </p>
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
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="text-center py-5">
                  <span>Loading tailored catalog collections...</span>
                </div>
              )}
            </div>
            <div className={styles.allLinkWrapper}>
              <Link href="/shop-all" className={styles.allLink}>
                <span>
                  {currentLocale === "es"
                    ? "todos los productos"
                    : currentLocale === "fr"
                      ? "tous les produits"
                      : "all products"}
                  <span className="ms-3">
                    <LiaArrowRightSolid color="#333333" size={24} />
                  </span>
                </span>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SliderOne;
