<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('setting_histories', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key')->index();
            $table->string('setting_label')->nullable();
            $table->longText('old_value')->nullable();
            $table->longText('new_value')->nullable();
            $table->string('change_type', 20)->default('update')->index();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->nullable()->index();
        });

        Schema::create('setting_backups', function (Blueprint $table) {
            $table->id();
            $table->string('backup_name');
            $table->text('backup_description')->nullable();
            $table->json('settings_data');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->unsignedInteger('settings_count')->default(0);
            $table->boolean('is_auto_backup')->default(false);
            $table->boolean('can_restore')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('setting_backups');
        Schema::dropIfExists('setting_histories');
    }
};
