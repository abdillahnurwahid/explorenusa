"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timeout = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setResults([]);
    if (timeout.current) clearTimeout(timeout.current);
    if (val.length < 3) return;
    timeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch("http://localhost:8000/api/geocode?q=" + encodeURIComponent(val));
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Geocode error:", err);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSelect = (result) => {
    sessionStorage.setItem("en_goto", JSON.stringify({ lat: result.lat, lon: result.lon, label: result.formatted }));
    router.push("/map");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (results.length > 0) handleSelect(results[0]);
    else if (query.trim()) router.push("/map");
  };

  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubStatus("loading");
    try {
      const res = await fetch("http://localhost:8000/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.status === 201) { setSubStatus("ok"); setEmail(""); }
      else if (res.status === 409) setSubStatus("exists");
      else setSubStatus("error");
    } catch { setSubStatus("error"); }
    setTimeout(() => setSubStatus(null), 4000);
  };

  const photos = [
    { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", alt: "Gunung Awan" },
    { src: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&q=80", alt: "Gunung Bromo" },
    { src: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&q=80", alt: "Pura Bali" },
    { src: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=400&q=80", alt: "Pantai Biru" },
    { src: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&q=80", alt: "Pulau Tropis" },
  ];

  const destinations = [
    { name: "Gunung Merbabu", loc: "Jawa Tengah, Indonesia", rating: "4.8", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80" },
    { name: "Nusa Penida",    loc: "Bali, Indonesia",        rating: "4.8", src: "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=80" },
    { name: "Gunung Fuji",    loc: "Jepang",                 rating: "4.8", src: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80" },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #fff; color: #1a1a1a; min-height: 100vh; }

        /* ── HERO ── */
        .en-hero {
          position: relative;
          height: calc(100vh - 60px);
          min-height: 560px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          padding: 40px 24px 80px;
        }
        .en-hero-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80');
          background-size: cover; background-position: center 40%;
        }
        .en-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.28) 0%,
            rgba(0,0,0,0.52) 55%,
            rgba(0,0,0,0.80) 100%
          );
        }
        .en-hero-inner {
          position: relative; z-index: 2;
          max-width: 720px; width: 100%;
          display: flex; flex-direction: column; align-items: center;
        }
        .en-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px; padding: 7px 18px;
          font-size: 13px; color: rgba(255,255,255,0.88);
          font-weight: 600; margin-bottom: 22px;
          letter-spacing: 0.02em;
        }
        .en-hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
          display: inline-block;
        }
        .en-hero h1 {
          font-size: clamp(34px, 5.5vw, 64px);
          font-weight: 900; line-height: 1.08;
          color: #fff; margin-bottom: 16px;
          letter-spacing: -0.03em;
        }
        .en-hero-accent {
          background: linear-gradient(90deg, #a3e635 0%, #4ade80 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .en-hero-sub {
          font-size: 16px; color: rgba(255,255,255,0.62);
          margin-bottom: 38px; line-height: 1.65;
          max-width: 440px;
        }
        .en-hero-scroll {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 2; color: rgba(255,255,255,0.4); font-size: 12px;
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(7px); }
        }

        /* SEARCH */
        .en-search-wrap { position: relative; width: 100%; max-width: 520px; }
        .en-search-form {
          display: flex; align-items: center;
          background: #fff; border-radius: 14px;
          padding: 7px 7px 7px 20px; gap: 10px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.30);
        }
        .en-search-icon { font-size: 17px; flex-shrink: 0; }
        .en-search-form input {
          flex: 1; border: none; outline: none;
          font-size: 15px; color: #222;
          background: transparent; font-family: inherit; padding: 5px 0;
        }
        .en-search-form input::placeholder { color: #bbb; }
        .en-search-btn {
          padding: 11px 26px; border-radius: 10px;
          background: #111; color: #fff;
          font-size: 14px; font-weight: 700; border: none; cursor: pointer;
          font-family: inherit; white-space: nowrap; transition: background .2s;
        }
        .en-search-btn:hover { background: #333; }
        .en-search-dropdown {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: #fff; border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15); overflow: hidden; z-index: 50;
          border: 1px solid #f0f0f0;
        }
        .en-search-item {
          display: block; width: 100%; padding: 12px 18px; text-align: left;
          border: none; border-top: 1px solid #f5f5f5;
          background: #fff; cursor: pointer; font-size: 13px;
          color: #222; font-family: inherit; transition: background .15s;
        }
        .en-search-item:first-child { border-top: none; }
        .en-search-item:hover { background: #f7f7f7; }
        .en-search-loading { padding: 12px 18px; font-size: 13px; color: #999; }

        /* ── STATS ── */
        .en-stats-wrap {
          display: flex; justify-content: center;
          background: #fff;
          padding: 0 24px;
        }
        .en-stats-row {
          display: flex;
          width: 100%; max-width: 860px;
          background: #fff;
          border-radius: 0 0 28px 28px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.10);
          overflow: hidden;
          position: relative; z-index: 10;
        }
        .en-stat-card {
          flex: 1; padding: 36px 24px; text-align: center;
          border-right: 1px solid #f0f0f0;
        }
        .en-stat-card:last-child { border-right: none; }
        .en-stat-val { font-size: 38px; font-weight: 900; color: #111; line-height: 1; }
        .en-stat-lbl { font-size: 11px; color: #bbb; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; }

        /* ── PLAN SECTION ── */
        .en-plan-section { background: #fff; padding: 100px 24px 80px; }
        .en-section-title {
          font-size: clamp(24px, 3.5vw, 36px); font-weight: 900;
          color: #111; text-align: center; margin-bottom: 56px;
          letter-spacing: -0.02em;
        }
        .en-photo-strip {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-bottom: 64px; padding: 20px 0;
        }
        .en-photo-item {
          border-radius: 20px; overflow: hidden; flex-shrink: 0;
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
          transition: transform .35s cubic-bezier(.34,1.56,.64,1); position: relative;
        }
        .en-photo-item:nth-child(1) { width: 112px; height: 224px; transform: rotate(-8deg) translateY(14px); z-index: 1; }
        .en-photo-item:nth-child(2) { width: 118px; height: 236px; transform: rotate(-4deg) translateY(6px); z-index: 2; }
        .en-photo-item:nth-child(3) { width: 126px; height: 254px; transform: rotate(0deg); z-index: 3; }
        .en-photo-item:nth-child(4) { width: 118px; height: 236px; transform: rotate(4deg) translateY(6px); z-index: 2; }
        .en-photo-item:nth-child(5) { width: 112px; height: 224px; transform: rotate(8deg) translateY(14px); z-index: 1; }
        .en-photo-item:hover { transform: rotate(0deg) translateY(-10px) scale(1.06) !important; z-index: 10 !important; }
        .en-feat-list { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; max-width: 900px; margin: 0 auto; }
        .en-feat-item { display: flex; align-items: flex-start; gap: 16px; }
        .en-feat-num {
          width: 34px; height: 34px; border-radius: 50%; background: #111; color: #fff;
          font-size: 13px; font-weight: 900; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px;
        }
        .en-feat-title { font-weight: 800; font-size: 15px; color: #111; margin-bottom: 8px; }
        .en-feat-desc { font-size: 13px; color: #888; line-height: 1.7; }

        /* ── POPULAR ── */
        .en-popular-section { background: #f6f6f6; padding: 96px 24px; }
        .en-dest-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; max-width: 980px; margin: 0 auto 40px; }
        .en-dest-card {
          border-radius: 22px; overflow: hidden; position: relative; height: 270px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.10); cursor: pointer;
          transition: transform .28s, box-shadow .28s;
        }
        .en-dest-card:hover { transform: translateY(-8px); box-shadow: 0 20px 48px rgba(0,0,0,0.18); }
        .en-dest-img-wrap { position: absolute; inset: 0; }
        .en-dest-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.08) 55%); }
        .en-dest-badge {
          position: absolute; top: 14px; right: 14px;
          background: rgba(0,0,0,0.50); backdrop-filter: blur(8px);
          color: #fff; border-radius: 9px; padding: 5px 11px;
          font-size: 12px; font-weight: 700;
        }
        .en-dest-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 18px 20px; }
        .en-dest-name { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.01em; }
        .en-dest-loc { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 5px; }
        .en-btn-detail {
          display: block; width: fit-content; margin: 0 auto;
          padding: 14px 44px; border-radius: 999px; background: #111; color: #fff;
          font-size: 14px; font-weight: 700; text-decoration: none;
          transition: background .2s, transform .2s;
        }
        .en-btn-detail:hover { background: #333; transform: translateY(-2px); }

        /* ── FOOTER CTA ── */
        .en-footer-cta { position: relative; overflow: hidden; padding: 100px 24px; background: #0d0d0d; text-align: center; }
        .en-footer-cta-bg { position: absolute; inset: 0; display: flex; }
        .en-footer-cta-bg img { flex: 1; object-fit: cover; height: 100%; width: 50%; opacity: 0.18; }
        .en-footer-cta-bg::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 20%, #0d0d0d 75%);
        }
        .en-footer-inner { position: relative; z-index: 2; max-width: 520px; margin: 0 auto; }
        .en-footer-brand { font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 18px; letter-spacing: -0.02em; }
        .en-footer-cta-title { font-size: clamp(24px, 4vw, 40px); font-weight: 900; color: #fff; margin-bottom: 12px; line-height: 1.15; letter-spacing: -0.02em; }
        .en-footer-cta-sub { font-size: 15px; color: rgba(255,255,255,0.45); margin-bottom: 32px; line-height: 1.65; }
        .en-email-bar {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px; padding: 8px 8px 8px 20px;
          gap: 10px; max-width: 440px; margin: 0 auto 10px;
          transition: border-color .2s;
        }
        .en-email-bar:focus-within { border-color: rgba(255,255,255,0.32); }
        .en-email-bar input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 14px; color: #fff; font-family: inherit; padding: 4px 0;
        }
        .en-email-bar input::placeholder { color: rgba(255,255,255,0.3); }
        .en-email-btn {
          padding: 10px 20px; border-radius: 10px;
          background: #fff; color: #111;
          font-size: 13px; font-weight: 700; border: none; cursor: pointer;
          transition: background .2s, transform .2s; font-family: inherit; white-space: nowrap;
          flex-shrink: 0;
        }
        .en-email-btn:hover:not(:disabled) { background: #e5e5e5; transform: translateY(-1px); }
        .en-email-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .en-sub-msg { font-size: 13px; margin-bottom: 32px; min-height: 22px; }
        .en-footer-links-row { display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; }
        .en-footer-links-row a { font-size: 13px; color: rgba(255,255,255,0.3); text-decoration: none; transition: color .2s; }
        .en-footer-links-row a:hover { color: rgba(255,255,255,0.75); }

        @media(max-width: 768px) {
          .en-feat-list { grid-template-columns: 1fr; }
          .en-dest-grid { grid-template-columns: 1fr; }
          .en-photo-item:nth-child(1), .en-photo-item:nth-child(5) { display: none; }
          .en-stats-row { max-width: 100%; border-radius: 0; }
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section className="en-hero">
        <div className="en-hero-bg" />
        <div className="en-hero-overlay" />
        <div className="en-hero-inner">
          <div className="en-hero-badge">
            <span className="en-hero-badge-dot" />
            Jelajahi Indonesia &amp; Dunia
          </div>
          <h1>
            Temukan Cerita Barumu<br />
            di <span className="en-hero-accent">Setiap Sudut</span> Dunia
          </h1>
          <p className="en-hero-sub">
            Jelajahi setiap sudut surga dunia yang tersembunyi bersama ExploreNusa
          </p>
          <div className="en-search-wrap">
            <form className="en-search-form" onSubmit={handleSearchSubmit}>
              <span className="en-search-icon">📍</span>
              <input
                type="text"
                placeholder="Mau pergi kemana?"
                value={query}
                onChange={handleInput}
                autoComplete="off"
              />
              <button type="submit" className="en-search-btn">Cari</button>
            </form>
            {(searching || results.length > 0) && (
              <div className="en-search-dropdown">
                {searching && <div className="en-search-loading">Mencari lokasi...</div>}
                {results.map((r, i) => (
                  <button key={i} className="en-search-item" onClick={() => handleSelect(r)}>
                    📍 {r.formatted}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="en-hero-scroll">▼</div>
      </section>

      {/* ── STATS ── */}
      <div className="en-stats-wrap">
        <div className="en-stats-row">
          {[
            { val: "7M+", lbl: "Total Pengguna" },
            { val: "7k+", lbl: "Total Tujuan" },
            { val: "4.8", lbl: "Rating" },
          ].map((s, i) => (
            <div className="en-stat-card" key={i}>
              <div className="en-stat-val">{s.val}</div>
              <div className="en-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLAN SECTION ── */}
      <section className="en-plan-section" id="tentang">
        <h2 className="en-section-title">Atur Perjalananmu Bersama Kami?</h2>
        <div className="en-photo-strip">
          {photos.map((p, i) => (
            <div className="en-photo-item" key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
        </div>
        <div className="en-feat-list">
          {[
            { num: "1", title: "Itinerary Perjalanan Fleksibel", desc: "Atur jadwal perjalanan sesuai kebutuhan tanpa ribet dan mudah disesuaikan kapan saja." },
            { num: "2", title: "Rekomendasi Destinasi Terbaik", desc: "Temukan tempat wisata, kuliner, dan aktivitas populer untuk pengalaman liburan terbaik." },
            { num: "3", title: "Panduan Perjalanan Lengkap",   desc: "Dapatkan informasi perjalanan, jadwal, dan tips penting dalam satu aplikasi praktis." },
          ].map((f, i) => (
            <div className="en-feat-item" key={i}>
              <div className="en-feat-num">{f.num}</div>
              <div>
                <div className="en-feat-title">{f.title}</div>
                <p className="en-feat-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR DESTINATIONS ── */}
      <section className="en-popular-section">
        <h2 className="en-section-title">Destinasi Terpopuler Minggu Ini</h2>
        <div className="en-dest-grid">
          {destinations.map((d, i) => (
            <div className="en-dest-card" key={i}>
              <div className="en-dest-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.src} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div className="en-dest-overlay" />
              <div className="en-dest-badge">⭐ {d.rating}</div>
              <div className="en-dest-info">
                <div className="en-dest-name">{d.name}</div>
                <div className="en-dest-loc">📍 {d.loc}</div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/map" className="en-btn-detail">Lihat Detail</Link>
      </section>

      {/* ── FOOTER CTA ── */}
      <footer className="en-footer-cta">
        <div className="en-footer-cta-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800&q=80" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80" alt="" />
        </div>
        <div className="en-footer-inner">
          <div className="en-footer-brand">ExploreNusa</div>
          <h2 className="en-footer-cta-title">Rencanakan Liburanmu Lebih Mudah</h2>
          <p className="en-footer-cta-sub">Dapatkan inspirasi destinasi, rekomendasi perjalanan, dan update terbaru langsung di email kamu</p>
          <form className="en-email-bar" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Masukkan email kamu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subStatus === "loading"}
            />
            <button type="submit" className="en-email-btn" disabled={subStatus === "loading"}>
              {subStatus === "loading" ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>
          <p className="en-sub-msg">
            {subStatus === "ok"     && <span style={{ color: "#4ade80" }}>✅ Berhasil! Email kamu sudah terdaftar.</span>}
            {subStatus === "exists" && <span style={{ color: "#fbbf24" }}>⚠️ Email ini sudah terdaftar sebelumnya.</span>}
            {subStatus === "error"  && <span style={{ color: "#f87171" }}>❌ Gagal mendaftar. Coba lagi ya.</span>}
          </p>
          <div className="en-footer-links-row">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Beranda</a>
            <a href="#tentang" onClick={(e) => { e.preventDefault(); document.getElementById("tentang")?.scrollIntoView({ behavior: "smooth" }); }}>Tentang Kami</a>
            <Link href="/map">Wisata</Link>
          </div>
        </div>
      </footer>
    </>
  );
}