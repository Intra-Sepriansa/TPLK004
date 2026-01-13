import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
    Upload, Download, FileSpreadsheet, CheckCircle, XCircle, 
    AlertTriangle, Clock, Users, BookOpen, Calendar
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

        // Preview
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
            case 'completed': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Selesai</Badge>;
            case 'failed': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Gagal</Badge>;
            case 'processing': return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> Proses</Badge>;
            default: return <Badge variant="outline">Pending</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Bulk Import" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Upload className="h-6 w-6" />
                        Bulk Import
                    </h1>
                    <p className="text-muted-foreground">Import data mahasiswa, mata kuliah, dan jadwal via CSV</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Import</p>
                                    <p className="text-2xl font-bold">{stats.total_imports}</p>
                                </div>
                                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Berhasil</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Gagal</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Record</p>
                                    <p className="text-2xl font-bold">{stats.total_records}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload File</CardTitle>
                            <CardDescription>Pilih tipe data dan upload file CSV</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Tipe Data</label>
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mahasiswa">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" /> Mahasiswa
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="mata_kuliah">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" /> Mata Kuliah
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        Klik untuk upload atau drag & drop
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        CSV, max 5MB
                                    </p>
                                </label>
                            </div>

                            {uploading && (
                                <div className="text-center py-4">
                                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                    <p className="text-sm text-muted-foreground mt-2">Memproses file...</p>
                                </div>
                            )}

                            {preview && !preview.error && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Preview</span>
                                        <Badge>{preview.total_rows} baris</Badge>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-muted">
                                                    {preview.headers?.map((h: string, i: number) => (
                                                        <th key={i} className="p-2 text-left">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.sample?.slice(0, 3).map((row: string[], i: number) => (
                                                    <tr key={i} className="border-b">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="p-2">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {preview.validation_errors?.length > 0 && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <p className="text-sm font-medium text-red-600 mb-1">Validasi Error:</p>
                                            <ul className="text-xs text-red-600 list-disc list-inside">
                                                {preview.validation_errors.slice(0, 5).map((err: string, i: number) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <Button onClick={handleImport} className="w-full" disabled={form.processing}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Import {preview.valid_rows} Data Valid
                                    </Button>
                                </div>
                            )}

                            {preview?.error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-sm text-red-600">{preview.error}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Templates */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Download Template</CardTitle>
                            <CardDescription>Gunakan template untuk format yang benar</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(templates).map(([type, template]) => (
                                <div key={type} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(type)}
                                            <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
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
                                    <div className="text-xs text-muted-foreground">
                                        <p className="font-medium mb-1">Kolom:</p>
                                        <p>{template.columns.join(', ')}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Import History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Import</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.map(log => (
                                <div key={log.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(log.type)}
                                            <span className="font-medium">{log.filename}</span>
                                            {getStatusBadge(log.status)}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    {log.status === 'completed' && (
                                        <div className="grid grid-cols-3 gap-4 mt-3">
                                            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                <p className="text-lg font-bold text-green-600">{log.success_count}</p>
                                                <p className="text-xs text-muted-foreground">Berhasil</p>
                                            </div>
                                            <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                                <p className="text-lg font-bold text-yellow-600">{log.skip_count}</p>
                                                <p className="text-xs text-muted-foreground">Dilewati</p>
                                            </div>
                                            <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                                <p className="text-lg font-bold text-red-600">{log.error_count}</p>
                                                <p className="text-xs text-muted-foreground">Error</p>
                                            </div>
                                        </div>
                                    )}
                                    {log.errors && log.errors.length > 0 && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                                            <p className="font-medium text-red-600 mb-1">Errors:</p>
                                            <ul className="list-disc list-inside text-red-600">
                                                {log.errors.slice(0, 3).map((err, i) => (
                                                    <li key={i}>Baris {err.row}: {err.message}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada riwayat import</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
