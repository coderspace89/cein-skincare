"use client";

import React, { useState, useEffect } from "react";
import styles from "./UserVoiceGallery.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import { LiaArrowRightSolid } from "react-icons/lia";
import Image from "next/image";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const UserVoiceGallery = () => {
  const [blockData, setBlockData] = useState(null);
  const { locale } = useLocale();
  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        pageBlocks: {
          on: {
            "blocks.user-voice-gallery": {
              populate: {
                items: {
                  populate: {
                    image: true,
                  },
                },
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
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center">
              <h2 className={styles.title}>{blockData?.title}</h2>
            </div>
            <div className={styles.userGrid}>
              {blockData?.items?.map((item) => (
                <div key={item?.id}>
                  <Link href={item.linkUrl}>
                    {item?.image && (
                      <Image
                        src={getStrapiMedia(item?.image?.url)}
                        width={item?.image?.width}
                        height={item?.image?.height}
                        alt={item?.image?.name}
                        className={styles.galleryImage}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-center">
              <Link
                href={blockData?.buttonUrl || ""}
                className={styles.galleryBtn}
              >
                <span className="d-flex align-items-center justify-content-between">
                  {blockData?.buttonLabel}
                  <span>
                    <LiaArrowRightSolid color="#333333" size={24} />
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

export default UserVoiceGallery;
