"use client";

import React, { useState, useEffect } from "react";
import styles from "./BannerBlock.module.css";
import qs from "qs";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import { LiaArrowRightSolid } from "react-icons/lia";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

const BannerBlock = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        pageBlocks: {
          on: {
            "blocks.text-over-image": {
              populate: {
                backgroundImage: true,
              },
            },
          },
        },
      },
    },
    { encodeValuesOnly: true },
  );

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

  const bgUrl = getStrapiMedia(blockData?.backgroundImage?.url);

  return (
    <section
      className={styles.sectionBg}
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <Container>
        <Row className={styles.row}>
          <Col lg={6}>
            <div>
              <p className={styles.subtitle}>{blockData?.subtitle}</p>
              <h2 className={styles.title}>{blockData?.title}</h2>
              <div className={styles.description}>
                <ReactMarkdown>{blockData?.description}</ReactMarkdown>
              </div>
              <Link href={blockData?.ctaLink || ""} className={styles.ctaBtn}>
                <span>
                  {blockData?.ctaLabel}
                  <span className="ms-3">
                    <LiaArrowRightSolid color="#fff" size={24} />
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

export default BannerBlock;
