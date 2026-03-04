<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ga_groups', function (Blueprint $table) {
            $table->unsignedInteger('slot_number')->nullable()->after('leader_id');
            $table->unique(['assignment_id', 'slot_number'], 'ga_groups_assignment_slot_unique');
        });
    }

    public function down(): void
    {
        Schema::table('ga_groups', function (Blueprint $table) {
            $table->dropUnique('ga_groups_assignment_slot_unique');
            $table->dropColumn('slot_number');
        });
    }
};

