# i18n-vir

A lightweight wrapper for [`i18next`](https://www.npmjs.com/package/i18next) with TypeScript loaders.

## Install

```sh
npm i i18n-vir
```

## Usage

A client instance must be constructed by calling `I18nClient.createInstance`:

<!-- example-link: src/readme-examples/simple-usage.example.ts -->

```TypeScript
import {I18nClient, Locale} from 'i18n-vir';

const client = await I18nClient.createInstance(
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
```

### Phrases file

-   Each phrases file should use `export default`.
-   For at least your default phrases file, it should use `as const`.

Example:

<!-- example-link: src/translations/en/phrases.ts -->

```TypeScript
export default {
    key1: 'hello world 1',
    key2: 'hello world 2',
    nested: {
        moreNesting: 'nested value',
    },
    interop: 'Hello there {{name}}.',
} as const;
```
