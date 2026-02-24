import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Download, FileSpreadsheet, CheckCircle, XCircle,
    Clock, Users, BookOpen, Calendar, Printer
} from 'lucide-react';
import { useState, useRef } from 'react';

import bulkImportIcon from '@/assets/admin/bulk-import/bulk-import.png';
import berhasilIcon from '@/assets/admin/bulk-import/berhasil.png';
import gagalIcon from '@/assets/admin/bulk-import/gagal.png';
import totalRecordIcon from '@/assets/admin/bulk-import/total-record.png';
import totalImportIcon from '@/assets/admin/bulk-import/total-import.png';

interface ImportLog {
    id: number;
    type: string;
    filename: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    total_rows: number;
    success_count: number;
    error_count: number;
    skip_count: number;
    errors: Array<{ row: number; message: string }>;
    created_at: string;
}

interface Props {
    logs: ImportLog[];
    stats: {
        total_imports: number;
        successful: number;
        failed: number;
        total_records: number;
    };
    templates: Record<string, { columns: string[]; sample: string[][] }>;
}

export default function BulkImport({ logs, stats, templates }: Props) {
    // Real Schema Templates
    const realTemplates = {
        mahasiswa: {
            columns: ['nim', 'nama', 'email', 'phone', 'fakultas', 'prodi', 'kelas', 'semester', 'angkatan'],
            sample: [['2024001', 'M. Rizki', 'rizki@student.unpam.ac.id', '081234567890', 'Ilmu Komputer', 'Teknik Informatika', '04TPLP001', '4', '2022']]
        },
        dosen: {
            columns: ['nidn', 'nama', 'email', 'phone', 'fakultas', 'jabatan_fungsional', 'pendidikan_terakhir'],
            sample: [['0420018801', 'Dr. Budi Santoso, M.Kom', 'budi@dosen.unpam.ac.id', '081298765432', 'Ilmu Komputer', 'Lektor Kepala', 'S3']]
        },
        mata_kuliah: {
            columns: ['kode_mk', 'nama_mk', 'sks', 'semester', 'sifat', 'prasyarat'],
            sample: [['TPL001', 'Pemrograman Web 1', '3', '3', 'Wajib', '-']]
        },
        jadwal: {
            columns: ['kode_mk', 'nidn_dosen', 'hari', 'jam_mulai', 'jam_selesai', 'ruangan', 'kelas', 'semester_aktif'],
            sample: [['TPL001', '0420018801', 'Senin', '08:00:00', '10:30:00', 'V.301', '04TPLP001', 'Ganjil 2024/2025']]
        }
    };

    // Use passed templates but prioritize real templates to ensure real schema data is used
    const activeTemplates = { ...templates, ...realTemplates };

    const [selectedType, setSelectedType] = useState(Object.keys(activeTemplates)[0] || 'mahasiswa');
    const [preview, setPreview] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [printLog, setPrintLog] = useState<ImportLog | null>(null);
    const [printTemplate, setPrintTemplate] = useState<{ type: string, template: any } | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        file: null as File | null,
        type: 'mahasiswa',
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        form.setData('file', file);
        form.setData('type', selectedType);

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', selectedType);

        try {
            const response = await fetch('/admin/bulk-import/preview', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();
            if (data.success) {
                setPreview(data.preview);
            } else {
                setPreview({ error: data.error });
            }
        } catch (err) {
            setPreview({ error: 'Gagal memproses file' });
        }
        setUploading(false);
    };

    const handleImport = () => {
        if (!form.data.file) return;

        const formData = new FormData();
        formData.append('file', form.data.file);
        formData.append('type', selectedType);

        router.post('/admin/bulk-import', formData, {
            forceFormData: true,
            onSuccess: () => {
                setPreview(null);
                form.reset();
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'mahasiswa': return <Users className="h-5 w-5" />;
            case 'mata_kuliah': return <BookOpen className="h-5 w-5" />;
            case 'jadwal': return <Calendar className="h-5 w-5" />;
            default: return <FileSpreadsheet className="h-5 w-5" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Selesai</span>;
            case 'failed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="h-3 w-3" /> Gagal</span>;
            case 'processing': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1"><Clock className="h-3 w-3" /> Proses</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Pending</span>;
        }
    };

    const handlePrint = (log: ImportLog) => {
        setPrintLog(log);
        setTimeout(() => {
            window.print();
            setTimeout(() => setPrintLog(null), 1000);
        }, 100);
    };

    const handleDownloadPdfTemplate = (type: string) => {
        // Use activeTemplates here
        setPrintTemplate({ type, template: activeTemplates[type as keyof typeof activeTemplates] });
        setTimeout(() => {
            window.print();
            setTimeout(() => setPrintTemplate(null), 1000);
        }, 100);
    };

    // Card Variants for Uang Kas style
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
        hover: {
            scale: 1.03,
            y: -8,
            transition: { type: 'spring', stiffness: 400, damping: 10 },
        },
    } as const;

    return (
        <AppLayout>
            <Head title="Bulk Import" />

            <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8 font-sans selection:bg-indigo-500/30">
                {/* PDF Template Print View (Hidden unless printing template) */}
                {printTemplate && (
                    <div className="fixed inset-0 z-[9999] bg-white text-black p-8 hidden print:block">
                        <div className="max-w-4xl mx-auto border-2 border-double border-gray-800 p-8 h-full flex flex-col">
                            {/* Kop Surat */}
                            <div className="flex items-center gap-6 border-b-4 border-black pb-6 mb-8">
                                <img src="/logo-unpam.png" alt="Unpam Logo" className="h-24 w-auto" />
                                <div className="text-center flex-1">
                                    <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">Universitas Pamulang</h1>
                                    <p className="text-sm font-semibold mb-1">Format Import Data {printTemplate.type.replace('_', ' ')}</p>
                                    <p className="text-xs text-gray-600">Jl. Surya Kencana No. 1 Pamulang, Tangerang Selatan, Banten</p>
                                </div>
                            </div>

                            {/* Report Title */}
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold underline decoration-2 underline-offset-4 uppercase">
                                    PANDUAN & FORMAT IMPORT DATA
                                </h2>
                                <p className="text-sm text-gray-500 mt-2">Tipe Data: {printTemplate.type.toUpperCase()}</p>
                            </div>

                            {/* Guidelines */}
                            <div className="mb-6">
                                <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">Petunjuk Pengisian:</h3>
                                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                                    <li>Gunakan format CSV (Comma Separated Values) atau Excel.</li>
                                    <li>Pastikan urutan kolom sesuai dengan tabel di bawah.</li>
                                    <li>Jangan mengubah nama header kolom.</li>
                                    <li>Pastikan tidak ada baris kosong di antara data.</li>
                                </ul>
                            </div>

                            {/* Columns Table */}
                            <div className="mb-8">
                                <h3 className="font-bold border-b border-gray-300 mb-4 pb-1">Spesifikasi Kolom:</h3>
                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 p-2 text-left w-12">No</th>
                                            <th className="border border-gray-300 p-2 text-left">Nama Kolom</th>
                                            <th className="border border-gray-300 p-2 text-left">Wajib?</th>
                                            <th className="border border-gray-300 p-2 text-left">Keterangan / Contoh Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printTemplate.template.columns.map((col: string, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-300">
                                                <td className="border border-gray-300 p-2 text-center">{idx + 1}</td>
                                                <td className="border border-gray-300 p-2 font-mono font-bold">{col}</td>
                                                <td className="border border-gray-300 p-2 text-center text-red-600 font-bold">Ya</td>
                                                <td className="border border-gray-300 p-2 italic text-gray-500">
                                                    {printTemplate.template.sample?.[0]?.[idx] || (
                                                        col === 'hari' ? 'Senin, Selasa, dst' :
                                                            col === 'jam_mulai' ? '08:00:00' :
                                                                col === 'semester' ? '1, 2, 3... / Ganjil 2024/2025' :
                                                                    '-'
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-8 flex justify-between items-end text-xs text-gray-500 border-t border-gray-300">
                                <div>
                                    <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
                                    <p>Sistem Informasi Akademik</p>
                                </div>
                                <div className="text-right">
                                    <p>Halaman 1 dari 1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Print Template (Hidden unless printing) */}
                {printLog && (
                    <div className="fixed inset-0 z-[9999] bg-white text-black p-8 hidden print:block">
                        <div className="max-w-4xl mx-auto border-2 border-double border-gray-800 p-8 h-full flex flex-col">
                            {/* Kop Surat */}
                            <div className="flex items-center gap-6 border-b-4 border-black pb-6 mb-8">
                                <img src="/logo-unpam.png" alt="Unpam Logo" className="h-24 w-auto" />
                                <div className="text-center flex-1">
                                    <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">Universitas Pamulang</h1>
                                    <p className="text-sm font-semibold mb-1">Laporan Import Data Sistem Akademik</p>
                                    <p className="text-xs text-gray-600">Jl. Surya Kencana No. 1 Pamulang, Tangerang Selatan, Banten</p>
                                </div>
                            </div>

                            {/* Report Title */}
                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold underline decoration-2 underline-offset-4">BUKTI IMPORT DATA</h2>
                                <p className="text-sm text-gray-500 mt-2">ID Transaksi: #{String(printLog.id).padStart(6, '0')}</p>
                            </div>

                            {/* Details Table */}
                            <div className="mb-8">
                                <table className="w-full border-collapse border border-gray-300">
                                    <tbody>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-3 font-bold bg-gray-50 w-1/3">Tanggal Import</td>
                                            <td className="p-3">{new Date(printLog.created_at).toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-3 font-bold bg-gray-50">Tipe Data</td>
                                            <td className="p-3 capitalize">{printLog.type.replace('_', ' ')}</td>
                                        </tr>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-3 font-bold bg-gray-50">Nama File</td>
                                            <td className="p-3 font-mono">{printLog.filename}</td>
                                        </tr>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-3 font-bold bg-gray-50">Status Akhir</td>
                                            <td className="p-3 uppercase font-bold">{printLog.status}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="border border-gray-300 p-4 text-center rounded bg-gray-50">
                                    <p className="text-xs text-gray-500 uppercase">Total Baris</p>
                                    <p className="text-2xl font-bold">{printLog.total_rows}</p>
                                </div>
                                <div className="border border-green-200 p-4 text-center rounded bg-green-50">
                                    <p className="text-xs text-green-700 uppercase">Berhasil</p>
                                    <p className="text-2xl font-bold text-green-700">{printLog.success_count}</p>
                                </div>
                                <div className="border border-yellow-200 p-4 text-center rounded bg-yellow-50">
                                    <p className="text-xs text-yellow-700 uppercase">Dilewati</p>
                                    <p className="text-2xl font-bold text-yellow-700">{printLog.skip_count}</p>
                                </div>
                                <div className="border border-red-200 p-4 text-center rounded bg-red-50">
                                    <p className="text-xs text-red-700 uppercase">Gagal</p>
                                    <p className="text-2xl font-bold text-red-700">{printLog.error_count}</p>
                                </div>
                            </div>

                            {/* Footer / Signature */}
                            <div className="mt-auto pt-16 flex justify-end">
                                <div className="text-center w-64">
                                    <p className="mb-20">Tangerang Selatan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p className="font-bold border-b border-black pb-1">Administrator Sistem</p>
                                    <p className="text-xs mt-1">Dicetak Secara Otomatis oleh Sistem</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-8 print:hidden">
                    {/* Header - Advanced Animated Gradient */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                    >
                        {/* Animated Gradient Background */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            style={{ backgroundSize: '200% 200%' }}
                        />

                        {/* Overlay & Glow Orbs */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                        {/* Pulsating Rings */}
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute right-12 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full border-2 border-white/10"
                                animate={{ scale: [1, 3], opacity: [0.3, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i * 1 }}
                            />
                        ))}

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full">
                                <motion.div
                                    className="relative flex shrink-0 h-24 w-24 sm:h-20 sm:w-20"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img src={bulkImportIcon} alt="Bulk Import" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm text-blue-100 font-medium"
                                    >
                                        Data Management
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-2xl sm:text-3xl font-bold"
                                    >
                                        Bulk Import
                                    </motion.h1>
                                </div>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="relative mt-4 text-blue-100/80"
                        >
                            Import data mahasiswa, mata kuliah, dan jadwal via CSV/PDF secara massal
                        </motion.p>
                    </motion.div>

                    {/* Stats Grid - Staggered Spring Animations */}
                    <motion.div
                        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
                        }}
                    >
                        {[
                            { imageIcon: totalImportIcon, label: 'Total Import', value: stats.total_imports, color: 'purple' },
                            { imageIcon: berhasilIcon, label: 'Berhasil', value: stats.successful, color: 'emerald' },
                            { imageIcon: gagalIcon, label: 'Gagal', value: stats.failed, color: 'red' },
                            { imageIcon: totalRecordIcon, label: 'Total Record', value: stats.total_records, color: 'blue' },
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
                                }}
                                whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                            >
                                <StatCard imageIcon={card.imageIcon} label={card.label} value={card.value} color={card.color} />
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Upload Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden hover:border-white/20 transition-all duration-300"
                        >
                            <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-white text-lg">Upload File</h2>
                                        <p className="text-xs text-gray-400">Pilih tipe data dan upload file CSV atau PDF</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Tipe Data</label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                    >
                                        <option value="mahasiswa">👤 Mahasiswa</option>
                                        <option value="mata_kuliah">📚 Mata Kuliah</option>
                                    </select>
                                </div>

                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all bg-black/20 group cursor-pointer relative">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv,.txt,.pdf"
                                        onChange={handleFileSelect}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        id="file-upload"
                                    />
                                    <div className="group-hover:scale-110 transition-transform duration-300">
                                        <Upload className="h-12 w-12 mx-auto text-gray-500 mb-4 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <p className="text-sm text-gray-300 font-medium">
                                        Klik untuk upload atau drag & drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">CSV atau PDF, max 5MB</p>
                                </div>

                                {uploading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-4"
                                    >
                                        <div className="animate-spin h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                                        <p className="text-sm text-gray-400 mt-3">Memproses file...</p>
                                    </motion.div>
                                )}

                                <AnimatePresence>
                                    {preview && !preview.error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4 pt-4 border-t border-white/5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-300">Preview Data</span>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">{preview.total_rows} baris ditemukan</span>
                                            </div>
                                            <div className="overflow-x-auto rounded-xl border border-white/10">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-white/5">
                                                            {preview.headers?.map((h: string, i: number) => (
                                                                <th key={i} className="p-3 text-left font-semibold text-gray-300 border-b border-white/10">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {preview.sample?.slice(0, 3).map((row: string[], i: number) => (
                                                            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                                {row.map((cell, j) => (
                                                                    <td key={j} className="p-3 text-gray-400 whitespace-nowrap">{cell}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleImport}
                                                disabled={form.processing}
                                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transition-all disabled:opacity-50"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Proses Import ({preview.valid_rows} Data)
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {preview?.error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-3"
                                    >
                                        <XCircle className="h-5 w-5 text-red-400" />
                                        <p className="text-sm text-red-300">{preview.error}</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* Templates */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-3xl border border-white/20 bg-white/40 backdrop-blur-xl shadow-xl overflow-hidden hover:border-white/30 transition-all duration-300 dark:bg-neutral-900/40 dark:border-white/5"
                        >
                            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/20 shadow-lg shadow-pink-500/10">
                                        <Download className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-white text-lg">Download Template</h2>
                                        <p className="text-xs text-gray-400">Pilih format template yang diinginkan</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {Object.entries(activeTemplates).map(([type, template], index) => (
                                    <motion.div
                                        key={type}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="p-4 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                                                    {getTypeIcon(type)}
                                                </div>
                                                <span className="font-medium text-white capitalize">{type.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => window.location.href = `/admin/bulk-import/template/${type}`}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 hover:text-white text-xs font-bold transition-all border border-emerald-500/20"
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5" />
                                                    CSV
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDownloadPdfTemplate(type)}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-white text-xs font-bold transition-all border border-red-500/20"
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                    PDF
                                                </motion.button>
                                            </div>
                                        </div>
                                        <div className="text-xs pl-12 border-t border-white/5 pt-2 mt-2">
                                            <p className="font-medium text-gray-500 mb-1">Kolom Wajib:</p>
                                            <p className="text-gray-400 font-mono text-[10px] leading-relaxed">{template.columns.join(', ')}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Import History */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden hover:border-white/20 transition-all duration-300"
                    >
                        <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/20">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <h2 className="font-semibold text-white text-lg">Riwayat Import</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <AnimatePresence>
                                {logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.05 }}
                                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)", x: 4 }}
                                        className="p-5 border border-white/10 rounded-2xl bg-white/5 transition-all group"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-xl bg-white/5 md:group-hover:bg-indigo-500/20 transition-colors">
                                                    {getTypeIcon(log.type)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block text-sm mb-1">{log.filename}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(log.status)}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePrint(log)}
                                                    className="h-8 border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/50"
                                                >
                                                    <Printer className="h-3.5 w-3.5 mr-2" />
                                                    Print Laporan
                                                </Button>
                                            </div>
                                        </div>

                                        {log.status === 'completed' && (
                                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                                <div className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <p className="text-lg font-bold text-emerald-400">{log.success_count}</p>
                                                    <p className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-semibold">Berhasil</p>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                                    <p className="text-lg font-bold text-amber-400">{log.skip_count}</p>
                                                    <p className="text-[10px] uppercase tracking-wider text-amber-500/70 font-semibold">Dilewati</p>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                                    <p className="text-lg font-bold text-red-400">{log.error_count}</p>
                                                    <p className="text-[10px] uppercase tracking-wider text-red-500/70 font-semibold">Gagal</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {logs.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="h-20 w-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <FileSpreadsheet className="h-10 w-10 text-gray-600" />
                                    </div>
                                    <p className="text-gray-400 font-medium">Belum ada riwayat import</p>
                                    <p className="text-gray-600 text-sm mt-1">Upload file untuk memulai import data</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, imageIcon, label, value, sub, color }: { icon?: any; imageIcon?: string; label: string; value: number | string; sub?: string; color: string }) {
    const [isHovered, setIsHovered] = useState(false);

    // Map colors to matching dashboard configurations
    const colorConfigs: Record<string, any> = {
        emerald: { bg: 'bg-emerald-500', hoverShadow: 'group-hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
        orange: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30' },
        amber: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-amber-400 to-orange-600 shadow-amber-500/30' },
        purple: { bg: 'bg-violet-500', hoverShadow: 'group-hover:shadow-violet-500/10', gradientBg: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10', iconBg: 'from-violet-400 to-purple-600 shadow-violet-500/30' },
        blue: { bg: 'bg-sky-500', hoverShadow: 'group-hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10', iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30' },
        red: { bg: 'bg-red-500', hoverShadow: 'group-hover:shadow-red-500/10', gradientBg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10', iconBg: 'from-red-400 to-rose-600 shadow-red-500/30' },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <div
            className={`group h-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${c.hoverShadow} dark:border-white/5 cursor-pointer`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`} />

            <motion.div
                initial={false}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                {imageIcon ? (
                    <motion.div
                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={imageIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" alt={label} />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                            {value}
                        </span>
                    </div>
                    {sub && <p className="text-[8px] sm:text-xs leading-tight text-neutral-400 mt-0.5">{sub}</p>}
                </div>
            </div>
        </div>
    );
}
