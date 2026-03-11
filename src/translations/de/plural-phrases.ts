export default {
    item_one: '{{count}} Gegenstand',
    item_other: '{{count}} Gegenstände',
    simple: 'keine Plurale hier',
    nested: {
        child_one: '{{count}} Kind',
        child_other: '{{count}} Kinder',
    },
    withInterpolation_one: '{{count}} Ding für {{name}}',
    withInterpolation_other: '{{count}} Dinge für {{name}}',
} as const;
