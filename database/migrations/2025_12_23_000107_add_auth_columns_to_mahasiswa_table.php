<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            if (! Schema::hasColumn('mahasiswa', 'password')) {
                $table->string('password')->nullable()->after('nim');
            }
            if (! Schema::hasColumn('mahasiswa', 'remember_token')) {
                $table->rememberToken()->nullable()->after('password');
            }
            if (! Schema::hasColumn('mahasiswa', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            }
        });

        $students = DB::table('mahasiswa')
            ->select('id', 'nim', 'password')
            ->get();

        foreach ($students as $student) {
            if (! empty($student->password)) {
                continue;
            }

            $suffix = substr($student->nim, -2);
            $defaultPassword = 'tplk004#' . $suffix;

            DB::table('mahasiswa')
                ->where('id', $student->id)
                ->update([
                    'password' => Hash::make($defaultPassword),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            if (Schema::hasColumn('mahasiswa', 'remember_token')) {
                $table->dropColumn('remember_token');
            }
            if (Schema::hasColumn('mahasiswa', 'password')) {
                $table->dropColumn('password');
            }
            if (Schema::hasColumn('mahasiswa', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }
};
