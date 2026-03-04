<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_assignments', function (Blueprint $table) {
            $table->unsignedInteger('random_group_count')->nullable()->after('allow_resubmission');
            $table->unsignedTinyInteger('random_group_size')->nullable()->after('random_group_count');
            $table->unsignedInteger('self_form_group_count')->nullable()->after('random_group_size');
            $table->unsignedTinyInteger('self_form_group_size')->nullable()->after('self_form_group_count');
        });
    }

    public function down(): void
    {
        Schema::table('group_assignments', function (Blueprint $table) {
            $table->dropColumn([
                'random_group_count',
                'random_group_size',
                'self_form_group_count',
                'self_form_group_size',
            ]);
        });
    }
};

