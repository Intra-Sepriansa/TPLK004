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

if (typeof window !== 'undefined' && 'onbeforeinstallprompt' in window) {
    let deferredPrompt: BeforeInstallPromptEvent | null = null;
    const dismissedKey = 'tplk004_pwa_install_dismissed';

    window.addEventListener('beforeinstallprompt', (event: Event) => {
        event.preventDefault();
        deferredPrompt = event as BeforeInstallPromptEvent;

        if (window.localStorage.getItem(dismissedKey) === '1') {
            return;
        }

        if (document.getElementById('pwa-install-banner')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.style.position = 'fixed';
        banner.style.right = '16px';
        banner.style.bottom = '16px';
        banner.style.zIndex = '9999';
        banner.style.padding = '12px 14px';
        banner.style.borderRadius = '14px';
        banner.style.background = 'rgba(15, 23, 42, 0.92)';
        banner.style.color = '#fff';
        banner.style.fontSize = '13px';
        banner.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        banner.style.display = 'flex';
        banner.style.gap = '10px';
        banner.style.alignItems = 'center';
        banner.style.boxShadow = '0 14px 40px rgba(0,0,0,0.35)';
        banner.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:2px;">
                <strong style="font-size:13px;">Install TPLK004</strong>
                <span style="font-size:12px;color:rgba(255,255,255,0.75);">Akses cepat di layar utama</span>
            </div>
        `;

        const installBtn = document.createElement('button');
        installBtn.textContent = 'Install';
        installBtn.style.border = 'none';
        installBtn.style.borderRadius = '999px';
        installBtn.style.padding = '6px 12px';
        installBtn.style.background = '#10b981';
        installBtn.style.color = '#0b1f17';
        installBtn.style.cursor = 'pointer';
        installBtn.style.fontWeight = '600';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Nanti';
        closeBtn.style.border = '1px solid rgba(255,255,255,0.2)';
        closeBtn.style.borderRadius = '999px';
        closeBtn.style.padding = '6px 10px';
        closeBtn.style.background = 'transparent';
        closeBtn.style.color = '#fff';
        closeBtn.style.cursor = 'pointer';

        installBtn.onclick = async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            banner.remove();
        };

        closeBtn.onclick = () => {
            window.localStorage.setItem(dismissedKey, '1');
            banner.remove();
        };

        banner.appendChild(installBtn);
        banner.appendChild(closeBtn);
        document.body.appendChild(banner);
    });
}
