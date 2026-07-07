"use client";

import React, { useState, useEffect } from "react";
import styles from "./TextBanner.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const TextBanner = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        ContentBlocks: {
          on: {
            "blocks.text-statement": true,
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
      <Container>
        <Row className="justify-content-center">
          <Col lg={6}>
            <div className="text-center">
              <h3 className={styles.title}>{blockData?.title}</h3>
              <span className={styles.subtitle}>{blockData?.subtitle}</span>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default TextBanner;
