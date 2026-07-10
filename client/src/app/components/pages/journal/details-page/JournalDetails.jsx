"use client";

import React, { useState, useEffect } from "react";
import styles from "./JournalDetails.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { usePathname } from "next/navigation";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const JournalDetails = ({ slug }) => {
  const [detailsContent, setDetailsContent] = useState(null);
  // const [recentPosts, setRecentPosts] = useState(null);
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

  // useEffect(() => {
  //   const fetchRecentPosts = async () => {
  //     try {
  //       const response = await fetch(`/api/blog-posts?${getRecentPostsQuery}`);
  //       const data = await response.json();
  //       console.log(data?.data);
  //       setRecentPosts(data?.data);
  //     } catch (error) {
  //       console.error("Error fetching blog data:", error);
  //     }
  //   };
  //   fetchRecentPosts();
  // }, [getRecentPostsQuery]);

  // Pre-process the content text string before passing it into the renderer
  const prepareMarkdownContent = (contentString) => {
    if (!contentString) return "";

    // Look for your two adjacent markdown images at the bottom of the page
    // and wrap them tightly inside a custom HTML marker block.
    const regex =
      /(!\[.*?img2.*?\]\(.*?\))\s*[\r\n]+\s*(!\[.*?img3.*?\]\(.*?\))/g;

    return contentString.replace(
      regex,
      '<div class="asymmetric-layout-grid">\n\n$1\n\n$2\n</div>',
    );
  };

  return (
    <section className={styles.container}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={12} xl={11}>
            <div className={styles.markdownContainer}>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, children }) => {
                    const validChildren = React.Children.toArray(
                      children,
                    ).filter(
                      (child) =>
                        typeof child !== "string" || child.trim() !== "",
                    );

                    // Check if this paragraph contains only a standalone image element
                    if (
                      validChildren.length === 1 &&
                      React.isValidElement(validChildren[0]) &&
                      validChildren[0].type === "img"
                    ) {
                      const imgProps = validChildren[0].props;
                      const isImg2Or3 =
                        imgProps.src?.includes("img2") ||
                        imgProps.src?.includes("img3") ||
                        imgProps.alt?.includes("img2") ||
                        imgProps.alt?.includes("img3");

                      // Separate your standard standalone images from your bottom grid images
                      if (!isImg2Or3) {
                        return (
                          <div className={styles.fullWidthImageWrapper}>
                            {validChildren[0]}
                          </div>
                        );
                      }
                    }
                    return <p>{children}</p>;
                  },
                  div: ({ node, className, children }) => {
                    if (className === "asymmetric-layout-grid") {
                      return (
                        <div className={styles.asymmetricLayoutGrid}>
                          {children}
                        </div>
                      );
                    }
                    return <div>{children}</div>;
                  },
                  img: ({ node, src, alt }) => {
                    const isImg3 =
                      src?.includes("img3") || alt?.includes("img3");
                    return (
                      <img
                        src={src}
                        alt={alt}
                        className={
                          isImg3
                            ? styles.smallColumnImage
                            : styles.largeColumnImage
                        }
                      />
                    );
                  },
                }}
              >
                {prepareMarkdownContent(detailsContent?.content)}
              </ReactMarkdown>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default JournalDetails;
