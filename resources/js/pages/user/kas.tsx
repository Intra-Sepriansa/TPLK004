import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Wallet, CheckCircle, XCircle, TrendingUp, TrendingDown, Calendar, DollarSign, Receipt, AlertCircle } from 'lucide-react';

interface KasRecord {
    id: number;
    amount: number;
    status: string;
    period_date: string;
    period_month: string;
    description: string;
    category: string;
}

interface PersonalStats {
    total_paid: number;
    total_unpaid: number;
    paid_count: number;
    unpaid_count: number;
}

interface ClassSummary {
    total_balance: number;
    total_income: number;
    total_expense: number;
}

interface Expense {
    id: number;
    amount: number;
    description: string;
    period_date: string;
}

interface MonthlyBreakdown {
    month: string;
    total: number;
    paid: number;
    unpaid: number;
}

interface PageProps {
    mahasiswa: { id: number; nama: string; nim: string };
    kasRecords: KasRecord[];
    personalStats: PersonalStats;
    classSummary: ClassSummary;
    recentExpenses: Expense[];
    monthlyBreakdown: MonthlyBreakdown[];
}

export default function UserKas({ mahasiswa, kasRecords, personalStats, classSummary, recentExpenses, monthlyBreakdown }: PageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <StudentLayout>
            <Head title="Uang Kas" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Keuangan Kelas</p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Uang Kas Saya</h1>
                    </div>
                    {personalStats.total_unpaid > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Tunggakan: {formatCurrency(personalStats.total_unpaid)}</span>
                        </div>
                    )}
                </div>

                {/* Personal Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Sudah Dibayar</p>
                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(personalStats.total_paid)}</p>
                                <p className="text-xs text-slate-400">{personalStats.paid_count} pembayaran</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Belum Dibayar</p>
                                <p className="text-xl font-bold text-red-600">{formatCurrency(personalStats.total_unpaid)}</p>
                                <p className="text-xs text-slate-400">{personalStats.unpaid_count} tunggakan</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Saldo Kas Kelas</p>
                                <p className="text-xl font-bold text-blue-600">{formatCurrency(classSummary.total_balance)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Pengeluaran</p>
                                <p className="text-xl font-bold text-purple-600">{formatCurrency(classSummary.total_expense)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Pembayaran Saya</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto">
                            {kasRecords.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Wallet className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                    <p>Belum ada data pembayaran</p>
                                </div>
                            ) : kasRecords.map(record => (
                                <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${record.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {record.status === 'paid' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{record.description || 'Kas Mingguan'}</p>
                                            <p className="text-xs text-slate-500">{record.period_date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${record.status === 'paid' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(record.amount)}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${record.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {record.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Class Expenses */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Pengeluaran Kelas</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto">
                            {recentExpenses.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Receipt className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                    <p>Belum ada pengeluaran</p>
                                </div>
                            ) : recentExpenses.map(expense => (
                                <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{expense.description}</p>
                                        <p className="text-xs text-slate-500">{expense.period_date}</p>
                                    </div>
                                    <p className="font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Informasi Pembayaran</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Pembayaran kas dilakukan setiap minggu. Jika ada tunggakan, segera hubungi bendahara kelas untuk melakukan pembayaran.
                                Status pembayaran akan diupdate oleh admin setelah konfirmasi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
