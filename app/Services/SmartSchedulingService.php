<?php

namespace App\Services;

use App\Models\JadwalKuliah;
use App\Models\MataKuliah;
use App\Models\Dosen;
use App\Models\Ruangan;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SmartSchedulingService
{
    /**
     * Auto-generate optimal schedule
     */
    public function generateOptimalSchedule(array $courses, array $constraints = [])
    {
        $schedule = [];
        $conflicts = [];

        // Days and time slots
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $timeSlots = $this->getTimeSlots();

        foreach ($courses as $course) {
            $assigned = false;

            foreach ($days as $day) {
                foreach ($timeSlots as $slot) {
                    // Check if this slot is available
                    if ($this->isSlotAvailable($day, $slot, $course, $schedule)) {
                        $schedule[] = [
                            'course_id' => $course['id'],
                            'dosen_id' => $course['dosen_id'],
                            'ruangan_id' => $this->findAvailableRoom($day, $slot, $schedule),
                            'hari' => $day,
                            'jam_mulai' => $slot['start'],
                            'jam_selesai' => $slot['end'],
                            'sks' => $course['sks'],
                        ];
                        $assigned = true;
                        break 2;
                    }
                }
            }

            if (!assigned) {
                $conflicts[] = [
                    'course' => $course,
                    'reason' => 'No available time slot found',
                ];
            }
        }

        return [
            'schedule' => $schedule,
            'conflicts' => $conflicts,
            'success_rate' => count($schedule) / count($courses) * 100,
        ];
    }

    /**
     * Detect scheduling conflicts
     */
    public function detectConflicts($scheduleId = null)
    {
        $query = JadwalKuliah::with(['mataKuliah', 'dosen', 'ruangan']);

        if ($scheduleId) {
            $query->where('id', $scheduleId);
        }

        $schedules = $query->get();
        $conflicts = [];

        foreach ($schedules as $schedule) {
            // Check dosen conflict
            $dosenConflict = $this->checkDosenConflict($schedule, $schedules);
            if ($dosenConflict) {
                $conflicts[] = [
                    'type' => 'dosen',
                    'schedule' => $schedule,
                    'conflict_with' => $dosenConflict,
                    'message' => "Dosen {$schedule->dosen->nama} memiliki jadwal bentrok",
                ];
            }

            // Check room conflict
            $roomConflict = $this->checkRoomConflict($schedule, $schedules);
            if ($roomConflict) {
                $conflicts[] = [
                    'type' => 'room',
                    'schedule' => $schedule,
                    'conflict_with' => $roomConflict,
                    'message' => "Ruangan {$schedule->ruangan->nama} sudah terpakai",
                ];
            }

            // Check class conflict (same kelas, same time)
            $classConflict = $this->checkClassConflict($schedule, $schedules);
            if ($classConflict) {
                $conflicts[] = [
                    'type' => 'class',
                    'schedule' => $schedule,
                    'conflict_with' => $classConflict,
                    'message' => "Kelas {$schedule->kelas} memiliki jadwal bentrok",
                ];
            }
        }

        return [
            'total_conflicts' => count($conflicts),
            'conflicts' => $conflicts,
            'conflict_types' => $this->groupConflictsByType($conflicts),
        ];
    }

    /**
     * Check room availability
     */
    public function checkRoomAvailability($roomId, $day, $startTime, $endTime, $excludeScheduleId = null)
    {
        $conflicts = JadwalKuliah::where('ruangan_id', $roomId)
            ->where('hari', $day)
            ->when($excludeScheduleId, function($q) use ($excludeScheduleId) {
                $q->where('id', '!=', $excludeScheduleId);
            })
            ->where(function($q) use ($startTime, $endTime) {
                $q->whereBetween('jam_mulai', [$startTime, $endTime])
                  ->orWhereBetween('jam_selesai', [$startTime, $endTime])
                  ->orWhere(function($q2) use ($startTime, $endTime) {
                      $q2->where('jam_mulai', '<=', $startTime)
                         ->where('jam_selesai', '>=', $endTime);
                  });
            })
            ->with(['mataKuliah', 'dosen'])
            ->get();

        return [
            'available' => $conflicts->isEmpty(),
            'conflicts' => $conflicts,
        ];
    }

    /**
     * Get available rooms for a time slot
     */
    public function getAvailableRooms($day, $startTime, $endTime, $capacity = null)
    {
        $allRooms = Ruangan::when($capacity, function($q) use ($capacity) {
            $q->where('kapasitas', '>=', $capacity);
        })->get();

        $availableRooms = [];

        foreach ($allRooms as $room) {
            $availability = $this->checkRoomAvailability($room->id, $day, $startTime, $endTime);
            if ($availability['available']) {
                $availableRooms[] = $room;
            }
        }

        return $availableRooms;
    }

    /**
     * Suggest optimal time slots for a course
     */
    public function suggestOptimalTimeSlots($courseId, $dosenId, $kelas)
    {
        $timeSlots = $this->getTimeSlots();
        $days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $suggestions = [];

        foreach ($days as $day) {
            foreach ($timeSlots as $slot) {
                $score = $this->calculateSlotScore($day, $slot, $dosenId, $kelas);
                
                if ($score > 0) {
                    $suggestions[] = [
                        'day' => $day,
                        'start_time' => $slot['start'],
                        'end_time' => $slot['end'],
                        'score' => $score,
                        'available_rooms' => $this->getAvailableRooms($day, $slot['start'], $slot['end']),
                    ];
                }
            }
        }

        // Sort by score (highest first)
        usort($suggestions, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return array_slice($suggestions, 0, 10); // Top 10 suggestions
    }

    /**
     * Integration with Google Calendar
     */
    public function exportToGoogleCalendar($scheduleId)
    {
        $schedule = JadwalKuliah::with(['mataKuliah', 'dosen', 'ruangan'])->findOrFail($scheduleId);

        // Generate iCal format
        $ical = $this->generateICalEvent($schedule);

        return [
            'ical' => $ical,
            'google_calendar_url' => $this->generateGoogleCalendarUrl($schedule),
        ];
    }

    // Helper methods
    private function getTimeSlots()
    {
        return [
            ['start' => '07:00', 'end' => '08:40', 'label' => 'Slot 1'],
            ['start' => '08:40', 'end' => '10:20', 'label' => 'Slot 2'],
            ['start' => '10:20', 'end' => '12:00', 'label' => 'Slot 3'],
            ['start' => '13:00', 'end' => '14:40', 'label' => 'Slot 4'],
            ['start' => '14:40', 'end' => '16:20', 'label' => 'Slot 5'],
            ['start' => '16:20', 'end' => '18:00', 'label' => 'Slot 6'],
        ];
    }

    private function isSlotAvailable($day, $slot, $course, $schedule)
    {
        foreach ($schedule as $existing) {
            if ($existing['hari'] === $day) {
                // Check time overlap
                if ($this->timesOverlap($slot['start'], $slot['end'], $existing['jam_mulai'], $existing['jam_selesai'])) {
                    // Check if same dosen or same class
                    if ($existing['dosen_id'] === $course['dosen_id']) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private function timesOverlap($start1, $end1, $start2, $end2)
    {
        return ($start1 < $end2) && ($end1 > $start2);
    }

    private function findAvailableRoom($day, $slot, $schedule)
    {
        $rooms = Ruangan::all();
        
        foreach ($rooms as $room) {
            $isAvailable = true;
            foreach ($schedule as $existing) {
                if ($existing['hari'] === $day && $existing['ruangan_id'] === $room->id) {
                    if ($this->timesOverlap($slot['start'], $slot['end'], $existing['jam_mulai'], $existing['jam_selesai'])) {
                        $isAvailable = false;
                        break;
                    }
                }
            }
            if ($isAvailable) {
                return $room->id;
            }
        }
        
        return null;
    }

    private function checkDosenConflict($schedule, $allSchedules)
    {
        return $allSchedules->first(function($other) use ($schedule) {
            return $other->id !== $schedule->id &&
                   $other->dosen_id === $schedule->dosen_id &&
                   $other->hari === $schedule->hari &&
                   $this->timesOverlap($schedule->jam_mulai, $schedule->jam_selesai, $other->jam_mulai, $other->jam_selesai);
        });
    }

    private function checkRoomConflict($schedule, $allSchedules)
    {
        return $allSchedules->first(function($other) use ($schedule) {
            return $other->id !== $schedule->id &&
                   $other->ruangan_id === $schedule->ruangan_id &&
                   $other->hari === $schedule->hari &&
                   $this->timesOverlap($schedule->jam_mulai, $schedule->jam_selesai, $other->jam_mulai, $other->jam_selesai);
        });
    }

    private function checkClassConflict($schedule, $allSchedules)
    {
        return $allSchedules->first(function($other) use ($schedule) {
            return $other->id !== $schedule->id &&
                   $other->kelas === $schedule->kelas &&
                   $other->hari === $schedule->hari &&
                   $this->timesOverlap($schedule->jam_mulai, $schedule->jam_selesai, $other->jam_mulai, $other->jam_selesai);
        });
    }

    private function groupConflictsByType($conflicts)
    {
        $grouped = [];
        foreach ($conflicts as $conflict) {
            $type = $conflict['type'];
            if (!isset($grouped[$type])) {
                $grouped[$type] = 0;
            }
            $grouped[$type]++;
        }
        return $grouped;
    }

    private function calculateSlotScore($day, $slot, $dosenId, $kelas)
    {
        $score = 100;

        // Check dosen availability
        $dosenConflicts = JadwalKuliah::where('dosen_id', $dosenId)
            ->where('hari', $day)
            ->where(function($q) use ($slot) {
                $q->whereBetween('jam_mulai', [$slot['start'], $slot['end']])
                  ->orWhereBetween('jam_selesai', [$slot['start'], $slot['end']]);
            })
            ->count();

        if ($dosenConflicts > 0) {
            return 0; // Not available
        }

        // Prefer morning slots (higher score)
        $hour = (int) substr($slot['start'], 0, 2);
        if ($hour >= 7 && $hour < 10) {
            $score += 20;
        } elseif ($hour >= 10 && $hour < 13) {
            $score += 10;
        }

        // Check room availability
        $availableRooms = $this->getAvailableRooms($day, $slot['start'], $slot['end']);
        $score += count($availableRooms) * 5;

        return $score;
    }

    private function generateICalEvent($schedule)
    {
        $startDate = Carbon::now()->next($schedule->hari)->format('Ymd');
        $startTime = str_replace(':', '', $schedule->jam_mulai) . '00';
        $endTime = str_replace(':', '', $schedule->jam_selesai) . '00';

        return "BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:{$startDate}T{$startTime}
DTEND:{$startDate}T{$endTime}
SUMMARY:{$schedule->mataKuliah->nama}
DESCRIPTION:Dosen: {$schedule->dosen->nama}
LOCATION:{$schedule->ruangan->nama}
END:VEVENT
END:VCALENDAR";
    }

    private function generateGoogleCalendarUrl($schedule)
    {
        $title = urlencode($schedule->mataKuliah->nama);
        $details = urlencode("Dosen: {$schedule->dosen->nama}\nRuangan: {$schedule->ruangan->nama}");
        $location = urlencode($schedule->ruangan->nama);
        
        $startDate = Carbon::now()->next($schedule->hari)->format('Ymd');
        $startTime = str_replace(':', '', $schedule->jam_mulai) . '00';
        $endTime = str_replace(':', '', $schedule->jam_selesai) . '00';
        
        $dates = "{$startDate}T{$startTime}/{$startDate}T{$endTime}";

        return "https://calendar.google.com/calendar/render?action=TEMPLATE&text={$title}&details={$details}&location={$location}&dates={$dates}";
    }
}
