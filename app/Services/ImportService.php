<?php

namespace App\Services;

use App\Models\ImportLog;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ImportService
{
    public function generateTemplate(string $type): array
    {
        return match($type) {
            'mahasiswa' => [
                'columns' => ['nim', 'nama', 'email', 'no_hp', 'kelas'],
                'sample' => [
                    ['2024001', 'John Doe', 'john@example.com', '081234567890', '06TPLK004'],
                    ['2024002', 'Jane Smith', 'jane@example.com', '081234567891', '06TPLK004'],
                ],
            ],
            'mata_kuliah' => [
                'columns' => ['kode', 'nama', 'sks', 'semester'],
                'sample' => [
                    ['MK001', 'Pemrograman Web', '3', '5'],
                    ['MK002', 'Basis Data', '3', '5'],
                ],
            ],
            'jadwal' => [
                'columns' => ['kode_matkul', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan'],
                'sample' => [
                    ['MK001', 'Senin', '08:00', '10:30', 'Lab 1'],
                    ['MK002', 'Selasa', '13:00', '15:30', 'Lab 2'],
                ],
            ],
            default => [],
        };
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
