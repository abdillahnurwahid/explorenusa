'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, register } from '@/lib/auth'

const slides = [
  {
    src: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=900&q=80',
    label: 'Gunung Bromo',
    loc: 'Jawa Timur, Indonesia',
  },
  {
    src: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=900&q=80',
    label: 'Nusa Penida',
    loc: 'Bali, Indonesia',
  },
  {
    src: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=900&q=80',
    label: 'Pura Tanah Lot',
    loc: 'Bali, Indonesia',
  },
  {
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
    label: 'Pegunungan Awan',
    loc: 'Sumatera, Indonesia',
  },
]

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)
  const [fading, setFading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })

  // Auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setSlideIdx(prev => (prev + 1) % slides.length)
        setFading(false)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await login(loginForm.email, loginForm.password)
    if (res.token) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      router.push('/')
    } else {
      setError(res.message || 'Login gagal')
    }
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await register(regForm.name, regForm.email, regForm.password, regForm.password_confirmation)
    if (res.token) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      router.push('/')
    } else {
      const msg = res.errors ? Object.values(res.errors).flat().join(', ') : res.message || 'Gagal'
      setError(msg)
    }
    setLoading(false)
  }

  const currentSlide = slides[slideIdx]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }

        /* ── KIRI ── */
        .auth-left {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 36px;
        }
        .auth-left-img {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          transition: opacity 0.6s ease;
        }
        .auth-left-img.fading { opacity: 0; }
        .auth-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%);
        }
        .auth-left-top { position: relative; z-index: 2; }
        .auth-left-brand { font-size: 18px; font-weight: 900; color: #fff; text-decoration: none; }
        .auth-left-bottom { position: relative; z-index: 2; }
        .auth-slide-info {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px; padding: 16px 20px;
          margin-bottom: 16px;
        }
        .auth-slide-name { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .auth-slide-loc { font-size: 12px; color: rgba(255,255,255,0.65); }
        .auth-slide-dots { display: flex; gap: 6px; }
        .auth-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.35); cursor: pointer;
          transition: background .3s, width .3s; border: none; padding: 0;
        }
        .auth-dot.active { background: #fff; width: 20px; border-radius: 3px; }

        /* ── KANAN ── */
        .auth-right {
          background: #fafafa;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px; overflow-y: auto;
        }
        .auth-card { width: 100%; max-width: 380px; }
        .auth-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: #999; text-decoration: none;
          margin-bottom: 28px; transition: color .2s;
        }
        .auth-back:hover { color: #111; }
        .auth-tabs {
          display: flex; background: #efefef;
          border-radius: 12px; padding: 4px; margin-bottom: 28px;
        }
        .auth-tab {
          flex: 1; padding: 9px; border-radius: 9px; border: none;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all .2s; font-family: inherit;
        }
        .auth-tab.active { background: #111; color: #fff; }
        .auth-tab.inactive { background: transparent; color: #888; }
        .auth-heading { font-size: 24px; font-weight: 900; color: #111; margin-bottom: 4px; letter-spacing: -0.02em; }
        .auth-subhead { font-size: 13px; color: #aaa; margin-bottom: 24px; }
        .auth-label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; }
        .auth-input {
          width: 100%; padding: 11px 14px; border-radius: 10px;
          border: 1.5px solid #e5e5e5; background: #fff;
          font-size: 14px; color: #111; outline: none;
          margin-bottom: 14px; transition: border-color .2s;
          font-family: inherit;
        }
        .auth-input:focus { border-color: #111; }
        .auth-btn {
          width: 100%; padding: 12px; border-radius: 999px;
          background: #111; color: #fff; border: none;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: background .2s, transform .15s;
          font-family: inherit; margin-top: 4px;
        }
        .auth-btn:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-error {
          background: #fef2f2; color: #dc2626;
          border-radius: 10px; padding: 10px 14px;
          font-size: 13px; margin-bottom: 16px;
        }

        @media(max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 32px 24px; align-items: flex-start; padding-top: 48px; }
        }
      `}</style>

      <div className="auth-page">
        {/* ── KIRI: Slideshow ── */}
        <div className="auth-left">
          <div
            className={`auth-left-img ${fading ? 'fading' : ''}`}
            style={{ backgroundImage: `url('${currentSlide.src}')` }}
          />
          <div className="auth-left-overlay" />

          <div className="auth-left-top">
            <Link href="/" className="auth-left-brand">ExploreNusa</Link>
          </div>

          <div className="auth-left-bottom">
            <div className="auth-slide-info">
              <div className="auth-slide-name">📍 {currentSlide.label}</div>
              <div className="auth-slide-loc">{currentSlide.loc}</div>
            </div>
            <div className="auth-slide-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`auth-dot ${i === slideIdx ? 'active' : ''}`}
                  onClick={() => { setFading(true); setTimeout(() => { setSlideIdx(i); setFading(false) }, 300) }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── KANAN: Form ── */}
        <div className="auth-right">
          <div className="auth-card">
            <Link href="/" className="auth-back">← Kembali ke Beranda</Link>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${tab === 'login' ? 'active' : 'inactive'}`}
                onClick={() => { setTab('login'); setError('') }}
              >
                Masuk
              </button>
              <button
                className={`auth-tab ${tab === 'register' ? 'active' : 'inactive'}`}
                onClick={() => { setTab('register'); setError('') }}
              >
                Daftar
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            {tab === 'login' ? (
              <>
                <div className="auth-heading">Selamat datang 👋</div>
                <div className="auth-subhead">Masuk ke akun ExploreNusa kamu</div>
                <form onSubmit={handleLogin}>
                  <label className="auth-label">Email</label>
                  <input className="auth-input" type="email" placeholder="kamu@email.com" required
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                  <label className="auth-label">Password</label>
                  <input className="auth-input" type="password" placeholder="••••••••" required
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Memproses...' : 'Masuk'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="auth-heading">Buat akun ✨</div>
                <div className="auth-subhead">Bergabung dan mulai jelajahi nusantara</div>
                <form onSubmit={handleRegister}>
                  <label className="auth-label">Nama lengkap</label>
                  <input className="auth-input" type="text" placeholder="John Doe" required
                    value={regForm.name}
                    onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
                  <label className="auth-label">Email</label>
                  <input className="auth-input" type="email" placeholder="kamu@email.com" required
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                  <label className="auth-label">Password</label>
                  <input className="auth-input" type="password" placeholder="Min. 8 karakter" required
                    value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
                  <label className="auth-label">Konfirmasi password</label>
                  <input className="auth-input" type="password" placeholder="••••••••" required
                    value={regForm.password_confirmation}
                    onChange={e => setRegForm({ ...regForm, password_confirmation: e.target.value })} />
                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Memproses...' : 'Daftar Sekarang'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}