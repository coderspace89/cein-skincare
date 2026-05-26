"use client";

import React, { useState, useEffect, useMemo } from "react";
import Slider from "react-slick";
import heroStyles from "./Hero.module.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";

// Import slick-carousel css files directly into your component
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Hero = () => {
  const [heroData, setHeroData] = useState(null);
  const { locale } = useLocale();

  // Memoize query to prevent unnecessary re-runs
  const query = useMemo(() => {
    return qs.stringify(
      {
        locale: locale,
        populate: {
          Hero: {
            populate: {
              backgroundImage: true,
            },
          },
        },
      },
      { encodeValuesOnly: true }
    );
  }, [locale]);

  useEffect(() => {
    const fetchHeroBlock = async () => {
      try {
        const response = await fetch(`/api/home-page?${query}`);
        const json = await response.json();
        const heroFields = json?.data?.attributes?.Hero || json?.data?.Hero;
        setHeroData(heroFields);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      }
    };
    fetchHeroBlock();
  }, [query]);

  // Slick Slider settings optimized for background cross-fades
  const sliderSettings = {
    dots: false,          // Keeps it clean, set to true if you want navigation dots
    fade: true,           // Cross-fade animation looks much more premium for hero backgrounds
    infinite: true,
    speed: 1000,          // Transition duration (1 second)
    autoplay: true,
    autoplaySpeed: 5000,  // Stay on each image for 5 seconds
    arrows: false,        // Hide side arrows so it looks like a clean background
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: false,
  };

  return (
    <section className={heroStyles.heroWrapper}>
      {/* BACKGROUND SLIDER LAYER */}
      <div className={heroStyles.sliderContainer}>
        {heroData?.backgroundImage?.length > 0 && (
          <Slider {...sliderSettings}>
            {heroData.backgroundImage.map((img) => {
              const absoluteUrl = getStrapiMedia(img.url);
              return (
                <div key={img.id} className={heroStyles.slide}>
                  <div
                    className={heroStyles.slideImage}
                    style={{ backgroundImage: `url("${absoluteUrl}")` }}
                  />
                </div>
              );
            })}
          </Slider>
        )}
        {/* Transparent Dark Overlay Mask for Text Legibility */}
        <div className={heroStyles.overlay} />
      </div>

      {/* STATIC CONTENT LAYER */}
      <Container className={heroStyles.contentContainer}>
        <Row>
          <Col lg={5}>
            {heroData && (
              <div className={heroStyles.contentBlock}>
                <span className={heroStyles.subtitle}>{heroData.subtitle}</span>
                <h1 className={heroStyles.title}>{heroData.title}</h1>
                <p className={heroStyles.description}>{heroData.description}</p>
                <a href={heroData.ctaUrl} className="btn btn-outline-light px-4 py-2">
                  {heroData.ctaLabel}
                </a>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;