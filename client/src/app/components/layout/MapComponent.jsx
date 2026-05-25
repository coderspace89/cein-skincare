"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createCustomIcon = (color = "#333333") => {
  // A standard clean minimalist map pin vector path
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return new L.DivIcon({
    html: svgTemplate,
    className: "custom-svg-icon", // Prevents Leaflet from adding default white background boxes
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Anchors the very bottom tip of the pin to the coordinate
    popupAnchor: [0, -32], // Ensures the popup bubble opens right above the pin tip
  });
};

// Custom controller component to handle map viewport fly/pan animations
function RecenterMap({ activeStore, defaultCenter }) {
  const map = useMap();

  useEffect(() => {
    if (activeStore && activeStore.latitude && activeStore.longitude) {
      // Smoothly pan to the specific store coordinate and increase zoom density
      map.setView([activeStore.latitude, activeStore.longitude], 14, {
        animate: true,
        duration: 1.0, // seconds
      });
    } else if (defaultCenter) {
      // Fallback behavior: Reset view out to show all markers when nothing is chosen
      map.setView(defaultCenter, 10, {
        animate: true,
      });
    }
  }, [activeStore, map, defaultCenter]);

  return null;
}

const MapComponent = ({ stores, activeStore }) => {
  // Compute default center based on the first store in the current list, fallback to NY
  const defaultCenter =
    stores.length > 0 && stores[0].latitude && stores[0].longitude
      ? [stores[0].latitude, stores[0].longitude]
      : [40.7128, -74.006];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={10}
        attributionControl={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* This controller safely intercepts map manipulation workflows directly */}
        <RecenterMap activeStore={activeStore} defaultCenter={defaultCenter} />

        {stores?.map((store) => {
          const isSelected = activeStore?.id === store.id;

          // Use a gold/bronze tint for selected, and soft charcoal gray for unselected branches
          const pinColor = isSelected ? "#333333" : "#222222";

          return (
            store.latitude &&
            store.longitude && (
              <Marker
                key={store.id}
                position={[store.latitude, store.longitude]}
                icon={createCustomIcon(pinColor)}
              >
                <Popup>
                  <strong>{store.name}</strong>
                  <br />
                  {store.address}
                </Popup>
              </Marker>
            )
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
