import {check} from '@augment-vir/assert';
import {mapObjectValues} from '@augment-vir/common';
import {type BasePhrases} from './interpolations.js';

/**
 * Generate a phrases object, based on the given import, with a replacement inserted into every
 * phrase.
 *
 * @category Mock
 * @example
 *
 * ```ts
 * import {createI18nClient, Locale, generateDevPhrases} from 'i18n-vir';
 *
 * const client = await createI18nClient(
 *     Locale.en,
 *     {
 *         en: () => import('./translations/en/phrases.js'),
 *         de: () => import('./translations/de/phrases.js'),
 *         dev: () => generateDevPhrases(import('./translations/en/phrases.js'), 'XYZ'),
 *     },
 *     {
 *         lng: 'dev-long',
 *     },
 * );
 * ```
 */
export async function generateDevPhrases<const Phrases extends BasePhrases>(
    originalImport: Promise<Phrases>,
    replacement: string,
): Promise<Phrases> {
    const originalPhrases = await originalImport;

    return replaceAllPhrasesRecursively(originalPhrases, replacement) as Phrases;
}

function replaceAllPhrasesRecursively(
    originalPhrases: BasePhrases,
    replacement: string,
): BasePhrases {
    return mapObjectValues(originalPhrases, (key, value) => {
        if (check.isObject(value)) {
            return replaceAllPhrasesRecursively(value, replacement);
        } else {
            return replacement;
        }
    }) as BasePhrases;
}
