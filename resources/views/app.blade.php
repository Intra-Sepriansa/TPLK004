<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to apply theme immediately before page renders --}}
        <script>
            (function() {
                // Get theme from server (passed via Inertia page props)
                const serverTheme = '{{ $page['props']['themePreference'] ?? 'light' }}';
                
                // Check localStorage first (for immediate UI response)
                let storedTheme = localStorage.getItem('theme');
                
                // If no localStorage, use server theme
                if (!storedTheme) {
                    storedTheme = serverTheme;
                    localStorage.setItem('theme', serverTheme);
                }
                
                // Apply theme
                if (storedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else if (storedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                } else if (storedTheme === 'auto') {
                    // Use system preference
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/logo-unpam.png" sizes="any">
        <link rel="icon" href="/logo-unpam.png" type="image/png">
        <link rel="apple-touch-icon" href="/logo-unpam.png">

        {{-- PWA Meta Tags --}}
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#10b981">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="TPLK004">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="application-name" content="TPLK004">
        <meta name="msapplication-TileColor" content="#10b981">
        <meta name="msapplication-config" content="/browserconfig.xml">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
