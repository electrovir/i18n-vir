import i18next, {type InitOptions} from 'i18next';
import {
    LoadFromTsPlugin,
    type BasePhrases,
    type LoadFromTsOptions,
    type PhrasesLoader,
} from './load-from-ts-plugin.js';
import {Locale} from './locale/locale.js';

const uninitializedGet = new Proxy<any>(
    {},
    {
        get() {
            throw new Error('i18n has not been initialized.');
        },
    },
);

/**
 * Optional for {@link I18nClient} and {@link createI18nClient}.
 *
 * @category Internal
 */
export type I18nClientOptions<Phrases extends BasePhrases = BasePhrases> = Partial<
    InitOptions<LoadFromTsOptions<Phrases>>
>;

/**
 * Use `createI18nClient` to create an instance of this class unless you specifically don't want to
 * immediately initialize the instance (which is an async process).
 *
 * @category Internal
 * @example
 *
 * ```ts
 * import {createI18nClient} from 'i18n-vir';
 *
 * const client = await createI18nClient<
 *     typeof import('../www-static/locales/en/translation.json')
 * >('/locales/{{lng}}/{{ns}}.json');
 * ```
 */
export class I18nClient<const Phrases extends BasePhrases> {
    /**
     * All the i18n phrases you loaded. Type is determined by the provided type parameter (so make
     * sure to provide it).
     */
    public get: Phrases = uninitializedGet;

    constructor(
        protected readonly loaders: Readonly<LoadFromTsOptions<Phrases>['loaders']>,
        protected readonly options?: Readonly<I18nClientOptions<Phrases>> | undefined,
    ) {}

    /**
     * Initialize i18next. This must be called before any phrases are loaded with
     * {@link I18nClient.get}.
     */
    public async init() {
        const getPhrase = await i18next
            .createInstance()
            .use(LoadFromTsPlugin)
            .init<LoadFromTsOptions<Phrases>>({
                lng: globalThis.navigator.language,
                fallbackLng: Locale.en,
                lowerCaseLng: true,
                returnObjects: true,
                backend: {
                    loaders: this.loaders,
                    ...this.options?.backend,
                },
                ...this.options,
            });

        this.get = new Proxy<Phrases>({} as Phrases, {
            get: (target, property) => {
                return getPhrase(String(property));
            },
        });
    }
}

/**
 * Create an instance of {@link I18nClient}, with type safe phrases, and immediately initialize it.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {createI18nClient} from 'i18n-vir';
 *
 * const client = await createI18nClient<
 *     typeof import('../www-static/locales/en/translation.json')
 * >('/locales/{{lng}}/{{ns}}.json');
 * ```
 */
export async function createI18nClient<const Phrases extends BasePhrases>(
    defaultLoader: PhrasesLoader<Phrases>,
    loaders: Readonly<LoadFromTsOptions<NoInfer<Phrases>>['loaders']>,
    options?: Readonly<I18nClientOptions<NoInfer<Phrases>>> | undefined,
) {
    const client = new I18nClient<Phrases>(loaders, options);
    await client.init();
    return client;
}
