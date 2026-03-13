import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
    Bold,
    Code,
    FileText,
    Image as ImageIcon,
    Italic,
    Link2,
    List,
    ListOrdered,
    Paperclip,
    Plus,
    Target,
    Underline,
    Upload,
    X,
} from 'lucide-react';
import React, { useRef } from 'react';
import { GlassCard } from './GlassCard';

interface Step2Props {
    data: any;
    setData: (field: string, value: any) => void;
}

export const Step2Description: React.FC<Step2Props> = ({ data, setData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('attachments', [...(data.attachments || []), ...newFiles]);
        }
    };

    const removeAttachment = (index: number) => {
        const newAttachments = [...(data.attachments || [])];
        newAttachments.splice(index, 1);
        setData('attachments', newAttachments);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files);
            setData('attachments', [...(data.attachments || []), ...newFiles]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Rich Text Editor */}
            <GlassCard
                colorClass="hover:shadow-rose-500/10"
                gradientClass="from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10"
                glowClass="bg-rose-500"
            >
                <Label className="mb-3 flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    Deskripsi Tugas
                    <span className="text-red-400">*</span>
                </Label>

                <p className="mb-4 text-sm text-slate-400">
                    Jelaskan detail tugas, tujuan pembelajaran, dan instruksi
                    pengerjaan
                </p>

                {/* Rich Text Editor Toolbar */}
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto rounded-t-xl border border-slate-700 bg-slate-900/50 p-3">
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <Bold className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <Italic className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <Underline className="h-4 w-4 text-slate-400" />
                    </button>
                    <div className="mx-1 hidden h-6 w-px bg-slate-700 sm:block" />
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <List className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <ListOrdered className="h-4 w-4 text-slate-400" />
                    </button>
                    <div className="mx-1 hidden h-6 w-px bg-slate-700 sm:block" />
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <Link2 className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <ImageIcon className="h-4 w-4 text-slate-400" />
                    </button>
                    <button
                        type="button"
                        className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                    >
                        <Code className="h-4 w-4 text-slate-400" />
                    </button>
                </div>

                {/* Editor Area */}
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Tulis deskripsi tugas di sini. Anda dapat menggunakan Markdown."
                    className="min-h-[300px] w-full resize-y rounded-b-xl border border-t-0 border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                />

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Mendukung Markdown untuk formatting
                    </p>
                    <span className="text-xs text-slate-500">
                        {data.description?.length || 0} karakter
                    </span>
                </div>
            </GlassCard>

            {/* File Attachments */}
            <GlassCard
                colorClass="hover:shadow-teal-500/10"
                gradientClass="from-teal-500/5 to-emerald-500/5 dark:from-teal-500/10 dark:to-emerald-500/10"
                glowClass="bg-teal-500"
            >
                <Label className="mb-3 flex items-center gap-2 text-white">
                    <Paperclip className="h-5 w-5 text-indigo-400" />
                    Lampiran Materi
                </Label>

                <p className="mb-4 text-sm text-slate-400">
                    Upload file pendukung seperti PDF, dokumen, atau gambar
                </p>

                {/* Drag & Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 p-8 text-center transition-all hover:border-indigo-500"
                >
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Upload className="mx-auto mb-3 h-12 w-12 text-slate-500 transition-colors group-hover:text-indigo-400" />
                    <p className="mb-1 font-medium text-white">
                        Drag & drop file di sini
                    </p>
                    <p className="mb-3 text-sm text-slate-400">
                        atau klik untuk browse
                    </p>
                    <p className="text-xs text-slate-500">
                        Maksimal 10 file, masing-masing 25MB
                    </p>
                </div>

                {/* Uploaded Files List */}
                {data.attachments && data.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {data.attachments.map((file: File, index: number) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/50 p-3"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="shrink-0 rounded-lg bg-indigo-500/10 p-2">
                                        <FileText className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <div className="truncate">
                                        <div className="truncate text-sm font-medium text-white">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {(file.size / 1024 / 1024).toFixed(
                                                2,
                                            )}{' '}
                                            MB
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeAttachment(index);
                                    }}
                                    className="ml-2 shrink-0 rounded-lg p-2 transition-colors hover:bg-red-500/10"
                                >
                                    <X className="h-4 w-4 text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Learning Objectives */}
            <GlassCard
                colorClass="hover:shadow-indigo-500/10"
                gradientClass="from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10"
                glowClass="bg-indigo-500"
            >
                <div className="mb-3 flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-white">
                        <Target className="h-5 w-5 text-indigo-400" />
                        Tujuan Pembelajaran
                    </Label>
                    <button
                        type="button"
                        onClick={() => {
                            const newObj = [
                                ...(data.learning_objectives || []),
                                '',
                            ];
                            setData('learning_objectives', newObj);
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Tambah Tujuan</span>
                    </button>
                </div>

                <p className="mb-4 text-sm text-slate-400">
                    Apa yang diharapkan mahasiswa pelajari dari tugas ini?
                    (Opsional)
                </p>

                <div className="space-y-3">
                    {(data.learning_objectives || ['']).map(
                        (obj: string, index: number) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    value={obj}
                                    onChange={(e) => {
                                        const newObj = [
                                            ...data.learning_objectives,
                                        ];
                                        newObj[index] = e.target.value;
                                        setData('learning_objectives', newObj);
                                    }}
                                    placeholder={`Tujuan pembelajaran ${index + 1}`}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                                />
                                {data.learning_objectives?.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newObj = [
                                                ...data.learning_objectives,
                                            ];
                                            newObj.splice(index, 1);
                                            setData(
                                                'learning_objectives',
                                                newObj,
                                            );
                                        }}
                                        className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-slate-400 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ),
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};
