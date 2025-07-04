/* node:coverage disable */

import {I18nClient, Locale} from './index.js';

const languageLoaders = {
    en: () => import('./translations/en/phrases.js'),
    de: () => import('./translations/de/phrases.js'),
};

const client = await I18nClient.createInstance(Locale.en, languageLoaders);

console.info(client.get.nested);
