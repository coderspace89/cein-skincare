"use client";

import React, { useState, useEffect } from "react";
import styles from "./ReviewsBlock.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { IoStar, IoStarOutline } from "react-icons/io5";
import { useFormatDate } from "@/hooks/useFormatDate";

const ReviewsBlock = ({ slug }) => {
  const { locale } = useLocale();
  const currentLocale = locale.toLowerCase();
  const formatDate = useFormatDate();
  const [blockData, setBlockData] = useState(null);

  const query = qs.stringify(
    {
      filters: {
        shopifyHandle: { $eq: slug },
      },
      locale: locale,
      populate: {
        reviews: true,
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

  const reviews = blockData?.reviews || [];
  const totalReviewsCount = reviews.length;

  // Calculate dynamic average and specific distribution percentages
  const totalRatingSum = reviews.reduce(
    (acc, curr) => acc + (Number(curr.rating) || 0),
    0,
  );
  const rawAverage =
    totalReviewsCount > 0 ? totalRatingSum / totalReviewsCount : 0;
  const displayAverage = Number(rawAverage.toFixed(1)) || 5;

  const distributionCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((rev) => {
    const r = Math.round(Number(rev.rating));
    if (distributionCounts[r] !== undefined) {
      distributionCounts[r]++;
    }
  });

  const getPercentage = (count) => {
    if (totalReviewsCount === 0) return 0;
    return Math.round((count / totalReviewsCount) * 100);
  };

  return (
    <section className={styles.sectionWrapper}>
      <Container>
        <Row className="gy-5">
          {/* Left Column: Aggregated Breakdown Metrics Summary */}
          <Col lg={5} className="pe-lg-5">
            <span className={styles.columnTitleLabel}>
              {currentLocale === "es"
                ? "Reseñas"
                : currentLocale === "fr"
                  ? "Avis"
                  : "Reviews"}
            </span>

            <div className="d-flex align-items-center gap-3 mt-3 mb-2">
              <h2 className={`${styles.averageRatingScore} m-0`}>
                {displayAverage}/5
              </h2>
              <div className="d-flex gap-0.5 text-dark">
                {Array.from({ length: 5 }).map((_, index) =>
                  index < Math.round(displayAverage) ? (
                    <IoStar key={index} size={20} color="#333333" />
                  ) : (
                    <IoStarOutline key={index} size={20} color="#333333" />
                  ),
                )}
              </div>
            </div>

            <p className={`${styles.reviewCountText} text-muted mb-5`}>
              {currentLocale === "es"
                ? `Este producto ha sido reseñado por ${totalReviewsCount} clientes.`
                : currentLocale === "fr"
                  ? `Ce produit a été évalué par ${totalReviewsCount} clients.`
                  : `This product has been reviewed by ${totalReviewsCount} customers.`}
            </p>

            {/* Distribution Graph Breakdown rows */}
            <div
              className={`${styles.distributionMetricContainer} d-flex flex-column gap-2 mb-5`}
            >
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distributionCounts[stars];
                const percentage = getPercentage(count);

                return (
                  <div
                    key={stars}
                    className="d-flex align-items-center justify-content-between w-100"
                  >
                    {/* Star row label representation */}
                    <div className="d-flex gap-1 align-items-center me-3">
                      {Array.from({ length: 5 }).map((_, idx) =>
                        idx < stars ? (
                          <IoStar key={idx} size={14} color="#333333" />
                        ) : (
                          <IoStarOutline key={idx} size={14} color="#cccccc" />
                        ),
                      )}
                    </div>

                    {/* Progress tracking line row */}
                    <div
                      className={`${styles.percentageProgressTrack} flex-grow-1 mx-3`}
                    >
                      <div
                        className={styles.percentageProgressBarFilled}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* End layout percent figures */}
                    <span
                      className={`${styles.percentageStringValue} text-end`}
                    >
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Premium CTA Button */}
            <button
              className={`${styles.writeReviewButtonTrigger} btn d-flex align-items-center justify-content-between`}
            >
              <span className="me-3">
                {currentLocale === "es"
                  ? "Escribe una reseña"
                  : currentLocale === "fr"
                    ? "Rédiger un avis"
                    : "Write a review"}
              </span>
              <span className={styles.ctaArrowIcon}>→</span>
            </button>
          </Col>

          {/* Right Column: Content Review Thread Map */}
          <Col lg={7}>
            <div className="d-flex flex-column gap-5">
              {reviews.map((review) => {
                const rating = Number(review?.rating) || 0;
                return (
                  <div
                    key={review?.id}
                    className={`${styles.reviewRowItemCard} pb-4`}
                  >
                    <div
                      className="d-flex gap-1 mb-2"
                      style={{ color: "#333333" }}
                    >
                      {Array.from({ length: 5 }).map((_, index) =>
                        index < rating ? (
                          <IoStar key={index} size={16} />
                        ) : (
                          <IoStarOutline key={index} size={16} />
                        ),
                      )}
                    </div>

                    <p
                      className={`${styles.reviewCardDateText} text-uppercase mb-3`}
                    >
                      {formatDate(review?.dateText)}
                    </p>
                    <h5 className={`${styles.reviewCardTitle} mb-2`}>
                      {review?.reviewTitle}
                    </h5>
                    <p className={`${styles.reviewCardBodyComment} mb-2`}>
                      {review?.comment}
                    </p>
                    <p className={`${styles.reviewCardReviewerName} m-0`}>
                      {review?.reviewerName}
                    </p>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ReviewsBlock;
