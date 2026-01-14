import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100">Import Data</p>
                                <h1 className="text-2xl font-bold">Bulk Import</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-emerald-100">
                            Import data mahasiswa, mata kuliah, dan jadwal via file CSV
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Import</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total_imports}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Berhasil</p>
                                <p className="text-xl font-bold text-emerald-600">{stats.successful}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Gagal</p>
                                <p className="text-xl font-bold text-red-600">{stats.failed}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Record</p>
                                <p className="text-xl font-bold text-blue-600">{stats.total_records}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Upload Section */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Upload className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Upload File</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Pilih tipe data dan upload file CSV</p>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Tipe Data</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <option value="mahasiswa">👤 Mahasiswa</option>
                                    <option value="mata_kuliah">📚 Mata Kuliah</option>
                                </select>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Klik untuk upload atau drag & drop
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">CSV, max 5MB</p>
                                </label>
                            </div>

                            {uploading && (
                                <div className="text-center py-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
                                    <p className="text-sm text-slate-500 mt-2">Memproses file...</p>
                                </div>
                            )}

                            {preview && !preview.error && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Preview</span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{preview.total_rows} baris</span>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800">
                                                    {preview.headers?.map((h: string, i: number) => (
                                                        <th key={i} className="p-2 text-left font-medium text-slate-600 dark:text-slate-400">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.sample?.slice(0, 3).map((row: string[], i: number) => (
                                                    <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="p-2 text-slate-700 dark:text-slate-300">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button onClick={handleImport} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={form.processing}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Import {preview.valid_rows} Data Valid
                                    </Button>
                                </div>
                            )}

                            {preview?.error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600">{preview.error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Download Template</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Gunakan template untuk format yang benar</p>
                        </div>
                        <div className="p-4 space-y-4">
                            {Object.entries(templates).map(([type, template]) => (
                                <div key={type} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(type)}
                                            <span className="font-medium text-slate-900 dark:text-white capitalize">{type.replace('_', ' ')}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => window.location.href = `/admin/bulk-import/template/${type}`}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        <p className="font-medium mb-1">Kolom:</p>
                                        <p className="text-slate-600 dark:text-slate-400">{template.columns.join(', ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Import History */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Riwayat Import</h2>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(log.type)}
                                        <span className="font-medium text-slate-900 dark:text-white">{log.filename}</span>
                                        {getStatusBadge(log.status)}
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {new Date(log.created_at).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                {log.status === 'completed' && (
                                    <div className="grid grid-cols-3 gap-4 mt-3">
                                        <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                            <p className="text-lg font-bold text-emerald-600">{log.success_count}</p>
                                            <p className="text-xs text-slate-500">Berhasil</p>
                                        </div>
                                        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                            <p className="text-lg font-bold text-yellow-600">{log.skip_count}</p>
                                            <p className="text-xs text-slate-500">Dilewati</p>
                                        </div>
                                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <p className="text-lg font-bold text-red-600">{log.error_count}</p>
                                            <p className="text-xs text-slate-500">Error</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-center py-12">
                                <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                                <p className="text-slate-500">Belum ada riwayat import</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
