import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import ru from './locales/ru.json';
import pt from './locales/pt.json';
import pl from './locales/pl.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
            ar: { translation: ar },
            de: { translation: de },
            ru: { translation: ru },
            pt: { translation: pt },
            pl: { translation: pl },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

// RTL & Language Handling
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';

    // Optional: Force English for Admin/HR routes if needed globally
    // But usually, we just don't use t() hooks there or ignore translation files 
    // currently we are implementing global switch, but content in HR pages is hardcoded English.
});

export default i18n;
