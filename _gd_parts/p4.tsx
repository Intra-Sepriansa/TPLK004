{/* p4: Modals and closing tags */}

    {/* DETAIL MODAL */}
    <ModalW show={showDet} onClose={() => setShowDet(false)} title="Detail Kehadiran">
        {sel && (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-neutral-500">Pertemuan</p><p className="font-semibold text-neutral-900 dark:text-white">P{sel.meeting_number} - {sel.session_title}</p></div>
                    <div><p className="text-xs text-neutral-500">Tanggal</p><p className="font-semibold text-neutral-900 dark:text-white">{sel.session_date}</p></div>
                    <div><p className="text-xs text-neutral-500">Status</p><span className={'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ' + sC(sel.status)}>{sL(sel.status)}</span></div>
                    <div><p className="text-xs text-neutral-500">Poin</p><p className="text-2xl font-bold text-neutral-900 dark:text-white">{sel.points}</p></div>
                    <div><p className="text-xs text-neutral-500">Check-in</p><p className="text-sm text-neutral-700 dark:text-neutral-300">{sel.check_in_time || 'Tidak ada data'}</p></div>
                    <div><p className="text-xs text-neutral-500">Device</p><p className="text-sm text-neutral-700 dark:text-neutral-300">{sel.device_info || 'Tidak ada data'}</p></div>
                </div>
                {sel.selfie_photo && (
                    <div><p className="text-xs text-neutral-500 mb-2">Foto Selfie</p><img src={sel.selfie_photo} alt="Selfie" className="w-full max-w-xs rounded-2xl border border-neutral-200 dark:border-neutral-800" /></div>
                )}
                {sel.check_in_location && (
                    <div><p className="text-xs text-neutral-500 mb-1">Lokasi</p><p className="text-sm text-neutral-700 dark:text-neutral-300">{sel.check_in_location.address || `${sel.check_in_location.latitude}, ${sel.check_in_location.longitude}`}</p></div>
                )}
                {sel.notes && (
                    <div><p className="text-xs text-neutral-500 mb-1">Catatan</p><p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">{sel.notes}</p></div>
                )}
                {sel.edited_by && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-3">
                        <p className="text-xs text-amber-600">Diubah oleh: {sel.edited_by}</p>
                        {sel.edit_reason && <p className="text-xs text-amber-500 mt-1">Alasan: {sel.edit_reason}</p>}
                    </div>
                )}
            </div>
        )}
    </ModalW>

    {/* EDIT STATUS MODAL */}
    <ModalW show={showEdit} onClose={() => setShowEdit(false)} title="Edit Status Kehadiran">
        {sel && (
            <div className="space-y-4">
                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
                    <p className="text-xs text-neutral-500">Pertemuan {sel.meeting_number}: {sel.session_title}</p>
                    <p className="text-sm mt-1">Status saat ini: <span className={'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ' + sC(sel.status)}>{sL(sel.status)}</span></p>
                </div>
                <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Status Baru</label>
                    <Select value={ef.data.status} onValueChange={v => ef.setData('status', v)}>
                        <SelectTrigger className="rounded-xl border-2"><SelectValue placeholder="Pilih status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="present">Hadir (100 poin)</SelectItem>
                            <SelectItem value="late">Terlambat (75 poin)</SelectItem>
                            <SelectItem value="permit">Izin (50 poin)</SelectItem>
                            <SelectItem value="sick">Sakit (50 poin)</SelectItem>
                            <SelectItem value="rejected">Tidak Hadir (0 poin)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Alasan Perubahan</label>
                    <Textarea value={ef.data.reason} onChange={e => ef.setData('reason', e.target.value)} placeholder="Alasan perubahan status..." className="rounded-xl border-2" rows={3} />
                </div>
                <div className="flex gap-2 pt-2">
                    <Button onClick={saveSt} disabled={ef.processing || !ef.data.status || !ef.data.reason} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl">Simpan Perubahan</Button>
                    <Button variant="outline" onClick={() => setShowEdit(false)} className="rounded-xl">Batal</Button>
                </div>
            </div>
        )}
    </ModalW>

    {/* ADD NOTE MODAL */}
    <ModalW show={showNote} onClose={() => setShowNote(false)} title="Tambah Catatan">
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Judul</label>
                <Input value={nf.data.title} onChange={e => nf.setData('title', e.target.value)} placeholder="Judul catatan..." className="rounded-xl" />
            </div>
            <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Isi Catatan</label>
                <Textarea value={nf.data.content} onChange={e => nf.setData('content', e.target.value)} placeholder="Tulis catatan..." className="rounded-xl" rows={5} />
            </div>
            <div className="flex gap-2 pt-2">
                <Button onClick={saveN} disabled={nf.processing || !nf.data.content} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl">Simpan Catatan</Button>
                <Button variant="outline" onClick={() => setShowNote(false)} className="rounded-xl">Batal</Button>
            </div>
        </div>
    </ModalW>

    {/* EXPORT MODAL */}
    <ModalW show={showExp} onClose={() => setShowExp(false)} title="Export Laporan">
        <div className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Pilih format export untuk laporan {student.nama}:</p>
            <div className="grid grid-cols-1 gap-3">
                <button onClick={() => { window.location.href = `/dosen/grading/detail/${student.id}/export-pdf`; setShowExp(false); }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-lg"><FileText className="h-6 w-6" /></div>
                    <div><p className="font-semibold text-neutral-900 dark:text-white">PDF Report</p><p className="text-xs text-neutral-500">Laporan lengkap dalam format PDF</p></div>
                </button>
                <button onClick={() => { window.location.href = `/dosen/grading/export`; setShowExp(false); }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg"><Download className="h-6 w-6" /></div>
                    <div><p className="font-semibold text-neutral-900 dark:text-white">CSV Export</p><p className="text-xs text-neutral-500">Data kehadiran dalam format CSV</p></div>
                </button>
            </div>
        </div>
    </ModalW>

    </motion.div>
    </DosenLayout>
    );
}
