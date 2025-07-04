import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {LoadFromTsPlugin} from './load-from-ts-plugin.js';

describe(LoadFromTsPlugin.name, () => {
    it('handles missing loaders', async () => {
        const instance = new LoadFromTsPlugin();
        assert.isEmpty(await instance.readMulti([], []));
        instance.init({} as any, {loaders: {}});
        assert.isEmpty(await instance.readMulti([], []));
    });
    it('handles errors', async () => {
        const instance = new LoadFromTsPlugin();
        instance.init({} as any, {
            loaders: {
                en: () => {
                    return Promise.reject(new Error('intentional error'));
                },
            },
        });
        assert.deepEquals(await instance.readMulti(['en'], ['translation']), {
            en: {translation: {}},
        });
    });
});
