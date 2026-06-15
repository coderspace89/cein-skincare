"use client";

import React, { useState, useEffect } from "react";
import styles from "./TextImageBlock.module.css";
import qs from "qs";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import { LiaArrowRightSolid } from "react-icons/lia";
import Image from "next/image";
import Link from "next/link";

const TextImageBlock = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        pageBlocks: {
          on: {
            "blocks.image-with-text": {
              populate: {
                image: true,
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

  return (
    <section className={styles.container}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-lg-0 mb-4">
            <div>
              {blockData?.image && (
                <Image
                  src={getStrapiMedia(blockData?.image?.url)}
                  width={blockData?.image?.width}
                  height={blockData?.image?.height}
                  alt={blockData?.image?.name}
                  className={styles.blockImage}
                />
              )}
            </div>
          </Col>
          <Col lg={6}>
            <div>
              <p className={styles.subtitle}>{blockData?.subtitle}</p>
              <h2 className={styles.title}>{blockData?.title}</h2>
              <p className={styles.description}>{blockData?.description}</p>
              <div className={styles.ctaBtnWrapper}>
                <Link href={blockData?.ctaUrl || ""} className={styles.ctaBtn}>
                  <span>
                    {blockData?.ctaLabel}
                    <span className="ms-3">
                      <LiaArrowRightSolid color="#333333" size={24} />
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default TextImageBlock;
