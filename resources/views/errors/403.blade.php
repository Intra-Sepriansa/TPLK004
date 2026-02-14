<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Akses Ditolak</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0a0a0a] min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl w-full text-center">
        <!-- Error Code -->
        <div class="mb-6">
            <span class="inline-block px-4 py-2 bg-gray-800 text-gray-400 rounded-full text-sm font-medium">
                • 403
            </span>
        </div>

        <!-- Main Message -->
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-4">
            Akses Ditolak
        </h1>
        <p class="text-2xl md:text-3xl text-gray-300 mb-8">
            Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>

        <!-- Action Button -->
        <a href="/" 
           class="inline-block px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors">
            Kembali ke Beranda
        </a>

        <!-- Illustration -->
        <div class="mt-16 relative">
            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/No%20Entry.png" 
                 alt="403 Forbidden" 
                 class="w-64 h-64 mx-auto opacity-80">
        </div>
    </div>
</body>
</html>
