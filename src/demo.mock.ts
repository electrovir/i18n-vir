/* node:coverage disable */

import {createI18nClient} from './i18n-client.js';
import {Locale} from './locale/locale.js';

const languageLoaders = {
    en: () => import('./translations/en/phrases.js'),
    de: () => import('./translations/de/phrases.js'),
};

const client = await createI18nClient(Locale.en, languageLoaders);

console.info(client.get.nested);
