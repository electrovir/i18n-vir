import {check, checkWrap, waitUntil} from '@augment-vir/assert';
import {mapObjectValues, type AnyObject, type Values} from '@augment-vir/common';
import i18next, {type InitOptions, type TFunction} from 'i18next';
import {type IsNever} from 'type-fest';
import {hasInterpolation, type BasePhrases, type PhraseParams} from './interpolations.js';
import {
    LoadFromTsPlugin,
    type ExtractPhrasesFromLoader,
    type ExtractPhrasesFromLoaders,
    type LoadFromTsOptions,
    type PhrasesLoader,
} from './load-from-ts-plugin.js';
import {type Locale} from './locale/locale.js';

/**
 * Options for {@link I18nClient.createInstance}.
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
 * The client for `i18n-vir`. Create an instance with `I18nClient.createInstance()`.
 *
 * @category Main
 * @example
 *
 * ```ts
 * import {I18nClient} from 'i18n-vir';
 *
 * const client = await I18nClient.createInstance(Locale.en, {
 *     en: () => import('./translations/en/phrases.js'),
 *     de: () => import('./translations/de/phrases.js'),
 * });
 * ```
 */
export class I18nClient<const Phrases extends BasePhrases> {
    /**
     * Create and initialize an instance of {@link I18nClient} with type safe phrases. Do not
     * construct {@link I18nClient} directly because async operations must take place before calling
     * it (which this method takes care of).
     */
    public static async createInstance<
        const DefaultLanguage extends Locale,
        const Loaders extends {[Key in DefaultLanguage]: PhrasesLoader} & Partial<{
            [Key in Locale]: PhrasesLoader;
        }>,
    >(
        /**
         * The default / fallback language to use if the user's current language is not found in
         * your given loaders.
         */
        defaultLanguage: DefaultLanguage,
        loaders: VerifyLoaders<DefaultLanguage, Loaders>,
        options?:
            | Readonly<
                  I18nClientOptions<ExtractPhrasesFromLoaders<NoInfer<Loaders>, DefaultLanguage>>
              >
            | undefined,
    ): Promise<I18nClient<ExtractPhrasesFromLoaders<Loaders, DefaultLanguage>>> {
        const i18nInstance = i18next.createInstance().use(LoadFromTsPlugin);

        await i18nInstance.init({
            fallbackLng: defaultLanguage,
            lng: globalThis.navigator.language,
            lowerCaseLng: true,
            returnObjects: true,
            backend: {
                loaders,
                ...options?.backend,
            },
            ...options,
        });

        /* node:coverage ignore next 5: covering edge cases */
        const language = await waitUntil.isDefined(
            () =>
                checkWrap.isArray(i18nInstance.store.options.fallbackLng)?.[0] ||
                i18nInstance.resolvedLanguage,
        );
        const phrases = await waitUntil.isDefined(
            () => Object.values(i18nInstance.store.data[language] || {})[0],
        );

        return new I18nClient<ExtractPhrasesFromLoaders<Loaders, DefaultLanguage>>(
            phrases as BasePhrases,
            i18nInstance.t,
        );
    }

    /**
     * All the i18n phrases you loaded. Type is determined by the provided type parameter (so make
     * sure to provide it).
     */
    public get: GetPhrases<Phrases> = {} as GetPhrases<Phrases>;

    protected constructor(phrases: BasePhrases, tFunction: TFunction) {
        this.get = recursivelyMapPhrases([], phrases, tFunction) as GetPhrases<Phrases>;
    }
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
