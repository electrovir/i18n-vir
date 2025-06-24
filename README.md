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
import {createI18nClient} from 'i18n-vir';

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
```
