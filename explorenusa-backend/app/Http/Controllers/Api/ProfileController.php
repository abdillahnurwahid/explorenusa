<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    // GET /api/profile
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url ? asset('storage/'.$user->avatar_url) : null,
            'avatar' => $user->avatar_url ? asset('storage/'.$user->avatar_url) : null,
            'created_at' => $user->created_at,
        ]);
    }

    // PUT /api/profile/update
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url
                    ? asset('storage/'.$user->avatar_url)
                    : null,
            ],
        ]);
    }

    // POST /api/profile/avatar
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();

        $file = $request->file('avatar') ?? $request->file('image') ?? $request->file('photo');

        if (! $file) {
            return response()->json(['message' => 'Tidak ada file foto yang terdeteksi'], 400);
        }

        if ($user->avatar_url) {
            Storage::disk('public')->delete($user->avatar_url);
        }

        $path = $file->store('avatars', 'public');
        $user->update(['avatar_url' => $path]);

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui',
            'avatar_url' => asset('storage/'.$path),
            'avatar'     => asset('storage/' . $path),
        ]);
    }

    // PUT /api/profile/password
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password berhasil diperbarui',
        ]);
    }
}
