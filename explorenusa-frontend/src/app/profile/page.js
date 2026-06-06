'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, getProfile, updateProfile, updateAvatar, updatePassword } from '@/lib/auth'

export default function ProfilePage() {
    const router = useRouter()
    const fileInputRef = useRef(null)

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Form states
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
    const [passForm, setPassForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })

    // Feedback states
    const [editMsg, setEditMsg] = useState({ type: '', text: '' })
    const [passMsg, setPassMsg] = useState({ type: '', text: '' })
    const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' })

    const [editLoading, setEditLoading] = useState(false)
    const [passLoading, setPassLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    useEffect(() => {
        if (!isLoggedIn()) { router.push('/login'); return }
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        const data = await getProfile()
        setProfile(data)
        setEditForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' })
        setLoading(false)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true); setEditMsg({ type: '', text: '' })
        const res = await updateProfile(editForm.name, editForm.email, editForm.phone)
        if (res.message === 'Profil berhasil diperbarui') {
            setProfile(prev => ({ ...prev, name: res.user.name, email: res.user.email, phone: res.user.phone }))
            localStorage.setItem('user', JSON.stringify({
                ...JSON.parse(localStorage.getItem('user')),
                name: res.user.name,
                email: res.user.email,
                phone: res.user.phone,
            }))
            setEditMsg({ type: 'success', text: 'Profil berhasil diperbarui!' })
        } else {
            const errMsg = res.errors ? Object.values(res.errors).flat().join(', ') : res.message || 'Gagal memperbarui profil'
            setEditMsg({ type: 'error', text: errMsg })
        }
        setEditLoading(false)
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setAvatarLoading(true); setAvatarMsg({ type: '', text: '' })
        const res = await updateAvatar(file)
        if (res.avatar_url) {
            setProfile(prev => ({ ...prev, avatar_url: res.avatar_url }))
            setAvatarMsg({ type: 'success', text: 'Foto profil berhasil diperbarui!' })
        } else {
            const errMsg = res.errors ? Object.values(res.errors).flat().join(', ') : res.message || 'Gagal upload foto'
            setAvatarMsg({ type: 'error', text: errMsg })
        }
        setAvatarLoading(false)
    }

    const handlePassSubmit = async (e) => {
        e.preventDefault()
        setPassLoading(true); setPassMsg({ type: '', text: '' })
        const res = await updatePassword(passForm.current_password, passForm.new_password, passForm.new_password_confirmation)
        if (res.message === 'Password berhasil diperbarui') {
            setPassMsg({ type: 'success', text: 'Password berhasil diperbarui!' })
            setPassForm({ current_password: '', new_password: '', new_password_confirmation: '' })
        } else {
            const errMsg = res.errors ? Object.values(res.errors).flat().join(', ') : res.message || 'Gagal mengganti password'
            setPassMsg({ type: 'error', text: errMsg })
        }
        setPassLoading(false)
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#999', fontSize: 14 }}>Memuat profil...</p>
        </div>
    )

    const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <>
            <style>{`
                .pf-page { min-height: 100vh; background: #f5f5f5; padding: 40px 24px; }
                .pf-container { max-width: 680px; margin: 0 auto; }
                .pf-back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #999; text-decoration: none; margin-bottom: 28px; transition: color .2s; }
                .pf-back:hover { color: #111; }
                .pf-header { background: #fff; border-radius: 16px; padding: 32px; margin-bottom: 16px; display: flex; align-items: center; gap: 24px; border: 1px solid #eee; }
                .pf-avatar-wrap { position: relative; flex-shrink: 0; }
                .pf-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: #111; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; overflow: hidden; }
                .pf-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .pf-avatar-btn { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; background: #111; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; transition: background .2s; }
                .pf-avatar-btn:hover { background: #333; }
                .pf-avatar-loading { position: absolute; inset: 0; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; }
                .pf-header-info h1 { font-size: 20px; font-weight: 800; color: #111; margin-bottom: 4px; }
                .pf-header-info p { font-size: 13px; color: #999; margin: 0; }
                .pf-header-info .pf-phone { font-size: 13px; color: #bbb; margin-top: 2px; }
                .pf-card { background: #fff; border-radius: 16px; padding: 28px 32px; margin-bottom: 16px; border: 1px solid #eee; }
                .pf-card-title { font-size: 15px; font-weight: 800; color: #111; margin-bottom: 20px; }
                .pf-label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 6px; }
                .pf-input { width: 100%; padding: 11px 14px; border-radius: 10px; border: 1.5px solid #e5e5e5; background: #fafafa; font-size: 14px; color: #111; outline: none; margin-bottom: 14px; transition: border-color .2s; font-family: inherit; box-sizing: border-box; }
                .pf-input:focus { border-color: #111; background: #fff; }
                .pf-btn { padding: 11px 24px; border-radius: 999px; background: #111; color: #fff; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .2s, transform .15s; font-family: inherit; }
                .pf-btn:hover:not(:disabled) { background: #333; transform: translateY(-1px); }
                .pf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .pf-msg { padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
                .pf-msg.success { background: #f0fdf4; color: #16a34a; }
                .pf-msg.error { background: #fef2f2; color: #dc2626; }
                @media(max-width: 640px) {
                    .pf-header { flex-direction: column; text-align: center; }
                    .pf-card { padding: 20px; }
                }
            `}</style>

            <div className="pf-page">
                <div className="pf-container">
                    <Link href="/" className="pf-back">← Kembali ke Beranda</Link>

                    {/* Header Profil */}
                    <div className="pf-header">
                        <div className="pf-avatar-wrap">
                            <div className="pf-avatar">
                                {profile?.avatar_url
                                    ? <img src={profile.avatar_url} alt="avatar" />
                                    : initials
                                }
                                {avatarLoading && <div className="pf-avatar-loading">...</div>}
                            </div>
                            <div className="pf-avatar-btn" onClick={() => fileInputRef.current?.click()} title="Ganti foto">
                                ✏️
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpg,image/jpeg,image/png,image/webp"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="pf-header-info">
                            <h1>{profile?.name}</h1>
                            <p>{profile?.email}</p>
                            {profile?.phone && <p className="pf-phone">📞 {profile.phone}</p>}
                        </div>
                    </div>

                    {avatarMsg.text && <div className={`pf-msg ${avatarMsg.type}`}>{avatarMsg.text}</div>}

                    {/* Edit Nama, Email & Phone */}
                    <div className="pf-card">
                        <div className="pf-card-title">Edit Profil</div>
                        {editMsg.text && <div className={`pf-msg ${editMsg.type}`}>{editMsg.text}</div>}
                        <form onSubmit={handleEditSubmit}>
                            <label className="pf-label">Nama</label>
                            <input className="pf-input" type="text" required
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                            <label className="pf-label">Email</label>
                            <input className="pf-input" type="email" required
                                value={editForm.email}
                                onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                            <label className="pf-label">Nomor HP</label>
                            <input className="pf-input" type="tel" placeholder="08xxxxxxxxxx"
                                value={editForm.phone}
                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                            <button className="pf-btn" type="submit" disabled={editLoading}>
                                {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </form>
                    </div>

                    {/* Ganti Password */}
                    <div className="pf-card">
                        <div className="pf-card-title">Ganti Password</div>
                        {passMsg.text && <div className={`pf-msg ${passMsg.type}`}>{passMsg.text}</div>}
                        <form onSubmit={handlePassSubmit}>
                            <label className="pf-label">Password Lama</label>
                            <input className="pf-input" type="password" required placeholder="••••••••"
                                value={passForm.current_password}
                                onChange={e => setPassForm({ ...passForm, current_password: e.target.value })} />
                            <label className="pf-label">Password Baru</label>
                            <input className="pf-input" type="password" required placeholder="Min. 8 karakter"
                                value={passForm.new_password}
                                onChange={e => setPassForm({ ...passForm, new_password: e.target.value })} />
                            <label className="pf-label">Konfirmasi Password Baru</label>
                            <input className="pf-input" type="password" required placeholder="••••••••"
                                value={passForm.new_password_confirmation}
                                onChange={e => setPassForm({ ...passForm, new_password_confirmation: e.target.value })} />
                            <button className="pf-btn" type="submit" disabled={passLoading}>
                                {passLoading ? 'Memproses...' : 'Ganti Password'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </>
    )
}