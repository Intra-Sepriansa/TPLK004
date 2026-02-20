{/* p3: Catatan tab + Perbandingan tab */}

        {/* CATATAN */}
        {tab==='catatan'&&<motion.div key="c" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Catatan Dosen ({dn.length})</h4>
                <Button onClick={()=>setShowNote(true)} className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"><Plus className="h-4 w-4 mr-2" />Tambah Catatan</Button>
            </div>
            {dn.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada catatan</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {dn.map(n => (
                        <motion.div key={n.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                            className={'rounded-2xl border p-4 transition-all hover:shadow-md ' + (n.is_important ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900')}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {n.is_important && <span className="text-amber-500 text-xs font-semibold">⭐ Penting</span>}
                                        <span className="text-xs text-neutral-400">{n.created_at}</span>
                                        {n.is_visible_to_student && <span className="text-xs text-blue-500 font-medium">👁 Visible</span>}
                                    </div>
                                    {n.title && <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">{n.title}</p>}
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{n.content}</p>
                                    <p className="text-xs text-neutral-400 mt-2">— {n.created_by}</p>
                                </div>
                                <button onClick={() => delN(n.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>}

        {/* PERBANDINGAN */}
        {tab==='perbandingan'&&<motion.div key="p" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 p-5">
                    <p className="text-xs font-medium text-neutral-500 mb-2">Kehadiran</p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">{gd.attendance_rate}%</p>
                        <p className={'text-sm font-semibold mb-1 ' + (gd.attendance_rate >= ca.average_attendance_rate ? 'text-emerald-600' : 'text-red-600')}>
                            {gd.attendance_rate >= ca.average_attendance_rate ? '↑' : '↓'} {Math.abs(gd.attendance_rate - ca.average_attendance_rate).toFixed(1)}%
                        </p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Rata-rata kelas: {ca.average_attendance_rate}%</p>
                    <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all" style={{width: Math.min(gd.attendance_rate, 100) + '%'}} />
                    </div>
                </div>
                <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 p-5">
                    <p className="text-xs font-medium text-neutral-500 mb-2">Poin Rata-rata</p>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">{gd.average_points}</p>
                        <p className={'text-sm font-semibold mb-1 ' + (gd.average_points >= ca.average_points ? 'text-emerald-600' : 'text-red-600')}>
                            {gd.average_points >= ca.average_points ? '↑' : '↓'} {Math.abs(gd.average_points - ca.average_points).toFixed(1)}
                        </p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Rata-rata kelas: {ca.average_points}</p>
                </div>
                <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 p-5">
                    <p className="text-xs font-medium text-neutral-500 mb-2">Peringkat</p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">#{gd.rank_in_class}</p>
                    <p className="text-xs text-neutral-500 mt-1">dari {gd.total_students} mahasiswa</p>
                    <p className="text-xs font-semibold text-indigo-600 mt-1">Top {gd.percentile}%</p>
                </div>
            </div>
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 p-6">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Grafik Perbandingan</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bd}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{fontSize:12}} stroke="#9ca3af" />
                        <YAxis tick={{fontSize:12}} stroke="#9ca3af" />
                        <RTooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}} />
                        <Legend />
                        <Bar dataKey="mhs" name={student.nama} fill="#6366f1" radius={[8,8,0,0]} />
                        <Bar dataKey="kls" name="Rata-rata Kelas" fill="#a5b4fc" radius={[8,8,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {!gd.can_take_uas && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><XCircle className="h-6 w-6 text-red-600" /></div>
                        <div>
                            <h4 className="font-bold text-red-800 dark:text-red-400">Peringatan: Tidak Bisa UAS</h4>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Mahasiswa ini berisiko tidak bisa mengikuti UAS karena jumlah ketidakhadiran melebihi batas.</p>
                            {gd.sessions_needed_for_uas > 0 && <p className="text-sm text-red-500 mt-1">Butuh {gd.sessions_needed_for_uas} sesi kehadiran lagi.</p>}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>}

        </AnimatePresence></div>
    </motion.div>
