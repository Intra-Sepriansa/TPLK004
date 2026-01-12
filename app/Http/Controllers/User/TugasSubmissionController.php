<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\TugasSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TugasSubmissionController extends Controller
{
    public function store(Request $request, Tugas $tuga): RedirectResponse
    {
        $mahasiswa = auth('mahasiswa')->user();

        // Check if already submitted
        $existing = TugasSubmission::where('tugas_id', $tuga->id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if ($existing && $existing->status === 'graded') {
            return back()->withErrors(['error' => 'Tugas sudah dinilai, tidak dapat mengubah submission.']);
        }

        $request->validate([
            'content' => 'nullable|string|max:5000',
            'file' => 'nullable|file|mimes:pdf,doc,docx,zip,rar|max:10240', // 10MB max
        ]);

        if (!$request->content && !$request->hasFile('file')) {
            return back()->withErrors(['error' => 'Harap isi konten atau upload file.']);
        }

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('submissions/' . $tuga->id, 'public');
        }

        // Determine if late
        $isLate = $tuga->deadline && now()->gt($tuga->deadline);
        $status = $isLate ? 'late' : 'submitted';

        if ($existing) {
            // Delete old file if new one uploaded
            if ($filePath && $existing->file_path) {
                Storage::disk('public')->delete($existing->file_path);
            }

            $existing->update([
                'content' => $request->content ?? $existing->content,
                'file_path' => $filePath ?? $existing->file_path,
                'file_name' => $fileName ?? $existing->file_name,
                'status' => $status,
                'submitted_at' => now(),
            ]);
        } else {
            TugasSubmission::create([
                'tugas_id' => $tuga->id,
                'mahasiswa_id' => $mahasiswa->id,
                'content' => $request->content,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'status' => $status,
                'submitted_at' => now(),
            ]);
        }

        $message = $isLate 
            ? 'Tugas berhasil dikumpulkan (terlambat).' 
            : 'Tugas berhasil dikumpulkan.';

        return back()->with('success', $message);
    }
}
