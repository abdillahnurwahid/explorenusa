"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, Popup,
  useMap, Polyline
} from "react-leaflet";
import L from "leaflet";
import "@/lib/leafletConfig";

function RecenterMap({ position }) {
  const map = useMap();
  const prevPosition = useRef(null);
  useEffect(() => {
    if (!position) return;
    // Hanya pindah view kalau posisi benar-benar berubah (bukan saat zoom/pan biasa)
    const isSame = prevPosition.current &&
      prevPosition.current[0] === position[0] &&
      prevPosition.current[1] === position[1];
    if (!isSame) {
      prevPosition.current = position;
      map.setView(position, 14, { animate: true });
    }
  }, [position]);
  return null;
}

function LocateButton({ onLocate }) {
  return (
    <button
      onClick={onLocate}
      title="Lokasi Saya"
      style={{
        position: "absolute", bottom: "100px", right: "12px",
        zIndex: 1000, width: "44px", height: "44px", borderRadius: "50%",
        backgroundColor: "white", border: "none",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        cursor: "pointer", fontSize: "20px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      📍
    </button>
  );
}

const filterList = [
  { key: "semua",    label: "🗺️ Semua" },
  { key: "wisata",   label: "🏛️ Wisata" },
  { key: "hiburan",  label: "🎭 Hiburan" },
  { key: "alam",     label: "🌿 Alam" },
  { key: "olahraga", label: "⚽ Olahraga" },
  { key: "kuliner",  label: "🍴 Kuliner" },
];

const modeList = [
  { key: "driving-car",     label: "🚗 Mobil" },
  { key: "foot-walking",    label: "🚶 Jalan" },
  { key: "cycling-regular", label: "🚴 Sepeda" },
];

const getStepIcon = (type) => {
  const icons = {
    0: "🚀", 1: "↰", 2: "↱", 3: "↑",
    4: "↰", 5: "↱", 6: "↰", 7: "↱",
    8: "↺", 10: "🏁", 11: "↰", 12: "↱", 13: "↑",
  };
  return icons[type] || "➡️";
};

export default function Map() {
  const [position, setPosition] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kategori, setKategori] = useState("semua");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);

  // Routing
  const [routeStops, setRouteStops] = useState([]);
  const [routeMode, setRouteMode] = useState("driving-car");
  const [routePath, setRoutePath] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [routeSummary, setRouteSummary] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [showFavPanel, setShowFavPanel] = useState(false);

  // Flag: posisi sudah di-set dari beranda, jangan di-override geolocation
  const gotoHandled = useRef(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Baca sessionStorage LEBIH DULU sebelum geolocation useEffect
  useEffect(() => {
    const raw = sessionStorage.getItem("en_goto");
    if (!raw) return;
    sessionStorage.removeItem("en_goto");
    gotoHandled.current = true;
    try {
      const { lat, lon, label } = JSON.parse(raw);
      const coords = [lat, lon];
      setPosition(coords);
      setSearchQuery(label);
      fetchPlaces(coords, "semua");
      setLoading(false);
    } catch (e) {
      console.error("en_goto parse error:", e);
    }
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/favorites");
      const data = await res.json();
      setFavorites(data || []);
    } catch (err) {
      console.error("FAVORITES ERROR:", err);
    }
  };

  const isFavorited = (place) => {
    const placeId = place.properties?.place_id ||
      place.geometry?.coordinates?.join(",") || "";
    return favorites.some((f) => f.place_id === placeId);
  };

  const handleToggleFavorite = async (place) => {
    const placeId = place.properties?.place_id ||
      place.geometry?.coordinates?.join(",") || "";
    const name = place.properties?.name || "Tanpa Nama";
    const lat = place.geometry?.coordinates?.[1];
    const lon = place.geometry?.coordinates?.[0];

    if (isFavorited(place)) {
      try {
        await fetch("http://localhost:8000/api/favorites/" + placeId, { method: "DELETE" });
        setFavorites((prev) => prev.filter((f) => f.place_id !== placeId));
      } catch (err) {
        console.error("DELETE FAV ERROR:", err);
      }
    } else {
      try {
        const res = await fetch("http://localhost:8000/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place_id: placeId, name, lat, lon }),
        });
        const data = await res.json();
        setFavorites((prev) => [...prev, data]);
      } catch (err) {
        console.error("ADD FAV ERROR:", err);
      }
    }
  };

  const handleGoToFavorite = (fav) => {
    const coords = [fav.lat, fav.lon];
    setPosition(coords);
    fetchPlaces(coords, kategori);
    setShowFavPanel(false);
    setSelectedPlace(null);
  };

  const fetchPlaces = async (coords, kat = "semua") => {
    try {
      const lat = coords[0];
      const lon = coords[1];
      const url = "http://localhost:8000/api/places?lat=" + lat + "&lon=" + lon + "&kategori=" + kat;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API ERROR");
      const data = await res.json();
      setPlaces(data.features || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    // Skip geolocation kalau posisi sudah di-set dari beranda
    if (gotoHandled.current) return;

    if (!navigator.geolocation) {
      setError("Browser tidak support geolocation");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Double-check: kalau meanwhile sessionStorage sudah dihandle, jangan override
        if (gotoHandled.current) return;
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        fetchPlaces(coords, "semua");
        setLoading(false);
      },
      (err) => {
        console.log("Geolocation error:", err);
        setError("Gagal mendapatkan lokasi. Cari lokasi di kolom pencarian.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        fetchPlaces(coords, kategori);
        setSelectedPlace(null);
      },
      (err) => console.log("Locate error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchResults([]);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 3) return;
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/geocode?q=" + encodeURIComponent(val));
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("GEOCODE ERROR:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  const handleSelectResult = (result) => {
    const coords = [result.lat, result.lon];
    setPosition(coords);
    fetchPlaces(coords, kategori);
    setSelectedPlace(null);
    setSearchQuery(result.formatted);
    setSearchResults([]);
  };

  const handleKategori = (key) => {
    setKategori(key);
    if (position) fetchPlaces(position, key);
    setSelectedPlace(null);
  };

  const handleAddToRoute = (place) => {
    const lat = place.geometry.coordinates[1];
    const lon = place.geometry.coordinates[0];
    const name = place.properties.name || "Tanpa Nama";
    const alreadyAdded = routeStops.some((s) => s.lat === lat && s.lon === lon);
    if (alreadyAdded) { alert("Tempat ini sudah ada di rute!"); return; }
    setRouteStops((prev) => [...prev, { name, lat, lon }]);
    setShowRoutePanel(true);
    setRoutePath(null);
    setRouteInstructions([]);
    setRouteSummary(null);
    setShowInstructions(false);
  };

  const handleRemoveStop = (index) => {
    setRouteStops((prev) => prev.filter((_, i) => i !== index));
    setRoutePath(null);
    setRouteInstructions([]);
    setRouteSummary(null);
    setShowInstructions(false);
  };

  const handleShowRoute = async () => {
    if (routeStops.length < 1) return;
    setRouteLoading(true);
    setRoutePath(null);
    setRouteInstructions([]);
    setRouteSummary(null);
    setShowInstructions(false);
    try {
      const allStops = position
        ? [{ lat: position[0], lon: position[1] }, ...routeStops]
        : routeStops;
      const waypoints = allStops.map((s) => [s.lon, s.lat]);
      const res = await fetch("http://localhost:8000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints, mode: routeMode }),
      });
      const data = await res.json();
      const feature = data?.features?.[0];
      const coords = feature?.geometry?.coordinates;
      if (coords) {
        const path = coords.map((c) => [c[1], c[0]]);
        setRoutePath(path);
      }
      const segments = feature?.properties?.segments || [];
      const allSteps = [];
      segments.forEach((seg) => {
        (seg.steps || []).forEach((step) => allSteps.push(step));
      });
      setRouteInstructions(allSteps);
      const summary = feature?.properties?.summary;
      if (summary) {
        setRouteSummary({
          distance: (summary.distance / 1000).toFixed(1),
          duration: Math.round(summary.duration / 60),
        });
      }
      setShowInstructions(true);
    } catch (err) {
      console.error("ROUTE ERROR:", err);
    } finally {
      setRouteLoading(false);
    }
  };

  // Buka di Google Maps
  const handleOpenGoogleMaps = () => {
    if (routeStops.length < 1) return;

    const origin = position
      ? position[0] + "," + position[1]
      : routeStops[0].lat + "," + routeStops[0].lon;

    const destination = routeStops[routeStops.length - 1].lat + "," +
      routeStops[routeStops.length - 1].lon;

    const midStops = routeStops.slice(0, -1);
    const waypoints = midStops.map((s) => s.lat + "," + s.lon).join("|");

    const travelMode = routeMode === "foot-walking" ? "walking"
      : routeMode === "cycling-regular" ? "bicycling"
      : "driving";

    let url = "https://www.google.com/maps/dir/?api=1"
      + "&origin=" + origin
      + "&destination=" + destination
      + "&travelmode=" + travelMode;

    if (waypoints) url += "&waypoints=" + encodeURIComponent(waypoints);

    window.open(url, "_blank");
  };

  const handleClearRoute = () => {
    setRouteStops([]);
    setRoutePath(null);
    setRouteInstructions([]);
    setRouteSummary(null);
    setShowRoutePanel(false);
    setShowInstructions(false);
  };

  const userIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41],
  });

  const placeIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
  });

  const stopIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    iconSize: [32, 32],
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "12px" }}>
        <div style={{ width: "32px", height: "32px", border: "4px solid #16a34a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#4ade80", fontSize: "14px", fontWeight: 600 }}>Mendeteksi lokasi kamu...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* Search Bar */}
      <div style={{ position: "absolute", top: "12px", left: "60px", zIndex: 1000, width: "280px" }}>
        <input
          id="location-search" name="location-search" type="text"
          placeholder="🔍 Cari lokasi... (contoh: Monas)"
          value={searchQuery} onChange={handleSearchInput}
          style={{ width: "100%", padding: "10px 14px", borderRadius: "12px", border: "1.5px solid #e5e7eb", backgroundColor: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.15)", fontSize: "13px", outline: "none", boxSizing: "border-box", color: "#1f2937" }}
        />
        {(searchResults.length > 0 || searchLoading) && (
          <div style={{ marginTop: "4px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            {searchLoading && <div style={{ padding: "12px 14px", fontSize: "13px", color: "#6b7280" }}>Mencari...</div>}
            {searchResults.map((result, i) => (
              <button key={i} onClick={() => handleSelectResult(result)}
                style={{ display: "block", width: "100%", padding: "10px 14px", textAlign: "left", border: "none", borderTop: i > 0 ? "1px solid #f3f4f6" : "none", backgroundColor: "white", cursor: "pointer", fontSize: "13px", color: "#1f2937", boxSizing: "border-box" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
              >
                📍 {result.formatted}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Kategori */}
      <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", gap: "6px", flexWrap: "nowrap" }}>
        {filterList.map((f) => (
          <button key={f.key} onClick={() => handleKategori(f.key)}
            style={{ padding: "10px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,0.12)", backgroundColor: kategori === f.key ? "#16a34a" : "white", color: kategori === f.key ? "white" : "#4b5563" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tombol Favorit */}
      <button
        onClick={() => setShowFavPanel(!showFavPanel)}
        title="Favorit Saya"
        style={{ position: "absolute", bottom: "155px", right: "12px", zIndex: 1000, width: "44px", height: "44px", borderRadius: "50%", backgroundColor: showFavPanel ? "#16a34a" : "white", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.2)", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        ❤️
      </button>

      {/* Panel Favorit */}
      {showFavPanel && (
        <div style={{ position: "absolute", bottom: "210px", right: "12px", zIndex: 1000, backgroundColor: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", width: "260px", maxHeight: "50vh", overflowY: "auto" }}>
          <h3 style={{ fontWeight: 700, fontSize: "14px", color: "#16a34a", margin: "0 0 12px" }}>❤️ Favorit Saya</h3>
          {favorites.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>Belum ada favorit. Klik ❤️ pada tempat wisata!</p>
          ) : (
            favorites.map((fav, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", backgroundColor: "#f9fafb", marginBottom: "6px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#1f2937", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{fav.name}</p>
                <div style={{ display: "flex", gap: "6px", marginLeft: "8px", flexShrink: 0 }}>
                  <button onClick={() => handleGoToFavorite(fav)} title="Pergi ke sini" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>🗺️</button>
                  <button
                    onClick={async () => {
                      await fetch("http://localhost:8000/api/favorites/" + fav.place_id, { method: "DELETE" });
                      setFavorites((prev) => prev.filter((f) => f.place_id !== fav.place_id));
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}
                  >✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ position: "absolute", top: "60px", left: "60px", zIndex: 1000, backgroundColor: "#fef2f2", color: "#ef4444", padding: "8px 14px", borderRadius: "10px", fontSize: "13px", maxWidth: "280px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Panel Rute */}
      {showRoutePanel && (
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 1000, backgroundColor: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", width: "280px", maxHeight: "85vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontWeight: 700, fontSize: "14px", color: "#16a34a", margin: 0 }}>🗺️ Rute Perjalanan</h3>
            <button onClick={handleClearRoute} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "12px" }}>Hapus Semua</button>
          </div>

          {routeSummary && (
            <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", padding: "10px 12px", marginBottom: "10px", display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#16a34a" }}>{routeSummary.distance} km</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>Jarak</div>
              </div>
              <div style={{ width: "1px", backgroundColor: "#d1fae5" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#16a34a" }}>{routeSummary.duration} menit</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>Estimasi</div>
              </div>
            </div>
          )}

          {position && (
            <div style={{ padding: "8px 10px", borderRadius: "8px", backgroundColor: "#f0fdf4", marginBottom: "6px", fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
              📍 Lokasi Kamu (Start)
            </div>
          )}

          {routeStops.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>Klik marker wisata lalu "Tambah ke Rute"</p>
          ) : (
            routeStops.map((stop, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", backgroundColor: "#f9fafb", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#16a34a", color: "white", fontSize: "11px", fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  <span style={{ fontSize: "12px", color: "#1f2937", maxWidth: "170px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stop.name}</span>
                </div>
                <button onClick={() => handleRemoveStop(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "14px" }}>✕</button>
              </div>
            ))
          )}

          {routeStops.length >= 1 && (
            <>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: "10px 0 6px" }}>Moda Transportasi:</p>
              <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                {modeList.map((m) => (
                  <button key={m.key} onClick={() => setRouteMode(m.key)}
                    style={{ flex: 1, padding: "6px 4px", borderRadius: "8px", border: "none", fontSize: "11px", fontWeight: 600, cursor: "pointer", backgroundColor: routeMode === m.key ? "#16a34a" : "#f3f4f6", color: routeMode === m.key ? "white" : "#4b5563" }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Tampilkan Rute */}
              <button onClick={handleShowRoute} disabled={routeLoading}
                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#16a34a", color: "white", fontWeight: 700, fontSize: "13px", cursor: routeLoading ? "not-allowed" : "pointer", opacity: routeLoading ? 0.7 : 1, marginBottom: "8px" }}
              >
                {routeLoading ? "Menghitung..." : "Tampilkan Rute"}
              </button>

              {/* Buka di Google Maps */}
              <button onClick={handleOpenGoogleMaps}
                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#1a73e8", color: "white", fontWeight: 700, fontSize: "13px", cursor: "pointer", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <span>🗺️</span> Buka di Google Maps
              </button>
            </>
          )}

          {showInstructions && routeInstructions.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#16a34a", marginBottom: "8px", borderTop: "1px solid #e5e7eb", paddingTop: "10px" }}>
                📋 Petunjuk Arah
              </div>
              {routeInstructions.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "6px 0", borderBottom: i < routeInstructions.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: "16px", flexShrink: 0, width: "20px", textAlign: "center", marginTop: "1px" }}>{getStepIcon(step.type)}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", color: "#1f2937", margin: 0, lineHeight: 1.4 }}>{step.instruction}</p>
                    {step.distance > 0 && (
                      <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>
                        {step.distance >= 1000 ? (step.distance / 1000).toFixed(1) + " km" : Math.round(step.distance) + " m"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Peta */}
      {position && (
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap position={position} />

          <Marker position={position} icon={userIcon}>
            <Popup><strong>Lokasi kamu</strong><br />{position[0].toFixed(6)}, {position[1].toFixed(6)}</Popup>
          </Marker>

          {places.map((place, i) => {
            if (!place.geometry?.coordinates) return null;
            const lat = place.geometry.coordinates[1];
            const lon = place.geometry.coordinates[0];
            if (!lat || !lon) return null;
            return (
              <Marker key={i} position={[lat, lon]} icon={placeIcon}
                eventHandlers={{ click: () => setSelectedPlace(place) }}
              />
            );
          })}

          {routeStops.map((stop, i) => (
            <Marker key={"stop-" + i} position={[stop.lat, stop.lon]} icon={stopIcon}>
              <Popup>{i + 1}. {stop.name}</Popup>
            </Marker>
          ))}

          {routePath && <Polyline positions={routePath} color="#16a34a" weight={5} opacity={0.8} />}
        </MapContainer>
      )}

      <LocateButton onLocate={handleLocate} />

      {/* Info Panel */}
      {selectedPlace && (
        <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", width: "min(420px, calc(100vw - 48px))", zIndex: 1000, borderTop: "4px solid #16a34a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h2 style={{ fontWeight: 700, fontSize: "16px", color: "#16a34a", marginBottom: "6px", flex: 1 }}>
              {selectedPlace.properties.name || "Tanpa Nama"}
            </h2>
            <button
              onClick={() => handleToggleFavorite(selectedPlace)}
              title={isFavorited(selectedPlace) ? "Hapus dari favorit" : "Tambah ke favorit"}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", marginLeft: "8px", flexShrink: 0 }}
            >
              {isFavorited(selectedPlace) ? "❤️" : "🤍"}
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px", lineHeight: 1.5 }}>
            {selectedPlace.properties.formatted}
          </p>
          {selectedPlace.properties.categories && (
            <p style={{ fontSize: "12px", color: "#22c55e", marginBottom: "8px" }}>
              {selectedPlace.properties.categories.join(", ")}
            </p>
          )}
          {selectedPlace.properties.website && (
            <a href={selectedPlace.properties.website} target="_blank" rel="noreferrer"
              style={{ fontSize: "13px", color: "#16a34a", display: "block", marginBottom: "10px", textDecoration: "none" }}
            >
              🌐 Kunjungi Website
            </a>
          )}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={() => handleAddToRoute(selectedPlace)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: "10px", border: "none", cursor: "pointer", backgroundColor: routeStops.some(s => s.lat === selectedPlace.geometry.coordinates[1] && s.lon === selectedPlace.geometry.coordinates[0]) ? "#d1fae5" : "#16a34a", color: routeStops.some(s => s.lat === selectedPlace.geometry.coordinates[1] && s.lon === selectedPlace.geometry.coordinates[0]) ? "#16a34a" : "white", fontWeight: 600, fontSize: "13px" }}
            >
              {routeStops.some(s => s.lat === selectedPlace.geometry.coordinates[1] && s.lon === selectedPlace.geometry.coordinates[0]) ? "✓ Sudah di Rute" : "+ Tambah ke Rute"}
            </button>
            <button
              onClick={() => setSelectedPlace(null)}
              style={{ padding: "8px 12px", borderRadius: "10px", border: "1.5px solid #e5e7eb", cursor: "pointer", backgroundColor: "white", color: "#6b7280", fontWeight: 500, fontSize: "13px" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}