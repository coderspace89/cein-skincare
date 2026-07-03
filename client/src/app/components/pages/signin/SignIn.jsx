"use client";

import React, { useState, useEffect } from "react";
import styles from "./SignIn.module.css";
import qs from "qs";
import { useLocale } from "@/context/LocaleContext";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/utils";

const SignIn = () => {
  const [pageLabels, setPageLabels] = useState(null);
  const { locale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const query = qs.stringify(
    {
      locale: locale,
      populate: ["sideImage"],
    },
    { encodeValuesOnly: true },
  );

  //   fetch strapi page labels
  useEffect(() => {
    const fetchPageLabels = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/login-page?${query}`);
        const data = await response.json();
        console.log(data?.data);
        setPageLabels(data?.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    };
    fetchPageLabels();
  }, [query]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    // Directly forward the user context to your login API route
    // This automatically routes them into the Shopify secure authentication loop
    window.location.href = `/api/auth/signin?email=${encodeURIComponent(email)}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="dark" />
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <Container fluid className="p-0">
        <Row>
          <Col lg={6}>
            <div>
              {pageLabels?.sideImage && (
                <Image
                  src={getStrapiMedia(pageLabels?.sideImage?.url)}
                  width={pageLabels?.sideImage?.width}
                  height={pageLabels?.sideImage?.height}
                  alt={pageLabels?.sideImage?.name}
                  className={styles.sideImage}
                />
              )}
            </div>
          </Col>
          {/* Right Side Interaction Forms Content Block */}
          <Col
            md={6}
            xs={12}
            className="d-flex align-items-center bg-white py-5"
          >
            <div className={styles.formContainer}>
              <h2 className={styles.mainTitle}>{pageLabels?.loginHeading}</h2>

              <form onSubmit={handleLoginSubmit} className="mt-5">
                {/* Email Input Field */}
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    value={email}
                    placeholder={pageLabels?.emailPlaceholder}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className={styles.inputArrow}>→</span>
                </div>

                {/* Password Input Field */}
                <div className={styles.inputGroup + " mt-4"}>
                  <input
                    type="password"
                    value={password}
                    placeholder={pageLabels?.passwordPlaceholder}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className={styles.inputArrow}>→</span>
                </div>

                {/* Forgot Password String Link */}
                <div className="text-end mt-2">
                  <Link
                    href="/reset-password"
                    className={styles.forgotPassword}
                  >
                    {pageLabels?.forgotPasswordLabel}
                  </Link>
                </div>

                {/* Submission Execution Button */}
                <button
                  type="submit"
                  className={styles.loginBtn + " w-100 mt-4"}
                >
                  {pageLabels?.loginButtonLabel}
                </button>
              </form>

              {/* Registration Banner Division */}
              <div className={styles.registerSection + " mt-5 pt-3"}>
                <h3 className={styles.registerTitle}>
                  {pageLabels?.newAccountHeading}
                </h3>
                <p className={styles.registerText}>
                  {pageLabels?.newAccountText}
                </p>

                <Link
                  href="/signup"
                  className={
                    styles.createAccountLink +
                    " d-flex justify-content-between align-items-center w-100 mt-4"
                  }
                >
                  <span>{pageLabels?.createAccountLabel}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SignIn;
