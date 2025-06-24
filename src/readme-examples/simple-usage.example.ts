import {createI18nClient} from '../index.js';

const client = await createI18nClient<
    /** Pass in an import type parameter, relative to the current file. */
    typeof import('../../www-static/locales/en/translation.json')
>(
    /** A load path is required that will be resolved by a network `fetch()`. */
    '/locales/{{lng}}/{{ns}}.json',
    /** Optionally provide options. */
    {},
);

/** Access phrases with type safety through `.get`. */
console.info(client.get.key1);
