<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('kas_financial_intelligence')) {
            Schema::create('kas_financial_intelligence', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mahasiswa_id')->unique();
                $table->unsignedTinyInteger('health_score')->default(0);
                $table->unsignedInteger('payment_streak')->default(0);
                $table->unsignedInteger('longest_streak')->default(0);
                $table->string('behavior_type', 20)->default('inconsistent');
                $table->json('insights')->nullable();
                $table->json('recommendations')->nullable();
                $table->timestamp('last_calculated_at')->nullable();
                $table->timestamps();

                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('kas_payment_predictions')) {
            Schema::create('kas_payment_predictions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mahasiswa_id')->unique();
                $table->date('predicted_date')->nullable();
                $table->enum('confidence_level', ['low', 'medium', 'high'])->default('low');
                $table->enum('risk_level', ['low', 'medium', 'high'])->default('low');
                $table->json('risk_factors')->nullable();
                $table->date('optimal_payment_date')->nullable();
                $table->json('forecast')->nullable();
                $table->timestamps();

                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('kas_reminder_preferences')) {
            Schema::create('kas_reminder_preferences', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mahasiswa_id')->unique();
                $table->boolean('enabled')->default(true);
                $table->json('channels')->nullable();
                $table->json('timing')->nullable();
                $table->json('preferences')->nullable();
                $table->timestamps();

                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('kas_reminders')) {
            Schema::create('kas_reminders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mahasiswa_id');
                $table->unsignedBigInteger('kas_id')->nullable();
                $table->string('channel', 20)->default('in_app');
                $table->timestamp('scheduled_at')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->enum('status', ['scheduled', 'sent', 'failed', 'snoozed'])->default('scheduled');
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->onDelete('cascade');

                $table->foreign('kas_id')
                    ->references('id')
                    ->on('kas')
                    ->onDelete('set null');

                $table->index(['mahasiswa_id', 'scheduled_at']);
                $table->index(['status', 'scheduled_at']);
            });
        } else {
            Schema::table('kas_reminders', function (Blueprint $table) {
                if (! Schema::hasColumn('kas_reminders', 'kas_id')) {
                    $table->unsignedBigInteger('kas_id')->nullable();
                }
                if (! Schema::hasColumn('kas_reminders', 'channel')) {
                    $table->string('channel', 20)->default('in_app');
                }
                if (! Schema::hasColumn('kas_reminders', 'scheduled_at')) {
                    $table->timestamp('scheduled_at')->nullable();
                }
                if (! Schema::hasColumn('kas_reminders', 'sent_at')) {
                    $table->timestamp('sent_at')->nullable();
                }
                if (! Schema::hasColumn('kas_reminders', 'metadata')) {
                    $table->json('metadata')->nullable();
                }
                if (! Schema::hasColumn('kas_reminders', 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }
                if (! Schema::hasColumn('kas_reminders', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }
            });
        }

        if (! Schema::hasTable('kas_achievements')) {
            Schema::create('kas_achievements', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mahasiswa_id');
                $table->string('achievement_key', 50);
                $table->string('name', 120);
                $table->text('description')->nullable();
                $table->unsignedInteger('progress')->default(0);
                $table->unsignedInteger('target')->default(1);
                $table->boolean('unlocked')->default(false);
                $table->timestamp('unlocked_at')->nullable();
                $table->timestamps();

                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->onDelete('cascade');

                $table->unique(['mahasiswa_id', 'achievement_key']);
            });
        }

        if (! Schema::hasTable('kas_reward_points')) {
            Schema::create('kas_reward_points', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('mahasiswa_id');
                $table->integer('points');
                $table->string('action', 80);
                $table->json('metadata')->nullable();
                $table->timestamp('earned_at');
                $table->timestamps();

                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->onDelete('cascade');

                $table->index(['mahasiswa_id', 'earned_at']);
            });
        }

        if (! Schema::hasTable('kas_payment_receipts')) {
            Schema::create('kas_payment_receipts', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('kas_id');
                $table->unsignedBigInteger('mahasiswa_id')->nullable();
                $table->string('image_url');
                $table->json('ocr_data')->nullable();
                $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
                $table->unsignedBigInteger('reviewed_by')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();

                $table->foreign('kas_id')
                    ->references('id')
                    ->on('kas')
                    ->onDelete('cascade');

                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->onDelete('set null');

                $table->foreign('reviewed_by')
                    ->references('id')
                    ->on('users')
                    ->onDelete('set null');

                $table->index(['status', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('kas_payment_receipts');
        Schema::dropIfExists('kas_reward_points');
        Schema::dropIfExists('kas_achievements');
        Schema::dropIfExists('kas_reminder_preferences');
        Schema::dropIfExists('kas_payment_predictions');
        Schema::dropIfExists('kas_financial_intelligence');
    }
};
