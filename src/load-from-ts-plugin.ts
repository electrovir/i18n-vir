import {arrayToObject, awaitAllPromisesInObject, log} from '@augment-vir/common';
import {type Services} from 'i18next';
import {type BasePhrases} from './interpolations.js';
import {type Locale} from './locale/locale.js';

/**
 * A function that loads phrases.
 *
 * @category Internal
 */
export type PhrasesLoader<Phrases extends BasePhrases = BasePhrases> = () => Promise<{
    default: Phrases;
}>;

/**
 * Extracts phrases from an individual loader. Used in {@link ExtractPhrasesFromLoaders}.
 *
 * @category Internal
 */
export type ExtractPhrasesFromLoader<Loader extends PhrasesLoader> = Awaited<
    ReturnType<Loader>
>['default'];

/**
 * Extracts the expected phrases object shape from a specific loaders instance.
 *
 * @category Internal
 */
export type ExtractPhrasesFromLoaders<
    Loaders extends LoadFromTsOptions['loaders'],
    DefaultLanguage extends Locale,
> = DefaultLanguage extends keyof Loaders
    ? ExtractPhrasesFromLoader<Extract<Loaders[DefaultLanguage], PhrasesLoader>>
    : never;

/**
 * `i18next` `backend` options for {@link LoadFromTsPlugin}.
 *
 * @category Internal
 */
export type LoadFromTsOptions<Phrases extends BasePhrases = BasePhrases> = {
    loaders: Partial<Record<Locale, PhrasesLoader<Phrases>>>;
};

/**
 * Plugin for `i18next` that makes it easy and type safe to load phrases from `.ts` files. Note that
 * namespaces are currently not supported.
 *
 * @category Internal
 */
export class LoadFromTsPlugin {
    public static readonly type = 'backend';
    public readonly type = 'backend';
    protected options: LoadFromTsOptions | undefined;

    /** Initialize the plugin (called by `i18next` directly). */
    public init(services: Services, options: LoadFromTsOptions) {
        this.options = options;
    }

    /** Read a language file (called by `i18next` directly). */
    public async read(language: string, namespace: string) {
        return (await this.readMulti([language], [namespace]))[language]?.[namespace];
    }

    /**
     * Read multiple language files (called by `i18next` directly, and by
     * {@link LoadFromTsPlugin.read}).
     */
    public async readMulti(
        languages: ReadonlyArray<string>,
        namespaces: ReadonlyArray<string>,
    ): Promise<Record<string, Record<string, BasePhrases>>> {
        const loaders = this.options?.loaders;

        if (!loaders || !Object.keys(loaders).length) {
            log.warning('No TS Loaders.');
            return {};
        }

        const languageLoads: Record<string, Promise<Record<string, BasePhrases>>> = arrayToObject(
            languages,
            (language) => {
                const loader = loaders[language as Locale];

                if (!loader) {
                    return undefined;
                }

                const namespaceLoads: Record<string, Promise<BasePhrases>> = arrayToObject(
                    namespaces,
                    (namespace) => {
                        const result = Promise.resolve(loader())
                            .then((loaded) => {
                                return loaded.default;
                            })
                            .catch((error: unknown) => {
                                log.error('error:', error);
                                return {};
                            });

                        return {
                            key: namespace,
                            value: result,
                        };
                    },

                    {
                        useRequired: true,
                    },
                );

                return {
                    key: language,
                    value: awaitAllPromisesInObject(namespaceLoads) satisfies Promise<
                        Record<string, BasePhrases>
                    >,
                };
            },
            {
                useRequired: true,
            },
        );

        const allLoaded = await awaitAllPromisesInObject(languageLoads);

        return allLoaded;
    }
}
