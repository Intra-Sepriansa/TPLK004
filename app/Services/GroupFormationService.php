<?php

namespace App\Services;

use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaGroupMember;
use App\Models\GaActivityLog;
use App\Models\Mahasiswa;
use App\Models\MahasiswaCourse;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class GroupFormationService
{
    /**
     * Create a group (self-form mode) — student-initiated
     */
    public function createSelfFormGroup(GroupAssignment $assignment, Mahasiswa $student, string $groupName): GaGroup
    {
        $this->validateFormationOpen($assignment);
        $this->validateStudentNotInGroup($assignment, $student);

        $group = GaGroup::create([
            'assignment_id' => $assignment->id,
            'name' => $groupName,
            'leader_id' => $student->id,
        ]);

        GaGroupMember::create([
            'group_id' => $group->id,
            'student_id' => $student->id,
            'is_leader' => true,
        ]);

        $this->logActivity($group, $student, 'member_joined', ['role' => 'leader']);

        return $group->load('members.student');
    }

    /**
     * Join existing group (self-form mode)
     */
    public function joinGroup(GaGroup $group, Mahasiswa $student): GaGroupMember
    {
        $assignment = $group->assignment;
        $this->validateFormationOpen($assignment);
        $this->validateStudentNotInGroup($assignment, $student);
        $this->validateGroupCapacity($group);

        $member = GaGroupMember::create([
            'group_id' => $group->id,
            'student_id' => $student->id,
            'is_leader' => false,
        ]);

        $this->logActivity($group, $student, 'member_joined', []);

        return $member;
    }

    /**
     * Leave a group (self-form mode)
     */
    public function leaveGroup(GaGroup $group, Mahasiswa $student): void
    {
        $this->validateFormationOpen($group->assignment);

        $membership = GaGroupMember::where('group_id', $group->id)
            ->where('student_id', $student->id)
            ->firstOrFail();

        $wasLeader = $membership->is_leader;
        $membership->delete();

        $this->logActivity($group, $student, 'member_left', []);

        // If leader left, promote the next member or delete empty group
        if ($wasLeader) {
            $nextMember = GaGroupMember::where('group_id', $group->id)->first();
            if ($nextMember) {
                $nextMember->update(['is_leader' => true]);
                $group->update(['leader_id' => $nextMember->student_id]);
            } else {
                $group->delete();
            }
        }
    }

    /**
     * Randomly form groups — balanced distribution (dosen only)
     */
    public function formRandomGroups(GroupAssignment $assignment): Collection
    {
        // Get all enrolled students for this course (match by course name since mahasiswa_courses stores name, not FK)
        $courseName = $assignment->course->nama;
        $studentIds = MahasiswaCourse::where('name', $courseName)
            ->pluck('mahasiswa_id')
            ->shuffle();

        // Remove students already in groups
        $existingMembers = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->pluck('student_id');
        $availableStudents = $studentIds->diff($existingMembers);

        if ($availableStudents->isEmpty()) {
            return collect([]);
        }

        $groupSize = $assignment->max_members;
        $chunks = $availableStudents->chunk($groupSize);
        $groups = collect();
        $groupIndex = $assignment->groups()->count() + 1;

        foreach ($chunks as $studentChunk) {
            $studentChunk = $studentChunk->values();

            // Handle last chunk if too small — merge it
            if ($studentChunk->count() < $assignment->min_members && $groups->isNotEmpty()) {
                $lastGroup = $groups->last();
                foreach ($studentChunk as $studentId) {
                    GaGroupMember::create([
                        'group_id' => $lastGroup->id,
                        'student_id' => $studentId,
                        'is_leader' => false,
                    ]);
                }
                continue;
            }

            $leaderId = $studentChunk->first();
            $group = GaGroup::create([
                'assignment_id' => $assignment->id,
                'name' => "Kelompok {$groupIndex}",
                'leader_id' => $leaderId,
            ]);

            foreach ($studentChunk as $i => $studentId) {
                GaGroupMember::create([
                    'group_id' => $group->id,
                    'student_id' => $studentId,
                    'is_leader' => $i === 0,
                ]);
            }

            $groups->push($group);
            $groupIndex++;
        }

        $groups->each->load('members.student');
        return $groups;
    }

    /**
     * Manually assign a student to a group (dosen only)
     */
    public function manualAssignStudent(GaGroup $group, int $studentId, bool $isLeader = false): GaGroupMember
    {
        $assignment = $group->assignment;
        $student = Mahasiswa::findOrFail($studentId);
        $this->validateStudentNotInGroup($assignment, $student);
        $this->validateGroupCapacity($group);

        if ($isLeader) {
            // Demote current leader
            GaGroupMember::where('group_id', $group->id)->where('is_leader', true)->update(['is_leader' => false]);
            $group->update(['leader_id' => $studentId]);
        }

        return GaGroupMember::create([
            'group_id' => $group->id,
            'student_id' => $studentId,
            'is_leader' => $isLeader,
        ]);
    }

    /**
     * Move student between groups (dosen only)
     */
    public function moveStudentBetweenGroups(int $studentId, GaGroup $fromGroup, GaGroup $toGroup): void
    {
        $this->validateGroupCapacity($toGroup);

        $membership = GaGroupMember::where('group_id', $fromGroup->id)
            ->where('student_id', $studentId)
            ->firstOrFail();

        $wasLeader = $membership->is_leader;
        $membership->delete();

        GaGroupMember::create([
            'group_id' => $toGroup->id,
            'student_id' => $studentId,
            'is_leader' => false,
        ]);

        // Handle leader vacancy in the source group
        if ($wasLeader) {
            $nextMember = GaGroupMember::where('group_id', $fromGroup->id)->first();
            if ($nextMember) {
                $nextMember->update(['is_leader' => true]);
                $fromGroup->update(['leader_id' => $nextMember->student_id]);
            }
        }
    }

    /**
     * Lock all groups for an assignment (no more joining/leaving)
     */
    public function lockGroups(GroupAssignment $assignment): void
    {
        $assignment->groups()->update(['is_locked' => true]);
        $assignment->update(['is_locked' => true]);
    }

    /**
     * Get unassigned students for an assignment
     */
    public function getUnassignedStudents(GroupAssignment $assignment): Collection
    {
        // Match by course name since mahasiswa_courses stores name, not FK
        $courseName = $assignment->course->nama;
        $enrolledStudents = MahasiswaCourse::where('name', $courseName)
            ->pluck('mahasiswa_id');

        $assignedStudents = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->pluck('student_id');

        return Mahasiswa::whereIn('id', $enrolledStudents->diff($assignedStudents))->get();
    }

    // === Validation Helpers ===

    private function validateFormationOpen(GroupAssignment $assignment): void
    {
        if ($assignment->is_locked) {
            throw new \Exception('Pembentukan kelompok sudah dikunci.');
        }
        if ($assignment->formation_deadline && $assignment->formation_deadline->isPast()) {
            throw new \Exception('Batas waktu pembentukan kelompok sudah lewat.');
        }
    }

    private function validateStudentNotInGroup(GroupAssignment $assignment, Mahasiswa $student): void
    {
        $exists = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->where('student_id', $student->id)
            ->exists();

        if ($exists) {
            throw new \Exception('Mahasiswa sudah tergabung dalam kelompok lain.');
        }
    }

    private function validateGroupCapacity(GaGroup $group): void
    {
        $currentCount = $group->members()->count();
        $maxMembers = $group->assignment->max_members;
        if ($currentCount >= $maxMembers) {
            throw new \Exception("Kelompok sudah penuh (maks {$maxMembers} anggota).");
        }
    }

    private function logActivity(GaGroup $group, Mahasiswa $student, string $type, array $metadata): void
    {
        GaActivityLog::create([
            'group_id' => $group->id,
            'user_id' => $student->id,
            'activity_type' => $type,
            'activity_metadata' => $metadata,
            'points' => 0,
        ]);
    }
}
