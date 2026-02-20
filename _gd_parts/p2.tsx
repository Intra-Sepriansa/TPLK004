{/* p2: Riwayat table + Grafik tab + Timeline tab */}
            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
            <thead><tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">#</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Pertemuan</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Poin</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Check-in</th>
                <th className="px-4 py-3 text-left font-semibold text-neutral-600 dark:text-neutral-300">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filt.map(r => (
                    <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-neutral-500">{r.meeting_number}</td>
                        <td className="px-4 py-3"><p className="font-medium text-neutral-900 dark:text-white">{r.session_title}</p></td>
                        <td className="px-4 py-3 text-neutral-500">{r.session_date}</td>
                        <td className="px-4 py-3"><span className={'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ' + sC(r.status)}>{sL(r.status)}</span></td>
                        <td className="px-4 py-3 font-bold text-neutral-900 dark:text-white">{r.points}</td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">{r.check_in_time || '-'}</td>
                        <td className="px-4 py-3">
                            <div className="flex gap-1">
                                <button onClick={() => oD(r)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-blue-600 transition-colors"><Eye className="h-4 w-4" /></button>
                                <button onClick={() => oE(r)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-amber-600 transition-colors"><Target className="h-4 w-4" /></button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filt.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-neutral-400">Tidak ada data kehadiran</td></tr>}
            </tbody>
            </table>
            </div>
        </motion.div>}

        {/* GRAFIK */}
        {tab==='grafik'&&<motion.div key="g" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-6">
            <div className="flex gap-2 flex-wrap">
                {[{k:'trend',l:'Tren Poin'},{k:'dist',l:'Distribusi'},{k:'comp',l:'Perbandingan'}].map(c=>(
                    <button key={c.k} onClick={()=>setCt(c.k)} className={'px-4 py-2 rounded-xl text-sm font-medium transition-all '+(ct===c.k?'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg':'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700')}>{c.l}</button>
                ))}
            </div>

            {ct==='trend'&&<div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 p-6">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Tren Poin Per Pertemuan</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ld}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{fontSize:12}} stroke="#9ca3af" />
                        <YAxis domain={[0,100]} tick={{fontSize:12}} stroke="#9ca3af" />
                        <RTooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}} />
                        <Line type="monotone" dataKey="poin" stroke="#6366f1" strokeWidth={3} dot={{fill:'#6366f1',r:5}} activeDot={{r:8}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>}

            {ct==='dist'&&<div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 p-6">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Distribusi Status Kehadiran</h4>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pd} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                                {pd.map((d,i)=><Cell key={i} fill={d.color} />)}
                            </Pie>
                            <RTooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 min-w-[160px]">
                        {pd.map(d=>(
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor:d.color}} />
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">{d.name}: {d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>}

            {ct==='comp'&&<div className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 p-6">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Perbandingan dengan Kelas</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bd}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{fontSize:12}} stroke="#9ca3af" />
                        <YAxis tick={{fontSize:12}} stroke="#9ca3af" />
                        <RTooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}} />
                        <Legend />
                        <Bar dataKey="mhs" name="Mahasiswa" fill="#6366f1" radius={[8,8,0,0]} />
                        <Bar dataKey="kls" name="Rata-rata Kelas" fill="#a5b4fc" radius={[8,8,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>}
        </motion.div>}

        {/* TIMELINE */}
        {tab==='timeline'&&<motion.div key="tl" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {[{k:'all',l:'Semua'},{k:'present',l:'Hadir'},{k:'late',l:'Terlambat'},{k:'permit',l:'Izin'},{k:'absent',l:'Absen'}].map(f=>(
                    <button key={f.k} onClick={()=>setTlFilt(f.k)} className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all '+(tlFilt===f.k?'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow':'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400')}>{f.l}</button>
                ))}
            </div>
            <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                <div className="space-y-4">
                    {tlRecs.map((r, idx) => (
                        <motion.div key={r.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:idx*0.05}} className="relative flex gap-4 pl-12">
                            <div className={'absolute left-4 top-3 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 shadow ' + tlC(r.status)} />
                            <div className="flex-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-neutral-400">P{r.meeting_number}</span>
                                        <span className={'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ' + sC(r.status)}>{sL(r.status)}</span>
                                    </div>
                                    <span className="text-xs text-neutral-400">{r.session_date}</span>
                                </div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">{r.session_title}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                    <span>Poin: <strong className="text-neutral-900 dark:text-white">{r.points}</strong></span>
                                    {r.check_in_time && <span>Check-in: {r.check_in_time}</span>}
                                </div>
                                {r.notes && <p className="mt-2 text-xs text-neutral-500 italic bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2">{r.notes}</p>}
                            </div>
                        </motion.div>
                    ))}
                    {tlRecs.length === 0 && <p className="text-center text-neutral-400 py-8">Tidak ada data</p>}
                </div>
            </div>
        </motion.div>}
