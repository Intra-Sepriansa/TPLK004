<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kas', function (Blueprint $table) {
            $table->id();
            $table->integer('mahasiswa_id');
            $table->enum('type', ['income', 'expense'])->default('income');
            $table->decimal('amount', 12, 2);
            $table->string('description')->nullable();
            $table->string('category')->default('kas_mingguan'); // kas_mingguan, denda, lainnya
            $table->date('period_date'); // tanggal periode kas
            $table->enum('status', ['paid', 'unpaid', 'partial'])->default('unpaid');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
        });

        // Tabel untuk saldo kas keseluruhan
        Schema::create('kas_summary', function (Blueprint $table) {
            $table->id();
            $table->decimal('total_balance', 15, 2)->default(0);
            $table->decimal('total_income', 15, 2)->default(0);
            $table->decimal('total_expense', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kas_summary');
        Schema::dropIfExists('kas');
    }
};
