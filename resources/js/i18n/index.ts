/**
 * i18n - Internationalization
 * Multi-language support for the application
 */

import { en } from './en';
import { id } from './id';

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

export { en, id };
