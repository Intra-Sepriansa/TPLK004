import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon, Code, Paperclip, Upload, X, Target, Plus } from 'lucide-react';
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
            <GlassCard colorClass="hover:shadow-rose-500/10" gradientClass="from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10" glowClass="bg-rose-500">

                <Label className="flex items-center gap-2 text-white mb-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Deskripsi Tugas
                    <span className="text-red-400">*</span>
                </Label>

                <p className="text-sm text-slate-400 mb-4">
                    Jelaskan detail tugas, tujuan pembelajaran, dan instruksi pengerjaan
                </p>

                {/* Rich Text Editor Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/50 
                    border border-slate-700 rounded-t-xl overflow-x-auto">
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <Bold className="w-4 h-4 text-slate-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <Italic className="w-4 h-4 text-slate-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <Underline className="w-4 h-4 text-slate-400" />
                    </button>
                    <div className="hidden sm:block w-px h-6 bg-slate-700 mx-1" />
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <List className="w-4 h-4 text-slate-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <ListOrdered className="w-4 h-4 text-slate-400" />
                    </button>
                    <div className="hidden sm:block w-px h-6 bg-slate-700 mx-1" />
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <Link2 className="w-4 h-4 text-slate-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                    </button>
                    <button type="button" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <Code className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Editor Area */}
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Tulis deskripsi tugas di sini. Anda dapat menggunakan Markdown."
                    className="w-full min-h-[300px] px-4 py-3 bg-slate-900/50 
                        border border-slate-700 border-t-0 rounded-b-xl text-white 
                        placeholder-slate-500 focus:outline-none focus:ring-2 
                        focus:ring-indigo-500/50 resize-y"
                />

                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">
                        Mendukung Markdown untuk formatting
                    </p>
                    <span className="text-xs text-slate-500">
                        {data.description?.length || 0} karakter
                    </span>
                </div>
            </GlassCard>

            {/* File Attachments */}
            <GlassCard colorClass="hover:shadow-teal-500/10" gradientClass="from-teal-500/5 to-emerald-500/5 dark:from-teal-500/10 dark:to-emerald-500/10" glowClass="bg-teal-500">

                <Label className="flex items-center gap-2 text-white mb-3">
                    <Paperclip className="w-5 h-5 text-indigo-400" />
                    Lampiran Materi
                </Label>

                <p className="text-sm text-slate-400 mb-4">
                    Upload file pendukung seperti PDF, dokumen, atau gambar
                </p>

                {/* Drag & Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 
                        hover:border-indigo-500 rounded-xl p-8 text-center 
                        transition-all cursor-pointer group bg-slate-800/30"
                >
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Upload className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 
                        mx-auto mb-3 transition-colors" />
                    <p className="text-white font-medium mb-1">
                        Drag & drop file di sini
                    </p>
                    <p className="text-sm text-slate-400 mb-3">
                        atau klik untuk browse
                    </p>
                    <p className="text-xs text-slate-500">
                        Maksimal 10 file, masing-masing 25MB
                    </p>
                </div>

                {/* Uploaded Files List */}
                {(data.attachments && data.attachments.length > 0) && (
                    <div className="mt-4 space-y-2">
                        {data.attachments.map((file: File, index: number) => (
                            <div key={index}
                                className="flex items-center justify-between p-3 
                                    bg-slate-900/50 border border-slate-700 rounded-xl"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                                        <FileText className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="truncate">
                                        <div className="text-sm text-white font-medium truncate">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors shrink-0 ml-2"
                                >
                                    <X className="w-4 h-4 text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Learning Objectives */}
            <GlassCard colorClass="hover:shadow-indigo-500/10" gradientClass="from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" glowClass="bg-indigo-500">

                <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-white">
                        <Target className="w-5 h-5 text-indigo-400" />
                        Tujuan Pembelajaran
                    </Label>
                    <button
                        type="button"
                        onClick={() => {
                            const newObj = [...(data.learning_objectives || []), ''];
                            setData('learning_objectives', newObj);
                        }}
                        className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Tambah Tujuan</span>
                    </button>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                    Apa yang diharapkan mahasiswa pelajari dari tugas ini? (Opsional)
                </p>

                <div className="space-y-3">
                    {(data.learning_objectives || ['']).map((obj: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={obj}
                                onChange={(e) => {
                                    const newObj = [...data.learning_objectives];
                                    newObj[index] = e.target.value;
                                    setData('learning_objectives', newObj);
                                }}
                                placeholder={`Tujuan pembelajaran ${index + 1}`}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 
                                    rounded-xl text-white placeholder-slate-500
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                            {(data.learning_objectives?.length > 1) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newObj = [...data.learning_objectives];
                                        newObj.splice(index, 1);
                                        setData('learning_objectives', newObj);
                                    }}
                                    className="p-3 bg-slate-900/50 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </GlassCard>
        </motion.div>
    );
};
