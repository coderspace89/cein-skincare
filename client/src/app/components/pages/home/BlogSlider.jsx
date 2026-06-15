"use client";

import React, { useState, useEffect } from "react";
import styles from "./BlogSlider.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import { LiaArrowRightSolid } from "react-icons/lia";
import Image from "next/image";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BlogSlider = () => {
  const [blogData, setBlogData] = useState([]);
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();
  const currentLocale = locale.toLowerCase();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        pageBlocks: {
          on: {
            "blocks.journal-grid": {
              populate: "*",
            },
          },
        },
      },
    },
    { encodeValuesOnly: true },
  );

  const blogQuery = qs.stringify(
    {
      locale: locale,
      populate: {
        featuredImage: true,
      },

      sort: ["createdAt:asc"],
    },
    { encodeValuesOnly: true },
  );

  //   fetch block data
  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const response = await fetch(`/api/home-page?${query}`);
        const data = await response.json();
        console.log(data?.data?.pageBlocks?.[0]);
        setBlockData(data?.data?.pageBlocks?.[0]);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchBlockData();
  }, [query]);

  //   fetch blog data

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(`/api/blog-posts?${blogQuery}`);
        const data = await response.json();
        console.log(data?.data);
        setBlogData(data?.data);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      }
    };
    fetchBlogData();
  }, [blogQuery]);

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
            <div className={styles.sectionTitleWrapper}>
              <span className={styles.subtitleText}>{blockData?.subtitle}</span>
              <h2 className={styles.sectionTitle}>{blockData?.title}</h2>
            </div>
          </Col>
          <Col lg={12}>
            <div className="slider-container" id="blog-slider">
              <Slider {...settings}>
                {blogData?.map((blogItem) => (
                  <div key={blogItem?.id}>
                    <Link
                      href={`/journal/${blogItem?.slug}`}
                      className="text-decoration-none"
                    >
                      {blogItem?.featuredImage && (
                        <Image
                          src={getStrapiMedia(blogItem?.featuredImage?.url)}
                          width={blogItem?.featuredImage?.width}
                          height={blogItem?.featuredImage?.height}
                          alt={blogItem?.featuredImage?.name}
                          className={styles.blogImage}
                        />
                      )}
                      <div className={styles.titleWrapper}>
                        <span className={styles.categoryText}>
                          {blogItem?.category}
                        </span>
                        <p className={styles.titleText}>{blogItem?.title}</p>
                      </div>
                      <div>
                        <span className={styles.linkText}>
                          {blogItem?.linkText}
                          <span className="ms-3">
                            <LiaArrowRightSolid color="#333333" size={24} />
                          </span>
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
            <div className={styles.allLinkWrapper}>
              <Link href="/journal" className={styles.allLink}>
                <span>
                  {currentLocale === "es"
                    ? "Todas las entradas del blog"
                    : currentLocale === "fr"
                      ? "tous les articles de blog"
                      : "all blog posts"}
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

export default BlogSlider;
