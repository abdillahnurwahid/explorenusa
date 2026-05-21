<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PlaceController extends Controller
{
public function index(Request $request)
{
    $lat = $request->lat;
    $lon = $request->lon;

    if (!$lat || !$lon) {
        return response()->json(['error' => 'lat/lon required'], 400);
    }

    $categoryMap = [
        'semua'    => 'tourism,tourism.sights,tourism.attraction,entertainment,leisure,natural,sport,catering',
        'wisata'   => 'tourism,tourism.sights,tourism.attraction',
        'hiburan'  => 'entertainment,leisure',
        'alam'     => 'natural',
        'olahraga' => 'sport',
        'kuliner'  => 'catering',
    ];

    $kategori = $request->kategori ?? 'semua';
    $categories = $categoryMap[$kategori] ?? $categoryMap['semua'];

    $apiKey = config('services.geoapify.key');

    $response = Http::get("https://api.geoapify.com/v2/places", [
        "categories" => $categories,
        "filter"     => "circle:{$lon},{$lat},20000",
        "limit"      => 50,
        "apiKey"     => $apiKey
    ]);

    return response()->json($response->json());
}}