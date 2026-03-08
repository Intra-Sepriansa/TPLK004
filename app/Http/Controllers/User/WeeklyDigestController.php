<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WeeklyLearningDigest;
use App\Services\PdfReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WeeklyDigestController extends Controller
{
    public function show(int $id)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        $digest = WeeklyLearningDigest::published()
            ->with([
                'mataKuliahs.dosen',
                'creator',
                'forumDiscussions',
                'assignments',
                'learningMaterials',
                'announcements',
                'upcomingSchedules',
                'supportContacts',
            ])
            ->findOrFail($id);

        $courses = $digest->mataKuliahs->map(fn ($c) => [
            'id' => $c->id,
            'name' => $c->nama,
            'code' => $c->kode,
            'dosen_name' => $c->dosen?->nama,
            'meeting_number' => $c->pivot->meeting_number,
            'title' => $c->pivot->title,
        ]);

        $relatedDigests = WeeklyLearningDigest::published()
            ->where('id', '!=', $digest->id)
            ->with('mataKuliahs')
            ->orderByDesc('week_start_date')
            ->limit(5)
            ->get()
            ->map(function ($d) {
                $courses = $d->mataKuliahs->map(fn ($c) => [
                    'name' => $c->nama,
                    'meeting_number' => $c->pivot->meeting_number,
                    'title' => $c->pivot->title,
                ]);
                return [
                    'id' => $d->id,
                    'display_title' => $this->displayDigestTitle($courses),
                    'week_number' => $d->week_number,
                    'semester' => $d->semester,
                    'week_range' => $d->week_range,
                ];
            });

        return Inertia::render('user/weekly-digest/show', [
            'digest' => [
                'id' => $digest->id,
                'courses' => $courses,
                'display_title' => $this->displayDigestTitle($courses),
                'week_number' => $digest->week_number,
                'semester' => $digest->semester,
                'week_range' => $digest->week_range,
                'week_start_date' => $digest->week_start_date?->format('Y-m-d'),
                'week_end_date' => $digest->week_end_date?->format('Y-m-d'),
                'description' => $digest->description,
                'has_structured_task' => (bool) $digest->has_structured_task,
                'forum_posts_required' => (int) $digest->forum_posts_required,
                'mentari_course_url' => $digest->mentari_course_url,
                'is_published' => $digest->is_published,
                'published_at' => $digest->published_at?->format('d M Y H:i'),
                'creator_name' => $digest->creator?->name,
                'forum_discussions' => $digest->forumDiscussions->map(fn ($f) => [
                    'id' => $f->id,
                    'topic_title' => $f->topic_title,
                    'topic_description' => $f->topic_description,
                    'mentari_forum_url' => $f->mentari_forum_url,
                    'total_posts' => $f->total_posts,
                    'total_participants' => $f->total_participants,
                    'key_points' => $f->key_points,
                    'best_contributions' => $f->best_contributions,
                    'discussion_date' => $f->discussion_date,
                ]),
                'assignments' => $digest->assignments->map(fn ($a) => [
                    'id' => $a->id,
                    'assignment_title' => $a->assignment_title,
                    'assignment_description' => $a->assignment_description,
                    'assignment_type' => $a->assignment_type,
                    'mentari_assignment_url' => $a->mentari_assignment_url,
                    'deadline_date' => $a->deadline_date,
                    'submission_start_date' => $a->submission_start_date,
                    'max_score' => $a->max_score,
                    'submission_format' => $a->submission_format,
                    'file_size_limit' => $a->file_size_limit,
                    'detailed_instructions' => $a->detailed_instructions,
                    'grading_criteria' => $a->grading_criteria,
                    'is_mandatory' => (bool) $a->is_mandatory,
                    'is_late_submission_allowed' => (bool) $a->is_late_submission_allowed,
                ]),
                'learning_materials' => $digest->learningMaterials->map(fn ($m) => [
                    'id' => $m->id,
                    'material_title' => $m->material_title,
                    'material_description' => $m->material_description,
                    'material_type' => $m->material_type,
                    'mentari_material_url' => $m->mentari_material_url,
                    'file_name' => $m->file_name,
                    'file_size' => $m->file_size,
                    'duration' => $m->duration,
                    'topics_covered' => $m->topics_covered,
                    'learning_objectives' => $m->learning_objectives,
                    'is_downloadable' => (bool) $m->is_downloadable,
                    'upload_date' => $m->upload_date,
                ]),
                'announcements' => $digest->announcements->map(fn ($a) => [
                    'id' => $a->id,
                    'announcement_title' => $a->announcement_title,
                    'announcement_content' => $a->announcement_content,
                    'announcement_type' => $a->announcement_type,
                    'priority_level' => $a->priority_level,
                    'is_pinned' => (bool) $a->is_pinned,
                    'announced_date' => $a->announced_date,
                ]),
                'upcoming_schedules' => $digest->upcomingSchedules->map(fn ($s) => [
                    'id' => $s->id,
                    'event_title' => $s->event_title,
                    'event_description' => $s->event_description,
                    'event_type' => $s->event_type,
                    'event_date' => $s->event_date,
                    'event_time' => $s->event_time,
                    'duration_minutes' => $s->duration_minutes,
                    'platform' => $s->platform,
                    'meeting_link' => $s->meeting_link,
                    'meeting_id' => $s->meeting_id,
                    'meeting_password' => $s->meeting_password,
                    'is_mandatory' => (bool) $s->is_mandatory,
                    'preparation_notes' => $s->preparation_notes,
                ]),
                'support_contacts' => $digest->supportContacts->map(fn ($c) => [
                    'id' => $c->id,
                    'contact_name' => $c->contact_name,
                    'contact_role' => $c->contact_role,
                    'contact_type' => $c->contact_type,
                    'contact_value' => $c->contact_value,
                    'available_hours' => $c->available_hours,
                    'response_time' => $c->response_time,
                    'notes' => $c->notes,
                ]),
            ],
            'relatedDigests' => $relatedDigests,
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
            ],
        ]);
    }

    public function exportPdf(int $id, PdfReportService $pdfService)
    {
        $mahasiswa = Auth::guard('mahasiswa')->user();

        if (!$mahasiswa) {
            return redirect()->route('mahasiswa.login');
        }

        $digest = WeeklyLearningDigest::published()->findOrFail($id);

        $pdfContent = $pdfService->generateWeeklyDigestPdf($digest, $mahasiswa);

        $filename = 'Info_Pekanan_Mentari_Minggu_' . $digest->week_number . '_ID_' . $digest->id . '.pdf';

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function displayDigestTitle($courses): string
    {
        if (count($courses) > 1) {
            return count($courses) . ' Mata Kuliah Terpilih';
        }

        if (count($courses) === 1) {
            $course = is_array($courses[0]) ? $courses[0] : (is_object($courses[0]) ? $courses[0] : collect($courses)->first());

            $title = is_array($course) ? ($course['title'] ?? null) : ($course->pivot->title ?? $course->title ?? null);
            $meetingInfo = is_array($course) ? ($course['meeting_number'] ?? 1) : ($course->pivot->meeting_number ?? $course->meeting_number ?? 1);

            return $title ?: 'Materi Pertemuan ' . $meetingInfo;
        }

        return 'Materi Informasi Pekanan';
    }
}
