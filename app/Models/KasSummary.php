<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KasSummary extends Model
{
    protected $table = 'kas_summary';

    protected $fillable = [
        'total_balance',
        'total_income',
        'total_expense',
        'notes',
    ];

    protected $casts = [
        'total_balance' => 'decimal:2',
        'total_income' => 'decimal:2',
        'total_expense' => 'decimal:2',
    ];

    public static function getSummary(): self
    {
        return self::firstOrCreate([], [
            'total_balance' => 0,
            'total_income' => 0,
            'total_expense' => 0,
        ]);
    }

    public static function recalculate(): self
    {
        $summary = self::getSummary();
        
        $totalIncome = Kas::where('type', 'income')->where('status', 'paid')->sum('amount');
        $totalExpense = Kas::where('type', 'expense')->sum('amount');
        
        $summary->update([
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'total_balance' => $totalIncome - $totalExpense,
        ]);

        return $summary;
    }
}
