<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change category from enum to string to allow more categories
        DB::statement("ALTER TABLE badges MODIFY COLUMN category VARCHAR(50) DEFAULT 'achievement'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE badges MODIFY COLUMN category ENUM('attendance', 'streak', 'achievement', 'special') DEFAULT 'achievement'");
    }
};
