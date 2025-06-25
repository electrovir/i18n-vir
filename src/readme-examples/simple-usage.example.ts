import {createI18nClient, Locale} from '../index.js';

const client = await createI18nClient(
    /** Provide the default language. */
    Locale.en,
    /**
     * Each language is defined in a separate TypeScript file for maximum type safety and
     * modularity.
     *
     * Make sure that all files use `export default {phrasesHere}` and that the default language's
     * file uses `as const`.
     */
    {
        en: () => import('../translations/en/phrases.js'),
        de: () => import('../translations/de/phrases.js'),
    },
    /** Optionally provide i18next options. */
    {},
);

/** Access phrases with type safety through `.get`. */
console.info(client.get.key1);
