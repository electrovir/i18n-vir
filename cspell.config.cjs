const {baseConfig} = require('@virmator/spellcheck/configs/cspell.config.base.cjs');

module.exports = {
    ...baseConfig,
    ignorePaths: [
        ...baseConfig.ignorePaths,
        './www-static/locales/de/translation.json',
    ],
    words: [
        ...baseConfig.words,
    ],
};
