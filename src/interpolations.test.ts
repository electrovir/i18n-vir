import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {type InterpolationValue, type PhraseParams} from './interpolations.js';

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
