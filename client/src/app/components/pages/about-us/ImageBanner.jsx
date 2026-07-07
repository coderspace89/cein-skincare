"use client";

import React, { useState, useEffect } from "react";
import styles from "./ImageBanner.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";

const ImageBanner = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        ContentBlocks: {
          on: {
            "blocks.full-width-image": {
              populate: ["image"],
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
        const response = await fetch(`/api/about-page?${query}`);
        const data = await response.json();
        console.log(data?.data?.ContentBlocks?.[0]);
        setBlockData(data?.data?.ContentBlocks?.[0]);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchBlockData();
  }, [query]);

  return (
    <section className={styles.container}>
      <Container className="p-0">
        <Row>
          <Col lg={12}>
            <div>
              {blockData?.image && (
                <Image
                  src={getStrapiMedia(blockData?.image?.url)}
                  width={blockData?.image?.width}
                  height={blockData?.image?.height}
                  alt={blockData?.image?.name}
                  className={styles.image}
                />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ImageBanner;
