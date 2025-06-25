import {check, checkWrap} from '@augment-vir/assert';
import {mapObjectValues, type AnyObject, type Values} from '@augment-vir/common';
import i18next, {type i18n, type InitOptions, type TFunction} from 'i18next';
import {type IsNever} from 'type-fest';
import {hasInterpolation, type BasePhrases, type PhraseParams} from './interpolations.js';
import {
    LoadFromTsPlugin,
    type ExtractPhrasesFromLoader,
    type ExtractPhrasesFromLoaders,
    type LoadFromTsOptions,
    type PhrasesLoader,
} from './load-from-ts-plugin.js';
import {Locale} from './locale/locale.js';

/**
 * Optional for {@link I18nClient} and {@link createI18nClient}.
 *
 * @category Internal
 */
export type I18nClientOptions<Phrases extends BasePhrases = BasePhrases> = Partial<
    InitOptions<LoadFromTsOptions<Phrases>>
>;

/**
 * A generic version of {@link GetPhrases} that can be used for any phrases.
 *
 * @category Internal
 */
export type BaseGetPhrases = {
    [Key in string]: BaseGetPhrases | string | ((params: AnyObject) => string);
};

/**
 * Creates the type for `I18nClient.get` from phrases.
 *
 * @category Internal
 */
export type GetPhrases<Phrases extends BasePhrases> = {
    [PhraseKey in keyof Phrases]: Phrases[PhraseKey] extends BasePhrases
        ? GetPhrases<Phrases[PhraseKey]>
        : IsNever<
                PhraseParams<Extract<PhraseKey, string>, Extract<Phrases[PhraseKey], string>>
            > extends true
          ? string
          : (
                params: PhraseParams<
                    Extract<PhraseKey, string>,
                    Extract<Phrases[PhraseKey], string>
                >,
            ) => string;
};

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
 * const client = await createI18nClient(Locale.en, {
 *     en: () => import('./translations/en/phrases.js'),
 *     de: () => import('./translations/de/phrases.js'),
 * });
 * ```
 */
export class I18nClient<const Phrases extends BasePhrases> {
    /**
     * All the i18n phrases you loaded. Type is determined by the provided type parameter (so make
     * sure to provide it).
     */
    public get: GetPhrases<Phrases> = {} as GetPhrases<Phrases>;

    public readonly i18nInstance: i18n = i18next.createInstance();

    constructor(
        protected readonly loaders: Readonly<LoadFromTsOptions<Phrases>['loaders']>,
        protected readonly options?: Readonly<I18nClientOptions<Phrases>> | undefined,
    ) {}

    /**
     * Initialize i18next. This must be called before any phrases are loaded with
     * {@link I18nClient.get}.
     */
    public async init() {
        const getPhrase = await this.i18nInstance
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

        this.get = mapPhrases(this.i18nInstance, getPhrase) as GetPhrases<Phrases>;
    }
}

function mapPhrases(i18nInstance: i18n, getPhrase: TFunction): BaseGetPhrases {
    /* node:coverage ignore next 6: covering lots of type edge cases */
    const language =
        checkWrap.isArray(i18nInstance.store.options.fallbackLng)?.[0] ||
        i18nInstance.resolvedLanguage;
    if (!language) {
        throw new Error('i18n instance is not initialized yet (missing language).');
    }

    const phrases = Object.values(i18nInstance.store.data[language] || {})[0];

    if (!phrases) {
        throw new Error('i18n instance is not initialized yet (missing phrases).');
    }

    return recursivelyMapPhrases([], phrases as BasePhrases, getPhrase);
}

function recursivelyMapPhrases(
    keyChain: string[],
    phrases: BasePhrases,
    getPhrase: TFunction,
): BaseGetPhrases {
    return mapObjectValues(phrases, (key, value) => {
        const allKeys = [
            ...keyChain,
            key,
        ];
        const fullKey = allKeys.join('.');
        if (check.isObject(value)) {
            return recursivelyMapPhrases(allKeys, value, getPhrase);
        } else if (hasInterpolation(key, value)) {
            return (params: AnyObject) => {
                return getPhrase(fullKey, params);
            };
        } else {
            return getPhrase(fullKey);
        }
    }) as BaseGetPhrases;
}

/**
 * Ensures all loader languages have all phrases.
 *
 * @category Internal
 */
export type VerifyLoaders<
    DefaultLanguage extends Locale,
    Loaders extends {[Key in DefaultLanguage]: PhrasesLoader},
> =
    ExtractPhrasesFromLoader<Values<Loaders>> extends SimplifyPhrases<
        ExtractPhrasesFromLoaders<Loaders, DefaultLanguage>
    >
        ? Readonly<Loaders>
        : 'ERROR';

/**
 * Simplifies phrases so that each value is just a string (used for {@link VerifyLoaders}).
 *
 * @category Internal
 */
export type SimplifyPhrases<Phrases extends BasePhrases> = {
    [Key in keyof Phrases]: Phrases[Key] extends BasePhrases
        ? SimplifyPhrases<Phrases[Key]>
        : string;
};

/**
 * Create an instance of {@link I18nClient}, with type safe phrases, and immediately initialize it.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {createI18nClient} from 'i18n-vir';
 *
 * const client = await createI18nClient(Locale.en, {
 *     en: () => import('./translations/en/phrases.js'),
 *     de: () => import('./translations/de/phrases.js'),
 * });
 * ```
 */
export async function createI18nClient<
    const DefaultLanguage extends Locale,
    const Loaders extends {[Key in DefaultLanguage]: PhrasesLoader} & Partial<{
        [Key in Locale]: PhrasesLoader;
    }>,
>(
    /**
     * The default / fallback language to use if the user's current language is not found in your
     * given loaders.
     */
    defaultLanguage: DefaultLanguage,
    loaders: VerifyLoaders<DefaultLanguage, Loaders>,
    options?:
        | Readonly<I18nClientOptions<ExtractPhrasesFromLoaders<NoInfer<Loaders>, DefaultLanguage>>>
        | undefined,
): Promise<I18nClient<ExtractPhrasesFromLoaders<Loaders, DefaultLanguage>>> {
    const client = new I18nClient(loaders as Loaders, {
        fallbackLng: defaultLanguage,
        ...options,
    });
    await client.init();
    return client satisfies I18nClient<any> as I18nClient<
        ExtractPhrasesFromLoaders<Loaders, DefaultLanguage>
    >;
}
