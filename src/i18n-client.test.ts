import {assert} from '@augment-vir/assert';
import {createArray} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {generateDevPhrases} from './generate-dev-phrases.js';
import {I18nClient, type I18nClientOptions} from './i18n-client.js';
import {Locale} from './locale/locale.js';

describe(I18nClient.createInstance.name, () => {
    async function createMockClient(options?: Readonly<I18nClientOptions<any>> | undefined) {
        return await I18nClient.createInstance(
            Locale.en,
            {
                en: () => import('./translations/en/phrases.js'),
                de: () => import('./translations/de/phrases.js'),
            },
            options,
        );
    }

    it('type errors on missing translations', async () => {
        const client = await I18nClient.createInstance(
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

    it('supports dev replacements', async () => {
        const client = await I18nClient.createInstance(
            Locale.en,
            {
                en: () => import('./translations/en/phrases.js'),
                de: () => import('./translations/de/phrases.js'),
                dev: () => generateDevPhrases(import('./translations/en/phrases.js'), 'XYZ'),
            },
            {lng: 'dev-long'},
        );
        assert.strictEquals(client.get.key1, 'XYZ');
        assert.strictEquals(client.get.key2, 'XYZ');
        assert.strictEquals(client.get.nested.moreNesting, 'XYZ');
        assert.strictEquals(client.get.interop({name: 'whatever'}), 'XYZ');
    });
    it('handles missing loaders', async () => {
        const client = await I18nClient.createInstance(
            Locale.en,
            {
                en: () => import('./translations/en/phrases.js'),
                de: () => import('./translations/de/phrases.js'),
                dev: () => generateDevPhrases(import('./translations/en/phrases.js'), 'XYZ'),
            },
            {lng: 'dev-long'},
        );
        assert.strictEquals(client.get.key1, 'XYZ');
        assert.strictEquals(client.get.key2, 'XYZ');
        assert.strictEquals(client.get.nested.moreNesting, 'XYZ');
        assert.strictEquals(client.get.interop({name: 'whatever'}), 'XYZ');
    });

    it('type errors on missing default language', async () => {
        await assert.throws(() =>
            I18nClient.createInstance(
                Locale.en,
                // @ts-expect-error: intentionally missing `en`
                {
                    de: () => import('./translations/de/missing.js'),
                },
                {lng: 'de'},
            ),
        );
    });

    /** It's tricky to get `i18next` to properly create new instances. */
    it('can create multiple instances in parallel', async () => {
        await createArray(10, async () => {
            return await I18nClient.createInstance(Locale.en, {
                en: () => import('./translations/en/phrases.js'),
                de: () => import('./translations/de/phrases.js'),
            });
        });
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
