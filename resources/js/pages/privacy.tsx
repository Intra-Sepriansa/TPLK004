import AppLogoIcon from '@/components/app-logo-icon';
import { Head, Link } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-svh bg-background px-6 py-10">
            <Head title="Kebijakan Privasi" />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <Link href="/" className="flex items-center gap-3">
                    <AppLogoIcon className="h-12 w-12" />
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                            TPLK004
                        </p>
                        <h1 className="text-2xl font-semibold">
                            Kebijakan Privasi
                        </h1>
                    </div>
                </Link>

                <div className="rounded-3xl border border-slate-200/70 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                    <div className="grid gap-6">
                        <section className="grid gap-2">
                            <h2 className="font-display text-lg text-slate-900 dark:text-white">
                                Ringkasan
                            </h2>
                            <p>
                                Sistem ini memproses kamera dan lokasi untuk
                                kebutuhan absensi mahasiswa. Data digunakan
                                hanya untuk kepentingan akademik dan
                                operasional kampus.
                            </p>
                        </section>

                        <section className="grid gap-2">
                            <h2 className="font-display text-lg text-slate-900 dark:text-white">
                                Data yang Dikumpulkan
                            </h2>
                            <ul className="list-disc pl-5">
                                <li>Identitas mahasiswa (nama, NIM).</li>
                                <li>Foto selfie atau hasil kamera saat absen.</li>
                                <li>Lokasi (latitude, longitude, akurasi).</li>
                                <li>Informasi perangkat dan waktu absensi.</li>
                            </ul>
                        </section>

                        <section className="grid gap-2">
                            <h2 className="font-display text-lg text-slate-900 dark:text-white">
                                Tujuan Penggunaan
                            </h2>
                            <ul className="list-disc pl-5">
                                <li>Validasi kehadiran dan pencegahan fraud.</li>
                                <li>Audit absensi dan verifikasi manual.</li>
                                <li>Pelaporan akademik sesuai kebijakan kampus.</li>
                            </ul>
                        </section>

                        <section className="grid gap-2">
                            <h2 className="font-display text-lg text-slate-900 dark:text-white">
                                Persetujuan Penggunaan Kamera
                            </h2>
                            <p>
                                Dengan menyalakan kamera dan lokasi di aplikasi
                                ini, Anda menyetujui pemrosesan data sesuai
                                kebijakan privasi ini.
                            </p>
                        </section>

                        <section className="grid gap-2">
                            <h2 className="font-display text-lg text-slate-900 dark:text-white">
                                Retensi dan Penghapusan Data
                            </h2>
                            <p>
                                Data absensi disimpan sesuai kebijakan kampus.
                                Permintaan penghapusan data dilakukan melalui
                                admin kampus dengan verifikasi identitas. Data
                                yang dihapus meliputi catatan absensi, selfie,
                                dan metadata terkait.
                            </p>
                        </section>

                        <section className="grid gap-2">
                            <h2 className="font-display text-lg text-slate-900 dark:text-white">
                                Keamanan
                            </h2>
                            <p>
                                Akses data dibatasi untuk petugas berwenang dan
                                dilakukan pencatatan aktivitas untuk audit.
                            </p>
                        </section>
                    </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-white/50">
                    Terakhir diperbarui: 27 Des 2025.
                </div>
            </div>
        </div>
    );
}
