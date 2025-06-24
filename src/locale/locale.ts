import {type ArrayElement, arrayToObject} from '@augment-vir/common';
import {allRawLocales} from './all-raw-locales.js';

/**
 * The values of all known locales. This can be treated as a TypeScript `enum`.
 *
 * @category Internal
 */
export const Locale = arrayToObject(allRawLocales, (value) => {
    return {
        key: value,
        value,
    };
}) as {[Key in Locale]: Key};

/**
 * The type of all {@link Locale} values. This can be treated as a TypeScript `enum`.
 *
 * @category Internal
 */
export type Locale = ArrayElement<typeof allRawLocales>;
