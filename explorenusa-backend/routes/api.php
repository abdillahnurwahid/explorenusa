<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\FavoriteController;
use Illuminate\Support\Facades\Http;

Route::get('/places', [PlaceController::class, 'index']);
Route::get('/favorites', [FavoriteController::class, 'index']);
Route::post('/favorites', [FavoriteController::class, 'store']);
Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);

Route::get('/geocode', function (Illuminate\Http\Request $request) {
    $q = $request->q;
    $apiKey = config('services.geoapify.key');

    $response = Http::get("https://api.geoapify.com/v1/geocode/search", [
        'text'   => $q,
        'lang'   => 'id',
        'limit'  => 5,
        'apiKey' => $apiKey,
    ]);

    $features = $response->json()['features'] ?? [];

    $results = array_map(function ($f) {
        return [
            'formatted' => $f['properties']['formatted'] ?? '',
            'lat'       => $f['properties']['lat'] ?? null,
            'lon'       => $f['properties']['lon'] ?? null,
        ];
    }, $features);

    return response()->json(['results' => $results]);
});

Route::post('/route', function (Illuminate\Http\Request $request) {
    $waypoints = $request->waypoints;
    $mode = $request->mode ?? 'driving-car';

    $apiKey = config('services.ors.key');

    $response = Http::withHeaders([
        'Authorization' => $apiKey,
        'Content-Type'  => 'application/json',
    ])->post("https://api.openrouteservice.org/v2/directions/{$mode}/geojson", [
        'coordinates' => $waypoints,
    ]);

    return response()->json($response->json());
});