import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Wallet, Plus, Search, CheckCircle, XCircle, TrendingUp, TrendingDown, Users, Calendar, DollarSign, Receipt, Edit, Trash2, Check } from 'lucide-react';
import { useState } from 'react';

interface MahasiswaKas {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    total_paid: number;
    total_unpaid: number;
    status: string;
    records: { id: number; amount: number; status: string; period_date: string; description: string }[];
}

interface Summary {
    total_balance: number;
    total_income: number;
    total_expense: number;
    monthly_income: number;
    monthly_expense: number;
    paid_count: number;
    unpaid_count: number;
}

interface Transaction {
    id: number;
    mahasiswa: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    category: string;
    period_date: string;
    created_at: string;
}

interface Expense {
    id: number;
    amount: number;
    description: string;
    category: string;
    period_date: string;
    created_at: string;
}

interface PageProps {
    mahasiswaList: MahasiswaKas[];
    summary: Summary;
    recentTransactions: Transaction[];
    expenses: Expense[];
    filters: { search: string; status: string; month: string };
}

export default function AdminKas({ mahasiswaList, summary, recentTransactions, expenses, filters }: PageProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search);

    const markPaidForm = useForm({
        mahasiswa_id: 0,
        amount: 5000,
        period_date: new Date().toISOString().split('T')[0],
    });

    const expenseForm = useForm({
        amount: 0,
        description: '',
        category: 'pengeluaran',
        period_date: new Date().toISOString().split('T')[0],
    });

    const bulkForm = useForm({
        mahasiswa_ids: [] as number[],
        amount: 5000,
        period_date: new Date().toISOString().split('T')[0],
    });

    const handleFilter = (key: string, value: string) => {
        router.get('/admin/kas', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleMarkPaid = (mahasiswaId: number) => {
        markPaidForm.setData('mahasiswa_id', mahasiswaId);
        router.post('/admin/kas/mark-paid', {
            mahasiswa_id: mahasiswaId,
            amount: 5000,
            period_date: new Date().toISOString().split('T')[0],
        });
    };

    const handleBulkMarkPaid = () => {
        if (selectedMahasiswa.length === 0) return;
        bulkForm.setData('mahasiswa_ids', selectedMahasiswa);
        router.post('/admin/kas/bulk-mark-paid', {
            mahasiswa_ids: selectedMahasiswa,
            amount: 5000,
            period_date: new Date().toISOString().split('T')[0],
        }, {
            onSuccess: () => setSelectedMahasiswa([]),
        });
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        expenseForm.post('/admin/kas/expense', {
            onSuccess: () => {
                setShowExpenseModal(false);
                expenseForm.reset();
            },
        });
    };

    const toggleSelect = (id: number) => {
        setSelectedMahasiswa(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        const unpaidIds = mahasiswaList.filter(m => m.status !== 'paid').map(m => m.id);
        setSelectedMahasiswa(prev => prev.length === unpaidIds.length ? [] : unpaidIds);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Uang Kas" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-100">Manajemen Keuangan</p>
                                    <h1 className="text-2xl font-bold">Uang Kas Kelas</h1>
                                </div>
                            </div>
                            <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur">
                                <Plus className="h-4 w-4" />Catat Pengeluaran
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Saldo Kas</p>
                                <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.total_balance)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Pemasukan</p>
                                <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.total_income)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Pengeluaran</p>
                                <p className="text-xl font-bold text-red-600">{formatCurrency(summary.total_expense)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Status Pembayaran</p>
                                <p className="text-sm"><span className="text-emerald-600 font-bold">{summary.paid_count}</span> lunas • <span className="text-red-600 font-bold">{summary.unpaid_count}</span> belum</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Bulk Actions */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFilter('search', search)} placeholder="Cari mahasiswa..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                            </div>
                        </div>
                        <select value={filters.status} onChange={e => handleFilter('status', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                            <option value="all">Semua Status</option>
                            <option value="paid">Lunas</option>
                            <option value="unpaid">Belum Bayar</option>
                        </select>
                        <input type="month" value={filters.month} onChange={e => handleFilter('month', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                        {selectedMahasiswa.length > 0 && (
                            <button onClick={handleBulkMarkPaid} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                                <Check className="h-4 w-4" />Tandai {selectedMahasiswa.length} Lunas
                            </button>
                        )}
                    </div>
                </div>

                {/* Mahasiswa List */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-4 py-3 text-left">
                                        <input type="checkbox" onChange={selectAll} checked={selectedMahasiswa.length > 0 && selectedMahasiswa.length === mahasiswaList.filter(m => m.status !== 'paid').length} className="rounded border-slate-300" />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Kelas</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Sudah Bayar</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Belum Bayar</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {mahasiswaList.map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                        <td className="px-4 py-3">
                                            {m.status !== 'paid' && (
                                                <input type="checkbox" checked={selectedMahasiswa.includes(m.id)} onChange={() => toggleSelect(m.id)} className="rounded border-slate-300" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900 dark:text-white">{m.nama}</p>
                                            <p className="text-xs text-slate-500">{m.nim}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{m.kelas || '-'}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-emerald-600">{formatCurrency(m.total_paid)}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-red-600">{formatCurrency(m.total_unpaid)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : m.status === 'unpaid' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {m.status === 'paid' ? 'Lunas' : m.status === 'unpaid' ? 'Belum Bayar' : 'Belum Ada'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {m.status !== 'paid' && (
                                                    <button onClick={() => handleMarkPaid(m.id)} className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600" title="Tandai Lunas">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Pengeluaran</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {expenses.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Belum ada pengeluaran</div>
                        ) : expenses.map(e => (
                            <div key={e.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{e.description}</p>
                                    <p className="text-xs text-slate-500">{e.period_date} • {e.category}</p>
                                </div>
                                <p className="text-lg font-bold text-red-600">-{formatCurrency(e.amount)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expense Modal */}
                {showExpenseModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Catat Pengeluaran</h3>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah</label>
                                    <input type="number" value={expenseForm.data.amount} onChange={e => expenseForm.setData('amount', parseInt(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan</label>
                                    <input type="text" value={expenseForm.data.description} onChange={e => expenseForm.setData('description', e.target.value)} placeholder="Contoh: Beli spidol" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                                    <select value={expenseForm.data.category} onChange={e => expenseForm.setData('category', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                        <option value="pengeluaran">Pengeluaran Umum</option>
                                        <option value="kegiatan">Kegiatan Kelas</option>
                                        <option value="perlengkapan">Perlengkapan</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
                                    <input type="date" value={expenseForm.data.period_date} onChange={e => expenseForm.setData('period_date', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium">Batal</button>
                                    <button type="submit" disabled={expenseForm.processing} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
