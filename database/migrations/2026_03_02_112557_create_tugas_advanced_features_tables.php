<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add new columns to tugas table
        Schema::table('tugas', function (Blueprint $table) {
            if (!Schema::hasColumn('tugas', 'template_id')) {
                $table->unsignedBigInteger('template_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('tugas', 'is_template')) {
                $table->boolean('is_template')->default(false)->after('id');
            }
            if (!Schema::hasColumn('tugas', 'schedule_type')) {
                $table->enum('schedule_type', ['immediate', 'scheduled', 'recurring'])->default('immediate')->after('is_template');
            }
            if (!Schema::hasColumn('tugas', 'publish_at')) {
                $table->dateTime('publish_at')->nullable()->after('schedule_type');
            }
            if (!Schema::hasColumn('tugas', 'recurring_pattern')) {
                $table->json('recurring_pattern')->nullable()->after('publish_at');
            }
            if (!Schema::hasColumn('tugas', 'collaboration_type')) {
                $table->enum('collaboration_type', ['individual', 'group', 'peer_review'])->default('individual')->after('recurring_pattern');
            }
            if (!Schema::hasColumn('tugas', 'collaboration_settings')) {
                $table->json('collaboration_settings')->nullable()->after('collaboration_type');
            }
            if (!Schema::hasColumn('tugas', 'estimated_hours')) {
                $table->integer('estimated_hours')->nullable()->after('collaboration_settings');
            }
            if (!Schema::hasColumn('tugas', 'ai_generated')) {
                $table->boolean('ai_generated')->default(false)->after('estimated_hours');
            }
        });

        // Create tugas_templates table
        if (!Schema::hasTable('tugas_templates')) {
            Schema::create('tugas_templates', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('category', 100)->nullable();
                $table->json('fields');
                $table->integer('usage_count')->default(0);
                $table->boolean('is_favorite')->default(false);
                $table->dateTime('last_used_at')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Create tugas_dependencies table
        if (!Schema::hasTable('tugas_dependencies')) {
            Schema::create('tugas_dependencies', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('tugas_id');
                $table->unsignedBigInteger('depends_on_tugas_id');
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('tugas_id')->references('id')->on('tugas')->onDelete('cascade');
                $table->foreign('depends_on_tugas_id')->references('id')->on('tugas')->onDelete('cascade');
                $table->unique(['tugas_id', 'depends_on_tugas_id'], 'tugas_dependencies_unique');
            });
        }

        // Create tugas_reminders table
        if (!Schema::hasTable('tugas_reminders')) {
            Schema::create('tugas_reminders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('tugas_id');
                $table->enum('type', ['before_deadline', 'custom'])->default('before_deadline');
                $table->integer('value');
                $table->enum('unit', ['minutes', 'hours', 'days', 'weeks']);
                $table->boolean('enabled')->default(true);
                $table->dateTime('sent_at')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('tugas_id')->references('id')->on('tugas')->onDelete('cascade');
            });
        }

        // Create tugas_attachments table
        if (!Schema::hasTable('tugas_attachments')) {
            Schema::create('tugas_attachments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('tugas_id');
                $table->string('file_name');
                $table->string('file_path', 500);
                $table->string('file_type', 100)->nullable();
                $table->bigInteger('file_size')->nullable();
                $table->unsignedBigInteger('uploaded_by');
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('tugas_id')->references('id')->on('tugas')->onDelete('cascade');
                $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas_attachments');
        Schema::dropIfExists('tugas_reminders');
        Schema::dropIfExists('tugas_dependencies');
        Schema::dropIfExists('tugas_templates');
        
        Schema::table('tugas', function (Blueprint $table) {
            $table->dropColumn([
                'template_id', 
                'is_template', 
                'schedule_type', 
                'publish_at', 
                'recurring_pattern', 
                'collaboration_type', 
                'collaboration_settings', 
                'estimated_hours', 
                'ai_generated'
            ]);
        });
    }
};
