import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    FileText, Plus, Edit, Trash2, Calendar, Clock, Play
} from 'lucide-react';
import { useState } from 'react';

interface Template {
    id: number;
    name: string;
    description: string | null;
    default_start_time: string;
    default_end_time: string;
    duration_minutes: number;
    default_days: number[];
    auto_activate: boolean;
    is_active: boolean;
    course?: { id: number; nama: string };
}

interface Props {
    dosen: { id: number; nama: string };
    templates: Template[];
    courses: Array<{ id: number; nama: string; sks: number }>;
}

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SessionTemplates({ dosen, templates, courses }: Props) {
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });
    const [generateModal, setGenerateModal] = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });

    const form = useForm({
        course_id: '',
        name: '',
        description: '',
        default_start_time: '08:00',
        default_end_time: '10:00',
        default_days: [] as number[],
        auto_activate: false,
    });

    const generateForm = useForm({
        start_date: '',
        total_meetings: 14,
    });

    const handleCreate = () => {
        form.post('/dosen/session-templates', {
            onSuccess: () => {
                setCreateModal(false);
                form.reset();
            }
        });
    };

    const handleUpdate = () => {
        if (!editModal.template) return;
        form.patch(`/dosen/session-templates/${editModal.template.id}`, {
            onSuccess: () => {
                setEditModal({ open: false, template: null });
                form.reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus template ini?')) {
            router.delete(`/dosen/session-templates/${id}`);
        }
    };

    const handleGenerate = () => {
        if (!generateModal.template) return;
        generateForm.post(`/dosen/session-templates/${generateModal.template.id}/generate`, {
            onSuccess: () => {
                setGenerateModal({ open: false, template: null });
                generateForm.reset();
            }
        });
    };

    const openEditModal = (template: Template) => {
        form.setData({
            course_id: String(template.course?.id || ''),
            name: template.name,
            description: template.description || '',
            default_start_time: template.default_start_time,
            default_end_time: template.default_end_time,
            default_days: template.default_days,
            auto_activate: template.auto_activate,
        });
        setEditModal({ open: true, template });
    };

    const toggleDay = (day: number) => {
        const current = form.data.default_days;
        if (current.includes(day)) {
            form.setData('default_days', current.filter(d => d !== day));
        } else {
            form.setData('default_days', [...current, day]);
        }
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Session Templates" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            Session Templates
                        </h1>
                        <p className="text-muted-foreground">Buat template untuk generate sesi otomatis</p>
                    </div>
                    <Button onClick={() => setCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Template
                    </Button>
                </div>

                {/* Templates Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(template => (
                        <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription>{template.course?.nama}</CardDescription>
                                    </div>
                                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                        {template.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {template.description && (
                                    <p className="text-sm text-muted-foreground">{template.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{template.default_start_time} - {template.default_end_time}</span>
                                    <span className="text-muted-foreground">({template.duration_minutes} menit)</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex gap-1">
                                        {template.default_days.map(d => (
                                            <Badge key={d} variant="outline" className="text-xs">
                                                {DAYS[d].slice(0, 3)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                {template.auto_activate && (
                                    <Badge variant="secondary" className="text-xs">Auto-activate</Badge>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setGenerateModal({ open: true, template })}
                                    >
                                        <Play className="h-4 w-4 mr-1" />
                                        Generate
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => openEditModal(template)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(template.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {templates.length === 0 && (
                        <Card className="col-span-full">
                            <CardContent className="py-12 text-center">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground">Belum ada template</p>
                                <Button className="mt-4" onClick={() => setCreateModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Template Pertama
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={createModal || editModal.open} onOpenChange={(open) => {
                if (!open) {
                    setCreateModal(false);
                    setEditModal({ open: false, template: null });
                    form.reset();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editModal.template ? 'Edit Template' : 'Buat Template Baru'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Mata Kuliah</Label>
                            <Select value={form.data.course_id} onValueChange={(v) => form.setData('course_id', v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Pilih mata kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Nama Template</Label>
                            <Input
                                className="mt-1"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Contoh: Jadwal Reguler"
                            />
                        </div>
                        <div>
                            <Label>Deskripsi (opsional)</Label>
                            <Textarea
                                className="mt-1"
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Deskripsi template..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Jam Mulai</Label>
                                <Input
                                    type="time"
                                    className="mt-1"
                                    value={form.data.default_start_time}
                                    onChange={(e) => form.setData('default_start_time', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Jam Selesai</Label>
                                <Input
                                    type="time"
                                    className="mt-1"
                                    value={form.data.default_end_time}
                                    onChange={(e) => form.setData('default_end_time', e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Hari Default</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {DAYS.map((day, idx) => (
                                    <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={form.data.default_days.includes(idx)}
                                            onCheckedChange={() => toggleDay(idx)}
                                        />
                                        <span className="text-sm">{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={form.data.auto_activate}
                                onCheckedChange={(v) => form.setData('auto_activate', v)}
                            />
                            <Label>Auto-activate sesi yang dibuat</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setCreateModal(false);
                            setEditModal({ open: false, template: null });
                            form.reset();
                        }}>
                            Batal
                        </Button>
                        <Button onClick={editModal.template ? handleUpdate : handleCreate} disabled={form.processing}>
                            {editModal.template ? 'Simpan' : 'Buat'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generate Modal */}
            <Dialog open={generateModal.open} onOpenChange={(open) => setGenerateModal({ open, template: generateModal.template })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Sesi dari Template</DialogTitle>
                    </DialogHeader>
                    {generateModal.template && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="font-medium">{generateModal.template.name}</p>
                                <p className="text-sm text-muted-foreground">{generateModal.template.course?.nama}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {generateModal.template.default_start_time} - {generateModal.template.default_end_time}
                                </p>
                            </div>
                            <div>
                                <Label>Tanggal Mulai</Label>
                                <Input
                                    type="date"
                                    className="mt-1"
                                    value={generateForm.data.start_date}
                                    onChange={(e) => generateForm.setData('start_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Jumlah Pertemuan</Label>
                                <Input
                                    type="number"
                                    className="mt-1"
                                    min={1}
                                    max={21}
                                    value={generateForm.data.total_meetings}
                                    onChange={(e) => generateForm.setData('total_meetings', parseInt(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    2 SKS = 14 pertemuan, 3 SKS = 21 pertemuan
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGenerateModal({ open: false, template: null })}>
                            Batal
                        </Button>
                        <Button onClick={handleGenerate} disabled={generateForm.processing}>
                            <Play className="h-4 w-4 mr-2" />
                            Generate Sesi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
