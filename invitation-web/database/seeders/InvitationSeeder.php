<?php

namespace Database\Seeders;

use App\Models\Invitation;
use Illuminate\Database\Seeder;

class InvitationSeeder extends Seeder
{
    public function run(): void
    {
        Invitation::create([
            'passcode' => 'RAYHAN-AISYAH',
            'phone' => '081234567890',
            'slug' => 'rayhan-aisyah',
            'url' => 'https://bluevite.id/v/rayhan-aisyah',
            'bride' => 'dr. Aisyah Humaira, Sp.A',
            'groom' => 'Muhammad Rayhan, S.T',
            'event_date' => '2026-11-20 08:00:00',
            'event_date_formatted' => 'Minggu, 20 November 2026',
            'package' => 'Paket Premium Royal Suite',
            'active_until' => '20 November 2027',
        ]);

        Invitation::create([
            'passcode' => 'KEVIN-JESSICA',
            'phone' => '085712345678',
            'slug' => 'kevin-jessica',
            'url' => 'https://bluevite.id/v/kevin-jessica',
            'bride' => 'Jessica Clarissa, B.A',
            'groom' => 'Kevin Alexander, B.Eng',
            'event_date' => '2026-12-12 10:00:00',
            'event_date_formatted' => 'Sabtu, 12 Desember 2026',
            'package' => 'Paket Eksklusif Custom Domain',
            'active_until' => '12 Desember 2027',
        ]);
    }
}