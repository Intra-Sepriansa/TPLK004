import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Search,
    UserCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';

interface Student {
    id: number;
    nama: string;
    nim: string;
    foto?: string;
}

interface Group {
    id: number;
    name: string;
    members: Student[];
}

interface Step4Props {
    data: any;
    setData: (field: string, value: any) => void;
    students: Student[];
    groups: Group[];
}

export const Step4Students: React.FC<Step4Props> = ({
    data,
    setData,
    students,
    groups,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const toggleStudent = (id: number) => {
        const current = data.selected_students || [];
        const index = current.indexOf(id);
        if (index === -1) {
            setData('selected_students', [...current, id]);
        } else {
            setData(
                'selected_students',
                current.filter((sid: number) => sid !== id),
            );
        }
    };

    const toggleGroup = (id: number) => {
        const current = data.selected_groups || [];
        const index = current.indexOf(id);
        if (index === -1) {
            setData('selected_groups', [...current, id]);
        } else {
            setData(
                'selected_groups',
                current.filter((gid: number) => gid !== id),
            );
        }
    };

    const filteredStudents =
        students?.filter(
            (s) =>
                s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.nim.toLowerCase().includes(searchQuery.toLowerCase()),
        ) || [];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Assignment Mode */}
            <GlassCard
                colorClass="hover:shadow-emerald-500/10"
                gradientClass="from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10"
                glowClass="bg-emerald-500"
            >
                <Label className="mb-4 flex items-center gap-2 text-white">
                    <Users className="h-5 w-5 text-indigo-400" />
                    Mode Penugasan
                </Label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        {
                            value: 'all',
                            label: 'Semua',
                            icon: Users,
                            desc: 'Tugas untuk semua',
                        },
                        {
                            value: 'select',
                            label: 'Pilih Manual',
                            icon: UserCheck,
                            desc: 'Pilih mahasiswa tertentu',
                        },
                        {
                            value: 'group',
                            label: 'Per Kelompok',
                            icon: UsersRound,
                            desc: 'Berdasarkan kelompok',
                        },
                    ].map((mode) => {
                        const Icon = mode.icon;
                        const isActive =
                            data.assignment_mode === mode.value ||
                            (!data.assignment_mode && mode.value === 'all');

                        return (
                            <button
                                key={mode.value}
                                onClick={() =>
                                    setData('assignment_mode', mode.value)
                                }
                                className={`flex flex-col items-center rounded-xl border-2 p-4 text-center text-left transition-all sm:block sm:text-left ${
                                    isActive
                                        ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                } `}
                            >
                                <Icon
                                    className={`mb-3 h-6 w-6 ${isActive ? 'text-indigo-400' : 'text-slate-400'} `}
                                />
                                <div
                                    className={`mb-1 font-semibold ${isActive ? 'text-white' : 'text-slate-300'} `}
                                >
                                    {mode.label}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {mode.desc}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </GlassCard>

            {/* Student Selection (if mode is 'select') */}
            {data.assignment_mode === 'select' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <GlassCard
                        colorClass="hover:shadow-fuchsia-500/10"
                        gradientClass="from-fuchsia-500/5 to-pink-500/5 dark:from-fuchsia-500/10 dark:to-pink-500/10"
                        glowClass="bg-fuchsia-500"
                    >
                        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                            <h3 className="font-semibold text-white">
                                Pilih Mahasiswa
                            </h3>
                            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-sm text-indigo-300">
                                {(data.selected_students || []).length} dipilih
                            </span>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 pl-12 text-white placeholder-slate-500 focus:ring-indigo-500/50"
                            />
                        </div>

                        <div className="custom-scrollbar max-h-[400px] space-y-2 overflow-y-auto pr-2">
                            {filteredStudents.map((student) => {
                                const isSelected = (
                                    data.selected_students || []
                                ).includes(student.id);
                                return (
                                    <div
                                        key={student.id}
                                        onClick={() =>
                                            toggleStudent(student.id)
                                        }
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-slate-900/50 p-3 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}} // Handled by div click
                                            className="pointer-events-none h-5 w-5 rounded border-slate-600 bg-slate-800 text-indigo-500"
                                        />
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-600 bg-slate-700">
                                            {student.foto ? (
                                                <img
                                                    src={student.foto}
                                                    alt={student.nama}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center font-bold text-slate-300 uppercase">
                                                    {student.nama.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-medium text-white">
                                                {student.nama}
                                            </div>
                                            <div className="truncate text-xs text-slate-400">
                                                {student.nim}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-700 py-8 text-center text-slate-500">
                                    Tidak ada mahasiswa bernama "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            {/* Group Selection (if mode is 'group') */}
            {data.assignment_mode === 'group' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <GlassCard
                        colorClass="hover:shadow-indigo-500/10"
                        gradientClass="from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10"
                        glowClass="bg-indigo-500"
                    >
                        <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                            <h3 className="font-semibold text-white">
                                Pilih Kelompok
                            </h3>
                            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-sm text-indigo-300">
                                {(data.selected_groups || []).length} kelompok
                                dipilih
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {(groups || []).map((group) => {
                                const isSelected = (
                                    data.selected_groups || []
                                ).includes(group.id);
                                return (
                                    <div
                                        key={group.id}
                                        onClick={() => toggleGroup(group.id)}
                                        className={`relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all ${isSelected ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'}`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 h-0 w-0 border-t-[30px] border-l-[30px] border-t-indigo-500 border-l-transparent">
                                                <CheckCircle className="absolute -top-[28px] -left-[14px] h-3 w-3 text-white" />
                                            </div>
                                        )}

                                        <div className="mb-4 flex items-center gap-3">
                                            <div
                                                className={`rounded-lg p-2 ${isSelected ? 'bg-indigo-500/20' : 'bg-slate-800'}`}
                                            >
                                                <UsersRound
                                                    className={`h-6 w-6 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-lg font-medium text-white">
                                                    {group.name}
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    {group.members.length}{' '}
                                                    anggota
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-2 flex -space-x-3">
                                            {group.members
                                                .slice(0, 5)
                                                .map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="h-10 w-10 overflow-hidden rounded-full border-2 border-slate-800 bg-slate-700"
                                                        title={member.nama}
                                                    >
                                                        {member.foto ? (
                                                            <img
                                                                src={
                                                                    member.foto
                                                                }
                                                                alt={
                                                                    member.nama
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300 uppercase">
                                                                {member.nama.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            {group.members.length > 5 && (
                                                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-800 text-xs font-medium text-slate-300">
                                                    +{group.members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!groups || groups.length === 0) && (
                                <div className="col-span-1 rounded-xl border border-dashed border-slate-700 py-8 text-center text-slate-500 sm:col-span-2">
                                    Belum ada kelompok yang terdaftar.
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            )}
        </motion.div>
    );
};
