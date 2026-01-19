/**
 * i18n - Internationalization
 * Multi-language support for the application
 */

import { id } from './id';
import { en } from './en';

export type Language = 'id' | 'en';

const translations = { id, en };

export function useTranslation(lang: Language = 'id') {
    return translations[lang];
}

export function t(lang: Language, key: string): string {
    const keys = key.split('.');
    let value: any = translations[lang];
    
    for (const k of keys) {
        value = value?.[k];
        if (value === undefined) return key;
    }
    
    return value || key;
}

export { id, en };
