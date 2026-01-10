import { useState, useEffect } from 'react';

interface DeviceInfo {
    fingerprint: string;
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    timezone: string;
    cookiesEnabled: boolean;
    doNotTrack: boolean;
    touchSupport: boolean;
    colorDepth: number;
    hardwareConcurrency: number;
    deviceMemory: number | null;
    webglVendor: string | null;
    webglRenderer: string | null;
}

async function generateFingerprint(): Promise<DeviceInfo> {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    let webglVendor: string | null = null;
    let webglRenderer: string | null = null;
    
    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
    }

    const info: Omit<DeviceInfo, 'fingerprint'> = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack === '1',
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        colorDepth: screen.colorDepth,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory || null,
        webglVendor,
        webglRenderer,
    };

    // Generate hash from device info
    const dataString = JSON.stringify(info);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
        ...info,
        fingerprint,
    };
}

export function useDeviceFingerprint() {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        generateFingerprint()
            .then(setDeviceInfo)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return {
        deviceInfo,
        fingerprint: deviceInfo?.fingerprint || null,
        loading,
        error,
    };
}
