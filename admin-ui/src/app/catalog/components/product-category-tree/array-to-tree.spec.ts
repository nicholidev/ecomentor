import { arrayToTree, HasParent } from './array-to-tree';

describe('arrayToTree()', () => {
    it('preserves ordering', () => {
        const result1 = arrayToTree([{ id: '13', parent: { id: '1' } }, { id: '12', parent: { id: '1' } }]);
        expect(result1.children.map(i => i.id)).toEqual(['13', '12']);

        const result2 = arrayToTree([{ id: '12', parent: { id: '1' } }, { id: '13', parent: { id: '1' } }]);
        expect(result2.children.map(i => i.id)).toEqual(['12', '13']);
    });

    it('converts an array to a tree', () => {
        const input: HasParent[] = [
            { id: '12', parent: { id: '1' } },
            { id: '13', parent: { id: '1' } },
            { id: '132', parent: { id: '13' } },
            { id: '131', parent: { id: '13' } },
            { id: '1211', parent: { id: '121' } },
            { id: '121', parent: { id: '12' } },
        ];

        const result = arrayToTree(input);
        expect(result).toEqual({
            id: '1',
            children: [
                {
                    id: '12',
                    parent: { id: '1' },
                    children: [
                        {
                            id: '121',
                            parent: { id: '12' },
                            children: [{ id: '1211', parent: { id: '121' }, children: [] }],
                        },
                    ],
                },
                {
                    id: '13',
                    parent: { id: '1' },
                    children: [
                        { id: '132', parent: { id: '13' }, children: [] },
                        { id: '131', parent: { id: '13' }, children: [] },
                    ],
                },
            ],
        });
    });
});
