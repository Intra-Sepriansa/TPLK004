import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
    assetsInclude: ['**/*.glb'],
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        cors: {
            origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
            credentials: true,
        },
        hmr: {
            host: 'localhost',
            port: 5173,
            clientPort: 5173,
        },
    },
    plugins: [
        ViteImageOptimizer({
            svg: {
                multipass: true,
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                removeViewBox: false,
                            },
                        },
                    } as any,
                ],
            },
            png: {
                quality: 80,
            },
            jpeg: {
                quality: 80,
            },
            jpg: {
                quality: 80,
            },
            webp: {
                lossless: true,
            },
        }),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        compression({
            algorithm: 'gzip',
            exclude: [/\.(br)$ /, /\.(gz)$/],
        } as any),
        compression({
            algorithm: 'brotliCompress',
            exclude: [/\.(br)$ /, /\.(gz)$/],
        } as any),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-inertia': ['@inertiajs/react', 'ziggy-js'],
                    'vendor-ui': [
                        '@radix-ui/react-accordion',
                        '@radix-ui/react-alert-dialog',
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-collapsible',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-label',
                        '@radix-ui/react-navigation-menu',
                        '@radix-ui/react-progress',
                        '@radix-ui/react-select',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slider',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-switch',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-toggle-group',
                        '@radix-ui/react-toggle',
                        '@radix-ui/react-tooltip',
                    ],
                    'vendor-motion': ['framer-motion'],
                    'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
                    'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit'],
                    'vendor-chart': ['chart.js', 'react-chartjs-2', 'recharts'],
                    'vendor-lucide': ['lucide-react'],
                    'vendor-utils': ['clsx', 'tailwind-merge', 'date-fns', 'moment', 'localforage'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
