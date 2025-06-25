import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {createI18nClient, I18nClient, type I18nClientOptions} from './i18n-client.js';
import {Locale} from './locale/locale.js';

describe(createI18nClient.name, () => {
    async function createMockClient(options?: Readonly<I18nClientOptions<any>> | undefined) {
        return await createI18nClient(
            Locale.en,
            {
                en: () => import('./translations/en/phrases.js'),
                de: () => import('./translations/de/phrases.js'),
            },
            options,
        );
    }

    it('type errors on missing translations', async () => {
        const client = await createI18nClient(
            Locale.en,
            // @ts-expect-error: missing a key in the `de` file
            {
                en: () => import('./translations/en/phrases.js'),
                de: () => import('./translations/de/missing.js'),
            },
            {lng: 'de'},
        );
        assert.strictEquals(client.get.key2, 'hello world 2', 'should fallback to english');
    });

    it('type errors on missing default language', async () => {
        await assert.throws(() =>
            createI18nClient(
                Locale.en,
                // @ts-expect-error: intentionally missing `en`
                {
                    de: () => import('./translations/de/missing.js'),
                },
                {lng: 'de'},
            ),
        );
    });

    it('handles interpolation', async () => {
        const client = await createMockClient();

        assert.deepEquals(client.get.nested, {moreNesting: 'nested value'});
        assert.strictEquals(client.get.interop({name: 'John'}), 'Hello there John.');
    });

    it('loads translation files', async () => {
        const client = await createMockClient();

        assert.deepEquals(client.get.nested, {moreNesting: 'nested value'});
        assert.strictEquals(client.get.key1, 'hello world 1');
    });

    it('does not load other namespaces', async () => {
        const client = await createMockClient({
            ns: [
                'translation',
                'translation-2',
            ],
        });

        assert.isUndefined(
            // @ts-expect-error: types for namespaces are not supported yet.
            client.get['translation-2:key1'],
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
        assert.isUndefined(client.get.key1 as unknown);
        await client.init();
        assert.strictEquals(client.get.key1, 'hello world 1');
    });
    it('handles missing loaders', async () => {
        // @ts-expect-error: missing loaders
        const client = new I18nClient();
        await assert.throws(() => client.init());
    });
});
