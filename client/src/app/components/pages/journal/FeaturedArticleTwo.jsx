"use client";

import React, { useState, useEffect } from "react";
import styles from "./FeaturedArticleTwo.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { LiaArrowRightSolid } from "react-icons/lia";

const FeaturedArticleTwo = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        pageBlocks: {
          on: {
            "blocks.articles": {
              populate: {
                featured: {
                  populate: ["image"],
                },
              },
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const response = await fetch(`/api/journal-page?${query}`);
        const data = await response.json();
        console.log(data?.data?.pageBlocks?.[0]?.featured);
        setBlockData(data?.data?.pageBlocks?.[0]?.featured);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchBlockData();
  }, [query]);

  return (
    <section className={styles.container}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-lg-0 mb-4">
            {blockData
              ?.filter((_, idx) => idx === 1)
              .map((data) => (
                <div key={data?.id}>
                  {data?.image && (
                    <Image
                      src={getStrapiMedia(data?.image?.url)}
                      width={data?.image?.width}
                      height={data?.image?.height}
                      alt={data?.image?.name}
                      className={styles.image}
                    />
                  )}
                </div>
              ))}
          </Col>
          <Col lg={6}>
            <div>
              {blockData
                ?.filter((_, idx) => idx === 1)
                .map((data) => (
                  <div key={data?.id}>
                    <div>
                      <span className={styles.categoryText}>
                        {data?.categoryTag}
                      </span>
                      <p className={styles.titleText}>{data?.title}</p>
                      <div className={styles.markdownContainer}>
                        <ReactMarkdown>{data?.content}</ReactMarkdown>
                      </div>
                      <div className="mt-4">
                        <Link href={data?.ctaUrl} className={styles.linkText}>
                          <span>{data?.ctaLink}</span>
                          <span className="ps-3">
                            <LiaArrowRightSolid color="#333" size={24} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default FeaturedArticleTwo;
