<?php

namespace App\Services;

use App\Models\GroupAssignment;
use App\Models\GaGroup;
use App\Models\GaGroupMember;
use App\Models\GaActivityLog;
use App\Models\ForceAssignLog;
use App\Models\Mahasiswa;
use App\Models\MahasiswaCourse;
use Illuminate\Support\Collection;

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
        return $this->formRandomGroupsAdvanced($assignment);
    }

    /**
     * Randomly form groups with optional target group count and explicit group size.
     * Used by admin workflow to support quick random setup.
     */
    public function formRandomGroupsAdvanced(
        GroupAssignment $assignment,
        ?int $targetGroupCount = null,
        ?int $groupSize = null
    ): Collection {
        $studentIds = $this->getCourseStudentIds($assignment)
            ->shuffle()
            ->values();

        // Remove students already in groups
        $existingMembers = GaGroupMember::whereHas('group', fn ($q) => $q->where('assignment_id', $assignment->id))
            ->pluck('student_id');
        $availableStudents = $studentIds->diff($existingMembers)->values();

        if ($availableStudents->isEmpty()) {
            return collect([]);
        }

        $effectiveGroupSize = max(2, (int) ($groupSize ?? $assignment->max_members));
        $minMembers = max(2, (int) $assignment->min_members);
        $chunks = [];

        if ($targetGroupCount !== null && $targetGroupCount > 0) {
            $maxPossibleGroupCount = max(1, intdiv($availableStudents->count(), $minMembers));
            $finalGroupCount = max(1, min($targetGroupCount, $maxPossibleGroupCount));

            $chunks = array_fill(0, $finalGroupCount, []);

            // Distribute round-robin to the smallest bucket with available capacity.
            foreach ($availableStudents as $studentId) {
                $targetIndex = 0;
                $smallestCount = PHP_INT_MAX;

                foreach ($chunks as $idx => $chunk) {
                    $count = count($chunk);
                    if ($count < $effectiveGroupSize && $count < $smallestCount) {
                        $smallestCount = $count;
                        $targetIndex = $idx;
                    }
                }

                // If all buckets reach preferred size, keep balancing to smallest bucket.
                if ($smallestCount === PHP_INT_MAX) {
                    $targetIndex = array_key_first($chunks);
                    foreach ($chunks as $idx => $chunk) {
                        if (count($chunk) < count($chunks[$targetIndex])) {
                            $targetIndex = $idx;
                        }
                    }
                }

                $chunks[$targetIndex][] = $studentId;
            }

            // Merge too-small groups into larger groups where possible.
            for ($i = count($chunks) - 1; $i >= 0; $i--) {
                if (count($chunks) <= 1) break;
                if (count($chunks[$i]) >= $minMembers) continue;

                $targetIdx = 0;
                $largestCount = -1;
                foreach ($chunks as $idx => $chunk) {
                    if ($idx === $i) continue;
                    if (count($chunk) > $largestCount) {
                        $largestCount = count($chunk);
                        $targetIdx = $idx;
                    }
                }

                $chunks[$targetIdx] = array_merge($chunks[$targetIdx], $chunks[$i]);
                array_splice($chunks, $i, 1);
            }
        } else {
            $chunks = $availableStudents->chunk($effectiveGroupSize)->map(fn ($chunk) => $chunk->values()->all())->all();

            // Handle last chunk if too small — merge it
            $lastIndex = count($chunks) - 1;
            if ($lastIndex > 0 && count($chunks[$lastIndex]) < $minMembers) {
                $chunks[$lastIndex - 1] = array_merge($chunks[$lastIndex - 1], $chunks[$lastIndex]);
                array_pop($chunks);
            }
        }

        $groups = collect();
        $groupIndex = $assignment->groups()->count() + 1;

        foreach ($chunks as $studentChunk) {
            if (empty($studentChunk)) continue;

            $leaderId = $studentChunk[0];
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
        $enrolledStudents = $this->getCourseStudentIds($assignment);

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

    /**
     * Resolve students for a course with fallback when mahasiswa_courses mapping is still incomplete.
     */
    private function getCourseStudentIds(GroupAssignment $assignment): Collection
    {
        $courseName = trim((string) ($assignment->course->nama ?? ''));
        if (empty($courseName)) {
            return Mahasiswa::query()->pluck('id')->values();
        }

        $enrolled = MahasiswaCourse::query()
            ->where(function ($query) use ($courseName) {
                $query->where('name', $courseName)
                    ->orWhere('name', 'like', $courseName); // Handle simple case variations
            })
            ->pluck('mahasiswa_id')
            ->unique()
            ->values();

        $totalMahasiswa = Mahasiswa::count();
        $enrolledCount = $enrolled->count();

        // ═══════ Leniency Fallback ═══════
        // If enrolled count is suspiciously low (e.g. < 10) or represents less than 50%
        // of total students, we allow all students. This ensures that incomplete
        // mahasiswa_courses data doesn't block the formation process.
        $isSuspiciouslyLow = ($enrolledCount < 10) || ($totalMahasiswa >= 10 && $enrolledCount < ($totalMahasiswa * 0.5));

        if ($isSuspiciouslyLow && $totalMahasiswa > 0) {
            return Mahasiswa::query()->pluck('id')->values();
        }

        return $enrolled;
    }

    // ═══════════════════════════════════════════════════════════════════
    // Force Assign & Auto-Assign Methods
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Calculate the maximum number of groups for an assignment.
     */
    public function calculateMaxGroups(int $totalStudents, int $minMembers): int
    {
        if ($minMembers <= 0) return $totalStudents;
        return (int) ceil($totalStudents / $minMembers);
    }

    /**
     * Get the total number of course students for an assignment.
     */
    public function getTotalCourseStudents(GroupAssignment $assignment): int
    {
        return $this->getCourseStudentIds($assignment)->count();
    }

    /**
     * Validate that creating a new group won't exceed the calculated max groups.
     */
    public function validateMaxGroupsNotExceeded(GroupAssignment $assignment): void
    {
        $totalStudents = $this->getTotalCourseStudents($assignment);
        $maxGroups = $this->calculateMaxGroups($totalStudents, max(2, (int) $assignment->min_members));
        $currentGroupCount = $assignment->groups()->count();

        if ($currentGroupCount >= $maxGroups) {
            throw new \Exception(
                "Maksimal {$maxGroups} kelompok sudah tercapai. Tidak bisa membuat kelompok baru."
            );
        }
    }

    /**
     * Force assign a student to a group (admin/dosen action).
     * If the student is already in another group for this assignment, they are moved.
     */
    public function forceAssignStudent(
        GaGroup $group,
        int $studentId,
        int $forcedBy,
        string $adminType = 'admin',
        ?string $reason = null
    ): GaGroupMember {
        $assignment = $group->assignment;
        $this->validateGroupCapacity($group);

        // Remove from existing group if already assigned
        /** @var \App\Models\GaGroupMember|null $existing */
        $existing = GaGroupMember::whereHas('group', fn (\Illuminate\Database\Eloquent\Builder $q) => $q->where('assignment_id', '=', $assignment->id))
            ->where('student_id', '=', $studentId)
            ->first();

        $action = 'force_assign';
        if ($existing) {
            $action = 'move';
            $oldGroup = $existing->group;
            $wasLeader = $existing->is_leader;
            /** @var \Illuminate\Database\Eloquent\Model $existingModel */
            $existingModel = $existing;
            $existingModel->delete();

            // Handle leader vacancy in old group
            if ($wasLeader) {
                $nextMember = GaGroupMember::where('group_id', '=', $oldGroup->id)->first();
                if ($nextMember) {
                    $nextMember->update(['is_leader' => true]);
                    $oldGroup->update(['leader_id' => $nextMember->student_id]);
                }
            }
        }

        // Add to new group
        $member = GaGroupMember::create([
            'group_id' => $group->id,
            'student_id' => $studentId,
            'is_leader' => false,
            'is_forced' => true,
            'forced_by' => $forcedBy,
            'forced_by_type' => $adminType,
            'forced_reason' => $reason,
            'forced_at' => now(),
        ]);

        // Log the action
        ForceAssignLog::create([
            'assignment_id' => $assignment->id,
            'group_id' => $group->id,
            'student_id' => $studentId,
            'admin_id' => $forcedBy,
            'admin_type' => $adminType,
            'action' => $action,
            'reason' => $reason,
        ]);

        return $member;
    }

    /**
     * Auto-assign all unassigned students evenly across groups that aren't full.
     * Returns the number of students assigned.
     */
    public function autoAssignRemaining(
        GroupAssignment $assignment,
        int $forcedBy,
        string $adminType = 'admin'
    ): array {
        $unassigned = $this->getUnassignedStudents($assignment);
        $groups = $assignment->groups()->withCount('members')->get();
        $config = $assignment;

        $maxMembers = max(2, (int) $config->max_members);
        $assignedCount = 0;

        foreach ($unassigned as $student) {
            // Re-sort groups by member count each iteration for even distribution
            $groups = $groups->sortBy('members_count');

            $targetGroup = $groups->first(function ($g) use ($maxMembers) {
                return $g->members_count < $maxMembers;
            });

            if (!$targetGroup) {
                break; // All groups are full
            }

            GaGroupMember::create([
                'group_id' => $targetGroup->id,
                'student_id' => $student->id,
                'is_leader' => false,
                'is_forced' => true,
                'forced_by' => $forcedBy,
                'forced_by_type' => $adminType,
                'forced_reason' => 'Auto-assigned by system',
                'forced_at' => now(),
            ]);

            ForceAssignLog::create([
                'assignment_id' => $assignment->id,
                'group_id' => $targetGroup->id,
                'student_id' => $student->id,
                'admin_id' => $forcedBy,
                'admin_type' => $adminType,
                'action' => 'auto_assign',
                'reason' => 'Auto-assigned by system',
            ]);

            // Update the local count
            $targetGroup->members_count++;
            $assignedCount++;
        }

        return [
            'assigned_count' => $assignedCount,
            'remaining' => $unassigned->count() - $assignedCount,
        ];
    }

    /**
     * Remove a student from a group. Handles leader succession.
     */
    public function removeStudentFromGroup(GaGroup $group, int $studentId): void
    {
        /** @var \App\Models\GaGroupMember $membership */
        $membership = GaGroupMember::where('group_id', '=', $group->id)
            ->where('student_id', '=', $studentId)
            ->firstOrFail();

        $wasLeader = $membership->is_leader;
        /** @var \Illuminate\Database\Eloquent\Model $membershipModel */
        $membershipModel = $membership;
        $membershipModel->delete();

        if ($wasLeader) {
            $nextMember = GaGroupMember::where('group_id', '=', $group->id)->first();
            if ($nextMember) {
                $nextMember->update(['is_leader' => true]);
                $group->update(['leader_id' => $nextMember->student_id]);
            }
        }
    }

    /**
     * Delete a group entirely. Members become unassigned.
     */
    public function deleteGroup(GaGroup $group): void
    {
        // Members are cascade-deleted by FK, so they automatically become "unassigned"
        /** @var \Illuminate\Database\Eloquent\Model $groupModel */
        $groupModel = $group;
        $groupModel->delete();
    }
}

