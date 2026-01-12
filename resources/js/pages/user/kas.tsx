import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Wallet, TrendingUp, TrendingDown, CheckCircle, XCircle, Receipt, DollarSign } from 'lucide-react';

interface KasRecord {
    id: number;
    amount: number;
    status: string;
    period_date: string;
    period_display: string;
    description: string;
    category: string;
}

interface Expense {
    id: number;
    amount: number;
    description: string;
    period_date: string;
    period_display: string;
    category: string;
}

interface PageProps {
    mahasiswa: { id: number; nama: string; nim: string };
    kasRecords: KasRecord[];
    personalStats: { total_paid: number; total_unpaid: number; paid_count: number; unpaid_count: number };
    classSummary: { total_balance: number; total_income: number; total_expense: number };
    recentExpenses: Expense[];
}

export default function UserKas({ mahasiswa, kasRecords, personalStats, classSummary, recentExpenses }: PageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <StudentLayout>
            <Head title="Uang Kas" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100">Keuangan Kelas</p>
                                <h1 className="text-2xl font-bold">Uang Kas Saya</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Sudah Bayar</p>
                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(personalStats.total_paid)}</p>
                                <p className="text-xs text-slate-400">{personalStats.paid_count} pertemuan</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Belum Bayar</p>
                                <p className="text-xl font-bold text-red-600">{formatCurrency(personalStats.total_unpaid)}</p>
                                <p className="text-xs text-slate-400">{personalStats.unpaid_count} pertemuan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class Summary */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        Saldo Kas Kelas
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Saldo Aktif</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(classSummary.total_balance)}</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Total Uang Masuk</p>
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(classSummary.total_income)}</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Total Uang Keluar</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(classSummary.total_expense)}</p>
                        </div>
                    </div>
                </div>

                {/* My Payment History */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-emerald-600" />
                            Riwayat Pembayaran Saya
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {kasRecords.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Belum ada tagihan kas</div>
                        ) : kasRecords.map(record => (
                            <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{record.period_display}</p>
                                    <p className="text-xs text-slate-500">{record.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(record.amount)}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${record.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {record.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Class Expenses */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            Pengeluaran Kelas Terbaru
                        </h2>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentExpenses.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Belum ada pengeluaran</div>
                        ) : recentExpenses.map(expense => (
                            <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{expense.description}</p>
                                    <p className="text-xs text-slate-500">{expense.period_display}</p>
                                </div>
                                <p className="font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
