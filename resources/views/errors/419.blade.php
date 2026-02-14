<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>419 - Sesi Berakhir</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0a0a0a] min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl w-full text-center">
        <!-- Error Code -->
        <div class="mb-6">
            <span class="inline-block px-4 py-2 bg-gray-800 text-gray-400 rounded-full text-sm font-medium">
                • 419
            </span>
        </div>

        <!-- Main Message -->
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-4">
            Sesi Berakhir
        </h1>
        <p class="text-2xl md:text-3xl text-gray-300 mb-8">
            Sesi login Anda telah habis atau tidak valid.
        </p>

        <!-- Action Button -->
        <button onclick="window.location.reload()" 
           class="inline-block px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors">
            Muat Ulang Halaman
        </button>

        <!-- Illustration -->
        <div class="mt-16 relative">
            <img src="https://illustrations.popsy.co/amber/timed-out-error.svg" 
                 alt="419 Session Expired" 
                 class="w-full max-w-md mx-auto opacity-80">
        </div>
    </div>
</body>
</html>
