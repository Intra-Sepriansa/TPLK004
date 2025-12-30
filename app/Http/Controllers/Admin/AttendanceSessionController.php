<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class AttendanceSessionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $courseId = $request->input('course_id');
        $course = $courseId
            ? MataKuliah::select('id', 'sks')->find($courseId)
            : null;
        $maxMeeting = $course && (int) $course->sks === 3 ? 21 : 14;
        $meetingRules = [
            'required',
            'integer',
            'min:1',
            'max:' . $maxMeeting,
            Rule::unique('attendance_sessions', 'meeting_number')
                ->where('course_id', $courseId),
        ];

        if (Schema::hasTable('pertemuan') && $courseId) {
            $meetingRules[] = Rule::exists('pertemuan', 'pertemuan_ke')
                ->where('mata_kuliah_id', $courseId);
        }

        $validated = $request->validate([
            'course_id' => ['required', 'exists:mata_kuliah,id'],
            'meeting_number' => $meetingRules,
            'title' => ['nullable', 'string', 'max:255'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
        ]);

        AttendanceSession::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Sesi absen dibuat.');
    }

    public function activate(AttendanceSession $attendanceSession): RedirectResponse
    {
        AttendanceSession::query()->update(['is_active' => false]);
        $attendanceSession->update(['is_active' => true]);

        return back()->with('success', 'Sesi aktif diperbarui.');
    }

    public function update(Request $request, AttendanceSession $attendanceSession): RedirectResponse
    {
        $courseId = $request->input('course_id');
        $course = $courseId
            ? MataKuliah::select('id', 'sks')->find($courseId)
            : null;
        $maxMeeting = $course && (int) $course->sks === 3 ? 21 : 14;
        $meetingRules = [
            'required',
            'integer',
            'min:1',
            'max:' . $maxMeeting,
            Rule::unique('attendance_sessions', 'meeting_number')
                ->where('course_id', $courseId)
                ->ignore($attendanceSession->id),
        ];

        if (Schema::hasTable('pertemuan') && $courseId) {
            $meetingRules[] = Rule::exists('pertemuan', 'pertemuan_ke')
                ->where('mata_kuliah_id', $courseId);
        }

        $validated = $request->validate([
            'course_id' => ['required', 'exists:mata_kuliah,id'],
            'meeting_number' => $meetingRules,
            'title' => ['nullable', 'string', 'max:255'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
        ]);

        $attendanceSession->update($validated);

        return back()->with('success', 'Jadwal sesi diperbarui.');
    }

    public function close(AttendanceSession $attendanceSession): RedirectResponse
    {
        $attendanceSession->update(['is_active' => false]);

        return back()->with('success', 'Sesi ditutup.');
    }

    public function destroy(AttendanceSession $attendanceSession): RedirectResponse
    {
        $attendanceSession->delete();

        return back()->with('success', 'Jadwal sesi dihapus.');
    }
}
