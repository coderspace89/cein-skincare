"use client";

import React, { useState, useEffect } from "react";
import headerStyles from "./Header.module.css";
import qs from "qs";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/utils";
import Form from "react-bootstrap/Form";
import Link from "next/link";
import { CiSearch, CiHeart, CiUser } from "react-icons/ci";
import { PiBagLight } from "react-icons/pi";

const Header = () => {
  const [headerData, setHeaderData] = useState(null);
  const [locale, setLocale] = useState("en");
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [storesData, setStoresData] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("New York");

  const query = qs.stringify(
    {
      populate: {
        header: {
          populate: {
            logo: true,
            navItems: {
              populate: {
                megaMenu: {
                  populate: {
                    columns: {
                      populate: {
                        links: true,
                      },
                    },
                    promo: {
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
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  useEffect(() => {
    const fetchHeader = async () => {
      const response = await fetch(`/api/global?locale=${locale}&${query}`);
      const data = await response.json();
      console.log(data?.data?.header);
      setHeaderData(data?.data?.header);
    };
    fetchHeader();
  }, [locale, query]);

  //   fetch stores data

  const storesQuery = qs.stringify(
    {
      filters: {
        district: {
          $eq: selectedDistrict, // Uses the exact match operator
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  //   fetch only district name from strapi

  const districtNameQuery = qs.stringify(
    {
      fields: ["district"],
    },
    {
      encodeValuesOnly: true,
    },
  );

  useEffect(() => {
    const fetchStores = async () => {
      const response = await fetch(`/api/stores?${storesQuery}`);
      const data = await response.json();
      console.log(data?.data);
      //   setStoresData(data?.data);
    };
    fetchStores();
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchStores = async () => {
      const response = await fetch(`/api/stores?${districtNameQuery}`);
      const data = await response.json();
      console.log(data?.data);
      setStoresData(data?.data);
    };
    fetchStores();
  }, []);

  // Extract a unique list of district names
  const uniqueDistricts = [
    ...new Set(storesData.map((store) => store.district)),
  ];
  // Result: ["Brooklyn", "Buffalo", "Webster", ...]

  console.log(uniqueDistricts);

  return (
    <section className={headerStyles.headerSection}>
      {/* Top Announcement Bar */}
      <div className={headerStyles.topbarContainer}>
        <span>{headerData?.announcementBar}</span>
      </div>

      {/* Main Navigation Bar */}
      <Navbar expand="lg" className={headerStyles.navbar}>
        <Container fluid>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Left/Center: Main Nav Items */}
            <div className={headerStyles.navLinkWrap}>
              <Nav>
                {headerData?.navItems?.map((navItem) => {
                  const hasDropdown = navItem?.hasMegamenu && navItem?.megaMenu;

                  return (
                    <div
                      key={navItem?.id}
                      className={headerStyles.navItemContainer}
                      onMouseEnter={() =>
                        hasDropdown && setActiveMegaMenu(navItem.id)
                      }
                      onMouseLeave={() => setActiveMegaMenu(null)}
                    >
                      <Nav.Link
                        as={Link}
                        href={navItem?.url || "#"}
                        className={`${headerStyles.navLinks} ${
                          activeMegaMenu === navItem.id
                            ? headerStyles.activeLink
                            : ""
                        }`}
                      >
                        {navItem?.title}
                      </Nav.Link>

                      {/* Render Mega Menu on Hover/Active */}
                      {hasDropdown && activeMegaMenu === navItem.id && (
                        <div className={headerStyles.megaMenuDropdown}>
                          <Container fluid>
                            <div className={headerStyles.megaMenuGrid}>
                              {/* Left Content Column Tracks (Categories/Stores) */}
                              <div
                                className={headerStyles.menuColumnsContainer}
                              >
                                {navItem.megaMenu.type === "categories" ? (
                                  <div className={headerStyles.categoriesGrid}>
                                    {navItem.megaMenu.columns?.map((col) => (
                                      <div
                                        key={col.id}
                                        className={headerStyles.menuColumn}
                                      >
                                        <h5
                                          className={headerStyles.columnTitle}
                                        >
                                          {col.title}
                                        </h5>
                                        <ul className={headerStyles.linkList}>
                                          {col.links?.map((link) => (
                                            <li key={link.id}>
                                              <Link
                                                href={link.url || "#"}
                                                className={
                                                  headerStyles.menuLink
                                                }
                                              >
                                                {link.label}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  /* Dynamic layout structural fallback if the megamenu type is "stores" */
                                  <div className={headerStyles.storesContent}>
                                    <h4 className={headerStyles.columnTitle}>
                                      Our Boutiques
                                    </h4>
                                    <p
                                      className={headerStyles.storesDescription}
                                    >
                                      Discover our clean skincare sanctuaries.
                                      Explore experiences, book customized
                                      treatments, and locate a storefront near
                                      you.
                                    </p>
                                    <Link
                                      href="/stores"
                                      className={headerStyles.exploreStoresBtn}
                                    >
                                      Find a Store Location
                                    </Link>
                                  </div>
                                )}
                              </div>

                              {/* Right Content Column: Promotion Segment (If Present) */}
                              {navItem.megaMenu.promo && (
                                <div className={headerStyles.promoContainer}>
                                  <Link
                                    href={navItem.megaMenu.promo.linkUrl || "#"}
                                    className={headerStyles.promoWrapper}
                                  >
                                    {navItem.megaMenu.promo.image && (
                                      <div
                                        className={headerStyles.promoImageWrap}
                                      >
                                        <Image
                                          src={getStrapiMedia(
                                            navItem.megaMenu.promo.image.url,
                                          )}
                                          alt={
                                            navItem.megaMenu.promo.image.name ||
                                            "Promotion Image"
                                          }
                                          fill
                                          sizes="(max-width: 768px) 100vw, 300px"
                                          className={headerStyles.promoImage}
                                          priority
                                        />
                                      </div>
                                    )}
                                  </Link>
                                </div>
                              )}
                            </div>
                          </Container>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Nav>
            </div>

            {/* Center/Brand: Logo Component */}
            <Navbar.Brand as={Link} href="/" className="mx-auto">
              <div className={headerStyles.logoWrapper}>
                {headerData?.logo && (
                  <Image
                    src={getStrapiMedia(headerData?.logo?.url)}
                    width={headerData?.logo?.width}
                    height={headerData?.logo?.height}
                    alt={headerData?.logo?.name || "Logo"}
                  />
                )}
              </div>
            </Navbar.Brand>

            {/* Right Side: Tools & Actions Icons */}
            <Nav className="align-items-center">
              <Nav.Link
                as={Link}
                href="/search"
                className={headerStyles.navLinks}
              >
                <CiSearch size={18} color="#333333" />
              </Nav.Link>

              <Form.Select
                aria-label="lang-switch"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className={headerStyles.formSelect}
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
              </Form.Select>

              <Nav.Link
                as={Link}
                href="/favorites"
                className={headerStyles.navLinks}
              >
                <CiHeart size={18} color="#333333" />
              </Nav.Link>
              <Nav.Link
                as={Link}
                href="/signup"
                className={headerStyles.navLinks}
              >
                <CiUser size={18} color="#333333" />
              </Nav.Link>
              <Nav.Link
                as={Link}
                href="/cart"
                className={headerStyles.navLinks}
              >
                <PiBagLight size={18} color="#333333" />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </section>
  );
};

export default Header;
