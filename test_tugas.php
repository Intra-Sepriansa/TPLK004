<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $assignments = \App\Models\GroupAssignment::with(['course', 'groups.members', 'dosen'])
        ->withCount('groups')
        ->orderByDesc('created_at')
        ->get()
        ->map(function ($a) {
            $submittedCount = $a->submissions()->count();
            $gradedCount = $a->submissions()->whereNotNull('graded_at')->count();
            $totalStudents = \App\Models\GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $a->id))->count();

            return [
                'id' => $a->id,
                'title' => $a->title,
                'course' => ['id' => $a->course->id ?? null, 'nama' => $a->course->nama ?? null],
                'is_overdue' => $a->submission_deadline?->isPast() ?? false,
            ];
        });
    echo "Success! " . count($assignments) . " assignments found.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString();
} catch (\Error $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n" . $e->getFile() . ":" . $e->getLine();
}
