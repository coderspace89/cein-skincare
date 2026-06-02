"use client";

import React, { useState, useEffect } from "react";
import styles from "./SliderOne.module.css";
import qs from "qs";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LiaArrowRightSolid } from "react-icons/lia";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getShopifyProductsByHandles } from "@/lib/shopifyHelper";
import Image from "next/image";

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

  // FETCH PRODUCTS DATA FROM SHOPIFY
  useEffect(() => {
    // Only run if sliderData exists and actually matches your current language context
    if (!sliderData?.productHandles) return;

    let isMounted = true; // Prevents updating state if component unmounts mid-fetch

    getShopifyProductsByHandles(sliderData.productHandles, locale).then(
      (products) => {
        if (isMounted) {
          setShopifyProducts(products);
        }
      },
    );

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [sliderData, locale]);

  console.log(shopifyProducts);

  const settings = {
    dots: true,
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
          dots: true,
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
              <p>{sliderData?.subtitle}</p>
              <h2>{sliderData?.title}</h2>
              <p>{sliderData?.description}</p>
            </div>
          </Col>
          <Col lg={12}>
            <div className="slider-container">
              {/* Only mount slick slider if products are ready to avoid structural layout breaking */}
              {shopifyProducts.length > 0 ? (
                <Slider {...settings}>
                  {shopifyProducts.map((product) => (
                    <div key={product?.id}>
                      <div>
                        {product?.imageUrl && (
                          <Image
                            src={product?.imageUrl}
                            width={300}
                            height={300} // Increased height relative to width for premium crop aspect ratios
                            alt={product?.imageAlt || "Product image"}
                            className={styles.sliderImage}
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <p>{product?.title}</p>
                        <p>{product?.description}</p>
                        <p>
                          {Math.round(product?.price)} {product?.currency}
                        </p>
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
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SliderOne;
