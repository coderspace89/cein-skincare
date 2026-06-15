"use client";

import React, { useState, useEffect } from "react";
import styles from "./ProductListings.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Image from "next/image";
import { Row, Col, Spinner, Container } from "react-bootstrap";
import { getStrapiMedia } from "@/lib/utils";

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

  // Read sub-categories present in the data response for the menu bar tabs
  const uniqueCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  );

  const displayedProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

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

  return (
    <section
      className={styles.container}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <Container>
        <Row>
          <Col lg={5}>
            <h3 className="text-white">{listingData?.heroBanner?.title}</h3>
            <p className="text-white">{listingData?.heroBanner?.description}</p>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProductListings;
