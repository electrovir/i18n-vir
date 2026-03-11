import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {
    hasInterpolation,
    hasPluralSuffix,
    type BasePhrases,
    type InnerInterpolationExtraction,
    type InterpolationPhraseParams,
    type InterpolationValue,
    type PhraseParams,
    type PluralPhraseParams,
    type StripPluralSuffix,
} from './interpolations.js';

describe('StripPluralSuffix', () => {
    it('strips a plural suffix', () => {
        assert.tsType<StripPluralSuffix<'key_one'>>().equals<'key'>();
    });
    it('strips only the first underscore segment', () => {
        assert.tsType<StripPluralSuffix<'nested_key_other'>>().equals<'nested'>();
    });
    it('returns key as-is when no underscore exists', () => {
        assert.tsType<StripPluralSuffix<'simple'>>().equals<'simple'>();
    });
});

describe('BasePhrases', () => {
    it('accepts flat string maps', () => {
        assert.tsType<{key: string}>().matches<BasePhrases>();
    });
    it('accepts nested objects', () => {
        assert.tsType<{nested: {inner: string}}>().matches<BasePhrases>();
    });
});

describe('PluralPhraseParams', () => {
    it('returns count for plural keys', () => {
        assert.tsType<PluralPhraseParams<'key_one'>>().equals<{count: number}>();
    });
    it('returns unknown for non-plural keys', () => {
        assert.tsType<PluralPhraseParams<'key'>>().equals<unknown>();
    });
});

describe('InterpolationPhraseParams', () => {
    it('extracts params from interpolated phrase', () => {
        assert
            .tsType<InterpolationPhraseParams<'hello {{name}}'>>()
            .equals<{name: InterpolationValue}>();
    });
    it('returns unknown for non-interpolated phrase', () => {
        assert.tsType<InterpolationPhraseParams<'no params'>>().equals<unknown>();
    });
});

describe('InnerInterpolationExtraction', () => {
    it('extracts a single param', () => {
        assert
            .tsType<InnerInterpolationExtraction<'{{name}} is here'>>()
            .slowEquals<{name: InterpolationValue}>();
    });
    it('extracts multiple params', () => {
        assert
            .tsType<InnerInterpolationExtraction<'{{first}} and {{second}}'>>()
            .slowEquals<{first: InterpolationValue; second: InterpolationValue}>();
    });
    it('types count as number', () => {
        assert
            .tsType<InnerInterpolationExtraction<'{{count}} items'>>()
            .slowEquals<{count: number}>();
    });
});

describe(hasInterpolation.name, () => {
    it('returns true for interpolated phrases', () => {
        assert.isTrue(hasInterpolation('key', 'hello {{name}}'));
    });
    it('returns true for plural keys', () => {
        assert.isTrue(hasInterpolation('key_one', 'no interpolation'));
    });
    it('returns false for plain phrases with non-plural keys', () => {
        assert.isFalse(hasInterpolation('key', 'no interpolation'));
    });
});

describe(hasPluralSuffix.name, () => {
    it('returns true for keys with underscores', () => {
        assert.isTrue(hasPluralSuffix('key_one'));
    });
    it('returns false for keys without underscores', () => {
        assert.isFalse(hasPluralSuffix('key'));
    });
});

describe('PhraseParams', () => {
    it('handles no interpolation', () => {
        assert.tsType<PhraseParams<'key', 'no interpolation here'>>().equals<never>();
    });
    it('handles a single interpolation', () => {
        assert
            .tsType<PhraseParams<'key', 'something {{here}}'>>()
            .equals<{here: InterpolationValue}>();
    });
    it('handles multiple interpolations', () => {
        assert
            .tsType<PhraseParams<'key', 'something {{here}} and {{there}} is good'>>()
            .slowEquals<{
                here: InterpolationValue;
                there: InterpolationValue;
            }>();
    });
    it('handles start interpolations', () => {
        assert.tsType<PhraseParams<'key', '{{here}} and {{there}}'>>().slowEquals<{
            here: InterpolationValue;
            there: InterpolationValue;
        }>();
    });
    it('handles end interpolations', () => {
        assert.tsType<PhraseParams<'key', 'something {{here}} and {{there}}'>>().slowEquals<{
            here: InterpolationValue;
            there: InterpolationValue;
        }>();
    });
    it('requires count to be a number', () => {
        assert.tsType<PhraseParams<'key', 'I have {{count}}'>>().slowEquals<{
            count: number;
        }>();
    });
    it('handles a key with pluralization', () => {
        assert.tsType<PhraseParams<'key_one', 'no interpolation'>>().slowEquals<{
            count: number;
        }>();
    });
    it('combines plural key with interpolation', () => {
        assert.tsType<PhraseParams<'key_one', 'interop: {{value}}'>>().slowEquals<{
            count: number;
            value: InterpolationValue;
        }>();
    });
});
