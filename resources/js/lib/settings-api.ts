import axios from 'axios';

const API_BASE = '/api/settings';

// Get CSRF token
function getCsrfToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        throw new Error('CSRF token not found');
    }
    return token;
}

// Axios instance with CSRF token
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add CSRF token to every request
api.interceptors.request.use((config) => {
    config.headers['X-CSRF-TOKEN'] = getCsrfToken();
    return config;
});

/**
 * Get all settings
 */
export async function getSettings() {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Failed to get settings:', error);
        throw error;
    }
}

/**
 * Update category settings
 */
export async function updateCategorySettings(category: string, data: any) {
    try {
        const response = await api.post(`/${category}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update ${category} settings:`, error);
        throw error;
    }
}

/**
 * Reset all settings to default
 */
export async function resetSettings() {
    try {
        const response = await api.post('/reset');
        return response.data;
    } catch (error) {
        console.error('Failed to reset settings:', error);
        throw error;
    }
}

/**
 * Clear cache
 */
export async function clearCache() {
    try {
        const response = await api.post('/clear-cache');
        return response.data;
    } catch (error) {
        console.error('Failed to clear cache:', error);
        throw error;
    }
}

/**
 * Download settings as JSON
 */
export async function downloadSettings() {
    try {
        // Fetch current settings directly from DB via api to ensure we get latest if localStorage is desync or not comprehensive enough
        const settings = await getSettings();
        if (!settings) {
            throw new Error('No settings found');
        }

        // Create blob and download
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download settings:', error);
        throw error;
    }
}

/**
 * Upload settings from JSON file
 */
export async function uploadSettings(file: File) {
    try {
        const text = await file.text();
        const settings = JSON.parse(text);

        // Validate settings structure
        if (!settings || typeof settings !== 'object') {
            throw new Error('Invalid settings file');
        }

        // Upload to server
        const response = await api.post('/import', settings);
        return response.data;
    } catch (error) {
        console.error('Failed to upload settings:', error);
        throw error;
    }
}
