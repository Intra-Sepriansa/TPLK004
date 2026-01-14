import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Plus, Edit, Trash2, Calendar, Clock, Play, X } from 'lucide-react';
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

    const generateForm = useForm({ start_date: '', total_meetings: 14 });

    const handleCreate = () => {
        form.post('/dosen/session-templates', { onSuccess: () => { setCreateModal(false); form.reset(); } });
    };

    const handleUpdate = () => {
        if (!editModal.template) return;
        form.patch(`/dosen/session-templates/${editModal.template.id}`, { onSuccess: () => { setEditModal({ open: false, template: null }); form.reset(); } });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus template ini?')) router.delete(`/dosen/session-templates/${id}`);
    };

    const handleGenerate = () => {
        if (!generateModal.template) return;
        generateForm.post(`/dosen/session-templates/${generateModal.template.id}/generate`, { onSuccess: () => { setGenerateModal({ open: false, template: null }); generateForm.reset(); } });
    };

    const openEditModal = (template: Template) => {
        form.setData({ course_id: String(template.course?.id || ''), name: template.name, description: template.description || '', default_start_time: template.default_start_time, default_end_time: template.default_end_time, default_days: template.default_days, auto_activate: template.auto_activate });
        setEditModal({ open: true, template });
    };

    const toggleDay = (day: number) => {
        const current = form.data.default_days;
        form.setData('default_days', current.includes(day) ? current.filter(d => d !== day) : [...current, day]);
    };

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Session Templates" />
            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-teal-100">Manajemen</p>
                                    <h1 className="text-2xl font-bold">Session Templates</h1>
                                </div>
                            </div>
                            <Button onClick={() => setCreateModal(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Template
                            </Button>
                        </div>
                        <p className="mt-4 text-teal-100">Buat template untuk generate sesi otomatis</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(template => (
                        <div key={template.id} className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden ${!template.is_active ? 'opacity-60' : ''}`}>
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                                        <p className="text-sm text-slate-500">{template.course?.nama}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {template.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {template.description && <p className="text-sm text-slate-500">{template.description}</p>}
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span>{template.default_start_time} - {template.default_end_time}</span>
                                    <span className="text-slate-400">({template.duration_minutes} menit)</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <div className="flex gap-1">
                                        {template.default_days.map(d => (
                                            <span key={d} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{DAYS[d].slice(0, 3)}</span>
                                        ))}
                                    </div>
                                </div>
                                {template.auto_activate && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Auto-activate</span>}
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setGenerateModal({ open: true, template })}>
                                        <Play className="h-4 w-4 mr-1" />Generate
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => openEditModal(template)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(template.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="col-span-full rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 py-12 text-center">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500">Belum ada template</p>
                            <Button className="mt-4" onClick={() => setCreateModal(true)}><Plus className="h-4 w-4 mr-2" />Buat Template Pertama</Button>
                        </div>
                    )}
                </div>
            </div>

            {(createModal || editModal.open) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editModal.template ? 'Edit Template' : 'Buat Template Baru'}</h3>
                            <button onClick={() => { setCreateModal(false); setEditModal({ open: false, template: null }); form.reset(); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="mb-2 block">Mata Kuliah</Label>
                                <Select value={form.data.course_id} onValueChange={(v) => form.setData('course_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
                                    <SelectContent>{courses.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>))}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block">Nama Template</Label>
                                <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Contoh: Jadwal Reguler" />
                            </div>
                            <div>
                                <Label className="mb-2 block">Deskripsi (opsional)</Label>
                                <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Deskripsi template..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label className="mb-2 block">Jam Mulai</Label><Input type="time" value={form.data.default_start_time} onChange={(e) => form.setData('default_start_time', e.target.value)} /></div>
                                <div><Label className="mb-2 block">Jam Selesai</Label><Input type="time" value={form.data.default_end_time} onChange={(e) => form.setData('default_end_time', e.target.value)} /></div>
                            </div>
                            <div>
                                <Label className="mb-2 block">Hari Default</Label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map((day, idx) => (
                                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox checked={form.data.default_days.includes(idx)} onCheckedChange={() => toggleDay(idx)} />
                                            <span className="text-sm">{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={form.data.auto_activate} onCheckedChange={(v) => form.setData('auto_activate', v)} />
                                <Label>Auto-activate sesi yang dibuat</Label>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={editModal.template ? handleUpdate : handleCreate} disabled={form.processing} className="flex-1">{editModal.template ? 'Simpan' : 'Buat'}</Button>
                                <Button variant="outline" onClick={() => { setCreateModal(false); setEditModal({ open: false, template: null }); form.reset(); }}>Batal</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {generateModal.open && generateModal.template && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Generate Sesi dari Template</h3>
                            <button onClick={() => setGenerateModal({ open: false, template: null })} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <p className="font-medium text-slate-900 dark:text-white">{generateModal.template.name}</p>
                                <p className="text-sm text-slate-500">{generateModal.template.course?.nama}</p>
                                <p className="text-sm text-slate-500 mt-1">{generateModal.template.default_start_time} - {generateModal.template.default_end_time}</p>
                            </div>
                            <div><Label className="mb-2 block">Tanggal Mulai</Label><Input type="date" value={generateForm.data.start_date} onChange={(e) => generateForm.setData('start_date', e.target.value)} /></div>
                            <div>
                                <Label className="mb-2 block">Jumlah Pertemuan</Label>
                                <Input type="number" min={1} max={21} value={generateForm.data.total_meetings} onChange={(e) => generateForm.setData('total_meetings', parseInt(e.target.value))} />
                                <p className="text-xs text-slate-500 mt-1">2 SKS = 14 pertemuan, 3 SKS = 21 pertemuan</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleGenerate} disabled={generateForm.processing} className="flex-1"><Play className="h-4 w-4 mr-2" />Generate Sesi</Button>
                                <Button variant="outline" onClick={() => setGenerateModal({ open: false, template: null })}>Batal</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DosenLayout>
    );
}
