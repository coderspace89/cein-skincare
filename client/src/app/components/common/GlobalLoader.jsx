"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "react-bootstrap";

function LoaderCore() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Trigger loading screen whenever the route URL pathname or query arguments update
  useEffect(() => {
    // 1. Fire loader view state on change entry
    setLoading(true);

    // 2. Clear loader once the DOM has finished mounting the new page bundle
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400); // Small visual grace period for structural stability (adjust as preferred)

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center z-3"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)", // High contrast clean editorial overlay
        backdropFilter: "blur(4px)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div className="text-center">
        {/* Sleek, thin matte grey spinner to match CEIN branding */}
        <Spinner
          animation="border"
          role="status"
          variant="dark"
          style={{
            width: "3rem",
            height: "3rem",
            strokeWidth: "1px",
            borderThickness: "1px",
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p
          className="mt-3 text-uppercase tracking-widest font-monospace text-secondary m-0"
          style={{ fontSize: "10px", letterSpacing: "0.25em" }}
        >
          Loading
        </p>
      </div>
    </div>
  );
}

// Next.js hooks like useSearchParams must be wrapped inside a Suspense context boundary
export default function GlobalLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderCore />
    </Suspense>
  );
}
