export default {
    item_one: '{{count}} item',
    item_other: '{{count}} items',
    simple: 'no plurals here',
    nested: {
        child_one: '{{count}} child',
        child_other: '{{count}} children',
    },
    withInterpolation_one: '{{count}} thing for {{name}}',
    withInterpolation_other: '{{count}} things for {{name}}',
} as const;
