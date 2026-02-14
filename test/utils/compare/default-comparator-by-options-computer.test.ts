import { describe, expect, it } from 'vitest'

import type { SortingNode } from '../../../types/sorting-node'

import { defaultComparatorByOptionsComputer } from '../../../utils/compare/default-comparator-by-options-computer'

describe('default-comparator-by-options-computer', () => {
  it('returns unsorted comparator for subgroup-order when groups are not provided', () => {
    let comparator = defaultComparatorByOptionsComputer({
      fallbackSort: {
        type: 'alphabetical',
      },
      specialCharacters: 'keep',
      type: 'subgroup-order',
      ignoreCase: true,
      locales: 'en-US',
      alphabet: '',
      order: 'asc',
    })

    expect(
      comparator({ name: 'b' } as SortingNode, { name: 'a' } as SortingNode),
    ).toBe(0)
  })
})
