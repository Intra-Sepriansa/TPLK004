<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Notification Templates Table
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['email', 'push', 'sms', 'in_app']);
            $table->string('subject')->nullable();
            $table->text('body');
            $table->json('variables')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Notification Campaigns Table
        Schema::create('notification_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('template_id')->nullable()->constrained('notification_templates')->onDelete('set null');
            $table->enum('target_type', ['all', 'role', 'class', 'custom']);
            $table->json('target_filters')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'sending', 'sent', 'failed'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('opened_count')->default(0);
            $table->integer('clicked_count')->default(0);
            $table->timestamps();
        });

        // Notification Logs Table
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->nullable()->constrained('notification_campaigns')->onDelete('cascade');
            $table->morphs('recipient');
            $table->enum('type', ['email', 'push', 'sms', 'in_app']);
            $table->string('subject')->nullable();
            $table->text('body');
            $table->enum('status', ['pending', 'sent', 'delivered', 'opened', 'clicked', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
        });

        // Notification Preferences Table
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->morphs('user');
            $table->boolean('email_enabled')->default(true);
            $table->boolean('push_enabled')->default(true);
            $table->boolean('sms_enabled')->default(false);
            $table->json('categories')->nullable(); // which categories to receive
            $table->time('quiet_hours_start')->nullable();
            $table->time('quiet_hours_end')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_campaigns');
        Schema::dropIfExists('notification_templates');
    }
};
