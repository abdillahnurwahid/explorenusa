"use client";

import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      flexDirection: "column",
      gap: "12px",
      backgroundColor: "#f5f5f5",
    }}>
      <div style={{
        width: "32px",
        height: "32px",
        border: "3px solid #111",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#555", fontSize: "14px", fontWeight: 600 }}>
        Memuat peta...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function MapPage() {
  return (
    <>
      <style>{`
        body { background: #ffffff !important; }
      `}</style>
      <Navbar />
      <div style={{
        position: "fixed",
        top: "60px",
        left: 0,
        right: 0,
        bottom: 0,
      }}>
        <Map />
      </div>
    </>
  );
}