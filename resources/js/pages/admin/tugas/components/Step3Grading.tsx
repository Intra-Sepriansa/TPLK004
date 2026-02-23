import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Award, ClipboardList, Plus, Trash2, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Rubric {
    id: number;
    criteria: string;
    description?: string;
    max_score: number;
    weight: number;
}

interface Step3Props {
    data: any;
    setData: (field: string, value: any) => void;
}

export const Step3Grading: React.FC<Step3Props> = ({ data, setData }) => {

    const addRubric = () => {
        const newRubric = {
            id: Date.now(),
            criteria: '',
            description: '',
            max_score: 0,
            weight: 0
        };
        setData('rubrics', [...(data.rubrics || []), newRubric]);
    };

    const removeRubric = (index: number) => {
        const newRubrics = [...(data.rubrics || [])];
        newRubrics.splice(index, 1);
        setData('rubrics', newRubrics);
    };

    const updateRubric = (index: number, field: string, value: any) => {
        const newRubrics = [...(data.rubrics || [])];
        newRubrics[index] = { ...newRubrics[index], [field]: value };
        setData('rubrics', newRubrics);
    };

    const totalWeight = (data.rubrics || []).reduce((sum: number, r: Rubric) => sum + (Number(r.weight) || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Grading Method */}
            <GlassCard colorClass="hover:shadow-rose-500/10" gradientClass="from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10" glowClass="bg-rose-500">

                <Label className="flex items-center gap-2 text-white mb-3">
                    <Award className="w-5 h-5 text-indigo-400" />
                    Metode Penilaian
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { value: 'rubric', label: 'Rubrik Penilaian', icon: ClipboardList },
                        { value: 'points', label: 'Poin Langsung', icon: Award },
                    ].map((method) => {
                        const Icon = method.icon;
                        const isSelected = data.grading_method === method.value || (!data.grading_method && method.value === 'rubric');
                        return (
                            <button
                                key={method.value}
                                onClick={() => setData('grading_method', method.value)}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                                    ${isSelected
                                        ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                                <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                    {method.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Rubric Builder */}
            {(data.grading_method === 'rubric' || !data.grading_method) && (
                <GlassCard colorClass="hover:shadow-violet-500/10" gradientClass="from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10" glowClass="bg-violet-500">

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Rubrik Penilaian
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Buat kriteria penilaian yang detail
                            </p>
                        </div>

                        <button
                            onClick={addRubric}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 
                                bg-indigo-500/10 hover:bg-indigo-500/20 border 
                                border-indigo-500/30 rounded-xl text-indigo-400 
                                transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Kriteria</span>
                        </button>
                    </div>

                    {/* Rubric Items */}
                    <div className="space-y-4">
                        {(data.rubrics || []).map((rubric: Rubric, index: number) => (
                            <div key={rubric.id || index}
                                className="p-4 bg-slate-900/50 border border-slate-700 
                                rounded-xl">

                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                    <div className="flex-1 space-y-3 w-full">
                                        <Input
                                            value={rubric.criteria}
                                            onChange={(e) => updateRubric(index, 'criteria', e.target.value)}
                                            placeholder="Nama kriteria (contoh: Kelengkapan Analisis)"
                                            className="w-full px-4 py-2 bg-slate-800/50 border 
                                                border-slate-600 rounded-lg text-white"
                                        />

                                        <textarea
                                            value={rubric.description || ''}
                                            onChange={(e) => updateRubric(index, 'description', e.target.value)}
                                            placeholder="Deskripsi kriteria penilaian..."
                                            className="w-full px-4 py-2 bg-slate-800/50 border 
                                                border-slate-600 rounded-lg text-white min-h-[80px]"
                                        />

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-slate-400 mb-1">
                                                    Skor Maksimal
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={rubric.max_score}
                                                    onChange={(e) => updateRubric(index, 'max_score', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-slate-800/50 border 
                                                        border-slate-600 rounded-lg text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-400 mb-1">
                                                    Bobot (%)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={rubric.weight}
                                                    onChange={(e) => updateRubric(index, 'weight', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-slate-800/50 border 
                                                        border-slate-600 rounded-lg text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {(data.rubrics || []).length > 1 && (
                                        <button
                                            onClick={() => removeRubric(index)}
                                            className="w-full sm:w-auto p-3 mt-2 sm:mt-0 flex items-center justify-center bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg 
                                                transition-colors text-slate-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                            <span className="sm:hidden ml-2">Hapus Kriteria</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total Summary */}
                    <div className={`mt-6 p-4 border rounded-xl 
                        ${totalWeight === 100
                            ? 'bg-indigo-500/10 border-indigo-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                        <div className="flex items-center justify-between">
                            <span className="text-white font-medium flex items-center gap-2">
                                Total Bobot
                                {totalWeight !== 100 && (
                                    <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                        Total harus 100%
                                    </span>
                                )}
                            </span>
                            <span className={`text-2xl font-bold 
                                ${totalWeight === 100 ? 'text-indigo-400' : 'text-red-400'}`}>
                                {totalWeight}%
                            </span>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Late Submission Policy */}
            <GlassCard colorClass="hover:shadow-amber-500/10" gradientClass="from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" glowClass="bg-amber-500">

                <Label className="flex items-center gap-2 text-white mb-3">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    Kebijakan Keterlambatan
                </Label>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.allow_late_submission}
                            onChange={(e) => setData('allow_late_submission', e.target.checked)}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            id="late-check"
                        />
                        <label htmlFor="late-check" className="text-slate-300 cursor-pointer select-none">
                            Terima pengumpulan terlambat
                        </label>
                    </div>

                    {data.allow_late_submission && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            <div>
                                <Label className="text-sm text-slate-400 mb-2">
                                    Pengurangan Poin
                                </Label>
                                <Input
                                    type="number"
                                    value={data.late_penalty}
                                    onChange={(e) => setData('late_penalty', parseInt(e.target.value) || 0)}
                                    placeholder="10"
                                    className="w-full px-4 py-2 bg-slate-900/50 border 
                                        border-slate-700 rounded-xl text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-sm text-slate-400 mb-2">
                                    Per Hari Keterlambatan
                                </Label>
                                <Input
                                    type="number"
                                    value={data.late_penalty_days}
                                    onChange={(e) => setData('late_penalty_days', parseInt(e.target.value) || 1)}
                                    placeholder="1"
                                    className="w-full px-4 py-2 bg-slate-900/50 border 
                                        border-slate-700 rounded-xl text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};
