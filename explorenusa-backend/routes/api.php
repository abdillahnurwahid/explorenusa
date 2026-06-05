<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\SubscriberController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;

// === PUBLIC ROUTES ===
Route::get('/places', [PlaceController::class, 'index']);
Route::post('/subscribe', [SubscriberController::class, 'store']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// === PROTECTED ROUTES ===
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile/update', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);
});

// === GEOCODE & ROUTE ===
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