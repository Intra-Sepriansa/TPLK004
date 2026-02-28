<?php

namespace App\Services;

use App\Models\Kas;
use App\Models\Mahasiswa;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class KasReminderService
{
    public function getReminderSettings(Mahasiswa $mahasiswa): array
    {
        $defaults = $this->defaultSettings();

        if (! Schema::hasTable('kas_reminder_preferences')) {
            return $defaults;
        }

        $row = DB::table('kas_reminder_preferences')
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (! $row) {
            DB::table('kas_reminder_preferences')->insert([
                'mahasiswa_id' => $mahasiswa->id,
                'enabled' => true,
                'channels' => json_encode($defaults['channels']),
                'timing' => json_encode($defaults['timing']),
                'preferences' => json_encode($defaults['preferences']),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $defaults;
        }

        return [
            'enabled' => (bool) $row->enabled,
            'channels' => $this->decodeJson($row->channels, $defaults['channels']),
            'timing' => $this->decodeJson($row->timing, $defaults['timing']),
            'preferences' => $this->decodeJson($row->preferences, $defaults['preferences']),
        ];
    }

    public function updateReminderPreferences(Mahasiswa $mahasiswa, array $settings): array
    {
        $defaults = $this->defaultSettings();

        $merged = [
            'enabled' => (bool) ($settings['enabled'] ?? $defaults['enabled']),
            'channels' => array_merge($defaults['channels'], $settings['channels'] ?? []),
            'timing' => array_merge($defaults['timing'], $settings['timing'] ?? []),
            'preferences' => array_merge($defaults['preferences'], $settings['preferences'] ?? []),
        ];

        if (! Schema::hasTable('kas_reminder_preferences')) {
            return $merged;
        }

        DB::table('kas_reminder_preferences')->updateOrInsert(
            ['mahasiswa_id' => $mahasiswa->id],
            [
                'enabled' => $merged['enabled'],
                'channels' => json_encode($merged['channels']),
                'timing' => json_encode($merged['timing']),
                'preferences' => json_encode($merged['preferences']),
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );

        return $merged;
    }

    /**
     * Build reminder queue and return upcoming reminders.
     */
    public function scheduleReminders(Mahasiswa $mahasiswa): array
    {
        $settings = $this->getReminderSettings($mahasiswa);

        if (! $settings['enabled']) {
            return [];
        }

        $unpaidRecords = Kas::query()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('type', 'income')
            ->where('status', 'unpaid')
            ->orderBy('period_date')
            ->get();

        $pending = [];

        foreach ($unpaidRecords as $record) {
            $deadline = Carbon::parse($record->period_date)->endOfDay();
            $timings = $this->buildTimingCandidates($deadline, $settings['timing']);

            foreach ($timings as $meta) {
                if ($meta['scheduled_at']->lt(now()->subDay())) {
                    continue;
                }

                $pending[] = [
                    'mahasiswa_id' => $mahasiswa->id,
                    'kas_id' => $record->id,
                    'channel' => 'in_app',
                    'scheduled_at' => $meta['scheduled_at'],
                    'status' => 'scheduled',
                    'message' => sprintf(
                        'Tagihan kas %s sebesar Rp %s akan jatuh tempo %s.',
                        $record->description ?: 'mingguan',
                        number_format((float) $record->amount, 0, ',', '.'),
                        $deadline->translatedFormat('d F Y'),
                    ),
                    'meta' => [
                        'timing_key' => $meta['timing_key'],
                        'deadline' => $deadline->toDateString(),
                    ],
                ];
            }
        }

        if (Schema::hasTable('kas_reminders')) {
            $hasKasIdColumn = Schema::hasColumn('kas_reminders', 'kas_id');
            $hasKasRecordIdColumn = Schema::hasColumn('kas_reminders', 'kas_record_id');
            $hasChannelColumn = Schema::hasColumn('kas_reminders', 'channel');
            $hasScheduledAtColumn = Schema::hasColumn('kas_reminders', 'scheduled_at');
            $hasStatusColumn = Schema::hasColumn('kas_reminders', 'status');
            $hasMetadataColumn = Schema::hasColumn('kas_reminders', 'metadata');
            $hasCreatedAtColumn = Schema::hasColumn('kas_reminders', 'created_at');
            $hasUpdatedAtColumn = Schema::hasColumn('kas_reminders', 'updated_at');
            $supportsScheduledStatuses = $this->supportsScheduledStatuses();

            $kasReferenceColumn = $hasKasIdColumn
                ? 'kas_id'
                : ($hasKasRecordIdColumn ? 'kas_record_id' : null);

            // Legacy schema compatibility:
            // if table exists but doesn't support scheduling columns/status, return computed reminders only.
            if (! $hasChannelColumn || ! $hasScheduledAtColumn || ! $hasStatusColumn || ! $supportsScheduledStatuses) {
                return collect($pending)
                    ->sortBy('scheduled_at')
                    ->take(8)
                    ->map(fn ($row, $index) => [
                        'id' => $index + 1,
                        'channel' => $row['channel'],
                        'scheduled_at' => $row['scheduled_at']->toDateTimeString(),
                        'status' => $row['status'],
                        'message' => $row['message'],
                    ])
                    ->values()
                    ->all();
            }

            foreach ($pending as $reminder) {
                $existsQuery = DB::table('kas_reminders')
                    ->where('mahasiswa_id', $reminder['mahasiswa_id'])
                    ->where('channel', $reminder['channel'])
                    ->where('scheduled_at', $reminder['scheduled_at']);

                if ($kasReferenceColumn !== null) {
                    $existsQuery->where($kasReferenceColumn, $reminder['kas_id']);
                }

                $exists = $existsQuery->exists();

                if ($exists) {
                    continue;
                }

                $insertData = [
                    'mahasiswa_id' => $reminder['mahasiswa_id'],
                    'channel' => $reminder['channel'],
                    'scheduled_at' => $reminder['scheduled_at'],
                    'status' => $reminder['status'],
                ];

                if ($kasReferenceColumn !== null) {
                    $insertData[$kasReferenceColumn] = $reminder['kas_id'];
                }

                if ($hasMetadataColumn) {
                    $insertData['metadata'] = json_encode([
                        'message' => $reminder['message'],
                        'meta' => $reminder['meta'],
                    ]);
                }

                if ($hasCreatedAtColumn) {
                    $insertData['created_at'] = now();
                }

                if ($hasUpdatedAtColumn) {
                    $insertData['updated_at'] = now();
                }

                DB::table('kas_reminders')->insert($insertData);
            }

            return DB::table('kas_reminders')
                ->where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('status', ['scheduled', 'snoozed'])
                ->orderBy('scheduled_at')
                ->limit(8)
                ->get()
                ->map(function ($row) {
                    $meta = $this->decodeJson($row->metadata ?? null, []);

                    return [
                        'id' => (int) $row->id,
                        'channel' => (string) ($row->channel ?? 'in_app'),
                        'scheduled_at' => Carbon::parse($row->scheduled_at)->toDateTimeString(),
                        'status' => (string) $row->status,
                        'message' => $meta['message'] ?? 'Reminder pembayaran kas',
                    ];
                })
                ->values()
                ->all();
        }

        return collect($pending)
            ->sortBy('scheduled_at')
            ->take(8)
            ->map(fn ($row, $index) => [
                'id' => $index + 1,
                'channel' => $row['channel'],
                'scheduled_at' => $row['scheduled_at']->toDateTimeString(),
                'status' => $row['status'],
                'message' => $row['message'],
            ])
            ->values()
            ->all();
    }

    public function snoozeReminder(Mahasiswa $mahasiswa, int $reminderId, int $hours = 3): bool
    {
        if (! Schema::hasTable('kas_reminders')) {
            return false;
        }

        if (! Schema::hasColumn('kas_reminders', 'scheduled_at')) {
            return false;
        }

        $reminder = DB::table('kas_reminders')
            ->where('id', $reminderId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (! $reminder) {
            return false;
        }

        DB::table('kas_reminders')
            ->where('id', $reminderId)
            ->update(array_filter([
                'scheduled_at' => Carbon::parse($reminder->scheduled_at)->addHours($hours),
                'status' => (Schema::hasColumn('kas_reminders', 'status') && $this->supportsScheduledStatuses()) ? 'snoozed' : null,
                'updated_at' => Schema::hasColumn('kas_reminders', 'updated_at') ? now() : null,
            ], static fn ($value) => $value !== null));

        return true;
    }

    private function supportsScheduledStatuses(): bool
    {
        if (! Schema::hasTable('kas_reminders') || ! Schema::hasColumn('kas_reminders', 'status')) {
            return false;
        }

        $column = DB::table('information_schema.columns')
            ->select('column_type')
            ->whereRaw('table_schema = DATABASE()')
            ->where('table_name', 'kas_reminders')
            ->where('column_name', 'status')
            ->first();

        if (! $column || ! isset($column->column_type)) {
            return true;
        }

        $columnType = strtolower((string) $column->column_type);
        if (str_starts_with($columnType, 'enum(')) {
            return str_contains($columnType, "'scheduled'")
                && str_contains($columnType, "'snoozed'");
        }

        return true;
    }

    private function buildTimingCandidates(Carbon $deadline, array $timing): array
    {
        $candidates = [];

        if (($timing['days7Before'] ?? false) === true) {
            $candidates[] = [
                'timing_key' => 'days7Before',
                'scheduled_at' => $deadline->copy()->subDays(7)->setTime(8, 0),
            ];
        }

        if (($timing['days3Before'] ?? false) === true) {
            $candidates[] = [
                'timing_key' => 'days3Before',
                'scheduled_at' => $deadline->copy()->subDays(3)->setTime(8, 0),
            ];
        }

        if (($timing['days1Before'] ?? false) === true) {
            $candidates[] = [
                'timing_key' => 'days1Before',
                'scheduled_at' => $deadline->copy()->subDay()->setTime(8, 0),
            ];
        }

        if (($timing['onDeadline'] ?? false) === true) {
            $candidates[] = [
                'timing_key' => 'onDeadline',
                'scheduled_at' => $deadline->copy()->setTime(8, 0),
            ];
        }

        if (($timing['days1After'] ?? false) === true) {
            $candidates[] = [
                'timing_key' => 'days1After',
                'scheduled_at' => $deadline->copy()->addDay()->setTime(8, 0),
            ];
        }

        return $candidates;
    }

    private function decodeJson(?string $value, array $fallback): array
    {
        if (! $value) {
            return $fallback;
        }

        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : $fallback;
    }

    private function defaultSettings(): array
    {
        return [
            'enabled' => true,
            'channels' => [
                'inApp' => true,
                'email' => false,
                'whatsapp' => false,
                'sms' => false,
            ],
            'timing' => [
                'days7Before' => true,
                'days3Before' => true,
                'days1Before' => true,
                'onDeadline' => true,
                'days1After' => true,
                'custom' => [],
            ],
            'preferences' => [
                'frequency' => 'once',
                'quietHours' => [
                    'start' => '22:00',
                    'end' => '06:00',
                ],
            ],
        ];
    }
}
