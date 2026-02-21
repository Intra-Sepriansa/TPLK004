import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Shorten Indonesian name with multiple degrees by keeping only the front degrees, base name, and the LAST degree.
 * E.g. "IR. TRI PRASETYO S.KOM., S.T., M.KOM." -> "IR. TRI PRASETYO, M.KOM."
 */
export function formatShortName(name?: string | null): string {
    if (!name) return '';
    const parts = name.split(',');
    if (parts.length <= 1) return name; // No comma, return as is

    let firstPart = parts[0].trim();
    const lastDegree = parts[parts.length - 1].trim();

    // Strip trailing bachelor/master degrees from the first part that might have missed a comma
    firstPart = firstPart.replace(/\s+(S\.|M\.|A\.Md\.|B\.|A\.P\.).*$/i, '');

    return `${firstPart}, ${lastDegree}`;
}
