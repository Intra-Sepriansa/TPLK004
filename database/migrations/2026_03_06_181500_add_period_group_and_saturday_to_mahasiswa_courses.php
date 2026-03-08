<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('mahasiswa_courses')) {
            return;
        }

        if (!Schema::hasColumn('mahasiswa_courses', 'period_group')) {
            Schema::table('mahasiswa_courses', function (Blueprint $table) {
                $table->unsignedTinyInteger('period_group')->nullable()->after('mode');
            });
        }

        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement(
                "ALTER TABLE mahasiswa_courses
                 MODIFY COLUMN schedule_day ENUM('monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL"
            );
        }

        $onlineDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        DB::table('mahasiswa_courses')
            ->select('id', 'mahasiswa_id')
            ->orderBy('mahasiswa_id')
            ->orderBy('id')
            ->get()
            ->groupBy('mahasiswa_id')
            ->each(function ($rows) use ($onlineDays): void {
                $orderedRows = $rows->values();
                $periodOneLimit = (int) ceil($orderedRows->count() / 2);

                foreach ($orderedRows as $index => $row) {
                    $periodGroup = $index < $periodOneLimit ? 1 : 2;

                    DB::table('mahasiswa_courses')
                        ->where('id', $row->id)
                        ->update([
                            'period_group' => $periodGroup,
                            'schedule_day' => $onlineDays[$index % count($onlineDays)],
                            'mode' => $periodGroup === 1 ? 'offline' : 'online',
                        ]);
                }
            });

    }

    public function down(): void
    {
        if (!Schema::hasTable('mahasiswa_courses')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::table('mahasiswa_courses')
                ->where('schedule_day', 'saturday')
                ->update(['schedule_day' => 'monday']);

            DB::statement(
                "ALTER TABLE mahasiswa_courses
                 MODIFY COLUMN schedule_day ENUM('monday','tuesday','wednesday','thursday','friday') NOT NULL"
            );
        }

        if (Schema::hasColumn('mahasiswa_courses', 'period_group')) {
            Schema::table('mahasiswa_courses', function (Blueprint $table) {
                $table->dropColumn('period_group');
            });
        }
    }
};
