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
import dynamic from "next/dynamic";

// 2. Dynamically load the component, disabling server-side rendering execution
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className={headerStyles.mapPlaceholder}>Loading Map Area...</div>
  ),
});

const Header = () => {
  const [headerData, setHeaderData] = useState(null);
  const [locale, setLocale] = useState("en");
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [storesData, setStoresData] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("New York");
  const [selectedDistrictData, setSelectedDistrictData] = useState([]);

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

  //   fetch only district name from strapi

  const districtNameQuery = qs.stringify(
    {
      fields: ["district"],
    },
    {
      encodeValuesOnly: true,
    },
  );

  //  selected store data

  useEffect(() => {
    const fetchSelectedDistrictStores = async () => {
      // Stringify here so it uses the absolute freshest state value
      const storesQuery = qs.stringify(
        {
          filters: {
            district: {
              $eq: selectedDistrict,
            },
          },
        },
        { encodeValuesOnly: true },
      );

      const response = await fetch(`/api/stores?${storesQuery}`);
      const data = await response.json();
      setSelectedDistrictData(data?.data || []);
    };

    fetchSelectedDistrictStores();
  }, [selectedDistrict]);

  // all stores data

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

  // 1. Add the state tracking the single active store object near your other states
  const [activeStore, setActiveStore] = useState(null);

  // Reset the active store whenever the district changes
  // so the map doesn't stay stuck on a store from a different state/city.
  useEffect(() => {
    setActiveStore(null);
  }, [selectedDistrict]);

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
                                  <div>
                                    {/* NEW WRAPPER: This groups your 3 store sub-columns into one grid item */}
                                    <div
                                      className={headerStyles.storeLocatorGrid}
                                    >
                                      {/* Column 1: District Filter Search */}
                                      <div
                                        className={
                                          headerStyles.menuColumnsContainer
                                        }
                                      >
                                        <Form>
                                          <Form.Group
                                            className="mb-4"
                                            controlId="districts-search"
                                          >
                                            <Form.Control
                                              type="text"
                                              placeholder="Search Districts"
                                              className={
                                                headerStyles.districtInput
                                              }
                                              onChange={(e) =>
                                                setSelectedDistrict(
                                                  e.target.value,
                                                )
                                              }
                                              value={selectedDistrict}
                                            />
                                          </Form.Group>
                                        </Form>
                                        <div>
                                          <p
                                            className={
                                              headerStyles.districtTitle
                                            }
                                          >
                                            District
                                          </p>
                                        </div>
                                        <ul className="list-unstyled">
                                          {uniqueDistricts?.map(
                                            (districtListItem) => (
                                              <li key={districtListItem}>
                                                <Link
                                                  href={`/stores/${districtListItem.toLowerCase().split(" ").join("-")}`}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedDistrict(
                                                      districtListItem,
                                                    );
                                                  }}
                                                  className={
                                                    headerStyles.districtListLink
                                                  }
                                                >
                                                  {districtListItem}
                                                </Link>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      </div>

                                      {/* Column 2: Individual Branch Address Radio Selector */}
                                      <div
                                        className={
                                          headerStyles.menuColumnsContainer
                                        }
                                      >
                                        {selectedDistrictData.map(
                                          (districtListItem) => (
                                            <Form.Check
                                              type="radio"
                                              className={headerStyles.formCheck}
                                              id={districtListItem.id}
                                              key={districtListItem.id}
                                              name="storesNamesList"
                                              checked={
                                                activeStore?.id ===
                                                districtListItem.id
                                              }
                                              onChange={() =>
                                                setActiveStore(districtListItem)
                                              }
                                              label={
                                                <div>
                                                  <span className="d-block fw-semibold">
                                                    {districtListItem?.name}
                                                  </span>
                                                  <span className="d-block small text-muted">
                                                    {districtListItem?.address}
                                                  </span>
                                                </div>
                                              }
                                            />
                                          ),
                                        )}
                                      </div>
                                    </div>
                                    {/* END OF NEW WRAPPER */}
                                  </div>
                                )}
                              </div>

                              {navItem.megaMenu.type === "stores" && (
                                <div>
                                  <div className={headerStyles.dropdownMapWrap}>
                                    <MapComponent
                                      activeStore={activeStore}
                                      stores={selectedDistrictData}
                                    />
                                  </div>
                                  <div className={headerStyles.storeInfoBlock}>
                                    {selectedDistrictData.map(
                                      (districtListItem) => (
                                        <div key={districtListItem?.id}>
                                          <span className="d-block">
                                            {activeStore?.id ===
                                            districtListItem.id
                                              ? districtListItem?.name
                                              : ""}
                                          </span>
                                          <span className="d-block">
                                            {activeStore?.id ===
                                            districtListItem.id
                                              ? districtListItem?.address
                                              : ""}
                                          </span>
                                          <span className="d-block">
                                            {activeStore?.id ===
                                            districtListItem.id
                                              ? districtListItem?.phone
                                              : ""}
                                          </span>
                                          <span className="d-block">
                                            {activeStore?.id ===
                                            districtListItem.id
                                              ? districtListItem?.email
                                              : ""}
                                          </span>
                                          {activeStore?.id ===
                                            districtListItem.id && (
                                            <Link
                                              className={headerStyles.storeBtn}
                                              href={`/stores/${districtListItem?.district?.toLowerCase().split(" ").join("-")}/${districtListItem?.name?.toLowerCase().split(" ").join("-").replace(".", "")}`}
                                            >
                                              Take me there
                                            </Link>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

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
