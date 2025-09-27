import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en';
import frTranslations from './locales/fr';

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            fr: {
                translation: frTranslations,
            },
            en: {
                translation: enTranslations,
            },
        },
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
