"use client";

import React, { useState, useEffect } from "react";
import styles from "./CardsBlock.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { LiaArrowRightSolid } from "react-icons/lia";
import Link from "next/link";

const CardsBlock = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        ContentBlocks: {
          on: {
            "blocks.cards": {
              populate: {
                cardBlocks: {
                  populate: ["backgroundImage"],
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
        const response = await fetch(`/api/about-page?${query}`);
        const data = await response.json();
        console.log(data?.data?.ContentBlocks?.[0]?.cardBlocks);
        setBlockData(data?.data?.ContentBlocks?.[0]?.cardBlocks);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchBlockData();
  }, [query]);

  const bgUrl1 = blockData
    ?.filter((_, idx) => idx === 0)
    .map((block) => {
      return getStrapiMedia(block?.backgroundImage?.url);
    });

  const bgUrl2 = blockData
    ?.filter((_, idx) => idx === 1)
    .map((block) => {
      return getStrapiMedia(block?.backgroundImage?.url);
    });

  return (
    <section>
      <Container fluid className="p-0">
        <Row>
          <Col
            lg={6}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2)),url(${bgUrl1})`,
            }}
            className={styles.bgImage}
          >
            {blockData
              ?.filter((_, idx) => idx === 0)
              .map((data) => (
                <div key={data?.id} className="text-white">
                  <div className="mb-5">
                    <p>{data?.subtitle}</p>
                    <h3>{data?.title}</h3>
                    <p>{data?.description}</p>
                  </div>
                  <div>
                    <Link href={data?.ctaUrl} className={styles.ctaLink}>
                      <span>{data?.ctaLink}</span>
                      <span className="ps-3">
                        <LiaArrowRightSolid color="#fff" size={24} />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
          </Col>
          <Col
            lg={6}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2)),url(${bgUrl2})`,
            }}
            className={styles.bgImage}
          >
            {blockData
              ?.filter((_, idx) => idx === 1)
              .map((data) => (
                <div key={data?.id} className="text-white">
                  <div className="mb-5">
                    <p>{data?.subtitle}</p>
                    <h3>{data?.title}</h3>
                    <p>{data?.description}</p>
                  </div>
                  <div>
                    <Link href={data?.ctaUrl} className={styles.ctaLink}>
                      <span>{data?.ctaLink}</span>
                      <span className="ps-3">
                        <LiaArrowRightSolid color="#fff" size={24} />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CardsBlock;
