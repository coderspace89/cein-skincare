"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import { useLocale } from "@/context/LocaleContext";
import { getStrapiMedia } from "@/lib/utils";
import qs from "qs";
import ReactMarkdown from "react-markdown";

const PromoModal = () => {
  const [modalData, setModalData] = useState(null);
  const { locale } = useLocale();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");

  const query = qs.stringify({
    locale: locale,
    populate: {
      promoModal: {
        populate: {
          image: true,
        },
      },
    },
  });

  //   fetch modal data
  useEffect(() => {
    const fetchModal = async () => {
      const response = await fetch(`/api/global?${query}`);
      const data = await response.json();
      console.log(data?.data?.promoModal);
      setModalData(data?.data?.promoModal);
    };
    fetchModal();
  }, [locale, query]);

  useEffect(() => {
    // Only display if the modal flag is turned on in Strapi database
    if (modalData?.isActive) {
      // Optional check: Ensure the user hasn't already closed it during this session
      const isDismissed = sessionStorage.getItem("cein_promo_dismissed");
      if (!isDismissed) {
        const timer = setTimeout(() => setShow(true), 2500); // Triggers briefly after page entry
        return () => clearTimeout(timer);
      }
    }
  }, [modalData, locale]);

  if (!modalData || !modalData.isActive) return null;

  const {
    title,
    description,
    inputPlaceholder,
    buttonLabel,
    disclaimerText,
    image,
    backgroundColor,
  } = modalData;

  const imageSrc = image?.url ? getStrapiMedia(image?.url) : null;

  const handleClose = () => {
    sessionStorage.setItem("cein_promo_dismissed", "true");
    setShow(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting newsletter subscription for email: ", email);
    // Integrate your database API endpoint subscription route here
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-promo-modal"
      backdropClassName="custom-modal-backdrop"
      className="custom-promo-modal-wrapper"
    >
      {/* Absolute positioned minimal dark close cross icon layer to match image_e1535f.jpg layout */}
      <button
        onClick={handleClose}
        className="position-absolute end-0 top-0 m-3 border-0 bg-transparent text-white z-3"
        style={{
          fontSize: "24px",
          fontWeight: "200",
          cursor: "pointer",
          filter: "drop-shadow(0px 1px 3px rgba(0,0,0,0.3))",
        }}
        aria-label="Close promotion view modal"
      >
        ✕
      </button>

      <Modal.Body className="p-0 overflow-hidden">
        <Row className="g-0 flex-column-reverse flex-md-row">
          {/* LEFT SIDE: Text, Input field & Opt-In actions layout column */}
          <Col
            xs={12}
            md={6}
            className="d-flex flex-column justify-content-center px-lg-4 py-lg-5 px-3 py-3 text-start"
            style={{
              backgroundColor: backgroundColor || "#f4f4f0",
              color: "#333333",
            }}
          >
            <h2
              className="mb-3 tracking-wide text-capitalize"
              style={{
                fontSize: "clamp(24px, 3vw, 30px)",
                fontWeight: "400",
                color: "#333333",
              }}
            >
              {title}
            </h2>

            <p
              className="text-capitalize mb-4 tracking-normal"
              style={{ fontSize: "13px", lineHeight: "1.6", color: "#333333" }}
            >
              {description}
            </p>

            <Form onSubmit={handleSubmit} className="w-100 mb-3">
              <Form.Group className="mb-3" controlId="promoNewsletterEmail">
                <Form.Control
                  type="email"
                  placeholder={inputPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-0 border-dark text-secondary text-capitalize"
                  style={{
                    fontSize: "14px",
                    backgroundColor: "#ffffff",
                    paddingTop: "16px",
                    paddingBottom: "16px",
                  }}
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 rounded-0 border-0 text-capitalize tracking-wider font-sans font-weight-medium"
                style={{
                  backgroundColor: "#333333",
                  color: "#ffffff",
                  fontSize: "15px",
                  padding: "19px 23px",
                }}
              >
                {buttonLabel}
              </Button>
            </Form>

            {/* Compliance Legal Footnote */}
            <div
              style={{ fontSize: "12px", color: "#333333" }}
              className="markdown-container"
            >
              <ReactMarkdown>{disclaimerText}</ReactMarkdown>
            </div>
          </Col>

          {/* RIGHT SIDE: Campaign Editorial Image Frame column */}
          <Col
            xs={12}
            md={6}
            className="position-relative min-vh-25 min-vh-md-50"
            style={{
              minHeight: "clamp(250px, 50vw, 500px)",
            }}
          >
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={image?.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 600px) 25vw, 10vw"
                priority
                style={{ objectFit: "cover", aspectRatio: "4/3" }}
              />
            ) : (
              <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center">
                <span className="text-white-50">CEIN Campaign Photo</span>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>

      {/* Embedded overrides layout formatting injection rules */}
      <style jsx global>{`
        /* Max modal viewport footprint parameters setup targeting large desktop devices */
        .custom-promo-modal {
          max-width: 900px !important;
          width: 90% !important;
        }
        /* Forces the modal window to the very top layer */
        .custom-promo-modal-wrapper {
          z-index: 9999 !important;
        }

        /* Strips native structural defaults off bootstrap layout components cards */
        .custom-promo-modal .modal-content {
          border-radius: 0px !important;
          border: none !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4) !important;
        }

        /* Deep overlay dimming matching image_e1535f.jpg */
        .custom-modal-backdrop {
          background-color: rgba(0, 0, 0, 0.65) !important;
          z-index: 9998 !important;
        }

        /* Input highlight overrides */
        .custom-promo-modal .form-control:focus {
          border-color: #333333 !important;
          box-shadow: none !important;
        }
        .markdown-container a {
          color: #333333 !important;
          text-transform: capitalize;
        }
      `}</style>
    </Modal>
  );
};

export default PromoModal;
