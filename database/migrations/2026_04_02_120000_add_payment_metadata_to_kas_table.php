<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kas', function (Blueprint $table) {
            if (! Schema::hasColumn('kas', 'payment_method')) {
                $table->string('payment_method', 20)->nullable()->after('status');
            }

            if (! Schema::hasColumn('kas', 'payment_reference')) {
                $table->string('payment_reference')->nullable()->after('payment_method');
            }

            if (! Schema::hasColumn('kas', 'payment_note')) {
                $table->text('payment_note')->nullable()->after('payment_reference');
            }

            if (! Schema::hasColumn('kas', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_note');
            }
        });
    }

    public function down(): void
    {
        Schema::table('kas', function (Blueprint $table) {
            $columns = [];

            foreach (['payment_method', 'payment_reference', 'payment_note', 'paid_at'] as $column) {
                if (Schema::hasColumn('kas', $column)) {
                    $columns[] = $column;
                }
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
