import {type IsEqual, type IsUnknown} from 'type-fest';

/**
 * Base type for translations files.
 *
 * @category Internal
 */
export type BasePhrases = {[Key in string]: string | BasePhrases};

/**
 * Extracts all parameters (if any) for the given phrase key and value.
 *
 * @category Internal
 */
export type PhraseParams<Key extends string, Phrase extends string> =
    IsUnknown<PluralPhraseParams<Key> & InterpolationPhraseParams<Phrase>> extends true
        ? never
        : PluralPhraseParams<Key> & InterpolationPhraseParams<Phrase>;

/**
 * Extracts any pluralization parameters required for the given phrase key.
 *
 * @category Internal
 */
export type PluralPhraseParams<Key extends string> = Key extends `${string}_${string}`
    ? {
          count: number;
      }
    : unknown;

/**
 * Extracts all interpolation parameters from the given translation string.
 *
 * @category Internal
 */
export type InterpolationPhraseParams<Phrase extends string> = Phrase extends `${string}{{${string}`
    ? InnerInterpolationExtraction<Phrase>
    : unknown;

/**
 * Types allowed for interpolation values.
 *
 * @category Internal
 */
export type InterpolationValue = string | number;

/**
 * Recursively extracts interpolation parameters.
 *
 * @category Internal
 */
export type InnerInterpolationExtraction<Phrase extends string> =
    Phrase extends `${string}{{${infer Tail}`
        ? Tail extends `${infer ParamName}}}${infer Rest}`
            ? IsEqual<ParamName, 'count'> extends true
                ? {
                      count: number;
                  } & InnerInterpolationExtraction<Rest>
                : {
                      [Param in ParamName]: InterpolationValue;
                  } & InnerInterpolationExtraction<Rest>
            : unknown
        : unknown;

/**
 * Determines if the given key or phrase requires interpolation.
 *
 * @category Internal
 */
export function hasInterpolation(key: string, phrase: string) {
    return phrase.includes('{{') || key.includes('_');
}
