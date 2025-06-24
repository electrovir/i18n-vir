import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {createI18nClient, I18nClient, type I18nClientOptions} from './i18n-client.js';

describe(createI18nClient.name, () => {
    async function createMockClient(options?: Readonly<I18nClientOptions> | undefined) {
        return await createI18nClient<typeof import('../www-static/locales/en/translation.json')>(
            '../www-static/locales/{{lng}}/{{ns}}.json',
            options,
        );
    }

    it('loads translation files', async () => {
        const client = await createMockClient();

        assert.deepEquals(client.get.nested, {moreNesting: 'nested value'});
        assert.strictEquals(client.get.key1, 'hello world 1');
    });

    it('loads other namespaces', async () => {
        const client = await createMockClient({
            ns: [
                'translation',
                'translation-2',
            ],
        });

        assert.strictEquals(
            // @ts-expect-error: types for namespaces are not supported yet.
            client.get['translation-2:key1'],
            '2 hello world 1',
        );
    });
    it('loads other languages', async () => {
        const client = await createMockClient({lng: 'de'});

        assert.strictEquals(client.get.key1, 'Hallo Welt 1');
    });
});

describe(I18nClient.name, () => {
    it('requires initialization', async () => {
        const client = new I18nClient<typeof import('../www-static/locales/en/translation.json')>(
            '../www-static/locales/{{lng}}/{{ns}}.json',
        );
        assert.throws(() => {
            client.get.key1;
        });
        await client.init();
        assert.strictEquals(client.get.key1, 'hello world 1');
    });
});
