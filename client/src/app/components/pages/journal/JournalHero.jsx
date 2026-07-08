"use client";

import React, { useState, useEffect } from "react";
import styles from "./JournalHero.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";

const JournalHero = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        image: true,
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
        console.log(data?.data);
        setBlockData(data?.data);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchBlockData();
  }, [query]);

  const bgUrl = blockData?.image ? getStrapiMedia(blockData?.image?.url) : "";

  return (
    <div>
      <section
        className={`d-lg-block d-none ${styles.container}`}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),url(${bgUrl})`,
        }}
      >
        <Container fluid className="p-0">
          <Row className="justify-content-end align-items-center">
            <Col lg={4}>
              <div className="text-white">
                <h3>{blockData?.title}</h3>
                <p>{blockData?.description}</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* mobile screens */}
      <section className={`d-lg-none d-block ${styles.mobileContainer}`}>
        <Container fluid className="p-0">
          <Row>
            <Col lg={12}>
              <div>
                {blockData?.image && (
                  <Image
                    src={getStrapiMedia(blockData?.image?.url)}
                    width={blockData?.image?.width}
                    height={blockData?.image?.height}
                    alt={blockData?.image?.name}
                    className={styles.mobileImage}
                  />
                )}
              </div>
            </Col>
            <Col lg={12}>
              <div className={styles.mobileTextContainer}>
                <h3>{blockData?.title}</h3>
                <p>{blockData?.description}</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default JournalHero;
