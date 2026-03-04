# PROMPT: Export PDF Tugas Kelompok Admin - Ultra Advanced Complete

## 🎯 TUJUAN UTAMA
Membuat fitur export PDF yang sangat advanced dan inovatif untuk menu detail tugas kelompok di admin dengan:
1. **PDF Design Ultra Modern** dengan layout profesional dan visual menarik
2. **Tabel Advanced** dengan styling kompleks, charts, dan visualisasi data
3. **Multiple Export Options** (Summary, Detailed, Analytics, Custom)
4. **Real-time Preview** sebelum download
5. **Customizable Template** dengan berbagai pilihan layout
6. **Interactive PDF** dengan hyperlinks dan bookmarks
7. **Batch Export** untuk multiple assignments
8. **Scheduled Export** dengan email delivery
9. **Watermark & Security** options
10. **Mobile-Optimized** PDF viewer

## 🚀 FITUR SUPER ADVANCED

### 1. Export Button dengan Dropdown Options
```typescript
// File: resources/js/pages/admin/tugas-kelompok-detail.tsx

import { FileDown, FileText, BarChart3, Settings, Clock, Mail } from 'lucide-react';

const ExportButton = ({ assignmentId }: { assignmentId: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [exportType, setExportType] = useState<'summary' | 'detailed' | 'analytics' | 'custom'>('summary');

    const exportOptions = [
        {
            id: 'summary',
            label: 'Summary Report',
            description: 'Ringkasan tugas kelompok (2-3 halaman)',
            icon: FileText,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            id: 'detailed',
            label: 'Detailed Report',
            description: 'Laporan lengkap dengan semua data (10+ halaman)',
            icon: FileDown,
            color: 'from-purple-500 to-pink-500',
        },
        {
            id: 'analytics',
            label: 'Analytics Report',
            description: 'Fokus pada charts, graphs, dan statistik',
            icon: BarChart3,
            color: 'from-emerald-500 to-teal-500',
        },
        {
            id: 'custom',
            label: 'Custom Report',
            description: 'Pilih section yang ingin di-export',
            icon: Settings,
            color: 'from-amber-500 to-orange-500',
        },
    ];

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        <FileDown className="h-4 w-4" />
                        Export PDF
                    </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-2">
                    {exportOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <DropdownMenuItem
                                key={option.id}
                                onClick={() => {
                                    setExportType(option.id as any);
                                    setShowPreview(true);
                                }}
                                className="p-3 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white shrink-0`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-neutral-900 dark:text-white">
                                            {option.label}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                    
                    <DropdownMenuSeparator />
                    
                    {/* Schedule Export */}
                    <DropdownMenuItem
                        onClick={() => router.visit(`/admin/tugas-kelompok/${assignmentId}/schedule-export`)}
                        className="p-3 rounded-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm">Schedule Export</span>
                        </div>
                    </DropdownMenuItem>
                    
                    {/* Email Export */}
                    <DropdownMenuItem
                        onClick={() => router.visit(`/admin/tugas-kelompok/${assignmentId}/email-export`)}
                        className="p-3 rounded-xl cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm">Email Report</span>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Preview Modal */}
            {showPreview && (
                <ExportPreviewModal
                    assignmentId={assignmentId}
                    exportType={exportType}
                    onClose={() => setShowPreview(false)}
                    onExport={handleExport}
                />
            )}
        </>
    );
};
```


### 2. Export Preview Modal dengan Live Preview
```typescript
const ExportPreviewModal = ({ assignmentId, exportType, onClose, onExport }) => {
    const [previewData, setPreviewData] = useState(null);
    const [customSections, setCustomSections] = useState({
        overview: true,
        groups: true,
        submissions: true,
        grades: true,
        analytics: true,
        timeline: true,
        files: true,
        messages: true,
    });
    const [pdfOptions, setPdfOptions] = useState({
        orientation: 'portrait', // portrait, landscape
        pageSize: 'A4', // A4, Letter, Legal
        includeCharts: true,
        includeImages: true,
        colorMode: 'color', // color, grayscale
        watermark: false,
        watermarkText: 'CONFIDENTIAL',
        includePageNumbers: true,
        includeTableOfContents: true,
        includeHeader: true,
        includeFooter: true,
        headerText: 'Laporan Tugas Kelompok',
        footerText: 'Generated by TPLK System',
    });

    useEffect(() => {
        // Fetch preview data
        axios.get(`/admin/tugas-kelompok/${assignmentId}/export-preview`, {
            params: { type: exportType, sections: customSections }
        }).then(res => setPreviewData(res.data));
    }, [exportType, customSections]);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-7xl h-[90vh] p-0">
                <div className="flex h-full">
                    {/* Left Sidebar - Options */}
                    <div className="w-80 border-r border-neutral-200 dark:border-neutral-800 p-6 overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Export Options</h3>
                        
                        {/* Export Type */}
                        <div className="mb-6">
                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 block">
                                Export Type
                            </label>
                            <p className="text-xs text-neutral-500 mb-2">{exportType}</p>
                        </div>

                        {/* Custom Sections (only for custom type) */}
                        {exportType === 'custom' && (
                            <div className="mb-6">
                                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 block">
                                    Sections to Include
                                </label>
                                <div className="space-y-2">
                                    {Object.keys(customSections).map(section => (
                                        <label key={section} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={customSections[section]}
                                                onChange={(e) => setCustomSections({
                                                    ...customSections,
                                                    [section]: e.target.checked
                                                })}
                                                className="rounded"
                                            />
                                            <span className="text-sm capitalize">{section}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PDF Options */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold mb-2 block">Orientation</label>
                                <select
                                    value={pdfOptions.orientation}
                                    onChange={(e) => setPdfOptions({ ...pdfOptions, orientation: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold mb-2 block">Page Size</label>
                                <select
                                    value={pdfOptions.pageSize}
                                    onChange={(e) => setPdfOptions({ ...pdfOptions, pageSize: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="A4">A4</option>
                                    <option value="Letter">Letter</option>
                                    <option value="Legal">Legal</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold mb-2 block">Color Mode</label>
                                <select
                                    value={pdfOptions.colorMode}
                                    onChange={(e) => setPdfOptions({ ...pdfOptions, colorMode: e.target.value })}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="color">Full Color</option>
                                    <option value="grayscale">Grayscale</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={pdfOptions.includeCharts}
                                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeCharts: e.target.checked })}
                                />
                                <span className="text-sm">Include Charts</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={pdfOptions.watermark}
                                    onChange={(e) => setPdfOptions({ ...pdfOptions, watermark: e.target.checked })}
                                />
                                <span className="text-sm">Add Watermark</span>
                            </label>

                            {pdfOptions.watermark && (
                                <input
                                    type="text"
                                    value={pdfOptions.watermarkText}
                                    onChange={(e) => setPdfOptions({ ...pdfOptions, watermarkText: e.target.value })}
                                    placeholder="Watermark text"
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            )}

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={pdfOptions.includeTableOfContents}
                                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeTableOfContents: e.target.checked })}
                                />
                                <span className="text-sm">Table of Contents</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-2">
                            <Button
                                onClick={() => onExport(pdfOptions, customSections)}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                    {/* Right Side - Live Preview */}
                    <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 p-6 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-8">
                                {previewData ? (
                                    <PDFPreviewContent data={previewData} options={pdfOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-96">
                                        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
```

### 3. PDF Preview Content Component
```typescript
const PDFPreviewContent = ({ data, options }) => {
    return (
        <div className="space-y-8">
            {/* Cover Page */}
            <div className="text-center py-12 border-b-4 border-indigo-600">
                <div className="mb-6">
                    <img src="/logo.png" alt="Logo" className="h-16 mx-auto" />
                </div>
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                    Laporan Tugas Kelompok
                </h1>
                <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
                    {data.assignment.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                    {data.assignment.course.nama}
                </p>
                <p className="text-sm text-neutral-500 mt-8">
                    Generated on {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
            </div>

            {/* Table of Contents */}
            {options.includeTableOfContents && (
                <div className="py-8">
                    <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
                        Daftar Isi
                    </h2>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span>1. Overview</span>
                            <span>3</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span>2. Daftar Kelompok</span>
                            <span>5</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span>3. Statistik & Analytics</span>
                            <span>8</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span>4. Detail Submission</span>
                            <span>12</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed pb-2">
                            <span>5. Penilaian</span>
                            <span>15</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Section */}
            <div className="py-8">
                <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white border-l-4 border-indigo-600 pl-4">
                    1. Overview
                </h2>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Kelompok</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                            {data.stats.total_groups}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Sudah Submit</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                            {data.stats.submitted}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Rata-rata Nilai</p>
                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                            {data.stats.avg_grade}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Completion Rate</p>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                            {data.stats.completion_rate}%
                        </p>
                    </div>
                </div>

                {/* Assignment Info Table */}
                <table className="w-full border-collapse">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-3 px-4 font-bold bg-neutral-50 dark:bg-neutral-800 w-1/3">Judul Tugas</td>
                            <td className="py-3 px-4">{data.assignment.title}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4 font-bold bg-neutral-50 dark:bg-neutral-800">Mata Kuliah</td>
                            <td className="py-3 px-4">{data.assignment.course.nama}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4 font-bold bg-neutral-50 dark:bg-neutral-800">Dosen Pengampu</td>
                            <td className="py-3 px-4">{data.assignment.dosen.nama}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4 font-bold bg-neutral-50 dark:bg-neutral-800">Mode Pembentukan</td>
                            <td className="py-3 px-4 capitalize">{data.assignment.formation_mode}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4 font-bold bg-neutral-50 dark:bg-neutral-800">Mode Penilaian</td>
                            <td className="py-3 px-4 capitalize">{data.assignment.grading_mode}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-3 px-4 font-bold bg-neutral-50 dark:bg-neutral-800">Deadline Pembentukan</td>
                            <td className="py-3 px-4">{data.assignment.formation_deadline_display}</td>
                        </tr>
                        <tr>
                            <td className="py-3 px-4 font-bold bg-neutral-50 dark:bg-neutral-800">Deadline Submission</td>
                            <td className="py-3 px-4">{data.assignment.submission_deadline_display}</td>
                        </tr>
                    </tbody>
                </table>
            </div>


            {/* Groups Table - Advanced Styling */}
            <div className="py-8">
                <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white border-l-4 border-indigo-600 pl-4">
                    2. Daftar Kelompok
                </h2>
                
                <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <th className="py-4 px-4 text-left font-bold">No</th>
                                <th className="py-4 px-4 text-left font-bold">Nama Kelompok</th>
                                <th className="py-4 px-4 text-left font-bold">Ketua</th>
                                <th className="py-4 px-4 text-center font-bold">Anggota</th>
                                <th className="py-4 px-4 text-center font-bold">Status</th>
                                <th className="py-4 px-4 text-center font-bold">Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.groups.map((group, index) => (
                                <tr key={group.id} className={index % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-800/50'}>
                                    <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700">
                                        {index + 1}
                                    </td>
                                    <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700 font-semibold">
                                        {group.name}
                                    </td>
                                    <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700">
                                        {group.leader.nama}
                                    </td>
                                    <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700 text-center">
                                        {group.members_count} orang
                                    </td>
                                    <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                            group.has_submitted 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {group.has_submitted ? 'Submitted' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700 text-center font-bold">
                                        {group.grade || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-neutral-100 dark:bg-neutral-700 font-bold">
                                <td colSpan={3} className="py-3 px-4 text-right">Total / Rata-rata:</td>
                                <td className="py-3 px-4 text-center">{data.stats.total_students} mahasiswa</td>
                                <td className="py-3 px-4 text-center">{data.stats.submitted}/{data.stats.total_groups}</td>
                                <td className="py-3 px-4 text-center">{data.stats.avg_grade}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Analytics Section with Charts */}
            {options.includeCharts && (
                <div className="py-8">
                    <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white border-l-4 border-indigo-600 pl-4">
                        3. Statistik & Analytics
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Submission Status Chart */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <h3 className="font-bold text-lg mb-4">Status Submission</h3>
                            <div className="h-64 flex items-center justify-center">
                                <PieChartComponent data={data.charts.submission_status} />
                            </div>
                        </div>

                        {/* Grade Distribution Chart */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
                            <h3 className="font-bold text-lg mb-4">Distribusi Nilai</h3>
                            <div className="h-64 flex items-center justify-center">
                                <BarChartComponent data={data.charts.grade_distribution} />
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics Table */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <h3 className="font-bold text-lg mb-4">Performance Metrics</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">On-Time Submission</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">
                                    {data.metrics.on_time_percentage}%
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Average Collaboration Score</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">
                                    {data.metrics.avg_collaboration_score}/5
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Completion Rate</p>
                                <p className="text-3xl font-bold text-pink-600 mt-1">
                                    {data.metrics.completion_rate}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Group Information */}
            <div className="py-8">
                <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white border-l-4 border-indigo-600 pl-4">
                    4. Detail Kelompok
                </h2>
                
                {data.groups.map((group, index) => (
                    <div key={group.id} className="mb-8 break-inside-avoid">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-xl">
                            <h3 className="text-xl font-bold">
                                {index + 1}. {group.name}
                            </h3>
                        </div>
                        
                        <div className="border border-t-0 border-neutral-200 dark:border-neutral-700 rounded-b-xl overflow-hidden">
                            {/* Group Info */}
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Ketua Kelompok</p>
                                        <p className="font-bold">{group.leader.nama}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Jumlah Anggota</p>
                                        <p className="font-bold">{group.members_count} orang</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Status Submission</p>
                                        <p className="font-bold">{group.has_submitted ? 'Sudah Submit' : 'Belum Submit'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Nilai</p>
                                        <p className="font-bold text-indigo-600">{group.grade || 'Belum dinilai'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="p-4">
                                <h4 className="font-bold mb-3">Daftar Anggota:</h4>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-neutral-100 dark:bg-neutral-700">
                                            <th className="py-2 px-3 text-left">No</th>
                                            <th className="py-2 px-3 text-left">NIM</th>
                                            <th className="py-2 px-3 text-left">Nama</th>
                                            <th className="py-2 px-3 text-center">Role</th>
                                            <th className="py-2 px-3 text-center">Contribution</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.members.map((member, idx) => (
                                            <tr key={member.id} className="border-b border-neutral-200 dark:border-neutral-700">
                                                <td className="py-2 px-3">{idx + 1}</td>
                                                <td className="py-2 px-3">{member.nim}</td>
                                                <td className="py-2 px-3">{member.nama}</td>
                                                <td className="py-2 px-3 text-center">
                                                    {member.is_leader ? (
                                                        <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">
                                                            Ketua
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-500">Anggota</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                                style={{ width: `${member.contribution_score || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold">{member.contribution_score || 0}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Submission Info */}
                            {group.submission && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                                    <h4 className="font-bold mb-2 text-green-800 dark:text-green-300">Informasi Submission</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-neutral-600 dark:text-neutral-400">Waktu Submit</p>
                                            <p className="font-semibold">{group.submission.submitted_at}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-600 dark:text-neutral-400">Status</p>
                                            <p className="font-semibold">
                                                {group.submission.is_late ? (
                                                    <span className="text-red-600">Terlambat</span>
                                                ) : (
                                                    <span className="text-green-600">Tepat Waktu</span>
                                                )}
                                            </p>
                                        </div>
                                        {group.submission.notes && (
                                            <div className="col-span-2">
                                                <p className="text-neutral-600 dark:text-neutral-400">Catatan</p>
                                                <p className="font-semibold">{group.submission.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Watermark */}
            {options.watermark && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-45">
                    <p className="text-8xl font-bold text-neutral-500">
                        {options.watermarkText}
                    </p>
                </div>
            )}
        </div>
    );
};
```


## 📋 BACKEND IMPLEMENTATION

### 1. Controller - Export Preview & Generate PDF
```php
// File: app/Http/Controllers/Admin/TugasKelompokController.php

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

public function exportPreview(Request $request, int $id)
{
    $assignment = GroupAssignment::with([
        'course',
        'dosen',
        'groups.members.student',
        'groups.submission',
        'groups.leader'
    ])->findOrFail($id);

    $type = $request->input('type', 'summary');
    $sections = $request->input('sections', []);

    // Calculate statistics
    $stats = [
        'total_groups' => $assignment->groups->count(),
        'total_students' => $assignment->groups->sum(fn($g) => $g->members->count()),
        'submitted' => $assignment->groups->where('submission', '!=', null)->count(),
        'avg_grade' => round($assignment->groups->whereNotNull('submission.grade')->avg('submission.grade'), 2),
        'completion_rate' => $assignment->groups->count() > 0 
            ? round(($assignment->groups->where('submission', '!=', null)->count() / $assignment->groups->count()) * 100, 2)
            : 0,
    ];

    // Prepare groups data
    $groups = $assignment->groups->map(function ($group) {
        return [
            'id' => $group->id,
            'name' => $group->name,
            'leader' => [
                'id' => $group->leader_id,
                'nama' => $group->leader->nama ?? 'Unknown',
            ],
            'members_count' => $group->members->count(),
            'members' => $group->members->map(fn($m) => [
                'id' => $m->student_id,
                'nim' => $m->student->nim ?? '',
                'nama' => $m->student->nama ?? 'Unknown',
                'is_leader' => $m->is_leader,
                'contribution_score' => $this->calculateContributionScore($group, $m->student_id),
            ]),
            'has_submitted' => $group->submission !== null,
            'grade' => $group->submission?->grade,
            'submission' => $group->submission ? [
                'submitted_at' => $group->submission->submitted_at->format('d M Y H:i'),
                'is_late' => $group->submission->is_late,
                'notes' => $group->submission->submission_notes,
            ] : null,
        ];
    });

    // Charts data
    $charts = [
        'submission_status' => [
            ['label' => 'Submitted', 'value' => $stats['submitted']],
            ['label' => 'Pending', 'value' => $stats['total_groups'] - $stats['submitted']],
        ],
        'grade_distribution' => $this->getGradeDistribution($assignment),
    ];

    // Metrics
    $metrics = [
        'on_time_percentage' => $this->calculateOnTimePercentage($assignment),
        'avg_collaboration_score' => $this->calculateAvgCollaborationScore($assignment),
        'completion_rate' => $stats['completion_rate'],
    ];

    return response()->json([
        'assignment' => [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'description' => $assignment->description,
            'course' => [
                'id' => $assignment->course->id,
                'nama' => $assignment->course->nama,
            ],
            'dosen' => [
                'id' => $assignment->dosen->id,
                'nama' => $assignment->dosen->nama,
            ],
            'formation_mode' => $assignment->formation_mode,
            'grading_mode' => $assignment->grading_mode,
            'formation_deadline_display' => $assignment->formation_deadline?->format('d M Y H:i'),
            'submission_deadline_display' => $assignment->submission_deadline?->format('d M Y H:i'),
        ],
        'stats' => $stats,
        'groups' => $groups,
        'charts' => $charts,
        'metrics' => $metrics,
    ]);
}

public function exportPdf(Request $request, int $id)
{
    $validated = $request->validate([
        'type' => 'required|in:summary,detailed,analytics,custom',
        'sections' => 'nullable|array',
        'options' => 'required|array',
        'options.orientation' => 'required|in:portrait,landscape',
        'options.pageSize' => 'required|in:A4,Letter,Legal',
        'options.colorMode' => 'required|in:color,grayscale',
        'options.includeCharts' => 'boolean',
        'options.includeImages' => 'boolean',
        'options.watermark' => 'boolean',
        'options.watermarkText' => 'nullable|string',
        'options.includeTableOfContents' => 'boolean',
        'options.includeHeader' => 'boolean',
        'options.includeFooter' => 'boolean',
        'options.headerText' => 'nullable|string',
        'options.footerText' => 'nullable|string',
    ]);

    $assignment = GroupAssignment::with([
        'course',
        'dosen',
        'groups.members.student',
        'groups.submission',
        'groups.leader'
    ])->findOrFail($id);

    // Get preview data
    $previewRequest = new Request(['type' => $validated['type'], 'sections' => $validated['sections'] ?? []]);
    $previewData = json_decode($this->exportPreview($previewRequest, $id)->getContent(), true);

    // Generate PDF
    $pdf = Pdf::loadView('pdf.tugas-kelompok-report', [
        'data' => $previewData,
        'options' => $validated['options'],
        'type' => $validated['type'],
    ]);

    // Set PDF options
    $pdf->setPaper($validated['options']['pageSize'], $validated['options']['orientation']);
    
    if ($validated['options']['colorMode'] === 'grayscale') {
        $pdf->setOption('isPhpEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);
    }

    // Generate filename
    $filename = 'Laporan_' . Str::slug($assignment->title) . '_' . now()->format('Y-m-d_His') . '.pdf';

    // Save to storage (optional)
    $path = 'exports/tugas-kelompok/' . $filename;
    Storage::put($path, $pdf->output());

    // Log export activity
    activity()
        ->performedOn($assignment)
        ->causedBy(auth()->user())
        ->withProperties([
            'type' => $validated['type'],
            'filename' => $filename,
            'options' => $validated['options'],
        ])
        ->log('Exported PDF report');

    // Return PDF download
    return $pdf->download($filename);
}

private function calculateContributionScore($group, $studentId): int
{
    // Calculate based on commits, messages, files uploaded, etc.
    $commits = $group->activityLogs()
        ->where('user_id', $studentId)
        ->where('activity_type', 'commit')
        ->count();
    
    $messages = $group->messages()
        ->where('sender_id', $studentId)
        ->count();
    
    $files = $group->files()
        ->where('uploaded_by', $studentId)
        ->count();

    // Simple scoring algorithm
    $score = ($commits * 10) + ($messages * 2) + ($files * 5);
    $maxScore = 100;
    
    return min(100, round(($score / $maxScore) * 100));
}

private function getGradeDistribution($assignment): array
{
    $grades = $assignment->groups()
        ->whereHas('submission')
        ->whereNotNull('submission.grade')
        ->pluck('submission.grade');

    $distribution = [
        'A (85-100)' => $grades->filter(fn($g) => $g >= 85)->count(),
        'B (70-84)' => $grades->filter(fn($g) => $g >= 70 && $g < 85)->count(),
        'C (60-69)' => $grades->filter(fn($g) => $g >= 60 && $g < 70)->count(),
        'D (50-59)' => $grades->filter(fn($g) => $g >= 50 && $g < 60)->count(),
        'E (<50)' => $grades->filter(fn($g) => $g < 50)->count(),
    ];

    return collect($distribution)->map(fn($count, $label) => [
        'label' => $label,
        'value' => $count,
    ])->values()->toArray();
}

private function calculateOnTimePercentage($assignment): float
{
    $submitted = $assignment->groups()->whereHas('submission')->count();
    if ($submitted === 0) return 0;

    $onTime = $assignment->groups()
        ->whereHas('submission', fn($q) => $q->where('is_late', false))
        ->count();

    return round(($onTime / $submitted) * 100, 2);
}

private function calculateAvgCollaborationScore($assignment): float
{
    // Calculate based on peer evaluations, messages, activity
    $peerEvals = GaPeerEvaluation::where('assignment_id', $assignment->id)
        ->avg('communication_score');

    return round($peerEvals ?? 0, 2);
}
```

### 2. PDF Blade Template
```blade
{{-- File: resources/views/pdf/tugas-kelompok-report.blade.php --}}

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Tugas Kelompok - {{ $data['assignment']['title'] }}</title>
    <style>
        @page {
            margin: 2cm;
            @if($options['includeHeader'])
            @top-center {
                content: "{{ $options['headerText'] ?? 'Laporan Tugas Kelompok' }}";
                font-size: 10pt;
                color: #666;
            }
            @endif
            @if($options['includeFooter'])
            @bottom-center {
                content: "{{ $options['footerText'] ?? 'Generated by TPLK System' }} | Halaman " counter(page) " dari " counter(pages);
                font-size: 9pt;
                color: #666;
            }
            @endif
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            @if($options['colorMode'] === 'grayscale')
            filter: grayscale(100%);
            @endif
        }

        .cover-page {
            text-align: center;
            padding: 100px 0;
            page-break-after: always;
        }

        .cover-page h1 {
            font-size: 32pt;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 20px;
        }

        .cover-page h2 {
            font-size: 24pt;
            font-weight: 600;
            color: #7C3AED;
            margin-bottom: 40px;
        }

        .cover-page .meta {
            font-size: 12pt;
            color: #666;
            margin-top: 60px;
        }

        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 18pt;
            font-weight: bold;
            color: #1F2937;
            border-left: 4px solid #4F46E5;
            padding-left: 15px;
            margin-bottom: 20px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
            border: 1px solid #C7D2FE;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
        }

        .stat-card .label {
            font-size: 9pt;
            color: #4F46E5;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .stat-card .value {
            font-size: 24pt;
            font-weight: bold;
            color: #312E81;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        table.info-table td {
            padding: 10px 15px;
            border-bottom: 1px solid #E5E7EB;
        }

        table.info-table td:first-child {
            background: #F9FAFB;
            font-weight: bold;
            width: 35%;
        }

        table.data-table {
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            overflow: hidden;
        }

        table.data-table thead {
            background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
        }

        table.data-table th {
            padding: 12px 15px;
            font-weight: bold;
            text-align: left;
        }

        table.data-table td {
            padding: 10px 15px;
            border-bottom: 1px solid #E5E7EB;
        }

        table.data-table tbody tr:nth-child(even) {
            background: #F9FAFB;
        }

        table.data-table tfoot {
            background: #F3F4F6;
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: bold;
        }

        .badge-success {
            background: #D1FAE5;
            color: #065F46;
        }

        .badge-warning {
            background: #FEF3C7;
            color: #92400E;
        }

        .badge-primary {
            background: #DBEAFE;
            color: #1E40AF;
        }

        .group-detail {
            margin-bottom: 30px;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            overflow: hidden;
            page-break-inside: avoid;
        }

        .group-header {
            background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 15px 20px;
            font-size: 14pt;
            font-weight: bold;
        }

        .group-info {
            background: #F9FAFB;
            padding: 15px 20px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .group-info-item .label {
            font-size: 9pt;
            color: #6B7280;
            margin-bottom: 3px;
        }

        .group-info-item .value {
            font-weight: bold;
            color: #1F2937;
        }

        .group-members {
            padding: 15px 20px;
        }

        .progress-bar {
            width: 60px;
            height: 8px;
            background: #E5E7EB;
            border-radius: 4px;
            overflow: hidden;
            display: inline-block;
            vertical-align: middle;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%);
        }

        @if($options['watermark'])
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80pt;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.05);
            z-index: -1;
            white-space: nowrap;
        }
        @endif

        .page-break {
            page-break-after: always;
        }

        .toc {
            margin: 40px 0;
        }

        .toc-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #E5E7EB;
        }

        .chart-placeholder {
            width: 100%;
            height: 250px;
            background: #F3F4F6;
            border: 1px solid #E5E7EB;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6B7280;
            font-style: italic;
        }
    </style>
</head>
<body>
    @if($options['watermark'])
    <div class="watermark">{{ $options['watermarkText'] }}</div>
    @endif

    {{-- Cover Page --}}
    <div class="cover-page">
        <h1>Laporan Tugas Kelompok</h1>
        <h2>{{ $data['assignment']['title'] }}</h2>
        <p style="font-size: 14pt; color: #666;">{{ $data['assignment']['course']['nama'] }}</p>
        <div class="meta">
            <p>Dosen Pengampu: {{ $data['assignment']['dosen']['nama'] }}</p>
            <p style="margin-top: 60px;">Generated on {{ now()->format('d F Y') }}</p>
        </div>
    </div>

    {{-- Table of Contents --}}
    @if($options['includeTableOfContents'])
    <div class="section">
        <h2 class="section-title">Daftar Isi</h2>
        <div class="toc">
            <div class="toc-item"><span>1. Overview</span><span>3</span></div>
            <div class="toc-item"><span>2. Daftar Kelompok</span><span>5</span></div>
            <div class="toc-item"><span>3. Statistik & Analytics</span><span>8</span></div>
            <div class="toc-item"><span>4. Detail Kelompok</span><span>12</span></div>
            <div class="toc-item"><span>5. Lampiran</span><span>20</span></div>
        </div>
    </div>
    <div class="page-break"></div>
    @endif

    {{-- Overview Section --}}
    <div class="section">
        <h2 class="section-title">1. Overview</h2>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Total Kelompok</div>
                <div class="value">{{ $data['stats']['total_groups'] }}</div>
            </div>
            <div class="stat-card">
                <div class="label">Sudah Submit</div>
                <div class="value">{{ $data['stats']['submitted'] }}</div>
            </div>
            <div class="stat-card">
                <div class="label">Rata-rata Nilai</div>
                <div class="value">{{ $data['stats']['avg_grade'] }}</div>
            </div>
            <div class="stat-card">
                <div class="label">Completion Rate</div>
                <div class="value">{{ $data['stats']['completion_rate'] }}%</div>
            </div>
        </div>

        <table class="info-table">
            <tr>
                <td>Judul Tugas</td>
                <td>{{ $data['assignment']['title'] }}</td>
            </tr>
            <tr>
                <td>Mata Kuliah</td>
                <td>{{ $data['assignment']['course']['nama'] }}</td>
            </tr>
            <tr>
                <td>Dosen Pengampu</td>
                <td>{{ $data['assignment']['dosen']['nama'] }}</td>
            </tr>
            <tr>
                <td>Mode Pembentukan</td>
                <td style="text-transform: capitalize;">{{ $data['assignment']['formation_mode'] }}</td>
            </tr>
            <tr>
                <td>Mode Penilaian</td>
                <td style="text-transform: capitalize;">{{ $data['assignment']['grading_mode'] }}</td>
            </tr>
            <tr>
                <td>Deadline Pembentukan</td>
                <td>{{ $data['assignment']['formation_deadline_display'] }}</td>
            </tr>
            <tr>
                <td>Deadline Submission</td>
                <td>{{ $data['assignment']['submission_deadline_display'] }}</td>
            </tr>
        </table>
    </div>


    {{-- Groups Table --}}
    <div class="section">
        <h2 class="section-title">2. Daftar Kelompok</h2>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 25%;">Nama Kelompok</th>
                    <th style="width: 25%;">Ketua</th>
                    <th style="width: 15%; text-align: center;">Anggota</th>
                    <th style="width: 15%; text-align: center;">Status</th>
                    <th style="width: 15%; text-align: center;">Nilai</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['groups'] as $index => $group)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td style="font-weight: 600;">{{ $group['name'] }}</td>
                    <td>{{ $group['leader']['nama'] }}</td>
                    <td style="text-align: center;">{{ $group['members_count'] }} orang</td>
                    <td style="text-align: center;">
                        @if($group['has_submitted'])
                        <span class="badge badge-success">Submitted</span>
                        @else
                        <span class="badge badge-warning">Pending</span>
                        @endif
                    </td>
                    <td style="text-align: center; font-weight: bold;">
                        {{ $group['grade'] ?? '-' }}
                    </td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="text-align: right;">Total / Rata-rata:</td>
                    <td style="text-align: center;">{{ $data['stats']['total_students'] }} mahasiswa</td>
                    <td style="text-align: center;">{{ $data['stats']['submitted'] }}/{{ $data['stats']['total_groups'] }}</td>
                    <td style="text-align: center;">{{ $data['stats']['avg_grade'] }}</td>
                </tr>
            </tfoot>
        </table>
    </div>

    <div class="page-break"></div>

    {{-- Analytics Section --}}
    @if($options['includeCharts'])
    <div class="section">
        <h2 class="section-title">3. Statistik & Analytics</h2>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
            <div>
                <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 10px;">Status Submission</h3>
                <div class="chart-placeholder">
                    Pie Chart: Submission Status
                    <br><small>Submitted: {{ $data['stats']['submitted'] }} | Pending: {{ $data['stats']['total_groups'] - $data['stats']['submitted'] }}</small>
                </div>
            </div>
            <div>
                <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 10px;">Distribusi Nilai</h3>
                <div class="chart-placeholder">
                    Bar Chart: Grade Distribution
                </div>
            </div>
        </div>

        <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border: 1px solid #C7D2FE; border-radius: 10px; padding: 20px;">
            <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 15px;">Performance Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
                <div>
                    <p style="font-size: 9pt; color: #6B7280;">On-Time Submission</p>
                    <p style="font-size: 24pt; font-weight: bold; color: #4F46E5; margin-top: 5px;">
                        {{ $data['metrics']['on_time_percentage'] }}%
                    </p>
                </div>
                <div>
                    <p style="font-size: 9pt; color: #6B7280;">Avg Collaboration Score</p>
                    <p style="font-size: 24pt; font-weight: bold; color: #7C3AED; margin-top: 5px;">
                        {{ $data['metrics']['avg_collaboration_score'] }}/5
                    </p>
                </div>
                <div>
                    <p style="font-size: 9pt; color: #6B7280;">Completion Rate</p>
                    <p style="font-size: 24pt; font-weight: bold; color: #EC4899; margin-top: 5px;">
                        {{ $data['metrics']['completion_rate'] }}%
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="page-break"></div>
    @endif

    {{-- Detailed Group Information --}}
    <div class="section">
        <h2 class="section-title">4. Detail Kelompok</h2>
        
        @foreach($data['groups'] as $index => $group)
        <div class="group-detail">
            <div class="group-header">
                {{ $index + 1 }}. {{ $group['name'] }}
            </div>
            
            <div class="group-info">
                <div class="group-info-item">
                    <div class="label">Ketua Kelompok</div>
                    <div class="value">{{ $group['leader']['nama'] }}</div>
                </div>
                <div class="group-info-item">
                    <div class="label">Jumlah Anggota</div>
                    <div class="value">{{ $group['members_count'] }} orang</div>
                </div>
                <div class="group-info-item">
                    <div class="label">Status Submission</div>
                    <div class="value">{{ $group['has_submitted'] ? 'Sudah Submit' : 'Belum Submit' }}</div>
                </div>
                <div class="group-info-item">
                    <div class="label">Nilai</div>
                    <div class="value" style="color: #4F46E5;">{{ $group['grade'] ?? 'Belum dinilai' }}</div>
                </div>
            </div>

            <div class="group-members">
                <h4 style="font-weight: bold; margin-bottom: 10px;">Daftar Anggota:</h4>
                <table style="width: 100%; font-size: 10pt;">
                    <thead style="background: #F3F4F6;">
                        <tr>
                            <th style="padding: 8px; text-align: left; width: 5%;">No</th>
                            <th style="padding: 8px; text-align: left; width: 20%;">NIM</th>
                            <th style="padding: 8px; text-align: left; width: 35%;">Nama</th>
                            <th style="padding: 8px; text-align: center; width: 15%;">Role</th>
                            <th style="padding: 8px; text-align: center; width: 25%;">Contribution</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($group['members'] as $mIndex => $member)
                        <tr style="border-bottom: 1px solid #E5E7EB;">
                            <td style="padding: 8px;">{{ $mIndex + 1 }}</td>
                            <td style="padding: 8px;">{{ $member['nim'] }}</td>
                            <td style="padding: 8px;">{{ $member['nama'] }}</td>
                            <td style="padding: 8px; text-align: center;">
                                @if($member['is_leader'])
                                <span class="badge badge-primary">Ketua</span>
                                @else
                                <span style="color: #6B7280;">Anggota</span>
                                @endif
                            </td>
                            <td style="padding: 8px; text-align: center;">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: {{ $member['contribution_score'] ?? 0 }}%;"></div>
                                </div>
                                <span style="font-size: 9pt; font-weight: bold; margin-left: 5px;">{{ $member['contribution_score'] ?? 0 }}%</span>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            @if($group['submission'])
            <div style="background: #D1FAE5; border-top: 1px solid #6EE7B7; padding: 15px 20px;">
                <h4 style="font-weight: bold; margin-bottom: 10px; color: #065F46;">Informasi Submission</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 10pt;">
                    <div>
                        <p style="color: #6B7280;">Waktu Submit</p>
                        <p style="font-weight: 600;">{{ $group['submission']['submitted_at'] }}</p>
                    </div>
                    <div>
                        <p style="color: #6B7280;">Status</p>
                        <p style="font-weight: 600;">
                            @if($group['submission']['is_late'])
                            <span style="color: #DC2626;">Terlambat</span>
                            @else
                            <span style="color: #059669;">Tepat Waktu</span>
                            @endif
                        </p>
                    </div>
                    @if($group['submission']['notes'])
                    <div style="grid-column: span 2;">
                        <p style="color: #6B7280;">Catatan</p>
                        <p style="font-weight: 600;">{{ $group['submission']['notes'] }}</p>
                    </div>
                    @endif
                </div>
            </div>
            @endif
        </div>
        @endforeach
    </div>

    {{-- Footer --}}
    <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 9pt;">
        <p>Dokumen ini dibuat secara otomatis oleh sistem TPLK</p>
        <p>© {{ now()->year }} - Universitas Pamulang</p>
    </div>
</body>
</html>
```

### 3. Routes
```php
// File: routes/web.php

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::prefix('tugas-kelompok')->name('tugas-kelompok.')->group(function () {
        Route::get('/{id}/export-preview', [TugasKelompokController::class, 'exportPreview'])
            ->name('export-preview');
        Route::post('/{id}/export-pdf', [TugasKelompokController::class, 'exportPdf'])
            ->name('export-pdf');
        Route::get('/{id}/schedule-export', [TugasKelompokController::class, 'scheduleExport'])
            ->name('schedule-export');
        Route::post('/{id}/schedule-export', [TugasKelompokController::class, 'storeScheduledExport'])
            ->name('store-scheduled-export');
        Route::get('/{id}/email-export', [TugasKelompokController::class, 'emailExport'])
            ->name('email-export');
        Route::post('/{id}/email-export', [TugasKelompokController::class, 'sendEmailExport'])
            ->name('send-email-export');
    });
});
```

## 🎨 ADVANCED FEATURES

### 4. Schedule Export Feature
```typescript
const ScheduleExportModal = ({ assignmentId }) => {
    const [schedule, setSchedule] = useState({
        frequency: 'once', // once, daily, weekly, monthly
        date: '',
        time: '09:00',
        recipients: [],
        exportType: 'summary',
        autoSend: true,
    });

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Schedule Export</DialogTitle>
                    <DialogDescription>
                        Jadwalkan export PDF otomatis dan kirim via email
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold mb-2 block">Frequency</label>
                        <select
                            value={schedule.frequency}
                            onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2"
                        >
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold mb-2 block">Date</label>
                            <input
                                type="date"
                                value={schedule.date}
                                onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-2 block">Time</label>
                            <input
                                type="time"
                                value={schedule.time}
                                onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold mb-2 block">Recipients (Email)</label>
                        <TagInput
                            value={schedule.recipients}
                            onChange={(recipients) => setSchedule({ ...schedule, recipients })}
                            placeholder="Enter email addresses"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold mb-2 block">Export Type</label>
                        <select
                            value={schedule.exportType}
                            onChange={(e) => setSchedule({ ...schedule, exportType: e.target.value })}
                            className="w-full rounded-lg border px-3 py-2"
                        >
                            <option value="summary">Summary Report</option>
                            <option value="detailed">Detailed Report</option>
                            <option value="analytics">Analytics Report</option>
                        </select>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={schedule.autoSend}
                            onChange={(e) => setSchedule({ ...schedule, autoSend: e.target.checked })}
                        />
                        <span className="text-sm">Automatically send via email</span>
                    </label>
                </div>

                <DialogFooter>
                    <Button onClick={handleSchedule} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
```

### 5. Batch Export Feature
```typescript
const BatchExportModal = ({ selectedAssignments }) => {
    const [batchOptions, setBatchOptions] = useState({
        mergeIntoOne: false,
        exportType: 'summary',
        includeComparison: true,
    });

    const handleBatchExport = async () => {
        const response = await axios.post('/admin/tugas-kelompok/batch-export', {
            assignment_ids: selectedAssignments.map(a => a.id),
            options: batchOptions,
        }, {
            responseType: 'blob'
        });

        // Download file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Batch_Export_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Batch Export ({selectedAssignments.length} assignments)</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={batchOptions.mergeIntoOne}
                            onChange={(e) => setBatchOptions({ ...batchOptions, mergeIntoOne: e.target.checked })}
                        />
                        <span className="text-sm">Merge into one PDF file</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={batchOptions.includeComparison}
                            onChange={(e) => setBatchOptions({ ...batchOptions, includeComparison: e.target.checked })}
                        />
                        <span className="text-sm">Include comparison chart</span>
                    </label>
                </div>

                <DialogFooter>
                    <Button onClick={handleBatchExport}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Export All
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
```


## 📦 DEPENDENCIES & INSTALLATION

### 1. Install Required Packages
```bash
# Install DomPDF for Laravel
composer require barryvdh/laravel-dompdf

# Install Chart.js for frontend charts (optional)
npm install chart.js react-chartjs-2

# Install additional UI components
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-dialog
npm install lucide-react
```

### 2. Publish DomPDF Config
```bash
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

### 3. Configure DomPDF
```php
// File: config/dompdf.php

return [
    'show_warnings' => false,
    'public_path' => public_path(),
    'convert_entities' => true,
    'options' => [
        'font_dir' => storage_path('fonts/'),
        'font_cache' => storage_path('fonts/'),
        'temp_dir' => sys_get_temp_dir(),
        'chroot' => realpath(base_path()),
        'allowed_protocols' => [
            'file://' => ['rules' => []],
            'http://' => ['rules' => []],
            'https://' => ['rules' => []],
        ],
        'log_output_file' => null,
        'enable_font_subsetting' => false,
        'pdf_backend' => 'CPDF',
        'default_media_type' => 'screen',
        'default_paper_size' => 'a4',
        'default_paper_orientation' => 'portrait',
        'default_font' => 'serif',
        'dpi' => 96,
        'enable_php' => false,
        'enable_javascript' => true,
        'enable_remote' => true,
        'font_height_ratio' => 1.1,
        'enable_html5_parser' => true,
    ],
];
```

## 🎯 INOVASI SUPER ADVANCED

### 1. AI-Powered Summary Generation
```php
// Generate intelligent summary using AI
public function generateAISummary($assignment)
{
    $data = [
        'total_groups' => $assignment->groups->count(),
        'avg_grade' => $assignment->groups->avg('submission.grade'),
        'completion_rate' => $this->calculateCompletionRate($assignment),
        'collaboration_score' => $this->calculateCollaborationScore($assignment),
    ];

    // Use OpenAI or local AI model to generate insights
    $prompt = "Analyze this group assignment data and provide insights: " . json_encode($data);
    
    // Return AI-generated summary
    return [
        'summary' => 'AI-generated summary here...',
        'recommendations' => ['Recommendation 1', 'Recommendation 2'],
        'highlights' => ['Highlight 1', 'Highlight 2'],
        'concerns' => ['Concern 1', 'Concern 2'],
    ];
}
```

### 2. Interactive PDF with QR Codes
```blade
{{-- Add QR Code for each group --}}
<div style="text-align: center; margin: 20px 0;">
    <img src="data:image/png;base64,{{ base64_encode(QrCode::format('png')->size(100)->generate(route('admin.tugas-kelompok.group', $group['id']))) }}" alt="QR Code">
    <p style="font-size: 8pt; color: #666; margin-top: 5px;">Scan untuk detail kelompok</p>
</div>
```

### 3. Dynamic Charts in PDF
```php
// Generate chart image for PDF
use Illuminate\Support\Facades\Http;

public function generateChartImage($chartData, $type = 'pie')
{
    // Use QuickChart API to generate chart image
    $response = Http::post('https://quickchart.io/chart', [
        'chart' => [
            'type' => $type,
            'data' => $chartData,
            'options' => [
                'plugins' => [
                    'legend' => ['display' => true],
                    'title' => ['display' => true, 'text' => 'Chart Title'],
                ],
            ],
        ],
        'width' => 500,
        'height' => 300,
        'backgroundColor' => 'white',
    ]);

    return 'data:image/png;base64,' . base64_encode($response->body());
}
```

### 4. Export History & Analytics
```typescript
const ExportHistoryModal = ({ assignmentId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        axios.get(`/admin/tugas-kelompok/${assignmentId}/export-history`)
            .then(res => setHistory(res.data));
    }, []);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Export History</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {history.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <p className="font-bold">{item.filename}</p>
                                    <p className="text-sm text-neutral-500">
                                        {item.type} • {item.created_at} • by {item.user.nama}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(item.download_url)}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
```

### 5. PDF Compression & Optimization
```php
// Optimize PDF size
public function optimizePdf($pdfPath)
{
    // Use Ghostscript to compress PDF
    $outputPath = str_replace('.pdf', '_compressed.pdf', $pdfPath);
    
    exec("gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile={$outputPath} {$pdfPath}");
    
    // Replace original with compressed version
    if (file_exists($outputPath)) {
        unlink($pdfPath);
        rename($outputPath, $pdfPath);
    }
    
    return $pdfPath;
}
```

### 6. Multi-Language Support
```php
// Support multiple languages in PDF
public function exportPdf(Request $request, int $id)
{
    $locale = $request->input('locale', 'id'); // id, en
    app()->setLocale($locale);
    
    // ... rest of export logic
    
    $pdf = Pdf::loadView('pdf.tugas-kelompok-report', [
        'data' => $previewData,
        'options' => $validated['options'],
        'locale' => $locale,
    ]);
    
    return $pdf->download($filename);
}
```

### 7. Digital Signature Support
```blade
{{-- Add digital signature to PDF --}}
<div style="margin-top: 60px; text-align: right;">
    <div style="border-top: 2px solid #000; width: 200px; display: inline-block; margin-bottom: 5px;"></div>
    <p style="font-weight: bold;">{{ $data['assignment']['dosen']['nama'] }}</p>
    <p style="font-size: 9pt; color: #666;">Dosen Pengampu</p>
    @if($options['includeDigitalSignature'])
    <img src="{{ $digitalSignatureUrl }}" alt="Digital Signature" style="height: 40px; margin-top: 10px;">
    @endif
</div>
```

### 8. Export Templates Library
```typescript
const ExportTemplatesModal = () => {
    const templates = [
        {
            id: 'modern',
            name: 'Modern Professional',
            preview: '/templates/modern-preview.png',
            description: 'Clean and modern design with gradients',
        },
        {
            id: 'classic',
            name: 'Classic Academic',
            preview: '/templates/classic-preview.png',
            description: 'Traditional academic report style',
        },
        {
            id: 'minimal',
            name: 'Minimal Clean',
            preview: '/templates/minimal-preview.png',
            description: 'Minimalist design with focus on data',
        },
        {
            id: 'colorful',
            name: 'Colorful Creative',
            preview: '/templates/colorful-preview.png',
            description: 'Vibrant colors and creative layout',
        },
    ];

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Choose Export Template</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    {templates.map(template => (
                        <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleSelectTemplate(template.id)}
                            className="cursor-pointer rounded-xl border-2 border-neutral-200 hover:border-indigo-600 overflow-hidden"
                        >
                            <img src={template.preview} alt={template.name} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold">{template.name}</h3>
                                <p className="text-sm text-neutral-500 mt-1">{template.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
```

## ✅ CHECKLIST IMPLEMENTASI

### Backend
- [ ] Install barryvdh/laravel-dompdf package
- [ ] Create exportPreview method in controller
- [ ] Create exportPdf method in controller
- [ ] Create PDF blade template
- [ ] Implement statistics calculation methods
- [ ] Implement chart generation
- [ ] Add routes for export endpoints
- [ ] Create scheduled export functionality
- [ ] Create batch export functionality
- [ ] Add export history tracking
- [ ] Implement PDF optimization
- [ ] Add digital signature support

### Frontend
- [ ] Create ExportButton component with dropdown
- [ ] Create ExportPreviewModal component
- [ ] Create PDFPreviewContent component
- [ ] Implement live preview functionality
- [ ] Create ScheduleExportModal component
- [ ] Create BatchExportModal component
- [ ] Create ExportHistoryModal component
- [ ] Create ExportTemplatesModal component
- [ ] Add chart components (Pie, Bar, Line)
- [ ] Implement custom sections selection
- [ ] Add PDF options configuration
- [ ] Integrate with backend API

### UI/UX
- [ ] Design modern export button with gradient
- [ ] Create intuitive dropdown menu
- [ ] Design preview modal with sidebar
- [ ] Implement live preview rendering
- [ ] Add loading states and animations
- [ ] Create responsive layout for mobile
- [ ] Add success/error notifications
- [ ] Implement progress indicator for export
- [ ] Design template selection interface
- [ ] Add tooltips and help text

### Advanced Features
- [ ] AI-powered summary generation
- [ ] QR code integration
- [ ] Dynamic chart generation
- [ ] Multi-language support
- [ ] Digital signature
- [ ] PDF compression
- [ ] Watermark support
- [ ] Table of contents generation
- [ ] Bookmarks for navigation
- [ ] Export history tracking

### Testing
- [ ] Test summary report export
- [ ] Test detailed report export
- [ ] Test analytics report export
- [ ] Test custom report export
- [ ] Test all PDF options (orientation, size, color mode)
- [ ] Test watermark functionality
- [ ] Test scheduled export
- [ ] Test batch export
- [ ] Test email delivery
- [ ] Test PDF optimization
- [ ] Test on different browsers
- [ ] Test mobile responsiveness

## 🎨 DESIGN SPECIFICATIONS

### Colors
```typescript
const colors = {
    primary: {
        gradient: 'from-indigo-600 to-purple-600',
        solid: '#4F46E5',
    },
    secondary: {
        gradient: 'from-purple-600 to-pink-600',
        solid: '#7C3AED',
    },
    success: {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#6EE7B7',
    },
    warning: {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FCD34D',
    },
    info: {
        bg: '#DBEAFE',
        text: '#1E40AF',
        border: '#93C5FD',
    },
};
```

### Typography
```css
/* PDF Typography */
h1 { font-size: 32pt; font-weight: bold; }
h2 { font-size: 18pt; font-weight: bold; }
h3 { font-size: 14pt; font-weight: bold; }
h4 { font-size: 12pt; font-weight: bold; }
body { font-size: 11pt; line-height: 1.6; }
small { font-size: 9pt; }
```

### Spacing
```css
/* Consistent spacing */
.section { margin-bottom: 40px; }
.card { padding: 20px; }
.table td { padding: 10px 15px; }
.gap-sm { gap: 10px; }
.gap-md { gap: 20px; }
.gap-lg { gap: 30px; }
```

## 📝 CATATAN PENTING

1. **PDF Generation Performance**
   - Use queue for large PDFs (>50 pages)
   - Implement caching for frequently exported reports
   - Optimize images before including in PDF
   - Use lazy loading for preview

2. **Security**
   - Validate user permissions before export
   - Sanitize all user inputs
   - Add rate limiting for export endpoints
   - Encrypt sensitive data in PDF

3. **Mobile Optimization**
   - Ensure preview modal is responsive
   - Use touch-friendly buttons (min 44x44px)
   - Optimize PDF size for mobile download
   - Add mobile-specific export options

4. **Accessibility**
   - Add ARIA labels to all interactive elements
   - Ensure keyboard navigation works
   - Provide alternative text for images
   - Use semantic HTML in PDF template

5. **Browser Compatibility**
   - Test on Chrome, Firefox, Safari, Edge
   - Provide fallback for older browsers
   - Handle PDF download errors gracefully
   - Add browser-specific CSS fixes if needed

---

**PENTING**: Implementasi ini menggunakan teknologi terkini dan best practices untuk menghasilkan PDF yang profesional, informatif, dan mudah dibaca. Pastikan semua dependencies terinstall dengan benar dan test secara menyeluruh sebelum deploy ke production!
