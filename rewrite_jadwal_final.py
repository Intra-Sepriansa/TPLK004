file_path = '/Users/intrasepriansa/Herd/TPLK004/resources/js/pages/admin/jadwal.tsx'

content = """import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import JadwalIcon from '@/assets/admin/jadwal/jadwal.png';
import { Plus, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface PageProps {
    flash?: { success?: string; error?: string };
}

export default function AdminJadwal({ flash }: PageProps) {
    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <AppLayout>
            <Head title="Jadwal Sesi Absen" />

            <div className="p-6 flex flex-col items-center justify-center min-h-[85vh]">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="text-center w-full max-w-2xl mx-auto"
                >
                    <motion.div variants={itemVariants} className="flex justify-center mb-10">
                        <div className="relative flex h-40 w-40 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-inner p-6 hover:rotate-6 hover:scale-105 transition-all duration-500">
                            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 rounded-[2.5rem] backdrop-blur-3xl -z-10" />
                            <img src={JadwalIcon} alt="Jadwal Icon" className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
                        </div>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Jadwal Sesi Absen
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="mt-2 text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-12 text-lg sm:text-xl leading-relaxed">
                        Kelola dan jadwalkan sesi perkuliahan baru untuk kelas Anda dengan mudah dan cepat.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.get('/admin/sesi-absen/create')}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-5 shadow-2xl shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/50"
                        >
                            <span className="relative z-10 flex items-center gap-4 font-bold text-xl text-white">
                                <Plus className="h-7 w-7 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                                Tambah Jadwal Baru
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Flash Messages */}
                <div className="fixed bottom-8 right-8 z-50">
                    <AnimatePresence>
                        {(flash?.success || flash?.error) && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                className={`rounded-2xl p-4 flex items-center gap-4 shadow-2xl backdrop-blur-md ${flash.success ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}
                            >
                                {flash.success ? <CheckCircle2 className="h-6 w-6" /> : <X className="h-6 w-6" />}
                                <p className="font-semibold text-lg">{flash.success || flash.error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
}
"""

with open(file_path, 'w') as f:
    f.write(content)

print("Jadwal overwritten successfully.")
