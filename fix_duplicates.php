<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

DB::unprepared("SET FOREIGN_KEY_CHECKS=0;");

// Mapping: old duplicate IDs (1-8 from mahasiswa.sql) -> correct IDs (9-16 from tplk004_data.sql)
$mapping = [1 => 9, 2 => 10, 3 => 11, 4 => 12, 5 => 13, 6 => 14, 7 => 15, 8 => 16];

foreach ($mapping as $oldId => $newId) {
    // Get old sessions for this course
    $oldSessions = DB::table('attendance_sessions')->where('course_id', $oldId)->get();
    
    foreach ($oldSessions as $oldSession) {
        // Find matching new session (same course name, same meeting number)
        $newSession = DB::table('attendance_sessions')
            ->where('course_id', $newId)
            ->where('meeting_number', $oldSession->meeting_number)
            ->first();
        
        if ($newSession) {
            // Move logs from old session to new session (if not already existing)
            $oldLogs = DB::table('attendance_logs')->where('attendance_session_id', $oldSession->id)->get();
            foreach ($oldLogs as $oldLog) {
                $existingLog = DB::table('attendance_logs')
                    ->where('attendance_session_id', $newSession->id)
                    ->where('mahasiswa_id', $oldLog->mahasiswa_id)
                    ->first();
                if (!$existingLog) {
                    DB::table('attendance_logs')->where('id', $oldLog->id)->update([
                        'attendance_session_id' => $newSession->id
                    ]);
                    echo "Moved log #{$oldLog->id} from session #{$oldSession->id} -> #{$newSession->id}\n";
                } else {
                    // Delete the duplicate log
                    DB::table('attendance_logs')->where('id', $oldLog->id)->delete();
                    echo "Deleted duplicate log #{$oldLog->id}\n";
                }
            }
            // Delete old session
            DB::table('attendance_sessions')->where('id', $oldSession->id)->delete();
            echo "Deleted old session #{$oldSession->id} (course $oldId M-{$oldSession->meeting_number})\n";
        } else {
            // No matching new session, just re-assign
            DB::table('attendance_sessions')->where('id', $oldSession->id)->update(['course_id' => $newId]);
            echo "Reassigned session #{$oldSession->id} from course $oldId -> $newId\n";
        }
    }
    
    // Move other tables
    DB::table('tugas')->where('course_id', $oldId)->update(['course_id' => $newId]);
    DB::table('student_activity_scores')->where('mata_kuliah_id', $oldId)->update(['mata_kuliah_id' => $newId]);
    DB::table('session_templates')->where('course_id', $oldId)->update(['course_id' => $newId]);
}

// Delete old duplicate mata_kuliah IDs 1-8
DB::table('mata_kuliah')->whereIn('id', [1, 2, 3, 4, 5, 6, 7, 8])->delete();
echo "\nDuplicate mata_kuliah IDs 1-8 removed!\n";

DB::unprepared("SET FOREIGN_KEY_CHECKS=1;");

// Verify
$count = DB::table('mata_kuliah')->count();
echo "Remaining mata_kuliah: $count\n";

$sessions = DB::table('attendance_sessions')->where('course_id', 14)->get();
foreach ($sessions as $s) {
    $logCount = DB::table('attendance_logs')->where('attendance_session_id', $s->id)->count();
    echo "Session #{$s->id} M-{$s->meeting_number} course:{$s->course_id} logs:$logCount\n";
}
echo "DONE!\n";
