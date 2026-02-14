<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>503 - Layanan Tidak Tersedia</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        @keyframes pulse-indigo {
            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
            50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .pulse-indigo { animation: pulse-indigo 2s ease-in-out infinite; }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
        <div class="text-center">
            <div class="relative mb-8">
                <h1 class="text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 leading-none float-animation">
                    503
                </h1>
                <div class="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500"></div>
            </div>

            <div class="mb-8">
                <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
                    Layanan Sedang Dalam Pemeliharaan
                </h2>
                <p class="text-xl text-slate-300 mb-2">
                    Maaf, sistem sedang dalam pemeliharaan atau upgrade.
                </p>
                <p class="text-lg text-slate-400">
                    Kami akan segera kembali. Terima kasih atas kesabaran Anda.
                </p>
            </div>

            <div class="flex justify-center mb-12">
                <div class="relative float-animation">
                    <img src="https://cdn.jsdelivr.net/gh/storyset/illustrations@main/error/Under%20construction-rafiki.svg" 
                         alt="503 Service Unavailable" 
                         class="w-96 h-96 object-contain opacity-90">
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onclick="window.location.reload()" 
                   class="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Coba Lagi
                </button>
                
                <a href="/" 
                   class="px-8 py-4 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:via-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg pulse-indigo flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Ke Beranda
                </a>
            </div>

            <div class="mt-12 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
                <h3 class="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Informasi Pemeliharaan
                </h3>
                <div class="text-slate-300 space-y-2 mb-4">
                    <p>• Sistem sedang dalam proses upgrade</p>
                    <p>• Pemeliharaan rutin untuk meningkatkan performa</p>
                    <p>• Estimasi waktu: Beberapa menit hingga 1 jam</p>
                </div>
                <div class="flex flex-wrap gap-4 justify-center text-sm">
                    <a href="mailto:support@kampus.ac.id" class="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        support@kampus.ac.id
                    </a>
                    <span class="text-slate-500">|</span>
                    <a href="tel:+6281234567890" class="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        +62 812-3456-7890
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-20 left-10 w-2 h-2 bg-indigo-400 rounded-full opacity-50 float-animation"></div>
        <div class="absolute top-40 right-20 w-3 h-3 bg-blue-400 rounded-full opacity-40 float-animation" style="animation-delay: 0.5s;"></div>
        <div class="absolute bottom-20 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-60 float-animation" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-40 right-1/3 w-3 h-3 bg-indigo-500 rounded-full opacity-30 float-animation" style="animation-delay: 1.5s;"></div>
    </div>
</body>
</html>
