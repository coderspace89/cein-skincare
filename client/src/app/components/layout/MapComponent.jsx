"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

// Marker icon fix setup
const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* This controller safely intercepts map manipulation workflows directly */}
        <RecenterMap activeStore={activeStore} defaultCenter={defaultCenter} />

        {stores?.map(
          (store) =>
            store.latitude &&
            store.longitude && (
              <Marker
                key={store.id}
                position={[store.latitude, store.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <strong>{store.name}</strong>
                  <br />
                  {store.address}
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
