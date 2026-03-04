<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- CRITICAL: Inline script to prevent FOUC --}}
        <script>
            (function() {
                // Get theme from localStorage
                const theme = localStorage.getItem('app-theme') || 'light';
                const root = document.documentElement;
                
                // Determine actual theme
                let actualTheme = 'light';
                if (theme === 'auto') {
                    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                } else {
                    actualTheme = theme;
                }
                
                // Apply immediately (before any CSS loads)
                root.classList.add('no-transition');
                root.classList.remove('light', 'dark');
                root.classList.add(actualTheme);
                root.setAttribute('data-theme', actualTheme);
                root.style.colorScheme = actualTheme;
                
                // Remove no-transition after a frame
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        root.classList.remove('no-transition');
                    });
                });
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
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
