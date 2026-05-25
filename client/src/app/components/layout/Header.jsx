"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
  IoCloseOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
} from "react-icons/io5"; // Premium minimal navigation line icons
import dynamic from "next/dynamic";

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
  const [activeStore, setActiveStore] = useState(null);

  // --- Mobile Drawer Specific States ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState(null); // Track loaded sub-view panel id or navigation context

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
                    columns: { populate: { links: true } },
                    promo: { populate: { image: true } },
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
    const fetchHeader = async () => {
      const response = await fetch(`/api/global?locale=${locale}&${query}`);
      const data = await response.json();
      setHeaderData(data?.data?.header);
    };
    fetchHeader();
  }, [locale, query]);

  useEffect(() => {
    const fetchSelectedDistrictStores = async () => {
      const storesQuery = qs.stringify(
        { filters: { district: { $eq: selectedDistrict } } },
        { encodeValuesOnly: true },
      );
      const response = await fetch(`/api/stores?${storesQuery}`);
      const data = await response.json();
      setSelectedDistrictData(data?.data || []);
    };
    fetchSelectedDistrictStores();
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchStores = async () => {
      const response = await fetch(`/api/stores?fields[0]=district`);
      const data = await response.json();
      setStoresData(data?.data || []);
    };
    fetchStores();
  }, []);

  const uniqueDistricts = [
    ...new Set(storesData.map((store) => store.district)),
  ];

  useEffect(() => {
    if (selectedDistrictData && selectedDistrictData.length > 0) {
      setActiveStore(selectedDistrictData[0]);
    } else {
      setActiveStore(null);
    }
  }, [selectedDistrictData]);

  // Lock scrolling behavior on the body layout element when overlay panel visibility is true
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setActiveMobileSubMenu(null); // Reset sub-menu transitions when closed
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const timeoutRef = useRef(null);

  const handleMouseEnter = (id) => {
    // 1. Clear any pending leave/enter timeouts immediately
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 2. If a menu is ALREADY open, switch to the new tab instantly for a snappy feel
    if (activeMegaMenu !== null) {
      setActiveMegaMenu(id);
      return;
    }

    // 3. Otherwise, if it's opening fresh, apply the intentional delay
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(id);
    }, 200); // 200ms feels natural for opening
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 4. Delay the close action to give users a buffer zone
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 300); // 300ms safety window
  };

  return (
    <section className={headerStyles.headerSection}>
      {/* Top Announcement Bar */}
      <div className={headerStyles.topbarContainer}>
        <span>{headerData?.announcementBar}</span>
      </div>

      {/* Main Navigation Bar Container */}
      <Navbar expand="lg" className={headerStyles.navbar}>
        <Container
          fluid
          className="position-relative d-flex align-items-center justify-content-between"
        >
          {/* Custom Minimalist Mobile Trigger Button UI */}
          {!isMobileMenuOpen ? (
            <button
              className={`${headerStyles.mobileTriggerBtn} d-lg-none`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu Navigation View"
            >
              <svg
                width="18"
                height="12"
                viewBox="0 0 18 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 1H18M0 6H18M0 11H18"
                  stroke="#333333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : (
            <button
              className={headerStyles.mobileCloseBtn}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close View Panel Navigation Navigation Area"
            >
              <IoCloseOutline size={24} />
            </button>
          )}

          <div className="d-lg-none d-block">
            <Nav.Link
              as={Link}
              href="/search"
              className={headerStyles.navLinks}
            >
              <CiSearch size={20} color="#333333" />
            </Nav.Link>
          </div>

          {/* Desktop Only Navigation Core Context Links */}
          <div className={`${headerStyles.navLinkWrap} d-none d-lg-block`}>
            <Nav>
              {headerData?.navItems?.map((navItem) => {
                const hasDropdown = navItem?.hasMegamenu && navItem?.megaMenu;
                return (
                  <div
                    key={navItem?.id}
                    className={headerStyles.navItemContainer}
                    onMouseEnter={() =>
                      hasDropdown && handleMouseEnter(navItem.id)
                    }
                    onMouseLeave={handleMouseLeave}
                  >
                    <Nav.Link
                      as={Link}
                      href={navItem?.url || "#"}
                      className={`${headerStyles.navLinks} ${activeMegaMenu === navItem.id ? headerStyles.activeLink : ""}`}
                    >
                      {navItem?.title}
                    </Nav.Link>

                    {/* Desktop Hover Mega-Menu Elements */}
                    {hasDropdown && activeMegaMenu === navItem.id && (
                      <div className={headerStyles.megaMenuDropdown}>
                        <Container fluid>
                          <div className={headerStyles.megaMenuGrid}>
                            <div className={headerStyles.menuColumnsContainer}>
                              {navItem.megaMenu.type === "categories" ? (
                                <div className={headerStyles.categoriesGrid}>
                                  {navItem.megaMenu.columns?.map((col) => (
                                    <div
                                      key={col.id}
                                      className={headerStyles.menuColumn}
                                    >
                                      <h5 className={headerStyles.columnTitle}>
                                        {col.title}
                                      </h5>
                                      <ul className={headerStyles.linkList}>
                                        {col.links?.map((link) => (
                                          <li key={link.id}>
                                            <Link
                                              href={link.url || "#"}
                                              className={headerStyles.menuLink}
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
                                <div className={headerStyles.storeLocatorGrid}>
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
                                          className={headerStyles.districtInput}
                                          onChange={(e) =>
                                            setSelectedDistrict(e.target.value)
                                          }
                                          value={selectedDistrict}
                                        />
                                      </Form.Group>
                                    </Form>
                                    <div>
                                      <p className={headerStyles.districtTitle}>
                                        District
                                      </p>
                                    </div>
                                    <ul className="list-unstyled">
                                      {uniqueDistricts?.map(
                                        (districtListItem) => (
                                          <li key={districtListItem}>
                                            <Link
                                              href="#"
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
                                          id={`desktop-radio-${districtListItem.id}`}
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
                                  {activeStore && (
                                    <div>
                                      <span className="d-block fw-semibold mb-2">
                                        {activeStore.name}
                                      </span>
                                      <span
                                        className={
                                          headerStyles.storeInfoBlockText
                                        }
                                      >
                                        {activeStore.address}
                                      </span>
                                      <span
                                        className={
                                          headerStyles.storeInfoBlockText
                                        }
                                      >
                                        {activeStore.phone}
                                      </span>
                                      <span
                                        className={
                                          headerStyles.storeInfoBlockText
                                        }
                                      >
                                        {activeStore.email}
                                      </span>
                                      <Link
                                        className={headerStyles.storeBtn}
                                        href={`/stores/${activeStore.district?.toLowerCase().split(" ").join("-")}/${activeStore.name?.toLowerCase().split(" ").join("-").replace(".", "")}`}
                                      >
                                        Take me there
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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
                                          "Promo"
                                        }
                                        fill
                                        sizes="300px"
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

          {/* Center Brand Component / Dynamic Identity Logo Asset */}
          <Navbar.Brand as={Link} href="/" className="mx-auto mx-lg-0">
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

          {/* Right Layout Module Global Utility Actions Group Icons Element */}
          <Nav
            className={`${headerStyles.utilityIconsNavRow} align-items-center gap-2 gap-lg-0`}
          >
            <Nav.Link
              as={Link}
              href="/search"
              className={`${headerStyles.navLinks} d-lg-block d-none`}
            >
              <CiSearch size={20} color="#333333" />
            </Nav.Link>
            <Form.Select
              aria-label="lang-switch"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className={`${headerStyles.formSelect} d-none d-lg-block`}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
            </Form.Select>
            <Nav.Link
              as={Link}
              href="/favorites"
              className={`${headerStyles.navLinks}`}
            >
              <CiHeart size={20} color="#333333" />
            </Nav.Link>
            <Nav.Link
              as={Link}
              href="/signup"
              className={`${headerStyles.navLinks} d-none d-lg-block`}
            >
              <CiUser size={20} color="#333333" />
            </Nav.Link>
            <Nav.Link as={Link} href="/cart" className={headerStyles.navLinks}>
              <PiBagLight size={20} color="#333333" />
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* =========================================================================
          FULLSCREEN MOBILE MENU DRAWER OVERLAY OVER CANVAS
         ========================================================================= */}

      {isMobileMenuOpen && (
        <div
          className={`${headerStyles.mobileMenuOverlay} ${isMobileMenuOpen ? headerStyles.mobileMenuIsOpen : ""}`}
        >
          {/* Mobile Drawer Navigation Header Strip */}
          <div className={headerStyles.mobileMenuHeader}>
            {activeMobileSubMenu ? (
              <button
                className={headerStyles.mobileBackBtn}
                onClick={() => setActiveMobileSubMenu(null)}
              >
                <IoChevronBackOutline size={18} />
                <span>
                  {
                    headerData?.navItems?.find(
                      (item) => item.id === activeMobileSubMenu,
                    )?.title
                  }
                </span>
              </button>
            ) : (
              <div className={headerStyles.mobileLogoPlaceholder}>
                {/* Optional: Add minimal cross-render logo typography block or close link target */}
              </div>
            )}

            {/* <button
              className={headerStyles.mobileCloseBtn}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close View Panel Navigation Navigation Area"
            >
              <IoCloseOutline size={24} />
            </button> */}
          </div>

          {/* Dynamic Inner Panel Body Component Switchboard */}
          <div className={headerStyles.mobileMenuBody}>
            {/* SCREEN 1: Root Menu Panel */}
            <div
              className={`${headerStyles.mobilePanelLayer} ${!activeMobileSubMenu ? headerStyles.panelLayerActive : ""}`}
            >
              <ul className={headerStyles.mobileRootNavList}>
                {headerData?.navItems?.map((navItem) => {
                  const hasSubMenu = navItem?.hasMegamenu && navItem?.megaMenu;
                  return (
                    <li
                      key={navItem.id}
                      className={headerStyles.mobileRootNavItem}
                    >
                      {hasSubMenu ? (
                        <button
                          className={headerStyles.mobileNavLinkRowBtn}
                          onClick={() => setActiveMobileSubMenu(navItem.id)}
                        >
                          <span>{navItem.title}</span>
                          <IoChevronForwardOutline size={16} color="#999999" />
                        </button>
                      ) : (
                        <Link
                          href={navItem.url || "#"}
                          className={headerStyles.mobileNavLinkRow}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {navItem.title}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Bottom Section Core Footer Context Details Inside Mobile Drawer */}
              <div className={headerStyles.mobileMenuFooterStrip}>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  Log in
                </Link>
                <Link
                  href="/support"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Customer Support
                </Link>
                <div className={headerStyles.mobileLangSelectorWrap}>
                  <span>Language</span>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                  >
                    <option value="en">English (EN)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SCREEN 2: Dynamic Nested Context Sub-Menus Content Maps */}
            {headerData?.navItems?.map((navItem) => {
              if (!navItem?.hasMegamenu || !navItem?.megaMenu) return null;
              const isThisPanelActive = activeMobileSubMenu === navItem.id;

              return (
                <div
                  key={`submenu-panel-${navItem.id}`}
                  className={`${headerStyles.mobilePanelLayer} ${isThisPanelActive ? headerStyles.panelLayerActive : ""}`}
                >
                  {/* Variant A: Standard Item Categories Grid List */}
                  {navItem.megaMenu.type === "categories" && (
                    <div className={headerStyles.mobileCategoriesWrapper}>
                      {navItem.megaMenu.columns?.map((col) => (
                        <div
                          key={col.id}
                          className={headerStyles.mobileSubMenuCategoryBlock}
                        >
                          {col.links?.map((link) => (
                            <Link
                              key={link.id}
                              href={link.url || "#"}
                              className={headerStyles.mobileSubPanelLinkRow}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Variant B: Custom Stores Interactive Mobile Map Panel View Block */}
                  {navItem.megaMenu.type === "stores" && (
                    <div className={headerStyles.mobileStoresOverlayLayoutGrid}>
                      {/* Branch Selection List Block Section */}
                      <div className={headerStyles.mobileStoresListContainer}>
                        {selectedDistrictData.map((districtListItem) => (
                          <div
                            key={`mobile-store-row-${districtListItem.id}`}
                            className={`${headerStyles.mobileStoreRadioCard} ${activeStore?.id === districtListItem.id ? headerStyles.mobileStoreCardSelected : ""}`}
                            onClick={() => setActiveStore(districtListItem)}
                          >
                            <div
                              className={headerStyles.mobileCustomRadioCircle}
                            >
                              {activeStore?.id === districtListItem.id && (
                                <div
                                  className={
                                    headerStyles.mobileCustomRadioInnerDot
                                  }
                                />
                              )}
                            </div>
                            <div
                              className={
                                headerStyles.mobileStoreCardContentTextWrap
                              }
                            >
                              <span
                                className={headerStyles.mobileStoreTitleText}
                              >
                                {districtListItem?.name}
                              </span>
                              <span
                                className={headerStyles.mobileStoreAddressText}
                              >
                                {districtListItem?.address}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Integrated Map Canvas View Segment Layer */}
                      <div className={headerStyles.mobileMapCanvasWrapperBox}>
                        <MapComponent
                          activeStore={activeStore}
                          stores={selectedDistrictData}
                        />
                      </div>

                      {/* Active Selection Details Summary Module Panel Section */}
                      {activeStore && (
                        <div
                          className={
                            headerStyles.mobileActiveStoreFooterCardDetails
                          }
                        >
                          <h4 className={headerStyles.mobileFooterStoreTitle}>
                            {activeStore.name}
                          </h4>
                          <p className={headerStyles.mobileFooterStoreDescText}>
                            {activeStore.address}
                          </p>
                          {activeStore.phone && (
                            <p
                              className={headerStyles.mobileFooterStoreDescText}
                            >
                              {activeStore.phone}
                            </p>
                          )}
                          {activeStore.email && (
                            <p
                              className={headerStyles.mobileFooterStoreDescText}
                            >
                              {activeStore.email}
                            </p>
                          )}

                          <Link
                            className={
                              headerStyles.mobileActionTakeMeTherePrimaryBtn
                            }
                            href={`/stores/${activeStore.district?.toLowerCase().split(" ").join("-")}/${activeStore.name?.toLowerCase().split(" ").join("-").replace(".", "")}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Take me there
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default Header;
