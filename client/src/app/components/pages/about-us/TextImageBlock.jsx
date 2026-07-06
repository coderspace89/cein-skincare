"use client";

import React, { useState, useEffect } from "react";
import styles from "./TextImageBlock.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { LiaArrowRightSolid } from "react-icons/lia";
import Link from "next/link";

const TextImageBlock = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        ContentBlocks: {
          on: {
            "blocks.image-with-text": {
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
        console.log(data?.data?.ContentBlocks);
        setBlockData(data?.data?.ContentBlocks);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchBlockData();
  }, [query]);

  return (
    <section className={styles.container}>
      <Container>
        {blockData?.map((block, idx) => (
          <Row key={block?.id}>
            <Col
              lg={idx === 0 ? 5 : 7}
              className={`mb-5 ${idx === 0 ? `order-lg-1` : `order-lg-2`}`}
            >
              <div>
                {block?.image && (
                  <Image
                    src={getStrapiMedia(block?.image?.url)}
                    width={block?.image?.width}
                    height={block?.image?.height}
                    alt={block?.image?.name}
                    className={styles.blockImage}
                  />
                )}
              </div>
            </Col>
            <Col
              lg={idx === 1 ? 5 : 7}
              className={idx === 0 ? `order-lg-2` : `order-lg-1`}
            >
              <div className={styles.markdownContainer}>
                <h3 className={styles.text}>{block?.title}</h3>
                <div>
                  {idx === 1 ? (
                    <h3 className={styles.text}>{block?.description}</h3>
                  ) : (
                    <ReactMarkdown>{block?.description}</ReactMarkdown>
                  )}
                </div>
              </div>
              <div className="my-5">
                <Link href={block?.ctaUrl} className={styles.ctaBtn}>
                  <span>{block?.ctaLabel}</span>
                  <span className="ps-3">
                    <LiaArrowRightSolid size={24} color="#333" />
                  </span>
                </Link>
              </div>
            </Col>
          </Row>
        ))}
      </Container>
    </section>
  );
};

export default TextImageBlock;
