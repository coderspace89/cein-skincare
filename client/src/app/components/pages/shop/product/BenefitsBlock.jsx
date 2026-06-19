"use client";

import React, { useState, useEffect } from "react";
import styles from "./BenefitsBlock.module.css";
import qs from "qs";
import { getStrapiMedia } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

const BenefitsBlock = ({ slug }) => {
  const { locale } = useLocale();
  const [blockData, setBlockData] = useState(null);
  const [openSection, setOpenSection] = useState("benefitsText");

  const query = qs.stringify(
    {
      filters: {
        shopifyHandle: { $eq: slug },
      },
      locale: locale,
      populate: {
        benefitsSection: {
          populate: {
            image: true,
          },
        },
      },
    },
    { encodeValuesOnly: true },
  );

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const response = await fetch(`/api/product-details-pages?${query}`);
        const data = await response.json();
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

  const { benefitsSection } = blockData;
  const sectionKeys = ["benefitsText", "howToUse", "ingredients"];

  const getDynamicLabel = (key, fallbackLabel) => {
    const blockData = benefitsSection[key];
    if (!blockData || !Array.isArray(blockData)) return fallbackLabel;

    const headingNode = blockData.find((node) => node.type === "heading");
    return headingNode?.children?.[0]?.text || fallbackLabel;
  };

  const renderAccordionContent = (contentArray) => {
    if (!contentArray) return null;
    const listItems = contentArray.filter((node) => node.type === "list");

    return (
      <ul
        className={`${styles.bulletsList} list-unstyled d-flex flex-column m-0`}
      >
        {listItems.map((listNode, index) => {
          const textStr = listNode.children?.[0]?.children?.[0]?.text || "";
          return (
            <li key={index} className="d-flex align-items-start">
              <p className={`${styles.bulletText} m-0`}>{textStr}</p>
            </li>
          );
        })}
      </ul>
    );
  };

  const bgUrl = benefitsSection?.image?.url
    ? getStrapiMedia(benefitsSection.image.url)
    : "";

  return (
    <section
      className={styles.sectionWrapper}
      style={{ "--accordion-bg-image": `url(${bgUrl})` }}
    >
      <div className={styles.splitLayoutContainer}>
        {/* Left Side: Dynamic Text Content Elements */}
        <div className={styles.textContentSide}>
          <div className={`${styles.accordionGroup} d-flex flex-column`}>
            {sectionKeys.map((key) => {
              const isOpen = openSection === key;
              const fallbackLabel =
                key === "benefitsText"
                  ? "Benefits"
                  : key === "howToUse"
                    ? "How to use"
                    : "Ingredients";
              const dynamicLabel = getDynamicLabel(key, fallbackLabel);

              return (
                <div key={key} className={styles.accordionItem}>
                  <button
                    className={`${styles.accordionHeader} d-flex align-items-center justify-content-between w-100 btn p-0 border-0`}
                    onClick={() => setOpenSection(isOpen ? null : key)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.headerTitle}>{dynamicLabel}</span>
                    <span
                      className={`${styles.iconIndicator} ${isOpen ? styles.iconOpen : ""}`}
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`${styles.contentCollapse} ${isOpen ? styles.contentShow : ""}`}
                    style={{ maxHeight: isOpen ? "400px" : "0px" }}
                  >
                    <div className={styles.accordionBodyInner}>
                      {renderAccordionContent(benefitsSection[key])}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Background Decorative Element Panel */}
        <div
          className={styles.imageBackgroundSide}
          role="img"
          aria-label="Product details banner"
        />
      </div>
    </section>
  );
};

export default BenefitsBlock;
