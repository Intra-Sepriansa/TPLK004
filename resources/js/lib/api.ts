/**
 * API helper with CSRF token handling
 */

type FetchOptions = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
};

/**
 * Get CSRF token from meta tag
 */
export function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

/**
 * Make an API request with CSRF token
 */
export async function apiRequest(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { headers = {}, ...rest } = options;
    
    const defaultHeaders: Record<string, string> = {
        'X-CSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    };

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(rest.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    return fetch(url, {
        ...rest,
        credentials: 'include',
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    });
}

/**
 * Make a GET request
 */
export async function apiGet(url: string, options: FetchOptions = {}): Promise<Response> {
    return apiRequest(url, { ...options, method: 'GET' });
}

/**
 * Make a POST request
 */
export async function apiPost(
    url: string,
    body?: Record<string, unknown> | FormData,
    options: FetchOptions = {}
): Promise<Response> {
    return apiRequest(url, {
        ...options,
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body),
    });
}

/**
 * Make a PUT request
 */
export async function apiPut(
    url: string,
    body?: Record<string, unknown>,
    options: FetchOptions = {}
): Promise<Response> {
    return apiRequest(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

/**
 * Make a DELETE request
 */
export async function apiDelete(url: string, options: FetchOptions = {}): Promise<Response> {
    return apiRequest(url, { ...options, method: 'DELETE' });
}

/**
 * Check if response is CSRF token mismatch (419)
 */
export function isCsrfError(response: Response): boolean {
    return response.status === 419;
}

/**
 * Handle CSRF error by reloading page
 */
export function handleCsrfError(): void {
    // Reload page to get fresh CSRF token
    window.location.reload();
}
