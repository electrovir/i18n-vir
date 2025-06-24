import {createI18nClient} from '../index.js';

/** Each language is defined in a separate TypeScript file for maximum type safety and modularity. */
const languageLoaders = {
    en: () => import('../translations/en/phrases.js'),
    de: () => import('../translations/de/phrases.js'),
};

const client = await createI18nClient(
    /**
     * Provide the default loader first. This will determine your phrases object type (and flag any
     * translation files that are missing phrases).
     */
    languageLoaders.en,
    languageLoaders,
    /** Optionally provide options. */
    {},
);

/** Access phrases with type safety through `.get`. */
console.info(client.get.key1);
