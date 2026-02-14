<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>500 - Terjadi Kesalahan Server</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        @keyframes pulse-red {
            0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8); }
        }
        .shake-animation { animation: shake 0.5s ease-in-out; }
        .pulse-red { animation: pulse-red 2s ease-in-out infinite; }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
        <!-- Main Content -->
        <div class="text-center">
            <!-- 500 Number with Animation -->
            <div class="relative mb-8">
                <h1 class="text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 leading-none shake-animation">
                    500
                </h1>
                <div class="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
            </div>

            <!-- Error Message -->
            <div class="mb-8">
                <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
                    Oops! Terjadi Kesalahan Server
                </h2>
                <p class="text-xl text-slate-300 mb-2">
                    Maaf, terjadi kesalahan pada server kami.
                </p>
                <p class="text-lg text-slate-400">
                    Tim teknis kami telah diberitahu dan sedang memperbaiki masalah ini.
                </p>
            </div>

            <!-- Illustration -->
            <div class="flex justify-center mb-12">
                <div class="relative">
                    <svg class="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Server Icon -->
                        <rect x="50" y="40" width="100" height="30" rx="5" stroke="url(#gradient1)" stroke-width="4" fill="none"/>
                        <rect x="50" y="80" width="100" height="30" rx="5" stroke="url(#gradient1)" stroke-width="4" fill="none"/>
                        <rect x="50" y="120" width="100" height="30" rx="5" stroke="url(#gradient1)" stroke-width="4" fill="none"/>
                        
                        <!-- Warning Sign -->
                        <circle cx="100" cy="95" r="35" fill="url(#gradient2)" opacity="0.9"/>
                        <text x="95" y="105" font-size="30" fill="white" font-weight="bold">!</text>
                        
                        <!-- Gradient Definitions -->
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#F97316;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#F97316;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#FBBF24;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onclick="window.location.reload()" 
                   class="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Muat Ulang
                </button>
                
                <a href="/" 
                   class="px-8 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg pulse-red flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Ke Beranda
                </a>
            </div>

            <!-- Help Text -->
            <div class="mt-12 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
                <h3 class="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Apa yang Harus Dilakukan?
                </h3>
                <div class="text-slate-300 space-y-2 mb-4">
                    <p>• Coba muat ulang halaman ini</p>
                    <p>• Tunggu beberapa saat dan coba lagi</p>
                    <p>• Jika masalah berlanjut, hubungi tim IT</p>
                </div>
                <div class="flex flex-wrap gap-4 justify-center text-sm">
                    <a href="mailto:support@kampus.ac.id" class="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        support@kampus.ac.id
                    </a>
                    <span class="text-slate-500">|</span>
                    <a href="tel:+6281234567890" class="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        +62 812-3456-7890
                    </a>
                </div>
            </div>

            <!-- Error Code (for developers) -->
            @if(config('app.debug'))
            <div class="mt-6 p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-left">
                <p class="text-xs text-red-400 font-mono">
                    Error ID: {{ uniqid('ERR-') }} | Time: {{ now()->format('Y-m-d H:i:s') }}
                </p>
            </div>
            @endif
        </div>
    </div>

    <!-- Floating Particles -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-20 left-10 w-2 h-2 bg-red-400 rounded-full opacity-50"></div>
        <div class="absolute top-40 right-20 w-3 h-3 bg-orange-400 rounded-full opacity-40"></div>
        <div class="absolute bottom-20 left-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
        <div class="absolute bottom-40 right-1/3 w-3 h-3 bg-red-500 rounded-full opacity-30"></div>
    </div>
</body>
</html>
