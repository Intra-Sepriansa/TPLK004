<?php

use App\Models\Kas;
use App\Models\KasSummary;
use App\Models\Mahasiswa;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

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

test('admin can create one month of kas pertemuan for thursdays only', function () {
    $admin = User::factory()->create();

    $mahasiswaA = Mahasiswa::create([
        'nim' => '2210110101',
        'nama' => 'Mahasiswa Kamis A',
        'email' => 'kamis-a@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    $mahasiswaB = Mahasiswa::create([
        'nim' => '2210110102',
        'nama' => 'Mahasiswa Kamis B',
        'email' => 'kamis-b@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    $response = $this
        ->actingAs($admin)
        ->post('/admin/kas/create-pertemuan', [
            'month' => '2026-04',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $thursdayDates = [
        '2026-04-02',
        '2026-04-09',
        '2026-04-16',
        '2026-04-23',
        '2026-04-30',
    ];

    foreach ($thursdayDates as $date) {
        foreach ([$mahasiswaA, $mahasiswaB] as $mahasiswa) {
            $this->assertDatabaseHas('kas', [
                'mahasiswa_id' => $mahasiswa->id,
                'period_date' => $date,
                'status' => 'unpaid',
                'amount' => 5000,
            ]);
        }
    }

    $this->assertDatabaseCount('kas', 10);
    $this->assertDatabaseMissing('kas', [
        'period_date' => '2026-04-01',
    ]);
});

test('admin can create kas pertemuan for a month range', function () {
    $admin = User::factory()->create();

    $mahasiswaA = Mahasiswa::create([
        'nim' => '2210110201',
        'nama' => 'Mahasiswa Range A',
        'email' => 'range-a@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    $mahasiswaB = Mahasiswa::create([
        'nim' => '2210110202',
        'nama' => 'Mahasiswa Range B',
        'email' => 'range-b@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    $response = $this
        ->actingAs($admin)
        ->post('/admin/kas/create-pertemuan', [
            'start_month' => '2026-04',
            'end_month' => '2026-06',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $thursdayDates = [
        '2026-04-02',
        '2026-04-09',
        '2026-04-16',
        '2026-04-23',
        '2026-04-30',
        '2026-05-07',
        '2026-05-14',
        '2026-05-21',
        '2026-05-28',
        '2026-06-04',
        '2026-06-11',
        '2026-06-18',
        '2026-06-25',
    ];

    foreach ($thursdayDates as $date) {
        foreach ([$mahasiswaA, $mahasiswaB] as $mahasiswa) {
            $this->assertDatabaseHas('kas', [
                'mahasiswa_id' => $mahasiswa->id,
                'period_date' => $date,
                'status' => 'unpaid',
                'amount' => 5000,
            ]);
        }
    }

    $this->assertDatabaseCount('kas', 26);
    $this->assertDatabaseMissing('kas', [
        'period_date' => '2026-05-01',
    ]);
});

test('admin can view kas data for a month range', function () {
    $admin = User::factory()->create();

    $mahasiswa = Mahasiswa::create([
        'nim' => '2210110301',
        'nama' => 'Mahasiswa Periode',
        'email' => 'periode@example.com',
        'kelas' => 'TI-1A',
        'password' => bcrypt('password'),
    ]);

    foreach ([
        ['period_date' => '2026-03-26', 'status' => 'unpaid'],
        ['period_date' => '2026-04-09', 'status' => 'unpaid'],
        ['period_date' => '2026-06-04', 'status' => 'paid'],
    ] as $record) {
        Kas::create([
            'mahasiswa_id' => $mahasiswa->id,
            'type' => 'income',
            'amount' => 5000,
            'description' => 'Kas Mingguan',
            'category' => 'kas_mingguan',
            'period_date' => $record['period_date'],
            'status' => $record['status'],
            'created_by' => $admin->id,
        ]);
    }

    $response = $this
        ->actingAs($admin)
        ->get('/admin/kas?start_month=2026-04&end_month=2026-06');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/kas')
        ->where('filters.start_month', '2026-04')
        ->where('filters.end_month', '2026-06')
        ->has('mahasiswaList', 1)
        ->where('mahasiswaList.0.records.0.period_date', '2026-06-04')
        ->where('mahasiswaList.0.records.1.period_date', '2026-04-09')
        ->missing('mahasiswaList.0.records.2')
    );
});

test('admin cannot create kas pertemuan outside thursday', function () {
    $admin = User::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->post('/admin/kas/create-pertemuan', [
            'period_date' => '2026-04-03',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('period_date');

    $this->assertDatabaseCount('kas', 0);
});

test('admin cannot create kas pertemuan when month range is reversed', function () {
    $admin = User::factory()->create();

    $response = $this
        ->actingAs($admin)
        ->post('/admin/kas/create-pertemuan', [
            'start_month' => '2026-06',
            'end_month' => '2026-04',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('end_month');

    $this->assertDatabaseCount('kas', 0);
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
