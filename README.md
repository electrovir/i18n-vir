# i18n-vir

A lightweight wrapper for [`i18next`](https://www.npmjs.com/package/i18next) and [`i18next-http-backend`](https://www.npmjs.com/package/i18next-http-backend) with easy type safety and abstracted boilerplate.

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
```
