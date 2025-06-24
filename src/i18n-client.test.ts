import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {createI18nClient, I18nClient, type I18nClientOptions} from './i18n-client.js';

describe(createI18nClient.name, () => {
    async function createMockClient(options?: Readonly<I18nClientOptions<any>> | undefined) {
        const loaders = {
            en: () => import('./translations/en/phrases.js'),
            de: () => import('./translations/de/phrases.js'),
        };

        return await createI18nClient(loaders.en, loaders, options);
    }

    it('flags missing translations', async () => {
        const loaders = {
            en: () => import('./translations/en/phrases.js'),
            de: () => import('./translations/de/missing.js'),
        };

        // @ts-expect-error: intentionally missing keys in `de/missing.js`.
        const client = await createI18nClient(loaders.en, loaders, {lng: 'de'});
        assert.strictEquals(client.get.key2, 'hello world 2', 'should fallback to english');
    });

    it('loads translation files', async () => {
        const client = await createMockClient();

        assert.deepEquals(client.get.nested, {moreNesting: 'nested value'});
        assert.strictEquals(client.get.key1, 'hello world 1');
    });

    it('loads only a single namespace', async () => {
        const client = await createMockClient({
            ns: [
                'translation',
                'translation-2',
            ],
        });

        assert.strictEquals(
            // @ts-expect-error: types for namespaces are not supported yet.
            client.get['translation-2:key1'],
            'hello world 1',
        );
    });
    it('loads other languages', async () => {
        const client = await createMockClient({lng: 'de'});

        assert.strictEquals(client.get.key1, 'Hallo Welt 1');
    });
});

describe(I18nClient.name, () => {
    it('requires initialization', async () => {
        const client = new I18nClient({
            en: () => import('./translations/en/phrases.js'),
        });
        assert.throws(() => {
            client.get.key1;
        });
        await client.init();
        assert.strictEquals(client.get.key1, 'hello world 1');
    });
    it('handles missing loaders', async () => {
        // @ts-expect-error: missing loaders
        const client = new I18nClient();
        await client.init();
        assert.strictEquals(client.get.key1, 'key1');
    });
});
