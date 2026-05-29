<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class SubscriberController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Format email tidak valid.',
            ], 422);
        }

        $email = strtolower(trim($request->email));

        if (DB::table('subscribers')->where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Email ini sudah terdaftar sebelumnya.',
            ], 409);
        }

        DB::table('subscribers')->insert([
            'email'      => $email,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Kirim email konfirmasi ke subscriber
        try {
            Mail::html($this->buildEmailHtml($email), function ($message) use ($email) {
                $message->to($email)
                        ->subject('🌍 Selamat datang di ExploreNusa!')
                        ->from(
                            config('mail.from.address', 'hello@explorenusa.id'),
                            config('mail.from.name', 'ExploreNusa')
                        );
            });
        } catch (\Exception $e) {
            // Tetap return sukses meski email gagal terkirim
            \Log::warning('Subscribe email gagal terkirim: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil! Email kamu sudah terdaftar.',
        ], 201);
    }

    private function buildEmailHtml(string $email): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Datang di ExploreNusa</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111;padding:40px 40px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.02em;">ExploreNusa</p>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Temukan Cerita Barumu di Setiap Sudut Dunia</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:900;color:#111;line-height:1.2;">
                Halo! Kamu resmi terdaftar 🎉
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#666;line-height:1.7;">
                Terima kasih sudah bergabung dengan komunitas ExploreNusa. Kamu akan mendapatkan:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:20px;">🗺️</span>
                    <span style="font-size:14px;color:#333;font-weight:600;margin-left:12px;">Rekomendasi destinasi terpopuler mingguan</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:20px;">✈️</span>
                    <span style="font-size:14px;color:#333;font-weight:600;margin-left:12px;">Tips perjalanan dan itinerary eksklusif</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <span style="font-size:20px;">🔔</span>
                    <span style="font-size:14px;color:#333;font-weight:600;margin-left:12px;">Update fitur terbaru ExploreNusa</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="http://localhost:3000"
                 style="display:inline-block;padding:14px 40px;background:#111;color:#fff;
                        text-decoration:none;border-radius:999px;font-size:14px;
                        font-weight:700;letter-spacing:0.01em;">
                Mulai Jelajahi Sekarang →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#bbb;line-height:1.6;">
                Email ini dikirim ke <strong>{$email}</strong> karena kamu mendaftar di ExploreNusa.<br>
                Jika ini bukan kamu, abaikan email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }
}