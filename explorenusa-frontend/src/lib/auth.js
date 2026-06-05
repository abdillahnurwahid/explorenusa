const API_URL = 'http://127.0.0.1:8000/api'

// Register
export async function register(name, email, password, passwordConfirmation) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        }),
    })
    return res.json()
}

// Login
export async function login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    return res.json()
}

// Logout
export async function logout() {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

// Cek apakah sudah login
export function isLoggedIn() {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('token')
}

// Ambil data user
export function getUser() {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
}

// Ambil profil dari API
export async function getProfile() {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
    })
    return res.json()
}

// Update nama & email
export async function updateProfile(name, email) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/profile/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
    })
    return res.json()
}

// Upload avatar
export async function updateAvatar(file) {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await fetch(`${API_URL}/profile/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    })
    return res.json()
}

// Ganti password
export async function updatePassword(currentPassword, newPassword, newPasswordConfirmation) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/profile/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPasswordConfirmation,
        }),
    })
    return res.json()
}