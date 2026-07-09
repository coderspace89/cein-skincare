"use client";

import React, { useState, useEffect } from "react";
import styles from "./JournalDetails.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { usePathname } from "next/navigation";
import { getStrapiMedia } from "@/lib/utils";
import { LiaArrowRightSolid } from "react-icons/lia";
import Image from "next/image";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactMarkdown from "react-markdown";

const JournalDetails = ({ slug }) => {
  const [detailsContent, setDetailsContent] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const { locale } = useLocale();
  const currentSlug = usePathname();

  // 1. Query to look up the specific post matching the URL slug parameters
  const getArticleQuery = qs.stringify(
    {
      locale: locale,
      filters: {
        slug: { $eq: slug },
      },
      populate: ["featuredImage"],
    },
    { encodeValuesOnly: true },
  );

  // 2. Query to pull the remaining items for the 4-column footer preview matrix
  const getRecentPostsQuery = qs.stringify(
    {
      locale: locale,
      filters: {
        slug: { $ne: currentSlug },
      },
      fields: ["title", "category", "slug"],
      populate: ["featuredImage"],
      pagination: { limit: 4 },
      sort: ["createdAt:desc"],
    },
    { encodeValuesOnly: true },
  );

  //   fetch current journal details content
  useEffect(() => {
    const fetchDetailsContent = async () => {
      try {
        const response = await fetch(`/api/blog-posts?${getArticleQuery}`);
        const data = await response.json();
        console.log(data?.data?.[0]);
        setDetailsContent(data?.data?.[0]);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      }
    };
    fetchDetailsContent();
  }, [getArticleQuery]);

  //   fetch recent posts

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch(`/api/blog-posts?${getRecentPostsQuery}`);
        const data = await response.json();
        console.log(data?.data);
        setRecentPosts(data?.data);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      }
    };
    fetchRecentPosts();
  }, [getRecentPostsQuery]);

  return (
    <section className={styles.container}>
      <Container>
        <Row className="justify-content-center">
          <Col>
            <div className={styles.markdownContainer}>
              <ReactMarkdown
                components={{
                  p: ({ node, children }) => {
                    // Extract valid non-empty elements
                    const validChildren = React.Children.toArray(
                      children,
                    ).filter(
                      (child) =>
                        typeof child !== "string" || child.trim() !== "",
                    );

                    // Check if this paragraph contains exactly one image element
                    if (
                      validChildren.length === 1 &&
                      React.isValidElement(validChildren[0]) &&
                      validChildren[0].type === "img"
                    ) {
                      const imgProps = validChildren[0].props;

                      // Match the image names from your Strapi markdown editor content
                      const isImg2 =
                        imgProps.alt?.includes("img2") ||
                        imgProps.src?.includes("img2");
                      const isImg3 =
                        imgProps.alt?.includes("img3") ||
                        imgProps.src?.includes("img3");

                      if (isImg2) {
                        return (
                          <img
                            src={imgProps.src}
                            alt={imgProps.alt}
                            className={styles.largeColumnImage}
                          />
                        );
                      }
                      if (isImg3) {
                        return (
                          <img
                            src={imgProps.src}
                            alt={imgProps.alt}
                            className={styles.smallColumnImage}
                          />
                        );
                      }
                    }

                    // Standard text paragraph
                    return <p className={styles.proseParagraph}>{children}</p>;
                  },
                }}
              >
                {detailsContent?.content}
              </ReactMarkdown>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default JournalDetails;
