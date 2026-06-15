"use client";

import React, { useState, useEffect } from "react";
import styles from "./StatemenBlock.module.css";
import qs from "qs";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLocale } from "@/context/LocaleContext";

const StatementBlock = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        pageBlocks: {
          on: {
            "blocks.text-statement": {
              populate: "*",
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
        <Row className="justify-content-center">
          <Col lg={6}>
            <div className="text-center">
              <h2 className={styles.title}>{blockData?.title}</h2>
              <span className={styles.subtitle}>{blockData?.subtitle}</span>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default StatementBlock;
