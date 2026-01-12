import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Wallet, Plus, Search, CheckCircle, TrendingUp, TrendingDown, Users, 
    Calendar, DollarSign, Receipt, Check, FileText, Download, Printer,
    ChevronDown, ChevronRight, X
} from 'lucide-react';
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
    period_income: number;
    period_expense: number;
    paid_count: number;
    unpaid_count: number;
}

interface Transaction {
    id: number;
    mahasiswa: string | null;
    type: string;
    amount: number;
    status: string;
    description: string;
    category: string;
    period_date: string;
    period_display: string;
    created_at: string;
}

interface LedgerItem {
    date: string;
    display_date: string;
    income: number;
    expense: number;
    balance: number;
    transactions: Transaction[];
}

interface PageProps {
    mahasiswaList: MahasiswaKas[];
    summary: Summary;
    ledger: LedgerItem[];
    pertemuanDates: string[];
    filters: { search: string; pertemuan: string; month: string };
    kasAmount: number;
}

export default function AdminKas({ mahasiswaList, summary, ledger, pertemuanDates, filters, kasAmount }: PageProps) {
    const [activeTab, setActiveTab] = useState<'pembayaran' | 'buku-kas'>('pembayaran');
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showPertemuanModal, setShowPertemuanModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<number[]>([]);
    const [search, setSearch] = useState(filters.search);
    const [expandedDates, setExpandedDates] = useState<string[]>([]);

    const expenseForm = useForm({
        amount: 0,
        description: '',
        category: 'pengeluaran',
        period_date: new Date().toISOString().split('T')[0],
    });

    const pertemuanForm = useForm({
        period_date: '',
    });

    const handleFilter = (key: string, value: string) => {
        router.get('/admin/kas', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleMarkPaid = (mahasiswaId: number) => {
        if (filters.pertemuan === 'all') {
            alert('Silakan pilih pertemuan terlebih dahulu untuk menandai lunas');
            return;
        }
        router.post('/admin/kas/mark-paid', {
            mahasiswa_id: mahasiswaId,
            period_date: filters.pertemuan,
        });
    };

    const handleBulkMarkPaid = () => {
        if (selectedMahasiswa.length === 0) return;
        if (filters.pertemuan === 'all') {
            alert('Silakan pilih pertemuan terlebih dahulu untuk menandai lunas');
            return;
        }
        router.post('/admin/kas/bulk-mark-paid', {
            mahasiswa_ids: selectedMahasiswa,
            period_date: filters.pertemuan,
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

    const handleCreatePertemuan = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/kas/create-pertemuan', {
            period_date: pertemuanForm.data.period_date,
        }, {
            onSuccess: () => {
                setShowPertemuanModal(false);
                pertemuanForm.reset();
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

    const toggleExpand = (date: string) => {
        setExpandedDates(prev => 
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const exportPdf = (type: 'pertemuan' | 'bulanan' | 'keseluruhan' | 'matrix') => {
        let url = '/admin/kas/pdf?type=';
        if (type === 'pertemuan' && filters.pertemuan !== 'all') {
            url += `pertemuan&date=${filters.pertemuan}`;
        } else if (type === 'bulanan') {
            url += `keseluruhan&month=${filters.month}`;
        } else if (type === 'matrix') {
            url += `matrix&month=${filters.month}`;
        } else {
            url += 'keseluruhan';
        }
        window.open(url, '_blank');
        setShowExportModal(false);
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
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-100">Manajemen Keuangan</p>
                                    <h1 className="text-2xl font-bold">Uang Kas Kelas</h1>
                                    <p className="text-xs text-blue-200 mt-1">Kas mingguan: {formatCurrency(kasAmount)} / mahasiswa</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setShowPertemuanModal(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur">
                                    <Calendar className="h-4 w-4" />Buat Pertemuan
                                </button>
                                <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur">
                                    <Plus className="h-4 w-4" />Catat Pengeluaran
                                </button>
                                <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                                    <Download className="h-4 w-4" />Export PDF
                                </button>
                            </div>
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
                                <p className="text-xs text-slate-500">Saldo Aktif</p>
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
                                <p className="text-xs text-slate-500">Total Uang Masuk</p>
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
                                <p className="text-xs text-slate-500">Total Uang Keluar</p>
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

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => setActiveTab('pembayaran')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pembayaran' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users className="h-4 w-4 inline mr-2" />Pembayaran Mahasiswa
                    </button>
                    <button 
                        onClick={() => setActiveTab('buku-kas')}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'buku-kas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText className="h-4 w-4 inline mr-2" />Buku Kas
                    </button>
                </div>

                {activeTab === 'pembayaran' && (
                    <>
                        {/* Filters */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFilter('search', search)} placeholder="Cari mahasiswa..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                                    </div>
                                </div>
                                <select value={filters.pertemuan} onChange={e => handleFilter('pertemuan', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                    <option value="all">Semua Pertemuan</option>
                                    {pertemuanDates.map(date => (
                                        <option key={date} value={date}>{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</option>
                                    ))}
                                </select>
                                <input type="month" value={filters.month} onChange={e => handleFilter('month', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                                {selectedMahasiswa.length > 0 && filters.pertemuan !== 'all' && (
                                    <button onClick={handleBulkMarkPaid} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                                        <Check className="h-4 w-4" />Tandai {selectedMahasiswa.length} Lunas
                                    </button>
                                )}
                            </div>
                            {filters.pertemuan === 'all' && (
                                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        <strong>Info:</strong> Pilih pertemuan terlebih dahulu untuk menandai pembayaran lunas.
                                    </p>
                                </div>
                            )}
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
                                                        {m.status !== 'paid' && filters.pertemuan !== 'all' && (
                                                            <button onClick={() => handleMarkPaid(m.id)} className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600" title="Tandai Lunas">
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {m.status !== 'paid' && filters.pertemuan === 'all' && (
                                                            <span className="text-xs text-slate-400" title="Pilih pertemuan untuk menandai lunas">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'buku-kas' && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Buku Kas - Rekap Per Pertemuan</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Klik baris untuk melihat detail transaksi</p>
                        </div>
                        
                        {/* Ledger Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase w-8"></th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Tanggal Pertemuan</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Uang Masuk</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Uang Keluar</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {ledger.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Belum ada transaksi</td>
                                        </tr>
                                    ) : ledger.map(item => (
                                        <>
                                            <tr key={item.date} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer" onClick={() => toggleExpand(item.date)}>
                                                <td className="px-4 py-3">
                                                    {expandedDates.includes(item.date) ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900 dark:text-white">{item.display_date}</p>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-emerald-600">+{formatCurrency(item.income)}</td>
                                                <td className="px-4 py-3 text-right font-medium text-red-600">-{formatCurrency(item.expense)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(item.balance)}</td>
                                            </tr>
                                            {expandedDates.includes(item.date) && (
                                                <tr key={`${item.date}-detail`}>
                                                    <td colSpan={5} className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3">
                                                        <div className="space-y-2">
                                                            {item.transactions.map(t => (
                                                                <div key={t.id} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-800 rounded-lg">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                            {t.type === 'income' ? 'Masuk' : 'Keluar'}
                                                                        </span>
                                                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                                                            {t.type === 'income' && t.mahasiswa ? t.mahasiswa : t.description}
                                                                        </span>
                                                                    </div>
                                                                    <span className={`font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                                {ledger.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-blue-600 text-white font-bold">
                                            <td colSpan={2} className="px-4 py-3">TOTAL</td>
                                            <td className="px-4 py-3 text-right">+{formatCurrency(summary.total_income)}</td>
                                            <td className="px-4 py-3 text-right">-{formatCurrency(summary.total_expense)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(summary.total_balance)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* Create Pertemuan Modal */}
                {showPertemuanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Buat Pertemuan Baru</h3>
                                <button onClick={() => setShowPertemuanModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Buat tagihan kas untuk semua mahasiswa pada tanggal pertemuan tertentu (biasanya hari Kamis).</p>
                            <form onSubmit={handleCreatePertemuan} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Pertemuan</label>
                                    <input type="date" value={pertemuanForm.data.period_date} onChange={e => pertemuanForm.setData('period_date', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        <strong>Info:</strong> Setiap mahasiswa akan ditagih {formatCurrency(kasAmount)} untuk pertemuan ini.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowPertemuanModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium dark:bg-slate-800 dark:text-slate-300">Batal</button>
                                    <button type="submit" disabled={pertemuanForm.processing} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50">Buat Pertemuan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Expense Modal */}
                {showExpenseModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Catat Pengeluaran</h3>
                                <button onClick={() => setShowExpenseModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah (Rp)</label>
                                    <input type="number" value={expenseForm.data.amount || ''} onChange={e => expenseForm.setData('amount', parseInt(e.target.value) || 0)} placeholder="50000" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required min={1} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan</label>
                                    <input type="text" value={expenseForm.data.description} onChange={e => expenseForm.setData('description', e.target.value)} placeholder="Contoh: Beli spidol, Cetak dokumen" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
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
                                    <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium dark:bg-slate-800 dark:text-slate-300">Batal</button>
                                    <button type="submit" disabled={expenseForm.processing} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Export Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Export Laporan PDF</h3>
                                <button onClick={() => setShowExportModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {filters.pertemuan !== 'all' && (
                                    <button onClick={() => exportPdf('pertemuan')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Laporan Per Pertemuan</p>
                                            <p className="text-xs text-slate-500">Export transaksi untuk pertemuan yang dipilih</p>
                                        </div>
                                    </button>
                                )}
                                <button onClick={() => exportPdf('bulanan')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Laporan Bulanan</p>
                                        <p className="text-xs text-slate-500">Export semua transaksi bulan {new Date(filters.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </button>
                                <button onClick={() => exportPdf('keseluruhan')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors text-left">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                        <Printer className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Laporan Keseluruhan</p>
                                        <p className="text-xs text-slate-500">Export semua transaksi dari awal sampai sekarang</p>
                                    </div>
                                </button>
                                <button onClick={() => exportPdf('matrix')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors text-left">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-blue-700 dark:text-blue-300">📊 Laporan Matrix (Excel-style)</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">Tabel pembayaran per mahasiswa dengan ✓ dan ✗</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
