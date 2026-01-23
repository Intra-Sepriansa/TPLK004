import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, Download, FileSpreadsheet, CheckCircle, XCircle, 
    Clock, Users, BookOpen, Calendar
} from 'lucide-react';
import { useState, useRef } from 'react';

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
    const [selectedType, setSelectedType] = useState('mahasiswa');
    const [preview, setPreview] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
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

    return (
        <AppLayout>
            <Head title="Bulk Import" />
            
            <div className="p-6 space-y-6">
                {/* Header dengan animasi masuk */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-white shadow-2xl border border-slate-700/50"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-teal-500/10 blur-3xl"
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/50"
                            >
                                <Upload className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-slate-400 font-medium"
                                >
                                    Import Data
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                                >
                                    Bulk Import
                                </motion.h1>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-slate-400"
                        >
                            Import data mahasiswa, mata kuliah, dan jadwal via file CSV
                        </motion.p>
                    </div>
                </motion.div>

                {/* Stats Cards dengan animasi dock-style */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { icon: FileSpreadsheet, label: 'Total Import', value: stats.total_imports, color: 'from-slate-500 to-slate-600', delay: 0.1 },
                        { icon: CheckCircle, label: 'Berhasil', value: stats.successful, color: 'from-emerald-500 to-green-600', delay: 0.15 },
                        { icon: XCircle, label: 'Gagal', value: stats.failed, color: 'from-red-500 to-rose-600', delay: 0.2 },
                        { icon: Users, label: 'Total Record', value: stats.total_records, color: 'from-blue-500 to-cyan-600', delay: 0.25 },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-black p-6 shadow-xl border border-slate-800/50 cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <stat.icon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                    <motion.p
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: stat.delay + 0.1, type: "spring" }}
                                        className="text-2xl font-bold text-white"
                                    >
                                        {stat.value}
                                    </motion.p>
                                </div>
                            </div>
                            
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                                    <Upload className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white text-lg">Upload File</h2>
                                    <p className="text-xs text-slate-400">Pilih tipe data dan upload file CSV</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Tipe Data</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                >
                                    <option value="mahasiswa">👤 Mahasiswa</option>
                                    <option value="mata_kuliah">📚 Mata Kuliah</option>
                                </select>
                            </div>

                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors bg-slate-800/30">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                                    <p className="text-sm text-slate-300 font-medium">
                                        Klik untuk upload atau drag & drop
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">CSV, max 5MB</p>
                                </label>
                            </div>

                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-4"
                                >
                                    <div className="animate-spin h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                                    <p className="text-sm text-slate-400 mt-3">Memproses file...</p>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {preview && !preview.error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-300">Preview</span>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">{preview.total_rows} baris</span>
                                        </div>
                                        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/50">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-slate-800/80">
                                                        {preview.headers?.map((h: string, i: number) => (
                                                            <th key={i} className="p-3 text-left font-semibold text-slate-300">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.sample?.slice(0, 3).map((row: string[], i: number) => (
                                                        <tr key={i} className="border-t border-slate-700">
                                                            {row.map((cell, j) => (
                                                                <td key={j} className="p-3 text-slate-400">{cell}</td>
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
                                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Import {preview.valid_rows} Data Valid
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {preview?.error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 bg-red-500/10 rounded-xl border border-red-500/50"
                                >
                                    <p className="text-sm text-red-400">{preview.error}</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Templates */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                                    <Download className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white text-lg">Download Template</h2>
                                    <p className="text-xs text-slate-400">Gunakan template untuk format yang benar</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {Object.entries(templates).map(([type, template], index) => (
                                <motion.div
                                    key={type}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className="p-4 border border-slate-700 rounded-xl bg-slate-800/30 hover:border-blue-500/50 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-700/50">
                                                {getTypeIcon(type)}
                                            </div>
                                            <span className="font-medium text-white capitalize">{type.replace('_', ' ')}</span>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => window.location.href = `/admin/bulk-import/template/${type}`}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium transition-all"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </motion.button>
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-medium text-slate-400 mb-1">Kolom:</p>
                                        <p className="text-slate-500">{template.columns.join(', ')}</p>
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
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl bg-gradient-to-br from-slate-900 to-black shadow-xl border border-slate-800/50 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                                <Clock className="h-5 w-5 text-white" />
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
                                    whileHover={{ backgroundColor: "rgba(15, 23, 42, 0.5)", x: 5 }}
                                    className="p-4 border border-slate-700 rounded-xl bg-slate-800/30 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-700/50">
                                                {getTypeIcon(log.type)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-white block">{log.filename}</span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(log.created_at).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                        {getStatusBadge(log.status)}
                                    </div>
                                    {log.status === 'completed' && (
                                        <div className="grid grid-cols-3 gap-3 mt-3">
                                            <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                                <p className="text-xl font-bold text-emerald-400">{log.success_count}</p>
                                                <p className="text-xs text-slate-400 mt-1">Berhasil</p>
                                            </div>
                                            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                                <p className="text-xl font-bold text-yellow-400">{log.skip_count}</p>
                                                <p className="text-xs text-slate-400 mt-1">Dilewati</p>
                                            </div>
                                            <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                                                <p className="text-xl font-bold text-red-400">{log.error_count}</p>
                                                <p className="text-xs text-slate-400 mt-1">Error</p>
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
                                className="text-center py-12"
                            >
                                <FileSpreadsheet className="h-16 w-16 mx-auto text-slate-700 mb-3" />
                                <p className="text-slate-500 font-medium">Belum ada riwayat import</p>
                                <p className="text-slate-600 text-sm mt-1">Upload file untuk memulai import data</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
