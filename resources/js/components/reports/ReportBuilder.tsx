import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, FileText, Mail, Play, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    fields: string[];
    group_by: string;
}

interface ReportBuilderProps {
    templates: ReportTemplate[];
    courses: any[];
    classes: string[];
    onGenerate: (config: any) => void;
    onSchedule: (config: any) => void;
}

export function ReportBuilder({ templates, courses, classes, onGenerate, onSchedule }: ReportBuilderProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [config, setConfig] = useState({
        date_from: '',
        date_to: '',
        course_id: '',
        kelas: '',
        status: 'all',
        format: 'pdf',
    });
    const [scheduleConfig, setScheduleConfig] = useState({
        name: '',
        frequency: 'daily',
        recipients: '',
    });
    const [showSchedule, setShowSchedule] = useState(false);

    const handleGenerate = () => {
        onGenerate({
            template_id: selectedTemplate,
            ...config,
        });
    };

    const handleSchedule = () => {
        onSchedule({
            ...scheduleConfig,
            template_id: selectedTemplate,
            criteria: config,
            format: config.format,
            recipients: scheduleConfig.recipients.split(',').map(e => e.trim()),
        });
    };

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

    return (
        <div className="space-y-6">
            {/* Template Selection */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Pilih Template Laporan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedTemplate === template.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                        >
                            <h4 className="font-semibold mb-2">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            {selectedTemplate === template.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 pt-3 border-t"
                                >
                                    <div className="text-xs text-muted-foreground">
                                        <strong>Fields:</strong> {template.fields.join(', ')}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Filters */}
            {selectedTemplate && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-500" />
                            Filter & Kriteria
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Date Range */}
                            <div>
                                <Label>Tanggal Mulai</Label>
                                <Input
                                    type="date"
                                    value={config.date_from}
                                    onChange={(e) => setConfig({ ...config, date_from: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Tanggal Akhir</Label>
                                <Input
                                    type="date"
                                    value={config.date_to}
                                    onChange={(e) => setConfig({ ...config, date_to: e.target.value })}
                                />
                            </div>

                            {/* Course Filter */}
                            <div>
                                <Label>Mata Kuliah</Label>
                                <Select value={config.course_id} onValueChange={(v) => setConfig({ ...config, course_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Mata Kuliah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={String(course.id)}>
                                                {course.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Class Filter */}
                            <div>
                                <Label>Kelas</Label>
                                <Select value={config.kelas} onValueChange={(v) => setConfig({ ...config, kelas: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kelas</SelectItem>
                                        {classes.map((kelas) => (
                                            <SelectItem key={kelas} value={kelas}>
                                                {kelas}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <Label>Status</Label>
                                <Select value={config.status} onValueChange={(v) => setConfig({ ...config, status: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="hadir">Hadir</SelectItem>
                                        <SelectItem value="alpha">Alpha</SelectItem>
                                        <SelectItem value="izin">Izin</SelectItem>
                                        <SelectItem value="sakit">Sakit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Export Format */}
                            <div>
                                <Label>Format Export</Label>
                                <Select value={config.format} onValueChange={(v) => setConfig({ ...config, format: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">📄 PDF</SelectItem>
                                        <SelectItem value="excel">📊 Excel</SelectItem>
                                        <SelectItem value="csv">📋 CSV</SelectItem>
                                        <SelectItem value="json">🔧 JSON</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleGenerate} className="flex-1">
                                <Play className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                            <Button onClick={() => setShowSchedule(!showSchedule)} variant="outline">
                                <Mail className="mr-2 h-4 w-4" />
                                Schedule
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Schedule Configuration */}
            {showSchedule && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Mail className="h-5 w-5 text-green-500" />
                            Jadwalkan Laporan Otomatis
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Nama Jadwal</Label>
                                <Input
                                    placeholder="e.g., Laporan Harian Kehadiran"
                                    value={scheduleConfig.name}
                                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Frekuensi</Label>
                                <Select value={scheduleConfig.frequency} onValueChange={(v) => setScheduleConfig({ ...scheduleConfig, frequency: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">📅 Harian</SelectItem>
                                        <SelectItem value="weekly">📆 Mingguan</SelectItem>
                                        <SelectItem value="monthly">🗓️ Bulanan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Label>Email Penerima (pisahkan dengan koma)</Label>
                                <Input
                                    placeholder="email1@example.com, email2@example.com"
                                    value={scheduleConfig.recipients}
                                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, recipients: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button onClick={handleSchedule} className="mt-4 w-full">
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Jadwal
                        </Button>
                    </Card>
                </motion.div>
            )}

            {/* Preview Info */}
            {selectedTemplateData && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <h4 className="font-semibold mb-2">📊 Preview Laporan</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        Template: <strong>{selectedTemplateData.name}</strong>
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">Periode</div>
                            <div className="font-medium">
                                {config.date_from && config.date_to
                                    ? `${config.date_from} - ${config.date_to}`
                                    : 'Semua Periode'}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Format</div>
                            <div className="font-medium uppercase">{config.format}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Group By</div>
                            <div className="font-medium">{selectedTemplateData.group_by}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Fields</div>
                            <div className="font-medium">{selectedTemplateData.fields.length} kolom</div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
