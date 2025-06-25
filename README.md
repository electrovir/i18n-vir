# i18n-vir

A lightweight wrapper for [`i18next`](https://www.npmjs.com/package/i18next) with TypeScript loaders.

## Install

```sh
npm i i18n-vir
```

## Usage

1. Use `createI18nClient`.
2. Pass in a `typeof import` type parameter.
3. Pass in a load path argument.
4. Optionally provide additional i18next options.

<!-- example-link: src/readme-examples/simple-usage.example.ts -->

```TypeScript
import {createI18nClient, Locale} from 'i18n-vir';

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
