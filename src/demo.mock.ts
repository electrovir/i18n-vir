import {createI18nClient} from './i18n-client.js';

const client = await createI18nClient<typeof import('../www-static/locales/en/translation.json')>(
    '/locales/{{lng}}/{{ns}}.json',
);

console.info(client.get.nested);
