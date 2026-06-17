"use client";

import React, { useState, useEffect } from "react";
import styles from "./ProductHero.module.css";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

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

  return (
    <section className={styles.container}>
      <Container fluid className="p-0">
        <Row>
          <Col lg={8}>
            <div>
              {shopifyData?.images?.nodes.map(
                (img, idx) =>
                  idx === 1 && (
                    <Image
                      key={idx}
                      src={getStrapiMedia(img.url)}
                      width={600}
                      height={600}
                      alt=""
                    />
                  ),
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProductHero;
