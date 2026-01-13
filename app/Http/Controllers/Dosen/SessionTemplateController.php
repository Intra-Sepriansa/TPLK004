<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\SessionTemplate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SessionTemplateController extends Controller
{
    public function index()
    {
        $dosen = Auth::guard('dosen')->user();

        $templates = SessionTemplate::where('dosen_id', $dosen->id)
            ->with('course')
            ->orderByDesc('created_at')
            ->get();

        $courses = $dosen->courses()->get(['mata_kuliah.id', 'mata_kuliah.nama', 'mata_kuliah.sks']);

        return Inertia::render('dosen/session-templates', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'templates' => $templates,
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();

        $validated = $request->validate([
            'course_id' => 'required|exists:mata_kuliah,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'default_start_time' => 'required|date_format:H:i',
            'default_end_time' => 'required|date_format:H:i|after:default_start_time',
            'default_days' => 'nullable|array',
            'default_days.*' => 'integer|min:0|max:6',
            'auto_activate' => 'boolean',
        ]);

        // Calculate duration
        $start = Carbon::createFromFormat('H:i', $validated['default_start_time']);
        $end = Carbon::createFromFormat('H:i', $validated['default_end_time']);
        $duration = $start->diffInMinutes($end);

        SessionTemplate::create([
            'dosen_id' => $dosen->id,
            'course_id' => $validated['course_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'default_start_time' => $validated['default_start_time'],
            'default_end_time' => $validated['default_end_time'],
            'duration_minutes' => $duration,
            'default_days' => $validated['default_days'] ?? [],
            'auto_activate' => $validated['auto_activate'] ?? false,
        ]);

        return back()->with('success', 'Template berhasil dibuat.');
    }

    public function update(Request $request, SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();

        if ($template->dosen_id !== $dosen->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'default_start_time' => 'required|date_format:H:i',
            'default_end_time' => 'required|date_format:H:i|after:default_start_time',
            'default_days' => 'nullable|array',
            'auto_activate' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $start = Carbon::createFromFormat('H:i', $validated['default_start_time']);
        $end = Carbon::createFromFormat('H:i', $validated['default_end_time']);

        $template->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'default_start_time' => $validated['default_start_time'],
            'default_end_time' => $validated['default_end_time'],
            'duration_minutes' => $start->diffInMinutes($end),
            'default_days' => $validated['default_days'] ?? [],
            'auto_activate' => $validated['auto_activate'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Template berhasil diperbarui.');
    }

    public function destroy(SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();

        if ($template->dosen_id !== $dosen->id) {
            abort(403);
        }

        $template->delete();

        return back()->with('success', 'Template berhasil dihapus.');
    }

    public function generateSessions(Request $request, SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();

        if ($template->dosen_id !== $dosen->id) {
            abort(403);
        }

        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'total_meetings' => 'required|integer|min:1|max:21',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $totalMeetings = $validated['total_meetings'];
        $defaultDays = $template->default_days ?? [];

        if (empty($defaultDays)) {
            return back()->with('error', 'Template tidak memiliki hari default.');
        }

        $created = 0;
        $currentDate = $startDate->copy();
        $meeting = 1;

        // Get existing meeting numbers for this course
        $existingMeetings = AttendanceSession::where('course_id', $template->course_id)
            ->pluck('meeting_number')
            ->toArray();

        while ($meeting <= $totalMeetings) {
            // Find next valid day
            while (!in_array($currentDate->dayOfWeek, $defaultDays)) {
                $currentDate->addDay();
            }

            // Skip if meeting number already exists
            if (in_array($meeting, $existingMeetings)) {
                $meeting++;
                $currentDate->addDay();
                continue;
            }

            // Create session
            $startAt = $currentDate->copy()->setTimeFromTimeString($template->default_start_time);
            $endAt = $currentDate->copy()->setTimeFromTimeString($template->default_end_time);

            AttendanceSession::create([
                'course_id' => $template->course_id,
                'meeting_number' => $meeting,
                'title' => "Pertemuan {$meeting}",
                'start_at' => $startAt,
                'end_at' => $endAt,
                'qr_token' => Str::random(32),
                'is_active' => false,
                'created_by_dosen_id' => $dosen->id,
            ]);

            $created++;
            $meeting++;
            $currentDate->addDay();
        }

        return back()->with('success', "{$created} sesi berhasil dibuat dari template.");
    }

    public function createFromTemplate(Request $request, SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();

        if ($template->dosen_id !== $dosen->id) {
            abort(403);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'meeting_number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
        ]);

        $date = Carbon::parse($validated['date']);
        $startAt = $date->copy()->setTimeFromTimeString($template->default_start_time);
        $endAt = $date->copy()->setTimeFromTimeString($template->default_end_time);

        AttendanceSession::create([
            'course_id' => $template->course_id,
            'meeting_number' => $validated['meeting_number'],
            'title' => $validated['title'] ?? "Pertemuan {$validated['meeting_number']}",
            'start_at' => $startAt,
            'end_at' => $endAt,
            'qr_token' => Str::random(32),
            'is_active' => $template->auto_activate,
            'created_by_dosen_id' => $dosen->id,
        ]);

        return back()->with('success', 'Sesi berhasil dibuat dari template.');
    }
}
