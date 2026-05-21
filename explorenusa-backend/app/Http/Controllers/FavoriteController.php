<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorite;

class FavoriteController extends Controller
{
    // Ambil semua favorites
    public function index()
    {
        return response()->json(Favorite::all());
    }

    // Simpan favorite baru
    public function store(Request $request)
    {
        $existing = Favorite::where('place_id', $request->place_id)->first();
        if ($existing) {
            return response()->json(['message' => 'Sudah ada di favorit'], 200);
        }

        $favorite = Favorite::create([
            'place_id' => $request->place_id,
            'name'     => $request->name,
            'lat'      => $request->lat,
            'lon'      => $request->lon,
        ]);

        return response()->json($favorite, 201);
    }

    // Hapus favorite
    public function destroy($id)
    {
        Favorite::where('place_id', $id)->delete();
        return response()->json(['message' => 'Dihapus dari favorit']);
    }
}