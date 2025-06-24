import {assert} from '@augment-vir/assert';
import {getObjectTypedEntries} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {Locale} from './locale.js';

describe('Locale', () => {
    it('has all keys as values', () => {
        assert.isLengthAtLeast(Locale, 10);
        getObjectTypedEntries(Locale).forEach(
            ([
                key,
                value,
            ]) => {
                assert.strictEquals(key, value);
            },
        );
    });
    it('can be used like an enum', () => {
        const value: Locale = Locale.en;
        assert.tsType(value).equals(Locale.en);

        assert.tsType(Locale.en).equals<'en'>();
        assert.tsType(Locale.en).matches<Locale>();
    });
});
