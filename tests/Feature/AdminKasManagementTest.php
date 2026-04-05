<?php

use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\Mahasiswa;
use App\Models\User;

test('admin can mark kas as paid with transfer metadata', function () {
    $admin = User::factory()->create();

    $mahasiswa = Mahasiswa::create([
        'nim' => '2210110001',
        'nama' => 'Mahasiswa Kas',
        'email' => 'kas@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    $response = $this
        ->actingAs($admin)
        ->post('/admin/kas/mark-paid', [
            'mahasiswa_id' => $mahasiswa->id,
            'period_date' => '2026-04-02',
            'payment_method' => 'transfer',
            'payment_reference' => 'BCA 1234567890',
            'payment_note' => 'Transfer mobile banking',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('kas', [
        'mahasiswa_id' => $mahasiswa->id,
        'period_date' => '2026-04-02',
        'status' => 'paid',
        'payment_method' => 'transfer',
        'payment_reference' => 'BCA 1234567890',
        'payment_note' => 'Transfer mobile banking',
    ]);

    expect(Kas::first()?->paid_at)->not->toBeNull();
});

test('admin can delete a kas pertemuan batch by date', function () {
    $admin = User::factory()->create();

    $mahasiswaA = Mahasiswa::create([
        'nim' => '2210110002',
        'nama' => 'Mahasiswa A',
        'email' => 'mahasiswa-a@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    $mahasiswaB = Mahasiswa::create([
        'nim' => '2210110003',
        'nama' => 'Mahasiswa B',
        'email' => 'mahasiswa-b@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    Kas::create([
        'mahasiswa_id' => $mahasiswaA->id,
        'type' => 'income',
        'amount' => 5000,
        'description' => 'Kas Mingguan',
        'category' => 'kas_mingguan',
        'period_date' => '2026-04-09',
        'status' => 'unpaid',
        'created_by' => $admin->id,
    ]);

    Kas::create([
        'mahasiswa_id' => $mahasiswaB->id,
        'type' => 'income',
        'amount' => 5000,
        'description' => 'Kas Mingguan',
        'category' => 'kas_mingguan',
        'period_date' => '2026-04-09',
        'status' => 'paid',
        'payment_method' => 'cash',
        'paid_at' => now(),
        'created_by' => $admin->id,
    ]);

    Kas::create([
        'mahasiswa_id' => $mahasiswaA->id,
        'type' => 'income',
        'amount' => 5000,
        'description' => 'Kas Mingguan',
        'category' => 'kas_mingguan',
        'period_date' => '2026-04-16',
        'status' => 'unpaid',
        'created_by' => $admin->id,
    ]);

    KasSummary::recalculate();

    $response = $this
        ->actingAs($admin)
        ->delete('/admin/kas/pertemuan', [
            'period_date' => '2026-04-09',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseMissing('kas', [
        'period_date' => '2026-04-09',
    ]);

    $this->assertDatabaseHas('kas', [
        'period_date' => '2026-04-16',
    ]);
});
