<?php

namespace App\Services;

use App\Models\ImportLog;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Dosen;
use App\Models\Schedule;
use App\Models\Course;

class ImportService
{
    public function generateTemplate(string $type): array
    {
        return match($type) {
            'mahasiswa' => [
                'columns' => ['nim', 'nama', 'email', 'no_hp', 'kelas', 'fakultas', 'prodi', 'semester', 'angkatan'],
                'sample' => $this->getMahasiswaSample(),
            ],
            'dosen' => [
                'columns' => ['nidn', 'nama', 'email', 'no_hp', 'fakultas', 'jabatan_fungsional', 'pendidikan_terakhir'],
                'sample' => $this->getDosenSample(),
            ],
            'mata_kuliah' => [
                'columns' => ['kode_mk', 'nama_mk', 'sks', 'semester', 'sifat', 'prasyarat'],
                'sample' => $this->getMataKuliahSample(),
            ],
            'jadwal' => [
                'columns' => ['kode_mk', 'nidn_dosen', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan', 'kelas', 'semester_aktif'],
                'sample' => $this->getJadwalSample(),
            ],
            default => [],
        };
    }

    private function getMahasiswaSample(): array
    {
        $latest = Mahasiswa::latest()->first();
        if ($latest) {
            return [[
                $latest->nim,
                $latest->nama,
                $latest->email ?? 'email@student.unpam.ac.id',
                $latest->no_hp ?? '081234567890',
                $latest->kelas ?? '01TPLP001',
                $latest->fakultas ?? 'Ilmu Komputer',
                $latest->prodi ?? 'Teknik Informatika',
                (string) ($latest->semester ?? '1'),
                (string) ($latest->angkatan ?? date('Y')),
            ]];
        }
        return [['2024001', 'M. Rizki', 'rizki@student.unpam.ac.id', '081234567890', '04TPLP001', 'Ilmu Komputer', 'Teknik Informatika', '4', '2022']];
    }

    private function getDosenSample(): array
    {
        $latest = Dosen::latest()->first();
        if ($latest) {
            return [[
                $latest->nidn,
                $latest->nama,
                $latest->email ?? 'dosen@unpam.ac.id',
                $latest->no_hp ?? '081298765432',
                $latest->fakultas ?? 'Ilmu Komputer',
                'Lektor',
                'S2'
            ]];
        }
        return [['0420018801', 'Dr. Budi Santoso, M.Kom', 'budi@dosen.unpam.ac.id', '081298765432', 'Ilmu Komputer', 'Lektor Kepala', 'S3']];
    }

    private function getMataKuliahSample(): array
    {
        // Try getting from MataKuliah model first, else Course model
        $latest = MataKuliah::latest()->first();
        if ($latest) {
            return [[
                $latest->kode,
                $latest->nama,
                (string) $latest->sks,
                (string) ($latest->semester ?? 1),
                'Wajib',
                '-'
            ]];
        }
        
        // Fallback to Course model if exists
        $latestCourse = Course::latest()->first();
        if ($latestCourse) {
             return [[
                $latestCourse->code,
                $latestCourse->name,
                '3',
                '1',
                'Wajib',
                '-'
            ]];
        }

        return [['TPL001', 'Pemrograman Web 1', '3', '3', 'Wajib', '-']];
    }

    private function getJadwalSample(): array
    {
        $latest = Schedule::latest()->first();
        if ($latest) {
            $courseCode = $latest->course ? $latest->course->code : 'TPL001';
            $dosenNidn = $latest->dosen ? $latest->dosen->nidn : '0420018801';
            
            return [[
                $courseCode,
                $dosenNidn,
                $latest->hari,
                $latest->jam_mulai,
                $latest->jam_selesai,
                $latest->ruangan,
                '04TPLP001', // Kelas usually linked to schedule but simplified here
                $latest->semester ?? 'Ganjil 2024/2025'
            ]];
        }
        return [['TPL001', '0420018801', 'Senin', '08:00:00', '10:30:00', 'V.301', '04TPLP001', 'Ganjil 2024/2025']];
    }

    public function previewImport(UploadedFile $file, string $type): array
    {
        $content = file_get_contents($file->getRealPath());
        $lines = array_filter(explode("\n", $content));
        
        if (count($lines) < 2) {
            throw new \Exception('File harus memiliki minimal 1 baris header dan 1 baris data');
        }

        $headers = str_getcsv(array_shift($lines));
        $template = $this->generateTemplate($type);
        
        // Validate headers
        $missingColumns = array_diff($template['columns'], array_map('strtolower', array_map('trim', $headers)));
        if (!empty($missingColumns)) {
            throw new \Exception('Kolom tidak lengkap: ' . implode(', ', $missingColumns));
        }

        $sample = [];
        $validationErrors = [];
        $validRows = 0;

        foreach (array_slice($lines, 0, 10) as $index => $line) {
            $row = str_getcsv($line);
            if (count($row) >= count($headers)) {
                $sample[] = $row;
                
                // Basic validation
                $errors = $this->validateRow($type, array_combine($headers, $row), $index + 2);
                if (empty($errors)) {
                    $validRows++;
                } else {
                    $validationErrors = array_merge($validationErrors, $errors);
                }
            }
        }

        return [
            'headers' => $headers,
            'sample' => $sample,
            'total_rows' => count($lines),
            'valid_rows' => $validRows,
            'validation_errors' => array_slice($validationErrors, 0, 10),
        ];
    }

    public function importMahasiswa(UploadedFile $file, int $userId): ImportLog
    {
        $log = ImportLog::create([
            'type' => 'mahasiswa',
            'filename' => $file->getClientOriginalName(),
            'status' => 'processing',
            'total_rows' => 0,
            'success_count' => 0,
            'error_count' => 0,
            'skip_count' => 0,
            'errors' => [],
            'created_by' => $userId,
        ]);

        try {
            $content = file_get_contents($file->getRealPath());
            $lines = array_filter(explode("\n", $content));
            $headers = array_map('strtolower', array_map('trim', str_getcsv(array_shift($lines))));
            
            $log->total_rows = count($lines);
            $errors = [];
            $success = 0;
            $skip = 0;

            DB::beginTransaction();

            foreach ($lines as $index => $line) {
                $row = str_getcsv($line);
                if (count($row) < count($headers)) continue;

                $data = array_combine($headers, $row);
                $rowNum = $index + 2;

                // Check if NIM exists
                if (Mahasiswa::where('nim', $data['nim'])->exists()) {
                    $skip++;
                    continue;
                }

                // Validate
                $rowErrors = $this->validateRow('mahasiswa', $data, $rowNum);
                if (!empty($rowErrors)) {
                    $errors[] = ['row' => $rowNum, 'message' => implode(', ', $rowErrors)];
                    continue;
                }

                // Create
                Mahasiswa::create([
                    'nim' => $data['nim'],
                    'nama' => $data['nama'],
                    'email' => $data['email'] ?? null,
                    'no_hp' => $data['no_hp'] ?? null,
                    'kelas' => $data['kelas'] ?? null,
                    'password' => Hash::make($data['nim']), // Default password = NIM
                ]);

                $success++;
            }

            DB::commit();

            $log->update([
                'status' => 'completed',
                'success_count' => $success,
                'error_count' => count($errors),
                'skip_count' => $skip,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            $log->update([
                'status' => 'failed',
                'errors' => [['row' => 0, 'message' => $e->getMessage()]],
            ]);
        }

        return $log->fresh();
    }

    public function importMataKuliah(UploadedFile $file, int $userId): ImportLog
    {
        $log = ImportLog::create([
            'type' => 'mata_kuliah',
            'filename' => $file->getClientOriginalName(),
            'status' => 'processing',
            'total_rows' => 0,
            'success_count' => 0,
            'error_count' => 0,
            'skip_count' => 0,
            'errors' => [],
            'created_by' => $userId,
        ]);

        try {
            $content = file_get_contents($file->getRealPath());
            $lines = array_filter(explode("\n", $content));
            $headers = array_map('strtolower', array_map('trim', str_getcsv(array_shift($lines))));
            
            $log->total_rows = count($lines);
            $errors = [];
            $success = 0;
            $skip = 0;

            DB::beginTransaction();

            foreach ($lines as $index => $line) {
                $row = str_getcsv($line);
                if (count($row) < count($headers)) continue;

                $data = array_combine($headers, $row);
                $rowNum = $index + 2;

                // Check if kode exists
                if (MataKuliah::where('kode', $data['kode'])->exists()) {
                    $skip++;
                    continue;
                }

                // Create
                MataKuliah::create([
                    'kode' => $data['kode'],
                    'nama' => $data['nama'],
                    'sks' => (int) ($data['sks'] ?? 3),
                    'semester' => (int) ($data['semester'] ?? 1),
                ]);

                $success++;
            }

            DB::commit();

            $log->update([
                'status' => 'completed',
                'success_count' => $success,
                'error_count' => count($errors),
                'skip_count' => $skip,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            $log->update([
                'status' => 'failed',
                'errors' => [['row' => 0, 'message' => $e->getMessage()]],
            ]);
        }

        return $log->fresh();
    }

    private function validateRow(string $type, array $data, int $rowNum): array
    {
        $errors = [];

        if ($type === 'mahasiswa') {
            if (empty($data['nim'])) {
                $errors[] = "Baris {$rowNum}: NIM tidak boleh kosong";
            }
            if (empty($data['nama'])) {
                $errors[] = "Baris {$rowNum}: Nama tidak boleh kosong";
            }
            if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Baris {$rowNum}: Format email tidak valid";
            }
        }

        if ($type === 'mata_kuliah') {
            if (empty($data['kode'])) {
                $errors[] = "Baris {$rowNum}: Kode tidak boleh kosong";
            }
            if (empty($data['nama'])) {
                $errors[] = "Baris {$rowNum}: Nama tidak boleh kosong";
            }
        }

        return $errors;
    }
}
