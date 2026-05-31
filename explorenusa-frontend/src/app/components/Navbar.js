"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isMap = pathname === "/map";

  return (
    <>
      <style>{`
        .en-navbar {
          position: sticky; top: 0; left: 0; right: 0; z-index: 2000;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px;
          background: #ffffff;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          height: 60px;
        }
        .en-nb-logo {
          font-weight: 900; font-size: 18px; color: #111;
          text-decoration: none; white-space: nowrap;
        }
        .en-nb-links {
          display: flex; align-items: center; gap: 36px;
        }
        .en-nb-link {
          font-size: 14px; text-decoration: none;
          font-weight: 500; transition: color .2s; white-space: nowrap;
        }
        .en-nb-link-active  { color: #111; font-weight: 700; }
        .en-nb-link-inactive { color: #666; }
        .en-nb-link-inactive:hover { color: #111; }
        .en-nb-btn {
          padding: 10px 20px; border-radius: 999px;
          background: #111; color: #fff;
          font-size: 13px; font-weight: 700; text-decoration: none;
          transition: background .2s, transform .2s;
          display: inline-block; white-space: nowrap;
          line-height: 1;
        }
        .en-nb-btn:hover { background: #333; transform: translateY(-1px); }
        @media(max-width: 640px) {
          .en-nb-links { display: none; }
          .en-navbar { padding: 12px 20px; }
        }
      `}</style>

      <nav className="en-navbar">
        <Link href="/" className="en-nb-logo">
          ExploreNusa
        </Link>
        <div className="en-nb-links">
          <Link
            href="/"
            className={"en-nb-link " + (!isMap ? "en-nb-link-active" : "en-nb-link-inactive")}
          >
            Beranda
          </Link>
          <Link
            href="/#tentang"
            className="en-nb-link en-nb-link-inactive"
          >
            Tentang Kami
          </Link>
          <Link
            href="/map"
            className={"en-nb-link " + (isMap ? "en-nb-link-active" : "en-nb-link-inactive")}
          >
            Wisata
          </Link>
          <Link href="/map" className="en-nb-btn">
            Atur Perjalananmu
          </Link>
        </div>
      </nav>
    </>
  );
}