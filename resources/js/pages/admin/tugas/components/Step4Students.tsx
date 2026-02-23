import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, UserCheck, UsersRound, Search, CheckCircle } from 'lucide-react';
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

export const Step4Students: React.FC<Step4Props> = ({ data, setData, students, groups }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const toggleStudent = (id: number) => {
        const current = data.selected_students || [];
        const index = current.indexOf(id);
        if (index === -1) {
            setData('selected_students', [...current, id]);
        } else {
            setData('selected_students', current.filter((sid: number) => sid !== id));
        }
    };

    const toggleGroup = (id: number) => {
        const current = data.selected_groups || [];
        const index = current.indexOf(id);
        if (index === -1) {
            setData('selected_groups', [...current, id]);
        } else {
            setData('selected_groups', current.filter((gid: number) => gid !== id));
        }
    };

    const filteredStudents = students?.filter(s =>
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nim.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            {/* Assignment Mode */}
            <GlassCard colorClass="hover:shadow-emerald-500/10" gradientClass="from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" glowClass="bg-emerald-500">

                <Label className="flex items-center gap-2 text-white mb-4">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Mode Penugasan
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        {
                            value: 'all',
                            label: 'Semua',
                            icon: Users,
                            desc: 'Tugas untuk semua'
                        },
                        {
                            value: 'select',
                            label: 'Pilih Manual',
                            icon: UserCheck,
                            desc: 'Pilih mahasiswa tertentu'
                        },
                        {
                            value: 'group',
                            label: 'Per Kelompok',
                            icon: UsersRound,
                            desc: 'Berdasarkan kelompok'
                        },
                    ].map((mode) => {
                        const Icon = mode.icon;
                        const isActive = data.assignment_mode === mode.value || (!data.assignment_mode && mode.value === 'all');

                        return (
                            <button
                                key={mode.value}
                                onClick={() => setData('assignment_mode', mode.value)}
                                className={`
                                    p-4 rounded-xl border-2 transition-all text-left flex flex-col items-center text-center sm:block sm:text-left
                                    ${isActive
                                        ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                    }
                                `}
                            >
                                <Icon className={`
                                    w-6 h-6 mb-3
                                    ${isActive ? 'text-indigo-400' : 'text-slate-400'}
                                `} />
                                <div className={`
                                    font-semibold mb-1
                                    ${isActive ? 'text-white' : 'text-slate-300'}
                                `}>
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
                    <GlassCard colorClass="hover:shadow-fuchsia-500/10" gradientClass="from-fuchsia-500/5 to-pink-500/5 dark:from-fuchsia-500/10 dark:to-pink-500/10" glowClass="bg-fuchsia-500">

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                            <h3 className="text-white font-semibold">
                                Pilih Mahasiswa
                            </h3>
                            <span className="text-sm px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                                {(data.selected_students || []).length} dipilih
                            </span>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 
                            w-5 h-5 text-slate-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
                                className="w-full pl-12 px-4 py-3 bg-slate-900/50 border 
                                border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-indigo-500/50"
                            />
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {filteredStudents.map((student) => {
                                const isSelected = (data.selected_students || []).includes(student.id);
                                return (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudent(student.id)}
                                        className={`flex items-center gap-3 p-3 bg-slate-900/50 
                                        border rounded-xl transition-all cursor-pointer
                                        ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => { }} // Handled by div click
                                            className="w-5 h-5 rounded border-slate-600 
                                            bg-slate-800 text-indigo-500 pointer-events-none"
                                        />
                                        <div className="w-10 h-10 rounded-full overflow-hidden 
                                        bg-slate-700 shrink-0 border border-slate-600">
                                            {student.foto ? (
                                                <img src={student.foto} alt={student.nama}
                                                    className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase">
                                                    {student.nama.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-medium truncate">
                                                {student.nama}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate">
                                                {student.nim}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredStudents.length === 0 && (
                                <div className="text-center py-8 text-slate-500 border border-slate-700 border-dashed rounded-xl">
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
                    <GlassCard colorClass="hover:shadow-indigo-500/10" gradientClass="from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" glowClass="bg-indigo-500">

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                            <h3 className="text-white font-semibold">
                                Pilih Kelompok
                            </h3>
                            <span className="text-sm px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                                {(data.selected_groups || []).length} kelompok dipilih
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(groups || []).map((group) => {
                                const isSelected = (data.selected_groups || []).includes(group.id);
                                return (
                                    <div
                                        key={group.id}
                                        onClick={() => toggleGroup(group.id)}
                                        className={`p-4 border rounded-xl transition-all cursor-pointer relative overflow-hidden
                                        ${isSelected ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-l-[30px] border-t-indigo-500 border-l-transparent">
                                                <CheckCircle className="absolute -top-[28px] -left-[14px] w-3 h-3 text-white" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                                                <UsersRound className={`w-6 h-6 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                                            </div>
                                            <div>
                                                <div className="text-white font-medium text-lg">
                                                    {group.name}
                                                </div>
                                                <div className="text-sm text-slate-400">
                                                    {group.members.length} anggota
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex -space-x-3 ml-2">
                                            {group.members.slice(0, 5).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 overflow-hidden"
                                                    title={member.nama}
                                                >
                                                    {member.foto ? (
                                                        <img src={member.foto} alt={member.nama} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                                                            {member.nama.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {group.members.length > 5 && (
                                                <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-800 flex items-center justify-center text-xs text-slate-300 font-medium z-10">
                                                    +{group.members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {(!groups || groups.length === 0) && (
                                <div className="col-span-1 sm:col-span-2 text-center py-8 text-slate-500 border border-slate-700 border-dashed rounded-xl">
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
