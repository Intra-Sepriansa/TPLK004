<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\AttendanceSession;
use App\Models\MataKuliah;
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

        $courses = MataKuliah::where('dosen_id', $dosen->id)->get(['id', 'nama', 'sks']);

        $stats = [
            'total_templates' => $templates->count(),
            'active_templates' => $templates->where('is_active', true)->count(),
            'auto_activate_templates' => $templates->where('auto_activate', true)->count(),
            'average_duration' => $templates->count() > 0 ? round($templates->avg('duration_minutes')) : 0,
        ];

        return Inertia::render('dosen/session-templates', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'templates' => $templates,
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $dosen = Auth::guard('dosen')->user();
        $courses = MataKuliah::where('dosen_id', $dosen->id)->get(['id', 'nama', 'sks']);

        return Inertia::render('dosen/session-detail', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'courses' => $courses,
            'mode' => 'create',
        ]);
    }

    public function edit(SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();
        if ($template->dosen_id !== $dosen->id) abort(403);

        $courses = MataKuliah::where('dosen_id', $dosen->id)->get(['id', 'nama', 'sks']);

        return Inertia::render('dosen/session-detail', [
            'dosen' => ['id' => $dosen->id, 'nama' => $dosen->nama],
            'template' => $template->load('course'),
            'courses' => $courses,
            'mode' => 'edit',
        ]);
    }

    public function storeAdvanced(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'category' => 'required|in:regular,exam,lab,seminar,custom',
            'course_id' => 'nullable|exists:mata_kuliah,id',
            'tags' => 'nullable|array',
            'duration_minutes' => 'required|integer|min:30|max:300',
            'qr_refresh_interval' => 'required|integer|min:10|max:120',
            'allow_late_minutes' => 'integer|min:0|max:60',
            'grace_period_minutes' => 'integer|min:0|max:30',
            'default_days' => 'nullable|array',
            'require_selfie' => 'boolean',
            'selfie_verification_level' => 'in:basic,strict,ai',
            'require_location' => 'boolean',
            'location_radius_meters' => 'integer|min:10|max:500',
            'anti_spoofing' => 'boolean',
            'max_attempts' => 'integer|min:1|max:10',
            'auto_activate' => 'boolean',
            'auto_activate_time' => 'nullable|string',
            'auto_deactivate' => 'boolean',
            'auto_deactivate_time' => 'nullable|string',
            'send_reminder' => 'boolean',
            'reminder_minutes_before' => 'integer|min:5|max:60',
            'is_active' => 'boolean',
            'is_draft' => 'boolean',
        ]);

        $validated['course_id'] = $this->resolveCourseId(
            isset($validated['course_id']) ? (int) $validated['course_id'] : null,
            $dosen->id,
        );

        if (!$validated['course_id']) {
            return back()
                ->withErrors(['course_id' => 'Pilih mata kuliah terlebih dahulu sebelum menyimpan template.'])
                ->withInput();
        }

        $validated['dosen_id'] = $dosen->id;
        $validated['default_start_time'] = '08:00';
        $validated['default_end_time'] = '10:00';

        SessionTemplate::create($validated);

        return redirect()->route('dosen.session-templates')->with('success', $validated['is_draft'] ? 'Draft tersimpan.' : 'Template berhasil dibuat.');
    }

    public function updateAdvanced(Request $request, SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();
        if ($template->dosen_id !== $dosen->id) abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'category' => 'required|in:regular,exam,lab,seminar,custom',
            'course_id' => 'nullable|exists:mata_kuliah,id',
            'tags' => 'nullable|array',
            'duration_minutes' => 'required|integer|min:30|max:300',
            'qr_refresh_interval' => 'required|integer|min:10|max:120',
            'allow_late_minutes' => 'integer|min:0|max:60',
            'grace_period_minutes' => 'integer|min:0|max:30',
            'default_days' => 'nullable|array',
            'require_selfie' => 'boolean',
            'selfie_verification_level' => 'in:basic,strict,ai',
            'require_location' => 'boolean',
            'location_radius_meters' => 'integer|min:10|max:500',
            'anti_spoofing' => 'boolean',
            'max_attempts' => 'integer|min:1|max:10',
            'auto_activate' => 'boolean',
            'auto_activate_time' => 'nullable|string',
            'auto_deactivate' => 'boolean',
            'auto_deactivate_time' => 'nullable|string',
            'send_reminder' => 'boolean',
            'reminder_minutes_before' => 'integer|min:5|max:60',
            'is_active' => 'boolean',
            'is_draft' => 'boolean',
        ]);

        $validated['course_id'] = isset($validated['course_id']) && $validated['course_id']
            ? $this->resolveCourseId((int) $validated['course_id'], $dosen->id)
            : ($template->course_id ?: $this->resolveCourseId(null, $dosen->id));

        if (!$validated['course_id']) {
            return back()
                ->withErrors(['course_id' => 'Pilih mata kuliah terlebih dahulu sebelum menyimpan template.'])
                ->withInput();
        }

        $template->update($validated);

        return redirect()->route('dosen.session-templates')->with('success', 'Template berhasil diperbarui.');
    }

    public function saveDraft(Request $request)
    {
        $dosen = Auth::guard('dosen')->user();

        $data = $request->all();
        $requestedCourseId = $request->filled('course_id') ? (int) $request->input('course_id') : null;
        $data['dosen_id'] = $dosen->id;
        $data['is_draft'] = true;
        $data['default_start_time'] = '08:00';
        $data['default_end_time'] = '10:00';

        if ($request->id) {
            $template = SessionTemplate::where('id', $request->id)->where('dosen_id', $dosen->id)->first();
            if ($template) {
                $data['course_id'] = $this->resolveCourseId($requestedCourseId, $dosen->id) ?: $template->course_id;
                if (!$data['course_id']) {
                    return back()->withErrors(['course_id' => 'Mata kuliah tidak ditemukan untuk akun dosen ini.']);
                }
                $template->update($data);
            }
        } else {
            $data['course_id'] = $this->resolveCourseId($requestedCourseId, $dosen->id);
            if (!$data['course_id']) {
                return back()->withErrors(['course_id' => 'Mata kuliah tidak ditemukan untuk akun dosen ini.']);
            }
            SessionTemplate::create(array_merge($data, ['name' => $data['name'] ?? 'Draft Template']));
        }

        return back()->with('success', 'Draft tersimpan.');
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

    public function duplicate(SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();
        if ($template->dosen_id !== $dosen->id) abort(403);

        $newTemplate = $template->replicate();
        $newTemplate->name = $template->name . ' (Copy)';
        $newTemplate->save();

        return back()->with('success', 'Template berhasil diduplikasi.');
    }

    public function toggleActive(SessionTemplate $template)
    {
        $dosen = Auth::guard('dosen')->user();
        if ($template->dosen_id !== $dosen->id) abort(403);

        $template->update(['is_active' => !$template->is_active]);

        return back()->with('success', $template->is_active ? 'Template diaktifkan.' : 'Template dinonaktifkan.');
    }

    private function resolveCourseId(?int $courseId, int $dosenId): ?int
    {
        if ($courseId !== null) {
            return MataKuliah::where('id', $courseId)
                ->where('dosen_id', $dosenId)
                ->value('id');
        }

        return MataKuliah::where('dosen_id', $dosenId)
            ->orderBy('id')
            ->value('id');
    }
}
