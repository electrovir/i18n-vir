import i18next, {type InitOptions} from 'i18next';
import I18NextHttpBackend, {type HttpBackendOptions} from 'i18next-http-backend';

/**
 * Base type for translations files.
 *
 * @category Internal
 */
export type BaseTranslations = {[Key in string]: string | BaseTranslations};

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
export type I18nClientOptions = Partial<InitOptions<HttpBackendOptions>>;

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
export class I18nClient<TranslationFile extends BaseTranslations> {
    /**
     * All the i18n phrases you loaded. Type is determined by the provided type parameter (so make
     * sure to provide it).
     */
    public get: TranslationFile = uninitializedGet;

    constructor(
        protected readonly loadPath: NonNullable<HttpBackendOptions['loadPath']>,
        protected readonly options?: Readonly<I18nClientOptions> | undefined,
    ) {}

    /**
     * Initialize i18next. This must be called before any phrases are loaded with
     * {@link I18nClient.get}.
     */
    public async init() {
        const getPhrase = await i18next
            .createInstance()
            .use(I18NextHttpBackend)
            .init<HttpBackendOptions>({
                lng: globalThis.navigator.language,
                fallbackLng: 'en',
                lowerCaseLng: true,
                returnObjects: true,
                backend: {
                    loadPath: this.loadPath,
                    ...this.options?.backend,
                },
                ...this.options,
            });

        this.get = new Proxy<TranslationFile>({} as TranslationFile, {
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
export async function createI18nClient<TranslationFile extends BaseTranslations>(
    loadPath: NonNullable<HttpBackendOptions['loadPath']>,
    options?: Readonly<I18nClientOptions> | undefined,
) {
    const client = new I18nClient<TranslationFile>(loadPath, options);
    await client.init();
    return client;
}
