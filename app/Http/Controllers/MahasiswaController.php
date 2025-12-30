<?php

namespace App\Http\Controllers;

use App\Models\Mahasiswa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MahasiswaController extends Controller
{
    public function export(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Nama', 'NIM', 'Tanggal']);

            Mahasiswa::orderBy('created_at')->chunk(200, function ($rows) use ($handle) {
                foreach ($rows as $student) {
                    $createdAt = $student->created_at;
                    if ($createdAt instanceof \DateTimeInterface) {
                        $createdAt = $createdAt->format('Y-m-d H:i:s');
                    }

                    fputcsv($handle, [
                        $student->nama,
                        $student->nim,
                        $createdAt,
                    ]);
                }
            });

            fclose($handle);
        }, 'mahasiswa.csv');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'nim' => ['required', 'string', 'max:20', 'unique:mahasiswa,nim'],
        ]);

        $suffix = substr($validated['nim'], -2);
        $defaultPassword = 'tplk004#' . $suffix;

        Mahasiswa::create([
            ...$validated,
            'password' => Hash::make($defaultPassword),
        ]);

        return back()->with('success', 'Mahasiswa ditambahkan.');
    }

    public function destroy(Mahasiswa $mahasiswa): RedirectResponse
    {
        $mahasiswa->delete();

        return back()->with('success', 'Mahasiswa dihapus.');
    }
}
