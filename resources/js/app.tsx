import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import axios from 'axios';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
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

const csrfMeta = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
if (csrfMeta) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfMeta;
}

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
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
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

const isLocalhost =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

if (isLocalhost && 'serviceWorker' in navigator) {
    // Always clean up service workers on local env to avoid stale built assets.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
    });
}

// Register Service Worker only in real production (not localhost).
if (import.meta.env.PROD && !isLocalhost && 'serviceWorker' in navigator) {
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
