<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>419 - Sesi Berakhir</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        @keyframes pulse-purple {
            0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
            50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .pulse-purple { animation: pulse-purple 2s ease-in-out infinite; }
        .rotate-slow { animation: rotate 20s linear infinite; }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
        <!-- Main Content -->
        <div class="text-center">
            <!-- 419 Number with Animation -->
            <div class="relative mb-8">
                <h1 class="text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 leading-none float-animation">
                    419
                </h1>
                <div class="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500"></div>
            </div>

            <!-- Error Message -->
            <div class="mb-8">
                <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
                    Sesi Anda Telah Berakhir
                </h2>
                <p class="text-xl text-slate-300 mb-2">
                    Maaf, sesi login Anda telah habis atau tidak valid.
                </p>
                <p class="text-lg text-slate-400">
                    Silakan muat ulang halaman dan login kembali untuk melanjutkan.
                </p>
            </div>

            <!-- Illustration -->
            <div class="flex justify-center mb-12">
                <div class="relative">
                    <svg class="w-64 h-64 float-animation" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Clock Icon -->
                        <circle cx="100" cy="100" r="50" stroke="url(#gradient1)" stroke-width="6" fill="none"/>
                        
                        <!-- Clock Hands -->
                        <line x1="100" y1="100" x2="100" y2="65" stroke="url(#gradient2)" stroke-width="4" stroke-linecap="round"/>
                        <line x1="100" y1="100" x2="125" y2="100" stroke="url(#gradient2)" stroke-width="4" stroke-linecap="round"/>
                        
                        <!-- Clock Center -->
                        <circle cx="100" cy="100" r="5" fill="url(#gradient2)"/>
                        
                        <!-- Expired Symbol (X) -->
                        <line x1="140" y1="60" x2="160" y2="80" stroke="url(#gradient3)" stroke-width="5" stroke-linecap="round"/>
                        <line x1="160" y1="60" x2="140" y2="80" stroke="url(#gradient3)" stroke-width="5" stroke-linecap="round"/>
                        
                        <!-- Gradient Definitions -->
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#A855F7;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#D946EF;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#D946EF;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#F43F5E;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onclick="window.location.reload()" 
                   class="px-8 py-4 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg pulse-purple flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Muat Ulang & Login
                </button>
                
                <a href="/" 
                   class="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Ke Beranda
                </a>
            </div>

            <!-- Help Text -->
            <div class="mt-12 p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700">
                <h3 class="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Mengapa Ini Terjadi?
                </h3>
                <div class="text-slate-300 space-y-2 mb-4">
                    <p>• Anda tidak aktif terlalu lama</p>
                    <p>• Token keamanan telah kedaluwarsa</p>
                    <p>• Halaman dibuka di tab lain dengan login berbeda</p>
                    <p>• Browser cache perlu dibersihkan</p>
                </div>
                <p class="text-slate-400 text-sm">
                    Untuk keamanan akun Anda, sistem secara otomatis mengakhiri sesi setelah periode tidak aktif.
                </p>
            </div>
        </div>
    </div>

    <!-- Floating Particles -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full opacity-50 float-animation"></div>
        <div class="absolute top-40 right-20 w-3 h-3 bg-fuchsia-400 rounded-full opacity-40 float-animation" style="animation-delay: 0.5s;"></div>
        <div class="absolute bottom-20 left-1/4 w-2 h-2 bg-pink-400 rounded-full opacity-60 float-animation" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-40 right-1/3 w-3 h-3 bg-purple-500 rounded-full opacity-30 float-animation" style="animation-delay: 1.5s;"></div>
    </div>
</body>
</html>
