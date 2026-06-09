"use client";

import React, { useState, useEffect } from "react";
import styles from "./Footer.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Accordion from "react-bootstrap/Accordion";
import {
  RiTwitterXFill,
  RiInstagramLine,
  RiFacebookFill,
} from "react-icons/ri";

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const { locale } = useLocale();

  const query = qs.stringify(
    {
      locale: locale,
      populate: {
        footer: {
          populate: {
            logoImage: true,
            footerColumns: {
              populate: {
                links: true,
              },
            },
            socialLinks: true,
            legalLinks: true,
          },
        },
      },
    },
    { encodeValuesOnly: true },
  );

  useEffect(() => {
    const fetchFooter = async () => {
      const response = await fetch(`/api/global?${query}`);
      const data = await response.json();
      console.log(data?.data?.footer);
      setFooterData(data?.data?.footer);
    };
    fetchFooter();
  }, [locale, query]);

  // 1. Dynamic Social Icon Glyph Map
  const SOCIAL_ICONS = {
    x: <RiTwitterXFill size={20} />,
    instagram: <RiInstagramLine size={22} />,
    facebook: <RiFacebookFill size={22} />,
  };

  if (!footerData) return null;

  const { copyrightText, logoImage, socialLinks, legalLinks, footerColumns } =
    footerData;

  // Build the complete Strapi domain asset prefix safely
  const logoSrc = logoImage?.url ? getStrapiMedia(logoImage?.url) : null;

  return (
    <section className={styles.container}>
      <footer className="w-100 text-white">
        <Container fluid>
          {/* =========================================================================
            DESKTOP VIEW: Displays standard columns (Hidden on small screens)
            ========================================================================= */}
          <Row className="d-none d-md-flex">
            {/* Brand & Socials */}
            <Col md={3} lg={3} className="text-start d-flex flex-column gap-4">
              <div
                className="position-relative"
                style={{ height: "20px", width: "86px" }}
              >
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt="CEIN Brand Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <span className="text-xl font-bold tracking-widest text-white">
                    CEIN.
                  </span>
                )}
              </div>
              <div className="d-flex flex-column gap-2 mt-2">
                <span
                  className="text-uppercase tracking-widest text-secondary font-weight-medium"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    color: "#a3a3a3",
                  }}
                >
                  Follow Us
                </span>
                <div
                  className="d-flex align-items-center gap-4 mt-1"
                  style={{ color: "#d4d4d4" }}
                >
                  {socialLinks?.map((social) => (
                    <Link
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      className="text-reset text-decoration-none opacity-75 opacity-100-hover transition-colors"
                    >
                      {SOCIAL_ICONS[social.label.toLowerCase()] || (
                        <span>{social.label}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </Col>

            {/* Nav Menus */}
            {footerColumns?.map((column) => (
              <Col key={column.id} md={2} lg={2} className="text-start">
                <h3
                  className="text-white mb-4"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  {column.title}
                </h3>
                <ul className="list-unstyled d-flex flex-column gap-3 p-0 m-0">
                  {column.links?.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.url}
                        className="text-decoration-none font-weight-light"
                        style={{ fontSize: "12px", color: "#d4d4d4" }}
                      >
                        <span className="opacity-75 opacity-100-hover transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Col>
            ))}
          </Row>

          {/* =========================================================================
            MOBILE VIEW: Displays clean minimal list accordions (Hidden on desktop)
            ========================================================================= */}
          <div className="d-block d-md-none custom-footer-accordion">
            <Accordion flush>
              {footerColumns?.map((column, index) => (
                <Accordion.Item
                  eventKey={String(index)}
                  key={column.id}
                  className="bg-transparent border-bottom border-neutral-700 py-2"
                >
                  <Accordion.Header className="w-100 text-white bg-transparent p-0 border-0">
                    <div
                      className="d-flex justify-content-between align-items-center w-100 py-2 text-white font-serif tracking-wide"
                      style={{ fontSize: "18px" }}
                    >
                      <span>{column.title}</span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="bg-transparent text-start px-0 pt-2 pb-4">
                    <ul className="list-unstyled d-flex flex-column gap-3 m-0 p-0">
                      {column.links?.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.url}
                            className="text-decoration-none"
                            style={{ fontSize: "14px", color: "#d4d4d4" }}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

            {/* Social Icons Section Block under Accordion */}
            <div className="text-start pt-5 pb-4">
              <span
                className="text-uppercase tracking-widest d-block mb-3"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  color: "#a3a3a3",
                }}
              >
                Follow Us
              </span>
              <div className="d-flex align-items-center gap-4 text-neutral-300">
                {socialLinks?.map((social) => (
                  <Link
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    className="text-white text-decoration-none"
                  >
                    {SOCIAL_ICONS[social.label.toLowerCase()] || (
                      <span>{social.label}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
            SHARED BOTTOM BAR: Legal links & Copyright Notice
            ========================================================================= */}
          <Row
            className={`${styles.bottomWrapper} align-items-center flex-md-row flex-col-reverse`}
          >
            {/* Left Copyright Section */}
            <Col
              xs={12}
              md={6}
              className="text-start mt-4 mt-md-0 order-lg-1 order-md-1 order-2"
            >
              <p
                className="m-0 font-weight-light"
                style={{
                  fontSize: "11px",
                  color: "#a3a3a3",
                  letterSpacing: "0.05em",
                }}
              >
                {copyrightText || "CEIN. All rights reserved."}
              </p>
            </Col>

            {/* Right/Stack Legal Navigation links */}
            <Col
              xs={12}
              md={6}
              className="text-start text-md-end order-1 order-lg-2 order-md-2"
            >
              <div className="d-flex flex-column flex-md-row flex-wrap gap-y-3 justify-content-start justify-content-md-end p-0 m-0">
                {legalLinks?.map((legal) => (
                  <Link
                    key={legal.id}
                    href={legal.url}
                    className="text-decoration-none font-weight-light text-start"
                    style={{
                      fontSize: "12px",
                      color: "#a3a3a3",
                      marginRight: "1.5rem",
                    }}
                  >
                    <span className="opacity-75 opacity-100-hover transition-colors d-block py-1 py-md-0">
                      {legal.label}
                    </span>
                  </Link>
                ))}
              </div>
            </Col>
          </Row>
        </Container>

        {/* =========================================================================
          CUSTOM ESSENTIAL ACCORDION CSS GLOBAL OVERRIDES
          ========================================================================= */}
        <style jsx global>{`
          .opacity-100-hover:hover {
            opacity: 1 !important;
            color: #ffffff !important;
          }

          /* Strips default Bootstrap styles to give you the custom minimal inline lines style */
          .custom-footer-accordion .accordion-button {
            background-color: transparent !important;
            box-shadow: none !important;
            padding: 0.75rem 0 !important;
            color: #ffffff !important;
          }

          /* Replaces default accordion arrow vector glyph with your custom subtle plus sign icon */
          .custom-footer-accordion .accordion-button::after {
            background-image: none !important;
            content: "+" !important;
            color: #ffffff !important;
            font-size: 22px !important;
            font-weight: 200 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: none !important;
            transition: transform 0.2s ease-in-out;
          }

          /* Smoothly rotates the minimal plus marker when a section collapses open */
          .custom-footer-accordion .accordion-button:not(.collapsed)::after {
            transform: rotate(45deg) !important;
          }

          /* Dark clean borders matching screen snippet */
          .custom-footer-accordion .accordion-item {
            border-color: #444444 !important;
          }
        `}</style>
      </footer>
    </section>
  );
};

export default Footer;
