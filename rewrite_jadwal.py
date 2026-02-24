import re

file_path = '/Users/intrasepriansa/Herd/TPLK004/resources/js/pages/admin/jadwal.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Find everything up to the return
match_return = re.search(r'(    return \(\n\s*<AppLayout>\n\s*<Head title="Jadwal" />\n)', content)
idx_return_start = match_return.end()

# Find modals (between "Advanced Add Form Modal" and "Main Content Grid")
match_add_modal = re.search(r'(\s*{/\* Advanced Add Form Modal \*/}.+?)\s*{/\* Main Content Grid \*/}', content, re.DOTALL)
if not match_add_modal:
    print("Modals block not found!")
    exit(1)

modals_code = match_add_modal.group(1)

new_content = content[:idx_return_start] + """
            <div className="p-6 flex flex-col items-center justify-center min-h-[80vh]">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="text-center"
                >
                    <motion.div variants={itemVariants} className="flex justify-center mb-8">
                        <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-inner p-4 hover:rotate-12 transition-transform duration-500">
                            <img src={JadwalIcon} alt="Jadwal Icon" className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                        </div>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                        Jadwal Sesi Absen
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="mt-2 text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-10 text-lg">
                        Buat dan jadwalkan sesi perkuliahan baru untuk kelas Anda.
                    </motion.p>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddForm(true)}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-5 shadow-2xl shadow-indigo-500/30 transition-all hover:bg-indigo-700"
                    >
                        <span className="relative z-10 flex items-center gap-3 font-bold text-lg text-white">
                            <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
                            Tambah Jadwal
                        </span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                </motion.div>

                {/* Flash Messages */}
                <div className="fixed bottom-6 right-6 z-50">
                    <AnimatePresence>
                        {(flash?.success || flash?.error) && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                className={`rounded-xl p-4 flex items-center gap-3 shadow-xl ${flash.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
                            >
                                {flash.success ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                <p className="font-semibold">{flash.success || flash.error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
""" + modals_code + """
        </AppLayout>
    );
}
"""

with open(file_path, 'w') as f:
    f.write(new_content)

print("Rewrite successful!")
