<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->addTugasColumns();
        $this->addAcademicTaskColumns();
        $this->addAttachmentColumns();
        $this->createTemplateTable();
        $this->createDependencyTable();
        $this->createReminderTable();
    }

    public function down(): void
    {
        if (Schema::hasTable('tugas_reminders')) {
            Schema::drop('tugas_reminders');
        }

        if (Schema::hasTable('tugas_dependencies')) {
            Schema::drop('tugas_dependencies');
        }

        if (Schema::hasTable('tugas_templates')) {
            Schema::drop('tugas_templates');
        }

        if (Schema::hasTable('tugas_attachments')) {
            Schema::table('tugas_attachments', function (Blueprint $table) {
                if (Schema::hasColumn('tugas_attachments', 'uploaded_by_type')) {
                    $table->dropColumn('uploaded_by_type');
                }
                if (Schema::hasColumn('tugas_attachments', 'uploaded_by_id')) {
                    $table->dropColumn('uploaded_by_id');
                }
            });
        }

        if (Schema::hasTable('academic_tasks')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $columns = [
                    'category',
                    'priority',
                    'schedule_type',
                    'publish_at',
                    'recurring_pattern',
                    'reminders',
                    'dependencies',
                    'attachments',
                    'estimated_hours',
                    'ai_generated',
                    'template_id',
                    'metadata',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('academic_tasks', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('tugas')) {
            Schema::table('tugas', function (Blueprint $table) {
                $columns = [
                    'template_id',
                    'is_template',
                    'schedule_type',
                    'publish_at',
                    'recurring_pattern',
                    'collaboration_type',
                    'collaboration_settings',
                    'estimated_hours',
                    'ai_generated',
                    'bobot_nilai',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('tugas', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }

    private function addTugasColumns(): void
    {
        if (!Schema::hasTable('tugas')) {
            return;
        }

        if (!Schema::hasColumn('tugas', 'template_id')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->unsignedBigInteger('template_id')->nullable()->after('course_id');
            });
        }

        if (!Schema::hasColumn('tugas', 'is_template')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->boolean('is_template')->default(false)->after('template_id');
            });
        }

        if (!Schema::hasColumn('tugas', 'schedule_type')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->enum('schedule_type', ['immediate', 'scheduled', 'recurring'])->default('immediate')->after('status');
            });
        }

        if (!Schema::hasColumn('tugas', 'publish_at')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->dateTime('publish_at')->nullable()->after('schedule_type');
            });
        }

        if (!Schema::hasColumn('tugas', 'recurring_pattern')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->json('recurring_pattern')->nullable()->after('publish_at');
            });
        }

        if (!Schema::hasColumn('tugas', 'collaboration_type')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->enum('collaboration_type', ['individual', 'group', 'peer_review'])->default('individual')->after('recurring_pattern');
            });
        }

        if (!Schema::hasColumn('tugas', 'collaboration_settings')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->json('collaboration_settings')->nullable()->after('collaboration_type');
            });
        }

        if (!Schema::hasColumn('tugas', 'estimated_hours')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->unsignedInteger('estimated_hours')->nullable()->after('deadline');
            });
        }

        if (!Schema::hasColumn('tugas', 'ai_generated')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->boolean('ai_generated')->default(false)->after('estimated_hours');
            });
        }

        if (!Schema::hasColumn('tugas', 'bobot_nilai')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->decimal('bobot_nilai', 5, 2)->nullable()->after('ai_generated');
            });
        }
    }

    private function addAcademicTaskColumns(): void
    {
        if (!Schema::hasTable('academic_tasks')) {
            return;
        }

        if (!Schema::hasColumn('academic_tasks', 'category')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->string('category', 100)->default('Tugas')->after('description');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'priority')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->enum('priority', ['Rendah', 'Sedang', 'Tinggi', 'Urgent'])->default('Sedang')->after('category');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'schedule_type')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->enum('schedule_type', ['immediate', 'scheduled', 'recurring'])->default('immediate')->after('status');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'publish_at')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->dateTime('publish_at')->nullable()->after('schedule_type');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'recurring_pattern')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->json('recurring_pattern')->nullable()->after('publish_at');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'reminders')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->json('reminders')->nullable()->after('recurring_pattern');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'dependencies')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->json('dependencies')->nullable()->after('reminders');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'attachments')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->json('attachments')->nullable()->after('dependencies');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'estimated_hours')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->unsignedInteger('estimated_hours')->nullable()->after('attachments');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'ai_generated')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->boolean('ai_generated')->default(false)->after('estimated_hours');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'template_id')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->unsignedBigInteger('template_id')->nullable()->after('ai_generated');
            });
        }

        if (!Schema::hasColumn('academic_tasks', 'metadata')) {
            Schema::table('academic_tasks', function (Blueprint $table) {
                $table->json('metadata')->nullable()->after('template_id');
            });
        }
    }

    private function addAttachmentColumns(): void
    {
        if (!Schema::hasTable('tugas_attachments')) {
            return;
        }

        if (!Schema::hasColumn('tugas_attachments', 'uploaded_by_type')) {
            Schema::table('tugas_attachments', function (Blueprint $table) {
                $table->enum('uploaded_by_type', ['dosen', 'mahasiswa', 'admin'])->nullable()->after('file_size');
            });
        }

        if (!Schema::hasColumn('tugas_attachments', 'uploaded_by_id')) {
            Schema::table('tugas_attachments', function (Blueprint $table) {
                $table->unsignedBigInteger('uploaded_by_id')->nullable()->after('uploaded_by_type');
            });
        }
    }

    private function createTemplateTable(): void
    {
        if (Schema::hasTable('tugas_templates')) {
            return;
        }

        Schema::create('tugas_templates', function (Blueprint $table) {
            $table->id();
            $table->enum('owner_type', ['dosen', 'mahasiswa', 'admin'])->default('dosen');
            $table->unsignedBigInteger('owner_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable();
            $table->json('fields');
            $table->unsignedInteger('usage_count')->default(0);
            $table->boolean('is_favorite')->default(false);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index(['owner_type', 'owner_id']);
            $table->index(['category', 'is_favorite']);
        });
    }

    private function createDependencyTable(): void
    {
        if (Schema::hasTable('tugas_dependencies')) {
            return;
        }

        Schema::create('tugas_dependencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->cascadeOnDelete();
            $table->foreignId('depends_on_tugas_id')->constrained('tugas')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['tugas_id', 'depends_on_tugas_id']);
        });
    }

    private function createReminderTable(): void
    {
        if (Schema::hasTable('tugas_reminders')) {
            return;
        }

        Schema::create('tugas_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->cascadeOnDelete();
            $table->enum('type', ['before_deadline', 'custom'])->default('before_deadline');
            $table->unsignedInteger('value');
            $table->enum('unit', ['minutes', 'hours', 'days', 'weeks']);
            $table->boolean('enabled')->default(true);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['enabled', 'sent_at']);
        });
    }
};
