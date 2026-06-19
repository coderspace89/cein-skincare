"use client";

import React, { useState, useEffect } from "react";
import styles from "./RoutineBlock.module.css";
import qs from "qs";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const RoutineBlock = ({ slug }) => {
  const { locale } = useLocale();
  const [blockData, setBlockData] = useState(null);

  const query = qs.stringify(
    {
      filters: {
        shopifyHandle: { $eq: slug },
      },
      locale: locale,
      populate: {
        routineWidget: {
          populate: {
            icon: true,
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
        const response = await fetch(`/api/product-details-pages?${query}`);
        const data = await response.json();
        console.log(data?.data?.[0]);
        setBlockData(data?.data?.[0]);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchBlockData();
  }, [query]);

  if (!blockData) {
    return (
      <div className="w-100 text-center py-5 text-gray">
        Loading product details...
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={7}>
            <div className="text-center mb-5">
              <span className={styles.subtitle}>{blockData?.subtitle}</span>
              <h2 className={styles.sectionTitle}>{blockData?.sectionTitle}</h2>
            </div>
            <div
              className={`${styles.stepsBox} d-flex align-items-center justify-content-center gap-lg-5 gap-3`}
            >
              {blockData?.routineWidget?.map((stepItem) => (
                <div
                  key={stepItem.id}
                  className="text-center bg-white py-2 rounded-3 w-100 position-relative"
                >
                  <div
                    className={`${styles.stepsNumberWrapper} position-absolute top-0 start-50 translate-middle`}
                  >
                    <p className="pt-3">{stepItem.stepNumber}</p>
                  </div>
                  {stepItem?.icon && (
                    <Image
                      src={getStrapiMedia(stepItem?.icon?.url)}
                      width={stepItem?.icon?.width}
                      height={stepItem?.icon?.height}
                      alt={stepItem?.icon?.name}
                      className={styles.stepsImage}
                    />
                  )}
                  <p className={styles.labelText}>{stepItem.label}</p>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default RoutineBlock;
