import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import axios from 'axios';
import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/useTheme';

// Call BEFORE React renders to prevent FOUC
initializeTheme();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global axios + Inertia request defaults for Laravel CSRF/session compatibility.
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

const csrfMeta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfMeta) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfMeta;
}

const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<
    string,
    { default: ComponentType }
>;

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 419) {
            // Session/token expired. Force refresh to issue fresh session + CSRF token.
            window.location.reload();
        }

        return Promise.reject(error);
    },
);

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

if (!import.meta.env.PROD && 'serviceWorker' in navigator) {
    // Cleanup old service workers in local development (prevents stale CSRF/session page cache).
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
    });
}

// Register Service Worker only in production to avoid stale cache/session issues on localhost.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration.scope);
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}
